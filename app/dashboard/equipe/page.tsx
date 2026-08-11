import { notFound } from "next/navigation"
import { UsersRound } from "lucide-react"
import { EmptyState, OwnerOnly, PageHeader } from "../_components/ui"
import TeamInviteForm from "../_components/team-invite-form"
import TeamRow from "../_components/team-row"
import {
  getBarbershopBySlug,
  getManagedBarbershops,
} from "@/app/_data/dashboard"
import { getTeam } from "@/app/_data/team"
import { isOwnerOf } from "@/app/_actions/dashboard/guard"
import { isEmailConfigured } from "@/app/_lib/email"

export const metadata = { title: "Equipe" }

interface PageProps {
  searchParams: { shop?: string }
}

/**
 * Quem entra no painel desta barbearia.
 *
 * Até aqui só a administração da plataforma liberava acesso, então cada
 * barbeiro contratado virava um pedido de suporte. Quem sabe que contratou é o
 * dono, e é ele quem precisa poder tirar o acesso no dia em que alguém sai.
 */
const TeamPage = async ({ searchParams }: PageProps) => {
  const [shops, barbershop] = await Promise.all([
    getManagedBarbershops(),
    getBarbershopBySlug(searchParams.shop),
  ])

  if (!barbershop) return notFound()

  if (!(await isOwnerOf(barbershop.id))) {
    return <OwnerOnly title="Equipe" shops={shops} current={barbershop} />
  }

  const team = await getTeam(barbershop.id)
  const emailConfigured = isEmailConfigured()

  return (
    <>
      <PageHeader
        title="Equipe"
        description={`Quem tem acesso ao painel da ${barbershop.name}.`}
        shops={shops}
        current={barbershop}
      >
        <TeamInviteForm barbershopId={barbershop.id} />
      </PageHeader>

      <div className="space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <p className="max-w-2xl text-sm text-muted-foreground">
          <strong className="font-semibold text-foreground">Equipe</strong> abre
          a agenda e os clientes — é o que o dia a dia pede.{" "}
          <strong className="font-semibold text-foreground">Dono</strong>{" "}
          responde pelo negócio: preços, serviços, cadastro da casa e repasses.
          O acesso é liberado por e-mail, e quem entra prova que é dono dele
          pelo login do Google.
        </p>

        {team.length > 0 ? (
          <ul className="surface divide-y divide-white/[0.06] overflow-hidden rounded-lg">
            {team.map((member) => (
              <TeamRow
                key={member.inviteId}
                barbershopId={barbershop.id}
                member={member}
                emailConfigured={emailConfigured}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={UsersRound}
            title="Ninguém liberado ainda"
            description="Libere o e-mail de quem vai usar o painel. A pessoa entra com a conta Google desse endereço."
          />
        )}
      </div>
    </>
  )
}

export default TeamPage
