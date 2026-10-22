// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/agentHost/node/devContainerAgentHostService.ts
import { vLiteral, vObj, vString } from "./module-0217.mjs";
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";
import { CancellationTokenSource } from "./module-0019.mjs";
import { localize } from "./module-0007.mjs";
import { buildAgentHostSpawnCommand, buildAgentRelayCommand, filterLiveAgentHostEndpoints, getRemoteCLIDataDir, resolveRemotePlatform, runAgentEndpoints, waitForNewStandaloneEndpoint } from "./module-0219.mjs";
import { ensureRemoteAgentHostCliInstalled } from "./module-0220.mjs";
import { telemetryLevelToAgentHostValue } from "./module-0216.mjs";
import { CancellationError } from "./module-0003.mjs";
import { getResolvedShellEnv } from "./module-0224.mjs";
import { findExecutable } from "./module-0138.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0044.mjs";
import { IProductService } from "./module-0045.mjs";
import { ITelemetryService } from "./module-0085.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { INativeEnvironmentService } from "./module-0047.mjs";
import { join } from "./module-0023.mjs";
import { FileAccess } from "./module-0025.mjs";
import { getAppNodeModulesPath } from "./module-0230.mjs";


// src/vs/platform/agentHost/node/devContainerAgentHostService.ts
import { spawn as spawn3 } from "child_process";

import { Duplex } from "stream";


// src/vs/platform/agentHost/node/devContainerAgentHostService.ts
var LOG_PREFIX2 = "[DevContainerAgentHost]";

var DETECT_MUSL_COMMAND = 'if [ -e /etc/alpine-release ]; then printf musl; elif command -v ldd >/dev/null 2>&1; then case "$(ldd --version 2>&1)" in *musl*) printf musl;; esac; fi';

var devContainerUpResultValidator = vObj({
  outcome: vLiteral("success"),
  containerId: vString(),
  remoteWorkspaceFolder: vString()
});

var DevContainerRelay = class extends Disposable {
  constructor(process2, webSocket) {
    super();
    this.process = process2;
    this.webSocket = webSocket;
    this._register(toDisposable(() => {
      webSocket.close();
      if (!process2.killed) {
        process2.kill();
      }
    }));
  }
  send(message) {
    if (this.webSocket.readyState === this.webSocket.OPEN) {
      this.webSocket.send(message);
    }
  }
};

