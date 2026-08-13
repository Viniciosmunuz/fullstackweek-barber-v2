import { db } from "@/app/_lib/prisma"
import { toCents, toReais } from "@/app/_lib/payments/policy"
import { requireOwner } from "@/app/_actions/dashboard/guard"
import { resolvePeriod, type Period } from "./dashboard"

/**
 * Extrato de repasses de uma barbearia.
 *
 * Mostra o que aconteceu com o dinheiro de cada sinal: quanto o cliente pagou,
 * quanto ficou com a plataforma e quanto foi repassado. É a peça que faz o
 * lojista confiar no split — sem ela, ele vê um valor cair na conta e precisa
 * acreditar na palavra da plataforma.
 *
 * As somas são feitas em centavos inteiros pelo mesmo motivo do cálculo da
 * cobrança: somar dezenas de decimais em ponto flutuante acumula erro, e aqui
 * o total é conferido contra um extrato bancário de verdade.
 *
 * O extrato não traz nome de cliente. Ele responde a uma pergunta financeira —
 * quanto entrou, quanto foi taxa, quanto sobrou — e o nome de quem pagou não
 * faz parte dela. Quem precisa saber quem vem atender já tem a agenda.
 */

export interface PayoutRow {
  id: string
  /** Quando o dinheiro entrou. */
  paidAt: Date
  serviceName: string
  /** Data do atendimento, que não é a data do pagamento. */
  bookingDate: Date
  amount: number
  platformFee: number
  shopAmount: number
  refunded: boolean
}

export interface PayoutSummary {
  rows: PayoutRow[]
  /** Total cobrado dos clientes, em reais. */
  gross: number
  /** Total retido pela plataforma. */
  fees: number
  /**
   * Custo do provedor no período.
   *
   * Derivado, e não gravado: é o que sobra entre o cobrado, a taxa e o
   * repasse. Aparece separado porque não é receita de ninguém — some na
   * tarifa do PIX — e confundi-lo com a taxa da plataforma faria o lojista
   * achar que está pagando comissão quando não está.
   */
  providerCost: number
  /** Total repassado à barbearia. */
  net: number
  /** Quantos sinais foram pagos no período. */
  count: number
  /** Quanto voltou para o cliente em estornos. */
  refunded: number
}

export async function getPayouts(
  barbershopId: string,
  period: Period,
): Promise<PayoutSummary> {
  // A autorização mora junto da consulta, e não só na página que a chama: a
  // página de hoje já recusa antes de chegar aqui, mas quem escrever a próxima
  // tela de dinheiro herda a checagem em vez de precisar lembrar dela.
  await requireOwner(barbershopId)

  const { from, to } = resolvePeriod(period)

  const rows = await db.payment.findMany({
    where: {
      status: { in: ["PAID", "REFUNDED"] },
      paidAt: { gte: from, lte: to },
      // O vínculo com a barbearia passa pelo serviço da reserva; é o que
      // impede uma casa de enxergar o repasse de outra.
      booking: { service: { barbershopId } },
    },
    orderBy: { paidAt: "desc" },
    select: {
      id: true,
      status: true,
      amount: true,
      platformFee: true,
      shopAmount: true,
      paidAt: true,
      booking: {
        select: { date: true, service: { select: { name: true } } },
      },
    },
  })

  let grossCents = 0
  let feeCents = 0
  let netCents = 0
  let refundedCents = 0

  const mapped: PayoutRow[] = rows.map((row) => {
    const amount = toCents(row.amount)
    const fee = toCents(row.platformFee)
    const shop = toCents(row.shopAmount)
    const refunded = row.status === "REFUNDED"

    if (refunded) {
      refundedCents += amount
    } else {
      grossCents += amount
      feeCents += fee
      netCents += shop
    }

    return {
      id: row.id,
      // `paidAt` só é nulo em cobrança pendente, que este filtro já exclui.
      paidAt: row.paidAt ?? row.booking.date,
      serviceName: row.booking.service.name,
      bookingDate: row.booking.date,
      amount: toReais(amount),
      platformFee: toReais(fee),
      shopAmount: toReais(shop),
      refunded,
    }
  })

  return {
    rows: mapped,
    gross: toReais(grossCents),
    fees: toReais(feeCents),
    providerCost: toReais(grossCents - feeCents - netCents),
    net: toReais(netCents),
    refunded: toReais(refundedCents),
    count: mapped.filter((r) => !r.refunded).length,
  }
}
