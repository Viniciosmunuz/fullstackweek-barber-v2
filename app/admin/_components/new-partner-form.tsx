"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { createPartner } from "@/app/_actions/platform/partners"

/**
 * Cadastro de uma nova parceira.
 *
 * Pede o mínimo: nome, cidade e o e-mail de quem vai administrar. O resto da
 * ficha — endereço, contato, fotos, serviços — é preenchido pelo próprio dono,
 * que conhece o negócio melhor do que a plataforma.
 */
const NewPartnerForm = () => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({ name: "", city: "", ownerEmail: "" })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    startTransition(async () => {
      try {
        const result = await createPartner(form)

        // O cadastro já está feito; o e-mail é o extra. A mensagem diz qual dos
        // dois aconteceu para o administrador saber se precisa avisar à mão.
        if (result.email.status === "sent") {
          toast.success(`${form.name} cadastrada. Convite enviado por e-mail.`)
        } else if (result.email.status === "skipped") {
          toast.success(`${form.name} cadastrada.`, {
            description: "Envio de e-mail não configurado — copie o convite.",
          })
        } else {
          toast.warning(`${form.name} cadastrada, mas o e-mail falhou.`, {
            description: "Use o botão de copiar convite.",
          })
        }

        setForm({ name: "", city: "", ownerEmail: "" })
        setOpen(false)
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Não foi possível cadastrar.",
        )
      }
    })
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus size={17} />
        Cadastrar barbearia parceira
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="surface rounded-lg p-5">
      <h2 className="font-display font-bold">Nova barbearia parceira</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        O responsável recebe acesso ao entrar com a conta Google deste e-mail.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="partner-name">Nome da barbearia</Label>
          <Input
            id="partner-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Barbearia do Zé"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="partner-city">Cidade</Label>
          <Input
            id="partner-city"
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="São Paulo, SP"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="partner-email">E-mail do responsável</Label>
          <Input
            id="partner-email"
            required
            type="email"
            inputMode="email"
            value={form.ownerEmail}
            onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
            placeholder="dono@gmail.com"
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Precisa ser o mesmo endereço que ele usa para entrar com o Google.
      </p>

      <div className="mt-5 flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 size={15} className="animate-spin" />}
          Cadastrar e liberar acesso
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
          disabled={pending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export default NewPartnerForm
