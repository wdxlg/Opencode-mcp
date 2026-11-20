// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/bridge-tunnel-lease.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/bridge-tunnel-lease.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_child_process5 = require("node:child_process");

var import_node_crypto15 = require("node:crypto");

var import_node_fs21 = require("node:fs");

var import_node_net4 = require("node:net");

var import_node_os5 = __toESM(require("node:os"));

var import_node_path25 = __toESM(require("node:path"));

var import_node_util = require("node:util");

var execFileAsync = (0, import_node_util.promisify)(import_node_child_process5.execFile);

var hash = (value) => (0, import_node_crypto15.createHash)("sha256").update(value).digest("hex");

function bridgeTunnelLeaseResources(input) {
  if (input.provider === "cloudflare" || input.provider === "tailscale") return [];
  if (input.provider === "ngrok") {
    const resources2 = ["provider:ngrok"];
    const domain2 = input.configuredDomain;
    if (domain2) resources2.push(`domain:${domain2.trim().toLowerCase()}`);
    return resources2;
  }
  const domain = input.configuredNamedDomain;
  const resources = domain ? [`domain:${domain.trim().toLowerCase()}`] : [];
  if (input.namedTunnelToken) {
    resources.push(`named-credential:${hash(input.namedTunnelToken)}`);
  }
  return resources;
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error2) => error2 && error2.code !== "ERR_SERVER_NOT_RUNNING" ? reject(error2) : resolve());
  });
}

var uid = () => typeof process.getuid === "function" ? process.getuid() : 0;

function linuxLeaseAddress(resource) {
  return `\0opencode-bridge-v1-${uid()}-${hash(resource).slice(0, 48)}`;
}

function win32LeaseName(resource) {
  return `\\\\?\\pipe\\opencode-bridge-v1-${uid()}-${hash(resource).slice(0, 48)}`;
}

function pathLeaseDirectory() {
  const name = `opencode-lease-${uid()}`;
  const preferred = import_node_path25.default.join(import_node_os5.default.tmpdir(), name);
  return Buffer.byteLength(preferred) + 1 + 24 + 5 < 104 ? preferred : import_node_path25.default.join("/tmp", name);
}

function ensurePrivateDirectory(directory) {
  (0, import_node_fs21.mkdirSync)(directory, { recursive: true, mode: 448 });
  if (process.platform === "win32") {
    return;
  }
  const stat9 = (0, import_node_fs21.lstatSync)(directory);
  if (!stat9.isDirectory() || stat9.isSymbolicLink()) throw new Error(`Bridge lease directory ${directory} is not a private directory.`);
  if (stat9.uid !== uid()) throw new Error(`Bridge lease directory ${directory} is owned by another user.`);
  if ((stat9.mode & 63) !== 0) (0, import_node_fs21.chmodSync)(directory, 448);
}

function pathLeaseSocket(resource) {
  return import_node_path25.default.join(pathLeaseDirectory(), `${hash(resource).slice(0, 24)}.sock`);
}

function pathLeaseAddress(resource) {
  ensurePrivateDirectory(pathLeaseDirectory());
  return pathLeaseSocket(resource);
}

function listenOnce(server, address) {
  return new Promise((resolve, reject) => {
    const onError = (error2) => {
      server.off("listening", onListening);
      reject(error2);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(address);
  });
}

function probeAlive(address) {
  return new Promise((resolve) => {
    const socket = (0, import_node_net4.connect)(address);
    const done = (alive) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(alive);
    };
    socket.once("connect", () => done(true));
    socket.once("error", (error2) => done(!(error2.code === "ECONNREFUSED" || error2.code === "ENOENT")));
    socket.setTimeout(2e3, () => done(true));
  });
}

function fileIdentity(address) {
  try {
    const stat9 = (0, import_node_fs21.lstatSync)(address);
    return `${stat9.dev}:${stat9.ino}:${stat9.birthtimeMs}:${stat9.ctimeMs}`;
  } catch {
    return void 0;
  }
}

