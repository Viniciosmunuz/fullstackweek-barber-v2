"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { quickSearchOptions, sortOptions } from "../_constants/search"
import { cn } from "@/app/_lib/utils"

/**
 * Filtro de serviço + ordenação.
 *
 * Os controles são links que reescrevem a query string, não estado local: assim
 * a busca é compartilhável por URL, sobrevive ao voltar do navegador e continua
 * funcionando sem JavaScript.
 */
const BarbershopFilters = () => {
  const pathname = usePathname()
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
    return qs ? `${pathname}?${qs}` : pathname
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Serviço
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
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <Icon size={15} />
                {title}
                {active && <X size={13} aria-hidden="true" />}
              </Link>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                  "shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
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
