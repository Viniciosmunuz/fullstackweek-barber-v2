import { Suspense } from "react"
import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { Menu } from "lucide-react"
import DashboardSidebar from "./_components/sidebar"
import ClaimAccess from "./_components/claim-access"
import SignInPrompt from "../_components/sign-in-prompt"
import { getManagedBarbershopIds } from "../_actions/dashboard/guard"
import { Button } from "../_components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../_components/ui/sheet"
import { authOptions } from "../_lib/auth"

export const metadata: Metadata = {
  title: {
    default: "Painel",
    template: "%s · Painel BarberFlow",
  },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return <SignInPrompt />
  }

  // Sem vínculo com nenhuma barbearia, não há painel a mostrar.
  const managed = await getManagedBarbershopIds()

  if (managed.length === 0) {
    return (
      <ClaimAccess
        selfServiceEnabled={process.env.DEMO_SELF_SERVICE === "true"}
      />
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixa a partir de lg */}
      <aside className="hidden w-60 shrink-0 border-r border-white/[0.06] bg-card/30 lg:block">
        <div className="sticky top-0 h-screen">
          <Suspense fallback={<div className="h-full" />}>
            <DashboardSidebar />
          </Suspense>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Barra superior do mobile com a sidebar em gaveta */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-background/95 px-4 backdrop-blur lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" aria-label="Abrir menu do painel">
                <Menu size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Menu do painel</SheetTitle>
              <Suspense fallback={<div className="h-full" />}>
                <DashboardSidebar />
              </Suspense>
            </SheetContent>
          </Sheet>
          <span className="font-display text-sm font-bold">Painel</span>
        </div>

        {children}
      </div>
    </div>
  )
}
