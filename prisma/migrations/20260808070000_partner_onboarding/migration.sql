-- Cadastro de barbearias parceiras pela plataforma.
--
-- O dono raramente tem conta no momento em que é cadastrado, então o acesso é
-- liberado por e-mail: o convite fica registrado e vira vínculo real no
-- primeiro login com o Google.

ALTER TABLE "Barbershop" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "BarbershopInvite" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "barbershopId" TEXT NOT NULL,
  "role" "ManagerRole" NOT NULL DEFAULT 'OWNER',
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BarbershopInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BarbershopInvite_email_barbershopId_key"
  ON "BarbershopInvite"("email", "barbershopId");

CREATE INDEX "BarbershopInvite_email_idx" ON "BarbershopInvite"("email");

ALTER TABLE "BarbershopInvite" ADD CONSTRAINT "BarbershopInvite_barbershopId_fkey"
  FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
