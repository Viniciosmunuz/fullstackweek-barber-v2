import { describe, expect, it } from "vitest"

import {
  PROVIDER_FEE_CENTS,
  splitDeposit,
  toCents,
  toReais,
  type FeePolicy,
} from "../app/_lib/payments/policy"

/**
 * O cálculo do sinal é a rotina de maior consequência do sistema: o resultado
 * vira dinheiro na conta de outra empresa. Um defeito aqui não quebra tela
 * nenhuma — aparece semanas depois, no extrato do lojista, como divergência que
 * ninguém sabe explicar.
 *
 * Por isso os casos abaixo não são exemplos ilustrativos: cada um corresponde a
 * uma trava do código, e o comentário diz o que aconteceria sem ela.
 */

/** Política sem taxa — o padrão desde 11/08/2026. */
function policy(overrides: Partial<FeePolicy> = {}): FeePolicy {
  return {
    depositType: "PERCENT",
    depositValue: 30,
    platformFeeType: "PERCENT",
    platformFeeValue: 0,
    ...overrides,
  }
}

describe("toCents", () => {
  it("converte reais para centavos inteiros", () => {
    expect(toCents(45)).toBe(4500)
    expect(toCents("45.00")).toBe(4500)
  })

  it("aceita o Decimal do Prisma, que chega como string", () => {
    expect(toCents({ toString: () => "89.90" })).toBe(8990)
  })

  it("não perde o centavo que o ponto flutuante comeria", () => {
    // 45.67 * 100 dá 4566.999999999999 em JS. Sem o arredondamento, o
    // truncamento levaria um centavo embora a cada conversão.
    expect(toCents("45.67")).toBe(4567)
    expect(toCents("0.07")).toBe(7)
  })

  it("trata valor inválido como zero em vez de NaN", () => {
    // NaN se propagaria por toda a conta e viraria uma cobrança inválida no
    // provedor, com mensagem incompreensível.
    expect(toCents("abacaxi")).toBe(0)
    expect(toCents("")).toBe(0)
  })

  it("volta para reais", () => {
    expect(toReais(4567)).toBe(45.67)
    expect(toReais(0)).toBe(0)
  })
})

describe("splitDeposit — sem taxa da plataforma", () => {
  it("repassa tudo menos o custo da transação", () => {
    // O provedor desconta a tarifa dele antes de qualquer split. Mandar
    // repassar o valor cheio é recusado com "o valor total do Split excede o
    // valor a receber" — foi o que quebrou o PIX em 12/08/2026.
    const result = splitDeposit(45, policy())

    expect(result.amountCents).toBe(1350)
    expect(result.platformFeeCents).toBe(0)
    expect(result.providerFeeCents).toBe(PROVIDER_FEE_CENTS)
    expect(result.shopAmountCents).toBe(1350 - PROVIDER_FEE_CENTS)
  })

  it("mantém a soma fechada: taxa + provedor + repasse = cobrado", () => {
    const result = splitDeposit("89.90", policy())

    expect(
      result.platformFeeCents +
        result.providerFeeCents +
        result.shopAmountCents,
    ).toBe(result.amountCents)
  })

  it("nunca pede split maior do que o provedor aceita", () => {
    // A regra do Asaas: split <= valor da cobrança menos a tarifa dele.
    for (const preco of [10, 30, 45, 89.9, 250]) {
      const result = splitDeposit(preco, policy())

      expect(result.shopAmountCents).toBeLessThanOrEqual(
        result.amountCents - PROVIDER_FEE_CENTS,
      )
    }
  })
})

describe("splitDeposit — formas de calcular", () => {
  it("aplica sinal percentual sobre o preço", () => {
    expect(splitDeposit(100, policy({ depositValue: 30 })).amountCents).toBe(
      3000,
    )
  })

  it("aplica sinal fixo independente do preço", () => {
    const fixed = policy({ depositType: "FIXED", depositValue: 10 })

    expect(splitDeposit(100, fixed).amountCents).toBe(1000)
    expect(splitDeposit(50, fixed).amountCents).toBe(1000)
  })

  it("arredonda o percentual ao centavo", () => {
    // 33,33 × 30% = 9,999. Sem arredondar viraria fração de centavo, que o
    // provedor recusa.
    expect(splitDeposit("33.33", policy()).amountCents).toBe(1000)
  })
})

describe("splitDeposit — custo da transação", () => {
  it("levanta o sinal até cobrir o custo, em vez de repassar negativo", () => {
    // Serviço de R$ 2 com sinal de 30% daria R$ 0,60, menos que a tarifa de
    // R$ 0,99. Cobrar isso faria a barbearia receber menos que zero.
    const result = splitDeposit(2, policy())

    expect(result.amountCents).toBe(PROVIDER_FEE_CENTS)
    expect(result.shopAmountCents).toBe(0)
  })

  it("não cobra mais que o serviço nem para cobrir o custo", () => {
    // Serviço mais barato que a própria tarifa: a cobrança fica no preço e o
    // repasse é zero. Quem decide se vale a pena é a barbearia, no cadastro.
    const result = splitDeposit("0.50", policy())

    expect(result.amountCents).toBe(50)
    expect(result.providerFeeCents).toBe(50)
    expect(result.shopAmountCents).toBe(0)
  })

  it("soma taxa da plataforma e custo do provedor no piso", () => {
    const result = splitDeposit(
      100,
      policy({ depositType: "FIXED", depositValue: 1, platformFeeValue: 10 }),
    )

    // Sinal pedido de R$ 1 é menor que taxa (R$ 10) + tarifa (R$ 0,99).
    expect(result.amountCents).toBe(1000 + PROVIDER_FEE_CENTS)
    expect(result.shopAmountCents).toBe(0)
  })
})

describe("splitDeposit — as duas travas", () => {
  it("nunca cobra menos que o retido, senão a plataforma pagaria para trabalhar", () => {
    // Sinal de 5% (R$ 2,25) contra taxa de 10% (R$ 4,50) mais a tarifa do
    // provedor: repassar o combinado faria a plataforma entregar mais do que
    // recebeu.
    const result = splitDeposit(
      45,
      policy({ depositValue: 5, platformFeeValue: 10 }),
    )

    expect(result.amountCents).toBe(450 + PROVIDER_FEE_CENTS)
    expect(result.platformFeeCents).toBe(450)
    expect(result.shopAmountCents).toBe(0)
  })

  it("nunca cobra mais que o serviço, senão o cliente pagaria adiantado a mais", () => {
    const result = splitDeposit(
      45,
      policy({ depositType: "FIXED", depositValue: 100 }),
    )

    expect(result.amountCents).toBe(4500)
    expect(result.shopAmountCents).toBe(4500 - PROVIDER_FEE_CENTS)
  })

  it("limita também a taxa ao preço do serviço", () => {
    const result = splitDeposit(
      45,
      policy({ platformFeeType: "FIXED", platformFeeValue: 100 }),
    )

    expect(result.platformFeeCents).toBe(4500)
    expect(result.shopAmountCents).toBe(0)
  })

  it("nunca devolve valor negativo", () => {
    const result = splitDeposit(-50, policy())

    expect(result.amountCents).toBe(0)
    expect(result.platformFeeCents).toBe(0)
    expect(result.shopAmountCents).toBe(0)
  })

  it("serviço de graça não gera cobrança", () => {
    expect(splitDeposit(0, policy()).amountCents).toBe(0)
  })
})
