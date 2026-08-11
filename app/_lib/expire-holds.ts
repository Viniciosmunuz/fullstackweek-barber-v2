import { db } from "./prisma"

/**
 * Encerra reservas cujo prazo de sinal venceu sem pagamento.
 *
 * O horário já voltava para a lista sozinho, porque o filtro de disponibilidade
 * ignora prazo vencido. O que faltava era fechar o registro: sem isso a reserva
 * ficava `PENDING` para sempre, aparecia como agendamento para o cliente e
 * entrava nas contas do painel como se fosse real.
 *
 * A linha não é apagada. Ela vira `CANCELLED` com a cobrança `EXPIRED`, e
 * `expiresAt` fica como estava — é o registro de quando venceu. A tentativa de
 * pagamento continua auditável, que é o mesmo princípio do cancelamento.
 *
 * Roda sob demanda, nas leituras que dependem de a agenda estar honesta, em vez
 * de depender de um agendador. A varredura é barata porque `expiresAt` é
 * indexado e, passada a primeira vez, não há mais nada a encontrar. O `take`
 * evita que um acúmulo inesperado transforme uma leitura numa escrita enorme.
 */
export async function expireStaleHolds(now: Date = new Date()): Promise<number> {
  const vencidas = await db.booking.findMany({
    where: {
      expiresAt: { lt: now },
      status: { not: "CANCELLED" },
    },
    select: { id: true },
    take: 200,
  })

  if (vencidas.length === 0) return 0

  const ids = vencidas.map((linha) => linha.id)

  await db.$transaction([
    // Só cobrança ainda pendente muda. Uma que tenha sido paga no limite do
    // prazo não pode ser marcada como vencida por esta varredura.
    db.payment.updateMany({
      where: { bookingId: { in: ids }, status: "PENDING" },
      data: { status: "EXPIRED" },
    }),
    db.booking.updateMany({
      where: { id: { in: ids }, status: { not: "CANCELLED" } },
      data: { status: "CANCELLED" },
    }),
  ])

  return ids.length
}
