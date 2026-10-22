// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/plugins/pluginMarketplaceService.ts
import { createDecorator } from "./module-0077.mjs";
import { observableMemento } from "./module-1018.mjs";
import { Disposable } from "./module-0012.mjs";
import { Lazy } from "./module-0028.mjs";
import { observableValue } from "./module-0048.mjs";
import { ThrottledDelayer, runWhenGlobalIdle } from "./module-0036.mjs";
import { isEqual2, isEqualOrParent2, joinPath, normalizePath, relativePath } from "./module-0034.mjs";
import { FileBackedInstalledPluginsStore } from "./module-1025.mjs";
import { revive } from "./module-0265.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { derived } from "./module-0054.mjs";
import { Event2 } from "./module-0017.mjs";
import { AutoUpdateConfigurationKey, IExtensionsWorkbenchService } from "./module-1023.mjs";
import { autorun } from "./module-0052.mjs";
import { deduplicateMarketplaceReferences, parseMarketplaceObjectEntry, parseMarketplaceReference, parseMarketplaceReferences, readConfiguredMarketplaces } from "./module-1026.mjs";
import { IRequestService, asJson } from "./module-0947.mjs";
import { URI } from "./module-0032.mjs";
import { getStrictKnownMarketplaces, isMarketplaceReferenceAllowed } from "./module-1028.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { isCancellationError, onUnexpectedError } from "./module-0004.mjs";
import { readAgentPluginManifest } from "./module-1009.mjs";
import { parse5 } from "./module-0885.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IFileService } from "./module-0269.mjs";
import { IAgentPluginRepositoryService } from "./module-1024.mjs";
import { ILogService } from "./module-0095.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkspacePluginSettingsService } from "./module-1027.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IMeteredConnectionService } from "./module-1022.mjs";


// src/vs/workbench/contrib/chat/common/plugins/pluginMarketplaceService.ts
var IPluginMarketplaceService = createDecorator("pluginMarketplaceService");

var MARKETPLACE_DEFINITIONS = [
  { type: "openPlugin" /* OpenPlugin */, path: "marketplace.json" },
  { type: "openPlugin" /* OpenPlugin */, path: ".plugin/marketplace.json" },
  { type: "copilot" /* Copilot */, path: ".github/plugin/marketplace.json" },
  { type: "claude" /* Claude */, path: ".claude-plugin/marketplace.json" }
];

var SINGLE_PLUGIN_MANIFEST_DEFINITIONS = [
  { type: "openPlugin" /* OpenPlugin */, path: ".plugin/plugin.json" },
  { type: "claude" /* Claude */, path: ".claude-plugin/plugin.json" },
  { type: "copilot" /* Copilot */, path: "plugin.json" }
];

var GITHUB_MARKETPLACE_CACHE_TTL_MS = 8 * 60 * 60 * 1e3;

var GITHUB_MARKETPLACE_CACHE_STORAGE_KEY = "chat.plugins.marketplaces.githubCache.v1";

var PLUGIN_UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1e3;

var PLUGIN_UPDATE_LAST_CHECK_STORAGE_KEY = "chat.plugins.lastUpdateCheck.v1";

function ensureSourceDescriptor(plugin) {
  if (plugin.sourceDescriptor) {
    return plugin;
  }
  return {
    ...plugin,
    sourceDescriptor: { kind: "relativePath" /* RelativePath */, path: plugin.source }
  };
}

var trustedMarketplacesMemento = observableMemento({
  defaultValue: [],
  key: "chat.plugins.trustedMarketplaces.v1",
  toStorage: (value2) => JSON.stringify(value2),
  fromStorage: (value2) => {
    const parsed = JSON.parse(value2);
    return Array.isArray(parsed) ? parsed : [];
  }
});

var lastFetchedPluginsMemento = observableMemento({
  defaultValue: { plugins: [], fetchedAt: 0 },
  key: "chat.plugins.lastFetchedPlugins.v2",
  toStorage: (value2) => JSON.stringify(value2),
  fromStorage: (value2) => {
    const parsed = JSON.parse(value2);
    if (parsed && Array.isArray(parsed.plugins)) {
      return parsed;
    }
    return { plugins: [], fetchedAt: 0 };
  }
});

