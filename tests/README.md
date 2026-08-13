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

## O que **não** está coberto

Tudo que precisa de banco: `expireStaleHolds`, os guardas de acesso
(`requireOwner`, `requireManager`), o webhook do provedor. São as rotinas de
maior consequência depois do cálculo, e testá-las exige um Postgres de teste —
vale fazer, e é o próximo passo natural daqui.

Enquanto isso, saiba que elas foram verificadas só por leitura.
