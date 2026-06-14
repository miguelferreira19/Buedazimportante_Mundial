// Helpers de data/hora em PT-PT (puros, usaveis no cliente e no servidor).
// Mostramos sempre na hora de Portugal continental.

const TZ = "Europe/Lisbon";

export function fmtKickoff(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// Titulo do dia, ex.: "Domingo, 14 de junho"
export function fmtDayLabel(iso: string): string {
  const d = new Date(iso);
  const s = new Intl.DateTimeFormat("pt-PT", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Chave de dia (YYYY-MM-DD) na timezone de Portugal, para agrupar jogos.
export function dayKey(iso: string): string {
  const d = new Date(iso);
  // en-CA devolve no formato YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function hasStarted(iso: string, now: number = Date.now()): boolean {
  return now >= new Date(iso).getTime();
}

// Contagem decrescente legivel ("2d 4h", "3h 12m", "8m", "a começar")
export function countdown(iso: string, now: number = Date.now()): string {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return "fechado";
  const mins = Math.floor(ms / 60000);
  const d = Math.floor(mins / (60 * 24));
  const h = Math.floor((mins % (60 * 24)) / 60);
  const m = mins % 60;
  if (d > 0) return `faltam ${d}d ${h}h`;
  if (h > 0) return `faltam ${h}h ${m}m`;
  return `faltam ${m}m`;
}
