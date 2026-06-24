import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db";
import { getUserByUsername, getUserHistory } from "@/lib/queries";
import SetupNotice from "@/components/SetupNotice";
import Crest from "@/components/Crest";
import CountUp from "@/components/CountUp";
import { fmtKickoff } from "@/lib/format";
import { scoreTier, SCORING, type ScoreTier } from "@/lib/scoring";
import { TIER_LABEL, TIER_CLASS } from "@/lib/tiers";

export const dynamic = "force-dynamic";

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
      <div className="card p-6 text-sm text-muted">
        Utilizador não encontrado.
      </div>
    );
  }

  const rows = await getUserHistory(target.id);
  const totalPts = rows.reduce((s, r) => s + (r.points ?? 0), 0);
  const exatos = rows.filter((r) => r.points === SCORING.exact).length;
  const jogados = rows.filter((r) => r.points != null).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-card2 border border-line display text-2xl uppercase"
        >
          {target.username.charAt(0)}
        </span>
        <div className="min-w-0">
          <h1 className="display text-3xl truncate">{target.username}</h1>
          <div className="flex gap-4 mt-2 text-sm">
            <span>
              <span className="display text-xl text-fg">
                <CountUp value={totalPts} />
              </span>{" "}
              <span className="text-muted">pontos</span>
            </span>
            <span>
              <span className="display text-xl text-good">
                <CountUp value={exatos} />
              </span>{" "}
              <span className="text-muted">exatos</span>
            </span>
            <span>
              <span className="display text-xl text-fg">
                <CountUp value={jogados} />
              </span>{" "}
              <span className="text-muted">jogos</span>
            </span>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card p-6 text-sm text-muted">
          Ainda sem palpites em jogos começados.
        </div>
      ) : (
        <div className="space-y-2">
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
              <div key={m.id} className="card lift p-3">
                <div className="flex items-center justify-between text-xs text-muted mb-2">
                  <span className="truncate">{m.grp ?? m.stage ?? ""}</span>
                  <span>{fmtKickoff(m.kickoff_utc)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Crest src={m.home_crest} alt={m.home_name ?? ""} size={18} />
                    <span className="truncate text-sm">
                      {m.home_name ?? "?"}
                    </span>
                    <span className="text-muted text-sm">×</span>
                    <span className="truncate text-sm">
                      {m.away_name ?? "?"}
                    </span>
                    <Crest src={m.away_crest} alt={m.away_name ?? ""} size={18} />
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-sm">
                    <span className="text-muted">
                      palpite{" "}
                      <span className="display text-fg">
                        {r.pred_home}×{r.pred_away}
                      </span>
                    </span>
                    {finished ? (
                      <span>
                        real{" "}
                        <span className="display text-fg">
                          {m.home_score}×{m.away_score}
                        </span>
                      </span>
                    ) : (
                      <span className="chip">a aguardar</span>
                    )}
                    {tier && (
                      <span className={`display ${TIER_CLASS[tier]}`}>
                        +{SCORING[tier]}
                        <span className="text-xs ml-1">{TIER_LABEL[tier]}</span>
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
