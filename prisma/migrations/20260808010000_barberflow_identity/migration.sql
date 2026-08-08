-- BarberFlow: identidade das barbearias, barbeiros, horários e duração dos serviços.
--
-- Os dados de demonstração antigos (barbearias genéricas do template) são removidos
-- aqui para que as novas colunas obrigatórias possam ser criadas sem valores de
-- preenchimento artificiais. Contas de usuário, sessões e tokens NÃO são tocados.
-- O seed recria o catálogo com as marcas do BarberFlow.

DELETE FROM "Booking";
DELETE FROM "BarbershopService";
DELETE FROM "Barbershop";

-- Barbershop: identidade de marca
ALTER TABLE "Barbershop" ADD COLUMN "slug" TEXT NOT NULL;
ALTER TABLE "Barbershop" ADD COLUMN "slogan" TEXT NOT NULL;
ALTER TABLE "Barbershop" ADD COLUMN "city" TEXT NOT NULL;
ALTER TABLE "Barbershop" ADD COLUMN "logoKey" TEXT NOT NULL;
ALTER TABLE "Barbershop" ADD COLUMN "accentColor" TEXT NOT NULL;
ALTER TABLE "Barbershop" ADD COLUMN "rating" DECIMAL(2,1) NOT NULL DEFAULT 5.0;
ALTER TABLE "Barbershop" ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "Barbershop_slug_key" ON "Barbershop"("slug");

-- BarbershopService: duração + cascade ao remover a barbearia
ALTER TABLE "BarbershopService" ADD COLUMN "durationMinutes" INTEGER NOT NULL DEFAULT 30;

ALTER TABLE "BarbershopService" DROP CONSTRAINT "BarbershopService_barbershopId_fkey";
ALTER TABLE "BarbershopService" ADD CONSTRAINT "BarbershopService_barbershopId_fkey"
  FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Horários de funcionamento
CREATE TABLE "OpeningHour" (
  "id" TEXT NOT NULL,
  "weekday" INTEGER NOT NULL,
  "opensAt" TEXT,
  "closesAt" TEXT,
  "closed" BOOLEAN NOT NULL DEFAULT false,
  "barbershopId" TEXT NOT NULL,

  CONSTRAINT "OpeningHour_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OpeningHour_barbershopId_weekday_key" ON "OpeningHour"("barbershopId", "weekday");

ALTER TABLE "OpeningHour" ADD CONSTRAINT "OpeningHour_barbershopId_fkey"
  FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Barbeiros
CREATE TABLE "Barber" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "specialty" TEXT NOT NULL,
  "bio" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "barbershopId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Barber_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Barber" ADD CONSTRAINT "Barber_barbershopId_fkey"
  FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Booking: barbeiro escolhido no agendamento
ALTER TABLE "Booking" ADD COLUMN "barberId" TEXT;

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_barberId_fkey"
  FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE SET NULL ON UPDATE CASCADE;
