-- Migracao: resultados manuais tem prioridade sobre a sincronizacao automatica.
--
-- Como aplicar:
--   1. Abre o Supabase -> SQL Editor.
--   2. Cola este ficheiro inteiro e clica em "Run".
--
-- Adiciona a coluna "manual_result" a tabela "matches". Jogos com
-- manual_result = true tem o resultado/estado protegido: o sync atualiza os
-- metadados mas nao mexe em home_score, away_score nem status.
--
-- Idempotente: pode ser corrida mais do que uma vez sem erro.

alter table matches
  add column if not exists manual_result boolean not null default false;
