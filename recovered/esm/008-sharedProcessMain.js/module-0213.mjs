// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/agentHost/node/sshRemoteAgentHostService.ts
import { buildAgentHostBaseCommand, buildAgentHostSpawnCommand, buildAgentRelayCommand, extractAgentHostWebSocketURL, filterLiveAgentHostEndpoints, getRemoteCLIDataDir, redactToken, resolveRemotePlatform, runAgentEndpoints, shellEscape, validateAgentHostTelemetryLevel, waitForNewStandaloneEndpoint } from "./module-0219.mjs";
import { AgentHostTelemetryLevelEnvKey } from "./module-0215.mjs";
import { removeAnsiEscapeCodes } from "./module-0022.mjs";
import { Disposable, DisposableMap, toDisposable } from "./module-0013.mjs";
import { Emitter, Event } from "./module-0018.mjs";
import { SSHHostKeyDeniedError, computeSSHConnectionKey } from "./module-0212.mjs";
import { raceTimeout } from "./module-0029.mjs";
import { localize } from "./module-0007.mjs";
import { isSameAgentHostEndpointIdentity } from "./module-0218.mjs";
import { CancellationError } from "./module-0003.mjs";
import { basename, dirname, isAbsolute, join } from "./module-0023.mjs";
import { URI } from "./module-0024.mjs";
import { parseSSHConfigHostEntries, parseSSHGOutput, stripSSHComment } from "./module-0221.mjs";
import { computeHostKeyFingerprint, matchKnownHosts, parseKnownHosts, readHostKeyType } from "./module-0214.mjs";
import { telemetryLevelToAgentHostValue } from "./module-0216.mjs";
import { ensureRemoteAgentHostCliInstalled } from "./module-0220.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0044.mjs";
import { IProductService } from "./module-0045.mjs";
import { ITelemetryService } from "./module-0085.mjs";


// src/vs/platform/agentHost/node/sshRemoteAgentHostService.ts
import { promises as fsp } from "fs";

import * as os2 from "os";

import * as cp2 from "child_process";


// src/vs/platform/agentHost/node/sshRemoteAgentHostService.ts
var LOG_PREFIX = "[SSHRemoteAgentHost]";

var RECONNECT_RELAY_TIMEOUT_MS = 6e4;

var HANDSHAKE_TIMEOUT_MS = 3e4;

var INTERACTIVE_TIMEOUT_MS = 3e5;

function describeAuthAttempt(attempt) {
  switch (attempt.type) {
    case "publickey":
      return `publickey ${attempt.keyPath}`;
    case "agent":
      return "agent";
    case "password":
      return "password";
    case "keyboard-interactive":
      return "keyboard-interactive";
  }
}

function toAuthMethod(attempt, kbiHandler, keyPassphraseHandler, callback) {
  switch (attempt.type) {
    case "publickey": {
      const { keyPath: _kp, encrypted: _encrypted, ...payload } = attempt;
      if (attempt.encrypted) {
        if (!keyPassphraseHandler) {
          return void 0;
        }
        keyPassphraseHandler(attempt.keyPath, (passphrase) => {
          if (passphrase === void 0) {
            callback(false);
            return;
          }
          callback({ ...payload, passphrase });
        });
        return void 0;
      }
      return payload;
    }
    case "agent":
    case "password":
      return attempt;
    case "keyboard-interactive": {
      if (!kbiHandler) {
        return void 0;
      }
      return {
        type: "keyboard-interactive",
        username: attempt.username,
        prompt: (name, instructions, _lang, prompts, finish) => {
          const normalized = prompts.map((p) => ({ prompt: p.prompt, echo: p.echo ?? true }));
          kbiHandler(name, instructions, normalized, (responses) => finish([...responses]));
        }
      };
    }
  }
}

function isMethodAllowedByServer(attempt, methodsLeft) {
  if (!methodsLeft) {
    return true;
  }
  const protocolMethod = attempt.type === "agent" ? "publickey" : attempt.type;
  return methodsLeft.includes(protocolMethod);
}

function makeAuthHandler(attempts, logService, kbiHandler, keyPassphraseHandler) {
  let index = 0;
  return (methodsLeft, _partialSuccess, callback) => {
    while (index < attempts.length) {
      const attempt = attempts[index++];
      if (!isMethodAllowedByServer(attempt, methodsLeft)) {
        logService.info(`${LOG_PREFIX} Skipping ${describeAuthAttempt(attempt)} \u2014 server only allows ${methodsLeft.join(", ")}`);
        continue;
      }
      const method = toAuthMethod(attempt, kbiHandler, keyPassphraseHandler, callback);
      if (!method) {
        if (attempt.type === "publickey" && attempt.encrypted && keyPassphraseHandler) {
          logService.info(`${LOG_PREFIX} Trying auth: ${describeAuthAttempt(attempt)}`);
          return;
        }
        logService.warn(`${LOG_PREFIX} ${describeAuthAttempt(attempt)} skipped: no prompt handler available`);
        continue;
      }
      logService.info(`${LOG_PREFIX} Trying auth: ${describeAuthAttempt(attempt)}`);
      callback(method);
      return;
    }
    logService.info(`${LOG_PREFIX} No more auth methods to try; giving up`);
    callback(false);
  };
}

function readSSHString(buffer2, offset) {
  if (offset + 4 > buffer2.length) {
    return void 0;
  }
  const length = buffer2.readUInt32BE(offset);
  const valueOffset = offset + 4;
  const nextOffset = valueOffset + length;
  if (nextOffset > buffer2.length) {
    return void 0;
  }
  return { value: buffer2.toString("utf8", valueOffset, nextOffset), offset: nextOffset };
}

function isEncryptedPrivateKey(key) {
  const text = key.toString("utf8");
  if (/-----BEGIN ENCRYPTED PRIVATE KEY-----/.test(text) || /Proc-Type:\s*4,ENCRYPTED/i.test(text)) {
    return true;
  }
  const openSSHKey = /-----BEGIN OPENSSH PRIVATE KEY-----([\s\S]+?)-----END OPENSSH PRIVATE KEY-----/.exec(text);
  if (!openSSHKey) {
    return false;
  }
  const data = Buffer.from(openSSHKey[1].replace(/\s+/g, ""), "base64");
  const magic = Buffer.from("openssh-key-v1\0", "utf8");
  if (data.length < magic.length || !data.subarray(0, magic.length).equals(magic)) {
    return false;
  }
  const cipher = readSSHString(data, magic.length);
  return !!cipher && cipher.value !== "none";
}

function sshExec(client, command, opts) {
  return new Promise((resolve3, reject) => {
    client.exec(command, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }
      let stdout = "";
      let stderr = "";
      let settled = false;
      const finish = (error, code) => {
        if (settled) {
          return;
        }
        settled = true;
        if (error) {
          reject(error);
          return;
        }
        if (code !== 0 && !opts?.ignoreExitCode) {
          reject(new Error(`SSH command failed (exit ${code}): ${command}
stderr: ${stderr}`));
        } else {
          resolve3({ stdout, stderr, code: code ?? 0 });
        }
      };
      stream.on("data", (data) => {
        stdout += data.toString();
      });
      stream.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      stream.on("error", (streamErr) => finish(streamErr, void 0));
      stream.on("close", (code) => finish(void 0, code));
    });
  });
}

function bindSshExec(client) {
  return (command, opts) => sshExec(client, command, opts);
}

