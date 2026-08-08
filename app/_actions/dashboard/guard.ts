import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { isPlatformAdminEmail } from "@/app/_lib/config"

interface SessionUser {
  id?: string
  email?: string | null
}

async function currentUser() {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  return { userId: user?.id, email: user?.email ?? null }
}

/** Apenas exige sessão. Use `requireManager` quando houver barbearia envolvida. */
export async function requireSession() {
  const { userId, email } = await currentUser()

  if (!userId) {
    throw new Error("Sessão expirada. Entre novamente para continuar.")
  }

  return { userId, email }
}

/** Administração da plataforma: cadastrar parceiras e liberar acessos. */
export async function requirePlatformAdmin() {
  const { userId, email } = await requireSession()

  if (!isPlatformAdminEmail(email)) {
    throw new Error("Esta área é restrita à administração da plataforma.")
  }

  return { userId, email }
}

export async function isPlatformAdmin() {
  const { email } = await currentUser()
  return isPlatformAdminEmail(email)
}

/**
 * Converte convites pendentes do e-mail logado em vínculos reais.
 *
 * O dono é cadastrado antes de ter conta, então o convite fica guardado pelo
 * e-mail. Na primeira visita ao painel — já autenticado pelo Google, o que
 * prova a posse do endereço — o vínculo é criado e o convite marcado como
 * aceito.
 */
export async function syncPendingInvites() {
  const { userId, email } = await currentUser()
  if (!userId || !email) return

  const normalized = email.trim().toLowerCase()

  const pending = await db.barbershopInvite.findMany({
    where: { email: normalized, acceptedAt: null },
    select: { id: true, barbershopId: true, role: true },
  })

  if (pending.length === 0) return

  await db.$transaction([
    db.barbershopManager.createMany({
      data: pending.map((invite) => ({
        userId,
        barbershopId: invite.barbershopId,
        role: invite.role,
      })),
      skipDuplicates: true,
    }),
    db.barbershopInvite.updateMany({
      where: { id: { in: pending.map((invite) => invite.id) } },
      data: { acceptedAt: new Date() },
    }),
  ])
}

/**
 * Autoriza a operação sobre uma barbearia específica.
 *
 * A checagem roda no servidor a cada mutação, e não apenas escondendo botões:
 * server actions são endpoints acessíveis diretamente, então esconder o
 * controle não protege nada.
 */
export async function requireManager(barbershopId: string) {
  const { userId, email } = await requireSession()

  // A administração da plataforma alcança qualquer barbearia — é quem dá
  // suporte ao parceiro quando algo trava no cadastro dele.
  if (isPlatformAdminEmail(email)) {
    return { userId, role: "OWNER" as const }
  }

  const link = await db.barbershopManager.findUnique({
    where: { userId_barbershopId: { userId, barbershopId } },
    select: { role: true },
  })

  if (!link) {
    throw new Error("Você não tem permissão para gerenciar esta barbearia.")
  }

  return { userId, role: link.role }
}

/** Ids das barbearias que o usuário administra. */
export async function getManagedBarbershopIds() {
  const { userId, email } = await currentUser()
  if (!userId) return []

  // Administrador da plataforma enxerga todas, para dar suporte.
  if (isPlatformAdminEmail(email)) {
    const all = await db.barbershop.findMany({ select: { id: true } })
    return all.map((shop) => shop.id)
  }

  const links = await db.barbershopManager.findMany({
    where: { userId },
    select: { barbershopId: true },
  })

  return links.map((link) => link.barbershopId)
}
