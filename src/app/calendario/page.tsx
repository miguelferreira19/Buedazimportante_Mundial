import { redirect } from "next/navigation";
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
  const days = [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-3xl">Calendário</h1>
        <p className="text-muted text-sm mt-1">
          Todos os jogos do Mundial e os resultados.
        </p>
      </div>

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
                <MatchRow key={m.id} m={m} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
