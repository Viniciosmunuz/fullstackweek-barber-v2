import { BarberFlowMark } from "./_components/brand/logo"

/**
 * Tela de carregamento.
 *
 * Só o símbolo, pulsando devagar sobre o preto da marca. A animação é discreta
 * de propósito: um spinner girando compete com o conteúdo que está prestes a
 * entrar, e a espera aqui costuma durar menos de um segundo.
 *
 * `motion-reduce` desliga o pulso para quem pediu menos movimento no sistema —
 * o símbolo continua visível, apenas parado.
 */
const Loading = () => (
  <div
    className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
    role="status"
    aria-live="polite"
  >
    <span className="relative flex items-center justify-center">
      <span
        aria-hidden="true"
        className="absolute h-24 w-24 animate-pulse rounded-full bg-primary/[0.07] blur-2xl motion-reduce:animate-none"
      />
      <BarberFlowMark className="relative h-10 w-auto animate-pulse motion-reduce:animate-none" />
    </span>

    <span className="sr-only">Carregando…</span>
  </div>
)

export default Loading
