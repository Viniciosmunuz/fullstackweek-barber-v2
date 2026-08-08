import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formata um valor monetário no padrão brasileiro. Aceita o Decimal do Prisma. */
export function formatCurrency(value: number | string | { toString(): string }) {
  return Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value))
}

/** 30 -> "30 min"; 90 -> "1h30"; 60 -> "1h". */
export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, "0")}`
}

/** Iniciais para avatares sem foto: "Caio Marchetti" -> "CM". */
export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
]

export function getWeekdayLabel(weekday: number) {
  return WEEKDAY_LABELS[weekday] ?? ""
}