var DevContainerAgentHostMainService = class extends Disposable {
  constructor(_logService, _productService, _telemetryService, _configurationService, _environmentService) {
    super();
    this._logService = _logService;
    this._productService = _productService;
    this._telemetryService = _telemetryService;
    this._configurationService = _configurationService;
    this._environmentService = _environmentService;
    this._onDidRelayMessage = this._register(new Emitter());
    this.onDidRelayMessage = this._onDidRelayMessage.event;
    this._onDidRelayClose = this._register(new Emitter());
    this.onDidRelayClose = this._onDidRelayClose.event;
    this._onDidCloseConnection = this._register(new Emitter());
    this.onDidCloseConnection = this._onDidCloseConnection.event;
    this._onDidOutput = this._register(new Emitter());
    this.onDidOutput = this._onDidOutput.event;
    this._connections = this._register(new DisposableMap());
    this._connectionStores = this._register(new DisposableMap());
    this._connectionTokenSources = /* @__PURE__ */ new Map();
  }
  async connect(config) {
    await this.disconnect(config.connectionId);
    const store = new DisposableStore();
    const tokenSource = store.add(new CancellationTokenSource());
    this._connectionTokenSources.set(config.connectionId, tokenSource);
    store.add(toDisposable(() => this._connectionTokenSources.delete(config.connectionId)));
    this._connectionStores.set(config.connectionId, store);
    try {
      this._logService.info(`${LOG_PREFIX2} Starting Dev Container for ${config.workspaceFolder}`);
      const up = await this._runDevContainer(
        config.connectionId,
        ["up", "--workspace-folder", config.workspaceFolder],
        tokenSource.token
      );
      const upResult = parseDevContainerUpResult(up.stdout);
      if (!upResult) {
        throw new Error(localize(2623, null, up.stdout.trim() || up.stderr.trim()));
      }
      const exec2 = this._createExec(config.connectionId, config.workspaceFolder, tokenSource.token);
      const [{ stdout: unameS }, { stdout: unameM }, { stdout: libc }] = await Promise.all([
        exec2("uname -s"),
        exec2("uname -m"),
        exec2(DETECT_MUSL_COMMAND)
      ]);
      const platform3 = resolveRemotePlatform(unameS, unameM, libc);
      if (!platform3) {
        throw new Error(localize(2624, null, unameS.trim(), unameM.trim()));
      }
      const serverDataFolderName = this._productService.serverDataFolderName ?? ".vscode-server-oss";
      const quality = this._productService.quality || "insider";
      const cliBin = await ensureRemoteAgentHostCliInstalled(exec2, platform3, {
        serverDataFolderName,
        quality,
        commit: this._productService.commit,
        reportInstalling: () => this._logService.info(`${LOG_PREFIX2} Installing VS Code CLI in Dev Container...`),
        logService: this._logService,
        logPrefix: LOG_PREFIX2
      });
      const cliDataDir = getRemoteCLIDataDir(serverDataFolderName);
      const initial = await runAgentEndpoints(exec2, cliBin, cliDataDir);
      const live = await filterLiveAgentHostEndpoints(exec2, initial.endpoints);
      let endpoint = live.filter((candidate) => candidate.type === "standalone").sort((a, b) => a.instanceId.localeCompare(b.instanceId))[0];
      if (!endpoint) {
        const spawnCommand = buildAgentHostSpawnCommand(
          cliBin,
          cliDataDir,
          initial.userDataPath,
          telemetryLevelToAgentHostValue(this._telemetryService.telemetryLevel)
        );
        void exec2(spawnCommand, { ignoreExitCode: true }).catch((error) => {
          this._logService.warn(`${LOG_PREFIX2} Agent Host spawn command failed`, error);
        });
        endpoint = await waitForNewStandaloneEndpoint(
          exec2,
          cliBin,
          cliDataDir,
          initial.userDataPath,
          live,
          { token: tokenSource.token }
        );
      }
      const relayCommand = buildAgentRelayCommand(cliBin, cliDataDir, endpoint.instanceId, initial.userDataPath);
      const relay = await this._createRelay(
        config.connectionId,
        config.workspaceFolder,
        relayCommand,
        endpoint.endpoint,
        endpoint.connectionToken,
        tokenSource.token
      );
      this._connections.set(config.connectionId, relay);
      store.add(toDisposable(() => this._connections.deleteAndDispose(config.connectionId)));
      return {
        connectionId: config.connectionId,
        address: `devcontainer:${upResult.containerId}`,
        name: config.name,
        remoteWorkspaceFolder: upResult.remoteWorkspaceFolder
      };
    } catch (error) {
      this._connectionStores.deleteAndDispose(config.connectionId);
      throw error;
    }
  }
  _createExec(connectionId, workspaceFolder, token) {
    return async (command, options) => {
      const result = await this._runDevContainer(
        connectionId,
        ["exec", "--workspace-folder", workspaceFolder, "/bin/sh", "-c", command],
        token
      );
      if (result.code !== 0 && !options?.ignoreExitCode) {
        throw new Error(localize(2622, null, result.code, command, result.stderr));
      }
      return result;
    };
  }
  async _createRelay(connectionId, workspaceFolder, command, endpoint, connectionToken, token) {
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    const [environment, nativeRequire] = await Promise.all([
      this._resolveShellEnvironment(),
      this._getNativeRequire()
    ]);
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    const child = this._spawnDevContainer([
      "exec",
      "--workspace-folder",
      workspaceFolder,
      "/bin/sh",
      "-c",
      command
    ], environment);
    const cancellationListener = token.onCancellationRequested(() => {
      if (!child.killed) {
        child.kill();
      }
    });
    child.stderr.on("data", (data) => {
      const text = data.toString();
      this._reportOutput(connectionId, text);
      this._logService.trace(`${LOG_PREFIX2} relay stderr: ${text.trimEnd()}`);
    });
    const duplex = Duplex.from({ readable: child.stdout, writable: child.stdin });
    const WS = nativeRequire("ws");
    const urlHost = endpoint.type === "tcp" ? endpoint.host : "127.0.0.1";
    const urlPort = endpoint.type === "tcp" ? endpoint.port : 80;
    let url = `ws://${urlHost}:${urlPort}`;
    if (connectionToken) {
      url += `?tkn=${encodeURIComponent(connectionToken)}`;
    }
    const webSocket = new WS(url, { createConnection: () => duplex });
    try {
      await new Promise((resolve3, reject) => {
        const onOpen = () => {
          webSocket.off("error", onError);
          resolve3();
        };
        const onError = (error) => {
          webSocket.off("open", onOpen);
          reject(error);
        };
        webSocket.once("open", onOpen);
        webSocket.once("error", onError);
      });
    } catch (error) {
      webSocket.close();
      if (!child.killed) {
        child.kill();
      }
      throw error;
    } finally {
      cancellationListener.dispose();
    }
    const relay = new DevContainerRelay(child, webSocket);
    webSocket.on("error", (error) => this._logService.warn(`${LOG_PREFIX2} relay WebSocket error`, error));
    webSocket.on("message", (data) => {
      const message = Array.isArray(data) ? Buffer.concat(data).toString() : data instanceof ArrayBuffer ? Buffer.from(new Uint8Array(data)).toString() : data.toString();
      this._onDidRelayMessage.fire({ connectionId, data: message });
    });
    const close2 = () => {
      if (this._connections.get(connectionId) === relay) {
        this._connections.deleteAndDispose(connectionId);
        this._connectionStores.deleteAndDispose(connectionId);
        this._onDidRelayClose.fire(connectionId);
        this._onDidCloseConnection.fire(connectionId);
      }
    };
    webSocket.once("close", close2);
    child.once("close", close2);
    return relay;
  }
  async _runDevContainer(connectionId, args, token) {
    const environment = await this._resolveShellEnvironment();
    return new Promise((resolve3, reject) => {
      if (token.isCancellationRequested) {
        reject(new CancellationError());
        return;
      }
      this._reportOutput(connectionId, `$ devcontainer ${args.map((arg) => JSON.stringify(arg)).join(" ")}
`);
      const child = this._spawnDevContainer(args, environment);
      let stdout = "";
      let stderr = "";
      let settled = false;
      const finish = (error, code) => {
        if (settled) {
          return;
        }
        settled = true;
        cancellationListener.dispose();
        if (error) {
          reject(error);
        } else if (token.isCancellationRequested) {
          reject(new CancellationError());
        } else {
          resolve3({ stdout, stderr, code: code ?? -1 });
        }
      };
      const cancellationListener = token.onCancellationRequested(() => {
        if (!child.killed) {
          child.kill();
        }
      });
      child.stdout.on("data", (data) => {
        const text = data.toString();
        stdout += text;
        this._reportOutput(connectionId, text);
      });
      child.stderr.on("data", (data) => {
        const text = data.toString();
        stderr += text;
        this._reportOutput(connectionId, text);
      });
      child.once("error", (error) => {
        finish(error, null);
      });
      child.once("close", (code) => finish(void 0, code));
    });
  }
  async _getNativeRequire() {
    if (!this._nativeRequire) {
      const nodeModule = await import("node:module");
      this._nativeRequire = nodeModule.createRequire(import.meta.url);
    }
    return this._nativeRequire;
  }
  _resolveShellEnvironment() {
    this._shellEnvironment ??= getResolvedShellEnv(
      this._configurationService,
      this._logService,
      { ...this._environmentService.args, "force-user-env": true },
      process.env
    );
    return this._shellEnvironment;
  }
  _reportOutput(connectionId, data) {
    this._onDidOutput.fire({ connectionId, data });
  }
  isDockerAvailable() {
    this._dockerAvailable ??= this._resolveShellEnvironment().then((environment) => findExecutable("docker", void 0, void 0, environment)).then((executable) => executable !== void 0);
    return this._dockerAvailable;
  }
  _spawnDevContainer(args, environment) {
    return spawn3(process.execPath, [getDevContainerCliPath(), ...args], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...environment, ELECTRON_RUN_AS_NODE: "1" }
    });
  }
  async relaySend(connectionId, message) {
    const relay = this._connections.get(connectionId);
    if (!relay) {
      throw new Error(`Dev Container Agent Host connection '${connectionId}' is not available.`);
    }
    relay.send(message);
  }
  async disconnect(connectionId) {
    this._connectionTokenSources.get(connectionId)?.cancel();
    this._connectionStores.deleteAndDispose(connectionId);
    this._connections.deleteAndDispose(connectionId);
  }
};

DevContainerAgentHostMainService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IProductService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, INativeEnvironmentService)
], DevContainerAgentHostMainService);

function getDevContainerCliPath() {
  return join(FileAccess.asFileUri(getAppNodeModulesPath()).fsPath, "@devcontainers", "cli", "devcontainer.js");
}

function parseDevContainerUpResult(output) {
  const lines = output.trim().split("\n").reverse();
  for (const line of lines) {
    try {
      const value = JSON.parse(line);
      const { content, error } = devContainerUpResultValidator.validate(value);
      if (!error) {
        return {
          containerId: content.containerId,
          remoteWorkspaceFolder: content.remoteWorkspaceFolder
        };
      }
    } catch {
    }
  }
  return void 0;
}
export { getDevContainerCliPath, parseDevContainerUpResult, spawn3, Duplex, LOG_PREFIX2, DETECT_MUSL_COMMAND, devContainerUpResultValidator, DevContainerRelay, DevContainerAgentHostMainService };
