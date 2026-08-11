"use server"

import { db } from "@/app/_lib/prisma"
import { requireOwner } from "./guard"

/**
 * Teto do que entra no banco.
 *
 * O navegador já reduz a imagem antes de enviar, então na prática chega bem
 * abaixo disso. O limite existe para o caso de o redimensionamento falhar ou
 * de alguém chamar a ação direto: server action é endereço acessível, e sem
 * teto viraria hospedagem de arquivo grátis.
 */
const MAX_BYTES = 1_500_000

const ALLOWED_TYPES = ["image/webp", "image/png", "image/jpeg"]

/**
 * Recebe uma imagem do dispositivo e devolve o endereço para guardá-la.
 *
 * Devolve um caminho relativo (`/api/images/<id>`) e não um id cru, para que
 * quem chama simplesmente guarde no mesmo campo onde antes ia uma URL colada.
 * Do ponto de vista do resto do sistema, imagem enviada e imagem hospedada fora
 * são a mesma coisa — e é por isso que nenhuma outra tela precisou mudar.
 */
export async function uploadImage(barbershopId: string, formData: FormData) {
  await requireOwner(barbershopId)

  const file = formData.get("file")

  // Sem `instanceof File`: a classe só existe como global a partir do Node 20,
  // e o tipo de `FormData.get` já garante que o que não é string é arquivo.
  if (!file || typeof file === "string") {
    throw new Error("Nenhum arquivo recebido.")
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Envie uma imagem PNG, JPG ou WebP.")
  }

  if (file.size > MAX_BYTES) {
    throw new Error(
      "Imagem muito grande. Tente uma menor que 1,5 MB ou reduza antes de enviar.",
    )
  }

  const bytes = Buffer.from(await file.arrayBuffer())

  // `file.size` vem do cliente; `bytes.length` é o que de fato chegou. É este
  // que vale, tanto para gravar quanto para conferir o teto.
  if (bytes.length === 0) throw new Error("O arquivo chegou vazio.")
  if (bytes.length > MAX_BYTES) throw new Error("Imagem muito grande.")

  const asset = await db.imageAsset.create({
    data: {
      mimeType: file.type,
      data: bytes,
      byteSize: bytes.length,
      barbershopId,
    },
    select: { id: true },
  })

  return `/api/images/${asset.id}`
}
