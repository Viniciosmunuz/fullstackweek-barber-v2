import Link from "next/link"
import { Suspense } from "react"
import { Lock, type LucideIcon } from "lucide-react"
import ShopSwitcher from "./shop-switcher"
import { cn, formatCurrency } from "@/app/_lib/utils"
import { PERIOD_LABELS, type Period } from "@/app/_data/dashboard"

/* -------------------------------------------------------------------------- */
/* Cabeçalho                                                                   */
/* -------------------------------------------------------------------------- */

interface Shop {
  id: string
  name: string
  slug: string
  logoKey: string
  logoUrl: string | null
  accentColor: string
}

export const PageHeader = ({
  title,
  description,
  shops,
  current,
  children,
}: {
  title: string
  description?: string
  shops: Shop[]
  current: Shop
  children?: React.ReactNode
}) => (
  <header className="border-b border-white/[0.06] px-4 py-5 sm:px-6 lg:px-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <Suspense fallback={<div className="h-9" />}>
        <ShopSwitcher shops={shops} current={current} />
      </Suspense>
    </div>

    {children && <div className="mt-4">{children}</div>}
  </header>
)

/* -------------------------------------------------------------------------- */
/* Filtro de período                                                           */
/* -------------------------------------------------------------------------- */

export const PeriodFilter = ({
  basePath,
  shop,
  active,
}: {
  basePath: string
  shop: string
  active: Period
}) => (
  <div className="flex flex-wrap gap-1" role="group" aria-label="Período">
    {(Object.keys(PERIOD_LABELS) as Period[]).map((period) => (
      <Link
        key={period}
        href={`${basePath}?shop=${shop}&period=${period}`}
        aria-current={period === active ? "true" : undefined}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          period === active
            ? "bg-white/[0.09] text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {PERIOD_LABELS[period]}
      </Link>
    ))}
  </div>
)

/* -------------------------------------------------------------------------- */
/* Métricas                                                                    */
/* -------------------------------------------------------------------------- */

export const MetricCard = ({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
}) => (
  <div className="surface rounded-lg p-5">
    <div className="flex items-start justify-between gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <Icon size={16} className="shrink-0 text-primary" aria-hidden="true" />
    </div>
    <p className="mt-3 font-display text-2xl font-extrabold tracking-tight">
      {value}
    </p>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
)

/* -------------------------------------------------------------------------- */
/* Status do agendamento                                                       */
/* -------------------------------------------------------------------------- */

const STATUS_STYLE = {
  PENDING: { label: "Pendente", className: "bg-warning/15 text-warning" },
  CONFIRMED: { label: "Confirmado", className: "bg-primary/15 text-primary" },
  COMPLETED: { label: "Concluído", className: "bg-success/15 text-success" },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-destructive/15 text-destructive",
  },
} as const

export const StatusBadge = ({
  status,
}: {
  status: keyof typeof STATUS_STYLE
}) => {
  const { label, className } = STATUS_STYLE[status]
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold",
        className,
      )}
    >
      {label}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Gráfico de barras                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Barras em CSS puro. Uma biblioteca de gráficos custaria um pacote inteiro
 * para um único gráfico; aqui o valor já vem calculado do servidor e só precisa
 * virar altura. A tabela associada mantém o dado acessível a leitor de tela.
 */
export const BarChart = ({
  data,
}: {
  data: { label: string; revenue: number; count: number }[]
}) => {
  const max = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <figure>
      {/*
       * As barras ficam sozinhas no container de altura fixa e os rótulos vão
       * para uma linha irmã. Envolver barra e rótulo no mesmo flex-col faria a
       * altura percentual da barra resolver contra um pai de altura automática
       * — e colapsar para zero.
       */}
      <div
        className="flex h-52 items-end gap-1.5 sm:gap-2"
        role="img"
        aria-label="Faturamento mensal dos últimos 12 meses"
      >
        {data.map((item) => (
          <div
            key={item.label}
            title={`${item.label}: ${formatCurrency(item.revenue)} · ${item.count} atendimentos`}
            className="min-w-0 flex-1 rounded-t bg-gradient-to-t from-primary/35 to-primary transition-opacity hover:opacity-75"
            style={{ height: `${Math.max((item.revenue / max) * 100, 2)}%` }}
          />
        ))}
      </div>

      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {data.map((item) => (
          <span
            key={item.label}
            className="min-w-0 flex-1 truncate text-center text-[10px] capitalize text-muted-foreground"
          >
            {item.label}
          </span>
        ))}
      </div>

      <figcaption className="sr-only">
        <table>
          <caption>Faturamento por mês</caption>
          <thead>
            <tr>
              <th scope="col">Mês</th>
              <th scope="col">Faturamento</th>
              <th scope="col">Atendimentos</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.label}>
                <th scope="row">{item.label}</th>
                <td>{formatCurrency(item.revenue)}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  )
}

/* -------------------------------------------------------------------------- */
/* Estado vazio                                                                */
/* -------------------------------------------------------------------------- */

export const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) => (
  <div className="surface flex flex-col items-center rounded-lg px-6 py-14 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground">
      <Icon size={22} />
    </span>
    <h2 className="mt-4 font-display font-bold">{title}</h2>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
  </div>
)

/* -------------------------------------------------------------------------- */
/* Área restrita ao responsável                                                */
/* -------------------------------------------------------------------------- */

/**
 * O que a equipe vê ao abrir uma área que é do dono.
 *
 * Mostra a página em vez de devolver 404: o funcionário pode ter chegado por
 * um link salvo, e "não existe" o mandaria procurar defeito onde não há. Dizer
 * de quem é a área, e a quem pedir, resolve sem virar suporte.
 *
 * Vale como cortesia, não como proteção — o dado sequer é buscado, e as
 * mutações continuam recusando no servidor.
 */
export const OwnerOnly = ({
  title,
  shops,
  current,
}: {
  title: string
  shops: Shop[]
  current: Shop
}) => (
  <>
    <PageHeader title={title} shops={shops} current={current} />
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <EmptyState
        icon={Lock}
        title="Área do responsável"
        description={`Só quem responde pela ${current.name} abre esta parte do painel. Sua agenda e seus clientes continuam disponíveis no menu.`}
      />
    </div>
  </>
)
