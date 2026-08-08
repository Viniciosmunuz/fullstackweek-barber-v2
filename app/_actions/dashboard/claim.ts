"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/app/_lib/prisma"
import { requireSession } from "./guard"

/**
 * Concessão de gestão para o ambiente de demonstração.
 *
 * O catálogo é fictício e o projeto existe para ser navegado, então precisa
 * haver um caminho para alguém entrar no painel. Em vez de deixar a autorização
 * frouxa, o auto-atendimento fica atrás de uma variável de ambiente: sem
 * `DEMO_SELF_SERVICE=true` o pedido é recusado e o vínculo só nasce se for
 * criado deliberadamente no banco.
 *
 * Em uma instalação real basta não definir a variável — a regra de permissão
 * continua idêntica, o que muda é apenas quem pode se conceder acesso.
 */
export async function claimDemoBarbershops() {
  const { userId } = await requireSession()

  if (process.env.DEMO_SELF_SERVICE !== "true") {
    throw new Error(
      "Este ambiente não permite auto-cadastro de gestores. Peça acesso ao responsável pela barbearia.",
    )
  }

  const barbershops = await db.barbershop.findMany({ select: { id: true } })

  // createMany + skipDuplicates evita erro se o vínculo já existir para alguma.
  await db.barbershopManager.createMany({
    data: barbershops.map((shop) => ({
      userId,
      barbershopId: shop.id,
      role: "OWNER" as const,
    })),
    skipDuplicates: true,
  })

  revalidatePath("/dashboard", "layout")

  return { granted: barbershops.length }
}
