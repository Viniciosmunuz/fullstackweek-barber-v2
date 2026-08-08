import type { Metadata } from "next"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { CalendarClock } from "lucide-react"
import Header from "../_components/header"
import BookingItem from "../_components/booking-item"
import SignInPrompt from "../_components/sign-in-prompt"
import { Button } from "../_components/ui/button"
import { authOptions } from "../_lib/auth"
import {
  getConcludedBookingsData,
  getConfirmedBookings,
} from "../_data/get-confirmed-bookings"

export const metadata: Metadata = {
  title: "Meus agendamentos",
}

const Bookings = async () => {
  const session = await getServerSession(authOptions)

  // O template devolvia notFound() aqui, o que dava um 404 enganoso para quem
  // só não estava logado. Agora a página convida ao login.
  if (!session?.user) {
    return (
      <>
        <Header />
        <SignInPrompt />
      </>
    )
  }

  const [confirmed, concluded] = await Promise.all([
    getConfirmedBookings(),
    getConcludedBookingsData(),
  ])

  const isEmpty = confirmed.length === 0 && concluded.length === 0

  return (
    <>
      <Header />

      <div className="container py-8 lg:py-12">
        <h1 className="font-display text-3xl font-extrabold tracking-tight lg:text-4xl">
          Meus agendamentos
        </h1>

        {isEmpty ? (
          <div className="surface mt-8 flex flex-col items-center rounded-lg px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground">
              <CalendarClock size={24} />
            </span>
            <h2 className="mt-4 font-display text-lg font-bold">
              Você ainda não tem agendamentos
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Escolha uma barbearia, o profissional e o horário. Leva menos de um
              minuto.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/barbershops">Encontrar barbearia</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {confirmed.length > 0 && (
              <section>
                <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Confirmados
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {confirmed.map((booking) => (
                    <BookingItem key={booking.id} booking={booking} />
                  ))}
                </div>
              </section>
            )}

            {concluded.length > 0 && (
              <section>
                <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Concluídos
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {concluded.map((booking) => (
                    <BookingItem key={booking.id} booking={booking} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default Bookings
