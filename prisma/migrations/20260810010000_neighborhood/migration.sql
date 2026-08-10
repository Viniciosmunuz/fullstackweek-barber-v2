-- Bairro da barbearia.
--
-- O card da grade é compacto e não comporta o endereço inteiro; o bairro é a
-- informação que o cliente realmente usa para julgar se a barbearia fica perto.
--
-- Fica opcional porque as casas já cadastradas têm o bairro embutido no
-- endereço, no formato "Rua Tal, 123 — Bairro". O UPDATE abaixo extrai esse
-- trecho quando ele existe; quem não seguir o padrão continua sem bairro, e a
-- interface cai para a cidade.

ALTER TABLE "Barbershop" ADD COLUMN "neighborhood" TEXT;

UPDATE "Barbershop"
SET "neighborhood" = trim(split_part(address, '—', 2))
WHERE address LIKE '%—%';
