// Motor de pontuacao — "Detalhado por niveis".
// Ficheiro PURO (sem dependencias de servidor) para poder ser testado isoladamente.

export const SCORING = {
  exact: 5, // resultado exato (placar certo)
  goalDiff: 3, // diferenca de golos certa (mas placar errado)
  outcome: 2, // vencedor/empate certo (mas diferenca errada)
  miss: 0,
} as const;

export type Scoreline = { home: number; away: number };

export type ScoreTier = "exact" | "goalDiff" | "outcome" | "miss";

export function resultOf(s: Scoreline): "H" | "D" | "A" {
  if (s.home > s.away) return "H";
  if (s.home < s.away) return "A";
  return "D";
}

/**
 * Classifica um palpite face ao resultado real, do criterio mais especifico
 * para o menos especifico. Cada jogo vale no maximo SCORING.exact pontos.
 */
export function scoreTier(pred: Scoreline, actual: Scoreline): ScoreTier {
  if (pred.home === actual.home && pred.away === actual.away) return "exact";
  if (pred.home - pred.away === actual.home - actual.away) return "goalDiff";
  if (resultOf(pred) === resultOf(actual)) return "outcome";
  return "miss";
}

export function scorePrediction(pred: Scoreline, actual: Scoreline): number {
  return SCORING[scoreTier(pred, actual)];
}
