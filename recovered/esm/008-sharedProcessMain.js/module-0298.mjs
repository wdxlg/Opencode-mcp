// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/browserView/node/playwrightService.ts
import { Disposable, DisposableMap } from "./module-0013.mjs";
import { getAgentBrowserViewCreationDefaults } from "./module-0294.mjs";
import { DeferredPromise, disposableTimeout, raceTimeout, timeout } from "./module-0029.mjs";
import { DialogInterruptedError, PlaywrightTab } from "./module-0297.mjs";
import { generateUuid } from "./module-0082.mjs";


// src/vs/platform/browserView/node/playwrightService.ts
var DEFERRED_RESULT_CLEANUP_MS = 5 * 6e4;

var SESSION_INACTIVITY_MS = 30 * 6e4;

var OPEN_PAGE_NAVIGATION_TIMEOUT_MS = 3e4;

function isCDPRequest(message) {
  const candidate = message;
  return typeof candidate.id === "number" && typeof candidate.method === "string" && (candidate.sessionId === void 0 || typeof candidate.sessionId === "string");
}

var PlaywrightService = class extends Disposable {
  constructor(windowId, browserViewGroupRemoteService, logService, agentNetworkFilterService, telemetryService) {
    super();
    this.windowId = windowId;
    this.browserViewGroupRemoteService = browserViewGroupRemoteService;
    this.logService = logService;
    this.agentNetworkFilterService = agentNetworkFilterService;
    this.telemetryService = telemetryService;
    this._sessions = this._register(new DisposableMap());
    /** In-flight session initializations keyed by session ID. */
    this._pendingInits = /* @__PURE__ */ new Map();
    /** Inactivity timers keyed by session ID. */
    this._inactivityTimers = this._register(new DisposableMap());
  }
  /**
   * Get or create a fully-initialized {@link PlaywrightSession} for the
   * given session ID. Creates the CDP group and Playwright browser
   * connection if the session does not already exist.
   */
  async _getOrCreateSession(sessionId) {
    const existing = this._sessions.get(sessionId);
    if (existing) {
      this._touchSession(sessionId);
      return existing;
    }
    const pending = this._pendingInits.get(sessionId);
    if (pending) {
      return pending;
    }
    const initPromise = this._initSession(sessionId);
    this._pendingInits.set(sessionId, initPromise);
    try {
      return await initPromise;
    } finally {
      this._pendingInits.delete(sessionId);
    }
  }
  /**
   * Create and fully initialize a new session: browser view group,
   * Playwright CDP connection, and page replay.
   */
  async _initSession(sessionId) {
    this.logService.debug(`[PlaywrightService] Initializing session ${sessionId}`);
    const group = await this.browserViewGroupRemoteService.createGroup(
      { audience: { type: "agent", sessionId } },
      {
        hostWindowId: this.windowId,
        ...getAgentBrowserViewCreationDefaults(sessionId)
      }
    );
    const actionScope = { activeCalls: 0 };
    let browser;
    try {
      const playwright = await import("playwright-core");
      const sub = group.onCDPMessage((msg) => transport.onmessage?.(msg));
      const transport = {
        close() {
          sub.dispose();
          this.onclose?.();
        },
        send: (rawMessage) => {
          if (!isCDPRequest(rawMessage)) {
            throw new Error(`[PlaywrightService] Unexpected CDP transport payload for session ${sessionId} (type: ${typeof rawMessage})`);
          }
          const message = rawMessage;
          if (actionScope.activeCalls === 0 && message.method.startsWith("Emulation.")) {
            setTimeout(() => {
              transport.onmessage?.({ id: message.id, result: {}, sessionId: message.sessionId });
            }, 1);
            return;
          }
          void group.sendCDPMessage(message);
        }
      };
      browser = await playwright.chromium.connectOverCDP(transport);
    } catch (e) {
      group.dispose();
      throw e;
    }
    this.logService.debug(`[PlaywrightService] Connected to browser for session ${sessionId}`);
    if (this._store.isDisposed) {
      browser.close().catch(() => {
      });
      group.dispose();
      throw new Error("PlaywrightService was disposed during initialization");
    }
    const session = new PlaywrightSession(
      sessionId,
      browser,
      group,
      actionScope,
      this.logService,
      this.agentNetworkFilterService,
      this.telemetryService
    );
    browser.on("disconnected", () => {
      this.logService.debug(`[PlaywrightService] Browser disconnected for session ${sessionId}`);
      this._sessions.deleteAndDispose(sessionId);
      this._inactivityTimers.deleteAndDispose(sessionId);
    });
    this._sessions.set(sessionId, session);
    this._touchSession(sessionId);
    return session;
  }
  // --- Playwright operations (delegated to per-session instances) ---
  async waitForPageAndGetSummary(sessionId, pageId, expectedUrl, discoveryTimeoutMs) {
    const session = await this._getOrCreateSession(sessionId);
    return session.waitForPageAndGetSummary(pageId, expectedUrl, discoveryTimeoutMs);
  }
  async getSummary(sessionId, pageId) {
    const session = await this._getOrCreateSession(sessionId);
    return session.getSummary(pageId);
  }
  async invokeFunctionRaw(sessionId, pageId, fnDef, ...args) {
    const session = await this._getOrCreateSession(sessionId);
    return session.invokeFunctionRaw(pageId, fnDef, ...args);
  }
  async invokeFunction(sessionId, pageId, fnDef, args = [], timeoutMs) {
    const session = await this._getOrCreateSession(sessionId);
    return session.invokeFunction(pageId, fnDef, args, timeoutMs);
  }
  async waitForDeferredResult(sessionId, deferredResultId, timeoutMs) {
    const session = await this._getOrCreateSession(sessionId);
    return session.waitForDeferredResult(deferredResultId, timeoutMs);
  }
  async replyToFileChooser(sessionId, pageId, files) {
    const session = await this._getOrCreateSession(sessionId);
    return session.replyToFileChooser(pageId, files);
  }
  async replyToDialog(sessionId, pageId, accept, promptText) {
    const session = await this._getOrCreateSession(sessionId);
    return session.replyToDialog(pageId, accept, promptText);
  }
  // --- Session lifecycle ---
  async disposeSession(sessionId) {
    if (this._sessions.has(sessionId)) {
      this.logService.debug(`[PlaywrightService] Disposing session ${sessionId}`);
      this._sessions.deleteAndDispose(sessionId);
      this._inactivityTimers.deleteAndDispose(sessionId);
    }
  }
  // --- Private helpers ---
  /**
   * Reset the inactivity timer for a session. After
   * {@link SESSION_INACTIVITY_MS} of no activity the session is
   * automatically disposed.
   */
  _touchSession(sessionId) {
    this._inactivityTimers.deleteAndDispose(sessionId);
    const timer = disposableTimeout(
      () => {
        this.logService.debug(`[PlaywrightService] Session ${sessionId} inactive for ${SESSION_INACTIVITY_MS / 6e4}m, disposing`);
        this._sessions.deleteAndDispose(sessionId);
        this._inactivityTimers.deleteAndDispose(sessionId);
      },
      SESSION_INACTIVITY_MS
    );
    this._inactivityTimers.set(sessionId, timer);
  }
};

