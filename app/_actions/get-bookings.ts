"use server"

import { endOfDay, startOfDay } from "date-fns"
import { db } from "../_lib/prisma"
import { activeBookingFilter } from "../_lib/booking-slot"

interface GetBookingsProps {
  /** Profissional cuja agenda será consultada. */
  barberId: string
  date: Date
}

/**
 * Agendamentos já ocupados de um profissional em um dia.
 *
 * A versão anterior recebia `serviceId` e não o aplicava no filtro, então
 * qualquer reserva feita em qualquer barbearia derrubava o horário para todas
 * as outras. A disponibilidade real é por profissional: é o barbeiro que não
 * pode atender duas pessoas ao mesmo tempo.
 */
export const getBookings = ({ barberId, date }: GetBookingsProps) => {
  return db.booking.findMany({
    where: {
      barberId,
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
      // Reserva cujo prazo de sinal venceu não ocupa mais o horário.
      ...activeBookingFilter(),
    },
    select: { id: true, date: true },
  })
}
