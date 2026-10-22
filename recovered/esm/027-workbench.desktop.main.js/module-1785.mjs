// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/dataChannel/browser/dataChannelService.ts
import { ExtensionsRegistry } from "./module-0876.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { autorun } from "./module-0052.mjs";
import { IDataChannelService, ILinkPresentationService, parseLinkPresentation } from "./module-0708.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { observableValue } from "./module-0048.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/dataChannel/browser/dataChannelService.ts
var cachedPresentationLimit = 100;

var cachedPresentationStorageKey = "linkPresentation.cache.v1";

var watcherReleaseDelay = 5e3;

var uriPatternLengthLimit = 1024;

var linkPresentationProviderKinds = [
  "resource",
  "issue",
  "pullRequest",
  "commit",
  "file",
  "folder",
  "session",
  "chat",
  "repository",
  "branch"
];

var linkPresentationProviderExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "linkPresentationProviders",
  jsonSchema: {
    description: localize(22863, null),
    type: "array",
    items: {
      type: "object",
      additionalProperties: false,
      required: ["id", "uriPattern", "kind"],
      properties: {
        id: {
          type: "string",
          description: localize(22859, null)
        },
        uriPattern: {
          type: "string",
          description: localize(22862, null)
        },
        kind: {
          type: "string",
          enum: linkPresentationProviderKinds,
          description: localize(22861, null)
        },
        enablement: {
          type: "string",
          description: localize(22858, null)
        }
      }
    }
  },
  activationEventsGenerator: function* (providers2) {
    for (const provider of providers2) {
      if (provider.id) {
        yield `onLinkPresentation:${provider.id}`;
      }
    }
  }
});

var DataChannelService = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidSendData = this._register(new Emitter());
    this.onDidSendData = this._onDidSendData.event;
  }
  getDataChannel(channelId) {
    return new CoreDataChannelImpl(channelId, this._onDidSendData);
  }
};

var CoreDataChannelImpl = class {
  constructor(channelId, _onDidSendData) {
    this.channelId = channelId;
    this._onDidSendData = _onDidSendData;
  }
  sendData(data) {
    this._onDidSendData.fire({
      channelId: this.channelId,
      data
    });
  }
};

