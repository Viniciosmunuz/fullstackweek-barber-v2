import Image from "next/image"
import Link from "next/link"
import { MapPin, Star } from "lucide-react"
import { Button } from "./ui/button"
import BarbershopLogo from "./brand/barbershop-logo"
import { cn } from "@/app/_lib/utils"

/**
 * Só os campos que o card realmente usa. Evita exigir o objeto Prisma inteiro
 * (com Decimal e datas) e mantém o componente utilizável a partir de qualquer
 * consulta com `select`.
 */
export interface BarbershopCardData {
  id: string
  name: string
  slogan: string
  address: string
  city: string
  imageUrl: string
  logoKey: string
  accentColor: string
  rating: string | number
  reviewCount: number
  services?: { name: string }[]
}

interface BarbershopItemProps {
  barbershop: BarbershopCardData
  className?: string
}

const BarbershopItem = ({ barbershop, className }: BarbershopItemProps) => {
  const services = barbershop.services?.slice(0, 3) ?? []

  return (
    <article
      className={cn(
        "surface surface-hover group flex flex-col overflow-hidden rounded-lg",
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          alt={`Ambiente da ${barbershop.name}`}
          src={barbershop.imageUrl}
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* Véu escuro garante contraste da nota e da logo sobre qualquer foto. */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />

        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
          <Star size={12} className="fill-primary text-primary" />
          {Number(barbershop.rating).toFixed(1).replace(".", ",")}
          <span className="font-normal text-muted-foreground">
            ({barbershop.reviewCount})
          </span>
        </span>

        <span
          className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-md bg-background/90 backdrop-blur-sm"
          style={{ boxShadow: `inset 0 0 0 1px ${barbershop.accentColor}33` }}
        >
          <BarbershopLogo
            logoKey={barbershop.logoKey}
            accentColor={barbershop.accentColor}
            className="h-7 w-7"
          />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-bold leading-tight">
            {barbershop.name}
          </h3>
          <p
            className="mt-0.5 truncate text-[13px]"
            style={{ color: barbershop.accentColor }}
          >
            {barbershop.slogan}
          </p>
        </div>

        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin size={13} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">
            {barbershop.address} · {barbershop.city}
          </span>
        </p>

        {services.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {services.map((service) => (
              <li
                key={service.name}
                className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                {service.name}
              </li>
            ))}
          </ul>
        )}

        <Button className="mt-auto w-full" asChild>
          <Link href={`/barbershops/${barbershop.id}`}>
            Agendar
            <span className="sr-only"> na {barbershop.name}</span>
          </Link>
        </Button>
      </div>
    </article>
  )
}

export default BarbershopItem
