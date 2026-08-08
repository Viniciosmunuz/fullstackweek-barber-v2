import { cn } from "@/app/_lib/utils"

/**
 * Identidade BarberFlow.
 *
 * O símbolo é um "B" construído por dois arcos que se abrem à direita, cortados
 * por uma haste vertical que evoca a lâmina de uma navalha. As três linhas
 * horizontais que escapam do contorno são o "flow": movimento, agenda em
 * andamento, cortes em sequência. Sem tesoura/bigode — a leitura é de produto
 * de tecnologia, não de barbearia tradicional.
 *
 * O wordmark é HTML (e não <text> no SVG) para herdar a fonte da aplicação,
 * escalar com o tipo e continuar selecionável/legível por leitores de tela.
 */

interface MarkProps {
  className?: string
  /**
   * `gold` fixa o dourado da marca. `current` herda a cor do texto do container,
   * útil em superfícies monocromáticas.
   */
  tone?: "gold" | "current"
}

const GOLD = "#C9A227"

/** Símbolo isolado — favicon, avatar, splash e espaços quadrados. */
export const BarberFlowMark = ({ className, tone = "gold" }: MarkProps) => {
  const color = tone === "gold" ? GOLD : "currentColor"

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* haste — a lâmina */}
      <path d="M15 8v32" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      {/* arco superior do B */}
      <path
        d="M15 9.75h11a7.13 7.13 0 0 1 0 14.25H15"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* arco inferior do B */}
      <path
        d="M15 24h12.5a7.13 7.13 0 0 1 0 14.25H15"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* linhas de fluxo */}
      <path
        d="M39.5 15.5h5.5M38 24h7M39.5 32.5h5.5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}

interface LogoProps {
  className?: string
  /** `dark` para fundos escuros (padrão), `light` para fundos claros. */
  variant?: "dark" | "light"
  size?: "sm" | "md" | "lg"
}

const SIZES = {
  sm: { mark: "h-6 w-6", text: "text-base" },
  md: { mark: "h-8 w-8", text: "text-xl" },
  lg: { mark: "h-11 w-11", text: "text-3xl" },
} as const

/**
 * Logo horizontal (símbolo + wordmark) — header, sidebar, login e rodapé.
 * "Barber" usa o peso forte; "Flow" vem em dourado e peso leve, reforçando a
 * ideia de continuidade do nome.
 */
export const BarberFlowLogo = ({
  className,
  variant = "dark",
  size = "md",
}: LogoProps) => {
  const s = SIZES[size]

  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label="BarberFlow"
      role="img"
    >
      <BarberFlowMark className={s.mark} />
      <span
        className={cn(
          "font-display font-extrabold tracking-tight",
          s.text,
          variant === "dark" ? "text-[#F5F5F5]" : "text-[#0B0B0F]",
        )}
      >
        Barber<span className="font-light text-primary">Flow</span>
      </span>
    </span>
  )
}

export default BarberFlowLogo
