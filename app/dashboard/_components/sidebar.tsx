"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Scissors,
  Settings,
  Store,
  Users,
  UserSquare2,
} from "lucide-react"
import { BarberFlowLogo } from "@/app/_components/brand/logo"
import { cn } from "@/app/_lib/utils"

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/barbeiros", label: "Barbeiros", icon: UserSquare2 },
  { href: "/dashboard/servicos", label: "Serviços", icon: Scissors },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
]

interface SidebarProps {
  /** Slug da barbearia ativa, propagado nos links para não perder o contexto. */
  shop?: string
}

const DashboardSidebar = ({ shop }: SidebarProps) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentShop = shop ?? searchParams.get("shop") ?? undefined

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
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)

          return (
            <li key={href}>
              <Link
                href={withShop(href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            </li>
          )
        })}
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
