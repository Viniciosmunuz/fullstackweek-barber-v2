-- Fundação da cobrança de sinal com split.
--
-- Segunda tentativa. A primeira (20260810050000, revertida antes de aplicar)
-- alterava o enum BookingStatus para acrescentar PENDING_PAYMENT, e foi o que
-- derrubou o deploy: o Prisma aplica cada migração dentro de uma transação, e
-- ALTER TYPE ... ADD VALUE é justamente o comando que o PostgreSQL trata com
-- restrição nesse contexto.
--
-- Aqui não há ALTER TYPE nenhum. A espera pelo pagamento passou a ser
-- expressa por Booking.expiresAt: enquanto não for nulo, a linha só segura o
-- horário. CREATE TYPE, ao contrário de ALTER TYPE, roda sem problema dentro
-- da transação.
--
-- Nada disso liga a cobrança para ninguém: paymentsEnabled nasce false em
-- todas as barbearias, então o agendamento continua idêntico até que uma casa
-- tenha carteira configurada.

CREATE TYPE "FeeType" AS ENUM ('PERCENT', 'FIXED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'REFUNDED', 'FAILED');
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CARD');

-- Política de sinal e taxa por barbearia. O sinal é definido pela barbearia,
-- porque é a política de no-show dela; a taxa, pela plataforma.
ALTER TABLE "Barbershop"
  ADD COLUMN "paymentsEnabled"  BOOLEAN       NOT NULL DEFAULT false,
  ADD COLUMN "payoutWalletId"   TEXT,
  ADD COLUMN "depositType"      "FeeType"     NOT NULL DEFAULT 'PERCENT',
  ADD COLUMN "depositValue"     DECIMAL(10,2) NOT NULL DEFAULT 30,
  ADD COLUMN "platformFeeType"  "FeeType"     NOT NULL DEFAULT 'PERCENT',
  ADD COLUMN "platformFeeValue" DECIMAL(10,2) NOT NULL DEFAULT 10;

-- Nulo em tudo que já existe: reserva sem cobrança não expira.
ALTER TABLE "Booking" ADD COLUMN "expiresAt" TIMESTAMP(3);

CREATE INDEX "Booking_expiresAt_idx" ON "Booking"("expiresAt");

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
