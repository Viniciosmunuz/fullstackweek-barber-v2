-- Corrige a distribuição do histórico de demonstração.
--
-- Na carga anterior o cliente era escolhido por
--   (SELECT id FROM "User" WHERE "isDemo" ORDER BY random() LIMIT 1)
-- que não referencia nenhuma coluna da consulta externa. Sem correlação, o
-- Postgres avalia a subconsulta uma única vez e reaproveita o resultado em
-- todas as linhas: os milhares de agendamentos ficaram todos com o mesmo
-- cliente, e o painel passou a exibir "1 cliente".
--
-- Aqui os candidatos são materializados em arrays e sorteados por índice, o que
-- garante variação linha a linha e ainda evita as subconsultas repetidas — a
-- carga fica muito mais rápida.

SELECT setseed(0.4242);

DELETE FROM "Booking" WHERE "userId" IN (SELECT id FROM "User" WHERE "isDemo");

INSERT INTO "Booking" (id, "userId", "serviceId", "barberId", date, status, "createdAt", "updatedAt")
SELECT DISTINCT ON (picked.barber_id, picked.ts)
  gen_random_uuid(),
  picked.user_id,
  picked.service_id,
  picked.barber_id,
  picked.ts,
  CASE
    WHEN picked.ts > now() THEN
      (CASE WHEN random() < 0.15 THEN 'PENDING' ELSE 'CONFIRMED' END)::"BookingStatus"
    WHEN random() < 0.07 THEN 'CANCELLED'::"BookingStatus"
    ELSE 'COMPLETED'::"BookingStatus"
  END,
  picked.ts - INTERVAL '4 days',
  now()
FROM (
  SELECT
    -- índices sorteados por linha; random() aqui é reavaliado a cada tupla
    shop.services[1 + floor(random() * array_length(shop.services, 1))::int] AS service_id,
    shop.barbers[1 + floor(random() * array_length(shop.barbers, 1))::int] AS barber_id,
    clients.ids[1 + floor(random() * array_length(clients.ids, 1))::int] AS user_id,
    (d.day + (ARRAY['09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00'])[1 + floor(random() * 8)::int]::time) AS ts
  FROM (
    SELECT
      b.id,
      ARRAY(SELECT s.id FROM "BarbershopService" s WHERE s."barbershopId" = b.id) AS services,
      ARRAY(SELECT bb.id FROM "Barber" bb WHERE bb."barbershopId" = b.id) AS barbers
    FROM "Barbershop" b
  ) shop
  CROSS JOIN (
    SELECT ARRAY(SELECT u.id FROM "User" u WHERE u."isDemo") AS ids
  ) clients
  CROSS JOIN generate_series(
    (CURRENT_DATE - INTERVAL '12 months')::date,
    (CURRENT_DATE + INTERVAL '10 days')::date,
    '1 day'::interval
  ) AS d(day)
  CROSS JOIN generate_series(1, 2) AS rep(n)
  WHERE extract(dow FROM d.day) <> 0
    AND array_length(shop.services, 1) > 0
    AND array_length(shop.barbers, 1) > 0
    AND array_length(clients.ids, 1) > 0
    -- sexta e sábado mantêm as duas repetições; nos demais dias a segunda entra
    -- em cerca de 45% das vezes, para o movimento não ficar uniforme
    AND (rep.n = 1 OR extract(dow FROM d.day) IN (5, 6) OR random() < 0.45)
) picked;
