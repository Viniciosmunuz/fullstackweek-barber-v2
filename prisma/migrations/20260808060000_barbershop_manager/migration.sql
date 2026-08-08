-- Autorização do painel: vínculo entre usuário e barbearia administrada.
--
-- A tabela nasce vazia de propósito. Sem uma linha aqui ninguém enxerga o
-- painel, o que é o comportamento correto: até agora qualquer conta
-- autenticada conseguia editar barbeiros e serviços de qualquer casa.
--
-- Para um ambiente de demonstração continuar utilizável, a aplicação oferece
-- uma concessão explícita e registrada (ver DEMO_SELF_SERVICE em
-- app/_actions/dashboard/claim.ts). Em produção real basta não definir a
-- variável: aí o vínculo só existe se alguém o criar deliberadamente.

CREATE TYPE "ManagerRole" AS ENUM ('OWNER', 'STAFF');

CREATE TABLE "BarbershopManager" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "barbershopId" TEXT NOT NULL,
  "role" "ManagerRole" NOT NULL DEFAULT 'OWNER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BarbershopManager_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BarbershopManager_userId_barbershopId_key"
  ON "BarbershopManager"("userId", "barbershopId");

CREATE INDEX "BarbershopManager_userId_idx" ON "BarbershopManager"("userId");

ALTER TABLE "BarbershopManager" ADD CONSTRAINT "BarbershopManager_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BarbershopManager" ADD CONSTRAINT "BarbershopManager_barbershopId_fkey"
  FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
