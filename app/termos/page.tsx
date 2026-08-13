import Link from "next/link"
import LegalPage from "@/app/_components/legal-page"
import { LEGAL } from "@/app/_constants/legal"

export const metadata = {
  title: "Termos de Uso",
  description:
    "As regras de uso do BarberFlow: o que a plataforma faz, o que a barbearia faz e o que cabe a você.",
}

/**
 * Termos de Uso.
 *
 * O ponto que o texto inteiro gira em torno: o BarberFlow marca horário, quem
 * atende é a barbearia. Sem isso escrito, um corte malfeito ou um sinal não
 * devolvido chega como reclamação contra a plataforma.
 */
const TermosPage = () => (
  <LegalPage
    title="Termos de Uso"
    intro="Estas são as regras de uso do BarberFlow. Ao criar uma conta ou marcar um horário, você concorda com elas."
    updatedAt={LEGAL.updatedAt}
  >
    <section>
      <h2>1. Quem opera o BarberFlow</h2>
      <p>
        O BarberFlow é operado por {LEGAL.operator}, inscrito sob o nº{" "}
        {LEGAL.document}. Dúvidas sobre estes termos:{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </section>

    <section>
      <h2>2. O que o BarberFlow é — e o que não é</h2>
      <p>
        O BarberFlow é uma plataforma que <strong>marca horários</strong> entre
        você e uma barbearia cadastrada.{" "}
        <strong>Quem corta o cabelo é a barbearia</strong>, não nós.
      </p>
      <p>Isso quer dizer, na prática:</p>
      <ul>
        <li>
          Preço, duração, profissional e forma de atendimento são definidos pela
          barbearia.
        </li>
        <li>
          A qualidade do serviço é responsabilidade de quem atende. Se algo der
          errado no atendimento, a conversa é com a barbearia — podemos ajudar a
          intermediar, mas não somos parte do serviço.
        </li>
        <li>
          As fotos, a logo, os textos e os preços que aparecem na página de uma
          barbearia foram enviados por ela.
        </li>
      </ul>
    </section>

    <section>
      <h2>3. Sua conta</h2>
      <ul>
        <li>
          O acesso é feito com uma conta Google. Você é responsável por manter
          essa conta segura.
        </li>
        <li>
          Os dados que você informa devem ser verdadeiros. Nome e telefone
          errados atrapalham quem vai te atender.
        </li>
        <li>
          Menores de 18 anos só devem usar a plataforma com autorização de um
          responsável.
        </li>
      </ul>
    </section>

    <section>
      <h2>4. Agendamentos</h2>
      <p>
        Ao escolher serviço, profissional, dia e horário, você faz uma
        solicitação à barbearia. A confirmação e a execução são dela.
      </p>
      <ul>
        <li>
          A barbearia pode <strong>recusar ou cancelar</strong> um horário — por
          imprevisto, falta do profissional ou qualquer motivo operacional. Você
          é avisado quando isso acontece.
        </li>
        <li>
          Você pode cancelar seus horários pela própria plataforma, em{" "}
          <Link href="/bookings">Agendamentos</Link>.
        </li>
        <li>
          Atraso, falta e remarcação seguem a regra de cada barbearia. Se ela
          cobra por falta, isso é combinado diretamente com ela.
        </li>
      </ul>
    </section>

    <section>
      <h2>5. Pagamento do sinal</h2>
      <p>
        Algumas barbearias pedem um <strong>sinal</strong> para segurar o
        horário. Quando isso acontece:
      </p>
      <ul>
        <li>
          O valor é informado na tela <strong>antes</strong> de você confirmar.
        </li>
        <li>
          O sinal é <strong>da barbearia</strong>, e abatido do valor do serviço
          no dia do atendimento.
        </li>
        <li>
          A cobrança é processada por um provedor de pagamento contratado para
          isso. O BarberFlow não guarda os dados do seu cartão nem da sua conta
          bancária.
        </li>
        <li>
          A devolução do sinal em caso de cancelamento segue a política da
          barbearia, informada por ela.
        </li>
      </ul>
      <p>
        A maior parte das barbearias não pede sinal. Nesses casos você paga
        integralmente no balcão, e nada é cobrado pela plataforma.
      </p>
    </section>

    <section>
      <h2>6. Avaliações</h2>
      <ul>
        <li>
          Só avalia quem foi atendido, e apenas uma vez por atendimento
          concluído.
        </li>
        <li>
          A avaliação é sua opinião e fica pública com seu nome e sua foto de
          perfil.
        </li>
        <li>
          Podemos remover avaliações com ofensa, dado pessoal de terceiro,
          propaganda ou conteúdo claramente falso.
        </li>
      </ul>
    </section>

    <section>
      <h2>7. Se você administra uma barbearia</h2>
      <p>
        Além das regras acima, quem gerencia um estabelecimento no BarberFlow se
        compromete a:
      </p>
      <ul>
        <li>
          Publicar informações verdadeiras — endereço, preços, horários e
          profissionais.
        </li>
        <li>
          Ter <strong>direito de uso sobre as imagens</strong> que enviar (foto
          do espaço, logo, fotos dos profissionais). Você responde por elas.
        </li>
        <li>
          Usar os dados dos clientes apenas para atendê-los. A lista de clientes
          do painel não é material para disparo de propaganda.
        </li>
        <li>
          Honrar os horários confirmados, e avisar com a maior antecedência
          possível quando não for possível.
        </li>
      </ul>
    </section>

    <section>
      <h2>8. Uso indevido</h2>
      <p>
        Podemos suspender ou encerrar contas que criem agendamentos falsos,
        tentem burlar o sistema, ofendam outras pessoas ou usem a plataforma
        para algo ilegal.
      </p>
    </section>

    <section>
      <h2>9. Disponibilidade</h2>
      <p>
        Trabalhamos para manter o serviço no ar, mas ele pode ficar indisponível
        por manutenção, falha técnica ou problema em serviços de terceiros. Não
        garantimos funcionamento ininterrupto e recomendamos confirmar
        diretamente com a barbearia horários próximos, se algo parecer errado.
      </p>
    </section>

    <section>
      <h2>10. Encerrar sua conta</h2>
      <p>
        Você pode pedir o encerramento da conta a qualquer momento pelo e-mail{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        Agendamentos que envolveram pagamento continuam registrados pelo prazo
        que a lei exige, mesmo depois disso.
      </p>
    </section>

    <section>
      <h2>11. Mudanças nestes termos</h2>
      <p>
        Podemos alterar estes termos. Quando a mudança for relevante, avisamos
        na plataforma ou por e-mail. A data no topo desta página sempre indica a
        última revisão.
      </p>
    </section>

    <section>
      <h2>12. Lei e foro</h2>
      <p>
        Estes termos seguem a lei brasileira. Fica eleito o foro de {LEGAL.city}{" "}
        para resolver o que não puder ser resolvido de forma amigável,
        ressalvado o direito do consumidor de acionar o foro do seu domicílio.
      </p>
    </section>
  </LegalPage>
)

export default TermosPage
