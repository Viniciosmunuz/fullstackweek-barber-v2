/**
 * Tipos compartilhados entre a ação de cobrança e a interface.
 *
 * Ficam fora dos arquivos `"use server"` de propósito: lá, todo export precisa
 * ser função assíncrona, porque cada um vira um endpoint. Interfaces somem na
 * compilação e provavelmente passariam, mas depender disso é apostar num
 * detalhe do compilador.
 */
export interface DepositResult {
  bookingId: string
  /** Copia e cola do PIX. */
  pixPayload: string | null
  /** Imagem do QR em base64, como o provedor devolve. */
  qrCodeBase64: string | null
  /** Valor do sinal, em reais. */
  amount: number
  expiresAt: Date
}
