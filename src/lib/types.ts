// Tipos partilhados (puros).

export type MatchStatus = "scheduled" | "live" | "finished";

export type DbMatch = {
  id: number;
  stage: string | null; // fase em PT, ex.: "Fase de grupos", "Oitavos"
  grp: string | null; // ex.: "Grupo A"
  matchday: number | null; // jornada (fase de grupos)
  kickoff_utc: string; // ISO UTC
  home_name: string | null;
  home_code: string | null;
  home_crest: string | null;
  away_name: string | null;
  away_code: string | null;
  away_crest: string | null;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  updated_at: string;
};

export type DbPrediction = {
  id: string;
  user_id: string;
  match_id: number;
  pred_home: number;
  pred_away: number;
  points: number | null;
  updated_at: string;
};

export type LeaderboardRow = {
  username: string;
  points: number;
  exactos: number; // nº de resultados exatos
  certos: number; // nº de jogos pontuados (>0)
  jogados: number; // nº de palpites em jogos ja terminados
};
