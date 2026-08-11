import type { Metadata } from "next"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle2, Clock, Mail, ShieldAlert, Store } from "lucide-react"
import Header from "../_components/header"
import SignInPrompt from "../_components/sign-in-prompt"
import BarbershopLogo from "../_components/brand/barbershop-logo"
import NewPartnerForm from "./_components/new-partner-form"
import {
  InviteActions,
  InviteButton,
  PartnerActions,
  RevokeButton,
} from "./_components/partner-row"
import { authOptions } from "../_lib/auth"
import { isPlatformAdminEmail } from "../_lib/config"
import { isEmailConfigured } from "../_lib/email"
import { db } from "../_lib/prisma"

export const metadata: Metadata = { title: "Administração da plataforma" }

const AdminPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return (
      <>
        <Header />
        <SignInPrompt />
      </>
    )
  }

  if (!isPlatformAdminEmail(session.user.email)) {
    return (
      <>
        <Header />
        <div className="container py-16">
          <div className="surface mx-auto flex max-w-md flex-col items-center rounded-lg px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert size={24} />
            </span>
            <h1 className="mt-4 font-display text-xl font-bold">
              Área restrita
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta página é da administração do BarberFlow. Se você administra
              uma barbearia, use o painel dela.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 text-sm font-semibold text-primary hover:underline"
            >
              Ir para o painel
            </Link>
          </div>
        </div>
      </>
    )
  }

  const barbershops = await db.barbershop.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      logoKey: true,
      logoUrl: true,
      accentColor: true,
      isPublished: true,
      createdAt: true,
      invites: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          email: true,
          role: true,
          acceptedAt: true,
        },
      },
      _count: { select: { services: true, barbers: true } },
    },
  })

  const emailConfigured = isEmailConfigured()
  const published = barbershops.filter((shop) => shop.isPublished).length
  const pendingInvites = barbershops.reduce(
    (total, shop) =>
      total + shop.invites.filter((invite) => !invite.acceptedAt).length,
    0,
  )

  return (
    <>
      <Header />

      <div className="container py-8 lg:py-12">
        <header className="max-w-2xl">
          <h1 className="font-display text-3xl font-extrabold tracking-tight lg:text-4xl">
            Barbearias parceiras
          </h1>
          <p className="mt-2 text-muted-foreground">
            Cadastre a barbearia e libere o e-mail do responsável. Ele entra com
            a conta Google desse endereço e completa o cadastro por conta
            própria.
          </p>
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="surface rounded-lg p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Parceiras
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold">
              {barbershops.length}
            </p>
          </div>
          <div className="surface rounded-lg p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              No catálogo
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold">
              {published}
            </p>
          </div>
          <div className="surface rounded-lg p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Aguardando 1º acesso
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold">
              {pendingInvites}
            </p>
          </div>
        </div>

        {!emailConfigured && (
          <div
            role="note"
            className="mt-6 flex items-start gap-3 rounded-lg border border-warning/25 bg-warning/[0.06] p-4 text-sm"
          >
            <Mail size={17} className="mt-0.5 shrink-0 text-warning" />
            <p className="text-muted-foreground">
              O envio automático de e-mail não está configurado, então o convite
              não sai daqui sozinho. Use{" "}
              <strong className="text-foreground">Copiar convite</strong> e
              mande por WhatsApp ou pelo seu e-mail. Para automatizar, defina{" "}
              <code className="rounded bg-white/[0.08] px-1 py-0.5 text-xs">
                RESEND_API_KEY
              </code>{" "}
              nas variáveis de ambiente.
            </p>
          </div>
        )}

        <div className="mt-8">
          <NewPartnerForm />
        </div>

        <div className="mt-8 space-y-4">
          {barbershops.length === 0 ? (
            <div className="surface flex flex-col items-center rounded-lg px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground">
                <Store size={24} />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold">
                Nenhuma barbearia cadastrada
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Use o formulário acima para cadastrar a primeira parceira.
              </p>
            </div>
          ) : (
            barbershops.map((shop) => (
              <article key={shop.id} className="surface rounded-lg p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
                      style={{
                        boxShadow: `inset 0 0 0 1px ${shop.accentColor}40`,
                      }}
                    >
                      <BarbershopLogo
                        logoKey={shop.logoKey}
                        logoUrl={shop.logoUrl}
                        accentColor={shop.accentColor}
                        className="h-6 w-6"
                      />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-display font-bold">
                        {shop.name}
                      </h2>
                      <p className="truncate text-xs text-muted-foreground">
                        {shop.city || "Cidade não informada"} ·{" "}
                        {shop._count.services} serviços · {shop._count.barbers}{" "}
                        profissionais
                      </p>
                    </div>
                  </div>

                  <PartnerActions
                    barbershopId={shop.id}
                    slug={shop.slug}
                    name={shop.name}
                    isPublished={shop.isPublished}
                  />
                </div>

                <div className="mt-4 border-t border-white/[0.06] pt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    E-mails liberados
                  </p>

                  {shop.invites.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum e-mail liberado ainda.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {shop.invites.map((invite) => (
                        <li
                          key={invite.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white/[0.03] px-3 py-2"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            {invite.acceptedAt ? (
                              <CheckCircle2
                                size={14}
                                className="shrink-0 text-success"
                                aria-hidden="true"
                              />
                            ) : (
                              <Clock
                                size={14}
                                className="shrink-0 text-warning"
                                aria-hidden="true"
                              />
                            )}
                            <span className="truncate text-sm">
                              {invite.email}
                            </span>
                            <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              {invite.role === "OWNER" ? "Dono" : "Equipe"}
                            </span>
                          </span>

                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {invite.acceptedAt
                                ? `Entrou em ${format(invite.acceptedAt, "dd/MM/yy", { locale: ptBR })}`
                                : "Aguardando 1º acesso"}
                            </span>

                            {/* Já entrou não precisa mais de convite. */}
                            {!invite.acceptedAt && (
                              <InviteActions
                                inviteId={invite.id}
                                email={invite.email}
                                emailConfigured={emailConfigured}
                              />
                            )}

                            <RevokeButton
                              inviteId={invite.id}
                              email={invite.email}
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3">
                    <InviteButton barbershopId={shop.id} name={shop.name} />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default AdminPage
