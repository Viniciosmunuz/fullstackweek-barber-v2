"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/app/_lib/prisma"
import { IMAGE_SOURCE_MESSAGE, isImageSource } from "@/app/_lib/image-source"
import {
  actionError,
  actionOk,
  type ActionResult,
} from "@/app/_lib/action-result"
import { requireOwner } from "./guard"

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
  imageUrl: z.string().trim().refine(isImageSource, IMAGE_SOURCE_MESSAGE),
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
): Promise<ActionResult> {
  await requireOwner(barbershopId)

  const parsed = serviceSchema.safeParse(input)
  if (!parsed.success) {
    return actionError(parsed.error.issues[0].message)
  }

  await db.barbershopService.create({
    data: { ...parsed.data, barbershopId },
  })

  revalidate()

  return actionOk()
}

/** A barbearia é derivada do serviço, nunca aceita do cliente. */
async function authorizeService(serviceId: string) {
  const service = await db.barbershopService.findUnique({
    where: { id: serviceId },
    select: { barbershopId: true },
  })

  if (!service) throw new Error("Serviço não encontrado.")

  await requireOwner(service.barbershopId)
}

export async function updateService(
  serviceId: string,
  input: z.infer<typeof serviceSchema>,
): Promise<ActionResult> {
  await authorizeService(serviceId)

  const parsed = serviceSchema.safeParse(input)
  if (!parsed.success) {
    return actionError(parsed.error.issues[0].message)
  }

  await db.barbershopService.update({
    where: { id: serviceId },
    data: parsed.data,
  })

  revalidate()

  return actionOk()
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
  await authorizeService(serviceId)

  const bookings = await db.booking.count({ where: { serviceId } })

  if (bookings > 0) {
    throw new Error(
      `Este serviço tem ${bookings} agendamentos no histórico e não pode ser excluído.`,
    )
  }

  await db.barbershopService.delete({ where: { id: serviceId } })

  revalidate()
}
