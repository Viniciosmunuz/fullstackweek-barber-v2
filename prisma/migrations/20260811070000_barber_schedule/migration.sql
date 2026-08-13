-- Escala por profissional: grade semanal própria e ausências.
--
-- Até aqui o horário da casa valia igual para todos, e nem isso: a lista de
-- horários oferecida ao cliente era uma constante de 08:00 às 19:00, então uma
-- barbearia que abre às 10h e fecha domingo recebia agendamento às 8h de
-- domingo.
--
-- Nenhuma linha é criada aqui. Profissional sem grade própria continua seguindo
-- a casa, que é o caso da maioria — assim a mudança não obriga ninguém a
-- preencher nada para o sistema voltar a funcionar.
CREATE TABLE "BarberSchedule" (
  "id"       TEXT    NOT NULL,
  "weekday"  INTEGER NOT NULL,
  "closed"   BOOLEAN NOT NULL DEFAULT false,
  "opensAt"  TEXT,
  "closesAt" TEXT,
  "barberId" TEXT    NOT NULL,

  CONSTRAINT "BarberSchedule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BarberSchedule_barberId_weekday_key"
  ON "BarberSchedule"("barberId", "weekday");

ALTER TABLE "BarberSchedule"
  ADD CONSTRAINT "BarberSchedule_barberId_fkey"
  FOREIGN KEY ("barberId") REFERENCES "Barber"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Ausência como intervalo, e não como dia: metade das reais são de algumas
-- horas — dentista de manhã, sai mais cedo na sexta. Dia inteiro é só um
-- intervalo que começa e termina na virada.
CREATE TABLE "BarberTimeOff" (
  "id"       TEXT         NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt"   TIMESTAMP(3) NOT NULL,
  "reason"   TEXT,
  "barberId" TEXT         NOT NULL,

  CONSTRAINT "BarberTimeOff_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BarberTimeOff_barberId_startsAt_idx"
  ON "BarberTimeOff"("barberId", "startsAt");

ALTER TABLE "BarberTimeOff"
  ADD CONSTRAINT "BarberTimeOff_barberId_fkey"
  FOREIGN KEY ("barberId") REFERENCES "Barber"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
