"use server"

import { getServerSession } from "next-auth"
import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/app/_lib/auth"

/**
 * Estado do sinal de uma reserva, para a tela de pagamento saber quando parar
 * de esperar.
 *
 * Quem confirma o agendamento é o webhook; esta consulta só lê o resultado. A
 * tela poderia ficar aberta para sempre sem afetar nada — e é justamente por
 * isso que ela pode ser fechada sem prejuízo.
 *
 * Só devolve dados de reserva do próprio usuário: sem esse filtro, qualquer
 * pessoa com um id de reserva descobriria quando alguém pagou.
 */
export async function getDepositStatus(bookingId: string) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string } | undefined

  if (!user?.id) {
    return { status: "UNKNOWN" as const }
  }

  const booking = await db.booking.findFirst({
    where: { id: bookingId, userId: user.id },
    select: { expiresAt: true, payment: { select: { status: true } } },
  })

  if (!booking?.payment) {
    return { status: "UNKNOWN" as const }
  }

  const expired =
    booking.payment.status === "PENDING" &&
    booking.expiresAt !== null &&
    booking.expiresAt.getTime() < Date.now()

  return { status: expired ? ("EXPIRED" as const) : booking.payment.status }
}
