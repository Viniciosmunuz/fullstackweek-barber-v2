-- Histórico de demonstração do painel de gestão.
--
-- Sem movimento, os relatórios abririam vazios e as métricas ficariam em zero.
-- Esta carga cria uma clientela fictícia e doze meses de agendamentos para que
-- faturamento, ocupação e ranking de serviços tenham base real de cálculo.
--
-- Todos os clientes ficam marcados com `isDemo`, e é esse sinalizador que o
-- painel usa para nunca exibir dados de quem entra com a própria conta Google.
-- Os e-mails usam o domínio `exemplo.demo`, que não existe e não recebe nada.

SELECT setseed(0.42);

DELETE FROM "Booking" WHERE "userId" IN (SELECT id FROM "User" WHERE "isDemo");
DELETE FROM "User" WHERE "isDemo";

INSERT INTO "User" (id, name, email, phone, "isDemo", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'André Vasconcelos', 'andre.vasconcelos@exemplo.demo', '(11) 93555-0101', true, now(), now()),
  (gen_random_uuid(), 'Bruno Tavares', 'bruno.tavares@exemplo.demo', '(11) 93555-0102', true, now(), now()),
  (gen_random_uuid(), 'Caio Menezes', 'caio.menezes@exemplo.demo', '(21) 93555-0103', true, now(), now()),
  (gen_random_uuid(), 'Daniel Foquinha', 'daniel.foquinha@exemplo.demo', '(31) 93555-0104', true, now(), now()),
  (gen_random_uuid(), 'Eduardo Rangel', 'eduardo.rangel@exemplo.demo', '(11) 93555-0105', true, now(), now()),
  (gen_random_uuid(), 'Fábio Quintela', 'fabio.quintela@exemplo.demo', '(41) 93555-0106', true, now(), now()),
  (gen_random_uuid(), 'Gustavo Peixoto', 'gustavo.peixoto@exemplo.demo', '(51) 93555-0107', true, now(), now()),
  (gen_random_uuid(), 'Henrique Bordalo', 'henrique.bordalo@exemplo.demo', '(11) 93555-0108', true, now(), now()),
  (gen_random_uuid(), 'Igor Sampaio', 'igor.sampaio@exemplo.demo', '(81) 93555-0109', true, now(), now()),
  (gen_random_uuid(), 'João Pedro Alencar', 'joao.alencar@exemplo.demo', '(21) 93555-0110', true, now(), now()),
  (gen_random_uuid(), 'Kaique Moraes', 'kaique.moraes@exemplo.demo', '(11) 93555-0111', true, now(), now()),
  (gen_random_uuid(), 'Leonardo Pistori', 'leonardo.pistori@exemplo.demo', '(48) 93555-0112', true, now(), now()),
  (gen_random_uuid(), 'Marcelo Ferrão', 'marcelo.ferrao@exemplo.demo', '(31) 93555-0113', true, now(), now()),
  (gen_random_uuid(), 'Nelson Aguiar', 'nelson.aguiar@exemplo.demo', '(71) 93555-0114', true, now(), now()),
  (gen_random_uuid(), 'Otávio Brandão', 'otavio.brandao@exemplo.demo', '(11) 93555-0115', true, now(), now()),
  (gen_random_uuid(), 'Paulo Renato Dias', 'paulo.dias@exemplo.demo', '(61) 93555-0116', true, now(), now()),
  (gen_random_uuid(), 'Quirino Salles', 'quirino.salles@exemplo.demo', '(21) 93555-0117', true, now(), now()),
  (gen_random_uuid(), 'Rafael Ubaldo', 'rafael.ubaldo@exemplo.demo', '(11) 93555-0118', true, now(), now()),
  (gen_random_uuid(), 'Sandro Vilela', 'sandro.vilela@exemplo.demo', '(41) 93555-0119', true, now(), now()),
  (gen_random_uuid(), 'Thiago Nogueira', 'thiago.nogueira@exemplo.demo', '(51) 93555-0120', true, now(), now()),
  (gen_random_uuid(), 'Ubiratã Cordeiro', 'ubirata.cordeiro@exemplo.demo', '(81) 93555-0121', true, now(), now()),
  (gen_random_uuid(), 'Vinícius Palma', 'vinicius.palma@exemplo.demo', '(11) 93555-0122', true, now(), now()),
  (gen_random_uuid(), 'Wagner Estrela', 'wagner.estrela@exemplo.demo', '(31) 93555-0123', true, now(), now()),
  (gen_random_uuid(), 'Xavier Bonfim', 'xavier.bonfim@exemplo.demo', '(71) 93555-0124', true, now(), now()),
  (gen_random_uuid(), 'Yuri Camargo', 'yuri.camargo@exemplo.demo', '(48) 93555-0125', true, now(), now()),
  (gen_random_uuid(), 'Zeca Fontoura', 'zeca.fontoura@exemplo.demo', '(51) 93555-0126', true, now(), now()),
  (gen_random_uuid(), 'Alexandre Tibúrcio', 'alexandre.tiburcio@exemplo.demo', '(11) 93555-0127', true, now(), now()),
  (gen_random_uuid(), 'Breno Callado', 'breno.callado@exemplo.demo', '(21) 93555-0128', true, now(), now()),
  (gen_random_uuid(), 'Cesar Lustosa', 'cesar.lustosa@exemplo.demo', '(61) 93555-0129', true, now(), now()),
  (gen_random_uuid(), 'Diogo Perrone', 'diogo.perrone@exemplo.demo', '(41) 93555-0130', true, now(), now()),
  (gen_random_uuid(), 'Emanuel Vidigal', 'emanuel.vidigal@exemplo.demo', '(11) 93555-0131', true, now(), now()),
  (gen_random_uuid(), 'Flávio Bittencourt', 'flavio.bittencourt@exemplo.demo', '(31) 93555-0132', true, now(), now()),
  (gen_random_uuid(), 'Guilherme Assunção', 'guilherme.assuncao@exemplo.demo', '(81) 93555-0133', true, now(), now()),
  (gen_random_uuid(), 'Hélio Marcondes', 'helio.marcondes@exemplo.demo', '(21) 93555-0134', true, now(), now()),
  (gen_random_uuid(), 'Ivan Reboucas', 'ivan.reboucas@exemplo.demo', '(71) 93555-0135', true, now(), now()),
  (gen_random_uuid(), 'Jorge Amarante', 'jorge.amarante@exemplo.demo', '(11) 93555-0136', true, now(), now()),
  (gen_random_uuid(), 'Kleber Nascimento', 'kleber.nascimento@exemplo.demo', '(48) 93555-0137', true, now(), now()),
  (gen_random_uuid(), 'Lucas Tenório', 'lucas.tenorio@exemplo.demo', '(51) 93555-0138', true, now(), now()),
  (gen_random_uuid(), 'Murilo Prazeres', 'murilo.prazeres@exemplo.demo', '(41) 93555-0139', true, now(), now()),
  (gen_random_uuid(), 'Norberto Chagas', 'norberto.chagas@exemplo.demo', '(61) 93555-0140', true, now(), now());

