# UPGRADE VISUAL — Palpites Mundial 2026

> **Para quem é este documento:** um modelo de IA (ou dev) que vai implementar as melhorias
> descritas aqui e fazer o deploy no Vercel. Lê tudo antes de tocar no código.
> O documento tem 3 partes: (A) diagnóstico do estado atual, (B) sistema de design que
> deve reger TODAS as alterações, (C) lista de melhorias por prioridade com instruções
> concretas por ficheiro, e (D) processo de build/deploy.

---

## Regras absolutas (ler primeiro)

1. **O site está LIVE** em https://buedazimportante-mundial.vercel.app com utilizadores reais.
   Push para `main` (repo `miguelferreira19/Buedazimportante_Mundial`) faz auto-deploy no Vercel.
   **Nunca fazer push de build partido** — correr `npm run build` e `npm run test` antes de cada push.
2. **Não tocar na lógica de negócio**: scoring (`src/lib/scoring.ts`), sync
   (`src/lib/sync.ts`, `src/lib/footballdata.ts`), auth (`src/lib/auth.ts`, `session.ts`),
   API routes. As melhorias são visuais/UX; qualquer alteração funcional está listada
   explicitamente na secção C4.
3. **Stack fixa**: Next.js 16 (App Router), React 19, Tailwind CSS 4 (`@theme` em
   `globals.css`), Supabase. **Não adicionar dependências de animação** (nada de GSAP,
   framer-motion) — todo o movimento é CSS puro, como já está. Isto é deliberado.
4. **ATENÇÃO Next.js 16**: o `AGENTS.md` do projeto avisa que esta versão tem breaking
   changes vs. os teus dados de treino. Antes de escrever código Next, lê os guias em
   `node_modules/next/dist/docs/`. `params` é `Promise` nas pages — já está assim no código.
5. Idioma da UI: **português de Portugal**. Sem emojis na UI. Tom informal entre amigos
   ("Faz os teus palpites", "o grupo todo").
6. `prefers-reduced-motion` e `prefers-reduced-transparency` já estão respeitados no
   `globals.css` — qualquer animação nova TEM de ser desligada nesses blocos.

---

## A. Diagnóstico do estado atual

### Arquitetura

- App Router: `/login`, `/palpites` (home efetiva), `/calendario`, `/classificacao`,
  `/jogo/[id]`, `/perfil/[username]`, `/admin`. `/` redireciona.
- Design system centralizado em `src/app/globals.css` (Tailwind 4 `@theme` + componentes
  `.card`, `.btn`, `.chip`, `.tier-pill`, `.rank-badge`, `.photo-band`, `.glass`, etc.).
- Fontes: **Outfit** (corpo) + **Archivo Black** (display) via `next/font`.
- Animações CSS: stagger `riseIn`, `Reveal` (IntersectionObserver), `CountUp`, rail
  infinito de seleções, live-dot pulsante, shimmer skeletons. Tudo com reduced-motion.
- Imagens: 4 JPGs em `public/img` (hero-stadium, pitch-day, tunnel, balls-orange),
  usadas como `background-image` via `.photo`/`.photo-band`.

### O que já está BOM (não estragar)

