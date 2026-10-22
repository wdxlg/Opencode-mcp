// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/agentHost/node/wslRemoteAgentHostService.ts
import { Disposable, toDisposable } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";
import { composeAgentHostBootstrapScript, decodeWslOutput, getWslExePath, isWSLSupported, parseRunningDistros, parseWslListVerbose, runWslCommand, validateDistroName } from "./module-0233.mjs";
import { localize } from "./module-0007.mjs";
import { telemetryLevelToAgentHostValue } from "./module-0216.mjs";
import { extractAgentHostWebSocketURL, redactToken, resolveRemotePlatform } from "./module-0219.mjs";
import { removeAnsiEscapeCodes } from "./module-0022.mjs";
import { generateUuid } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0044.mjs";
import { IProductService } from "./module-0045.mjs";
import { ITelemetryService } from "./module-0085.mjs";


// src/vs/platform/agentHost/node/wslRemoteAgentHostService.ts
import * as cp4 from "child_process";


// src/vs/platform/agentHost/node/wslRemoteAgentHostService.ts
var LOG_PREFIX3 = "[WSLRemoteAgentHost]";

var AGENT_HOST_READY_TIMEOUT_MS = 6e4;

var WEBSOCKET_OPEN_TIMEOUT_MS = 3e4;

var OUTPUT_BUFFER_LINES = 50;

