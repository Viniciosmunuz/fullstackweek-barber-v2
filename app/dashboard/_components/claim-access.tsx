"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { KeyRound, Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"
import { claimDemoBarbershops } from "@/app/_actions/dashboard/claim"

interface ClaimAccessProps {
  /** Reflete DEMO_SELF_SERVICE; controla se o botão é oferecido. */
  selfServiceEnabled: boolean
}

/**
 * Tela para quem está autenticado mas não administra nenhuma barbearia.
 *
 * Substitui o antigo acesso irrestrito: antes, qualquer conta logada caía
 * direto no painel de qualquer casa.
 */
const ClaimAccess = ({ selfServiceEnabled }: ClaimAccessProps) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  const handleClaim = () => {
    startTransition(async () => {
      try {
        const result = await claimDemoBarbershops()
        setDone(true)
        toast.success(
          `Acesso concedido a ${result.granted} barbearias de demonstração.`,
        )
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível conceder o acesso.",
        )
      }
    })
  }

  return (
    <div className="container py-16">
      <div className="surface mx-auto max-w-lg rounded-lg px-6 py-12 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck size={26} />
        </span>

        <h1 className="mt-5 font-display text-xl font-bold">
          Você ainda não administra nenhuma barbearia
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          O painel mostra faturamento, clientes e agenda, então só fica
          disponível para quem tem vínculo com o estabelecimento.
        </p>

        {selfServiceEnabled ? (
          <>
            <Button
              size="lg"
              className="mt-7"
              onClick={handleClaim}
              disabled={pending || done}
            >
              {pending ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Concedendo…
                </>
              ) : (
                <>
                  <KeyRound size={17} />
                  Assumir as barbearias de demonstração
                </>
              )}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Ambiente de demonstração: o catálogo é fictício e a concessão fica
              registrada na sua conta.
            </p>
          </>
        ) : (
          <p className="mt-7 rounded-md border border-white/10 px-4 py-3 text-sm text-muted-foreground">
            Peça ao responsável pela barbearia para incluir sua conta como
            gestora.
          </p>
        )}

        <div className="mt-8 border-t border-white/[0.06] pt-6">
          <Button variant="ghost" asChild>
            <Link href="/barbershops">Voltar para o site</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ClaimAccess
