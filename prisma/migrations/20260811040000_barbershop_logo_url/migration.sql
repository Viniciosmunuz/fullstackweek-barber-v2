-- Logo real da barbearia, por imagem.
--
-- As silhuetas de `logoKey` continuam existindo e viram o padrão de quem ainda
-- não subiu nada: uma barbearia recém-cadastrada precisa de alguma marca no
-- card antes de ter a dela pronta, e um retângulo vazio no catálogo é pior que
-- um símbolo genérico.
--
-- Nulo, e não string vazia, para o "não tem logo" ser um único estado. Com os
-- dois, metade do código checaria `!== null` e a outra metade `!== ''`.
ALTER TABLE "Barbershop" ADD COLUMN "logoUrl" TEXT;
