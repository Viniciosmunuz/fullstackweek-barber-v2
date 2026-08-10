"use client"

import { useEffect, useState } from "react"
import { ImageOff, ImageUp, Loader2 } from "lucide-react"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { cn } from "@/app/_lib/utils"

interface ImageFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  required?: boolean
}

/**
 * Campo de imagem por URL, com prévia.
 *
 * A prévia usa `<img>` cru em vez de `next/image` de propósito: aqui o objetivo
 * é justamente descobrir se a URL digitada carrega. Passando pelo otimizador,
 * um endereço quebrado viraria erro de servidor em vez de um aviso na tela.
 */
const ImageField = ({
  id,
  label,
  value,
  onChange,
  hint,
  required,
}: ImageFieldProps) => {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    value ? "loading" : "idle",
  )

  // Espera a digitação parar antes de tentar carregar, senão cada tecla
  // dispararia uma requisição.
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), 500)
    return () => clearTimeout(timer)
  }, [value])

  useEffect(() => {
    setStatus(debounced ? "loading" : "idle")
  }, [debounced])

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>

      <Input
        id={id}
        required={required}
        inputMode="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
      />

      <div className="flex items-start gap-3 pt-1">
        <div
          className={cn(
            "relative flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-md border",
            status === "error" ? "border-destructive/40" : "border-white/10",
          )}
        >
          {status === "idle" && (
            <ImageUp size={18} className="text-muted-foreground" />
          )}

          {status === "loading" && (
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          )}

          {status === "error" && (
            <ImageOff size={18} className="text-destructive" />
          )}

          {debounced && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={debounced}
              alt=""
              onLoad={() => setStatus("ok")}
              onError={() => setStatus("error")}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity",
                status === "ok" ? "opacity-100" : "opacity-0",
              )}
            />
          )}
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {status === "error" ? (
            <span className="text-destructive">
              Não foi possível carregar esta imagem. Confira se o endereço é
              público e termina em .jpg, .png ou .webp.
            </span>
          ) : (
            (hint ??
            "Cole o endereço de uma imagem hospedada publicamente. A prévia confirma se funcionou.")
          )}
        </p>
      </div>
    </div>
  )
}

export default ImageField
