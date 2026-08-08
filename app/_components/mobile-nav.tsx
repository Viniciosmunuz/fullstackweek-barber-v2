"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Home, Search, User } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { cn } from "@/app/_lib/utils"
import { Dialog, DialogContent } from "./ui/dialog"
import SignInDialog from "./sign-in-dialog"

const ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/barbershops", label: "Buscar", icon: Search },
  { href: "/bookings", label: "Agenda", icon: CalendarDays },
]

/**
 * Barra de navegação fixa do mobile.
 *
 * Substitui o padrão "tudo escondido no menu hambúrguer" do layout original: as
 * três ações principais ficam a um toque, com alvos de 56px de altura. Some a
 * partir de `lg`, onde o header horizontal assume a navegação.
 */
const MobileNav = () => {
  const pathname = usePathname()
  const { data } = useSession()
  const [signInOpen, setSignInOpen] = useState(false)

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-background/95 backdrop-blur-lg lg:hidden"
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-around">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href)

            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                  {label}
                </Link>
              </li>
            )
          })}

          <li className="flex-1">
            {data?.user ? (
              <Link
                href="/bookings"
                className="flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.user.image ?? ""}
                  alt=""
                  className="h-5 w-5 rounded-full object-cover ring-1 ring-white/20"
                />
                Perfil
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setSignInOpen(true)}
                className="flex h-14 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <User size={20} strokeWidth={1.8} />
                Entrar
              </button>
            )}
          </li>
        </ul>
      </nav>

      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogContent className="w-[90%] max-w-sm">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MobileNav
