# Backlog de melhorias — Palpites Mundial 2026

Memória do loop de melhoria contínua. O orquestrador lê este ficheiro no início
de cada iteração, escolhe **um** item de "Por fazer", move-o para "Em curso",
delega ao agente indicado e, depois do commit, move-o para "Feito" com a data e
o hash do commit. Pode também acrescentar ideias novas que descubra pelo caminho.

## Por fazer

### Visual / UX (agente: designer)
- [ ] Rever a homepage: hierarquia do herói, chamada para ação mais clara para quem ainda não tem conta
- [ ] Melhorar estados vazios (sem palpites, sem jogos no dia) com ilustração/mensagem simpática
- [ ] Dark mode consistente em todas as páginas (se já existir parcialmente, uniformizar)
- [ ] Feedback visual ao gravar um palpite (toast/confirmação subtil)

### Funcionalidades (agente: feature-dev)
- [ ] Página de estatísticas: distribuição de palpites por jogo, % de acertos por pessoa
- [ ] Destaque "jogos de hoje" na homepage com contagem decrescente para o fecho de palpites
- [ ] Histórico de duelos: comparar dois perfis lado a lado
- [ ] Badge/selo para o líder da semana na classificação

### Testes & robustez (agente: test-writer)
- [ ] Testes para a lógica de fecho de palpites (jogo começado ⇒ palpite bloqueado)
- [ ] Testes de validação zod das API routes (payloads inválidos)

### Performance / A11y / SEO (agente: perf-a11y)
- [ ] Auditar metadata (title/description/OG) por página
- [ ] Rever semântica e ARIA nas tabelas de classificação e formulários de palpites
- [ ] Verificar estratégia de caching/revalidate das páginas dinâmicas
- [ ] `prefers-reduced-motion` nas animações (Reveal, CountUp)

## Em curso

_(vazio)_

## Feito

- [x] 2026-07-16 (pedido direto, feature-dev): 🏆 Surpresa de prémios no fim do torneio — quando a final tem resultado, a classificação revela banner festivo + prémios: 1º ganha jantar pago pelo último, último paga o jantar. Deteção via `tournamentFinished()` (só `stage="Final"` com `status="finished"`; 3º/4º lugar ignorado), 11 testes novos, a11y e reduced-motion tratados. Reviewer: APROVAR sem correções.
- [x] 2026-07-16 (it. 2, designer): Classificação em mobile — truncagem de nomes longos a funcionar de facto (`min-w-0` em falta nos flex items do pódio e da lista), linha de stats em `block truncate`, touch targets ≥44px na lista (`py-3` mobile). Reviewer: APROVAR sem correções.
- [x] 2026-07-16 (it. 1, test-writer): Testes para `tiers.ts` (6) e `format.ts` (21) — total agora 36 testes; script `test` corre os 3 ficheiros; corrigido comentário enganoso do `countdown` em `format.ts`. Reviewer: APROVAR (verificado determinismo em 3 fusos horários).

## Notas entre iterações

- 2026-07-16: o webhook GitHub→Vercel deixou de disparar depois do deploy do commit `6c3da0e` (it. 2). Os commits `89bb11f` (feature dos prémios) e `26286c2` (empty commit de nudge) estão no GitHub mas SEM deployment no Vercel. **Próxima iteração: no passo 7, confirmar que o deployment mais recente já inclui estes commits; se o webhook continuar em baixo, avisar o utilizador para fazer "Redeploy" manual no dashboard do Vercel.**

_(o orquestrador pode deixar aqui contexto útil para a iteração seguinte)_
