import { signIn } from "next-auth/react"
import Image from "next/image"
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

      <p className="text-center text-xs text-muted-foreground">
        Usamos sua conta apenas para identificar seus agendamentos.
      </p>
    </>
  )
}

export default SignInDialog
