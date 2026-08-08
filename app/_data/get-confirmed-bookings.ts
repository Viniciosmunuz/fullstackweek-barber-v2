"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import type { BookingItemData } from "../_components/booking-item"

const BOOKING_SELECT = {
  id: true,
  date: true,
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

  const rows = await db.booking.findMany({
    where: { userId, date: { gte: new Date() } },
    select: BOOKING_SELECT,
    orderBy: { date: "asc" },
  })

  return rows.map(toBookingItem)
}

export const getConcludedBookingsData = async (): Promise<BookingItemData[]> => {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return []

  const rows = await db.booking.findMany({
    where: { userId, date: { lt: new Date() } },
    select: BOOKING_SELECT,
    orderBy: { date: "desc" },
  })

  return rows.map(toBookingItem)
}
