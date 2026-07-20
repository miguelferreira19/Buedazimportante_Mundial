// Estado do torneio (puro; usavel no cliente e servidor, sem dependencias de BD).
import type { DbMatch } from "./types";

// Rotulo da fase FINAL, igual ao que footballdata.ts produz (STAGE_PT.FINAL)
// e ao usado na navegacao do calendario (STAGE_ORDER termina em "Final").
export const FINAL_STAGE = "Final";

// So precisamos da fase e do estado para decidir se o torneio acabou.
type StageStatus = Pick<DbMatch, "stage" | "status">;

// O Mundial terminou quando o jogo da FINAL esta terminado.
// Atencao: o jogo de 3.º/4.º lugar ("3.º e 4.º lugar") NAO conta — so a Final
// coroa o campeao. Por isso filtramos estritamente pela stage "Final".
export function tournamentFinished(matches: readonly StageStatus[]): boolean {
  return matches.some(
    (m) => m.stage === FINAL_STAGE && m.status === "finished",
  );
}
