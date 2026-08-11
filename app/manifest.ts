import type { MetadataRoute } from "next"

/**
 * Manifesto PWA.
 *
 * Os ícones apontam para os PNGs de `public/brand`, rasterizados do mesmo
 * vetor do símbolo — instalado na tela inicial, o app não exibe uma marca
 * diferente da que aparece no site.
 *
 * `purpose: "any maskable"` deixa o Android recortar em círculo sem comer o
 * símbolo: ele ocupa cerca de 78% da arte, dentro da zona segura de 80%.
 */
const manifest = (): MetadataRoute.Manifest => ({
  name: "BarberFlow — Agendamento inteligente",
  short_name: "BarberFlow",
  description:
    "Agende horários nas melhores barbearias, organize sua equipe e ofereça uma experiência premium aos seus clientes em um único lugar.",
  start_url: "/",
  display: "standalone",
  background_color: "#0E0D12",
  theme_color: "#0E0D12",
  lang: "pt-BR",
  icons: [
    {
      src: "/brand/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/brand/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/brand/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
})

export default manifest
