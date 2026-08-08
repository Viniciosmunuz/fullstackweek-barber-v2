import Link from "next/link"
import { BarberFlowLogo } from "./brand/logo"

const Footer = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-card/40">
      <div className="container flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs">
          <BarberFlowLogo size="sm" />
          <p className="mt-3 text-sm text-muted-foreground">
            Seu corte. Seu horário. Seu estilo.
          </p>
        </div>

        <nav aria-label="Rodapé" className="flex gap-12">
          <div>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Produto
            </h2>
            <ul className="text-sm">
              <li>
                <Link
                  href="/barbershops"
                  className="inline-flex min-h-[40px] items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  Barbearias
                </Link>
              </li>
              <li>
                <Link
                  href="/bookings"
                  className="inline-flex min-h-[40px] items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  Agendamentos
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="container border-t border-white/[0.06] py-5">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} BarberFlow. Projeto de demonstração —
          barbearias, endereços e telefones são fictícios.
        </p>
      </div>
    </footer>
  )
}

export default Footer
