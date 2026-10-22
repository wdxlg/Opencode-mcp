// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHostMcpNode.ts
import { ExtHostMcpService, McpHTTPHandle } from "./module-0327.mjs";
import { DisposableMap } from "./module-0011.mjs";
import { OPENCODE_MCP_TIMEOUT_ENV, openCodeMcpLaunchOptions } from "./module-0324.mjs";
import { McpConnectionState } from "./module-0220.mjs";
import { openCodeManagedMcpBaseEnvironment } from "./module-0519.mjs";
import { parseEnvFile } from "./module-0516.mjs";
import { delimiter, isAbsolute, join } from "./module-0019.mjs";
import { untildify } from "./module-0198.mjs";
import { McpStdioStateHandler } from "./module-0518.mjs";
import { StreamSplitter } from "./module-0517.mjs";
import { Lazy } from "./module-0021.mjs";
import { URI } from "./module-0025.mjs";
import { findExecutable } from "./module-0334.mjs";


// src/vs/workbench/api/node/extHostMcpNode.ts
import { spawn as spawn9 } from "child_process";

import { readFile } from "fs/promises";

import { homedir as homedir4 } from "os";


// src/vs/workbench/api/node/extHostMcpNode.ts
var NodeExtHostMpcService = class extends ExtHostMcpService {
  constructor() {
    super(...arguments);
    this.nodeServers = this._register(new DisposableMap());
  }
  _startMcp(id2, launch, defaultCwd, errorOnUserInteraction) {
    const managed = openCodeMcpLaunchOptions(launch).managed;
    if (managed && !this._workspaceService.trusted) {
      this._proxy.$onDidChangeState(id2, { state: McpConnectionState.Kind.Error, message: "\u53D7\u9650\u5DE5\u4F5C\u533A\u4E0D\u4F1A\u542F\u52A8 OpenCode \u5916\u90E8 MCP\u3002" });
      return;
    }
    if (launch.type === 1 /* Stdio */) {
      this.startNodeMpc(id2, launch, defaultCwd);
    } else if (launch.type === 2 /* HTTP */) {
      this._sseEventSources.set(id2, new McpHTTPHandleNode(id2, launch, this._proxy, this._logService, errorOnUserInteraction, this._readOpenCodeOAuthToken));
    } else {
      super._startMcp(id2, launch, defaultCwd, errorOnUserInteraction);
    }
  }
  $stopMcp(id2) {
    const nodeServer = this.nodeServers.get(id2);
    if (nodeServer) {
      nodeServer.stop();
    } else {
      super.$stopMcp(id2);
    }
  }
  $sendMessage(id2, message) {
    const nodeServer = this.nodeServers.get(id2);
    if (nodeServer) {
      nodeServer.write(message);
    } else {
      super.$sendMessage(id2, message);
    }
  }
  async startNodeMpc(id2, launch, defaultCwd) {
    const openCodeManaged = launch.env["OPENCODE_MCP_MANAGED"] === "1";
    const onError = (err) => this._proxy.$onDidChangeState(id2, {
      state: McpConnectionState.Kind.Error,
      // eslint-disable-next-line local/code-no-any-casts
      code: err.hasOwnProperty("code") ? String(err.code) : void 0,
      message: openCodeManaged ? "OpenCode MCP \u8FDB\u7A0B\u542F\u52A8\u6216\u901A\u4FE1\u5931\u8D25\uFF1B\u8BF7\u68C0\u67E5\u670D\u52A1\u914D\u7F6E\u3002" : typeof err === "string" ? err : err.message
    });
    if (openCodeManaged && launch.envFile) {
      onError("OpenCode \u53D7\u7BA1 MCP \u4E0D\u652F\u6301 envFile\uFF0C\u8BF7\u4ECE\u53EF\u4FE1\u539F\u59CB\u914D\u7F6E\u5BFC\u5165\u663E\u5F0F\u73AF\u5883\u53D8\u91CF\u3002");
      return;
    }
    const env2 = openCodeManaged ? openCodeManagedMcpBaseEnvironment(process.env, process.platform) : { ...process.env };
    if (launch.envFile) {
      try {
        for (const [key, value] of parseEnvFile(await readFile(launch.envFile, "utf-8"))) {
          env2[key] = value;
        }
      } catch (e) {
        onError(`Failed to read envFile '${launch.envFile}': ${e.message}`);
        return;
      }
    }
    for (const [key, value] of Object.entries(launch.env)) {
      if (openCodeManaged && ["OPENCODE_MCP_MANAGED", OPENCODE_MCP_TIMEOUT_ENV].includes(key.toUpperCase())) continue;
      const targetKey = openCodeManaged && process.platform === "win32" ? key.toUpperCase() : key;
      if (!openCodeManaged && key.toUpperCase() === "PATH" && value !== null) {
        env2[targetKey] = env2[targetKey] ? `${env2[targetKey]}${delimiter}${String(value)}` : String(value);
        continue;
      }
      env2[targetKey] = value === null ? void 0 : String(value);
    }
    let child;
    try {
      const home = homedir4();
      let cwd2 = launch.cwd ? untildify(launch.cwd, home) : openCodeManaged ? home : defaultCwd?.fsPath || home;
      if (!isAbsolute(cwd2)) {
        cwd2 = !openCodeManaged && defaultCwd ? join(defaultCwd.fsPath, cwd2) : join(home, cwd2);
      }
      const { executable, args: args2, shell } = await formatSubprocessArguments(
        untildify(launch.command, home),
        launch.args.map((a) => untildify(a, home)),
        cwd2,
        env2
      );
      this._proxy.$onDidPublishLog(id2, 2 /* Debug */, openCodeManaged ? "OpenCode-managed MCP stdio process starting (arguments hidden)" : `Server command line: ${executable} ${args2.join(" ")}`);
      if (openCodeManaged && !this._workspaceService.trusted) {
        onError("\u53D7\u9650\u5DE5\u4F5C\u533A\u4E0D\u4F1A\u542F\u52A8 OpenCode \u5916\u90E8 MCP\u3002");
        return;
      }
      child = spawn9(executable, args2, {
        stdio: "pipe",
        cwd: cwd2,
        env: env2,
        shell
      });
    } catch (e) {
      onError(e);
      return;
    }
    const connectionManager = new McpStdioStateHandler(child);
    this._proxy.$onDidChangeState(id2, { state: McpConnectionState.Kind.Starting });
    child.stdout.pipe(new StreamSplitter("\n")).on("data", (line) => this._proxy.$onDidReceiveMessage(id2, line.toString()));
    child.stdin.on("error", onError);
    child.stdout.on("error", onError);
    if (openCodeManaged) child.stderr.resume();
    else child.stderr.pipe(new StreamSplitter("\n")).on("data", (line) => this._proxy.$onDidPublishLog(id2, 4 /* Warning */, `[server stderr] ${line.toString().trimEnd()}`));
    child.on("spawn", () => this._proxy.$onDidChangeState(id2, { state: McpConnectionState.Kind.Running }));
    child.on("error", (e) => {
      onError(e);
    });
    child.on("exit", (code) => {
      this.nodeServers.deleteAndDispose(id2);
      if (code === 0 || connectionManager.stopped) {
        this._proxy.$onDidChangeState(id2, { state: McpConnectionState.Kind.Stopped });
      } else {
        this._proxy.$onDidChangeState(id2, {
          state: McpConnectionState.Kind.Error,
          message: `Process exited with code ${code}`
        });
      }
    });
    this.nodeServers.set(id2, connectionManager);
  }
};

