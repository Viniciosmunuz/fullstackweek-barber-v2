-- Marca de que o lembrete da véspera já saiu.
--
-- A varredura diária procura agendamentos de amanhã com esta coluna nula. Sem
-- ela, cada execução reenviaria o mesmo lembrete e o cliente receberia o aviso
-- repetido — jeito rápido de ensinar alguém a ignorar os e-mails do produto.
ALTER TABLE "Booking" ADD COLUMN "reminderSentAt" TIMESTAMP(3);

-- O índice serve exatamente à consulta da varredura: "do dia tal, ainda sem
-- lembrete". Sem ele, a rotina varreria a tabela inteira todo dia.
CREATE INDEX "Booking_date_reminderSentAt_idx"
  ON "Booking"("date", "reminderSentAt");
