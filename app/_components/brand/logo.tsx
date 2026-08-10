import { cn } from "@/app/_lib/utils"
import { MARK_PATH, MARK_VIEWBOX } from "./mark-path"

/**
 * Identidade BarberFlow.
 *
 * O símbolo é o "B" oficial: a navalha aberta forma a haste da letra e três
 * linhas de velocidade escapam à esquerda — movimento, agenda em andamento.
 * O contorno vem vetorizado da folha de logos (ver `mark-path.ts`), não
 * redesenhado de olho.
 *
 * O wordmark é HTML, e não `<text>` dentro do SVG, para herdar a fonte da
 * aplicação, acompanhar o corpo do texto e continuar legível por leitores de
 * tela. Usa Inter (`font-sans`) porque a grotesca neutra da folha de marca é
 * muito mais próxima dela do que da Manrope dos títulos.
 */

interface MarkProps {
  className?: string
  /**
   * `gold` é o padrão e o que se usa na interface: chapado, mais legível em
   * corpo pequeno. `gradient` reproduz o degradê da marca e vale só onde o
   * símbolo aparece grande — login, splash. `current` herda a cor do texto,
   * para superfícies monocromáticas.
   */
  tone?: "gold" | "gradient" | "current"
}

/** Símbolo isolado — favicon, avatar, splash, loading e espaços apertados. */
export const BarberFlowMark = ({ className, tone = "gold" }: MarkProps) => {
  const fill =
    tone === "gradient"
      ? "url(#bf-mark-gradient)"
      : tone === "current"
        ? "currentColor"
        : "#C9A227"

  return (
    <svg
      viewBox={MARK_VIEWBOX}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/*
        O id do degradê é fixo. Duas instâncias na mesma página repetiriam o id,
        mas ambas descrevem o mesmo degradê — o navegador resolve pela primeira
        e o resultado é idêntico. `gradient` é reservado a usos isolados e
        grandes, onde isso não chega a acontecer.
      */}
      {tone === "gradient" && (
        <defs>
          <linearGradient id="bf-mark-gradient" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0" stopColor="#EFC65E" />
            <stop offset="0.35" stopColor="#DCAF43" />
            <stop offset="0.7" stopColor="#C9A227" />
            <stop offset="1" stopColor="#9E7318" />
          </linearGradient>
        </defs>
      )}

      <path fill={fill} fillRule="evenodd" d={MARK_PATH} />
    </svg>
  )
}

interface LogoProps {
  className?: string
  /** `dark` para fundos escuros (padrão), `light` para fundos claros. */
  variant?: "dark" | "light"
  size?: "sm" | "md" | "lg"
  /** Só o símbolo — sidebar estreita, cabeçalho apertado, avatar. */
  markOnly?: boolean
  /** Assinatura "Agendamento inteligente" sob o nome; só onde há folga. */
  tagline?: boolean
}

const SIZES = {
  sm: { mark: "h-6", text: "text-[15px]", tagline: "text-[7px]", gap: "gap-2" },
  md: { mark: "h-8", text: "text-xl", tagline: "text-[8px]", gap: "gap-2.5" },
  lg: { mark: "h-12", text: "text-3xl", tagline: "text-[10px]", gap: "gap-3" },
} as const

/**
 * Lockup horizontal (símbolo + nome) — cabeçalho, sidebar, login e rodapé.
 * "BARBER" vem no peso forte e "FLOW" em dourado e peso leve, como na folha
 * de marca: o contraste de peso é o que separa as duas palavras, não um
 * espaço.
 */
export const BarberFlowLogo = ({
  className,
  variant = "dark",
  size = "md",
  markOnly = false,
  tagline = false,
}: LogoProps) => {
  const s = SIZES[size]

  return (
    <span
      className={cn("inline-flex items-center", s.gap, className)}
      aria-label="BarberFlow"
      role="img"
    >
      {/* `w-auto`: o símbolo é 1,5× mais largo que alto e não pode ser espremido
          num quadrado, senão distorce. */}
      <BarberFlowMark className={cn(s.mark, "w-auto shrink-0")} />

      {!markOnly && (
        <span className="inline-flex flex-col">
          <span
            className={cn(
              "font-sans font-extrabold uppercase leading-none tracking-[-0.01em]",
              s.text,
              variant === "dark" ? "text-[#F5F5F5]" : "text-[#0B0B0F]",
            )}
          >
            Barber<span className="font-light text-primary">Flow</span>
          </span>

          {tagline && (
            <span
              className={cn(
                "mt-1 font-sans font-medium uppercase leading-none tracking-[0.28em] text-muted-foreground",
                s.tagline,
              )}
            >
              Agendamento inteligente
            </span>
          )}
        </span>
      )}
    </span>
  )
}

export default BarberFlowLogo
