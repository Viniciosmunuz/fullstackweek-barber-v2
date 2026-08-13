import { beforeEach, describe, expect, it, vi } from "vitest"

const db = {
  booking: {
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
  payment: {
    updateMany: vi.fn(),
  },
  $transaction: vi.fn(async (ops: unknown[]) => Promise.all(ops)),
}

vi.mock("../app/_lib/prisma", () => ({ db }))

const { expireStaleHolds } = await import("../app/_lib/expire-holds")

/**
 * A varredura que encerra reservas cujo sinal nunca chegou.
 *
 * O banco é trocado por um dublê: o que interessa verificar aqui não é se o
 * Postgres executa a consulta, e sim **quais** escritas a rotina decide fazer.
 * É nessa decisão que mora o estrago — marcar como vencida uma cobrança que
 * acabou de ser paga significa cancelar o horário de quem pagou.
 */

beforeEach(() => {
  vi.clearAllMocks()
  db.$transaction.mockImplementation(async (ops: unknown[]) => Promise.all(ops))
})

const AGORA = new Date("2026-08-11T12:00:00.000Z")

describe("expireStaleHolds", () => {
  it("não escreve nada quando não há reserva vencida", async () => {
    db.booking.findMany.mockResolvedValue([])

    expect(await expireStaleHolds(AGORA)).toBe(0)

    expect(db.$transaction).not.toHaveBeenCalled()
    expect(db.payment.updateMany).not.toHaveBeenCalled()
    expect(db.booking.updateMany).not.toHaveBeenCalled()
  })

  it("procura só o que passou do prazo e ainda não foi cancelado", async () => {
    db.booking.findMany.mockResolvedValue([])

    await expireStaleHolds(AGORA)

    expect(db.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { expiresAt: { lt: AGORA }, status: { not: "CANCELLED" } },
      }),
    )
  })

  it("limita a varredura, para uma leitura não virar escrita enorme", async () => {
    db.booking.findMany.mockResolvedValue([])

    await expireStaleHolds(AGORA)

    expect(db.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 200 }),
    )
  })

  it("vence só cobrança ainda pendente", async () => {
    // A trava que importa: uma cobrança paga no limite do prazo não pode ser
    // marcada como vencida por esta varredura. Sem o filtro de status, o
    // cliente pagaria e teria o horário cancelado mesmo assim.
    db.booking.findMany.mockResolvedValue([{ id: "b1" }, { id: "b2" }])

    await expireStaleHolds(AGORA)

    expect(db.payment.updateMany).toHaveBeenCalledWith({
      where: { bookingId: { in: ["b1", "b2"] }, status: "PENDING" },
      data: { status: "EXPIRED" },
    })
  })

  it("cancela a reserva e não a apaga", async () => {
    // Apagar levaria junto o registro da tentativa. `expiresAt` fica como
    // estava, virando o registro de quando venceu.
    db.booking.findMany.mockResolvedValue([{ id: "b1" }])

    await expireStaleHolds(AGORA)

    expect(db.booking.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["b1"] }, status: { not: "CANCELLED" } },
      data: { status: "CANCELLED" },
    })
  })

  it("faz as duas escritas na mesma transação", async () => {
    // Separadas, uma falha deixaria cobrança vencida com reserva viva — ou o
    // contrário, que é pior: horário cancelado com cobrança ainda em pé.
    db.booking.findMany.mockResolvedValue([{ id: "b1" }])

    await expireStaleHolds(AGORA)

    expect(db.$transaction).toHaveBeenCalledTimes(1)
    expect(db.$transaction.mock.calls[0][0]).toHaveLength(2)
  })

  it("devolve quantas reservas encerrou", async () => {
    db.booking.findMany.mockResolvedValue([{ id: "b1" }, { id: "b2" }])

    expect(await expireStaleHolds(AGORA)).toBe(2)
  })

  it("usa o instante recebido, e não o relógio de agora", async () => {
    db.booking.findMany.mockResolvedValue([])
    const outro = new Date("2030-01-01T00:00:00.000Z")

    await expireStaleHolds(outro)

    expect(db.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ expiresAt: { lt: outro } }),
      }),
    )
  })
})
