import "server-only";
import { getDb } from "./db";
import { SCORING } from "./scoring";
import type { DbMatch, DbPrediction, LeaderboardRow } from "./types";

export async function getAllMatches(): Promise<DbMatch[]> {
  const db = getDb();
  const { data } = await db
    .from("matches")
    .select("*")
    .order("kickoff_utc", { ascending: true })
    .order("id", { ascending: true });
  return (data ?? []) as DbMatch[];
}

export async function getUserPredictions(
  userId: string,
): Promise<Map<number, DbPrediction>> {
  const db = getDb();
  const { data } = await db
    .from("predictions")
    .select("*")
    .eq("user_id", userId);
  const m = new Map<number, DbPrediction>();
  for (const p of (data ?? []) as DbPrediction[]) m.set(p.match_id, p);
  return m;
}

export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const db = getDb();
  const [{ data: users }, { data: preds }] = await Promise.all([
    db.from("users").select("id, username"),
    db.from("predictions").select("user_id, points"),
  ]);

  const agg = new Map<
    string,
    { points: number; exactos: number; certos: number; jogados: number }
  >();
  const nameById = new Map<string, string>();
  for (const u of users ?? []) {
    agg.set(u.id, { points: 0, exactos: 0, certos: 0, jogados: 0 });
    nameById.set(u.id, u.username);
  }
  for (const p of preds ?? []) {
    if (p.points == null) continue;
    const a = agg.get(p.user_id);
    if (!a) continue;
    a.jogados += 1;
    a.points += p.points;
    if (p.points > 0) a.certos += 1;
    if (p.points === SCORING.exact) a.exactos += 1;
  }

  const rows: LeaderboardRow[] = (users ?? []).map((u) => ({
    username: nameById.get(u.id) ?? u.username,
    ...agg.get(u.id)!,
  }));
  rows.sort(
    (a, b) =>
      b.points - a.points ||
      b.exactos - a.exactos ||
      a.username.localeCompare(b.username, "pt"),
  );
  return rows;
}

export async function getUserByUsername(
  username: string,
): Promise<{ id: string; username: string } | null> {
  const db = getDb();
  const { data } = await db
    .from("users")
    .select("id, username")
    .ilike("username", username)
    .maybeSingle();
  return data ?? null;
}

export async function countUsers(): Promise<number> {
  const db = getDb();
  const { count } = await db
    .from("users")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

export type HistoryRow = {
  pred_home: number;
  pred_away: number;
  points: number | null;
  match: DbMatch;
};

// Historico de palpites de um utilizador, apenas para jogos que JA comecaram
// (para nao revelar palpites de jogos futuros de outras pessoas).
export async function getUserHistory(userId: string): Promise<HistoryRow[]> {
  const db = getDb();
  const { data } = await db
    .from("predictions")
    .select("pred_home, pred_away, points, match:matches(*)")
    .eq("user_id", userId);

  const nowMs = Date.now();
  const rows = ((data ?? []) as unknown as HistoryRow[])
    .filter(
      (r) => r.match && new Date(r.match.kickoff_utc).getTime() <= nowMs,
    )
    .sort((a, b) =>
      a.match.kickoff_utc < b.match.kickoff_utc ? 1 : -1,
    );
  return rows;
}

export async function getAllUsers(): Promise<
  { id: string; username: string; is_admin: boolean }[]
> {
  const db = getDb();
  const { data } = await db
    .from("users")
    .select("id, username, is_admin")
    .order("username", { ascending: true });
  return data ?? [];
}
