"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { expireStaleHolds } from "../_lib/expire-holds"
import type { BookingItemData } from "../_components/booking-item"

/**
 * O que o cliente reconhece como "meu agendamento".
 *
 * Duas exclusões, e nenhuma era feita antes: cancelado não é agendamento, e
 * reserva com prazo em aberto é apenas um horário segurado enquanto o sinal
 * não chega — mostrá-la aqui prometeria ao cliente algo que ainda pode não
 * acontecer. Pago, o webhook zera `expiresAt` e ela entra na lista.
 */
const REAL_BOOKING = {
  status: { not: "CANCELLED" as const },
  expiresAt: null,
}

const BOOKING_SELECT = {
  id: true,
  date: true,
  status: true,
  review: { select: { rating: true, comment: true } },
  barber: { select: { name: true, specialty: true } },
  service: {
    select: {
      name: true,
      price: true,
      durationMinutes: true,
      barbershop: {
        select: {
          name: true,
          address: true,
          city: true,
          phones: true,
          logoKey: true,
          logoUrl: true,
          accentColor: true,
        },
      },
    },
  },
} as const

/**
 * Converte o `price` (Decimal do Prisma) para número antes de devolver, para que
 * o resultado possa ser passado direto a um Client Component sem o
 * `JSON.parse(JSON.stringify(...))` que o template usava.
 */
function toBookingItem(row: {
  id: string
  date: Date
  status: string
  review: { rating: number; comment: string | null } | null
  barber: { name: string; specialty: string } | null
  service: {
    name: string
    price: unknown
    durationMinutes: number
    barbershop: BookingItemData["service"]["barbershop"]
  }
}): BookingItemData {
  return {
    id: row.id,
    date: row.date,
    // Data no passado não basta para avaliar: o cliente pode ter faltado, e
    // quem confirma que a visita aconteceu é a barbearia, marcando concluído.
    canReview: row.status === "COMPLETED",
    review: row.review,
    barber: row.barber,
    service: {
      name: row.service.name,
      price: Number(row.service.price),
      durationMinutes: row.service.durationMinutes,
      barbershop: row.service.barbershop,
    },
  }
}

export const getConfirmedBookings = async (): Promise<BookingItemData[]> => {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return []

  await expireStaleHolds()

  const rows = await db.booking.findMany({
    where: { userId, date: { gte: new Date() }, ...REAL_BOOKING },
    select: BOOKING_SELECT,
    orderBy: { date: "asc" },
  })

  return rows.map(toBookingItem)
}

export const getConcludedBookingsData = async (): Promise<
  BookingItemData[]
> => {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return []

  const rows = await db.booking.findMany({
    where: { userId, date: { lt: new Date() }, ...REAL_BOOKING },
    select: BOOKING_SELECT,
    orderBy: { date: "desc" },
  })

  return rows.map(toBookingItem)
}
