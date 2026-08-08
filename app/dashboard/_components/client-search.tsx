"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/app/_components/ui/input"
import { cn } from "@/app/_lib/utils"

const SORTS = [
  { value: "spent", label: "Maior valor" },
  { value: "visits", label: "Mais visitas" },
  { value: "recent", label: "Mais recentes" },
] as const

interface ClientSearchProps {
  shop: string
  defaultQuery?: string
  activeSort: string
}

/** Busca e ordenação da lista de clientes, refletidas na URL. */
const ClientSearch = ({ shop, defaultQuery, activeSort }: ClientSearchProps) => {
  const router = useRouter()
  const [query, setQuery] = useState(defaultQuery ?? "")

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams({ shop, sort: activeSort })
    if (query.trim()) params.set("q", query.trim())
    router.push(`/dashboard/clientes?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form onSubmit={handleSubmit} className="relative w-full sm:w-72">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou telefone"
          aria-label="Buscar cliente"
          className="pl-9"
        />
      </form>

      <div className="flex gap-1" role="group" aria-label="Ordenar clientes">
        {SORTS.map((option) => {
          const params = new URLSearchParams({ shop, sort: option.value })
          if (defaultQuery) params.set("q", defaultQuery)

          return (
            <Link
              key={option.value}
              href={`/dashboard/clientes?${params.toString()}`}
              aria-current={activeSort === option.value ? "true" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                activeSort === option.value
                  ? "bg-white/[0.09] text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default ClientSearch
