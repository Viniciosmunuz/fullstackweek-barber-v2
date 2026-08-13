import { describe, expect, it } from "vitest"

import { UPLOAD_PREFIX, isImageSource } from "../app/_lib/image-source"

/**
 * O campo de imagem aceita dois formatos, e conhecer só um deles já custou um
 * defeito: o upload gravava certo, a prévia aparecia, e salvar sempre falhava
 * porque a validação exigia URL completa e recebia caminho relativo.
 */

describe("isImageSource", () => {
  it("aceita endereço de imagem hospedada fora", () => {
    expect(isImageSource("https://exemplo.com/logo.png")).toBe(true)
    expect(isImageSource("http://exemplo.com/logo.png")).toBe(true)
  })

  it("aceita o caminho de um arquivo enviado aqui", () => {
    expect(
      isImageSource(`${UPLOAD_PREFIX}0f8b2d1e-0000-4000-8000-000000000000`),
    ).toBe(true)
  })

  it("recusa esquema que executa código", () => {
    // `new URL` aceita estes sem reclamar — só o teste de protocolo os barra.
    // Sem isso, o endereço iria parar num atributo de imagem da página pública.
    expect(isImageSource("javascript:alert(1)")).toBe(false)
    expect(isImageSource("data:text/html,<script>alert(1)</script>")).toBe(
      false,
    )
  })

  it("recusa caminho relativo que não seja o das imagens enviadas", () => {
    expect(isImageSource("/etc/passwd")).toBe(false)
    expect(isImageSource("/api/health")).toBe(false)
  })

  it("recusa texto que não é endereço nenhum", () => {
    expect(isImageSource("")).toBe(false)
    expect(isImageSource("logo.png")).toBe(false)
    expect(isImageSource("   ")).toBe(false)
  })
})
