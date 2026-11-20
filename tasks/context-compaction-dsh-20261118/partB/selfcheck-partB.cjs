// context-compaction-dsh PART B self-check: plain node re-statement of the agent-host dshCompactSpec formula (module-0029) vs PLAN.md expected table.
const HEADROOM = 65536, RATIO = 0.8, RETAIN = 0.16;
function spec(W, O, ratio, fixedRetain) {
  const budget = W - O;
  if (budget <= 0) return { error: 'no message budget' };
  const pressure = budget - HEADROOM;
  if (pressure <= 0) return { error: 'no pressure budget' };
  const threshold = Math.floor(Math.min(W * (ratio ?? RATIO), pressure));
  const retain = fixedRetain !== undefined ? fixedRetain : Math.floor(budget * RETAIN);
  if (retain >= threshold) return { error: `retain ${retain} >= threshold ${threshold}` };
  return { threshold, retain };
}
const cases = [
  [128000, 0, 62464, 20480], [262144, 0, 196608, 41943], [262144, 32768, 163840, 36700],
  [1048576, 256000, 727040, 126812], [1048576, 0, 838860, 167772],
];
let ok = true;
for (const [W, O, et, er] of cases) {
  const s = spec(W, O); const pass = s.threshold === et && s.retain === er; ok &&= pass;
  console.log(`${pass ? 'PASS' : 'FAIL'} W=${W} O=${O} -> threshold=${s.threshold} retain=${s.retain} (expected ${et}/${er})`);
}
for (const [W, O, r, k] of [[65536, 0], [131072, 65536], [100000, 200000], [128000, 0, undefined, 70000], [32768, 0]]) {
  const s = spec(W, O, r, k); const pass = !!s.error; ok &&= pass;
  console.log(`${pass ? 'PASS' : 'FAIL'} guard W=${W} O=${O}${k ? ` keep=${k}` : ''} -> ${s.error ?? JSON.stringify(s)} (auto compaction skipped, warned once)`);
}
console.log(ok ? 'SELF-CHECK OK' : 'SELF-CHECK FAILED'); process.exit(ok ? 0 : 1);
