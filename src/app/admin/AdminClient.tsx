"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DbMatch } from "@/lib/types";
import { fmtKickoff } from "@/lib/format";

type AdminUser = { id: string; username: string; is_admin: boolean };

export default function AdminClient({
  matches,
  users,
  fdConfigured,
}: {
  matches: DbMatch[];
  users: AdminUser[];
  fdConfigured: boolean;
}) {
  const router = useRouter();

  // --- Sincronizacao ---
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [recomputing, setRecomputing] = useState(false);
  const [recomputeMsg, setRecomputeMsg] = useState<string | null>(null);

  async function doRecompute() {
    setRecomputing(true);
    setRecomputeMsg(null);
    try {
      const res = await fetch("/api/admin/recompute", { method: "POST" });
      const j = await res.json();
      if (j.ok) {
        setRecomputeMsg(`Pontos recalculados (${j.recomputed} palpites).`);
        router.refresh();
      } else {
        setRecomputeMsg("Erro: " + (j.error || "falha"));
      }
    } catch {
      setRecomputeMsg("Erro de ligação.");
    } finally {
      setRecomputing(false);
    }
  }

  async function doSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const j = await res.json();
      if (j.ok) {
        setSyncMsg(
          `Sincronizado: ${j.result.fetched} jogos, ${j.result.recomputed} palpites repontuados.`,
        );
        router.refresh();
      } else {
        setSyncMsg("Erro: " + (j.error || "falha"));
      }
    } catch {
      setSyncMsg("Erro de ligação.");
    } finally {
      setSyncing(false);
    }
  }

  // --- Resultados manuais ---
  const [scores, setScores] = useState<
    Record<number, { home: string; away: string }>
  >(() => {
    const o: Record<number, { home: string; away: string }> = {};
    for (const m of matches) {
      o[m.id] = {
        home: m.home_score != null ? String(m.home_score) : "",
        away: m.away_score != null ? String(m.away_score) : "",
      };
    }
    return o;
  });
  const [rowMsg, setRowMsg] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return matches.filter((m) => {
      if (onlyMissing && m.status === "finished") return false;
      if (!q) return true;
      return (
        (m.home_name ?? "").toLowerCase().includes(q) ||
        (m.away_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [matches, search, onlyMissing]);

  function setScore(id: number, side: "home" | "away", val: string) {
    const v = val.replace(/[^0-9]/g, "").slice(0, 2);
    setScores((s) => ({ ...s, [id]: { ...s[id], [side]: v } }));
  }

  async function saveResult(id: number, clear = false) {
    setRowMsg((m) => ({ ...m, [id]: "…" }));
    const body = clear
      ? { matchId: id, home: null, away: null }
      : {
          matchId: id,
          home: Number(scores[id]?.home),
          away: Number(scores[id]?.away),
        };
    try {
      const res = await fetch("/api/admin/result", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (j.ok) {
        setRowMsg((m) => ({
          ...m,
          [id]: clear ? "limpo" : `✓ (${j.recomputed} repontuados)`,
        }));
        if (clear) setScores((s) => ({ ...s, [id]: { home: "", away: "" } }));
        router.refresh();
      } else {
        setRowMsg((m) => ({ ...m, [id]: j.error || "erro" }));
      }
    } catch {
      setRowMsg((m) => ({ ...m, [id]: "sem ligação" }));
    }
  }

  // --- Reset de password ---
  const [pw, setPw] = useState<Record<string, string>>({});
  const [pwMsg, setPwMsg] = useState<Record<string, string>>({});

  async function resetPw(userId: string) {
    const newPassword = pw[userId] ?? "";
    setPwMsg((m) => ({ ...m, [userId]: "…" }));
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
      });
      const j = await res.json();
      setPwMsg((m) => ({
        ...m,
        [userId]: j.ok ? "✓ alterada" : j.error || "erro",
      }));
      if (j.ok) setPw((p) => ({ ...p, [userId]: "" }));
    } catch {
      setPwMsg((m) => ({ ...m, [userId]: "sem ligação" }));
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="display text-3xl section-accent">Administração</h1>

      {/* Sincronizacao */}
      <section className="card p-5 space-y-3">
        <h2 className="display text-xl">Resultados automáticos</h2>
        {!fdConfigured && (
          <p className="text-sm text-gold bg-gold/10 border border-gold/30 rounded-lg px-3 py-2">
            Falta a variável <code>FOOTBALL_DATA_TOKEN</code>. Sem ela, a
            sincronização automática não funciona — mas podes sempre inserir os
            resultados à mão em baixo.
          </p>
        )}
        <p className="text-sm text-muted">
          Vai buscar o calendário e os resultados à football-data.org e
          recalcula os pontos. (O GitHub Actions também faz isto sozinho de X em
          X minutos.)
        </p>
        <div className="flex items-center gap-3">
          <button className="btn btn-primary" onClick={doSync} disabled={syncing}>
            {syncing ? "A sincronizar…" : "Sincronizar agora"}
          </button>
          {syncMsg && <span className="text-sm text-muted">{syncMsg}</span>}
        </div>

        <div className="border-t border-line/50 pt-3 mt-1">
          <p className="text-sm text-muted mb-2">
            Mudaste as regras de pontuação? Recalcula os pontos de todos os jogos
            já terminados.
          </p>
          <div className="flex items-center gap-3">
            <button
              className="btn btn-ghost"
              onClick={doRecompute}
              disabled={recomputing}
            >
              {recomputing ? "A recalcular…" : "Recalcular todos os pontos"}
            </button>
            {recomputeMsg && (
              <span className="text-sm text-muted">{recomputeMsg}</span>
            )}
          </div>
        </div>
      </section>

      {/* Resultados manuais */}
      <section className="card p-5 space-y-3">
        <h2 className="display text-xl">Resultados manuais</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="input max-w-xs"
            placeholder="Procurar por seleção…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={(e) => setOnlyMissing(e.target.checked)}
            />
            Esconder jogos já terminados
          </label>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center gap-2 border-b border-line/40 pb-2"
            >
              <div className="text-xs text-muted w-full sm:w-auto sm:flex-1 truncate">
                {fmtKickoff(m.kickoff_utc)} · {m.grp ?? m.stage ?? ""}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm w-24 text-right truncate">
                  {m.home_name ?? "A definir"}
                </span>
                <input
                  className="score-input"
                  inputMode="numeric"
                  value={scores[m.id]?.home ?? ""}
                  onChange={(e) => setScore(m.id, "home", e.target.value)}
                />
                <span className="text-muted">×</span>
                <input
                  className="score-input"
                  inputMode="numeric"
                  value={scores[m.id]?.away ?? ""}
                  onChange={(e) => setScore(m.id, "away", e.target.value)}
                />
                <span className="text-sm w-24 truncate">
                  {m.away_name ?? "A definir"}
                </span>
              </div>
              <button
                className="btn btn-primary text-sm py-1 px-2.5"
                onClick={() => saveResult(m.id)}
              >
                Guardar
              </button>
              <button
                className="btn btn-ghost text-sm py-1 px-2.5"
                onClick={() => saveResult(m.id, true)}
              >
                Limpar
              </button>
              {rowMsg[m.id] && (
                <span className="text-xs text-muted">{rowMsg[m.id]}</span>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted">Nenhum jogo encontrado.</p>
          )}
        </div>
      </section>

      {/* Utilizadores */}
      <section className="card p-5 space-y-3">
        <h2 className="display text-xl">Utilizadores</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center gap-2 border-b border-line/40 pb-2"
            >
              <span className="text-sm flex-1 min-w-[8rem]">
                {u.username}
                {u.is_admin && (
                  <span className="chip ml-2 text-brand border-brand/40">
                    admin
                  </span>
                )}
              </span>
              <input
                className="input max-w-[12rem]"
                type="text"
                placeholder="nova palavra-passe"
                value={pw[u.id] ?? ""}
                onChange={(e) =>
                  setPw((p) => ({ ...p, [u.id]: e.target.value }))
                }
              />
              <button
                className="btn btn-ghost text-sm py-1.5 px-3"
                onClick={() => resetPw(u.id)}
              >
                Repor
              </button>
              {pwMsg[u.id] && (
                <span className="text-xs text-muted">{pwMsg[u.id]}</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
