import { Check, Clock, Star } from "lucide-react"
import { BarberFlowMark } from "./brand/logo"

/**
 * Mockup da interface exibido no hero.
 *
 * É markup real (não imagem) para ficar nítido em qualquer densidade de tela,
 * pesar quase nada e acompanhar o tema. Puramente decorativo: `aria-hidden`
 * mantém o conteúdo fictício fora da árvore de acessibilidade, já que ele não
 * representa dados verdadeiros do usuário.
 */
const AppMockup = () => {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[300px] select-none"
    >
      {/* brilho de fundo */}
      <div className="absolute -inset-8 rounded-[3rem] bg-primary/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-2xl shadow-black/60">
        {/* barra do sistema */}
        <div className="flex items-center justify-between px-6 pb-2 pt-4 text-[10px] font-medium text-muted-foreground">
          <span>09:41</span>
          <span className="h-4 w-16 rounded-full bg-black/60" />
          <span>100%</span>
        </div>

        <div className="space-y-4 px-4 pb-6">
          <div className="flex items-center justify-between">
            <BarberFlowMark className="h-6 w-6" />
            <span className="h-7 w-7 rounded-full bg-white/10" />
          </div>

          <div>
            <p className="font-display text-[15px] font-bold">Próximo corte</p>
            <p className="text-[11px] text-muted-foreground">Hoje, 14:30</p>
          </div>

          {/* card de agendamento confirmado */}
          <div className="rounded-xl border border-primary/25 bg-primary/[0.07] p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Check size={12} className="text-primary-foreground" />
              </span>
              <span className="text-[11px] font-semibold text-primary">
                Confirmado
              </span>
            </div>
            <p className="mt-2 text-[13px] font-semibold">Degradê Navalhado</p>
            <p className="text-[11px] text-muted-foreground">
              Blackwood Barber · Caio M.
            </p>
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock size={10} />
                40 min
              </span>
              <span className="text-[13px] font-bold text-primary">R$ 75</span>
            </div>
          </div>

          {/* grade de horários */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Horários livres
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {["15:00", "15:30", "16:00", "16:30"].map((time, i) => (
                <span
                  key={time}
                  className={
                    i === 1
                      ? "rounded-md bg-primary py-1.5 text-center text-[10px] font-bold text-primary-foreground"
                      : "rounded-md bg-white/[0.06] py-1.5 text-center text-[10px] text-muted-foreground"
                  }
                >
                  {time}
                </span>
              ))}
            </div>
          </div>

          {/* barbearia sugerida */}
          <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] p-2.5">
            <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-white/15 to-transparent" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold">Nobre Barbearia</p>
              <p className="truncate text-[10px] text-muted-foreground">
                Ipanema · a 1,2 km
              </p>
            </div>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold">
              <Star size={9} className="fill-primary text-primary" />
              4,8
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppMockup
