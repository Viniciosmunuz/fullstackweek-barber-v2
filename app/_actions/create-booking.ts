"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { db } from "../_lib/prisma"
import { authOptions } from "../_lib/auth"
import { activeBookingFilter } from "../_lib/booking-slot"
import { notifyBarbershop } from "../_lib/notify-barbershop"
import { notifyClient } from "../_lib/notify-client"
import { UserFacingError, runAction } from "../_lib/action-result"
import { zonedDateTime } from "../_lib/timezone"

interface CreateBookingParams {
  serviceId: string
  barberId: string
  /** Dia escolhido. Só a data importa; o horário vem em `time`. */
  day: Date
  /** Horário escolhido, "HH:mm", exatamente como o cliente viu na tela. */
  time: string
}

const doCreateBooking = async ({
  serviceId,
  barberId,
  day,
  time,
}: CreateBookingParams) => {
  /*
   * O instante é montado aqui, e não no navegador.
   *
   * Antes o cliente fazia `set(dia, {hours, minutes})` no relógio dele e
   * mandava o `Date` pronto. Como o servidor roda em UTC, o horário oferecido
   * e o horário gravado eram instantes diferentes — três horas de distância —,
   * e a checagem de conflito logo abaixo comparava maçã com laranja: o mesmo
   * horário podia ser vendido duas vezes.
   */
  const date = zonedDateTime(day, time)
  const session = await getServerSession(authOptions)
  const user = session?.user as
    | { id?: string; name?: string | null }
    | undefined

  if (!user?.id) {
    throw new UserFacingError("Usuário não autenticado")
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
    throw new UserFacingError(
      "Este horário acabou de ser reservado. Escolha outro.",
    )
  }

  const booking = await db.booking.create({
    data: { serviceId, barberId, date, userId: user.id },
    select: {
      id: true,
      barber: { select: { name: true } },
      user: { select: { email: true } },
      service: {
        select: {
          name: true,
          barbershopId: true,
          barbershop: { select: { name: true, address: true } },
        },
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

  // O cliente também precisa saber, e até aqui só a barbearia era avisada.
  await notifyClient({
    kind: "CONFIRMED",
    email: booking.user.email,
    clientName: user.name ?? "Cliente",
    barbershopName: booking.service.barbershop.name,
    serviceName: booking.service.name,
    barberName: booking.barber?.name ?? null,
    date,
    address: booking.service.barbershop.address,
  })

  revalidatePath("/barbershops/[id]", "page")
  revalidatePath("/bookings")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/agendamentos")
}

export const createBooking = async (params: CreateBookingParams) =>
  runAction(() => doCreateBooking(params))
