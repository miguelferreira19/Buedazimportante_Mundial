"use client";

import { useEffect, useMemo, useState } from "react";
import type { DbMatch } from "@/lib/types";
import { dayKey, fmtDayLabel, fmtTime, countdown, hasStarted } from "@/lib/format";
import Link from "next/link";
import { scoreTier, SCORING, type ScoreTier } from "@/lib/scoring";
import { TIER_LABEL, TIER_CLASS } from "@/lib/tiers";
import Crest from "@/components/Crest";
import TeamName from "@/components/TeamName";

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

  // Separa por JOGO: "por jogar" (ainda não começou) vs "resultados" (já começou).
  const { upcoming, results } = useMemo(() => {
    const up = new Map<string, DbMatch[]>();
    const res = new Map<string, DbMatch[]>();
    for (const m of matches) {
      const target = hasStarted(m.kickoff_utc, now) ? res : up;
      const k = dayKey(m.kickoff_utc);
      if (!target.has(k)) target.set(k, []);
      target.get(k)!.push(m);
    }
    // Por jogar: cronológico, o próximo primeiro.
    const upArr = [...up.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
    for (const [, l] of upArr)
      l.sort(
        (a, b) =>
          new Date(a.kickoff_utc).getTime() -
            new Date(b.kickoff_utc).getTime() || a.id - b.id,
      );
    // Resultados: mais recentes primeiro (dias e jogos por ordem decrescente).
    const resArr = [...res.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
    for (const [, l] of resArr)
      l.sort(
        (a, b) =>
          new Date(b.kickoff_utc).getTime() -
            new Date(a.kickoff_utc).getTime() || b.id - a.id,
      );
    return { upcoming: upArr, results: resArr };
  }, [matches, now]);

  const visibleDays = showPast ? results : upcoming;

  // Quantos jogos abertos ainda sem palpite (foco da pagina).
  const openNoPred = useMemo(() => {
    return matches.filter(
      (m) =>
        !hasStarted(m.kickoff_utc, now) &&
        m.home_name &&
        m.away_name &&
        !saved[m.id],
    ).length;
  }, [matches, now, saved]);

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
      <div className="space-y-6">
        <Hero next={null} openCount={0} now={now} />
        <EmptyCard
          title="Ainda não há jogos"
          body="O calendário ainda não foi sincronizado. Assim que o administrador o carregar, os jogos aparecem aqui."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Hero next={nextMatch} openCount={openNoPred} now={now} />

      {/* Filtro: por jogar / tudo */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-faint">
          {visibleDays.reduce((n, [, l]) => n + l.length, 0)} jogos
        </p>
        <div className="inline-flex rounded-full border border-line bg-card2/40 p-0.5 text-sm">
          {[
            { v: false, label: "Por jogar" },
            { v: true, label: "Resultados" },
          ].map((o) => (
            <button
              key={String(o.v)}
              onClick={() => setShowPast(o.v)}
              aria-pressed={showPast === o.v}
              className={`px-3.5 py-1 rounded-full font-medium transition-colors ${
                showPast === o.v
                  ? "bg-card2 text-fg shadow-sm"
                  : "text-muted hover:text-fg"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {visibleDays.length === 0 && (
        <EmptyCard
          title={showPast ? "Ainda sem resultados" : "Sem jogos por jogar"}
          body={
            showPast
              ? "Os jogos já começados aparecem aqui, do mais recente para o mais antigo."
              : "Estás em dia com os palpites. Toca em “Resultados” para rever os jogos anteriores."
          }
        />
      )}

      {visibleDays.map(([k, list]) => (
        <section key={k} className="space-y-2.5">
          <div className="sticky top-[58px] z-10 -mx-1 px-1 py-1.5 bg-ink/85 backdrop-blur">
            <h2
              className={`display text-lg flex items-center gap-2 ${
                k === todayKey ? "text-brand" : "text-fg"
              }`}
            >
              {fmtDayLabel(list[0].kickoff_utc)}
              {k === todayKey && <span className="chip">Hoje</span>}
            </h2>
          </div>

          <div className="space-y-2.5 stagger">
            {list.map((m) => {
              const started = hasStarted(m.kickoff_utc, now);
              const finished = m.status === "finished";
              const teamsKnown = Boolean(m.home_name && m.away_name);
              const p = preds[m.id];
              const sv = saved[m.id];
              const st = state[m.id] ?? "idle";
              const open = !started && teamsKnown;

              let tier: ScoreTier | null = null;
              if (finished && sv && m.home_score != null && m.away_score != null) {
                tier = scoreTier(
                  { home: Number(sv.home), away: Number(sv.away) },
                  { home: m.home_score, away: m.away_score },
                );
              }

              return (
                <div
                  key={m.id}
                  className={`card lift p-3.5 ${
                    open && !sv
                      ? "border-brand/25"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-faint mb-2.5">
                    <span className="truncate font-medium uppercase tracking-wide">
                      {m.grp ?? m.stage ?? ""}
                      {m.matchday && m.grp ? ` · J${m.matchday}` : ""}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      {m.status === "live" && (
                        <span className="chip text-brand border-brand/40">
                          <span className="live-dot" /> a decorrer
                        </span>
                      )}
                      <span className="tabular-nums">
                        {fmtTime(m.kickoff_utc)}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
                    {/* Casa */}
                    <div className="flex items-center gap-2.5 min-w-0 justify-end text-right">
                      <TeamName
                        name={m.home_name}
                        code={m.home_code}
                        className="font-semibold"
                      />
                      <Crest src={m.home_crest} alt={m.home_name ?? ""} size={28} />
                    </div>

                    {/* Centro: inputs ou resultado */}
                    <div className="flex items-center gap-1.5 justify-center">
                      {open ? (
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
                          <span className="text-faint text-sm">×</span>
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
                        <div className="display text-2xl px-2 text-fg">
                          {m.home_score}
                          <span className="text-faint mx-1 text-base font-normal">
                            ×
                          </span>
                          {m.away_score}
                        </div>
                      ) : (
                        <span
                          className="locked"
                          aria-label="Palpites fechados"
                          title="Palpites fechados"
                        >
                          <svg
                            width="17"
                            height="17"
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
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Crest src={m.away_crest} alt={m.away_name ?? ""} size={28} />
                      <TeamName
                        name={m.away_name}
                        code={m.away_code}
                        className="font-semibold"
                      />
                    </div>
                  </div>

                  {/* Rodapé: guardar OU palpite/resultado */}
                  <div className="mt-2.5 pt-2.5 border-t border-line/50 flex items-center justify-between gap-2 min-h-[2.25rem]">
                    {open ? (
                      <>
                        <span className="text-xs text-faint">
                          {countdown(m.kickoff_utc, now)}
                          {st === "saved" && !isDirty(m.id) && (
                            <span className="text-good ml-2 saved-flash font-semibold">
                              ✓ guardado
                            </span>
                          )}
                          {errs[m.id] && (
                            <span className="text-red ml-2">{errs[m.id]}</span>
                          )}
                        </span>
                        <button
                          className="btn btn-primary text-sm py-1.5 px-3.5"
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
                          {sv ? (
                            <>
                              O teu palpite{" "}
                              <span className="display text-fg">
                                {sv.home}×{sv.away}
                              </span>
                            </>
                          ) : teamsKnown ? (
                            "Sem palpite"
                          ) : (
                            "Equipas por definir"
                          )}
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          {tier && (
                            <span className={`tier-pill ${TIER_CLASS[tier]}`}>
                              +{SCORING[tier]}
                              <span className="hidden sm:inline font-normal opacity-80">
                                {TIER_LABEL[tier]}
                              </span>
                            </span>
                          )}
                          {started && (
                            <Link
                              href={`/jogo/${m.id}`}
                              className="text-brand hover:underline whitespace-nowrap font-medium"
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

/* Cabecalho fotografico unico da pagina de palpites. */
function Hero({
  next,
  openCount,
  now,
}: {
  next: DbMatch | null;
  openCount: number;
  now: number;
}) {
  return (
    <header className="photo-band group">
      <div
        className="photo photo-wash"
        style={{ "--img": "url(/img/pitch-day.jpg)" } as React.CSSProperties}
      />
      <div className="relative z-10 p-5 sm:p-7">
        <p className="eyebrow">Mundial 2026</p>
        <h1 className="h-page mt-1.5">Os teus palpites</h1>
        <p className="text-muted text-sm mt-2 max-w-md leading-relaxed">
          {openCount > 0 ? (
            <>
              Tens{" "}
              <span className="text-fg font-semibold">{openCount}</span>{" "}
              {openCount === 1 ? "jogo por palpitar" : "jogos por palpitar"}.
              Cada um fecha no apito inicial.
            </>
          ) : (
            "Mete o resultado de cada jogo. Cada um fecha no apito inicial."
          )}
        </p>

        {next && (
          <div className="mt-4 inline-flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-line/70 bg-ink3/50 backdrop-blur px-3 py-2 text-sm">
            <span className="chip border-brand/40 text-brand">
              <span className="live-dot" /> a seguir
            </span>
            <span className="flex items-center gap-2 font-semibold">
              <Crest src={next.home_crest} alt="" size={20} />
              {next.home_name ?? "A definir"}
              <span className="text-faint">×</span>
              {next.away_name ?? "A definir"}
              <Crest src={next.away_crest} alt="" size={20} />
            </span>
            <span className="text-faint tabular-nums">
              {countdown(next.kickoff_utc, now)}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

function EmptyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-7 text-center">
      <p className="display text-lg text-fg">{title}</p>
      <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">
        {body}
      </p>
    </div>
  );
}
