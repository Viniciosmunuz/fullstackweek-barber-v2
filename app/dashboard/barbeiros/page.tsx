import { notFound } from "next/navigation"
import { UserSquare2 } from "lucide-react"
import { EmptyState, OwnerOnly, PageHeader } from "../_components/ui"
import BarberForm from "../_components/barber-form"
import BarberScheduleForm from "../_components/barber-schedule-form"
import { isOwnerOf } from "@/app/_actions/dashboard/guard"
import BarberAvatar from "@/app/_components/barber-avatar"
import { db } from "@/app/_lib/prisma"
import {
  getBarbershopBySlug,
  getManagedBarbershops,
  getPerformance,
} from "@/app/_data/dashboard"
import { formatCurrency, getWeekdayLabel } from "@/app/_lib/utils"

export const metadata = { title: "Barbeiros" }

interface PageProps {
  searchParams: { shop?: string }
}

const BarbersPage = async ({ searchParams }: PageProps) => {
  const [shops, barbershop] = await Promise.all([
    getManagedBarbershops(),
    getBarbershopBySlug(searchParams.shop),
  ])

  if (!barbershop) return notFound()

  if (!(await isOwnerOf(barbershop.id))) {
    return <OwnerOnly title="Barbeiros" shops={shops} current={barbershop} />
  }

  const [barbers, openingHours, performance] = await Promise.all([
    db.barber.findMany({
      where: { barbershopId: barbershop.id },
      orderBy: { name: "asc" },
      include: {
        schedule: { orderBy: { weekday: "asc" } },
        // Só o que ainda vale: folga do mês passado não interessa a ninguém.
        timeOff: {
          where: { endsAt: { gte: new Date() } },
          orderBy: { startsAt: "asc" },
        },
      },
    }),
    db.openingHour.findMany({
      where: { barbershopId: barbershop.id },
      orderBy: { weekday: "asc" },
    }),
    getPerformance(barbershop.id, "30d"),
  ])

  const shopWeek = openingHours.map((hour) => ({
    weekday: hour.weekday,
    closed: hour.closed,
    opensAt: hour.opensAt,
    closesAt: hour.closesAt,
  }))

  /**
   * Resume a escala do profissional em uma linha.
   *
   * Sem grade própria ele segue a casa, e é isso que o card diz — antes esta
   * tela afirmava o horário da casa para todo mundo, o que passou a ser mentira
   * assim que a escala própria existiu.
   */
  const summarize = (week: typeof shopWeek) => {
    const open = week.filter((day) => !day.closed)

    if (open.length === 0) return { days: "—", shift: "—" }

    return {
      days: open
        .map((day) => getWeekdayLabel(day.weekday).slice(0, 3))
        .join(", "),
      shift: `${open[0].opensAt} – ${open[0].closesAt}`,
    }
  }

  return (
    <>
      <PageHeader
        title="Barbeiros"
        description={`${barbers.length} profissionais na ${barbershop.name}.`}
        shops={shops}
        current={barbershop}
      >
        <BarberForm barbershopId={barbershop.id} />
      </PageHeader>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {barbers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {barbers.map((barber) => {
              const stats = performance.barbers.find(
                (b) => b.name === barber.name,
              )

              const ownWeek = barber.schedule.map((day) => ({
                weekday: day.weekday,
                closed: day.closed,
                opensAt: day.opensAt,
                closesAt: day.closesAt,
              }))

              const hasOwn = ownWeek.length === 7
              const summary = summarize(hasOwn ? ownWeek : shopWeek)

              return (
                <article key={barber.id} className="surface rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <BarberAvatar
                      name={barber.name}
                      imageUrl={barber.imageUrl}
                      accentColor={barbershop.accentColor}
                      className="h-14 w-14 text-base"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="truncate font-display font-bold">
                          {barber.name}
                        </h2>
                        <span
                          className={
                            barber.active
                              ? "shrink-0 rounded-full bg-success/15 px-2.5 py-0.5 text-[11px] font-semibold text-success"
                              : "shrink-0 rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground"
                          }
                        >
                          {barber.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <p
                        className="truncate text-xs"
                        style={{ color: barbershop.accentColor }}
                      >
                        {barber.specialty}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {barber.bio}
                  </p>

                  <dl className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">
                        Escala
                        {!hasOwn && (
                          <span className="block text-[11px]">
                            segue a barbearia
                          </span>
                        )}
                      </dt>
                      <dd className="text-right font-medium">{summary.days}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Horário</dt>
                      <dd className="font-medium">{summary.shift}</dd>
                    </div>
                    {barber.timeOff.length > 0 && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Ausências</dt>
                        <dd className="font-medium">
                          {barber.timeOff.length} marcada
                          {barber.timeOff.length > 1 ? "s" : ""}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">
                        Atendimentos (30d)
                      </dt>
                      <dd className="font-medium">{stats?.count ?? 0}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">
                        Valor atendido (30d)
                      </dt>
                      <dd className="font-medium">
                        {formatCurrency(stats?.revenue ?? 0)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex justify-end gap-1 border-t border-white/[0.06] pt-3">
                    <BarberScheduleForm
                      barberId={barber.id}
                      barberName={barber.name}
                      schedule={ownWeek}
                      timeOff={barber.timeOff}
                      shopHours={shopWeek}
                    />
                    <BarberForm
                      barbershopId={barbershop.id}
                      barber={{
                        id: barber.id,
                        name: barber.name,
                        specialty: barber.specialty,
                        bio: barber.bio,
                        active: barber.active,
                      }}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={UserSquare2}
            title="Nenhum profissional cadastrado"
            description="Esta barbearia ainda não tem barbeiros na equipe."
          />
        )}
      </div>
    </>
  )
}

export default BarbersPage
