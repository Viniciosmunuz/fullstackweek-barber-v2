"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"
import { Label } from "@/app/_components/ui/label"
import { messageFrom } from "@/app/_lib/action-result"
import { updateCancelWindow } from "@/app/_actions/dashboard/barbershop-profile"

/**
 * Opções em vez de campo livre.
 *
 * Prazo de cancelamento é decisão de minutos, não de digitação: quem abre esta
 * tela quer escolher entre "nenhum" e "um dia", e um campo numérico só abriria
 * espaço para 37 horas — que não significa nada para o cliente que lê.
 */
const OPTIONS = [
  { hours: 0, label: "Sem prazo", hint: "Cancela até em cima da hora" },
  { hours: 2, label: "2 horas", hint: "Dá tempo de encaixar outro cliente" },
  { hours: 6, label: "6 horas" },
  { hours: 12, label: "12 horas" },
  { hours: 24, label: "1 dia", hint: "Mais rígido; use se a falta doer" },
  { hours: 48, label: "2 dias" },
]

interface CancelPolicyFormProps {
  barbershopId: string
  cancelWindowHours: number
}

const CancelPolicyForm = ({
  barbershopId,
  cancelWindowHours,
}: CancelPolicyFormProps) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [hours, setHours] = useState(cancelWindowHours)

  const selected = OPTIONS.find((option) => option.hours === hours)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    startTransition(async () => {
      try {
        const result = await updateCancelWindow(barbershopId, hours)

        if (!result.ok) {
          toast.error(result.message)
          return
        }

        toast.success("Prazo de cancelamento salvo.")
        router.refresh()
      } catch (error) {
        toast.error(messageFrom(error, "Não foi possível salvar."))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="surface rounded-lg p-5">
      <h2 className="font-display font-bold">Prazo de cancelamento</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Com quanta antecedência o cliente pode desmarcar sozinho pelo app.
      </p>

      <div className="mt-5 space-y-2">
        <Label>Antecedência mínima</Label>

        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((option) => (
            <button
              key={option.hours}
              type="button"
              aria-pressed={hours === option.hours}
              onClick={() => setHours(option.hours)}
              className={
                hours === option.hours
                  ? "rounded-md border border-primary bg-primary/10 px-3 py-2 text-sm font-medium"
                  : "rounded-md border border-white/10 px-3 py-2 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }
            >
              {option.label}
            </button>
          ))}
        </div>

        {selected?.hint && (
          <p className="text-xs text-muted-foreground">{selected.hint}</p>
        )}
      </div>

      {/*
        Dito aqui porque é o que costuma gerar dúvida: a regra prende o cliente,
        não a casa. A barbearia continua desmarcando a qualquer hora, e é ela que
        avisa quem já tinha horário.
      */}
      <p className="mt-5 rounded-md bg-white/[0.04] px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
        Passado o prazo, o cliente vê no app que precisa falar direto com vocês.
        <strong className="text-foreground">
          {" "}
          Você continua podendo cancelar
        </strong>{" "}
        qualquer horário, a qualquer momento.
      </p>

      <div className="mt-6 border-t border-white/[0.06] pt-5">
        <Button type="submit" disabled={pending || hours === cancelWindowHours}>
          {pending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Salvar prazo
        </Button>
      </div>
    </form>
  )
}

export default CancelPolicyForm
