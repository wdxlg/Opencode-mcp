// Offline tests for the Bridge Quick Tunnel auto-reconnect (task mcp-quick-tunnel-reconnect-20261110-112000-step01).
// No network, no cloudflared, no VS Code: the recovery helpers are sliced out of module-0114.mjs and run in a vm.
// OC_CF_SOURCE=<file> runs the same tests against another copy (e.g. the pre-fix HEAD) to confirm they fail there.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = process.env.OC_CF_SOURCE || path.join(root, "recovered/esm/000-extension.js/module-0114.mjs");
const source = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const start = source.indexOf("// src/bridge-cloudflare-connection.ts");
const end = source.indexOf("// extensions/opencode/src/bridge-ngrok-recovery.ts");
assert.ok(start >= 0 && end > start, "cloudflare recovery helpers not found in module-0114.mjs");
const sandbox = {};
vm.runInNewContext(`${source.slice(start, end)}\nthis.api = { cloudflareConnectionEvent, createCloudflareRecoveryObserver, deadline: typeof CLOUDFLARE_RECOVERY_DEADLINE_MS === "number" ? CLOUDFLARE_RECOVERY_DEADLINE_MS : undefined };`, sandbox);
const { cloudflareConnectionEvent, createCloudflareRecoveryObserver, deadline } = sandbox.api;

const T = "Tue 2026-11-10 10:50 AM CST (UTC+08:00)";
const LINES = {
  registered: `${T} INF Registered tunnel connection connIndex=0 connection=x event=0 ip=198.41.200.233 location=lax01 protocol=quic`,
  serveError: `${T} ERR Serve tunnel error error="datagram manager error: timeout: no recent network activity" connIndex=0 event=0 ip=198.41.192.67`,
  retry: `${T} INF Retrying connection in up to 1s connIndex=0 event=0 ip=198.41.192.67`,
  notFound: `${T} ERR Register tunnel error from server side error="Unauthorized: Tunnel not found" connIndex=0 event=0 ip=198.41.200.63`,
  notFoundJson: JSON.stringify({ level: "error", message: "Register tunnel error from server side", error: "Unauthorized: Tunnel not found", connIndex: 0 })
};

/** Fake Bridge state + manual scheduler: records every callback the observer makes. */
function harness({ running = true, active = true } = {}) {
  const calls = [];
  const timers = [];
  const state = { running, reconnecting: false, active };
  const observer = createCloudflareRecoveryObserver({
    isActive: () => state.active,
    isRunning: () => state.running,
    isReconnecting: () => state.reconnecting,
    disconnected: () => { calls.push("disconnected"); state.running = false; state.reconnecting = true; },
    recovered: () => { calls.push("recovered"); state.running = true; state.reconnecting = false; },
    restart: (reason) => { calls.push(`restart:${reason}`); },
    schedule: (callback, ms) => { const t = { callback, ms, cancelled: false }; timers.push(t); return () => { t.cancelled = true; }; }
  });
  const fire = () => { for (const t of timers.splice(0)) if (!t.cancelled) t.callback(); };
  return { observer, calls, timers, state, fire };
}

test("parses the Quick Tunnel 'Tunnel not found' register error as gone (text and JSON log formats)", () => {
  assert.equal(cloudflareConnectionEvent(LINES.notFound)?.type, "gone");
  assert.equal(cloudflareConnectionEvent(LINES.notFoundJson)?.type, "gone");
  assert.equal(cloudflareConnectionEvent(LINES.registered)?.type, "registered");
  assert.equal(cloudflareConnectionEvent(LINES.serveError)?.type, "disconnected");
  assert.equal(cloudflareConnectionEvent(LINES.retry), undefined);
});

test("replay of 2026-11-10 10:50: network blip then 'Tunnel not found' restarts cloudflared exactly once", () => {
  const h = harness();
  h.observer.observe(LINES.registered);
  h.observer.observe(LINES.serveError);
  h.observer.observe(LINES.retry);
  for (let i = 0; i < 45; i++) h.observer.observe(LINES.notFound);
  assert.deepEqual(h.calls, ["disconnected", "restart:tunnel-not-found"]);
  assert.equal(h.observer.isConnected(), false);
  h.fire();
  assert.deepEqual(h.calls, ["disconnected", "restart:tunnel-not-found"], "deadline must not restart a second time");
});

test("transient disconnect that re-registers recovers in place without restart", () => {
  const h = harness();
  h.observer.observe(LINES.registered);
  h.observer.observe(LINES.serveError);
  h.observer.observe(LINES.registered);
  h.fire();
  assert.deepEqual(h.calls, ["disconnected", "recovered"]);
  assert.equal(h.observer.isConnected(), true);
});

test("disconnect with no re-registration restarts after the deadline", () => {
  const h = harness();
  h.observer.observe(LINES.registered);
  h.observer.observe(LINES.serveError);
  assert.equal(h.timers.length, 1);
  assert.equal(h.timers[0].ms, deadline);
  assert.ok(deadline >= 3e4 && deadline <= 3e5, "deadline is bounded");
  h.fire();
  assert.deepEqual(h.calls, ["disconnected", "restart:deadline"]);
});

test("startup phase (not running, not reconnecting) and inactive/disposed observers never restart", () => {
  const starting = harness({ running: false });
  starting.observer.observe(LINES.notFound);
  assert.deepEqual(starting.calls, []);
  const inactive = harness({ active: false });
  inactive.observer.observe(LINES.registered);
  inactive.observer.observe(LINES.notFound);
  assert.deepEqual(inactive.calls, []);
  const disposed = harness();
  disposed.observer.observe(LINES.registered);
  disposed.observer.observe(LINES.serveError);
  disposed.observer.dispose();
  disposed.observer.observe(LINES.notFound);
  disposed.fire();
  assert.deepEqual(disposed.calls, ["disconnected"]);
});

test("Bridge wires restart + schedule into the Cloudflare observer and restarts via beginTunnelRecovery", () => {
  const i = source.indexOf("createCloudflareRecoveryObserver({", end);
  assert.ok(i > 0);
  const block = source.slice(i, source.indexOf("}) : void 0;", i));
  assert.match(block, /restart: \(reason\) =>/);
  // Since task mcp-tunnel-reconnect-all-modes-20261110-step01 the restart goes through the shared
  // restartOwnedTunnel() (stop owned cloudflared -> beginTunnelRecovery; Quick Tunnel drops its address);
  // its behaviour is covered end to end in scripts/test-tunnel-reconnect.mjs.
  assert.match(block, /restartOwnedTunnel\(this, generation, cloudflareProvider, reason\)/);
  assert.match(block, /schedule: \(callback, ms\) =>/);
  const shared = source.slice(source.indexOf("function restartOwnedTunnel("), source.indexOf("// src/device-file-roots.ts"));
  assert.match(shared, /server\.stopTunnelProcess\(\)/);
  assert.match(shared, /server\.beginTunnelRecovery\(\)/);
  assert.match(shared, /if \(!tunnelHasFixedAddress\(provider\)\) server\.domain = ""/);
});
