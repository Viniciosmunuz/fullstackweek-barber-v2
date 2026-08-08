import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/app/_components/ui/button"

/**
 * Estado para quem entrou mas cujo e-mail ainda não foi liberado.
 *
 * Mostra o endereço usado no login porque o erro mais comum é entrar com uma
 * conta Google diferente daquela informada à plataforma.
 */
const NoAccess = ({ email }: { email: string }) => (
  <div className="container py-16">
    <div className="surface mx-auto max-w-lg rounded-lg px-6 py-12 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShieldCheck size={26} />
      </span>

      <h1 className="mt-5 font-display text-xl font-bold">
        Este e-mail ainda não tem acesso
      </h1>

      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        O painel é liberado pela equipe do BarberFlow para o e-mail do
        responsável pela barbearia.
      </p>

      <p className="mt-5 rounded-md border border-white/10 px-4 py-3 text-sm">
        Você entrou como{" "}
        <strong className="font-semibold text-foreground">{email}</strong>
      </p>

      <p className="mt-3 text-xs text-muted-foreground">
        Se este não é o endereço que você informou, saia e entre novamente com a
        conta certa.
      </p>

      <div className="mt-8 flex justify-center gap-2 border-t border-white/[0.06] pt-6">
        <Button variant="ghost" asChild>
          <Link href="/barbershops">Voltar para o site</Link>
        </Button>
      </div>
    </div>
  </div>
)

export default NoAccess
