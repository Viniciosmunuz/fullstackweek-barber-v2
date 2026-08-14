import { subDays, subMonths } from "date-fns"
/*
 * As bordas de dia e de mês vêm do fuso da barbearia, não do processo. No
 * servidor em UTC, "hoje" começava às 21:00 do dia anterior em Brasília — e o
 * painel contava como de hoje o que ainda era de ontem.
 */
import {
  startOfDayInZone as startOfDay,
  endOfDayInZone as endOfDay,
  startOfMonthInZone as startOfMonth,
} from "../_lib/timezone"
import { db } from "../_lib/prisma"
import { getManagedBarbershopIds } from "../_actions/dashboard/guard"

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

/*
 * Aqui existia um filtro que só deixava passar agendamentos de clientes de
 * demonstração e do próprio usuário logado.
 *
 * Ele fazia sentido enquanto qualquer pessoa autenticada alcançava o painel: o
 * catálogo é público, e sem o filtro o nome e o telefone de quem entrasse com
 * uma conta Google ficariam à vista de estranhos.
 *
 * Deixou de fazer quando o acesso passou a exigir vínculo com a barbearia. A
 * partir daí ele só atrapalhava, e do pior jeito: cliente de verdade agendava e
 * a agenda da barbearia não mostrava. A casa nunca saberia que alguém vem.
 *
 * Quem limita agora é o escopo — toda consulta já filtra por `barbershopId`, e
 * quem chega até aqui provou ser gestor daquela casa. Ver os clientes da
 * própria barbearia é exatamente o trabalho.
 */

/**
 * Barbearias que o usuário administra — é o que alimenta o seletor do painel.
 *
 * A restrição vale também para leitura, não só para as mutações: mostrar o
 * faturamento de uma casa que não é sua já seria vazamento, mesmo sem permitir
 * edição.
 */
export async function getManagedBarbershops() {
  const ids = await getManagedBarbershopIds()
  if (ids.length === 0) return []

  return db.barbershop.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      slug: true,
      accentColor: true,
      logoKey: true,
      logoUrl: true,
    },
    orderBy: { name: "asc" },
  })
}

/**
 * Resolve a barbearia em foco dentro do que o usuário pode ver. Um slug de
 * barbearia alheia cai para a primeira gerenciada, em vez de expor os dados.
 */
export async function getBarbershopBySlug(slug?: string) {
  const ids = await getManagedBarbershopIds()
  if (ids.length === 0) return null

  if (slug) {
    const found = await db.barbershop.findFirst({
      where: { slug, id: { in: ids } },
    })
    if (found) return found
  }

  return db.barbershop.findFirst({
    where: { id: { in: ids } },
    orderBy: { name: "asc" },
  })
}

interface ScopeArgs {
  barbershopId: string
  from: Date
  to: Date
}

/** Agendamentos da barbearia no período. */
async function findBookings({ barbershopId, from, to }: ScopeArgs) {
  return db.booking.findMany({
    where: {
      AND: [{ service: { barbershopId } }, { date: { gte: from, lte: to } }],
    },
    select: {
      id: true,
      date: true,
      status: true,
      user: { select: { id: true, name: true, phone: true, image: true } },
      barber: { select: { id: true, name: true, specialty: true } },
      service: {
        select: { id: true, name: true, price: true, durationMinutes: true },
      },
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

function toDashboardBooking(
  row: Awaited<ReturnType<typeof findBookings>>[number],
): DashboardBooking {
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
  const rows = (await findBookings({ barbershopId, from, to })).map(
    toDashboardBooking,
  )

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

/** Clientes agregados a partir do histórico da barbearia. */
export async function getClients(
  barbershopId: string,
): Promise<ClientSummary[]> {
  const rows = await db.booking.findMany({
    where: { service: { barbershopId } },
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

  // Array.from em vez de spread: o tsconfig não fixa `target`, então cai em ES5,
  // onde iterar Map.values() com spread exige downlevelIteration.
  return Array.from(byClient.values()).sort((a, b) => b.spent - a.spent)
}

/** Faturamento por mês nos últimos 12 meses, para o gráfico de barras. */
export async function getMonthlyRevenue(barbershopId: string) {
  const { from, to } = resolvePeriod("12m")
  const rows = await findBookings({ barbershopId, from, to })

  const buckets = new Map<
    string,
    { label: string; revenue: number; count: number }
  >()
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

  return Array.from(buckets.values())
}

/** Ranking de serviços e desempenho por profissional no período. */
export async function getPerformance(barbershopId: string, period: Period) {
  const { from, to } = resolvePeriod(period)
  const rows = (await findBookings({ barbershopId, from, to })).map(
    toDashboardBooking,
  )
  const done = rows.filter((r) => r.status === "COMPLETED")

  const services = new Map<
    string,
    { name: string; count: number; revenue: number }
  >()
  const barbers = new Map<
    string,
    { name: string; count: number; revenue: number }
  >()

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
    const b = barbers.get(barberName) ?? {
      name: barberName,
      count: 0,
      revenue: 0,
    }
    b.count += 1
    b.revenue += row.price
    barbers.set(barberName, b)
  }

  return {
    services: Array.from(services.values()).sort((a, b) => b.count - a.count),
    barbers: Array.from(barbers.values()).sort((a, b) => b.revenue - a.revenue),
  }
}
