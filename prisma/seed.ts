/**
 * Recarrega o catálogo de demonstração do BarberFlow.
 *
 * Os dados vivem na migration `20260819010000_portfolio_catalog` porque o
 * ambiente de build não executa `prisma db seed`. Este script reaproveita
 * exatamente aquele SQL para que não existam duas fontes de verdade: rodar o
 * seed localmente produz o mesmo catálogo que o deploy produz.
 *
 *   npx prisma db seed
 */
const { PrismaClient } = require("@prisma/client")
const fs = require("node:fs")
const path = require("node:path")

const prisma = new PrismaClient()

const CATALOG_MIGRATION = path.join(
  __dirname,
  "migrations",
  "20260819010000_portfolio_catalog",
  "migration.sql",
)

async function seedDatabase() {
  const sql = fs.readFileSync(CATALOG_MIGRATION, "utf8")

  // O arquivo é um lote único de comandos; executamos como script para manter a
  // ordem (limpeza -> barbearias -> serviços -> barbeiros -> horários ->
  // clientes -> atendimentos -> avaliações).
  await prisma.$executeRawUnsafe(sql)

  const [barbershops, services, barbers, bookings, reviews] = await Promise.all(
    [
      prisma.barbershop.count(),
      prisma.barbershopService.count(),
      prisma.barber.count(),
      prisma.booking.count(),
      prisma.review.count(),
    ],
  )

  console.log(
    `Catálogo recarregado: ${barbershops} barbearias, ${services} serviços, ` +
      `${barbers} profissionais, ${bookings} atendimentos e ${reviews} avaliações.`,
  )
}

seedDatabase()
  .catch((error: unknown) => {
    console.error("Falha ao recarregar o catálogo:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
