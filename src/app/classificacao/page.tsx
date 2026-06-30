import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db";
import { getLeaderboard } from "@/lib/queries";
import SetupNotice from "@/components/SetupNotice";
import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function ClassificacaoPage() {
  const user = await getSession().catch(() => null);
  if (!user) redirect("/login");
  if (!isDbConfigured()) return <SetupNotice />;

  const rows = await getLeaderboard();
  const top = rows.slice(0, 3);
  const rest = rows.slice(3);
  const isMe = (u: string) => u.toLowerCase() === user.username.toLowerCase();

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
          {/* Pódio: os 3 primeiros, com o líder em destaque */}
          <Reveal>
            <div className="podium relative p-4 sm:p-5">
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
              <ul className="relative z-10 space-y-2.5">
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
                          className={`font-bold truncate block ${lead ? "text-lg" : ""}`}
                        >
                          {r.username}
                          {me && (
                            <span className="text-xs text-muted font-normal ml-1">
                              (tu)
                            </span>
                          )}
                        </span>
                        <span className="text-[0.7rem] text-faint">
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
                  return (
                    <li
                      key={r.username}
                      className={`grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[2.5rem_1fr_4rem_4rem] gap-3 items-center px-4 py-2.5 transition-colors ${
                        me ? "bg-brand/[0.08]" : "hover:bg-card2/40"
                      }`}
                    >
                      <span className="display text-muted tabular-nums">
                        {i + 4}
                      </span>
                      <Link
                        href={`/perfil/${r.username}`}
                        className="hover:text-brand font-semibold truncate transition-colors"
                      >
                        {r.username}
                        {me && (
                          <span className="text-xs text-muted font-normal ml-1">
                            (tu)
                          </span>
                        )}
                      </Link>
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
