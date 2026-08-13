-- Taxa da plataforma a zero: o sinal inteiro vai para a barbearia.
--
-- Decisão de produto enquanto o BarberFlow conquista as primeiras parceiras.
-- Nada no cálculo muda: `splitDeposit` já trata taxa zero, e o repasse passa a
-- ser igual ao valor pago. Ligar a taxa de volta é mudar este número.
--
-- O padrão da coluna também vai a zero, para parceira nova nascer sem taxa em
-- vez de herdar os 10% antigos sem ninguém perceber.
UPDATE "Barbershop" SET "platformFeeValue" = 0;

ALTER TABLE "Barbershop" ALTER COLUMN "platformFeeValue" SET DEFAULT 0;
