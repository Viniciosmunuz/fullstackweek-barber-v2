import { toast } from "sonner"
import type { EmailResult } from "./email"

/**
 * Conta o que aconteceu com o convite — o acesso e o e-mail, que são coisas
 * diferentes.
 *
 * O acesso é liberado no banco e vale mesmo que o e-mail não saia. Mas dizer só
 * "liberado" esconde a metade que falhou: quem lê acha que a pessoa foi
 * avisada, não avisa por outro canal, e o convidado nunca aparece.
 *
 * Existe como função, e não copiada em cada formulário, porque foi exatamente
 * assim que o defeito surgiu: quatro telas repetiam a mesma sequência de três
 * casos à mão, e uma delas — o "Liberar outro e-mail" — ficou sem nenhum.
 */
export function reportInvite(result: EmailResult, done: string) {
  if (result.status === "sent") {
    toast.success(`${done} Convite enviado por e-mail.`)
    return
  }

  if (result.status === "skipped") {
    toast.info(done, {
      description: "Envio de e-mail não configurado — copie o convite.",
    })
    return
  }

  toast.warning(done, {
    description: `O e-mail não saiu: ${result.reason}. Copie o convite.`,
  })
}
