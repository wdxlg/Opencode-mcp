// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpService.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { McpPrefixGenerator, McpServer, McpServerMetadataCache } from "./module-2334.mjs";
import { CollisionEnablementModel, EnablementModel, isContributionEnabled } from "./module-1018.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { mcpServerCollisionBehaviorSection } from "./module-1421.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { autorun } from "./module-0052.mjs";
import { mcpAutoStartConfig } from "./module-1196.mjs";
import { IAutostartResult, McpConnectionState, McpServerDefinition, McpStartServerInteraction, UserInteractionRequiredError } from "./module-1206.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { startServerAndWaitForLiveTools } from "./module-2199.mjs";
import { equals } from "./module-0007.mjs";
import { transaction } from "./module-0045.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IMcpRegistry } from "./module-1447.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { derived } from "./module-0054.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/workbench/contrib/mcp/common/mcpService.ts
var McpService = class extends Disposable {
  constructor(_instantiationService, _mcpRegistry, _logService, configurationService, storageService) {
    super();
    this._instantiationService = _instantiationService;
    this._mcpRegistry = _mcpRegistry;
    this._logService = _logService;
    this.configurationService = configurationService;
    this._currentAutoStarts = /* @__PURE__ */ new Set();
    this._servers = observableValue(this, []);
    this.servers = this._servers.map((servers) => servers.map((s) => s.object));
    this._prefixGenerator = new McpPrefixGenerator();
    const baseEnablement = this._register(new EnablementModel("mcp.enablement", storageService));
    const collisionBehavior = observableConfigValue(mcpServerCollisionBehaviorSection, "disable" /* Disable */, configurationService);
    this.enablementModel = new McpCollisionEnablementModel(baseEnablement, this._mcpRegistry, collisionBehavior);
    this.userCache = this._register(_instantiationService.createInstance(McpServerMetadataCache, 0 /* PROFILE */));
    this.workspaceCache = this._register(_instantiationService.createInstance(McpServerMetadataCache, 1 /* WORKSPACE */));
    const updateThrottle = this._store.add(new RunOnceScheduler(() => this.updateCollectedServers(), 500));
    this._register(autorun((reader) => {
      for (const collection of this._mcpRegistry.collections.read(reader)) {
        collection.serverDefinitions.read(reader);
      }
      updateThrottle.schedule(500);
    }));
    this._initGuardian();
  }
  // ---------------------------------------------------------------------------------------------
  // OpenCode「MCP 守护」：自动连接开关打开时常驻运行，不再只在发消息时启动。
  //  - 打开开关 / 启动 OpenCode：立即启动所有已启用的服务器
  //  - 退出或断线：1、2、4、8…秒退避重连（最长 30 秒，不限次数）；网络恢复、窗口重新可见时立即重试
  //  - 连续 5 次都没启动成功（命令错、找不到程序等）：改为每 5 分钟试一次，状态记为失败并保留最后一条错误
  //  - 需要登录/授权：不自动重试，状态记为「需授权」
  //  - 假死：每 30 秒 ping，连续 2 次 5 秒超时即强制重启
  //  - 配置改了：updateCollectedServers 会停掉定义变化的服务器，守护随后用新配置拉起
  //  - 被删除或禁用：不再启动（删除的由 updateCollectedServers 释放）
  // ---------------------------------------------------------------------------------------------
  _guardianEnabled() {
    return this.configurationService.getValue(mcpAutoStartConfig) !== "never" /* Never */;
  }
  _guardianSeconds(key, def, min, max) {
    const v = Number(this.configurationService.getValue(key));
    return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def;
  }
  _initGuardian() {
    this._guard = /* @__PURE__ */ new Map();
    this._guardActivated = false;
    this._guardStatus = observableValue(this, { enabled: this._guardianEnabled(), state: "off", servers: [] });
    this.guardianStatus = this._guardStatus;
    const kick = (force) => {
      if (this._store.isDisposed) return;
      if (this._guardianEnabled()) {
        void this._guardTick(force);
      } else {
        this._guardActivated = false;
        for (const g of this._guard.values()) {
          g.fails = 0;
          g.nextAt = 0;
          g.pingMisses = 0;
        }
        this._publishGuardStatus();
      }
    };
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(mcpAutoStartConfig)) {
        if (this._guardianEnabled()) this._logService.info("[MCP 守护] 自动连接已开启，立即启动已启用的服务器");
        else this._logService.info("[MCP 守护] 自动连接已关闭，停止守护（不停止已连接的服务器）");
        kick(true);
      }
    }));
    const first = setTimeout(() => kick(true), 1500);
    const tick = setInterval(() => kick(false), 1e3);
    let lastPing = Date.now();
    const beat = setInterval(() => {
      const every = this._guardianSeconds("chat.mcp.autostartHeartbeatSeconds", 30, 10, 600) * 1e3;
      if (Date.now() - lastPing < every) return;
      lastPing = Date.now();
      if (this._guardianEnabled()) void this._guardHeartbeat();
    }, 5e3);
    this._register(toDisposable(() => {
      clearTimeout(first);
      clearInterval(tick);
      clearInterval(beat);
    }));
    const retryNow = () => {
      if (!this._guardianEnabled()) return;
      for (const g of this._guard.values()) {
        if (!g.needsAuth && g.fails < 5) g.nextAt = 0;
      }
      kick(true);
    };
    try {
      const w = globalThis;
      if (w?.addEventListener) {
        const onVis = () => {
          if (!w.document || w.document.visibilityState === "visible") retryNow();
        };
        w.addEventListener("online", retryNow);
        w.document?.addEventListener?.("visibilitychange", onVis);
        this._register(toDisposable(() => {
          w.removeEventListener("online", retryNow);
          w.document?.removeEventListener?.("visibilitychange", onVis);
        }));
      }
    } catch {
    }
    this._register(autorun((reader) => {
      for (const s of this.servers.read(reader)) {
        s.connectionState.read(reader);
        s.enablement.read(reader);
        s.tools.read(reader);
      }
      this._publishGuardStatus();
    }));
  }
  _guardRec(server) {
    const id2 = server.definition.id;
    let g = this._guard.get(id2);
    if (!g) {
      g = { fails: 0, nextAt: 0, inFlight: false, needsAuth: false, lastError: void 0, pingMisses: 0, wasRunning: false, restarts: 0 };
      this._guard.set(id2, g);
    }
    return g;
  }
  _guardDelay(fails) {
    if (fails >= 5) return 5 * 60e3;
    return Math.min(30e3, 1e3 * Math.pow(2, Math.max(0, fails - 1)));
  }
  async _guardTick(force) {
    if (this._guardTicking) return;
    this._guardTicking = true;
    try {
      if (!this._guardActivated) {
        this._guardActivated = true;
        try {
          await this._activateCollections();
        } catch (err) {
          this._guardActivated = false;
          this._logService.warn("[MCP 守护] 读取 MCP 配置失败", err);
          return;
        }
      }
      const now = Date.now();
      const live = new Set();
      for (const server of this.servers.get()) {
        live.add(server.definition.id);
        if (!isContributionEnabled(server.enablement.get())) continue;
        const g = this._guardRec(server);
        const st = server.connectionState.get();
        if (st.state === McpConnectionState.Kind.Running) {
          if (!g.wasRunning) {
            g.wasRunning = true;
            g.fails = 0;
            g.needsAuth = false;
            g.lastError = void 0;
            g.pingMisses = 0;
          }
          continue;
        }
        if (st.state === McpConnectionState.Kind.Starting) continue;
        if (g.wasRunning) {
          g.wasRunning = false;
          g.fails = 0;
          g.nextAt = now + this._guardDelay(1);
          if (st.state === McpConnectionState.Kind.Error) g.lastError = st.message;
          this._logService.warn(`[MCP 守护] ${server.definition.label} 已断开（${McpConnectionState.toKindString(st.state)}${st.message ? "：" + st.message : ""}），1 秒后重连`);
          continue;
        }
        if (st.state === McpConnectionState.Kind.Stopped && st.reason === "needs-user-interaction") {
          g.needsAuth = true;
        }
        if (g.needsAuth && !force) continue;
        if (g.inFlight) continue;
        if (!force && now < g.nextAt) continue;
        if (force && g.fails >= 5 && now < g.nextAt) continue;
        g.inFlight = true;
        this._guardStart(server, g);
      }
      for (const id2 of [...this._guard.keys()]) {
        if (!live.has(id2)) this._guard.delete(id2);
      }
    } finally {
      this._guardTicking = false;
      this._publishGuardStatus();
    }
  }
  _guardStart(server, g) {
    const label = server.definition.label;
    const started = Date.now();
    this._publishGuardStatus();
    startServerAndWaitForLiveTools(server, { interaction: new McpStartServerInteraction(), errorOnUserInteraction: true }, CancellationToken.None).then((ok2) => {
      const st = server.connectionState.get();
      if (ok2 || st.state === McpConnectionState.Kind.Running) {
        g.fails = 0;
        g.needsAuth = false;
        g.lastError = void 0;
        g.restarts++;
        g.wasRunning = true;
        this._logService.info(`[MCP 守护] ${label} 已连接（${Date.now() - started} ms，工具 ${server.tools.get().length} 个）`);
      } else {
        g.fails++;
        if (st.state === McpConnectionState.Kind.Error && st.message) g.lastError = st.message;
        else if (!g.lastError) g.lastError = "启动后未就绪（" + McpConnectionState.toKindString(st.state) + "）";
        const d = this._guardDelay(g.fails);
        g.nextAt = Date.now() + d;
        this._logService.warn(`[MCP 守护] ${label} 第 ${g.fails} 次启动失败：${g.lastError}；${Math.round(d / 1e3)} 秒后重试`);
      }
    }, (err) => {
      if (err instanceof UserInteractionRequiredError && String(err.message || "").includes("auth")) {
        g.needsAuth = true;
        g.lastError = "需要登录或授权";
        this._logService.info(`[MCP 守护] ${label} 需要登录或授权，暂停自动重试`);
      } else {
        g.fails++;
        const st = server.connectionState.get();
        g.lastError = st.state === McpConnectionState.Kind.Error && st.message ? st.message : String(err?.message || err);
        const d = this._guardDelay(g.fails);
        g.nextAt = Date.now() + d;
        this._logService.warn(`[MCP 守护] ${label} 第 ${g.fails} 次启动失败：${g.lastError}；${Math.round(d / 1e3)} 秒后重试`);
      }
    }).finally(() => {
      g.inFlight = false;
      this._publishGuardStatus();
    });
  }
  async _guardHeartbeat() {
    await Promise.all(this.servers.get().map(async (server) => {
      if (!isContributionEnabled(server.enablement.get())) return;
      if (server.connectionState.get().state !== McpConnectionState.Kind.Running) return;
      const handler = server.connection.get()?.handler.get();
      if (!handler) return;
      const g = this._guardRec(server);
      const cts = new CancellationTokenSource();
      let timer;
      const ok2 = await Promise.race([
        handler.sendRequest({ method: "ping" }, cts.token).then(() => true, (e) => {
          const msg = String(e?.message || e || "");
          return /method not found|-32601|not supported/i.test(msg);
        }),
        new Promise((r2) => {
          timer = setTimeout(() => r2(false), 5e3);
        })
      ]);
      clearTimeout(timer);
      cts.dispose(true);
      if (ok2) {
        g.pingMisses = 0;
        return;
      }
      g.pingMisses++;
      this._logService.warn(`[MCP 守护] ${server.definition.label} ping 超时（第 ${g.pingMisses} 次）`);
      if (g.pingMisses >= 2) {
        g.pingMisses = 0;
        g.lastError = "无响应（连续 2 次 ping 超时），已强制重启";
        this._logService.warn(`[MCP 守护] ${server.definition.label} 无响应，强制重启`);
        try {
          await server.stop();
        } catch {
        }
      }
    }));
  }
  _publishGuardStatus() {
    if (!this._guardStatus) return;
    const enabled = this._guardianEnabled();
    const servers = [];
    for (const server of this.servers.get()) {
      if (!isContributionEnabled(server.enablement.get())) continue;
      const g = this._guard.get(server.definition.id);
      const st = server.connectionState.get();
      let state;
      if (st.state === McpConnectionState.Kind.Running) state = "running";
      else if (g?.needsAuth) state = "auth";
      else if (st.state === McpConnectionState.Kind.Starting || g?.inFlight) state = "starting";
      else if (g && g.fails >= 5) state = "failed";
      else if (st.state === McpConnectionState.Kind.Error || g && g.fails > 0) state = enabled ? "retrying" : "error";
      else state = enabled ? "starting" : "stopped";
      let tools = 0;
      try {
        tools = server.tools.get().length;
      } catch {
      }
      servers.push({
        id: server.definition.id,
        label: server.definition.label,
        state,
        tools,
        fails: g?.fails || 0,
        nextAt: g?.nextAt || 0,
        lastError: g?.lastError || (st.state === McpConnectionState.Kind.Error ? st.message : void 0)
      });
    }
    let overall = "off";
    if (enabled) {
      if (!servers.length) overall = "empty";
      else if (servers.some((s) => s.state === "failed" || s.state === "error")) overall = "error";
      else if (servers.some((s) => s.state !== "running")) overall = "pending";
      else overall = "ready";
    }
    const prev = this._guardStatus.get();
    const next = { enabled, state: overall, servers };
    if (JSON.stringify(prev) !== JSON.stringify(next)) this._guardStatus.set(next, void 0);
  }
  /** 手动重启一个服务器（悬停面板里点服务器名用），清掉退避计数。 */
  async guardianRestart(id2) {
    const server = this.servers.get().find((s) => s.definition.id === id2);
    if (!server) return;
    const g = this._guardRec(server);
    g.fails = 0;
    g.needsAuth = false;
    g.nextAt = 0;
    g.pingMisses = 0;
    try {
      await server.stop();
    } catch {
    }
    g.wasRunning = false;
    if (!g.inFlight) {
      g.inFlight = true;
      this._guardStart(server, g);
    }
  }
  /**
   * 发送前门槛：有服务器正在启动时最多等 chat.mcp.autostartWaitSeconds 秒（默认 8）。
   * 超时也照常发送（用可用的工具），返回未就绪的服务器名；每次写一行日志。
   */
  async ensureReady(token) {
    const enabled = this._guardianEnabled();
    const waitMs = this._guardianSeconds("chat.mcp.autostartWaitSeconds", 8, 0, 120) * 1e3;
    const started = Date.now();
    if (enabled) {
      if (!this._guardActivated) await this._guardTick(true);
      else await this._guardTick(false);
      const busy = () => this.servers.get().some((s) => {
        if (!isContributionEnabled(s.enablement.get())) return false;
        const g = this._guard.get(s.definition.id);
        if (g?.needsAuth || g && g.fails >= 5) return false;
        const k = s.connectionState.get().state;
        return k === McpConnectionState.Kind.Starting || !!g?.inFlight || k !== McpConnectionState.Kind.Running && !!g && g.nextAt - Date.now() < waitMs;
      });
      while (busy() && Date.now() - started < waitMs && !token?.isCancellationRequested) {
        await new Promise((r2) => setTimeout(r2, 200));
      }
    }
    this._publishGuardStatus();
    const status = this._guardStatus.get();
    const notReady = status.servers.filter((s) => s.state !== "running").map((s) => s.label);
    const toolsets = [];
    let fp = 0;
    for (const server of this.servers.get()) {
      if (server.connectionState.get().state !== McpConnectionState.Kind.Running) continue;
      let tools = [];
      try {
        tools = server.tools.get();
      } catch {
      }
      for (const tool of tools) {
        const s = `${server.definition.label}/${tool.definition?.name ?? tool.id}:${JSON.stringify(tool.definition?.inputSchema ?? {})}`;
        for (let i2 = 0; i2 < s.length; i2++) fp = Math.imul(fp ^ s.charCodeAt(i2), 16777619) >>> 0;
      }
    }
    const fingerprint = fp.toString(16).padStart(8, "0");
    const line = status.servers.map((s) => `${s.label}=${s.state}(${s.tools})`).join(", ") || "无服务器";
    this._logService.info(`[MCP 发送前] 自动连接=${enabled ? "开" : "关"} 等待=${Date.now() - started}ms ${line} 工具指纹=${fingerprint}${notReady.length ? " 未就绪=" + notReady.join("、") : ""}`);
    return { enabled, waitedMs: Date.now() - started, notReady, fingerprint, servers: status.servers };
  }
  get lazyCollectionState() {
    return this._mcpRegistry.lazyCollectionState;
  }
  cancelAutostart() {
    for (const cts of this._currentAutoStarts) {
      cts.cancel();
    }
  }
  autostart(_token) {
    const autoStartConfig = this.configurationService.getValue(mcpAutoStartConfig);
    if (autoStartConfig === "never" /* Never */) {
      return observableValue(this, IAutostartResult.Empty);
    }
    const state = observableValue(this, { working: true, starting: [], serversRequiringInteraction: [] });
    const store = new DisposableStore();
    const cts = store.add(new CancellationTokenSource(_token));
    this._currentAutoStarts.add(cts);
    store.add(toDisposable(() => {
      this._currentAutoStarts.delete(cts);
    }));
    store.add(cts.token.onCancellationRequested(() => {
      state.set(IAutostartResult.Empty, void 0);
    }));
    this._autostart(autoStartConfig, state, cts.token).catch((err) => {
      this._logService.error("Error during MCP autostart:", err);
      state.set(IAutostartResult.Empty, void 0);
    }).finally(() => store.dispose());
    return state;
  }
  async _autostart(autoStartConfig, state, token) {
    await this._activateCollections();
    if (token.isCancellationRequested) {
      return;
    }
    const candidates = this.servers.get().filter(
      (s) => isContributionEnabled(s.enablement.get())
    );
    let todo = /* @__PURE__ */ new Set();
    const inError = (s) => s.connectionState.get().state === McpConnectionState.Kind.Error;
    if (autoStartConfig === "onlyNew" /* OnlyNew */) {
      todo = new Set(candidates.filter((s) => s.cacheState.get() === 0 /* Unknown */ || inError(s)));
    } else if (autoStartConfig === "newAndOutdated" /* NewAndOutdated */) {
      todo = new Set(candidates.filter((s) => {
        const c = s.cacheState.get();
        return c === 0 /* Unknown */ || c === 2 /* Outdated */ || inError(s);
      }));
    }
    if (!todo.size) {
      state.set(IAutostartResult.Empty, void 0);
      return;
    }
    const interaction = new McpStartServerInteraction();
    const requiringInteraction = [];
    const update = () => state.set({
      working: todo.size > 0,
      starting: [...todo].map((t2) => t2.definition),
      serversRequiringInteraction: requiringInteraction
    }, void 0);
    update();
    await Promise.all([...todo].map(async (server, i2) => {
      try {
        await startServerAndWaitForLiveTools(server, { interaction, errorOnUserInteraction: true }, token);
      } catch (error) {
        if (error instanceof UserInteractionRequiredError) {
          requiringInteraction.push({ id: server.definition.id, label: server.definition.label, errorMessage: error.message });
        }
      } finally {
        todo.delete(server);
        if (!token.isCancellationRequested) {
          update();
        }
      }
    }));
  }
  resetCaches() {
    this.userCache.reset();
    this.workspaceCache.reset();
  }
  resetTrust() {
    this.resetCaches();
  }
  async activateCollections() {
    await this._activateCollections();
  }
  async _activateCollections() {
    const collections = await this._mcpRegistry.discoverCollections();
    this.updateCollectedServers();
    return new Set(collections.map((c) => c.id));
  }
  updateCollectedServers() {
    const definitions3 = this._mcpRegistry.collections.get().flatMap(
      (collectionDefinition) => collectionDefinition.serverDefinitions.get().map((serverDefinition) => {
        return { serverDefinition, collectionDefinition };
      })
    );
    const nextDefinitions = new Set(definitions3);
    const currentServers = this._servers.get();
    const nextServers = [];
    const pushMatch = (match2, rec) => {
      nextDefinitions.delete(match2);
      nextServers.push(rec);
      const connection = rec.object.connection.get();
      if (connection && !McpServerDefinition.equals(connection.definition, match2.serverDefinition)) {
        rec.object.stop();
        this._logService.debug(`MCP server ${rec.object.definition.id} stopped because the definition changed`);
      }
    };
    for (const server of currentServers) {
      const match2 = definitions3.find((d) => defsEqual(server.object, d));
      if (match2) {
        pushMatch(match2, server);
      } else {
        server.object.dispose();
      }
    }
    for (const def2 of nextDefinitions) {
      const object2 = this._instantiationService.createInstance(
        McpServer,
        def2.collectionDefinition,
        def2.serverDefinition,
        def2.serverDefinition.roots,
        !!def2.collectionDefinition.lazy,
        def2.collectionDefinition.scope === 1 /* WORKSPACE */ ? this.workspaceCache : this.userCache,
        this._prefixGenerator,
        this.enablementModel
      );
      nextServers.push({ object: object2 });
    }
    if (!equals(currentServers, nextServers)) {
      transaction((tx) => {
        this._servers.set(nextServers, tx);
      });
    }
  }
  dispose() {
    this._servers.get().forEach((s) => s.object.dispose());
    super.dispose();
  }
};

