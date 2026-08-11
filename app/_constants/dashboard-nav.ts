import {
  BarChart3,
  CalendarDays,
  KeyRound,
  LayoutDashboard,
  Scissors,
  Settings,
  Users,
  UserSquare2,
  Wallet,
  type LucideIcon,
} from "lucide-react"

export interface DashboardNavItem {
  href: string
  label: string
  icon: LucideIcon
  /** `/dashboard` casa exato; o resto casa por prefixo. */
  exact?: boolean
  /** Some para quem é da equipe: é decisão de negócio, não operação do dia. */
  ownerOnly?: boolean
}

/**
 * As telas do painel da barbearia, em ordem de menu.
 *
 * Mora aqui, e não dentro da barra lateral, porque dois menus mostram a mesma
 * lista: a barra do painel e o menu do site, que agora abre as ferramentas
 * direto sem passar pelo painel antes. Com duas cópias, a primeira tela nova
 * apareceria só em uma delas — e ninguém descobre isso olhando o código, só
 * usando.
 */
export const DASHBOARD_NAV: DashboardNavItem[] = [
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

/**
 * Quem é a pessoa, para o menu do site.
 *
 *   admin        administra a plataforma — alcança tudo
 *   owner        responde por ao menos uma barbearia
 *   collaborator trabalha em uma barbearia
 */
export type ToolsRole = "admin" | "owner" | "collaborator"

/**
 * O título do bloco diz de quem são aquelas ferramentas.
 *
 * Um "Ferramentas" genérico não informaria nada: quem abre o menu já sabe que
 * são ferramentas. O que ele não sabe — e o que muda o que está listado ali
 * embaixo — é em que papel está entrando.
 */
export const TOOLS_LABEL: Record<ToolsRole, string> = {
  admin: "Ferramentas admin",
  owner: "Ferramentas dono",
  collaborator: "Ferramentas colaborador",
}

/** As telas do painel que este papel abre. */
export function toolsFor(role: ToolsRole): DashboardNavItem[] {
  return role === "collaborator"
    ? DASHBOARD_NAV.filter((item) => !item.ownerOnly)
    : DASHBOARD_NAV
}
