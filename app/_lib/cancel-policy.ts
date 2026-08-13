/**
 * Prazo de cancelamento.
 *
 * Módulo puro: recebe a data do atendimento, o prazo da casa e o instante
 * atual, e responde se o cliente ainda pode cancelar sozinho.
 *
 * Fica separado porque a mesma pergunta é feita em dois lugares que não podem
 * discordar — a tela decide se mostra o botão, o servidor decide se aceita o
 * pedido. Se a tela fosse a única a saber a regra, bastaria chamar a ação
 * direto para furá-la; se cada uma tivesse a sua cópia, uma mudança de prazo
 * deixaria o botão prometendo o que o servidor recusa.
 */

/** Teto de 7 dias: acima disso o prazo deixaria de ser regra e viraria trava. */
export const MAX_CANCEL_WINDOW_HOURS = 168

export type CancelCheck =
  | { allowed: true }
  | { allowed: false; hoursRequired: number }

interface CancelParams {
  /** Início do atendimento. */
  date: Date
  /** Antecedência exigida pela barbearia, em horas. Zero é sem prazo. */
  windowHours: number
  now?: Date
}

/**
 * Diz se o cliente pode cancelar este horário.
 *
 * Prazo zero libera sempre, inclusive depois da hora marcada: cancelar um
 * atendimento que já passou é o cliente arrumando a própria lista, não uma
 * decisão que afete a agenda de ninguém.
 */
export function canClientCancel({
  date,
  windowHours,
  now = new Date(),
}: CancelParams): CancelCheck {
  const horas = Math.max(0, Math.trunc(windowHours))

  if (horas === 0) return { allowed: true }

  const limite = date.getTime() - horas * 60 * 60 * 1000

  return now.getTime() <= limite
    ? { allowed: true }
    : { allowed: false, hoursRequired: horas }
}

/** "2 horas", "1 dia", "3 dias" — como a regra é dita a quem lê a tela. */
export function describeCancelWindow(windowHours: number): string {
  const horas = Math.max(0, Math.trunc(windowHours))

  if (horas === 0) return "sem prazo"
  if (horas < 24) return `${horas} ${horas === 1 ? "hora" : "horas"}`

  const dias = Math.round(horas / 24)
  return `${dias} ${dias === 1 ? "dia" : "dias"}`
}
