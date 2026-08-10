/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /*
     * O dono da barbearia informa a URL da própria foto, então a lista fixa de
     * domínios travava o cadastro em qualquer hospedagem fora a original.
     *
     * Liberar HTTPS em geral é aceitável aqui porque quem preenche o campo é um
     * gestor autenticado da barbearia, não o público. Se o projeto passar a
     * aceitar URL de visitante, vale voltar a restringir por domínio.
     */
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
}

export default nextConfig
