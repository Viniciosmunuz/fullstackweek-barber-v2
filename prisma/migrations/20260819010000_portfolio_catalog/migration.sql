-- Catálogo de portfólio: dez barbearias fictícias, completas e distintas.
--
-- O BarberFlow deixou de mirar produção e passa a ser peça de portfólio. O que
-- ele precisa agora não é mais infraestrutura, é conteúdo: quem abrir o projeto
-- para avaliar precisa encontrar telas cheias, e não uma grade com duas casas
-- de teste.
--
-- Substitui as cinco barbearias de demonstração de `20260810030000` por dez,
-- cada uma com identidade própria — premium, jovem, tradicional, urbana,
-- clássica, sofisticada, econômica, especialista em barba, retrô e moderna.
-- Nomes, endereços e telefones são inventados; os telefones usam a faixa
-- 3555-XXXX, reservada para ficção.
--
-- Junto vêm clientes, histórico de atendimentos e avaliações de verdade. Sem
-- isso o painel abriria zerado e a seção "o que os clientes dizem" ficaria
-- vazia embaixo de uma nota que ninguém deu — que era exatamente o defeito das
-- notas fixas que o projeto já corrigiu uma vez.

-- ---------------------------------------------------------------------------
-- 1. Limpeza do que este arquivo recria
--
-- Só alcança dado de demonstração: as casas fictícias conhecidas e os clientes
-- marcados como demo. Barbearia cadastrada pela plataforma e conta de pessoa
-- real ficam intactas. A ordem importa — `Booking` referencia serviço e usuário
-- com restrição, então sai primeiro.
-- ---------------------------------------------------------------------------
DELETE FROM "Booking"
WHERE "userId" IN (SELECT id FROM "User" WHERE "isDemo" = true)
   OR "serviceId" IN (
        SELECT s.id
        FROM "BarbershopService" s
        JOIN "Barbershop" b ON b.id = s."barbershopId"
        WHERE b.slug IN (
          'blackwood-barber','district-barber','noble-cut','old-town-barber',
          'urban-blade','studio-nove','casa-bravo','distrito-norte',
          'praca-onze','nobre-barbearia','corte-certo','ferro-e-lima',
          'ambar-barbearia','meridiano-barber-lab'
        )
      );

DELETE FROM "User" WHERE "isDemo" = true;

DELETE FROM "Barbershop" WHERE slug IN (
  'blackwood-barber','district-barber','noble-cut','old-town-barber',
  'urban-blade','studio-nove','casa-bravo','distrito-norte',
  'praca-onze','nobre-barbearia','corte-certo','ferro-e-lima',
  'ambar-barbearia','meridiano-barber-lab'
);

-- A casa de teste sai da vitrine, mas continua existindo: o histórico de quem
-- testou o fluxo está preso a ela. Um clique no painel republica.
UPDATE "Barbershop"
SET "isPublished" = false
WHERE slug = 'barbearia-modelo';

-- ---------------------------------------------------------------------------
-- 2. As dez casas
--
-- `logoKey` não se repete: são exatamente as dez silhuetas desenhadas em
-- `_components/brand/barbershop-logo.tsx`. A cor de destaque sai da paleta que
-- o painel oferece, para que nenhuma casa exiba um tom que o dono não
-- conseguiria escolher sozinho.
--
-- `cancelWindowHours` também varia: é o que mostra a política de cancelamento
-- funcionando diferente entre casas, em vez de um campo sempre no padrão.
-- ---------------------------------------------------------------------------
INSERT INTO "Barbershop"
  (id, name, slug, slogan, address, neighborhood, city, phones, description,
   "imageUrl", "logoKey", "accentColor", "cancelWindowHours", "isPublished",
   "createdAt", "updatedAt")
VALUES
  -- 1. Premium contemporânea
  ('22222222-0000-4000-8000-000000000001', 'Blackwood Barber', 'blackwood-barber',
   'Precisão em cada passada.',
   'Rua Aspicuelta, 412', 'Vila Madalena', 'São Paulo, SP',
   ARRAY['(11) 3555-0142','(11) 98555-0142'],
   'Barbearia contemporânea especializada em degradê e barba premium. Cada horário é uma cadeira reservada com hora de início e de fim, sem sala de espera cheia: você entra, senta e é atendido. O acabamento fecha com toalha quente e óleo finalizador.',
   'https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png',
   'blackwood', '#834CF1', 12, true, now(), now()),

  -- 2. Jovem e moderna
  ('22222222-0000-4000-8000-000000000002', 'Studio Nove', 'studio-nove',
   'Seu corte, do seu jeito.',
   'Rua dos Pinheiros, 1180', 'Pinheiros', 'São Paulo, SP',
   ARRAY['(11) 3555-0311','(11) 98555-0311'],
   'Estúdio jovem que trabalha o corte a partir de referência: você chega com a foto, a gente adapta ao seu formato de rosto e ao seu tipo de fio. Fade, freestyle, platinado e desenho na navalha. Playlist alta e café por conta da casa.',
   'https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png',
   'studionove', '#3B84A6', 4, true, now(), now()),

  -- 3. Tradicional de bairro
  ('22222222-0000-4000-8000-000000000003', 'Casa Bravo Barbearia', 'casa-bravo',
   'Barbearia de sempre, do jeito certo.',
   'Rua da Mooca, 1.845', 'Mooca', 'São Paulo, SP',
   ARRAY['(11) 3555-0287','(11) 98555-0287'],
   'Aberta em 1994 pelo seu Antônio e tocada hoje pelos filhos. Corte na tesoura, navalha no fio e conversa de bairro — a mesma cadeira restaurada que atende pai e filho na mesma tarde. Sem pressa e sem modismo.',
   'https://utfs.io/f/2f9278ba-3975-4026-af46-64af78864494-16u.png',
   'casabravo', '#B87333', 0, true, now(), now()),

  -- 4. Urbana
  ('22222222-0000-4000-8000-000000000004', 'Distrito Norte', 'distrito-norte',
   'Fade limpo, saída rápida.',
   'Av. Casa Verde, 2.310', 'Santana', 'São Paulo, SP',
   ARRAY['(11) 3555-0409','(11) 98555-0409'],
   'Barbearia de rotatividade alta que resolveu o problema da fila: tudo agendado, cada serviço com duração fechada e o horário marcado é o horário de sentar na cadeira. Especialidade em fade alto, low taper e manutenção quinzenal.',
   'https://utfs.io/f/988646ea-dcb6-4f47-8a03-8d4586b7bc21-16v.png',
   'distritonorte', '#93A7B4', 2, true, now(), now()),

  -- 5. Clássica masculina
  ('22222222-0000-4000-8000-000000000005', 'Praça Onze Barbearia', 'praca-onze',
   'O clássico não sai de moda.',
   'Rua do Lavradio, 96', 'Centro', 'Rio de Janeiro, RJ',
   ARRAY['(21) 3555-0518','(21) 98555-0518'],
   'Corte masculino clássico executado como manda a escola: social, militar, side part e risco lateral feito na navalha. Barbeiros de jaleco, cadeira reclinável e um espelho de parede a parede. O barbeiro pergunta seu nome e lembra dele na próxima.',
   'https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png',
   'pracaonze', '#A6414D', 6, true, now(), now()),

  -- 6. Sofisticada
  ('22222222-0000-4000-8000-000000000006', 'Nobre Barbearia', 'nobre-barbearia',
   'O corte que abre portas.',
   'Rua Oscar Freire, 727', 'Jardins', 'São Paulo, SP',
   ARRAY['(11) 3555-0522','(11) 98555-0522'],
   'Atende quem precisa estar impecável em reunião. Corte social discreto, camuflagem de brancos e barba alinhada, com agenda aberta a partir das sete da manhã. Sala reservada, atendimento individual e produto de linha profissional incluso no serviço.',
   'https://utfs.io/f/178da6b6-6f9a-424a-be9d-a2feb476eb36-16t.png',
   'nobre', '#D8DCE2', 24, true, now(), now()),

  -- 7. Preço acessível
  ('22222222-0000-4000-8000-000000000007', 'Corte Certo', 'corte-certo',
   'Preço justo, corte bem feito.',
   'Av. Emílio Ribas, 640', 'Gopoúva', 'Guarulhos, SP',
   ARRAY['(11) 3555-0733','(11) 98555-0733'],
   'Barbearia de bairro com preço honesto e corte bem feito, sem cobrar pelo cenário. Quatro cadeiras, atendimento rápido e a mesma qualidade para quem vem cortar toda semana. Combo de corte e barba fechado, e o pezinho entre cortes sai de graça.',
   'https://utfs.io/f/f64f1bd4-59ce-4ee3-972d-2399937eeafc-16x.png',
   'lamina', '#2F6F4E', 0, true, now(), now()),

  -- 8. Especialista em barba
  ('22222222-0000-4000-8000-000000000008', 'Ferro & Lima', 'ferro-e-lima',
   'A barba é o nosso ofício.',
   'Rua Antônio de Albuquerque, 288', 'Savassi', 'Belo Horizonte, MG',
   ARRAY['(31) 3555-0864','(31) 98555-0864'],
   'Casa dedicada à barba: modelagem por formato de rosto, barboterapia com toalha quente e vapor, navalha aberta e tratamento para pele sensível e pelo encravado. Também cortamos cabelo — mas quem vem aqui, vem pela barba.',
   'https://utfs.io/f/7e309eaa-d722-465b-b8b6-76217404a3d3-16s.png',
   'ferrolima', '#C1554A', 12, true, now(), now()),

  -- 9. Retrô
  ('22222222-0000-4000-8000-000000000009', 'Âmbar Barbearia', 'ambar-barbearia',
   'Desde sempre, com estilo.',
   'Al. Dom Pedro II, 415', 'Batel', 'Curitiba, PR',
   ARRAY['(41) 3555-0921','(41) 98555-0921'],
   'Ambientação dos anos 50 levada a sério: poltronas restauradas, azulejo hidráulico e rádio valvulado tocando. Pompadour, slick back, side part e barba na navalha com espuma quente. Quem senta aqui sai com o cabelo que os avós usavam — e que voltou.',
   'https://utfs.io/f/60f24f5c-9ed3-40ba-8c92-0cd1dcd043f9-16w.png',
   'ambar', '#D98F2B', 8, true, now(), now()),

  -- 10. Moderna para público jovem
  ('22222222-0000-4000-8000-000000000010', 'Meridiano Barber Lab', 'meridiano-barber-lab',
   'Corte com assinatura.',
   'Rua Bruno Veloso, 1.102', 'Boa Viagem', 'Recife, PE',
   ARRAY['(81) 3555-0177','(81) 98555-0177'],
   'Laboratório de corte para quem trata cabelo como parte do visual: coloração global, luzes, platinado, undercut e projeto de estilo com acompanhamento a cada quatro semanas. Diagnóstico de fio antes de qualquer química, sempre.',
   'https://utfs.io/f/e995db6d-df96-4658-99f5-11132fd931e1-17j.png',
   'meridiano', '#834CF1', 6, true, now(), now());