McpService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IMcpRegistry),
  __decorateParam(2, ILogService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IStorageService)
], McpService);

function defsEqual(server, def2) {
  return server.collection.id === def2.collectionDefinition.id && server.definition.id === def2.serverDefinition.id;
}

var McpCollisionEnablementModel = class extends CollisionEnablementModel {
  /**
   * For each server definition ID, the list of all definition IDs that share
   * the same (case-insensitive) label, in priority order (lowest collection
   * order first). Empty when collision behavior is `suffix`.
   */
  constructor(base, registry4, collisionBehavior) {
    const collisionGroups = derived((reader) => {
      if (collisionBehavior.read(reader) !== "disable" /* Disable */) {
        return /* @__PURE__ */ new Map();
      }
      const collections = registry4.collections.read(reader);
      const labelToIds = /* @__PURE__ */ new Map();
      for (const collection of collections) {
        for (const server of collection.serverDefinitions.read(reader)) {
          const key3 = server.label.toLowerCase();
          let ids = labelToIds.get(key3);
          if (!ids) {
            ids = [];
            labelToIds.set(key3, ids);
          }
          ids.push(server.id);
        }
      }
      const groups = /* @__PURE__ */ new Map();
      for (const ids of labelToIds.values()) {
        if (ids.length < 2) {
          continue;
        }
        for (const id2 of ids) {
          groups.set(id2, ids);
        }
      }
      return groups;
    });
    super(base, collisionGroups);
  }
};
export { defsEqual, McpService, McpCollisionEnablementModel };
