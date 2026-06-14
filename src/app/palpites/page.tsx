import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isDbConfigured } from "@/lib/db";
import { getAllMatches, getUserPredictions } from "@/lib/queries";
import SetupNotice from "@/components/SetupNotice";
import PalpitesClient from "./PalpitesClient";

export const dynamic = "force-dynamic";

export default async function PalpitesPage() {
  const user = await getSession().catch(() => null);
  if (!user) redirect("/login");
  if (!isDbConfigured()) return <SetupNotice />;

  const [matches, predsMap] = await Promise.all([
    getAllMatches(),
    getUserPredictions(user.uid),
  ]);

  const initialPreds: Record<number, { home: number; away: number }> = {};
  predsMap.forEach((p, id) => {
    initialPreds[id] = { home: p.pred_home, away: p.pred_away };
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-3xl section-accent">Os meus palpites</h1>
        <p className="text-muted text-sm mt-1">
          Mete o teu resultado em cada jogo. Cada jogo fecha no apito inicial —
          depois disso já não dá para mudar.
        </p>
      </div>
      <PalpitesClient matches={matches} initialPreds={initialPreds} />
    </div>
  );
}
