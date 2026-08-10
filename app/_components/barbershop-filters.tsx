"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { quickSearchOptions, sortOptions } from "../_constants/search"
import { cn } from "@/app/_lib/utils"

interface BarbershopFiltersProps {
  /** Página que recebe os filtros — "/" na home, "/barbershops" na busca. */
  basePath: string
}

/**
 * Filtro de serviço e ordenação.
 *
 * São links que reescrevem a query string, não estado local: a busca fica
 * compartilhável por URL, sobrevive ao botão voltar e continua funcionando sem
 * JavaScript. No celular as duas faixas rolam na horizontal, com sangria até a
 * borda para o último item não parecer cortado no meio.
 */
const BarbershopFilters = ({ basePath }: BarbershopFiltersProps) => {
  const searchParams = useSearchParams()

  const activeService = searchParams.get("service")
  const activeSort = searchParams.get("sort") ?? "relevance"

  const buildHref = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(patch)) {
      if (value === null) params.delete(key)
      else params.set(key, value)
    }

    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Serviços
        </h2>
        <div className="rail lg:flex-wrap">
          {quickSearchOptions.map(({ icon: Icon, title }) => {
            const active = activeService === title
            return (
              <Link
                key={title}
                href={buildHref({ service: active ? null : title })}
                aria-pressed={active}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <Icon size={14} />
                {title}
                {active && <X size={12} aria-hidden="true" />}
              </Link>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Ordenar por
        </h2>
        <div className="rail lg:flex-wrap">
          {sortOptions.map(({ value, label }) => {
            const active = activeSort === value
            return (
              <Link
                key={value}
                href={buildHref({ sort: value })}
                aria-pressed={active}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-white/[0.09] text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BarbershopFilters