var McpHTTPHandleNode = class extends McpHTTPHandle {
  constructor() {
    super(...arguments);
    this._undici = new Lazy(() => import("undici"));
  }
  async _fetchInternal(url, init) {
    const { fetch: fetch2, Agent: Agent2 } = await this._undici.value;
    const undiciInit = { ...init };
    let httpUrl = url;
    const uri2 = URI.parse(url);
    if (uri2.scheme === "unix" || uri2.scheme === "pipe") {
      undiciInit.dispatcher = new Agent2({
        socketPath: uri2.path
      });
      httpUrl = uri2.with({
        scheme: "http",
        authority: "localhost",
        // HTTP always wants a host (not that we're using it), but if we're using a socket or pipe then localhost is sorta right anyway
        path: uri2.fragment
      }).toString(true);
    } else {
      return super._fetchInternal(url, init);
    }
    const undiciResponse = await fetch2(httpUrl, undiciInit);
    return {
      status: undiciResponse.status,
      statusText: undiciResponse.statusText,
      headers: undiciResponse.headers,
      // undici `Headers` class no longer overlaps with lib.dom `Headers` (`SpecIterableIterator` vs `HeadersIterator`)
      body: undiciResponse.body,
      // Way down in `ReadableStreamReadDoneResult<T>`, `value` is optional in the undici type but required (yet can be `undefined`) in the standard type
      url: undiciResponse.url,
      json: () => undiciResponse.json(),
      text: () => undiciResponse.text()
    };
  }
};

var windowsShellScriptRe = /\.(bat|cmd)$/i;

var escapeCmdArg = (s) => `"${s.replace(/"/g, '""')}"`;

var formatSubprocessArguments = async (executable, args2, cwd2, env2) => {
  if (process.platform !== "win32") {
    return { executable, args: args2, shell: false };
  }
  const found = await findExecutable(executable, cwd2, void 0, env2);
  if (found && windowsShellScriptRe.test(found)) {
    return {
      executable: escapeCmdArg(found),
      args: args2.map(escapeCmdArg),
      shell: true
    };
  }
  return { executable, args: args2, shell: false };
};
export { spawn9, readFile, homedir4, NodeExtHostMpcService, McpHTTPHandleNode, windowsShellScriptRe, escapeCmdArg, formatSubprocessArguments };
