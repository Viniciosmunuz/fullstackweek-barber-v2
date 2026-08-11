-- Liga a cobrança de sinal na barbearia de teste.
--
-- A carteira é a da conta sandbox que faz o papel de lojista. Não é segredo:
-- Wallet ID é endereço de repasse, serve para receber, não para acessar conta.
--
-- Só esta casa é afetada. As outras cinco continuam recebendo no balcão, que é
-- justamente o que se quer testar — as duas formas convivendo.
--
-- Os percentuais ficam nos padrões: 30% de sinal e 10% de taxa da plataforma.
-- Num serviço de R$ 45 isso dá R$ 13,50 de sinal, dos quais R$ 4,50 ficam com
-- a plataforma e R$ 9,00 vão para a barbearia.
UPDATE "Barbershop"
SET
  "paymentsEnabled" = true,
  "payoutWalletId"  = '518fa669-c46b-4878-a6d9-073467678fc2'
WHERE slug = 'barbearia-modelo';