var PlaywrightSession = class extends Disposable {
  constructor(sessionId, _browser, group, actionScope, logService, agentNetworkFilterService, telemetryService) {
    super();
    this.sessionId = sessionId;
    this._browser = _browser;
    this.group = group;
    this.actionScope = actionScope;
    this.logService = logService;
    this.agentNetworkFilterService = agentNetworkFilterService;
    this.telemetryService = telemetryService;
    // --- Page matching ---
    this._viewIdToPage = /* @__PURE__ */ new Map();
    this._pageToViewId = /* @__PURE__ */ new WeakMap();
    this._tabs = /* @__PURE__ */ new WeakMap();
    this._pageDiscoveryPromises = /* @__PURE__ */ new Map();
    this._watchedContexts = /* @__PURE__ */ new WeakSet();
    /** In-flight deferred results keyed by their generated ID. */
    this._deferredResults = this._register(new DisposableMap());
    this._register(this.group);
    this._scanForNewContexts();
  }
  /** Register a disposable to be cleaned up when this session is disposed. */
  registerDisposable(d) {
    this._register(d);
  }
  // --- Page operations ---
  async waitForPageAndGetSummary(pageId, expectedUrl, discoveryTimeoutMs) {
    const page = await this._waitForPage(pageId, Date.now() + discoveryTimeoutMs);
    try {
      if (expectedUrl !== "about:blank" && page.url() === "about:blank") {
        await page.waitForURL((url) => url.toString() !== "about:blank", { waitUntil: "domcontentloaded", timeout: OPEN_PAGE_NAVIGATION_TIMEOUT_MS });
      } else {
        await page.waitForLoadState("domcontentloaded", { timeout: OPEN_PAGE_NAVIGATION_TIMEOUT_MS });
      }
    } catch (error) {
      if (!isNavigationTimeoutError(error)) {
        throw error;
      }
      throw new Error(`Timed out waiting for browser page "${pageId}" to navigate to "${expectedUrl}". The page is open and can be reused.`, { cause: error });
    }
    return this._getSummary(pageId);
  }
  async getSummary(pageId) {
    return this._getSummary(pageId, true);
  }
  async invokeFunctionRaw(pageId, fnDef, ...args) {
    const fn = await this._compileFunction(fnDef);
    return this._runAgainstPage(pageId, (page) => fn(page, args));
  }
  async invokeFunction(pageId, fnDef, args = [], timeoutMs) {
    this.logService.info(`[PlaywrightSession] Invoking function on view ${pageId}`);
    const logCtx = {
      startedAt: Date.now(),
      codeLength: fnDef.length,
      codeLineCount: fnDef.split("\n").length,
      pageMethodsCalled: /* @__PURE__ */ new Map(),
      wasDeferred: false,
      resumeCount: 0,
      logged: false
    };
    let fn;
    try {
      fn = await this._compileFunction(fnDef);
    } catch (err) {
      this._logExecution(logCtx, false);
      const summary2 = await this._getSummary(pageId);
      return { error: err instanceof Error ? err.message : String(err), summary: summary2 };
    }
    const wrappedCallback = async (page) => fn(createPageApiProxy(page, logCtx.pageMethodsCalled), args);
    if (timeoutMs !== void 0) {
      return this._runWithDeferral(pageId, wrappedCallback, timeoutMs, void 0, logCtx);
    }
    let result, error;
    try {
      result = await this._runAgainstPage(pageId, wrappedCallback);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
    this._logExecution(logCtx, !error);
    const summary = await this._getSummary(pageId);
    return { result, error, summary };
  }
  async waitForDeferredResult(deferredResultId, timeoutMs) {
    const entry = this._deferredResults.get(deferredResultId);
    if (!entry) {
      throw new Error(`No deferred result found with ID "${deferredResultId}". It may have been cleaned up or already consumed.`);
    }
    const { pageId, promise, logCtx } = entry;
    if (logCtx) {
      logCtx.resumeCount++;
    }
    this._deferredResults.deleteAndDispose(deferredResultId);
    return this._runWithDeferral(pageId, () => promise, timeoutMs, deferredResultId, logCtx);
  }
  async replyToFileChooser(pageId, files) {
    const page = await this._getPage(pageId);
    const tab = this._tabs.get(page);
    if (!tab) {
      throw new Error("Failed to reply to file chooser");
    }
    await tab.replyToFileChooser(files);
    const summary = await tab.getSummary();
    return { summary };
  }
  async replyToDialog(pageId, accept, promptText) {
    const page = await this._getPage(pageId);
    const tab = this._tabs.get(page);
    if (!tab) {
      throw new Error("Failed to reply to dialog");
    }
    await tab.replyToDialog(accept, promptText);
    const summary = await tab.getSummary();
    return { summary };
  }
  // --- Private: page operations ---
  async _getSummary(pageId, full = false) {
    const page = await this._getPage(pageId);
    const tab = this._tabs.get(page);
    if (!tab) {
      throw new Error("Failed to get page summary");
    }
    return tab.getSummary(full);
  }
  async _runAgainstPage(pageId, callback) {
    const page = await this._getPage(pageId);
    const tab = this._tabs.get(page);
    if (!tab) {
      throw new Error("Failed to execute function against page");
    }
    return tab.safeRunAgainstPage(async () => callback(page));
  }
  async _runWithDeferral(pageId, callback, timeoutMs, existingDeferredId, logCtx) {
    const deferred = new DeferredPromise();
    deferred.p.catch(() => {
    });
    if (existingDeferredId === void 0 && logCtx) {
      deferred.p.then(() => this._logExecution(logCtx, true), () => this._logExecution(logCtx, false));
    }
    const wrappedPromise = this._runAgainstPage(pageId, async (page) => {
      const promise = callback(page);
      promise.catch(() => {
      });
      deferred.settleWith(promise);
      return promise;
    });
    let result, error;
    let interrupted = false;
    try {
      result = await raceTimeout(wrappedPromise, timeoutMs, () => {
        interrupted = true;
      });
    } catch (err) {
      if (err instanceof DialogInterruptedError) {
        interrupted = true;
      }
      error = err instanceof Error ? err.message : String(err);
    }
    let deferredResultId;
    if (interrupted) {
      if (logCtx) {
        logCtx.wasDeferred = true;
      }
      deferredResultId = existingDeferredId ?? generateUuid();
      const cleanup = disposableTimeout(() => this._deferredResults.deleteAndDispose(deferredResultId), DEFERRED_RESULT_CLEANUP_MS);
      this._deferredResults.set(deferredResultId, { pageId, promise: deferred.p, logCtx, dispose: () => cleanup.dispose() });
      this.logService.info(`[PlaywrightSession] Execution interrupted, deferred as ${deferredResultId}`);
    } else if (logCtx) {
      this._logExecution(logCtx, !error);
    }
    const summary = await this._getSummary(pageId);
    return { result, error, summary, deferredResultId };
  }
  /**
   * Emit completion telemetry for a single {@link invokeFunction} call, once the
   * page work settles. Idempotent: only the first call for a given context emits,
   * so the synchronous and settlement-promise paths can both call it safely.
   */
  _logExecution(ctx, success) {
    if (ctx.logged) {
      return;
    }
    ctx.logged = true;
    const entries = [...ctx.pageMethodsCalled.entries()];
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    this.telemetryService.publicLog2(
      "integratedBrowser.tools.runPlaywrightCode.completed",
      {
        pageMethodsCalled: JSON.stringify(Object.fromEntries(entries)),
        pageMethodsCalledDcount: entries.length,
        pageMethodsCalledCount: total,
        success: success ? 1 : 0,
        wasDeferred: ctx.wasDeferred ? 1 : 0,
        resumeCount: ctx.resumeCount,
        durationMs: Math.round(Date.now() - ctx.startedAt),
        codeLength: ctx.codeLength,
        codeLineCount: ctx.codeLineCount
      }
    );
  }
  async _compileFunction(fnDef) {
    const vm = await import("vm");
    return vm.compileFunction(`return (${fnDef})(page, ...args)`, ["page", "args"], { parsingContext: vm.createContext() });
  }
  // --- Private: page matching (view ↔ page pairing) ---
  async _getPage(viewId) {
    const page = await this._tryGetPage(viewId);
    if (page) {
      return page;
    }
    throw new Error(`Page "${viewId}" not found`);
  }
  async _waitForPage(viewId, deadline) {
    while (true) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        throw new Error(`Timed out waiting for browser page "${viewId}" to become available. The page is open and can be reused.`);
      }
      const page = await raceTimeout(this._tryGetPage(viewId), remaining);
      if (page) {
        return page;
      }
      const delay = Math.min(50, deadline - Date.now());
      if (delay > 0) {
        await timeout(delay);
      }
    }
  }
  async _tryGetPage(viewId) {
    const resolved = this._viewIdToPage.get(viewId);
    if (resolved) {
      return resolved;
    }
    this._scanForNewContexts();
    await Promise.allSettled([...this._pageDiscoveryPromises.values()]);
    const discovered = this._viewIdToPage.get(viewId);
    if (discovered) {
      return discovered;
    }
    return void 0;
  }
  _onPageAdded(page) {
    const resolved = this._pageToViewId.get(page);
    if (resolved) {
      return Promise.resolve(resolved);
    }
    const existing = this._pageDiscoveryPromises.get(page);
    if (existing) {
      return existing;
    }
    const promise = this._resolvePage(page).finally(() => {
      if (this._pageDiscoveryPromises.get(page) === promise) {
        this._pageDiscoveryPromises.delete(page);
      }
    });
    this._pageDiscoveryPromises.set(page, promise);
    return promise;
  }
  async _resolvePage(page) {
    page.once("close", () => this._onPageRemoved(page));
    page.setDefaultTimeout(1e4);
    this._tabs.set(page, new PlaywrightTab(page, this.actionScope, this.agentNetworkFilterService));
    const viewId = await this._getPageViewId(page);
    if (page.isClosed()) {
      throw new Error(`Page "${viewId}" closed before it could be resolved`);
    }
    this._bindPage(viewId, page);
    return viewId;
  }
  _onPageRemoved(page) {
    this._pageDiscoveryPromises.delete(page);
    const viewId = this._pageToViewId.get(page);
    if (viewId) {
      this._viewIdToPage.delete(viewId);
    }
    this._pageToViewId.delete(page);
  }
  async _getPageViewId(page) {
    const session = await page.context().newCDPSession(page);
    try {
      const response = await session.send("Target.getTargetInfo");
      const targetInfo = response.targetInfo;
      const viewId = targetInfo.vscodeBrowserViewId ?? "";
      if (!viewId) {
        throw new Error(`CDP target ${targetInfo.targetId} is not an integrated browser view`);
      }
      return viewId;
    } finally {
      try {
        await session.detach();
      } catch (error) {
        this.logService.warn("[PlaywrightSession] Failed to detach page identity CDP session", error);
      }
    }
  }
  _bindPage(viewId, page) {
    this._viewIdToPage.set(viewId, page);
    this._pageToViewId.set(page, viewId);
    this.logService.debug(`[PlaywrightSession] Resolved Playwright page to view ${viewId}`);
  }
  _onContextAdded(context) {
    if (!this._watchedContexts.has(context)) {
      this._watchedContexts.add(context);
      context.on("page", (page) => {
        void this._onPageAdded(page).catch((error) => {
          this.logService.error("[PlaywrightSession] Failed to resolve page", error);
        });
      });
      context.on("close", () => this._watchedContexts.delete(context));
    }
    for (const page of context.pages()) {
      void this._onPageAdded(page).catch((error) => {
        this.logService.error("[PlaywrightSession] Failed to resolve page", error);
      });
    }
  }
  // --- Private: context scanning ---
  _scanForNewContexts() {
    for (const context of this._browser.contexts()) {
      this._onContextAdded(context);
    }
  }
  dispose() {
    this._browser?.close().catch(() => {
    });
    super.dispose();
  }
};

