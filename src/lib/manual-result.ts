// Reconciliacao entre resultados manuais (inseridos pelo admin) e os dados que
// chegam da football-data.org durante a sincronizacao.
//
// Modulo PURO (sem BD, sem "server-only") para ser facil de testar: recebe a
// linha existente na BD e a linha vinda da API e devolve a linha a gravar.
import type { MatchStatus } from "./types";

// So os campos de resultado/estado interessam para a reconciliacao.
export type ScoreState = {
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  // Ausente (undefined) quando a coluna ainda nao existe na BD => tratar como false.
  manual_result?: boolean | null;
};

export type ReconcileResult = {
  // Valores a gravar nos campos de resultado/estado + flag manual.
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  manual_result: boolean;
  // O resultado/estado a gravar difere do que estava na BD (para decidir se ha
  // que repontuar/limpar pontos). Para jogos protegidos e sempre false.
  changed: boolean;
  // A flag manual foi limpa porque a API passou a bater certo com o manual.
  reconciled: boolean;
};

// Decide o que gravar para um jogo, dado o que esta na BD (existing) e o que a
// API entregou (api).
//
// Regras:
//  - Jogo NAO manual: a API manda (comportamento antigo).
//  - Jogo manual e a API entrega o MESMO resultado final: auto-reconciliacao,
//    limpa-se a flag (o jogo volta ao controlo do sync). Os valores nao mudam.
//  - Jogo manual e a API difere (ou ainda nao terminou): o manual ganha e a
//    flag mantem-se; preservam-se os valores da BD.
export function reconcileMatch(
  existing: ScoreState | undefined,
  api: ScoreState,
): ReconcileResult {
  const isManual = existing?.manual_result === true;

  if (!isManual) {
    const changed =
      !existing ||
      existing.home_score !== api.home_score ||
      existing.away_score !== api.away_score ||
      existing.status !== api.status;
    return {
      home_score: api.home_score,
      away_score: api.away_score,
      status: api.status,
      manual_result: false,
      changed,
      reconciled: false,
    };
  }

  // A partir daqui, existing existe e esta protegido (manual).
  const cur = existing as ScoreState;
  const apiFinished =
    api.status === "finished" && api.home_score != null && api.away_score != null;
  const apiMatchesManual =
    apiFinished &&
    api.home_score === cur.home_score &&
    api.away_score === cur.away_score;

  // Preserva-se sempre o resultado/estado manual da BD.
  return {
    home_score: cur.home_score,
    away_score: cur.away_score,
    status: cur.status,
    // Se a API ja bate certo, larga-se a protecao; caso contrario mantem-se.
    manual_result: apiMatchesManual ? false : true,
    changed: false,
    reconciled: apiMatchesManual,
  };
}
