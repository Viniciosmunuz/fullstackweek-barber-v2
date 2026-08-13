import Image from "next/image"
import Link from "next/link"
import { MapPin, Star } from "lucide-react"
import BarbershopLogo from "./brand/barbershop-logo"
import { cn } from "@/app/_lib/utils"

/**
 * Só os campos que o card usa, para o componente aceitar qualquer consulta com
 * `select` em vez de exigir a linha inteira do Prisma.
 */
export interface BarbershopCardData {
  id: string
  name: string
  slogan: string
  address: string
  neighborhood: string | null
  city: string
  imageUrl: string
  logoKey: string
  logoUrl: string | null
  accentColor: string
  rating: string | number
  reviewCount: number
  services?: { name: string }[]
}

interface BarbershopItemProps {
  barbershop: BarbershopCardData
  /** `priority` só na primeira fileira, para não competir com o resto. */
  priority?: boolean
  className?: string
}

/**
 * Card compacto de barbearia, desenhado para grade.
 *
 * A versão anterior era um bloco alto e largo, um por linha, que empurrava a
 * segunda barbearia para fora da tela no celular. Aqui a informação foi cortada
 * ao essencial — foto, nota, nome, localidade e dois serviços — para caberem
 * dois cards lado a lado em 375px sem apertar o texto.
 *
 * O cartão inteiro é o link: em tela de toque, mirar um botão pequeno dentro do
 * card é pior do que tocar em qualquer lugar dele.
 */
const BarbershopItem = ({
  barbershop,
  priority = false,
  className,
}: BarbershopItemProps) => {
  const services = barbershop.services?.slice(0, 2) ?? []
  const place = barbershop.neighborhood || barbershop.city

  return (
    <Link
      href={`/barbershops/${barbershop.id}`}
      className={cn(
        "surface group flex flex-col overflow-hidden rounded-lg transition-colors duration-200",
        "hover:border-primary/30 focus-visible:border-primary/40 active:bg-white/[0.04]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {barbershop.imageUrl ? (
          <Image
            alt={`Ambiente da ${barbershop.name}`}
            src={barbershop.imageUrl}
            fill
            priority={priority}
            /* Dois cards por linha no celular, quatro no desktop. */
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-white/[0.06] to-transparent" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

        {/*
          Sem avaliação, o selo diz "Nova" em vez de mostrar uma nota. Antes
          toda barbearia nascia com 5,0 e exibia isso como se alguém tivesse
          dado — o que enganava o cliente e ainda ordenava o catálogo.
        */}
        {barbershop.reviewCount > 0 ? (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
            <Star size={10} className="fill-primary text-primary" />
            {Number(barbershop.rating).toFixed(1).replace(".", ",")}
            <span className="font-normal text-muted-foreground">
              ({barbershop.reviewCount})
            </span>
          </span>
        ) : (
          <span className="absolute left-2 top-2 rounded-full bg-background/85 px-2 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
            Nova
          </span>
        )}

        <span
          className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-md bg-background/90 backdrop-blur-sm"
          style={{ boxShadow: `inset 0 0 0 1px ${barbershop.accentColor}33` }}
        >
          <BarbershopLogo
            logoKey={barbershop.logoKey}
            logoUrl={barbershop.logoUrl}
            accentColor={barbershop.accentColor}
            className="h-5 w-5"
          />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="truncate font-display text-[13px] font-bold leading-tight sm:text-sm">
          {barbershop.name}
        </h3>

        {services.length > 0 && (
          <p className="truncate text-[11px] text-muted-foreground">
            {services.map((service) => service.name).join(" · ")}
          </p>
        )}

        <p className="mt-auto flex items-center gap-1 pt-1 text-[11px] text-muted-foreground">
          <MapPin size={11} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{place}</span>
        </p>
      </div>
    </Link>
  )
}

export default BarbershopItem
