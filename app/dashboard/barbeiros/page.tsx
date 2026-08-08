import { notFound } from "next/navigation"
import { UserSquare2 } from "lucide-react"
import { EmptyState, PageHeader } from "../_components/ui"
import BarberForm from "../_components/barber-form"
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

  const [barbers, openingHours, performance] = await Promise.all([
    db.barber.findMany({
      where: { barbershopId: barbershop.id },
      orderBy: { name: "asc" },
    }),
    db.openingHour.findMany({
      where: { barbershopId: barbershop.id, closed: false },
      orderBy: { weekday: "asc" },
    }),
    getPerformance(barbershop.id, "30d"),
  ])

  // A escala segue o horário da casa; o painel mostra a faixa em que o
  // profissional pode receber agendamento.
  const workingDays = openingHours
    .map((h) => getWeekdayLabel(h.weekday).slice(0, 3))
    .join(", ")
  const shift = openingHours[0]
    ? `${openingHours[0].opensAt} – ${openingHours[0].closesAt}`
    : "—"

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
              const stats = performance.barbers.find((b) => b.name === barber.name)

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
                      <dt className="text-muted-foreground">Escala</dt>
                      <dd className="text-right font-medium">{workingDays}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Horário</dt>
                      <dd className="font-medium">{shift}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Atendimentos (30d)</dt>
                      <dd className="font-medium">{stats?.count ?? 0}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Faturamento (30d)</dt>
                      <dd className="font-medium">
                        {formatCurrency(stats?.revenue ?? 0)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex justify-end border-t border-white/[0.06] pt-3">
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