var WSLRemoteAgentHostMainService = class extends Disposable {
  constructor(_logService, _productService, _telemetryService) {
    super();
    this._logService = _logService;
    this._productService = _productService;
    this._telemetryService = _telemetryService;
    this._onDidChangeConnections = this._register(new Emitter());
    this.onDidChangeConnections = this._onDidChangeConnections.event;
    this._onDidCloseConnection = this._register(new Emitter());
    this.onDidCloseConnection = this._onDidCloseConnection.event;
    this._onDidReportConnectProgress = this._register(new Emitter());
    this.onDidReportConnectProgress = this._onDidReportConnectProgress.event;
    this._onDidRelayMessage = this._register(new Emitter());
    this.onDidRelayMessage = this._onDidRelayMessage.event;
    this._onDidRelayClose = this._register(new Emitter());
    this.onDidRelayClose = this._onDidRelayClose.event;
    this._connections = /* @__PURE__ */ new Map();
    this._distroToConnectionId = /* @__PURE__ */ new Map();
    this._register(toDisposable(() => {
      for (const id2 of [...this._connections.keys()]) {
        this._closeConnection(id2);
      }
    }));
  }
  get _quality() {
    return this._productService.quality || "insider";
  }
  get _serverDataFolderName() {
    const value = this._productService.serverDataFolderName;
    if (!value) {
      throw new Error(`${LOG_PREFIX3} productService.serverDataFolderName is required`);
    }
    return value;
  }
  get _commit() {
    return this._productService.commit;
  }
  /** Lazily load `require` so the `ws` native module is only resolved at runtime. */
  async _getNativeRequire() {
    if (!this._nativeRequire) {
      const nodeModule = await import("node:module");
      this._nativeRequire = nodeModule.createRequire(import.meta.url);
    }
    return this._nativeRequire;
  }
  async isWSLAvailable() {
    return isWSLSupported();
  }
  async listDistros() {
    try {
      const [verbose, running] = await Promise.all([
        runWslCommand(["--list", "--verbose"]),
        runWslCommand(["--list", "--running", "--quiet"])
      ]);
      if (verbose.exitCode !== 0) {
        this._logService.info(`${LOG_PREFIX3} wsl --list --verbose exited ${verbose.exitCode}: ${verbose.stderr.trim()}`);
        return [];
      }
      const parsed = parseWslListVerbose(verbose.stdout);
      if (running.exitCode !== 0) {
        return parsed;
      }
      const runningSet = new Set(parseRunningDistros(running.stdout));
      return parsed.map((d) => ({ ...d, isRunning: runningSet.has(d.name) }));
    } catch (err) {
      this._logService.warn(`${LOG_PREFIX3} listDistros failed`, err);
      return [];
    }
  }
  async listRunningDistros() {
    try {
      const result = await runWslCommand(["--list", "--running", "--quiet"]);
      if (result.exitCode !== 0) {
        return [];
      }
      return parseRunningDistros(result.stdout);
    } catch (err) {
      this._logService.warn(`${LOG_PREFIX3} listRunningDistros failed`, err);
      return [];
    }
  }
  async connect(config) {
    const distro = validateDistroName(config.distro);
    const existingId = this._distroToConnectionId.get(distro);
    if (existingId) {
      const existing = this._connections.get(existingId);
      if (existing) {
        return {
          connectionId: existing.connectionId,
          address: existing.address,
          distro: existing.distro,
          name: existing.name,
          connectionToken: existing.connectionToken
        };
      }
    }
    const connectionKey = `wsl:${distro}`;
    const reportProgress = (message) => {
      this._onDidReportConnectProgress.fire({ connectionKey, message });
    };
    reportProgress(localize(2732, null, distro));
    const { os: targetOs, arch: targetArch } = await this._resolvePlatform(distro);
    reportProgress(localize(2733, null, distro));
    const script = composeAgentHostBootstrapScript({
      serverDataFolderName: this._serverDataFolderName,
      quality: this._quality,
      commit: this._commit,
      os: targetOs,
      arch: targetArch,
      telemetryLevel: telemetryLevelToAgentHostValue(this._telemetryService.telemetryLevel),
      remoteAgentHostCommand: config.remoteAgentHostCommand
    });
    this._logService.info(`${LOG_PREFIX3} Spawning agent host in WSL distro '${distro}'`);
    this._logService.trace(`${LOG_PREFIX3} bootstrap script: ${script}`);
    const child = cp4.spawn(getWslExePath(), ["-d", distro, "-e", "bash", "-lc", script], {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let url;
    let urlResolve;
    let urlReject;
    const urlPromise = new Promise((res, rej) => {
      urlResolve = res;
      urlReject = rej;
    });
    const outputLines = [];
    const appendLine = (line) => {
      outputLines.push(redactToken(line));
      if (outputLines.length > OUTPUT_BUFFER_LINES) {
        outputLines.shift();
      }
    };
    const onStreamData = (data) => {
      const cleanText = removeAnsiEscapeCodes(decodeWslOutput(data));
      for (const rawLine of cleanText.split(/\r\n|\r|\n/)) {
        const line = rawLine.trimEnd();
        if (!line) {
          continue;
        }
        appendLine(line);
        this._logService.trace(`${LOG_PREFIX3} [${distro}] ${redactToken(line)}`);
        if (!url) {
          const match = extractAgentHostWebSocketURL(line);
          if (match) {
            url = match.url;
            urlResolve?.({ url: match.url, token: match.token });
          }
        }
      }
    };
    child.stdout?.on("data", onStreamData);
    child.stderr?.on("data", onStreamData);
    const childExited = new Promise((res) => {
      child.once("exit", (code, signal) => res({ code, signal }));
    });
    const readyTimeoutHandle = setTimeout(() => {
      urlReject?.(new Error(`${LOG_PREFIX3} Timed out waiting for agent host in '${distro}' to print its WebSocket URL after ${AGENT_HOST_READY_TIMEOUT_MS}ms.
Output: ${outputLines.join("\n")}`));
    }, AGENT_HOST_READY_TIMEOUT_MS);
    const earlyExitGuard = childExited.then(({ code, signal }) => {
      if (!url) {
        urlReject?.(new Error(`${LOG_PREFIX3} Agent host in '${distro}' exited (code=${code}, signal=${signal}) before printing its WebSocket URL.
Output: ${outputLines.join("\n")}`));
      }
    });
    let resolvedUrl;
    try {
      resolvedUrl = await urlPromise;
    } catch (err) {
      clearTimeout(readyTimeoutHandle);
      this._killChild(child);
      await earlyExitGuard.catch(() => {
      });
      throw err;
    }
    clearTimeout(readyTimeoutHandle);
    reportProgress(localize(2731, null, distro));
    let ws;
    try {
      ws = await this._openWebSocket(resolvedUrl.url);
    } catch (err) {
      this._killChild(child);
      throw err;
    }
    const connectionId = generateUuid();
    const connection = {
      connectionId,
      distro,
      name: config.name,
      address: connectionKey,
      connectionToken: resolvedUrl.token,
      child,
      ws
    };
    ws.on("message", (data) => {
      let text;
      if (typeof data === "string") {
        text = data;
      } else if (Array.isArray(data)) {
        text = Buffer.concat(data).toString("utf8");
      } else if (data instanceof ArrayBuffer) {
        text = Buffer.from(new Uint8Array(data)).toString("utf8");
      } else {
        text = data.toString("utf8");
      }
      this._onDidRelayMessage.fire({ connectionId, data: text });
    });
    ws.on("close", () => {
      this._closeConnection(connectionId);
    });
    ws.on("error", (err) => {
      this._logService.warn(`${LOG_PREFIX3} WebSocket error for ${connectionKey}: ${err instanceof Error ? err.message : String(err)}`);
    });
    this._connections.set(connectionId, connection);
    this._distroToConnectionId.set(distro, connectionId);
    this._onDidChangeConnections.fire();
    return {
      connectionId,
      address: connectionKey,
      distro,
      name: config.name,
      connectionToken: resolvedUrl.token
    };
  }
  async disconnect(distro) {
    const id2 = this._distroToConnectionId.get(distro);
    if (id2) {
      this._closeConnection(id2);
    }
  }
  async reconnect(distro, name, remoteAgentHostCommand) {
    const existingId = this._distroToConnectionId.get(distro);
    if (existingId) {
      this._closeConnection(existingId);
    }
    return this.connect({ distro, name, remoteAgentHostCommand });
  }
  async relaySend(connectionId, message) {
    const conn = this._connections.get(connectionId);
    if (!conn) {
      this._logService.debug(`${LOG_PREFIX3} relaySend: no connection ${connectionId}`);
      return;
    }
    try {
      conn.ws.send(message);
    } catch (err) {
      this._logService.warn(`${LOG_PREFIX3} relaySend failed for ${connectionId}`, err);
    }
  }
  _closeConnection(connectionId) {
    const conn = this._connections.get(connectionId);
    if (!conn) {
      return;
    }
    this._connections.delete(connectionId);
    if (this._distroToConnectionId.get(conn.distro) === connectionId) {
      this._distroToConnectionId.delete(conn.distro);
    }
    try {
      conn.ws.close();
    } catch {
    }
    this._killChild(conn.child);
    this._onDidRelayClose.fire(connectionId);
    this._onDidCloseConnection.fire(connectionId);
    this._onDidChangeConnections.fire();
  }
  _killChild(child) {
    if (child.exitCode !== null || child.signalCode !== null) {
      return;
    }
    try {
      child.kill();
    } catch {
    }
    const escalate = setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) {
        try {
          child.kill("SIGKILL");
        } catch {
        }
      }
    }, 2e3);
    escalate.unref();
    child.once("exit", () => clearTimeout(escalate));
  }
  async _resolvePlatform(distro) {
    const result = await runWslCommand(["-e", "uname", "-s", "-m"], { distro, timeout: 1e4 });
    if (result.exitCode !== 0) {
      throw new Error(`${LOG_PREFIX3} Failed to detect platform in '${distro}' (exit ${result.exitCode}): ${result.stderr.trim() || result.stdout.trim()}`);
    }
    const tokens = result.stdout.trim().split(/\s+/);
    if (tokens.length < 2) {
      throw new Error(`${LOG_PREFIX3} Unexpected uname output from '${distro}': ${JSON.stringify(result.stdout)}`);
    }
    const resolved = resolveRemotePlatform(tokens[0], tokens.slice(1).join(" "));
    if (!resolved) {
      throw new Error(localize(2734, null, result.stdout.trim()));
    }
    return resolved;
  }
  async _openWebSocket(url) {
    const nativeRequire = await this._getNativeRequire();
    const WS = nativeRequire("ws");
    const deadline = Date.now() + WEBSOCKET_OPEN_TIMEOUT_MS;
    let lastError;
    for (let attempt = 0; ; attempt++) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        throw new Error(`${LOG_PREFIX3} Timed out opening WebSocket to ${redactToken(url)} after ${WEBSOCKET_OPEN_TIMEOUT_MS}ms${lastError ? `: ${lastError instanceof Error ? lastError.message : String(lastError)}` : ""}`);
      }
      try {
        return await this._tryOpenWebSocket(new WS(url), url, remaining);
      } catch (err) {
        lastError = err;
        if (!isConnectionRefused(err)) {
          throw err;
        }
        const delay = Math.min(100 + attempt * 100, 500);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  _tryOpenWebSocket(ws, url, timeoutMs) {
    return new Promise((resolve3, reject) => {
      const timeoutHandle = setTimeout(() => {
        try {
          ws.close();
        } catch {
        }
        reject(new Error(`${LOG_PREFIX3} Timed out opening WebSocket to ${redactToken(url)} after ${timeoutMs}ms`));
      }, timeoutMs);
      ws.once("open", () => {
        clearTimeout(timeoutHandle);
        resolve3(ws);
      });
      ws.once("error", (err) => {
        clearTimeout(timeoutHandle);
        try {
          ws.close();
        } catch {
        }
        reject(err);
      });
    });
  }
};

WSLRemoteAgentHostMainService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IProductService),
  __decorateParam(2, ITelemetryService)
], WSLRemoteAgentHostMainService);

function isConnectionRefused(err) {
  if (!err || typeof err !== "object") {
    return false;
  }
  const code = err.code;
  if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "EADDRNOTAVAIL") {
    return true;
  }
  const errors = err.errors;
  if (Array.isArray(errors)) {
    return errors.some(isConnectionRefused);
  }
  return false;
}
export { isConnectionRefused, cp4, LOG_PREFIX3, AGENT_HOST_READY_TIMEOUT_MS, WEBSOCKET_OPEN_TIMEOUT_MS, OUTPUT_BUFFER_LINES, WSLRemoteAgentHostMainService };