var PluginMarketplaceService = class extends Disposable {
  constructor(_configurationService, _requestService, environmentService, _fileService, _pluginRepositoryService, _logService, _storageService, _workspacePluginSettingsService, _workspaceTrustService, _extensionsWorkbenchService, _meteredConnectionService) {
    super();
    this._configurationService = _configurationService;
    this._requestService = _requestService;
    this._fileService = _fileService;
    this._pluginRepositoryService = _pluginRepositoryService;
    this._logService = _logService;
    this._storageService = _storageService;
    this._workspacePluginSettingsService = _workspacePluginSettingsService;
    this._workspaceTrustService = _workspaceTrustService;
    this._extensionsWorkbenchService = _extensionsWorkbenchService;
    this._meteredConnectionService = _meteredConnectionService;
    this._gitHubMarketplaceCache = new Lazy(() => this._loadPersistedGitHubMarketplaceCache());
    this._pluginMetadata = /* @__PURE__ */ new Map();
    this._marketplacesWithUpdates = observableValue("marketplacesWithUpdates", /* @__PURE__ */ new Set());
    this._updateCheckDelayer = this._register(new ThrottledDelayer(PLUGIN_UPDATE_CHECK_INTERVAL_MS));
    this._updateChecksInitialized = false;
    this._updateCheckRunning = false;
    this.marketplacesWithUpdates = this._marketplacesWithUpdates;
    const oldCacheRoot = joinPath(environmentService.cacheHome, "agentPlugins");
    this._installedPluginsStore = this._register(
      new FileBackedInstalledPluginsStore(
        _pluginRepositoryService.agentPluginsHome,
        oldCacheRoot,
        _fileService,
        _logService,
        _storageService
      )
    );
    this._trustedMarketplacesStore = this._register(
      trustedMarketplacesMemento(-1 /* APPLICATION */, 1 /* MACHINE */, _storageService)
    );
    this._lastFetchedPluginsStore = this._register(
      lastFetchedPluginsMemento(-1 /* APPLICATION */, 1 /* MACHINE */, _storageService)
    );
    this.lastFetchedPlugins = this._lastFetchedPluginsStore.map((s) => {
      const revived = revive(s);
      return revived.plugins.map(ensureSourceDescriptor);
    });
    this.installedPlugins = this._installedPluginsStore.value.map((entries2) => {
      const result = [];
      for (const e4 of entries2) {
        const plugin = this._pluginMetadata.get(e4.pluginUri.toString());
        if (plugin) {
          result.push({ pluginUri: e4.pluginUri, plugin });
        }
      }
      return result;
    });
    const workspaceTrusted = observableFromEvent(this, this._workspaceTrustService.onDidChangeTrust, () => this._workspaceTrustService.isWorkspaceTrusted());
    this.recommendedPlugins = derived((reader) => {
      if (!workspaceTrusted.read(reader)) {
        return /* @__PURE__ */ new Set();
      }
      const enabledMap = this._workspacePluginSettingsService.enabledPlugins.read(reader);
      const keys = /* @__PURE__ */ new Set();
      for (const [key3, value2] of enabledMap) {
        if (value2) {
          keys.add(key3);
        }
      }
      return keys;
    });
    this.onDidChangeMarketplaces = Event2.any(
      Event2.filter(
        _configurationService.onDidChangeConfiguration,
        (e4) => e4.affectsConfiguration("chat.plugins.enabled" /* PluginsEnabled */) || e4.affectsConfiguration("chat.plugins.marketplaces" /* PluginMarketplaces */) || e4.affectsConfiguration("chat.plugins.extraMarketplaces" /* ExtraMarketplaces */)
      ),
      Event2.fromObservableLight(this._workspacePluginSettingsService.extraMarketplaces),
      Event2.map(this._workspaceTrustService.onDidChangeTrust, () => {
      })
    );
    this._register(runWhenGlobalIdle(() => {
      this._updateChecksInitialized = true;
      this._scheduleUpdateCheck();
      this._register(Event2.filter(
        _configurationService.onDidChangeConfiguration,
        (e4) => e4.affectsConfiguration(AutoUpdateConfigurationKey) || e4.affectsConfiguration("chat.plugins.extraMarketplaces" /* ExtraMarketplaces */) || e4.affectsConfiguration("chat.plugins.strictMarketplaces" /* StrictMarketplaces */)
      )(() => {
        this._marketplacesWithUpdates.set(/* @__PURE__ */ new Set(), void 0);
        this._scheduleUpdateCheck(0);
      }));
      this._register(this._meteredConnectionService.onDidChangeIsConnectionMetered((isMetered) => {
        if (isMetered) {
          this._updateCheckDelayer.cancel();
        } else if (!this._updateCheckRunning && !this._updateCheckDelayer.isTriggered()) {
          this._scheduleUpdateCheck();
        }
      }));
    }));
    this._register(autorun((reader) => {
      const entries2 = this._installedPluginsStore.value.read(reader);
      const unhydrated = entries2.filter((e4) => !this._pluginMetadata.has(e4.pluginUri.toString()));
      if (unhydrated.length > 0) {
        this._hydratePluginMetadata(unhydrated);
      }
    }));
  }
  clearUpdatesAvailable(marketplaceIds) {
    const remaining = marketplaceIds ? new Set([...this._marketplacesWithUpdates.get()].filter((id2) => !marketplaceIds.has(id2))) : /* @__PURE__ */ new Set();
    this._marketplacesWithUpdates.set(remaining, void 0);
    if (remaining.size === 0 && this._updateChecksInitialized && !this._updateCheckRunning && !this._updateCheckDelayer.isTriggered()) {
      this._scheduleUpdateCheck();
    }
  }
  async fetchMarketplacePlugins(token, marketplaceIds, options3) {
    if (!this._configurationService.getValue("chat.plugins.enabled" /* PluginsEnabled */)) {
      return [];
    }
    const { effectiveValues } = readConfiguredMarketplaces(this._configurationService);
    const configRefs = parseMarketplaceReferences(effectiveValues);
    let allRefs;
    if (this._workspaceTrustService.isWorkspaceTrusted()) {
      const workspaceEntries2 = this._workspacePluginSettingsService.extraMarketplaces.get();
      allRefs = deduplicateMarketplaceReferences(workspaceEntries2.map((e4) => e4.reference), configRefs);
    } else {
      allRefs = configRefs;
    }
    for (const value2 of effectiveValues) {
      const parsed = typeof value2 === "string" ? parseMarketplaceReference(value2) : value2 && typeof value2 === "object" ? parseMarketplaceObjectEntry(value2) : void 0;
      if (!parsed) {
        this._logService.debug(`[PluginMarketplaceService] Ignoring invalid marketplace entry: ${String(value2)}`);
      }
    }
    const refsToFetch = allRefs.filter(
      (ref) => (!marketplaceIds || marketplaceIds.has(ref.canonicalId)) && this._isMarketplaceAllowedByStrictPolicy(ref)
    );
    const results = await Promise.all(
      refsToFetch.map((ref) => {
        if (ref.kind === "githubShorthand" /* GitHubShorthand */ && ref.githubRepo) {
          return this._fetchFromGitHubRepo(ref, ref.githubRepo, token, options3);
        }
        return this._fetchFromClonedRepo(ref, token, options3);
      })
    );
    const plugins = results.flat();
    if (token.isCancellationRequested) {
      return plugins;
    }
    const storedPlugins = marketplaceIds ? [...this.lastFetchedPlugins.get().filter((plugin) => !marketplaceIds.has(plugin.marketplaceReference.canonicalId)), ...plugins] : plugins;
    this._lastFetchedPluginsStore.set({ plugins: storedPlugins, fetchedAt: Date.now() }, void 0);
    return plugins;
  }
  async _fetchFromGitHubRepo(reference, repo, token, options3) {
    const cache2 = this._gitHubMarketplaceCache.value;
    const cached = options3?.refresh ? void 0 : this._getCachedGitHubMarketplacePlugins(cache2, reference.canonicalId);
    if (cached) {
      return cached.map((c) => {
        const plugin = ensureSourceDescriptor(c);
        return {
          ...plugin,
          marketplace: reference.displayLabel,
          marketplaceReference: reference,
          readmeUri: getMarketplaceReadmeUri(plugin.sourceDescriptor, reference, plugin.source)
        };
      });
    }
    let repoMayBePrivate = true;
    const plugins = await this._readPluginsFromDefinitions(reference, async (defPath) => {
      if (token.isCancellationRequested) {
        return void 0;
      }
      const ref = encodeURIComponent(reference.ref ?? "main");
      const url = `https://raw.githubusercontent.com/${repo}/${ref}/${defPath}`;
      try {
        const context2 = await this._requestService.request({ type: "GET", url, callSite: "pluginMarketplaceService.fetchPluginList" }, token);
        const statusCode = context2.res.statusCode;
        if (statusCode !== 200) {
          repoMayBePrivate &&= statusCode !== void 0 && statusCode >= 400 && statusCode < 500;
          this._logService.debug(`[PluginMarketplaceService] ${url} returned status ${statusCode}, skipping`);
          return void 0;
        }
        return await asJson(context2) ?? void 0;
      } catch (err) {
        this._logService.debug(`[PluginMarketplaceService] Failed to fetch marketplace.json from ${url}:`, err);
        return void 0;
      }
    });
    if (plugins.length > 0) {
      cache2.set(reference.canonicalId, {
        plugins,
        expiresAt: Date.now() + GITHUB_MARKETPLACE_CACHE_TTL_MS,
        referenceRawValue: reference.rawValue
      });
      this._savePersistedGitHubMarketplaceCache(cache2);
      return plugins;
    }
    if (repoMayBePrivate) {
      this._logService.debug(`[PluginMarketplaceService] ${repo} may be private, attempting clone-based marketplace discovery`);
      if (cache2.delete(reference.canonicalId)) {
        this._savePersistedGitHubMarketplaceCache(cache2);
      }
      return this._fetchFromClonedRepo(reference, token, options3);
    }
    this._logService.debug(`[PluginMarketplaceService] No marketplace.json found in ${repo}`);
    return [];
  }
  _getCachedGitHubMarketplacePlugins(cache2, cacheKey2) {
    const cached = cache2.get(cacheKey2);
    if (!cached) {
      return void 0;
    }
    if (cached.expiresAt <= Date.now()) {
      cache2.delete(cacheKey2);
      this._savePersistedGitHubMarketplaceCache(cache2);
      return void 0;
    }
    return [...cached.plugins];
  }
  _loadPersistedGitHubMarketplaceCache() {
    const cache2 = /* @__PURE__ */ new Map();
    const now = Date.now();
    const stored = this._storageService.getObject(GITHUB_MARKETPLACE_CACHE_STORAGE_KEY, -1 /* APPLICATION */);
    if (!stored) {
      return cache2;
    }
    const revived = revive(stored);
    for (const [cacheKey2, entry] of Object.entries(revived)) {
      if (!entry || !Array.isArray(entry.plugins) || typeof entry.expiresAt !== "number" || entry.expiresAt <= now || typeof entry.referenceRawValue !== "string") {
        continue;
      }
      const reference = parseMarketplaceReference(entry.referenceRawValue);
      if (!reference) {
        continue;
      }
      const plugins = entry.plugins.map((plugin) => ensureSourceDescriptor({
        ...plugin,
        marketplace: reference.displayLabel,
        marketplaceReference: reference
      }));
      cache2.set(cacheKey2, {
        plugins,
        expiresAt: entry.expiresAt,
        referenceRawValue: entry.referenceRawValue
      });
    }
    return cache2;
  }
  _savePersistedGitHubMarketplaceCache(cache2) {
    const serialized = {};
    for (const [cacheKey2, entry] of cache2) {
      if (!entry.plugins.length || entry.expiresAt <= Date.now()) {
        continue;
      }
      serialized[cacheKey2] = {
        expiresAt: entry.expiresAt,
        referenceRawValue: entry.referenceRawValue,
        plugins: entry.plugins
      };
    }
    if (Object.keys(serialized).length === 0) {
      this._storageService.remove(GITHUB_MARKETPLACE_CACHE_STORAGE_KEY, -1 /* APPLICATION */);
      return;
    }
    this._storageService.store(
      GITHUB_MARKETPLACE_CACHE_STORAGE_KEY,
      JSON.stringify(serialized),
      -1 /* APPLICATION */,
      1 /* MACHINE */
    );
  }
  getMarketplacePluginMetadata(pluginUri) {
    return this._pluginMetadata.get(pluginUri.toString()) ?? [...this._pluginMetadata.entries()].find(([key3]) => isEqualOrParent2(pluginUri, URI.parse(key3)))?.[1];
  }
  addInstalledPlugin(pluginUri, plugin) {
    this._pluginMetadata.set(pluginUri.toString(), plugin);
    const entry = {
      pluginUri,
      marketplace: plugin.marketplaceReference.rawValue,
      name: plugin.name
    };
    const current = this._installedPluginsStore.get();
    const existing = current.find((e4) => isEqual2(e4.pluginUri, pluginUri));
    if (existing) {
      this._installedPluginsStore.set(current.map((c) => c === existing ? entry : c), void 0);
    } else {
      this._installedPluginsStore.set([...current, entry], void 0);
    }
  }
  removeInstalledPlugin(pluginUri) {
    this._pluginMetadata.delete(pluginUri.toString());
    const current = this._installedPluginsStore.get();
    this._installedPluginsStore.set(current.filter((e4) => !isEqual2(e4.pluginUri, pluginUri)), void 0);
  }
  isMarketplaceTrusted(ref) {
    const allowlist = getStrictKnownMarketplaces(this._configurationService.getValue("chat.plugins.strictMarketplaces" /* StrictMarketplaces */));
    if (allowlist !== void 0) {
      return isMarketplaceReferenceAllowed(allowlist, ref);
    }
    return this._trustedMarketplacesStore.get().includes(ref.canonicalId);
  }
  isStrictMarketplacePolicyActive() {
    return getStrictKnownMarketplaces(this._configurationService.getValue("chat.plugins.strictMarketplaces" /* StrictMarketplaces */)) !== void 0;
  }
  isMarketplaceAutoUpdateEnabled(ref) {
    const { extraValues } = readConfiguredMarketplaces(this._configurationService);
    const managedRef = parseMarketplaceReferences(extraValues).find((candidate) => candidate.canonicalId === ref.canonicalId);
    return managedRef?.autoUpdate ?? this._extensionsWorkbenchService.getAutoUpdateValue() !== "off";
  }
  _isMarketplaceAllowedByStrictPolicy(ref) {
    return !this.isStrictMarketplacePolicyActive() || this.isMarketplaceTrusted(ref);
  }
  // --- Plugin metadata hydration -----------------------------------------------
  /**
   * Hydrates installed entries from marketplace metadata. Entries written
   * by current builds include the marketplace plugin name, which is enough
   * to re-read the full plugin descriptor from the marketplace source. Old
   * entries without a name fall back to matching by install URI.
   *
   * After hydration completes the installed-plugins store is "touched" so
   * that the derived {@link installedPlugins} observable re-evaluates with
   * the newly available metadata.
   */
  async _hydratePluginMetadata(entries2) {
    let hydrated = 0;
    for (const entry of entries2) {
      const key3 = entry.pluginUri.toString();
      if (this._pluginMetadata.has(key3)) {
        continue;
      }
      const reference = parseMarketplaceReference(entry.marketplace);
      if (!reference) {
        this._logService.debug(`[PluginMarketplaceService] Cannot parse marketplace reference '${entry.marketplace}' for ${key3}`);
        continue;
      }
      try {
        const plugins = await this._readPluginsForInstalledEntry(reference, CancellationToken.None);
        const match2 = plugins.find((p) => entry.name ? p.name === entry.name : isEqual2(this._pluginRepositoryService.getPluginInstallUri(p), entry.pluginUri));
        if (match2) {
          this._pluginMetadata.set(key3, match2);
          hydrated++;
        }
      } catch (err) {
        this._logService.debug(`[PluginMarketplaceService] Failed to hydrate metadata for ${key3}:`, err);
      }
    }
    if (hydrated > 0) {
      const current = this._installedPluginsStore.get();
      this._installedPluginsStore.set([...current], void 0);
    }
  }
  async _readPluginsForInstalledEntry(reference, token) {
    if (reference.kind === "githubShorthand" /* GitHubShorthand */ && reference.githubRepo) {
      return this._fetchFromGitHubRepo(reference, reference.githubRepo, token);
    }
    const repoDir = this._pluginRepositoryService.getRepositoryUri(reference);
    let plugins = await this._readPluginsFromDirectory(repoDir, reference, token);
    if (plugins.length === 0) {
      const single = await this.readSinglePluginManifest(repoDir, reference);
      if (single) {
        plugins = [single];
      }
    }
    return plugins;
  }
  /**
   * Shared logic to parse a marketplace.json into {@link IMarketplacePlugin}
   * objects. Used by both fetch and hydration paths.
   */
  _parseMarketplacePlugins(json, reference, marketplaceType, repoDir) {
    if (!json.plugins || !Array.isArray(json.plugins)) {
      return [];
    }
    return json.plugins.filter(
      (p) => typeof p.name === "string" && !!p.name
    ).flatMap((p) => {
      const sourceDescriptor = parsePluginSource(p.source, json.metadata?.pluginRoot, {
        pluginName: p.name,
        logService: this._logService,
        logPrefix: "[PluginMarketplaceService]"
      });
      if (!sourceDescriptor) {
        return [];
      }
      const source = sourceDescriptor.kind === "relativePath" /* RelativePath */ ? sourceDescriptor.path : "";
      return [{
        name: p.name,
        description: p.description ?? "",
        version: p.version ?? "",
        source,
        sourceDescriptor,
        marketplace: reference.displayLabel,
        marketplaceReference: reference,
        marketplaceType,
        readmeUri: getMarketplaceReadmeUri(sourceDescriptor, reference, source, repoDir)
      }];
    });
  }
  trustMarketplace(ref) {
    const current = this._trustedMarketplacesStore.get();
    if (!current.includes(ref.canonicalId)) {
      this._trustedMarketplacesStore.set([...current, ref.canonicalId], void 0);
    }
  }
  // --- Periodic update check ------------------------------------------------
  _hasAutoUpdateEnabledMarketplace() {
    if (this._extensionsWorkbenchService.getAutoUpdateValue() !== "off") {
      return true;
    }
    const { extraValues } = readConfiguredMarketplaces(this._configurationService);
    return parseMarketplaceReferences(extraValues).some((ref) => ref.autoUpdate === true);
  }
  /**
   * (Re-)schedules the next periodic update check after startup idle and
   * whenever the auto-update config or metered connection state changes.
   */
  _scheduleUpdateCheck(delayOverride) {
    this._updateCheckDelayer.cancel();
    if (this._store.isDisposed || this._meteredConnectionService.isConnectionMetered || this._marketplacesWithUpdates.get().size > 0 || !this._hasAutoUpdateEnabledMarketplace()) {
      return;
    }
    const lastCheck = this._storageService.getNumber(
      PLUGIN_UPDATE_LAST_CHECK_STORAGE_KEY,
      -1 /* APPLICATION */,
      0
    );
    const elapsed = Date.now() - lastCheck;
    const delay = delayOverride ?? Math.max(0, PLUGIN_UPDATE_CHECK_INTERVAL_MS - elapsed);
    this._updateCheckDelayer.trigger(async () => {
      this._updateCheckRunning = true;
      try {
        await this._doRunUpdateCheck();
      } finally {
        this._updateCheckRunning = false;
        if (!this._updateCheckDelayer.isTriggered()) {
          this._scheduleUpdateCheck(PLUGIN_UPDATE_CHECK_INTERVAL_MS);
        }
      }
    }, delay).catch((error) => {
      if (!isCancellationError(error)) {
        onUnexpectedError(error);
      }
    });
  }
  async _doRunUpdateCheck() {
    if (this._meteredConnectionService.isConnectionMetered) {
      return;
    }
    try {
      const installed = this.installedPlugins.get();
      if (installed.length === 0) {
        return;
      }
      const seenMarketplaces = /* @__PURE__ */ new Set();
      const marketplacesWithUpdates = /* @__PURE__ */ new Set();
      for (const entry of installed) {
        const ref = entry.plugin.marketplaceReference;
        if (seenMarketplaces.has(ref.canonicalId) || !this.isMarketplaceAutoUpdateEnabled(ref) || !this._isMarketplaceAllowedByStrictPolicy(ref)) {
          continue;
        }
        seenMarketplaces.add(ref.canonicalId);
        try {
          const behind = await this._pluginRepositoryService.fetchRepository(ref);
          if (behind) {
            marketplacesWithUpdates.add(ref.canonicalId);
          }
        } catch (err) {
          this._logService.debug(`[PluginMarketplaceService] Update check failed for ${ref.displayLabel}:`, err);
        }
      }
      this._marketplacesWithUpdates.set(marketplacesWithUpdates, void 0);
      this._storageService.store(
        PLUGIN_UPDATE_LAST_CHECK_STORAGE_KEY,
        Date.now(),
        -1 /* APPLICATION */,
        1 /* MACHINE */
      );
    } catch (err) {
      this._logService.debug("[PluginMarketplaceService] Periodic update check failed:", err);
    }
  }
  async _fetchFromClonedRepo(reference, token, options3) {
    let repoDir;
    try {
      repoDir = await this._pluginRepositoryService.ensureRepository(reference, {
        refreshIfOlderThanMs: options3?.refresh ? 0 : GITHUB_MARKETPLACE_CACHE_TTL_MS,
        token
      });
    } catch (err) {
      this._logService.debug(`[PluginMarketplaceService] Failed to prepare marketplace repository ${reference.rawValue}:`, err);
      options3?.onMarketplaceError?.(reference, err);
      return [];
    }
    return this._readPluginsFromDirectory(repoDir, reference, token);
  }
  async readPluginsFromDirectory(repoDir, reference) {
    return this._readPluginsFromDirectory(repoDir, reference);
  }
  async readSinglePluginManifest(repoDir, reference) {
    if (reference.kind !== "githubShorthand" /* GitHubShorthand */ && reference.kind !== "gitUri" /* GitUri */) {
      return void 0;
    }
    const sourceDescriptor = reference.kind === "githubShorthand" /* GitHubShorthand */ ? { kind: "github" /* GitHub */, repo: reference.githubRepo } : { kind: "url" /* GitUrl */, url: reference.cloneUrl };
    const agentManifest = await readAgentPluginManifest(repoDir, this._fileService);
    if (agentManifest) {
      return {
        name: agentManifest.name ?? reference.displayLabel,
        description: agentManifest.description ?? "",
        version: agentManifest.version ?? "",
        source: "",
        sourceDescriptor,
        marketplace: reference.displayLabel,
        marketplaceReference: reference,
        marketplaceType: "openPlugin" /* OpenPlugin */
      };
    }
    for (const def2 of SINGLE_PLUGIN_MANIFEST_DEFINITIONS) {
      const manifestUri = joinPath(repoDir, def2.path);
      let manifest;
      try {
        const contents = await this._fileService.readFile(manifestUri);
        const parsed = parse5(contents.value.toString());
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          manifest = parsed;
        }
      } catch {
        continue;
      }
      if (!manifest) {
        continue;
      }
      const manifestName = typeof manifest["name"] === "string" && manifest["name"] ? manifest["name"] : reference.displayLabel;
      const manifestDescription = typeof manifest["description"] === "string" ? manifest["description"] : "";
      const manifestVersion = typeof manifest["version"] === "string" ? manifest["version"] : "";
      return {
        name: manifestName,
        description: manifestDescription,
        version: manifestVersion,
        source: "",
        sourceDescriptor,
        marketplace: reference.displayLabel,
        marketplaceReference: reference,
        marketplaceType: def2.type
      };
    }
    this._logService.debug(`[PluginMarketplaceService] No single-plugin manifest found in ${reference.rawValue}`);
    return void 0;
  }
  async isPluginDirectory(repoDir) {
    if (await readAgentPluginManifest(repoDir, this._fileService)) {
      return true;
    }
    for (const def2 of SINGLE_PLUGIN_MANIFEST_DEFINITIONS) {
      if (await this._fileService.exists(joinPath(repoDir, def2.path))) {
        return true;
      }
    }
    return false;
  }
  async _readPluginsFromDirectory(repoDir, reference, token) {
    return this._readPluginsFromDefinitions(reference, async (defPath) => {
      if (token?.isCancellationRequested) {
        return void 0;
      }
      const definitionUri = joinPath(repoDir, defPath);
      try {
        const contents = await this._fileService.readFile(definitionUri);
        return parse5(contents.value.toString());
      } catch {
        return void 0;
      }
    }, repoDir);
  }
  /**
   * Iterates over {@link MARKETPLACE_DEFINITIONS} paths, calling
   * {@link readJson} for each to obtain the parsed JSON. Returns the
   * plugins from the first definition that yields a valid result.
   */
  async _readPluginsFromDefinitions(reference, readJson, repoDir) {
    for (const def2 of MARKETPLACE_DEFINITIONS) {
      const json = await readJson(def2.path);
      if (!json?.plugins || !Array.isArray(json.plugins)) {
        continue;
      }
      return this._parseMarketplacePlugins(json, reference, def2.type, repoDir);
    }
    this._logService.debug(`[PluginMarketplaceService] No marketplace.json found in ${reference.rawValue}`);
    return [];
  }
};

