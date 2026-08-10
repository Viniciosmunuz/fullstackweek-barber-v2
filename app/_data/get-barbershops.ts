import { db } from "../_lib/prisma"
import type { BarbershopCardData } from "../_components/barbershop-item"
import type { SortValue } from "../_constants/search"

/**
 * Campos que a vitrine precisa. Usar `select` em vez de trazer a linha inteira
 * mantém o payload do Server Component enxuto e deixa explícito o contrato com
 * o card.
 */
const CARD_SELECT = {
  id: true,
  name: true,
  slogan: true,
  address: true,
  neighborhood: true,
  city: true,
  imageUrl: true,
  logoKey: true,
  accentColor: true,
  rating: true,
  reviewCount: true,
  services: { select: { name: true, price: true } },
} as const

type Row = {
  id: string
  name: string
  slogan: string
  address: string
  neighborhood: string | null
  city: string
  imageUrl: string
  logoKey: string
  accentColor: string
  rating: unknown
  reviewCount: number
  services: { name: string; price: unknown }[]
}

/**
 * `rating` e `price` chegam como Decimal do Prisma, que não atravessa a
 * fronteira Server -> Client Component. Convertemos para número aqui, num único
 * lugar, em vez de espalhar JSON.parse(JSON.stringify(...)) pelas telas.
 */
function toCard(row: Row): BarbershopCardData & { minPrice: number } {
  const prices = row.services.map((s) => Number(s.price))

  return {
    id: row.id,
    name: row.name,
    slogan: row.slogan,
    address: row.address,
    neighborhood: row.neighborhood,
    city: row.city,
    imageUrl: row.imageUrl,
    logoKey: row.logoKey,
    accentColor: row.accentColor,
    rating: Number(row.rating),
    reviewCount: row.reviewCount,
    services: row.services.map((s) => ({ name: s.name })),
    minPrice: prices.length ? Math.min(...prices) : 0,
  }
}

interface SearchParams {
  /** Busca livre por nome da barbearia ou cidade. */
  title?: string
  /** Filtra barbearias que ofereçam um serviço com este nome. */
  service?: string
  sort?: SortValue
}

export async function getBarbershops({
  title,
  service,
  sort = "relevance",
}: SearchParams = {}) {
  const rows = (await db.barbershop.findMany({
    where: {
      // Só o que o dono publicou: casa em cadastro não deve receber cliente.
      isPublished: true,
      AND: [
        title
          ? {
              OR: [
                { name: { contains: title, mode: "insensitive" } },
                { city: { contains: title, mode: "insensitive" } },
                { neighborhood: { contains: title, mode: "insensitive" } },
                { address: { contains: title, mode: "insensitive" } },
              ],
            }
          : {},
        service
          ? {
              services: {
                some: { name: { contains: service, mode: "insensitive" } },
              },
            }
          : {},
      ],
    },
    select: CARD_SELECT,
    // O tipo inferido traz Decimal; a conversão para `Row` (com `unknown` nos
    // campos decimais) é feita em toCard, num ponto só.
  })) as unknown as Row[]

  const cards = rows.map(toCard)

  switch (sort) {
    case "rating":
      return cards.sort((a, b) => Number(b.rating) - Number(a.rating))
    case "popular":
      return cards.sort((a, b) => b.reviewCount - a.reviewCount)
    case "price":
      return cards.sort((a, b) => a.minPrice - b.minPrice)
    case "nearby":
      // Agrupa por região: mesma cidade junta, e dentro dela por bairro.
      return cards.sort(
        (a, b) =>
          a.city.localeCompare(b.city, "pt-BR") ||
          (a.neighborhood ?? "").localeCompare(b.neighborhood ?? "", "pt-BR"),
      )
    default:
      // "Relevantes" combina nota e volume de avaliações para não deixar uma
      // casa com nota 5,0 e 3 avaliações na frente de uma 4,8 com 600.
      return cards.sort(
        (a, b) =>
          Number(b.rating) * Math.log10(b.reviewCount + 10) -
          Number(a.rating) * Math.log10(a.reviewCount + 10),
      )
  }
}

/** Destaques da home: as mais bem avaliadas, com corte de quantidade. */
export async function getFeaturedBarbershops(take = 6) {
  const cards = await getBarbershops({ sort: "relevance" })
  return cards.slice(0, take)
}
