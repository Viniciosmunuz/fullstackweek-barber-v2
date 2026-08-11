-- Fundação da cobrança de sinal com split.
--
-- Nada aqui liga a cobrança para ninguém: `paymentsEnabled` nasce `false` em
-- todas as barbearias, então o fluxo de agendamento continua exatamente como
-- está até que uma casa tenha carteira configurada. É o que permite ligar o
-- pagamento uma barbearia por vez, sem parar quem já opera.

-- O valor entra antes de PENDING para a ordem do enum no banco acompanhar a
-- declaração do schema. Adicionar não usa o valor, então roda sem problema
-- dentro da transação da migração.
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'PENDING_PAYMENT' BEFORE 'PENDING';

CREATE TYPE "FeeType" AS ENUM ('PERCENT', 'FIXED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'REFUNDED', 'FAILED');
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CARD');

-- Política de sinal e taxa por barbearia. Os padrões (30% de sinal, 10% de
-- taxa) valem como ponto de partida; quem publica de fato é a configuração.
ALTER TABLE "Barbershop"
  ADD COLUMN "paymentsEnabled"  BOOLEAN       NOT NULL DEFAULT false,
  ADD COLUMN "payoutWalletId"   TEXT,
  ADD COLUMN "depositType"      "FeeType"     NOT NULL DEFAULT 'PERCENT',
  ADD COLUMN "depositValue"     DECIMAL(10,2) NOT NULL DEFAULT 30,
  ADD COLUMN "platformFeeType"  "FeeType"     NOT NULL DEFAULT 'PERCENT',
  ADD COLUMN "platformFeeValue" DECIMAL(10,2) NOT NULL DEFAULT 10;

-- Prazo do sinal. Nulo em tudo que já existe: reserva sem cobrança não expira.
ALTER TABLE "Booking" ADD COLUMN "expiresAt" TIMESTAMP(3);

CREATE INDEX "Booking_status_expiresAt_idx" ON "Booking"("status", "expiresAt");

CREATE TABLE "Payment" (
  "id"          TEXT            NOT NULL,
  "bookingId"   TEXT            NOT NULL,
  "status"      "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "method"      "PaymentMethod" NOT NULL DEFAULT 'PIX',
  "amount"      DECIMAL(10,2)   NOT NULL,
  "platformFee" DECIMAL(10,2)   NOT NULL,
  "shopAmount"  DECIMAL(10,2)   NOT NULL,
  "providerId"  TEXT,
  "checkoutUrl" TEXT,
  "pixPayload"  TEXT,
  "expiresAt"   TIMESTAMP(3)    NOT NULL,
  "paidAt"      TIMESTAMP(3),
  "refundedAt"  TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3)    NOT NULL,

  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");
-- Único para o webhook não conseguir amarrar a mesma cobrança a duas reservas.
CREATE UNIQUE INDEX "Payment_providerId_key" ON "Payment"("providerId");
CREATE INDEX "Payment_status_expiresAt_idx" ON "Payment"("status", "expiresAt");

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PaymentEvent" (
  "id"              TEXT         NOT NULL,
  "providerEventId" TEXT         NOT NULL,
  "paymentId"       TEXT,
  "type"            TEXT         NOT NULL,
  "payload"         JSONB        NOT NULL,
  "receivedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- A trava de idempotência: o provedor reenvia o evento enquanto não recebe
-- 200, e sem isso um reenvio confirmaria a reserva de novo e somaria a taxa
-- duas vezes no relatório.
CREATE UNIQUE INDEX "PaymentEvent_providerEventId_key" ON "PaymentEvent"("providerEventId");
CREATE INDEX "PaymentEvent_paymentId_idx" ON "PaymentEvent"("paymentId");

ALTER TABLE "PaymentEvent"
  ADD CONSTRAINT "PaymentEvent_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
