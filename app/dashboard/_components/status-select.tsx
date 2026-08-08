"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateBookingStatus } from "@/app/_actions/dashboard/booking-status"
import { cn } from "@/app/_lib/utils"

type Status = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

const OPTIONS: { value: Status; label: string }[] = [
  { value: "PENDING", label: "Pendente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "COMPLETED", label: "Concluído" },
  { value: "CANCELLED", label: "Cancelado" },
]

const TONE: Record<Status, string> = {
  PENDING: "bg-warning/15 text-warning",
  CONFIRMED: "bg-primary/15 text-primary",
  COMPLETED: "bg-success/15 text-success",
  CANCELLED: "bg-destructive/15 text-destructive",
}

interface StatusSelectProps {
  bookingId: string
  status: Status
  clientName: string
}

/**
 * Situação editável direto na linha da agenda.
 *
 * O valor muda na tela antes da resposta do servidor para o clique parecer
 * imediato; se a gravação falhar, volta ao anterior e avisa o motivo.
 */
const StatusSelect = ({ bookingId, status, clientName }: StatusSelectProps) => {
  const router = useRouter()
  const [value, setValue] = useState<Status>(status)
  const [pending, startTransition] = useTransition()

  const handleChange = (next: Status) => {
    const previous = value
    setValue(next)

    startTransition(async () => {
      try {
        await updateBookingStatus({ bookingId, status: next })
        toast.success(
          `${clientName}: ${OPTIONS.find((o) => o.value === next)?.label.toLowerCase()}.`,
        )
        router.refresh()
      } catch (error) {
        setValue(previous)
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o status.",
        )
      }
    })
  }

  return (
    <span className="relative inline-flex items-center">
      <label className="sr-only" htmlFor={`status-${bookingId}`}>
        Situação do agendamento de {clientName}
      </label>
      <select
        id={`status-${bookingId}`}
        value={value}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value as Status)}
        className={cn(
          "cursor-pointer appearance-none rounded-full py-1 pl-2.5 pr-7 text-[11px] font-semibold outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
          TONE[value],
        )}
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-card text-foreground">
            {option.label}
          </option>
        ))}
      </select>

      {pending ? (
        <Loader2
          size={11}
          className="pointer-events-none absolute right-2 animate-spin"
        />
      ) : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 text-[8px] opacity-70"
        >
          ▼
        </span>
      )}
    </span>
  )
}

export default StatusSelect
