# Roteiro do teste de ponta a ponta

Percorrer o BarberFlow inteiro como as duas pessoas que o usam: quem administra
a barbearia e quem marca o horário.

Existe porque tudo aqui é verificado em pedaço — 162 testes automatizados, cada
tela conferida no navegador — e nada disso encontra o que só aparece quando uma
pessoa percorre o caminho todo: o campo que confunde, a mensagem que não explica,
a imagem que fica feia.

**Antes de começar:** duas contas Google. A sua (dona da barbearia de teste) e
uma segunda (o cliente). Sem a segunda o teste não vale — não dá para enxergar o
próprio sistema pelos olhos de quem chega de fora. Separe também uma logo PNG e
uma foto de ambiente.

Site: <https://fullstackweek-barber-v2-smoky.vercel.app>

---

## A. Montar a barbearia — sua conta, no computador

| ✓ | Passo |
| - | ----- |
| ☐ | `/admin` → cadastrar "Barbearia Teste" com o seu e-mail como responsável |
| ☐ | `/dashboard` → selecionar ela no seletor do topo |
| ☐ | **Configurações** → nome, slogan, descrição, endereço, bairro, cidade, telefone |
| ☐ | Subir a **foto do ambiente** e a **logo** (testa o enquadramento) |
| ☐ | **Horários** → definir a semana, **deixando um dia fechado de propósito** |
| ☐ | **Prazo de cancelamento** → escolher 2 horas |
| ☐ | **Serviços** → criar dois: um de 30 min e um de 1h, com preços diferentes |
| ☐ | **Barbeiros** → criar dois; em **um** deles, definir horário próprio diferente do da casa |
| ☐ | Voltar em Configurações e **Publicar** — o checklist tem que ficar todo verde |

## B. Chegar como cliente — segunda conta, **no celular**

| ✓ | Passo | O que observar |
| - | ----- | -------------- |
| ☐ | Aba anônima, entrar com a segunda conta | O aviso de Termos aparece no botão do Google |
| ☐ | Home | A Barbearia Teste aparece? A logo ficou boa no card? |
| ☐ | Abrir a barbearia | Foto, descrição, equipe, serviços, horários |
| ☐ | Agendar o serviço curto | |
| ☐ | Tentar escolher **o dia fechado** | Não pode deixar |
| ☐ | Escolher o **barbeiro de horário próprio** | Os horários têm que ser os dele, não os da casa |
| ☐ | Confirmar | O aviso de Termos/Privacidade aparece no passo 3 |
| ☐ | `/bookings` | O agendamento está lá? |

## C. Olhar do outro lado — sua conta

| ✓ | Passo |
| - | ----- |
| ☐ | `/dashboard/agendamentos` → o agendamento da segunda conta apareceu? |
| ☐ | `/dashboard/clientes` → aquela pessoa aparece como cliente? |
| ☐ | Marcar o atendimento como **Concluído** |

## D. Avaliação — segunda conta

| ✓ | Passo | O que observar |
| - | ----- | -------------- |
| ☐ | `/bookings` → o botão **Avaliar** aparece no concluído | |
| ☐ | Dar 4 estrelas e um comentário | |
| ☐ | Voltar na página da barbearia | O comentário aparece, mas **a nota ainda não** — ela só sai com 3 avaliações |

## E. Cancelamento — segunda conta

| ✓ | Passo | O que observar |
| - | ----- | -------------- |
| ☐ | Marcar um horário para **daqui a mais de 2 horas** e cancelar | Deixa cancelar |
| ☐ | Marcar um horário para **daqui a menos de 2 horas** | O botão Cancelar não aparece; no lugar, a explicação do prazo |
| ☐ | Cancelar esse mesmo horário pelo painel, com a sua conta | A barbearia cancela sem prazo nenhum |

## F. E-mail

| ✓ | Passo | O que observar |
| - | ----- | -------------- |
| ☐ | Olhar a caixa da segunda conta | **Não vai chegar nada, e isso é o esperado** — falta o domínio verificado |

---

## Como relatar

Print da tela **e o que você esperava que acontecesse**. Não precisa
diagnosticar; descrever basta.

## Depois

A Barbearia Teste pode ficar despublicada em vez de apagada — serve de ambiente
para o próximo teste sem aparecer para ninguém.
