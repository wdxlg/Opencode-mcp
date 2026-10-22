// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/timeline/common/timelineService.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { TimelinePaneId } from "./module-1422.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/timeline/common/timelineService.ts
var TimelineHasProviderContext = new RawContextKey("timelineHasProvider", false);

var TimelineService = class extends Disposable {
  constructor(logService, viewsService, configurationService, contextKeyService) {
    super();
    this.logService = logService;
    this.viewsService = viewsService;
    this.configurationService = configurationService;
    this.contextKeyService = contextKeyService;
    this._onDidChangeProviders = this._register(new Emitter());
    this.onDidChangeProviders = this._onDidChangeProviders.event;
    this._onDidChangeTimeline = this._register(new Emitter());
    this.onDidChangeTimeline = this._onDidChangeTimeline.event;
    this._onDidChangeUri = this._register(new Emitter());
    this.onDidChangeUri = this._onDidChangeUri.event;
    this.providers = /* @__PURE__ */ new Map();
    this.providerSubscriptions = this._register(new DisposableMap());
    this.hasProviderContext = TimelineHasProviderContext.bindTo(this.contextKeyService);
    this.updateHasProviderContext();
  }
  getSources() {
    return [...this.providers.values()].map((p) => ({ id: p.id, label: p.label }));
  }
  getTimeline(id2, uri4, options3, tokenSource) {
    this.logService.trace(`TimelineService#getTimeline(${id2}): uri=${uri4.toString()}`);
    const provider = this.providers.get(id2);
    if (provider === void 0) {
      return void 0;
    }
    if (typeof provider.scheme === "string") {
      if (provider.scheme !== "*" && provider.scheme !== uri4.scheme) {
        return void 0;
      }
    } else if (!provider.scheme.includes(uri4.scheme)) {
      return void 0;
    }
    return {
      result: provider.provideTimeline(uri4, options3, tokenSource.token).then((result) => {
        if (result === void 0) {
          return void 0;
        }
        result.items = result.items.map((item) => ({ ...item, source: provider.id }));
        result.items.sort((a, b) => b.timestamp - a.timestamp || b.source.localeCompare(a.source, void 0, { numeric: true, sensitivity: "base" }));
        return result;
      }),
      options: options3,
      source: provider.id,
      tokenSource,
      uri: uri4
    };
  }
  registerTimelineProvider(provider) {
    this.logService.trace(`TimelineService#registerTimelineProvider: id=${provider.id}`);
    const id2 = provider.id;
    const existing = this.providers.get(id2);
    if (existing) {
      try {
        existing?.dispose();
      } catch {
      }
    }
    this.providers.set(id2, provider);
    this.updateHasProviderContext();
    if (provider.onDidChange) {
      this.providerSubscriptions.set(id2, provider.onDidChange((e4) => this._onDidChangeTimeline.fire(e4)));
    }
    this._onDidChangeProviders.fire({ added: [id2] });
    return {
      dispose: () => {
        this.providers.delete(id2);
        this._onDidChangeProviders.fire({ removed: [id2] });
      }
    };
  }
  unregisterTimelineProvider(id2) {
    this.logService.trace(`TimelineService#unregisterTimelineProvider: id=${id2}`);
    if (!this.providers.has(id2)) {
      return;
    }
    this.providers.delete(id2);
    this.providerSubscriptions.deleteAndDispose(id2);
    this.updateHasProviderContext();
    this._onDidChangeProviders.fire({ removed: [id2] });
  }
  setUri(uri4) {
    this.viewsService.openView(TimelinePaneId, true);
    this._onDidChangeUri.fire(uri4);
  }
  updateHasProviderContext() {
    this.hasProviderContext.set(this.providers.size !== 0);
  }
};

TimelineService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IViewsService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IContextKeyService)
], TimelineService);
export { TimelineHasProviderContext, TimelineService };
