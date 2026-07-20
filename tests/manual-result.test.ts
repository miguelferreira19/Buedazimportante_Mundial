import assert from "node:assert/strict";
import { reconcileMatch, type ScoreState } from "../src/lib/manual-result";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log("  ✓", name);
}

// Atalho para construir uma linha de resultado/estado.
function s(
  home: number | null,
  away: number | null,
  status: ScoreState["status"],
  manual?: boolean,
): ScoreState {
  return { home_score: home, away_score: away, status, manual_result: manual };
}

check("jogo nao-manual: a API manda (valores vindos da API)", () => {
  const existing = s(null, null, "scheduled");
  const api = s(2, 1, "finished");
  const r = reconcileMatch(existing, api);
  assert.equal(r.home_score, 2);
  assert.equal(r.away_score, 1);
  assert.equal(r.status, "finished");
  assert.equal(r.manual_result, false);
  assert.equal(r.changed, true); // mudou => repontua
  assert.equal(r.reconciled, false);
});

check("jogo nao-manual sem alteracoes: changed = false", () => {
  const existing = s(2, 1, "finished");
  const api = s(2, 1, "finished");
  const r = reconcileMatch(existing, api);
  assert.equal(r.changed, false);
});

check("jogo novo (sem linha na BD): trata como nao-manual e changed = true", () => {
  const api = s(0, 0, "finished");
  const r = reconcileMatch(undefined, api);
  assert.equal(r.manual_result, false);
  assert.equal(r.changed, true);
});

check("manual protege contra API diferente (manual ganha, flag mantem-se)", () => {
  const existing = s(3, 2, "finished", true); // resultado manual
  const api = s(0, 0, "scheduled"); // API atrasada, ainda nao terminou
  const r = reconcileMatch(existing, api);
  assert.equal(r.home_score, 3); // preserva o manual
  assert.equal(r.away_score, 2);
  assert.equal(r.status, "finished");
  assert.equal(r.manual_result, true); // continua protegido
  assert.equal(r.changed, false); // nunca repontua
  assert.equal(r.reconciled, false);
});

check("manual vs API com resultado DIFERENTE: manual continua a ganhar", () => {
  const existing = s(3, 2, "finished", true);
  const api = s(1, 1, "finished"); // API entrega outro resultado
  const r = reconcileMatch(existing, api);
  assert.equal(r.home_score, 3);
  assert.equal(r.away_score, 2);
  assert.equal(r.manual_result, true);
  assert.equal(r.reconciled, false);
});

check("API IGUAL ao manual: auto-reconciliacao limpa a flag", () => {
  const existing = s(3, 2, "finished", true);
  const api = s(3, 2, "finished"); // API alcancou o resultado manual
  const r = reconcileMatch(existing, api);
  assert.equal(r.home_score, 3);
  assert.equal(r.away_score, 2);
  assert.equal(r.status, "finished");
  assert.equal(r.manual_result, false); // largou a protecao
  assert.equal(r.reconciled, true);
  assert.equal(r.changed, false); // valores nao mudaram, nao ha que repontuar
});

check("campo manual_result ausente (coluna por criar) = false => comportamento antigo", () => {
  const existing = s(0, 0, "scheduled"); // sem manual_result definido
  const api = s(4, 0, "finished");
  const r = reconcileMatch(existing, api);
  assert.equal(r.manual_result, false);
  assert.equal(r.home_score, 4); // a API manda
  assert.equal(r.changed, true);
});

check("manual_result = false explicito comporta-se como nao-manual", () => {
  const existing = s(1, 1, "finished", false);
  const api = s(2, 2, "finished");
  const r = reconcileMatch(existing, api);
  assert.equal(r.home_score, 2);
  assert.equal(r.manual_result, false);
  assert.equal(r.changed, true);
});

console.log(`\n${passed} testes OK ✅`);
