import { NextResponse } from "next/server"
import { db } from "@/app/_lib/prisma"
import { getAsaasWebhookToken } from "@/app/_lib/config"
import { notifyBarbershop } from "@/app/_lib/notify-barbershop"

/**
 * Recebe do provedor o aviso de que o sinal caiu.
 *
 * É esta rota — e não a tela de pagamento — que confirma o agendamento. A tela
 * pode ser fechada, o celular pode travar, a rede pode cair; o dinheiro entrar
 * é o único fato que importa, e quem sabe dele é o provedor.
 *
 * Três cuidados, cada um por um motivo concreto:
 *
 * 1. o header `asaas-access-token` é conferido antes de qualquer coisa. Sem
 *    isso, a rota é pública e qualquer um confirmaria a própria reserva sem
 *    pagar, mandando um JSON;
 * 2. o evento é gravado com id único antes de ser aplicado. O provedor reenvia
 *    enquanto não recebe 2xx, e sem essa trava um reenvio confirmaria de novo e
 *    duplicaria a notificação e a taxa no relatório;
 * 3. a reserva é encontrada pelo id da cobrança guardado no banco, nunca pelo
 *    valor ou pelo cliente que vêm no corpo — o corpo é dado de fora.
 */
export const dynamic = "force-dynamic"

interface AsaasWebhookBody {
  id?: string
  event?: string
  payment?: {
    id?: string
    status?: string
    externalReference?: string
  }
}

/** Eventos em que o dinheiro já é da barbearia. */
const PAID_EVENTS = new Set(["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"])
/** Eventos em que a cobrança morreu e o horário deve voltar para a lista. */
const DEAD_EVENTS = new Set([
  "PAYMENT_OVERDUE",
  "PAYMENT_DELETED",
  "PAYMENT_REFUNDED",
  "PAYMENT_CHARGEBACK_REQUESTED",
])

export async function POST(request: Request) {
  const expected = getAsaasWebhookToken()

  // Sem token configurado a rota fica fechada: aberta, ela é um botão de
  // "confirmar sem pagar" para qualquer pessoa na internet.
  if (!expected) {
    return NextResponse.json({ ok: false }, { status: 503 })
  }

  if (request.headers.get("asaas-access-token") !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  let body: AsaasWebhookBody
  try {
    body = (await request.json()) as AsaasWebhookBody
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const eventId = body.id
  const eventType = body.event
  const chargeId = body.payment?.id

  if (!eventId || !eventType || !chargeId) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const payment = await db.payment.findUnique({
    where: { providerId: chargeId },
    select: { id: true, status: true, bookingId: true },
  })

  // Grava o evento antes de aplicar. O índice único no id do provedor é o que
  // torna o reenvio inofensivo: a segunda gravação falha e nada é reaplicado.
  try {
    await db.paymentEvent.create({
      data: {
        providerEventId: eventId,
        paymentId: payment?.id ?? null,
        type: eventType,
        payload: body as object,
      },
    })
  } catch {
    // Já processado. Responder 2xx faz o provedor parar de reenviar.
    return NextResponse.json({ ok: true, duplicate: true })
  }

  // Cobrança que não é nossa: registramos e encerramos sem erro, para o
  // provedor não ficar reenviando algo que nunca vamos reconhecer.
  if (!payment) {
    return NextResponse.json({ ok: true, unknown: true })
  }

  if (PAID_EVENTS.has(eventType)) {
    await confirmBooking(payment.id, payment.bookingId)
  } else if (DEAD_EVENTS.has(eventType)) {
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: eventType === "PAYMENT_REFUNDED" ? "REFUNDED" : "EXPIRED",
        refundedAt: eventType === "PAYMENT_REFUNDED" ? new Date() : undefined,
      },
    })
  }

  return NextResponse.json({ ok: true })
}

/**
 * Torna a reserva um agendamento de verdade.
 *
 * `expiresAt: null` é o que tira a reserva do estado de espera: a partir daqui
 * ela ocupa o horário sem prazo e aparece na agenda da barbearia.
 */
async function confirmBooking(paymentId: string, bookingId: string) {
  const [, booking] = await db.$transaction([
    db.payment.update({
      where: { id: paymentId },
      data: { status: "PAID", paidAt: new Date() },
    }),
    db.booking.update({
      where: { id: bookingId },
      data: { expiresAt: null },
    }),
  ])

  const full = await db.booking.findUnique({
    where: { id: booking.id },
    select: {
      date: true,
      user: { select: { name: true } },
      barber: { select: { name: true } },
      service: { select: { name: true, barbershopId: true } },
    },
  })

  if (!full) return

  await notifyBarbershop({
    barbershopId: full.service.barbershopId,
    clientName: full.user.name ?? "Cliente",
    serviceName: full.service.name,
    barberName: full.barber?.name ?? null,
    date: full.date,
    paid: true,
  })
}
