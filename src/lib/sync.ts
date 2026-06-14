import "server-only";
import { getDb } from "./db";
import { fetchWorldCupMatches, mapFdMatch } from "./footballdata";
import { scorePrediction } from "./scoring";

// Recalcula os pontos de todos os palpites de um jogo terminado.
export async function recomputeMatch(
  matchId: number,
  home: number,
  away: number,
): Promise<number> {
  const db = getDb();
  const { data: preds } = await db
    .from("predictions")
    .select("id, pred_home, pred_away")
    .eq("match_id", matchId);
  let n = 0;
  for (const p of preds ?? []) {
    const pts = scorePrediction(
      { home: p.pred_home, away: p.pred_away },
      { home, away },
    );
    await db.from("predictions").update({ points: pts }).eq("id", p.id);
    n++;
  }
  return n;
}

// Limpa os pontos (volta a null) — usado quando um jogo deixa de estar terminado.
export async function clearMatchPoints(matchId: number): Promise<void> {
  const db = getDb();
  await db
    .from("predictions")
    .update({ points: null })
    .eq("match_id", matchId)
    .not("points", "is", null);
}

// Recalcula os pontos de TODOS os jogos ja terminados (util depois de mudar as
// regras de pontuacao). Devolve quantos palpites foram repontuados.
export async function recomputeAllFinished(): Promise<number> {
  const db = getDb();
  const { data: matches } = await db
    .from("matches")
    .select("id, home_score, away_score, status")
    .eq("status", "finished");
  let n = 0;
  for (const m of matches ?? []) {
    if (m.home_score != null && m.away_score != null) {
      n += await recomputeMatch(m.id, m.home_score, m.away_score);
    }
  }
  return n;
}

export type SyncResult = {
  fetched: number;
  upserted: number;
  recomputed: number;
};

// Sincroniza calendario + resultados a partir da football-data.org e
// recalcula apenas os pontos dos jogos cujo resultado/estado mudou.
export async function syncFromFootballData(): Promise<SyncResult> {
  const db = getDb();
  const fd = await fetchWorldCupMatches();
  const rows = fd.map(mapFdMatch);

  const { data: existing } = await db
    .from("matches")
    .select("id, home_score, away_score, status");
  const prev = new Map<
    number,
    { home_score: number | null; away_score: number | null; status: string }
  >();
  for (const e of existing ?? []) prev.set(e.id, e);

  const now = new Date().toISOString();
  const { error } = await db
    .from("matches")
    .upsert(
      rows.map((r) => ({ ...r, updated_at: now })),
      { onConflict: "id" },
    );
  if (error) throw new Error("Falha ao gravar jogos: " + error.message);

  let recomputed = 0;
  for (const r of rows) {
    const before = prev.get(r.id);
    const changed =
      !before ||
      before.home_score !== r.home_score ||
      before.away_score !== r.away_score ||
      before.status !== r.status;
    if (!changed) continue;

    if (r.status === "finished" && r.home_score != null && r.away_score != null) {
      recomputed += await recomputeMatch(r.id, r.home_score, r.away_score);
    } else if (before && before.status === "finished") {
      await clearMatchPoints(r.id);
    }
  }

  return { fetched: fd.length, upserted: rows.length, recomputed };
}

// Resultado inserido/corrigido a mao pelo admin. home/away a null => apaga o resultado.
export async function setManualResult(
  matchId: number,
  home: number | null,
  away: number | null,
): Promise<number> {
  const db = getDb();
  const finished = home != null && away != null;
  await db
    .from("matches")
    .update({
      home_score: finished ? home : null,
      away_score: finished ? away : null,
      status: finished ? "finished" : "scheduled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (finished) return await recomputeMatch(matchId, home as number, away as number);
  await clearMatchPoints(matchId);
  return 0;
}
