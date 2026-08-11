"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/app/_lib/prisma"
import { buildInviteMessage } from "@/app/_lib/email"
import { requireOwner } from "./guard"
import { dashboardUrl, notifyInvite } from "./invite-mail"

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Informe um e-mail válido.")

const roleSchema = z.enum(["OWNER", "STAFF"])

const inviteSchema = z.object({
  barbershopId: z.string().uuid(),
  email: emailSchema,
  role: roleSchema,
})

/**
 * Carrega o convite garantindo que ele é desta barbearia.
 *
 * O id vem do cliente, e autorizar contra uma casa para depois agir sobre um
 * convite de outra é o jeito clássico de furar esse tipo de tela. Por isso a
 * barbearia entra no `where`, e não só na checagem de permissão.
 */
async function loadInvite(barbershopId: string, inviteId: string) {
  const invite = await db.barbershopInvite.findFirst({
    where: { id: inviteId, barbershopId },
    select: { id: true, email: true, role: true },
  })

  if (!invite) throw new Error("Acesso não encontrado nesta barbearia.")

  return invite
}

/**
 * Impede que a barbearia fique sem dono.
 *
 * Sem isso, o último responsável poderia rebaixar ou remover a si mesmo e
 * ninguém mais conseguiria mexer em preço, equipe ou cadastro — a casa
 * continuaria recebendo agendamento e viraria chamado de suporte.
 */
async function assertNotLastOwner(barbershopId: string, targetRole: string) {
  if (targetRole !== "OWNER") return

  const owners = await db.barbershopInvite.count({
    where: { barbershopId, role: "OWNER" },
  })

  if (owners <= 1) {
    throw new Error(
      "Esta é a única pessoa responsável pela barbearia. Libere outro responsável antes.",
    )
  }
}

/**
 * Libera um e-mail para o painel desta barbearia.
 *
 * O acesso é liberado por e-mail, e não por convite com link: quem entra prova
 * a posse do endereço pelo login do Google, então não há token para vazar nem
 * link que continue valendo depois de encaminhado por engano.
 */
export async function inviteTeamMember(input: z.infer<typeof inviteSchema>) {
  const parsed = inviteSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { barbershopId, email, role } = parsed.data

  await requireOwner(barbershopId)

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
    throw new Error("Este e-mail já tem acesso a esta barbearia.")
  }
  if (!barbershop) throw new Error("Barbearia não encontrada.")

  await db.barbershopInvite.create({ data: { email, barbershopId, role } })

  // O e-mail é um extra: se falhar ou não estiver configurado, o acesso já está
  // liberado e o dono avisa a pessoa por outro canal.
  const result = await notifyInvite(email, barbershop.name, role)

  revalidatePath("/dashboard/equipe")

  return { email: result }
}

/** Manda o convite de novo, para quem perdeu ou não recebeu. */
export async function resendTeamInvite(barbershopId: string, inviteId: string) {
  await requireOwner(barbershopId)

  const invite = await loadInvite(barbershopId, inviteId)

  const barbershop = await db.barbershop.findUnique({
    where: { id: barbershopId },
    select: { name: true },
  })

  if (!barbershop) throw new Error("Barbearia não encontrada.")

  return {
    email: await notifyInvite(invite.email, barbershop.name, invite.role),
  }
}

/**
 * Texto pronto do convite, para mandar por WhatsApp.
 *
 * Sem provedor de e-mail configurado, copiar a mensagem é o único caminho que
 * realmente funciona — e a maioria dos donos vai avisar o barbeiro por
 * WhatsApp de qualquer jeito. O conteúdo é o mesmo do envio automático, então
 * a instrução não muda conforme o canal.
 */
export async function getTeamInviteText(
  barbershopId: string,
  inviteId: string,
) {
  await requireOwner(barbershopId)

  const invite = await loadInvite(barbershopId, inviteId)

  const barbershop = await db.barbershop.findUnique({
    where: { id: barbershopId },
    select: { name: true },
  })

  if (!barbershop) throw new Error("Barbearia não encontrada.")

  const { text } = buildInviteMessage({
    barbershopName: barbershop.name,
    email: invite.email,
    dashboardUrl: dashboardUrl(),
    role: invite.role,
  })

  return text
}

const roleChangeSchema = z.object({
  barbershopId: z.string().uuid(),
  inviteId: z.string().uuid(),
  role: roleSchema,
})

/** Promove a responsável ou devolve a equipe. */
export async function updateTeamRole(input: z.infer<typeof roleChangeSchema>) {
  const parsed = roleChangeSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { barbershopId, inviteId, role } = parsed.data

  const { email: viewer } = await requireOwner(barbershopId)
  const invite = await loadInvite(barbershopId, inviteId)

  if (invite.role === role) return

  // Rebaixar a si mesmo tira o próprio acesso à tela onde se está: fecharia a
  // porta por dentro, e nem sempre há outro dono para reabrir.
  if (viewer && viewer.toLowerCase() === invite.email.toLowerCase()) {
    throw new Error("Você não pode mudar o seu próprio papel.")
  }

  await assertNotLastOwner(barbershopId, invite.role)

  const user = await db.user.findUnique({
    where: { email: invite.email },
    select: { id: true },
  })

  // Convite e vínculo guardam o papel separadamente: o convite é o que vale
  // para quem ainda não entrou, o vínculo é o que o painel consulta a cada
  // requisição. Mudar só um deixaria os dois discordando.
  await db.$transaction([
    db.barbershopInvite.update({ where: { id: invite.id }, data: { role } }),
    ...(user
      ? [
          db.barbershopManager.updateMany({
            where: { userId: user.id, barbershopId },
            data: { role },
          }),
        ]
      : []),
  ])

  revalidatePath("/dashboard/equipe")
  revalidatePath("/dashboard")
}

const revokeSchema = z.object({
  barbershopId: z.string().uuid(),
  inviteId: z.string().uuid(),
})

/**
 * Tira o acesso de alguém.
 *
 * Apaga o convite e também o vínculo já aceito — só apagar o convite deixaria
 * quem já entrou continuar entrando. O registro de trabalho da pessoa não é
 * tocado: barbeiro é ficha da barbearia, e o histórico de atendimentos
 * continua íntegro mesmo quando quem atendeu perde o acesso ao painel.
 */
export async function revokeTeamMember(input: z.infer<typeof revokeSchema>) {
  const parsed = revokeSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { barbershopId, inviteId } = parsed.data

  const { email: viewer } = await requireOwner(barbershopId)
  const invite = await loadInvite(barbershopId, inviteId)

  if (viewer && viewer.toLowerCase() === invite.email.toLowerCase()) {
    throw new Error("Você não pode remover o seu próprio acesso.")
  }

  await assertNotLastOwner(barbershopId, invite.role)

  const user = await db.user.findUnique({
    where: { email: invite.email },
    select: { id: true },
  })

  await db.$transaction([
    db.barbershopInvite.delete({ where: { id: invite.id } }),
    ...(user
      ? [
          db.barbershopManager.deleteMany({
            where: { userId: user.id, barbershopId },
          }),
        ]
      : []),
  ])

  revalidatePath("/dashboard/equipe")
  revalidatePath("/dashboard")
}
