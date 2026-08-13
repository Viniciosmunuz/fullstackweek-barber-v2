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

/**
 * Recusa que a pessoa deve ler.
 *
 * Separa "não dá para excluir, este barbeiro tem 12 atendimentos" de "a conexão
 * com o banco caiu". A primeira é conteúdo da tela e precisa chegar inteira; a
 * segunda não diz nada a quem está usando e pode revelar detalhe de dentro.
 *
 * Sem essa distinção só existiriam dois caminhos ruins: mascarar tudo, e aí o
 * dono não descobre por que a exclusão falhou, ou expor tudo, e aí um erro de
 * Prisma vai parar na tela com nome de tabela e coluna.
 */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UserFacingError"
  }
}

export function actionError(message: string): { ok: false; message: string } {
  return { ok: false, message }
}

/**
 * Envelopa o corpo de uma ação e decide o que volta para a tela.
 *
 * `UserFacingError` vira mensagem. Qualquer outro erro é relançado de
 * propósito: aí o Next mascara, que é o comportamento certo para o que ninguém
 * previu, e o formulário mostra o texto de reserva de quem chamou.
 */
export async function runAction<T>(
  body: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return actionOk(await body())
  } catch (error) {
    if (error instanceof UserFacingError) return actionError(error.message)
    throw error
  }
}

/**
 * Sem sobrecarga de propósito: a regra base `no-unused-vars` deste projeto não
 * conhece assinatura de sobrecarga e acusa o parâmetro da declaração sem corpo
 * como variável sem uso, derrubando o build. Uma assinatura só, com padrão.
 */
export function actionOk<T = undefined>(data?: T): ActionResult<T> {
  return { ok: true, data: data as T }
}

/**
 * Devolve o resultado, ou lança a recusa para o `catch` do formulário.
 *
 * Do lado do navegador a exceção volta a ser o jeito natural de interromper: o
 * `try/catch` que o formulário já tem trata os dois casos no mesmo lugar, e a
 * mensagem chega inteira porque nada mais atravessa a fronteira.
 *
 * Recebe a promessa, e não o resultado, para o uso ficar
 * `await unwrap(minhaAcao(...))` — uma linha, sem variável intermediária.
 */
export async function unwrap<T>(action: Promise<ActionResult<T>>): Promise<T> {
  const result = await action

  if (!result.ok) throw new UserFacingError(result.message)

  return result.data
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