var LinkPresentationService = class extends Disposable {
  constructor(_extensionService, _logService, _configurationService, _storageService) {
    super();
    this._extensionService = _extensionService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._storageService = _storageService;
    this._onDidChangeLinkPresentationRules = this._register(new Emitter());
    this.onDidChangeLinkPresentationRules = this._onDidChangeLinkPresentationRules.event;
    this._coreProviders = /* @__PURE__ */ new Map();
    this._declaredExtensionProviders = /* @__PURE__ */ new Map();
    this._registeredExtensionProviders = /* @__PURE__ */ new Map();
    this._entries = this._register(new DisposableMap());
    this._cache = /* @__PURE__ */ new Map();
    this._restoreCache();
    this._register(linkPresentationProviderExtensionPoint.setHandler((extensions) => {
      this._declaredExtensionProviders.clear();
      for (const extension of extensions) {
        for (const contribution of extension.value) {
          const regexp2 = readUriPattern(contribution.uriPattern);
          if (!contribution.id || !regexp2) {
            extension.collector.error(localize(
              22860,
              null,
              contribution.id,
              uriPatternLengthLimit
            ));
            continue;
          }
          if (this._coreProviders.has(contribution.id)) {
            extension.collector.error(localize(
              22856,
              null,
              contribution.id
            ));
            continue;
          }
          if (this._declaredExtensionProviders.has(contribution.id)) {
            extension.collector.error(localize(
              22857,
              null,
              contribution.id
            ));
            continue;
          }
          this._declaredExtensionProviders.set(contribution.id, {
            ...contribution,
            extensionId: extension.description.identifier.value,
            regexp: regexp2
          });
        }
      }
      this._refreshEntries();
      this._onDidChangeLinkPresentationRules.fire();
    }));
    this._register(this._configurationService.onDidChangeConfiguration((event) => {
      const enablements = [
        ...Array.from(this._coreProviders.values(), (provider) => provider.registration.enablement),
        ...Array.from(this._declaredExtensionProviders.values(), (provider) => provider.enablement)
      ];
      if (enablements.some((enablement) => enablement && event.affectsConfiguration(enablement))) {
        this._refreshEntries();
        this._onDidChangeLinkPresentationRules.fire();
      }
    }));
  }
  get linkPresentationRules() {
    return [
      ...Array.from(this._coreProviders.values()).filter((provider) => this._isProviderEnabled(provider.registration.kind, provider.registration.enablement)).map((provider) => ({ id: provider.registration.id, uriPattern: provider.regexp, kind: provider.registration.kind })),
      ...Array.from(this._declaredExtensionProviders.values()).filter((provider) => this._isProviderEnabled(provider.kind, provider.enablement)).map((provider) => ({ id: provider.id, uriPattern: provider.regexp, kind: provider.kind }))
    ].map((rule) => ({ ...rule, uriPattern: normalizeUriPattern(rule.uriPattern) }));
  }
  registerLinkPresentationProvider(registration, provider) {
    if (this._coreProviders.has(registration.id) || this._declaredExtensionProviders.has(registration.id)) {
      throw new Error(`Link presentation provider '${registration.id}' is already registered.`);
    }
    const value2 = {
      registration,
      regexp: normalizeUriPattern(registration.uriPattern),
      provider
    };
    this._coreProviders.set(registration.id, value2);
    this._refreshEntries();
    this._onDidChangeLinkPresentationRules.fire();
    return toDisposable(() => {
      if (this._coreProviders.get(registration.id) === value2) {
        this._coreProviders.delete(registration.id);
        this._refreshEntries();
        this._onDidChangeLinkPresentationRules.fire();
      }
    });
  }
  registerExtensionLinkPresentationProvider(extensionId, providerId, provider) {
    const declaration = this._declaredExtensionProviders.get(providerId);
    if (!declaration) {
      throw new Error(`Link presentation provider '${providerId}' is not declared in the extension manifest.`);
    }
    if (!ExtensionIdentifier.equals(declaration.extensionId, extensionId)) {
      throw new Error(`Link presentation provider '${providerId}' was declared by extension '${declaration.extensionId}', not '${extensionId}'.`);
    }
    if (this._registeredExtensionProviders.has(providerId)) {
      throw new Error(`Link presentation provider '${providerId}' is already registered.`);
    }
    const registration = { extensionId, provider };
    this._registeredExtensionProviders.set(providerId, registration);
    return toDisposable(() => {
      if (this._registeredExtensionProviders.get(providerId) === registration) {
        this._registeredExtensionProviders.delete(providerId);
        this._refreshEntries(providerId);
      }
    });
  }
  declareExtensionLinkPresentationProvider(extensionId, contribution) {
    if (this._declaredExtensionProviders.has(contribution.id) || this._coreProviders.has(contribution.id)) {
      throw new Error(`Link presentation provider '${contribution.id}' is already declared.`);
    }
    const regexp2 = readUriPattern(contribution.uriPattern);
    if (!regexp2) {
      throw new Error(`Link presentation provider '${contribution.id}' has an invalid URI pattern.`);
    }
    const declaration = { ...contribution, extensionId, regexp: regexp2 };
    this._declaredExtensionProviders.set(contribution.id, declaration);
    this._refreshEntries();
    this._onDidChangeLinkPresentationRules.fire();
    return toDisposable(() => {
      if (this._declaredExtensionProviders.get(contribution.id) === declaration) {
        this._declaredExtensionProviders.delete(contribution.id);
        this._refreshEntries();
        this._onDidChangeLinkPresentationRules.fire();
      }
    });
  }
  getLinkPresentationRule(resource) {
    const provider = this._selectProvider(resource);
    return provider ? { id: provider.id, uriPattern: provider.regexp, kind: provider.kind } : void 0;
  }
  createLinkPresentationWatcher(providerId, resource) {
    const provider = this._selectProvider(resource, providerId);
    if (!provider) {
      return void 0;
    }
    const key3 = canonicalizeResource(providerId, resource);
    let entry = this._entries.get(key3);
    if (!entry) {
      entry = new SharedLinkPresentationEntry(providerId, resource, () => {
        if (this._entries.get(key3) === entry) {
          this._entries.deleteAndDispose(key3);
        }
      });
      this._entries.set(key3, entry);
      this._refreshEntry(entry);
    }
    return entry.acquire();
  }
  _refreshEntries(forceProviderId) {
    for (const entry of this._entries.values()) {
      const selectedProviderId = this._selectProvider(entry.resource, entry.ruleId)?.id;
      if (selectedProviderId !== entry.providerId || forceProviderId === entry.providerId) {
        this._refreshEntry(entry);
      }
    }
  }
  _refreshEntry(entry) {
    const generation = entry.reset();
    const provider = this._selectProvider(entry.resource, entry.ruleId);
    entry.providerId = provider?.id;
    if (!provider) {
      entry.setPresentation(void 0);
      return;
    }
    const cached = this._getCachedPresentation(entry.key, provider.id, provider.kind);
    entry.setPresentation(cached ? { ...cached, isLoading: true } : void 0);
    if (provider.coreProvider) {
      try {
        this._attachProviderWatcher(entry, provider, provider.coreProvider.createLinkPresentationWatcher(entry.resource), generation);
      } catch (error) {
        this._handleProviderError(entry, generation, provider.kind, error);
      }
      return;
    }
    void this._activateExtensionProvider(entry, provider, generation);
  }
  async _activateExtensionProvider(entry, provider, generation) {
    try {
      await this._extensionService.activateByEvent(`onLinkPresentation:${provider.id}`);
      const registration = this._registeredExtensionProviders.get(provider.id);
      if (!registration || !provider.extensionId || !ExtensionIdentifier.equals(registration.extensionId, provider.extensionId)) {
        throw new Error(`Extension '${provider.extensionId}' did not register link presentation provider '${provider.id}'.`);
      }
      this._attachProviderWatcher(entry, provider, registration.provider.createLinkPresentationWatcher(entry.resource), generation);
    } catch (error) {
      this._handleProviderError(entry, generation, provider.kind, error);
    }
  }
  _attachProviderWatcher(entry, provider, watcher, generation) {
    if (!entry.isCurrent(generation)) {
      watcher.dispose();
      return;
    }
    const store = new DisposableStore();
    store.add(watcher);
    store.add(autorun((reader) => {
      const presentation2 = watcher.presentation.read(reader);
      if (presentation2 && entry.isCurrent(generation) && entry.providerId) {
        if (presentation2.kind !== provider.kind) {
          entry.setPresentation(void 0);
          if (this._cache.delete(entry.key)) {
            this._persistCache();
          }
          this._handleProviderError(
            entry,
            generation,
            provider.kind,
            new Error(`Link presentation provider '${provider.id}' produced kind '${presentation2.kind}', but registered kind '${provider.kind}'.`)
          );
          return;
        }
        entry.setPresentation(presentation2);
        this._cachePresentation(entry.key, entry.providerId, presentation2);
      }
    }));
    entry.attach(store, generation);
  }
  _handleProviderError(entry, generation, kind, error) {
    if (!entry.isCurrent(generation)) {
      return;
    }
    this._logService.error(`Failed to create a link presentation watcher for '${entry.resource.toString(true)}'.`, error);
    if (!entry.presentation.get()) {
      entry.setPresentation({
        kind,
        status: { kind: "error", label: localize(22853, null) },
        tooltip: localize(22855, null),
        ariaLabel: localize(22854, null)
      });
    }
  }
  _selectProvider(resource, providerId) {
    const value2 = resource.toString(true);
    for (const candidate of this._coreProviders.values()) {
      if (providerId !== void 0 && candidate.registration.id !== providerId) {
        continue;
      }
      if (this._isProviderEnabled(candidate.registration.kind, candidate.registration.enablement) && matchesUriPattern(candidate.regexp, value2)) {
        return {
          id: candidate.registration.id,
          regexp: candidate.regexp,
          kind: candidate.registration.kind,
          enablement: candidate.registration.enablement,
          coreProvider: candidate.provider
        };
      }
    }
    for (const candidate of this._declaredExtensionProviders.values()) {
      if (providerId !== void 0 && candidate.id !== providerId) {
        continue;
      }
      if (this._isProviderEnabled(candidate.kind, candidate.enablement) && matchesUriPattern(candidate.regexp, value2)) {
        return {
          id: candidate.id,
          regexp: candidate.regexp,
          kind: candidate.kind,
          enablement: candidate.enablement,
          extensionId: candidate.extensionId
        };
      }
    }
    return void 0;
  }
  _isEnabled(enablement) {
    return !enablement || this._configurationService.getValue(enablement) === true;
  }
  _isProviderEnabled(kind, enablement) {
    return kind !== "file" && this._isEnabled(enablement);
  }
  _getCachedPresentation(key3, providerId, kind) {
    const cached = this._cache.get(key3);
    if (!cached || cached.providerId !== providerId) {
      return void 0;
    }
    if (cached.presentation.kind !== kind) {
      this._cache.delete(key3);
      this._persistCache();
      return void 0;
    }
    this._cache.delete(key3);
    this._cache.set(key3, cached);
    return cached.presentation;
  }
  _cachePresentation(key3, providerId, presentation2) {
    this._cache.delete(key3);
    this._cache.set(key3, { providerId, presentation: { ...presentation2, isLoading: void 0 } });
    while (this._cache.size > cachedPresentationLimit) {
      const oldest = this._cache.keys().next().value;
      if (oldest === void 0) {
        break;
      }
      this._cache.delete(oldest);
    }
    this._persistCache();
  }
  _restoreCache() {
    const stored = this._storageService.get(cachedPresentationStorageKey, 0 /* PROFILE */);
    if (!stored) {
      return;
    }
    try {
      const value2 = JSON.parse(stored);
      if (!isRecord3(value2) || value2.version !== 1 || !Array.isArray(value2.entries)) {
        throw new Error("Invalid persisted link presentation cache.");
      }
      for (const entry of value2.entries.slice(-cachedPresentationLimit)) {
        if (!isRecord3(entry) || typeof entry.key !== "string" || typeof entry.providerId !== "string") {
          throw new Error("Invalid persisted link presentation cache entry.");
        }
        this._cache.set(entry.key, {
          providerId: entry.providerId,
          presentation: { ...parseLinkPresentation(entry.presentation), isLoading: void 0 }
        });
      }
    } catch (error) {
      this._logService.error("Failed to restore the link presentation cache.", error);
      this._cache.clear();
    }
  }
  _persistCache() {
    this._storageService.store(cachedPresentationStorageKey, JSON.stringify({
      version: 1,
      entries: Array.from(this._cache, ([key3, entry]) => ({ key: key3, ...entry }))
    }), 0 /* PROFILE */, 1 /* MACHINE */);
  }
};

