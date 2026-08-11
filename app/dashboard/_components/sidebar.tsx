"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  BarChart3,
  CalendarDays,
  KeyRound,
  LayoutDashboard,
  Scissors,
  Settings,
  Store,
  Users,
  UserSquare2,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { BarberFlowLogo } from "@/app/_components/brand/logo"
import { cn } from "@/app/_lib/utils"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
  /** Some para quem é da equipe: é decisão de negócio, não operação do dia. */
  ownerOnly?: boolean
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  {
    href: "/dashboard/barbeiros",
    label: "Barbeiros",
    icon: UserSquare2,
    ownerOnly: true,
  },
  {
    href: "/dashboard/equipe",
    label: "Equipe",
    icon: KeyRound,
    ownerOnly: true,
  },
  {
    href: "/dashboard/servicos",
    label: "Serviços",
    icon: Scissors,
    ownerOnly: true,
  },
  {
    href: "/dashboard/repasses",
    label: "Repasses",
    icon: Wallet,
    ownerOnly: true,
  },
  {
    href: "/dashboard/relatorios",
    label: "Relatórios",
    icon: BarChart3,
    ownerOnly: true,
  },
  {
    href: "/dashboard/configuracoes",
    label: "Configurações",
    icon: Settings,
    ownerOnly: true,
  },
]

interface SidebarProps {
  /** Slug da barbearia ativa, propagado nos links para não perder o contexto. */
  shop?: string
  /**
   * Barbearias do usuário e o papel dele em cada uma.
   *
   * Vem pronto do servidor, na mesma ordem que o painel usa para escolher a
   * barbearia padrão. Assim, quando a URL não traz `?shop=`, a primeira da
   * lista é a mesma que a página vai abrir — e o menu não discorda da tela.
   */
  shops: { slug: string; role: "OWNER" | "STAFF" }[]
}

const DashboardSidebar = ({ shop, shops }: SidebarProps) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentShop = shop ?? searchParams.get("shop") ?? undefined

  const activeShop = shops.find((item) => item.slug === currentShop) ?? shops[0]
  const isOwner = activeShop?.role === "OWNER"

  const withShop = (href: string) =>
    currentShop ? `${href}?shop=${currentShop}` : href

  return (
    <nav
      aria-label="Navegação do painel"
      className="flex h-full flex-col gap-1 p-4"
    >
      <Link href="/" className="mb-6 inline-flex px-2">
        <BarberFlowLogo size="sm" />
      </Link>

      <ul className="flex flex-col gap-1">
        {NAV.filter((item) => isOwner || !item.ownerOnly).map(
          ({ href, label, icon: Icon, exact }) => {
            const current = exact
              ? pathname === href
              : pathname.startsWith(href)

            return (
              <li key={href}>
                <Link
                  href={withShop(href)}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    current
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
                  )}
                >
                  <Icon size={18} strokeWidth={current ? 2.2 : 1.8} />
                  {label}
                </Link>
              </li>
            )
          },
        )}
      </ul>

      <Link
        href="/barbershops"
        className="mt-auto flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
      >
        <Store size={18} strokeWidth={1.8} />
        Ver site público
      </Link>
    </nav>
  )
}

export default DashboardSidebar
