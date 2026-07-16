import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db";
import { getLeaderboard, getFinalStageMatches } from "@/lib/queries";
import { tournamentFinished } from "@/lib/tournament";
import { PRIZES } from "@/lib/prizes";
import SetupNotice from "@/components/SetupNotice";
import PrizeBanner from "@/components/PrizeBanner";
import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";
import RankDelta from "@/components/RankDelta";

export const dynamic = "force-dynamic";

export default async function ClassificacaoPage() {
  const user = await getSession().catch(() => null);
  if (!user) redirect("/login");
  if (!isDbConfigured()) return <SetupNotice />;

  const [rows, finalMatches] = await Promise.all([
    getLeaderboard(),
    getFinalStageMatches(),
  ]);
  const top = rows.slice(0, 3);
  const rest = rows.slice(3);
  const isMe = (u: string) => u.toLowerCase() === user.username.toLowerCase();

  // Surpresa de prémios: só quando o Mundial termina E há pelo menos 2 jogadores
  // (com 1 jogador seria campeão e último ao mesmo tempo). Até lá, nada aparece.
  const showPrizes = tournamentFinished(finalMatches) && rows.length >= 2;
  const championName = showPrizes ? rows[0].username : null;
  const loserName = showPrizes ? rows[rows.length - 1].username : null;
  // O último está no pódio (top 3) quando há 3 ou menos jogadores.
  const loserInPodium = showPrizes && rows.length <= 3;
  const isLoser = (u: string) => showPrizes && u === loserName;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-page section-accent">Classificação</h1>
        <p className="text-muted text-sm mt-2">
          Desempate: mais pontos, depois mais resultados exatos.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="card p-7 text-center">
          <p className="display text-lg">Ainda sem classificação</p>
          <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">
            Os pontos aparecem aqui assim que os primeiros jogos com palpites
            terminarem.
          </p>
        </div>
      ) : (
        <>
          {/* Surpresa: bloco festivo no topo quando o Mundial termina */}
          {showPrizes && championName && loserName && (
            <PrizeBanner champion={championName} loser={loserName} />
          )}

          {/* Pódio: os 3 primeiros, com o líder em destaque */}
          <Reveal>
            <div className="podium relative p-4 sm:p-6">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-cover bg-center opacity-[0.14]"
                style={{
                  backgroundImage: "url(/img/balls-orange.jpg)",
                  WebkitMaskImage:
                    "linear-gradient(90deg, transparent, #000 75%)",
                  maskImage: "linear-gradient(90deg, transparent, #000 75%)",
                }}
              />

              {/* Mobile: lista vertical (o pódio de 3 colunas não cabe bem em ecrãs estreitos) */}
              <ul className="relative z-10 sm:hidden space-y-2.5">
                {top.map((r, i) => {
                  const me = isMe(r.username);
                  const lead = i === 0;
                  return (
                    <li
                      key={r.username}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                        lead
                          ? "podium-rank-1 bg-gold/[0.06] py-4"
                          : "border-line bg-card2/40"
                      } ${me ? "ring-1 ring-brand/50" : ""}`}
                    >
                      <span className={`rank-badge rank-${i + 1}`}>{i + 1}</span>
                      <span
                        aria-hidden
                        className={`avatar ${lead ? "h-11 w-11 text-base" : "h-9 w-9 text-sm"}`}
                      >
                        {r.username.charAt(0)}
                      </span>
                      <Link
                        href={`/perfil/${r.username}`}
                        className="min-w-0 flex-1 hover:text-brand transition-colors"
                      >
                        <span
                          className={`flex items-center gap-1.5 min-w-0 ${lead ? "text-lg" : ""}`}
                        >
                          <span className="font-bold truncate min-w-0">
                            {r.username}
                            {me && (
                              <span className="text-xs text-muted font-normal ml-1">
                                (tu)
                              </span>
                            )}
                          </span>
                          <RankDelta username={r.username} rank={i + 1} />
                        </span>
                        <span className="block truncate text-[0.7rem] text-faint">
                          {r.exactos} exatos · {r.jogados} jogos
                        </span>
                      </Link>
                      <div className="shrink-0 text-right leading-none">
                        <div
                          className={`display text-fg ${lead ? "text-3xl" : "text-2xl"}`}
                        >
                          <CountUp value={r.points} />
                        </div>
                        <div className="text-[0.62rem] text-faint mt-1 uppercase tracking-wider">
                          pts
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Desktop/tablet: pódio real de 3 colunas (2.º | 1.º | 3.º) */}
              <div className="relative z-10 hidden sm:grid grid-cols-3 items-end gap-4">
                {top.map((r, i) => {
                  const rank = i + 1;
                  const me = isMe(r.username);
                  const col = rank === 1 ? 2 : rank === 2 ? 1 : 3;
                  const riseDelay = rank === 2 ? 0 : rank === 3 ? 120 : 260;
                  return (
                    <div
                      key={r.username}
                      style={{ gridColumn: col }}
                      className="flex flex-col items-center text-center"
                    >
                      {rank === 1 && (
                        <LaurelWreath className="text-gold mb-1.5" size={34} />
                      )}
                      <Link
                        href={`/perfil/${r.username}`}
                        className="group flex flex-col items-center gap-1.5"
                      >
                        <span
                          aria-hidden
                          className={`avatar ${
                            rank === 1
                              ? "h-16 w-16 text-2xl ring-2 ring-gold/60"
                              : "h-12 w-12 text-lg"
                          } ${me ? "ring-2 ring-brand/60" : ""}`}
                        >
                          {r.username.charAt(0)}
                        </span>
                        <span className="flex items-center gap-1 min-w-0">
                          <span
                            className={`font-bold truncate max-w-[7rem] group-hover:text-brand transition-colors ${
                              rank === 1 ? "text-base" : "text-sm"
                            }`}
                          >
                            {r.username}
                          </span>
                          <RankDelta username={r.username} rank={rank} />
                        </span>
                      </Link>
                      {me && (
                        <span className="text-[0.62rem] text-muted font-medium -mt-1">
                          (tu)
                        </span>
                      )}
                      <div
                        className={`display text-fg mt-1 ${
                          rank === 1 ? "text-3xl" : "text-xl"
                        }`}
                      >
                        <CountUp value={r.points} />
                      </div>
                      <div className="text-[0.6rem] text-faint uppercase tracking-wider mb-2.5">
                        pts
                      </div>
                      <div
                        className={`podium-step podium-rise rank-${rank} w-full rounded-t-xl flex items-start justify-center pt-2.5 ${
                          rank === 1 ? "min-h-44" : rank === 2 ? "min-h-36" : "min-h-32"
                        }`}
                        style={{ animationDelay: `${riseDelay}ms` }}
                      >
                        <span className="display text-2xl">{rank}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Prémios no pódio: campeão sempre; último só se estiver no top 3.
                  Uma só faixa, partilhada por mobile e desktop. */}
              {showPrizes && (
                <div className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-line/50 pt-4">
                  <ChampionPill />
                  {loserInPodium && <LoserPill />}
                </div>
              )}
            </div>
          </Reveal>

          {/* Restantes: lista com divisória subtil */}
          {rest.length > 0 && (
            <div className="card overflow-hidden p-0">
              <div className="grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[2.5rem_1fr_4rem_4rem] gap-3 px-4 py-2.5 text-[0.7rem] uppercase tracking-wider text-faint border-b border-line">
                <span>#</span>
                <span>Jogador</span>
                <span className="text-right hidden sm:block">Exatos</span>
                <span className="text-right">Pts</span>
              </div>
              <ul className="divide-y divide-line/40">
                {rest.map((r, i) => {
                  const me = isMe(r.username);
                  const loser = isLoser(r.username);
                  return (
                    <li
                      key={r.username}
                      className={`grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[2.5rem_1fr_4rem_4rem] gap-3 items-center px-4 py-3 sm:py-2.5 transition-colors ${
                        loser
                          ? "bg-card2/60"
                          : me
                            ? "bg-brand/[0.08]"
                            : "hover:bg-card2/40"
                      }`}
                    >
                      <span className="display text-muted tabular-nums">
                        {i + 4}
                      </span>
                      <span className="flex flex-col gap-1.5 min-w-0">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <Link
                            href={`/perfil/${r.username}`}
                            className="hover:text-brand font-semibold truncate min-w-0 transition-colors"
                          >
                            {r.username}
                            {me && (
                              <span className="text-xs text-muted font-normal ml-1">
                                (tu)
                              </span>
                            )}
                          </Link>
                          <RankDelta username={r.username} rank={i + 4} />
                        </span>
                        {loser && <LoserPill className="self-start" />}
                      </span>
                      <span className="text-right text-muted tabular-nums hidden sm:block">
                        {r.exactos}
                      </span>
                      <span className="text-right display text-lg tabular-nums">
                        {r.points}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Etiquetas curtas de prémio (emoji decorativo com aria-hidden; texto acessível).
function ChampionPill({ className = "" }: { className?: string }) {
  return (
    <span
      className={`chip border-gold/50 bg-gold/10 text-gold whitespace-normal ${className}`}
    >
      <span aria-hidden>{PRIZES.champion.badgeEmoji}</span>
      {PRIZES.champion.badge}
    </span>
  );
}

function LoserPill({ className = "" }: { className?: string }) {
  return (
    <span
      className={`chip border-line2 bg-card2/70 text-muted whitespace-normal ${className}`}
    >
      <span aria-hidden>{PRIZES.loser.badgeEmoji}</span>
      {PRIZES.loser.badge}
    </span>
  );
}

// Coroa de louros desenhada (sem emoji), só para o 1.º lugar do pódio.
function LaurelWreath({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const leaves =
    "M4 24l6-2.6M3.2 18.6l6-1.8M3.4 13l6-1.1M4.8 7.7l5.8.2M8 3.2l5.2 1.9";
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size * 0.62}
      viewBox="0 0 44 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 22C3 12 10 3 20 2" />
      <path d={leaves} />
      <g transform="translate(44,0) scale(-1,1)">
        <path d="M3 22C3 12 10 3 20 2" />
        <path d={leaves} />
      </g>
    </svg>
  );
}
