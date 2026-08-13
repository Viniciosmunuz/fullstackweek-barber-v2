import { describe, expect, it } from "vitest"

import {
  PAYMENT_HOLD_MINUTES,
  activeBookingFilter,
  holdDeadline,
} from "../app/_lib/booking-slot"

/**
 * Quais reservas ocupam um horário.
 *
 * As duas consultas de agenda — a que lista horários livres e a que checa
 * conflito na hora de confirmar — precisam concordar. Quando discordam, o
 * cliente vê um horário, escolhe, e leva um erro no rosto. Por isso o filtro
 * mora num lugar só, e por isso ele é testado.
 */

describe("activeBookingFilter", () => {
  const now = new Date("2026-08-11T12:00:00.000Z")

  it("exclui reserva cancelada", () => {
    // Enquanto cancelar apagava a linha, ninguém notava a falta desta regra.
    // Desde que reserva paga passou a ser preservada, sem ela uma reserva
    // cancelada bloquearia o horário para sempre.
    expect(activeBookingFilter(now).status).toEqual({ not: "CANCELLED" })
  })

  it("aceita reserva firme, que não tem prazo", () => {
    const [firme] = activeBookingFilter(now).OR

    expect(firme).toEqual({ expiresAt: null })
  })

  it("aceita reserva ainda dentro do prazo de pagamento", () => {
    const [, segurando] = activeBookingFilter(now).OR

    expect(segurando).toEqual({ expiresAt: { gt: now } })
  })

  it("usa o instante recebido, não o relógio de agora", () => {
    // É o que permite conferir a agenda num ponto do tempo escolhido; sem isso
    // este teste dependeria da hora em que rodasse.
    const outro = new Date("2030-01-01T00:00:00.000Z")
    const [, segurando] = activeBookingFilter(outro).OR

    expect(segurando).toEqual({ expiresAt: { gt: outro } })
  })
})

describe("holdDeadline", () => {
  it("dá quinze minutos para o sinal chegar", () => {
    const inicio = new Date("2026-08-11T12:00:00.000Z")

    expect(holdDeadline(inicio).toISOString()).toBe(
      "2026-08-11T12:15:00.000Z",
    )
  })

  it("acompanha a constante, para prazo e aviso não divergirem", () => {
    const inicio = new Date("2026-08-11T12:00:00.000Z")
    const esperado = inicio.getTime() + PAYMENT_HOLD_MINUTES * 60_000

    expect(holdDeadline(inicio).getTime()).toBe(esperado)
  })
})
