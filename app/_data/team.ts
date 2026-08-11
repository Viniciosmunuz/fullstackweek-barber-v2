import { db } from "@/app/_lib/prisma"
import { requireOwner, type ShopRole } from "@/app/_actions/dashboard/guard"

/**
 * Quem tem acesso ao painel de uma barbearia.
 *
 * A lista sai dos **convites**, não dos vínculos já aceitos. O convite é o que
 * o dono controla: ele libera um e-mail antes da pessoa ter conta, e o vínculo
 * só nasce na primeira entrada pelo Google. Listar vínculos esconderia
 * justamente quem ainda não entrou — que é quem o dono acabou de convidar e
 * quer conferir.
 */
export interface TeamMember {
  /** O convite é a identidade da linha; o vínculo pode nem existir ainda. */
  inviteId: string
  email: string
  role: ShopRole
  /** Nulo enquanto a pessoa não entrou pela primeira vez. */
  acceptedAt: Date | null
  name: string | null
  image: string | null
  /** Quem está olhando. A tela não deixa ninguém remover o próprio acesso. */
  isSelf: boolean
}

export async function getTeam(barbershopId: string): Promise<TeamMember[]> {
  const { email: viewer } = await requireOwner(barbershopId)

  const invites = await db.barbershopInvite.findMany({
    where: { barbershopId },
    select: { id: true, email: true, role: true, acceptedAt: true },
    // Donos primeiro: enum no Postgres ordena pela ordem de declaração, e
    // OWNER vem antes de STAFF no schema. Depois o e-mail, para a lista não
    // dançar a cada visita.
    orderBy: [{ role: "asc" }, { email: "asc" }],
  })

  if (invites.length === 0) return []

  // Nome e foto vêm do User de quem já entrou. É um enfeite: a identidade que
  // vale é o e-mail liberado, e é ele que aparece quando não há conta ainda.
  const users = await db.user.findMany({
    where: { email: { in: invites.map((invite) => invite.email) } },
    select: { email: true, name: true, image: true },
  })

  const byEmail = new Map(
    users.map((user) => [(user.email ?? "").toLowerCase(), user]),
  )

  const viewerEmail = viewer?.toLowerCase() ?? null

  return invites.map((invite) => {
    const user = byEmail.get(invite.email.toLowerCase())

    return {
      inviteId: invite.id,
      email: invite.email,
      role: invite.role as ShopRole,
      acceptedAt: invite.acceptedAt,
      name: user?.name ?? null,
      image: user?.image ?? null,
      isSelf: viewerEmail === invite.email.toLowerCase(),
    }
  })
}
