import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { sendEmail, type EmailResult } from "./email"

/**
 * Avisos para o cliente.
 *
 * Até aqui só a barbearia era avisada, pelo sino do painel. Quem marca não
 * recebia nada — nem a confirmação, nem um lembrete. E lembrete é o que faz o
 * cliente aparecer: falta sem aviso é justamente o problema que o sinal existe
 * para resolver, e cobrar sinal sem lembrar do horário ataca o sintoma.
 *
 * O canal é e-mail porque é o que existe no projeto hoje e funciona sem abrir
 * conta nova. A forma dos avisos não depende disso: `ClientNotice` descreve o
 * que precisa ser dito, e quem entrega está separado — quando entrar WhatsApp,
 * ele é mais um destino aqui dentro, não uma reescrita de quem chama.
 *
 * Como o convite, o envio é um extra: falhar não pode derrubar o agendamento
 * que já aconteceu, nem o pagamento que já entrou.
 */

export type NoticeKind = "CONFIRMED" | "REMINDER" | "CANCELLED"

export interface ClientNotice {
  kind: NoticeKind
  /** Sem e-mail não há como avisar; o agendamento segue valendo. */
  email: string | null
  clientName: string
  barbershopName: string
  serviceName: string
  barberName: string | null
  date: Date
  /** Endereço da casa, útil justamente no lembrete. */
  address?: string | null
}

interface Copy {
  subject: string
  lead: string
  tail: string
}

function copyFor(notice: ClientNotice, quando: string): Copy {
  const casa = notice.barbershopName

  if (notice.kind === "REMINDER") {
    return {
      subject: `Lembrete: ${notice.serviceName} amanhã, ${quando}`,
      lead: `Passando para lembrar do seu horário na ${casa}.`,
      tail: "Se não puder ir, cancele pelo site para liberar o horário de quem está esperando.",
    }
  }

  if (notice.kind === "CANCELLED") {
    return {
      subject: `Agendamento cancelado — ${casa}`,
      lead: `Seu horário na ${casa} foi cancelado.`,
      tail: "Você pode escolher outro horário quando quiser.",
    }
  }

  return {
    subject: `Agendamento confirmado — ${casa}`,
    lead: `Seu horário na ${casa} está reservado.`,
    tail: "Chegue com alguns minutos de folga. Precisando desmarcar, dá para fazer pelo site.",
  }
}

/** Uma linha por informação, porque é assim que se confere um compromisso. */
function details(notice: ClientNotice, quando: string): string[] {
  const linhas = [`Serviço: ${notice.serviceName}`, `Quando: ${quando}`]

  if (notice.barberName) linhas.push(`Profissional: ${notice.barberName}`)
  if (notice.address) linhas.push(`Onde: ${notice.address}`)

  return linhas
}

export function buildClientNotice(notice: ClientNotice) {
  const quando = format(notice.date, "EEEE, dd/MM 'às' HH:mm", { locale: ptBR })
  const { subject, lead, tail } = copyFor(notice, quando)
  const linhas = details(notice, quando)

  const text = [
    `Olá, ${notice.clientName}!`,
    ``,
    lead,
    ``,
    ...linhas,
    ``,
    tail,
  ].join("\n")

  const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#0E0D12;color:#F5F5F5;padding:32px">
      <div style="max-width:520px;margin:0 auto;background:#18161D;border-radius:14px;padding:32px">
        <p style="font-size:20px;font-weight:700;margin:0 0 4px">
          Barber<span style="color:#834CF1;font-weight:300">Flow</span>
        </p>
        <h1 style="font-size:19px;margin:24px 0 8px">${subject}</h1>
        <p style="color:#908E9B;line-height:1.6;margin:0 0 20px">
          Olá, ${notice.clientName}! ${lead}
        </p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
          ${linhas
            .map((linha) => {
              const [rotulo, ...resto] = linha.split(": ")
              return `<tr>
                <td style="padding:6px 0;color:#908E9B;white-space:nowrap">${rotulo}</td>
                <td style="padding:6px 0;text-align:right;color:#F5F5F5;font-weight:600">${resto.join(": ")}</td>
              </tr>`
            })
            .join("")}
        </table>
        <p style="color:#908E9B;font-size:13px;line-height:1.6;margin:0">${tail}</p>
      </div>
    </div>
  `

  return { subject, text, html }
}

export async function notifyClient(
  notice: ClientNotice,
): Promise<EmailResult | null> {
  if (!notice.email) return null

  try {
    const { subject, text, html } = buildClientNotice(notice)

    return await sendEmail({ to: notice.email, subject, html, text })
  } catch (error) {
    console.error("Falha ao avisar o cliente:", error)
    return null
  }
}
