"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/app/_lib/prisma"
import { requireSession } from "./guard"

const barberSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do profissional."),
  specialty: z.string().trim().min(2, "Informe a especialidade."),
  bio: z.string().trim().max(280, "A descrição deve ter até 280 caracteres."),
  active: z.boolean(),
})

function revalidate() {
  revalidatePath("/dashboard/barbeiros")
  revalidatePath("/dashboard")
  revalidatePath("/barbershops/[id]", "page")
}

export async function createBarber(
  barbershopId: string,
  input: z.infer<typeof barberSchema>,
) {
  await requireSession()

  const parsed = barberSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const shop = await db.barbershop.findUnique({
    where: { id: barbershopId },
    select: { id: true },
  })
  if (!shop) throw new Error("Barbearia não encontrada.")

  await db.barber.create({
    data: { ...parsed.data, imageUrl: "", barbershopId },
  })

  revalidate()
}

export async function updateBarber(
  barberId: string,
  input: z.infer<typeof barberSchema>,
) {
  await requireSession()

  const parsed = barberSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db.barber.update({ where: { id: barberId }, data: parsed.data })

  revalidate()
}

/**
 * Remove o profissional apenas quando ele nunca atendeu.
 *
 * Com histórico, apagar apagaria também a autoria dos atendimentos (a relação
 * é `onDelete: SetNull`), o que falsearia os relatórios. Nesse caso o certo é
 * desativar: some da escolha no agendamento e o passado continua íntegro.
 */
export async function deleteBarber(barberId: string) {
  await requireSession()

  const bookings = await db.booking.count({ where: { barberId } })

  if (bookings > 0) {
    throw new Error(
      `Este profissional tem ${bookings} atendimentos no histórico. Desative em vez de excluir.`,
    )
  }

  await db.barber.delete({ where: { id: barberId } })

  revalidate()
}
