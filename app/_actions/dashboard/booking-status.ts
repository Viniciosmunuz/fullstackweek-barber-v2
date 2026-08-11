"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/app/_lib/prisma"
import { requireManager } from "./guard"

const schema = z.object({
  bookingId: z.string().uuid("Agendamento inválido."),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
})

/**
 * Muda a situação de um agendamento pela agenda do painel.
 *
 * Concluir um atendimento é o que faz o valor entrar no faturamento, então a
 * ação recalcula as telas que dependem disso.
 */
export async function updateBookingStatus(input: z.infer<typeof schema>) {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.")
  }

  const { bookingId, status } = parsed.data

  // A barbearia sai do serviço vinculado ao agendamento, e é ela que autoriza:
  // sem isso, um gestor poderia alterar a agenda de qualquer outra casa.
  //
  // `requireManager` e não `requireOwner`: mexer na agenda é justamente o
  // trabalho de quem atende. O funcionário confirma, conclui e cancela o dia
  // dele sem depender do dono estar por perto.
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { service: { select: { barbershopId: true } } },
  })

  if (!booking) {
    throw new Error("Agendamento não encontrado.")
  }

  await requireManager(booking.service.barbershopId)

  await db.booking.update({ where: { id: bookingId }, data: { status } })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/agendamentos")
  revalidatePath("/dashboard/clientes")
  revalidatePath("/dashboard/relatorios")
  revalidatePath("/bookings")
}
