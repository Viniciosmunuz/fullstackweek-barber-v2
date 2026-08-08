"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { db } from "../_lib/prisma"
import { authOptions } from "../_lib/auth"

interface CreateBookingParams {
  serviceId: string
  barberId: string
  date: Date
}

export const createBooking = async ({
  serviceId,
  barberId,
  date,
}: CreateBookingParams) => {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (!userId) {
    throw new Error("Usuário não autenticado")
  }

  // A lista de horários já esconde o que está ocupado, mas duas pessoas podem
  // confirmar o mesmo minuto ao mesmo tempo. Esta checagem fecha essa janela.
  const conflict = await db.booking.findFirst({
    where: { barberId, date },
    select: { id: true },
  })

  if (conflict) {
    throw new Error("Este horário acabou de ser reservado. Escolha outro.")
  }

  await db.booking.create({
    data: { serviceId, barberId, date, userId },
  })

  revalidatePath("/barbershops/[id]", "page")
  revalidatePath("/bookings")
}
