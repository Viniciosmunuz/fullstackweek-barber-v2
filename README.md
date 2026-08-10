# BarberFlow

**Seu corte. Seu horário. Seu estilo.**

Plataforma de agendamento para barbearias. O cliente encontra uma casa, escolhe
o serviço e fecha o horário; a barbearia parceira administra agenda, equipe,
serviços e relatórios num painel próprio.

## Como funciona o acesso

Há três papéis, e nenhum deles é gravado no banco como um campo editável — todos
são derivados, para que duas fontes de verdade não possam discordar:

| Papel | Como se obtém | O que pode fazer |
| --- | --- | --- |
| **Cliente** | Qualquer login Google | Buscar, agendar, ver os próprios horários |
| **Barbearia** | E-mail convidado por um admin da plataforma | Painel da própria barbearia |
| **Admin** | E-mail listado em `PLATFORM_ADMIN_EMAILS` | Cadastrar barbearias parceiras |

O convite é por e-mail: o admin cadastra o endereço em `/admin`, e no primeiro
login daquele e-mail o vínculo com a barbearia é criado. `PLATFORM_ADMIN_EMAILS`
vive na variável de ambiente, e não no banco, justamente para que ninguém possa
se promover a admin através da aplicação.

## Rodando localmente

```bash
docker compose up -d
npm install
npx prisma migrate dev
npm run dev
```

## Variáveis de ambiente

| Variável | Para quê |
| --- | --- |
| `DATABASE_URL` | Conexão PostgreSQL |
| `NEXTAUTH_URL` | URL base da aplicação |
| `NEXTAUTH_SECRET` | Assinatura da sessão |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login Google |
| `PLATFORM_ADMIN_EMAILS` | Lista separada por vírgula dos admins |
| `RESEND_API_KEY` | Envio dos convites (opcional — sem ela, o convite é copiado à mão) |

> `PLATFORM_ADMIN_EMAILS` não pode ser marcada como *sensitive* na Vercel: o
> Next.js embute `process.env` no build, e variáveis sensíveis não existem
> naquele momento — a leitura compilaria como `undefined`.

## Stack

Next.js 14 (App Router) · Prisma · PostgreSQL · NextAuth · Tailwind · shadcn/ui

## Marca

Os arquivos de marca ficam em `public/brand`. O contorno do símbolo é a fonte
única em `app/_components/brand/mark-path.ts`: dele saem o componente React, os
SVGs e os PNGs de favicon e PWA — nenhuma versão é redesenhada em separado.

| Uso | Versão |
| --- | --- |
| Cabeçalho, rodapé, painel | Símbolo + `BARBERFLOW` |
| Favicon, PWA, loading, espaços apertados | Só o símbolo |
| Barbearias fictícias | Identidade própria de cada uma (`brand/barbershop-logo.tsx`) |

O símbolo da plataforma nunca representa uma barbearia: BarberFlow é o produto,
as casas têm marca própria.
