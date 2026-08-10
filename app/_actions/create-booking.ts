"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
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
  const user = session?.user as
    | { id?: string; name?: string | null }
    | undefined

  if (!user?.id) {
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

interface NotifyParams {
  barbershopId: string
  clientName: string
  serviceName: string
  barberName: string | null
  date: Date
}

/**
 * Avisa quem administra a barbearia sobre o agendamento novo.
 *
 * A falha do aviso não pode derrubar a reserva — para o cliente, o agendamento
 * já aconteceu. Por isso o erro é registrado e engolido, em vez de propagado.
 */
async function notifyBarbershop({
  barbershopId,
  clientName,
  serviceName,
  barberName,
  date,
}: NotifyParams) {
  try {
    const managers = await db.barbershopManager.findMany({
      where: { barbershopId },
      select: { userId: true },
    })

    if (managers.length === 0) return

    const quando = format(date, "dd/MM 'às' HH:mm", { locale: ptBR })

    await db.notification.createMany({
      data: managers.map((manager) => ({
        userId: manager.userId,
        title: "Novo agendamento",
        body: barberName
          ? `${clientName} · ${serviceName} · ${barberName} · ${quando}`
          : `${clientName} · ${serviceName} · ${quando}`,
        href: "/dashboard/agendamentos",
      })),
    })
  } catch (error) {
    console.error("Falha ao notificar a barbearia:", error)
  }
}
