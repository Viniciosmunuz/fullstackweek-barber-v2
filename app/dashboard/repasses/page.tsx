import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowDownLeft, Landmark, Percent, Wallet } from "lucide-react"
import {
  EmptyState,
  MetricCard,
  OwnerOnly,
  PageHeader,
  PeriodFilter,
} from "../_components/ui"
import {
  getBarbershopBySlug,
  getManagedBarbershops,
  type Period,
} from "@/app/_data/dashboard"
import { isOwnerOf } from "@/app/_actions/dashboard/guard"
import { getPayouts } from "@/app/_data/payouts"
import { formatCurrency } from "@/app/_lib/utils"

export const metadata = { title: "Repasses" }

interface PageProps {
  searchParams: { shop?: string; period?: Period }
}

/**
 * Extrato de repasses.
 *
 * Responde a uma pergunta só, e por isso não traz nome de cliente nem status
 * de atendimento: quanto entrou de sinal, quanto foi taxa e quanto caiu na
 * conta da barbearia. É o que torna o split verificável em vez de uma promessa.
 */
const PayoutsPage = async ({ searchParams }: PageProps) => {
  const [shops, barbershop] = await Promise.all([
    getManagedBarbershops(),
    getBarbershopBySlug(searchParams.shop),
  ])

  if (!barbershop) return notFound()

  // A checagem vem antes da consulta: o extrato não chega a ser lido para
  // quem não pode vê-lo.
  if (!(await isOwnerOf(barbershop.id))) {
    return <OwnerOnly title="Repasses" shops={shops} current={barbershop} />
  }

  const period: Period = searchParams.period ?? "30d"
  const payouts = await getPayouts(barbershop.id, period)

  return (
    <>
      <PageHeader
        title="Repasses"
        description={`Dinheiro que entrou de verdade na conta da ${barbershop.name}, por sinal pago.`}
        shops={shops}
        current={barbershop}
      >
        <PeriodFilter
          basePath="/dashboard/repasses"
          shop={barbershop.slug}
          active={period}
        />
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Recebido dos clientes"
            value={formatCurrency(payouts.gross)}
            hint={`${payouts.count} ${payouts.count === 1 ? "sinal pago" : "sinais pagos"}`}
            icon={Wallet}
          />
          <MetricCard
            label="Taxa da plataforma"
            value={formatCurrency(payouts.fees)}
            hint="Retida automaticamente no pagamento"
            icon={Percent}
          />
          <MetricCard
            label="Repassado a você"
            value={formatCurrency(payouts.net)}
            hint="Creditado na conta cadastrada"
            icon={Landmark}
          />
          <MetricCard
            label="Estornado"
            value={formatCurrency(payouts.refunded)}
            hint="Devolvido ao cliente"
            icon={ArrowDownLeft}
          />
        </div>

        {payouts.rows.length > 0 ? (
          <section className="surface overflow-hidden rounded-lg">
            <h2 className="border-b border-white/[0.06] px-4 py-3 font-display text-sm font-bold">
              Lançamentos
            </h2>

            {/* A tabela rola sozinha em vez de deixar a página rolar de lado. */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th scope="col" className="px-4 py-2 font-medium">
                      Pago em
                    </th>
                    <th scope="col" className="px-4 py-2 font-medium">
                      Serviço
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right font-medium"
                    >
                      Sinal
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right font-medium"
                    >
                      Taxa
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right font-medium"
                    >
                      Você recebeu
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.04]">
                  {payouts.rows.map((row) => (
                    <tr
                      key={row.id}
                      className={row.refunded ? "opacity-55" : undefined}
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                        {format(row.paidAt, "dd/MM 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </td>
                      <td className="px-4 py-2.5">
                        {row.serviceName}
                        {row.refunded && (
                          <span className="ml-2 rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                            Estornado
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        −{formatCurrency(row.platformFee)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold tabular-nums text-success">
                        {formatCurrency(row.shopAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="border-t border-white/[0.06] px-4 py-3 text-xs text-muted-foreground">
              O sinal é abatido do valor do serviço no atendimento. O cliente
              paga na barbearia apenas a diferença.
            </p>
          </section>
        ) : (
          <EmptyState
            icon={Wallet}
            title="Nenhum repasse no período"
            description="Quando um cliente pagar o sinal pelo aplicativo, o lançamento aparece aqui com o valor exato que cai na sua conta."
          />
        )}
      </div>
    </>
  )
}

export default PayoutsPage
