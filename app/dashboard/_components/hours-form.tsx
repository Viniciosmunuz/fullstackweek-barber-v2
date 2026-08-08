"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"
import { updateOpeningHours } from "@/app/_actions/dashboard/barbershop-profile"
import { getWeekdayLabel } from "@/app/_lib/utils"

export interface HourRow {
  weekday: number
  opensAt: string | null
  closesAt: string | null
  closed: boolean
}

const DEFAULT_WEEK: HourRow[] = Array.from({ length: 7 }, (_, weekday) => ({
  weekday,
  opensAt: weekday === 0 ? null : "09:00",
  closesAt: weekday === 0 ? null : "19:00",
  closed: weekday === 0,
}))

const HoursForm = ({
  barbershopId,
  hours,
}: {
  barbershopId: string
  hours: HourRow[]
}) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  // Uma barbearia recém-cadastrada não tem grade; parte-se de uma semana padrão
  // para o dono só ajustar em vez de preencher do zero.
  const [week, setWeek] = useState<HourRow[]>(
    hours.length === 7 ? hours : DEFAULT_WEEK,
  )

  const update = (weekday: number, patch: Partial<HourRow>) => {
    setWeek((current) =>
      current.map((row) =>
        row.weekday === weekday ? { ...row, ...patch } : row,
      ),
    )
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    startTransition(async () => {
      try {
        await updateOpeningHours(barbershopId, week)
        toast.success("Horários salvos.")
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Não foi possível salvar.",
        )
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="surface rounded-lg p-5">
      <h2 className="font-display font-bold">Horário de funcionamento</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Define quais horários o cliente pode escolher ao agendar.
      </p>

      <div className="mt-5 space-y-2">
        {week.map((row) => (
          <div
            key={row.weekday}
            className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] pb-2 last:border-0"
          >
            <span className="w-20 text-sm font-medium">
              {getWeekdayLabel(row.weekday)}
            </span>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={!row.closed}
                onChange={(e) =>
                  update(row.weekday, {
                    closed: !e.target.checked,
                    opensAt: e.target.checked ? (row.opensAt ?? "09:00") : null,
                    closesAt: e.target.checked
                      ? (row.closesAt ?? "19:00")
                      : null,
                  })
                }
                className="h-4 w-4 accent-[#C9A227]"
              />
              Abre
            </label>

            {!row.closed && (
              <span className="flex items-center gap-2">
                <input
                  type="time"
                  required
                  value={row.opensAt ?? ""}
                  onChange={(e) =>
                    update(row.weekday, { opensAt: e.target.value })
                  }
                  aria-label={`Abertura de ${getWeekdayLabel(row.weekday)}`}
                  className="h-9 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span className="text-muted-foreground">até</span>
                <input
                  type="time"
                  required
                  value={row.closesAt ?? ""}
                  onChange={(e) =>
                    update(row.weekday, { closesAt: e.target.value })
                  }
                  aria-label={`Fechamento de ${getWeekdayLabel(row.weekday)}`}
                  className="h-9 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Salvar horários
        </Button>
      </div>
    </form>
  )
}

export default HoursForm
