"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Star } from "lucide-react"
import { toast } from "sonner"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { submitReview } from "../_actions/reviews"
import { messageFrom, unwrap } from "@/app/_lib/action-result"
import { MAX_RATING } from "@/app/_lib/reviews"
import { cn } from "@/app/_lib/utils"

export interface ExistingReview {
  rating: number
  comment: string | null
}

interface ReviewFormProps {
  bookingId: string
  barbershopName: string
  /** Avaliação anterior, quando o cliente já avaliou esta visita. */
  review?: ExistingReview | null
}

/**
 * Avaliar um atendimento concluído.
 *
 * A nota é obrigatória e o comentário não: quase ninguém escreve, e exigir
 * texto faria a maioria desistir — o que deixaria a média nas mãos de quem teve
 * paciência, normalmente quem estava irritado.
 */
const ReviewForm = ({ bookingId, barbershopName, review }: ReviewFormProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const [rating, setRating] = useState(review?.rating ?? 0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState(review?.comment ?? "")

  const shown = hovered || rating

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    startTransition(async () => {
      try {
        await unwrap(
          submitReview({
            bookingId,
            rating,
            comment: comment.trim() || null,
          }),
        )

        toast.success(
          review ? "Avaliação atualizada." : "Obrigado pela avaliação!",
        )
        setOpen(false)
        router.refresh()
      } catch (error) {
        toast.error(messageFrom(error, "Não foi possível avaliar."))
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={review ? "ghost" : "outline"} size="sm">
          <Star
            size={14}
            className={review ? "fill-primary text-primary" : undefined}
          />
          {review ? "Editar avaliação" : "Avaliar"}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[92%] max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">
            Como foi na {barbershopName}?
          </DialogTitle>
          <DialogDescription>
            Sua nota aparece na página da barbearia e ajuda quem está
            escolhendo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="flex justify-center gap-1"
            role="radiogroup"
            aria-label="Nota"
            onMouseLeave={() => setHovered(0)}
          >
            {Array.from({ length: MAX_RATING }, (_, index) => {
              const value = index + 1

              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHovered(value)}
                  className="rounded p-1 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Star
                    size={30}
                    className={cn(
                      "transition-colors",
                      value <= shown
                        ? "fill-primary text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                </button>
              )
            })}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={`comment-${bookingId}`} className="sr-only">
              Comentário
            </label>
            <textarea
              id={`comment-${bookingId}`}
              rows={3}
              maxLength={500}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Conte como foi (opcional)"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <DialogFooter>
            {/* Sem nota não há o que enviar — o comentário sozinho não vira
                avaliação, e o botão diz isso ficando desligado. */}
            <Button type="submit" disabled={pending || rating === 0}>
              {pending && <Loader2 size={15} className="animate-spin" />}
              {review ? "Salvar" : "Enviar avaliação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ReviewForm