LinkPresentationService = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IStorageService)
], LinkPresentationService);

var SharedLinkPresentationEntry = class extends Disposable {
  constructor(ruleId, resource, onDidBecomeUnused) {
    super();
    this._source = this._register(new MutableDisposable());
    this._releaseTimer = this._register(new MutableDisposable());
    this._generation = 0;
    this._references = 0;
    this.ruleId = ruleId;
    this.resource = resource;
    this.key = canonicalizeResource(ruleId, resource);
    this._onDidBecomeUnused = onDidBecomeUnused;
    this.presentation = observableValue(`linkPresentation:${this.key}`, void 0);
  }
  acquire() {
    this._releaseTimer.clear();
    this._references++;
    let disposed = false;
    return {
      presentation: this.presentation,
      dispose: () => {
        if (disposed) {
          return;
        }
        disposed = true;
        this._references--;
        if (this._references === 0 && !this._store.isDisposed) {
          this._releaseTimer.value = disposableTimeout(this._onDidBecomeUnused, watcherReleaseDelay);
        }
      }
    };
  }
  reset() {
    this._source.clear();
    return ++this._generation;
  }
  isCurrent(generation) {
    return !this._store.isDisposed && generation === this._generation;
  }
  attach(source, generation) {
    if (!this.isCurrent(generation)) {
      source.dispose();
      return;
    }
    this._source.value = source;
  }
  setPresentation(presentation2) {
    this.presentation.set(presentation2, void 0);
  }
};

