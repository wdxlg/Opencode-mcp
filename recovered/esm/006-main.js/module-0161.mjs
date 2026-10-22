// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/browserView/electron-main/browserViewGroup.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Disposable, DisposableMap, DisposableStore, init_lifecycle } from "./module-0018.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { BrowserView, init_browserView2 } from "./module-0146.mjs";
import { CDPBrowserProxy, init_proxy } from "./module-0159.mjs";
import { init_browserViewGroup, matchesBrowserViewGroupFilter } from "./module-0135.mjs";
import { IBrowserViewMainService, init_browserViewMainService } from "./module-0157.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { BrowserSession, init_browserSession } from "./module-0089.mjs";
import { generateUuid, init_uuid } from "./module-0055.mjs";
import { BrowserViewCDPTarget, init_browserViewCDPTarget } from "./module-0160.mjs";
import { IInstantiationService, init_instantiation } from "./module-0039.mjs";
import { ILogService, init_log } from "./module-0075.mjs";


// src/vs/platform/browserView/electron-main/browserViewGroup.ts
var BrowserViewGroup;

var init_browserViewGroup2 = __esm({
  "src/vs/platform/browserView/electron-main/browserViewGroup.ts"() {
    init_lifecycle();
    init_event();
    init_browserView2();
    init_proxy();
    init_browserViewGroup();
    init_browserViewMainService();
    init_productService();
    init_browserSession();
    init_uuid();
    init_browserViewCDPTarget();
    init_instantiation();
    init_log();
    BrowserViewGroup = class extends Disposable {
      constructor(id2, filter, targetContext, browserViewMainService, productService, instantiationService, logService) {
        super();
        this.id = id2;
        this.filter = filter;
        this.targetContext = targetContext;
        this.browserViewMainService = browserViewMainService;
        this.productService = productService;
        this.instantiationService = instantiationService;
        this.logService = logService;
        this.views = /* @__PURE__ */ new Map();
        this.viewTargets = this._register(new DisposableMap());
        this.viewAudienceListeners = this._register(new DisposableMap());
        this.pendingViewAdditions = /* @__PURE__ */ new Map();
        this._isActive = false;
        /** All context IDs known to this group, including those from views added to it. */
        this.knownContextIds = /* @__PURE__ */ new Set();
        /** Browser context IDs created by this group via {@link createBrowserContext}. */
        this.ownedContextIds = /* @__PURE__ */ new Set();
        this._onDidDestroy = this._register(new Emitter());
        this.onDidDestroy = this._onDidDestroy.event;
        this.debugger = this._register(new CDPBrowserProxy(this));
        // #endregion
        // #region ICDPBrowserTarget implementation
        this._onTargetInfoChanged = this._register(new Emitter());
        this.onTargetInfoChanged = this._onTargetInfoChanged.event;
        /** Browser target sessions are managed by the CDPBrowserProxy, not tracked here. */
        this.sessions = /* @__PURE__ */ new Map();
        this.onSessionCreated = Event.None;
        this.onClose = this._onDidDestroy.event;
        this._register(this.browserViewMainService.onDidCreateBrowserView(({ info }) => {
          if (info.hostWindowId !== this.targetContext.hostWindowId) {
            return;
          }
          const view = this.browserViewMainService.tryGetBrowserView(info.id);
          if (!view) {
            return;
          }
          this._watchView(view);
          if (this._isActive) {
            void this._reconcileView(view).catch((error) => {
              this.logService.error(`[BrowserViewGroup] Failed to reconcile view ${view.id}`, error);
            });
          }
        }));
      }
      get onCDPMessage() {
        return this.debugger.onMessage;
      }
      sendCDPMessage(msg) {
        return this.debugger.sendMessage(msg);
      }
      // #region View management
      async activate() {
        if (this._isActive) {
          return;
        }
        this._isActive = true;
        const views = await this.browserViewMainService.getBrowserViews(this.targetContext.hostWindowId);
        await Promise.all(views.map(async (info) => {
          const view = this.browserViewMainService.tryGetBrowserView(info.id);
          if (view) {
            this._watchView(view);
            await this._reconcileView(view);
          }
        }));
      }
      _watchView(view) {
        if (this.viewAudienceListeners.has(view.id)) {
          return;
        }
        const store = new DisposableStore();
        store.add(view.onDidChangeAudiences(() => {
          if (this._isActive) {
            void this._reconcileView(view).catch((error) => {
              this.logService.error(`[BrowserViewGroup] Failed to reconcile view ${view.id}`, error);
            });
          }
        }));
        store.add(Event.once(view.onDidClose)(() => this.viewAudienceListeners.deleteAndDispose(view.id)));
        this.viewAudienceListeners.set(view.id, store);
      }
      async _reconcileView(view) {
        const matches = matchesBrowserViewGroupFilter(view.id, view.audiences, this.filter);
        if (matches) {
          await this.addView(view.id);
        } else {
          await this.removeView(view.id);
        }
      }
      /**
       * Add a {@link BrowserView} to this group.
       * Registers the view as a CDP target and subscribes to its sub-target
       * events (iframes, workers)
       * and bubbles them as group-level target events.
       * Automatically removes the view when it closes.
       */
      addView(viewId) {
        const pending = this.pendingViewAdditions.get(viewId);
        if (pending) {
          return this.views.has(viewId) ? pending : pending.then(() => this.addView(viewId));
        }
        if (this.views.has(viewId)) {
          return Promise.resolve();
        }
        const addition = this._addView(viewId).finally(() => {
          if (this.pendingViewAdditions.get(viewId) === addition) {
            this.pendingViewAdditions.delete(viewId);
          }
        });
        this.pendingViewAdditions.set(viewId, addition);
        return addition;
      }
      async _addView(viewId) {
        const view = this.browserViewMainService.tryGetBrowserView(viewId);
        if (!view) {
          throw new Error(`Browser view ${viewId} not found`);
        }
        this.views.set(view.id, view);
        this.knownContextIds.add(view.session.id);
        const closeListener = Event.once(view.onDidClose)(() => {
          this.removeView(viewId);
        });
        const info = await view.debugger.getTargetInfo();
        if (this.views.get(viewId) !== view) {
          closeListener.dispose();
          return;
        }
        const target = new BrowserViewCDPTarget(view, info);
        this.viewTargets.set(view.id, target);
        const store = new DisposableStore();
        store.add(closeListener);
        target.onClose(() => store.dispose());
        this.debugger.registerTarget(target);
        for (const targetInfo of view.debugger.knownTargets.values()) {
          this.debugger.registerTarget(new BrowserViewCDPTarget(view, targetInfo));
        }
        store.add(view.debugger.onTargetDiscovered((targetInfo) => {
          this.debugger.registerTarget(new BrowserViewCDPTarget(view, targetInfo));
        }));
        store.add(view.debugger.onSessionCreated(({ session: session4, waitingForDebugger }) => {
          this.debugger.notifySessionCreated(session4, waitingForDebugger);
        }));
      }
      /**
       * Remove a {@link BrowserView} from this group.
       * Disposes the associated {@link BrowserViewCDPTarget}, which cascades
       * destruction to sub-targets and sessions via {@link ICDPTarget.onClose}.
       */
      async removeView(viewId) {
        const view = this.views.get(viewId);
        if (view && this.views.delete(viewId)) {
          if (!this.ownedContextIds.has(view.session.id) && ![...this.views.values()].some((v) => v.session.id === view.session.id)) {
            this.knownContextIds.delete(view.session.id);
          }
          this.viewTargets.deleteAndDispose(viewId);
        }
      }
      getVersion() {
        return {
          protocolVersion: "1.3",
          product: `${this.productService.nameShort}/${this.productService.version}`,
          revision: this.productService.commit || "unknown",
          userAgent: "Electron",
          jsVersion: process.versions.v8
        };
      }
      getWindowForTarget(target) {
        if (!(target instanceof BrowserViewCDPTarget)) {
          throw new Error("Can only get window for BrowserView targets");
        }
        const view = target.view.getWebContentsView();
        const viewBounds = view.getBounds();
        return {
          windowId: this.targetContext.hostWindowId,
          bounds: {
            left: viewBounds.x,
            top: viewBounds.y,
            width: viewBounds.width,
            height: viewBounds.height,
            windowState: "normal"
          }
        };
      }
      async attach() {
        return new CDPBrowserProxy(this);
      }
      notifySessionCreated() {
      }
      get targetInfo() {
        return {
          targetId: this.id,
          type: "browser",
          title: this.getVersion().product,
          url: "",
          attached: true,
          canAccessOpener: false
        };
      }
      async createTarget(url, browserContextId) {
        if (browserContextId && !this.knownContextIds.has(browserContextId)) {
          throw new Error(`Unknown browser context ${browserContextId}`);
        }
        const target = await this.browserViewMainService.createTarget(url, {
          ...this.targetContext,
          session: browserContextId ?? this.targetContext.session
        });
        if (target instanceof BrowserView) {
          await this.addView(target.id);
          return this.viewTargets.get(target.id);
        }
        return target;
      }
      async activateTarget(target) {
        if (!(target instanceof BrowserViewCDPTarget)) {
          throw new Error("Can only activate BrowserView targets");
        }
      }
      async closeTarget(target) {
        if (!(target instanceof BrowserViewCDPTarget)) {
          throw new Error("Can only close BrowserView targets");
        }
        await this.removeView(target.view.id);
        await this.browserViewMainService.destroyBrowserView(target.view.id);
        return true;
      }
      // Browser context management
      /**
       * Returns only the browser context IDs that are visible to this group,
       * i.e. contexts used by views currently in the group.
       */
      getBrowserContexts() {
        return [...this.knownContextIds];
      }
      async createBrowserContext() {
        const browserSession = BrowserSession.getOrCreateEphemeral(this.instantiationService, generateUuid(), "cdp-created");
        const contextId = browserSession.id;
        this.knownContextIds.add(contextId);
        this.ownedContextIds.add(contextId);
        return contextId;
      }
      async disposeBrowserContext(browserContextId) {
        if (!this.ownedContextIds.has(browserContextId)) {
          throw new Error("Can only dispose browser contexts created by this group");
        }
        const viewIds = [...this.views.entries()].filter(([, view]) => view.session.id === browserContextId).map(([id2]) => id2);
        for (const viewId of viewIds) {
          await this.removeView(viewId);
          await this.browserViewMainService.destroyBrowserView(viewId);
        }
        this.knownContextIds.delete(browserContextId);
        this.ownedContextIds.delete(browserContextId);
      }
      // #endregion
      dispose() {
        this._onDidDestroy.fire();
        super.dispose();
      }
    };
    BrowserViewGroup = __decorateClass([
      __decorateParam(3, IBrowserViewMainService),
      __decorateParam(4, IProductService),
      __decorateParam(5, IInstantiationService),
      __decorateParam(6, ILogService)
    ], BrowserViewGroup);
  }
});
export { BrowserViewGroup, init_browserViewGroup2 };
