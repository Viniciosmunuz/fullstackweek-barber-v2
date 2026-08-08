import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeftIcon, MapPin, MenuIcon, Star } from "lucide-react"
import PhoneItem from "@/app/_components/phone-item"
import ServiceItem from "@/app/_components/service-item"
import SidebarSheet from "@/app/_components/sidebar-sheet"
import BarbershopLogo from "@/app/_components/brand/barbershop-logo"
import BarberAvatar from "@/app/_components/barber-avatar"
import { Button } from "@/app/_components/ui/button"
import { Sheet, SheetTrigger } from "@/app/_components/ui/sheet"
import { db } from "@/app/_lib/prisma"
import { getWeekdayLabel } from "@/app/_lib/utils"

interface BarbershopPageProps {
  params: { id: string }
}

async function getBarbershop(id: string) {
  return db.barbershop.findUnique({
    where: { id },
    include: {
      services: { orderBy: { price: "asc" } },
      // Profissional inativo não aparece para agendar, mas segue no histórico.
      barbers: { where: { active: true }, orderBy: { name: "asc" } },
      openingHours: { orderBy: { weekday: "asc" } },
    },
  })
}

export async function generateMetadata({
  params,
}: BarbershopPageProps): Promise<Metadata> {
  const barbershop = await getBarbershop(params.id)
  if (!barbershop) return { title: "Barbearia não encontrada" }

  return {
    title: barbershop.name,
    description: barbershop.slogan,
  }
}

const BarbershopPage = async ({ params }: BarbershopPageProps) => {
  const barbershop = await getBarbershop(params.id)

  if (!barbershop) {
    return notFound()
  }

  const accent = barbershop.accentColor
  const today = new Date().getDay()

  // Decimal do Prisma não atravessa para Client Component: converte aqui.
  const services = barbershop.services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    imageUrl: service.imageUrl,
    price: Number(service.price),
    durationMinutes: service.durationMinutes,
  }))

  const barbers = barbershop.barbers.map((barber) => ({
    id: barber.id,
    name: barber.name,
    specialty: barber.specialty,
    imageUrl: barber.imageUrl,
  }))

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* CAPA                                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative h-[260px] w-full sm:h-[340px] lg:h-[400px]">
        <Image
          alt={`Ambiente da ${barbershop.name}`}
          src={barbershop.imageUrl}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />

        <div className="container relative flex h-full flex-col">
          <div className="flex items-center justify-between pt-5">
            <Button size="icon" variant="outline" className="bg-background/60" asChild>
              <Link href="/barbershops" aria-label="Voltar para a busca">
                <ChevronLeftIcon size={18} />
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-background/60"
                  aria-label="Abrir menu"
                >
                  <MenuIcon size={18} />
                </Button>
              </SheetTrigger>
              <SidebarSheet />
            </Sheet>
          </div>

          <div className="mt-auto flex items-end gap-4 pb-6">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-background/85 backdrop-blur sm:h-20 sm:w-20"
              style={{ boxShadow: `inset 0 0 0 1px ${accent}40` }}
            >
              <BarbershopLogo
                logoKey={barbershop.logoKey}
                accentColor={accent}
                label={`Logo da ${barbershop.name}`}
                className="h-10 w-10 sm:h-12 sm:w-12"
              />
            </span>

            <div className="min-w-0">
              <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                {barbershop.name}
              </h1>
              <p
                className="mt-1 text-sm sm:text-base"
                style={{ color: accent }}
              >
                {barbershop.slogan}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container grid gap-10 pb-16 lg:grid-cols-[1fr_320px] lg:gap-12">
        <div className="min-w-0">
          {/* METADADOS */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-white/[0.06] pb-6 text-sm">
            <span className="flex items-center gap-1.5">
              <Star size={16} className="fill-primary text-primary" />
              <strong className="font-semibold">
                {Number(barbershop.rating).toFixed(1).replace(".", ",")}
              </strong>
              <span className="text-muted-foreground">
                ({barbershop.reviewCount} avaliações)
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin size={15} />
              {barbershop.address} · {barbershop.city}
            </span>
          </div>

          {/* SOBRE */}
          <section className="border-b border-white/[0.06] py-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sobre
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-foreground/90">
              {barbershop.description}
            </p>
          </section>

          {/* EQUIPE */}
          {barbers.length > 0 && (
            <section className="border-b border-white/[0.06] py-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Equipe
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {barbershop.barbers.map((barber) => (
                  <li
                    key={barber.id}
                    className="surface flex items-center gap-3 rounded-lg p-3"
                  >
                    <BarberAvatar
                      name={barber.name}
                      imageUrl={barber.imageUrl}
                      accentColor={accent}
                      className="h-12 w-12"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{barber.name}</p>
                      <p className="truncate text-xs" style={{ color: accent }}>
                        {barber.specialty}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {barber.bio}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* SERVIÇOS */}
          <section className="py-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Serviços
            </h2>
            <div className="mt-4 space-y-3">
              {services.map((service) => (
                <ServiceItem
                  key={service.id}
                  service={service}
                  barbers={barbers}
                  barbershopName={barbershop.name}
                  accentColor={accent}
                />
              ))}
            </div>
          </section>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* LATERAL                                                         */}
        {/* -------------------------------------------------------------- */}
        <aside className="space-y-6 lg:pt-6">
          <div className="surface rounded-lg p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Horário de funcionamento
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              {barbershop.openingHours.map((hour) => {
                const isToday = hour.weekday === today
                return (
                  <div
                    key={hour.id}
                    className={
                      isToday
                        ? "flex justify-between gap-4 font-semibold text-foreground"
                        : "flex justify-between gap-4 text-muted-foreground"
                    }
                  >
                    <dt>
                      {getWeekdayLabel(hour.weekday)}
                      {isToday && (
                        <span className="ml-2 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          hoje
                        </span>
                      )}
                    </dt>
                    <dd>
                      {hour.closed
                        ? "Fechado"
                        : `${hour.opensAt} – ${hour.closesAt}`}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>

          <div className="surface rounded-lg p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Contato
            </h2>
            <div className="mt-4 space-y-3">
              {barbershop.phones.map((phone) => (
                <PhoneItem key={phone} phone={phone} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

export default BarbershopPage
