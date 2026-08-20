-- Liga a logo de cada barbearia de demonstração.
--
-- Até aqui as dez casas usavam a silhueta de `logoKey` — um símbolo geométrico
-- desenhado em `_components/brand/barbershop-logo.tsx`. Ele existe para a
-- barbearia recém-cadastrada, que ainda não subiu a marca dela; num catálogo de
-- portfólio, dez casas sem marca própria entregam que o catálogo é de mentira.
--
-- As logos são arquivos do próprio projeto, em `public/logos`. Não são marcas
-- de barbearias que existem: pendurar a marca registrada de um negócio real
-- numa casa inventada seria atribuir a identidade de alguém a uma ficção, e
-- num portfólio isso é justamente o que o avaliador reconhece.
--
-- Caminho relativo, e não URL absoluta, de propósito. `BarbershopLogo` renderiza
-- `logoUrl` num `<img>` cru — sem o otimizador do Next —, então o caminho local
-- funciona sem declarar domínio em `next.config`, não depende de serviço de
-- terceiro no ar e continua valendo se o projeto mudar de endereço.
--
-- `logoKey` continua gravado. A silhueta segue sendo o retrato de reserva: se
-- a logo for removida, a casa volta ao símbolo em vez de ficar com um card
-- vazio.

UPDATE "Barbershop" SET "logoUrl" = '/logos/' || slug || '.svg'
WHERE slug IN (
  'blackwood-barber','studio-nove','casa-bravo','distrito-norte','praca-onze',
  'nobre-barbearia','corte-certo','ferro-e-lima','ambar-barbearia',
  'meridiano-barber-lab'
);
