import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CalendarCheck,
  CalendarClock,
  CircleDollarSign,
  Scissors,
  Users,
} from "lucide-react"
import {
  BarChart,
  EmptyState,
  MetricCard,
  PageHeader,
  PeriodFilter,
  StatusBadge,
} from "./_components/ui"
import {
  getBarbershopBySlug,
  getManagedBarbershops,
  getMonthlyRevenue,
  getOverview,
  getPerformance,
  type Period,
} from "@/app/_data/dashboard"
import { formatCurrency } from "@/app/_lib/utils"

interface PageProps {
  searchParams: { shop?: string; period?: Period }
}

const DashboardPage = async ({ searchParams }: PageProps) => {
  const [shops, barbershop] = await Promise.all([
    getManagedBarbershops(),
    getBarbershopBySlug(searchParams.shop),
  ])

  if (!barbershop) return notFound()

  const period: Period = searchParams.period ?? "30d"

  const [overview, monthly, performance] = await Promise.all([
    getOverview(barbershop.id, period),
    getMonthlyRevenue(barbershop.id),
    getPerformance(barbershop.id, period),
  ])

  const upcoming = overview.rows
    .filter((r) => r.date >= new Date() && r.status !== "CANCELLED")
    .slice(0, 6)

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Movimento da ${barbershop.name}.`}
        shops={shops}
        current={barbershop}
      >
        <PeriodFilter
          basePath="/dashboard"
          shop={barbershop.slug}
          active={period}
        />
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Agendamentos hoje"
            value={String(overview.bookingsToday)}
            hint="Exclui cancelados"
            icon={CalendarCheck}
          />
          <MetricCard
            label="Clientes"
            value={String(overview.clients)}
            hint="Únicos no período"
            icon={Users}
          />
          <MetricCard
            label="Faturamento"
            value={formatCurrency(overview.revenue)}
            hint="Somente atendimentos concluídos"
            icon={CircleDollarSign}
          />
          <MetricCard
            label="Serviços realizados"
            value={String(overview.completed)}
            hint={`Ticket médio ${formatCurrency(overview.ticket)}`}
            icon={Scissors}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <section className="surface rounded-lg p-5">
            <h2 className="font-display font-bold">Faturamento por mês</h2>
            <p className="mb-5 text-xs text-muted-foreground">
              Últimos 12 meses, considerando atendimentos concluídos.
            </p>
            <BarChart data={monthly} />
          </section>

          <section className="surface rounded-lg p-5">
            <h2 className="font-display font-bold">Próximos atendimentos</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Da data atual em diante.
            </p>

            {upcoming.length > 0 ? (
              <ul className="divide-y divide-white/[0.06]">
                {upcoming.map((booking) => (
                  <li
                    key={booking.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {booking.clientName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {booking.serviceName}
                        {booking.barberName && ` · ${booking.barberName}`}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium">
                        {format(booking.date, "dd/MM HH:mm", { locale: ptBR })}
                      </p>
                      <StatusBadge status={booking.status} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={CalendarClock}
                title="Nada agendado"
                description="Não há atendimentos futuros para esta barbearia."
              />
            )}
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="surface rounded-lg p-5">
            <h2 className="mb-4 font-display font-bold">Serviços mais pedidos</h2>
            {performance.services.length > 0 ? (
              <ul className="space-y-3">
                {performance.services.slice(0, 6).map((service) => {
                  const max = performance.services[0].count
                  return (
                    <li key={service.name}>
                      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate">{service.name}</span>
                        <span className="shrink-0 text-muted-foreground">
                          {service.count} · {formatCurrency(service.revenue)}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(service.count / max) * 100}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="py-6 text-sm text-muted-foreground">
                Sem atendimentos concluídos no período.
              </p>
            )}
          </section>

          <section className="surface rounded-lg p-5">
            <h2 className="mb-4 font-display font-bold">
              Desempenho dos barbeiros
            </h2>
            {performance.barbers.length > 0 ? (
              <ul className="space-y-3">
                {performance.barbers.map((barber) => {
                  const max = performance.barbers[0].revenue || 1
                  return (
                    <li key={barber.name}>
                      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate">{barber.name}</span>
                        <span className="shrink-0 text-muted-foreground">
                          {barber.count} · {formatCurrency(barber.revenue)}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{ width: `${(barber.revenue / max) * 100}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="py-6 text-sm text-muted-foreground">
                Sem atendimentos concluídos no período.
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
