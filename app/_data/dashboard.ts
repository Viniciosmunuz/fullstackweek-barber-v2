import { getServerSession } from "next-auth"
import { subDays, subMonths, startOfDay, endOfDay, startOfMonth } from "date-fns"
import { db } from "../_lib/prisma"
import { authOptions } from "../_lib/auth"

/** Janelas de tempo aceitas pelos relatórios. */
export type Period = "today" | "7d" | "30d" | "12m"

export const PERIOD_LABELS: Record<Period, string> = {
  today: "Hoje",
  "7d": "7 dias",
  "30d": "30 dias",
  "12m": "12 meses",
}

export function resolvePeriod(period: Period): { from: Date; to: Date } {
  const now = new Date()

  switch (period) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) }
    case "7d":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) }
    case "12m":
      return { from: startOfMonth(subMonths(now, 11)), to: endOfDay(now) }
    default:
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) }
  }
}

/**
 * Restrição de privacidade do painel.
 *
 * O catálogo é público e qualquer pessoa autenticada alcança o painel, então a
 * consulta nunca pode devolver agendamentos de outros usuários reais: só entram
 * os clientes de demonstração e os do próprio usuário logado. Sem isso, nome,
 * e-mail e histórico de quem entrasse com a conta Google ficariam visíveis para
 * estranhos.
 */
async function visibilityFilter() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  return {
    OR: [{ user: { isDemo: true } }, ...(userId ? [{ userId }] : [])],
  }
}

/** Barbearias disponíveis no seletor do painel. */
export async function getManagedBarbershops() {
  return db.barbershop.findMany({
    select: { id: true, name: true, slug: true, accentColor: true, logoKey: true },
    orderBy: { name: "asc" },
  })
}

export async function getBarbershopBySlug(slug?: string) {
  if (slug) {
    const found = await db.barbershop.findUnique({ where: { slug } })
    if (found) return found
  }
  return db.barbershop.findFirst({ orderBy: { name: "asc" } })
}

interface ScopeArgs {
  barbershopId: string
  from: Date
  to: Date
}

/** Agendamentos da barbearia no período, já filtrados por visibilidade. */
async function findBookings({ barbershopId, from, to }: ScopeArgs) {
  const visibility = await visibilityFilter()

  return db.booking.findMany({
    where: {
      AND: [
        visibility,
        { service: { barbershopId } },
        { date: { gte: from, lte: to } },
      ],
    },
    select: {
      id: true,
      date: true,
      status: true,
      user: { select: { id: true, name: true, phone: true, image: true } },
      barber: { select: { id: true, name: true, specialty: true } },
      service: { select: { id: true, name: true, price: true, durationMinutes: true } },
    },
    orderBy: { date: "asc" },
  })
}

export interface DashboardBooking {
  id: string
  date: Date
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  clientName: string
  clientPhone: string | null
  clientImage: string | null
  barberName: string | null
  serviceName: string
  price: number
  durationMinutes: number
}

function toDashboardBooking(row: Awaited<ReturnType<typeof findBookings>>[number]): DashboardBooking {
  return {
    id: row.id,
    date: row.date,
    status: row.status,
    clientName: row.user.name ?? "Cliente",
    clientPhone: row.user.phone,
    clientImage: row.user.image,
    barberName: row.barber?.name ?? null,
    serviceName: row.service.name,
    price: Number(row.service.price),
    durationMinutes: row.service.durationMinutes,
  }
}

/**
 * Métricas do topo do painel. `revenue` conta apenas atendimentos concluídos —
 * somar cancelados ou ainda pendentes inflaria o faturamento.
 */
