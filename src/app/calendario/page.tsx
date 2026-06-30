import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db";
import { getAllMatches } from "@/lib/queries";
import SetupNotice from "@/components/SetupNotice";
import MatchRow from "@/components/MatchRow";
import { dayKey, fmtDayLabel } from "@/lib/format";
import type { DbMatch } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const user = await getSession().catch(() => null);
  if (!user) redirect("/login");
  if (!isDbConfigured()) return <SetupNotice />;

  const matches = await getAllMatches();
  const todayK = dayKey(new Date().toISOString());
  const map = new Map<string, DbMatch[]>();
  for (const m of matches) {
    const k = dayKey(m.kickoff_utc);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(m);
  }
  for (const [, list] of map) {
    list.sort(
      (a, b) =>
        new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime() ||
        a.id - b.id,
    );
  }
  const days = [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));

  return (
    <div className="space-y-6">
      <header className="photo-band group">
        <div
          className="photo photo-wash"
          style={{ "--img": "url(/img/tunnel.jpg)" } as React.CSSProperties}
        />
        <div className="relative z-10 p-5 sm:p-7">
          <p className="eyebrow">48 seleções · 104 jogos</p>
          <h1 className="h-page mt-1.5">Calendário</h1>
          <p className="text-muted text-sm mt-2 max-w-md leading-relaxed">
            Todos os jogos do Mundial e os resultados, na hora de Portugal.
          </p>
        </div>
      </header>

      {matches.length === 0 ? (
        <div className="card p-7 text-center">
          <p className="display text-lg">Calendário por carregar</p>
          <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">
            O administrador precisa de sincronizar os jogos no painel de Admin.
          </p>
        </div>
      ) : (
        days.map(([k, list]) => (
          <section key={k} className="space-y-2.5">
            <div className="sticky top-[58px] z-10 -mx-1 px-1 py-1.5 bg-ink/85 backdrop-blur">
              <h2
                className={`display text-lg flex items-center gap-2 ${
                  k === todayK ? "text-brand" : "text-fg"
                }`}
              >
                {fmtDayLabel(list[0].kickoff_utc)}
                {k === todayK && <span className="chip">Hoje</span>}
              </h2>
            </div>
            <div className="space-y-2.5">
              {list.map((m) => (
                <Link key={m.id} href={`/jogo/${m.id}`} className="block group">
                  <MatchRow m={m} className="lift" />
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
