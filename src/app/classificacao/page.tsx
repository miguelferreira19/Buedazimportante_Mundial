import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db";
import { getLeaderboard } from "@/lib/queries";
import SetupNotice from "@/components/SetupNotice";
import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

const MEDAL = ["🥇", "🥈", "🥉"];

export default async function ClassificacaoPage() {
  const user = await getSession().catch(() => null);
  if (!user) redirect("/login");
  if (!isDbConfigured()) return <SetupNotice />;

  const rows = await getLeaderboard();
  const top = rows.slice(0, 3);
  const rest = rows.slice(3);
  const isMe = (u: string) =>
    u.toLowerCase() === user.username.toLowerCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-3xl section-accent">Classificação</h1>
        <p className="text-muted text-sm mt-1">
          Desempate: mais pontos, depois mais resultados exatos.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="card p-6 text-sm text-muted">
          Ainda ninguém se registou.
        </div>
      ) : (
        <>
          {/* Podio: os 3 primeiros, com acento fotografico (bolas) */}
          <Reveal>
            <div className="podium relative overflow-hidden p-4 sm:p-5">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-cover bg-center opacity-[0.16]"
                style={{
                  backgroundImage: "url(/img/balls-orange.jpg)",
                  WebkitMaskImage:
                    "linear-gradient(90deg, transparent, #000 70%)",
                  maskImage: "linear-gradient(90deg, transparent, #000 70%)",
                }}
              />
              <ul className="relative z-10 space-y-2">
                {top.map((r, i) => {
                  const me = isMe(r.username);
                  return (
                    <li
                      key={r.username}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                        i === 0
                          ? "podium-rank-1 bg-gold/[0.06]"
                          : "border-line bg-card2/40"
                      } ${me ? "ring-1 ring-brand/50" : ""}`}
                    >
                      <span className="podium-medal w-8 shrink-0 text-center">
                        {MEDAL[i]}
                      </span>
                      <span
                        aria-hidden
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card2 border border-line display text-sm uppercase"
                      >
                        {r.username.charAt(0)}
                      </span>
                      <Link
                        href={`/perfil/${r.username}`}
                        className="min-w-0 flex-1 font-semibold hover:text-brand truncate"
                      >
                        {r.username}
                        {me && (
                          <span className="text-xs text-muted ml-1">(tu)</span>
                        )}
                      </Link>
                      <div className="shrink-0 text-right leading-none">
                        <div className="display text-2xl text-fg">
                          <CountUp value={r.points} />
                        </div>
                        <div className="text-[0.65rem] text-muted mt-0.5">
                          {r.exactos} exatos
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>

          {/* Restantes: tabela compacta */}
          {rest.length > 0 && (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted text-xs border-b border-line">
                    <th className="text-left font-medium py-2 pl-4 w-10">#</th>
                    <th className="text-left font-medium py-2">Jogador</th>
                    <th className="text-right font-medium py-2 pr-3">Pts</th>
                    <th className="text-right font-medium py-2 pr-3 hidden sm:table-cell">
                      Exatos
                    </th>
                    <th className="text-right font-medium py-2 pr-4 hidden sm:table-cell">
                      Jogos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((r, i) => {
                    const me = isMe(r.username);
                    return (
                      <tr
                        key={r.username}
                        className={`border-b border-line/50 transition-colors ${
                          me ? "bg-brand/10" : "hover:bg-card2/40"
                        }`}
                      >
                        <td className="py-2.5 pl-4 display text-muted">
                          {i + 4}
                        </td>
                        <td className="py-2.5">
                          <Link
                            href={`/perfil/${r.username}`}
                            className="hover:text-brand font-semibold"
                          >
                            {r.username}
                          </Link>
                          {me && (
                            <span className="text-xs text-muted ml-1">(tu)</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3 text-right display text-lg">
                          {r.points}
                        </td>
                        <td className="py-2.5 pr-3 text-right text-muted tabular-nums hidden sm:table-cell">
                          {r.exactos}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-muted tabular-nums hidden sm:table-cell">
                          {r.jogados}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
