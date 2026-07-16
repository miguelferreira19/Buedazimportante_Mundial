import assert from "node:assert/strict";
import { TIER_LABEL, TIER_CLASS } from "../src/lib/tiers";
import type { ScoreTier } from "../src/lib/scoring";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log("  ✓", name);
}

const ALL_TIERS: ScoreTier[] = ["exact", "oneTeam", "outcome", "miss"];

check("TIER_LABEL tem uma entrada para cada tier possivel", () => {
  for (const tier of ALL_TIERS) {
    assert.ok(tier in TIER_LABEL, `falta label para ${tier}`);
    assert.equal(typeof TIER_LABEL[tier], "string");
    assert.ok(TIER_LABEL[tier].length > 0, `label vazia para ${tier}`);
  }
});

check("TIER_CLASS tem uma entrada para cada tier possivel", () => {
  for (const tier of ALL_TIERS) {
    assert.ok(tier in TIER_CLASS, `falta classe para ${tier}`);
    assert.equal(typeof TIER_CLASS[tier], "string");
    assert.ok(TIER_CLASS[tier].length > 0, `classe vazia para ${tier}`);
  }
});

check("labels corretas para cada tier", () => {
  assert.equal(TIER_LABEL.exact, "Resultado exato");
  assert.equal(TIER_LABEL.oneTeam, "Golos de uma equipa");
  assert.equal(TIER_LABEL.outcome, "Vencedor certo");
  assert.equal(TIER_LABEL.miss, "Falhado");
});

check("classes CSS corretas para cada tier", () => {
  assert.equal(TIER_CLASS.exact, "text-good");
  assert.equal(TIER_CLASS.oneTeam, "text-cyan");
  assert.equal(TIER_CLASS.outcome, "text-gold");
  assert.equal(TIER_CLASS.miss, "text-muted");
});

check("nao ha labels duplicadas entre tiers diferentes", () => {
  const labels = ALL_TIERS.map((t) => TIER_LABEL[t]);
  const unique = new Set(labels);
  assert.equal(unique.size, labels.length);
});

check("TIER_LABEL e TIER_CLASS tem exatamente as mesmas chaves (sem entradas a mais)", () => {
  assert.deepEqual(Object.keys(TIER_LABEL).sort(), ALL_TIERS.slice().sort());
  assert.deepEqual(Object.keys(TIER_CLASS).sort(), ALL_TIERS.slice().sort());
});

console.log(`\n${passed} testes OK ✅`);
