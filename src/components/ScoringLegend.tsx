import { SCORING_RULES } from "@/lib/constants";

export default function ScoringLegend() {
  return (
    <div className="card p-4">
      <h3 className="display text-lg mb-3">Como se ganham pontos</h3>
      <ul className="space-y-1.5 text-sm">
        {SCORING_RULES.map((r) => (
          <li key={r.label} className="flex justify-between items-center gap-3">
            <span className="text-muted">{r.label}</span>
            <span className="display text-fg shrink-0">{r.pts} pts</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted mt-3">
        Cada jogo vale no máximo {SCORING_RULES[0].pts} pontos. Os palpites
        referem-se ao resultado dos 90 minutos.
      </p>
    </div>
  );
}
