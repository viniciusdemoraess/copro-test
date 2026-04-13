-- Migration: suporte a múltiplas imagens por notícia
--
-- Estratégia de backward compat:
--   1. image_url é mantido como estava (NOT NULL não muda) — código antigo não quebra
--   2. image_urls é adicionado como nullable com default vazio
--   3. Backfill copia image_url → image_urls nos registros existentes
--   4. Tudo dentro de uma transação: ou tudo funciona, ou nada é aplicado

BEGIN;

-- Adiciona coluna de array de imagens (nullable, sem forçar NOT NULL agora)
ALTER TABLE news
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Backfill: preenche image_urls com image_url para registros existentes que ainda
-- não foram migrados. array_length retorna NULL para arrays vazios no PostgreSQL.
UPDATE news
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL
  AND image_url <> ''
  AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);

COMMIT;
