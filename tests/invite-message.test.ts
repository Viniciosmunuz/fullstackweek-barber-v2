import { describe, expect, it } from "vitest"

import { buildInviteMessage } from "../app/_lib/email"

/**
 * O convite chega antes de a pessoa ter qualquer contato com o sistema — é a
 * primeira instrução que ela lê, e a única se o e-mail for o canal. Mandar a
 * instrução do papel errado faz o barbeiro procurar uma tela que ele não
 * enxerga, e ele conclui que não recebeu acesso.
 */

const base = {
  barbershopName: "Barbearia Modelo",
  email: "pessoa@exemplo.com",
  dashboardUrl: "https://exemplo.com/dashboard",
}

describe("buildInviteMessage", () => {
  it("manda o dono completar o cadastro e publicar", () => {
    const { text } = buildInviteMessage({ ...base, role: "OWNER" })

    expect(text).toContain("administrar")
    expect(text).toContain("Complete o cadastro da barbearia e publique")
  })

  it("manda a equipe cuidar da agenda, e não do cadastro", () => {
    const { text } = buildInviteMessage({ ...base, role: "STAFF" })

    expect(text).toContain("usar o painel")
    expect(text).toContain("Acompanhe a agenda do dia")
    expect(text).not.toContain("Complete o cadastro")
  })

  it("trata quem não informou papel como dono", () => {
    // O convite da plataforma para uma parceira nova é sempre de dono; o padrão
    // existe para esse caso e não pode virar convite de equipe por omissão.
    const { text } = buildInviteMessage(base)

    expect(text).toContain("Complete o cadastro da barbearia e publique")
  })

  it("repete o e-mail exato, porque o acesso está preso a ele", () => {
    const { text, html } = buildInviteMessage(base)

    expect(text).toContain(base.email)
    expect(html).toContain(base.email)
  })

  it("leva o endereço do painel nos dois formatos", () => {
    const { text, html } = buildInviteMessage(base)

    expect(text).toContain(base.dashboardUrl)
    expect(html).toContain(base.dashboardUrl)
  })

  it("nomeia a barbearia no assunto", () => {
    const { subject } = buildInviteMessage(base)

    expect(subject).toContain(base.barbershopName)
  })
})
