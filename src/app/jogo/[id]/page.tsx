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
      <Link
        href="/calendario"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg transition-colors"
      >
        <span aria-hidden>←</span> Calendário
      </Link>

      <MatchRow m={match} />

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
            return (
              <li
                key={p.username}
                className="flex items-center gap-3 px-4 py-3"
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
                  <span className="display text-fg">
                    {p.pred_home}×{p.pred_away}
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
