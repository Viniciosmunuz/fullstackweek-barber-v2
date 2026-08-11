/** Onde moram as imagens que este site guarda. */
export const UPLOAD_PREFIX = "/api/images/"

/**
 * Um endereço de imagem aceito pelo cadastro.
 *
 * São dois formatos, e não um: endereço completo de uma imagem hospedada em
 * outro lugar, ou o caminho de um arquivo enviado aqui. O segundo é relativo de
 * propósito — assim a imagem continua funcionando se o domínio do site mudar,
 * e é por isso que `z.string().url()` não serve para validar este campo.
 */
export function isImageSource(value: string): boolean {
  if (value.startsWith(UPLOAD_PREFIX)) return true

  try {
    const { protocol } = new URL(value)
    return protocol === "http:" || protocol === "https:"
  } catch {
    return false
  }
}

export const IMAGE_SOURCE_MESSAGE =
  "Informe o endereço de uma imagem ou envie um arquivo do dispositivo."
