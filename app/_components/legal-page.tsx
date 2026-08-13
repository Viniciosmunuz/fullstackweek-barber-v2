import Link from "next/link"
import Header from "./header"

interface LegalPageProps {
  title: string
  /** Uma frase dizendo a quem o documento serve, antes das cláusulas. */
  intro: string
  /** Data da última revisão, no formato que a pessoa lê. */
  updatedAt: string
  children: React.ReactNode
}

/**
 * Moldura dos documentos legais.
 *
 * Tipografia definida aqui, e não em cada página, porque termos e política
 * mudam de texto com frequência e de forma quase nunca — deixar o estilo junto
 * do conteúdo garantiria que uma revisão de texto acabasse alterando o outro.
 *
 * A largura é curta de propósito: linha longa em documento denso é o que faz
 * ninguém ler.
 */
const LegalPage = ({ title, intro, updatedAt, children }: LegalPageProps) => (
  <>
    <Header />

    <div className="container max-w-3xl pb-16 pt-8 lg:pt-12">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">{intro}</p>
      <p className="mt-4 text-xs text-muted-foreground">
        Última atualização: {updatedAt}
      </p>

      <div
        className={[
          "mt-10 space-y-8",
          "[&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:tracking-tight",
          "[&_h2]:mb-3",
          "[&_p]:leading-relaxed [&_p]:text-foreground/90",
          "[&_p+p]:mt-3",
          "[&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:text-foreground/90",
          "[&_li]:relative [&_li]:pl-5 [&_li]:leading-relaxed",
          "[&_li]:before:absolute [&_li]:before:left-1 [&_li]:before:top-[0.6em]",
          "[&_li]:before:h-1 [&_li]:before:w-1 [&_li]:before:rounded-full",
          "[&_li]:before:bg-primary [&_li]:before:content-['']",
          "[&_strong]:font-semibold [&_strong]:text-foreground",
          "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
        ].join(" ")}
      >
        {children}
      </div>

      <div className="mt-12 border-t border-white/[0.06] pt-6">
        <p className="text-sm text-muted-foreground">
          Leia também a{" "}
          <Link
            href={title.startsWith("Termos") ? "/privacidade" : "/termos"}
            className="text-primary underline underline-offset-2"
          >
            {title.startsWith("Termos")
              ? "Política de Privacidade"
              : "Termos de Uso"}
          </Link>
          .
        </p>
      </div>
    </div>
  </>
)

export default LegalPage
