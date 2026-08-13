"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { FileCheck2, ImageOff, ImageUp, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { uploadImage } from "@/app/_actions/dashboard/images"
import { messageFrom } from "@/app/_lib/action-result"
import { UPLOAD_PREFIX } from "@/app/_lib/image-source"
import { cn } from "@/app/_lib/utils"

/**
 * Maior lado da imagem depois de reduzida.
 *
 * 2400px cobre tela grande em densidade dupla — a capa da barbearia é o maior
 * lugar onde essas imagens aparecem, e ali ela ocupa a largura toda.
 */
const MAX_EDGE = 2400

/** Compressão do WebP. Alta o bastante para não serrilhar borda de logo. */
const QUALITY = 0.9

/**
 * Abaixo disto e dentro do limite de tamanho, o arquivo sobe como veio.
 *
 * Re-encodar uma imagem que já está pequena e bem comprimida só perde
 * qualidade: cada passagem por JPEG ou WebP joga informação fora. PNG de logo
 * é o caso típico — nítido, leve, e pior depois de passar pelo canvas.
 */
const PASSTHROUGH_BYTES = 600_000

/** Formatos que o servidor guarda como vieram, sem passar pelo canvas. */
const PASSTHROUGH_TYPES = ["image/webp", "image/png", "image/jpeg"]

/**
 * Tamanho assumido para SVG sem dimensão própria.
 *
 * Muitos SVG só trazem `viewBox`, e aí o navegador reporta largura zero. Zero
 * viraria um canvas vazio — uma imagem "enviada com sucesso" e invisível, que é
 * pior que um erro.
 */
const VECTOR_FALLBACK = 1024

interface Decoded {
  source: CanvasImageSource
  width: number
  height: number
  release: () => void
}

/**
 * Lê o arquivo, por dois caminhos.
 *
 * `createImageBitmap` é o rápido e o preferido, mas recusa formatos que a tag
 * `<img>` aceita sem reclamar — SVG é o caso comum, e Safari mais antigo também
 * cai aqui. Tentar o segundo caminho antes de desistir é o que faz "essa imagem
 * não sobe" virar "sobe".
 */
async function decode(file: File): Promise<Decoded> {
  try {
    const bitmap = await createImageBitmap(file)
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      release: () => bitmap.close(),
    }
  } catch {
    return decodeWithTag(file)
  }
}

function decodeWithTag(file: File): Promise<Decoded> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      resolve({
        source: image,
        width: image.naturalWidth || VECTOR_FALLBACK,
        height: image.naturalHeight || VECTOR_FALLBACK,
        release: () => URL.revokeObjectURL(url),
      })
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(
        new Error(
          "Não foi possível ler este arquivo. Se veio de um iPhone, abra a foto, toque em compartilhar e salve como JPG antes de enviar.",
        ),
      )
    }

    image.src = url
  })
}

/**
 * Prepara a imagem no navegador antes de enviar.
 *
 * Foto de celular hoje passa de 8 MB e nada na tela precisa disso. Reduzir aqui
 * deixa o envio rápido no 4G do dono, evita esbarrar no limite do servidor e
 * mantém o banco pequeno — que é o que torna guardar imagem nele defensável.
 *
 * Tudo que não for PNG, JPG ou WebP é convertido, inclusive SVG. Além de
 * uniformizar o que o servidor precisa aceitar, isso desarma o SVG: rasterizado,
 * o que era um documento capaz de rodar script vira pixel.
 *
 * WebP porque preserva transparência (logo com fundo vazado depende disso) e
 * comprime melhor que PNG. Navegador que não souber gerar WebP cai em JPEG.
 */
async function prepare(file: File): Promise<Blob> {
  const decoded = await decode(file)

  try {
    const longestEdge = Math.max(decoded.width, decoded.height)

    if (
      PASSTHROUGH_TYPES.includes(file.type) &&
      longestEdge <= MAX_EDGE &&
      file.size <= PASSTHROUGH_BYTES
    ) {
      return file
    }

    const scale = Math.min(1, MAX_EDGE / longestEdge)
    const width = Math.max(1, Math.round(decoded.width * scale))
    const height = Math.max(1, Math.round(decoded.height * scale))

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext("2d")
    if (!context) throw new Error("Não foi possível preparar a imagem.")

    context.drawImage(decoded.source, 0, 0, width, height)

    const encode = (type: string) =>
      new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, type, QUALITY),
      )

    const webp = await encode("image/webp")
    if (webp && webp.size > 0) return webp

    const jpeg = await encode("image/jpeg")
    if (jpeg && jpeg.size > 0) return jpeg

    throw new Error("Não foi possível converter esta imagem.")
  } finally {
    decoded.release()
  }
}