-- ---------------------------------------------------------------------------
-- 3. Serviços
--
-- Preço e duração variam bastante entre as casas, e não por enfeite: é o que
-- faz o filtro por serviço e a ordenação por menor preço devolverem resultados
-- diferentes. Um corte custa R$ 25 no Corte Certo e R$ 130 na Nobre — a mesma
-- distância que existe entre as duas na vida real.
--
-- As imagens são as quatro do próprio projeto, escolhidas por tipo de serviço:
-- cabelo, barba, tratamento e sobrancelha.
-- ---------------------------------------------------------------------------
INSERT INTO "BarbershopService" (id, name, description, "imageUrl", price, "durationMinutes", "barbershopId")
VALUES
  -- Blackwood Barber — premium
  (gen_random_uuid(), 'Degradê Navalhado', 'Fade trabalhado na máquina com a transição finalizada na navalha.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 75.00, 40, '22222222-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Corte Clássico', 'Corte personalizado com acabamento preciso e finalização.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 65.00, 30, '22222222-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Barba Premium', 'Modelagem, toalha quente, navalha e óleo finalizador.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 55.00, 35, '22222222-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo com modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 105.00, 60, '22222222-0000-4000-8000-000000000001'),
  (gen_random_uuid(), 'Hidratação Capilar', 'Hidratação profunda com massagem de couro cabeludo.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 48.00, 30, '22222222-0000-4000-8000-000000000001'),

  -- Studio Nove — jovem e moderna
  (gen_random_uuid(), 'Corte Freestyle', 'Corte montado a partir da sua referência, adaptado ao formato do rosto.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 70.00, 45, '22222222-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'Fade + Desenho', 'Degradê com desenho feito à navalha na lateral.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 85.00, 50, '22222222-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'Platinado', 'Descoloração completa com matização e tratamento pós-química.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 220.00, 120, '22222222-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo com modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 95.00, 60, '22222222-0000-4000-8000-000000000002'),
  (gen_random_uuid(), 'Sobrancelha', 'Modelagem masculina com acabamento natural.', 'https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png', 25.00, 15, '22222222-0000-4000-8000-000000000002'),

  -- Casa Bravo — tradicional
  (gen_random_uuid(), 'Corte na Tesoura', 'Corte executado inteiramente na tesoura, sem máquina.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 55.00, 45, '22222222-0000-4000-8000-000000000003'),
  (gen_random_uuid(), 'Barba na Navalha', 'Barba tradicional com toalha quente e navalha aberta.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 40.00, 30, '22222222-0000-4000-8000-000000000003'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo com modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 85.00, 70, '22222222-0000-4000-8000-000000000003'),
  (gen_random_uuid(), 'Pezinho', 'Acabamento de nuca e contornos entre um corte e outro.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 20.00, 15, '22222222-0000-4000-8000-000000000003'),

  -- Distrito Norte — urbana
  (gen_random_uuid(), 'Fade Alto', 'Degradê alto com transição limpa e topo trabalhado.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 50.00, 35, '22222222-0000-4000-8000-000000000004'),
  (gen_random_uuid(), 'Low Taper', 'Degradê baixo e discreto, mantendo volume no topo.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 50.00, 35, '22222222-0000-4000-8000-000000000004'),
  (gen_random_uuid(), 'Corte Expresso', 'Corte objetivo de 30 minutos, pensado para o horário do almoço.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 42.00, 30, '22222222-0000-4000-8000-000000000004'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo com modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 78.00, 55, '22222222-0000-4000-8000-000000000004'),
  (gen_random_uuid(), 'Acabamento', 'Pezinho, contornos e acabamento geral entre cortes.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 25.00, 15, '22222222-0000-4000-8000-000000000004'),

  -- Praça Onze — clássica masculina
  (gen_random_uuid(), 'Corte Social', 'Corte discreto com risco lateral e acabamento limpo.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 58.00, 30, '22222222-0000-4000-8000-000000000005'),
  (gen_random_uuid(), 'Side Part', 'Divisão marcada na navalha e finalização com pomada.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 62.00, 35, '22222222-0000-4000-8000-000000000005'),
  (gen_random_uuid(), 'Barba Tradicional', 'Modelagem completa com acabamento e hidratação leve.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 45.00, 30, '22222222-0000-4000-8000-000000000005'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo com modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 95.00, 60, '22222222-0000-4000-8000-000000000005'),
  (gen_random_uuid(), 'Toalha Quente', 'Ritual de toalha quente com massagem facial e finalização.', 'https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png', 30.00, 20, '22222222-0000-4000-8000-000000000005'),

  -- Nobre Barbearia — sofisticada
  (gen_random_uuid(), 'Corte Executivo', 'Corte social discreto com finalização para uso imediato.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 130.00, 40, '22222222-0000-4000-8000-000000000006'),
  (gen_random_uuid(), 'Camuflagem de Brancos', 'Pigmentação discreta dos fios brancos, sem alterar o tom natural.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 120.00, 45, '22222222-0000-4000-8000-000000000006'),
  (gen_random_uuid(), 'Barba Alinhada', 'Modelagem precisa com produto de linha profissional.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 90.00, 35, '22222222-0000-4000-8000-000000000006'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo com modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 185.00, 60, '22222222-0000-4000-8000-000000000006'),
  (gen_random_uuid(), 'Tratamento Capilar', 'Protocolo de reconstrução com avaliação de couro cabeludo.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 110.00, 40, '22222222-0000-4000-8000-000000000006'),

  -- Corte Certo — acessível
  (gen_random_uuid(), 'Corte Simples', 'Corte na máquina e tesoura com acabamento caprichado.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 25.00, 30, '22222222-0000-4000-8000-000000000007'),
  (gen_random_uuid(), 'Corte + Barba', 'Combo fechado, o mais pedido da casa.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 40.00, 45, '22222222-0000-4000-8000-000000000007'),
  (gen_random_uuid(), 'Barba', 'Modelagem com acabamento e finalização.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 18.00, 20, '22222222-0000-4000-8000-000000000007'),
  (gen_random_uuid(), 'Sobrancelha', 'Modelagem masculina com acabamento natural.', 'https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png', 12.00, 15, '22222222-0000-4000-8000-000000000007'),

  -- Ferro & Lima — especialista em barba
  (gen_random_uuid(), 'Barboterapia Completa', 'Vapor, toalha quente, navalha, máscara e óleo finalizador.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 95.00, 50, '22222222-0000-4000-8000-000000000008'),
  (gen_random_uuid(), 'Barba na Navalha', 'Barba tradicional com toalha quente e navalha aberta.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 60.00, 35, '22222222-0000-4000-8000-000000000008'),
  (gen_random_uuid(), 'Modelagem de Barba', 'Desenho por formato de rosto, com definição de linha.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 48.00, 30, '22222222-0000-4000-8000-000000000008'),
  (gen_random_uuid(), 'Cuidado com Pelo Encravado', 'Protocolo de esfoliação e tratamento para pele sensível.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 75.00, 40, '22222222-0000-4000-8000-000000000008'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo com modelagem e acabamento da barba.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 120.00, 65, '22222222-0000-4000-8000-000000000008'),

  -- Âmbar Barbearia — retrô
  (gen_random_uuid(), 'Pompadour', 'Volume no topo e laterais baixas, finalizado com pomada.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 80.00, 45, '22222222-0000-4000-8000-000000000009'),
  (gen_random_uuid(), 'Slick Back', 'Cabelo penteado para trás com fixação de brilho médio.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 72.00, 40, '22222222-0000-4000-8000-000000000009'),
  (gen_random_uuid(), 'Barba com Espuma Quente', 'Barba raspada à moda antiga, com espuma quente e navalha.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 58.00, 35, '22222222-0000-4000-8000-000000000009'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo com modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 125.00, 70, '22222222-0000-4000-8000-000000000009'),
  (gen_random_uuid(), 'Massagem Facial', 'Massagem com óleos quentes e compressa, ao fim do atendimento.', 'https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png', 45.00, 25, '22222222-0000-4000-8000-000000000009'),

  -- Meridiano Barber Lab — moderna para jovens
  (gen_random_uuid(), 'Coloração Global', 'Mudança completa de cor com diagnóstico de fio incluso.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 260.00, 150, '22222222-0000-4000-8000-000000000010'),
  (gen_random_uuid(), 'Luzes e Mechas', 'Clareamento parcial com matização no tom escolhido.', 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', 230.00, 120, '22222222-0000-4000-8000-000000000010'),
  (gen_random_uuid(), 'Undercut', 'Laterais raspadas com topo longo e finalização texturizada.', 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png', 78.00, 45, '22222222-0000-4000-8000-000000000010'),
  (gen_random_uuid(), 'Corte + Barba', 'Corte completo com modelagem e acabamento da barba.', 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', 98.00, 60, '22222222-0000-4000-8000-000000000010'),
  (gen_random_uuid(), 'Diagnóstico de Fio', 'Avaliação de estrutura e porosidade antes de qualquer química.', 'https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png', 35.00, 20, '22222222-0000-4000-8000-000000000010');

-- ---------------------------------------------------------------------------
-- 4. Profissionais
--
-- `imageUrl` fica vazio de propósito, mantendo a decisão que o projeto já
-- tinha: a interface desenha um avatar com as iniciais no tom da barbearia.
-- Pendurar foto de pessoa real num profissional inventado seria usar o rosto de
-- alguém para ilustrar ficção — e o avatar de iniciais, colorido pela marca da
-- casa, fica melhor na tela do que um banco de imagens genérico.
-- ---------------------------------------------------------------------------
INSERT INTO "Barber" (id, name, specialty, bio, "imageUrl", active, "barbershopId", "createdAt", "updatedAt")
VALUES
  ('33333333-0000-4000-8000-000000000101', 'Caio Martins', 'Degradê e navalha', 'Nove anos de cadeira e o fade mais pedido da casa.', '', true, '22222222-0000-4000-8000-000000000001', now(), now()),
  ('33333333-0000-4000-8000-000000000102', 'Rafael Duarte', 'Barba premium', 'Trabalha barba cheia e toalha quente desde 2016.', '', true, '22222222-0000-4000-8000-000000000001', now(), now()),
  ('33333333-0000-4000-8000-000000000103', 'Téo Andrade', 'Corte clássico', 'Especialista em social e transições curtas.', '', true, '22222222-0000-4000-8000-000000000001', now(), now()),

  ('33333333-0000-4000-8000-000000000201', 'Yuri Bastos', 'Freestyle e desenho', 'Faz desenho na navalha desde os dezessete anos.', '', true, '22222222-0000-4000-8000-000000000002', now(), now()),
  ('33333333-0000-4000-8000-000000000202', 'Nina Corrêa', 'Coloração e platinado', 'Colorista formada, cuida de toda química da casa.', '', true, '22222222-0000-4000-8000-000000000002', now(), now()),
  ('33333333-0000-4000-8000-000000000203', 'Pedro Ossuna', 'Fade e texturização', 'Corte de referência: você traz a foto, ele adapta.', '', true, '22222222-0000-4000-8000-000000000002', now(), now()),

  ('33333333-0000-4000-8000-000000000301', 'Antônio Bravo', 'Tesoura e navalha', 'Abriu a casa em 1994 e segue atendendo às terças e quintas.', '', true, '22222222-0000-4000-8000-000000000003', now(), now()),
  ('33333333-0000-4000-8000-000000000302', 'Marcelo Bravo', 'Corte tradicional', 'Segunda geração da família, catorze anos de profissão.', '', true, '22222222-0000-4000-8000-000000000003', now(), now()),

  ('33333333-0000-4000-8000-000000000401', 'Diego Nunes', 'Manutenção rápida', 'Entrega corte completo em trinta minutos, sem correria.', '', true, '22222222-0000-4000-8000-000000000004', now(), now()),
  ('33333333-0000-4000-8000-000000000402', 'Vinícius Rocha', 'Fade alto', 'Trabalha degradê alto e desenho na navalha.', '', true, '22222222-0000-4000-8000-000000000004', now(), now()),
  ('33333333-0000-4000-8000-000000000403', 'Sandro Peixoto', 'Low taper', 'Referência da casa em degradê discreto.', '', true, '22222222-0000-4000-8000-000000000004', now(), now()),

  ('33333333-0000-4000-8000-000000000501', 'Jorge Amaral', 'Corte social', 'Trinta anos de ofício, formado na barbearia do pai.', '', true, '22222222-0000-4000-8000-000000000005', now(), now()),
  ('33333333-0000-4000-8000-000000000502', 'Wagner Beltrão', 'Side part e navalha', 'Risco lateral na navalha é a assinatura dele.', '', true, '22222222-0000-4000-8000-000000000005', now(), now()),

  ('33333333-0000-4000-8000-000000000601', 'Eduardo Sampaio', 'Corte executivo', 'Atende antes das oito para quem entra em reunião.', '', true, '22222222-0000-4000-8000-000000000006', now(), now()),
  ('33333333-0000-4000-8000-000000000602', 'Paulo Vasques', 'Camuflagem de brancos', 'Trabalha pigmentação discreta há mais de dez anos.', '', true, '22222222-0000-4000-8000-000000000006', now(), now()),
  ('33333333-0000-4000-8000-000000000603', 'Hugo Menezes', 'Tratamento capilar', 'Tricologista, avalia couro cabeludo antes do corte.', '', true, '22222222-0000-4000-8000-000000000006', now(), now()),

  ('33333333-0000-4000-8000-000000000701', 'Zé Ricardo', 'Corte rápido', 'Atende a vizinhança há dezoito anos, de segunda a sábado.', '', true, '22222222-0000-4000-8000-000000000007', now(), now()),
  ('33333333-0000-4000-8000-000000000702', 'Wesley Faria', 'Corte e barba', 'Faz o combo da casa em quarenta e cinco minutos.', '', true, '22222222-0000-4000-8000-000000000007', now(), now()),

  ('33333333-0000-4000-8000-000000000801', 'Otávio Lima', 'Barboterapia', 'Referência da casa em barba raspada e pele sensível.', '', true, '22222222-0000-4000-8000-000000000008', now(), now()),
  ('33333333-0000-4000-8000-000000000802', 'Bruno Ferro', 'Navalha aberta', 'Formado na escola clássica italiana.', '', true, '22222222-0000-4000-8000-000000000008', now(), now()),
  ('33333333-0000-4000-8000-000000000803', 'Iuri Lima', 'Modelagem de barba', 'Desenha a linha da barba pelo formato do rosto.', '', true, '22222222-0000-4000-8000-000000000008', now(), now()),

  ('33333333-0000-4000-8000-000000000901', 'Gustavo Prado', 'Pompadour e slick back', 'Estuda corte dos anos 50 e reproduz com precisão.', '', true, '22222222-0000-4000-8000-000000000009', now(), now()),
  ('33333333-0000-4000-8000-000000000902', 'Elias Vidal', 'Barba com espuma quente', 'Só usa navalha reta, como aprendeu com o avô.', '', true, '22222222-0000-4000-8000-000000000009', now(), now()),

  ('33333333-0000-4000-8000-000000001001', 'Kaique Serra', 'Coloração', 'Cuida de platinado e coloração global da casa.', '', true, '22222222-0000-4000-8000-000000000010', now(), now()),
  ('33333333-0000-4000-8000-000000001002', 'Tarso Belmiro', 'Undercut e texturização', 'Monta projeto de estilo com acompanhamento mensal.', '', true, '22222222-0000-4000-8000-000000000010', now(), now()),
  ('33333333-0000-4000-8000-000000001003', 'Rafa Quirino', 'Corte e barba', 'Atende o público jovem do bairro há cinco anos.', '', true, '22222222-0000-4000-8000-000000000010', now(), now());

-- ---------------------------------------------------------------------------
-- 5. Horário de funcionamento
--
-- Cada casa tem a própria grade, e isso não é enfeite: é o que faz a tela de
-- agendamento oferecer horários diferentes conforme a barbearia. As jovens
-- abrem tarde e fecham tarde; a econômica abre cedo e trabalha sábado inteiro;
-- a sofisticada abre às sete para pegar quem entra em reunião.
--
-- `fechados` guarda os dias em que a casa não abre — Studio Nove, Ferro & Lima
-- e Meridiano folgam domingo e segunda, o resto só domingo.
-- ---------------------------------------------------------------------------
INSERT INTO "OpeningHour" (id, weekday, "opensAt", "closesAt", closed, "barbershopId")
SELECT
  gen_random_uuid(),
  d.weekday,
  CASE WHEN d.weekday = ANY(h.fechados) THEN NULL
       WHEN d.weekday = 6 THEN h.sab_abre
       ELSE h.abre END,
  CASE WHEN d.weekday = ANY(h.fechados) THEN NULL
       WHEN d.weekday = 6 THEN h.sab_fecha
       ELSE h.fecha END,
  d.weekday = ANY(h.fechados),
  b.id
FROM (VALUES
  ('blackwood-barber',     '09:00', '20:00', '09:00', '18:00', ARRAY[0]),
  ('studio-nove',          '11:00', '21:00', '10:00', '20:00', ARRAY[0, 1]),
  ('casa-bravo',           '08:00', '19:00', '08:00', '14:00', ARRAY[0]),
  ('distrito-norte',       '08:00', '20:00', '08:00', '17:00', ARRAY[0]),
  ('praca-onze',           '09:00', '19:00', '09:00', '15:00', ARRAY[0]),
  ('nobre-barbearia',      '07:00', '20:00', '09:00', '16:00', ARRAY[0]),
  ('corte-certo',          '08:00', '19:00', '08:00', '19:00', ARRAY[0]),
  ('ferro-e-lima',         '10:00', '20:00', '09:00', '18:00', ARRAY[0, 1]),
  ('ambar-barbearia',      '10:00', '20:00', '09:00', '18:00', ARRAY[0]),
  ('meridiano-barber-lab', '10:00', '21:00', '09:00', '19:00', ARRAY[0, 1])
) AS h(slug, abre, fecha, sab_abre, sab_fecha, fechados)
JOIN "Barbershop" b ON b.slug = h.slug
CROSS JOIN generate_series(0, 6) AS d(weekday);

-- ---------------------------------------------------------------------------
-- 6. Escalas próprias e ausências
--
-- Só dois profissionais têm grade própria, e é o suficiente para a regra ficar
-- visível: sem escala, o barbeiro segue a casa. O seu Antônio abriu a Casa
-- Bravo e hoje só atende terça e quinta — está escrito na biografia dele, e
-- agora a agenda concorda com o texto.
-- ---------------------------------------------------------------------------
INSERT INTO "BarberSchedule" (id, weekday, closed, "opensAt", "closesAt", "barberId")
SELECT
  gen_random_uuid(),
  d.weekday,
  d.weekday NOT IN (2, 4),
  CASE WHEN d.weekday IN (2, 4) THEN '08:00' END,
  CASE WHEN d.weekday IN (2, 4) THEN '17:00' END,
  '33333333-0000-4000-8000-000000000301'
FROM generate_series(0, 6) AS d(weekday);

-- Eduardo Sampaio abre a Nobre uma hora antes da casa, de segunda a sexta.
INSERT INTO "BarberSchedule" (id, weekday, closed, "opensAt", "closesAt", "barberId")
SELECT
  gen_random_uuid(),
  d.weekday,
  d.weekday IN (0, 6),
  CASE WHEN d.weekday BETWEEN 1 AND 5 THEN '07:00' END,
  CASE WHEN d.weekday BETWEEN 1 AND 5 THEN '16:00' END,
  '33333333-0000-4000-8000-000000000601'
FROM generate_series(0, 6) AS d(weekday);

-- Uma ausência futura, para a tela de folgas não abrir vazia.
INSERT INTO "BarberTimeOff" (id, "startsAt", "endsAt", reason, "barberId")
VALUES
  (gen_random_uuid(),
   ((now() AT TIME ZONE 'America/Manaus')::date + 9 + time '00:00') AT TIME ZONE 'America/Manaus' AT TIME ZONE 'UTC',
   ((now() AT TIME ZONE 'America/Manaus')::date + 16 + time '23:59') AT TIME ZONE 'America/Manaus' AT TIME ZONE 'UTC',
   'Férias', '33333333-0000-4000-8000-000000000402'),
  (gen_random_uuid(),
   ((now() AT TIME ZONE 'America/Manaus')::date + 3 + time '13:00') AT TIME ZONE 'America/Manaus' AT TIME ZONE 'UTC',
   ((now() AT TIME ZONE 'America/Manaus')::date + 3 + time '18:00') AT TIME ZONE 'America/Manaus' AT TIME ZONE 'UTC',
   'Curso de colorimetria', '33333333-0000-4000-8000-000000000202');

-- ---------------------------------------------------------------------------
-- 7. Clientes de demonstração
--
-- `isDemo` os marca, e é o que permite apagá-los sem tocar em conta de pessoa
-- real. Os e-mails usam `example.com`, domínio reservado pela IANA justamente
-- para documentação — nenhum deles pode existir de verdade nem receber
-- mensagem por engano.
--
-- `image` fica nulo: a interface cai no avatar de iniciais, e nenhuma foto de
-- pessoa real é atribuída a um cliente inventado.
-- ---------------------------------------------------------------------------
INSERT INTO "User" (id, name, email, image, phone, "isDemo", "createdAt", "updatedAt")
VALUES
  ('44444444-0000-4000-8000-000000000001', 'João Mendes',      'joao.mendes@example.com',      NULL, '(11) 98555-1001', true, now() - interval '8 months', now()),
  ('44444444-0000-4000-8000-000000000002', 'Rodrigo Peçanha',  'rodrigo.pecanha@example.com',  NULL, '(11) 98555-1002', true, now() - interval '7 months', now()),
  ('44444444-0000-4000-8000-000000000003', 'André Sicsú',      'andre.sicsu@example.com',      NULL, '(11) 98555-1003', true, now() - interval '7 months', now()),
  ('44444444-0000-4000-8000-000000000004', 'Felipe Tanaka',    'felipe.tanaka@example.com',    NULL, '(11) 98555-1004', true, now() - interval '6 months', now()),
  ('44444444-0000-4000-8000-000000000005', 'Marcos Aurélio',   'marcos.aurelio@example.com',   NULL, '(21) 98555-1005', true, now() - interval '6 months', now()),
  ('44444444-0000-4000-8000-000000000006', 'Bianca Ferraz',    'bianca.ferraz@example.com',    NULL, '(11) 98555-1006', true, now() - interval '5 months', now()),
  ('44444444-0000-4000-8000-000000000007', 'Leandro Quirino',  'leandro.quirino@example.com',  NULL, '(31) 98555-1007', true, now() - interval '5 months', now()),
  ('44444444-0000-4000-8000-000000000008', 'Sérgio Nakamura',  'sergio.nakamura@example.com',  NULL, '(41) 98555-1008', true, now() - interval '4 months', now()),
  ('44444444-0000-4000-8000-000000000009', 'Tiago Bezerra',    'tiago.bezerra@example.com',    NULL, '(81) 98555-1009', true, now() - interval '4 months', now()),
  ('44444444-0000-4000-8000-000000000010', 'Henrique Salles',  'henrique.salles@example.com',  NULL, '(11) 98555-1010', true, now() - interval '3 months', now()),
  ('44444444-0000-4000-8000-000000000011', 'Davi Nascimento',  'davi.nascimento@example.com',  NULL, '(11) 98555-1011', true, now() - interval '3 months', now()),
  ('44444444-0000-4000-8000-000000000012', 'Otávio Peixoto',   'otavio.peixoto@example.com',   NULL, '(21) 98555-1012', true, now() - interval '2 months', now()),
  ('44444444-0000-4000-8000-000000000013', 'Camila Restrepo',  'camila.restrepo@example.com',  NULL, '(11) 98555-1013', true, now() - interval '2 months', now()),
  ('44444444-0000-4000-8000-000000000014', 'Murilo Fontenele', 'murilo.fontenele@example.com', NULL, '(81) 98555-1014', true, now() - interval '1 month',  now()),
  ('44444444-0000-4000-8000-000000000015', 'Ivan Kowalski',    'ivan.kowalski@example.com',    NULL, '(41) 98555-1015', true, now() - interval '1 month',  now()),
  ('44444444-0000-4000-8000-000000000016', 'Ruy Albuquerque',  'ruy.albuquerque@example.com',  NULL, '(31) 98555-1016', true, now() - interval '3 weeks', now());


-- ---------------------------------------------------------------------------
-- 8. Histórico atendido e avaliado
--
-- Cada linha abaixo vira um atendimento concluído e a avaliação que o cliente
-- deixou depois dele. Andam juntos de propósito: o projeto só aceita avaliação
-- de quem foi atendido, uma por atendimento, e inventar nota solta aqui seria
-- gravar no banco um estado que a aplicação nunca produziria.
--
-- A data é dada como **dia da semana + quantas semanas atrás**, e não como "N
-- dias atrás". A diferença importa: com um número fixo de dias, o dia da semana
-- muda conforme a data em que o arquivo roda, e mais cedo ou mais tarde um
-- atendimento cai num domingo em que a casa está fechada. Ancorado no dia da
-- semana, o histórico continua coerente com o expediente para sempre.
--
-- O `id` é derivado de `n` para que a avaliação encontre o agendamento dela sem
-- precisar de subconsulta — e para que rodar este arquivo de novo produza
-- exatamente os mesmos registros.
--
-- As datas são montadas no relógio da barbearia e convertidas para UTC na
-- gravação, porque a coluna é `timestamp` sem fuso. Escrever a hora local
-- direto deixaria todo o histórico quatro horas deslocado, que foi um defeito
-- real deste projeto.
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE demo_historico (
  n          int,
  slug       text,
  cliente    text,
  servico    text,
  "barberId" text,
  dow        int,
  semanas    int,
  hora       text,
  nota       int,
  comentario text
);

INSERT INTO demo_historico VALUES
  -- Blackwood Barber — seg a sáb, 09h às 20h (sábado até 18h)
  (1,  'blackwood-barber', '44444444-0000-4000-8000-000000000001', 'Degradê Navalhado',  '33333333-0000-4000-8000-000000000101', 2, 10, '10:00', 5, 'Melhor fade que já fiz. O acabamento na navalha faz toda diferença, e o horário marcado foi respeitado no minuto.'),
  (2,  'blackwood-barber', '44444444-0000-4000-8000-000000000004', 'Corte + Barba',      '33333333-0000-4000-8000-000000000102', 4,  8, '14:30', 5, 'Saí de lá com a barba desenhada como eu nunca consegui em casa. Toalha quente no fim é outro nível.'),
  (3,  'blackwood-barber', '44444444-0000-4000-8000-000000000010', 'Corte Clássico',     '33333333-0000-4000-8000-000000000103', 6,  6, '16:00', 4, 'Corte muito bom e ambiente agradável. Só achei o preço um pouco acima da média da região.'),
  (4,  'blackwood-barber', '44444444-0000-4000-8000-000000000002', 'Barba Premium',      '33333333-0000-4000-8000-000000000102', 5,  4, '11:30', 5, NULL),
  (5,  'blackwood-barber', '44444444-0000-4000-8000-000000000013', 'Hidratação Capilar', '33333333-0000-4000-8000-000000000101', 3,  3, '09:30', 5, 'Fui pela hidratação e voltei pelo atendimento. Explicaram cada produto que usaram no meu cabelo.'),
  (6,  'blackwood-barber', '44444444-0000-4000-8000-000000000011', 'Degradê Navalhado',  '33333333-0000-4000-8000-000000000101', 1,  2, '18:00', 5, 'Terceira vez que venho e nunca esperei um minuto. É o que eu procurava.'),
  (7,  'blackwood-barber', '44444444-0000-4000-8000-000000000006', 'Corte + Barba',      '33333333-0000-4000-8000-000000000103', 4,  1, '13:00', 4, 'Ótimo corte. Voltaria com certeza.'),

  -- Studio Nove — ter a sáb, 11h às 21h (sábado 10h às 20h)
  (8,  'studio-nove', '44444444-0000-4000-8000-000000000011', 'Fade + Desenho',  '33333333-0000-4000-8000-000000000201', 5, 9, '15:00', 5, 'Levei uma foto e o Yuri entregou igual. O desenho ficou perfeito.'),
  (9,  'studio-nove', '44444444-0000-4000-8000-000000000004', 'Platinado',       '33333333-0000-4000-8000-000000000202', 3, 7, '13:00', 5, 'Platinei pela primeira vez e a Nina explicou todo o processo antes. O cabelo não quebrou nada.'),
  (10, 'studio-nove', '44444444-0000-4000-8000-000000000014', 'Corte Freestyle', '33333333-0000-4000-8000-000000000203', 6, 5, '16:00', 4, 'Corte muito bom, ambiente descontraído. Demorou um pouco mais que o previsto.'),
  (11, 'studio-nove', '44444444-0000-4000-8000-000000000001', 'Corte + Barba',   '33333333-0000-4000-8000-000000000201', 4, 4, '19:00', 5, 'Abre até tarde, o que salva quem sai do trabalho às sete. Corte impecável.'),
  (12, 'studio-nove', '44444444-0000-4000-8000-000000000013', 'Platinado',       '33333333-0000-4000-8000-000000000202', 2, 2, '12:00', 5, NULL),
  (13, 'studio-nove', '44444444-0000-4000-8000-000000000009', 'Fade + Desenho',  '33333333-0000-4000-8000-000000000203', 6, 0, '15:30', 5, 'A playlist é ótima e o corte melhor ainda. Virei cliente.'),

  -- Casa Bravo — seg a sáb, 08h às 19h (sábado até 14h). Seu Antônio: ter e qui
  (14, 'casa-bravo', '44444444-0000-4000-8000-000000000005', 'Corte na Tesoura', '33333333-0000-4000-8000-000000000301', 2, 11, '09:00', 5, 'Meu pai cortava aqui nos anos 90 e eu voltei. Continua o mesmo capricho, na mesma cadeira.'),
  (15, 'casa-bravo', '44444444-0000-4000-8000-000000000003', 'Barba na Navalha', '33333333-0000-4000-8000-000000000302', 5,  8, '10:30', 5, 'Barba na navalha bem feita é raro hoje. Aqui ainda sabem fazer.'),
  (16, 'casa-bravo', '44444444-0000-4000-8000-000000000012', 'Corte + Barba',    '33333333-0000-4000-8000-000000000302', 3,  6, '15:00', 4, 'Atendimento honesto e preço justo. Não é lugar sofisticado, e nem quer ser.'),
  (17, 'casa-bravo', '44444444-0000-4000-8000-000000000007', 'Corte na Tesoura', '33333333-0000-4000-8000-000000000301', 4,  4, '08:30', 5, 'Seu Antônio só atende terça e quinta, então vale marcar com antecedência. Corte na tesoura de escola antiga.'),
  (18, 'casa-bravo', '44444444-0000-4000-8000-000000000015', 'Pezinho',          '33333333-0000-4000-8000-000000000302', 6,  2, '12:00', 4, NULL),
  (19, 'casa-bravo', '44444444-0000-4000-8000-000000000002', 'Corte + Barba',    '33333333-0000-4000-8000-000000000302', 1,  1, '11:00', 5, 'Conversa boa e corte melhor ainda. É barbearia de bairro do jeito que tem que ser.'),

  -- Distrito Norte — seg a sáb, 08h às 20h (sábado até 17h)
  (20, 'distrito-norte', '44444444-0000-4000-8000-000000000010', 'Fade Alto',      '33333333-0000-4000-8000-000000000402', 3, 10, '12:00', 5, 'Entrei no horário marcado e saí em trinta e cinco minutos. É exatamente o que prometem.'),
  (21, 'distrito-norte', '44444444-0000-4000-8000-000000000001', 'Corte Expresso', '33333333-0000-4000-8000-000000000401', 5,  8, '12:30', 5, 'Corto no intervalo do almoço e dá tempo de voltar. Nunca peguei fila.'),
  (22, 'distrito-norte', '44444444-0000-4000-8000-000000000016', 'Low Taper',      '33333333-0000-4000-8000-000000000403', 2,  6, '09:00', 4, 'Bom corte pelo preço. O lugar é simples, mas cumpre o combinado.'),
  (23, 'distrito-norte', '44444444-0000-4000-8000-000000000004', 'Corte + Barba',  '33333333-0000-4000-8000-000000000402', 4,  5, '18:30', 5, NULL),
  (24, 'distrito-norte', '44444444-0000-4000-8000-000000000011', 'Fade Alto',      '33333333-0000-4000-8000-000000000401', 1,  3, '14:00', 5, 'Faço manutenção quinzenal aqui há um ano. Nunca me deixaram esperando.'),
  (25, 'distrito-norte', '44444444-0000-4000-8000-000000000006', 'Acabamento',     '33333333-0000-4000-8000-000000000403', 6,  1, '16:00', 3, 'O acabamento resolveu, mas o barbeiro estava com pressa naquele dia.'),
  (26, 'distrito-norte', '44444444-0000-4000-8000-000000000013', 'Low Taper',      '33333333-0000-4000-8000-000000000402', 5,  0, '10:30', 5, 'Degradê baixo bem feito e sem enrolação. Recomendo.'),

  -- Praça Onze — seg a sáb, 09h às 19h (sábado até 15h)
  (27, 'praca-onze', '44444444-0000-4000-8000-000000000005', 'Corte Social',      '33333333-0000-4000-8000-000000000501', 2, 11, '10:00', 5, 'Barbearia de verdade, com barbeiro de jaleco e espelho de parede a parede. O seu Jorge lembra do meu nome.'),
  (28, 'praca-onze', '44444444-0000-4000-8000-000000000012', 'Side Part',         '33333333-0000-4000-8000-000000000502', 4,  9, '11:30', 5, 'O risco lateral feito na navalha fica marcado por duas semanas. Vale cada centavo.'),
  (29, 'praca-onze', '44444444-0000-4000-8000-000000000003', 'Barba Tradicional', '33333333-0000-4000-8000-000000000501', 6,  7, '13:30', 4, 'Serviço muito bom. Só o espaço que é um pouco apertado nos horários de pico.'),
  (30, 'praca-onze', '44444444-0000-4000-8000-000000000010', 'Corte + Barba',     '33333333-0000-4000-8000-000000000502', 3,  4, '16:30', 5, NULL),
  (31, 'praca-onze', '44444444-0000-4000-8000-000000000009', 'Toalha Quente',     '33333333-0000-4000-8000-000000000501', 5,  2, '13:00', 5, 'Fechei o corte com a toalha quente e foi o melhor trinta reais que gastei no mês.'),
  (32, 'praca-onze', '44444444-0000-4000-8000-000000000002', 'Corte Social',      '33333333-0000-4000-8000-000000000502', 1,  1, '09:30', 5, 'Corte clássico bem executado, do jeito que quase ninguém faz mais.'),

  -- Nobre Barbearia — seg a sáb, 07h às 20h (sábado 09h às 16h)
  (33, 'nobre-barbearia', '44444444-0000-4000-8000-000000000004', 'Corte Executivo',       '33333333-0000-4000-8000-000000000601', 2, 10, '07:30', 5, 'Marco sempre às sete e meia e chego na reunião das nove impecável. Pontualidade absoluta.'),
  (34, 'nobre-barbearia', '44444444-0000-4000-8000-000000000010', 'Camuflagem de Brancos', '33333333-0000-4000-8000-000000000602', 4,  8, '10:00', 5, 'A pigmentação ficou tão natural que ninguém no escritório percebeu. Era exatamente o que eu queria.'),
  (35, 'nobre-barbearia', '44444444-0000-4000-8000-000000000001', 'Corte + Barba',         '33333333-0000-4000-8000-000000000601', 1,  6, '08:00', 4, 'Excelente serviço, ambiente impecável. O preço é alto, mas entregam o que cobram.'),
  (36, 'nobre-barbearia', '44444444-0000-4000-8000-000000000012', 'Tratamento Capilar',    '33333333-0000-4000-8000-000000000603', 3,  4, '15:00', 5, 'O Hugo avaliou meu couro cabeludo antes de qualquer coisa e mudou o produto que eu usava em casa.'),
  (37, 'nobre-barbearia', '44444444-0000-4000-8000-000000000006', 'Barba Alinhada',        '33333333-0000-4000-8000-000000000602', 5,  2, '17:30', 5, NULL),
  (38, 'nobre-barbearia', '44444444-0000-4000-8000-000000000011', 'Corte Executivo',       '33333333-0000-4000-8000-000000000601', 2,  0, '07:00', 5, 'Abre às sete, e para quem trabalha isso resolve a vida.'),

  -- Corte Certo — seg a sáb, 08h às 19h
  (39, 'corte-certo', '44444444-0000-4000-8000-000000000015', 'Corte Simples', '33333333-0000-4000-8000-000000000701', 3, 11, '08:30', 5, 'Vinte e cinco reais num corte bem feito. Não existe isso em outro lugar por aqui.'),
  (40, 'corte-certo', '44444444-0000-4000-8000-000000000007', 'Corte + Barba', '33333333-0000-4000-8000-000000000702', 5,  9, '10:00', 5, 'Combo de quarenta reais e sai pronto. O Wesley é rápido e caprichoso.'),
  (41, 'corte-certo', '44444444-0000-4000-8000-000000000016', 'Corte Simples', '33333333-0000-4000-8000-000000000701', 2,  6, '14:00', 4, 'Preço imbatível. É simples, sem frescura, e o corte fica bom.'),
  (42, 'corte-certo', '44444444-0000-4000-8000-000000000003', 'Barba',         '33333333-0000-4000-8000-000000000702', 4,  5, '16:30', 4, NULL),
  (43, 'corte-certo', '44444444-0000-4000-8000-000000000002', 'Corte Simples', '33333333-0000-4000-8000-000000000701', 6,  3, '09:00', 5, 'Corto aqui toda semana. Nunca me decepcionou e nunca me cobrou a mais.'),
  (44, 'corte-certo', '44444444-0000-4000-8000-000000000014', 'Sobrancelha',   '33333333-0000-4000-8000-000000000702', 1,  2, '11:00', 4, 'Rápido e barato, resolveu bem.'),
  (45, 'corte-certo', '44444444-0000-4000-8000-000000000005', 'Corte + Barba', '33333333-0000-4000-8000-000000000701', 5,  0, '17:00', 5, 'O pezinho entre cortes é de graça, e isso já diz muito sobre a casa.'),

  -- Ferro & Lima — ter a sáb, 10h às 20h (sábado 09h às 18h)
  (46, 'ferro-e-lima', '44444444-0000-4000-8000-000000000007', 'Barboterapia Completa',      '33333333-0000-4000-8000-000000000801', 3, 10, '11:00', 5, 'Barboterapia completa vale muito a pena. Saí com a pele descansada e a barba desenhada.'),
  (47, 'ferro-e-lima', '44444444-0000-4000-8000-000000000016', 'Cuidado com Pelo Encravado', '33333333-0000-4000-8000-000000000801', 5,  8, '14:30', 5, 'Sofria com pelo encravado há anos. Duas sessões e o problema praticamente sumiu.'),
  (48, 'ferro-e-lima', '44444444-0000-4000-8000-000000000005', 'Modelagem de Barba',         '33333333-0000-4000-8000-000000000803', 6,  6, '16:00', 5, 'O Iuri desenhou a linha da barba pelo meu rosto e mudou completamente o visual.'),
  (49, 'ferro-e-lima', '44444444-0000-4000-8000-000000000012', 'Barba na Navalha',           '33333333-0000-4000-8000-000000000802', 2,  4, '12:30', 4, 'Navalha bem feita, ambiente tranquilo. Só demoraram um pouco para me chamar.'),
  (50, 'ferro-e-lima', '44444444-0000-4000-8000-000000000003', 'Corte + Barba',              '33333333-0000-4000-8000-000000000802', 4,  2, '18:00', 5, NULL),
  (51, 'ferro-e-lima', '44444444-0000-4000-8000-000000000010', 'Barboterapia Completa',      '33333333-0000-4000-8000-000000000801', 6,  0, '10:30', 5, 'Se você leva barba a sério, é aqui. Não tem discussão.'),

  -- Âmbar Barbearia — seg a sáb, 10h às 20h (sábado 09h às 18h)
  (52, 'ambar-barbearia', '44444444-0000-4000-8000-000000000008', 'Pompadour',               '33333333-0000-4000-8000-000000000901', 2, 9, '11:00', 5, 'O lugar parece um set de cinema, com poltrona restaurada e rádio tocando. E o pompadour ficou perfeito.'),
  (53, 'ambar-barbearia', '44444444-0000-4000-8000-000000000015', 'Barba com Espuma Quente', '33333333-0000-4000-8000-000000000902', 4, 7, '15:30', 5, 'Espuma quente e navalha reta, como se fazia antigamente. O Elias é um artesão.'),
  (54, 'ambar-barbearia', '44444444-0000-4000-8000-000000000012', 'Slick Back',              '33333333-0000-4000-8000-000000000901', 6, 5, '16:00', 4, 'Corte muito bom e clima ótimo. Só é bom reservar, porque enche.'),
  (55, 'ambar-barbearia', '44444444-0000-4000-8000-000000000002', 'Corte + Barba',           '33333333-0000-4000-8000-000000000902', 3, 3, '13:30', 5, 'Levei quase uma hora e meia lá dentro e não vi o tempo passar.'),
  (56, 'ambar-barbearia', '44444444-0000-4000-8000-000000000009', 'Massagem Facial',         '33333333-0000-4000-8000-000000000901', 5, 1, '19:00', 5, NULL),
  (57, 'ambar-barbearia', '44444444-0000-4000-8000-000000000008', 'Pompadour',               '33333333-0000-4000-8000-000000000902', 1, 0, '10:30', 4, 'Ambiente impecável e corte muito bem executado.'),

  -- Meridiano Barber Lab — ter a sáb, 10h às 21h (sábado 09h às 19h)
  (58, 'meridiano-barber-lab', '44444444-0000-4000-8000-000000000009', 'Coloração Global',   '33333333-0000-4000-8000-000000001001', 3, 9, '11:00', 5, 'Fizeram diagnóstico do fio antes de mexer em qualquer química. A cor saiu exatamente como combinamos.'),
  (59, 'meridiano-barber-lab', '44444444-0000-4000-8000-000000000014', 'Undercut',           '33333333-0000-4000-8000-000000001002', 5, 7, '16:00', 5, 'O Tarso montou um projeto de estilo e a cada mês ajusta. Nunca tinha visto isso numa barbearia.'),
  (60, 'meridiano-barber-lab', '44444444-0000-4000-8000-000000000013', 'Luzes e Mechas',     '33333333-0000-4000-8000-000000001001', 6, 5, '13:00', 4, 'Resultado muito bom, mas leve duas horas livres na agenda porque não é rápido.'),
  (61, 'meridiano-barber-lab', '44444444-0000-4000-8000-000000000004', 'Corte + Barba',      '33333333-0000-4000-8000-000000001003', 4, 3, '19:30', 5, 'Abre até as nove, o que é raro. Corte e barba num serviço só, muito bem feitos.'),
  (62, 'meridiano-barber-lab', '44444444-0000-4000-8000-000000000006', 'Diagnóstico de Fio', '33333333-0000-4000-8000-000000001001', 2, 1, '12:00', 5, NULL),
  (63, 'meridiano-barber-lab', '44444444-0000-4000-8000-000000000011', 'Undercut',           '33333333-0000-4000-8000-000000001002', 6, 0, '17:00', 5, 'Melhor undercut que já fiz. Entenderam o que eu queria na primeira conversa.');

-- `((dow_de_hoje - dow + 6) % 7) + 1` devolve sempre de 1 a 7 dias atrás: nunca
-- hoje, para não existir atendimento "concluído" com hora ainda por vir.
INSERT INTO "Booking"
  (id, "userId", "serviceId", "barberId", date, status, "reminderSentAt", "createdAt", "updatedAt")
SELECT
  '55555555-0000-4000-8000-' || lpad(h.n::text, 12, '0'),
  h.cliente,
  s.id,
  h."barberId",
  ((dia.d + h.hora::time) AT TIME ZONE 'America/Manaus') AT TIME ZONE 'UTC',
  'COMPLETED',
  ((dia.d - 1 + time '18:00') AT TIME ZONE 'America/Manaus') AT TIME ZONE 'UTC',
  ((dia.d - 5 + time '20:00') AT TIME ZONE 'America/Manaus') AT TIME ZONE 'UTC',
  now()
FROM demo_historico h
JOIN "Barbershop" b ON b.slug = h.slug
JOIN "BarbershopService" s ON s."barbershopId" = b.id AND s.name = h.servico
CROSS JOIN LATERAL (
  SELECT (now() AT TIME ZONE 'America/Manaus')::date
         - (((EXTRACT(DOW FROM (now() AT TIME ZONE 'America/Manaus')::date)::int - h.dow + 6) % 7) + 1)
         - h.semanas * 7 AS d
) AS dia;

INSERT INTO "Review" (id, rating, comment, "bookingId", "barbershopId", "userId", "createdAt", "updatedAt")
SELECT
  '66666666-0000-4000-8000-' || lpad(h.n::text, 12, '0'),
  h.nota,
  h.comentario,
  '55555555-0000-4000-8000-' || lpad(h.n::text, 12, '0'),
  b.id,
  h.cliente,
  k.date + interval '20 hours',
  now()
FROM demo_historico h
JOIN "Barbershop" b ON b.slug = h.slug
JOIN "Booking" k ON k.id = '55555555-0000-4000-8000-' || lpad(h.n::text, 12, '0');

-- ---------------------------------------------------------------------------
-- 9. Agenda à frente
--
-- Atendimentos futuros, sem avaliação — ninguém avalia o que ainda não
-- aconteceu. Servem para a agenda do painel e a tela do cliente não abrirem
-- vazias, e para os dois estados que a barbearia escolhe (`CONFIRMED` e
-- `PENDING`) aparecerem lado a lado.
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE demo_futuro (
  n          int,
  slug       text,
  cliente    text,
  servico    text,
  "barberId" text,
  dow        int,
  semanas    int,
  hora       text,
  status     text
);

INSERT INTO demo_futuro VALUES
  (101, 'blackwood-barber',     '44444444-0000-4000-8000-000000000001', 'Degradê Navalhado',     '33333333-0000-4000-8000-000000000101', 3, 0, '10:00', 'CONFIRMED'),
  (102, 'blackwood-barber',     '44444444-0000-4000-8000-000000000006', 'Corte + Barba',         '33333333-0000-4000-8000-000000000102', 3, 0, '15:00', 'CONFIRMED'),
  (103, 'blackwood-barber',     '44444444-0000-4000-8000-000000000013', 'Barba Premium',         '33333333-0000-4000-8000-000000000103', 4, 0, '11:00', 'PENDING'),
  (104, 'studio-nove',          '44444444-0000-4000-8000-000000000011', 'Fade + Desenho',        '33333333-0000-4000-8000-000000000201', 4, 0, '17:00', 'CONFIRMED'),
  (105, 'studio-nove',          '44444444-0000-4000-8000-000000000014', 'Platinado',             '33333333-0000-4000-8000-000000000202', 6, 0, '13:00', 'CONFIRMED'),
  (106, 'casa-bravo',           '44444444-0000-4000-8000-000000000005', 'Corte na Tesoura',      '33333333-0000-4000-8000-000000000302', 2, 0, '09:00', 'CONFIRMED'),
  (107, 'casa-bravo',           '44444444-0000-4000-8000-000000000012', 'Corte + Barba',         '33333333-0000-4000-8000-000000000302', 5, 0, '10:30', 'PENDING'),
  (108, 'distrito-norte',       '44444444-0000-4000-8000-000000000010', 'Fade Alto',             '33333333-0000-4000-8000-000000000401', 2, 0, '12:00', 'CONFIRMED'),
  (109, 'distrito-norte',       '44444444-0000-4000-8000-000000000016', 'Corte Expresso',        '33333333-0000-4000-8000-000000000403', 4, 0, '12:30', 'CONFIRMED'),
  (110, 'praca-onze',           '44444444-0000-4000-8000-000000000002', 'Corte Social',          '33333333-0000-4000-8000-000000000501', 3, 0, '10:00', 'CONFIRMED'),
  (111, 'praca-onze',           '44444444-0000-4000-8000-000000000009', 'Side Part',             '33333333-0000-4000-8000-000000000502', 6, 0, '13:00', 'CONFIRMED'),
  (112, 'nobre-barbearia',      '44444444-0000-4000-8000-000000000004', 'Corte Executivo',       '33333333-0000-4000-8000-000000000601', 2, 0, '07:30', 'CONFIRMED'),
  (113, 'nobre-barbearia',      '44444444-0000-4000-8000-000000000012', 'Corte + Barba',         '33333333-0000-4000-8000-000000000602', 5, 0, '11:00', 'PENDING'),
  (114, 'corte-certo',          '44444444-0000-4000-8000-000000000015', 'Corte Simples',         '33333333-0000-4000-8000-000000000701', 2, 0, '08:30', 'CONFIRMED'),
  (115, 'corte-certo',          '44444444-0000-4000-8000-000000000007', 'Corte + Barba',         '33333333-0000-4000-8000-000000000702', 3, 0, '16:00', 'CONFIRMED'),
  (116, 'ferro-e-lima',         '44444444-0000-4000-8000-000000000016', 'Barboterapia Completa', '33333333-0000-4000-8000-000000000801', 4, 0, '11:00', 'CONFIRMED'),
  (117, 'ambar-barbearia',      '44444444-0000-4000-8000-000000000008', 'Pompadour',             '33333333-0000-4000-8000-000000000901', 3, 0, '11:00', 'CONFIRMED'),
  (118, 'meridiano-barber-lab', '44444444-0000-4000-8000-000000000009', 'Undercut',              '33333333-0000-4000-8000-000000001002', 4, 0, '18:00', 'CONFIRMED');

-- Espelho do cálculo anterior, para frente: sempre de 1 a 7 dias à frente.
INSERT INTO "Booking"
  (id, "userId", "serviceId", "barberId", date, status, "createdAt", "updatedAt")
SELECT
  '55555555-0000-4000-8000-' || lpad(f.n::text, 12, '0'),
  f.cliente,
  s.id,
  f."barberId",
  ((dia.d + f.hora::time) AT TIME ZONE 'America/Manaus') AT TIME ZONE 'UTC',
  f.status::"BookingStatus",
  now() - interval '2 days',
  now()
FROM demo_futuro f
JOIN "Barbershop" b ON b.slug = f.slug
JOIN "BarbershopService" s ON s."barbershopId" = b.id AND s.name = f.servico
CROSS JOIN LATERAL (
  SELECT (now() AT TIME ZONE 'America/Manaus')::date
         + (((f.dow - EXTRACT(DOW FROM (now() AT TIME ZONE 'America/Manaus')::date)::int + 6) % 7) + 1)
         + f.semanas * 7 AS d
) AS dia;

-- ---------------------------------------------------------------------------
-- 10. Nota das casas, recalculada das avaliações
--
-- Do zero, a partir do que está gravado — o mesmo caminho que a aplicação usa
-- quando um cliente avalia. É o que impede a nota exibida de divergir dos
-- comentários logo abaixo dela.
-- ---------------------------------------------------------------------------
UPDATE "Barbershop" b
SET rating = r.media, "reviewCount" = r.total
FROM (
  SELECT "barbershopId",
         ROUND(AVG(rating)::numeric, 1) AS media,
         COUNT(*)::int AS total
  FROM "Review"
  GROUP BY "barbershopId"
) r
WHERE b.id = r."barbershopId";

-- ---------------------------------------------------------------------------
-- 11. Acesso ao painel
--
-- Quem já administra alguma barbearia passa a administrar também as dez de
-- demonstração. Sem isso, metade do produto ficaria invisível numa
-- apresentação: agenda, clientes, relatórios e repasses só existem para quem
-- tem vínculo com a casa, e as casas fictícias não têm dono.
--
-- Não abre acesso a ninguém novo — parte de quem já é gestor hoje.
-- ---------------------------------------------------------------------------
INSERT INTO "BarbershopManager" (id, "userId", "barbershopId", role, "createdAt")
SELECT gen_random_uuid(), m."userId", b.id, 'OWNER', now()
FROM (SELECT DISTINCT "userId" FROM "BarbershopManager") m
CROSS JOIN "Barbershop" b
WHERE b.slug IN (
  'blackwood-barber','studio-nove','casa-bravo','distrito-norte','praca-onze',
  'nobre-barbearia','corte-certo','ferro-e-lima','ambar-barbearia',
  'meridiano-barber-lab'
)
ON CONFLICT ("userId", "barbershopId") DO NOTHING;

-- As tabelas de apoio existiram só para casar cada avaliação com o atendimento
-- dela. Saem explicitamente: `prisma migrate deploy` roda em transação, mas o
-- seed executa o mesmo arquivo fora de uma, e temp table esquecida numa conexão
-- de pool volta a atrapalhar na próxima execução.
DROP TABLE demo_historico;
DROP TABLE demo_futuro;
