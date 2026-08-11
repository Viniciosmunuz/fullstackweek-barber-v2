-- Documento do cliente, exigido pelo provedor para emitir a cobrança.
--
-- Opcional: só quem escolhe pagar o sinal na hora do agendamento informa. Quem
-- paga na barbearia nunca precisa dar CPF, e é por isso que a coluna não é
-- obrigatória — tornar obrigatória cobraria o dado de toda a base existente
-- por causa de um fluxo que a maioria não usa.

ALTER TABLE "User" ADD COLUMN "cpfCnpj" TEXT;