function canonicalizeResource(providerId, resource) {
  return `${providerId}\0${resource.toString(true)}`;
}

function readUriPattern(source) {
  if (source.length > uriPatternLengthLimit || !source.startsWith("^") || !source.endsWith("$")) {
    return void 0;
  }
  try {
    return new RegExp(source, "i");
  } catch {
    return void 0;
  }
}

function normalizeUriPattern(pattern) {
  const flags = pattern.flags.replace(/[gy]/g, "");
  return new RegExp(pattern.source, flags);
}

function matchesUriPattern(pattern, value2) {
  pattern.lastIndex = 0;
  return pattern.test(value2);
}

function isRecord3(value2) {
  return typeof value2 === "object" && value2 !== null;
}

registerSingleton(IDataChannelService, DataChannelService, 1 /* Delayed */);

registerSingleton(ILinkPresentationService, LinkPresentationService, 1 /* Delayed */);
export { canonicalizeResource, readUriPattern, normalizeUriPattern, matchesUriPattern, isRecord3, cachedPresentationLimit, cachedPresentationStorageKey, watcherReleaseDelay, uriPatternLengthLimit, linkPresentationProviderKinds, linkPresentationProviderExtensionPoint, DataChannelService, CoreDataChannelImpl, LinkPresentationService, SharedLinkPresentationEntry };
