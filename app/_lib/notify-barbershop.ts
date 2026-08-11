import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { db } from "./prisma"

/**
 * Avisa quem administra a barbearia sobre um agendamento novo.
 *
 * Mora aqui, e não em `_actions/create-booking.ts`, porque o webhook de
 * pagamento também precisa avisar quando o sinal cai. Num arquivo marcado com
 * `"use server"` todo export vira um endpoint acessível de fora — exportar a
 * notificação de lá abriria uma rota para qualquer um criar aviso na caixa da
 * barbearia.
 */
interface NotifyParams {
  barbershopId: string
  clientName: string
  serviceName: string
  barberName: string | null
  date: Date
  /** Distingue o aviso de reserva paga do aviso de reserva comum. */
  paid?: boolean
}

/**
 * A falha do aviso não pode derrubar o que já aconteceu: para o cliente, o
 * agendamento está feito e o dinheiro saiu. Por isso o erro é registrado e
 * engolido, em vez de propagado.
 */
export async function notifyBarbershop({
  barbershopId,
  clientName,
  serviceName,
  barberName,
  date,
  paid = false,
}: NotifyParams) {
  try {
    const managers = await db.barbershopManager.findMany({
      where: { barbershopId },
      select: { userId: true },
    })

    if (managers.length === 0) return

    const quando = format(date, "dd/MM 'às' HH:mm", { locale: ptBR })
    const detalhe = barberName
      ? `${clientName} · ${serviceName} · ${barberName} · ${quando}`
      : `${clientName} · ${serviceName} · ${quando}`

    await db.notification.createMany({
      data: managers.map((manager) => ({
        userId: manager.userId,
        title: paid ? "Agendamento com sinal pago" : "Novo agendamento",
        body: detalhe,
        href: "/dashboard/agendamentos",
      })),
    })
  } catch (error) {
    console.error("Falha ao notificar a barbearia:", error)
  }
}
