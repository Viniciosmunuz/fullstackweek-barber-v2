import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { db } from "./prisma"
import { isPlatformAdminEmail } from "./config"

/**
 * Papéis do produto.
 *
 * Derivados, não gravados numa coluna `role` do usuário: a autoridade real já
 * está no vínculo com a barbearia (BarbershopManager) e na lista de
 * administradores da plataforma. Guardar o papel também no User abriria espaço
 * para os dois valores discordarem — e seria mais um lugar por onde alguém
 * poderia tentar se promover.
 *
 *   USER   sem vínculo: busca, agenda e vê os próprios horários
 *   BARBER vínculo STAFF: opera a agenda da barbearia
 *   ADMIN  vínculo OWNER ou e-mail da plataforma: administra tudo
 */
export type AppRole = "USER" | "BARBER" | "ADMIN"

export interface SessionRole {
  role: AppRole
  userId: string | null
  email: string | null
  /** Atalho para decidir se o link do painel deve aparecer. */
  canAccessDashboard: boolean
}

export async function getSessionRole(): Promise<SessionRole> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; email?: string | null } | undefined

  const userId = user?.id ?? null
  const email = user?.email ?? null

  if (!userId) {
    return { role: "USER", userId: null, email: null, canAccessDashboard: false }
  }

  if (isPlatformAdminEmail(email)) {
    return { role: "ADMIN", userId, email, canAccessDashboard: true }
  }

  const links = await db.barbershopManager.findMany({
    where: { userId },
    select: { role: true },
  })

  if (links.length === 0) {
    return { role: "USER", userId, email, canAccessDashboard: false }
  }

  // Basta ser dono de uma unidade para responder como ADMIN no produto.
  const role: AppRole = links.some((link) => link.role === "OWNER")
    ? "ADMIN"
    : "BARBER"

  return { role, userId, email, canAccessDashboard: true }
}
