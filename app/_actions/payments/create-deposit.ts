"use server"

import { z } from "zod"
import { getServerSession } from "next-auth"
import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/app/_lib/auth"
import { activeBookingFilter, holdDeadline } from "@/app/_lib/booking-slot"
import { splitDeposit, toReais } from "@/app/_lib/payments/policy"
import {
  createPixCharge,
  ensureCustomer,
  getPixQrCode,
} from "@/app/_lib/payments/asaas"
import { isPaymentsConfigured } from "@/app/_lib/config"
import type { DepositResult } from "./types"

/**
 * Cria a reserva e o sinal em PIX.
 *
 * A reserva nasce segurando o horário (`expiresAt` no futuro) e só vira
 * agendamento quando o webhook confirma o pagamento. É o oposto de confirmar
 * primeiro e cobrar depois: se o dinheiro não chega, o horário volta para a
 * lista sozinho, sem ninguém precisar limpar nada.
 */

const schema = z.object({
  serviceId: z.string().uuid(),
  barberId: z.string().uuid(),
  date: z.coerce.date(),
  cpfCnpj: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 11 || value.length === 14, {
      message: "Informe um CPF ou CNPJ válido.",
    }),
})

export async function createBookingWithDeposit(
  input: z.infer<typeof schema>,
): Promise<DepositResult> {
  const { serviceId, barberId, date, cpfCnpj } = schema.parse(input)

  const session = await getServerSession(authOptions)
  const user = session?.user as
    | { id?: string; name?: string | null; email?: string | null }
    | undefined

  if (!user?.id) {
    throw new Error("Entre na sua conta para agendar.")
  }

  const userId = user.id

  if (!isPaymentsConfigured()) {
    throw new Error("Pagamento online indisponível no momento.")
  }

  // O preço e a política vêm do banco, nunca do cliente: o valor cobrado não
  // pode depender de nada que o navegador tenha mandado.
  const service = await db.barbershopService.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      name: true,
      price: true,
      barbershop: {
        select: {
          id: true,
          name: true,
          paymentsEnabled: true,
          payoutWalletId: true,
          depositType: true,
          depositValue: true,
          platformFeeType: true,
          platformFeeValue: true,
        },
      },
    },
  })

  if (!service) {
    throw new Error("Serviço não encontrado.")
  }

  const shop = service.barbershop

  if (!shop.paymentsEnabled || !shop.payoutWalletId) {
    throw new Error("Esta barbearia ainda não aceita pagamento pelo aplicativo.")
  }

  const barber = await db.barber.findFirst({
    where: { id: barberId, barbershopId: shop.id, active: true },
    select: { id: true, name: true },
  })

  if (!barber) {
    throw new Error("Profissional indisponível.")
  }

  const conflict = await db.booking.findFirst({
    where: { barberId, date, ...activeBookingFilter() },
    select: { id: true },
  })

  if (conflict) {
    throw new Error("Este horário acabou de ser reservado. Escolha outro.")
  }

  const breakdown = splitDeposit(service.price, {
    depositType: shop.depositType,
    depositValue: shop.depositValue,
    platformFeeType: shop.platformFeeType,
    platformFeeValue: shop.platformFeeValue,
  })

  if (breakdown.amountCents <= 0) {
    throw new Error("Sinal indisponível para este serviço.")
  }

  const expiresAt = holdDeadline()

  // Reserva e cobrança nascem juntas: uma reserva segurando horário sem
  // cobrança correspondente ficaria presa até vencer, sem ninguém saber por quê.
  const booking = await db.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: { serviceId, barberId, date, userId, expiresAt },
      select: { id: true },
    })

    await tx.payment.create({
      data: {
        bookingId: created.id,
        amount: toReais(breakdown.amountCents).toFixed(2),
        platformFee: toReais(breakdown.platformFeeCents).toFixed(2),
        shopAmount: toReais(breakdown.shopAmountCents).toFixed(2),
        expiresAt,
      },
    })

    // Guarda o documento para o próximo agendamento não pedir de novo.
    await tx.user.update({ where: { id: userId }, data: { cpfCnpj } })

    return created
  })

  try {
    const customerId = await ensureCustomer({
      name: user.name ?? "Cliente BarberFlow",
      cpfCnpj,
      email: user.email,
      externalReference: userId,
    })

    const charge = await createPixCharge({
      customerId,
      amountCents: breakdown.amountCents,
      shopAmountCents: breakdown.shopAmountCents,
      walletId: shop.payoutWalletId,
      description: `Sinal · ${service.name} · ${shop.name}`,
      externalReference: booking.id,
      dueDate: expiresAt.toISOString().slice(0, 10),
    })

    const qr = await getPixQrCode(charge.id)

    await db.payment.update({
      where: { bookingId: booking.id },
      data: {
        providerId: charge.id,
        checkoutUrl: charge.invoiceUrl ?? null,
        pixPayload: qr.payload ?? null,
      },
    })

    return {
      bookingId: booking.id,
      pixPayload: qr.payload ?? null,
      qrCodeBase64: qr.encodedImage ?? null,
      amount: toReais(breakdown.amountCents),
      expiresAt,
    }
  } catch (error) {
    // Cobrança não nasceu: solta o horário na hora em vez de deixá-lo preso
    // até o prazo vencer por um erro que já é conhecido aqui.
    //
    // A cobrança sai antes da reserva porque a chave estrangeira é `Restrict`.
    // Aqui apagar é seguro e correto: este registro nunca chegou ao provedor,
    // então não há dinheiro nem história para preservar.
    await db
      .$transaction(async (tx) => {
        await tx.payment.deleteMany({ where: { bookingId: booking.id } })
        await tx.booking.delete({ where: { id: booking.id } })
      })
      .catch(() => undefined)

    console.error("Falha ao criar a cobrança do sinal:", error)
    throw new Error(
      "Não foi possível gerar o PIX agora. Tente de novo em instantes.",
    )
  }
}
