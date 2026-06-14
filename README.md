# ⚽ Palpites Mundial 2026

Torneio de palpites do Mundial 2026 para jogar com amigos. Cada pessoa faz login,
mete o resultado que prevê para cada jogo e ganha pontos consoante o acerto. Há
calendário, classificação e perfis. **Tudo gratuito** de montar e alojar.

- **Login** por nome + palavra-passe (sem email).
- **Palpites** que fecham automaticamente no apito inicial de cada jogo.
- **Pontuação** detalhada por níveis: 5 (exato), 3 (diferença de golos certa),
  2 (acertar o vencedor/empate), 0 (falhado).
- **Resultados automáticos** via football-data.org + **correção manual** no painel de admin.
- **Classificação** e **perfis** com o histórico de cada um.

Stack: Next.js 16 + React 19 + Tailwind v4 · Supabase (Postgres) · Vercel · GitHub Actions.
Tudo na camada **gratuita**.

---

## 🚀 Pôr o site live (passo-a-passo)

Vais precisar de 4 contas, todas gratuitas e sem cartão: **GitHub**, **Supabase**,
**Vercel** e **football-data.org**. Demora ~20 minutos.

### Passo 1 — Base de dados (Supabase)
1. Cria conta em https://supabase.com e clica **New project**. Dá-lhe um nome e uma
   password de base de dados (guarda-a). Escolhe a região mais perto (ex.: Frankfurt).
2. Quando o projeto estiver pronto, vai a **SQL Editor → New query**, abre o ficheiro
   [`supabase/schema.sql`](supabase/schema.sql) deste projeto, **cola tudo** e clica **Run**.
3. Vai a **Project Settings → API** e copia:
   - **Project URL** → será o `SUPABASE_URL`
   - **service_role** (em "Project API keys", carrega em "Reveal") → será o
     `SUPABASE_SERVICE_ROLE_KEY`. **É secreta — não a partilhes.**

### Passo 2 — Resultados automáticos (football-data.org)
1. Regista-te grátis em https://www.football-data.org/client/register
2. Recebes um **API token** por email → será o `FOOTBALL_DATA_TOKEN`.
   *(Se saltares este passo, o site funciona na mesma; só metes os resultados à mão.)*

### Passo 3 — Pôr o código no GitHub
1. Cria conta em https://github.com e cria um **novo repositório** (recomendo
   **Público** — assim o GitHub Actions é ilimitado e gratuito; não há segredos no código).
2. Envia este projeto para lá. Na pasta do projeto, no terminal:
   ```bash
   git init
   git add .
   git commit -m "Palpites Mundial 2026"
   git branch -M main
   git remote add origin https://github.com/O_TEU_USER/O_TEU_REPO.git
   git push -u origin main
   ```

### Passo 4 — Deploy na Vercel
1. Cria conta em https://vercel.com (entra com o GitHub) e clica **Add New → Project**.
2. **Importa** o repositório que acabaste de criar.
3. Em **Environment Variables**, adiciona (uma a uma):

   | Nome | Valor |
   |------|-------|
   | `SUPABASE_URL` | o Project URL do Passo 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | a chave service_role do Passo 1 |
   | `SESSION_SECRET` | uma string longa aleatória (ver abaixo) |
   | `FOOTBALL_DATA_TOKEN` | o token do Passo 2 (opcional) |
   | `CRON_SECRET` | outra string aleatória |
   | `NEXT_PUBLIC_SITE_NAME` | (opcional) o nome do bolão |

   Para gerar uma string aleatória, corre no terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Clica **Deploy**. No fim ficas com um link tipo `https://o-teu-bolao.vercel.app`.

### Passo 5 — Ligar os resultados automáticos (GitHub Actions)
1. No repositório do GitHub, vai a **Settings → Secrets and variables → Actions → New repository secret** e cria:
   - `SITE_URL` → o link da Vercel (ex.: `https://o-teu-bolao.vercel.app`)
   - `CRON_SECRET` → **exatamente o mesmo valor** que puseste na Vercel
2. Pronto. O ficheiro [`.github/workflows/sync-results.yml`](.github/workflows/sync-results.yml)
   já está incluído e corre a cada 15 minutos. Podes corrê-lo à mão em **Actions →
   Sincronizar resultados → Run workflow**.

### Passo 6 — Arrancar o bolão
1. Abre o link da Vercel e **cria a tua conta**. ⚠️ **O primeiro a registar-se fica
   automaticamente como administrador** — regista-te tu primeiro.
2. Entra no separador **Admin** e clica **Sincronizar agora** para carregar o calendário.
3. **Envia o link aos teus amigos.** Cada um cria a sua conta e começa a palpitar. 🎉

---

## 📋 Variáveis de ambiente
Vê [`.env.example`](.env.example). Para desenvolver localmente, copia-o para `.env.local`.

## 🧮 Como funciona a pontuação
Avaliada do critério mais específico para o menos específico (máximo 5 por jogo):

| Acerto | Pontos |
|--------|:------:|
| Resultado exato (placar certo) | **5** |
| Diferença de golos certa | **3** |
| Acertar o vencedor / empate | **2** |
| Falhado | **0** |

Os palpites referem-se ao resultado dos **90 minutos**. Para mudar os valores, edita
`SCORING` em [`src/lib/scoring.ts`](src/lib/scoring.ts).

## 💻 Desenvolvimento local (opcional)
```bash
npm install
cp .env.example .env.local   # e preenche os valores
npm run dev                  # http://localhost:3000
npm test                     # testes do motor de pontuação
```

## 🧱 Estrutura
- `src/lib/` — lógica (pontuação, sessão, auth, base de dados, sincronização)
- `src/app/` — páginas (login, palpites, calendário, classificação, perfil, admin) e API
- `supabase/schema.sql` — criação das tabelas
- `.github/workflows/` — cron dos resultados

## ⚠️ Notas e limitações
- **GitHub Actions:** em repositórios **públicos** é gratuito e ilimitado. Em privados há
  ~2000 min/mês grátis — se mantiveres privado, sobe o intervalo do cron para `*/30`.
- **Supabase free:** o projeto pode "adormecer" após muita inatividade; reativa-se com 1 clique.
- **football-data.org free:** 10 pedidos/min e resultados com ligeiro atraso (irrelevante,
  porque só usamos o resultado final). Se falhar, mete o resultado à mão no Admin.
- **Sem email:** não há recuperação automática de password. Se um amigo se esquecer, repões
  a password no painel de Admin.
