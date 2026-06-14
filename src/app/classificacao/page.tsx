import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db";
import { getLeaderboard } from "@/lib/queries";
import SetupNotice from "@/components/SetupNotice";

export const dynamic = "force-dynamic";

const MEDAL = ["🥇", "🥈", "🥉"];

export default async function ClassificacaoPage() {
  const user = await getSession().catch(() => null);
  if (!user) redirect("/login");
  if (!isDbConfigured()) return <SetupNotice />;

  const rows = await getLeaderboard();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-3xl">Classificação</h1>
        <p className="text-muted text-sm mt-1">
          Desempate: mais pontos, depois mais resultados exatos.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="card p-6 text-sm text-muted">
          Ainda ninguém se registou.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs border-b border-line">
                <th className="text-left font-medium py-2 pl-3 w-10">#</th>
                <th className="text-left font-medium py-2">Jogador</th>
                <th className="text-right font-medium py-2 pr-2">Pts</th>
                <th className="text-right font-medium py-2 pr-2 hidden sm:table-cell">
                  Exatos
                </th>
                <th className="text-right font-medium py-2 pr-3 hidden sm:table-cell">
                  Jogos
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const me =
                  r.username.toLowerCase() === user.username.toLowerCase();
                return (
                  <tr
                    key={r.username}
                    className={`border-b border-line/50 ${
                      me ? "bg-brand/10" : ""
                    }`}
                  >
                    <td className="py-2.5 pl-3 display">
                      {MEDAL[i] ?? i + 1}
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
                    <td className="py-2.5 pr-2 text-right display text-lg">
                      {r.points}
                    </td>
                    <td className="py-2.5 pr-2 text-right text-muted hidden sm:table-cell">
                      {r.exactos}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-muted hidden sm:table-cell">
                      {r.jogados}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
