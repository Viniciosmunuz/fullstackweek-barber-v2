"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/app/_lib/prisma"
import { requireSession } from "./guard"

const serviceSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do serviço."),
  description: z
    .string()
    .trim()
    .min(5, "Descreva o serviço em pelo menos 5 caracteres.")
    .max(280, "A descrição deve ter até 280 caracteres."),
  price: z
    .number({ invalid_type_error: "Informe um preço válido." })
    .positive("O preço deve ser maior que zero.")
    .max(10000, "Preço acima do limite."),
  durationMinutes: z
    .number({ invalid_type_error: "Informe a duração." })
    .int("A duração deve ser em minutos inteiros.")
    .min(5, "A duração mínima é de 5 minutos.")
    .max(480, "A duração máxima é de 8 horas."),
  imageUrl: z.string().trim().url("Informe uma URL de imagem válida."),
})

function revalidate() {
  revalidatePath("/dashboard/servicos")
  revalidatePath("/dashboard")
  revalidatePath("/barbershops/[id]", "page")
  revalidatePath("/barbershops")
}

export async function createService(
  barbershopId: string,
  input: z.infer<typeof serviceSchema>,
) {
  await requireSession()

  const parsed = serviceSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const shop = await db.barbershop.findUnique({
    where: { id: barbershopId },
    select: { id: true },
  })
  if (!shop) throw new Error("Barbearia não encontrada.")

  await db.barbershopService.create({
    data: { ...parsed.data, barbershopId },
  })

  revalidate()
}

export async function updateService(
  serviceId: string,
  input: z.infer<typeof serviceSchema>,
) {
  await requireSession()

  const parsed = serviceSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db.barbershopService.update({
    where: { id: serviceId },
    data: parsed.data,
  })

  revalidate()
}

/**
 * Só exclui serviço sem histórico.
 *
 * A relação Booking -> BarbershopService é obrigatória, então apagar um serviço
 * já vendido derrubaria os agendamentos junto — perdendo faturamento registrado.
 * Alterar o preço de um serviço existente também não reescreve o passado: o
 * histórico guarda o vínculo, e relatórios antigos seguem com o valor da época
 * apenas se o preço não mudar. Vale ter isso em mente ao reajustar tabela.
 */
export async function deleteService(serviceId: string) {
  await requireSession()

  const bookings = await db.booking.count({ where: { serviceId } })

  if (bookings > 0) {
    throw new Error(
      `Este serviço tem ${bookings} agendamentos no histórico e não pode ser excluído.`,
    )
  }

  await db.barbershopService.delete({ where: { id: serviceId } })

  revalidate()
}
