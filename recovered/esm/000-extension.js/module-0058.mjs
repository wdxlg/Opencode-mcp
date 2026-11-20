// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-center.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { ExternalMcpCatalog } from "./module-0059.mjs";
import { createExternalMcpOAuth } from "./module-0067.mjs";
import { forgetNativeConfig, recallNativeConfig, redactedNativeView, rememberNativeConfig } from "./module-0064.mjs";
import { registerExternalMcpNetworkCommands } from "./module-0111.mjs";
import { registerExternalMcpSecretCommands } from "./module-0065.mjs";
import { ExternalMcpNetwork } from "./module-0105.mjs";
import { managedStdioEnvironment, windowsMcpDirectEnvironment } from "./module-0110.mjs";
import { bridgeStatusOf, editorStateOf, legacyEditorStatus } from "./module-0112.mjs";
import { registerWindowsMcpIntegration } from "./windows-mcp-integration.mjs";


// extensions/opencode/src/external-mcp-center.ts
init_define_OPENCODE_BUILD_INFO();

var vscode6 = __toESM(require("vscode"));

var import_node_crypto13 = require("node:crypto");

var import_node_fs20 = require("node:fs");


// extensions/opencode/src/external-mcp-center.ts
var PROVIDER_ID = "opencode.external-mcp";

function providerLabel(server) {
  return `OpenCode \xB7 ${server.label} [${server.id}]`;
}

function providerId(definition) {
  const match = /\[([a-z][a-z0-9_]{1,16})\]$/.exec(definition.label);
  return match?.[1];
}

