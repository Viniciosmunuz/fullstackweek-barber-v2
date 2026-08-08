import { Brush, Crop, Droplet, Eye, Hand, Scissors } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface QuickSearchOption {
  icon: LucideIcon
  title: string
}

/**
 * Categorias da busca rápida. Usam Lucide como o resto da interface, em vez dos
 * SVGs soltos do template original, para manter um único estilo de ícone.
 */
export const quickSearchOptions: QuickSearchOption[] = [
  { icon: Scissors, title: "Corte" },
  { icon: Brush, title: "Barba" },
  { icon: Crop, title: "Acabamento" },
  { icon: Droplet, title: "Hidratação" },
  { icon: Eye, title: "Sobrancelha" },
  { icon: Hand, title: "Massagem" },
]

/** Critérios de ordenação da vitrine de barbearias. */
export const sortOptions = [
  { value: "relevance", label: "Mais relevantes" },
  { value: "rating", label: "Mais avaliadas" },
  { value: "popular", label: "Mais populares" },
  { value: "price", label: "Menor preço" },
] as const

export type SortValue = (typeof sortOptions)[number]["value"]
