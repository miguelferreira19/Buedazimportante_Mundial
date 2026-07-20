import assert from "node:assert/strict";
import {
  fmtKickoff,
  fmtTime,
  fmtDayLabel,
  dayKey,
  hasStarted,
  countdown,
} from "../src/lib/format";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log("  ✓", name);
}

// --- fmtTime ---------------------------------------------------------

check("fmtTime mostra hora:minuto na hora de Lisboa (verao, UTC+1)", () => {
  assert.equal(fmtTime("2026-06-14T18:00:00Z"), "19:00");
});

check("fmtTime mostra hora:minuto na hora de Lisboa (inverno, UTC+0)", () => {
  assert.equal(fmtTime("2026-01-14T23:30:00Z"), "23:30");
});

// --- fmtKickoff --------------------------------------------------------

check("fmtKickoff combina dia/mes e hora", () => {
  assert.equal(fmtKickoff("2026-06-14T18:00:00Z"), "14/06, 19:00");
});

check("fmtKickoff avança o dia quando a conversao de fuso horario cruza a meia-noite", () => {
  // 23:30 UTC em junho (verao, Lisboa = UTC+1) => 00:30 do dia seguinte em Lisboa
  assert.equal(fmtKickoff("2026-06-14T23:30:00Z"), "15/06, 00:30");
});

// --- fmtDayLabel ---------------------------------------------------------

check("fmtDayLabel devolve o dia da semana capitalizado, em português", () => {
  assert.equal(fmtDayLabel("2026-06-14T18:00:00Z"), "Domingo, 14 de junho");
});

check("fmtDayLabel capitaliza mesmo quando a conversao de fuso muda o dia", () => {
  assert.equal(fmtDayLabel("2026-06-14T23:30:00Z"), "Segunda-feira, 15 de junho");
});

// --- dayKey ---------------------------------------------------------

check("dayKey devolve YYYY-MM-DD na hora de Lisboa", () => {
  assert.equal(dayKey("2026-06-14T18:00:00Z"), "2026-06-14");
});

check("dayKey agrupa corretamente perto da meia-noite (verao, UTC+1)", () => {
  assert.equal(dayKey("2026-06-14T23:30:00Z"), "2026-06-15");
});

check("dayKey agrupa corretamente perto da meia-noite (inverno, UTC+0, sem mudança de dia)", () => {
  assert.equal(dayKey("2026-01-14T23:30:00Z"), "2026-01-14");
});

check("dayKey funciona na viragem do ano", () => {
  assert.equal(dayKey("2026-12-31T23:59:00Z"), "2026-12-31");
});

// --- hasStarted ---------------------------------------------------------

check("hasStarted é falso antes do kickoff", () => {
  const kickoff = "2026-06-14T18:00:00Z";
  const now = Date.parse("2026-06-14T17:59:59Z");
  assert.equal(hasStarted(kickoff, now), false);
});

check("hasStarted é verdadeiro depois do kickoff", () => {
  const kickoff = "2026-06-14T18:00:00Z";
  const now = Date.parse("2026-06-14T18:00:01Z");
  assert.equal(hasStarted(kickoff, now), true);
});

check("hasStarted é verdadeiro exatamente no instante do kickoff (limite)", () => {
  const kickoff = "2026-06-14T18:00:00Z";
  const now = Date.parse(kickoff);
  assert.equal(hasStarted(kickoff, now), true);
});

// --- countdown ---------------------------------------------------------

check("countdown mostra dias e horas quando faltam mais de 24h", () => {
  const now = Date.parse("2026-06-14T12:00:00Z");
  const kickoff = new Date(now + 26 * 3600 * 1000).toISOString(); // 1d 2h
  assert.equal(countdown(kickoff, now), "faltam 1d 2h");
});

check("countdown mostra dias exatos com 0 horas restantes", () => {
  const now = Date.parse("2026-06-14T12:00:00Z");
  const kickoff = new Date(now + 2 * 24 * 3600 * 1000).toISOString(); // 2d 0h
  assert.equal(countdown(kickoff, now), "faltam 2d 0h");
});

check("countdown mostra horas e minutos quando falta menos de 1 dia", () => {
  const now = Date.parse("2026-06-14T12:00:00Z");
  const kickoff = new Date(now + 3 * 3600 * 1000 + 12 * 60 * 1000).toISOString(); // 3h12m
  assert.equal(countdown(kickoff, now), "faltam 3h 12m");
});

check("countdown mostra só minutos quando falta menos de 1 hora", () => {
  const now = Date.parse("2026-06-14T12:00:00Z");
  const kickoff = new Date(now + 8 * 60 * 1000).toISOString(); // 8m
  assert.equal(countdown(kickoff, now), "faltam 8m");
});

check("countdown arredonda por defeito para 0m quando falta menos de 1 minuto (caso limite)", () => {
  const now = Date.parse("2026-06-14T12:00:00Z");
  const kickoff = new Date(now + 59 * 1000).toISOString(); // 59s
  assert.equal(countdown(kickoff, now), "faltam 0m");
});

check("countdown devolve 'fechado' no instante exato do kickoff (limite)", () => {
  const now = Date.parse("2026-06-14T12:00:00Z");
  assert.equal(countdown(new Date(now).toISOString(), now), "fechado");
});

check("countdown devolve 'fechado' quando o jogo já começou", () => {
  const now = Date.parse("2026-06-14T12:00:00Z");
  const kickoff = new Date(now - 1000).toISOString();
  assert.equal(countdown(kickoff, now), "fechado");
});

check("countdown devolve 'fechado' para jogos muito no passado", () => {
  const now = Date.parse("2026-06-14T12:00:00Z");
  assert.equal(countdown("2020-01-01T00:00:00Z", now), "fechado");
});

console.log(`\n${passed} testes OK ✅`);
