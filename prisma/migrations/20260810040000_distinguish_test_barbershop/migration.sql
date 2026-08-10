-- Diferencia a barbearia de teste das novas casas de demonstração.
--
-- A "Barbearia Modelo" nasceu da antiga Blackwood, renomeada quando o catálogo
-- foi zerado. Ao recriar a Blackwood, as duas passaram a exibir a mesma nota,
-- o mesmo número de avaliações e o mesmo bairro — lado a lado na grade,
-- pareciam o mesmo registro duplicado.
--
-- Aqui ela recebe praça, nota e volume próprios. Continua sendo a casa neutra
-- para testar o fluxo, agora sem se confundir com as outras.

UPDATE "Barbershop"
SET
  slogan = 'Barbearia de teste do BarberFlow.',
  address = 'Av. Paulista, 1578',
  neighborhood = 'Bela Vista',
  rating = 4.6,
  "reviewCount" = 87
WHERE slug = 'barbearia-modelo';
