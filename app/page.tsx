import { Suspense } from "react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { CalendarPlus, SearchX } from "lucide-react"
import Header from "./_components/header"
import Search from "./_components/search"
import BarbershopItem from "./_components/barbershop-item"
import BarbershopFilters from "./_components/barbershop-filters"
import BookingItem from "./_components/booking-item"
import HomeBanner from "./_components/home-banner"
import { Button } from "./_components/ui/button"
import { authOptions } from "./_lib/auth"
import { getBarbershops } from "./_data/get-barbershops"
import { getConfirmedBookings } from "./_data/get-confirmed-bookings"
import type { SortValue } from "./_constants/search"

interface HomeProps {
  searchParams: {
    title?: string
    service?: string
    sort?: SortValue
  }
}

/**
 * Home — tela de descoberta.
 *
 * A versão anterior abria com um hero institucional e o mockup do produto, e a
 * busca só aparecia depois de rolar. Aqui a primeira coisa na tela é procurar
 * uma barbearia: título curto, campo de busca, filtros e a grade. A apresentação
 * da marca foi para o fim da página, onde não atrapalha quem entrou para
 * agendar.
 */
const Home = async ({ searchParams }: HomeProps) => {
  const session = await getServerSession(authOptions)

  const [barbershops, confirmedBookings] = await Promise.all([
    getBarbershops({
      title: searchParams.title,
      service: searchParams.service,
      sort: searchParams.sort,
    }),
    getConfirmedBookings(),
  ])

  const firstName = session?.user?.name?.split(" ")[0]
  const nextBooking = confirmedBookings[0]
  const isFiltering = Boolean(searchParams.title || searchParams.service)

  return (
    <>
      <Header />

      <div className="container pb-10 pt-6 lg:pt-10">
        {/* ---------------------------------------------------------------- */}
        {/* TÍTULO                                                            */}
        {/* ---------------------------------------------------------------- */}
        <header className="max-w-xl">
          {firstName && (
            <p className="text-sm text-muted-foreground">Olá, {firstName}</p>
          )}
          <h1 className="mt-0.5 font-display text-[26px] font-extrabold leading-tight tracking-tight sm:text-4xl">
            Encontre sua barbearia
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
            Escolha pelo serviço, pela nota ou pelo bairro. O horário livre você
            vê na hora.
          </p>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* BUSCA                                                             */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-5 max-w-xl">
          <Search defaultValue={searchParams.title} action="/" />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* FILTROS E ORDENAÇÃO                                               */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-6">
          <Suspense fallback={<div className="h-24" />}>
            <BarbershopFilters basePath="/" />
          </Suspense>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* PRÓXIMO HORÁRIO DO CLIENTE                                        */}
        {/* ---------------------------------------------------------------- */}
        {session?.user && !isFiltering && (
          <section className="mt-8">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Seu próximo horário
            </h2>

            {nextBooking ? (
              <div className="max-w-md">
                <BookingItem booking={nextBooking} />
              </div>
            ) : (
              <div className="surface flex flex-wrap items-center justify-between gap-3 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Você ainda não tem horários marcados.
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="#barbearias">
                    <CalendarPlus size={15} />
                    Encontrar uma barbearia
                  </Link>
                </Button>
              </div>
            )}
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* BANNER — só fora de busca, para não afastar o usuário do resultado */}
        {/* ---------------------------------------------------------------- */}
        {!isFiltering && (
          <div className="mt-8">
            <HomeBanner />
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* GRADE                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section id="barbearias" className="mt-8 scroll-mt-20">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
              {isFiltering ? "Resultados" : "Barbearias em destaque"}
            </h2>
            <p className="text-xs text-muted-foreground" role="status">
              {barbershops.length}{" "}
              {barbershops.length === 1 ? "encontrada" : "encontradas"}
            </p>
          </div>

          {barbershops.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:gap-4 2xl:grid-cols-5">
              {barbershops.map((barbershop, index) => (
                <BarbershopItem
                  key={barbershop.id}
                  barbershop={barbershop}
                  priority={index < 4}
                />
              ))}
            </div>
          ) : (
            <div className="surface flex flex-col items-center rounded-lg px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground">
                <SearchX size={22} />
              </span>
              <h3 className="mt-4 font-display font-bold">
                Nenhuma barbearia encontrada
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {isFiltering
                  ? "Tente outro termo ou remova os filtros."
                  : "Assim que uma barbearia publicar o cadastro, ela aparece aqui."}
              </p>
              {isFiltering && (
                <Button variant="outline" size="sm" className="mt-5" asChild>
                  <Link href="/">Limpar filtros</Link>
                </Button>
              )}
            </div>
          )}
        </section>
      </div>

    </>
  )
}

export default Home
