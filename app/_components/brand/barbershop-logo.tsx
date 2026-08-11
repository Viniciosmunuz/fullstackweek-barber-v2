import { cn } from "@/app/_lib/utils"

/**
 * Logos das barbearias do catálogo.
 *
 * Cada marca recebe uma forma-base geometricamente distinta (losango, triângulo,
 * ampulheta, arco...) em vez de variações do mesmo desenho. O objetivo é que a
 * silhueta sozinha já identifique a barbearia mesmo em 24px dentro de um card,
 * sem depender de texto ou cor.
 *
 * O traço usa `currentColor`, então quem renderiza controla a cor aplicando a
 * `accentColor` da barbearia no container.
 */

type LogoRenderer = () => JSX.Element

const LOGOS: Record<string, LogoRenderer> = {
  /** Blackwood Barber — losango com haste central (tronco). */
  blackwood: () => (
    <>
      <path
        d="M24 5 40 24 24 43 8 24 24 5Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M24 13v22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M18.5 24h11"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </>
  ),

  /** Ferro & Lima — duas lâminas cruzadas. */
  ferrolima: () => (
    <>
      <path
        d="M11 11 37 37"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M37 11 11 37"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="24" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
    </>
  ),

  /** Distrito Norte — agulha da bússola apontando ao norte. */
  distritonorte: () => (
    <>
      <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M24 10 29 26 24 22.5 19 26 24 10Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 30v6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </>
  ),

  /** Studio Nove — numeral 9 reduzido a arco + cauda. */
  studionove: () => (
    <>
      <circle cx="23" cy="19" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        d="M33 19c0 9-3.5 15-9.5 21"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="23" cy="19" r="3" fill="currentColor" opacity="0.6" />
    </>
  ),

  /** Nobre Barbearia — coroa reduzida a três picos. */
  nobre: () => (
    <>
      <path
        d="M8 34V15l8 7 8-12 8 12 8-7v19"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M8 39h32"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        opacity="0.55"
      />
    </>
  ),

  /** Lâmina Studio — corpo inclinado de navalha. */
  lamina: () => (
    <>
      <path
        d="M12 36 33 9a6 6 0 0 1 4 9L20 40a5 5 0 0 1-8-4Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M17 31 30 14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </>
  ),

  /** Praça Onze — os dois "1" como colunas sobre base. */
  pracaonze: () => (
    <>
      <path
        d="M18 12v22M30 12v22"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M13 12h5M25 12h5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M10 39h28"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
      />
    </>
  ),

  /** Meridiano — esfera cortada pela linha do meridiano. */
  meridiano: () => (
    <>
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8 24h32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse
        cx="24"
        cy="24"
        rx="7"
        ry="16"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.55"
      />
    </>
  ),

  /** Casa Bravo — telhado sobre estrutura aberta. */
  casabravo: () => (
    <>
      <path
        d="M8 22 24 8l16 14"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M13 25v15h22V25"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M21 40v-9h6v9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </>
  ),

  /** Âmbar Barbearia — ampulheta, o tempo do atendimento. */
  ambar: () => (
    <>
      <path
        d="M13 8h22L24 24 13 8Z"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M13 40h22L24 24 13 40Z"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path
        d="M11 8h26M11 40h26"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </>
  ),
}

interface BarbershopLogoProps {
  /** Chave gravada em `Barbershop.logoKey`. */
  logoKey: string
  /**
   * Logo de verdade da barbearia (`Barbershop.logoUrl`).
   *
   * Quando existe, ela ganha da silhueta: o desenho genérico sempre foi um
   * substituto até a casa ter a marca dela. A silhueta continua sendo o padrão
   * porque card vazio no catálogo é pior que símbolo genérico.
   */
  logoUrl?: string | null
  /** Hex da `Barbershop.accentColor`; quando ausente, herda a cor do texto. */
  accentColor?: string
  className?: string
  /** Nome da barbearia, usado como rótulo acessível. */
  label?: string
}

/**
 * Renderiza a logo correspondente à chave. Chave desconhecida cai no símbolo do
 * BarberFlow para nunca quebrar o layout de um card.
 */
const BarbershopLogo = ({
  logoKey,
  logoUrl,
  accentColor,
  className,
  label,
}: BarbershopLogoProps) => {
  if (logoUrl) {
    return (
      /*
       * `<img>` cru, e não `next/image`: a logo vem de um endereço que o dono
       * digita e pode mudar a qualquer momento. No otimizador, um domínio não
       * declarado em `next.config` vira erro de servidor e derruba a página
       * inteira do catálogo — aqui, no máximo, não carrega a figura.
       */
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={logoUrl}
        alt={label ?? ""}
        className={cn("shrink-0 object-contain", className)}
        aria-hidden={label ? undefined : true}
      />
    )
  }

  const render = LOGOS[logoKey] ?? LOGOS.blackwood

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("shrink-0", className)}
      style={accentColor ? { color: accentColor } : undefined}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {render()}
    </svg>
  )
}

export default BarbershopLogo