interface ImageFieldProps {
  id: string
  label: string
  value: string
  /*
   * O projeto usa a regra base `no-unused-vars`, que não entende TypeScript e
   * enxerga o parâmetro da assinatura como variável sem uso. A exceção fica
   * aqui, na linha, em vez de afrouxar a regra para o resto do código.
   */
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void
  /** Barbearia dona da imagem — é ela que autoriza o envio no servidor. */
  barbershopId: string
  hint?: string
  required?: boolean
}

/**
 * Campo de imagem: endereço colado ou arquivo do dispositivo.
 *
 * Os dois caminhos terminam no mesmo lugar — um endereço no campo de texto — e
 * é por isso que nenhuma outra tela precisou saber da diferença. Quem já
 * hospeda a foto em algum lugar cola o link; quem tem a logo no celular manda o
 * arquivo.
 *
 * A prévia usa `<img>` cru em vez de `next/image` de propósito: aqui o objetivo
 * é justamente descobrir se o endereço digitado carrega. Passando pelo
 * otimizador, um endereço quebrado viraria erro de servidor em vez de um aviso
 * na tela.
 */
const ImageField = ({
  id,
  label,
  value,
  onChange,
  barbershopId,
  hint,
  required,
}: ImageFieldProps) => {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    value ? "loading" : "idle",
  )
  const [sending, startUpload] = useTransition()
  const fileInput = useRef<HTMLInputElement>(null)

  /** Veio do dispositivo, e não de um endereço que alguém colou. */
  const uploaded = value.startsWith(UPLOAD_PREFIX)

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

  const handleFile = (file: File | undefined) => {
    if (!file) return

    startUpload(async () => {
      try {
        const prepared = await prepare(file)

        const body = new FormData()
        // O nome é cosmético — o servidor decide pelo tipo do arquivo —, mas a
        // extensão certa evita confusão em log e em depuração.
        body.append("file", prepared, `imagem.${prepared.type.split("/")[1]}`)

        const result = await uploadImage(barbershopId, body)

        if (!result.ok) {
          toast.error(result.message)
          return
        }

        onChange(result.data)
        toast.success("Imagem enviada. Salve o formulário para valer.")
      } catch (error) {
        toast.error(messageFrom(error, "Não foi possível enviar a imagem."))
      } finally {
        // Zera o input para que escolher o mesmo arquivo de novo ainda dispare
        // o evento — o navegador não reemite `change` para valor idêntico.
        if (fileInput.current) fileInput.current.value = ""
      }
    })
  }

  return (
    <div className="space-y-1.5">
      {/* Sem arquivo há um campo para o rótulo apontar; com arquivo não há
          controle nenhum, e um `label` solto atrapalha o leitor de tela mais do
          que ajuda — o nome vai para o grupo abaixo. */}
      {uploaded ? (
        <span className="block text-sm font-medium leading-none">{label}</span>
      ) : (
        <Label htmlFor={id}>{label}</Label>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {uploaded ? (
          /*
           * Quem enviou um arquivo não deve continuar vendo um campo que pede
           * endereço: o endereço existe, mas é detalhe interno e não diz nada a
           * quem escolheu a foto na galeria. Some o campo, fica o fato.
           */
          <div
            role="group"
            aria-label={label}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input px-3 py-2 text-sm"
          >
            <FileCheck2 size={15} className="shrink-0 text-primary" />
            <span className="truncate">Imagem enviada do dispositivo</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto shrink-0"
              onClick={() => onChange("")}
            >
              Remover
            </Button>
          </div>
        ) : (
          <Input
            id={id}
            required={required}
            inputMode="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Cole um endereço ou envie um arquivo"
            className="min-w-0 flex-1"
          />
        )}

        <input
          ref={fileInput}
          type="file"
          /*
           * `image/*` e não a lista fechada: no iPhone a lista restrita esconde
           * metade da galeria, porque a foto está em HEIC. Aberto, o próprio
           * iOS entrega uma versão JPG na hora de escolher — e o que não der
           * para ler cai numa mensagem que diz o que fazer.
           */
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
          aria-hidden="true"
          tabIndex={-1}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={sending}
          onClick={() => fileInput.current?.click()}
          className="shrink-0"
        >
          {sending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          {uploaded ? "Trocar arquivo" : "Enviar arquivo"}
        </Button>
      </div>

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
            "Cole o endereço de uma imagem hospedada publicamente, ou envie um arquivo do seu dispositivo. A prévia confirma se funcionou.")
          )}
        </p>
      </div>
    </div>
  )
}

export default ImageField
