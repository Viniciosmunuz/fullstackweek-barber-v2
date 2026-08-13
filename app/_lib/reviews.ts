/**
 * A conta da nota de uma barbearia.
 *
 * Módulo puro: recebe as notas e devolve o resumo. Fica separado porque esse
 * número aparece em três lugares que precisam concordar — o card do catálogo,
 * a página da barbearia e a ordenação da busca — e porque é ele que decide a
 * posição de uma casa na vitrine.
 */

export const MIN_RATING = 1
export const MAX_RATING = 5

/**
 * Quantas avaliações uma barbearia precisa juntar antes de a nota virar número
 * na tela.
 *
 * Com uma avaliação só, a nota não é uma medida — é a opinião de uma pessoa
 * exibida com a autoridade de uma média. Um cliente irritado num dia ruim
 * afunda a casa para 1,0; um amigo do dono a coloca em 5,0 e no topo da busca.
 * Nos dois casos quem chega depois decide com base em nada.
 *
 * Três é o menor número em que a média já não é refém de um voto isolado.
 * Abaixo disso a tela mostra quantas avaliações existem, sem inventar uma nota
 * — e as avaliações em si continuam visíveis na página, para quem quiser ler.
 */
export const MIN_REVIEWS_TO_RATE = 3

/**
 * A nota que pode ser exibida, ou `null` quando ainda não há base para ela.
 *
 * Existe para que card, página e ordenação façam a mesma pergunta em um lugar
 * só. Espalhar `count >= 3` pelas telas era garantir que uma delas acabasse
 * ficando para trás numa mudança futura.
 */
export function publicRating(
  rating: number,
  reviewCount: number,
): number | null {
  return reviewCount >= MIN_REVIEWS_TO_RATE ? rating : null
}

export interface RatingSummary {
  /** Média com uma casa decimal. Zero quando ainda não há avaliação. */
  average: number
  count: number
}

/**
 * Resume as notas.
 *
 * Sem avaliação nenhuma o resultado é zero, e **não** um valor neutro como 5 ou
 * 3: a tela precisa conseguir dizer "ainda não avaliada" em vez de inventar uma
 * nota. Era exatamente o defeito antigo, em que toda barbearia nascia com 5,0.
 *
 * Uma casa decimal porque é assim que a nota é lida ("4,8") — guardar mais
 * precisão só criaria diferença entre o valor gravado e o exibido.
 */
export function summarizeRatings(ratings: number[]): RatingSummary {
  const valid = ratings.filter(
    (rating) =>
      Number.isFinite(rating) && rating >= MIN_RATING && rating <= MAX_RATING,
  )

  if (valid.length === 0) return { average: 0, count: 0 }

  const total = valid.reduce((sum, rating) => sum + rating, 0)

  return {
    average: Math.round((total / valid.length) * 10) / 10,
    count: valid.length,
  }
}

/** Nota aceita: inteiro de 1 a 5. */
export function isValidRating(rating: number): boolean {
  return (
    Number.isInteger(rating) && rating >= MIN_RATING && rating <= MAX_RATING
  )
}
