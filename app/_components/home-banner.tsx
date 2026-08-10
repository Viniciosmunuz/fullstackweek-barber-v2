import BarberIllustration from "./barber-illustration"

/**
 * Banner de apresentação da home, entre a ordenação e a grade.
 *
 * Sem botão e sem logo por decisão de projeto: a página inteira já é sobre
 * agendar — um "Agendar agora" apontaria para a lista logo abaixo — e a marca
 * já está no cabeçalho, a poucos pixels dali. O que sobra é o recado e a cena.
 *
 * A ilustração acompanha o texto em qualquer largura, encolhendo no celular em
 * vez de sumir: ela é o motivo de o banner existir.
 */
const HomeBanner = () => (
  <section
    aria-label="Sobre o BarberFlow"
    className="surface relative overflow-hidden rounded-lg"
  >
    {/* brilho dourado que amarra a arte ao fundo */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-24 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-primary/[0.06] blur-3xl"
    />

    <div className="relative flex items-center gap-2 p-5 sm:gap-6 sm:p-8 lg:p-10">
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-[26px] font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
          Agende nos
          <br />
          <span className="text-primary">melhores</span>
        </h2>

        <p className="mt-3 max-w-md text-[13px] leading-relaxed text-muted-foreground sm:mt-4 sm:text-[15px]">
          Mais que um corte, uma experiência.
          <br className="hidden sm:block" /> Seu estilo, seu horário, do seu
          jeito.
        </p>
      </div>

      <BarberIllustration className="w-[42%] max-w-[150px] shrink-0 sm:max-w-[300px] lg:max-w-[380px]" />
    </div>
  </section>
)

export default HomeBanner
