"use client"

import { useState, useTransition } from "react"
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
import ImageField from "./image-field"
import { messageFrom } from "@/app/_lib/action-result"
import {
  createService,
  deleteService,
  updateService,
} from "@/app/_actions/dashboard/services"

/** Imagem padrão de serviço novo, do mesmo acervo usado pelo catálogo. */
const FALLBACK_IMAGE =
  "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png"

export interface ServiceFormData {
  id: string
  name: string
  description: string
  price: number
  durationMinutes: number
  imageUrl: string
}

interface ServiceFormProps {
  barbershopId: string
  service?: ServiceFormData
}

const ServiceForm = ({ barbershopId, service }: ServiceFormProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const isEdit = Boolean(service)

  const [form, setForm] = useState({
    name: service?.name ?? "",
    description: service?.description ?? "",
    price: service ? String(service.price) : "",
    durationMinutes: service ? String(service.durationMinutes) : "30",
    imageUrl: service?.imageUrl ?? FALLBACK_IMAGE,
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const payload = {
      name: form.name,
      description: form.description,
      // Aceita vírgula decimal, que é como se digita preço em português.
      price: Number(form.price.replace(",", ".")),
      durationMinutes: Number(form.durationMinutes),
      imageUrl: form.imageUrl,
    }

    startTransition(async () => {
      try {
        const result = service
          ? await updateService(service.id, payload)
          : await createService(barbershopId, payload)

        if (!result.ok) {
          toast.error(result.message)
          return
        }

        if (service) {
          toast.success("Serviço atualizado.")
        } else {
          toast.success("Serviço adicionado.")
          setForm({
            name: "",
            description: "",
            price: "",
            durationMinutes: "30",
            imageUrl: FALLBACK_IMAGE,
          })
        }

        setOpen(false)
        router.refresh()
      } catch (error) {
        toast.error(messageFrom(error, "Não foi possível salvar."))
      }
    })
  }

  const handleDelete = () => {
    if (!service) return

    startTransition(async () => {
      try {
        await deleteService(service.id)
        toast.success("Serviço removido.")
        setOpen(false)
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Não foi possível remover.",
        )
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="sm" aria-label={`Editar ${service?.name}`}>
            <Pencil size={14} />
            Editar
          </Button>
        ) : (
          <Button size="sm">
            <Plus size={16} />
            Novo serviço
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[92%] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Editar serviço" : "Novo serviço"}
          </DialogTitle>
          <DialogDescription>
            A duração define quanto tempo o horário fica bloqueado na agenda do
            profissional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="service-name">Nome</Label>
            <Input
              id="service-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Degradê Navalhado"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-description">Descrição</Label>
            <textarea
              id="service-description"
              rows={3}
              maxLength={280}
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Fade trabalhado na máquina com transição finalizada na navalha."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="service-price">Preço (R$)</Label>
              <Input
                id="service-price"
                required
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="75,00"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="service-duration">Duração (min)</Label>
              <Input
                id="service-duration"
                required
                type="number"
                min={5}
                max={480}
                step={5}
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm({ ...form, durationMinutes: e.target.value })
                }
              />
            </div>
          </div>

          <ImageField
            id="service-image"
            barbershopId={barbershopId}
            label="Imagem do serviço"
            required
            value={form.imageUrl}
            onChange={(imageUrl) => setForm({ ...form, imageUrl })}
            hint="Aparece ao lado do serviço na sua página."
          />

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

export default ServiceForm
