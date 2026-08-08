import { notFound } from "next/navigation"
import { Info } from "lucide-react"
import { PageHeader } from "../_components/ui"
import BarbershopLogo from "@/app/_components/brand/barbershop-logo"
import { db } from "@/app/_lib/prisma"
import {
  getBarbershopBySlug,
  getManagedBarbershops,
} from "@/app/_data/dashboard"
import { getWeekdayLabel } from "@/app/_lib/utils"

export const metadata = { title: "Configurações" }

interface PageProps {
  searchParams: { shop?: string }
}

const SettingsPage = async ({ searchParams }: PageProps) => {
  const [shops, barbershop] = await Promise.all([
    getManagedBarbershops(),
    getBarbershopBySlug(searchParams.shop),
  ])

  if (!barbershop) return notFound()

  const openingHours = await db.openingHour.findMany({
    where: { barbershopId: barbershop.id },
    orderBy: { weekday: "asc" },
  })

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Dados cadastrais e funcionamento da unidade."
        shops={shops}
        current={barbershop}
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div
          className="mb-6 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/[0.06] p-4 text-sm"
          role="note"
        >
          <Info size={17} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-muted-foreground">
            Esta tela é somente leitura nesta versão. A edição do cadastro ainda
            não foi implementada — os dados vêm direto do banco.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="surface rounded-lg p-5">
            <h2 className="mb-4 font-display font-bold">Identidade</h2>

            <div className="mb-5 flex items-center gap-3">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-lg"
                style={{ boxShadow: `inset 0 0 0 1px ${barbershop.accentColor}40` }}
              >
                <BarbershopLogo
                  logoKey={barbershop.logoKey}
                  accentColor={barbershop.accentColor}
                  className="h-8 w-8"
                />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display font-bold">
                  {barbershop.name}
                </p>
                <p
                  className="truncate text-sm"
                  style={{ color: barbershop.accentColor }}
                >
                  {barbershop.slogan}
                </p>
              </div>
            </div>

            <dl className="space-y-3 border-t border-white/[0.06] pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Endereço</dt>
                <dd className="text-right font-medium">{barbershop.address}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Cidade</dt>
                <dd className="text-right font-medium">{barbershop.city}</dd>
              </div>
              {barbershop.phones.map((phone, index) => (
                <div key={phone} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    Telefone {index + 1}
                  </dt>
                  <dd className="text-right font-medium">{phone}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Identificador</dt>
                <dd className="text-right font-mono text-xs">
                  {barbershop.slug}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Cor da marca</dt>
                <dd className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: barbershop.accentColor }}
                    aria-hidden="true"
                  />
                  {barbershop.accentColor}
                </dd>
              </div>
            </dl>
          </section>

          <section className="surface rounded-lg p-5">
            <h2 className="mb-4 font-display font-bold">
              Horário de funcionamento
            </h2>
            <dl className="space-y-2.5 text-sm">
              {openingHours.map((hour) => (
                <div key={hour.id} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    {getWeekdayLabel(hour.weekday)}
                  </dt>
                  <dd className="font-medium">
                    {hour.closed
                      ? "Fechado"
                      : `${hour.opensAt} – ${hour.closesAt}`}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </>
  )
}

export default SettingsPage