-- ---------------------------------------------------------------------------
-- Agendamentos dos últimos 12 meses até 10 dias à frente.
--
-- Regras aplicadas para o movimento não parecer aleatório:
--   * domingo não gera agendamento (todas as casas fecham);
--   * sexta e sábado têm volume maior que meio de semana;
--   * datas passadas viram CONCLUÍDO, com ~7% de CANCELADO;
--   * datas futuras ficam CONFIRMADO, com ~15% ainda PENDENTE.
--
-- DISTINCT ON evita dois clientes no mesmo profissional e horário.
-- ---------------------------------------------------------------------------
INSERT INTO "Booking" (id, "userId", "serviceId", "barberId", date, status, "createdAt", "updatedAt")
SELECT DISTINCT ON (pick.barber_id, pick.ts)
  gen_random_uuid(),
  pick.user_id,
  pick.service_id,
  pick.barber_id,
  pick.ts,
  CASE
    WHEN pick.ts > now() THEN
      (CASE WHEN random() < 0.15 THEN 'PENDING' ELSE 'CONFIRMED' END)::"BookingStatus"
    WHEN random() < 0.07 THEN 'CANCELLED'::"BookingStatus"
    ELSE 'COMPLETED'::"BookingStatus"
  END,
  pick.ts - INTERVAL '4 days',
  now()
FROM (
  SELECT
    (d.day + (ARRAY['09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00'])[1 + floor(random() * 8)::int]::time) AS ts,
    (SELECT s.id FROM "BarbershopService" s WHERE s."barbershopId" = bs.id ORDER BY random() LIMIT 1) AS service_id,
    (SELECT b.id FROM "Barber" b WHERE b."barbershopId" = bs.id ORDER BY random() LIMIT 1) AS barber_id,
    (SELECT u.id FROM "User" u WHERE u."isDemo" ORDER BY random() LIMIT 1) AS user_id
  FROM "Barbershop" bs
  CROSS JOIN generate_series(
    (CURRENT_DATE - INTERVAL '12 months')::date,
    (CURRENT_DATE + INTERVAL '10 days')::date,
    '1 day'::interval
  ) AS d(day)
  CROSS JOIN generate_series(1, 2) AS rep(n)
  WHERE extract(dow FROM d.day) <> 0
    -- sexta (5) e sábado (6) sempre geram as duas repetições; nos demais dias
    -- a segunda repetição entra em cerca de 45% das vezes.
    AND (rep.n = 1 OR extract(dow FROM d.day) IN (5, 6) OR random() < 0.45)
) pick
WHERE pick.service_id IS NOT NULL
  AND pick.barber_id IS NOT NULL
  AND pick.user_id IS NOT NULL;