PluginMarketplaceService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IRequestService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IAgentPluginRepositoryService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IWorkspacePluginSettingsService),
  __decorateParam(8, IWorkspaceTrustManagementService),
  __decorateParam(9, IExtensionsWorkbenchService),
  __decorateParam(10, IMeteredConnectionService)
], PluginMarketplaceService);

function normalizeMarketplacePath(value2) {
  let normalized = value2.trim().replace(/\\/g, "/");
  normalized = normalized.replace(/^\.?\/+/, "").replace(/\/+$/g, "");
  return normalized;
}

function resolvePluginSource(pluginRoot, source) {
  const normalizedRoot = pluginRoot ? normalizeMarketplacePath(pluginRoot) : "";
  const normalizedSource = normalizeMarketplacePath(source);
  const repoRoot = URI.file("/");
  const pluginRootUri = normalizedRoot ? normalizePath(joinPath(repoRoot, normalizedRoot)) : repoRoot;
  if (normalizedRoot && (normalizedSource === normalizedRoot || normalizedSource.startsWith(`${normalizedRoot}/`))) {
    return normalizedSource;
  }
  const resolvedUri = normalizePath(joinPath(pluginRootUri, normalizedSource));
  return relativePath(repoRoot, resolvedUri) ?? void 0;
}

