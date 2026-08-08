"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import BarbershopLogo from "@/app/_components/brand/barbershop-logo"
import { updateBarbershopProfile } from "@/app/_actions/dashboard/barbershop-profile"

/** Símbolos disponíveis para a marca, iguais aos do componente de logo. */
const LOGO_OPTIONS = [
  { key: "blackwood", label: "Losango" },
  { key: "ferrolima", label: "Lâminas" },
  { key: "distritonorte", label: "Bússola" },
  { key: "studionove", label: "Nove" },
  { key: "nobre", label: "Coroa" },
  { key: "lamina", label: "Navalha" },
  { key: "pracaonze", label: "Colunas" },
  { key: "meridiano", label: "Meridiano" },
  { key: "casabravo", label: "Casa" },
  { key: "ambar", label: "Ampulheta" },
]

const COLOR_OPTIONS = [
  "#C9A227",
  "#B87333",
  "#D8DCE2",
  "#2F6F4E",
  "#93A7B4",
  "#C1554A",
  "#3B84A6",
  "#A6414D",
  "#D98F2B",
]

export interface ProfileFormData {
  id: string
  name: string
  slogan: string
  description: string
  address: string
  city: string
  phones: string[]
  imageUrl: string
  logoKey: string
  accentColor: string
}

const ProfileForm = ({ barbershop }: { barbershop: ProfileFormData }) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [form, setForm] = useState({
    name: barbershop.name,
    slogan: barbershop.slogan,
    description: barbershop.description,
    address: barbershop.address,
    city: barbershop.city,
    imageUrl: barbershop.imageUrl,
    logoKey: barbershop.logoKey,
    accentColor: barbershop.accentColor,
  })
  const [phones, setPhones] = useState<string[]>(
    barbershop.phones.length > 0 ? barbershop.phones : [""],
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    startTransition(async () => {
      try {
        await updateBarbershopProfile(barbershop.id, {
          ...form,
          phones: phones.map((p) => p.trim()).filter(Boolean),
        })
        toast.success("Dados da barbearia salvos.")
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Não foi possível salvar.",
        )
      }
    })
  }

  const inputClass =
    "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <form onSubmit={handleSubmit} className="surface rounded-lg p-5">
      <h2 className="font-display font-bold">Dados da barbearia</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        É o que o cliente vê na busca e na página da sua barbearia.
      </p>

      <div className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Nome</Label>
            <Input
              id="p-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-slogan">Slogan</Label>
            <Input
              id="p-slogan"
              maxLength={80}
              value={form.slogan}
              onChange={(e) => setForm({ ...form, slogan: e.target.value })}
              placeholder="Seu corte, do seu jeito."
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-description">Descrição</Label>
          <textarea
            id="p-description"
            rows={4}
            required
            maxLength={600}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Conte como é a sua barbearia, o que faz bem e o tipo de atendimento."
            className={inputClass}
          />
          <p className="text-xs text-muted-foreground">
            {form.description.length}/600
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-address">Endereço</Label>
            <Input
              id="p-address"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Rua Exemplo, 123 — Centro"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-city">Cidade e estado</Label>
            <Input
              id="p-city"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="São Paulo, SP"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Telefones</Label>
          {phones.map((phone, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={phone}
                onChange={(e) => {
                  const next = [...phones]
                  next[index] = e.target.value
                  setPhones(next)
                }}
                placeholder="(11) 99999-0000"
                aria-label={`Telefone ${index + 1}`}
              />
              {phones.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover telefone ${index + 1}`}
                  onClick={() => setPhones(phones.filter((_, i) => i !== index))}
                >
                  <Trash2 size={15} />
                </Button>
              )}
            </div>
          ))}
          {phones.length < 3 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPhones([...phones, ""])}
            >
              <Plus size={14} />
              Adicionar telefone
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-image">Foto da barbearia (URL)</Label>
          <Input
            id="p-image"
            required
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://utfs.io/f/..."
          />
          <p className="text-xs text-muted-foreground">
            Precisa estar em utfs.io — os demais domínios são bloqueados pelo
            otimizador de imagens.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Símbolo da marca</Label>
            <div className="flex flex-wrap gap-2">
              {LOGO_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={form.logoKey === option.key}
                  aria-label={option.label}
                  onClick={() => setForm({ ...form, logoKey: option.key })}
                  className={
                    form.logoKey === option.key
                      ? "flex h-11 w-11 items-center justify-center rounded-md border border-primary bg-primary/10"
                      : "flex h-11 w-11 items-center justify-center rounded-md border border-white/10 hover:border-primary/40"
                  }
                >
                  <BarbershopLogo
                    logoKey={option.key}
                    accentColor={form.accentColor}
                    className="h-6 w-6"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor da marca</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-pressed={form.accentColor === color}
                  aria-label={`Cor ${color}`}
                  onClick={() => setForm({ ...form, accentColor: color })}
                  className={
                    form.accentColor === color
                      ? "h-9 w-9 rounded-md ring-2 ring-white ring-offset-2 ring-offset-background"
                      : "h-9 w-9 rounded-md"
                  }
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-white/[0.06] pt-5">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Salvar dados
        </Button>
      </div>
    </form>
  )
}

export default ProfileForm
