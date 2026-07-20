import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getDb } from "./db";
import { fetchWorldCupMatches, mapFdMatch } from "./footballdata";
import { scorePrediction } from "./scoring";
import { reconcileMatch } from "./manual-result";
import type { MatchStatus } from "./types";

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

type ExistingRow = {
  id: number;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  manual_result?: boolean | null;
};

// Le as linhas existentes tolerando a ausencia da coluna manual_result (caso a
// migracao ainda nao tenha sido aplicada). Se o select com a coluna falhar,
// faz fallback gracioso para o select sem ela (comportamento antigo).
async function loadExisting(
  db: SupabaseClient,
): Promise<{ existing: ExistingRow[]; hasManualColumn: boolean }> {
  const withCol = await db
    .from("matches")
    .select("id, home_score, away_score, status, manual_result");
  if (!withCol.error) {
    return { existing: (withCol.data ?? []) as ExistingRow[], hasManualColumn: true };
  }
  const withoutCol = await db
    .from("matches")
    .select("id, home_score, away_score, status");
  return {
    existing: (withoutCol.data ?? []) as ExistingRow[],
    hasManualColumn: false,
  };
}

// Sincroniza calendario + resultados a partir da football-data.org e
// recalcula apenas os pontos dos jogos cujo resultado/estado mudou.
// Jogos marcados manualmente (manual_result = true) ficam protegidos: o sync
// atualiza os metadados (kickoff, equipas, emblemas, fase...) mas nao mexe no
// resultado/estado nem repontua, ate a API entregar exatamente o mesmo resultado.
export async function syncFromFootballData(): Promise<SyncResult> {
  const db = getDb();
  const fd = await fetchWorldCupMatches();
  const rows = fd.map(mapFdMatch);

  const { existing, hasManualColumn } = await loadExisting(db);
  const prev = new Map<number, ExistingRow>();
  for (const e of existing) prev.set(e.id, e);

  const now = new Date().toISOString();

  const planned = rows.map((r) => {
    const before = prev.get(r.id);
    const rec = reconcileMatch(before, r);
    const row: Record<string, unknown> = {
      ...r,
      home_score: rec.home_score,
      away_score: rec.away_score,
      status: rec.status,
      updated_at: now,
    };
    // So enviamos manual_result se a coluna existir (senao o upsert rebentava).
    if (hasManualColumn) row.manual_result = rec.manual_result;
    return { row, rec, before };
  });

  const { error } = await db
    .from("matches")
    .upsert(planned.map((p) => p.row), { onConflict: "id" });
  if (error) throw new Error("Falha ao gravar jogos: " + error.message);

  let recomputed = 0;
  for (const { row, rec, before } of planned) {
    if (!rec.changed) continue; // jogos protegidos/reconciliados nunca mudam
    const id = row.id as number;
    if (
      rec.status === "finished" &&
      rec.home_score != null &&
      rec.away_score != null
    ) {
      recomputed += await recomputeMatch(id, rec.home_score, rec.away_score);
    } else if (before && before.status === "finished") {
      await clearMatchPoints(id);
    }
  }

  return { fetched: fd.length, upserted: rows.length, recomputed };
}

// Resultado inserido/corrigido a mao pelo admin. home/away a null => apaga o
// resultado e devolve o jogo ao controlo do sync (manual_result = false).
export async function setManualResult(
  matchId: number,
  home: number | null,
  away: number | null,
): Promise<number> {
  const db = getDb();
  const finished = home != null && away != null;
  const base = {
    home_score: finished ? home : null,
    away_score: finished ? away : null,
    status: finished ? "finished" : "scheduled",
    updated_at: new Date().toISOString(),
  };

  // Marca (ou desmarca) o jogo como manual. Se a coluna ainda nao existir na BD
  // (migracao por aplicar), faz fallback gracioso para o update sem a flag.
  const { error } = await db
    .from("matches")
    .update({ ...base, manual_result: finished })
    .eq("id", matchId);
  if (error) {
    await db.from("matches").update(base).eq("id", matchId);
  }

  if (finished) return await recomputeMatch(matchId, home as number, away as number);
  await clearMatchPoints(matchId);
  return 0;
}