- Paleta coerente: base escura quente (#0a0a12), um acento laranja (#f5901e), dourado
  reservado ao troféu/1.º lugar. Sombras nunca a preto puro. Grão subtil no body.
- Hierarquia tipográfica fluida (`.h-hero/.h-page/.h-section` com clamp).
- Mobile: bottom-nav própria com safe-area, `100dvh`, inputs `inputMode="numeric"`.
- Estados: skeletons por página (`loading.tsx`), empty states compostos, estado
  "trancado" elegante, feedback "✓ guardado".
- Acessibilidade: focus ring único, `aria-current`, `aria-pressed`, labels nos inputs.

### Fraquezas identificadas (onde o upgrade atua)

| # | Fraqueza | Onde |
|---|----------|------|
| F1 | As imagens são só 4 JPGs genéricos usados como fundo lavado; nenhum momento visual "uau" | todas as páginas |
| F2 | O pódio da classificação é uma lista vertical — não parece um pódio; perde o momento mais emocional do site | `classificacao/page.tsx` |
| F3 | Cartões de jogo (palpites) são todos iguais; o "jogo a seguir" não tem destaque físico | `PalpitesClient.tsx` |
| F4 | Página de jogo é seca: resultado + lista plana de palpites; não há distribuição/consenso | `jogo/[id]/page.tsx` |
| F5 | Perfil sem forma: 3 stats + lista; não conta a história do jogador (streak, forma recente) | `perfil/[username]/page.tsx` |
| F6 | Login hero bom mas estático — falta profundidade/parallax e um segundo momento de leitura | `LoginForm.tsx` |
| F7 | Sem OG image dedicada (usa foto crua), sem favicon rico | `layout.tsx`, `public/` |
| F8 | Sem micro-interações de recompensa: guardar palpite não celebra; subir na tabela não se nota | vários |
| F9 | O `×` dos resultados e países longos partem o alinhamento em mobile estreito | `PalpitesClient.tsx`, `MatchRow.tsx` |
| F10 | Calendário é uma lista longa sem navegação por fase/dia — scroll infinito cansativo | `calendario/page.tsx` |

---

## B. Sistema de Design (fonte de verdade para TODAS as alterações)

### 1. Tema visual e atmosfera

Produto desportivo premium noturno — a sensação de entrar num estádio iluminado à noite.
Base escura quente com UM acento laranja; dourado é sagrado (só troféu/líder).
Densidade equilibrada (4/10), variância assimétrica confiante (7/10), movimento fluido
mas com propósito (6/10): tudo o que mexe comunica estado, nada mexe por mexer.

### 2. Paleta (já existe em `@theme` — NÃO acrescentar cores novas)

- **Ink** `#0a0a12` — fundo da app (nunca preto puro)
- **Card** `#141624` / **Card2** `#1c1f31` — superfícies
- **Line** `#282c42` / **Line2** `#353a57` — hairlines
- **Brand** `#f5901e` (laranja) — ÚNICO acento; CTAs, estados ativos, foco
- **Gold** `#f2c14e` — exclusivo do 1.º lugar e momentos de troféu
- **Good** `#34c97a` / **Red** `#ff5446` / **Cyan** `#16cde0` — semântica de scoring
- Gradiente festivo `--grad-festive` (laranja→dourado) — só em texto de marca e CTA primário

**Banido:** roxo/azul neon em botões, gradientes arco-íris, mais do que um acento por vista,
`#000000`, glows exteriores frios.

### 3. Tipografia

- **Display:** Archivo Black — títulos, números de resultado, pontos. Tracking apertado,
  `tabular-nums` em tudo o que é número.
- **Corpo:** Outfit — leading relaxado, máx ~65ch.
- Hierarquia por peso e cor, não só por tamanho. Usar as classes existentes
  `.h-hero/.h-page/.h-section/.eyebrow` — não inventar clamps inline.
- **Banido:** Inter, serifas, tamanhos novos fora da escala.

### 4. Componentes

- **Botões:** `.btn-primary` (gradiente quente, texto escuro) e `.btn-ghost`. Feedback
  táctil no active (scale 0.97) — já existe, manter.
- **Cartões:** `.card` + `.lift` no hover. Em listas densas preferir divisórias
  (`divide-y divide-line/40`) a cartões aninhados. **Nunca cartão dentro de cartão dentro de cartão.**
- **Loaders:** skeletons `.skeleton` com as dimensões do layout real — nunca spinners.
- **Empty states:** título display + frase que diz como popular os dados (padrão atual).

### 5. Layout

- Contentor `max-w-3xl` central — manter. Mobile-first: tudo colapsa a 1 coluna < 640px.
- Sem overflow horizontal em mobile (falha crítica). Touch targets ≥ 44px.
- Alturas plenas com `min-h-[100dvh]`, nunca `h-screen`.
- Assimetria: heros com conteúdo alinhado à esquerda sobre foto tratada (padrão
  `.photo-band` atual) — não centrar heros de página interior.

### 6. Movimento

- Easing custom (`--ease-out`, `--ease-spring`) — nunca `linear`/`ease` nativos.
- Animar SÓ `transform` e `opacity`. Loops perpétuos apenas em indicadores de estado
  vivo (live-dot, festive-bar, rail).
- Listas entram sempre em cascata (`.stagger` ou `Reveal`), nunca de golpe.
- Toda a animação nova tem de ser neutralizada em `prefers-reduced-motion`.

### 7. Anti-padrões (banido)

Emojis na UI · Inter · preto puro · neon glow · 3 cartões iguais em linha ·
"John Doe"/dados falsos · clichés ("Eleva o teu jogo") · "Scroll para explorar"/setas
a saltar · texto sobreposto a texto · spinners circulares · links Unsplash quebrados
(usar os JPGs locais em `public/img`).

---

## C. Melhorias a implementar (por ordem)

### C1 — Impacto visual alto (fazer primeiro)

**C1.1 Pódio real na classificação** (`src/app/classificacao/page.tsx` + `globals.css`)
Substituir a lista vertical do top-3 por um pódio de 3 colunas (2.º | 1.º | 3.º) em
ecrãs ≥ sm; em mobile mantém lista vertical atual.
- Colunas com alturas diferentes (1.º mais alto), avatar grande no topo, nome, pontos
  em display `CountUp`, base da coluna com o gradiente metálico das classes
  `.rank-1/.rank-2/.rank-3` já existentes.
- O 1.º lugar leva um brilho dourado subtil (`box-shadow` gold já existe em
  `.podium-rank-1`) e uma coroa de louros em SVG inline (desenhar, não emoji).
- Entrada animada: as colunas sobem do chão em cascata (transform translateY, stagger
  2.º → 3.º → 1.º, o líder entra por último para drama). Reduced-motion: sem animação.
- Grid: `grid-cols-3 items-end`, alturas via `min-h` (ex.: 1.º `min-h-44`, 2.º `min-h-36`,
  3.º `min-h-32`).

**C1.2 Destaque físico do "próximo jogo" nos palpites** (`PalpitesClient.tsx`)
O primeiro cartão aberto sem palpite ganha tratamento hero-card:
- Borda `border-brand/50`, fundo com wash radial laranja muito ténue, crests maiores
  (36px), inputs `score-input` maiores (3.6rem), countdown em display.
- Uma única linha de eyebrow "O próximo jogo" por cima. Só UM cartão pode ter este
  tratamento (o mais próximo no tempo).

**C1.3 Celebração ao guardar palpite** (`PalpitesClient.tsx` + `globals.css`)
Quando `state → saved`: o cartão faz um flash de borda verde (`@keyframes` em
border-color + box-shadow verde a desvanecer ~900ms) e o botão mostra um check SVG
desenhado com `stroke-dashoffset` animado (path a desenhar-se, ~350ms). Sem confetti,
sem libs. Reduced-motion: só a cor muda.

**C1.4 Distribuição de palpites na página de jogo** (`jogo/[id]/page.tsx`)
Acima da lista de palpites, adicionar um bloco "Consenso" (server-side, sem JS novo):
- Barra horizontal 3 segmentos: % palpites vitória casa / empate / vitória fora
  (calcular a partir de `preds`). Segmentos com `background` brand / line2 / cyan,
  larguras em `%`, labels por baixo. Animação de crescimento das barras via `Reveal`
  (transição em `transform: scaleX`, origem esquerda).
- Palpite mais comum ("3 pessoas dizem 2×1") como chip.
- Se `finished`: destacar quem acertou exato com um realce dourado ténue na linha
  (`bg-gold/[0.05]` + borda esquerda gold 2px).

**C1.5 Forma recente no perfil** (`perfil/[username]/page.tsx`)
No cartão do jogador, acrescentar uma faixa "Forma" com os últimos 8 jogos pontuados:
quadradinhos 10×10 coloridos por tier (exact=gold, good=green, um-lado=cyan, zero=line)
com tooltip `title="POR 2×1 — +8 pts"`. Acrescentar 4.ª stat: **melhor série de jogos
consecutivos a pontuar** (calcular de `rows`, é tudo server-side).

**C1.6 OG image dedicada** (`public/` + `layout.tsx`)
Gerar uma OG image 1200×630 estática (pode ser feita com `satori`/`next/og` em rota
`opengraph-image.tsx`, ou um PNG desenhado): fundo ink com wash laranja, emblema, título
"Palpites Mundial 2026" em Archivo Black, subtítulo. Substituir as refs a
`/img/hero-stadium.jpg` no metadata. É a primeira impressão no WhatsApp do grupo —
tem de parecer produto.

### C2 — Polimento (fazer a seguir)

**C2.1 Parallax subtil no login** (`LoginForm.tsx`): a foto do estádio move 6–10px
com o scroll (CSS `animation-timeline: scroll()` com fallback sem efeito; NÃO usar JS
de scroll listener). O `glass` do form ganha uma hairline superior com o gradiente
festivo (2px, `::before`).

**C2.2 Navegação por fase no calendário** (`calendario/page.tsx`): barra sticky por
baixo do header com chips-âncora horizontais ("Grupos", "16 avos", "Oitavos", …,
"Final") que fazem scroll para a primeira secção dessa fase (`id` nos `section`,
`scroll-margin-top`). Deriva as fases de `m.stage`. Sem JS: âncoras puras.

**C2.3 Header a encolher** (`Nav.tsx` + CSS): ao fazer scroll, o header passa de 56px
para 48px e a `festive-bar` esconde (usar `animation-timeline: scroll()` de novo, com
fallback estático). Ganho de espaço em mobile.

**C2.4 Tabela de classificação com deltas**: guardar em `localStorage` (client
component pequeno) a última posição vista de cada jogador; na visita seguinte mostrar
▲/▼ SVG minúsculo junto ao nome durante uns segundos. Sem tocar na BD.

**C2.5 Ecrã 404/not-found com marca** (`src/app/not-found.tsx`): não existe — criar
com o padrão empty-card + link para /palpites.

**C2.6 Consistência do "×"**: nos resultados e inputs, substituir o caractere `×` por
um SVG pequeno ou `<span>` com width fixa, garantindo alinhamento vertical igual em
`MatchRow`, `PalpitesClient` e `jogo/[id]`. Testar com nomes longos ("Bósnia e
Herzegovina") a 360px de largura — `truncate` já existe em `TeamName`, verificar que
não há overflow.

### C3 — Micro-detalhe (se sobrar tempo)

- **C3.1** Números de pontos com `font-variant-numeric: tabular-nums` verificados em
  TODOS os sítios (já quase tudo tem).
- **C3.2** `view-transition-name` nos cartões de jogo → página de jogo (Next 16 suporta
  View Transitions; verificar docs locais em `node_modules/next/dist/docs/` primeiro).
- **C3.3** Chip "Hoje" com pulso muito lento (opacidade 0.85→1, 3s) — vida sem ruído.
- **C3.4** No rail de seleções do login, pausar também com `:focus-within` (já pausa em hover).

### C4 — Não-visuais (explicitamente autorizadas)

- **C4.1 PWA melhor**: `manifest.ts` já existe — acrescentar `screenshots` e ícones
  maskable 192/512 gerados do emblema. Testar "Adicionar ao ecrã principal".
- **C4.2 Página `/regras`** (nova, server component): explica scoring com a
  `ScoringLegend` existente + desempates + fecho no apito. Link no footer.
- **C4.3 Metadata por página**: `generateMetadata` em `jogo/[id]` ("POR × ESP — Palpites")
  e `perfil/[username]`. Melhora partilhas no grupo.
- **C4.4 `next/image` para as fotos**: as `.photo` usam `background-image` (sem
  otimização). Manter como está SE a migração complicar o CSS — é aceitável; as imagens
  são 4 e cacheiam bem. Prioridade baixa.

---

## D. Processo de implementação e deploy

### Ordem de trabalho

1. Ler `AGENTS.md` e os docs do Next em `node_modules/next/dist/docs/` (obrigatório).
2. Implementar C1 por ordem (C1.1 → C1.6). Depois C2, C3, C4.
3. Depois de CADA bloco: `npm run build` + `npm run test` (corre `tests/scoring.test.ts`).
   Se o build falhar, corrigir antes de continuar.
4. Verificar visualmente com `npm run dev` (http://localhost:3000) a 360px, 390px,
   768px e 1280px de largura. Testar com `prefers-reduced-motion` ativo.
   Nota: sem BD configurada as páginas mostram `SetupNotice` — o login e os estados
   vazios continuam testáveis; para dados reais são precisas as env vars do Supabase.

### Deploy no Vercel

O projeto já está ligado ao Vercel com auto-deploy:

```bash
git add -A
git commit -m "feat(ui): <descrição curta do bloco>"
git push origin main
```

- O push para `main` dispara o deploy automático. Confirmar no dashboard do Vercel
  (projeto `buedazimportante-mundial`) que o deploy fica **Ready**, e abrir a URL de
  produção para smoke-test (login carrega, palpites carrega, classificação carrega).
- Env vars já configuradas no Vercel (Supabase URL/keys, JWT secret, cron) — **não
  mexer**. Nenhuma melhoria deste documento precisa de env vars novas.
- Fazer commits pequenos, um por bloco (C1.1, C1.2, …), para poder reverter um deploy
  isolado com `git revert` se algo correr mal em produção.

### Critério de aceitação final

- `npm run build` e `npm run test` verdes.
- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95 nas páginas login e palpites.
- Zero overflow horizontal a 360px; touch targets ≥ 44px.
- O pódio, o cartão "próximo jogo" e a celebração de guardado funcionam e respeitam
  reduced-motion.
- OG image nova aparece ao colar o link (testar com um validador de OG).
