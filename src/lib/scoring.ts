// Motor de pontuacao.
// Ficheiro PURO (sem dependencias de servidor) para poder ser testado isoladamente.
//
// Regras:
//   6 -> resultado exato (placar certo nas duas equipas)
//   4 -> acertou o vencedor/empate E os golos de UMA das equipas
//   3 -> acertou so o vencedor/empate
//   0 -> falhado
// (Avalia-se do criterio mais especifico para o menos.)

export const SCORING = {
  exact: 6,
  oneTeam: 4,
  outcome: 3,
  miss: 0,
} as const;

export type Scoreline = { home: number; away: number };

export type ScoreTier = "exact" | "oneTeam" | "outcome" | "miss";

export function resultOf(s: Scoreline): "H" | "D" | "A" {
  if (s.home > s.away) return "H";
  if (s.home < s.away) return "A";
  return "D";
}

export function scoreTier(pred: Scoreline, actual: Scoreline): ScoreTier {
  const exact = pred.home === actual.home && pred.away === actual.away;
  if (exact) return "exact";

  // Sem acertar o vencedor/empate nao ha pontos.
  if (resultOf(pred) !== resultOf(actual)) return "miss";

  // Acertou o vencedor/empate; ve se acertou os golos de uma das equipas.
  const oneTeam = pred.home === actual.home || pred.away === actual.away;
  return oneTeam ? "oneTeam" : "outcome";
}

export function scorePrediction(pred: Scoreline, actual: Scoreline): number {
  return SCORING[scoreTier(pred, actual)];
}
