import BarberIllustration from "./barber-illustration"
import { BarberFlowLogo } from "./brand/logo"

/**
 * Banner de apresentação da home.
 *
 * Fica entre a ordenação e a grade, como respiro visual — sem botão de ação por
 * decisão de projeto: a página inteira já é sobre agendar, e um "Agendar agora"
 * aqui apontaria para a lista que está logo abaixo, criando um passo a mais para
 * chegar onde o usuário já estava indo.
 *
 * No celular a ilustração some. Ela ocupa altura demais numa tela onde o
 * objetivo é alcançar os cards, e o texto sozinho já cumpre o papel de marca.
 */
const HomeBanner = () => (
  <section
    aria-label="Sobre o BarberFlow"
    className="surface relative overflow-hidden rounded-lg"
  >
    {/* brilho dourado que amarra a arte ao fundo */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-20 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-primary/[0.07] blur-3xl"
    />

    <div className="relative flex items-center gap-6 p-5 sm:p-7 lg:p-8">
      <div className="min-w-0 flex-1">
        <BarberFlowLogo size="sm" />

        <h2 className="mt-4 font-display text-2xl font-extrabold leading-[1.15] tracking-tight sm:text-3xl">
          Agende nos
          <br />
          <span className="text-primary">melhores</span>
        </h2>

        <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
          Mais que um corte, uma experiência.
          <br className="hidden sm:block" /> Seu estilo, seu horário, do seu
          jeito.
        </p>
      </div>

      <BarberIllustration className="hidden w-[46%] max-w-sm shrink-0 sm:block" />
    </div>
  </section>
)

export default HomeBanner