function startRemoteAgentHost(client, logService, cliBin, cliDataDir, commandOverride, telemetryLevel = "off" /* OFF */) {
  return new Promise((resolve3, reject) => {
    if (!commandOverride && (!cliBin || !cliDataDir)) {
      reject(new Error(`${LOG_PREFIX} startRemoteAgentHost requires either a cliBin+cliDataDir pair or a commandOverride`));
      return;
    }
    const validatedTelemetryLevel = validateAgentHostTelemetryLevel(telemetryLevel);
    const baseCmd = commandOverride ?? buildAgentHostBaseCommand(cliBin, cliDataDir, validatedTelemetryLevel);
    const cmd = `bash -l -c ${shellEscape(`echo VSCODE_PID=$$ && export ${AgentHostTelemetryLevelEnvKey}=${validatedTelemetryLevel} && exec ${baseCmd}`)}`;
    logService.info(`${LOG_PREFIX} Starting remote agent host: ${cmd}`);
    client.exec(cmd, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }
      let resolved = false;
      let outputBuf = "";
      let pid;
      const timeout2 = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error(`${LOG_PREFIX} Timed out waiting for agent host to start.
output so far: ${redactToken(outputBuf)}`));
        }
      }, 6e4);
      const checkForOutput = () => {
        const clean2 = removeAnsiEscapeCodes(outputBuf);
        if (pid === void 0) {
          const pidMatch = clean2.match(/VSCODE_PID=(\d+)/);
          if (pidMatch) {
            pid = parseInt(pidMatch[1], 10);
            logService.info(`${LOG_PREFIX} Remote agent host PID: ${pid}`);
          }
        }
        if (!resolved) {
          const match = extractAgentHostWebSocketURL(clean2);
          if (match) {
            resolved = true;
            clearTimeout(timeout2);
            logService.info(`${LOG_PREFIX} Remote agent host listening on port ${match.port}`);
            resolve3({ port: match.port, connectionToken: match.token, pid, stream });
          }
        }
      };
      stream.stderr.on("data", (data) => {
        const text = data.toString();
        outputBuf += text;
        logService.trace(`${LOG_PREFIX} remote stderr: ${redactToken(text.trimEnd())}`);
        checkForOutput();
      });
      stream.on("data", (data) => {
        const text = data.toString();
        outputBuf += text;
        logService.trace(`${LOG_PREFIX} remote stdout: ${redactToken(text.trimEnd())}`);
        checkForOutput();
      });
      stream.on("error", (streamErr) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout2);
          reject(streamErr);
        }
      });
      stream.on("close", (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout2);
          reject(new Error(`${LOG_PREFIX} Agent host process exited with code ${code} before becoming ready.
output: ${redactToken(outputBuf)}`));
        }
      });
    });
  });
}

function openForwardOutChannel(client, dstHost, dstPort) {
  return new Promise((resolve3, reject) => {
    client.forwardOut("127.0.0.1", 0, dstHost, dstPort, (err, channel) => {
      if (err) {
        reject(err);
        return;
      }
      resolve3(channel);
    });
  });
}

function openRelayExecChannel(client, command, logService) {
  return new Promise((resolve3, reject) => {
    client.exec(command, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }
      stream.stderr.on("data", (data) => {
        logService.trace(`${LOG_PREFIX} agent relay stderr: ${redactToken(data.toString().trimEnd())}`);
      });
      resolve3(stream);
    });
  });
}

function createWebSocketOverChannel(nativeRequire, channel, urlHost, urlPort, connectionToken, logService, onMessage, onClose) {
  return new Promise((resolve3, reject) => {
    const WS = nativeRequire("ws");
    let url = `ws://${urlHost}:${urlPort}`;
    if (connectionToken) {
      url += `?tkn=${encodeURIComponent(connectionToken)}`;
    }
    const ws = new WS(url, { createConnection: (() => channel) });
    ws.on("open", () => {
      logService.info(`${LOG_PREFIX} WebSocket relay connected to remote agent host`);
      resolve3({
        send: (data) => {
          if (ws.readyState === ws.OPEN) {
            ws.send(data);
          }
        },
        close: () => ws.close()
      });
    });
    ws.on("message", (data) => {
      if (Array.isArray(data)) {
        onMessage(Buffer.concat(data).toString());
      } else if (data instanceof ArrayBuffer) {
        onMessage(Buffer.from(new Uint8Array(data)).toString());
      } else {
        onMessage(data.toString());
      }
    });
    ws.on("close", onClose);
    ws.on("error", (wsErr) => {
      logService.warn(`${LOG_PREFIX} WebSocket relay error: ${wsErr instanceof Error ? wsErr.message : String(wsErr)}`);
      reject(wsErr);
    });
  });
}

async function createWebSocketRelayForEndpoint(nativeRequire, client, endpoint, relayCliBin, relayCliDataDir, relayInstanceId, relayUserDataPath, connectionToken, logService, onMessage, onClose) {
  let channel;
  let urlHost;
  let urlPort;
  if (endpoint.type === "tcp") {
    channel = await openForwardOutChannel(client, endpoint.host, endpoint.port);
    urlHost = endpoint.host;
    urlPort = endpoint.port;
  } else {
    const command = buildAgentRelayCommand(relayCliBin, relayCliDataDir, relayInstanceId, relayUserDataPath);
    logService.info(`${LOG_PREFIX} Opening agent relay channel: ${command}`);
    channel = await openRelayExecChannel(client, command, logService);
    urlHost = "127.0.0.1";
    urlPort = 1;
  }
  return createWebSocketOverChannel(nativeRequire, channel, urlHost, urlPort, connectionToken, logService, onMessage, onClose);
}

function sanitizeConfig(config) {
  const { password: _p, privateKeyPath: _k, ...sanitized } = config;
  return sanitized;
}

var SSHConnection = class extends Disposable {
  constructor(fullConfig, connectionId, address, name, connectionToken, endpoint, serverType, instanceId, lifecycle, cliBin, cliDataDir, userDataPath, sshClient, _relay, _remoteStream, _logService) {
    super();
    this.connectionId = connectionId;
    this.address = address;
    this.name = name;
    this.connectionToken = connectionToken;
    this.endpoint = endpoint;
    this.serverType = serverType;
    this.instanceId = instanceId;
    this.lifecycle = lifecycle;
    this.cliBin = cliBin;
    this.cliDataDir = cliDataDir;
    this.userDataPath = userDataPath;
    this.sshClient = sshClient;
    this._relay = _relay;
    this._remoteStream = _remoteStream;
    this._logService = _logService;
    this._onDidClose = new Emitter();
    this.onDidClose = this._onDidClose.event;
    this._closed = false;
    this._sshClientDetached = false;
    this._sshCloseListener = () => {
      this._logService.info(`${LOG_PREFIX} SSH client closed for connection ${this.connectionId} (address ${this.address}); disposing connection`);
      this.dispose();
    };
    this._sshErrorListener = (err) => {
      this._logService.info(`${LOG_PREFIX} SSH client error for connection ${this.connectionId} (address ${this.address}): ${err instanceof Error ? err.message : String(err)}; disposing connection`);
      this.dispose();
    };
    this.config = sanitizeConfig(fullConfig);
    this._register(toDisposable(() => {
      if (this._closed) {
        return;
      }
      this._closed = true;
      this._relay.close();
      if (!this._sshClientDetached) {
        this._remoteStream?.close();
        sshClient.end();
      }
      this._onDidClose.fire();
    }));
    this._register(this._onDidClose);
    sshClient.on("close", this._sshCloseListener);
    sshClient.on("error", this._sshErrorListener);
  }
  /**
   * Detach the SSH client from this connection so that `dispose()`
   * only closes the WebSocket relay without ending the SSH session.
   * Also removes event listeners from the SSH client so the old
   * connection object is not retained by the shared client.
   */
  detachSshClient() {
    this._sshClientDetached = true;
    this.sshClient.removeListener("close", this._sshCloseListener);
    this.sshClient.removeListener("error", this._sshErrorListener);
  }
  relaySend(data) {
    this._relay.send(data);
  }
};

