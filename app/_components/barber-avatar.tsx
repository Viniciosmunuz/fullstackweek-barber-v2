import { cn, getInitials } from "@/app/_lib/utils"

interface BarberAvatarProps {
  name: string
  /** Quando vazio, o avatar cai para as iniciais — ver nota abaixo. */
  imageUrl?: string | null
  /** Hex da barbearia, usado no anel e no texto das iniciais. */
  accentColor?: string
  className?: string
}

/**
 * Avatar de profissional.
 *
 * O catálogo é fictício, então nenhum barbeiro tem foto: atribuir rostos reais a
 * pessoas inventadas seria uso indevido de imagem. O fallback com iniciais no
 * tom da barbearia resolve isso e ainda mantém a identidade visual coerente.
 * Se `imageUrl` for preenchido no futuro, a foto assume sem mudar o layout.
 */
const BarberAvatar = ({
  name,
  imageUrl,
  accentColor,
  className,
}: BarberAvatarProps) => {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className={cn("rounded-full object-cover", className)}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center rounded-full bg-white/[0.06] font-display text-sm font-bold ring-1 ring-inset",
        className,
      )}
      style={{
        color: accentColor ?? "hsl(var(--primary))",
        // O anel usa a cor da marca em baixa opacidade para não competir com o texto.
        boxShadow: `inset 0 0 0 1px ${accentColor ?? "#C9A227"}40`,
      }}
    >
      {getInitials(name)}
    </span>
  )
}

export default BarberAvatar
