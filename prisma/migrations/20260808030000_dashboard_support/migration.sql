-- Suporte ao painel de gestão: status do agendamento, clientes de
-- demonstração e situação do profissional.

CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

ALTER TABLE "Booking" ADD COLUMN "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED';

CREATE INDEX "Booking_date_idx" ON "Booking"("date");
CREATE INDEX "Booking_barberId_date_idx" ON "Booking"("barberId", "date");

ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Barber" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
