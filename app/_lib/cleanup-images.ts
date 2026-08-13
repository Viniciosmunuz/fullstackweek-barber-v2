import { db } from "./prisma"
import { UPLOAD_PREFIX } from "./image-source"

/**
 * Apaga imagens que ninguém mais usa.
 *
 * Duas coisas deixam arquivo órfão no banco, e as duas acontecem no uso normal:
 * trocar a logo (a anterior fica sem dono) e enviar um arquivo sem salvar o
 * formulário (nasce órfão). Como as imagens moram no próprio banco, isso é
 * espaço que só cresce.
 *
 * A varredura procura pelo avesso: descobre quais ids ainda aparecem nos
 * cadastros e apaga o resto. Achar "quem não é referenciado" é a pergunta
 * certa, porque a referência é uma string de texto — não há chave estrangeira
 * que o banco possa cobrar.
 */

/** Espera antes de considerar um arquivo abandonado. */
const GRACE_HOURS = 24

/** Teto por execução, para uma varredura não virar uma exclusão enorme. */
const BATCH = 500

/**
 * Extrai os ids de imagem citados numa lista de endereços.
 *
 * Endereço externo (`https://...`) e campo vazio são ignorados: só interessa o
 * que aponta para dentro.
 */
export function referencedImageIds(
  values: (string | null | undefined)[],
): Set<string> {
  const ids = new Set<string>()

  for (const value of values) {
    if (!value?.startsWith(UPLOAD_PREFIX)) continue

    const id = value.slice(UPLOAD_PREFIX.length).split(/[?#/]/)[0]
    if (id) ids.add(id)
  }

  return ids
}

/**
 * Roda a limpeza e devolve quantas imagens saíram.
 *
 * A carência existe pelo segundo caso: entre enviar o arquivo e salvar o
 * formulário, a imagem está sem referência mas prestes a ganhar uma. Apagar
 * nesse intervalo faria o dono salvar e encontrar a foto quebrada.
 *
 * A lista de referências é carregada inteira na memória, o que é adequado à
 * escala de hoje — dezenas de barbearias com poucos serviços cada. Se um dia
 * forem milhares, isto vira uma consulta só, em SQL.
 */
export async function cleanupOrphanImages(
  now: Date = new Date(),
): Promise<number> {
  const cutoff = new Date(now.getTime() - GRACE_HOURS * 60 * 60 * 1000)

  const candidates = await db.imageAsset.findMany({
    where: { createdAt: { lt: cutoff } },
    select: { id: true },
    take: BATCH,
  })

  if (candidates.length === 0) return 0

  const [shops, services] = await Promise.all([
    db.barbershop.findMany({ select: { imageUrl: true, logoUrl: true } }),
    db.barbershopService.findMany({ select: { imageUrl: true } }),
  ])

  const used = referencedImageIds([
    ...shops.flatMap((shop) => [shop.imageUrl, shop.logoUrl]),
    ...services.map((service) => service.imageUrl),
  ])

  const orphans = candidates
    .map((asset) => asset.id)
    .filter((id) => !used.has(id))

  if (orphans.length === 0) return 0

  await db.imageAsset.deleteMany({ where: { id: { in: orphans } } })

  return orphans.length
}
