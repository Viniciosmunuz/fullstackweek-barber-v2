"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, Trash2, UserPlus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import {
  deletePartner,
  invitePartnerManager,
  revokePartnerAccess,
  setPartnerPublished,
} from "@/app/_actions/platform/partners"

/*
 * Cada componente é um export nomeado próprio.
 *
 * Anexá-los como propriedades de outro componente (PartnerRow.InviteButton)
 * quebra em produção: a fronteira Server/Client só transporta os exports do
 * módulo, e propriedades penduradas na função não chegam do outro lado.
 */

function useAction() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<unknown>, success: string) =>
    startTransition(async () => {
      try {
        await fn()
        toast.success(success)
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Não foi possível concluir.",
        )
      }
    })

  return { pending, run }
}

interface PartnerActionsProps {
  barbershopId: string
  name: string
  isPublished: boolean
}

/** Ações da barbearia: abrir o painel, publicar/despublicar e excluir. */
export const PartnerActions = ({
  barbershopId,
  name,
  isPublished,
}: PartnerActionsProps) => {
  const { pending, run } = useAction()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={
          isPublished
            ? "rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success"
            : "rounded-full bg-warning/15 px-2.5 py-1 text-[11px] font-semibold text-warning"
        }
      >
        {isPublished ? "No catálogo" : "Rascunho"}
      </span>

      <Button variant="ghost" size="sm" asChild>
        <Link href={`/dashboard?shop=${barbershopId}`}>Abrir painel</Link>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() =>
          run(
            () => setPartnerPublished(barbershopId, !isPublished),
            isPublished ? "Removida do catálogo." : "Publicada no catálogo.",
          )
        }
      >
        {isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
        {isPublished ? "Despublicar" : "Publicar"}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() =>
          run(() => deletePartner(barbershopId), `${name} removida.`)
        }
      >
        <Trash2 size={14} />
        Excluir
      </Button>
    </div>
  )
}

/** Libera mais um e-mail para a mesma barbearia. */
export const InviteButton = ({
  barbershopId,
  name,
}: {
  barbershopId: string
  name: string
}) => {
  const { pending, run } = useAction()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"OWNER" | "STAFF">("STAFF")

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <UserPlus size={14} />
        Liberar outro e-mail
      </Button>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        run(
          () => invitePartnerManager({ barbershopId, email, role }),
          `${email} liberado para ${name}.`,
        )
        setEmail("")
        setOpen(false)
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <Input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@gmail.com"
        aria-label={`E-mail para liberar em ${name}`}
        className="h-9 w-56"
      />

      <label className="sr-only" htmlFor={`role-${barbershopId}`}>
        Papel
      </label>
      <select
        id={`role-${barbershopId}`}
        value={role}
        onChange={(e) => setRole(e.target.value as "OWNER" | "STAFF")}
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
        {pending && <Loader2 size={14} className="animate-spin" />}
        Liberar
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(false)}
      >
        <X size={14} />
      </Button>
    </form>
  )
}

/** Tira o acesso de um e-mail já liberado. */
export const RevokeButton = ({
  inviteId,
  email,
}: {
  inviteId: string
  email: string
}) => {
  const { pending, run } = useAction()

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-label={`Revogar acesso de ${email}`}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={() =>
        run(() => revokePartnerAccess(inviteId), "Acesso revogado.")
      }
    >
      <X size={14} />
    </Button>
  )
}
