import { describe, expect, it } from "vitest"

import { buildClientNotice, type ClientNotice } from "../app/_lib/notify-client"

/**
 * O que o cliente lê.
 *
 * Um lembrete é a única mensagem que a maioria vai abrir — e abrir com pressa,
 * no caminho. Se faltar a hora, o lugar ou o nome da barbearia, ele não serve
 * para nada. Estes casos existem para que o essencial nunca saia da mensagem
 * por descuido numa refatoração.
 */

const BASE: ClientNotice = {
  kind: "CONFIRMED",
  email: "cliente@exemplo.com",
  clientName: "Vinicius",
  barbershopName: "Barbearia Modelo",
  serviceName: "Corte Masculino",
  barberName: "Carlos",
  date: new Date("2026-08-13T14:30:00"),
  address: "Rua Exemplo, 123",
}

describe("o essencial aparece sempre", () => {
  const kinds = ["CONFIRMED", "REMINDER", "CANCELLED"] as const

  it.each(kinds)("%s traz serviço, hora e barbearia", (kind) => {
    const { text, subject } = buildClientNotice({ ...BASE, kind })

    expect(text).toContain("Corte Masculino")
    expect(text).toContain("14:30")
    expect(`${subject} ${text}`).toContain("Barbearia Modelo")
  })

  it.each(kinds)("%s chama a pessoa pelo nome", (kind) => {
    expect(buildClientNotice({ ...BASE, kind }).text).toContain("Vinicius")
  })
})

describe("cada aviso diz o que aconteceu", () => {
  it("confirmação avisa que o horário está reservado", () => {
    const { subject, text } = buildClientNotice(BASE)

    expect(subject).toContain("confirmado")
    expect(text).toContain("reservado")
  })

  it("lembrete se anuncia como lembrete", () => {
    const { subject } = buildClientNotice({ ...BASE, kind: "REMINDER" })

    expect(subject).toContain("Lembrete")
  })

  it("lembrete pede para cancelar quando não puder ir", () => {
    // É o que devolve o horário para quem está esperando, e o motivo de o
    // lembrete existir.
    const { text } = buildClientNotice({ ...BASE, kind: "REMINDER" })

    expect(text).toContain("cancele")
  })

  it("cancelamento não finge que está tudo certo", () => {
    const { subject, text } = buildClientNotice({ ...BASE, kind: "CANCELLED" })

    expect(subject).toContain("cancelado")
    expect(text).toContain("cancelado")
    expect(text).not.toContain("reservado")
  })
})

describe("o que é opcional", () => {
  it("inclui o endereço quando há", () => {
    expect(buildClientNotice(BASE).text).toContain("Rua Exemplo, 123")
  })

  it("omite a linha do endereço quando não há", () => {
    const { text } = buildClientNotice({ ...BASE, address: null })

    expect(text).not.toContain("Onde:")
  })

  it("omite o profissional quando o agendamento não tem um", () => {
    const { text } = buildClientNotice({ ...BASE, barberName: null })

    expect(text).not.toContain("Profissional:")
  })

  it("inclui o profissional quando há", () => {
    expect(buildClientNotice(BASE).text).toContain("Profissional: Carlos")
  })
})

describe("versão em html", () => {
  it("carrega a mesma informação do texto", () => {
    const { html } = buildClientNotice(BASE)

    expect(html).toContain("Corte Masculino")
    expect(html).toContain("Carlos")
    expect(html).toContain("Rua Exemplo, 123")
  })
})
