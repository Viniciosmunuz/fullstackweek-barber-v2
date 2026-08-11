import { NextResponse } from "next/server"
import { db } from "@/app/_lib/prisma"

/**
 * Verificação de saúde do deploy.
 *
 * Consulta a tabela `Payment` — não pelo número, que é descartado, mas porque
 * a consulta só compila e só roda se o schema em produção estiver na versão
 * que o código espera. Um deploy em que a migração não aplicou responde 503
 * aqui em vez de falhar mais tarde, na hora de cobrar alguém.
 *
 * Não devolve dado nenhum além de `ok`: a rota é pública, e contagem de
 * pagamentos ou nome de tabela já seriam informação a mais para quem só
 * precisa saber se o serviço está de pé.
 */
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await db.payment.count()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
