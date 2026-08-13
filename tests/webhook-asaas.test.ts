import { beforeEach, describe, expect, it, vi } from "vitest"

const TOKEN = "token-secreto"

const getAsaasWebhookToken = vi.fn(() => TOKEN)
const notifyBarbershop = vi.fn()
const notifyClient = vi.fn()

const db = {
  payment: { findUnique: vi.fn(), update: vi.fn() },
  paymentEvent: { create: vi.fn() },
  booking: { update: vi.fn(), findUnique: vi.fn() },
  $transaction: vi.fn(async (ops: unknown[]) => Promise.all(ops)),
}

vi.mock("@/app/_lib/prisma", () => ({ db }))
vi.mock("@/app/_lib/config", () => ({ getAsaasWebhookToken }))
vi.mock("@/app/_lib/notify-barbershop", () => ({ notifyBarbershop }))
vi.mock("@/app/_lib/notify-client", () => ({ notifyClient }))

const { POST } = await import("@/app/api/webhooks/asaas/route")

/**
 * A rota que confirma o agendamento.
 *
 * É ela, e não a tela do cliente, que decide que o dinheiro entrou — a tela
 * pode ser fechada, o celular travar, a rede cair. Isso a torna o alvo óbvio:
 * quem conseguisse falar com ela confirmaria a própria reserva sem pagar,
 * mandando um JSON.
 */

function evento(body: unknown, token: string | null = TOKEN) {
  return new Request("https://exemplo.com/api/webhooks/asaas", {
    method: "POST",
    headers: token ? { "asaas-access-token": token } : {},
    body: typeof body === "string" ? body : JSON.stringify(body),
  })
}

const PAGAMENTO = { id: "pay-1", status: "PENDING", bookingId: "book-1" }

const CORPO = {
  id: "evt-1",
  event: "PAYMENT_RECEIVED",
  payment: { id: "charge-1", status: "RECEIVED" },
}

beforeEach(() => {
  vi.clearAllMocks()
  getAsaasWebhookToken.mockReturnValue(TOKEN)
  db.$transaction.mockImplementation(async (ops: unknown[]) => Promise.all(ops))
  db.paymentEvent.create.mockResolvedValue({ id: "evt-row" })
  db.booking.update.mockResolvedValue({ id: "book-1" })
  db.payment.update.mockResolvedValue({ id: "pay-1" })
  db.booking.findUnique.mockResolvedValue({
    date: new Date("2026-08-12T14:00:00.000Z"),
    user: { name: "Cliente", email: "cliente@exemplo.com" },
    barber: { name: "Barbeiro" },
    service: {
      name: "Corte",
      barbershopId: "shop-1",
      barbershop: { name: "Barbearia Modelo", address: "Rua Exemplo, 123" },
    },
  })
})

describe("porta de entrada", () => {
  it("fica fechada quando não há token configurado", async () => {
    // Aberta, ela é um botão de "confirmar sem pagar" para a internet inteira.
    getAsaasWebhookToken.mockReturnValue("")

    expect((await POST(evento(CORPO))).status).toBe(503)
    expect(db.paymentEvent.create).not.toHaveBeenCalled()
  })

  it("recusa token errado", async () => {
    expect((await POST(evento(CORPO, "chute"))).status).toBe(401)
    expect(db.paymentEvent.create).not.toHaveBeenCalled()
  })

  it("recusa requisição sem token", async () => {
    expect((await POST(evento(CORPO, null))).status).toBe(401)
  })

  it("confere o token antes de olhar o corpo", async () => {
    // O corpo é dado de fora; ler antes de autenticar é trabalhar de graça para
    // quem estiver batendo na porta.
    const res = await POST(evento("isto não é json", "chute"))

    expect(res.status).toBe(401)
  })
})

describe("corpo malformado", () => {
  it("recusa o que não é json", async () => {
    expect((await POST(evento("{{{"))).status).toBe(400)
  })

  it("recusa evento sem id", async () => {
    const res = await POST(evento({ ...CORPO, id: undefined }))
    expect(res.status).toBe(400)
  })

  it("recusa evento sem tipo", async () => {
    const res = await POST(evento({ ...CORPO, event: undefined }))
    expect(res.status).toBe(400)
  })

  it("recusa evento sem cobrança", async () => {
    const res = await POST(evento({ ...CORPO, payment: {} }))
    expect(res.status).toBe(400)
  })
})

