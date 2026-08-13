"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/app/_lib/prisma"
import { UserFacingError, runAction } from "@/app/_lib/action-result"
import { requirePlatformAdmin } from "../dashboard/guard"
import { notifyInvite } from "../dashboard/invite-mail"

const createSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da barbearia."),
  ownerEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Informe um e-mail válido do responsável."),
  city: z.string().trim().min(2, "Informe a cidade."),
})

/**
 * Bloco Unicode dos diacríticos combinantes, escrito em escapes para o arquivo
 * continuar legível e não depender da codificação do editor.
 */
const ACCENT_MARKS = /[\u0300-\u036f]/g

/** "Barbearia do Zé" -> "barbearia-do-ze" */
function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      // Tira os acentos que o NFD separou das letras.
      .replace(ACCENT_MARKS, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
  )
}

/** Garante unicidade acrescentando sufixo numérico quando o slug já existe. */
async function uniqueSlug(base: string) {
  const candidate = base || "barbearia"

  for (let suffix = 0; suffix < 50; suffix++) {
    const slug = suffix === 0 ? candidate : `${candidate}-${suffix + 1}`
    const taken = await db.barbershop.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!taken) return slug
  }

  return `${candidate}-${Date.now()}`
}

/**
 * Cadastra uma parceira e libera o e-mail do responsável.
 *
 * A barbearia nasce despublicada e com os campos de vitrine em branco: quem
 * preenche endereço, contato e descrição é o próprio dono, que conhece o
 * negócio. Enquanto isso ela não aparece para os clientes.
 */
async function doCreatePartner(input: z.infer<typeof createSchema>) {
  await requirePlatformAdmin()

  const parsed = createSchema.safeParse(input)
  if (!parsed.success) {
    throw new UserFacingError(parsed.error.issues[0].message)
  }

  const { name, ownerEmail, city } = parsed.data
  const slug = await uniqueSlug(slugify(name))

  const barbershop = await db.barbershop.create({
    data: {
      name,
      slug,
      city,
      slogan: "",
      address: "",
      description: "",
      imageUrl: "",
      phones: [],
      logoKey: "blackwood",
      accentColor: "#834CF1",
      isPublished: false,
    },
  })

  await db.barbershopInvite.create({
    data: { email: ownerEmail, barbershopId: barbershop.id, role: "OWNER" },
  })

  // O e-mail é um extra: se falhar ou não estiver configurado, o cadastro já
  // está feito e o administrador repassa o convite por outro canal.
  const email = await notifyInvite(ownerEmail, name, "OWNER")

  revalidatePath("/admin")

  return { id: barbershop.id, slug, email }
}

const inviteSchema = z.object({
  barbershopId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  role: z.enum(["OWNER", "STAFF"]),
})

/** Libera mais um e-mail para administrar uma barbearia já cadastrada. */
async function doInvitePartnerManager(input: z.infer<typeof inviteSchema>) {
  await requirePlatformAdmin()

  const parsed = inviteSchema.safeParse(input)
  if (!parsed.success) {
    throw new UserFacingError(parsed.error.issues[0].message)
  }

  const { barbershopId, email, role } = parsed.data

  const [existing, barbershop] = await Promise.all([
    db.barbershopInvite.findUnique({
      where: { email_barbershopId: { email, barbershopId } },
      select: { id: true },
    }),
    db.barbershop.findUnique({
      where: { id: barbershopId },
      select: { name: true },
    }),
  ])

  if (existing) {
    throw new UserFacingError(
      "Este e-mail já está liberado para esta barbearia.",
    )
  }
  if (!barbershop) throw new UserFacingError("Barbearia não encontrada.")

  await db.barbershopInvite.create({ data: { email, barbershopId, role } })

  const result = await notifyInvite(email, barbershop.name, role)

  revalidatePath("/admin")

  return { email: result }
}

/** Reenvia o convite de um e-mail já liberado. */
async function doResendInvite(inviteId: string) {
  await requirePlatformAdmin()

  const invite = await db.barbershopInvite.findUnique({
    where: { id: inviteId },
    select: { email: true, role: true, barbershop: { select: { name: true } } },
  })

  if (!invite) throw new UserFacingError("Convite não encontrado.")

  return {
    email: await notifyInvite(
      invite.email,
      invite.barbershop.name,
      invite.role,
    ),
  }
}

/**
 * Revoga o acesso de um e-mail.
 *
 * Remove o convite e também o vínculo já aceito — só apagar o convite deixaria
 * quem já entrou continuar entrando.
 */
async function doRevokePartnerAccess(inviteId: string) {
  await requirePlatformAdmin()

  const invite = await db.barbershopInvite.findUnique({
    where: { id: inviteId },
    select: { email: true, barbershopId: true },
  })

  if (!invite) throw new UserFacingError("Convite não encontrado.")

  const user = await db.user.findUnique({
    where: { email: invite.email },
    select: { id: true },
  })

  await db.$transaction([
    db.barbershopInvite.delete({ where: { id: inviteId } }),
    ...(user
      ? [
          db.barbershopManager.deleteMany({
            where: { userId: user.id, barbershopId: invite.barbershopId },
          }),
        ]
      : []),
  ])

  revalidatePath("/admin")
}

/** Remove a barbearia e tudo que depende dela. */
async function doDeletePartner(barbershopId: string) {
  await requirePlatformAdmin()

  const bookings = await db.booking.count({
    where: { service: { barbershopId } },
  })

  if (bookings > 0) {
    throw new UserFacingError(
      `Esta barbearia tem ${bookings} agendamentos registrados. Despublique em vez de excluir.`,
    )
  }

  await db.barbershop.delete({ where: { id: barbershopId } })

  revalidatePath("/admin")
}

/** Tira do ar ou devolve ao catálogo sem apagar nada. */
async function doSetPartnerPublished(
  barbershopId: string,
  isPublished: boolean,
) {
  await requirePlatformAdmin()

  await db.barbershop.update({
    where: { id: barbershopId },
    data: { isPublished },
  })

  revalidatePath("/admin")
  revalidatePath("/barbershops")
}

/* -------------------------------------------------------------------------- */
/* Fronteira das ações                                                        */
/* -------------------------------------------------------------------------- */

/*
 * Mesmo motivo do painel da barbearia: recusa prevista — "este e-mail já está
 * liberado", "esta barbearia tem 12 agendamentos registrados" — precisa chegar
 * inteira na tela, e o Next apaga a mensagem de exceção lançada por ação.
 */

export async function createPartner(input: z.infer<typeof createSchema>) {
  return runAction(() => doCreatePartner(input))
}

export async function invitePartnerManager(
  input: z.infer<typeof inviteSchema>,
) {
  return runAction(() => doInvitePartnerManager(input))
}

export async function resendInvite(inviteId: string) {
  return runAction(() => doResendInvite(inviteId))
}

export async function revokePartnerAccess(inviteId: string) {
  return runAction(() => doRevokePartnerAccess(inviteId))
}

export async function deletePartner(barbershopId: string) {
  return runAction(() => doDeletePartner(barbershopId))
}

export async function setPartnerPublished(
  barbershopId: string,
  isPublished: boolean,
) {
  return runAction(() => doSetPartnerPublished(barbershopId, isPublished))
}
