import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatDuration } from "@/app/_lib/utils"

interface BookingSummaryProps {
  serviceName: string
  /** Já formatado em BRL pelo chamador. */
  price: string
  durationMinutes: number
  barbershopName: string
  barberName?: string
  date: Date
}

/** Resumo do agendamento, reaproveitado na confirmação e no detalhe da reserva. */
const BookingSummary = ({
  serviceName,
  price,
  durationMinutes,
  barbershopName,
  barberName,
  date,
}: BookingSummaryProps) => {
  return (
    <div className="surface rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-bold">{serviceName}</h3>
        <span className="font-display font-bold text-primary">{price}</span>
      </div>

      <dl className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Barbearia</dt>
          <dd className="text-right font-medium">{barbershopName}</dd>
        </div>

        {barberName && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Profissional</dt>
            <dd className="text-right font-medium">{barberName}</dd>
          </div>
        )}

        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Data</dt>
          <dd className="text-right font-medium capitalize">
            {format(date, "d 'de' MMMM", { locale: ptBR })}
          </dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Horário</dt>
          <dd className="text-right font-medium">{format(date, "HH:mm")}</dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Duração</dt>
          <dd className="text-right font-medium">
            {formatDuration(durationMinutes)}
          </dd>
        </div>
      </dl>
    </div>
  )
}

export default BookingSummary
