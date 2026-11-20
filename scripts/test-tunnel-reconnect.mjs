// Offline tests: Bridge tunnel auto-reconnect for every tunnel mode (task mcp-tunnel-reconnect-all-modes-20261110-step01).
// Modes (bridge.tunnelProvider): "cloudflare" = Quick Tunnel, "cloudflare-named" = Named Tunnel via token,
// "ngrok" = reserved domain. No network, no cloudflared/ngrok, no VS Code: the recovery helpers and the two
// BridgeManager methods startTunnelProcess/beginTunnelRecovery are sliced out of module-0114.mjs and run in a vm
// against a fake child process and a fake manager, replaying real log lines.
// OC_TUNNEL_SOURCE=<file> runs the same tests against another copy (e.g. the pre-fix HEAD) to show they fail there.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { EventEmitter } from "node:events";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "recovered/esm/000-extension.js");
const file = process.env.OC_TUNNEL_SOURCE || path.join(dir, "module-0114.mjs");
const source = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const ngrokFailure = fs.readFileSync(path.join(dir, "module-0115.mjs"), "utf8").replace(/\r\n/g, "\n")
  .replace(/^import .*$/gm, "").replace(/^export \{[^}]*\};?\s*$/gm, "");

function slice(from, to) {
  const a = source.indexOf(from);
  const b = source.indexOf(to, a + 1);
  assert.ok(a >= 0 && b > a, `section not found: ${from.trim()}`);
  return source.slice(a, b);
}
const helpers = slice("// src/bridge-cloudflare-connection.ts", "// src/device-file-roots.ts");
const methods = slice("\n  startTunnelProcess() {", "\n  async waitForTunnelStartup(") + "," +
  slice("\n  beginTunnelRecovery() {", "\n  /** Master switch for Agent Skills");
const backoffConst = source.match(/var TUNNEL_RESTART_BACKOFF_MS = \[[^\]]*\];/)?.[0] ?? "var TUNNEL_RESTART_BACKOFF_MS = [1e3];";

class FakeChild extends EventEmitter {
  constructor(command, args, options) {
    super();
    Object.assign(this, { command, args, env: options?.env ?? {}, pid: 4242, exitCode: null, signalCode: null });
    this.stdout = Object.assign(new EventEmitter(), { setEncoding() {} });
    this.stderr = Object.assign(new EventEmitter(), { setEncoding() {} });
  }
  line(text2, stream = "stderr") { this[stream].emit("data", `${text2}\n`); }
  kill() {}
}

/** Fresh vm with the module's helpers + the two manager methods; timers are manual unless `immediate`. */
function load({ immediate = false } = {}) {
  const timers = [];
  const delays = [];
  const spawned = [];
  const sandbox = {
    console, Promise, Error, JSON, Math, Number, String, Set, Map, WeakMap, URL, Object, Array, RegExp,
    setTimeout: (callback, ms) => {
      delays.push(ms);
      if (immediate) { queueMicrotask(callback); return { unref() {} }; }
      const t = { callback, ms, cancelled: false, unref() {} };
      timers.push(t);
      return t;
    },
    clearTimeout: (t) => { if (t) t.cancelled = true; },
    queueMicrotask,
    init_define_OPENCODE_BUILD_INFO: () => {},
    import_node_child_process7: { spawn: (command, args, options) => { const c = new FakeChild(command, args, options); spawned.push(c); return c; } },
    __ocChildTree: { add() {}, delete() {} },
    quickTunnelArgs: () => ["tunnel", "--config", "quick.yml", "--url", "http://127.0.0.1:5000"],
    classifyBridgeStartFailure: (error2, info) => ({ code: error2?.code, stage: info?.stage }),
    BridgeStartError: class extends Error { constructor(code, message2, params) { super(message2); this.code = code; this.params = params; } },
    PUBLIC_HEALTH_REQUEST_TIMEOUT_MS: 5e3
  };
  vm.runInNewContext(`${ngrokFailure}\n${backoffConst}\n${helpers}\nthis.api = { methods: {${methods}}, cloudflareConnectionEvent };`, sandbox);
  const fire = () => { for (const t of timers.splice(0)) if (!t.cancelled) t.callback(); };
  return { api: sandbox.api, timers, delays, spawned, fire };
}

