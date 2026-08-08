import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"

/**
 * Portão comum das mutações do painel.
 *
 * Ainda não existe modelo de dono/gestor de barbearia, então a única barreira
 * possível hoje é exigir uma sessão válida. Quando `BarbershopManager` existir,
 * a checagem de vínculo entra aqui — num ponto só, em vez de espalhada por cada
 * action.
 */
export async function requireSession() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (!userId) {
    throw new Error("Sessão expirada. Entre novamente para continuar.")
  }

  return { userId }
}
