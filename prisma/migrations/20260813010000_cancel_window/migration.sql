-- Antecedência mínima, em horas, para o cliente cancelar sozinho.
--
-- Zero preserva o comportamento atual: sem prazo, cancela até em cima da hora.
-- Ligar uma trava em toda barbearia de uma vez mudaria a regra de quem nunca
-- pediu por ela.
ALTER TABLE "Barbershop"
  ADD COLUMN IF NOT EXISTS "cancelWindowHours" INTEGER NOT NULL DEFAULT 0;
