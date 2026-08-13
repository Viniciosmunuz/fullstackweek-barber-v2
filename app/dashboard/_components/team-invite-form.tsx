"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { inviteTeamMember } from "@/app/_actions/dashboard/team"
import { messageFrom, unwrap } from "@/app/_lib/action-result"

/**
 * Libera um e-mail para o painel.
 *
 * O padrão do seletor é Equipe, não Dono: contratar barbeiro é o caso comum, e
 * promover alguém a responsável pela casa deve ser uma escolha deliberada.
 */
const TeamInviteForm = ({ barbershopId }: { barbershopId: string }) => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"OWNER" | "STAFF">("STAFF")
  const [pending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    startTransition(async () => {
      try {
        const result = await unwrap(
          inviteTeamMember({ barbershopId, email, role }),
        )

        // O acesso já está liberado mesmo quando o e-mail não sai. Dizer isso
        // evita que o dono ache que precisa convidar de novo.
        if (result.email.status === "sent") {
          toast.success(`Acesso liberado. Convite enviado para ${email}.`)
        } else if (result.email.status === "skipped") {
          toast.info(
            "Acesso liberado. O envio de e-mail não está configurado — copie o convite na linha.",
          )
        } else {
          toast.warning(
            `Acesso liberado, mas o e-mail não saiu: ${result.email.reason}`,
          )
        }

        setEmail("")
        setRole("STAFF")
        router.refresh()
      } catch (error) {
        toast.error(messageFrom(error, "Não foi possível liberar o acesso."))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="team-email">
        E-mail para liberar
      </label>
      <Input
        id="team-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="email@gmail.com"
        className="h-9 w-full sm:w-64"
      />

      <label className="sr-only" htmlFor="team-role">
        Papel
      </label>
      <select
        id="team-role"
        value={role}
        onChange={(event) => setRole(event.target.value as "OWNER" | "STAFF")}
        className="h-9 rounded-md border border-white/10 bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="STAFF" className="bg-card">
          Equipe
        </option>
        <option value="OWNER" className="bg-card">
          Dono
        </option>
      </select>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <UserPlus size={14} />
        )}
        Liberar acesso
      </Button>
    </form>
  )
}

export default TeamInviteForm
