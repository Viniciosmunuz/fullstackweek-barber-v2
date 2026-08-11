-- Imagens enviadas do dispositivo.
--
-- Guardadas no banco por falta de bucket, e viáveis aí porque o navegador
-- reduz cada arquivo antes de enviar e a rota que os serve manda cache
-- imutável — o mesmo byte não é lido duas vezes pelo mesmo visitante.
--
-- CASCADE na barbearia: saindo a casa, saem as imagens dela. Sem isso os bytes
-- ficariam no banco sem ninguém que os reclame.
CREATE TABLE "ImageAsset" (
  "id"           TEXT         NOT NULL,
  "mimeType"     TEXT         NOT NULL,
  "data"         BYTEA        NOT NULL,
  "byteSize"     INTEGER      NOT NULL,
  "barbershopId" TEXT         NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ImageAsset_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ImageAsset_barbershopId_idx" ON "ImageAsset"("barbershopId");

ALTER TABLE "ImageAsset"
  ADD CONSTRAINT "ImageAsset_barbershopId_fkey"
  FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
