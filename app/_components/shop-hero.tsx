"use client"

import Image from "next/image"
import { ImageIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog"

interface ShopHeroProps {
  name: string
  slogan: string
  /** Foto do ambiente; sai do fundo e passa a abrir sob demanda. */
  imageUrl: string
  accentColor: string
  /** A logo da casa, montada por quem renderiza. */
  children: React.ReactNode
}

/**
 * Bloco de identidade no topo da página da barbearia.
 *
 * A foto do ambiente ocupava a capa inteira e a marca ficava num quadradinho de
 * canto — quem chegava via busca reconhecia o lugar pela decoração, não pela
 * barbearia. Aqui a ordem se inverte: a logo é o que aparece grande, e a foto
 * vira uma escolha de quem quer ver o espaço, num clique.
 *
 * A foto não some do topo: fica desfocada e apagada atrás, valendo só como cor
 * de fundo daquela casa. Dois gatilhos abrem o diálogo — a própria logo e um
 * texto embaixo do slogan — porque clique em imagem, sozinho, ninguém descobre.
 */
const ShopHero = ({
  name,
  slogan,
  imageUrl,
  accentColor,
  children,
}: ShopHeroProps) => (
  <Dialog>
    <div className="mt-auto flex items-end gap-4 pb-6 sm:gap-5">
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Ver a foto da ${name}`}
          className="group relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-background/85 backdrop-blur transition-transform hover:scale-[1.02] sm:h-32 sm:w-32"
          style={{ boxShadow: `inset 0 0 0 1px ${accentColor}40` }}
        >
          {children}

          <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-background/80 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <ImageIcon size={22} style={{ color: accentColor }} />
          </span>
        </button>
      </DialogTrigger>

      <div className="min-w-0 pb-1">
        <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {name}
        </h1>
        <p className="mt-1 text-sm sm:text-base" style={{ color: accentColor }}>
          {slogan}
        </p>

        <DialogTrigger asChild>
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ImageIcon size={13} />
            Ver a foto da barbearia
          </button>
        </DialogTrigger>
      </div>
    </div>

    <DialogContent className="w-[94%] max-w-3xl overflow-hidden p-0">
      <DialogTitle className="sr-only">Foto da {name}</DialogTitle>

      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
        <Image
          alt={`Ambiente da ${name}`}
          src={imageUrl}
          fill
          sizes="(min-width: 768px) 768px, 94vw"
          className="object-cover"
        />
        {/* O X de fechar é claro e fica sobre a imagem: sem este escurecimento
            ele some numa foto de parede branca. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />
      </div>
    </DialogContent>
  </Dialog>
)

export default ShopHero
