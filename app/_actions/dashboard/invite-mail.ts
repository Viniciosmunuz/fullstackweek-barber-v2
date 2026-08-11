import { headers } from "next/headers"
import { buildInviteMessage, sendEmail, type EmailResult } from "@/app/_lib/email"
import type { ShopRole } from "./guard"

/**
 * URL pública do painel.
 *
 * Sai do cabeçalho da própria requisição para o convite continuar correto em
 * qualquer domínio — produção, preview ou desenvolvimento — sem depender de uma
 * variável a mais.
 */
export function dashboardUrl() {
  const host = headers().get("host") ?? "localhost:3000"
  const protocol = host.startsWith("localhost") ? "http" : "https"
  return `${protocol}://${host}/dashboard`
}

/**
 * Dispara o convite e devolve o que aconteceu, para a interface avisar.
 *
 * Mora fora dos dois lugares que convidam — a administração da plataforma e o
 * dono da barbearia — porque os dois precisam mandar exatamente a mesma coisa.
 * Duas cópias divergiriam na primeira vez que o texto mudasse.
 */
export async function notifyInvite(
  email: string,
  barbershopName: string,
  role: ShopRole,
): Promise<EmailResult> {
  const { subject, html, text } = buildInviteMessage({
    barbershopName,
    email,
    dashboardUrl: dashboardUrl(),
    role,
  })

  return sendEmail({ to: email, subject, html, text })
}