async function listenPathLease(server, address, conflictMessage) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await listenOnce(server, address);
      return;
    } catch (error2) {
      if (error2.code !== "EADDRINUSE" || attempt === 1) {
        throw error2.code === "EADDRINUSE" ? new BridgeTunnelLeaseConflictError(conflictMessage) : error2;
      }
      const identity = fileIdentity(address);
      if (await probeAlive(address)) throw new BridgeTunnelLeaseConflictError(conflictMessage);
      if (identity !== void 0 && fileIdentity(address) === identity) {
        try {
          (0, import_node_fs21.unlinkSync)(address);
        } catch (unlinkError) {
          if (unlinkError.code !== "ENOENT") throw unlinkError;
        }
      }
    }
  }
}

var BridgeTunnelLeaseConflictError = class extends Error {
  isBridgeTunnelLeaseConflict = true;
  constructor(message2) {
    super(message2);
    this.name = "BridgeTunnelLeaseConflictError";
  }
};

function isBridgeTunnelLeaseConflict(error2) {
  return error2 instanceof BridgeTunnelLeaseConflictError || typeof error2 === "object" && error2 !== null && error2.isBridgeTunnelLeaseConflict === true;
}

async function acquireBridgeTunnelLease(resources, conflictMessage = "This fixed Bridge endpoint or Named Tunnel credential is already in use by another OpenCode window. Use a different domain/tunnel, or stop its owning Bridge first. No other process was stopped.") {
  const held = [];
  const kernelReleased = process.platform === "linux" || process.platform === "win32";
  try {
    for (const resource of [...new Set(resources)].sort()) {
      const server = (0, import_node_net4.createServer)((socket) => socket.destroy());
      if (kernelReleased) {
        const address = process.platform === "win32" ? win32LeaseName(resource) : linuxLeaseAddress(resource);
        try {
          await listenOnce(server, address);
        } catch (error2) {
          throw error2.code === "EADDRINUSE" ? new BridgeTunnelLeaseConflictError(conflictMessage) : error2;
        }
      } else {
        await listenPathLease(server, pathLeaseAddress(resource), conflictMessage);
      }
      server.unref();
      held.push(server);
    }
  } catch (error2) {
    await Promise.all(held.map(closeServer));
    throw error2;
  }
  let releasing;
  return () => releasing ??= Promise.all(held.map(closeServer)).then(() => void 0);
}

function tunnelOwnershipFile(resources) {
  if (!resources.length) return void 0;
  const key = [...new Set(resources)].sort().join("\n");
  return import_node_path25.default.join(pathLeaseDirectory(), `tunnel-owner-${hash(key).slice(0, 16)}.json`);
}

function recordTunnelOwnership(resources, record4) {
  try {
    const file = tunnelOwnershipFile(resources);
    if (!file) return;
    ensurePrivateDirectory(pathLeaseDirectory());
    (0, import_node_fs21.writeFileSync)(file, JSON.stringify(record4), { mode: 384 });
  } catch {
  }
}

function parseTunnelOwnershipRecord(value) {
  if (typeof value !== "object" || value === null) return void 0;
  const record4 = value;
  if (typeof record4.pid !== "number" || !Number.isInteger(record4.pid) || record4.pid <= 0) return void 0;
  if (typeof record4.image !== "string" || !record4.image) return void 0;
  if (record4.provider !== "ngrok" && record4.provider !== "cloudflare-named") return void 0;
  if (typeof record4.domain !== "string") return void 0;
  if (typeof record4.localPort !== "number" || !Number.isInteger(record4.localPort) || record4.localPort <= 0) return void 0;
  if (typeof record4.startedAt !== "number" || !Number.isFinite(record4.startedAt) || record4.startedAt <= 0) return void 0;
  return { pid: record4.pid, image: record4.image, provider: record4.provider, domain: record4.domain, localPort: record4.localPort, startedAt: record4.startedAt };
}

function readTunnelOwnership(resources) {
  try {
    const file = tunnelOwnershipFile(resources);
    if (!file) return void 0;
    return parseTunnelOwnershipRecord(JSON.parse((0, import_node_fs21.readFileSync)(file, "utf8")));
  } catch {
    return void 0;
  }
}

function removeOwnershipFile(file) {
  try {
    (0, import_node_fs21.unlinkSync)(file);
  } catch (error2) {
    if (error2.code !== "ENOENT") throw error2;
  }
}

function clearTunnelOwnership(resources, pid) {
  try {
    const file = tunnelOwnershipFile(resources);
    if (!file) return;
    if (readTunnelOwnership(resources)?.pid !== pid) return;
    removeOwnershipFile(file);
  } catch {
  }
}

function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error2) {
    return error2.code === "EPERM";
  }
}

