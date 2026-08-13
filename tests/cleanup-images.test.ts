import { beforeEach, describe, expect, it, vi } from "vitest"

const db = {
  imageAsset: { findMany: vi.fn(), deleteMany: vi.fn() },
  barbershop: { findMany: vi.fn() },
  barbershopService: { findMany: vi.fn() },
}

vi.mock("../app/_lib/prisma", () => ({ db }))

const { cleanupOrphanImages, referencedImageIds } = await import(
  "../app/_lib/cleanup-images"
)

/**
 * A limpeza das imagens sem dono.
 *
 * O risco aqui é o oposto do usual: não é deixar lixo, é apagar o que está em
 * uso. Uma exclusão errada quebra a logo de uma barbearia em produção e não tem
 * como ser desfeita — os bytes eram a única cópia.
 */

const AGORA = new Date("2026-08-12T12:00:00.000Z")

beforeEach(() => {
  vi.clearAllMocks()
  db.barbershop.findMany.mockResolvedValue([])
  db.barbershopService.findMany.mockResolvedValue([])
  db.imageAsset.deleteMany.mockResolvedValue({ count: 0 })
})

describe("referencedImageIds", () => {
  it("reconhece o caminho das imagens enviadas", () => {
    expect(referencedImageIds(["/api/images/abc"])).toEqual(new Set(["abc"]))
  })

  it("ignora endereço hospedado fora", () => {
    expect(referencedImageIds(["https://exemplo.com/logo.png"]).size).toBe(0)
  })

  it("ignora vazio e nulo", () => {
    expect(referencedImageIds([null, undefined, ""]).size).toBe(0)
  })

  it("não se confunde com sufixo depois do id", () => {
    // Um endereço com query ou barra ainda aponta para o mesmo arquivo; ler o
    // id errado marcaria a imagem como não usada e ela seria apagada.
    expect(referencedImageIds(["/api/images/abc?v=2"])).toEqual(
      new Set(["abc"]),
    )
    expect(referencedImageIds(["/api/images/abc/"])).toEqual(new Set(["abc"]))
  })

  it("junta referências repetidas", () => {
    expect(referencedImageIds(["/api/images/x", "/api/images/x"]).size).toBe(1)
  })
})

describe("cleanupOrphanImages", () => {
  it("não faz nada quando não há candidato", async () => {
    db.imageAsset.findMany.mockResolvedValue([])

    expect(await cleanupOrphanImages(AGORA)).toBe(0)
    expect(db.imageAsset.deleteMany).not.toHaveBeenCalled()
  })

  it("só olha o que passou da carência", async () => {
    // Entre enviar o arquivo e salvar o formulário, a imagem está sem
    // referência mas prestes a ganhar uma. Apagar nesse intervalo faria o dono
    // salvar e encontrar a foto quebrada.
    db.imageAsset.findMany.mockResolvedValue([])

    await cleanupOrphanImages(AGORA)

    const [[args]] = db.imageAsset.findMany.mock.calls
    expect(args.where.createdAt.lt).toEqual(
      new Date("2026-08-11T12:00:00.000Z"),
    )
  })

  it("apaga o que ninguém referencia", async () => {
    db.imageAsset.findMany.mockResolvedValue([{ id: "orfa" }])

    expect(await cleanupOrphanImages(AGORA)).toBe(1)
    expect(db.imageAsset.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["orfa"] } },
    })
  })

  it("preserva a logo em uso", async () => {
    db.imageAsset.findMany.mockResolvedValue([{ id: "logo" }])
    db.barbershop.findMany.mockResolvedValue([
      { imageUrl: "https://exemplo.com/capa.jpg", logoUrl: "/api/images/logo" },
    ])

    expect(await cleanupOrphanImages(AGORA)).toBe(0)
    expect(db.imageAsset.deleteMany).not.toHaveBeenCalled()
  })

  it("preserva a foto de capa em uso", async () => {
    db.imageAsset.findMany.mockResolvedValue([{ id: "capa" }])
    db.barbershop.findMany.mockResolvedValue([
      { imageUrl: "/api/images/capa", logoUrl: null },
    ])

    expect(await cleanupOrphanImages(AGORA)).toBe(0)
  })

  it("preserva a imagem de um serviço", async () => {
    db.imageAsset.findMany.mockResolvedValue([{ id: "servico" }])
    db.barbershopService.findMany.mockResolvedValue([
      { imageUrl: "/api/images/servico" },
    ])

    expect(await cleanupOrphanImages(AGORA)).toBe(0)
  })

  it("separa órfã de usada na mesma passada", async () => {
    db.imageAsset.findMany.mockResolvedValue([
      { id: "usada" },
      { id: "orfa" },
      { id: "outra-orfa" },
    ])
    db.barbershop.findMany.mockResolvedValue([
      { imageUrl: "/api/images/usada", logoUrl: null },
    ])

    expect(await cleanupOrphanImages(AGORA)).toBe(2)
    expect(db.imageAsset.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["orfa", "outra-orfa"] } },
    })
  })

  it("limita quantas apaga de uma vez", async () => {
    db.imageAsset.findMany.mockResolvedValue([])

    await cleanupOrphanImages(AGORA)

    const [[args]] = db.imageAsset.findMany.mock.calls
    expect(args.take).toBe(500)
  })
})
