"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { UserFacingError, runAction } from "../_lib/action-result"
import { notifyClient } from "../_lib/notify-client"
import { requireSession } from "./dashboard/guard"
import { isPlatformAdminEmail } from "../_lib/config"

/**
 * Cancela um agendamento.
 *
 * Duas coisas que a versão anterior não fazia, e ambas importam:
 *
 * 1. **Autorização.** Ela apagava por id, sem olhar quem estava pedindo.
 *    Server action é endpoint acessível diretamente, então isso permitia
 *    cancelar o horário de qualquer outra pessoa sabendo o id.
 *
 * 2. **Preservar o dinheiro.** `Payment` pendurava em `Booking` com cascade,
 *    então apagar a reserva levava junto o registro do pagamento. Numa reserva
 *    já paga isso apagaria o rastro financeiro — dinheiro que entrou sumindo
 *    do relatório da barbearia e da conta da plataforma.
 *
 * Por isso o cancelamento tem dois caminhos: reserva que movimentou dinheiro
 * vira `CANCELLED` e continua existindo; reserva sem pagamento concluído pode
 * sair do banco, porque não há história a preservar.
 */
const doDeleteBooking = async (bookingId: string) => {
  const { userId, email } = await requireSession()

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      userId: true,
      date: true,
      user: { select: { name: true, email: true } },
      barber: { select: { name: true } },
      service: {
        select: {
          name: true,
          barbershopId: true,
          barbershop: { select: { name: true } },
        },
      },
      payment: { select: { id: true, status: true } },
    },
  })

  // Mesma mensagem para "não existe" e "não é seu": diferenciar as duas
  // contaria a quem tentasse adivinhar ids quais deles são reais.
  const negar = () => {
    throw new UserFacingError("Não foi possível cancelar este agendamento.")
  }

  if (!booking) negar()

  const ehDono = booking!.userId === userId

  const gerencia =
    !ehDono &&
    (isPlatformAdminEmail(email) ||
      Boolean(
        await db.barbershopManager.findUnique({
          where: {
            userId_barbershopId: {
              userId,
              barbershopId: booking!.service.barbershopId,
            },
          },
          select: { id: true },
        }),
      ))

  if (!ehDono && !gerencia) negar()

  const pagamento = booking!.payment
  const movimentouDinheiro =
    pagamento?.status === "PAID" || pagamento?.status === "REFUNDED"

  if (movimentouDinheiro) {
    // O registro fica. `expiresAt` volta a nulo para a linha não ser
    // confundida com uma reserva à espera de pagamento.
    await db.booking.update({
      where: { id: booking!.id },
      data: { status: "CANCELLED", expiresAt: null },
    })
  } else {
    // Sem dinheiro envolvido não há história a guardar. A cobrança sai antes
    // da reserva porque a chave estrangeira agora é `Restrict`: destruir
    // registro financeiro passou a exigir intenção explícita.
    await db.$transaction(async (tx) => {
      if (pagamento) {
        await tx.payment.delete({ where: { id: pagamento.id } })
      }
      await tx.booking.delete({ where: { id: booking!.id } })
    })
  }

  // Avisa o cliente só quando quem cancelou foi a barbearia. Cancelar o
  // próprio horário e receber um e-mail dizendo que ele foi cancelado é ruído,
  // e ainda assusta quem já esqueceu que clicou.
  if (!ehDono) {
    await notifyClient({
      kind: "CANCELLED",
      email: booking!.user.email,
      clientName: booking!.user.name ?? "Cliente",
      barbershopName: booking!.service.barbershop.name,
      serviceName: booking!.service.name,
      barberName: booking!.barber?.name ?? null,
      date: booking!.date,
    })
  }

  revalidatePath("/bookings")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/agendamentos")
}

export const deleteBooking = async (bookingId: string) =>
  runAction(() => doDeleteBooking(bookingId))
