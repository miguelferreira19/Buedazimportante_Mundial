import { SCORING_RULES } from "@/lib/constants";

// Cores alinhadas com os tiers de acerto usados em toda a app.
const TIER_COLORS = ["text-good", "text-cyan", "text-gold", "text-faint"];

export default function ScoringLegend() {
  return (
    <div className="card p-5">
      <h3 className="display text-base mb-3">Como se ganham pontos</h3>
      <ul className="divide-y divide-line/40">
        {SCORING_RULES.map((r, i) => (
          <li
            key={r.label}
            className="flex justify-between items-center gap-3 py-2"
          >
            <span className="text-sm text-muted">{r.label}</span>
            <span
              className={`display text-lg shrink-0 tabular-nums ${
                TIER_COLORS[i] ?? "text-fg"
              }`}
            >
              {r.pts}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-faint mt-3 leading-relaxed">
        Cada jogo vale no máximo {SCORING_RULES[0].pts} pontos. Conta sempre o
        resultado dos 90 minutos.
      </p>
    </div>
  );
}