var ExternalMcpCenter = class {
  constructor(context, output2) {
    this.output = output2;
    this.bundledBinDir = context.asAbsolutePath("runtime/bin");
    this.catalog = new ExternalMcpCatalog(context.secrets);
    this.catalog.setNetworkProvider(this.network);
    const authentication2 = createExternalMcpOAuth(this.catalog, () => {
      if (this.disposed) return;
      this.refCache = void 0;
      this.changed.fire();
      if (vscode6.workspace.isTrusted) this.refreshBridge();
    });
    this.oauth = authentication2.oauth;
    this.disposables.push(...authentication2.disposables);
    this.disposables.push(this.network, this.network.onDidChange(() => {
      this.output.appendLine("[external-mcp] network settings changed; reconnecting shared servers");
      this.changed.fire();
      if (vscode6.workspace.isTrusted) this.refreshBridge();
    }));
    this.ready = this.catalog.migrateLegacyArgs();
    void this.ready.catch(() => this.output.appendLine("[external-mcp] legacy argument migration unavailable"));
    this.disposables.push(vscode6.lm.registerMcpServerDefinitionProvider(PROVIDER_ID, {
      onDidChangeMcpServerDefinitions: this.changed.event,
      provideMcpServerDefinitions: () => this.provideDefinitions(),
      resolveMcpServerDefinition: (definition) => this.resolveDefinition(definition)
    }));
    this.disposables.push({ dispose: this.catalog.onDidChange(() => this.onCatalogChange(false)) });
    if (context.secrets.onDidChange) this.disposables.push(context.secrets.onDidChange(() => {
      this.secretEpoch++;
    }));
    (0, import_node_fs20.watchFile)(this.catalog.filePath, { interval: 2e3 }, this.fileListener);
    const command = (id, run) => this.disposables.push(vscode6.commands.registerCommand(id, run));
    command("opencode.mcp.open", () => vscode6.commands.executeCommand("aiCustomization.openManagementEditor", "skillCenter"));
    command("opencode.mcp.getCatalog", () => this.getCatalog());
    this.disposables.push(registerWindowsMcpIntegration({vscode:vscode6,catalog:this.catalog,ready:()=>this.ready,getBridge:()=>this.bridge}));
    command("opencode.mcp.preview", (raw, options) => {
      const native = options?.native;
      if (native !== void 0) {
        if (!native || typeof native !== "object" || Array.isArray(native)) throw new Error("\u539F\u751F MCP \u914D\u7F6E\u65E0\u6548\u3002");
        const json = JSON.stringify({ mcpServers: native });
        if (json.length > 64e3) throw new Error("\u539F\u751F MCP \u914D\u7F6E\u8D85\u8FC7 64 KB\u3002");
        return { ...this.catalog.preview(json), nativeRef: rememberNativeConfig(json), nativeView: redactedNativeView(native) };
      }
      if (typeof raw !== "string") throw new Error("\u8BF7\u7C98\u8D34 MCP URL\u3001\u547D\u4EE4\u6216 JSON\u3002");
      return this.catalog.preview(raw);
    });
    command("opencode.mcp.import", async (source, token, selectedIds, target = "both", secrets) => {
      await this.ready;
      const nativeRef = source && typeof source === "object" ? source.nativeRef : void 0;
      const raw = nativeRef !== void 0 ? recallNativeConfig(nativeRef) : source;
      if (typeof raw !== "string" || typeof token !== "string" || !Array.isArray(selectedIds) || !selectedIds.every((x) => typeof x === "string")) throw new Error("MCP \u5BFC\u5165\u9884\u89C8\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u786E\u8BA4\u3002");
      if (target !== "both" && target !== "bridge") throw new Error("MCP \u76EE\u6807\u8303\u56F4\u65E0\u6548\u3002");
      if (target === "bridge") {
        if (!vscode6.workspace.isTrusted) throw new Error("\u8BF7\u5148\u4FE1\u4EFB\u5DE5\u4F5C\u533A\uFF0C\u518D\u5C06\u5DF2\u6709\u539F\u751F\u670D\u52A1\u5F00\u653E\u7ED9 Bridge\u3002");
        const choice = await vscode6.window.showWarningMessage("\u5C06\u5DF2\u6709\u539F\u751F MCP \u7684\u914D\u7F6E\u590D\u5236\u5230\u7528\u6237\u76EE\u5F55\uFF0C\u5F00\u653E\u7ED9\u8FDC\u7A0B Bridge \u8C03\u7528\u3002\u539F\u751F\u914D\u7F6E\u4E0D\u4F1A\u5220\u9664\u6216\u4FEE\u6539\uFF1B\u5DE5\u4F5C\u533A\u6765\u6E90\u4F1A\u53D8\u6210\u5168\u5C40\u53EF\u7528\uFF0C\u8BF7\u786E\u8BA4\u5176\u547D\u4EE4\u3001\u5730\u5740\u53CA\u6743\u9650\u3002", { modal: true }, "\u786E\u8BA4\u5F00\u653E");
        if (choice !== "\u786E\u8BA4\u5F00\u653E") return { cancelled: true };
      }
      const result = await this.catalog.import(raw, token, selectedIds, target, secrets);
      if (typeof nativeRef === "string") forgetNativeConfig(nativeRef);
      if (vscode6.workspace.isTrusted) this.refreshBridge();
      return result;
    });
    command("opencode.mcp.setEnabled", async (id, enabled, target) => {
      if (typeof id !== "string" || typeof enabled !== "boolean" || !["both", "editor", "bridge"].includes(String(target))) throw new Error("MCP \u542F\u505C\u53C2\u6570\u65E0\u6548\u3002");
      await this.catalog.setEnabled(id, enabled, target);
      this.oauth.cancelUnavailable();
      if (vscode6.workspace.isTrusted) this.refreshBridge();
    });
    command("opencode.mcp.remove", async (id) => {
      if (typeof id !== "string") throw new Error("MCP \u670D\u52A1 ID \u65E0\u6548\u3002");
      const server = this.catalog.snapshot().servers.find((item) => item.id === id);
      if (!server) throw new Error("MCP \u670D\u52A1\u5DF2\u79FB\u9664\uFF0C\u8BF7\u5237\u65B0\u3002");
      const confirm = await vscode6.window.showWarningMessage(`\u6C38\u4E45\u79FB\u9664 MCP \u670D\u52A1\u300C${server.label}\u300D\uFF1F\u7F16\u8F91\u5668\u4E0E\u8FDC\u7A0B Bridge \u90FD\u4F1A\u505C\u6B62\u4F7F\u7528\u5B83\u3002`, { modal: true }, "\u79FB\u9664");
      if (confirm !== "\u79FB\u9664") return { cancelled: true };
      this.oauth.cancel(id);
      await this.catalog.remove(id);
      return { removed: id };
    });
    command("opencode.mcp.retry", async (serverId) => {
      if (serverId !== void 0 && typeof serverId !== "string") throw new Error("MCP \u670D\u52A1 ID \u65E0\u6548\u3002");
      await this.bridge?.refreshExternalMcp();
      return { retried: serverId ?? "global" };
    });
    this.disposables.push(...registerExternalMcpNetworkCommands(this.catalog, this.network, this.output));
    this.disposables.push(...registerExternalMcpSecretCommands(this.catalog, () => {
      this.refCache = void 0;
      if (vscode6.workspace.isTrusted) this.refreshBridge();
    }));
    this.disposables.push(vscode6.workspace.onDidGrantWorkspaceTrust(() => {
      this.changed.fire();
      this.refreshBridge();
    }));
    let wasTrusted = vscode6.workspace.isTrusted;
    const trustTimer = setInterval(() => {
      const trusted = vscode6.workspace.isTrusted;
      if (wasTrusted === trusted) return;
      wasTrusted = trusted;
      if (!trusted) this.oauth.cancelAll();
      this.changed.fire();
      this.refreshBridge();
    }, 1e3);
    this.disposables.push({ dispose: () => clearInterval(trustTimer) });
  }
  output;
  catalog;
  oauth;
  changed = new vscode6.EventEmitter();
  disposables = [];
  bridge;
  knownRevision = "";
  ready;
  disposed = false;
  fileListener = (_current, _previous) => this.onCatalogChange(true);
  /** Reference checks are cached per catalog revision and SecretStorage change, not re-resolved every 2 s. */
  refCache;
  secretEpoch = 0;
  /** One network decision for both surfaces (R2 §7.3); its fingerprint versions every definition. */
  network = new ExternalMcpNetwork();
  bundledBinDir;
  attachBridge(bridge) {
    this.bridge = bridge;
  }
  refreshBridge() {
    void this.bridge?.refreshExternalMcp().catch(() => this.output.appendLine("[external-mcp] Bridge refresh unavailable"));
  }
  onCatalogChange(fromOtherWindow) {
    if (this.disposed) return;
    try {
      const revision = this.catalog.snapshot().revision;
      if (revision === this.knownRevision) return;
      this.knownRevision = revision;
      this.oauth.cancelUnavailable();
      this.changed.fire();
      if (fromOtherWindow) this.refreshBridge();
      this.output.appendLine("[external-mcp] catalog changed");
    } catch {
      this.changed.fire();
      if (fromOtherWindow) this.refreshBridge();
    }
  }
  async provideDefinitions() {
    if (!vscode6.workspace.isTrusted) return [];
    try {
      await this.ready;
    } catch {
      return [];
    }
    if (!vscode6.workspace.isTrusted) return [];
    let servers;
    try {
      servers = this.catalog.snapshot().servers.filter((server) => server.enabled && server.editorEnabled);
    } catch {
      return [];
    }
    return servers.map((server) => {
      const label = providerLabel(server);
      if (server.transport === "stdio") return new vscode6.McpStdioServerDefinition(label, server.command ?? "", [], {}, this.definitionVersion(server));
      return new vscode6.McpHttpServerDefinition(label, vscode6.Uri.parse(`https://opencode.invalid/${server.id}`), {}, this.definitionVersion(server));
    });
  }
  async resolveDefinition(definition) {
    if (this.disposed || !vscode6.workspace.isTrusted) return void 0;
    await this.ready;
    if (this.disposed || !vscode6.workspace.isTrusted) return void 0;
    const id = providerId(definition);
    const server = this.catalog.snapshot().servers.find((item) => item.id === id && item.enabled && item.editorEnabled);
    if (!server || definition.label !== providerLabel(server)) return void 0;
    const version2 = this.definitionVersion(server), secretEpoch = this.secretEpoch;
    if (definition.version !== void 0 && definition.version !== version2) return void 0;
    const current = () => {
      if (this.disposed || !vscode6.workspace.isTrusted || secretEpoch !== this.secretEpoch) return false;
      try {
        const latest = this.catalog.snapshot().servers.find((item) => item.id === id && item.enabled && item.editorEnabled);
        return !!latest && definition.label === providerLabel(latest) && this.definitionVersion(latest) === version2;
      } catch {
        return false;
      }
    };
    const runtime = await this.catalog.resolve(server);
    if (!current()) return void 0;
    const timeout = runtime.timeout === void 0 ? void 0 : String(Math.round(runtime.timeout * 1e3));
    if (runtime.transport === "stdio") {
      const resolved = new vscode6.McpStdioServerDefinition(definition.label, runtime.command, runtime.args, {
        ...runtime.env,
        ...windowsMcpDirectEnvironment(runtime.command, runtime.args, runtime.env, this.bundledBinDir),
        ...timeout ? { OPENCODE_MCP_TIMEOUT_MS: timeout } : {}
      }, version2);
      if (runtime.cwd) resolved.cwd = vscode6.Uri.file(runtime.cwd);
      return resolved;
    }
    const oauthHandle = server.authType === "oauth" ? await this.oauth.issueEditorHandle(server) : void 0;
    if (!current()) return void 0;
    return new vscode6.McpHttpServerDefinition(definition.label, vscode6.Uri.parse(runtime.url), {
      ...runtime.headers,
      "X-OpenCode-Managed-Streamable-HTTP": runtime.httpTransport ?? "1",
      ...oauthHandle ? { "X-OpenCode-MCP-OAuth": oauthHandle } : {},
      ...timeout ? { "X-OpenCode-MCP-Timeout-MS": timeout } : {}
    }, version2);
  }
  definitionVersion(server) {
    return `${(0, import_node_crypto13.createHash)("sha256").update(JSON.stringify([server, "bundled-stdio-v1", server.transport === "stdio" ? this.bundledBinDir : void 0])).digest("hex").slice(0, 12)}:${this.network.fingerprint()}`;
  }
  async getCatalog() {
    try {
      await this.ready;
    } catch {
      return { error: "\u5386\u53F2 MCP \u53C2\u6570\u8FC1\u79FB\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7528\u6237\u914D\u7F6E\u4E0E\u5B89\u5168\u5B58\u50A8\u3002", entries: [], trusted: vscode6.workspace.isTrusted };
    }
    const runtime = this.bridge?.externalMcpHealth() ?? [];
    let servers;
    try {
      servers = this.catalog.snapshot().servers;
    } catch (error2) {
      return { error: error2 instanceof Error ? error2.message : "\u7528\u6237 MCP \u914D\u7F6E\u65E0\u6548\u3002", entries: [], trusted: vscode6.workspace.isTrusted };
    }
    const refs2 = await this.refStates(servers);
    const oauthStates = new Map(await Promise.all(servers.filter((server) => server.authType === "oauth").map(async (server) => [server.id, await this.oauth.status(server)])));
    const trusted = vscode6.workspace.isTrusted, bridgeRunning = this.bridge?.getStatus().state === "running";
    const networkNotice = this.network.lastChange && Date.now() - this.network.lastChange < 6e4 ? "\u7F51\u7EDC\u8BBE\u7F6E\u5DF2\u53D8\u5316\uFF0C\u5DF2\u91CD\u8FDE\u5171\u4EAB MCP \u670D\u52A1\u3002" : void 0;
    return {
      trusted,
      bridgeRunning,
      ...networkNotice ? { networkNotice } : {},
      entries: servers.map((server) => {
        const health = runtime.find((item) => item.id === server.id), referenceState = refs2.get(server.id) ?? "ok";
        const oauthState = oauthStates.get(server.id);
        const state = referenceState === "ok" && oauthState && oauthState !== "authorized" ? "missing-secret" : referenceState;
        const editorState = editorStateOf(server, { trusted, refs: state, health });
        const bridge = bridgeStatusOf(server, { bridgeRunning, refs: state, health });
        if (server.authType === "oauth" && bridge.status === "needs-auth") bridge.reason = oauthState === "authorizing" ? "\u6B63\u5728\u7B49\u5F85\u6D4F\u89C8\u5668\u6388\u6743\u3002" : "\u8BF7\u70B9\u51FB OAuth \u6388\u6743\u6216\u91CD\u65B0\u6388\u6743\u3002";
        return {
          id: server.id,
          label: server.label,
          source: "OpenCode \u7528\u6237\u76EE\u5F55",
          transport: server.transport,
          authType: server.authType,
          oauthState,
          httpTransport: server.httpTransport,
          description: server.description,
          cwd: server.cwd,
          timeout: server.timeout,
          enabled: server.enabled,
          editorEnabled: server.editorEnabled,
          bridgeEnabled: server.bridgeEnabled,
          editorStatus: legacyEditorStatus(editorState),
          editorState,
          bridge,
          ...server.transport === "stdio" ? { proxyMode: server.proxyMode ?? "inherit", proxyNotice: server.proxyMode === "custom" ? void 0 : this.network.stdioEnv(server.proxyMode).notice } : {},
          bridgeStatus: state !== "ok" ? { state: "error", toolCount: 0, error: bridge.reason ?? "\u914D\u7F6E\u6216\u51ED\u636E\u7F3A\u5931\uFF0C\u8BF7\u91CD\u65B0\u5BFC\u5165\u3002" } : health ?? { state: "off", toolCount: 0 },
          // A URL can carry a token in its path or query. Never return it, even to the UI.
          detail: (server.transport === "http" ? `${server.httpTransport === "sse" ? "SSE" : server.httpTransport === "auto" ? "\u81EA\u52A8\uFF08HTTP / SSE\uFF09" : "Streamable HTTP"}\uFF08\u5730\u5740\u4EC5\u5728\u672C\u673A\u5B89\u5168\u5B58\u50A8\uFF09` : `stdio \xB7 ${server.command ?? ""}${server.cwd ? ` \xB7 \u5DE5\u4F5C\u76EE\u5F55\uFF1A${server.cwd}` : ""}`) + (server.timeout !== void 0 ? ` \xB7 \u8D85\u65F6 ${server.timeout} \u79D2` : "") + (server.description ? ` \xB7 ${server.description}` : "")
        };
      })
    };
  }
  async refStates(servers) {
    const key = `${this.catalog.snapshot().revision}:${this.secretEpoch}`;
    if (this.refCache?.key === key) return this.refCache.states;
    const states = new Map(await Promise.all(servers.map(async (server) => [server.id, server.enabled ? await this.catalog.checkRefs(server).catch(() => "broken") : "ok"])));
    this.refCache = { key, states };
    return states;
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    (0, import_node_fs20.unwatchFile)(this.catalog.filePath, this.fileListener);
    this.changed.dispose();
    for (const disposable of this.disposables) disposable.dispose();
    this.bridge = void 0;
  }
};
export { providerLabel, providerId, vscode6, import_node_crypto13, import_node_fs20, PROVIDER_ID, ExternalMcpCenter };
