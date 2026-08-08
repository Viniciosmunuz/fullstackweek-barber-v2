import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { SearchX } from "lucide-react"
import Header from "../_components/header"
import Search from "../_components/search"
import BarbershopItem from "../_components/barbershop-item"
import BarbershopFilters from "../_components/barbershop-filters"
import { Button } from "../_components/ui/button"
import { getBarbershops } from "../_data/get-barbershops"
import type { SortValue } from "../_constants/search"

export const metadata: Metadata = {
  title: "Encontre sua barbearia",
  description:
    "Busque entre as barbearias parceiras do BarberFlow por serviço, cidade ou avaliação.",
}

interface BarbershopsPageProps {
  searchParams: {
    title?: string
    service?: string
    sort?: SortValue
  }
}

const BarbershopsPage = async ({ searchParams }: BarbershopsPageProps) => {
  const barbershops = await getBarbershops({
    title: searchParams.title,
    service: searchParams.service,
    sort: searchParams.sort,
  })

  const hasQuery = Boolean(searchParams.title || searchParams.service)

  return (
    <>
      <Header />

      <div className="container py-8 lg:py-12">
        <header className="max-w-2xl">
          <h1 className="font-display text-3xl font-extrabold tracking-tight lg:text-4xl">
            Encontre sua barbearia
          </h1>
          <p className="mt-2 text-muted-foreground">
            {hasQuery
              ? `Resultados para ${searchParams.title ?? searchParams.service}.`
              : "Escolha pelo serviço, pela nota ou pelo bairro. O horário livre você vê na hora."}
          </p>
        </header>

        <div className="mt-6 max-w-xl">
          <Search defaultValue={searchParams.title} />
        </div>

        <div className="mt-8">
          {/* useSearchParams exige limite de Suspense em componentes de página. */}
          <Suspense fallback={<div className="h-28" />}>
            <BarbershopFilters />
          </Suspense>
        </div>

        <div className="mt-8">
          <p
            className="mb-4 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {barbershops.length}{" "}
            {barbershops.length === 1
              ? "barbearia encontrada"
              : "barbearias encontradas"}
          </p>

          {barbershops.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {barbershops.map((barbershop) => (
                <BarbershopItem key={barbershop.id} barbershop={barbershop} />
              ))}
            </div>
          ) : (
            <div className="surface flex flex-col items-center rounded-lg px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground">
                <SearchX size={24} />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold">
                Nenhuma barbearia encontrada
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Tente outro termo de busca ou remova os filtros para ver o
                catálogo completo.
              </p>
              <Button variant="outline" className="mt-6" asChild>
                <Link href="/barbershops">Limpar filtros</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default BarbershopsPage
