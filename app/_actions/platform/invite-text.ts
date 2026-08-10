"use server"

import { headers } from "next/headers"
import { db } from "@/app/_lib/prisma"
import { buildInviteMessage } from "@/app/_lib/email"
import { requirePlatformAdmin } from "../dashboard/guard"

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
    select: { email: true, barbershop: { select: { name: true } } },
  })

  if (!invite) throw new Error("Convite não encontrado.")

  const host = headers().get("host") ?? "localhost:3000"
  const protocol = host.startsWith("localhost") ? "http" : "https"

  const { text } = buildInviteMessage({
    barbershopName: invite.barbershop.name,
    email: invite.email,
    dashboardUrl: `${protocol}://${host}/dashboard`,
  })

  return text
}
