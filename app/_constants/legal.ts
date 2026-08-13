/**
 * Identificação de quem responde pelo BarberFlow.
 *
 * Vive num arquivo só porque é o que precisa ser preenchido antes de o site
 * receber cliente de verdade — e porque termos e política precisam dizer
 * exatamente a mesma coisa. Documento legal com duas versões do mesmo nome é
 * documento que não vale.
 *
 * Enquanto os campos estiverem com o texto entre «», eles aparecem assim nas
 * páginas públicas. É proposital: placeholder visível cobra o preenchimento,
 * dado inventado passa despercebido e vira problema.
 */
export const LEGAL = {
  /** Nome completo ou razão social de quem opera a plataforma. */
  operator: "«preencher: seu nome completo ou razão social»",

  /** CPF ou CNPJ do operador. */
  document: "«preencher: CPF ou CNPJ»",

  /** Endereço para exercer direitos da LGPD e falar sobre os termos. */
  contactEmail: "«preencher: e-mail de contato»",

  /** Cidade e estado do foro eleito. */
  city: "«preencher: cidade, UF»",

  /** Data da última revisão dos dois documentos. */
  updatedAt: "13 de agosto de 2026",
} as const
