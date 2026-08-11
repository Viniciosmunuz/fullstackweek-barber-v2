/**
 * Resultado de uma ação de formulário.
 *
 * Existe por causa de um comportamento do Next em produção: erro **lançado**
 * por server action chega ao navegador com a mensagem trocada por um texto
 * genérico ("An error occurred in the Server Components render…"). É proteção
 * contra vazar detalhe interno, e está certa para falha inesperada — mas
 * apaga junto as mensagens que existem justamente para a pessoa ler, do tipo
 * "informe o endereço de uma imagem".
 *
 * Então recusa prevista é **devolvida**, não lançada. Só o que a gente não
 * previu continua estourando, e aí o texto genérico é apropriado: não há o que
 * dizer ao usuário além de que deu errado.
 */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; message: string }

export function actionError(message: string): { ok: false; message: string } {
  return { ok: false, message }
}

export function actionOk(): ActionResult<undefined>
export function actionOk<T>(data: T): ActionResult<T>
export function actionOk<T>(data?: T) {
  return { ok: true as const, data }
}

/**
 * Mensagem para mostrar quando a ação falhou, seja por recusa prevista ou por
 * erro inesperado. Concentra aqui o `catch` que todo formulário repetia.
 */
export function messageFrom(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    // Em produção o Next substitui a mensagem real por este texto. Mostrá-lo
    // não ajudaria ninguém — o `fallback` de quem chamou diz mais.
    if (error.message.includes("Server Components render")) return fallback
    return error.message
  }

  return fallback
}
