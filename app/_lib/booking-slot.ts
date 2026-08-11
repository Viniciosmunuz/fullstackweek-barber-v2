/**
 * Quais reservas realmente ocupam um horário.
 *
 * Com o sinal, uma reserva pode existir apenas segurando o lugar enquanto o
 * pagamento não chega: `expiresAt` no futuro. Vencido o prazo sem pagamento, a
 * linha continua no banco — o histórico da tentativa é útil — mas o horário
 * precisa voltar para a lista.
 *
 * O filtro mora aqui, e não copiado nos dois lugares que consultam agenda,
 * porque as duas consultas precisam concordar. Se a lista de horários livres e
 * a checagem de conflito discordarem, o cliente vê um horário, escolhe, e leva
 * um erro no rosto na hora de confirmar.
 */
export function activeBookingFilter(now: Date = new Date()) {
  return {
    OR: [
      // Reserva firme: nunca teve prazo, ou o sinal já foi pago.
      { expiresAt: null },
      // Reserva segurando o horário, ainda dentro do prazo.
      { expiresAt: { gt: now } },
    ],
  }
}

/** Prazo para o sinal chegar antes do horário voltar para a lista. */
export const PAYMENT_HOLD_MINUTES = 15

export function holdDeadline(from: Date = new Date()): Date {
  return new Date(from.getTime() + PAYMENT_HOLD_MINUTES * 60_000)
}