const DOMAINS = { ngrok: "mcp-fixed.ngrok.example", "cloudflare-named": "mcp.named.example" };

/** Fake BridgeManager; beginTunnelRecovery restarts the same process once (what startTunnelOnce would spawn). */
function manager(provider, vmEnv) {
  const log = [];
  const calls = [];
  const m = {
    tunnelProvider: provider,
    cloudflaredExecutable: "cloudflared.exe",
    ngrokExecutable: "ngrok.exe",
    quickTunnelConfigFile: "quick.yml",
    quickTunnelRoute: "direct",
    edgeRelay: void 0,
    configuredDomain: provider === "ngrok" ? DOMAINS.ngrok : "",
    configuredNamedDomain: DOMAINS["cloudflare-named"],
    namedTunnelToken: "named-token-1",
    routeToken: "route",
    domain: provider === "cloudflare" ? "old-quick.trycloudflare.com" : DOMAINS[provider],
    tunnelGeneration: 1,
    stoppingResources: false,
    disposed: false,
    stopTunnelProcessInFlight: void 0,
    tunnelProcess: void 0,
    state: "running",
    revision: 0,
    lastError: void 0,
    startFailure: void 0,
    ngrokSessionOffline: false,
    cloudflareSessionOffline: false,
    cloudflareConnectionObservers: new WeakMap(),
    mcpTransport: { isListening: () => true, stop: () => calls.push("mcp-stop"), destroySessionsAndStopPruning: () => calls.push("mcp-sessions-destroyed") },
    output: { append: (t) => log.push(String(t).trimEnd()), appendLine: (t) => log.push(t) },
    currentLocalPort: () => "5000",
    tunnelProcessEnvironment() { return provider === "cloudflare-named" ? { TUNNEL_TOKEN: this.namedTunnelToken } : {}; },
    recordOwnedTunnel() {},
    clearOwnedTunnelRecord() {},
    logDuringShutdown: (t) => log.push(t),
    requestPublicHealth: async () => ({ ok: false }),
    recordStartFailure: (e) => e,
    noteReconnecting() {},
    getStatus() { return { publicUrl: `https://${this.domain}/mcp/route` }; },
    isDeterministicTunnelFailure() { return false; },
    async stopTunnelProcess() { calls.push("stop-tunnel"); this.tunnelProcess = void 0; },
    beginTunnelRecovery() {
      calls.push("begin-recovery");
      this.startTunnelProcess();
    }
  };
  m.startTunnelProcess = vmEnv.api.methods.startTunnelProcess;
  return { m, log, calls };
}

const T = "2026-11-10T02:50:00Z";
const CF = {
  registered: `${T} INF Registered tunnel connection connIndex=0 connection=x event=0 ip=198.41.200.233 location=lax01 protocol=quic`,
  serveError: `${T} ERR Serve tunnel error error="timeout: no recent network activity" connIndex=0 event=0 ip=198.41.192.67`,
  retry: `${T} INF Retrying connection in up to 1s connIndex=0 event=0 ip=198.41.192.67`,
  notFound: `${T} ERR Register tunnel error from server side error="Unauthorized: Tunnel not found" connIndex=0 event=0 ip=198.41.200.63`,
  unauthorized: `${T} ERR Register tunnel error from server side error="Unauthorized: Invalid tunnel secret" connIndex=0 event=0 ip=198.41.200.63`
};
const NG = {
  online: (domain) => JSON.stringify({ lvl: "info", msg: "started tunnel", obj: "tunnels", name: "command_line", addr: "http://localhost:5000", url: `https://${domain}` }),
  offline: JSON.stringify({ lvl: "eror", msg: "session closed, starting reconnect loop", obj: "tunnels.session", err: "read tcp: connection reset" }),
  auth: JSON.stringify({ lvl: "eror", msg: "failed to reconnect session", obj: "tunnels.session", err: "authentication failed: The authtoken you specified has been revoked.\n\nERR_NGROK_107" }),
  busy: JSON.stringify({ lvl: "eror", msg: "failed to reconnect session", obj: "tunnels.session", err: "The endpoint 'https://x' is already online. ERR_NGROK_334" })
};
const tick = () => new Promise((resolve) => setImmediate(resolve));

async function startRunning(provider) {
  const env = load();
  const h = manager(provider, env);
  const child = h.m.startTunnelProcess();
  if (provider === "ngrok") child.line(NG.online(DOMAINS.ngrok), "stdout");
  else child.line(CF.registered);
  return { ...h, env, child };
}

