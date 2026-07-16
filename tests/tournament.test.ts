import assert from "node:assert/strict";
import { tournamentFinished, FINAL_STAGE } from "../src/lib/tournament";
import type { MatchStatus } from "../src/lib/types";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log("  ✓", name);
}

// Constrói uma lista mínima de jogos (só stage + status, como a query leve).
function m(stage: string | null, status: MatchStatus) {
  return { stage, status };
}

check("FINAL_STAGE é o rótulo em PT usado no calendário/sync", () => {
  assert.equal(FINAL_STAGE, "Final");
});

check("sem jogos, o torneio não terminou", () => {
  assert.equal(tournamentFinished([]), false);
});

check("Final ainda por jogar => não terminou", () => {
  assert.equal(tournamentFinished([m("Final", "scheduled")]), false);
});

check("Final a decorrer => não terminou", () => {
  assert.equal(tournamentFinished([m("Final", "live")]), false);
});

check("Final terminada => terminou", () => {
  assert.equal(tournamentFinished([m("Final", "finished")]), true);
});

check("3.º/4.º lugar terminado NÃO conta como fim (só a Final coroa)", () => {
  assert.equal(tournamentFinished([m("3.º e 4.º lugar", "finished")]), false);
});

check("3.º/4.º terminado mas Final por jogar => não terminou", () => {
  assert.equal(
    tournamentFinished([
      m("3.º e 4.º lugar", "finished"),
      m("Final", "scheduled"),
    ]),
    false,
  );
});

check("3.º/4.º e Final ambos terminados => terminou", () => {
  assert.equal(
    tournamentFinished([
      m("3.º e 4.º lugar", "finished"),
      m("Final", "finished"),
    ]),
    true,
  );
});

check("outras fases terminadas nunca contam", () => {
  assert.equal(
    tournamentFinished([
      m("Fase de grupos", "finished"),
      m("Oitavos de final", "finished"),
      m("Meias-finais", "finished"),
    ]),
    false,
  );
});

check("encontra a Final terminada no meio de vários jogos", () => {
  assert.equal(
    tournamentFinished([
      m("Meias-finais", "finished"),
      m("Final", "finished"),
      m("3.º e 4.º lugar", "scheduled"),
    ]),
    true,
  );
});

check("stage nula é ignorada", () => {
  assert.equal(tournamentFinished([m(null, "finished")]), false);
});

console.log(`\n${passed} testes OK ✅`);
