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
