// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostDataChannels.ts
import { createDecorator2 } from "./module-0048.mjs";
import { Emitter } from "./module-0017.mjs";
import { MainContext } from "./module-0054.mjs";
import { checkProposedApiEnabled } from "./module-0173.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0011.mjs";
import { URI } from "./module-0025.mjs";
import { CancellationToken } from "./module-0018.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { parseLinkPresentation } from "./module-0328.mjs";


// src/vs/workbench/api/common/extHostDataChannels.ts
var IExtHostDataChannels = createDecorator2("IExtHostDataChannels");

var ExtHostDataChannels = class {
  constructor(extHostRpc) {
    this._channels = /* @__PURE__ */ new Map();
    this._linkPresentationWatchers = /* @__PURE__ */ new Map();
    this._linkPresentationProviders = /* @__PURE__ */ new Map();
    this._providedLinkPresentationWatchers = /* @__PURE__ */ new Map();
    this._linkPresentationCache = /* @__PURE__ */ new Map();
    this._onDidChangeLinkPresentationRules = new Emitter();
    this.onDidChangeLinkPresentationRules = this._onDidChangeLinkPresentationRules.event;
    this._linkPresentationRules = [];
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadDataChannels);
  }
  static {
    this._linkPresentationWatcherHandlePool = 0;
  }
  static {
    this._linkPresentationProviderHandlePool = 0;
  }
  get linkPresentationRules() {
    return this._linkPresentationRules;
  }
  createDataChannel(extension, channelId) {
    checkProposedApiEnabled(extension, "dataChannels");
    let channel = this._channels.get(channelId);
    if (!channel) {
      channel = new DataChannelImpl(channelId);
      this._channels.set(channelId, channel);
    }
    return channel;
  }
  createLinkPresentationWatcher(extension, providerId, resource) {
    checkProposedApiEnabled(extension, "linkPresentation");
    const resourceString = resource.toString(true);
    const rule = this._linkPresentationRules.find((rule2) => rule2.id === providerId && matchesUriPattern(rule2.uriPattern, resourceString));
    if (!rule) {
      throw new Error(`Link presentation provider '${providerId}' does not accept '${resourceString}'.`);
    }
    const cacheKey2 = `${providerId}\0${resourceString}`;
    const cachedPresentation = this._getCachedLinkPresentation(cacheKey2, rule.kind);
    const initialPresentation = {
      ...cachedPresentation ?? { kind: rule.kind },
      isLoading: true
    };
    const handle = ExtHostDataChannels._linkPresentationWatcherHandlePool++;
    const watcher = new LinkPresentationWatcherImpl(
      handle,
      initialPresentation,
      this._proxy,
      (disposedHandle) => this._linkPresentationWatchers.delete(disposedHandle),
      (presentation) => this._cacheLinkPresentation(cacheKey2, presentation)
    );
    this._linkPresentationWatchers.set(handle, watcher);
    this._proxy.$createLinkPresentationWatcher(handle, providerId, rule.kind, resource);
    return watcher;
  }
  registerLinkPresentationProvider(extension, id2, provider) {
    checkProposedApiEnabled(extension, "linkPresentation");
    if (!id2.trim()) {
      throw new Error("Link presentation provider id must not be empty.");
    }
    const handle = ExtHostDataChannels._linkPresentationProviderHandlePool++;
    this._linkPresentationProviders.set(handle, provider);
    this._proxy.$registerLinkPresentationProvider(handle, extension.identifier.value, id2);
    return toDisposable(() => {
      this._proxy.$unregisterLinkPresentationProvider(handle);
      this._linkPresentationProviders.delete(handle);
      for (const [watcherHandle, watcher] of this._providedLinkPresentationWatchers) {
        if (watcher.providerHandle === handle) {
          watcher.store.dispose();
          this._providedLinkPresentationWatchers.delete(watcherHandle);
        }
      }
    });
  }
  $onDidReceiveData(channelId, data) {
    this._channels.get(channelId)?._fireDidReceiveData(data);
  }
  $acceptLinkPresentationRules(rules) {
    this._linkPresentationRules = rules.map((rule) => ({
      id: rule.id,
      uriPattern: new RegExp(rule.source, rule.flags),
      kind: rule.kind
    }));
    this._onDidChangeLinkPresentationRules.fire();
  }
  $acceptLinkPresentation(handle, data) {
    this._linkPresentationWatchers.get(handle)?.acceptPresentation(data);
  }
  async $createLinkPresentationWatcher(handle, providerHandle, resource) {
    const provider = this._linkPresentationProviders.get(providerHandle);
    if (!provider) {
      throw new Error(`Link presentation provider handle '${providerHandle}' is not registered.`);
    }
    const watcher = provider.provideLinkPresentationWatcher(URI.revive(resource), CancellationToken.None);
    const store = new DisposableStore();
    store.add(watcher);
    store.add(watcher.onDidChangePresentation(() => {
      this._proxy.$acceptLinkPresentationProviderData(handle, watcher.presentation);
    }));
    this._providedLinkPresentationWatchers.set(handle, { providerHandle, store });
    return watcher.presentation;
  }
  $disposeLinkPresentationWatcher(handle) {
    const watcher = this._providedLinkPresentationWatchers.get(handle);
    if (watcher) {
      this._providedLinkPresentationWatchers.delete(handle);
      watcher.store.dispose();
    }
  }
  _getCachedLinkPresentation(key, kind) {
    const presentation = this._linkPresentationCache.get(key);
    if (presentation?.kind !== kind) {
      this._linkPresentationCache.delete(key);
      return void 0;
    }
    if (presentation) {
      this._linkPresentationCache.delete(key);
      this._linkPresentationCache.set(key, presentation);
    }
    return presentation;
  }
  _cacheLinkPresentation(key, presentation) {
    this._linkPresentationCache.delete(key);
    this._linkPresentationCache.set(key, presentation);
    while (this._linkPresentationCache.size > 100) {
      const oldest = this._linkPresentationCache.keys().next().value;
      if (oldest === void 0) {
        break;
      }
      this._linkPresentationCache.delete(oldest);
    }
  }
};

