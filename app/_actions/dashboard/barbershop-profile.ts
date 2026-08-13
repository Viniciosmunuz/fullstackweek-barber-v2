"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/app/_lib/prisma"
import { IMAGE_SOURCE_MESSAGE, isImageSource } from "@/app/_lib/image-source"
import { UserFacingError, runAction } from "@/app/_lib/action-result"
import { requireOwner } from "./guard"

const profileSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da barbearia."),
  slogan: z.string().trim().max(80, "O slogan deve ter até 80 caracteres."),
  description: z
    .string()
    .trim()
    .min(20, "Descreva a barbearia em pelo menos 20 caracteres.")
    .max(600, "A descrição deve ter até 600 caracteres."),
  address: z.string().trim().min(5, "Informe o endereço."),
  neighborhood: z.string().trim().max(60, "Bairro muito longo.").nullable(),
  city: z.string().trim().min(2, "Informe a cidade e o estado."),
  phones: z
    .array(z.string().trim().min(8, "Telefone muito curto."))
    .min(1, "Informe ao menos um telefone.")
    .max(3, "No máximo três telefones."),
  imageUrl: z.string().trim().refine(isImageSource, IMAGE_SOURCE_MESSAGE),
  logoKey: z.string().trim().min(1),
  /**
   * Logo real da casa, ou `null` quando ela ainda usa o símbolo genérico.
   *
   * Só `null` representa "sem logo" — o formulário converte o campo vazio
   * antes de enviar. Com `null` e `""` valendo a mesma coisa, cada leitura
   * precisaria checar as duas.
   */
  logoUrl: z
    .string()
    .trim()
    .refine(isImageSource, IMAGE_SOURCE_MESSAGE)
    .nullable(),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use uma cor em hexadecimal, como #834CF1."),
})

export type BarbershopProfileInput = z.infer<typeof profileSchema>

export async function updateBarbershopProfile(
  barbershopId: string,
  input: BarbershopProfileInput,
) {
  return runAction(async () => {
    await requireOwner(barbershopId)

    const parsed = profileSchema.safeParse(input)
    if (!parsed.success) {
      throw new UserFacingError(parsed.error.issues[0].message)
    }

    await db.barbershop.update({
      where: { id: barbershopId },
      data: parsed.data,
    })

    revalidatePath("/dashboard/configuracoes")
    revalidatePath("/barbershops")
    revalidatePath(`/barbershops/${barbershopId}`)
  })
}

const hourSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  closed: z.boolean(),
  opensAt: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable(),
  closesAt: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable(),
})

/** Substitui a grade de horários da semana inteira. */
export async function updateOpeningHours(
  barbershopId: string,
  hours: z.infer<typeof hourSchema>[],
) {
  return runAction(async () => {
    await requireOwner(barbershopId)

    const parsed = z.array(hourSchema).length(7).safeParse(hours)
    if (!parsed.success) {
      throw new UserFacingError("Horários inválidos.")
    }

    for (const hour of parsed.data) {
      if (!hour.closed && (!hour.opensAt || !hour.closesAt)) {
        throw new UserFacingError(
          "Informe abertura e fechamento nos dias em que abre.",
        )
      }
      if (!hour.closed && hour.opensAt! >= hour.closesAt!) {
        throw new UserFacingError("O fechamento deve ser depois da abertura.")
      }
    }

    // A grade é reescrita por inteiro: mais simples e sem risco de sobrar um
    // dia antigo quando a barbearia muda o funcionamento.
    await db.$transaction([
      db.openingHour.deleteMany({ where: { barbershopId } }),
      db.openingHour.createMany({
        data: parsed.data.map((hour) => ({ ...hour, barbershopId })),
      }),
    ])

    revalidatePath("/dashboard/configuracoes")
    revalidatePath(`/barbershops/${barbershopId}`)
  })
}

/**
 * Publica a barbearia no catálogo.
 *
 * Exige que o cadastro esteja completo — publicar uma ficha vazia daria ao
 * cliente uma página sem endereço nem contato.
 */
export async function publishBarbershop(
  barbershopId: string,
  publish: boolean,
) {
  return runAction(async () => {
    await requireOwner(barbershopId)

    if (publish) {
      const shop = await db.barbershop.findUnique({
        where: { id: barbershopId },
        select: {
          address: true,
          description: true,
          imageUrl: true,
          phones: true,
          _count: { select: { services: true, barbers: true } },
        },
      })

      if (!shop) throw new UserFacingError("Barbearia não encontrada.")

      const missing: string[] = []
      if (!shop.address) missing.push("endereço")
      if (!shop.description) missing.push("descrição")
      if (!shop.imageUrl) missing.push("foto")
      if (shop.phones.length === 0) missing.push("telefone")
      if (shop._count.services === 0) missing.push("ao menos um serviço")
      if (shop._count.barbers === 0) missing.push("ao menos um profissional")

      if (missing.length > 0) {
        throw new UserFacingError(
          `Antes de publicar, preencha: ${missing.join(", ")}.`,
        )
      }
    }

    await db.barbershop.update({
      where: { id: barbershopId },
      data: { isPublished: publish },
    })

    revalidatePath("/dashboard/configuracoes")
    revalidatePath("/barbershops")
  })
}
