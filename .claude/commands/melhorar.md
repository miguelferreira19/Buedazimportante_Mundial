---
description: Uma iteração do loop de melhoria contínua — escolhe uma melhoria do backlog, delega ao subagente certo, revê, testa e faz commit+push (deploy automático via Vercel).
---

És o orquestrador do loop de melhoria contínua do site "Palpites Mundial 2026".
Executa **UMA iteração completa** do protocolo abaixo. Não implementes tu próprio
o código — delega nos subagentes; o teu papel é escolher, coordenar, verificar e
fazer commit.

## Protocolo

### 1. Preparar
- Confirma que estás no branch `claude/world-cup-predictions-site-rtw1tl` e que a working tree está limpa (`git status`). Se houver lixo pendente de uma iteração falhada, faz `git checkout -- . && git clean -fd` (nunca toques em ficheiros que não sejam do repo).
- `git pull origin claude/world-cup-predictions-site-rtw1tl` para apanhar alterações remotas.

### 2. Escolher
- Lê `IMPROVEMENTS.md`. Escolhe **um** item de "Por fazer" — varia a área entre iterações (não faças 3 de design seguidas). Move-o para "Em curso".
- Se "Por fazer" estiver a esvaziar (<4 itens), acrescenta ideias novas realistas antes de escolheres.

### 3. Delegar
- Lança o subagente da área (`designer`, `feature-dev`, `test-writer` ou `perf-a11y`) com `run_in_background: false`, passando-lhe o item escolhido como tarefa concreta e específica.

### 4. Rever
- Lança o subagente `reviewer` (também síncrono) sobre o diff pendente.
- Se o veredicto for `REJEITAR`: reverte tudo (`git checkout -- . && git clean -fd`), devolve o item a "Por fazer" com uma nota do motivo em "Notas entre iterações", e termina a iteração aqui (commita só o IMPROVEMENTS.md atualizado).

### 5. Verificar
- Corre `npm test` e `npm run build`. Se algum falhar e a correção não for óbvia, reverte como no passo 4.

### 6. Commit + push
- Atualiza `IMPROVEMENTS.md`: item para "Feito" com data e descrição curta.
- Um único commit com mensagem clara em português (ex.: `melhoria: estados vazios com mensagem simpática`).
- `git push -u origin claude/world-cup-predictions-site-rtw1tl` (com retries se falhar por rede).

### 7. Deploy
- O push despoleta deploy automático no Vercel (projeto `buedazimportante-mundial`, team `team_MVz43usviBM6SiW303lNXyO6`).
- Verifica com as tools do Vercel MCP (`list_deployments` filtrado ao projeto, depois `get_deployment`) que o deployment mais recente deste push fica `READY`. Se der erro de build no Vercel, investiga com `get_deployment_build_logs`, corrige, e volta ao passo 5.

### 8. Relatório
- Termina com um resumo de 2-4 linhas: o que foi melhorado, veredicto do reviewer, estado do deploy (com URL). Se a iteração foi revertida, di-lo claramente e porquê.

## Regras invioláveis
- Nunca faças push para outro branch que não `claude/world-cup-predictions-site-rtw1tl`.
- Nunca commites segredos (.env*), nem mexas em `supabase/schema.sql` aplicado — migrações novas vão para `supabase/migrations/`.
- Uma melhoria pequena por iteração; na dúvida entre grande e pequeno, escolhe o pequeno.
- Se algo estiver fundamentalmente bloqueado (ex.: falta uma credencial), regista em "Notas entre iterações" e não insistas na mesma coisa em loops seguintes.
