"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "../_lib/prisma"
import { UserFacingError, runAction } from "../_lib/action-result"
import { MAX_RATING, MIN_RATING, summarizeRatings } from "../_lib/reviews"
import { requireSession } from "./dashboard/guard"

const schema = z.object({
  bookingId: z.string().uuid(),
  rating: z
    .number()
    .int("Escolha de 1 a 5 estrelas.")
    .min(MIN_RATING, "Escolha de 1 a 5 estrelas.")
    .max(MAX_RATING, "Escolha de 1 a 5 estrelas."),
  comment: z
    .string()
    .trim()
    .max(500, "O comentário deve ter até 500 caracteres.")
    .nullable(),
})

/**
 * Registra ou atualiza a avaliação de um atendimento.
 *
 * Três checagens, e cada uma existe porque sem ela a nota deixa de significar
 * alguma coisa:
 *
 * 1. o agendamento é de quem está avaliando. Sem isso, qualquer pessoa avalia
 *    o atendimento de outra sabendo o id;
 * 2. o atendimento foi concluído. Avaliar o que ainda não aconteceu — ou o que
 *    foi cancelado — é opinar sobre uma visita que não houve;
 * 3. uma avaliação por agendamento, garantida por índice único. Quem volta
 *    todo mês avalia todo mês, mas ninguém vota dez vezes por uma visita.
 *
 * Juntas, elas são a diferença entre uma nota e uma caixa de opinião aberta —
 * onde um concorrente derruba a casa vizinha de graça.
 */
export async function submitReview(input: z.infer<typeof schema>) {
  return runAction(async () => {
    const parsed = schema.safeParse(input)
    if (!parsed.success) {
      throw new UserFacingError(parsed.error.issues[0].message)
    }

    const { bookingId, rating, comment } = parsed.data
    const { userId } = await requireSession()

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      select: {
        userId: true,
        status: true,
        service: { select: { barbershopId: true } },
      },
    })

    // Mesma recusa para "não existe" e "não é seu": distinguir contaria a quem
    // tentasse adivinhar ids quais deles são reais.
    if (!booking || booking.userId !== userId) {
      throw new UserFacingError("Não foi possível avaliar este atendimento.")
    }

    if (booking.status !== "COMPLETED") {
      throw new UserFacingError(
        "Só dá para avaliar depois que o atendimento for concluído.",
      )
    }

    const barbershopId = booking.service.barbershopId

    await db.$transaction(async (tx) => {
      await tx.review.upsert({
        where: { bookingId },
        create: { bookingId, barbershopId, userId, rating, comment },
        update: { rating, comment },
      })

      // Recalcula do zero, e não somando à média anterior: incremento acumula
      // erro e, pior, uma edição de nota deixaria o total permanentemente
      // errado sem ninguém perceber.
      const all = await tx.review.findMany({
        where: { barbershopId },
        select: { rating: true },
      })

      const summary = summarizeRatings(all.map((review) => review.rating))

      await tx.barbershop.update({
        where: { id: barbershopId },
        data: { rating: summary.average, reviewCount: summary.count },
      })
    })

    revalidatePath("/bookings")
    revalidatePath("/barbershops")
    revalidatePath(`/barbershops/${barbershopId}`)
  })
}
