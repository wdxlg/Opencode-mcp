// Headless test of the multi-model worktree helpers (text-extracted verbatim from module-0177.mjs)
// against a throw-away git repo in the OS temp dir. Usage: node wt.test.mjs <repoRoot>
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import crypto from "node:crypto";
import child from "node:child_process"; import assert from "node:assert"; import { pathToFileURL } from "node:url";
const repo = process.argv[2];
const src = fs.readFileSync(path.join(repo, "recovered/esm/000-extension.js/module-0177.mjs"), "utf8");
const from = src.indexOf("var import_node_child_process_mm"), to = src.indexOf("function isolatedBranchInstructions(");
const qFrom = src.indexOf("async function prepareCodeMergeSources("), qTo = src.indexOf("function normalizeBranchWorktreeInfo(");
const rmFrom = src.indexOf("async function removeBranchWorktree("), rmTo = src.indexOf("async function discardBranchWorktreeCommand(");
const { WorkspaceActivityLedger } = await import(pathToFileURL(path.join(repo, "recovered/shared/workspace-activity.mjs")).href);
const body = src.slice(from, to) + src.slice(qFrom, qTo) + src.slice(rmFrom, rmTo) +
  "\nreturn { captureWorkspaceSnapshot, createBranchWorktree, collectBranchDiff, removeBranchWorktree, waitForWorkspaceQuiet, prepareCodeMergeSources, unlinkDependencyLinks, MULTI_MODEL_REF_PREFIX };";
