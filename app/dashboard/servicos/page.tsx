import { notFound } from "next/navigation"
import { Scissors } from "lucide-react"
import { EmptyState, OwnerOnly, PageHeader } from "../_components/ui"
import ServiceForm from "../_components/service-form"
import { isOwnerOf } from "@/app/_actions/dashboard/guard"
import { db } from "@/app/_lib/prisma"
import {
  getBarbershopBySlug,
  getManagedBarbershops,
  getPerformance,
} from "@/app/_data/dashboard"
import { formatCurrency, formatDuration } from "@/app/_lib/utils"

export const metadata = { title: "Serviços" }

interface PageProps {
  searchParams: { shop?: string }
}

const ServicesPage = async ({ searchParams }: PageProps) => {
  const [shops, barbershop] = await Promise.all([
    getManagedBarbershops(),
    getBarbershopBySlug(searchParams.shop),
  ])

  if (!barbershop) return notFound()

  if (!(await isOwnerOf(barbershop.id))) {
    return <OwnerOnly title="Serviços" shops={shops} current={barbershop} />
  }

  const [services, performance] = await Promise.all([
    db.barbershopService.findMany({
      where: { barbershopId: barbershop.id },
      orderBy: { price: "desc" },
    }),
    getPerformance(barbershop.id, "30d"),
  ])

  return (
    <>
      <PageHeader
        title="Serviços"
        description={`${services.length} serviços no cardápio da ${barbershop.name}.`}
        shops={shops}
        current={barbershop}
      >
        <ServiceForm barbershopId={barbershop.id} />
      </PageHeader>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {services.length > 0 ? (
          <div className="surface overflow-hidden rounded-lg">
            <table className="hidden w-full text-sm md:table">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-semibold">Serviço</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Duração</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Preço</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Vendas (30d)</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Receita (30d)</th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {services.map((service) => {
                  const stats = performance.services.find(
                    (s) => s.name === service.name,
                  )

                  return (
                    <tr
                      key={service.id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{service.name}</p>
                        <p className="max-w-md truncate text-xs text-muted-foreground">
                          {service.description}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatDuration(service.durationMinutes)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium">
                        {formatCurrency(Number(service.price))}
                      </td>
                      <td className="px-4 py-3">{stats?.count ?? 0}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatCurrency(stats?.revenue ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ServiceForm
                          barbershopId={barbershop.id}
                          service={{
                            id: service.id,
                            name: service.name,
                            description: service.description,
                            price: Number(service.price),
                            durationMinutes: service.durationMinutes,
                            imageUrl: service.imageUrl,
                          }}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <ul className="divide-y divide-white/[0.06] md:hidden">
              {services.map((service) => {
                const stats = performance.services.find(
                  (s) => s.name === service.name,
                )

                return (
                  <li key={service.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(service.durationMinutes)} ·{" "}
                          {stats?.count ?? 0} vendas em 30d
                        </p>
                      </div>
                      <span className="shrink-0 font-display font-bold text-primary">
                        {formatCurrency(Number(service.price))}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-end">
                      <ServiceForm
                        barbershopId={barbershop.id}
                        service={{
                          id: service.id,
                          name: service.name,
                          description: service.description,
                          price: Number(service.price),
                          durationMinutes: service.durationMinutes,
                          imageUrl: service.imageUrl,
                        }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <EmptyState
            icon={Scissors}
            title="Nenhum serviço cadastrado"
            description="Esta barbearia ainda não tem serviços no cardápio."
          />
        )}
      </div>
    </>
  )
}

export default ServicesPage