var OWNERSHIP_START_TIME_SKEW_MS = 18e4;

function startTimeMatches(startedAt, actualStartMs) {
  if (actualStartMs === void 0 || !Number.isFinite(actualStartMs)) return false;
  return Math.abs(actualStartMs - startedAt) <= OWNERSHIP_START_TIME_SKEW_MS;
}

function commandLineMatches(provider, commandLine, domain, localPort) {
  const lower = commandLine.toLowerCase();
  if (provider === "ngrok") {
    return lower.includes(` ${localPort} `) && (domain === "" || lower.includes(domain.toLowerCase()));
  }
  return lower.includes("tunnel") && lower.includes("run");
}

async function verifyCandidateWindows(pid, expected) {
  let image = "";
  try {
    const { stdout } = await execFileAsync("tasklist", ["/FI", `PID eq ${pid}`, "/FO", "CSV", "/NH"], { windowsHide: true, timeout: 1e4 });
    const first = stdout.split("\n").map((line) => line.trim()).filter(Boolean)[0] ?? "";
    image = /^"([^"]+)"/.exec(first)?.[1] ?? "";
  } catch {
    return { verified: false, reason: "image lookup failed" };
  }
  if (image.toLowerCase() !== expected.image.toLowerCase()) {
    return { verified: false, reason: `image mismatch (${image || "unknown"} is not ${expected.image})` };
  }
  try {
    const { stdout } = await execFileAsync("powershell.exe", ["-NoProfile", "-Command", `(Get-CimInstance Win32_Process -Filter "ProcessId=${pid}" | Select-Object CommandLine,CreationDate | ConvertTo-Json -Compress)`], { windowsHide: true, timeout: 15e3 });
    const parsed = JSON.parse(stdout);
    const commandLine = typeof parsed.CommandLine === "string" ? parsed.CommandLine : "";
    const rawDate = typeof parsed.CreationDate === "string" ? parsed.CreationDate : "";
    const createdMs = /\/Date\((\d+)(?:[+-]\d{4})?\)\//.exec(rawDate)?.[1];
    if (!commandLineMatches(expected.provider, commandLine, expected.domain, expected.localPort)) {
      return { verified: false, reason: "command line does not match our endpoint" };
    }
    if (!startTimeMatches(expected.startedAt, createdMs === void 0 ? void 0 : Number(createdMs))) {
      return { verified: false, reason: "process start time does not match our record (likely PID reuse)" };
    }
    return { verified: true, reason: "image, command line and start time match" };
  } catch {
    return { verified: false, reason: "command-line lookup failed" };
  }
}

async function verifyCandidateLinux(pid, expected) {
  let commandLine;
  let image;
  let startMs;
  try {
    commandLine = (0, import_node_fs21.readFileSync)(`/proc/${pid}/cmdline`, "utf8").split("\0").join(" ");
    image = import_node_path25.default.basename((0, import_node_fs21.readlinkSync)(`/proc/${pid}/exe`));
    startMs = (0, import_node_fs21.statSync)(`/proc/${pid}`).mtimeMs;
  } catch {
    return { verified: false, reason: "process vanished during verification" };
  }
  if (image.toLowerCase() !== expected.image.toLowerCase()) {
    return { verified: false, reason: `image mismatch (${image} is not ${expected.image})` };
  }
  if (!commandLineMatches(expected.provider, commandLine, expected.domain, expected.localPort)) {
    return { verified: false, reason: "command line does not match our endpoint" };
  }
  if (!startTimeMatches(expected.startedAt, startMs)) {
    return { verified: false, reason: "process start time does not match our record (likely PID reuse)" };
  }
  return { verified: true, reason: "image, command line and start time match" };
}

function parseElapsedTimeMs(value) {
  const match = /^(?:(\d+)-)?(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return void 0;
  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3]);
  const seconds = Number(match[4]);
  if (![days, hours, minutes, seconds].every(Number.isFinite)) return void 0;
  return ((days * 24 + hours) * 3600 + minutes * 60 + seconds) * 1e3;
}

