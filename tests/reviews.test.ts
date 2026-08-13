import { describe, expect, it } from "vitest"

import { isValidRating, summarizeRatings } from "../app/_lib/reviews"

/**
 * A nota de uma barbearia.
 *
 * Não é enfeite: ela ordena o catálogo, tanto em "Mais avaliadas" quanto no
 * cálculo de relevância. Um erro aqui muda quem aparece primeiro para o
 * cliente — e a casa prejudicada não tem como saber por quê.
 */

describe("summarizeRatings", () => {
  it("tira a média das notas", () => {
    expect(summarizeRatings([5, 4, 3])).toEqual({ average: 4, count: 3 })
  })

  it("arredonda para uma casa, que é como a nota é lida", () => {
    // 4,666... vira 4,7. Guardar mais precisão só criaria diferença entre o
    // valor gravado e o exibido.
    expect(summarizeRatings([5, 5, 4]).average).toBe(4.7)
    expect(summarizeRatings([5, 4, 4]).average).toBe(4.3)
  })

  it("sem avaliação devolve zero, e não uma nota neutra", () => {
    // Era o defeito antigo: toda barbearia nascia com 5,0. Zero é o que
    // permite a tela dizer "ainda não avaliada" em vez de inventar.
    expect(summarizeRatings([])).toEqual({ average: 0, count: 0 })
  })

  it("uma avaliação só já vale", () => {
    expect(summarizeRatings([3])).toEqual({ average: 3, count: 1 })
  })

  it("ignora nota fora da faixa em vez de contaminar a média", () => {
    expect(summarizeRatings([5, 0, 9, 4])).toEqual({ average: 4.5, count: 2 })
  })

  it("ignora valor que não é número", () => {
    expect(summarizeRatings([5, NaN, Infinity])).toEqual({
      average: 5,
      count: 1,
    })
  })

  it("todas inválidas equivale a nenhuma", () => {
    expect(summarizeRatings([0, 7, -2])).toEqual({ average: 0, count: 0 })
  })

  it("a média não depende da ordem", () => {
    expect(summarizeRatings([1, 5, 3])).toEqual(summarizeRatings([3, 1, 5]))
  })
})

describe("isValidRating", () => {
  it("aceita de 1 a 5", () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      expect(isValidRating(rating)).toBe(true)
    }
  })

  it("recusa fora da faixa", () => {
    expect(isValidRating(0)).toBe(false)
    expect(isValidRating(6)).toBe(false)
    expect(isValidRating(-1)).toBe(false)
  })

  it("recusa meia estrela", () => {
    // A interface oferece cinco estrelas inteiras; aceitar 4,5 aqui criaria
    // um valor que nenhuma tela sabe desenhar.
    expect(isValidRating(4.5)).toBe(false)
  })
})
