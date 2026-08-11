import { db } from "@/app/_lib/prisma"

/** Prisma não roda no runtime de edge. */
export const runtime = "nodejs"

/**
 * Serve uma imagem enviada do dispositivo.
 *
 * Sem autenticação de propósito: são logos e fotos de barbearia, que o catálogo
 * público já mostra para qualquer visitante. Trancar aqui não esconderia nada e
 * quebraria o card de quem não está logado.
 *
 * O cache é imutável porque o id nunca é reaproveitado: trocar a imagem cria
 * outra linha e outro endereço. Assim o navegador e a CDN buscam uma vez só, e
 * o banco não é lido a cada visita ao catálogo — que é o que tornaria guardar
 * imagem em banco uma má ideia.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const asset = await db.imageAsset.findUnique({
    where: { id: params.id },
    select: { data: true, mimeType: true },
  })

  if (!asset) {
    return new Response("Imagem não encontrada.", { status: 404 })
  }

  // Cópia para um Uint8Array simples: o Buffer do Node é aceito na prática,
  // mas o tipo de corpo de resposta que o Next declara não o inclui.
  const body = new Uint8Array(asset.data)

  return new Response(body, {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(body.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
