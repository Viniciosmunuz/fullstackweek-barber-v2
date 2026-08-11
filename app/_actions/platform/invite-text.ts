"use server"

import { db } from "@/app/_lib/prisma"
import { buildInviteMessage } from "@/app/_lib/email"
import { requirePlatformAdmin } from "../dashboard/guard"
import { dashboardUrl } from "../dashboard/invite-mail"

/**
 * Texto pronto do convite, para repassar por WhatsApp ou e-mail próprio.
 *
 * É o mesmo conteúdo que o envio automático usaria, então o parceiro recebe a
 * mesma instrução independentemente do canal.
 */
export async function getInviteText(inviteId: string) {
  await requirePlatformAdmin()

  const invite = await db.barbershopInvite.findUnique({
    where: { id: inviteId },
    select: { email: true, role: true, barbershop: { select: { name: true } } },
  })

  if (!invite) throw new Error("Convite não encontrado.")

  const { text } = buildInviteMessage({
    barbershopName: invite.barbershop.name,
    email: invite.email,
    dashboardUrl: dashboardUrl(),
    role: invite.role,
  })

  return text
}
