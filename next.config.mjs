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
  experimental: {
    serverActions: {
      /*
       * Envio de imagem passa por server action, e o teto padrão é 1 MB.
       * O navegador reduz o arquivo antes de subir e o servidor recusa acima
       * de 1,5 MB, então esta folga só existe para o erro cair na validação
       * — com mensagem — em vez de morrer no limite do corpo da requisição.
       */
      bodySizeLimit: "2mb",
    },
  },
}

export default nextConfig
