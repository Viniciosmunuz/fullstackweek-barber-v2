import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { db } from "./prisma"
import { isPlatformAdminEmail } from "./config"
import type { ToolsRole } from "../_constants/dashboard-nav"

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
  /**
   * Administração da plataforma — quem cadastra as parceiras.
   *
   * Separado de `role` de propósito: o dono de uma barbearia também responde
   * como `ADMIN`, porque manda na casa dele. Usar `role` para liberar a área
   * da plataforma faria o lojista enxergar um link para o painel que não é
   * dele. O servidor recusa o acesso de qualquer forma, mas oferecer a porta
   * e fechá-la na cara é confuso e revela que a área existe.
   */
  isPlatformAdmin: boolean
  /**
   * Em que papel a pessoa entra no menu de ferramentas do site, ou `null` para
   * quem só usa como cliente.
   *
   * Derivado aqui junto dos outros, e não no cabeçalho, porque duas telas
   * abrem esse menu — a home e a página da barbearia — e a conta precisa dar o
   * mesmo resultado nas duas.
   */
  toolsRole: ToolsRole | null
}

export async function getSessionRole(): Promise<SessionRole> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; email?: string | null } | undefined

  const userId = user?.id ?? null
  const email = user?.email ?? null

  if (!userId) {
    return {
      role: "USER",
      userId: null,
      email: null,
      canAccessDashboard: false,
      isPlatformAdmin: false,
      toolsRole: null,
    }
  }

  if (isPlatformAdminEmail(email)) {
    return {
      role: "ADMIN",
      userId,
      email,
      canAccessDashboard: true,
      isPlatformAdmin: true,
      toolsRole: "admin",
    }
  }

  const links = await db.barbershopManager.findMany({
    where: { userId },
    select: { role: true },
  })

  if (links.length === 0) {
    return {
      role: "USER",
      userId,
      email,
      canAccessDashboard: false,
      isPlatformAdmin: false,
      toolsRole: null,
    }
  }

  // Basta ser dono de uma unidade para responder como ADMIN no produto.
  const isOwnerSomewhere = links.some((link) => link.role === "OWNER")
  const role: AppRole = isOwnerSomewhere ? "ADMIN" : "BARBER"

  return {
    role,
    userId,
    email,
    canAccessDashboard: true,
    isPlatformAdmin: false,
    // Dono de uma unidade e colaborador de outra entra como dono. As telas que
    // só a primeira lhe dá continuam recusando por barbearia, dentro do painel.
    toolsRole: isOwnerSomewhere ? "owner" : "collaborator",
  }
}
