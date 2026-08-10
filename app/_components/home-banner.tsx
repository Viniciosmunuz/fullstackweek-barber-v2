/**
 * Banner de apresentação da home, entre a ordenação e a grade.
 *
 * A arte é a imagem enviada pelo dono do produto, recortada exatamente no
 * cartão interno dela — a moldura arredondada que aparece aqui é a do próprio
 * site, não a da imagem, para acompanhar o resto da página.
 *
 * São dois recortes, e não um só redimensionado, porque o texto vem pintado na
 * arte: a 343px de largura a linha de apoio virava um borrão cinza de 7px. No
 * celular entra apenas a cena, com título e subtítulo em HTML de verdade —
 * legíveis, selecionáveis e no corpo certo. Do `sm` para cima entra o cartão
 * inteiro, como na referência.
 *
 * `<picture>` em vez de duas `<Image>` alternadas por `hidden`: com `media` o
 * navegador baixa um arquivo só. Escondidas por CSS, as duas seriam baixadas.
 *
 * O fundo é a cor exata do interior da arte, e não `surface`, para que a
 * imagem encoste no cartão sem emenda no empilhamento do celular.
 */
const HomeBanner = () => (
  <section
    aria-label="Sobre o BarberFlow"
    className="relative overflow-hidden rounded-lg border border-white/[0.06] bg-[#08080B]"
  >
    {/*
      Do `sm` para cima este mesmo texto já aparece pintado na arte, então ele
      fica só para leitores de tela — sem repetir em voz o que a imagem mostra.
    */}
    <div className="px-5 pt-5 sm:sr-only">
      <h2 className="font-display text-[26px] font-extrabold leading-[1.1] tracking-tight">
        Agende nos
        <br />
        <span className="text-primary">melhores</span>
      </h2>

      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        Mais que um corte, uma experiência. Seu estilo, seu horário, do seu
        jeito.
      </p>
    </div>

    <picture>
      {/* `width`/`height` nos dois: as proporções diferem e cada uma precisa
          reservar o próprio espaço, senão a troca de recorte empurra a grade. */}
      <source
        media="(min-width: 640px)"
        srcSet="/banner-home.jpg"
        width={957}
        height={456}
      />
      {/*
        `<img>` e não `<Image>`: direção de arte por `media` é justamente o caso
        em que `<picture>` é o elemento certo, e os dois arquivos já saem
        comprimidos do recorte. `alt` vazio porque o texto acima cobre o que a
        imagem comunica.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/banner-home-arte.jpg"
        alt=""
        width={559}
        height={449}
        className="mt-4 h-auto w-full sm:mt-0"
      />
    </picture>
  </section>
)

export default HomeBanner
