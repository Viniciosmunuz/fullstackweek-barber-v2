import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

/**
 * Os quatro primeiros testes importavam só módulos puros, por caminho relativo,
 * e não precisavam de configuração nenhuma. Os guardas de acesso e o webhook
 * importam por `@/`, que é apelido do tsconfig — e o vitest não lê o tsconfig
 * sozinho. Sem isto, o import falha antes de qualquer asserção rodar.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
  },
})
