"use client"

import { useState } from "react"
import { LogIn } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent } from "./ui/dialog"
import SignInDialog from "./sign-in-dialog"

/**
 * Estado para visitante não autenticado em páginas que exigem conta.
 * Substitui o `notFound()` do template, que devolvia um 404 enganoso.
 */
const SignInPrompt = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className="container py-16">
      <div className="surface mx-auto flex max-w-md flex-col items-center rounded-lg px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LogIn size={24} />
        </span>
        <h1 className="mt-4 font-display text-xl font-bold">
          Entre para ver seus agendamentos
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Seus horários ficam salvos na sua conta, para você acompanhar e
          cancelar quando precisar.
        </p>
        <Button className="mt-6" size="lg" onClick={() => setOpen(true)}>
          Entrar
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[90%] max-w-sm">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SignInPrompt
