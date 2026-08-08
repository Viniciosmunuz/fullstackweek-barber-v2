import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"

/** Apenas exige sessão. Use `requireManager` quando houver barbearia envolvida. */
export async function requireSession() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (!userId) {
    throw new Error("Sessão expirada. Entre novamente para continuar.")
  }

  return { userId }
}

/**
 * Autoriza a operação sobre uma barbearia específica.
 *
 * A checagem é feita no servidor a cada mutação, e não apenas escondendo botões
 * na interface: as server actions são endpoints acessíveis diretamente, então
 * esconder o controle não protege nada.
 *
 * A mensagem de erro é a mesma para "não existe" e "não é seu", para não
 * revelar quais barbearias existem a quem não administra nenhuma.
 */
export async function requireManager(barbershopId: string) {
  const { userId } = await requireSession()

  const link = await db.barbershopManager.findUnique({
    where: { userId_barbershopId: { userId, barbershopId } },
    select: { role: true },
  })

  if (!link) {
    throw new Error("Você não tem permissão para gerenciar esta barbearia.")
  }

  return { userId, role: link.role }
}

/** Ids das barbearias que o usuário administra. Vazio se não administra nenhuma. */
export async function getManagedBarbershopIds() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return []

  const links = await db.barbershopManager.findMany({
    where: { userId },
    select: { barbershopId: true },
  })

  return links.map((link) => link.barbershopId)
}
