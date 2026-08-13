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

      <div className="container pb-10 pt-6 lg:pt-10">
        <header className="max-w-xl">
          <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-tight sm:text-4xl">
            Encontre sua barbearia
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
            {hasQuery
              ? `Resultados para ${searchParams.title ?? searchParams.service}.`
              : "Escolha pelo serviço, pela nota ou pelo bairro. O horário livre você vê na hora."}
          </p>
        </header>

        <div className="mt-5 max-w-xl">
          <Search defaultValue={searchParams.title} action="/barbershops" />
        </div>

        <div className="mt-6">
          <Suspense fallback={<div className="h-24" />}>
            <BarbershopFilters basePath="/barbershops" />
          </Suspense>
        </div>

        <div className="mt-8">
          <p
            className="mb-3 text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {barbershops.length}{" "}
            {barbershops.length === 1
              ? "barbearia encontrada"
              : "barbearias encontradas"}
          </p>

          {barbershops.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:gap-4 2xl:grid-cols-5">
              {barbershops.map((barbershop) => (
                <BarbershopItem key={barbershop.id} barbershop={barbershop} />
              ))}
            </div>
          ) : (
            <div className="surface flex flex-col items-center rounded-lg px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground">
                <SearchX size={22} />
              </span>
              <h2 className="mt-4 font-display font-bold">
                Nenhuma barbearia encontrada
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {hasQuery
                  ? "Tente outro termo de busca ou remova os filtros."
                  : "Assim que uma barbearia publicar o cadastro, ela aparece aqui."}
              </p>
              {hasQuery && (
                <Button variant="outline" size="sm" className="mt-5" asChild>
                  <Link href="/barbershops">Limpar filtros</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default BarbershopsPage
