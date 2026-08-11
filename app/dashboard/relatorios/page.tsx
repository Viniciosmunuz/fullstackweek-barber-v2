import { notFound } from "next/navigation"
import {
  BarChart3,
  CalendarCheck,
  CircleDollarSign,
  TrendingUp,
  Users,
} from "lucide-react"
import {
  BarChart,
  EmptyState,
  MetricCard,
  OwnerOnly,
  PageHeader,
  PeriodFilter,
} from "../_components/ui"
import { isOwnerOf } from "@/app/_actions/dashboard/guard"
import {
  getBarbershopBySlug,
  getManagedBarbershops,
  getMonthlyRevenue,
  getOverview,
  getPerformance,
  PERIOD_LABELS,
  type Period,
} from "@/app/_data/dashboard"
import { formatCurrency } from "@/app/_lib/utils"

export const metadata = { title: "Relatórios" }

interface PageProps {
  searchParams: { shop?: string; period?: Period }
}

const ReportsPage = async ({ searchParams }: PageProps) => {
  const [shops, barbershop] = await Promise.all([
    getManagedBarbershops(),
    getBarbershopBySlug(searchParams.shop),
  ])

  if (!barbershop) return notFound()

  if (!(await isOwnerOf(barbershop.id))) {
    return <OwnerOnly title="Relatórios" shops={shops} current={barbershop} />
  }

  const period: Period = searchParams.period ?? "30d"

  const [overview, performance, monthly] = await Promise.all([
    getOverview(barbershop.id, period),
    getPerformance(barbershop.id, period),
    getMonthlyRevenue(barbershop.id),
  ])

  const total = overview.completed + overview.cancelled
  const cancellationRate = total ? (overview.cancelled / total) * 100 : 0

  return (
    <>
      <PageHeader
        title="Relatórios"
        description={`Desempenho da ${barbershop.name}.`}
        shops={shops}
        current={barbershop}
      >
        <PeriodFilter
          basePath="/dashboard/relatorios"
          shop={barbershop.slug}
          active={period}
        />
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Faturamento"
            value={formatCurrency(overview.revenue)}
            hint={PERIOD_LABELS[period]}
            icon={CircleDollarSign}
          />
          <MetricCard
            label="Agendamentos"
            value={String(overview.completed + overview.cancelled)}
            hint={`${overview.cancelled} cancelados`}
            icon={CalendarCheck}
          />
          <MetricCard
            label="Clientes atendidos"
            value={String(overview.clients)}
            hint="Únicos no período"
            icon={Users}
          />
          <MetricCard
            label="Ticket médio"
            value={formatCurrency(overview.ticket)}
            hint={`${cancellationRate.toFixed(1).replace(".", ",")}% de cancelamento`}
            icon={TrendingUp}
          />
        </div>

        <section className="surface rounded-lg p-5">
          <h2 className="font-display font-bold">Evolução do faturamento</h2>
          <p className="mb-5 text-xs text-muted-foreground">
            Últimos 12 meses, independente do período selecionado acima.
          </p>
          <BarChart data={monthly} />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="surface overflow-hidden rounded-lg">
            <h2 className="border-b border-white/[0.06] px-5 py-4 font-display font-bold">
              Serviços mais populares
            </h2>
            {performance.services.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Serviço</th>
                    <th scope="col">Quantidade</th>
                    <th scope="col">Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {performance.services.map((service) => (
                    <tr key={service.name}>
                      <td className="px-5 py-3">{service.name}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">
                        {service.count}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right font-medium">
                        {formatCurrency(service.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                Sem dados no período.
              </p>
            )}
          </section>

          <section className="surface overflow-hidden rounded-lg">
            <h2 className="border-b border-white/[0.06] px-5 py-4 font-display font-bold">
              Desempenho dos barbeiros
            </h2>
            {performance.barbers.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Profissional</th>
                    <th scope="col">Atendimentos</th>
                    <th scope="col">Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {performance.barbers.map((barber) => (
                    <tr key={barber.name}>
                      <td className="px-5 py-3">{barber.name}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">
                        {barber.count}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right font-medium">
                        {formatCurrency(barber.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="Sem dados no período"
                description="Escolha um intervalo maior para ver o desempenho."
              />
            )}
          </section>
        </div>
      </div>
    </>
  )
}

export default ReportsPage
