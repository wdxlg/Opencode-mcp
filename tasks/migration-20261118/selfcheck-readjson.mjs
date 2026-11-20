import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readJson as a } from "../../recovered/shared/work-store.mjs";
import { readJson as b } from "../../recovered/shared/multica/core.mjs";
for (const readJson of [a, b]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "oc-readjson-"));
  const file = path.join(dir, "board.json");
  assert.deepEqual(readJson(file, { x: 1 }), { x: 1 });
  fs.writeFileSync(file, "\uFEFF" + JSON.stringify({ ok: true }));
  assert.deepEqual(readJson(file, null), { ok: true });
  fs.writeFileSync(file, '{"items": [1, 2');
  assert.equal(readJson(file, null), null);
  assert.equal(readJson(file, null), null);
  const baks = fs.readdirSync(dir).filter((n) => n.includes(".corrupt-"));
  assert.equal(baks.length, 1);
  assert.equal(fs.readFileSync(path.join(dir, baks[0]), "utf8"), '{"items": [1, 2');
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log("PASS readJson keeps a backup of unreadable store files before falling back");
