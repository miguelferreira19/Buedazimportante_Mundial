import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db";
import { getMatchById, getMatchPredictions } from "@/lib/queries";
import SetupNotice from "@/components/SetupNotice";
import MatchRow from "@/components/MatchRow";
import Reveal from "@/components/Reveal";
import TimesX from "@/components/TimesX";
import { hasStarted } from "@/lib/format";
import { scoreTier, resultOf, SCORING } from "@/lib/scoring";
import { TIER_LABEL, TIER_CLASS } from "@/lib/tiers";

export const dynamic = "force-dynamic";

export default async function JogoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession().catch(() => null);
  if (!session) redirect("/login");
  if (!isDbConfigured()) return <SetupNotice />;

  const { id } = await params;
  const matchId = Number(id);
  if (!Number.isInteger(matchId)) notFound();

  const match = await getMatchById(matchId);
  if (!match) notFound();

  // Os palpites ficam visiveis assim que o jogo COMECA (ja estao trancados).
  const started = hasStarted(match.kickoff_utc);
  const finished =
    match.status === "finished" &&
    match.home_score != null &&
    match.away_score != null;
  const preds = started ? await getMatchPredictions(matchId) : [];

  // Consenso: distribuição de resultados (casa/empate/fora) e placar mais comum.
  const total = preds.length;
  const outcomeCounts = { H: 0, D: 0, A: 0 };
  const scoreCounts = new Map<string, number>();
  for (const p of preds) {
    outcomeCounts[resultOf({ home: p.pred_home, away: p.pred_away })] += 1;
    const key = `${p.pred_home}×${p.pred_away}`;
    scoreCounts.set(key, (scoreCounts.get(key) ?? 0) + 1);
  }
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const homePct = pct(outcomeCounts.H);
  const drawPct = pct(outcomeCounts.D);
  const awayPct = pct(outcomeCounts.A);
  let modeScore = "";
  let modeCount = 0;
  for (const [key, count] of scoreCounts) {
    if (count > modeCount) {
      modeScore = key;
      modeCount = count;
    }
  }

  return (
    <div className="space-y-5">
      <Link
        href="/calendario"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg transition-colors"
      >
        <span aria-hidden>←</span> Calendário
      </Link>

      <MatchRow m={match} />

      {total > 0 && (
        <Reveal>
          <div className="card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="display text-base section-accent">Consenso</h2>
              {modeCount > 0 && (
                <span className="chip">
                  {modeCount} {modeCount === 1 ? "pessoa diz" : "pessoas dizem"}{" "}
                  <span className="text-fg font-bold">{modeScore}</span>
                </span>
              )}
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden border border-line bg-ink2">
              <div
                className="consensus-bar-fill bg-brand"
                style={{ width: `${homePct}%` }}
              />
              <div
                className="consensus-bar-fill bg-line2"
                style={{ width: `${drawPct}%` }}
              />
              <div
                className="consensus-bar-fill bg-cyan"
                style={{ width: `${awayPct}%` }}
              />
            </div>
            <div className="grid grid-cols-3 text-[0.68rem] text-faint tabular-nums">
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="h-2 w-2 rounded-full bg-brand shrink-0" />
                Casa {homePct}%
              </span>
              <span className="flex items-center gap-1.5 justify-center">
                <span aria-hidden className="h-2 w-2 rounded-full bg-line2 shrink-0" />
                Empate {drawPct}%
              </span>
              <span className="flex items-center gap-1.5 justify-end text-right">
                <span aria-hidden className="h-2 w-2 rounded-full bg-cyan shrink-0" />
                Fora {awayPct}%
              </span>
            </div>
          </div>
        </Reveal>
      )}

      <h2 className="display text-lg section-accent">Palpites de toda a gente</h2>

      {!started ? (
        <div className="card p-7 text-center">
          <span className="locked mx-auto mb-3">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <p className="display text-base">Palpites fechados até ao apito</p>
          <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">
            Os palpites de toda a gente ficam visíveis quando o jogo começar.
            Assim ninguém é influenciado pelas escolhas dos outros.
          </p>
        </div>
      ) : preds.length === 0 ? (
        <div className="card p-7 text-center">
          <p className="display text-base">Ninguém palpitou este jogo</p>
          <p className="text-sm text-muted mt-1.5">Ficou sem apostas.</p>
        </div>
      ) : (
        <ul className="card divide-y divide-line/40 p-0 overflow-hidden">
          {preds.map((p, i) => {
            const tier = finished
              ? scoreTier(
                  { home: p.pred_home, away: p.pred_away },
                  { home: match.home_score!, away: match.away_score! },
                )
              : null;
            const exact = tier === "exact";
            return (
              <li
                key={p.username}
                className={`flex items-center gap-3 px-4 py-3 ${
                  exact ? "bg-gold/[0.05] border-l-2 border-gold pl-[calc(1rem-2px)]" : ""
                }`}
              >
                <span className="text-xs text-faint tabular-nums w-4 shrink-0">
                  {i + 1}
                </span>
                <span aria-hidden className="avatar h-8 w-8 text-xs">
                  {p.username.charAt(0)}
                </span>
                <Link
                  href={`/perfil/${p.username}`}
                  className="font-semibold hover:text-brand truncate flex-1 transition-colors"
                >
                  {p.username}
                </Link>
                <div className="flex items-center gap-3 shrink-0 text-sm">
                  <span className="display text-fg inline-flex items-center">
                    {p.pred_home}
                    <TimesX className="text-fg" />
                    {p.pred_away}
                  </span>
                  {tier ? (
                    <span className={`tier-pill ${TIER_CLASS[tier]}`}>
                      +{SCORING[tier]}
                      <span className="text-xs font-normal opacity-80 hidden sm:inline">
                        {TIER_LABEL[tier]}
                      </span>
                    </span>
                  ) : (
                    <span className="chip">a decorrer</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