function isNavigationTimeoutError(error) {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.name === "TimeoutError" || /Timeout \d+ms exceeded/.test(error.message) || /navigation timeout/i.test(error.message);
}

var PAGE_PROXY_IGNORED_PROPS = /* @__PURE__ */ new Set([
  "then",
  "catch",
  "finally",
  "toJSON",
  "toString",
  "valueOf",
  "constructor"
]);

var PAGE_PROXY_MAX_DEPTH = 3;

function createPageApiProxy(target, methodCalls, prefix = "", depth = 0) {
  if (depth >= PAGE_PROXY_MAX_DEPTH) {
    return target;
  }
  const cache2 = /* @__PURE__ */ new Map();
  return new Proxy(target, {
    get(t, prop, receiver) {
      const value = Reflect.get(t, prop, receiver);
      if (typeof prop !== "string" || prop.startsWith("_") || PAGE_PROXY_IGNORED_PROPS.has(prop)) {
        return value;
      }
      const cached = cache2.get(prop);
      if (cached !== void 0) {
        return cached;
      }
      if (typeof value === "function") {
        const name = prefix + prop;
        const wrapper = function(...args) {
          methodCalls.set(name, (methodCalls.get(name) ?? 0) + 1);
          return Reflect.apply(value, t, args);
        };
        cache2.set(prop, wrapper);
        return wrapper;
      }
      if (value !== null && typeof value === "object") {
        const nested = createPageApiProxy(value, methodCalls, `${prefix}${prop}.`, depth + 1);
        cache2.set(prop, nested);
        return nested;
      }
      return value;
    }
  });
}
export { isCDPRequest, isNavigationTimeoutError, createPageApiProxy, DEFERRED_RESULT_CLEANUP_MS, SESSION_INACTIVITY_MS, OPEN_PAGE_NAVIGATION_TIMEOUT_MS, PlaywrightService, PlaywrightSession, PAGE_PROXY_IGNORED_PROPS, PAGE_PROXY_MAX_DEPTH };
