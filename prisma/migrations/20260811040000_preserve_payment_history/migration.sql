-- Impede que apagar uma reserva destrua o registro do pagamento.
--
-- Com ON DELETE CASCADE, cancelar um agendamento levava junto a linha de
-- Payment. Numa reserva já paga isso apagava o rastro financeiro: dinheiro que
-- entrou, taxa retida e valor repassado sumiam do relatório sem deixar vestígio.
--
-- RESTRICT faz o próprio banco recusar a exclusão enquanto houver cobrança
-- ligada. Onde apagar é legítimo — cobrança que nunca chegou ao provedor — o
-- código remove o pagamento explicitamente antes. Destruir histórico
-- financeiro deixa de ser efeito colateral e passa a exigir intenção.

ALTER TABLE "Payment" DROP CONSTRAINT "Payment_bookingId_fkey";

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
