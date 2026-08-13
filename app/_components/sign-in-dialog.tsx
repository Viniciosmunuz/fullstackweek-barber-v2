import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { BarberFlowMark } from "./brand/logo"

const SignInDialog = () => {
  const handleLoginWithGoogleClick = () => signIn("google")

  return (
    <>
      <DialogHeader className="items-center text-center">
        {/* Peça isolada e grande o bastante para o degradê da marca aparecer.
            `w-auto` porque o símbolo é 1,5× mais largo que alto. */}
        <BarberFlowMark tone="gradient" className="mb-2 h-11 w-auto" />
        <DialogTitle className="font-display text-xl">
          Entrar no BarberFlow
        </DialogTitle>
        <DialogDescription>
          Acesse para agendar horários e acompanhar seus atendimentos.
        </DialogDescription>
      </DialogHeader>

      <Button
        variant="outline"
        size="lg"
        className="mt-2 w-full"
        onClick={handleLoginWithGoogleClick}
      >
        <Image
          alt=""
          src="/google.svg"
          width={18}
          height={18}
          aria-hidden="true"
        />
        Continuar com o Google
      </Button>

      {/* O aviso fica aqui, e não escondido no rodapé: é neste botão que a
          conta passa a existir, então é aqui que a pessoa tem de saber ao que
          está concordando. */}
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Usamos sua conta apenas para identificar seus agendamentos. Ao
        continuar, você concorda com os{" "}
        <Link
          href="/termos"
          className="text-primary underline underline-offset-2"
        >
          Termos de Uso
        </Link>{" "}
        e a{" "}
        <Link
          href="/privacidade"
          className="text-primary underline underline-offset-2"
        >
          Política de Privacidade
        </Link>
        .
      </p>
    </>
  )
}

export default SignInDialog
