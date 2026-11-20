// Self-test for float-restore-20261120-0320: an empty floating (auxiliary) editor window is neither saved nor restored,
// and a floating window whose editors failed to come back is closed right after start-up.
// node tasks/float-restore-20261120-0320/test-empty-floating.mjs   (no OpenCode, no browser needed)
import fs from "node:fs"; import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const src = fs.readFileSync(path.join(root, "recovered/esm/027-workbench.desktop.main.js/module-1598.mjs"), "utf8");
let pass = 0, fail = 0; const ok = (c, m, x) => { if (c) { pass++; console.log("ok  ", m); } else { fail++; console.log("FAIL", m, x === undefined ? "" : JSON.stringify(x)); } };
const fnSrc = src.match(/\nfunction ocSerializedGridHasEditors\(partState\) \{[\s\S]*?\n\}\n/);
ok(!!fnSrc, "helper ocSerializedGridHasEditors present");
const method = name => { const m = src.match(new RegExp("\\n  (" + name.replace(/[()]/g, "\\$&") + " \\{[\\s\\S]*?\\n  \\})\\n")); return m && m[1]; };
const mCreate = method("createState()"), mRestore = method("async restoreState(state)"), mParts = method("async restoreParts()");
ok(mCreate && mRestore && mParts, "createState / restoreState / restoreParts found");
const Fake = new Function(fnSrc[0] + "\nreturn class { " + mCreate + "\n" + mRestore + "\n" + mParts + " };")();
const has = new Function(fnSrc[0] + "\nreturn ocSerializedGridHasEditors;")();

// the state found in the user's workspace storage (2026-11-20 03:16): one floating window, no editors
const saved = { auxiliary: [{ state: { serializedGrid: { root: { type: "branch", data: [{ type: "leaf", data: { id: 1, editors: [], mru: [] }, size: 727 }], size: 1050 }, orientation: 0, width: 1050, height: 727 }, activeGroup: 1, mostRecentActiveGroups: [1] }, bounds: { x: 242, y: 24, width: 1065, height: 791 }, zoomLevel: 0, compact: false, mode: 1 }], mru: [1, 0] };
const withEd = { serializedGrid: { root: { type: "branch", data: [{ type: "leaf", data: { id: 2, editors: [] } }, { type: "branch", data: [{ type: "leaf", data: { id: 3, editors: [{ id: "x" }] } }] }] } } };
ok(has(saved.auxiliary[0].state) === false, "the user's saved floating window counts as empty");
ok(has(withEd) === true && has({}) === true && has(undefined) === true, "a nested editor counts; unknown shapes are kept");

// createState skips empty floating windows; mru re-indexed to [main, kept...]
const part = (id, editors, win = true) => ({ windowId: id, win, groups: [{ isEmpty: !editors }], closed: 0, createState() { return { serializedGrid: { root: { type: "leaf", data: { id, editors: editors ? [{ id: "e" }] : [] } } } }; }, close() { this.closed++; return true; }, whenReady: Promise.resolve(), whenRestored: Promise.resolve() });
const main = part(0, true, false), emptyA = part(1, false), full = part(2, true), emptyB = part(3, false);
const ctx = Object.assign(new Fake(), { mainPart: main, parts: [main, emptyA, full, emptyB], mostRecentActiveParts: [emptyB, full, main, emptyA], auxiliaryWindowService: { getWindow: id => ({ 1: { createState: () => ({ bounds: 1 }) }, 2: { createState: () => ({ bounds: 2 }) }, 3: { createState: () => ({ bounds: 3 }) } })[id] } });
const st = ctx.createState();
ok(st.auxiliary.length === 1 && st.auxiliary[0].bounds === 2, "only the floating window with editors is saved", st);
ok(JSON.stringify(st.mru) === "[1,0]", "mru indexes main=0, saved window=1", st.mru);
ctx.parts = [main, emptyA]; ctx.mostRecentActiveParts = [emptyA, main];
ok(ctx.createState().auxiliary.length === 0, "only empty floating windows -> nothing saved (saveState then deletes the key)");

// restoreState skips empty saved windows (old builds saved them)
const created = []; const r = Object.assign(new Fake(), { parts: [main], mostRecentActiveParts: [main], createAuxiliaryEditorPart: async s => { created.push(s); } });
await r.restoreState(saved);
ok(created.length === 0, "an old saved empty floating window is not reopened");
await r.restoreState({ auxiliary: [saved.auxiliary[0], { state: withEd, bounds: 9 }], mru: [2, 1, 0] });
ok(created.length === 1 && created[0].bounds === 9, "the window with editors is still restored", created.length);

// restoreParts closes a floating window that came back empty (e.g. a webview editor with no serializer)
const lost = part(5, false), kept = part(6, true), modal = part(7, false);
const rp = Object.assign(new Fake(), { mainPart: Object.assign(main, { willRestoreState: false, activeGroup: { focus() {} } }), modalEditorPart: modal, parts: [main, lost, kept, modal], mostRecentActiveParts: [main], whenReadyPromise: { complete() {} }, whenRestoredPromise: { complete() {} }, auxiliaryWindowService: { getWindow: id => id === 5 || id === 6 || id === 7 ? {} : undefined }, loadState() { return null; } });
await rp.restoreParts();
ok(lost.closed === 1 && kept.closed === 0 && modal.closed === 0 && main.closed === 0, "after start-up only the empty floating window is closed", { lost: lost.closed, kept: kept.closed, modal: modal.closed });

// the close goes through the workbench path, so no "close the window?" prompt (module-1596 closingFromWorkbench)
const m1596 = fs.readFileSync(path.join(root, "recovered/esm/027-workbench.desktop.main.js/module-1596.mjs"), "utf8");
ok(/Event2\.once\(editorPart\.onWillClose\)/.test(m1596), "an editor part close closes its floating window");
console.log(JSON.stringify({ ok: fail === 0, pass, fail }));
process.exit(fail ? 1 : 0);
