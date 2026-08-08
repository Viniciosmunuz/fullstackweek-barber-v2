import type { Metadata, Viewport } from "next"
import { Inter, Manrope } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import Footer from "./_components/footer"
import AuthProvider from "./_providers/auth"
import MobileNav from "./_components/mobile-nav"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

/** Manrope carrega o peso de marca nos títulos; Inter cuida do texto corrido. */
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "BarberFlow — Seu corte. Seu horário. Seu estilo.",
    template: "%s · BarberFlow",
  },
  description:
    "Agende horários nas melhores barbearias, organize sua equipe e ofereça uma experiência premium aos seus clientes em um único lugar.",
  applicationName: "BarberFlow",
  keywords: ["barbearia", "agendamento", "barbeiro", "corte", "barba"],
}

export const viewport: Viewport = {
  themeColor: "#0B0B0F",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable} ${manrope.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          <div className="flex min-h-full flex-col">
            {/* pb-20 no mobile abre espaço para a barra de navegação fixa */}
            <div className="flex-1 pb-20 lg:pb-0">{children}</div>
            <Footer />
          </div>
          <MobileNav />
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
