import { describe, expect, it } from "vitest"

import {
  SHOP_TIME_ZONE,
  dateKey,
  endOfDayInZone,
  formatInZone,
  startOfDayFromKey,
  startOfDayInZone,
  startOfMonthInZone,
  timeInZone,
  weekdayInZone,
  zonedDateTime,
} from "../app/_lib/timezone"

/**
 * O relógio da barbearia.
 *
 * Estes casos existem por causa de um defeito real em produção: o servidor da
 * Vercel roda em UTC e montava a lista de horários; o navegador do cliente
 * montava a data que ia para o banco. O painel mostrava 23:30 num agendamento
 * das 19:30, o horário de funcionamento valia deslocado e o mesmo horário podia
 * ser vendido duas vezes.
 *
 * Todas as datas aqui são escritas com o deslocamento explícito (`-04:00`) de
 * propósito: sem isso o teste passaria ou falharia conforme o fuso da máquina
 * que o executa, que foi exatamente a origem do problema.
 */

/** 13/08/2026 é uma quinta-feira. */
const QUINTA_19H30 = new Date("2026-08-13T19:30:00-04:00")

describe("fuso da barbearia", () => {
  it("é Manaus, e não Brasília", () => {
    // Amazonas é UTC-4. Trocar por São Paulo adianta tudo em uma hora.
    expect(SHOP_TIME_ZONE).toBe("America/Manaus")
  })
})

describe("leitura de um instante", () => {
  it("mostra a hora da barbearia, não a do servidor", () => {
    // O mesmo instante em UTC seria 23:30 — o número errado que aparecia no
    // painel.
    expect(timeInZone(QUINTA_19H30)).toBe("19:30")
  })

  it("mantém o dia da barbearia depois das 20h", () => {
    // 21:00 em Manaus é 01:00 do dia seguinte em UTC.
    const noite = new Date("2026-08-13T21:00:00-04:00")

    expect(dateKey(noite)).toBe("2026-08-13")
    expect(weekdayInZone(noite)).toBe(4)
  })

  it("formata com locale", () => {
    expect(formatInZone(QUINTA_19H30, "dd/MM HH:mm")).toBe("13/08 19:30")
  })
})

describe("montagem de um horário", () => {
  it("junta dia e hora escolhidos no relógio da casa", () => {
    const marcado = zonedDateTime(QUINTA_19H30, "09:00")

    expect(timeInZone(marcado)).toBe("09:00")
    expect(marcado.toISOString()).toBe("2026-08-13T13:00:00.000Z")
  })

  it("é o inverso da leitura", () => {
    // A garantia que faltava: o horário oferecido e o horário gravado são o
    // mesmo instante. Era aqui que dois clientes cabiam no mesmo lugar.
    const marcado = zonedDateTime(QUINTA_19H30, timeInZone(QUINTA_19H30))

    expect(marcado.getTime()).toBe(QUINTA_19H30.getTime())
  })
})

describe("bordas do dia", () => {
  it("começa à meia-noite da barbearia", () => {
    expect(startOfDayInZone(QUINTA_19H30).toISOString()).toBe(
      "2026-08-13T04:00:00.000Z",
    )
  })

  it("termina no último instante do dia da barbearia", () => {
    expect(endOfDayInZone(QUINTA_19H30).toISOString()).toBe(
      "2026-08-14T03:59:59.999Z",
    )
  })

  it("cobre o dia inteiro, inclusive o que em UTC já é amanhã", () => {
    const from = startOfDayInZone(QUINTA_19H30)
    const to = endOfDayInZone(QUINTA_19H30)
    const tarde = new Date("2026-08-13T22:00:00-04:00")

    // Um atendimento das 22:00 em Manaus é 02:00 do dia seguinte em UTC: com
    // as bordas antigas ele ficava de fora da agenda do próprio dia.
    expect(tarde >= from && tarde <= to).toBe(true)
  })

  it("lê a data da URL como texto, sem passar por Date", () => {
    // `parseISO("2026-08-13")` num servidor em UTC produz um instante que, no
    // relógio da barbearia, ainda é dia 12.
    expect(dateKey(startOfDayFromKey("2026-08-13"))).toBe("2026-08-13")
  })

  it("acha o primeiro dia do mês da barbearia", () => {
    expect(dateKey(startOfMonthInZone(QUINTA_19H30))).toBe("2026-08-01")
  })
})
