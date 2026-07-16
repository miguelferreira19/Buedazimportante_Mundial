# Backlog de melhorias — Palpites Mundial 2026

Memória do loop de melhoria contínua. O orquestrador lê este ficheiro no início
de cada iteração, escolhe **um** item de "Por fazer", move-o para "Em curso",
delega ao agente indicado e, depois do commit, move-o para "Feito" com a data e
o hash do commit. Pode também acrescentar ideias novas que descubra pelo caminho.

## Por fazer

### Visual / UX (agente: designer)
- [ ] Rever a homepage: hierarquia do herói, chamada para ação mais clara para quem ainda não tem conta
- [ ] Melhorar estados vazios (sem palpites, sem jogos no dia) com ilustração/mensagem simpática
- [ ] Polir a página de classificação em mobile (tabela estreita, nomes longos)
- [ ] Dark mode consistente em todas as páginas (se já existir parcialmente, uniformizar)
- [ ] Feedback visual ao gravar um palpite (toast/confirmação subtil)

### Funcionalidades (agente: feature-dev)
- [ ] Página de estatísticas: distribuição de palpites por jogo, % de acertos por pessoa
- [ ] Destaque "jogos de hoje" na homepage com contagem decrescente para o fecho de palpites
- [ ] Histórico de duelos: comparar dois perfis lado a lado
- [ ] Badge/selo para o líder da semana na classificação

### Testes & robustez (agente: test-writer)
- [ ] Testes para `src/lib/tiers.ts` e `src/lib/format.ts`
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

_(vazio)_

## Notas entre iterações

_(o orquestrador pode deixar aqui contexto útil para a iteração seguinte)_
