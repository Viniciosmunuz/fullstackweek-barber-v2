"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarOff, Clock, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog"
import {
  addBarberTimeOff,
  removeBarberTimeOff,
  updateBarberSchedule,
} from "@/app/_actions/dashboard/barber-schedule"
import { messageFrom, unwrap } from "@/app/_lib/action-result"
import { getWeekdayLabel } from "@/app/_lib/utils"

export interface ScheduleDay {
  weekday: number
  closed: boolean
  opensAt: string | null
  closesAt: string | null
}

export interface TimeOffRow {
  id: string
  startsAt: Date
  endsAt: Date
  reason: string | null
}

interface BarberScheduleFormProps {
  barberId: string
  barberName: string
  /** Grade própria; vazia significa que ele segue o horário da casa. */
  schedule: ScheduleDay[]
  timeOff: TimeOffRow[]
  /** Grade da casa, mostrada como ponto de partida da escala própria. */
  shopHours: ScheduleDay[]
}

const FALLBACK_WEEK: ScheduleDay[] = Array.from(
  { length: 7 },
  (_, weekday) => ({
    weekday,
    closed: weekday === 0,
    opensAt: weekday === 0 ? null : "09:00",
    closesAt: weekday === 0 ? null : "19:00",
  }),
)

/**
 * Escala e ausências de um profissional.
 *
 * A escala própria começa desligada, e o botão que a liga parte da grade da
 * casa em vez de uma semana em branco: quem tem horário diferente costuma
 * diferir em um ou dois dias, não na semana inteira.
 */
const BarberScheduleForm = ({
  barberId,
  barberName,
  schedule,
  timeOff,
  shopHours,
}: BarberScheduleFormProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const [custom, setCustom] = useState(schedule.length === 7)
  const [week, setWeek] = useState<ScheduleDay[]>(
    schedule.length === 7
      ? schedule
      : shopHours.length === 7
        ? shopHours
        : FALLBACK_WEEK,
  )

  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [reason, setReason] = useState("")

  const update = (weekday: number, patch: Partial<ScheduleDay>) =>
    setWeek((current) =>
      current.map((day) =>
        day.weekday === weekday ? { ...day, ...patch } : day,
      ),
    )

  const run = (fn: () => Promise<unknown>, success: string) =>
    startTransition(async () => {
      try {
        await fn()
        toast.success(success)
        router.refresh()
      } catch (error) {
        toast.error(messageFrom(error, "Não foi possível salvar."))
      }
    })

  const saveSchedule = () =>
    run(
      () => unwrap(updateBarberSchedule(barberId, custom ? week : [])),
      custom
        ? `Escala de ${barberName} salva.`
        : `${barberName} voltou ao horário da barbearia.`,
    )

  const addTimeOff = (event: React.FormEvent) => {
    event.preventDefault()

    run(() => {
      const promise = unwrap(
        addBarberTimeOff({
          barberId,
          startsAt: new Date(start),
          endsAt: new Date(end),
          reason: reason.trim() || null,
        }),
      )
      setStart("")
      setEnd("")
      setReason("")
      return promise
    }, "Ausência registrada.")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Clock size={14} />
          Escala
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[92%] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            Escala de {barberName}
          </DialogTitle>
          <DialogDescription>
            Define quando ele aparece para o cliente escolher horário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={custom}
                onChange={(event) => setCustom(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#834CF1]"
              />
              <span className="text-sm">
                Tem horário diferente do da barbearia
                <span className="block text-xs text-muted-foreground">
                  Desmarcado, ele segue a grade da casa — que é o caso da
                  maioria.
                </span>
              </span>
            </label>

            {custom && (
              <div className="space-y-2">
                {week.map((day) => (
                  <div
                    key={day.weekday}
                    className="flex flex-wrap items-center gap-2 rounded-md bg-white/[0.03] px-3 py-2"
                  >
                    <span className="w-24 shrink-0 text-sm">
                      {getWeekdayLabel(day.weekday)}
                    </span>

                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={day.closed}
                        onChange={(event) =>
                          update(day.weekday, {
                            closed: event.target.checked,
                            opensAt: event.target.checked ? null : "09:00",
                            closesAt: event.target.checked ? null : "19:00",
                          })
                        }
                        className="h-3.5 w-3.5 accent-[#834CF1]"
                      />
                      Folga
                    </label>

                    {!day.closed && (
                      <span className="ml-auto flex items-center gap-1.5">
                        <Input
                          type="time"
                          aria-label={`Entrada em ${getWeekdayLabel(day.weekday)}`}
                          value={day.opensAt ?? ""}
                          onChange={(event) =>
                            update(day.weekday, { opensAt: event.target.value })
                          }
                          className="h-8 w-28"
                        />
                        <span className="text-xs text-muted-foreground">
                          às
                        </span>
                        <Input
                          type="time"
                          aria-label={`Saída em ${getWeekdayLabel(day.weekday)}`}
                          value={day.closesAt ?? ""}
                          onChange={(event) =>
                            update(day.weekday, {
                              closesAt: event.target.value,
                            })
                          }
                          className="h-8 w-28"
                        />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button size="sm" onClick={saveSchedule} disabled={pending}>
              {pending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Salvar escala
            </Button>
          </section>

          <section className="space-y-3 border-t border-white/[0.06] pt-5">
            <div>
              <h3 className="font-display text-sm font-bold">
                Folgas e férias
              </h3>
              <p className="text-xs text-muted-foreground">
                Some da escolha do cliente no período. Agendamentos já marcados
                continuam valendo — remarcar é decisão da barbearia.
              </p>
            </div>

            {timeOff.length > 0 && (
              <ul className="space-y-1.5">
                {timeOff.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center gap-2 rounded-md bg-white/[0.03] px-3 py-2 text-sm"
                  >
                    <CalendarOff
                      size={14}
                      className="shrink-0 text-muted-foreground"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {format(row.startsAt, "dd/MM HH:mm", { locale: ptBR })} —{" "}
                      {format(row.endsAt, "dd/MM HH:mm", { locale: ptBR })}
                      {row.reason && (
                        <span className="text-muted-foreground">
                          {" "}
                          · {row.reason}
                        </span>
                      )}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      aria-label="Remover ausência"
                      className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() =>
                        run(
                          () => unwrap(removeBarberTimeOff(row.id)),
                          "Ausência removida.",
                        )
                      }
                    >
                      <Trash2 size={13} />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={addTimeOff} className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor={`off-start-${barberId}`} className="text-xs">
                  Começa
                </Label>
                <Input
                  id={`off-start-${barberId}`}
                  type="datetime-local"
                  required
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`off-end-${barberId}`} className="text-xs">
                  Termina
                </Label>
                <Input
                  id={`off-end-${barberId}`}
                  type="datetime-local"
                  required
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor={`off-reason-${barberId}`} className="text-xs">
                  Motivo (opcional, só a barbearia vê)
                </Label>
                <Input
                  id={`off-reason-${barberId}`}
                  maxLength={120}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Férias"
                  className="h-9"
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={pending}
                className="sm:col-span-2"
              >
                <Plus size={14} />
                Adicionar ausência
              </Button>
            </form>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BarberScheduleForm
