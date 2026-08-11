-- Documento do cliente, exigido pelo provedor para emitir a cobrança.
--
-- Opcional: só quem escolhe pagar o sinal no agendamento informa. Quem paga na
-- barbearia nunca precisa, e pedir documento a todo mundo afastaria quem só
-- quer marcar horário.
--
-- Guardado sem máscara, apenas dígitos, para a comparação não depender de
-- formatação.
ALTER TABLE "User" ADD COLUMN "cpfCnpj" TEXT;
