"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { db } from "../_lib/prisma"
import { authOptions } from "../_lib/auth"
import { activeBookingFilter } from "../_lib/booking-slot"
import { notifyBarbershop } from "../_lib/notify-barbershop"

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
  const user = session?.user as
    | { id?: string; name?: string | null }
    | undefined

  if (!user?.id) {
    throw new Error("Usuário não autenticado")
  }

  // A lista de horários já esconde o que está ocupado, mas duas pessoas podem
  // confirmar o mesmo minuto ao mesmo tempo. Esta checagem fecha essa janela.
  //
  // Usa o mesmo filtro da listagem: se as duas discordarem, o cliente vê um
  // horário livre, escolhe, e leva um erro na hora de confirmar.
  const conflict = await db.booking.findFirst({
    where: { barberId, date, ...activeBookingFilter() },
    select: { id: true },
  })

  if (conflict) {
    throw new Error("Este horário acabou de ser reservado. Escolha outro.")
  }

  const booking = await db.booking.create({
    data: { serviceId, barberId, date, userId: user.id },
    select: {
      id: true,
      barber: { select: { name: true } },
      service: {
        select: { name: true, barbershopId: true },
      },
    },
  })

  await notifyBarbershop({
    barbershopId: booking.service.barbershopId,
    clientName: user.name ?? "Cliente",
    serviceName: booking.service.name,
    barberName: booking.barber?.name ?? null,
    date,
  })

  revalidatePath("/barbershops/[id]", "page")
  revalidatePath("/bookings")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/agendamentos")
}

