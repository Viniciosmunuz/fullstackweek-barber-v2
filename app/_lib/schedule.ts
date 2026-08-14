/**
 * Quais horários um profissional tem livres num dia.
 *
 * Módulo puro de propósito: não lê sessão, não toca no banco e não conhece
 * Prisma. Quem monta as peças é a ação do servidor; aqui só se decide, a partir
 * delas, o que aparece para o cliente escolher.
 *
 * Isso importa porque a lista de horários era uma constante de 08:00 às 19:00,
 * igual para todo mundo: a barbearia que abre às 10h e fecha domingo recebia
 * agendamento às 8h de domingo. Regra de disponibilidade escrita em constante
 * não tem como estar certa para duas casas diferentes.
 */

/** De quanto em quanto tempo um horário é oferecido. */
export const SLOT_STEP_MINUTES = 30

/** Um dia da semana na grade de funcionamento. */
export interface DayWindow {
  closed: boolean
  /** "HH:mm" */
  opensAt: string | null
  closesAt: string | null
}

export interface Interval {
  start: Date
  end: Date
}

export interface SlotsInput {
  /**
   * Instante em que começa o dia consultado, **no fuso da barbearia**.
   *
   * Antes esta entrada era um `Date` qualquer do dia e os horários saíam de
   * `setHours`, que usa o fuso de quem executa — UTC na Vercel. Recebendo a
   * âncora pronta, o cálculo vira soma de minutos e não tem mais opinião sobre
   * fuso nenhum. Quem sabe converter é `_lib/timezone`.
   */
  dayStart: Date
  /** Janela de funcionamento válida para este profissional neste dia. */
  window: DayWindow | null
  /** Duração do serviço escolhido. */
  durationMinutes: number
  /** Atendimentos já marcados, com início e fim. */
  busy?: Interval[]
  /** Folgas, férias e compromissos que bloqueiam parte ou todo o dia. */
  timeOff?: Interval[]
  /** Instante atual, para não oferecer horário que já passou. */
  now?: Date
}

/** "09:30" -> 570. Devolve `null` para o que não for hora válida. */
export function minutesFromTime(value: string | null): number | null {
  if (!value) return null

  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (hours > 23 || minutes > 59) return null

  return hours * 60 + minutes
}

/** 570 -> "09:30" */
export function timeFromMinutes(total: number): string {
  const hours = Math.floor(total / 60)
  const minutes = total % 60

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

/**
 * Soma minutos ao início do dia.
 *
 * Aritmética pura, sem `setHours`: some minutos a um instante e o resultado é o
 * mesmo em qualquer fuso em que o processo esteja rodando. Vale porque o Brasil
 * não tem mais horário de verão desde 2019 — voltando a ter, um dia passa a
 * ter 23 ou 25 horas e esta conta precisa converter de novo pelo fuso.
 */
function at(dayStart: Date, totalMinutes: number): Date {
  return new Date(dayStart.getTime() + totalMinutes * 60_000)
}

/** Dois intervalos se cruzam quando um começa antes de o outro acabar. */
function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && a.end > b.start
}

/**
 * Monta a lista de horários livres.
 *
 * O serviço precisa **terminar** dentro do expediente, e não apenas começar:
 * um corte de 40 minutos às 19:40 numa casa que fecha às 20:00 deixaria alguém
 * esperando de porta fechada. Por isso o último horário oferecido é o
 * fechamento menos a duração.
 */
export function buildSlots({
  dayStart,
  window,
  durationMinutes,
  busy = [],
  timeOff = [],
  now = new Date(),
}: SlotsInput): string[] {
  if (!window || window.closed) return []
  if (durationMinutes <= 0) return []

  const opens = minutesFromTime(window.opensAt)
  const closes = minutesFromTime(window.closesAt)

  if (opens === null || closes === null || closes <= opens) return []

  const slots: string[] = []

  for (
    let start = opens;
    start + durationMinutes <= closes;
    start += SLOT_STEP_MINUTES
  ) {
    const startsAt = at(dayStart, start)
    const candidate = {
      start: startsAt,
      end: at(dayStart, start + durationMinutes),
    }

    // Horário que já passou não é oferecido — vale só quando o dia é hoje,
    // porque em dia futuro nenhum horário passou.
    if (startsAt <= now) continue

    if (busy.some((interval) => overlaps(candidate, interval))) continue
    if (timeOff.some((interval) => overlaps(candidate, interval))) continue

    slots.push(timeFromMinutes(start))
  }

  return slots
}

/**
 * Escolhe a janela que vale para o profissional neste dia da semana.
 *
 * Sem grade própria, ele segue a casa — que é o caso da maioria e evita
 * obrigar o dono a preencher a mesma coisa para cada barbeiro. Havendo grade
 * própria, ela substitui a da casa por inteiro naquele dia: meia mistura
 * ("abre com a casa, fecha com a dele") seria impossível de explicar na tela.
 */
export function resolveWindow(
  shopWindow: DayWindow | undefined,
  barberWindow: DayWindow | undefined,
): DayWindow | null {
  return barberWindow ?? shopWindow ?? null
}
