import Link from "next/link"
import LegalPage from "@/app/_components/legal-page"
import { LEGAL } from "@/app/_constants/legal"

export const metadata = {
  title: "Política de Privacidade",
  description:
    "Quais dados o BarberFlow coleta, por que, com quem compartilha e como você pede para apagá-los.",
}

/**
 * Política de Privacidade.
 *
 * Descreve o que o sistema realmente faz, não o que seria confortável dizer:
 * cada dado listado aqui existe numa coluna do banco, e cada terceiro citado
 * é um serviço que a aplicação chama de fato.
 */
const PrivacidadePage = () => (
  <LegalPage
    title="Política de Privacidade"
    intro="Aqui está, sem rodeio, o que guardamos sobre você, por quê, com quem dividimos e como pedir para apagar."
    updatedAt={LEGAL.updatedAt}
  >
    <section>
      <h2>1. Quem é responsável pelos seus dados</h2>
      <p>
        O controlador dos dados é {LEGAL.operator}, inscrito sob o nº{" "}
        {LEGAL.document}. Para qualquer assunto desta política, incluindo os
        pedidos do item 6, escreva para{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </section>

    <section>
      <h2>2. O que coletamos</h2>
      <p>
        <strong>Quando você entra com o Google:</strong> nome, e-mail e foto de
        perfil. Não recebemos sua senha nem temos acesso ao conteúdo da sua
        conta Google.
      </p>
      <p>
        <strong>Quando você agenda:</strong> serviço, profissional, data,
        horário e a barbearia escolhida. Se informar telefone, ele fica guardado
        para a barbearia entrar em contato.
      </p>
      <p>
        <strong>Só se você optar por pagar o sinal:</strong> CPF ou CNPJ. É
        exigência do provedor de pagamento — não existe cobrança PIX sem
        documento. <strong>Quem paga na barbearia nunca informa CPF.</strong>
      </p>
      <p>
        <strong>Quando você avalia:</strong> a nota, o comentário e a data.
        Ficam públicos na página da barbearia, junto do seu nome e da sua foto.
      </p>
      <p>
        <strong>Não coletamos</strong> dados de cartão, senha bancária,
        localização ou histórico de navegação em outros sites.
      </p>
    </section>

    <section>
      <h2>3. Por que usamos cada coisa</h2>
      <ul>
        <li>
          <strong>Para executar o que você pediu</strong> — marcar, confirmar,
          lembrar e cancelar horários, e mostrar seus agendamentos.
        </li>
        <li>
          <strong>Para a barbearia te atender</strong> — ela precisa saber quem
          vem, quando e para qual serviço.
        </li>
        <li>
          <strong>Para cumprir a lei</strong> — registros de pagamento têm prazo
          legal de guarda.
        </li>
        <li>
          <strong>Para manter o serviço seguro</strong> — impedir agendamento
          falso e uso indevido.
        </li>
      </ul>
      <p>
        Não vendemos seus dados, não os cedemos para publicidade e não montamos
        perfil de consumo com eles.
      </p>
    </section>

    <section>
      <h2>4. Com quem compartilhamos</h2>
      <p>
        <strong>Com a barbearia que você escolheu.</strong> Ela vê seu nome, seu
        contato e seus agendamentos com ela — e só com ela. Nenhuma barbearia
        enxerga cliente de outra.
      </p>
      <p>
        <strong>Com os serviços que fazem a plataforma funcionar:</strong>
      </p>
      <ul>
        <li>
          <strong>Google</strong> — autenticação da sua conta.
        </li>
        <li>
          <strong>Vercel</strong> — hospedagem da aplicação.
        </li>
        <li>
          <strong>Neon</strong> — banco de dados.
        </li>
        <li>
          <strong>Resend</strong> — envio dos e-mails de confirmação, lembrete e
          cancelamento.
        </li>
        <li>
          <strong>Asaas</strong> — processamento do sinal, quando houver. Recebe
          seu nome, e-mail e CPF para emitir a cobrança.
        </li>
      </ul>
      <p>
        Parte desses serviços mantém servidores fora do Brasil. Ao usar a
        plataforma, seus dados podem ser processados no exterior, com as
        proteções previstas na LGPD.
      </p>
    </section>

    <section>
      <h2>5. Por quanto tempo guardamos</h2>
      <ul>
        <li>
          <strong>Conta e agendamentos:</strong> enquanto sua conta existir.
        </li>
        <li>
          <strong>Registros de pagamento:</strong> pelo prazo exigido pela
          legislação fiscal, mesmo após o encerramento da conta.
        </li>
        <li>
          <strong>Avaliações:</strong> permanecem publicadas; a pedido, podem
          ser removidas ou desvinculadas do seu nome.
        </li>
        <li>
          <strong>Imagens enviadas</strong> que deixam de ser usadas são
          apagadas automaticamente pela rotina diária de limpeza.
        </li>
      </ul>
    </section>

    <section>
      <h2>6. Seus direitos</h2>
      <p>
        A LGPD te dá o direito de saber o que temos sobre você, corrigir o que
        estiver errado, pedir uma cópia, pedir a exclusão e revogar
        consentimento. Para exercer qualquer um deles, escreva para{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
      <p>
        Respondemos em até 15 dias. Podemos pedir uma confirmação de identidade
        antes — é o que impede que outra pessoa peça seus dados no seu lugar.
      </p>
    </section>

    <section>
      <h2>7. Segurança</h2>
      <p>
        O acesso ao painel é restrito a quem administra cada barbearia, e cada
        pedido verifica esse vínculo no servidor. A conexão é criptografada.
        Ainda assim, nenhum sistema é imune: se acontecer um incidente que possa
        te afetar, avisamos você e a autoridade competente.
      </p>
    </section>

    <section>
      <h2>8. Cookies</h2>
      <p>
        Usamos apenas os cookies necessários para manter você conectado. Não há
        cookie de publicidade nem rastreamento de terceiros. Apagar os cookies
        do navegador desconecta sua sessão.
      </p>
    </section>

    <section>
      <h2>9. Crianças e adolescentes</h2>
      <p>
        A plataforma não se destina a menores de 18 anos sem autorização de um
        responsável. Se identificarmos conta de menor sem essa autorização, os
        dados são removidos.
      </p>
    </section>

    <section>
      <h2>10. Mudanças nesta política</h2>
      <p>
        Se algo mudar de forma relevante, avisamos na plataforma ou por e-mail.
        A data no topo da página indica a última revisão. Veja também os{" "}
        <Link href="/termos">Termos de Uso</Link>.
      </p>
    </section>
  </LegalPage>
)

export default PrivacidadePage
