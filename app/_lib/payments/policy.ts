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

export interface Breakdown {
  /** Total cobrado do cliente, em centavos. */
  amountCents: number
  /** Parte retida pela plataforma, em centavos. */
  platformFeeCents: number
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

function applyFee(priceCents: number, type: FeeType, value: Decimalish): number {
  if (type === "FIXED") return toCents(value)

  const percent = Number(value.toString())
  if (!Number.isFinite(percent)) return 0

  return Math.round((priceCents * percent) / 100)
}

/**
 * Reparte o sinal entre plataforma e barbearia.
 *
 * Duas travas que existem por motivo, não por precaução genérica:
 *
 * - o sinal nunca fica abaixo da taxa. Se ficasse, a plataforma repassaria
 *   mais do que recebeu e terminaria devendo dinheiro à barbearia;
 * - o sinal nunca passa do preço do serviço. Sinal é adiantamento, e cobrar
 *   adiantado mais do que o serviço custa é cobrar a mais do cliente.
 */
export function splitDeposit(
  servicePrice: Decimalish,
  policy: FeePolicy,
): Breakdown {
  const priceCents = Math.max(0, toCents(servicePrice))

  const platformFeeCents = Math.min(
    Math.max(0, applyFee(priceCents, policy.platformFeeType, policy.platformFeeValue)),
    priceCents,
  )

  const requested = Math.max(
    0,
    applyFee(priceCents, policy.depositType, policy.depositValue),
  )

  const amountCents = Math.min(
    Math.max(requested, platformFeeCents),
    priceCents,
  )

  return {
    amountCents,
    platformFeeCents,
    shopAmountCents: amountCents - platformFeeCents,
  }
}
