// Etiquetas e cores de cada nivel de acerto (puro; usavel no cliente e servidor).
import type { ScoreTier } from "./scoring";

export const TIER_LABEL: Record<ScoreTier, string> = {
  exact: "Resultado exato",
  oneTeam: "Golos de uma equipa",
  outcome: "Vencedor certo",
  miss: "Falhado",
};

export const TIER_CLASS: Record<ScoreTier, string> = {
  exact: "text-good",
  oneTeam: "text-cyan",
  outcome: "text-gold",
  miss: "text-muted",
};
