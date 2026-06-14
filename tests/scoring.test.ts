import assert from "node:assert/strict";
import { scorePrediction, scoreTier, SCORING } from "../src/lib/scoring";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log("  ✓", name);
}

check("resultado exato vale 6", () => {
  assert.equal(scoreTier({ home: 2, away: 1 }, { home: 2, away: 1 }), "exact");
  assert.equal(scorePrediction({ home: 2, away: 1 }, { home: 2, away: 1 }), SCORING.exact);
});

check("vencedor certo + golos da equipa da casa vale 4", () => {
  assert.equal(scoreTier({ home: 2, away: 0 }, { home: 2, away: 1 }), "oneTeam");
  assert.equal(scorePrediction({ home: 2, away: 0 }, { home: 2, away: 1 }), SCORING.oneTeam);
});

check("vencedor certo + golos da equipa de fora vale 4", () => {
  assert.equal(scoreTier({ home: 3, away: 1 }, { home: 2, away: 1 }), "oneTeam");
});

check("acertar só o vencedor (nenhuma equipa certa) vale 3", () => {
  assert.equal(scoreTier({ home: 3, away: 0 }, { home: 2, away: 1 }), "outcome");
  assert.equal(scorePrediction({ home: 3, away: 0 }, { home: 2, away: 1 }), SCORING.outcome);
});

check("empate com placar diferente vale 3 (só vencedor/empate)", () => {
  assert.equal(scoreTier({ home: 2, away: 2 }, { home: 1, away: 1 }), "outcome");
});

check("falhar o vencedor vale 0", () => {
  assert.equal(scoreTier({ home: 0, away: 2 }, { home: 1, away: 0 }), "miss");
});

check("acertar golos de uma equipa MAS falhar o vencedor vale 0", () => {
  // real 2-1 (vitória casa); palpite 2-3 (vitória fora) — casa=2 certo mas vencedor errado
  assert.equal(scoreTier({ home: 2, away: 3 }, { home: 2, away: 1 }), "miss");
});

check("empate exato vale 6", () => {
  assert.equal(scoreTier({ home: 1, away: 1 }, { home: 1, away: 1 }), "exact");
});

check("nunca passa do máximo nem fica negativo", () => {
  for (const p of [[0, 0], [5, 1], [1, 3]] as const) {
    for (const a of [[0, 0], [2, 2], [3, 1]] as const) {
      const pts = scorePrediction({ home: p[0], away: p[1] }, { home: a[0], away: a[1] });
      assert.ok(pts >= 0 && pts <= SCORING.exact);
    }
  }
});

console.log(`\n${passed} testes OK ✅`);
