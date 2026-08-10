-- Cinco barbearias de demonstração, para a grade da home ter conteúdo.
--
-- Servem para exercitar busca, filtros, ordenação e o fluxo de agendamento sem
-- depender de parceiras reais. Cada uma tem símbolo, cor de marca, foto,
-- praça e grade de serviços próprios — repetir a mesma identidade cinco vezes
-- deixaria a grade com cara de placeholder.
--
-- Nomes, endereços e telefones são inventados; os telefones usam a faixa
-- 3555-XXXX, reservada para ficção. Nascem publicadas para aparecerem no
-- catálogo, e convivem com o cadastro de parceiras por e-mail: são apenas
-- barbearias sem gestor vinculado.

INSERT INTO "Barbershop"
  (id, name, slug, slogan, address, neighborhood, city, phones, description,
   "imageUrl", "logoKey", "accentColor", rating, "reviewCount", "isPublished",
   "createdAt", "updatedAt")
VALUES
  ('22222222-0000-4000-8000-000000000001', 'Blackwood Barber', 'blackwood-barber',
   'Precisão em cada passada.',
   'Rua Aspicuelta, 412', 'Vila Madalena', 'São Paulo, SP',
   ARRAY['(11) 3555-0142','(11) 98555-0142'],
   'Barbearia contemporânea especializada em degradê e barba premium. Atendimento individual, cadeira reservada por horário e finalização com toalha quente.',
   'https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png',
   'blackwood', '#C9A227', 4.9, 328, true, now(), now()),

  ('22222222-0000-4000-8000-000000000002', 'District Barber', 'district-barber',
   'Seu corte tem endereço.',
   'Rua dos Pinheiros, 1180', 'Pinheiros', 'São Paulo, SP',
   ARRAY['(11) 3555-0311','(11) 98555-0311'],
   'Estúdio de corte masculino focado em clássicos bem executados: social, militar e degradê médio. Hora marcada, café da casa e conversa na medida.',
   'https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png',
   'distritonorte', '#D8DCE2', 4.8, 216, true, now(), now()),

  ('22222222-0000-4000-8000-000000000003', 'Noble Cut', 'noble-cut',
   'O corte que abre portas.',
   'Rua Oscar Freire, 727', 'Jardins', 'São Paulo, SP',
   ARRAY['(11) 3555-0522','(11) 98555-0522'],
   'Atende quem precisa estar impecável em reunião. Corte social discreto, camuflagem de brancos e barba alinhada, com horários no começo da manhã e no fim da tarde.',
   'https://utfs.io/f/178da6b6-6f9a-424a-be9d-a2feb476eb36-16t.png',
   'nobre', '#C9A227', 4.9, 189, true, now(), now()),

  ('22222222-0000-4000-8000-000000000004', 'Old Town Barber', 'old-town-barber',
   'Barbearia de sempre, do jeito certo.',
   'Alameda Jaú, 604', 'Moema', 'São Paulo, SP',
   ARRAY['(11) 3555-0287','(11) 98555-0287'],
   'Casa de escola clássica, com barbeiros formados na navalha e ferramentas mantidas no fio. Corte na tesoura, toalha quente e acabamento manual, sem pressa.',
   'https://utfs.io/f/2f9278ba-3975-4026-af46-64af78864494-16u.png',
   'casabravo', '#A6414D', 4.7, 154, true, now(), now()),

  ('22222222-0000-4000-8000-000000000005', 'Urban Blade', 'urban-blade',
   'Fade limpo, saída rápida.',
   'Rua João Cachoeira, 899', 'Itaim Bibi', 'São Paulo, SP',
   ARRAY['(11) 3555-0409','(11) 98555-0409'],
   'Barbearia de rotatividade alta que resolveu o problema da fila: tudo agendado, cada serviço com duração fechada e o horário marcado é o horário de sentar na cadeira.',
   'https://utfs.io/f/988646ea-dcb6-4f47-8a03-8d4586b7bc21-16v.png',
   'lamina', '#93A7B4', 4.8, 132, true, now(), now());

