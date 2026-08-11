import { notFound } from "next/navigation"
import { OwnerOnly, PageHeader } from "../_components/ui"
import ProfileForm from "../_components/profile-form"
import HoursForm from "../_components/hours-form"
import PublishCard from "../_components/publish-card"
import { db } from "@/app/_lib/prisma"
import {
  getBarbershopBySlug,
  getManagedBarbershops,
} from "@/app/_data/dashboard"
import { isOwnerOf } from "@/app/_actions/dashboard/guard"

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

  if (!(await isOwnerOf(barbershop.id))) {
    return <OwnerOnly title="Configurações" shops={shops} current={barbershop} />
  }

  const [openingHours, counts] = await Promise.all([
    db.openingHour.findMany({
      where: { barbershopId: barbershop.id },
      orderBy: { weekday: "asc" },
      select: {
        weekday: true,
        opensAt: true,
        closesAt: true,
        closed: true,
      },
    }),
    db.barbershop.findUnique({
      where: { id: barbershop.id },
      select: { _count: { select: { services: true, barbers: true } } },
    }),
  ])

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Dados que aparecem para o cliente e horários de atendimento."
        shops={shops}
        current={barbershop}
      />

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PublishCard
          barbershopId={barbershop.id}
          isPublished={barbershop.isPublished}
          checklist={{
            address: Boolean(barbershop.address),
            description: Boolean(barbershop.description),
            image: Boolean(barbershop.imageUrl),
            phone: barbershop.phones.length > 0,
            services: (counts?._count.services ?? 0) > 0,
            barbers: (counts?._count.barbers ?? 0) > 0,
          }}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <ProfileForm
            barbershop={{
              id: barbershop.id,
              name: barbershop.name,
              slogan: barbershop.slogan,
              description: barbershop.description,
              address: barbershop.address,
              neighborhood: barbershop.neighborhood,
              city: barbershop.city,
              phones: barbershop.phones,
              imageUrl: barbershop.imageUrl,
              logoKey: barbershop.logoKey,
              accentColor: barbershop.accentColor,
            }}
          />

          <HoursForm barbershopId={barbershop.id} hours={openingHours} />
        </div>
      </div>
    </>
  )
}

export default SettingsPage
