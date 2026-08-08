import { notFound } from "next/navigation"
import Link from "next/link"
import { addDays, format, isValid, parseISO, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarX, ChevronLeft, ChevronRight } from "lucide-react"
import { EmptyState, PageHeader } from "../_components/ui"
import StatusSelect from "../_components/status-select"
import BarberAvatar from "@/app/_components/barber-avatar"
import { Button } from "@/app/_components/ui/button"
import {
  getAgenda,
  getBarbershopBySlug,
  getManagedBarbershops,
} from "@/app/_data/dashboard"
import { formatCurrency, formatDuration } from "@/app/_lib/utils"

export const metadata = { title: "Agendamentos" }

interface PageProps {
  searchParams: { shop?: string; date?: string }
}

const AgendaPage = async ({ searchParams }: PageProps) => {
  const [shops, barbershop] = await Promise.all([
    getManagedBarbershops(),
    getBarbershopBySlug(searchParams.shop),
  ])

  if (!barbershop) return notFound()

  // Data inválida na URL cai para hoje em vez de quebrar a página.
  const parsed = searchParams.date ? parseISO(searchParams.date) : new Date()
  const day = isValid(parsed) ? startOfDay(parsed) : startOfDay(new Date())

  const bookings = await getAgenda(barbershop.id, day)

  const dayHref = (offset: number) =>
    `/dashboard/agendamentos?shop=${barbershop.slug}&date=${format(
      addDays(day, offset),
      "yyyy-MM-dd",
    )}`

  const revenue = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.price, 0)

  return (
    <>
      <PageHeader
        title="Agendamentos"
        description="Agenda do dia, por profissional e horário."
        shops={shops}
        current={barbershop}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" asChild>
              <Link href={dayHref(-1)} aria-label="Dia anterior">
                <ChevronLeft size={16} />
              </Link>
            </Button>
            <Button size="icon" variant="outline" asChild>
              <Link href={dayHref(1)} aria-label="Próximo dia">
                <ChevronRight size={16} />
              </Link>
            </Button>
          </div>

          <p className="font-display text-sm font-bold capitalize">
            {format(day, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>

          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/agendamentos?shop=${barbershop.slug}`}>
              Hoje
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>
            <strong className="font-semibold text-foreground">
              {bookings.length}
            </strong>{" "}
            agendamentos
          </span>
          <span>
            <strong className="font-semibold text-foreground">
              {formatCurrency(revenue)}
            </strong>{" "}
            concluído no dia
          </span>
        </div>

        {bookings.length > 0 ? (
          <div className="surface overflow-hidden rounded-lg">
            {/* Tabela no desktop */}
            <table className="hidden w-full text-sm md:table">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-semibold">Horário</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Cliente</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Serviço</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Profissional</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Valor</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {format(booking.date, "HH:mm")}
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {formatDuration(booking.durationMinutes)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{booking.clientName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {booking.serviceName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {booking.barberName ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatCurrency(booking.price)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect
                        bookingId={booking.id}
                        status={booking.status}
                        clientName={booking.clientName}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cartões no mobile */}
            <ul className="divide-y divide-white/[0.06] md:hidden">
              {bookings.map((booking) => (
                <li key={booking.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display font-bold">
                        {format(booking.date, "HH:mm")}
                      </p>
                      <p className="truncate text-sm">{booking.clientName}</p>
                    </div>
                    <StatusSelect
                      bookingId={booking.id}
                      status={booking.status}
                      clientName={booking.clientName}
                    />
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    {booking.barberName && (
                      <BarberAvatar
                        name={booking.barberName}
                        accentColor={barbershop.accentColor}
                        className="h-7 w-7 text-[11px]"
                      />
                    )}
                    <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                      {booking.serviceName}
                      {booking.barberName && ` · ${booking.barberName}`}
                    </p>
                    <span className="shrink-0 text-sm font-semibold">
                      {formatCurrency(booking.price)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState
            icon={CalendarX}
            title="Nenhum agendamento neste dia"
            description="Use as setas para navegar entre os dias ou volte para hoje."
          />
        )}
      </div>
    </>
  )
}

export default AgendaPage