test("Quick Tunnel: 'Tunnel not found' while cloudflared stays alive -> immediate restart, new address expected", async () => {
  const { m, calls, child, env } = await startRunning("cloudflare");
  child.line(CF.serveError);
  for (let i = 0; i < 5; i++) child.line(CF.notFound);
  await tick();
  assert.deepEqual(calls, ["stop-tunnel", "begin-recovery"]);
  assert.equal(m.domain, "", "Quick Tunnel address is dropped (a new one comes from the restart)");
  assert.equal(env.spawned.length, 2);
});

test("Named Tunnel: 'Tunnel not found' while running -> immediate restart with the same token and hostname", async () => {
  const { m, calls, child, env, log } = await startRunning("cloudflare-named");
  child.line(CF.serveError);
  child.line(CF.notFound);
  await tick();
  assert.deepEqual(calls, ["stop-tunnel", "begin-recovery"], "named tunnel must restart without waiting for exit");
  assert.equal(m.domain, DOMAINS["cloudflare-named"], "fixed hostname kept");
  assert.equal(env.spawned.length, 2);
  assert.deepEqual(env.spawned[1].args, env.spawned[0].args);
  assert.deepEqual([...env.spawned[1].args], ["tunnel", "run"]);
  assert.equal(env.spawned[1].env.TUNNEL_TOKEN, "named-token-1", "same tunnel token reused");
  assert.ok(log.some((l) => /Named Tunnel was not found/.test(l)), "reason written to the output channel");
});

test("Named Tunnel: 'Unauthorized' register error while running -> immediate restart", async () => {
  const { calls, child } = await startRunning("cloudflare-named");
  child.line(CF.unauthorized);
  await tick();
  assert.deepEqual(calls, ["stop-tunnel", "begin-recovery"]);
});

test("Named Tunnel: disconnect without re-register restarts after the deadline; MCP server untouched", async () => {
  const { m, calls, child, env } = await startRunning("cloudflare-named");
  child.line(CF.serveError);
  child.line(CF.retry);
  assert.equal(m.state, "starting", "Bridge page shows reconnecting");
  assert.ok(env.timers.some((t) => t.ms === 9e4), "90 s deadline armed");
  env.fire();
  await tick();
  assert.deepEqual(calls, ["stop-tunnel", "begin-recovery"]);
  assert.equal(m.domain, DOMAINS["cloudflare-named"]);
  assert.ok(!calls.includes("mcp-stop") && !calls.includes("mcp-sessions-destroyed"));
});

test("Named Tunnel: transient disconnect that re-registers recovers in place and says so", async () => {
  const { m, calls, child, env, log } = await startRunning("cloudflare-named");
  child.line(CF.serveError);
  child.line(CF.registered);
  env.fire();
  await tick();
  assert.deepEqual(calls, []);
  assert.equal(m.state, "running");
  assert.ok(log.some((l) => /re-registered; tunnel recovered in place/.test(l)));
});

test("ngrok reserved domain: fatal session error (ERR_NGROK_107) -> immediate restart for the same --url", async () => {
  const { m, calls, child, env, log } = await startRunning("ngrok");
  child.line(NG.offline, "stdout");
  child.line(NG.auth, "stdout");
  await tick();
  assert.deepEqual(calls, ["stop-tunnel", "begin-recovery"]);
  assert.equal(m.domain, DOMAINS.ngrok);
  assert.ok(env.spawned[1].args.includes(`https://${DOMAINS.ngrok}`), "restart reuses the reserved domain");
  assert.deepEqual([...env.spawned[1].args], [...env.spawned[0].args]);
  assert.ok(log.some((l) => /ERR_NGROK_107/.test(l)));
});

test("ngrok reserved domain: endpoint taken while running (ERR_NGROK_334) -> immediate restart", async () => {
  const { calls, child } = await startRunning("ngrok");
  child.line(NG.busy, "stdout");
  await tick();
  assert.deepEqual(calls, ["stop-tunnel", "begin-recovery"]);
});

