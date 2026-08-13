import { beforeEach, describe, expect, it, vi } from "vitest"

const getServerSession = vi.fn()

const db = {
  barbershopManager: { findUnique: vi.fn(), findMany: vi.fn() },
  barbershop: { findMany: vi.fn() },
}

vi.mock("next-auth", () => ({ getServerSession }))
vi.mock("@/app/_lib/auth", () => ({ authOptions: {} }))
vi.mock("@/app/_lib/prisma", () => ({ db }))

const {
  getManagedShopRoles,
  getShopRole,
  isOwnerOf,
  requireManager,
  requireOwner,
  requireSession,
} = await import("@/app/_actions/dashboard/guard")

/**
 * Quem pode o quê.
 *
 * Esta é a rotina que separa "o dono da barbearia" de "qualquer pessoa com uma
 * conta Google". Até esta semana ela devolvia o papel e ninguém olhava para
 * ele, e por isso um funcionário mudava preço e abria o extrato. Uma regressão
 * aqui não quebra tela nenhuma — só deixa de recusar.
 *
 * O banco e a sessão são dublês: o que se verifica é a árvore de decisão, que é
 * exatamente onde o defeito mora.
 */

function loga(email: string | null, id: string | null = "u1") {
  getServerSession.mockResolvedValue(id ? { user: { id, email } } : null)
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env["PLATFORM_ADMIN_EMAILS"] = "dono@plataforma.com"
})

describe("requireSession", () => {
  it("recusa quem não está logado", async () => {
    getServerSession.mockResolvedValue(null)

    await expect(requireSession()).rejects.toThrow(/Sessão expirada/)
  })

  it("aceita quem está logado", async () => {
    loga("pessoa@exemplo.com")

    await expect(requireSession()).resolves.toEqual({
      userId: "u1",
      email: "pessoa@exemplo.com",
    })
  })
})

describe("requireManager", () => {
  it("recusa quem não tem vínculo com a barbearia", async () => {
    loga("estranho@exemplo.com")
    db.barbershopManager.findUnique.mockResolvedValue(null)

    await expect(requireManager("shop-1")).rejects.toThrow(/não tem permissão/)
  })

  it("aceita o dono", async () => {
    loga("dono@casa.com")
    db.barbershopManager.findUnique.mockResolvedValue({ role: "OWNER" })

    await expect(requireManager("shop-1")).resolves.toMatchObject({
      role: "OWNER",
    })
  })

  it("aceita a equipe — mexer na agenda é o trabalho dela", async () => {
    loga("barbeiro@casa.com")
    db.barbershopManager.findUnique.mockResolvedValue({ role: "STAFF" })

    await expect(requireManager("shop-1")).resolves.toMatchObject({
      role: "STAFF",
    })
  })

  it("consulta o vínculo pela dupla usuário + barbearia", async () => {
    // Se consultasse só pelo usuário, quem administra uma casa passaria a
    // administrar todas.
    loga("dono@casa.com")
    db.barbershopManager.findUnique.mockResolvedValue({ role: "OWNER" })

    await requireManager("shop-1")

    expect(db.barbershopManager.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_barbershopId: { userId: "u1", barbershopId: "shop-1" },
        },
      }),
    )
  })
})

describe("requireOwner", () => {
  it("recusa a equipe, e diz o motivo", async () => {
    loga("barbeiro@casa.com")
    db.barbershopManager.findUnique.mockResolvedValue({ role: "STAFF" })

    await expect(requireOwner("shop-1")).rejects.toThrow(/responde pela/)
  })

  it("aceita o dono", async () => {
    loga("dono@casa.com")
    db.barbershopManager.findUnique.mockResolvedValue({ role: "OWNER" })

    await expect(requireOwner("shop-1")).resolves.toMatchObject({
      role: "OWNER",
    })
  })

  it("recusa quem não tem vínculo nenhum", async () => {
    loga("estranho@exemplo.com")
    db.barbershopManager.findUnique.mockResolvedValue(null)

    await expect(requireOwner("shop-1")).rejects.toThrow()
  })
})

