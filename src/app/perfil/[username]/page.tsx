import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db";
import { getUserByUsername, getUserHistory } from "@/lib/queries";
import SetupNotice from "@/components/SetupNotice";
import Crest from "@/components/Crest";
import TeamName from "@/components/TeamName";
import CountUp from "@/components/CountUp";
import { fmtKickoff } from "@/lib/format";
import { scoreTier, SCORING, type ScoreTier } from "@/lib/scoring";
import { TIER_LABEL, TIER_CLASS } from "@/lib/tiers";

export const dynamic = "force-dynamic";

// Cor de fundo de cada tier na faixa "Forma" (mesma semântica de TIER_CLASS).
const TIER_BG: Record<ScoreTier, string> = {
  exact: "bg-good",
  oneTeam: "bg-cyan",
  outcome: "bg-gold",
  miss: "bg-line",
};

export default async function PerfilPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");
  if (!isDbConfigured()) return <SetupNotice />;

  const { username } = await params;
  const target = await getUserByUsername(decodeURIComponent(username));
  if (!target) {
    return (
      <div className="card p-7 text-center">
        <p className="display text-lg">Jogador não encontrado</p>
        <p className="text-sm text-muted mt-1.5">
          Este nome de utilizador não existe.
        </p>
      </div>
    );
  }
  const isSelf = target.username.toLowerCase() === session.username.toLowerCase();

  const rows = await getUserHistory(target.id);
  const totalPts = rows.reduce((s, r) => s + (r.points ?? 0), 0);
  const exatos = rows.filter((r) => r.points === SCORING.exact).length;
  const jogados = rows.filter((r) => r.points != null).length;

  // Jogos pontuados, em ordem cronológica (mais antigo -> mais recente).
  const scored = rows
    .filter((r) => r.points != null)
    .sort((a, b) => (a.match.kickoff_utc < b.match.kickoff_utc ? -1 : 1));

  // Melhor série de jogos consecutivos a somar pontos (>0).
  let bestStreak = 0;
  let streak = 0;
  for (const r of scored) {
    if ((r.points ?? 0) > 0) {
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  }

  // Forma recente: últimos 8 jogos pontuados, mais antigo à esquerda.
  const last8 = scored.slice(-8);

  const stats = [
    { label: "Pontos", value: totalPts, cls: "text-fg" },
    { label: "Exatos", value: exatos, cls: "text-good" },
    { label: "Jogos", value: jogados, cls: "text-fg" },
    { label: "Melhor série", value: bestStreak, cls: "text-fg" },
  ];

  return (
    <div className="space-y-6">
      {/* Cartão de jogador */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span aria-hidden className="avatar h-16 w-16 text-3xl">
            {target.username.charAt(0)}
          </span>
          <div className="min-w-0">
            {isSelf && <p className="eyebrow">O teu perfil</p>}
            <h1 className="h-section truncate">{target.username}</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-line bg-ink2/50 px-3 py-3 text-center"
            >
              <div className={`display text-2xl ${s.cls}`}>
                <CountUp value={s.value} />
              </div>
              <div className="text-[0.66rem] text-faint mt-1 uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {last8.length > 0 && (
          <div className="mt-5 pt-4 border-t border-line/60">
            <p className="text-[0.66rem] text-faint uppercase tracking-wider mb-2">
              Forma · últimos {last8.length}
            </p>
            <div className="flex items-center gap-1.5">
              {last8.map((r) => {
                const m = r.match;
                const tier = scoreTier(
                  { home: r.pred_home, away: r.pred_away },
                  { home: m.home_score!, away: m.away_score! },
                );
                const label = `${m.home_code ?? m.home_name ?? "?"} ${r.pred_home}×${r.pred_away} ${
                  m.away_code ?? m.away_name ?? "?"
                } — +${r.points} pts`;
                return (
                  <span
                    key={m.id}
                    title={label}
                    aria-label={label}
                    className={`h-2.5 w-2.5 rounded-[2px] ${TIER_BG[tier]}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="card p-7 text-center">
          <p className="display text-lg">Sem palpites ainda</p>
          <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">
            Os palpites aparecem aqui quando os jogos começarem.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <h2 className="display text-base text-muted px-1">Histórico</h2>
          {rows.map((r) => {
            const m = r.match;
            const finished = m.status === "finished";
            let tier: ScoreTier | null = null;
            if (finished && m.home_score != null && m.away_score != null) {
              tier = scoreTier(
                { home: r.pred_home, away: r.pred_away },
                { home: m.home_score, away: m.away_score },
              );
            }
            return (
              <div key={m.id} className="card p-3.5">
                <div className="flex items-center justify-between text-xs text-faint mb-2">
                  <span className="truncate uppercase tracking-wide font-medium">
                    {m.grp ?? m.stage ?? ""}
                  </span>
                  <span className="tabular-nums">{fmtKickoff(m.kickoff_utc)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Crest src={m.home_crest} alt={m.home_name ?? ""} size={20} />
                    <TeamName
                      name={m.home_name}
                      code={m.home_code}
                      className="text-sm font-medium"
                    />
                    <span className="text-faint text-sm">×</span>
                    <TeamName
                      name={m.away_name}
                      code={m.away_code}
                      className="text-sm font-medium"
                    />
                    <Crest src={m.away_crest} alt={m.away_name ?? ""} size={20} />
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 text-sm">
                    <span className="text-faint">
                      <span className="display text-fg">
                        {r.pred_home}×{r.pred_away}
                      </span>
                    </span>
                    {finished ? (
                      <span className="text-faint">
                        real{" "}
                        <span className="display text-fg">
                          {m.home_score}×{m.away_score}
                        </span>
                      </span>
                    ) : (
                      <span className="chip">a aguardar</span>
                    )}
                    {tier && (
                      <span className={`tier-pill ${TIER_CLASS[tier]}`}>
                        +{SCORING[tier]}
                        <span className="text-xs font-normal opacity-80 hidden sm:inline">
                          {TIER_LABEL[tier]}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
