"use client";

import { useEffect, useMemo, useState } from "react";
import type { DbMatch } from "@/lib/types";
import { dayKey, fmtDayLabel, fmtTime, countdown, hasStarted } from "@/lib/format";
import Link from "next/link";
import { scoreTier, SCORING, type ScoreTier } from "@/lib/scoring";
import { TIER_LABEL, TIER_CLASS } from "@/lib/tiers";
import Crest from "@/components/Crest";

type PredInput = { home: string; away: string };
type SaveState = "idle" | "saving" | "saved" | "error";

export default function PalpitesClient({
  matches,
  initialPreds,
}: {
  matches: DbMatch[];
  initialPreds: Record<number, { home: number; away: number }>;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const toInput = (): Record<number, PredInput> => {
    const o: Record<number, PredInput> = {};
    for (const [k, v] of Object.entries(initialPreds)) {
      o[Number(k)] = { home: String(v.home), away: String(v.away) };
    }
    return o;
  };

  const [preds, setPreds] = useState<Record<number, PredInput>>(toInput);
  const [saved, setSaved] = useState<Record<number, PredInput>>(toInput);
  const [state, setState] = useState<Record<number, SaveState>>({});
  const [errs, setErrs] = useState<Record<number, string>>({});
  const [showPast, setShowPast] = useState(false);

  const todayKey = dayKey(new Date(now).toISOString());

  const days = useMemo(() => {
    const map = new Map<string, DbMatch[]>();
    for (const m of matches) {
      const k = dayKey(m.kickoff_utc);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    }
    const arr = [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
    for (const [, list] of arr) {
      list.sort(
        (a, b) =>
          new Date(a.kickoff_utc).getTime() -
            new Date(b.kickoff_utc).getTime() || a.id - b.id,
      );
    }
    return arr;
  }, [matches]);

  const visibleDays = days.filter(([k]) => showPast || k >= todayKey);

  // Proximo jogo a comecar (para o cabecalho).
  const nextMatch = useMemo(() => {
    const up = matches
      .filter((m) => new Date(m.kickoff_utc).getTime() > now)
      .sort(
        (a, b) =>
          new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime(),
      );
    return up[0] ?? null;
  }, [matches, now]);

  function setField(id: number, side: "home" | "away", val: string) {
    const v = val.replace(/[^0-9]/g, "").slice(0, 2);
    setPreds((p) => ({
      ...p,
      [id]: { ...(p[id] ?? { home: "", away: "" }), [side]: v },
    }));
    setState((s) => ({ ...s, [id]: "idle" }));
  }

  function isDirty(id: number) {
    const p = preds[id];
    if (!p || (p.home === "" && p.away === "")) return false;
    const s = saved[id];
    if (!s) return true;
    return p.home !== s.home || p.away !== s.away;
  }

  async function save(id: number) {
    const p = preds[id];
    if (!p || p.home === "" || p.away === "") {
      setErrs((e) => ({ ...e, [id]: "Preenche os dois resultados." }));
      setState((s) => ({ ...s, [id]: "error" }));
      return;
    }
    setState((s) => ({ ...s, [id]: "saving" }));
    setErrs((e) => ({ ...e, [id]: "" }));
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          matchId: id,
          home: Number(p.home),
          away: Number(p.away),
        }),
      });
      const j = await res.json();
      if (j.ok) {
        setSaved((sv) => ({ ...sv, [id]: { home: p.home, away: p.away } }));
        setState((s) => ({ ...s, [id]: "saved" }));
      } else {
        setErrs((e) => ({ ...e, [id]: j.error || "Erro ao guardar." }));
        setState((s) => ({ ...s, [id]: "error" }));
      }
    } catch {
      setErrs((e) => ({ ...e, [id]: "Sem ligação ao servidor." }));
      setState((s) => ({ ...s, [id]: "error" }));
    }
  }

  if (matches.length === 0) {
    return (
      <div className="card p-6 text-sm text-muted">
        Ainda não há jogos carregados. O administrador precisa de sincronizar o
        calendário no painel de Admin.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecalho fotografico: relvado lotado + proximo jogo */}
      <header className="photo-band group">
        <div
          className="photo photo-wash"
          style={{ "--img": "url(/img/pitch-day.jpg)" } as React.CSSProperties}
        />
        <div className="relative z-10 p-5 sm:p-7">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-gold/90">
            Mundial 2026
          </p>
          <h1
            className="display mt-1 leading-[1.05]"
            style={{ fontSize: "clamp(1.9rem, 5.4vw, 2.8rem)" }}
          >
            Os teus palpites
          </h1>
          {nextMatch && (
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="chip border-brand/40 text-brand">
                <span className="live-dot" /> a seguir
              </span>
              <span className="flex items-center gap-2 font-semibold">
                <Crest src={nextMatch.home_crest} alt="" size={18} />
                {nextMatch.home_name ?? "A definir"}
                <span className="text-muted">×</span>
                {nextMatch.away_name ?? "A definir"}
                <Crest src={nextMatch.away_crest} alt="" size={18} />
              </span>
              <span className="text-muted">
                {countdown(nextMatch.kickoff_utc, now)}
              </span>
            </div>
          )}
        </div>
      </header>

      <label className="card flex items-center justify-between gap-3 px-4 py-2.5 text-sm cursor-pointer select-none">
        <span className="text-muted">Mostrar também os jogos já passados</span>
        <input
          type="checkbox"
          className="accent-brand h-4 w-4"
          checked={showPast}
          onChange={(e) => setShowPast(e.target.checked)}
        />
      </label>

      {visibleDays.length === 0 && (
        <div className="card p-6 text-sm text-muted">
          Não há jogos próximos. Ativa “mostrar jogos passados” para rever os
          anteriores.
        </div>
      )}

      {visibleDays.map(([k, list]) => (
        <section key={k} className="space-y-2">
          <h2
            className={`display text-lg sticky top-[57px] py-1 bg-ink/80 backdrop-blur ${
              k === todayKey ? "text-brand" : "text-fg"
            }`}
          >
            {fmtDayLabel(list[0].kickoff_utc)}
            {k === todayKey && (
              <span className="chip ml-2 align-middle">Hoje</span>
            )}
          </h2>

          <div className="space-y-2 stagger">
            {list.map((m) => {
              const started = hasStarted(m.kickoff_utc, now);
              const finished = m.status === "finished";
              const teamsKnown = Boolean(m.home_name && m.away_name);
              const p = preds[m.id];
              const sv = saved[m.id];
              const st = state[m.id] ?? "idle";

              let tier: ScoreTier | null = null;
              if (finished && sv && m.home_score != null && m.away_score != null) {
                tier = scoreTier(
                  { home: Number(sv.home), away: Number(sv.away) },
                  { home: m.home_score, away: m.away_score },
                );
              }

              return (
                <div key={m.id} className="card lift p-3">
                  <div className="flex items-center justify-between text-xs text-muted mb-2">
                    <span className="truncate">
                      {m.grp ?? m.stage ?? ""}
                      {m.matchday && m.grp ? ` · J${m.matchday}` : ""}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      {m.status === "live" && (
                        <span className="chip text-brand border-brand/40">
                          <span className="live-dot" /> a decorrer
                        </span>
                      )}
                      <span>{fmtTime(m.kickoff_utc)}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    {/* Casa */}
                    <div className="flex items-center gap-2 min-w-0 justify-end text-right">
                      <span className="truncate font-semibold">
                        {m.home_name ?? "A definir"}
                      </span>
                      <Crest src={m.home_crest} alt={m.home_name ?? ""} />
                    </div>

                    {/* Centro: inputs ou resultado */}
                    <div className="flex items-center gap-1.5 justify-center">
                      {!started && teamsKnown ? (
                        <>
                          <input
                            className="score-input"
                            inputMode="numeric"
                            value={p?.home ?? ""}
                            onChange={(e) =>
                              setField(m.id, "home", e.target.value)
                            }
                            aria-label={`Golos ${m.home_name}`}
                          />
                          <span className="text-muted">×</span>
                          <input
                            className="score-input"
                            inputMode="numeric"
                            value={p?.away ?? ""}
                            onChange={(e) =>
                              setField(m.id, "away", e.target.value)
                            }
                            aria-label={`Golos ${m.away_name}`}
                          />
                        </>
                      ) : finished ? (
                        <div className="display text-2xl px-2">
                          {m.home_score} × {m.away_score}
                        </div>
                      ) : (
                        <span
                          className="locked"
                          aria-label="Palpites fechados"
                          title="Palpites fechados"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </span>
                      )}
                    </div>

                    {/* Fora */}
                    <div className="flex items-center gap-2 min-w-0">
                      <Crest src={m.away_crest} alt={m.away_name ?? ""} />
                      <span className="truncate font-semibold">
                        {m.away_name ?? "A definir"}
                      </span>
                    </div>
                  </div>

                  {/* Rodapé: guardar OU palpite/resultado */}
                  <div className="mt-2 flex items-center justify-between gap-2 min-h-[2rem]">
                    {!started && teamsKnown ? (
                      <>
                        <span className="text-xs text-muted">
                          {countdown(m.kickoff_utc, now)}
                          {st === "saved" && !isDirty(m.id) && (
                            <span className="text-good ml-2 saved-flash">
                              ✓ guardado
                            </span>
                          )}
                          {errs[m.id] && (
                            <span className="text-red ml-2">{errs[m.id]}</span>
                          )}
                        </span>
                        <button
                          className="btn btn-primary text-sm py-1.5 px-3"
                          disabled={st === "saving" || !isDirty(m.id)}
                          onClick={() => save(m.id)}
                        >
                          {st === "saving"
                            ? "A guardar…"
                            : isDirty(m.id)
                              ? "Guardar"
                              : "Guardado"}
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center justify-between w-full text-sm gap-2">
                        <span className="text-muted truncate">
                          {sv
                            ? `O teu palpite: ${sv.home}×${sv.away}`
                            : teamsKnown
                              ? "Sem palpite"
                              : "Equipas por definir"}
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          {tier && (
                            <span className={`display ${TIER_CLASS[tier]}`}>
                              +{SCORING[tier]} · {TIER_LABEL[tier]}
                            </span>
                          )}
                          {started && (
                            <Link
                              href={`/jogo/${m.id}`}
                              className="text-brand hover:underline whitespace-nowrap"
                            >
                              ver palpites →
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