describe("administração da plataforma", () => {
  it("alcança qualquer barbearia, para dar suporte", async () => {
    loga("dono@plataforma.com")

    await expect(requireOwner("shop-qualquer")).resolves.toMatchObject({
      role: "OWNER",
    })
  })

  it("nem consulta vínculo — o e-mail já basta", async () => {
    loga("dono@plataforma.com")

    await requireManager("shop-qualquer")

    expect(db.barbershopManager.findUnique).not.toHaveBeenCalled()
  })

  it("compara e-mail sem diferenciar maiúsculas", async () => {
    loga("Dono@Plataforma.COM")

    await expect(requireOwner("shop-1")).resolves.toMatchObject({
      role: "OWNER",
    })
  })

  it("não confunde e-mail parecido com o da plataforma", async () => {
    loga("dono@plataforma.com.br")
    db.barbershopManager.findUnique.mockResolvedValue(null)

    await expect(requireOwner("shop-1")).rejects.toThrow()
  })

  it("com a lista vazia, ninguém é administrador da plataforma", async () => {
    process.env["PLATFORM_ADMIN_EMAILS"] = ""
    loga("dono@plataforma.com")
    db.barbershopManager.findUnique.mockResolvedValue(null)

    await expect(requireManager("shop-1")).rejects.toThrow()
  })
})

describe("isOwnerOf e getShopRole — decidem o que a tela mostra", () => {
  it("devolve null para quem não está logado", async () => {
    getServerSession.mockResolvedValue(null)

    expect(await getShopRole("shop-1")).toBeNull()
    expect(await isOwnerOf("shop-1")).toBe(false)
  })

  it("devolve null para quem não tem vínculo, sem lançar erro", async () => {
    // Ao contrário dos `require*`, esta versão é consultada durante o desenho
    // da página: lançar aqui viraria erro de servidor em vez de tela.
    loga("estranho@exemplo.com")
    db.barbershopManager.findUnique.mockResolvedValue(null)

    expect(await getShopRole("shop-1")).toBeNull()
  })

  it("esconde do colaborador o que ele não abre", async () => {
    loga("barbeiro@casa.com")
    db.barbershopManager.findUnique.mockResolvedValue({ role: "STAFF" })

    expect(await isOwnerOf("shop-1")).toBe(false)
  })

  it("mostra ao dono", async () => {
    loga("dono@casa.com")
    db.barbershopManager.findUnique.mockResolvedValue({ role: "OWNER" })

    expect(await isOwnerOf("shop-1")).toBe(true)
  })
})

describe("getManagedShopRoles", () => {
  it("devolve lista vazia para quem não está logado", async () => {
    getServerSession.mockResolvedValue(null)

    expect(await getManagedShopRoles()).toEqual([])
  })

  it("dá todas as barbearias como dono à administração da plataforma", async () => {
    loga("dono@plataforma.com")
    db.barbershop.findMany.mockResolvedValue([
      { slug: "casa-a" },
      { slug: "casa-b" },
    ])

    expect(await getManagedShopRoles()).toEqual([
      { slug: "casa-a", role: "OWNER" },
      { slug: "casa-b", role: "OWNER" },
    ])
  })

  it("guarda o papel por barbearia, não por conta", async () => {
    // A mesma pessoa pode ser dona de uma unidade e funcionária de outra.
    loga("pessoa@exemplo.com")
    db.barbershopManager.findMany.mockResolvedValue([
      { role: "OWNER", barbershop: { slug: "minha-casa" } },
      { role: "STAFF", barbershop: { slug: "onde-trabalho" } },
    ])

    expect(await getManagedShopRoles()).toEqual([
      { slug: "minha-casa", role: "OWNER" },
      { slug: "onde-trabalho", role: "STAFF" },
    ])
  })
})
