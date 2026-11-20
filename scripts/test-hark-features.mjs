// node --test scripts/test-hark-features.mjs
// Pure-logic checks for: set_todos overview_session_id ack, inline AI model follow, crash report, auto update.
// No app launch, no network, no real profile (HOME is redirected to a temp dir).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ext = path.join(here, "..", "recovered", "esm", "000-extension.js");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oc-hark-features-"));
process.once("exit", () => { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {} });
globalThis.require = createRequire(import.meta.url);
const UUID4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test("set_todos ack: external owners always get an overview_session_id; native chat never", async () => {
  const { BridgeTaskStore } = await import("../recovered/esm/000-extension.js/module-0144.mjs");
  const dir = fs.mkdtempSync(path.join(tmp, "tasks-"));
  let now = 1_000_000;
  const store = new BridgeTaskStore(24, () => ++now);
  store.configurePersistence(dir, path.join(dir, "project"));
  const owner = "bridge:ext-1";
  const t = store.update(owner, [{ id: "1", title: "步骤", status: "in_progress" }], { new_task: true });
  const sid = store.overviewSessionIdFor(t.id, owner);
  assert.match(sid, UUID4);
  assert.equal(store.overviewSessionIdFor(t.id, owner), sid, "stable across calls");
  // A card without an id (old persisted card, restored state) gets one minted and persisted.
  delete store.tasks.get(t.id).overviewSessionId;
  const minted = store.overviewSessionIdFor(t.id, owner);
  assert.match(minted, UUID4);
  assert.equal(store.tasks.get(t.id).overviewSessionId, minted);
  // Another owner cannot read this card's identity.
  assert.equal(store.overviewSessionIdFor(t.id, "bridge:someone-else"), undefined);
  // Native chat owners never receive one in the ack.
  const nativeOwner = "native-chat:" + "8b0c5a52-6f0e-4c39-9d47-2f1f1b7d9a10";
  const n = store.update(nativeOwner, [{ id: "1", title: "x", status: "in_progress" }], { new_task: true });
  assert.equal(store.overviewSessionIdFor(n.id, nativeOwner), undefined);
  // The ack in module-0143 uses the store accessor (publicTask only carries the short tag).
  const src = fs.readFileSync(path.join(ext, "module-0143.mjs"), "utf8");
  assert.match(src, /overviewSessionIdFor\?\.\(task\.id, taskOwnerId\)/);
  assert.match(src, /overview_session_id: overviewSessionIdAck/);
});
test("inline-ai: Tab and Ctrl+I follow the native Chat model unless explicitly picked", async () => {
  const realRequire = globalThis.require;
  globalThis.require = (id) => (id === "vscode" ? {} : realRequire(id));
  let mod;
  try { mod = await import("../recovered/esm/000-extension.js/inline-ai.mjs"); } finally { globalThis.require = realRequire; }
  const { resolveInlineModel } = mod;
  const all = [
    { vendor: "opencode", id: "gpt-big", name: "Big", family: "big" },
    { vendor: "opencode", id: "flash-1", name: "Flash", family: "flash" },
    { vendor: "opencode-codex", id: "gpt-big", name: "Big (Codex)", family: "big" }
  ];
  const chat = { vendor: "opencode-codex", id: "gpt-big" };
  // Default (nothing picked): both follow the Chat model, matched by vendor + id.
  assert.equal(resolveInlineModel(all, "tab", {}, chat), all[2]);
  assert.equal(resolveInlineModel(all, "edit", {}, chat), all[2]);
  // Chat never used: old automatic choice (fast model for Tab, first model for Ctrl+I).
  assert.equal(resolveInlineModel(all, "tab", {}, undefined), all[1]);
  assert.equal(resolveInlineModel(all, "edit", {}, undefined), all[0]);
  // Chat model no longer available: automatic fallback.
  assert.equal(resolveInlineModel(all, "tab", {}, { vendor: "opencode", id: "gone" }), all[1]);
  // An explicit pick wins for that feature only; "自动" (__auto__) opts out of following Chat.
  assert.equal(resolveInlineModel(all, "tab", { tabModel: "flash-1" }, chat), all[1]);
  assert.equal(resolveInlineModel(all, "edit", { tabModel: "flash-1" }, chat), all[2]);
  assert.equal(resolveInlineModel(all, "tab", { tabModel: "__auto__" }, chat), all[1]);
  assert.equal(resolveInlineModel([], "tab", {}, chat), undefined);
  const inline = fs.readFileSync(path.join(ext, "inline-ai.mjs"), "utf8");
  assert.match(inline, /跟随对话模型/);
  assert.match(inline, /globalThis\.__ocOnNativeChatModel = /);
  const chatTurn = fs.readFileSync(path.join(ext, "module-0177.mjs"), "utf8");
  assert.match(chatTurn, /globalThis\.__ocOnNativeChatModel\?\.\(globalThis\.__ocNativeChatModel\)/);
});
//@@HARK_FEATURE_TESTS@@
