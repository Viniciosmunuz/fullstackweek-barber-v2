-- Zera o conteúdo de demonstração e deixa a base pronta para uso real.
--
-- O catálogo fictício com dez casas, quarenta clientes e doze meses de
-- histórico existia para exercitar os relatórios. A partir daqui as barbearias
-- entram pelo cadastro da plataforma, então esse volume só atrapalharia: os
-- números do painel precisam refletir movimento verdadeiro.
--
-- Fica uma única barbearia, publicada, para que o site não abra vazio e haja
-- onde testar o fluxo do cliente. Contas de pessoas reais (quem entrou com o
-- Google) são preservadas — só os cadastros marcados como demonstração saem.

-- 1. Histórico e clientes fictícios
DELETE FROM "Booking";
DELETE FROM "User" WHERE "isDemo" = true;

-- 2. Mantém apenas a barbearia de teste (serviços, barbeiros, horários e
--    vínculos das demais caem por cascata)
DELETE FROM "Barbershop" WHERE slug <> 'blackwood-barber';

-- 3. Os vínculos criados pela concessão automática de demonstração deixam de
--    fazer sentido: a partir de agora o acesso vem de convite da plataforma.
DELETE FROM "BarbershopManager";

-- 4. A casa restante vira a vitrine de teste
UPDATE "Barbershop"
SET
  name = 'Barbearia Modelo',
  slug = 'barbearia-modelo',
  slogan = 'Barbearia de demonstração do BarberFlow.',
  description = 'Esta é uma barbearia de demonstração, usada para conhecer o fluxo de agendamento do BarberFlow. Os dados são fictícios e servem apenas para teste.',
  "isPublished" = true
WHERE slug = 'blackwood-barber';
