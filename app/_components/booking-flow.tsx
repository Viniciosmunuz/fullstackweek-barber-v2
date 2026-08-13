"use client"

import { messageFrom, unwrap } from "@/app/_lib/action-result"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ptBR } from "date-fns/locale"
import { format, set } from "date-fns"
import { Check, ChevronLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import BarberAvatar from "./barber-avatar"
import DepositPayment from "./deposit-payment"
import { createBooking } from "../_actions/create-booking"
import { createBookingWithDeposit } from "../_actions/payments/create-deposit"
import type { DepositResult } from "../_actions/payments/types"
import { getAvailableSlots } from "../_actions/available-slots"
import { cn, formatCurrency, formatDuration } from "@/app/_lib/utils"

export interface FlowService {
  id: string
  name: string
  description: string
  price: number
  durationMinutes: number
}

export interface FlowBarber {
  id: string
  name: string
  specialty: string
  imageUrl: string
}

interface BookingFlowProps {
  service: FlowService
  barbers: FlowBarber[]
  barbershopName: string
  accentColor: string
  /**
   * Sinal em reais, quando a barbearia aceita pagamento pelo aplicativo.
   * `null` mantém o fluxo antigo, em que só se paga no balcão.
   */
  depositAmount?: number | null
  /** Documento já informado antes, para não pedir de novo. */
  savedDocument?: string | null
  /** Fecha o painel que envolve o fluxo. */
  onDone: () => void
}

/** Como o cliente escolheu pagar. */
type PayMode = "SHOP" | "DEPOSIT"

const STEPS = ["Profissional", "Data", "Horário", "Confirmação"] as const

/*
 * Aqui viviam uma lista fixa de 08:00 às 19:00 e a conta de disponibilidade.
 *
 * Uma faixa fixa não tem como estar certa para duas barbearias diferentes: a
 * casa que abre às 10h e fecha domingo recebia agendamento às 8h de domingo. E
 * a conta feita no navegador não enxerga a escala do profissional nem as
 * ausências dele.
 *
 * Agora quem responde é o servidor, em `getAvailableSlots`. O navegador só
 * mostra o que recebeu — e passa a concordar com a checagem que roda na hora de
 * confirmar, que é o que evita o cliente escolher um horário e levar um erro.
 */

const BookingFlow = ({
  service,
  barbers,
  barbershopName,
  accentColor,
  depositAmount = null,
  savedDocument = null,
  onDone,
}: BookingFlowProps) => {
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [barber, setBarber] = useState<FlowBarber | null>(null)
  const [day, setDay] = useState<Date | undefined>()
  const [time, setTime] = useState<string | undefined>()
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Pagar na barbearia continua sendo o padrão: é como funciona hoje, e
  // transformar o sinal em obrigação afastaria quem só quer marcar horário.
  const [payMode, setPayMode] = useState<PayMode>("SHOP")
  const [document, setDocument] = useState(savedDocument ?? "")
  const [deposit, setDeposit] = useState<DepositResult | null>(null)

  // Recarrega os horários sempre que o par (profissional, dia) muda.
  useEffect(() => {
    if (!barber || !day) return

    let cancelled = false
    setLoadingSlots(true)

    getAvailableSlots({ barberId: barber.id, serviceId: service.id, date: day })
      .then((available) => {
        if (!cancelled) setSlots(available)
      })
      .catch(() => {
        if (!cancelled) toast.error("Não foi possível carregar os horários.")
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false)
      })

    return () => {
      cancelled = true
    }
  }, [barber, day, service.id])

  const selectedDate = useMemo(() => {
    if (!day || !time) return undefined
    const [hours, minutes] = time.split(":").map(Number)
    return set(day, { hours, minutes, seconds: 0, milliseconds: 0 })
  }, [day, time])

  const handleConfirm = async () => {
    if (!selectedDate || !barber) return

    setSubmitting(true)
    try {
      if (payMode === "DEPOSIT") {
        const result = await unwrap(
          createBookingWithDeposit({
            serviceId: service.id,
            barberId: barber.id,
            date: selectedDate,
            cpfCnpj: document,
          }),
        )

        // A reserva já existe segurando o horário; agora é esperar o PIX.
        setDeposit(result)
        return
      }

      await unwrap(
        createBooking({
          serviceId: service.id,
          barberId: barber.id,
          date: selectedDate,
        }),
      )

      toast.success("Agendamento confirmado!", {
        description: `${service.name} · ${format(selectedDate, "dd/MM 'às' HH:mm", { locale: ptBR })}`,
        action: {
          label: "Ver meus agendamentos",
          onClick: () => router.push("/bookings"),
        },
      })
      onDone()
      router.refresh()
    } catch (error) {
      toast.error(
        messageFrom(error, "Não foi possível concluir o agendamento."),
      )
      // Um conflito invalida o horário escolhido: volta para a escolha.
      setTime(undefined)
      setStep(2)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDepositPaid = () => {
    toast.success("Sinal recebido, agendamento confirmado!", {
      action: {
        label: "Ver meus agendamentos",
        onClick: () => router.push("/bookings"),
      },
    })
    setDeposit(null)
    onDone()
    router.refresh()
  }

  const handleDepositExpired = () => {
    toast.error("O prazo do sinal venceu e o horário foi liberado.")
    setDeposit(null)
    setTime(undefined)
    setStep(2)
    router.refresh()
  }

  // Documento só é validado em profundidade no servidor; aqui basta o
  // suficiente para não deixar o botão disparar uma chamada que já vai falhar.
  const documentDigits = document.replace(/\D/g, "")
  const documentLooksValid =
    documentDigits.length === 11 || documentDigits.length === 14
  const canConfirm =
    payMode === "SHOP" || (Boolean(depositAmount) && documentLooksValid)

  if (deposit) {
    return (
      <DepositPayment
        bookingId={deposit.bookingId}
        pixPayload={deposit.pixPayload}
        qrCodeBase64={deposit.qrCodeBase64}
        amount={deposit.amount}
        expiresAt={deposit.expiresAt}
        onPaid={handleDepositPaid}
        onExpired={handleDepositExpired}
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Indicador de etapas */}
      <ol className="flex items-center gap-1.5 px-5 pb-4" aria-label="Etapas">
        {STEPS.map((label, index) => {
          const done = index < step
          const current = index === step

          return (
            <li key={label} className="flex flex-1 flex-col gap-1.5">
              <span
                className={cn(
                  "h-1 rounded-full transition-colors",
                  done || current ? "bg-primary" : "bg-white/10",
                )}
              />
              <span
                aria-current={current ? "step" : undefined}
                className={cn(
                  "text-[10px] font-medium",
                  current
                    ? "text-primary"
                    : done
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50",
                )}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="flex-1 overflow-y-auto px-5">
        {/* ---------------------------------------------------- 1. BARBEIRO */}
        {step === 0 && (
          <div className="space-y-2">
            <p className="pb-1 text-sm text-muted-foreground">
              Com quem você quer ser atendido?
            </p>
            {barbers.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setBarber(option)
                  setStep(1)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                  barber?.id === option.id
                    ? "border-primary bg-primary/[0.07]"
                    : "border-white/10 hover:border-primary/40 hover:bg-white/[0.03]",
                )}
              >
                <BarberAvatar
                  name={option.name}
                  imageUrl={option.imageUrl}
                  accentColor={accentColor}
                  className="h-11 w-11"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {option.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {option.specialty}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ------------------------------------------------------- 2. DATA */}
        {step === 1 && (
          <div>
            <Calendar
              mode="single"
              locale={ptBR}
              selected={day}
              onSelect={(date) => {
                setDay(date)
                setTime(undefined)
                if (date) setStep(2)
              }}
              fromDate={new Date()}
              className="w-full"
              styles={{
                head_cell: { width: "100%", textTransform: "capitalize" },
                cell: { width: "100%" },
                button: { width: "100%" },
                nav_button_previous: { width: "32px", height: "32px" },
                nav_button_next: { width: "32px", height: "32px" },
                caption: { textTransform: "capitalize" },
              }}
            />
          </div>
        )}

        {/* ---------------------------------------------------- 3. HORÁRIO */}
        {step === 2 && day && (
          <div>
            <p className="pb-3 text-sm text-muted-foreground">
              <span className="capitalize">
                {format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </span>{" "}
              · {barber?.name}
            </p>

            {loadingSlots ? (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-10 animate-pulse rounded-md bg-white/[0.06]"
                  />
                ))}
              </div>
            ) : slots.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setTime(slot)
                      setStep(3)
                    }}
                    className={cn(
                      "h-10 rounded-md border text-sm font-medium transition-colors",
                      time === slot
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-white/10 hover:border-primary/40 hover:bg-white/[0.04]",
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 px-4 py-10 text-center">
                <p className="text-sm font-medium">Nenhum horário livre</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {barber?.name} não tem vaga neste dia. Tente outra data ou
                  outro profissional.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setStep(1)}
                >
                  Escolher outra data
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------- 4. CONFIRMAÇÃO */}
        {step === 3 && selectedDate && barber && (
          <div className="space-y-4">
            <div className="surface rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold">{service.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {barbershopName}
                  </p>
                </div>
                <span className="font-display text-lg font-bold text-primary">
                  {formatCurrency(service.price)}
                </span>
              </div>

              <dl className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Profissional</dt>
                  <dd className="font-medium">{barber.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Data</dt>
                  <dd className="font-medium capitalize">
                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Horário</dt>
                  <dd className="font-medium">
                    {format(selectedDate, "HH:mm")}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Duração</dt>
                  <dd className="font-medium">
                    {formatDuration(service.durationMinutes)}
                  </dd>
                </div>
              </dl>
            </div>

            {depositAmount ? (
              <fieldset className="surface rounded-lg p-4">
                <legend className="sr-only">Forma de pagamento</legend>

                <div className="space-y-2">
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                      payMode === "SHOP"
                        ? "border-primary/40 bg-primary/[0.06]"
                        : "border-white/[0.06] hover:bg-white/[0.03]",
                    )}
                  >
                    <input
                      type="radio"
                      name="pay-mode"
                      className="mt-1 accent-primary"
                      checked={payMode === "SHOP"}
                      onChange={() => setPayMode("SHOP")}
                    />
                    <span className="text-sm">
                      <span className="font-medium">Pagar na barbearia</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Você acerta tudo no dia do atendimento.
                      </span>
                    </span>
                  </label>

                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                      payMode === "DEPOSIT"
                        ? "border-primary/40 bg-primary/[0.06]"
                        : "border-white/[0.06] hover:bg-white/[0.03]",
                    )}
                  >
                    <input
                      type="radio"
                      name="pay-mode"
                      className="mt-1 accent-primary"
                      checked={payMode === "DEPOSIT"}
                      onChange={() => setPayMode("DEPOSIT")}
                    />
                    <span className="text-sm">
                      <span className="font-medium">
                        Pagar {formatCurrency(depositAmount)} agora por PIX
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Abatido do valor na barbearia. Garante seu horário.
                      </span>
                    </span>
                  </label>
                </div>

                {payMode === "DEPOSIT" && (
                  <div className="mt-4 border-t border-white/[0.06] pt-4">
                    <label
                      htmlFor="deposit-document"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      CPF do pagador
                    </label>
                    <input
                      id="deposit-document"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="000.000.000-00"
                      value={document}
                      onChange={(event) => setDocument(event.target.value)}
                      className="mt-1.5 h-10 w-full rounded-md border border-white/[0.08] bg-background px-3 text-sm outline-none focus-visible:border-primary/50"
                    />
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      Exigido pelo banco para emitir a cobrança PIX.
                    </p>
                  </div>
                )}
              </fieldset>
            ) : (
              <p className="text-xs text-muted-foreground">
                O pagamento é feito na barbearia, no dia do atendimento.
              </p>
            )}
          </div>
        )}
      </div>

      {/* No passo da confirmação o nome do cliente e o contato passam a ser
          da barbearia. É onde o aviso precisa estar, não numa página que
          ninguém abre. */}
      {step === 3 && (
        <p className="border-t border-white/[0.06] px-5 pt-4 text-[11px] leading-relaxed text-muted-foreground">
          Ao confirmar, seus dados de contato ficam visíveis para esta
          barbearia. Veja os{" "}
          <Link
            href="/termos"
            target="_blank"
            className="text-primary underline underline-offset-2"
          >
            Termos
          </Link>{" "}
          e a{" "}
          <Link
            href="/privacidade"
            target="_blank"
            className="text-primary underline underline-offset-2"
          >
            Política de Privacidade
          </Link>
          .
        </p>
      )}

      {/* Rodapé de navegação */}
      <div className="flex gap-2 border-t border-white/[0.06] p-5">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={submitting}
          >
            <ChevronLeft size={16} />
            Voltar
          </Button>
        )}

        {step === 3 && (
          <Button
            className="flex-1"
            onClick={handleConfirm}
            disabled={submitting || !canConfirm}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {payMode === "DEPOSIT" ? "Gerando PIX…" : "Confirmando…"}
              </>
            ) : (
              <>
                <Check size={16} />
                {payMode === "DEPOSIT"
                  ? "Gerar PIX do sinal"
                  : "Confirmar agendamento"}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export default BookingFlow
