# Testes

## Rodar

O vitest ainda não está instalado. Uma vez só:

```bash
npm install -D vitest
```

Depois:

```bash
npm test          # roda e sai
npm run test:watch  # fica rodando enquanto você edita
```

Zero configuração: o vitest lê TypeScript sozinho, e os testes importam por
caminho relativo justamente para não depender do apelido `@/`.

## O que está coberto, e por quê

O critério não foi cobertura. Foi **custo do erro**: o que aqui só se descobre
tarde, e caro.

| Arquivo | Cobre | Se estiver errado |
|---|---|---|
| `policy.test.ts` | cálculo do sinal e da taxa | valor errado na conta do lojista, descoberto pelo extrato semanas depois |
| `booking-slot.test.ts` | quais reservas ocupam horário | cliente escolhe um horário e leva erro ao confirmar, ou horário some da agenda para sempre |
| `image-source.test.ts` | endereços de imagem aceitos | salvar falha sempre (já aconteceu), ou entra endereço que executa código na página pública |
| `invite-message.test.ts` | texto do convite por papel | quem recebe procura tela que não existe e conclui que não tem acesso |
| `expire-holds.test.ts` | encerrar reserva com sinal vencido | cancelar o horário de quem acabou de pagar |
| `guard.test.ts` | quem pode o quê | funcionário muda preço e abre o extrato — foi assim até 11/08/2026 |
| `webhook-asaas.test.ts` | confirmação do pagamento | qualquer pessoa confirma a própria reserva sem pagar, mandando um JSON |

## Banco e sessão são dublês

Os três últimos precisam de banco, e em vez de um Postgres de teste eles trocam
o `db` e a sessão por dublês (`vi.mock`).

**O que isso prova:** qual decisão a rotina toma — quais escritas ela pede, o
que ela recusa, em que ordem. É onde mora o estrago nessas três, e é o que
regride quando alguém mexe.

**O que isso não prova:** que a consulta roda no Postgres. Erro de nome de
coluna, de índice ou de tipo passa batido aqui — quem pega isso é o `tsc`
contra o cliente gerado do Prisma, e o build.

Um Postgres de teste cobriria os dois. Vale quando o esquema começar a mudar
com frequência; hoje o custo (subir banco, migrar, limpar entre testes, e
depender disso na máquina de quem for rodar) é maior que o retorno.
