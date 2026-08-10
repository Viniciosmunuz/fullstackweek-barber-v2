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

/**
 * Critérios de ordenação da vitrine.
 *
 * "Por localidade" ocupa o lugar do "Mais próximas" do desenho original: sem
 * coordenadas nem permissão de GPS, não há como medir distância, e um rótulo de
 * proximidade prometeria uma ordem que o app não calcula. Agrupar por cidade e
 * bairro entrega o mesmo uso prático — ver junto o que fica na mesma região.
 */
export const sortOptions = [
  { value: "relevance", label: "Mais relevantes" },
  { value: "rating", label: "Mais avaliadas" },
  { value: "popular", label: "Mais populares" },
  { value: "nearby", label: "Por localidade" },
  { value: "price", label: "Menor preço" },
] as const

export type SortValue = (typeof sortOptions)[number]["value"]
