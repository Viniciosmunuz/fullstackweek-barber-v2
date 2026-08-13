"use client"

import { useTransition } from "react"
import { messageFrom, unwrap } from "@/app/_lib/action-result"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, Circle, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"
import { publishBarbershop } from "@/app/_actions/dashboard/barbershop-profile"

interface PublishCardProps {
  barbershopId: string
  isPublished: boolean
  checklist: {
    address: boolean
    description: boolean
    image: boolean
    phone: boolean
    services: boolean
    barbers: boolean
  }
}

const LABELS: Record<keyof PublishCardProps["checklist"], string> = {
  address: "Endereço",
  description: "Descrição",
  image: "Foto da barbearia",
  phone: "Telefone",
  services: "Ao menos um serviço",
  barbers: "Ao menos um profissional",
}

/**
 * Estado de publicação e o que ainda falta.
 *
 * A barbearia começa fora do catálogo justamente para não receber cliente com
 * a ficha pela metade; o checklist mostra o caminho até poder publicar.
 */
const PublishCard = ({
  barbershopId,
  isPublished,
  checklist,
}: PublishCardProps) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const items = Object.entries(checklist) as [
    keyof PublishCardProps["checklist"],
    boolean,
  ][]
  const missing = items.filter(([, done]) => !done)
  const ready = missing.length === 0

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await unwrap(publishBarbershop(barbershopId, !isPublished))
        toast.success(
          isPublished
            ? "Barbearia removida do catálogo."
            : "Barbearia publicada! Já aparece na busca.",
        )
        router.refresh()
      } catch (error) {
        toast.error(messageFrom(error, "Não foi possível publicar."))
      }
    })
  }

  return (
    <div className="surface rounded-lg p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold">
              {isPublished ? "Publicada" : "Ainda não publicada"}
            </h2>
            <span
              className={
                isPublished
                  ? "rounded-full bg-success/15 px-2.5 py-0.5 text-[11px] font-semibold text-success"
                  : "rounded-full bg-warning/15 px-2.5 py-0.5 text-[11px] font-semibold text-warning"
              }
            >
              {isPublished ? "No catálogo" : "Rascunho"}
            </span>
          </div>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            {isPublished
              ? "Sua barbearia aparece na busca e recebe agendamentos."
              : "Complete o cadastro abaixo para aparecer na busca e receber agendamentos."}
          </p>
        </div>

        <div className="flex gap-2">
          {isPublished && (
            <Button variant="outline" asChild>
              <Link href={`/barbershops/${barbershopId}`}>Ver página</Link>
            </Button>
          )}
          <Button
            onClick={handleToggle}
            disabled={pending || (!isPublished && !ready)}
            variant={isPublished ? "outline" : "default"}
          >
            {pending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isPublished ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
            {isPublished ? "Despublicar" : "Publicar barbearia"}
          </Button>
        </div>
      </div>

      {!ready && (
        <ul className="mt-5 grid gap-2 border-t border-white/[0.06] pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([key, done]) => (
            <li
              key={key}
              className={
                done
                  ? "flex items-center gap-2 text-sm text-muted-foreground"
                  : "flex items-center gap-2 text-sm"
              }
            >
              {done ? (
                <Check size={15} className="shrink-0 text-success" />
              ) : (
                <Circle size={15} className="shrink-0 text-muted-foreground" />
              )}
              {LABELS[key]}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PublishCard
