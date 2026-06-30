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

  const stats = [
    { label: "Pontos", value: totalPts, cls: "text-fg" },
    { label: "Exatos", value: exatos, cls: "text-good" },
    { label: "Jogos", value: jogados, cls: "text-fg" },
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
        <div className="grid grid-cols-3 gap-2.5 mt-5">
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
                    <span className="truncate text-sm font-medium">
                      {m.home_name ?? "?"}
                    </span>
                    <span className="text-faint text-sm">×</span>
                    <span className="truncate text-sm font-medium">
                      {m.away_name ?? "?"}
                    </span>
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
