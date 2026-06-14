import "server-only";
import type { DbMatch, MatchStatus } from "./types";

// Integracao com a football-data.org (free tier inclui a competicao "WC").
// Documentacao: https://www.football-data.org/documentation/quickstart

const BASE = "https://api.football-data.org/v4";

export type FdTeam = {
  id?: number;
  name?: string | null;
  tla?: string | null;
  crest?: string | null;
};

export type FdMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  matchday: number | null;
  homeTeam: FdTeam | null;
  awayTeam: FdTeam | null;
  score?: { fullTime?: { home: number | null; away: number | null } };
};

export function isFootballDataConfigured(): boolean {
  return Boolean(process.env.FOOTBALL_DATA_TOKEN);
}

export async function fetchWorldCupMatches(): Promise<FdMatch[]> {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    throw new Error("Falta FOOTBALL_DATA_TOKEN nas variaveis de ambiente.");
  }
  const res = await fetch(`${BASE}/competitions/WC/matches`, {
    headers: { "X-Auth-Token": token },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `football-data.org respondeu ${res.status}. ${body.slice(0, 200)}`,
    );
  }
  const json = (await res.json()) as { matches?: FdMatch[] };
  return json.matches ?? [];
}

const STAGE_PT: Record<string, string> = {
  GROUP_STAGE: "Fase de grupos",
  LAST_32: "16-avos de final",
  ROUND_OF_32: "16-avos de final",
  LAST_16: "Oitavos de final",
  ROUND_OF_16: "Oitavos de final",
  QUARTER_FINALS: "Quartos de final",
  QUARTER_FINAL: "Quartos de final",
  SEMI_FINALS: "Meias-finais",
  SEMI_FINAL: "Meias-finais",
  THIRD_PLACE: "3.º e 4.º lugar",
  FINAL: "Final",
};

const COUNTRY_PT: Record<string, string> = {
  Brazil: "Brasil",
  Argentina: "Argentina",
  France: "França",
  Spain: "Espanha",
  Portugal: "Portugal",
  Germany: "Alemanha",
  England: "Inglaterra",
  Netherlands: "Países Baixos",
  Belgium: "Bélgica",
  Croatia: "Croácia",
  Uruguay: "Uruguai",
  Mexico: "México",
  "United States": "Estados Unidos",
  USA: "Estados Unidos",
  Canada: "Canadá",
  Japan: "Japão",
  "South Korea": "Coreia do Sul",
  "Korea Republic": "Coreia do Sul",
  Australia: "Austrália",
  Morocco: "Marrocos",
  Senegal: "Senegal",
  Ghana: "Gana",
  Nigeria: "Nigéria",
  Cameroon: "Camarões",
  "Ivory Coast": "Costa do Marfim",
  "Cote d'Ivoire": "Costa do Marfim",
  Tunisia: "Tunísia",
  Egypt: "Egito",
  Algeria: "Argélia",
  "Saudi Arabia": "Arábia Saudita",
  Iran: "Irão",
  Qatar: "Catar",
  Switzerland: "Suíça",
  Denmark: "Dinamarca",
  Sweden: "Suécia",
  Poland: "Polónia",
  Serbia: "Sérvia",
  Austria: "Áustria",
  Italy: "Itália",
  Wales: "País de Gales",
  Scotland: "Escócia",
  Colombia: "Colômbia",
  Ecuador: "Equador",
  Peru: "Peru",
  Chile: "Chile",
  Paraguay: "Paraguai",
  "Costa Rica": "Costa Rica",
  Panama: "Panamá",
  Jamaica: "Jamaica",
  Honduras: "Honduras",
  "New Zealand": "Nova Zelândia",
  "South Africa": "África do Sul",
  Ukraine: "Ucrânia",
  Turkey: "Turquia",
  Türkiye: "Turquia",
  Greece: "Grécia",
  Norway: "Noruega",
  "Czech Republic": "Chéquia",
  Czechia: "Chéquia",
  Hungary: "Hungria",
  Romania: "Roménia",
  Slovakia: "Eslováquia",
  Slovenia: "Eslovénia",
  "Cape Verde": "Cabo Verde",
  Jordan: "Jordânia",
  Uzbekistan: "Usbequistão",
  "New Caledonia": "Nova Caledónia",
  Curaçao: "Curaçao",
  Haiti: "Haiti",
  Bolivia: "Bolívia",
  Venezuela: "Venezuela",
  "DR Congo": "RD Congo",
};

function ptStage(stage: string | null): string | null {
  if (!stage) return null;
  return STAGE_PT[stage] ?? stage.replaceAll("_", " ").toLowerCase();
}

function ptGroup(group: string | null): string | null {
  if (!group) return null;
  // "GROUP_A" -> "Grupo A"
  return group.replace(/^GROUP[_\s]?/i, "Grupo ").trim();
}

function ptTeam(name: string | null | undefined): string | null {
  if (!name) return null;
  return COUNTRY_PT[name] ?? name;
}

function mapStatus(s: string, hasScore: boolean): MatchStatus {
  if (s === "FINISHED" || s === "AWARDED") return "finished";
  if (s === "IN_PLAY" || s === "PAUSED" || s === "SUSPENDED") return "live";
  if (hasScore && s !== "SCHEDULED" && s !== "TIMED") return "finished";
  return "scheduled";
}

export function mapFdMatch(m: FdMatch): Omit<DbMatch, "updated_at"> {
  const ft = m.score?.fullTime ?? { home: null, away: null };
  const hasScore = ft.home != null && ft.away != null;
  const status = mapStatus(m.status, hasScore);
  return {
    id: m.id,
    stage: ptStage(m.stage),
    grp: ptGroup(m.group),
    matchday: m.matchday ?? null,
    kickoff_utc: m.utcDate,
    home_name: ptTeam(m.homeTeam?.name),
    home_code: m.homeTeam?.tla ?? null,
    home_crest: m.homeTeam?.crest ?? null,
    away_name: ptTeam(m.awayTeam?.name),
    away_code: m.awayTeam?.tla ?? null,
    away_crest: m.awayTeam?.crest ?? null,
    home_score: status === "finished" ? ft.home : null,
    away_score: status === "finished" ? ft.away : null,
    status,
  };
}
