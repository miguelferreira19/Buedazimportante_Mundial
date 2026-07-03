"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "palpites:lastRanks";

// Compara a posição atual com a última vista (localStorage) e mostra uma
// seta ▲/▼ por uns segundos se mudou. Não toca na BD.
export default function RankDelta({
  username,
  rank,
}: {
  username: string;
  rank: number;
}) {
  const [delta, setDelta] = useState<number | null>(null);

  useEffect(() => {
    let saved: Record<string, number> = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      saved = {};
    }
    const prev = saved[username];
    const changed = prev != null && prev !== rank;
    if (changed) setDelta(prev - rank);

    saved[username] = rank;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // localStorage indisponível (privado/quota) — sem deltas, sem crash.
    }

    if (changed) {
      const t = setTimeout(() => setDelta(null), 6000);
      return () => clearTimeout(t);
    }
  }, [username, rank]);

  if (delta == null || delta === 0) return null;
  const up = delta > 0;

  return (
    <span
      title={up ? `Subiu ${delta} posições` : `Desceu ${Math.abs(delta)} posições`}
      aria-label={up ? `Subiu ${delta} posições` : `Desceu ${Math.abs(delta)} posições`}
      className={`inline-flex items-center shrink-0 ${up ? "text-good" : "text-red"}`}
    >
      <svg
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ transform: up ? undefined : "rotate(180deg)" }}
      >
        <path d="M12 3l9 15H3z" />
      </svg>
    </span>
  );
}