async function verifyCandidateDarwin(pid, expected) {
  const query = async (field3) => {
    const { stdout } = await execFileAsync("ps", ["-p", String(pid), "-o", `${field3}=`], { timeout: 1e4 });
    return stdout.split("\n").map((line) => line.trim()).filter(Boolean)[0] ?? "";
  };
  try {
    const comm = await query("comm");
    if (!comm) return { verified: false, reason: "process vanished during verification" };
    if (import_node_path25.default.basename(comm).toLowerCase() !== expected.image.toLowerCase()) {
      return { verified: false, reason: `image mismatch (${comm} is not ${expected.image})` };
    }
    if (!commandLineMatches(expected.provider, await query("args"), expected.domain, expected.localPort)) {
      return { verified: false, reason: "command line does not match our endpoint" };
    }
    const elapsedMs = parseElapsedTimeMs(await query("etime"));
    if (elapsedMs === void 0 || !startTimeMatches(expected.startedAt, Date.now() - elapsedMs)) {
      return { verified: false, reason: "process start time does not match our record (likely PID reuse)" };
    }
    return { verified: true, reason: "image, command line and start time match" };
  } catch {
    return { verified: false, reason: "process lookup failed" };
  }
}

async function terminateVerifiedCandidate(pid) {
  const sleep3 = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  try {
    process.kill(pid, "SIGTERM");
  } catch {
  }
  await sleep3(1e3);
  if (!isPidAlive(pid)) return true;
  try {
    if (process.platform === "win32") {
      await execFileAsync("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true, timeout: 1e4 });
    } else {
      process.kill(pid, "SIGKILL");
    }
  } catch {
  }
  await sleep3(1e3);
  return !isPidAlive(pid);
}

async function reclaimStaleTunnelOwner(resources, expectedImage) {
  try {
    const file = tunnelOwnershipFile(resources);
    if (!file) return { action: "skipped", reason: "not a singleton scope" };
    let record4;
    try {
      record4 = parseTunnelOwnershipRecord(JSON.parse((0, import_node_fs21.readFileSync)(file, "utf8")));
    } catch {
      record4 = void 0;
    }
    if (!record4) {
      removeOwnershipFile(file);
      return { action: "skipped", reason: "no ownership record" };
    }
    if (record4.pid === process.pid) return { action: "skipped", pid: record4.pid, reason: "record names this process" };
    if (!isPidAlive(record4.pid)) {
      if (readTunnelOwnership(resources)?.pid === record4.pid) removeOwnershipFile(file);
      return { action: "skipped", pid: record4.pid, reason: "previous tunnel already exited" };
    }
    const verify = process.platform === "win32" ? verifyCandidateWindows : process.platform === "darwin" ? verifyCandidateDarwin : verifyCandidateLinux;
    const verdict = await verify(record4.pid, { image: expectedImage, provider: record4.provider, domain: record4.domain, localPort: record4.localPort, startedAt: record4.startedAt });
    if (!verdict.verified) return { action: "skipped", pid: record4.pid, reason: verdict.reason };
    if (!await terminateVerifiedCandidate(record4.pid)) {
      return { action: "failed", pid: record4.pid, reason: `previous tunnel (pid ${record4.pid}) is still running and could not be stopped` };
    }
    if (readTunnelOwnership(resources)?.pid === record4.pid) removeOwnershipFile(file);
    return { action: "reclaimed", pid: record4.pid, reason: verdict.reason };
  } catch (error2) {
    return { action: "skipped", reason: `reclaim error: ${error2 instanceof Error ? error2.message : String(error2)}` };
  }
}
export { bridgeTunnelLeaseResources, closeServer, linuxLeaseAddress, win32LeaseName, pathLeaseDirectory, ensurePrivateDirectory, pathLeaseSocket, pathLeaseAddress, listenOnce, probeAlive, fileIdentity, listenPathLease, isBridgeTunnelLeaseConflict, acquireBridgeTunnelLease, tunnelOwnershipFile, recordTunnelOwnership, parseTunnelOwnershipRecord, readTunnelOwnership, removeOwnershipFile, clearTunnelOwnership, isPidAlive, startTimeMatches, commandLineMatches, verifyCandidateWindows, verifyCandidateLinux, parseElapsedTimeMs, verifyCandidateDarwin, terminateVerifiedCandidate, reclaimStaleTunnelOwner, import_node_child_process5, import_node_crypto15, import_node_fs21, import_node_net4, import_node_os5, import_node_path25, import_node_util, execFileAsync, hash, uid, BridgeTunnelLeaseConflictError, OWNERSHIP_START_TIME_SKEW_MS };
