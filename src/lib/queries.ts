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

// Historico de palpites de um utilizador.
// onlyFinished=true mostra apenas jogos TERMINADOS (para ver palpites de outras
// pessoas sem enviesar). onlyFinished=false mostra jogos que ja comecaram (perfil proprio).
export async function getUserHistory(
  userId: string,
  onlyFinished = false,
): Promise<HistoryRow[]> {
  const db = getDb();
  const { data } = await db
    .from("predictions")
    .select("pred_home, pred_away, points, match:matches(*)")
    .eq("user_id", userId);

  const nowMs = Date.now();
  const rows = ((data ?? []) as unknown as HistoryRow[])
    .filter((r) => {
      if (!r.match) return false;
      return onlyFinished
        ? r.match.status === "finished"
        : new Date(r.match.kickoff_utc).getTime() <= nowMs;
    })
    .sort((a, b) => (a.match.kickoff_utc < b.match.kickoff_utc ? 1 : -1));
  return rows;
}

export async function getMatchById(id: number): Promise<DbMatch | null> {
  const db = getDb();
  const { data } = await db
    .from("matches")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as DbMatch) ?? null;
}

export type MatchVote = {
  username: string;
  pred_home: number;
  pred_away: number;
  points: number | null;
};

// Palpites de TODA a gente para um jogo (usar so depois do jogo terminar).
export async function getMatchPredictions(
  matchId: number,
): Promise<MatchVote[]> {
  const db = getDb();
  const { data } = await db
    .from("predictions")
    .select("pred_home, pred_away, points, user:users(username)")
    .eq("match_id", matchId);

  const rows: MatchVote[] = ((data ?? []) as unknown as {
    pred_home: number;
    pred_away: number;
    points: number | null;
    user: { username: string } | null;
  }[]).map((r) => ({
    username: r.user?.username ?? "?",
    pred_home: r.pred_home,
    pred_away: r.pred_away,
    points: r.points,
  }));

  rows.sort(
    (a, b) =>
      (b.points ?? 0) - (a.points ?? 0) ||
      a.username.localeCompare(b.username, "pt"),
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
