"use client"

import { useState, useTransition } from "react"
import { messageFrom, unwrap } from "@/app/_lib/action-result"
import { reportInvite } from "@/app/_lib/invite-feedback"
import { useRouter } from "next/navigation"
import { Copy, Loader2, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar"
import { Button } from "@/app/_components/ui/button"
import {
  getTeamInviteText,
  resendTeamInvite,
  revokeTeamMember,
  updateTeamRole,
} from "@/app/_actions/dashboard/team"
import type { TeamMember } from "@/app/_data/team"
import { getInitials } from "@/app/_lib/utils"

interface TeamRowProps {
  barbershopId: string
  member: TeamMember
  emailConfigured: boolean
}

/**
 * Uma pessoa com acesso ao painel.
 *
 * A linha mostra o e-mail sempre, mesmo quando já há nome e foto: o e-mail é a
 * identidade que de fato libera a entrada, e é por ele que o dono confere se
 * liberou a pessoa certa.
 */
const TeamRow = ({ barbershopId, member, emailConfigured }: TeamRowProps) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  // O papel vive em estado local para o seletor não voltar sozinho ao valor
  // antigo enquanto o servidor responde. Se a gravação falhar, ele volta.
  const [role, setRole] = useState(member.role)

  const label = member.name ?? member.email
  const accepted = member.acceptedAt !== null

  const run = (fn: () => Promise<unknown>, success: string) =>
    startTransition(async () => {
      try {
        await fn()
        toast.success(success)
        router.refresh()
      } catch (error) {
        toast.error(messageFrom(error, "Não foi possível concluir."))
      }
    })

  const handleRole = (next: "OWNER" | "STAFF") => {
    const previous = role
    setRole(next)

    startTransition(async () => {
      try {
        await unwrap(
          updateTeamRole({
            barbershopId,
            inviteId: member.inviteId,
            role: next,
          }),
        )
        toast.success(
          next === "OWNER"
            ? `${label} agora responde pela barbearia.`
            : `${label} agora é da equipe.`,
        )
        router.refresh()
      } catch (error) {
        setRole(previous)
        toast.error(messageFrom(error, "Não foi possível mudar o papel."))
      }
    })
  }

  const handleResend = () =>
    startTransition(async () => {
      try {
        const result = await unwrap(
          resendTeamInvite(barbershopId, member.inviteId),
        )

        reportInvite(result.email, `Convite de ${member.email} reenviado.`)
      } catch (error) {
        toast.error(messageFrom(error, "Não foi possível reenviar."))
      }
    })

  const handleCopy = () =>
    startTransition(async () => {
      try {
        const text = await unwrap(
          getTeamInviteText(barbershopId, member.inviteId),
        )
        await navigator.clipboard.writeText(text)
        toast.success("Convite copiado. Cole no WhatsApp.")
      } catch {
        toast.error("Não foi possível copiar o convite.")
      }
    })

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 p-4">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={member.image ?? ""} alt="" />
        <AvatarFallback className="text-[11px]">
          {getInitials(label)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-sm font-medium">
          {label}
          {member.isSelf && (
            <span className="shrink-0 rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              você
            </span>
          )}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {member.name ? `${member.email} · ` : ""}
          {accepted ? "Acesso ativo" : "Ainda não entrou"}
        </p>
      </div>

      <label className="sr-only" htmlFor={`role-${member.inviteId}`}>
        Papel de {label}
      </label>
      <select
        id={`role-${member.inviteId}`}
        value={role}
        // Mudar o próprio papel fecharia a porta por dentro, e nem sempre há
        // outro dono para reabrir. O servidor recusa de qualquer forma.
        disabled={pending || member.isSelf}
        onChange={(event) =>
          handleRole(event.target.value as "OWNER" | "STAFF")
        }
        className="h-8 shrink-0 rounded-md border border-white/10 bg-transparent px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <option value="STAFF" className="bg-card">
          Equipe
        </option>
        <option value="OWNER" className="bg-card">
          Dono
        </option>
      </select>

      <span className="flex shrink-0 items-center gap-1">
        {!accepted && emailConfigured && (
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={handleResend}
            aria-label={`Reenviar convite para ${member.email}`}
          >
            <Send size={13} />
          </Button>
        )}

        {!accepted && (
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={handleCopy}
            aria-label={`Copiar convite de ${member.email}`}
          >
            <Copy size={13} />
          </Button>
        )}

        {!member.isSelf &&
          (confirming ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() =>
                  run(
                    () =>
                      unwrap(
                        revokeTeamMember({
                          barbershopId,
                          inviteId: member.inviteId,
                        }),
                      ),
                    `${label} não tem mais acesso.`,
                  )
                }
              >
                {pending && <Loader2 size={13} className="animate-spin" />}
                Confirmar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => setConfirming(false)}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirming(true)}
              aria-label={`Remover o acesso de ${label}`}
            >
              <Trash2 size={13} />
            </Button>
          ))}
      </span>
    </li>
  )
}

export default TeamRow
