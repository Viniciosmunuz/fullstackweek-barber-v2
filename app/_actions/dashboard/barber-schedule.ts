"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/app/_lib/prisma"
import { UserFacingError, runAction } from "@/app/_lib/action-result"
import { requireOwner } from "./guard"

const TIME = /^\d{2}:\d{2}$/

const daySchema = z.object({
  weekday: z.number().int().min(0).max(6),
  closed: z.boolean(),
  opensAt: z.string().regex(TIME).nullable(),
  closesAt: z.string().regex(TIME).nullable(),
})

/** A barbearia vem do próprio registro, nunca de um id enviado junto. */
async function authorize(barberId: string) {
  const barber = await db.barber.findUnique({
    where: { id: barberId },
    select: { barbershopId: true },
  })

  if (!barber) throw new UserFacingError("Profissional não encontrado.")

  await requireOwner(barber.barbershopId)

  return barber.barbershopId
}

function revalidate() {
  revalidatePath("/dashboard/barbeiros")
  revalidatePath("/barbershops/[id]", "page")
}

/**
 * Grava a grade semanal própria do profissional.
 *
 * Lista vazia apaga a grade e devolve o profissional ao horário da casa. É a
 * forma de desfazer sem precisar de um segundo botão: quem tinha escala
 * diferente e voltou ao normal simplesmente deixa de ter escala.
 */
export async function updateBarberSchedule(
  barberId: string,
  days: z.infer<typeof daySchema>[],
) {
  return runAction(async () => {
    await authorize(barberId)

    if (days.length === 0) {
      await db.barberSchedule.deleteMany({ where: { barberId } })
      revalidate()
      return
    }

    const parsed = z.array(daySchema).length(7).safeParse(days)
    if (!parsed.success) {
      throw new UserFacingError("Escala inválida.")
    }

    for (const day of parsed.data) {
      if (!day.closed && (!day.opensAt || !day.closesAt)) {
        throw new UserFacingError(
          "Informe entrada e saída nos dias em que ele trabalha.",
        )
      }
      if (!day.closed && day.opensAt! >= day.closesAt!) {
        throw new UserFacingError("A saída deve ser depois da entrada.")
      }
    }

    // Reescreve a semana inteira, como a grade da casa: mais simples e sem
    // risco de sobrar um dia antigo.
    await db.$transaction([
      db.barberSchedule.deleteMany({ where: { barberId } }),
      db.barberSchedule.createMany({
        data: parsed.data.map((day) => ({ ...day, barberId })),
      }),
    ])

    revalidate()
  })
}

const timeOffSchema = z
  .object({
    barberId: z.string().uuid(),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    reason: z.string().trim().max(120).nullable(),
  })
  .refine((value) => value.endsAt > value.startsAt, {
    message: "O fim da ausência deve ser depois do início.",
  })

/**
 * Registra folga, férias ou compromisso.
 *
 * Não recusa ausência que cubra horário já marcado: quem sabe se o atendimento
 * será remarcado ou passado a outro profissional é a barbearia, e travar aqui
 * obrigaria a desmarcar antes só para conseguir registrar a folga. Os
 * agendamentos existentes seguem valendo; a ausência só impede novos.
 */
export async function addBarberTimeOff(input: z.infer<typeof timeOffSchema>) {
  return runAction(async () => {
    const parsed = timeOffSchema.safeParse(input)
    if (!parsed.success) {
      throw new UserFacingError(parsed.error.issues[0].message)
    }

    const { barberId, startsAt, endsAt, reason } = parsed.data

    await authorize(barberId)

    await db.barberTimeOff.create({
      data: { barberId, startsAt, endsAt, reason },
    })

    revalidate()
  })
}

export async function removeBarberTimeOff(timeOffId: string) {
  return runAction(async () => {
    const timeOff = await db.barberTimeOff.findUnique({
      where: { id: timeOffId },
      select: { barberId: true },
    })

    if (!timeOff) throw new UserFacingError("Ausência não encontrada.")

    await authorize(timeOff.barberId)

    await db.barberTimeOff.delete({ where: { id: timeOffId } })

    revalidate()
  })
}
