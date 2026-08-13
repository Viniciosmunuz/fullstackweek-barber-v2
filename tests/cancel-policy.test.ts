import { describe, expect, it } from "vitest"

import {
  MAX_CANCEL_WINDOW_HOURS,
  canClientCancel,
  describeCancelWindow,
} from "../app/_lib/cancel-policy"

/**
 * Prazo de cancelamento.
 *
 * A regra decide duas coisas ao mesmo tempo — se a tela mostra o botão e se o
 * servidor aceita o pedido — e as duas precisam responder igual. Um desacordo
 * aqui aparece do pior jeito: o cliente clica em Cancelar e leva um erro, ou
 * pior, a tela esconde o botão e a ação continua aceitando quem chamar direto.
 */

const HORA = 60 * 60 * 1000

/** Meio-dia de um dia qualquer, para as contas não dependerem de "hoje". */
const ATENDIMENTO = new Date("2026-08-20T12:00:00Z")

const horasAntes = (h: number) => new Date(ATENDIMENTO.getTime() - h * HORA)

describe("canClientCancel", () => {
  it("sem prazo, libera sempre", () => {
    expect(
      canClientCancel({
        date: ATENDIMENTO,
        windowHours: 0,
        now: horasAntes(0.01),
      }),
    ).toEqual({ allowed: true })
  })

  it("sem prazo, libera até depois da hora marcada", () => {
    // Cancelar o que já passou é o cliente arrumando a própria lista — não
    // afeta a agenda de ninguém, então não há o que travar.
    expect(
      canClientCancel({
        date: ATENDIMENTO,
        windowHours: 0,
        now: new Date(ATENDIMENTO.getTime() + 5 * HORA),
      }),
    ).toEqual({ allowed: true })
  })

  it("libera com folga maior que o prazo", () => {
    expect(
      canClientCancel({
        date: ATENDIMENTO,
        windowHours: 2,
        now: horasAntes(3),
      }),
    ).toEqual({ allowed: true })
  })

  it("recusa dentro do prazo, e diz quantas horas eram", () => {
    expect(
      canClientCancel({
        date: ATENDIMENTO,
        windowHours: 2,
        now: horasAntes(1),
      }),
    ).toEqual({ allowed: false, hoursRequired: 2 })
  })

  it("no instante exato do limite, ainda libera", () => {
    // A borda cai para o lado do cliente: quem chegou na hora cumpriu a regra.
    expect(
      canClientCancel({
        date: ATENDIMENTO,
        windowHours: 2,
        now: horasAntes(2),
      }),
    ).toEqual({ allowed: true })
  })

  it("um segundo depois do limite, recusa", () => {
    expect(
      canClientCancel({
        date: ATENDIMENTO,
        windowHours: 2,
        now: new Date(ATENDIMENTO.getTime() - 2 * HORA + 1000),
      }),
    ).toEqual({ allowed: false, hoursRequired: 2 })
  })

  it("com prazo, recusa depois da hora marcada", () => {
    expect(
      canClientCancel({
        date: ATENDIMENTO,
        windowHours: 2,
        now: new Date(ATENDIMENTO.getTime() + HORA),
      }),
    ).toEqual({ allowed: false, hoursRequired: 2 })
  })

  it("prazo negativo vale como sem prazo", () => {
    // Não deveria chegar do banco, mas o campo é um inteiro: se chegar, a saída
    // segura é liberar, e não travar o cliente para sempre.
    expect(
      canClientCancel({
        date: ATENDIMENTO,
        windowHours: -5,
        now: horasAntes(0),
      }),
    ).toEqual({ allowed: true })
  })

  it("aceita o prazo máximo", () => {
    expect(
      canClientCancel({
        date: ATENDIMENTO,
        windowHours: MAX_CANCEL_WINDOW_HOURS,
        now: horasAntes(MAX_CANCEL_WINDOW_HOURS + 1),
      }),
    ).toEqual({ allowed: true })
  })
})

describe("describeCancelWindow", () => {
  it("diz sem prazo no zero", () => {
    expect(describeCancelWindow(0)).toBe("sem prazo")
  })

  it("usa horas abaixo de um dia", () => {
    expect(describeCancelWindow(1)).toBe("1 hora")
    expect(describeCancelWindow(2)).toBe("2 horas")
    expect(describeCancelWindow(23)).toBe("23 horas")
  })

  it("vira dias a partir de 24 horas", () => {
    expect(describeCancelWindow(24)).toBe("1 dia")
    expect(describeCancelWindow(48)).toBe("2 dias")
    expect(describeCancelWindow(MAX_CANCEL_WINDOW_HOURS)).toBe("7 dias")
  })
})
