"use client"

import { useState, useTransition } from "react"
import { messageFrom, unwrap } from "@/app/_lib/action-result"
import { useRouter } from "next/navigation"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog"
import {
  createBarber,
  deleteBarber,
  updateBarber,
} from "@/app/_actions/dashboard/barbers"

export interface BarberFormData {
  id: string
  name: string
  specialty: string
  bio: string
  active: boolean
}

interface BarberFormProps {
  barbershopId: string
  /** Ausente = criação. Presente = edição do profissional. */
  barber?: BarberFormData
}

const BarberForm = ({ barbershopId, barber }: BarberFormProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const isEdit = Boolean(barber)

  const [form, setForm] = useState({
    name: barber?.name ?? "",
    specialty: barber?.specialty ?? "",
    bio: barber?.bio ?? "",
    active: barber?.active ?? true,
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    startTransition(async () => {
      try {
        if (barber) {
          await unwrap(updateBarber(barber.id, form))
          toast.success("Profissional atualizado.")
        } else {
          await unwrap(createBarber(barbershopId, form))
          toast.success("Profissional adicionado.")
          setForm({ name: "", specialty: "", bio: "", active: true })
        }
        setOpen(false)
        router.refresh()
      } catch (error) {
        toast.error(messageFrom(error, "Não foi possível salvar."))
      }
    })
  }

  const handleDelete = () => {
    if (!barber) return

    startTransition(async () => {
      try {
        await unwrap(deleteBarber(barber.id))
        toast.success("Profissional removido.")
        setOpen(false)
        router.refresh()
      } catch (error) {
        toast.error(messageFrom(error, "Não foi possível remover."))
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Editar ${barber?.name}`}
          >
            <Pencil size={14} />
            Editar
          </Button>
        ) : (
          <Button size="sm">
            <Plus size={16} />
            Novo profissional
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[92%] max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Editar profissional" : "Novo profissional"}
          </DialogTitle>
          <DialogDescription>
            Os dados aparecem na página pública da barbearia e na escolha do
            agendamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="barber-name">Nome</Label>
            <Input
              id="barber-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Caio Marchetti"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="barber-specialty">Especialidade</Label>
            <Input
              id="barber-specialty"
              required
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              placeholder="Degradê e navalha"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="barber-bio">Descrição</Label>
            <textarea
              id="barber-bio"
              rows={3}
              maxLength={280}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Nove anos de cadeira e o fade mais pedido da casa."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              {form.bio.length}/280
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              id="barber-active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 accent-[#834CF1]"
            />
            <Label htmlFor="barber-active" className="cursor-pointer">
              Ativo — aparece na escolha do agendamento
            </Label>
          </div>

          <DialogFooter className="flex-row gap-2 pt-2">
            {isEdit && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                disabled={pending}
                className="mr-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 size={15} />
                Excluir
              </Button>
            )}

            <Button type="submit" disabled={pending}>
              {pending && <Loader2 size={15} className="animate-spin" />}
              {isEdit ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BarberForm