export async function getOverview(barbershopId: string, period: Period) {
  const { from, to } = resolvePeriod(period)
  const rows = (await findBookings({ barbershopId, from, to })).map(toDashboardBooking)

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const completed = rows.filter((r) => r.status === "COMPLETED")
  const cancelled = rows.filter((r) => r.status === "CANCELLED")
  const todays = rows.filter((r) => r.date >= todayStart && r.date <= todayEnd)

  const revenue = completed.reduce((sum, r) => sum + r.price, 0)
  const clients = new Set(
    rows.filter((r) => r.status !== "CANCELLED").map((r) => r.clientName),
  )

  return {
    bookingsToday: todays.filter((r) => r.status !== "CANCELLED").length,
    clients: clients.size,
    revenue,
    completed: completed.length,
    cancelled: cancelled.length,
    ticket: completed.length ? revenue / completed.length : 0,
    rows,
  }
}

/** Agenda de um dia específico, para a tela de agendamentos. */
export async function getAgenda(barbershopId: string, day: Date) {
  const rows = await findBookings({
    barbershopId,
    from: startOfDay(day),
    to: endOfDay(day),
  })
  return rows.map(toDashboardBooking)
}

export interface ClientSummary {
  name: string
  phone: string | null
  image: string | null
  total: number
  spent: number
  lastVisit: Date | null
}

/** Clientes agregados a partir do histórico visível. */
export async function getClients(barbershopId: string): Promise<ClientSummary[]> {
  const visibility = await visibilityFilter()

  const rows = await db.booking.findMany({
    where: { AND: [visibility, { service: { barbershopId } }] },
    select: {
      date: true,
      status: true,
      user: { select: { id: true, name: true, phone: true, image: true } },
      service: { select: { price: true } },
    },
  })

  const byClient = new Map<string, ClientSummary>()

  for (const row of rows) {
    if (row.status === "CANCELLED") continue

    const key = row.user.id
    const current = byClient.get(key) ?? {
      name: row.user.name ?? "Cliente",
      phone: row.user.phone,
      image: row.user.image,
      total: 0,
      spent: 0,
      lastVisit: null,
    }

    current.total += 1
    if (row.status === "COMPLETED") current.spent += Number(row.service.price)
    if (!current.lastVisit || row.date > current.lastVisit) {
      current.lastVisit = row.date
    }

    byClient.set(key, current)
  }

  return [...byClient.values()].sort((a, b) => b.spent - a.spent)
}

/** Faturamento por mês nos últimos 12 meses, para o gráfico de barras. */
export async function getMonthlyRevenue(barbershopId: string) {
  const { from, to } = resolvePeriod("12m")
  const rows = await findBookings({ barbershopId, from, to })

  const buckets = new Map<string, { label: string; revenue: number; count: number }>()
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const d = subMonths(now, i)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    buckets.set(key, {
      label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      revenue: 0,
      count: 0,
    })
  }

  for (const row of rows) {
    if (row.status !== "COMPLETED") continue
    const key = `${row.date.getFullYear()}-${row.date.getMonth()}`
    const bucket = buckets.get(key)
    if (!bucket) continue
    bucket.revenue += Number(row.service.price)
    bucket.count += 1
  }

  return [...buckets.values()]
}

/** Ranking de serviços e desempenho por profissional no período. */
export async function getPerformance(barbershopId: string, period: Period) {
  const { from, to } = resolvePeriod(period)
  const rows = (await findBookings({ barbershopId, from, to })).map(toDashboardBooking)
  const done = rows.filter((r) => r.status === "COMPLETED")

  const services = new Map<string, { name: string; count: number; revenue: number }>()
  const barbers = new Map<string, { name: string; count: number; revenue: number }>()

  for (const row of done) {
    const s = services.get(row.serviceName) ?? {
      name: row.serviceName,
      count: 0,
      revenue: 0,
    }
    s.count += 1
    s.revenue += row.price
    services.set(row.serviceName, s)

    const barberName = row.barberName ?? "Sem profissional"
    const b = barbers.get(barberName) ?? { name: barberName, count: 0, revenue: 0 }
    b.count += 1
    b.revenue += row.price
    barbers.set(barberName, b)
  }

  return {
    services: [...services.values()].sort((a, b) => b.count - a.count),
    barbers: [...barbers.values()].sort((a, b) => b.revenue - a.revenue),
  }
}
