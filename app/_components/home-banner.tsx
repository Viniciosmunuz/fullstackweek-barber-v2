import Image from "next/image"

/**
 * Banner de apresentação da home, entre a ordenação e a grade.
 *
 * A arte é a referência enviada pelo dono do produto, com o logo do canto e o
 * botão "Agendar agora" removidos: a marca já está no cabeçalho a poucos
 * pixels dali, e a página inteira é sobre agendar — o botão apontaria para a
 * grade logo abaixo.
 *
 * O texto que vinha pintado na arte também saiu, e volta aqui como HTML. É o
 * que permite o banner ser sempre retangular: antes ele empilhava no celular
 * para o texto pintado não virar borrão de 7px, e empilhado ficava quadrado.
 * Com texto vivo a proporção 2,1:1 vale em qualquer largura, e a leitura
 * continua nítida porque o corpo escala por CSS, não por redimensionamento de
 * imagem.
 *
 * A faixa de texto para em 47% da largura: o arco de brilho da arte começa em
 * torno de 44% e a figura do barbeiro em 48%.
 */
const HomeBanner = () => (
  <section
    aria-label="Sobre o BarberFlow"
    className="relative overflow-hidden rounded-lg border border-white/[0.06]"
  >
    <Image
      src="/banner-home.jpg"
      alt=""
      width={1434}
      height={682}
      sizes="100vw"
      className="block h-auto w-full"
    />

    <div className="absolute inset-y-0 left-0 flex w-[47%] flex-col justify-center pl-[5%] pr-[2%]">
      <h2 className="font-display text-[17px] font-extrabold leading-[1.12] tracking-tight sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
        Agende nos
        <br />
        <span className="text-primary">melhores</span>
      </h2>

      <p className="mt-1.5 text-[9.5px] leading-snug text-muted-foreground sm:mt-3 sm:text-xs md:text-sm lg:text-[15px] xl:text-base">
        Mais que um corte, uma experiência.
        <br className="hidden sm:block" /> Seu estilo, seu horário, do seu
        jeito.
      </p>
    </div>
  </section>
)

export default HomeBanner
