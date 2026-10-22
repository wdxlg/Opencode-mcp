// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpStartup.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { mcpAccessConfig, mcpAutoStartConfig } from "./module-1196.mjs";
import { autorun } from "./module-0052.mjs";
import { isContributionEnabled } from "./module-1019.mjs";
import { IMcpService, McpConnectionState } from "./module-1206.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpStartup.ts
var McpStartup = class extends Disposable {
  constructor(mcpService, configurationService, workspaceTrustService, logService) {
    super();
    this.mcpService = mcpService;
    this.configurationService = configurationService;
    this.workspaceTrustService = workspaceTrustService;
    this.logService = logService;
    this.attempted = /* @__PURE__ */ new Set();
    this.pending = /* @__PURE__ */ new Set();
    this.discovered = /* @__PURE__ */ new Set();
    this.discovering = false;
    this.disposed = false;
    this.scheduler = this._register(new RunOnceScheduler(() => this.startAvailable(), 100));
    this._register(toDisposable(() => {
      this.disposed = true;
      this.stopPending();
      this.attempted.clear();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(mcpAccessConfig) || event.affectsConfiguration(mcpAutoStartConfig)) {
        this.schedule();
      }
    }));
    this._register(this.workspaceTrustService.onDidChangeTrust(() => this.schedule()));
    this._register(autorun((reader) => {
      this.mcpService.lazyCollectionState.read(reader);
      for (const server of this.mcpService.servers.read(reader)) {
        server.enablement.read(reader);
      }
      this.schedule();
    }));
  }
  static {
    this.ID = "workbench.contrib.mcp.startup";
  }
  allowed() {
    return !this.disposed && this.workspaceTrustService.isWorkspaceTrusted() && this.configurationService.getValue(mcpAccessConfig) !== "none" /* None */ && this.configurationService.getValue(mcpAutoStartConfig) !== "never" /* Never */;
  }
  schedule() {
    if (!this.allowed()) {
      this.stopPending();
      this.attempted.clear();
    }
    if (!this.disposed) {
      this.scheduler.schedule();
    }
  }
  stopPending() {
    for (const server of this.pending) {
      void server.stop().catch(() => void 0);
    }
  }
  startAvailable() {
    if (!this.allowed()) {
      return;
    }
    const lazy = this.mcpService.lazyCollectionState.get();
    if (!this.discovering && lazy.state === 0 /* HasUnknown */ && lazy.collections.some((collection) => !this.discovered.has(collection.id))) {
      for (const collection of lazy.collections) {
        this.discovered.add(collection.id);
      }
      this.discovering = true;
      void this.mcpService.activateCollections().catch(() => {
        this.logService.warn("MCP startup: extension discovery failed; manual discovery remains available.");
      }).finally(() => {
        this.discovering = false;
        this.schedule();
      });
    }
    const servers = new Set(this.mcpService.servers.get());
    for (const server of this.attempted) {
      if (!servers.has(server)) {
        this.attempted.delete(server);
      }
    }
    for (const server of servers) {
      if (!isContributionEnabled(server.enablement.get())) {
        this.attempted.delete(server);
        if (this.pending.has(server)) {
          void server.stop().catch(() => void 0);
        }
        continue;
      }
      if (this.attempted.has(server) || this.pending.has(server)) {
        continue;
      }
      this.attempted.add(server);
      if (McpConnectionState.canBeStarted(server.connectionState.get().state)) {
        void this.startServer(server);
      }
    }
  }
  async startServer(server) {
    this.pending.add(server);
    try {
      await server.start({ errorOnUserInteraction: true });
    } catch {
      this.logService.warn("MCP startup: a server requires attention; use its status to authorize or retry.");
    } finally {
      this.pending.delete(server);
      if (!this.allowed() || !isContributionEnabled(server.enablement.get())) {
        await server.stop().catch(() => void 0);
      }
    }
  }
};

McpStartup = __decorateClass([
  __decorateParam(0, IMcpService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IWorkspaceTrustManagementService),
  __decorateParam(3, ILogService)
], McpStartup);
export { McpStartup };
