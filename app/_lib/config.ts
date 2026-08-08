/**
 * Sinalizadores de ambiente do servidor.
 *
 * A leitura usa notação de colchetes de propósito. O Next.js substitui
 * `process.env.NOME` pelo valor literal durante o build; se a variável não
 * estiver disponível naquele momento — o que acontece com as marcadas como
 * "sensitive" na Vercel — o código sai compilado com `undefined` e nunca mais
 * enxerga o valor, mesmo estando presente em produção. O acesso dinâmico
 * impede essa substituição e força a leitura em tempo de execução.
 */
export function isDemoSelfServiceEnabled() {
  return process.env["DEMO_SELF_SERVICE"] === "true"
}