function parsePluginSource(rawSource, pluginRoot, logContext) {
  if (rawSource === void 0 || rawSource === null) {
    const resolved = resolvePluginSource(pluginRoot, "");
    if (resolved === void 0) {
      return void 0;
    }
    return { kind: "relativePath" /* RelativePath */, path: resolved };
  }
  if (typeof rawSource === "string") {
    const resolved = resolvePluginSource(pluginRoot, rawSource);
    if (resolved === void 0) {
      return void 0;
    }
    return { kind: "relativePath" /* RelativePath */, path: resolved };
  }
  if (typeof rawSource !== "object" || typeof rawSource.source !== "string") {
    logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': source object is missing a 'source' discriminant`);
    return void 0;
  }
  switch (rawSource.source) {
    case "github": {
      if (typeof rawSource.repo !== "string" || !rawSource.repo) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': github source is missing required 'repo' field`);
        return void 0;
      }
      if (!isValidGitHubRepo(rawSource.repo)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': github source repo must be in 'owner/repo' format`);
        return void 0;
      }
      if (!isOptionalString(rawSource.ref)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': github source 'ref' must be a string when provided`);
        return void 0;
      }
      if (!isOptionalGitSha(rawSource.sha)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': github source 'sha' must be a full 40-character commit hash when provided`);
        return void 0;
      }
      if (!isOptionalString(rawSource.path)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': github source 'path' must be a string when provided`);
        return void 0;
      }
      return {
        kind: "github" /* GitHub */,
        repo: rawSource.repo,
        ref: rawSource.ref,
        sha: rawSource.sha,
        path: rawSource.path
      };
    }
    case "url":
    case "git-subdir": {
      if (typeof rawSource.url !== "string" || !rawSource.url) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': ${rawSource.source} source is missing required 'url' field`);
        return void 0;
      }
      if (rawSource.source === "url" && !rawSource.url.toLowerCase().endsWith(".git")) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': url source must end with '.git'`);
        return void 0;
      }
      if (!isOptionalString(rawSource.ref)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': ${rawSource.source} source 'ref' must be a string when provided`);
        return void 0;
      }
      if (!isOptionalGitSha(rawSource.sha)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': ${rawSource.source} source 'sha' must be a full 40-character commit hash when provided`);
        return void 0;
      }
      if (rawSource.source === "git-subdir") {
        if (typeof rawSource.path !== "string" || !rawSource.path) {
          logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': git-subdir source is missing required 'path' field`);
          return void 0;
        }
      } else if (!isOptionalString(rawSource.path)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': url source 'path' must be a string when provided`);
        return void 0;
      }
      return {
        kind: "url" /* GitUrl */,
        url: rawSource.url,
        ref: rawSource.ref,
        sha: rawSource.sha,
        path: rawSource.path
      };
    }
    case "npm": {
      if (typeof rawSource.package !== "string" || !rawSource.package) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': npm source is missing required 'package' field`);
        return void 0;
      }
      if (!isOptionalString(rawSource.version) || !isOptionalString(rawSource.registry)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': npm source 'version' and 'registry' must be strings when provided`);
        return void 0;
      }
      return {
        kind: "npm" /* Npm */,
        package: rawSource.package,
        version: rawSource.version,
        registry: rawSource.registry
      };
    }
    case "pip": {
      if (typeof rawSource.package !== "string" || !rawSource.package) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': pip source is missing required 'package' field`);
        return void 0;
      }
      if (!isOptionalString(rawSource.version) || !isOptionalString(rawSource.registry)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': pip source 'version' and 'registry' must be strings when provided`);
        return void 0;
      }
      return {
        kind: "pip" /* Pip */,
        package: rawSource.package,
        version: rawSource.version,
        registry: rawSource.registry
      };
    }
    default:
      logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': unknown source kind '${rawSource.source}'`);
      return void 0;
  }
}

