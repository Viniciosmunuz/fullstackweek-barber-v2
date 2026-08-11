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

/**
 * E-mails com acesso à administração da plataforma: cadastrar barbearias
 * parceiras e liberar quem as administra.
 *
 * Aceita vários endereços separados por vírgula. Vive em variável de ambiente,
 * e não no banco, para que ninguém consiga se promover a administrador pela
 * própria aplicação — mudar essa lista exige acesso à infraestrutura.
 */
export function getPlatformAdminEmails(): string[] {
  const raw = process.env["PLATFORM_ADMIN_EMAILS"] ?? ""

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isPlatformAdminEmail(email?: string | null) {
  if (!email) return false
  return getPlatformAdminEmails().includes(email.trim().toLowerCase())
}