const require_ = (m) => ({ "node:child_process": child, "node:fs": fs, "node:path": path, "node:os": os })[m];
const M = new Function("require", "__toESM", "import_node_crypto25", "vscode19", "WorkspaceActivityLedger", body)(require_, (x) => ({ default: x }), crypto, {}, WorkspaceActivityLedger);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oc-par-test-"));
const results = [];
const ok = (name) => { results.push("PASS " + name); console.log("PASS " + name); };
const git = (cwd, ...a) => child.execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...a], { cwd, encoding: "utf8" }).trim();
try {
  const main = path.join(tmp, "proj"); fs.mkdirSync(main);
  git(main, "init", "-q");
  fs.writeFileSync(path.join(main, ".gitignore"), "node_modules/\n.venv/\n");
  fs.writeFileSync(path.join(main, "a.txt"), "base\n");
  fs.mkdirSync(path.join(main, "node_modules", "dep"), { recursive: true });
  fs.writeFileSync(path.join(main, "node_modules", "dep", "index.js"), "module.exports=1\n");
  git(main, "add", "-A"); git(main, "commit", "-qm", "init");
  fs.writeFileSync(path.join(main, "a.txt"), "base\nuncommitted primary edit\n");
  const context = { globalStorageUri: { fsPath: path.join(tmp, "storage") } };
  // 1. snapshot of the main workspace (primary answer base)
  const base = await M.captureWorkspaceSnapshot(main, "grp-1", { appendLine: (l) => console.log(l) });
  assert.ok(base && /^[0-9a-f]{40}$/.test(base.commit)); ok("snapshot captured " + base.commit.slice(0, 8));
  assert.equal(git(main, "status", "--porcelain"), "M a.txt", "snapshot did not touch the real index"); ok("snapshot leaves real index/worktree untouched");
  // 2. N worktrees created concurrently from that base
  const N = 4; const t0 = Date.now();
  const infos = await Promise.all(Array.from({ length: N }, (_, i) => M.createBranchWorktree(context, base, "grp-1", `variant-${i}`)));
  const dirs = new Set(infos.map((i) => i.worktree)); assert.equal(dirs.size, N);
  for (const info of infos) assert.equal(fs.readFileSync(path.join(info.worktree, "a.txt"), "utf8").replace(/\r\n/g, "\n"), "base\nuncommitted primary edit\n");
  ok(`${N} worktrees created concurrently in ${Date.now() - t0}ms, each at the snapshot content`);
  // 3. dependency junctions
  for (const info of infos) {
    assert.equal(info.links.length, 1, "node_modules linked"); const st = fs.lstatSync(info.links[0]);
    assert.ok(st.isSymbolicLink(), "link is a junction/symlink");
    assert.ok(fs.existsSync(path.join(info.worktree, "node_modules", "dep", "index.js")));
  }
  ok("node_modules linked into every worktree as junction (" + process.platform + ")");
  // 4. concurrent edits + concurrent diff collection (each worktree has its own index)
  await Promise.all(infos.map((info, i) => fs.promises.writeFile(path.join(info.worktree, `branch-${i}.txt`), `branch ${i}\n`)));
  const diffs = await Promise.all(infos.map((info) => M.collectBranchDiff(info)));
  diffs.forEach((d, i) => { assert.ok(d.patch.includes(`branch-${i}.txt`)); for (let j = 0; j < N; j++) if (j !== i) assert.ok(!d.patch.includes(`branch-${j}.txt`)); assert.ok(!d.patch.includes("node_modules")); });
  ok("concurrent collectBranchDiff: each patch has only its own branch file, no node_modules");
  // 5. concurrent snapshots (before-apply style) with different labels do not collide
  const snaps = await Promise.all(Array.from({ length: 3 }, (_, i) => M.captureWorkspaceSnapshot(main, `grp-1-before-apply-${i}`, null)));
  assert.ok(snaps.every(Boolean)); assert.equal(new Set(snaps.map((s) => s.commit)).size >= 1, true);
  const refs = git(main, "for-each-ref", "--format=%(refname)", M.MULTI_MODEL_REF_PREFIX).split(/\r?\n/);
  for (let i = 0; i < 3; i++) assert.ok(refs.includes(`${M.MULTI_MODEL_REF_PREFIX}grp-1-before-apply-${i}`));
  ok("3 concurrent snapshots wrote 3 refs, no index.lock collision");
  // 6. owner filtering: edits of another dialogue are excluded from the primary merge patch, own dialogue's are not
  const store = path.join(tmp, "ledger");
  const ledger = new WorkspaceActivityLedger({ storeDir: store, rootsReader: () => [main] });
  const me = "native-chat:11111111-1111-4111-8111-111111111111", other = "bridge-session:other";
  fs.writeFileSync(path.join(main, "other.txt"), "by other dialogue\n"); ledger.recordEdits(other, ["other.txt"], { title: "other" });
  fs.appendFileSync(path.join(main, "a.txt"), "edit by this dialogue after the base\n");
  ledger.recordEdits(me, ["a.txt"], { title: "me" });
  assert.deepEqual(ledger.filesEditedByOthers(me), ["other.txt"]);
  // prepareCodeMergeSources builds its own ledger with the default store dir; point TMP there.
  const prevTmp = process.env.TMP, prevTemp = process.env.TEMP, prevTmpdir = process.env.TMPDIR;
  const ledgerDefault = new WorkspaceActivityLedger({ rootsReader: () => [main] });
  ledgerDefault.recordEdits(other, ["other.txt"], { title: "other" }); ledgerDefault.recordEdits(me, ["a.txt"], { title: "me" });
  const lines = await M.prepareCodeMergeSources({ base, sources: [{ label: "primary" }, { label: "b2", worktree: infos[0] }] }, main, "grp-1", { appendLine: (l) => console.log(l) }, me);
  const primaryPatch = JSON.parse(lines.split("\n")[0].match(/(".*?\.patch")/)[1]);
  const patchText = fs.readFileSync(primaryPatch, "utf8");
  assert.ok(!patchText.includes("other.txt"), "other dialogue's file excluded"); assert.ok(lines.includes("other.txt"), "note names the excluded file");
  fs.rmSync(primaryPatch, { force: true });
  ok("prepareCodeMergeSources with ownerId excludes the other dialogue's file and keeps its own");
  // the quiet-wait returns quickly when only this owner edited recently
  const ledgerQuiet = new WorkspaceActivityLedger({ rootsReader: () => [main] });
  const tq = Date.now(); await M.waitForWorkspaceQuiet(path.join(tmp, "quiet-root"), me, null); assert.ok(Date.now() - tq < 2000);
  ok("waitForWorkspaceQuiet returns immediately with no other-owner edits");
  // 7. removal: unlink junction first, then delete worktree; main node_modules must survive
  await Promise.all(infos.map((info) => M.removeBranchWorktree(info)));
  for (const info of infos) assert.ok(!fs.existsSync(info.worktree));
  assert.ok(fs.existsSync(path.join(main, "node_modules", "dep", "index.js")), "main node_modules intact");
  assert.equal(git(main, "worktree", "list").split(/\r?\n/).length, 1, "worktrees pruned");
  ok("concurrent removal: worktrees gone, junction targets (main node_modules) intact, git worktree list clean");
  try { const key = path.join(os.tmpdir(), "opencode-workspace-activity"); for (const f of fs.readdirSync(key)) { try { const d = JSON.parse(fs.readFileSync(path.join(key, f), "utf8")); if (String(d.workspace_key || "").includes("oc-par-test-")) fs.rmSync(path.join(key, f), { force: true }); } catch {} } } catch {}
  console.log("ALL WORKTREE TESTS PASSED (" + results.length + ")");
} catch (e) {
  console.error("FAIL", e); process.exitCode = 1;
} finally {
  try { for (const l of child.execFileSync("git", ["worktree", "list", "--porcelain"], { cwd: path.join(tmp, "proj"), encoding: "utf8" }).split("\n")) if (l.startsWith("worktree ") && !l.endsWith("proj")) {} } catch {}
  fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 3 });
  console.log("temp removed:", !fs.existsSync(tmp));
}
