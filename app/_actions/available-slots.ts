"use server"

import {
  endOfDayInZone,
  startOfDayInZone,
  weekdayInZone,
} from "../_lib/timezone"
import { db } from "../_lib/prisma"
import { activeBookingFilter } from "../_lib/booking-slot"
import { buildSlots, resolveWindow, type DayWindow } from "../_lib/schedule"
import { expireStaleHolds } from "../_lib/expire-holds"

interface AvailableSlotsInput {
  barberId: string
  serviceId: string
  /** Dia consultado. A hora é ignorada. */
  date: Date
}

/**
 * Os horários que o cliente pode escolher.
 *
 * A conta mora no servidor porque depende de coisas que o navegador não tem e
 * não deveria ter: a grade da casa, a escala do profissional, as ausências dele
 * e a agenda dos outros clientes. Antes o navegador decidia sozinho a partir de
 * uma lista fixa de 08:00 às 19:00, e por isso oferecia horário em dia fechado.
 *
 * Ter uma resposta só também elimina a divergência clássica: o cliente vê um
 * horário, escolhe, e leva um erro ao confirmar porque a checagem do servidor
 * usava outro critério. `create-booking` confere o conflito de novo — duas
 * pessoas podem clicar no mesmo minuto —, mas agora com o mesmo entendimento.
 */
export async function getAvailableSlots({
  barberId,
  serviceId,
  date,
}: AvailableSlotsInput): Promise<string[]> {
  // Reserva com sinal vencido não pode continuar ocupando horário.
  await expireStaleHolds()

  const [barber, service] = await Promise.all([
    db.barber.findUnique({
      where: { id: barberId },
      select: {
        active: true,
        barbershopId: true,
        schedule: {
          select: {
            weekday: true,
            closed: true,
            opensAt: true,
            closesAt: true,
          },
        },
      },
    }),
    db.barbershopService.findUnique({
      where: { id: serviceId },
      select: { durationMinutes: true, barbershopId: true },
    }),
  ])

  // Profissional inativo, serviço de outra casa ou par que não existe: nada a
  // oferecer. Silêncio em vez de erro — a tela só mostra "sem horário".
  if (!barber?.active || !service) return []
  if (barber.barbershopId !== service.barbershopId) return []

  // O dia da semana é o da barbearia. Um agendamento de sábado 22:00 em
  // Brasília cai em domingo pelo relógio UTC do servidor — e consultaria a
  // grade do dia errado.
  const weekday = weekdayInZone(date)

  const shopHour = await db.openingHour.findUnique({
    where: {
      barbershopId_weekday: { barbershopId: barber.barbershopId, weekday },
    },
    select: { closed: true, opensAt: true, closesAt: true },
  })

  const window = resolveWindow(
    shopHour ?? undefined,
    barber.schedule.find((day) => day.weekday === weekday) as
      | DayWindow
      | undefined,
  )

  if (!window || window.closed) return []

  const from = startOfDayInZone(date)
  const to = endOfDayInZone(date)

  const [bookings, timeOff] = await Promise.all([
    db.booking.findMany({
      where: {
        barberId,
        date: { gte: from, lte: to },
        ...activeBookingFilter(),
      },
      select: { date: true, service: { select: { durationMinutes: true } } },
    }),
    // Ausência que *cruza* o dia, e não que comece nele: férias iniciadas na
    // semana passada precisam bloquear hoje também.
    db.barberTimeOff.findMany({
      where: { barberId, startsAt: { lte: to }, endsAt: { gte: from } },
      select: { startsAt: true, endsAt: true },
    }),
  ])

  return buildSlots({
    dayStart: from,
    window,
    durationMinutes: service.durationMinutes,
    busy: bookings.map((booking) => ({
      start: booking.date,
      end: new Date(
        booking.date.getTime() + booking.service.durationMinutes * 60_000,
      ),
    })),
    timeOff: timeOff.map((off) => ({ start: off.startsAt, end: off.endsAt })),
  })
}
