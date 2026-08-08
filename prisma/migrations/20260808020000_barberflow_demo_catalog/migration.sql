-- Catálogo de demonstração do BarberFlow.
--
-- 10 barbearias fictícias, cada uma com marca, praça, tom de acento, quadro de
-- profissionais, horários e uma grade de serviços própria (preços e durações
-- variam entre elas de propósito — barbearias reais não cobram o mesmo).
--
-- Todos os nomes, endereços e telefones são inventados. Os telefones usam a
-- faixa 3555-XXXX, reservada para ficção, e nenhum corresponde a linha real.
--
-- Roda como migration porque o ambiente de build não executa `prisma db seed`;
-- os IDs são fixos para que a carga seja determinística entre ambientes.

DELETE FROM "Booking";
DELETE FROM "BarbershopService";
DELETE FROM "Barber";
DELETE FROM "OpeningHour";
DELETE FROM "Barbershop";

INSERT INTO "Barbershop"
  (id, name, slug, slogan, address, city, phones, description, "imageUrl", "logoKey", "accentColor", rating, "reviewCount", "createdAt", "updatedAt")
VALUES
  ('11111111-0000-4000-8000-000000000001', 'Blackwood Barber', 'blackwood-barber',
   'Precisão em cada passada.',
   'Rua Aspicuelta, 412 — Vila Madalena', 'São Paulo, SP',
   ARRAY['(11) 3555-0142','(11) 98555-0142'],
   'Barbearia contemporânea especializada em degradê e barba premium. O atendimento é individual, com cadeira reservada por horário e finalização com toalha quente. Um ambiente pensado para quem valoriza precisão técnica e não gosta de esperar.',
   'https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png',
   'blackwood', '#C9A227', 4.9, 328, now(), now()),

  ('11111111-0000-4000-8000-000000000002', 'Ferro & Lima', 'ferro-e-lima',
   'Tradição afiada todo dia.',
   'Rua Augusta, 2110 — Consolação', 'São Paulo, SP',
   ARRAY['(11) 3555-0287','(11) 98555-0287'],
   'Casa aberta em bairro movimentado, com barbeiros formados na escola clássica e ferramentas mantidas no fio. Trabalha corte na tesoura, navalha quente e acabamento manual, sem pressa e sem atalho.',
   'https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png',
   'ferrolima', '#B87333', 4.8, 512, now(), now()),

  ('11111111-0000-4000-8000-000000000003', 'Distrito Norte', 'distrito-norte',
   'Seu corte tem endereço.',
   'Av. Sete de Setembro, 1904 — Batel', 'Curitiba, PR',
   ARRAY['(41) 3555-0311','(41) 98555-0311'],
   'Estúdio de corte masculino com foco em clássicos bem executados: social, militar e degradê médio. Atendimento por hora marcada, café da casa e conversa na medida de quem prefere silêncio.',
   'https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png',
   'distritonorte', '#D8DCE2', 4.7, 214, now(), now()),

  ('11111111-0000-4000-8000-000000000004', 'Studio Nove', 'studio-nove',
   'Agenda cheia, espera zero.',
   'Rua Pernambuco, 909 — Savassi', 'Belo Horizonte, MG',
   ARRAY['(31) 3555-0409','(31) 98555-0409'],
   'Barbearia de rotatividade alta que resolveu o problema da fila: tudo é agendado, cada serviço tem duração fechada e o horário marcado é o horário de entrar na cadeira. Especializada em manutenção quinzenal.',
   'https://utfs.io/f/7e309eaa-d722-465b-b8b6-76217404a3d3-16s.png',
   'studionove', '#2F6F4E', 4.9, 187, now(), now()),

  ('11111111-0000-4000-8000-000000000005', 'Nobre Barbearia', 'nobre-barbearia',
   'O corte que abre portas.',
   'Rua Visconde de Pirajá, 550 — Ipanema', 'Rio de Janeiro, RJ',
   ARRAY['(21) 3555-0522','(21) 98555-0522'],
   'Atende executivos e quem precisa estar impecável em reunião. Corte social discreto, camuflagem de brancos e barba alinhada, com horários no início da manhã e no fim da tarde para caber na agenda de trabalho.',
   'https://utfs.io/f/178da6b6-6f9a-424a-be9d-a2feb476eb36-16t.png',
   'nobre', '#C9A227', 4.8, 641, now(), now()),

  ('11111111-0000-4000-8000-000000000006', 'Lâmina Studio', 'lamina-studio',
   'Barba feita à navalha.',
   'Rua Padre Chagas, 128 — Moinhos de Vento', 'Porto Alegre, RS',
   ARRAY['(51) 3555-0634','(51) 98555-0634'],
   'Especialista em barba: modelagem, navalha tradicional, toalha quente e óleos finalizadores. O corte de cabelo existe no cardápio, mas quem chega aqui vem pelo trabalho no rosto.',
   'https://utfs.io/f/2f9278ba-3975-4026-af46-64af78864494-16u.png',
   'lamina', '#93A7B4', 4.9, 276, now(), now()),

  ('11111111-0000-4000-8000-000000000007', 'Praça Onze', 'praca-onze',
   'Barbearia de bairro, padrão de estúdio.',
   'Rua da Aurora, 1101 — Boa Vista', 'Recife, PE',
   ARRAY['(81) 3555-0711','(81) 98555-0711'],
   'Nasceu como barbearia de esquina e manteve o preço acessível depois de virar referência no bairro. Corte rápido bem feito, acabamento caprichado e horário estendido no sábado.',
   'https://utfs.io/f/988646ea-dcb6-4f47-8a03-8d4586b7bc21-16v.png',
   'pracaonze', '#C1554A', 4.6, 158, now(), now()),

  ('11111111-0000-4000-8000-000000000008', 'Meridiano Barbearia', 'meridiano-barbearia',
   'Seu horário no ponto certo.',
   'Av. Rio Branco, 380 — Centro', 'Florianópolis, SC',
   ARRAY['(48) 3555-0845','(48) 98555-0845'],
   'Fica no caminho de quem trabalha no centro e abre cedo por causa disso. Trabalha corte na máquina com acabamento na tesoura e mantém encaixes de trinta minutos no horário do almoço.',
   'https://utfs.io/f/60f24f5c-9ed3-40ba-8c92-0cd1dcd043f9-16w.png',
   'meridiano', '#3B84A6', 4.7, 203, now(), now()),

  ('11111111-0000-4000-8000-000000000009', 'Casa Bravo', 'casa-bravo',
   'Entre como cliente, saia como visita.',
   'Rua Marquês de Caravelas, 77 — Barra', 'Salvador, BA',
   ARRAY['(71) 3555-0918','(71) 98555-0918'],
   'Barbearia de casarão com pé-direito alto, som baixo e atendimento demorado no bom sentido. Corte, barba e tratamento capilar num ritmo que não empurra ninguém para a porta.',
   'https://utfs.io/f/f64f1bd4-59ce-4ee3-972d-2399937eeafc-16x.png',
   'casabravo', '#A6414D', 4.8, 389, now(), now()),

  ('11111111-0000-4000-8000-000000000010', 'Âmbar Barbearia', 'ambar-barbearia',
   'Cuidado que dura a semana toda.',
   'CLS 209, Bloco C, Loja 14 — Asa Sul', 'Brasília, DF',
   ARRAY['(61) 3555-1024','(61) 98555-1024'],
   'Junta barbearia e cuidado capilar no mesmo lugar: hidratação, relaxamento e tratamento de couro cabeludo entram no mesmo agendamento do corte. Indicada para cabelo cacheado e crespo.',
   'https://utfs.io/f/e995db6d-df96-4658-99f5-11132fd931e1-17j.png',
   'ambar', '#D98F2B', 4.7, 231, now(), now());

