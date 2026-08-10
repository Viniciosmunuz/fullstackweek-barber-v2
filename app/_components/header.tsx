import Link from "next/link"
import { MenuIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Sheet, SheetTrigger } from "./ui/sheet"
import SidebarSheet from "./sidebar-sheet"
import NotificationBell from "./notification-bell"
import { BarberFlowLogo } from "./brand/logo"
import { getSessionRole } from "@/app/_lib/roles"
import { getNotifications } from "@/app/_actions/notifications"
import { cn } from "@/app/_lib/utils"

interface HeaderProps {
  /** Sem borda inferior quando o conteúdo abaixo já cria a separação. */
  transparent?: boolean
}

const Header = async ({ transparent = false }: HeaderProps) => {
  const { role, canAccessDashboard } = await getSessionRole()

  // O sino só faz sentido para quem opera uma barbearia — é lá que nascem os
  // avisos. Cliente não recebe notificação hoje, então nem carregamos a lista.
  const notifications = canAccessDashboard
    ? await getNotifications()
    : { items: [], unread: 0 }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full",
        transparent
          ? "bg-background/70 backdrop-blur-lg"
          : "border-b border-white/[0.06] bg-background/90 backdrop-blur-lg",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link href="/" aria-label="BarberFlow — página inicial">
          <BarberFlowLogo size="md" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Button variant="ghost" asChild>
            <Link href="/barbershops">Barbearias</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/bookings">Meus agendamentos</Link>
          </Button>

          {canAccessDashboard && (
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Painel</Link>
            </Button>
          )}

          {role === "ADMIN" && (
            <Button variant="ghost" asChild>
              <Link href="/admin">Parceiras</Link>
            </Button>
          )}

          <Button className="ml-2" asChild>
            <Link href="/barbershops">Agendar horário</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          {canAccessDashboard && (
            <NotificationBell
              items={notifications.items}
              unread={notifications.unread}
            />
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="lg:hidden"
                aria-label="Abrir menu"
              >
                <MenuIcon size={18} />
              </Button>
            </SheetTrigger>
            <SidebarSheet
              canAccessDashboard={canAccessDashboard}
              isPlatformAdmin={role === "ADMIN"}
            />
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Header
