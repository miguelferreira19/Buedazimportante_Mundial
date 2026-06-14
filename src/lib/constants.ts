import { SCORING } from "./scoring";

export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || "Palpites Mundial 2026";

// Descricao legivel do sistema de pontuacao (mostrada na UI).
export const SCORING_RULES: { label: string; pts: number }[] = [
  { label: "Resultado exato (placar certo)", pts: SCORING.exact },
  { label: "Acertar o vencedor + golos de uma equipa", pts: SCORING.oneTeam },
  { label: "Acertar só o vencedor / empate", pts: SCORING.outcome },
  { label: "Falhado", pts: SCORING.miss },
];
