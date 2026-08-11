import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { UsersRound } from "lucide-react"
import { EmptyState, PageHeader } from "../_components/ui"
import ClientSearch from "../_components/client-search"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import {
  getBarbershopBySlug,
  getClients,
  getManagedBarbershops,
} from "@/app/_data/dashboard"
import { isOwnerOf } from "@/app/_actions/dashboard/guard"
import { formatCurrency, getInitials } from "@/app/_lib/utils"

export const metadata = { title: "Clientes" }

interface PageProps {
  searchParams: { shop?: string; q?: string; sort?: "spent" | "visits" | "recent" }
}

const ClientsPage = async ({ searchParams }: PageProps) => {
  const [shops, barbershop] = await Promise.all([
    getManagedBarbershops(),
    getBarbershopBySlug(searchParams.shop),
  ])

  if (!barbershop) return notFound()

  // A ficha do cliente é ferramenta de atendimento e fica para os dois papéis:
  // saber quem já veio e o que costuma pedir é como se atende bem. O que sai
  // para a equipe é só o somatório da casa — esse é o caixa, não o histórico.
  const isOwner = await isOwnerOf(barbershop.id)

  const all = await getClients(barbershop.id)

  const query = searchParams.q?.trim().toLowerCase()
  const filtered = query
    ? all.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.phone ?? "").toLowerCase().includes(query),
      )
    : all

  const sorted = [...filtered].sort((a, b) => {
    switch (searchParams.sort) {
      case "visits":
        return b.total - a.total
      case "recent":
        return (b.lastVisit?.getTime() ?? 0) - (a.lastVisit?.getTime() ?? 0)
      default:
        return b.spent - a.spent
    }
  })

  const totalSpent = all.reduce((sum, c) => sum + c.spent, 0)

  return (
    <>
      <PageHeader
        title="Clientes"
        description={`${all.length} clientes com histórico na ${barbershop.name}.`}
        shops={shops}
        current={barbershop}
      >
        <ClientSearch
          shop={barbershop.slug}
          defaultQuery={searchParams.q}
          activeSort={searchParams.sort ?? "spent"}
        />
      </PageHeader>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>
            <strong className="font-semibold text-foreground">
              {sorted.length}
            </strong>{" "}
            exibidos
          </span>
          {isOwner && (
            <span>
              <strong className="font-semibold text-foreground">
                {formatCurrency(totalSpent)}
              </strong>{" "}
              em atendimentos concluídos
            </span>
          )}
        </div>

        {sorted.length > 0 ? (
          <div className="surface overflow-hidden rounded-lg">
            <table className="hidden w-full text-sm md:table">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-semibold">Cliente</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Telefone</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Último agendamento</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Total</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Valor gasto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {sorted.map((client) => (
                  <tr
                    key={client.name}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={client.image ?? ""} alt="" />
                          <AvatarFallback className="text-[11px]">
                            {getInitials(client.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {client.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {client.lastVisit
                        ? format(client.lastVisit, "dd/MM/yyyy", { locale: ptBR })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">{client.total}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {formatCurrency(client.spent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-white/[0.06] md:hidden">
              {sorted.map((client) => (
                <li key={client.name} className="flex items-center gap-3 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={client.image ?? ""} alt="" />
                    <AvatarFallback className="text-xs">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{client.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {client.total} agendamentos
                      {client.lastVisit &&
                        ` · ${format(client.lastVisit, "dd/MM/yy")}`}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {formatCurrency(client.spent)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState
            icon={UsersRound}
            title="Nenhum cliente encontrado"
            description={
              query
                ? "Nenhum nome ou telefone corresponde à busca."
                : "Ainda não há histórico de atendimentos nesta barbearia."
            }
          />
        )}
      </div>
    </>
  )
}

export default ClientsPage
