import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz"
import type { Locale } from "date-fns"

/**
 * O fuso em que a barbearia pensa.
 *
 * Existe porque o sistema tinha **dois relógios**. O servidor da Vercel roda em
 * UTC e montava a lista de horários com `setHours`; o navegador do cliente roda
 * em horário de Brasília e montava a data que ia para o banco. Três horas de
 * diferença entre uma ponta e outra, com três efeitos, todos graves:
 *
 * 1. O painel da barbearia mostrava 23:30 num agendamento das 20:30.
 * 2. O horário de funcionamento valia deslocado — casa aberta 09:00–19:00
 *    aceitava atendimento que acontecia das 12:00 às 22:00.
 * 3. Dois clientes cabiam no mesmo horário, porque a checagem de conflito
 *    comparava a reserva guardada com um candidato em outro fuso.
 *
 * A correção é ter **um relógio só**, e ele mora aqui. Nem o do servidor, que
 * muda conforme onde a aplicação está hospedada, nem o do navegador, que muda
 * conforme onde o cliente está. O da barbearia — que é o único que importa para
 * quem vai sentar na cadeira.
 *
 * Não é variável de ambiente de propósito: `TZ` na Vercel consertaria a
 * exibição, mas continuaria dependendo de configuração certa em cada ambiente,
 * e um cliente agendando de outro país voltaria a quebrar tudo.
 *
 * ⚠️ **O valor é Manaus (UTC-4), não Brasília.** Amazonas não é UTC-3, e a
 * barbearia real cadastrada fica em Manaus. Chutar São Paulo aqui deixaria
 * tudo uma hora adiantado — o mesmo defeito de antes, só menor e mais difícil
 * de perceber. Se a primeira barbearia de fato for de outro estado, é esta
 * linha que muda.
 *
 * Quando o BarberFlow atender cidades em fusos diferentes ao mesmo tempo, esta
 * constante vira uma coluna em `Barbershop` e as funções abaixo passam a
 * receber o fuso da casa. A forma já está pronta para isso; o que ainda é
 * único hoje é o valor.
 */
export const SHOP_TIME_ZONE = "America/Manaus"

/**
 * O instante em que começa o dia da barbearia.
 *
 * Recebe qualquer momento do dia e devolve a meia-noite dele **no fuso da
 * casa**. É a âncora de todo cálculo de agenda: somando minutos a partir daqui
 * chega-se a qualquer horário do dia sem passar por `setHours`, que era o
 * ponto exato onde o fuso do servidor entrava sem ser convidado.
 */
export function startOfDayInZone(moment: Date): Date {
  return startOfDayFromKey(dateKey(moment))
}

/** O último instante do dia da barbearia, para consultar faixas no banco. */
export function endOfDayInZone(moment: Date): Date {
  return endOfDayFromKey(dateKey(moment))
}

/**
 * As mesmas bordas, a partir de "2026-08-13".
 *
 * Existe porque data que vem da URL é texto, e convertê-la para `Date` antes de
 * saber o fuso já erra: `parseISO("2026-08-13")` no servidor em UTC produz um
 * instante que, no relógio da barbearia, ainda é dia 12.
 */
export function startOfDayFromKey(key: string): Date {
  return fromZonedTime(`${key}T00:00:00`, SHOP_TIME_ZONE)
}

export function endOfDayFromKey(key: string): Date {
  return fromZonedTime(`${key}T23:59:59.999`, SHOP_TIME_ZONE)
}

/** Primeiro instante do mês da barbearia a que este instante pertence. */
export function startOfMonthInZone(moment: Date): Date {
  return startOfDayFromKey(
    `${formatInTimeZone(moment, SHOP_TIME_ZONE, "yyyy-MM")}-01`,
  )
}

/**
 * Junta um dia e um horário escrito ("14:30") num instante.
 *
 * É o que substitui a montagem da data no navegador: o cliente escolhe o texto
 * do horário, e quem decide que instante isso significa é o servidor.
 */
export function zonedDateTime(day: Date, time: string): Date {
  return fromZonedTime(`${dateKey(day)}T${time}:00`, SHOP_TIME_ZONE)
}

/** "2026-08-13" do dia da barbearia a que este instante pertence. */
export function dateKey(moment: Date): string {
  return formatInTimeZone(moment, SHOP_TIME_ZONE, "yyyy-MM-dd")
}

/** Dia da semana (0 = domingo) no fuso da casa. */
export function weekdayInZone(moment: Date): number {
  return toZonedTime(moment, SHOP_TIME_ZONE).getDay()
}

/** "14:30" deste instante, no fuso da casa. */
export function timeInZone(moment: Date): string {
  return formatInTimeZone(moment, SHOP_TIME_ZONE, "HH:mm")
}

/**
 * Formata um instante no fuso da barbearia.
 *
 * Serve para servidor e navegador igualmente — é justamente o que garante que
 * a mesma reserva apareça com o mesmo número no painel e na tela do cliente.
 */
export function formatInZone(
  moment: Date,
  pattern: string,
  locale?: Locale,
): string {
  return formatInTimeZone(moment, SHOP_TIME_ZONE, pattern, { locale })
}
