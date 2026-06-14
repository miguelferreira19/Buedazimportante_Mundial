import assert from "node:assert/strict";
import { scorePrediction, scoreTier, SCORING } from "../src/lib/scoring";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log("  ✓", name);
}

check("resultado exato vale 5", () => {
  assert.equal(scoreTier({ home: 2, away: 1 }, { home: 2, away: 1 }), "exact");
  assert.equal(scorePrediction({ home: 2, away: 1 }, { home: 2, away: 1 }), SCORING.exact);
});

check("diferença de golos certa vale 3", () => {
  assert.equal(scoreTier({ home: 3, away: 2 }, { home: 2, away: 1 }), "goalDiff");
  assert.equal(scorePrediction({ home: 3, away: 2 }, { home: 2, away: 1 }), SCORING.goalDiff);
});

check("empate com placar diferente conta como diferença certa (3)", () => {
  assert.equal(scoreTier({ home: 2, away: 2 }, { home: 1, away: 1 }), "goalDiff");
});

check("acertar o vencedor (diferença errada) vale 2", () => {
  assert.equal(scoreTier({ home: 3, away: 0 }, { home: 2, away: 1 }), "outcome");
  assert.equal(scorePrediction({ home: 3, away: 0 }, { home: 2, away: 1 }), SCORING.outcome);
});

check("falhar o vencedor vale 0", () => {
  assert.equal(scoreTier({ home: 0, away: 2 }, { home: 1, away: 0 }), "miss");
  assert.equal(scorePrediction({ home: 0, away: 2 }, { home: 1, away: 0 }), 0);
});

check("empate exato vale 5", () => {
  assert.equal(scoreTier({ home: 1, away: 1 }, { home: 1, away: 1 }), "exact");
});

check("palpitar empate quando deu vitória é falhado", () => {
  assert.equal(scoreTier({ home: 1, away: 1 }, { home: 2, away: 1 }), "miss");
});

check("nunca passa do máximo nem fica negativo", () => {
  for (const p of [
    [0, 0],
    [5, 1],
    [1, 3],
  ] as const) {
    for (const a of [
      [0, 0],
      [2, 2],
      [3, 1],
    ] as const) {
      const pts = scorePrediction({ home: p[0], away: p[1] }, { home: a[0], away: a[1] });
      assert.ok(pts >= 0 && pts <= SCORING.exact);
    }
  }
});

console.log(`\n${passed} testes OK ✅`);
