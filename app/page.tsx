import Link from "next/link"
import { ArrowRight, CalendarCheck, Clock3, Sparkles } from "lucide-react"
import Header from "./_components/header"
import Search from "./_components/search"
import BarbershopItem from "./_components/barbershop-item"
import BookingItem from "./_components/booking-item"
import AppMockup from "./_components/app-mockup"
import { Button } from "./_components/ui/button"
import { quickSearchOptions } from "./_constants/search"
import { getFeaturedBarbershops } from "./_data/get-barbershops"
import { getConfirmedBookings } from "./_data/get-confirmed-bookings"

const HIGHLIGHTS = [
  {
    icon: CalendarCheck,
    title: "Agenda sem conflito",
    description:
      "Horários ocupados somem da lista na hora. Ninguém marca em cima de ninguém.",
  },
  {
    icon: Clock3,
    title: "Duração real por serviço",
    description:
      "Cada serviço tem tempo próprio, então a agenda reflete o dia de verdade.",
  },
  {
    icon: Sparkles,
    title: "Experiência premium",
    description:
      "Da busca à confirmação, o cliente vê preço, profissional e horário antes de fechar.",
  },
]

const Home = async () => {
  const [barbershops, confirmedBookings] = await Promise.all([
    getFeaturedBarbershops(6),
    getConfirmedBookings(),
  ])

  return (
    <>
      <Header transparent />

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden">
        <div className="glow-gold pointer-events-none absolute inset-x-0 top-0 h-[420px]" />

        <div className="container relative grid gap-12 py-12 lg:grid-cols-2 lg:items-center lg:gap-8 lg:py-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-3 py-1 text-xs font-medium text-primary">
              <Sparkles size={13} />
              Seu corte. Seu horário. Seu estilo.
            </span>

            <h1 className="mt-5 font-display text-[2.1rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              A gestão da sua barbearia,{" "}
              <span className="text-gradient-gold">no seu ritmo.</span>
            </h1>

            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              Agende horários, organize sua equipe e ofereça uma experiência
              premium aos seus clientes em um único lugar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/barbershops">
                  Agendar horário
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#como-funciona">Conhecer o BarberFlow</Link>
              </Button>
            </div>

            <div className="mt-10 max-w-lg">
              <Search />
            </div>
          </div>

          <div className="lg:pl-8">
            <AppMockup />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CATEGORIAS                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="container pb-4">
        <div className="rail lg:flex-wrap">
          {quickSearchOptions.map(({ icon: Icon, title }) => (
            <Button
              key={title}
              variant="outline"
              className="shrink-0 rounded-full"
              asChild
            >
              <Link href={`/barbershops?service=${encodeURIComponent(title)}`}>
                <Icon size={16} className="text-primary" />
                {title}
              </Link>
            </Button>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* AGENDAMENTOS DO USUÁRIO                                             */}
      {/* ------------------------------------------------------------------ */}
      {confirmedBookings.length > 0 && (
        <section className="container py-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-xl font-bold">
              Seus próximos horários
            </h2>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/bookings">Ver todos</Link>
            </Button>
          </div>

          <div className="rail lg:grid lg:grid-cols-3 lg:gap-4">
            {confirmedBookings.map((booking) => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* BARBEARIAS EM DESTAQUE                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="container py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Barbearias em destaque
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Casas mais bem avaliadas pelos clientes do BarberFlow.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/barbershops">
              Ver todas
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {barbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* COMO FUNCIONA                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section id="como-funciona" className="border-t border-white/[0.06] py-14">
        <div className="container">
          <h2 className="max-w-xl font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Feito para barbearia que não quer perder horário
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="surface rounded-lg p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-display font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className="surface mt-10 flex flex-col items-start gap-5 rounded-lg p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-xl font-bold">
                Pronto para marcar seu horário?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha a barbearia, o profissional e o horário em menos de um
                minuto.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/barbershops">
                Encontrar barbearia
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
