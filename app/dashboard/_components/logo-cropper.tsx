"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Maximize2, Minus, Plus } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog"

/** Lado da imagem gravada. Cobre o maior uso (80px em tela densa) com folga. */
const OUTPUT = 512

/** Lado da área de enquadramento na tela, em pixels CSS. */
const VIEWPORT = 260

const MIN_ZOOM = 1
const MAX_ZOOM = 4

interface LogoCropperProps {
  /** Arquivo escolhido; `null` fecha o diálogo. */
  file: File | null
  onCancel: () => void
  // eslint-disable-next-line no-unused-vars
  onConfirm: (cropped: Blob) => void
}

/**
 * Enquadra a logo num quadrado antes de subir.
 *
 * Existe porque **todo lugar que mostra a logo é quadrado** — 20px no card do
 * catálogo, 40px na página da barbearia, 16px no agendamento. Uma logo larga,
 * dessas com o nome escrito ao lado do símbolo, ou virava uma tirinha ilegível
 * ou aparecia cortada, e o dono não tinha como saber qual das duas antes de
 * salvar.
 *
 * Guardar já quadrado resolve na origem: a partir daí toda tela mostra a mesma
 * coisa, e o que o dono enquadrou aqui é exatamente o que o cliente vê.
 *
 * O padrão é a imagem inteira visível, com transparência em volta — nunca
 * cortada. Cortar é uma escolha que ele faz aumentando o zoom, não algo que
 * acontece por conta.
 */
const LogoCropper = ({ file, onCancel, onConfirm }: LogoCropperProps) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [working, setWorking] = useState(false)

  const drag = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!file) {
      setImage(null)
      return
    }

    const url = URL.createObjectURL(file)
    const element = new Image()

    element.onload = () => {
      setImage(element)
      setZoom(MIN_ZOOM)
      setOffset({ x: 0, y: 0 })
    }
    element.src = url

    return () => URL.revokeObjectURL(url)
  }, [file])

  /** Escala que faz a imagem inteira caber no quadrado. */
  const baseScale = image
    ? Math.min(VIEWPORT / image.naturalWidth, VIEWPORT / image.naturalHeight)
    : 1

  const handlePointerDown = (event: React.PointerEvent) => {
    drag.current = { x: event.clientX - offset.x, y: event.clientY - offset.y }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!drag.current) return
    setOffset({
      x: event.clientX - drag.current.x,
      y: event.clientY - drag.current.y,
    })
  }

  const handlePointerUp = () => {
    drag.current = null
  }

  const reset = () => {
    setZoom(MIN_ZOOM)
    setOffset({ x: 0, y: 0 })
  }

  const confirm = () => {
    if (!image) return

    setWorking(true)

    const canvas = document.createElement("canvas")
    canvas.width = OUTPUT
    canvas.height = OUTPUT

    const context = canvas.getContext("2d")
    if (!context) {
      setWorking(false)
      return
    }

    // A tela de enquadramento e a imagem gravada precisam mostrar exatamente o
    // mesmo recorte, então tudo é multiplicado pela razão entre os dois lados.
    const ratio = OUTPUT / VIEWPORT
    const width = image.naturalWidth * baseScale * zoom * ratio
    const height = image.naturalHeight * baseScale * zoom * ratio

    context.drawImage(
      image,
      OUTPUT / 2 + offset.x * ratio - width / 2,
      OUTPUT / 2 + offset.y * ratio - height / 2,
      width,
      height,
    )

    // Sem preencher o fundo: WebP guarda transparência, e logo com fundo
    // vazado é justamente a que precisa disso.
    canvas.toBlob(
      (blob) => {
        setWorking(false)
        if (blob) onConfirm(blob)
      },
      "image/webp",
      0.92,
    )
  }

  return (
    <Dialog open={Boolean(file)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="w-[92%] max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Enquadrar a logo</DialogTitle>
          <DialogDescription>
            É assim que ela vai aparecer no site. Arraste para mover e use o
            zoom; o que ficar fora do quadrado não entra.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ width: VIEWPORT, height: VIEWPORT }}
            className="relative cursor-grab touch-none overflow-hidden rounded-lg border border-white/10 bg-[repeating-conic-gradient(#1c1c25_0%_25%,#15151c_0%_50%)] bg-[length:16px_16px] active:cursor-grabbing"
          >
            {image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={image.src}
                alt=""
                draggable={false}
                style={{
                  width: image.naturalWidth * baseScale * zoom,
                  height: image.naturalHeight * baseScale * zoom,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
              />
            )}
          </div>

          <div className="flex w-full items-center gap-3">
            <Minus size={14} className="shrink-0 text-muted-foreground" />
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              aria-label="Zoom"
              className="h-1 flex-1 cursor-pointer accent-[#834CF1]"
            />
            <Plus size={14} className="shrink-0 text-muted-foreground" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              className="shrink-0"
            >
              <Maximize2 size={13} />
              Tudo
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            O fundo xadrez é transparência — ela é preservada.
          </p>
        </div>

        <DialogFooter className="flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={confirm}
            disabled={!image || working}
            className="w-full"
          >
            {working && <Loader2 size={15} className="animate-spin" />}
            Usar esta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LogoCropper
