/**
 * Envio de e-mail transacional.
 *
 * Fala com a API HTTP do Resend via `fetch`, sem SDK: uma dependência a menos
 * para manter e nada que precise de instalação.
 *
 * O envio é opcional por decisão de projeto. Sem `RESEND_API_KEY` o cadastro de
 * parceiras continua funcionando normalmente e a interface oferece o texto do
 * convite para envio manual — é melhor do que quebrar o fluxo de quem ainda não
 * configurou um provedor.
 */

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text: string
}

export type EmailResult =
  | { status: "sent" }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string }

function getConfig() {
  const apiKey = process.env["RESEND_API_KEY"]
  // Enquanto não houver domínio verificado, o Resend só entrega a partir deste
  // remetente — e apenas para o e-mail dono da conta.
  const from = process.env["EMAIL_FROM"] ?? "BarberFlow <onboarding@resend.dev>"

  return { apiKey, from }
}

export function isEmailConfigured() {
  return Boolean(getConfig().apiKey)
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<EmailResult> {
  const { apiKey, from } = getConfig()

  if (!apiKey) {
    return { status: "skipped", reason: "RESEND_API_KEY não configurada" }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    })

    if (!response.ok) {
      const detail = await response.text()
      return { status: "failed", reason: detail.slice(0, 300) }
    }

    return { status: "sent" }
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "erro desconhecido",
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Convite de gestor                                                          */
/* -------------------------------------------------------------------------- */

interface InviteContent {
  barbershopName: string
  email: string
  dashboardUrl: string
}

/**
 * Texto do convite.
 *
 * Vive aqui — e não dentro do envio — para que a interface possa mostrar
 * exatamente a mesma mensagem quando o administrador for repassá-la à mão.
 */
export function buildInviteMessage({
  barbershopName,
  email,
  dashboardUrl,
}: InviteContent) {
  const subject = `Seu acesso ao painel da ${barbershopName}`

  const text = [
    `Olá!`,
    ``,
    `Você foi liberado para administrar a ${barbershopName} no BarberFlow.`,
    ``,
    `Como entrar:`,
    `1. Acesse ${dashboardUrl}`,
    `2. Entre com a conta Google do e-mail ${email}`,
    `3. Complete o cadastro da barbearia e publique`,
    ``,
    `Importante: use exatamente esse e-mail para entrar, senão o acesso não será reconhecido.`,
  ].join("\n")

  const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#0B0B0F;color:#F5F5F5;padding:32px">
      <div style="max-width:520px;margin:0 auto;background:#15151C;border-radius:14px;padding:32px">
        <p style="font-size:20px;font-weight:700;margin:0 0 4px">
          Barber<span style="color:#C9A227;font-weight:300">Flow</span>
        </p>
        <h1 style="font-size:19px;margin:24px 0 8px">
          Seu acesso ao painel da ${barbershopName}
        </h1>
        <p style="color:#8E8E99;line-height:1.6;margin:0 0 24px">
          Você foi liberado para administrar a <strong style="color:#F5F5F5">${barbershopName}</strong>.
          Entre com a conta Google de <strong style="color:#F5F5F5">${email}</strong> para
          completar o cadastro e começar a receber agendamentos.
        </p>
        <a href="${dashboardUrl}"
           style="display:inline-block;background:#C9A227;color:#0B0B0F;text-decoration:none;font-weight:700;padding:13px 26px;border-radius:10px">
          Acessar o painel
        </a>
        <p style="color:#8E8E99;font-size:13px;line-height:1.6;margin:26px 0 0">
          Use exatamente esse e-mail para entrar — o acesso está vinculado a ele.
        </p>
      </div>
    </div>
  `

  return { subject, text, html }
}