ExtHostDataChannels = __decorateClass([
  __decorateParam(0, IExtHostRpcService)
], ExtHostDataChannels);

var DataChannelImpl = class extends Disposable {
  constructor(channelId) {
    super();
    this.channelId = channelId;
    this._onDidReceiveData = this._register(new Emitter());
    this.onDidReceiveData = this._onDidReceiveData.event;
  }
  _fireDidReceiveData(data) {
    this._onDidReceiveData.fire({ data });
  }
  toString() {
    return `DataChannel(${this.channelId})`;
  }
};

var LinkPresentationWatcherImpl = class extends Disposable {
  constructor(handle, initialPresentation, proxy, onDispose, _onDidAcceptPresentation) {
    super();
    this._onDidAcceptPresentation = _onDidAcceptPresentation;
    this._onDidChangePresentation = this._register(new Emitter());
    this.onDidChangePresentation = this._onDidChangePresentation.event;
    this._presentation = initialPresentation;
    this._register({
      dispose: () => {
        proxy.$disposeLinkPresentationWatcher(handle);
        onDispose(handle);
      }
    });
  }
  get presentation() {
    return this._presentation;
  }
  acceptPresentation(data) {
    this._presentation = parseLinkPresentation(data);
    this._onDidAcceptPresentation(this._presentation);
    this._onDidChangePresentation.fire();
  }
};

function matchesUriPattern(pattern, value) {
  pattern.lastIndex = 0;
  return pattern.test(value);
}
export { matchesUriPattern, IExtHostDataChannels, ExtHostDataChannels, DataChannelImpl, LinkPresentationWatcherImpl };