var SSHRemoteAgentHostMainService = class extends Disposable {
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
    this._onDidRequestKeyboardInteractive = this._register(new Emitter());
    this.onDidRequestKeyboardInteractive = this._onDidRequestKeyboardInteractive.event;
    this._onDidCancelKeyboardInteractive = this._register(new Emitter());
    this.onDidCancelKeyboardInteractive = this._onDidCancelKeyboardInteractive.event;
    this._onDidRequestEndpointSelection = this._register(new Emitter());
    this.onDidRequestEndpointSelection = this._onDidRequestEndpointSelection.event;
    this._onDidCancelEndpointSelection = this._register(new Emitter());
    this.onDidCancelEndpointSelection = this._onDidCancelEndpointSelection.event;
    this._onDidRequestHostKeyVerification = this._register(new Emitter());
    this.onDidRequestHostKeyVerification = this._onDidRequestHostKeyVerification.event;
    this._onDidCancelHostKeyVerification = this._register(new Emitter());
    this.onDidCancelHostKeyVerification = this._onDidCancelHostKeyVerification.event;
    this._onDidAnnounceHostKeys = this._register(new Emitter());
    this.onDidAnnounceHostKeys = this._onDidAnnounceHostKeys.event;
    /**
     * Pending keyboard-interactive prompts awaiting a response from the renderer.
     * Keyed by `requestId`. Each entry can either finish the ssh2 prompt with
     * responses or cancel the owning connect attempt when the user dismisses it.
     */
    this._pendingKbiRequests = /* @__PURE__ */ new Map();
    this._kbiRequestCounter = 0;
    /**
     * Pending endpoint-selection prompts awaiting a response from the
     * renderer. Keyed by `requestId`; resolved with the user's choice, or
     * `undefined` on cancellation (rejects the owning connect attempt).
     */
    this._pendingEndpointSelections = /* @__PURE__ */ new Map();
    this._endpointSelectionCounter = 0;
    /**
     * Pending host key verifications awaiting a verdict from the renderer,
     * keyed by `requestId`. Every entry must eventually be settled — leaving
     * one unanswered suspends the SSH handshake until the deadline elapses.
     *
     * `onUserDenied` lets the owning connect attempt distinguish "the renderer
     * refused this key" from any other handshake failure, so it can surface a
     * clean error instead of ssh2's internal wording.
     */
    this._pendingHostKeyRequests = /* @__PURE__ */ new Map();
    this._hostKeyRequestCounter = 0;
    this._connections = this._register(new DisposableMap());
    /**
     * Override hook for tests to shorten the relay-creation timeout used on
     * the `replaceRelay` reconnect path. See {@link RECONNECT_RELAY_TIMEOUT_MS}.
     */
    this.relayCreationTimeoutMs = RECONNECT_RELAY_TIMEOUT_MS;
  }
  /**
   * Lazily load a `require` function for native modules (`ssh2`, `ws`).
   * Uses a dynamic `import('node:module')` so the module is only resolved
   * when actually needed at runtime — not at file-load time. This matters
   * because tests override the methods that call this and never trigger
   * the import, avoiding issues with Electron's ESM loader which cannot
   * resolve `node:` specifiers.
   */
  async _getNativeRequire() {
    if (!this._nativeRequire) {
      const nodeModule = await import("node:module");
      this._nativeRequire = nodeModule.createRequire(import.meta.url);
    }
    return this._nativeRequire;
  }
  async connect(config, replaceRelay) {
    const connectionKey = computeSSHConnectionKey(config);
    const existing = this._connections.get(connectionKey);
    if (existing) {
      if (replaceRelay) {
        this._logService.info(`${LOG_PREFIX} Reconnecting relay for existing SSH tunnel ${connectionKey}`);
        const { sshClient: sshClient2, endpoint, connectionToken, serverType, instanceId, lifecycle, cliBin, cliDataDir, userDataPath } = existing;
        this._connections.deleteAndLeak(connectionKey);
        existing.detachSshClient();
        existing.dispose();
        const connectionId = connectionKey;
        try {
          let conn;
          const timeoutMs = this.relayCreationTimeoutMs;
          const relay = await raceTimeout(
            this._createWebSocketRelay(
              sshClient2,
              endpoint,
              cliBin,
              cliDataDir,
              instanceId,
              userDataPath,
              connectionToken,
              (data) => this._onDidRelayMessage.fire({ connectionId, data }),
              () => {
                conn?.dispose();
              }
            ),
            timeoutMs
          );
          if (!relay) {
            throw new Error(`SSH relay creation timed out after ${timeoutMs}ms (SSH client appears unresponsive)`);
          }
          conn = new SSHConnection(
            config,
            connectionId,
            connectionKey,
            config.name,
            connectionToken,
            endpoint,
            serverType,
            instanceId,
            lifecycle,
            cliBin,
            cliDataDir,
            userDataPath,
            sshClient2,
            relay,
            void 0,
            this._logService
          );
          Event.once(conn.onDidClose)(() => {
            if (this._connections.get(connectionKey) === conn) {
              this._connections.deleteAndDispose(connectionKey);
              this._onDidRelayClose.fire(connectionId);
              this._onDidCloseConnection.fire(connectionId);
              this._onDidChangeConnections.fire();
            }
          });
          this._connections.set(connectionKey, conn);
          return {
            connectionId: conn.connectionId,
            address: conn.address,
            name: conn.name,
            connectionToken: conn.connectionToken,
            config: conn.config,
            sshConfigHost: config.sshConfigHost,
            serverType: conn.serverType,
            instanceId: conn.instanceId,
            primary: true,
            lifecycle: conn.lifecycle
          };
        } catch (err) {
          sshClient2.end();
          this._onDidRelayClose.fire(connectionId);
          this._onDidCloseConnection.fire(connectionId);
          this._onDidChangeConnections.fire();
          throw err;
        }
      }
      return {
        connectionId: existing.connectionId,
        address: existing.address,
        name: existing.name,
        connectionToken: existing.connectionToken,
        config: existing.config,
        sshConfigHost: config.sshConfigHost,
        serverType: existing.serverType,
        instanceId: existing.instanceId,
        primary: true,
        lifecycle: existing.lifecycle
      };
    }
    this._logService.info(`${LOG_PREFIX} ${replaceRelay ? "Reconnecting" : "Connecting"} to ${connectionKey}`);
    const displayHost = config.sshConfigHost ?? `${config.username}@${config.host}`;
    let sshClient;
    try {
      const reportProgress = (message) => {
        this._onDidReportConnectProgress.fire({ connectionKey, message });
      };
      reportProgress(localize(2723, null));
      sshClient = await this._connectSSH(config, connectionKey);
      let endpoint;
      let connectionToken;
      let serverType;
      let instanceId;
      let lifecycle;
      let cliBin = "";
      let cliDataDir = "";
      let userDataPath = "";
      let agentStream;
      if (config.remoteAgentHostCommand) {
        this._logService.info(`${LOG_PREFIX} Using custom agent host command: ${config.remoteAgentHostCommand}; skipping endpoint discovery/selection`);
        reportProgress(localize(2727, null));
        const result = await this._startRemoteAgentHost(sshClient, void 0, void 0, config.remoteAgentHostCommand, this._effectiveTelemetryLevel);
        endpoint = { type: "tcp", host: "127.0.0.1", port: result.port };
        connectionToken = result.connectionToken;
        agentStream = result.stream;
        serverType = void 0;
        instanceId = "override";
        lifecycle = "managed";
      } else {
        const { stdout: unameS } = await sshExec(sshClient, "uname -s");
        const { stdout: unameM } = await sshExec(sshClient, "uname -m");
        const platform3 = resolveRemotePlatform(unameS, unameM);
        if (!platform3) {
          throw new Error(`${LOG_PREFIX} Unsupported remote platform: ${unameS.trim()} ${unameM.trim()}`);
        }
        this._logService.info(`${LOG_PREFIX} Remote platform: ${platform3.os}-${platform3.arch}`);
        reportProgress(localize(2726, null));
        cliBin = await this._ensureCLIInstalled(sshClient, platform3, reportProgress);
        cliDataDir = getRemoteCLIDataDir(this._serverDataFolderName);
        reportProgress(localize(2722, null));
        const exec2 = bindSshExec(sshClient);
        const initial = await runAgentEndpoints(exec2, cliBin, cliDataDir);
        userDataPath = initial.userDataPath;
        const live = await filterLiveAgentHostEndpoints(exec2, initial.endpoints);
        const editors = live.filter((e) => e.type === "editor");
        const standalones = live.filter((e) => e.type === "standalone");
        const spawnDedicated = async () => {
          const spawnCommand = buildAgentHostSpawnCommand(cliBin, cliDataDir, userDataPath, this._effectiveTelemetryLevel);
          reportProgress(localize(2727, null));
          this._logService.info(`${LOG_PREFIX} Spawning dedicated standalone agent host: ${spawnCommand}`);
          exec2(spawnCommand, { ignoreExitCode: true }).catch((err) => {
            this._logService.warn(`${LOG_PREFIX} Spawn command for dedicated agent host reported an error: ${err instanceof Error ? err.message : String(err)}`);
          });
          reportProgress(localize(2720, null));
          return waitForNewStandaloneEndpoint(exec2, cliBin, cliDataDir, userDataPath, live);
        };
        const selectDedicated = async () => {
          if (standalones.length === 0) {
            return { chosen: await spawnDedicated(), lifecycle: "managed" };
          }
          const [deterministic] = [...standalones].sort((a, b) => a.instanceId.localeCompare(b.instanceId));
          return { chosen: deterministic, lifecycle: "external" };
        };
        const selectEndpoint = async () => {
          if (config.preferredAgentLocation === "editor") {
            if (editors.length > 0) {
              const [deterministic] = [...editors].sort((a, b) => a.instanceId.localeCompare(b.instanceId));
              return { chosen: deterministic, lifecycle: "external" };
            }
            return selectDedicated();
          }
          if (config.preferredAgentLocation === "dedicated") {
            return selectDedicated();
          }
          if (config.userInitiated === false) {
            return selectDedicated();
          }
          if (editors.length === 0) {
            if (standalones.length === 0) {
              return { chosen: await spawnDedicated(), lifecycle: "managed" };
            }
            if (standalones.length === 1) {
              return { chosen: standalones[0], lifecycle: "external" };
            }
            reportProgress(localize(2721, null));
            const selection2 = await this._requestEndpointSelection(sshClient, connectionKey, displayHost, standalones);
            if (selection2.kind === "spawn") {
              return { chosen: await spawnDedicated(), lifecycle: "managed" };
            }
            const found2 = standalones.find((e) => isSameAgentHostEndpointIdentity(e, selection2));
            if (!found2) {
              throw new Error(`${LOG_PREFIX} Selected agent host endpoint is no longer available`);
            }
            return { chosen: found2, lifecycle: "external" };
          }
          reportProgress(localize(2721, null));
          const selection = await this._requestEndpointSelection(sshClient, connectionKey, displayHost, live);
          if (selection.kind === "spawn") {
            return { chosen: await spawnDedicated(), lifecycle: "managed" };
          }
          const found = live.find((e) => isSameAgentHostEndpointIdentity(e, selection));
          if (!found) {
            throw new Error(`${LOG_PREFIX} Selected agent host endpoint is no longer available`);
          }
          return { chosen: found, lifecycle: "external" };
        };
        const selected = await selectEndpoint();
        endpoint = selected.chosen.endpoint;
        connectionToken = selected.chosen.connectionToken;
        serverType = selected.chosen.type;
        instanceId = selected.chosen.instanceId;
        lifecycle = selected.lifecycle;
      }
      reportProgress(localize(2725, null));
      const connectionId = connectionKey;
      let conn;
      let relay;
      try {
        relay = await this._createWebSocketRelay(
          sshClient,
          endpoint,
          cliBin,
          cliDataDir,
          instanceId,
          userDataPath,
          connectionToken,
          (data) => this._onDidRelayMessage.fire({ connectionId, data }),
          () => {
            conn?.dispose();
          }
        );
      } catch (relayErr) {
        const relayErrorMessage = relayErr instanceof Error ? relayErr.message : String(relayErr);
        this._logService.warn(`${LOG_PREFIX} Failed to connect to selected agent host endpoint: ${relayErrorMessage}`);
        if (!config.remoteAgentHostCommand && cliBin && cliDataDir) {
          try {
            await runAgentEndpoints(bindSshExec(sshClient), cliBin, cliDataDir, userDataPath);
          } catch (rereadErr) {
            this._logService.warn(`${LOG_PREFIX} Failed to reread agent host endpoints after relay failure: ${rereadErr instanceof Error ? rereadErr.message : String(rereadErr)}`);
          }
        }
        throw new Error(`${LOG_PREFIX} Failed to connect to the selected remote agent host: ${relayErrorMessage}. Please retry connecting.`);
      }
      const address = connectionKey;
      conn = new SSHConnection(
        config,
        connectionId,
        address,
        config.name,
        connectionToken,
        endpoint,
        serverType,
        instanceId,
        lifecycle,
        cliBin,
        cliDataDir,
        userDataPath,
        sshClient,
        relay,
        agentStream,
        this._logService
      );
      Event.once(conn.onDidClose)(() => {
        if (this._connections.get(connectionKey) === conn) {
          this._connections.deleteAndDispose(connectionKey);
          this._onDidRelayClose.fire(connectionId);
          this._onDidCloseConnection.fire(connectionId);
          this._onDidChangeConnections.fire();
        }
      });
      this._connections.set(connectionKey, conn);
      sshClient = void 0;
      this._onDidChangeConnections.fire();
      return {
        connectionId,
        address,
        name: config.name,
        connectionToken,
        config: conn.config,
        sshConfigHost: config.sshConfigHost,
        serverType,
        instanceId,
        primary: true,
        lifecycle
      };
    } catch (err) {
      sshClient?.end();
      if (!(err instanceof CancellationError)) {
        this._logService.error(`${LOG_PREFIX} Failed to connect to ${displayHost}`, err);
      }
      throw err;
    }
  }
  async disconnect(host) {
    for (const [key, conn] of this._connections) {
      if (key === host || conn.connectionId === host) {
        conn.dispose();
        return;
      }
    }
  }
  async relaySend(connectionId, message) {
    for (const conn of this._connections.values()) {
      if (conn.connectionId === connectionId) {
        conn.relaySend(message);
        return;
      }
    }
  }
  async reconnect(sshConfigHost, name, remoteAgentHostCommand, agentForward, userInitiated, preferredAgentLocation) {
    this._logService.info(`${LOG_PREFIX} Reconnecting via SSH config host: ${sshConfigHost} (userInitiated=${userInitiated ?? true})`);
    const resolved = await this.resolveSSHConfig(sshConfigHost);
    let privateKeyPath;
    if (resolved.identityFile.length > 0 && !SSHRemoteAgentHostMainService._isDefaultKeyPath(resolved.identityFile[0])) {
      privateKeyPath = resolved.identityFile[0];
    }
    this._logService.info(`${LOG_PREFIX} reconnect: identityFiles=${JSON.stringify(resolved.identityFile)}, explicit key=${privateKeyPath ?? "(none)"}`);
    return this.connect(
      {
        host: resolved.hostname,
        port: resolved.port !== 22 ? resolved.port : void 0,
        username: resolved.user ?? sshConfigHost,
        authMethod: "agent" /* Agent */,
        privateKeyPath,
        identityAgent: resolved.identityAgent,
        name,
        sshConfigHost,
        remoteAgentHostCommand,
        agentForward: agentForward && resolved.forwardAgent ? true : void 0,
        userInitiated,
        preferredAgentLocation
      },
      /* replaceRelay */
      true
    );
  }
  async listSSHConfigHosts() {
    const configPath = join(os2.homedir(), ".ssh", "config");
    try {
      const content = await fsp.readFile(configPath, "utf-8");
      return this._parseSSHConfigHosts(content, dirname(configPath));
    } catch {
      this._logService.info(`${LOG_PREFIX} Could not read SSH config at ${configPath}`);
      return [];
    }
  }
  async ensureUserSSHConfig() {
    const sshDir = join(os2.homedir(), ".ssh");
    const configPath = join(sshDir, "config");
    const isPosix = process.platform !== "win32";
    try {
      await fsp.mkdir(sshDir, { recursive: true, mode: isPosix ? 448 : void 0 });
    } catch (err) {
      this._logService.warn(`${LOG_PREFIX} Failed to ensure ~/.ssh directory: ${err}`);
      throw err;
    }
    try {
      await fsp.access(configPath);
    } catch {
      try {
        const handle2 = await fsp.open(configPath, "a", isPosix ? 384 : void 0);
        await handle2.close();
      } catch (err) {
        this._logService.warn(`${LOG_PREFIX} Failed to create ${configPath}: ${err}`);
        throw err;
      }
    }
    return URI.file(configPath);
  }
  async listSSHConfigFiles() {
    const isWindows2 = process.platform === "win32";
    const userConfigPath = join(os2.homedir(), ".ssh", "config");
    const systemConfigPath = isWindows2 ? join(process.env["ProgramData"] ?? "C:\\ProgramData", "ssh", "ssh_config") : "/etc/ssh/ssh_config";
    const result = [URI.file(userConfigPath)];
    try {
      await fsp.access(systemConfigPath);
      result.push(URI.file(systemConfigPath));
    } catch {
    }
    return result;
  }
  async resolveSSHConfig(host) {
    return new Promise((resolve3, reject) => {
      cp2.execFile("ssh", ["-G", host], { timeout: 5e3 }, (err, stdout) => {
        if (err) {
          reject(new Error(`${LOG_PREFIX} ssh -G failed for ${host}: ${err.message}`));
          return;
        }
        const config = this._parseSSHGOutput(stdout);
        resolve3(config);
      });
    });
  }
  async _parseSSHConfigHosts(content, configDir, visited) {
    const seen = visited ?? /* @__PURE__ */ new Set();
    const hosts = [];
    hosts.push(...parseSSHConfigHostEntries(content));
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const includeMatch = trimmed.match(/^Include\s+(.+)$/i);
      if (!includeMatch) {
        continue;
      }
      const rawValue = stripSSHComment(includeMatch[1]);
      const patterns = rawValue.split(/\s+/).filter(Boolean);
      for (const rawPattern of patterns) {
        const pattern = rawPattern.replace(/^~/, os2.homedir());
        const resolvedPattern = isAbsolute(pattern) ? pattern : join(configDir, pattern);
        if (seen.has(resolvedPattern)) {
          continue;
        }
        seen.add(resolvedPattern);
        try {
          const stat = await fsp.stat(resolvedPattern);
          if (stat.isDirectory()) {
            const files = await fsp.readdir(resolvedPattern);
            for (const file of files) {
              try {
                const sub = await fsp.readFile(join(resolvedPattern, file), "utf-8");
                hosts.push(...await this._parseSSHConfigHosts(sub, resolvedPattern, seen));
              } catch {
              }
            }
          } else {
            const sub = await fsp.readFile(resolvedPattern, "utf-8");
            hosts.push(...await this._parseSSHConfigHosts(sub, dirname(resolvedPattern), seen));
          }
        } catch {
          const dir = dirname(resolvedPattern);
          const base = basename(resolvedPattern);
          if (base.includes("*")) {
            try {
              const files = await fsp.readdir(dir);
              for (const file of files) {
                const regex = new RegExp("^" + base.replace(/\*/g, ".*") + "$");
                if (regex.test(file)) {
                  try {
                    const sub = await fsp.readFile(join(dir, file), "utf-8");
                    hosts.push(...await this._parseSSHConfigHosts(sub, dir, seen));
                  } catch {
                  }
                }
              }
            } catch {
            }
          }
        }
      }
    }
    return hosts;
  }
  _parseSSHGOutput(stdout) {
    return parseSSHGOutput(stdout);
  }
  async _connectSSH(config, connectionKey) {
    const port = config.port ?? 22;
    const connectConfig = {
      host: config.host,
      port,
      username: config.username,
      // We enforce the handshake deadline ourselves so it can be stretched
      // while a prompt is outstanding; see INTERACTIVE_TIMEOUT_MS.
      readyTimeout: 0,
      keepaliveInterval: 15e3
    };
    const attempts = await this._buildAuthAttempts(config);
    this._logService.info(`${LOG_PREFIX} Built ${attempts.length} auth attempt(s): ${attempts.map((a) => describeAuthAttempt(a)).join(", ")}`);
    const displayHost = config.sshConfigHost ?? `${config.username}@${config.host}`;
    const liveKbiRequests = /* @__PURE__ */ new Set();
    let cancelConnectFromKbi;
    let armDeadline;
    const wrapPromptFinish = (finish) => (value) => {
      armDeadline?.(HANDSHAKE_TIMEOUT_MS);
      finish(value);
    };
    const kbiHandler = attempts.some((a) => a.type === "keyboard-interactive") ? (name, instructions, prompts, finish) => {
      armDeadline?.(INTERACTIVE_TIMEOUT_MS);
      const requestId = this._handleKeyboardInteractive(connectionKey ?? displayHost, displayHost, config.username, name, instructions, prompts, wrapPromptFinish(finish), () => cancelConnectFromKbi?.());
      liveKbiRequests.add(requestId);
    } : void 0;
    const keyPassphraseHandler = attempts.some((a) => a.type === "publickey" && a.encrypted) ? (keyPath, finish) => {
      armDeadline?.(INTERACTIVE_TIMEOUT_MS);
      const requestId = this._handleKeyboardInteractive(
        connectionKey ?? displayHost,
        displayHost,
        config.username,
        localize(2718, null),
        "",
        [{ prompt: localize(2719, null, keyPath), echo: false }],
        wrapPromptFinish((responses) => finish(responses[0])),
        () => cancelConnectFromKbi?.()
      );
      liveKbiRequests.add(requestId);
    } : void 0;
    connectConfig.authHandler = makeAuthHandler(attempts, this._logService, kbiHandler, keyPassphraseHandler);
    const cancelLiveKbiRequests = () => {
      for (const requestId of liveKbiRequests) {
        const pending = this._pendingKbiRequests.get(requestId);
        this._pendingKbiRequests.delete(requestId);
        this._onDidCancelKeyboardInteractive.fire(requestId);
        pending?.finish([]);
      }
      liveKbiRequests.clear();
    };
    if (config.agentForward) {
      const agentSock = this._getAgentSocket(config);
      if (agentSock) {
        connectConfig.agent = agentSock;
        connectConfig.agentForward = true;
        this._logService.info(`${LOG_PREFIX} SSH agent forwarding enabled`);
      } else {
        this._logService.warn(`${LOG_PREFIX} SSH agent forwarding requested, but no SSH agent endpoint is available; agent forwarding disabled`);
      }
    }
    const liveHostKeyRequests = /* @__PURE__ */ new Set();
    let hostKeyVerificationAborted = false;
    let hostKeyDenied = false;
    const cancelLiveHostKeyRequests = () => {
      hostKeyVerificationAborted = true;
      for (const requestId of liveHostKeyRequests) {
        const pending = this._pendingHostKeyRequests.get(requestId);
        this._pendingHostKeyRequests.delete(requestId);
        this._onDidCancelHostKeyVerification.fire(requestId);
        pending?.verify(false);
      }
      liveHostKeyRequests.clear();
    };
    connectConfig.hostVerifier = (key, verify) => {
      void this._verifyHostKey(
        connectionKey ?? displayHost,
        displayHost,
        config,
        port,
        key,
        verify,
        (requestId) => {
          liveHostKeyRequests.add(requestId);
          armDeadline?.(INTERACTIVE_TIMEOUT_MS);
          return () => {
            hostKeyDenied = true;
          };
        },
        () => hostKeyVerificationAborted,
        () => armDeadline?.(HANDSHAKE_TIMEOUT_MS)
      );
    };
    const client = await this._createSSHClient();
    return new Promise((resolve3, reject) => {
      let settled = false;
      let deadlineTimer;
      const clearDeadline = () => {
        this._clearHandshakeDeadline(deadlineTimer);
        deadlineTimer = void 0;
      };
      armDeadline = (ms) => {
        if (settled) {
          return;
        }
        clearDeadline();
        deadlineTimer = this._armHandshakeDeadline(ms, () => {
          rejectConnect(new Error(`SSH handshake to ${config.host} timed out`), true);
        });
      };
      const resolveConnect = () => {
        if (settled) {
          return;
        }
        settled = true;
        clearDeadline();
        this._logService.info(`${LOG_PREFIX} SSH connection established to ${config.host}`);
        cancelLiveKbiRequests();
        cancelLiveHostKeyRequests();
        resolve3(client);
      };
      const rejectConnect = (err, endClient) => {
        if (settled) {
          return;
        }
        settled = true;
        clearDeadline();
        cancelLiveKbiRequests();
        cancelLiveHostKeyRequests();
        if (endClient) {
          client.end();
        }
        reject(err);
      };
      cancelConnectFromKbi = () => {
        this._logService.info(`${LOG_PREFIX} SSH keyboard-interactive prompt cancelled by user for ${displayHost}`);
        rejectConnect(new CancellationError(), true);
      };
      client.on("ready", () => {
        resolveConnect();
      });
      client.on("error", (err) => {
        this._logService.error(`${LOG_PREFIX} SSH connection error: ${err.message}`);
        rejectConnect(hostKeyDenied ? new SSHHostKeyDeniedError(displayHost) : err, false);
      });
      client.on("close", () => {
        rejectConnect(
          hostKeyDenied ? new SSHHostKeyDeniedError(displayHost) : new Error(`SSH connection to ${config.host} closed before the handshake completed`),
          false
        );
      });
      client.on("hostkeys", (keys) => {
        this._handleAnnouncedHostKeys(connectionKey ?? displayHost, config.host, port, keys);
      });
      armDeadline(HANDSHAKE_TIMEOUT_MS);
      client.connect(connectConfig);
    });
  }
  /**
   * Arm the handshake deadline. Overridable so tests can observe how the
   * window changes as prompts come and go without waiting on real timers.
   */
  _armHandshakeDeadline(ms, onExpired) {
    return setTimeout(onExpired, ms);
  }
  _clearHandshakeDeadline(timer) {
    if (timer) {
      clearTimeout(timer);
    }
  }
  async _createSSHClient() {
    const nativeRequire = await this._getNativeRequire();
    const ssh2Module = nativeRequire("ssh2");
    return new ssh2Module.Client();
  }
  /**
   * Build the ordered list of authentication attempts to feed to ssh2's
   * `authHandler`. In `Agent` mode we try the configured agent first (so a
   * loaded identity short-circuits before we ever touch an encrypted key
   * file), then any non-default explicit `IdentityFile`, then each readable
   * default identity in turn. A host that accepts `~/.ssh/id_rsa` still
   * works even if the agent doesn't have it loaded — without needing an
   * explicit `IdentityFile` entry in `~/.ssh/config`.
   */
  async _buildAuthAttempts(config) {
    const attempts = [];
    const username = config.username;
    switch (config.authMethod) {
      case "agent" /* Agent */: {
        const agentSock = this._getAgentSocket(config);
        if (agentSock) {
          attempts.push({ type: "agent", username, agent: agentSock });
        }
        const explicitKeyPath = config.privateKeyPath;
        const explicitIsDefault = explicitKeyPath !== void 0 && SSHRemoteAgentHostMainService._isDefaultKeyPath(explicitKeyPath);
        if (explicitKeyPath && !explicitIsDefault) {
          const explicit = await this._readKeyFileIfExists(explicitKeyPath);
          if (explicit) {
            attempts.push({ type: "publickey", username, key: explicit, keyPath: explicitKeyPath, ...isEncryptedPrivateKey(explicit) ? { encrypted: true } : void 0 });
          }
        }
        for (const keyPath of SSHRemoteAgentHostMainService._defaultKeyPaths) {
          const contents = await this._readKeyFileIfExists(keyPath);
          if (contents) {
            attempts.push({ type: "publickey", username, key: contents, keyPath, ...isEncryptedPrivateKey(contents) ? { encrypted: true } : void 0 });
          }
        }
        attempts.push({ type: "keyboard-interactive", username });
        break;
      }
      case "keyFile" /* KeyFile */: {
        if (!config.privateKeyPath) {
          throw new Error(localize(2717, null));
        }
        const explicit = await this._readKeyFileIfExists(config.privateKeyPath);
        if (!explicit) {
          throw new Error(localize(2716, null, config.privateKeyPath));
        }
        attempts.push({ type: "publickey", username, key: explicit, keyPath: config.privateKeyPath, ...isEncryptedPrivateKey(explicit) ? { encrypted: true } : void 0 });
        break;
      }
      case "password" /* Password */: {
        if (config.password !== void 0) {
          attempts.push({ type: "password", username, password: config.password });
        }
        break;
      }
    }
    return attempts;
  }
  static {
    this._defaultKeyPaths = [
      "~/.ssh/id_ed25519",
      "~/.ssh/id_rsa",
      "~/.ssh/id_ecdsa",
      "~/.ssh/id_dsa",
      "~/.ssh/id_xmss"
    ];
  }
  /**
   * Expand a leading `~` to the current user's home directory so that paths
   * coming back from `ssh -G` (always absolute) compare equal to our
   * `~`-prefixed defaults.
   */
  static _normalizeKeyPath(keyPath) {
    return keyPath.replace(/^~/, os2.homedir());
  }
  static _isDefaultKeyPath(keyPath) {
    const normalized = SSHRemoteAgentHostMainService._normalizeKeyPath(keyPath);
    return SSHRemoteAgentHostMainService._defaultKeyPaths.some((p) => SSHRemoteAgentHostMainService._normalizeKeyPath(p) === normalized);
  }
  /** Test seam: returns the SSH agent socket path, or undefined when no agent is available. */
  _isAgentAvailable() {
    return process.env["SSH_AUTH_SOCK"];
  }
  _getAgentSocket(config) {
    if (config.identityAgent !== void 0) {
      return this._resolveIdentityAgent(config.identityAgent);
    }
    return this._isAgentAvailable();
  }
  _resolveIdentityAgent(identityAgent) {
    const trimmed = identityAgent.trim();
    if (!trimmed || trimmed.toLowerCase() === "none") {
      return void 0;
    }
    if (trimmed === "SSH_AUTH_SOCK") {
      return this._isAgentAvailable();
    }
    if (trimmed.startsWith("$")) {
      const envMatch = /^\$\{(?<braced>[A-Za-z_][A-Za-z0-9_]*)\}$|^\$(?<plain>[A-Za-z_][A-Za-z0-9_]*)$/.exec(trimmed);
      return envMatch?.groups ? process.env[envMatch.groups.braced ?? envMatch.groups.plain] || void 0 : void 0;
    }
    return trimmed.replace(/^~/, os2.homedir());
  }
  /**
   * Forward a keyboard-interactive challenge from ssh2 to the renderer and
   * register the `finish` callback so {@link respondKeyboardInteractive} can
   * supply the user's responses when they arrive. Returns the generated
   * `requestId` so the caller can track in-flight prompts.
   */
  _handleKeyboardInteractive(connectionKey, displayHost, username, name, instructions, prompts, finish, cancelConnect) {
    const requestId = `kbi-${++this._kbiRequestCounter}`;
    let settled = false;
    const finishOnce = (responses) => {
      if (settled) {
        return;
      }
      settled = true;
      this._pendingKbiRequests.delete(requestId);
      finish(responses);
    };
    this._pendingKbiRequests.set(requestId, { finish: finishOnce, cancelConnect });
    this._logService.info(`${LOG_PREFIX} keyboard-interactive challenge from ${displayHost}: ${prompts.length} prompt(s)`);
    this._onDidRequestKeyboardInteractive.fire({
      requestId,
      connectionKey,
      displayHost,
      username,
      name,
      instructions,
      prompts: prompts.map((p) => ({ prompt: p.prompt, echo: p.echo }))
    });
    return requestId;
  }
  async respondKeyboardInteractive(requestId, responses) {
    const pending = this._pendingKbiRequests.get(requestId);
    if (!pending) {
      this._logService.warn(`${LOG_PREFIX} respondKeyboardInteractive: no pending request for ${requestId}`);
      return;
    }
    if (responses === void 0) {
      pending.cancelConnect();
      pending.finish([]);
      return;
    }
    pending.finish(responses);
  }
  /**
   * Read every `known_hosts` file that applies to `host` and return the
   * parsed entries. Overridable so tests can supply entries without touching
   * the developer's real SSH setup.
   *
   * Resolution deliberately goes through `ssh -G` rather than assuming
   * `~/.ssh/known_hosts`, so a user who has redirected `UserKnownHostsFile`
   * gets the files they actually configured. A failure here is not fatal: we
   * fall back to no entries, which downgrades to a trust prompt rather than
   * silently accepting an unverified key.
   */
  async _readKnownHostsEntries(host) {
    let resolved;
    try {
      resolved = await this.resolveSSHConfig(host);
    } catch (err) {
      this._logService.warn(`${LOG_PREFIX} Could not resolve SSH config for known_hosts lookup of ${host}: ${err}`);
    }
    const paths = [
      ...resolved?.userKnownHostsFiles ?? ["~/.ssh/known_hosts"],
      ...resolved?.globalKnownHostsFiles ?? []
    ];
    const entries = [];
    for (const path of paths) {
      const expanded = path.replace(/^~/, os2.homedir());
      try {
        entries.push(...parseKnownHosts(await fsp.readFile(expanded, "utf-8")));
      } catch {
      }
    }
    return { entries, strictHostKeyChecking: resolved?.strictHostKeyChecking };
  }
  /**
   * Decide whether a presented host key should be trusted, by gathering the
   * evidence the renderer needs and asking it to apply policy.
   *
   * This process only collects facts — the fingerprint and what the user's
   * `known_hosts` files say. The renderer owns the decision because it holds
   * the trust store and the UI.
   */
  async _verifyHostKey(connectionKey, displayHost, config, port, key, verify, onRequest, isAborted, onPromptSettled) {
    let settled = false;
    let prompted = false;
    const verifyOnce = (permitted) => {
      if (settled) {
        return;
      }
      settled = true;
      if (prompted) {
        onPromptSettled();
      }
      verify(permitted);
    };
    try {
      const keyType = readHostKeyType(key);
      if (!keyType) {
        this._logService.error(`${LOG_PREFIX} Rejecting malformed host key from ${displayHost}`);
        verifyOnce(false);
        return;
      }
      const fingerprint = computeHostKeyFingerprint(key);
      const { entries, strictHostKeyChecking } = await this._readKnownHostsEntries(config.sshConfigHost ?? config.host);
      if (isAborted()) {
        this._logService.info(`${LOG_PREFIX} Abandoning host key verification for ${displayHost}: connect attempt already settled`);
        verifyOnce(false);
        return;
      }
      const knownHostsMatch = matchKnownHosts(entries, config.host, port, keyType, key);
      this._logService.info(`${LOG_PREFIX} Host key for ${displayHost}: ${keyType} ${fingerprint} (known_hosts: ${knownHostsMatch})`);
      const requestId = `hostkey-${++this._hostKeyRequestCounter}`;
      prompted = true;
      const onUserDenied = onRequest(requestId) ?? void 0;
      this._pendingHostKeyRequests.set(requestId, { verify: verifyOnce, onUserDenied });
      this._onDidRequestHostKeyVerification.fire({
        requestId,
        connectionKey,
        displayHost,
        host: config.host,
        port,
        keyType,
        fingerprint,
        knownHostsMatch,
        ...strictHostKeyChecking ? { strictHostKeyChecking } : void 0,
        userInitiated: config.userInitiated ?? true
      });
    } catch (err) {
      this._logService.error(`${LOG_PREFIX} Host key verification failed for ${displayHost}`, err);
      verifyOnce(false);
    }
  }
  async respondHostKeyVerification(requestId, trusted) {
    const pending = this._pendingHostKeyRequests.get(requestId);
    if (!pending) {
      this._logService.warn(`${LOG_PREFIX} respondHostKeyVerification: no pending request for ${requestId}`);
      return;
    }
    this._pendingHostKeyRequests.delete(requestId);
    this._logService.info(`${LOG_PREFIX} Host key ${trusted ? "accepted" : "rejected"} for request ${requestId}`);
    if (!trusted) {
      pending.onUserDenied?.();
    }
    pending.verify(trusted);
  }
  /**
   * Surface host keys announced over an authenticated connection. ssh2 has
   * already proven each key belongs to this server (it runs the
   * `hostkeys-prove-00@openssh.com` challenge and verifies the signatures
   * before emitting), so consumers may persist them without prompting.
   */
  _handleAnnouncedHostKeys(connectionKey, host, port, keys) {
    const announced = [];
    for (const key of keys) {
      try {
        const blob = key.getPublicSSH();
        const keyType = readHostKeyType(blob);
        if (keyType && keyType === key.type) {
          announced.push({ keyType, fingerprint: computeHostKeyFingerprint(blob) });
        }
      } catch (err) {
        this._logService.warn(`${LOG_PREFIX} Skipping unreadable announced host key for ${host}: ${err}`);
      }
    }
    if (!announced.length) {
      return;
    }
    this._logService.info(`${LOG_PREFIX} Server ${host} announced ${announced.length} proven host key(s)`);
    this._onDidAnnounceHostKeys.fire({ connectionKey, host, port, keys: announced });
  }
  /**
   * Ask the renderer to choose among live remote agent host endpoints (or
   * to spawn a new dedicated one), mirroring the keyboard-interactive
   * bridge in {@link _handleKeyboardInteractive}. Also settles (rejects)
   * with a {@link CancellationError} if `client` closes or errors while
   * the picker is still open, so a dropped SSH connection doesn't leave
   * the renderer's picker UI stuck waiting forever.
   */
  _requestEndpointSelection(client, connectionKey, displayHost, candidates) {
    const requestId = `endpoint-${++this._endpointSelectionCounter}`;
    return new Promise((resolve3, reject) => {
      let settled = false;
      const onClientUnavailable = () => {
        if (settled) {
          return;
        }
        settled = true;
        this._pendingEndpointSelections.delete(requestId);
        client.removeListener("close", onClientUnavailable);
        client.removeListener("error", onClientUnavailable);
        this._onDidCancelEndpointSelection.fire(requestId);
        reject(new CancellationError());
      };
      client.on("close", onClientUnavailable);
      client.on("error", onClientUnavailable);
      this._pendingEndpointSelections.set(requestId, (selection) => {
        if (settled) {
          return;
        }
        settled = true;
        client.removeListener("close", onClientUnavailable);
        client.removeListener("error", onClientUnavailable);
        if (selection === void 0) {
          reject(new CancellationError());
        } else {
          resolve3(selection);
        }
      });
      this._logService.info(`${LOG_PREFIX} Requesting endpoint selection for ${displayHost}: ${candidates.length} candidate(s)`);
      this._onDidRequestEndpointSelection.fire({
        requestId,
        connectionKey,
        displayHost,
        candidates: candidates.map((c) => ({ type: c.type, pid: c.pid, instanceId: c.instanceId, quality: c.quality, endpoint: c.endpoint }))
      });
    });
  }
  async respondEndpointSelection(requestId, selection) {
    const pending = this._pendingEndpointSelections.get(requestId);
    if (!pending) {
      this._logService.warn(`${LOG_PREFIX} respondEndpointSelection: no pending request for ${requestId}`);
      return;
    }
    this._pendingEndpointSelections.delete(requestId);
    pending(selection);
  }
  /**
   * Test seam: read a private key file from disk. Returns `undefined` if the
   * file doesn't exist; logs and returns `undefined` for any other read error
   * so a single broken key doesn't abort the whole auth flow.
   */
  async _readKeyFileIfExists(keyPath) {
    const resolved = keyPath.replace(/^~/, os2.homedir());
    try {
      return await fsp.readFile(resolved);
    } catch (error) {
      const errorCode = error.code;
      if (errorCode === "ENOENT" || errorCode === "ENOTDIR") {
        return void 0;
      }
      this._logService.warn(`${LOG_PREFIX} Failed to read SSH key file ${resolved}`, error);
      return void 0;
    }
  }
  get _quality() {
    return this._productService.quality || "insider";
  }
  get _serverDataFolderName() {
    return this._productService.serverDataFolderName ?? ".vscode-server-oss";
  }
  get _commit() {
    return this._productService.commit;
  }
  get _effectiveTelemetryLevel() {
    return telemetryLevelToAgentHostValue(this._telemetryService.telemetryLevel);
  }
  _startRemoteAgentHost(client, cliBin, cliDataDir, commandOverride, telemetryLevel) {
    return startRemoteAgentHost(client, this._logService, cliBin, cliDataDir, commandOverride, telemetryLevel);
  }
  async _createWebSocketRelay(client, endpoint, relayCliBin, relayCliDataDir, relayInstanceId, relayUserDataPath, connectionToken, onMessage, onClose) {
    const nativeRequire = await this._getNativeRequire();
    return createWebSocketRelayForEndpoint(nativeRequire, client, endpoint, relayCliBin, relayCliDataDir, relayInstanceId, relayUserDataPath, connectionToken, this._logService, onMessage, onClose);
  }
  /**
   * Resolve which CLI binary to run on the remote.
   *
   * When the desktop has a `productService.commit` (release builds), we
   * pin to that commit: install at `~/<serverDataFolderName>/<archive>-<commit>`
   * (sharing the install root with Remote-SSH), reuse on file existence,
   * download from the commit-pinned URL on miss, and clean up older
   * commit-keyed CLIs (keep last 5). The agent host CLI does not
   * self-update on this path, so the desktop pushes freshness on every
   * fresh start — but tolerantly: if the download fails and any other
   * usable CLI is present (other commit-keyed or the legacy
   * `~/.vscode-cli{,-<quality>}/<archive>`), we fall back to the newest
   * one rather than refusing to connect.
   *
   * In dev/OSS builds with no commit, we keep a loose, non-pinned install
   * at `~/<serverDataFolderName>/<archive>`. Existing CLIs self-update
   * against the latest release before reuse.
   *
   * Returns the resolved CLI binary path to run.
   */
  async _ensureCLIInstalled(client, platform3, reportProgress) {
    return ensureRemoteAgentHostCliInstalled(bindSshExec(client), platform3, {
      serverDataFolderName: this._serverDataFolderName,
      quality: this._quality,
      commit: this._commit,
      reportInstalling: () => reportProgress(localize(2724, null)),
      logService: this._logService,
      logPrefix: LOG_PREFIX
    });
  }
};

SSHRemoteAgentHostMainService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IProductService),
  __decorateParam(2, ITelemetryService)
], SSHRemoteAgentHostMainService);
export { describeAuthAttempt, toAuthMethod, isMethodAllowedByServer, makeAuthHandler, readSSHString, isEncryptedPrivateKey, sshExec, bindSshExec, startRemoteAgentHost, openForwardOutChannel, openRelayExecChannel, createWebSocketOverChannel, createWebSocketRelayForEndpoint, sanitizeConfig, fsp, os2, cp2, LOG_PREFIX, RECONNECT_RELAY_TIMEOUT_MS, HANDSHAKE_TIMEOUT_MS, INTERACTIVE_TIMEOUT_MS, SSHConnection, SSHRemoteAgentHostMainService };