describe("reenvio do provedor", () => {
  it("não reaplica evento já processado", async () => {
    // O provedor reenvia enquanto não recebe 2xx. Sem esta trava, um reenvio
    // confirmaria de novo e duplicaria a notificação.
    db.payment.findUnique.mockResolvedValue(PAGAMENTO)
    db.paymentEvent.create.mockRejectedValue(new Error("unique constraint"))

    const res = await POST(evento(CORPO))

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ duplicate: true })
    expect(db.$transaction).not.toHaveBeenCalled()
    expect(notifyBarbershop).not.toHaveBeenCalled()
  })

  it("grava o evento antes de aplicar", async () => {
    db.payment.findUnique.mockResolvedValue(PAGAMENTO)

    await POST(evento(CORPO))

    expect(db.paymentEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ providerEventId: "evt-1" }),
      }),
    )
  })

  it("encerra sem erro cobrança que não é nossa", async () => {
    // Devolver erro faria o provedor reenviar para sempre algo que nunca vamos
    // reconhecer.
    db.payment.findUnique.mockResolvedValue(null)

    const res = await POST(evento(CORPO))

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ unknown: true })
  })
})

describe("de onde vem a verdade", () => {
  it("acha a cobrança pelo id do provedor, nunca pelo corpo", async () => {
    // O corpo vem de fora. Aceitar valor ou cliente dali deixaria alguém
    // confirmar a reserva de outra pessoa.
    db.payment.findUnique.mockResolvedValue(PAGAMENTO)

    await POST(
      evento({
        ...CORPO,
        payment: { id: "charge-1", externalReference: "book-999" },
      }),
    )

    expect(db.payment.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { providerId: "charge-1" } }),
    )
  })
})

describe("aplicação do evento", () => {
  it("dinheiro que entrou marca a cobrança como paga", async () => {
    db.payment.findUnique.mockResolvedValue(PAGAMENTO)

    await POST(evento(CORPO))

    expect(db.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "pay-1" },
        data: expect.objectContaining({ status: "PAID" }),
      }),
    )
  })

  it("tira o prazo da reserva, que passa a valer sem esperar", async () => {
    db.payment.findUnique.mockResolvedValue(PAGAMENTO)

    await POST(evento(CORPO))

    expect(db.booking.update).toHaveBeenCalledWith({
      where: { id: "book-1" },
      data: { expiresAt: null },
    })
  })

  it("confirma cobrança e reserva na mesma transação", async () => {
    db.payment.findUnique.mockResolvedValue(PAGAMENTO)

    await POST(evento(CORPO))

    expect(db.$transaction).toHaveBeenCalledTimes(1)
  })

  it("aceita PAYMENT_CONFIRMED do mesmo jeito que RECEIVED", async () => {
    db.payment.findUnique.mockResolvedValue(PAGAMENTO)

    await POST(evento({ ...CORPO, event: "PAYMENT_CONFIRMED" }))

    expect(db.$transaction).toHaveBeenCalledTimes(1)
  })

  it("avisa a barbearia que alguém pagou e vem", async () => {
    db.payment.findUnique.mockResolvedValue(PAGAMENTO)

    await POST(evento(CORPO))

    expect(notifyBarbershop).toHaveBeenCalledWith(
      expect.objectContaining({ barbershopId: "shop-1", paid: true }),
    )
  })

  it("manda ao cliente a confirmação do que ele pagou", async () => {
    // Quem pagou o sinal só tem a tela como prova; o e-mail é o comprovante
    // que fica.
    db.payment.findUnique.mockResolvedValue(PAGAMENTO)

    await POST(evento(CORPO))

    expect(notifyClient).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "CONFIRMED",
        email: "cliente@exemplo.com",
      }),
    )
  })

  it("estorno vira REFUNDED e registra quando", async () => {
    db.payment.findUnique.mockResolvedValue({ ...PAGAMENTO, status: "PAID" })

    await POST(evento({ ...CORPO, event: "PAYMENT_REFUNDED" }))

    const [[args]] = db.payment.update.mock.calls
    expect(args.data.status).toBe("REFUNDED")
    expect(args.data.refundedAt).toBeInstanceOf(Date)
  })

  it("cobrança vencida vira EXPIRED, sem data de estorno", async () => {
    db.payment.findUnique.mockResolvedValue(PAGAMENTO)

    await POST(evento({ ...CORPO, event: "PAYMENT_OVERDUE" }))

    const [[args]] = db.payment.update.mock.calls
    expect(args.data.status).toBe("EXPIRED")
    expect(args.data.refundedAt).toBeUndefined()
  })

  it("evento que não conhecemos não mexe em nada", async () => {
    db.payment.findUnique.mockResolvedValue(PAGAMENTO)

    const res = await POST(evento({ ...CORPO, event: "PAYMENT_UPDATED" }))

    expect(res.status).toBe(200)
    expect(db.payment.update).not.toHaveBeenCalled()
    expect(db.$transaction).not.toHaveBeenCalled()
  })
})