-- ---------------------------------------------------------------------------
-- Serviços: preços e durações variam entre as casas de propósito, para que
-- ordenar por menor preço e filtrar por serviço produzam resultados distintos.
-- ---------------------------------------------------------------------------
INSERT INTO "BarbershopService" (id, name, description, "imageUrl", price, "durationMinutes", "barbershopId")
VALUES
  -- Blackwood
  (gen_random_uuid(), 'Degradê Navalhado', 'Fade trabalhado na máquina com transição finalizada na navalha.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 75.00, 40, '22222222-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo com modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 105.00, 60, '22222222-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Barba Premium', 'Modelagem, toalha quente, navalha e óleo finalizador.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 55.00, 35, '22222222-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Corte Clássico', 'Corte personalizado com acabamento preciso e finalização.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 65.00, 30, '22222222-0000-4000-8000-000000000001'),

  -- District
  (gen_random_uuid(), 'Corte Social', 'Corte discreto com risco lateral e acabamento limpo.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 62.00, 30, '22222222-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'Degradê Médio', 'Fade equilibrado, o corte mais pedido da casa.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 68.00, 40, '22222222-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'Barba', 'Modelagem completa com acabamento e hidratação leve.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 42.00, 30, '22222222-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'Acabamento', 'Pezinho, contornos e acabamento geral entre cortes.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 28.00, 15, '22222222-0000-4000-8000-000000000002'),

  -- Noble Cut
  (gen_random_uuid(), 'Corte Executivo', 'Corte social discreto com finalização para uso imediato.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 95.00, 40, '22222222-0000-4000-8000-000000000003'),
  (gen_random_uuid(), 'Camuflagem de Brancos', 'Pigmentação discreta dos fios brancos, sem alterar o tom natural.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 85.00, 45, '22222222-0000-4000-8000-000000000003'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo com modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 135.00, 60, '22222222-0000-4000-8000-000000000003'),
  (gen_random_uuid(), 'Hidratação', 'Hidratação profunda para cabelo e barba.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 60.00, 35, '22222222-0000-4000-8000-000000000003'),

  -- Old Town
  (gen_random_uuid(), 'Corte na Tesoura', 'Corte executado inteiramente na tesoura, sem máquina.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 80.00, 45, '22222222-0000-4000-8000-000000000004'),
  (gen_random_uuid(), 'Barba na Navalha', 'Barba tradicional com toalha quente e navalha aberta.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 50.00, 30, '22222222-0000-4000-8000-000000000004'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo com modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 115.00, 70, '22222222-0000-4000-8000-000000000004'),
  (gen_random_uuid(), 'Sobrancelha', 'Modelagem masculina com acabamento natural.', 'https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png', 25.00, 15, '22222222-0000-4000-8000-000000000004'),

  -- Urban Blade
  (gen_random_uuid(), 'Degradê', 'Fade personalizado com acabamento detalhado.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 58.00, 35, '22222222-0000-4000-8000-000000000005'),
  (gen_random_uuid(), 'Corte Expresso', 'Corte objetivo de 30 minutos, pensado para o horário do almoço.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 45.00, 30, '22222222-0000-4000-8000-000000000005'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo com modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 88.00, 55, '22222222-0000-4000-8000-000000000005'),
  (gen_random_uuid(), 'Acabamento', 'Pezinho, contornos e acabamento geral entre cortes.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 25.00, 15, '22222222-0000-4000-8000-000000000005'),
  (gen_random_uuid(), 'Massagem', 'Massagem de couro cabeludo com óleos e vapor.', 'https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png', 40.00, 25, '22222222-0000-4000-8000-000000000005');

-- ---------------------------------------------------------------------------
-- Profissionais. `imageUrl` fica vazio de propósito: a interface desenha um
-- avatar com as iniciais no tom da barbearia, evitando atribuir fotos de
-- pessoas reais a estabelecimentos fictícios.
-- ---------------------------------------------------------------------------
INSERT INTO "Barber" (id, name, specialty, bio, "imageUrl", active, "barbershopId", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Caio Martins', 'Degradê e navalha', 'Nove anos de cadeira e o fade mais pedido da casa.', '', true, '22222222-0000-4000-8000-000000000001', now(), now()),
  (gen_random_uuid(), 'Rafael Duarte', 'Barba premium', 'Trabalha barba cheia e toalha quente desde 2016.', '', true, '22222222-0000-4000-8000-000000000001', now(), now()),
  (gen_random_uuid(), 'Téo Andrade', 'Corte clássico', 'Especialista em social e transições curtas.', '', true, '22222222-0000-4000-8000-000000000001', now(), now()),

  (gen_random_uuid(), 'Henrique Volk', 'Corte social', 'Atende o público executivo do bairro há seis anos.', '', true, '22222222-0000-4000-8000-000000000002', now(), now()),
  (gen_random_uuid(), 'Lucas Prado', 'Degradê médio', 'Fade limpo e simétrico, a assinatura da casa.', '', true, '22222222-0000-4000-8000-000000000002', now(), now()),

  (gen_random_uuid(), 'Eduardo Sampaio', 'Corte executivo', 'Atende antes das nove para quem entra em reunião.', '', true, '22222222-0000-4000-8000-000000000003', now(), now()),
  (gen_random_uuid(), 'Paulo Vasques', 'Camuflagem de brancos', 'Trabalha pigmentação discreta há mais de dez anos.', '', true, '22222222-0000-4000-8000-000000000003', now(), now()),

  (gen_random_uuid(), 'Otávio Lima', 'Navalha tradicional', 'Referência da casa em barba raspada.', '', true, '22222222-0000-4000-8000-000000000004', now(), now()),
  (gen_random_uuid(), 'Bruno Ferro', 'Corte na tesoura', 'Formado na escola clássica italiana.', '', true, '22222222-0000-4000-8000-000000000004', now(), now()),

  (gen_random_uuid(), 'Diego Nunes', 'Manutenção rápida', 'Entrega corte completo em 30 minutos sem correria.', '', true, '22222222-0000-4000-8000-000000000005', now(), now()),
  (gen_random_uuid(), 'Vinícius Rocha', 'Degradê', 'Trabalha fade alto e desenho na navalha.', '', true, '22222222-0000-4000-8000-000000000005', now(), now());

-- ---------------------------------------------------------------------------
-- Horários: domingo fechado, sábado mais curto. Urban Blade abre mais cedo por
-- causa do movimento de escritório na região.
-- ---------------------------------------------------------------------------
INSERT INTO "OpeningHour" (id, weekday, "opensAt", "closesAt", closed, "barbershopId")
SELECT gen_random_uuid(), d.weekday, d."opensAt", d."closesAt", d.closed, b.id
FROM "Barbershop" b
CROSS JOIN (VALUES
  (0, NULL, NULL, true),
  (1, '09:00', '20:00', false),
  (2, '09:00', '20:00', false),
  (3, '09:00', '20:00', false),
  (4, '09:00', '20:00', false),
  (5, '09:00', '21:00', false),
  (6, '09:00', '18:00', false)
) AS d(weekday, "opensAt", "closesAt", closed)
WHERE b.slug IN ('blackwood-barber', 'district-barber', 'noble-cut', 'old-town-barber');

INSERT INTO "OpeningHour" (id, weekday, "opensAt", "closesAt", closed, "barbershopId")
SELECT gen_random_uuid(), d.weekday, d."opensAt", d."closesAt", d.closed, b.id
FROM "Barbershop" b
CROSS JOIN (VALUES
  (0, NULL, NULL, true),
  (1, '08:00', '19:00', false),
  (2, '08:00', '19:00', false),
  (3, '08:00', '19:00', false),
  (4, '08:00', '19:00', false),
  (5, '08:00', '20:00', false),
  (6, '08:00', '14:00', false)
) AS d(weekday, "opensAt", "closesAt", closed)
WHERE b.slug = 'urban-blade';
