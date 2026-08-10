import {
  getAsaasApiKey,
  getAsaasBaseUrl,
  isPaymentsConfigured,
} from "../config"
import { toReais } from "./policy"

/**
 * Cliente do Asaas.
 *
 * Escrito sobre `fetch`, sem SDK: a superfície que usamos são cinco chamadas,
 * e um pacote a mais na árvore de dependências de um caminho que movimenta
 * dinheiro é risco sem contrapartida.
 *
 * ATENÇÃO: este módulo carrega a chave da conta e só pode ser importado de
 * código de servidor — server action, route handler ou Server Component. O
 * pacote `server-only`, que transformaria um import indevido em erro de build,
 * não está instalado aqui; até que esteja, a regra depende de revisão.
 *
 * Valores: a API do Asaas trabalha em reais decimais, o resto do sistema em
 * centavos inteiros. A conversão acontece só aqui, na fronteira.
 */

const TIMEOUT_MS = 15_000

export class AsaasError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message)
    this.name = "AsaasError"
  }
}

async function request<T>(
  path: string,
  init: { method: string; body?: unknown },
): Promise<T> {
  if (!isPaymentsConfigured()) {
    throw new AsaasError("Cobrança não configurada nesta instalação.", 0, null)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${getAsaasBaseUrl()}${path}`, {
      method: init.method,
      headers: {
        "Content-Type": "application/json",
        access_token: getAsaasApiKey(),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    })

    const text = await response.text()
    const parsed: unknown = text ? JSON.parse(text) : null

    if (!response.ok) {
      throw new AsaasError(
        describeError(parsed) ?? `Falha na cobrança (HTTP ${response.status}).`,
        response.status,
        parsed,
      )
    }

    return parsed as T
  } finally {
    clearTimeout(timer)
  }
}

/** O Asaas devolve os erros em `errors[].description`. */
function describeError(body: unknown): string | null {
  if (!body || typeof body !== "object") return null

  const errors = (body as { errors?: unknown }).errors
  if (!Array.isArray(errors) || errors.length === 0) return null

  const first = errors[0] as { description?: unknown }
  return typeof first.description === "string" ? first.description : null
}

interface CustomerInput {
  name: string
  /** Obrigatório pelo Asaas — não há como criar cobrança sem documento. */
  cpfCnpj: string
  email?: string | null
  /** Id do usuário no nosso banco, para reencontrar o cadastro sem duplicar. */
  externalReference: string
}

interface AsaasCustomer {
  id: string
}

interface AsaasList<T> {
  data?: T[]
}

/**
 * Encontra ou cria o cliente no provedor.
 *
 * Busca primeiro por `externalReference` porque criar de novo a cada
 * agendamento encheria a conta de cadastros repetidos do mesmo cliente e
 * embaralharia a conciliação.
 */
export async function ensureCustomer(input: CustomerInput): Promise<string> {
  const found = await request<AsaasList<AsaasCustomer>>(
    `/customers?externalReference=${encodeURIComponent(input.externalReference)}&limit=1`,
    { method: "GET" },
  )

  const existing = found.data?.[0]?.id
  if (existing) return existing

  const created = await request<AsaasCustomer>("/customers", {
    method: "POST",
    body: {
      name: input.name,
      cpfCnpj: input.cpfCnpj.replace(/\D/g, ""),
      email: input.email ?? undefined,
      externalReference: input.externalReference,
      notificationDisabled: true,
    },
  })

  return created.id
}

interface ChargeInput {
  customerId: string
  /** Total cobrado do cliente, em centavos. */
  amountCents: number
  /** Parte da barbearia, em centavos. O resto fica com a plataforma. */
  shopAmountCents: number
  /** Carteira da barbearia no Asaas. */
  walletId: string
  description: string
  /** Id da nossa reserva, para casar o webhook com o registro local. */
  externalReference: string
  /** Vencimento no formato YYYY-MM-DD. */
  dueDate: string
}

export interface AsaasCharge {
  id: string
  status: string
  invoiceUrl?: string
}

export interface PixQrCode {
  encodedImage?: string
  payload?: string
}

/**
 * Cria a cobrança PIX já com o split para a barbearia.
 *
 * O split usa `fixedValue`: o percentual do Asaas incide sobre o valor
 * líquido, que muda conforme a taxa do meio de pagamento, e isso faria o
 * repasse divergir do que foi combinado com a barbearia. Com valor fixo, o
 * que ela recebe é exatamente o que o extrato do painel promete.
 */
export async function createPixCharge(
  input: ChargeInput,
): Promise<AsaasCharge> {
  return request<AsaasCharge>("/payments", {
    method: "POST",
    body: {
      customer: input.customerId,
      billingType: "PIX",
      value: toReais(input.amountCents),
      dueDate: input.dueDate,
      description: input.description,
      externalReference: input.externalReference,
      split: [
        {
          walletId: input.walletId,
          fixedValue: toReais(input.shopAmountCents),
        },
      ],
    },
  })
}

/** Copia-e-cola e imagem do QR, para exibir na tela de pagamento. */
export async function getPixQrCode(chargeId: string): Promise<PixQrCode> {
  return request<PixQrCode>(`/payments/${chargeId}/pixQrCode`, {
    method: "GET",
  })
}

export async function getCharge(chargeId: string): Promise<AsaasCharge> {
  return request<AsaasCharge>(`/payments/${chargeId}`, { method: "GET" })
}

/** Estorno — usado quando a barbearia cancela um horário já pago. */
export async function refundCharge(chargeId: string): Promise<AsaasCharge> {
  return request<AsaasCharge>(`/payments/${chargeId}/refund`, {
    method: "POST",
  })
}
