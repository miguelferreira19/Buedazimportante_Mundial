import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db";
import { getMatchById, getMatchPredictions } from "@/lib/queries";
import SetupNotice from "@/components/SetupNotice";
import MatchRow from "@/components/MatchRow";
import { hasStarted } from "@/lib/format";
import { scoreTier, SCORING } from "@/lib/scoring";
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

  return (
    <div className="space-y-5">
      <Link href="/calendario" className="text-sm text-muted hover:text-fg">
        ← Voltar ao calendário
      </Link>

      <MatchRow m={match} />

      <h2 className="display text-xl section-accent">Palpites de toda a gente</h2>

      {!started ? (
        <div className="card p-6 text-sm text-muted leading-relaxed">
          🔒 Os palpites de toda a gente ficam visíveis{" "}
          <strong className="text-fg">quando o jogo começar</strong> — assim
          ninguém é influenciado pelas escolhas dos outros.
        </div>
      ) : preds.length === 0 ? (
        <div className="card p-6 text-sm text-muted">
          Ninguém palpitou este jogo.
        </div>
      ) : (
        <div className="card divide-y divide-line/50">
          {preds.map((p) => {
            const tier = finished
              ? scoreTier(
                  { home: p.pred_home, away: p.pred_away },
                  { home: match.home_score!, away: match.away_score! },
                )
              : null;
            return (
              <div
                key={p.username}
                className="flex items-center justify-between gap-2 px-3 py-2.5"
              >
                <Link
                  href={`/perfil/${p.username}`}
                  className="font-semibold hover:text-brand truncate"
                >
                  {p.username}
                </Link>
                <div className="flex items-center gap-3 shrink-0 text-sm">
                  <span className="display text-fg">
                    {p.pred_home}×{p.pred_away}
                  </span>
                  {tier ? (
                    <span className={`display ${TIER_CLASS[tier]}`}>
                      +{SCORING[tier]}
                      <span className="text-xs ml-1 hidden sm:inline">
                        {TIER_LABEL[tier]}
                      </span>
                    </span>
                  ) : (
                    <span className="chip">a decorrer</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