-- ---------------------------------------------------------------------------
-- Serviços: grade própria por barbearia, com preço e duração coerentes com o
-- posicionamento de cada casa (Praça Onze é a mais barata, Nobre a mais cara).
-- ---------------------------------------------------------------------------
INSERT INTO "BarbershopService" (id, name, description, "imageUrl", price, "durationMinutes", "barbershopId")
VALUES
  -- Blackwood Barber — degradê e barba premium
  (gen_random_uuid(), 'Degradê Navalhado', 'Fade trabalhado na máquina com transição finalizada na navalha.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 75.00, 40, '11111111-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo acompanhado de modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 105.00, 60, '11111111-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Barba Premium', 'Modelagem, toalha quente, navalha e óleo finalizador.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 55.00, 35, '11111111-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Corte Clássico', 'Corte personalizado com acabamento preciso e finalização.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 65.00, 30, '11111111-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Acabamento', 'Pezinho, contornos e acabamento geral entre cortes.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 35.00, 15, '11111111-0000-4000-8000-000000000001'),

  -- Ferro & Lima — escola clássica, tesoura e navalha
  (gen_random_uuid(), 'Corte na Tesoura', 'Corte executado inteiramente na tesoura, sem máquina.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 80.00, 45, '11111111-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'Barba na Navalha', 'Barba tradicional com toalha quente e navalha aberta.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 50.00, 30, '11111111-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo acompanhado de modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 115.00, 70, '11111111-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'Corte Clássico', 'Corte personalizado com acabamento preciso e finalização.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 60.00, 30, '11111111-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'Sobrancelha', 'Modelagem masculina com acabamento natural.', 'https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png', 25.00, 15, '11111111-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'Acabamento', 'Pezinho, contornos e acabamento geral entre cortes.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 30.00, 15, '11111111-0000-4000-8000-000000000002'),

  -- Distrito Norte — clássicos bem executados
  (gen_random_uuid(), 'Corte Social', 'Corte discreto com risco lateral e acabamento limpo.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 62.00, 30, '11111111-0000-4000-8000-000000000003'),
  (gen_random_uuid(), 'Degradê Médio', 'Fade equilibrado, o corte mais pedido da casa.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 68.00, 40, '11111111-0000-4000-8000-000000000003'),
  (gen_random_uuid(), 'Barba', 'Modelagem completa com acabamento e hidratação leve.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 42.00, 30, '11111111-0000-4000-8000-000000000003'),
  (gen_random_uuid(), 'Sobrancelha', 'Modelagem masculina com acabamento natural.', 'https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png', 20.00, 15, '11111111-0000-4000-8000-000000000003'),
  (gen_random_uuid(), 'Acabamento', 'Pezinho, contornos e acabamento geral entre cortes.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 28.00, 15, '11111111-0000-4000-8000-000000000003'),

  -- Studio Nove — manutenção rápida e previsível
  (gen_random_uuid(), 'Manutenção Quinzenal', 'Retoque de corte e contornos para quem vem a cada 15 dias.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 45.00, 25, '11111111-0000-4000-8000-000000000004'),
  (gen_random_uuid(), 'Degradê', 'Fade personalizado com acabamento detalhado.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 70.00, 40, '11111111-0000-4000-8000-000000000004'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo acompanhado de modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 95.00, 50, '11111111-0000-4000-8000-000000000004'),
  (gen_random_uuid(), 'Barba', 'Modelagem completa com acabamento e hidratação leve.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 40.00, 25, '11111111-0000-4000-8000-000000000004'),
  (gen_random_uuid(), 'Acabamento', 'Pezinho, contornos e acabamento geral entre cortes.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 30.00, 15, '11111111-0000-4000-8000-000000000004'),

  -- Nobre Barbearia — público executivo, ticket mais alto
  (gen_random_uuid(), 'Corte Executivo', 'Corte social discreto com finalização para uso imediato.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 95.00, 40, '11111111-0000-4000-8000-000000000005'),
  (gen_random_uuid(), 'Camuflagem de Brancos', 'Pigmentação discreta dos fios brancos, sem alterar o tom natural.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 85.00, 45, '11111111-0000-4000-8000-000000000005'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo acompanhado de modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 135.00, 60, '11111111-0000-4000-8000-000000000005'),
  (gen_random_uuid(), 'Barba Premium', 'Modelagem, toalha quente, navalha e óleo finalizador.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 65.00, 35, '11111111-0000-4000-8000-000000000005'),
  (gen_random_uuid(), 'Sobrancelha', 'Modelagem masculina com acabamento natural.', 'https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png', 30.00, 15, '11111111-0000-4000-8000-000000000005'),

  -- Lâmina Studio — a casa da barba
  (gen_random_uuid(), 'Barba Completa', 'Modelagem, navalha, toalha quente e finalização com bálsamo.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 60.00, 40, '11111111-0000-4000-8000-000000000006'),
  (gen_random_uuid(), 'Barba Terapia', 'Ritual longo com esfoliação, vapor, navalha e massagem facial.', 'https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png', 110.00, 70, '11111111-0000-4000-8000-000000000006'),
  (gen_random_uuid(), 'Alinhamento de Barba', 'Contorno e nivelamento entre visitas, sem raspar.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 38.00, 20, '11111111-0000-4000-8000-000000000006'),
  (gen_random_uuid(), 'Corte Clássico', 'Corte personalizado com acabamento preciso e finalização.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 70.00, 35, '11111111-0000-4000-8000-000000000006'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo acompanhado de modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 118.00, 65, '11111111-0000-4000-8000-000000000006'),

  -- Praça Onze — preço acessível, volume alto
  (gen_random_uuid(), 'Corte Simples', 'Corte na máquina com acabamento na tesoura.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 40.00, 25, '11111111-0000-4000-8000-000000000007'),
  (gen_random_uuid(), 'Degradê', 'Fade personalizado com acabamento detalhado.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 50.00, 35, '11111111-0000-4000-8000-000000000007'),
  (gen_random_uuid(), 'Barba', 'Modelagem completa com acabamento e hidratação leve.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 30.00, 25, '11111111-0000-4000-8000-000000000007'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo acompanhado de modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 65.00, 45, '11111111-0000-4000-8000-000000000007'),
  (gen_random_uuid(), 'Acabamento', 'Pezinho, contornos e acabamento geral entre cortes.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 20.00, 15, '11111111-0000-4000-8000-000000000007'),
  (gen_random_uuid(), 'Sobrancelha', 'Modelagem masculina com acabamento natural.', 'https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png', 18.00, 15, '11111111-0000-4000-8000-000000000007'),

  -- Meridiano — encaixes rápidos no centro
  (gen_random_uuid(), 'Corte Expresso', 'Corte objetivo de 30 minutos, pensado para o horário do almoço.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 55.00, 30, '11111111-0000-4000-8000-000000000008'),
  (gen_random_uuid(), 'Corte Clássico', 'Corte personalizado com acabamento preciso e finalização.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 63.00, 35, '11111111-0000-4000-8000-000000000008'),
  (gen_random_uuid(), 'Barba', 'Modelagem completa com acabamento e hidratação leve.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 40.00, 25, '11111111-0000-4000-8000-000000000008'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo acompanhado de modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 92.00, 55, '11111111-0000-4000-8000-000000000008'),
  (gen_random_uuid(), 'Acabamento', 'Pezinho, contornos e acabamento geral entre cortes.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 27.00, 15, '11111111-0000-4000-8000-000000000008'),

  -- Casa Bravo — atendimento longo, tratamento incluído
  (gen_random_uuid(), 'Corte Casa Bravo', 'Corte sob consulta com lavagem, massagem e finalização.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 88.00, 50, '11111111-0000-4000-8000-000000000009'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo acompanhado de modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 125.00, 75, '11111111-0000-4000-8000-000000000009'),
  (gen_random_uuid(), 'Massagem Capilar', 'Massagem de couro cabeludo com óleos e vapor.', 'https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png', 55.00, 30, '11111111-0000-4000-8000-000000000009'),
  (gen_random_uuid(), 'Barba Premium', 'Modelagem, toalha quente, navalha e óleo finalizador.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 58.00, 40, '11111111-0000-4000-8000-000000000009'),
  (gen_random_uuid(), 'Hidratação', 'Hidratação profunda para cabelo e barba.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 60.00, 35, '11111111-0000-4000-8000-000000000009'),

  -- Âmbar — tratamento capilar, cacheado e crespo
  (gen_random_uuid(), 'Corte Cacheado', 'Corte desenhado para cachos, respeitando volume e curvatura.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 78.00, 45, '11111111-0000-4000-8000-000000000010'),
  (gen_random_uuid(), 'Hidratação Profunda', 'Tratamento de reposição para fios ressecados, com finalização.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 65.00, 40, '11111111-0000-4000-8000-000000000010'),
  (gen_random_uuid(), 'Relaxamento', 'Redução de volume com produto adequado ao tipo de fio.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 120.00, 90, '11111111-0000-4000-8000-000000000010'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo acompanhado de modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 98.00, 60, '11111111-0000-4000-8000-000000000010'),
  (gen_random_uuid(), 'Massagem Capilar', 'Massagem de couro cabeludo com óleos e vapor.', 'https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png', 45.00, 25, '11111111-0000-4000-8000-000000000010');

-- ---------------------------------------------------------------------------
-- Profissionais. `imageUrl` fica vazio de propósito: a interface desenha um
-- avatar com as iniciais no tom da barbearia, evitando atribuir fotos de
-- pessoas reais a estabelecimentos fictícios.
-- ---------------------------------------------------------------------------
INSERT INTO "Barber" (id, name, specialty, bio, "imageUrl", "barbershopId", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Caio Marchetti', 'Degradê e navalha', 'Nove anos de cadeira e o fade mais pedido da casa.', '', '11111111-0000-4000-8000-000000000001', now(), now()),
  (gen_random_uuid(), 'Rafael Duarte', 'Barba premium', 'Trabalha barba cheia e toalha quente desde 2016.', '', '11111111-0000-4000-8000-000000000001', now(), now()),
  (gen_random_uuid(), 'Téo Andrade', 'Corte clássico', 'Especialista em social e transições curtas.', '', '11111111-0000-4000-8000-000000000001', now(), now()),

  (gen_random_uuid(), 'Bruno Ferro', 'Corte na tesoura', 'Sócio da casa, formado na escola clássica italiana.', '', '11111111-0000-4000-8000-000000000002', now(), now()),
  (gen_random_uuid(), 'Otávio Lima', 'Navalha tradicional', 'Sócio da casa, referência em barba raspada.', '', '11111111-0000-4000-8000-000000000002', now(), now()),
  (gen_random_uuid(), 'Igor Bastos', 'Acabamento', 'Rápido no pezinho e no contorno, sem perder o traço.', '', '11111111-0000-4000-8000-000000000002', now(), now()),

  (gen_random_uuid(), 'Henrique Volk', 'Corte social', 'Atende o público executivo do Batel há seis anos.', '', '11111111-0000-4000-8000-000000000003', now(), now()),
  (gen_random_uuid(), 'Lucas Prado', 'Degradê médio', 'Fade limpo e simétrico, a assinatura da casa.', '', '11111111-0000-4000-8000-000000000003', now(), now()),

  (gen_random_uuid(), 'Diego Nunes', 'Manutenção rápida', 'Entrega corte completo em 25 minutos sem correria.', '', '11111111-0000-4000-8000-000000000004', now(), now()),
  (gen_random_uuid(), 'Vinícius Rocha', 'Degradê', 'Trabalha fade alto e desenho na navalha.', '', '11111111-0000-4000-8000-000000000004', now(), now()),
  (gen_random_uuid(), 'Márcio Setti', 'Corte e barba', 'Cuida dos combos e dos encaixes de fim de tarde.', '', '11111111-0000-4000-8000-000000000004', now(), now()),

  (gen_random_uuid(), 'Eduardo Sampaio', 'Corte executivo', 'Atende antes das nove para quem entra em reunião.', '', '11111111-0000-4000-8000-000000000005', now(), now()),
  (gen_random_uuid(), 'Paulo Vasques', 'Camuflagem de brancos', 'Trabalha pigmentação discreta há mais de dez anos.', '', '11111111-0000-4000-8000-000000000005', now(), now()),
  (gen_random_uuid(), 'Sérgio Bittar', 'Barba premium', 'Modelagem alinhada ao formato do rosto.', '', '11111111-0000-4000-8000-000000000005', now(), now()),

  (gen_random_uuid(), 'Anderson Klein', 'Barba terapia', 'Criador do ritual longo de barba da casa.', '', '11111111-0000-4000-8000-000000000006', now(), now()),
  (gen_random_uuid(), 'Felipe Corrêa', 'Navalha aberta', 'Raspagem tradicional com vapor e bálsamo.', '', '11111111-0000-4000-8000-000000000006', now(), now()),

  (gen_random_uuid(), 'Jonas Ribeiro', 'Corte rápido', 'Atende desde a época da barbearia de esquina.', '', '11111111-0000-4000-8000-000000000007', now(), now()),
  (gen_random_uuid(), 'Wesley Camargo', 'Degradê', 'Fade e desenho, o mais procurado pelos jovens do bairro.', '', '11111111-0000-4000-8000-000000000007', now(), now()),

  (gen_random_uuid(), 'Rodrigo Salles', 'Corte expresso', 'Especialista em encaixe de trinta minutos.', '', '11111111-0000-4000-8000-000000000008', now(), now()),
  (gen_random_uuid(), 'Thiago Meireles', 'Corte e barba', 'Cobre os horários de abertura e fechamento.', '', '11111111-0000-4000-8000-000000000008', now(), now()),

  (gen_random_uuid(), 'Adriano Bravo', 'Corte sob consulta', 'Dono da casa, atende com hora estendida.', '', '11111111-0000-4000-8000-000000000009', now(), now()),
  (gen_random_uuid(), 'Neto Almeida', 'Tratamento capilar', 'Massagem e cuidado de couro cabeludo.', '', '11111111-0000-4000-8000-000000000009', now(), now()),
  (gen_random_uuid(), 'Kléber Tanaka', 'Barba premium', 'Barba longa e manutenção de bigode.', '', '11111111-0000-4000-8000-000000000009', now(), now()),

  (gen_random_uuid(), 'Michel Araújo', 'Cachos e crespos', 'Corte de curvatura, referência da casa.', '', '11111111-0000-4000-8000-000000000010', now(), now()),
  (gen_random_uuid(), 'Fabrício Lopes', 'Tratamento capilar', 'Hidratação e relaxamento com produto por tipo de fio.', '', '11111111-0000-4000-8000-000000000010', now(), now());

-- ---------------------------------------------------------------------------
-- Horários de funcionamento. Domingo fechado em todas; sábado mais curto,
-- exceto Praça Onze, que estende o sábado, e Meridiano, que abre mais cedo.
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
WHERE b.slug NOT IN ('praca-onze', 'meridiano-barbearia');

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
  (6, '08:00', '20:00', false)
) AS d(weekday, "opensAt", "closesAt", closed)
WHERE b.slug = 'praca-onze';

INSERT INTO "OpeningHour" (id, weekday, "opensAt", "closesAt", closed, "barbershopId")
SELECT gen_random_uuid(), d.weekday, d."opensAt", d."closesAt", d.closed, b.id
FROM "Barbershop" b
CROSS JOIN (VALUES
  (0, NULL, NULL, true),
  (1, '07:30', '19:00', false),
  (2, '07:30', '19:00', false),
  (3, '07:30', '19:00', false),
  (4, '07:30', '19:00', false),
  (5, '07:30', '19:00', false),
  (6, '08:00', '14:00', false)
) AS d(weekday, "opensAt", "closesAt", closed)
WHERE b.slug = 'meridiano-barbearia';
