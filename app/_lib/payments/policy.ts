/**
 * Cálculo do sinal e da taxa da plataforma.
 *
 * Tudo em centavos inteiros. Dinheiro em ponto flutuante acumula erro — a
 * conta clássica `0.1 + 0.2` já não fecha — e aqui o resultado vira repasse
 * para outra empresa, então um centavo perdido é divergência de conciliação,
 * não arredondamento de tela.
 *
 * Este módulo é puro de propósito: não lê sessão, não toca no banco e não fala
 * com o provedor. Isso permite conferir a conta sem simular uma cobrança, e
 * garante que exista um lugar só onde o dinheiro é decidido.
 */

/** Aceita o `Decimal` do Prisma, número ou string sem acoplar ao client. */
type Decimalish = { toString(): string }

export type FeeType = "PERCENT" | "FIXED"

export interface FeePolicy {
  /** Sinal cobrado do cliente — política de no-show da barbearia. */
  depositType: FeeType
  depositValue: Decimalish
  /** Taxa por agendamento — receita da plataforma. */
  platformFeeType: FeeType
  platformFeeValue: Decimalish
}

/**
 * Custo do provedor por PIX recebido, em centavos.
 *
 * **Não é receita da plataforma.** É o que o Asaas cobra para processar, e ele
 * desconta do valor antes de qualquer split: numa cobrança de R$ 10,50 sobram
 * R$ 9,51 para repartir. Tentar repassar os R$ 10,50 inteiros é recusado com
 * "o valor total do Split excede o valor a receber" — foi exatamente o que
 * aconteceu quando a taxa da plataforma foi a zero.
 *
 * Ou seja: alguém precisa absorver esse custo, e o split não permite que seja a
 * plataforma. Fica com a barbearia, como a tarifa da maquininha de cartão.
 *
 * Confira em Asaas → Configurações → Taxas se mudar de plano; um valor menor
 * que o real derruba a cobrança de novo.
 */
export const PROVIDER_FEE_CENTS = 99

export interface Breakdown {
  /** Total cobrado do cliente, em centavos. */
  amountCents: number
  /** Parte retida pela plataforma, em centavos. */
  platformFeeCents: number
  /** Custo do provedor, descontado antes do repasse. */
  providerFeeCents: number
  /** Parte repassada à barbearia pelo split, em centavos. */
  shopAmountCents: number
}

export function toCents(value: Decimalish): number {
  const parsed = Number(value.toString())
  if (!Number.isFinite(parsed)) return 0
  return Math.round(parsed * 100)
}

export function toReais(cents: number): number {
  return cents / 100
}

function applyFee(
  priceCents: number,
  type: FeeType,
  value: Decimalish,
): number {
  if (type === "FIXED") return toCents(value)

  const percent = Number(value.toString())
  if (!Number.isFinite(percent)) return 0

  return Math.round((priceCents * percent) / 100)
}

/**
 * Reparte o sinal entre provedor, plataforma e barbearia.
 *
 * Três travas que existem por motivo, não por precaução genérica:
 *
 * - o sinal nunca fica abaixo do que é retido. Se ficasse, a plataforma
 *   repassaria mais do que recebeu e terminaria devendo dinheiro à barbearia —
 *   e o provedor recusaria a cobrança antes disso;
 * - o sinal nunca passa do preço do serviço. Sinal é adiantamento, e cobrar
 *   adiantado mais do que o serviço custa é cobrar a mais do cliente;
 * - serviço que não cobre o custo da transação não gera cobrança. Um sinal de
 *   R$ 0,50 custaria R$ 0,99 para processar, e a barbearia receberia menos que
 *   zero.
 */
export function splitDeposit(
  servicePrice: Decimalish,
  policy: FeePolicy,
): Breakdown {
  const priceCents = Math.max(0, toCents(servicePrice))

  const platformFeeCents = Math.min(
    Math.max(
      0,
      applyFee(priceCents, policy.platformFeeType, policy.platformFeeValue),
    ),
    priceCents,
  )

  const providerFeeCents = Math.min(PROVIDER_FEE_CENTS, priceCents)

  // O piso é o que já está comprometido: abaixo dele o repasse seria negativo.
  const retained = Math.min(platformFeeCents + providerFeeCents, priceCents)

  const requested = Math.max(
    0,
    applyFee(priceCents, policy.depositType, policy.depositValue),
  )

  const amountCents = Math.min(Math.max(requested, retained), priceCents)

  return {
    amountCents,
    platformFeeCents,
    providerFeeCents,
    // Nunca negativo: `retained` já foi limitado ao preço, e `amountCents`
    // nunca fica abaixo dele.
    shopAmountCents: Math.max(
      0,
      amountCents - platformFeeCents - providerFeeCents,
    ),
  }
}