function isOptionalString(value2) {
  return value2 === void 0 || typeof value2 === "string";
}

function isOptionalGitSha(value2) {
  return value2 === void 0 || typeof value2 === "string" && /^[0-9a-fA-F]{40}$/.test(value2);
}

function isValidGitHubRepo(repo) {
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo);
}

function hasSourceChanged(installed, marketplace) {
  if (installed.kind !== marketplace.kind) {
    return true;
  }
  switch (installed.kind) {
    case "github" /* GitHub */:
      return installed.ref !== marketplace.ref || installed.sha !== marketplace.sha || installed.path !== marketplace.path;
    case "url" /* GitUrl */:
      return installed.ref !== marketplace.ref || installed.sha !== marketplace.sha || installed.path !== marketplace.path;
    case "npm" /* Npm */:
      return installed.version !== marketplace.version;
    case "pip" /* Pip */:
      return installed.version !== marketplace.version;
    default:
      return false;
  }
}

function getMarketplaceReadmeUri(sourceDescriptor, reference, source, repoDir) {
  if (sourceDescriptor.kind === "github" /* GitHub */) {
    const ref2 = sourceDescriptor.sha ?? sourceDescriptor.ref ?? "main";
    const normalizedPath = sourceDescriptor.path?.trim().replace(/^\.?\/+|\/+$/g, "");
    const readmePath2 = normalizedPath ? `${normalizedPath}/README.md` : "README.md";
    return URI.parse(`https://github.com/${sourceDescriptor.repo}/blob/${ref2}/${readmePath2}`);
  }
  if (sourceDescriptor.kind === "url" /* GitUrl */ && sourceDescriptor.url.startsWith("https://github.com/")) {
    const repo = sourceDescriptor.url.replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, "");
    const ref2 = sourceDescriptor.sha ?? sourceDescriptor.ref ?? "main";
    const normalizedPath = sourceDescriptor.path?.trim().replace(/^\.?\/+|\/+$/g, "");
    const readmePath2 = normalizedPath ? `${normalizedPath}/README.md` : "README.md";
    return URI.parse(`https://github.com/${repo}/blob/${ref2}/${readmePath2}`);
  }
  if (repoDir) {
    return getMarketplaceReadmeFileUri(repoDir, source);
  }
  if (!reference.githubRepo) {
    return void 0;
  }
  const normalizedSource = source.trim().replace(/^\.?\/+|\/+$/g, "");
  const readmePath = normalizedSource ? `${normalizedSource}/README.md` : "README.md";
  const ref = reference.ref ?? "main";
  return URI.parse(`https://github.com/${reference.githubRepo}/blob/${ref}/${readmePath}`);
}

function getMarketplaceReadmeFileUri(repoDir, source) {
  const normalizedSource = source.trim().replace(/^\.?\/+|\/+$/g, "");
  return normalizedSource ? joinPath(repoDir, normalizedSource, "README.md") : joinPath(repoDir, "README.md");
}
export { ensureSourceDescriptor, normalizeMarketplacePath, resolvePluginSource, parsePluginSource, isOptionalString, isOptionalGitSha, isValidGitHubRepo, hasSourceChanged, getMarketplaceReadmeUri, getMarketplaceReadmeFileUri, IPluginMarketplaceService, MARKETPLACE_DEFINITIONS, SINGLE_PLUGIN_MANIFEST_DEFINITIONS, GITHUB_MARKETPLACE_CACHE_TTL_MS, GITHUB_MARKETPLACE_CACHE_STORAGE_KEY, PLUGIN_UPDATE_CHECK_INTERVAL_MS, PLUGIN_UPDATE_LAST_CHECK_STORAGE_KEY, trustedMarketplacesMemento, lastFetchedPluginsMemento, PluginMarketplaceService };
