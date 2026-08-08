"use client"

import { usePathname } from "next/navigation"
import Footer from "./footer"
import MobileNav from "./mobile-nav"

/**
 * Rodapé e navegação inferior pertencem ao site público. O painel tem a própria
 * sidebar e barra superior, então este wrapper os suprime em /dashboard para
 * evitar duas navegações concorrentes na mesma tela.
 */
const SiteChrome = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith("/dashboard")

  if (isDashboard) return <>{children}</>

  return (
    <>
      <div className="flex min-h-full flex-col">
        <div className="flex-1 pb-20 lg:pb-0">{children}</div>
        <Footer />
      </div>
      <MobileNav />
    </>
  )
}

export default SiteChrome
