import { describe, expect, it } from "vitest"

import {
  buildSlots,
  minutesFromTime,
  resolveWindow,
  timeFromMinutes,
  type DayWindow,
} from "../app/_lib/schedule"

/**
 * A lista de horários que o cliente escolhe.
 *
 * Antes era uma constante de 08:00 às 19:00, igual para todas as barbearias: a
 * casa que abre às 10h e fecha domingo recebia agendamento às 8h de domingo.
 * Estes casos existem para que a regra volte a ser regra.
 */

const DIA = new Date("2026-08-12T00:00:00")
const CEDO = new Date("2026-08-12T00:00:00")

const ABERTO: DayWindow = {
  closed: false,
  opensAt: "09:00",
  closesAt: "12:00",
}

function slots(overrides: Partial<Parameters<typeof buildSlots>[0]> = {}) {
  return buildSlots({
    day: DIA,
    window: ABERTO,
    durationMinutes: 30,
    now: CEDO,
    ...overrides,
  })
}

describe("conversão de hora", () => {
  it("lê HH:mm", () => {
    expect(minutesFromTime("09:30")).toBe(570)
    expect(minutesFromTime("00:00")).toBe(0)
    expect(minutesFromTime("23:59")).toBe(1439)
  })

  it("recusa o que não é hora", () => {
    expect(minutesFromTime(null)).toBeNull()
    expect(minutesFromTime("9:30")).toBeNull()
    expect(minutesFromTime("25:00")).toBeNull()
    expect(minutesFromTime("09:70")).toBeNull()
  })

  it("volta para HH:mm com dois dígitos", () => {
    expect(timeFromMinutes(570)).toBe("09:30")
    expect(timeFromMinutes(0)).toBe("00:00")
  })
})

describe("expediente", () => {
  it("oferece de meia em meia hora dentro da janela", () => {
    expect(slots()).toEqual([
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
    ])
  })

  it("respeita o horário da casa, e não uma faixa fixa", () => {
    // O defeito que motivou este módulo: a lista ia das 08:00 às 19:00 para
    // qualquer barbearia.
    const tarde = slots({
      window: { closed: false, opensAt: "14:00", closesAt: "16:00" },
    })

    expect(tarde).toEqual(["14:00", "14:30", "15:00", "15:30"])
    expect(tarde).not.toContain("08:00")
  })

  it("não oferece nada em dia fechado", () => {
    expect(
      slots({ window: { closed: true, opensAt: null, closesAt: null } }),
    ).toEqual([])
  })

  it("não oferece nada sem janela definida", () => {
    expect(slots({ window: null })).toEqual([])
  })

  it("ignora janela incoerente em vez de gerar horário estranho", () => {
    expect(
      slots({ window: { closed: false, opensAt: "18:00", closesAt: "09:00" } }),
    ).toEqual([])
  })
})

describe("duração do serviço", () => {
  it("exige que o atendimento termine dentro do expediente", () => {
    // Um serviço de 1h numa janela que fecha às 12:00 não pode começar 11:30 —
    // deixaria o cliente esperando de porta fechada.
    expect(slots({ durationMinutes: 60 })).toEqual([
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
    ])
  })

  it("some quando o serviço é mais longo que o expediente", () => {
    expect(slots({ durationMinutes: 300 })).toEqual([])
  })

  it("recusa duração inválida", () => {
    expect(slots({ durationMinutes: 0 })).toEqual([])
  })
})

describe("agenda ocupada", () => {
  it("tira o horário já marcado", () => {
    const busy = [
      {
        start: new Date("2026-08-12T10:00:00"),
        end: new Date("2026-08-12T10:30:00"),
      },
    ]

    expect(slots({ busy })).not.toContain("10:00")
    expect(slots({ busy })).toContain("10:30")
  })

  it("tira também o horário que colide por causa da duração", () => {
    // Um corte de 40 minutos às 10:00 inviabiliza as 10:30, que ainda estaria
    // dentro dele.
    const busy = [
      {
        start: new Date("2026-08-12T10:00:00"),
        end: new Date("2026-08-12T10:40:00"),
      },
    ]

    expect(slots({ busy })).not.toContain("10:30")
  })

  it("mantém o horário que só encosta no fim do anterior", () => {
    const busy = [
      {
        start: new Date("2026-08-12T09:00:00"),
        end: new Date("2026-08-12T10:00:00"),
      },
    ]

    expect(slots({ busy })).toContain("10:00")
  })
})

describe("folga e férias", () => {
  it("bloqueia o intervalo da ausência", () => {
    const timeOff = [
      {
        start: new Date("2026-08-12T10:00:00"),
        end: new Date("2026-08-12T11:00:00"),
      },
    ]

    const resultado = slots({ timeOff })

    expect(resultado).not.toContain("10:00")
    expect(resultado).not.toContain("10:30")
    expect(resultado).toContain("09:30")
    expect(resultado).toContain("11:00")
  })

  it("esvazia o dia quando a ausência cobre o expediente inteiro", () => {
    const timeOff = [
      {
        start: new Date("2026-08-12T00:00:00"),
        end: new Date("2026-08-13T00:00:00"),
      },
    ]

    expect(slots({ timeOff })).toEqual([])
  })
})

describe("horário que já passou", () => {
  it("some quando o dia é hoje", () => {
    const agora = new Date("2026-08-12T10:15:00")

    expect(slots({ now: agora })).toEqual(["10:30", "11:00", "11:30"])
  })

  it("não some em dia futuro", () => {
    const agora = new Date("2026-08-11T23:00:00")

    expect(slots({ now: agora })).toHaveLength(6)
  })
})

describe("resolveWindow", () => {
  const casa: DayWindow = { closed: false, opensAt: "09:00", closesAt: "18:00" }
  const proprio: DayWindow = {
    closed: false,
    opensAt: "13:00",
    closesAt: "20:00",
  }

  it("segue a casa quando o profissional não tem grade própria", () => {
    expect(resolveWindow(casa, undefined)).toBe(casa)
  })

  it("a grade própria substitui a da casa por inteiro", () => {
    // Meia mistura — abrir com a casa e fechar com a dele — seria impossível
    // de explicar na tela.
    expect(resolveWindow(casa, proprio)).toBe(proprio)
  })

  it("o profissional pode folgar num dia em que a casa abre", () => {
    const folga: DayWindow = { closed: true, opensAt: null, closesAt: null }

    expect(resolveWindow(casa, folga)).toBe(folga)
  })

  it("sem nenhuma das duas, não há janela", () => {
    expect(resolveWindow(undefined, undefined)).toBeNull()
  })
})
