import Link from "next/link"
import { MenuIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Sheet, SheetTrigger } from "./ui/sheet"
import SidebarSheet from "./sidebar-sheet"
import { BarberFlowLogo } from "./brand/logo"
import { cn } from "@/app/_lib/utils"

interface HeaderProps {
  /**
   * Cabeçalho transparente sobre o hero da home; nas demais páginas ele ganha
   * fundo sólido para separar do conteúdo.
   */
  transparent?: boolean
}

const Header = ({ transparent = false }: HeaderProps) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full",
        transparent
          ? "bg-background/70 backdrop-blur-lg"
          : "border-b border-white/[0.06] bg-background/90 backdrop-blur-lg",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-6 lg:h-20">
        <Link href="/" aria-label="BarberFlow — página inicial">
          <BarberFlowLogo size="md" />
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden items-center gap-1 lg:flex">
          <Button variant="ghost" asChild>
            <Link href="/barbershops">Barbearias</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/bookings">Meus agendamentos</Link>
          </Button>
          <Button className="ml-2" asChild>
            <Link href="/barbershops">Agendar horário</Link>
          </Button>
        </nav>

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
          <SidebarSheet />
        </Sheet>
      </div>
    </header>
  )
}

export default Header
