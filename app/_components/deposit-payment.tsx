"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Check, Copy, Loader2, TimerOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { getDepositStatus } from "../_actions/payments/deposit-status"
import { formatCurrency } from "@/app/_lib/utils"

interface DepositPaymentProps {
  bookingId: string
  pixPayload: string | null
  qrCodeBase64: string | null
  /** Valor do sinal, em reais. */
  amount: number
  expiresAt: Date
  onPaid: () => void
  onExpired: () => void
}

/**
 * Tela de pagamento do sinal.
 *
 * A confirmação não acontece aqui: quem decide é o webhook do provedor. Esta
 * tela apenas pergunta de tempos em tempos se já caiu, e por isso pode ser
 * fechada sem prejuízo — o agendamento confirma de qualquer forma.
 *
 * A contagem regressiva é honesta com o prazo real gravado na reserva: passado
 * ele, o horário volta para a lista e insistir no pagamento seria enganoso.
 */
const POLL_MS = 4000

const DepositPayment = ({
  bookingId,
  pixPayload,
  qrCodeBase64,
  amount,
  expiresAt,
  onPaid,
  onExpired,
}: DepositPaymentProps) => {
  const [copied, setCopied] = useState(false)
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, expiresAt.getTime() - Date.now()),
  )

  useEffect(() => {
    const tick = setInterval(() => {
      setRemaining(Math.max(0, expiresAt.getTime() - Date.now()))
    }, 1000)

    return () => clearInterval(tick)
  }, [expiresAt])

  // Os callbacks entram por referência para ficarem fora das dependências do
  // efeito. Vindos do pai, eles são recriados a cada render; na lista de
  // dependências, derrubariam e recriariam o intervalo a cada render.
  const onPaidRef = useRef(onPaid)
  const onExpiredRef = useRef(onExpired)

  useEffect(() => {
    onPaidRef.current = onPaid
    onExpiredRef.current = onExpired
  }, [onPaid, onExpired])

  useEffect(() => {
    let active = true

    const check = async () => {
      try {
        const { status } = await getDepositStatus(bookingId)
        if (!active) return

        if (status === "PAID") onPaidRef.current()
        else if (status === "EXPIRED") onExpiredRef.current()
      } catch {
        // Falha de rede aqui é irrelevante: a próxima rodada tenta de novo, e
        // o agendamento não depende desta tela para confirmar.
      }
    }

    const poll = setInterval(check, POLL_MS)
    return () => {
      active = false
      clearInterval(poll)
    }
  }, [bookingId])

  const minutes = Math.floor(remaining / 60_000)
  const seconds = Math.floor((remaining % 60_000) / 1000)

  const handleCopy = async () => {
    if (!pixPayload) return

    try {
      await navigator.clipboard.writeText(pixPayload)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error("Não foi possível copiar. Selecione o código manualmente.")
    }
  }

  if (remaining <= 0) {
    return (
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TimerOff size={24} />
        </span>
        <h3 className="mt-4 font-display text-lg font-bold">Prazo encerrado</h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          O horário voltou para a lista. Se você pagou agora mesmo, aguarde um
          instante — a confirmação ainda pode chegar.
        </p>
        <Button variant="outline" className="mt-5" onClick={onExpired}>
          Escolher outro horário
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center px-5 py-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Sinal para confirmar
      </p>
      <p className="mt-1 font-display text-3xl font-extrabold text-primary">
        {formatCurrency(amount)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Abatido do valor na barbearia
      </p>

      {qrCodeBase64 && (
        <div className="mt-5 rounded-lg bg-white p-3">
          <Image
            src={`data:image/png;base64,${qrCodeBase64}`}
            alt="QR Code do PIX"
            width={180}
            height={180}
            unoptimized
          />
        </div>
      )}

      {pixPayload && (
        <Button
          variant="outline"
          className="mt-5 w-full"
          onClick={handleCopy}
          aria-live="polite"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Código copiado" : "Copiar código PIX"}
        </Button>
      )}

      <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 size={14} className="animate-spin motion-reduce:hidden" />
        Aguardando pagamento · {minutes}:{String(seconds).padStart(2, "0")}
      </p>

      <p className="mt-3 max-w-xs text-xs text-muted-foreground">
        Pode fechar esta tela. O agendamento é confirmado assim que o pagamento
        cair.
      </p>
    </div>
  )
}

export default DepositPayment
