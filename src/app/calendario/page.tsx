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
  const map = new Map<string, DbMatch[]>();
  for (const m of matches) {
    const k = dayKey(m.kickoff_utc);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(m);
  }
  // ordena os jogos por hora dentro de cada dia
  for (const [, list] of map) {
    list.sort(
      (a, b) =>
        new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime() ||
        a.id - b.id,
    );
  }
  const days = [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));

  return (
    <div className="space-y-5">
      <header className="photo-band group">
        <div
          className="photo photo-wash"
          style={{ "--img": "url(/img/tunnel.jpg)" } as React.CSSProperties}
        />
        <div className="relative z-10 p-5 sm:p-7">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-gold/90">
            48 seleções · 104 jogos
          </p>
          <h1
            className="display mt-1 leading-[1.05]"
            style={{ fontSize: "clamp(1.9rem, 5.4vw, 2.8rem)" }}
          >
            Calendário
          </h1>
          <p className="text-muted text-sm mt-2">
            Todos os jogos do Mundial e os resultados, hora de Portugal.
          </p>
        </div>
      </header>

      {matches.length === 0 ? (
        <div className="card p-6 text-sm text-muted">
          Ainda não há jogos. O administrador precisa de sincronizar o
          calendário.
        </div>
      ) : (
        days.map(([k, list]) => (
          <section key={k} className="space-y-2">
            <h2 className="display text-lg">
              {fmtDayLabel(list[0].kickoff_utc)}
            </h2>
            <div className="space-y-2">
              {list.map((m) => (
                <Link
                  key={m.id}
                  href={`/jogo/${m.id}`}
                  className="block rounded-[1.1rem] lift"
                >
                  <MatchRow m={m} />
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