test("ngrok reserved domain: offline with no recovery restarts after the 60 s deadline (regression)", async () => {
  const { calls, child, env } = await startRunning("ngrok");
  child.line(NG.offline, "stdout");
  for (let i = 0; i < 20 && !calls.length; i++) { env.fire(); await tick(); }
  assert.deepEqual(calls, ["stop-tunnel", "begin-recovery"]);
});

for (const provider of ["cloudflare", "cloudflare-named", "ngrok"]) {
  test(`${provider}: process exit -> reconnect without stopping the local MCP server`, async () => {
    const { m, calls, child } = await startRunning(provider);
    child.exitCode = 1;
    child.emit("exit", 1, null);
    assert.deepEqual(calls, ["begin-recovery"]);
    assert.equal(m.domain, provider === "cloudflare" ? "" : DOMAINS[provider]);
  });
}

/** Run the real beginTunnelRecovery with immediate timers; `outcomes` decides each startTunnelOnce attempt. */
async function recover(provider, outcomes) {
  const env = load({ immediate: true });
  const h = manager(provider, env);
  h.m.beginTunnelRecovery = env.api.methods.beginTunnelRecovery;
  let attempts = 0;
  h.m.startTunnelOnce = async () => {
    const outcome = outcomes[Math.min(attempts, outcomes.length - 1)];
    attempts += 1;
    if (attempts >= 12) h.m.stoppingResources = true; // harness guard against an endless loop
    if (outcome instanceof Error) throw outcome;
  };
  h.m.state = "starting";
  h.m.beginTunnelRecovery();
  await h.m.tunnelRecoveryPromise;
  return { ...h, env, attempts: () => attempts };
}

test("fixed-address modes back off exponentially with a 60 s ceiling, then reconnect when the network is back", async () => {
  for (const provider of ["cloudflare-named", "ngrok"]) {
    const fail = new Error("dial tcp: i/o timeout");
    const r = await recover(provider, [fail, fail, fail, fail, fail, fail, fail, fail, "ok"]);
    assert.equal(r.attempts(), 9);
    assert.deepEqual(r.env.delays, [1e3, 2e3, 4e3, 8e3, 15e3, 3e4, 6e4, 6e4, 6e4], provider);
    assert.equal(r.m.state, "running");
  }
});

test("Quick Tunnel keeps its 1-minute spacing between new-tunnel attempts", async () => {
  const fail = new Error("failed to request quick tunnel: dial tcp: i/o timeout");
  const r = await recover("cloudflare", [fail, fail, "ok"]);
  assert.deepEqual(r.env.delays, [1e3, 6e4, 6e4]);
  assert.equal(r.m.state, "running");
});

test("Quick Tunnel waits 15 minutes after a trycloudflare.com rate limit (429 / 1015)", async () => {
  const fail = new Error("failed to request quick tunnel: 429 Too Many Requests");
  const r = await recover("cloudflare", [fail, fail, "ok"]);
  assert.deepEqual(r.env.delays, [1e3, 15 * 60e3, 15 * 60e3]);
  assert.equal(r.m.state, "running");
});

test("Named Tunnel token rejected at every restart: stops after 3 attempts with an error instead of looping", async () => {
  const r = await recover("cloudflare-named", [new Error("Cloudflare Named Tunnel authentication failed. Rotate or recopy the Tunnel Token.")]);
  assert.equal(r.attempts(), 3);
  assert.equal(r.m.state, "error");
  assert.ok(r.log.some((l) => /stopped reconnecting/.test(l)));
});

test("recovery message: fixed address says unchanged, Quick Tunnel says the address is new", async () => {
  const named = await recover("cloudflare-named", ["ok"]);
  assert.ok(named.log.some((l) => /tunnel recovered: https:\/\/mcp\.named\.example\/.*fixed address unchanged/.test(l)), named.log.join("\n"));
  assert.ok(named.m.revision > 0, "Bridge page refreshed (revision bumped)");
  const quick = await recover("cloudflare", ["ok"]);
  assert.ok(quick.log.some((l) => /cloudflare tunnel recovered: .*new Quick Tunnel address/.test(l)));
});

test("MCP transport answers an unknown session with 404 and accepts a fresh initialize (client can re-initialize)", () => {
  const transport = fs.readFileSync(path.join(dir, "module-0119.mjs"), "utf8");
  assert.match(transport, /writeBridgeJsonError\(response, 404, "Session not found/);
  assert.match(transport, /if \(!isInitializeRequest2\(body\)\)/);
});
