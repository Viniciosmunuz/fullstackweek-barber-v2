-- Avaliações de verdade.
--
-- Até aqui `rating` e `reviewCount` eram números escritos à mão nas migrações
-- de demonstração, e o padrão da coluna era 5.0 — toda barbearia nascia com
-- nota máxima sem ninguém ter ido lá. A nota ainda alimentava a ordenação
-- "Mais avaliadas" e o cálculo de relevância do catálogo, então a vitrine
-- inteira era ordenada por ficção.
CREATE TABLE "Review" (
  "id"           TEXT         NOT NULL,
  "rating"       INTEGER      NOT NULL,
  "comment"      TEXT,
  "bookingId"    TEXT         NOT NULL,
  "barbershopId" TEXT         NOT NULL,
  "userId"       TEXT         NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- Uma avaliação por agendamento. É a trava que impede alguém de votar dez
-- vezes numa visita só, e o que permite editar em vez de acumular.
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

CREATE INDEX "Review_barbershopId_createdAt_idx"
  ON "Review"("barbershopId", "createdAt");

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_barbershopId_fkey"
  FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Zera a ficção. Barbearia sem avaliação passa a dizer que não tem, em vez de
-- exibir uma nota que ninguém deu — e o padrão da coluna deixa de ser 5.0,
-- para parceira nova não nascer com nota máxima.
UPDATE "Barbershop" SET "rating" = 0, "reviewCount" = 0;

ALTER TABLE "Barbershop" ALTER COLUMN "rating" SET DEFAULT 0;
