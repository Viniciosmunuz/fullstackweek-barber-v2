import { NextResponse } from "next/server"
import { addDays, endOfDay, startOfDay } from "date-fns"
import { db } from "@/app/_lib/prisma"
import { notifyClient } from "@/app/_lib/notify-client"
import { getCronSecret } from "@/app/_lib/config"
import { cleanupOrphanImages } from "@/app/_lib/cleanup-images"

/** Prisma não roda no runtime de edge. */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Teto por execução, para uma falha em massa não virar mil e-mails. */
const BATCH = 200

/**
 * Manutenção diária.
 *
 * Uma rota só para as duas tarefas que rodam sem ninguém pedir, porque o
 * agendador gratuito da Vercel é limitado e não vale gastar duas vagas no que
 * cabe numa passada.
 *
 * **Lembrete da véspera.** Avisa quem tem horário marcado para amanhã. É o
 * aviso que mais muda o resultado do negócio: falta sem avisar é o problema que
 * o sinal existe para resolver, e cobrar sinal sem lembrar do horário ataca o
 * sintoma. Diário, e não "uma hora antes", porque a véspera é quando o cliente
 * ainda consegue remanejar o dia.
 *
 * **Limpeza de imagens.** Trocar a logo deixa a anterior sem dono, e enviar um
 * arquivo sem salvar o formulário cria um órfão de nascença. Como as imagens
 * moram no próprio banco, isso é espaço que só cresce.
 *
 * A rota é protegida por segredo. Aberta, qualquer pessoa dispararia a
 * varredura à vontade; e como cada agendamento só é avisado uma vez, isso
 * consumiria os lembretes de todo mundo sem entregar nada.
 */
export async function GET(request: Request) {
  const expected = getCronSecret()

  if (!expected) {
    return NextResponse.json(
      { ok: false, reason: "sem segredo" },
      { status: 503 },
    )
  }

  // A Vercel manda `Authorization: Bearer <CRON_SECRET>`; o cabeçalho próprio
  // permite disparar à mão para conferir.
  const authorized =
    request.headers.get("authorization") === `Bearer ${expected}` ||
    request.headers.get("x-cron-secret") === expected

  if (!authorized) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const amanha = addDays(new Date(), 1)

  const bookings = await db.booking.findMany({
    where: {
      date: { gte: startOfDay(amanha), lte: endOfDay(amanha) },
      reminderSentAt: null,
      status: { not: "CANCELLED" },
      // Reserva esperando sinal ainda pode não acontecer; lembrar dela
      // prometeria ao cliente um horário que o prazo pode levar embora.
      expiresAt: null,
    },
    take: BATCH,
    select: {
      id: true,
      date: true,
      user: { select: { name: true, email: true } },
      barber: { select: { name: true } },
      service: {
        select: {
          name: true,
          barbershop: { select: { name: true, address: true } },
        },
      },
    },
  })

  let enviados = 0

  for (const booking of bookings) {
    const result = await notifyClient({
      kind: "REMINDER",
      email: booking.user.email,
      clientName: booking.user.name ?? "Cliente",
      barbershopName: booking.service.barbershop.name,
      serviceName: booking.service.name,
      barberName: booking.barber?.name ?? null,
      date: booking.date,
      address: booking.service.barbershop.address,
    })

    if (result?.status === "sent") enviados += 1

    // A marca é gravada mesmo quando o envio falha ou está desligado. Sem isso,
    // uma instalação sem provedor de e-mail tentaria de novo todo dia para
    // sempre, e o dia em que o provedor voltasse despejaria meses de lembretes
    // atrasados de uma vez.
    await db.booking.update({
      where: { id: booking.id },
      data: { reminderSentAt: new Date() },
    })
  }

  // A limpeza roda depois, e separada: se o envio de lembrete falhar, não há
  // motivo para o espaço do banco ficar crescendo junto.
  const imagensApagadas = await cleanupOrphanImages()

  return NextResponse.json({
    ok: true,
    lembretes: { encontrados: bookings.length, enviados },
    imagensApagadas,
  })
}
