// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/plugins/agentPluginServiceImpl.ts
import { HookType } from "./module-1011.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { EnablementModel } from "./module-1019.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { agentPluginDiscoveryRegistry } from "./module-1017.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { Event2 } from "./module-0017.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { AgentPluginCollisionEnablementModel, getAgentPluginPolicyId, getCanonicalAgentPluginCollisionGroups, getSortedAgentPlugins, isAgentPluginBlockedByPolicy } from "./module-1030.mjs";
import { autorun } from "./module-0052.mjs";
import { transaction } from "./module-0045.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService, getConfigValueInTarget } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { observableValue } from "./module-0048.mjs";
import { detectPluginFormat, getPluginManifestComponent, parseMcpServerDefinitionMap, readMarkdownComponents, readPluginManifest, readPluginMcpServers, readPluginSkills, resolvePluginComponentDirs } from "./module-1010.mjs";
import { equals4 } from "./module-0098.mjs";
import { hasKey } from "./module-0010.mjs";
import { ObservablePromise } from "./module-0055.mjs";
import { observableSignal } from "./module-0058.mjs";
import { Iterable } from "./module-0011.mjs";
import { basename2, isEqual2, isEqualOrParent2, joinPath } from "./module-0034.mjs";
import { parse5 } from "./module-0885.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { untildify } from "./module-0711.mjs";
import { posix, win32 } from "./module-0026.mjs";
import { URI } from "./module-0032.mjs";
import { IFileService } from "./module-0269.mjs";
import { IPluginMarketplaceService } from "./module-1029.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IPathService } from "./module-0939.mjs";
import { IAgentPluginRepositoryService } from "./module-1024.mjs";
import { localize } from "./module-0001.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ExtensionsRegistry } from "./module-0878.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { ICommandService } from "./module-0087.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0879.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/contrib/chat/common/plugins/agentPluginServiceImpl.ts
function toAgentPluginHooks(groups) {
  return groups.filter((g) => Object.values(HookType).includes(g.type)).map((g) => ({
    type: g.type,
    hooks: g.commands,
    uri: g.uri,
    originalId: g.originalId
  }));
}

var RULE_FILE_SUFFIXES = [".instructions.md", ".mdc", ".md"];

function resolveWorkspaceRoot(pluginUri, workspaceContextService) {
  const defaultFolder = workspaceContextService.getWorkspace().folders[0];
  const folder = workspaceContextService.getWorkspaceFolder(pluginUri) ?? defaultFolder;
  return folder?.uri;
}

var AgentPluginService = class extends Disposable {
  constructor(instantiationService, configurationService, storageService, logService) {
    super();
    const baseEnablementModel = this._register(new EnablementModel("agentPlugins.enablement", storageService));
    const pluginsEnabled = observableConfigValue("chat.plugins.enabled" /* PluginsEnabled */, true, configurationService);
    const discoveries = [];
    for (const registration of agentPluginDiscoveryRegistry.getAll()) {
      const discovery = instantiationService.createInstance(registration.descriptor);
      this._register(discovery);
      discoveries.push({ discovery, priority: registration.priority, order: registration.order });
    }
    const enabledPluginsPolicy = observableFromEvent(
      this,
      Event2.filter(configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration("chat.plugins.enabledPlugins" /* EnabledPlugins */)),
      () => configurationService.inspect("chat.plugins.enabledPlugins" /* EnabledPlugins */).policyValue
    );
    const collisionGroups = derived((reader) => {
      if (!pluginsEnabled.read(reader)) {
        return /* @__PURE__ */ new Map();
      }
      const discoveredPlugins = readDiscoveredAgentPlugins(discoveries, reader);
      if (!discoveredPlugins) {
        return /* @__PURE__ */ new Map();
      }
      const policy = enabledPluginsPolicy.read(reader);
      return getCanonicalAgentPluginCollisionGroups(discoveredPlugins, (plugin) => isAgentPluginBlockedByPolicy(plugin, policy));
    });
    this.enablementModel = new AgentPluginCollisionEnablementModel(baseEnablementModel, collisionGroups);
    for (const { discovery } of discoveries) {
      discovery.start(this.enablementModel);
    }
    this.plugins = derived((read) => {
      if (!pluginsEnabled.read(read)) {
        return [];
      }
      const discoveredPlugins = readDiscoveredAgentPlugins(discoveries, read);
      if (!discoveredPlugins) {
        return [];
      }
      return getSortedAgentPlugins(discoveredPlugins);
    });
    this._register(autorun((reader) => {
      const plugins = this.plugins.read(reader);
      const policy = enabledPluginsPolicy.read(reader);
      transaction((tx) => {
        for (const plugin of plugins) {
          const blocked = isAgentPluginBlockedByPolicy(plugin, policy);
          if (setPolicyBlocked(plugin, blocked, tx) && blocked) {
            logService.debug(`[AgentPluginService] Plugin '${getAgentPluginPolicyId(plugin) ?? plugin.uri.toString()}' blocked \u2014 disabled by ChatEnabledPlugins policy`);
          }
        }
      });
    }));
  }
};

AgentPluginService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, ILogService)
], AgentPluginService);

function readDiscoveredAgentPlugins(discoveries, reader) {
  const result = [];
  for (const { discovery, priority, order } of discoveries) {
    const plugins = discovery.plugins.read(reader);
    if (!plugins) {
      return void 0;
    }
    result.push({ plugins, priority, order });
  }
  return result;
}

function setPolicyBlocked(plugin, blocked, tx) {
  const obs = plugin.policyBlocked;
  if (obs && typeof obs.set === "function") {
    if (obs.get() === blocked) {
      return false;
    }
    obs.set(blocked, tx);
    return true;
  }
  return false;
}

var AbstractAgentPluginDiscovery = class extends Disposable {
  constructor(_fileService, _pathService, _logService, _workspaceContextService) {
    super();
    this._fileService = _fileService;
    this._pathService = _pathService;
    this._logService = _logService;
    this._workspaceContextService = _workspaceContextService;
    this._pluginEntries = /* @__PURE__ */ new Map();
    this._plugins = observableValue("discoveredAgentPlugins", void 0);
    this.plugins = this._plugins;
    this._discoverVersion = 0;
  }
  async _refreshPlugins() {
    const version2 = ++this._discoverVersion;
    const plugins = await this._discoverAndBuildPlugins(version2);
    if (!this._isCurrentRefresh(version2)) {
      return;
    }
    this._plugins.set(plugins, void 0);
  }
  async _discoverAndBuildPlugins(version2) {
    const sources = await this._discoverPluginSources();
    if (!this._isCurrentRefresh(version2)) {
      return [];
    }
    const plugins = [];
    const seenPluginUris = /* @__PURE__ */ new Set();
    const attemptedPluginUris = /* @__PURE__ */ new Set();
    for (const source of sources) {
      const key3 = source.uri.toString();
      if (!attemptedPluginUris.has(key3)) {
        attemptedPluginUris.add(key3);
        try {
          const format5 = await detectPluginFormat(source.uri, this._fileService);
          if (!this._isCurrentRefresh(version2)) {
            return [];
          }
          const plugin = await this._toPlugin(source.uri, format5, source.fromMarketplace, source.repositoryUri, source.remove, version2);
          seenPluginUris.add(key3);
          plugins.push(plugin);
        } catch (error) {
          this._logService.warn(`[AgentPluginDiscovery] Rejected plugin '${source.uri.toString()}': ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    if (this._isCurrentRefresh(version2)) {
      this._disposePluginEntriesExcept(seenPluginUris);
    }
    plugins.sort((a, b) => a.uri.toString().localeCompare(b.uri.toString()));
    return plugins;
  }
  _isCurrentRefresh(version2) {
    return version2 === this._discoverVersion && !this._store.isDisposed;
  }
  async _pathExists(resource) {
    try {
      await this._fileService.resolve(resource);
      return true;
    } catch {
      return false;
    }
  }
  async _toPlugin(uri4, format5, fromMarketplace, repositoryUri, removeCallback, version2) {
    const key3 = uri4.toString();
    const existing = this._pluginEntries.get(key3);
    if (existing) {
      if (!this._isCurrentRefresh(version2)) {
        return existing.plugin;
      }
      if (existing.format.format !== format5.format) {
        existing.store.dispose();
        this._pluginEntries.delete(key3);
      } else {
        existing.plugin.remove = removeCallback;
        return existing.plugin;
      }
    }
    const store = new DisposableStore();
    const policyBlocked = observableValue("policyBlocked", false);
    const enablement = derived((r2) => policyBlocked.read(r2) ? 0 /* DisabledProfile */ : this._enablementModel.readEnabled(key3, r2));
    const initialManifest = await readPluginManifest(uri4, format5, this._fileService);
    const manifest = observableValue("agentPluginManifest", initialManifest);
    const pluginVersion = derived((reader) => {
      const manifestVersion = manifest.read(reader)?.version;
      if (typeof manifestVersion === "string" && manifestVersion.trim()) {
        return manifestVersion.trim();
      }
      return fromMarketplace?.version || void 0;
    }).recomputeInitiallyAndOnChange(store);
    const observeComponent = (prop, doRead, tryReadEmbedded, defaultPath = prop) => {
      const secondObs = derivedOpts({ equalsFn: equals4 }, (reader) => getPluginManifestComponent(format5, prop, manifest.read(reader)));
      const wrapped = derived((reader) => {
        if (format5.requiresManifest && !manifest.read(reader)) {
          return { kind: "dirs", dirs: [] };
        }
        const section = secondObs.read(reader);
        if (tryReadEmbedded) {
          if (section && typeof section === "object" && !Array.isArray(section) && !hasKey(section, { paths: true })) {
            return { kind: "const", data: new ObservablePromise(tryReadEmbedded(section)) };
          }
        }
        const dirs = resolvePluginComponentDirs(uri4, format5, prop, defaultPath, section, repositoryUri);
        for (const d of dirs) {
          const watcher = this._fileService.createWatcher(d, { recursive: false, excludes: [] });
          reader.store.add(watcher);
          reader.store.add(watcher.onDidChange(() => changeTrigger.trigger(void 0)));
        }
        return { kind: "dirs", dirs };
      });
      const changeTrigger = observableSignal("fileChange");
      const promised = derived((reader) => {
        const w = wrapped.read(reader);
        if (w.kind === "const") {
          return w.data.promiseResult;
        } else {
          changeTrigger.read(reader);
          const promise = new ObservablePromise(doRead(w.dirs));
          return promise.promiseResult;
        }
      });
      const result = promised.map((w, r2) => w.read(r2)?.data ?? Iterable.empty());
      return result.recomputeInitiallyAndOnChange(store);
    };
    const manifestUri = joinPath(uri4, format5.manifestPath);
    const commands = observeComponent("commands", (d) => readMarkdownComponents(d, this._fileService));
    const skills = observeComponent("skills", (d) => readPluginSkills(uri4, d, format5, this._fileService));
    const agents = observeComponent("agents", (d) => readMarkdownComponents(d, this._fileService));
    const instructions = observeComponent("rules", (d) => this._readRules(d));
    const hooks = observeComponent(
      "hooks",
      (paths) => this._readHooksFromPaths(uri4, paths, format5),
      async (section) => {
        const userHome = await this._pathService.userHome();
        const workspaceRoot = resolveWorkspaceRoot(uri4, this._workspaceContextService);
        return toAgentPluginHooks(format5.parseHooks(manifestUri, section, uri4, workspaceRoot, userHome));
      },
      format5.hookConfigPath
    );
    const mcpServerDefinitions = observeComponent(
      "mcpServers",
      (paths) => readPluginMcpServers(uri4, paths, format5, this._fileService),
      async (section) => parseMcpServerDefinitionMap(manifestUri, { mcpServers: section }, uri4, format5),
      ".mcp.json"
    );
    const readManifest = async () => {
      try {
        const latestFormat = await detectPluginFormat(uri4, this._fileService);
        if (latestFormat.format !== format5.format) {
          await this._refreshPlugins();
          return;
        }
        manifest.set(await readPluginManifest(uri4, format5, this._fileService), void 0);
      } catch (error) {
        manifest.set(void 0, void 0);
        this._logService.warn(`[AgentPluginDiscovery] Rejected updated plugin '${uri4.toString()}': ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    const agentManifestUri = joinPath(uri4, "plugin.json");
    const rootWatcher = this._fileService.createWatcher(uri4, { recursive: false, excludes: [] });
    store.add(rootWatcher);
    store.add(rootWatcher.onDidChange((change) => {
      if (change.affects(agentManifestUri)) {
        void readManifest();
      }
    }));
    store.add(this._fileService.onDidRunOperation((event) => {
      if (isEqual2(event.resource, agentManifestUri)) {
        void readManifest();
      }
    }));
    if (!isEqual2(manifestUri, agentManifestUri)) {
      const manifestWatcher = this._fileService.createWatcher(manifestUri, { recursive: false, excludes: [] });
      store.add(manifestWatcher);
      store.add(manifestWatcher.onDidChange(() => readManifest()));
    }
    const manifestName = typeof initialManifest?.name === "string" && initialManifest.name.trim() ? initialManifest.name.trim() : void 0;
    const plugin = {
      uri: uri4,
      format: format5.format,
      label: fromMarketplace?.name ?? manifestName ?? basename2(uri4),
      version: pluginVersion,
      enablement,
      policyBlocked,
      remove: removeCallback,
      hooks,
      commands,
      skills,
      agents,
      instructions,
      mcpServerDefinitions,
      fromMarketplace
    };
    if (this._isCurrentRefresh(version2)) {
      this._pluginEntries.set(key3, { store, plugin, format: format5 });
    } else {
      store.dispose();
    }
    return plugin;
  }
  /**
   * Reads hook definitions from a list of resolved paths (JSON files).
   * Each path is tried in order; the first one that contains valid hook
   * JSON is used.
   */
  async _readHooksFromPaths(pluginUri, paths, format5) {
    const userHome = await this._pathService.userHome();
    const workspaceRoot = resolveWorkspaceRoot(pluginUri, this._workspaceContextService);
    for (const hookPath of paths) {
      const json = await this._readJsonFile(hookPath);
      if (json) {
        try {
          return toAgentPluginHooks(format5.parseHooks(hookPath, json, pluginUri, workspaceRoot, userHome));
        } catch (e4) {
          this._logService.info(`[AgentPluginDiscovery] Failed to parse hooks from ${hookPath.toString()}:`, e4);
        }
      }
    }
    return [];
  }
  async _readJsonFile(uri4) {
    try {
      const fileContents = await this._fileService.readFile(uri4);
      return parse5(fileContents.value.toString());
    } catch {
      return void 0;
    }
  }
  /**
   * Scans directories for rule/instruction files (`.mdc`, `.md`,
   * `.instructions.md`), returning `{ uri, name }` entries where name is
   * derived from the filename minus the matched suffix.
   */
  async _readRules(dirs) {
    const seen = /* @__PURE__ */ new Set();
    const items = [];
    const matchSuffix = (filename) => {
      const lower = filename.toLowerCase();
      return RULE_FILE_SUFFIXES.find((s) => lower.endsWith(s));
    };
    const addItem = (name, uri4) => {
      if (!seen.has(name)) {
        seen.add(name);
        items.push({ uri: uri4, name });
      }
    };
    for (const dir of dirs) {
      let stat;
      try {
        stat = await this._fileService.resolve(dir);
      } catch {
        continue;
      }
      if (stat.isFile) {
        const suffix = matchSuffix(basename2(dir));
        if (suffix) {
          addItem(basename2(dir).slice(0, -suffix.length), dir);
        }
        continue;
      }
      if (!stat.isDirectory || !stat.children) {
        continue;
      }
      for (const child of stat.children) {
        if (!child.isFile) {
          continue;
        }
        const suffix = matchSuffix(child.name);
        if (suffix) {
          addItem(child.name.slice(0, -suffix.length), child.resource);
        }
      }
    }
    items.sort((a, b) => a.name.localeCompare(b.name));
    return items;
  }
  _disposePluginEntriesExcept(keep) {
    for (const [key3, entry] of this._pluginEntries) {
      if (!keep.has(key3)) {
        entry.store.dispose();
        this._pluginEntries.delete(key3);
      }
    }
  }
  dispose() {
    this._disposePluginEntriesExcept(/* @__PURE__ */ new Set());
    super.dispose();
  }
};

var ConfiguredAgentPluginDiscovery = class extends AbstractAgentPluginDiscovery {
  constructor(_configurationService, fileService, _pluginMarketplaceService, workspaceContextService, pathService, logService) {
    super(fileService, pathService, logService, workspaceContextService);
    this._configurationService = _configurationService;
    this._pluginMarketplaceService = _pluginMarketplaceService;
    this._pluginLocationsConfig = observableConfigValue("chat.pluginLocations" /* PluginLocations */, {}, _configurationService);
    this._enterpriseEnabledPluginsConfig = observableFromEvent(
      this,
      Event2.filter(this._configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration("chat.plugins.enabledPlugins" /* EnabledPlugins */)),
      () => {
        const inspected = this._configurationService.inspect("chat.plugins.enabledPlugins" /* EnabledPlugins */);
        return { ...inspected.defaultValue, ...inspected.userValue, ...inspected.policyValue };
      }
    );
  }
  start(enablementModel) {
    this._enablementModel = enablementModel;
    const scheduler = this._register(new RunOnceScheduler(() => this._refreshPlugins(), 0));
    this._register(autorun((reader) => {
      this._pluginLocationsConfig.read(reader);
      this._enterpriseEnabledPluginsConfig.read(reader);
      scheduler.schedule();
    }));
    scheduler.schedule();
  }
  async _discoverPluginSources() {
    const sources = [];
    const userHome = await this._getUserHome();
    for (const [key3, enabled] of Object.entries(this._pluginLocationsConfig.get())) {
      const trimmed = key3.trim();
      if (!trimmed || enabled === false) {
        continue;
      }
      for (const resource of this._resolvePluginPath(trimmed, userHome)) {
        await this._addPluginSource(sources, resource, "plugin path", () => this._removePluginPath(key3));
      }
    }
    for (const [key3, enabled] of Object.entries(this._enterpriseEnabledPluginsConfig.get())) {
      const trimmed = key3.trim();
      if (!trimmed || enabled === false) {
        continue;
      }
      const resource = this._resolveEnterprisePluginId(trimmed, userHome);
      if (!resource) {
        this._logService.debug(`[ConfiguredAgentPluginDiscovery] Skipping enterprise plugin entry that is not in <plugin>@<marketplace> form: ${trimmed}`);
        continue;
      }
      await this._addPluginSource(sources, resource, "enterprise plugin path");
    }
    return sources;
  }
  async _addPluginSource(sources, resource, label3, remove2) {
    let stat;
    try {
      stat = await this._fileService.resolve(resource);
    } catch {
      this._logService.debug(`[ConfiguredAgentPluginDiscovery] Could not resolve ${label3}: ${resource.toString()}`);
      return;
    }
    if (!stat.isDirectory) {
      this._logService.debug(`[ConfiguredAgentPluginDiscovery] ${label3} is not a directory: ${resource.toString()}`);
      return;
    }
    sources.push({
      uri: stat.resource,
      fromMarketplace: this._pluginMarketplaceService.getMarketplacePluginMetadata(stat.resource),
      remove: remove2
    });
  }
  async _getUserHome() {
    const userHome = await this._pathService.userHome();
    return userHome.scheme === "file" ? userHome.fsPath : userHome.path;
  }
  /**
   * Resolves a user-configured plugin path to one or more resource URIs.
   * Supports absolute paths, tilde paths (expanded to user home), and
   * workspace-relative paths.
   */
  _resolvePluginPath(path, userHome) {
    if (path.startsWith("~")) {
      path = untildify(path, userHome);
    }
    if (win32.isAbsolute(path) || posix.isAbsolute(path)) {
      return [URI.file(path)];
    }
    return this._workspaceContextService.getWorkspace().folders.map(
      (folder) => joinPath(folder.uri, path)
    );
  }
  /**
   * Resolves an enterprise plugin ID of the form `<plugin>@<marketplace>` to
   * the Copilot CLI install convention `~/.copilot/installed-plugins/<marketplace>/<plugin>/`.
   * Returns `undefined` for anything that doesn't match the ID shape.
   */
  _resolveEnterprisePluginId(id2, userHome) {
    const idMatch = id2.match(/^([^@/\\~]+)@([^@/\\~]+)$/);
    if (!idMatch) {
      return void 0;
    }
    const [, plugin, marketplace] = idMatch;
    return URI.file(`${userHome}/.copilot/installed-plugins/${marketplace}/${plugin}`);
  }
  /**
   * Removes a plugin path from `chat.pluginLocations` in the most specific
   * config target where the key is defined.
   */
  async _removePluginPath(configKey) {
    const inspected = this._configurationService.inspect("chat.pluginLocations" /* PluginLocations */);
    const targets = [
      6 /* WORKSPACE_FOLDER */,
      5 /* WORKSPACE */,
      3 /* USER_LOCAL */,
      4 /* USER_REMOTE */,
      2 /* USER */,
      1 /* APPLICATION */
    ];
    for (const target of targets) {
      const mapping2 = getConfigValueInTarget(inspected, target);
      if (mapping2 && Object.prototype.hasOwnProperty.call(mapping2, configKey)) {
        const updated = { ...mapping2 };
        delete updated[configKey];
        await this._configurationService.updateValue(
          "chat.pluginLocations" /* PluginLocations */,
          updated,
          target
        );
        return true;
      }
    }
    return false;
  }
};

ConfiguredAgentPluginDiscovery = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IPluginMarketplaceService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IPathService),
  __decorateParam(5, ILogService)
], ConfiguredAgentPluginDiscovery);

var MarketplaceAgentPluginDiscovery = class extends AbstractAgentPluginDiscovery {
  constructor(_pluginMarketplaceService, _pluginRepositoryService, fileService, pathService, logService, workspaceContextService) {
    super(fileService, pathService, logService, workspaceContextService);
    this._pluginMarketplaceService = _pluginMarketplaceService;
    this._pluginRepositoryService = _pluginRepositoryService;
  }
  start(enablementModel) {
    this._enablementModel = enablementModel;
    const scheduler = this._register(new RunOnceScheduler(() => this._refreshPlugins(), 0));
    this._register(autorun((reader) => {
      this._pluginMarketplaceService.installedPlugins.read(reader);
      scheduler.schedule();
    }));
    scheduler.schedule();
  }
  async _discoverPluginSources() {
    const installed = this._pluginMarketplaceService.installedPlugins.get();
    const sources = [];
    for (const entry of installed) {
      let stat;
      try {
        stat = await this._fileService.resolve(entry.pluginUri);
      } catch {
        this._logService.debug(`[MarketplaceAgentPluginDiscovery] Could not resolve installed plugin: ${entry.pluginUri.toString()}`);
        continue;
      }
      if (!stat.isDirectory) {
        this._logService.debug(`[MarketplaceAgentPluginDiscovery] Installed plugin path is not a directory: ${entry.pluginUri.toString()}`);
        continue;
      }
      const repositoryUri = this._pluginRepositoryService.getRepositoryUri(entry.plugin.marketplaceReference, entry.plugin.marketplaceType);
      sources.push({
        uri: stat.resource,
        fromMarketplace: entry.plugin,
        repositoryUri,
        remove: async () => {
          this._enablementModel.remove(stat.resource.toString());
          this._pluginMarketplaceService.removeInstalledPlugin(entry.pluginUri);
          const remaining = this._pluginMarketplaceService.installedPlugins.get();
          this._pluginRepositoryService.cleanupPluginSource(
            entry.plugin,
            remaining.map((e4) => e4.plugin.sourceDescriptor)
          ).catch((error) => {
            this._logService.error("[MarketplaceAgentPluginDiscovery] Failed to clean up plugin source", error);
          });
          return true;
        }
      });
    }
    return sources;
  }
};

MarketplaceAgentPluginDiscovery = __decorateClass([
  __decorateParam(0, IPluginMarketplaceService),
  __decorateParam(1, IAgentPluginRepositoryService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IPathService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IWorkspaceContextService)
], MarketplaceAgentPluginDiscovery);

var COPILOT_CLI_INSTALLED_PLUGINS_DIR = ".copilot/installed-plugins";

var CopilotCliAgentPluginDiscovery = class extends AbstractAgentPluginDiscovery {
  constructor(fileService, pathService, logService, workspaceContextService, _dialogService) {
    super(fileService, pathService, logService, workspaceContextService);
    this._dialogService = _dialogService;
  }
  start(enablementModel) {
    this._enablementModel = enablementModel;
    const scheduler = this._register(new RunOnceScheduler(() => this._refreshPlugins(), 0));
    const watcherStore = this._register(new DisposableStore());
    const setupWatchers = async () => {
      watcherStore.clear();
      if (this._store.isDisposed) {
        return;
      }
      const root = await this._getInstalledPluginsDir();
      const dirsToWatch = [];
      let candidate = root;
      while (candidate) {
        dirsToWatch.unshift(candidate);
        const parent = joinPath(candidate, "..");
        if (parent.toString() === candidate.toString()) {
          break;
        }
        if (await this._pathExists(parent)) {
          dirsToWatch.unshift(parent);
          break;
        }
        candidate = parent;
      }
      for (const dir of dirsToWatch) {
        if (!await this._pathExists(dir)) {
          continue;
        }
        const watcher = this._fileService.createWatcher(dir, { recursive: false, excludes: [] });
        watcherStore.add(watcher);
        watcherStore.add(watcher.onDidChange(() => {
          scheduler.schedule();
          setupWatchers().catch(() => {
          });
        }));
      }
      let rootStat;
      try {
        rootStat = await this._fileService.resolve(root);
      } catch {
        return;
      }
      if (!rootStat.children) {
        return;
      }
      for (const marketplaceDir of rootStat.children) {
        if (!marketplaceDir.isDirectory) {
          continue;
        }
        const watcher = this._fileService.createWatcher(marketplaceDir.resource, { recursive: false, excludes: [] });
        watcherStore.add(watcher);
        watcherStore.add(watcher.onDidChange(() => scheduler.schedule()));
      }
    };
    setupWatchers().catch(() => {
    });
    scheduler.schedule();
  }
  async _getInstalledPluginsDir() {
    const userHome = await this._pathService.userHome();
    return joinPath(userHome, COPILOT_CLI_INSTALLED_PLUGINS_DIR);
  }
  async _discoverPluginSources() {
    const root = await this._getInstalledPluginsDir();
    let rootStat;
    try {
      rootStat = await this._fileService.resolve(root);
    } catch {
      return [];
    }
    if (!rootStat.isDirectory || !rootStat.children) {
      return [];
    }
    const sources = [];
    for (const marketplaceDir of rootStat.children) {
      if (!marketplaceDir.isDirectory) {
        continue;
      }
      let marketplaceStat;
      try {
        marketplaceStat = await this._fileService.resolve(marketplaceDir.resource);
      } catch {
        continue;
      }
      if (!marketplaceStat.children) {
        continue;
      }
      for (const pluginDir of marketplaceStat.children) {
        if (!pluginDir.isDirectory) {
          continue;
        }
        sources.push({
          uri: pluginDir.resource,
          fromMarketplace: void 0,
          remove: () => this._promptRemove(pluginDir.resource)
        });
      }
    }
    return sources;
  }
  async _promptRemove(resource) {
    const { confirmed } = await this._dialogService.confirm({
      message: localize(13006, null),
      detail: localize(13007, null, resource.fsPath),
      primaryButton: localize(13008, null)
    });
    if (!confirmed) {
      return false;
    }
    try {
      await this._fileService.del(resource, { recursive: true, useTrash: true });
      this._enablementModel.remove(resource.toString());
      return true;
    } catch (error) {
      this._logService.error("[CopilotCliAgentPluginDiscovery] Failed to remove plugin", error);
      throw error;
    }
  }
};

CopilotCliAgentPluginDiscovery = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IPathService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IDialogService)
], CopilotCliAgentPluginDiscovery);

var epPlugins = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "chatPlugins",
  jsonSchema: {
    description: localize(13003, null),
    type: "array",
    items: {
      additionalProperties: false,
      type: "object",
      defaultSnippets: [{
        body: {
          path: "./relative/path/to/plugin/"
        }
      }],
      required: ["path"],
      properties: {
        path: {
          description: localize(13001, null),
          type: "string"
        },
        when: {
          description: localize(13002, null),
          type: "string"
        }
      }
    }
  }
});

var ExtensionAgentPluginDiscovery = class extends AbstractAgentPluginDiscovery {
  constructor(_commandService, _contextKeyService, _dialogService, fileService, pathService, logService, workspaceContextService) {
    super(fileService, pathService, logService, workspaceContextService);
    this._commandService = _commandService;
    this._contextKeyService = _contextKeyService;
    this._dialogService = _dialogService;
    this._extensionPlugins = /* @__PURE__ */ new Map();
    this._whenKeys = /* @__PURE__ */ new Set();
  }
  start(enablementModel) {
    this._enablementModel = enablementModel;
    const scheduler = this._register(new RunOnceScheduler(() => this._refreshPlugins(), 0));
    this._register(this._contextKeyService.onDidChangeContext((e4) => {
      if (e4.affectsSome(this._whenKeys)) {
        scheduler.schedule();
      }
    }));
    epPlugins.setHandler((_extensions, delta2) => {
      for (const ext of delta2.added) {
        for (const raw of ext.value) {
          if (!raw.path) {
            ext.collector.error(localize(13011, null, ext.description.identifier.value));
            continue;
          }
          const pluginUri = joinPath(ext.description.extensionLocation, raw.path);
          if (!isEqualOrParent2(pluginUri, ext.description.extensionLocation)) {
            ext.collector.error(localize(13009, null, ext.description.identifier.value, raw.path));
            continue;
          }
          let whenExpr;
          if (raw.when) {
            whenExpr = ContextKeyExpr.deserialize(raw.when);
            if (!whenExpr) {
              ext.collector.error(localize(13010, null, ext.description.identifier.value, raw.path, raw.when));
              continue;
            }
          }
          this._extensionPlugins.set(extensionPluginKey(ext.description.identifier, raw.path), { uri: pluginUri, when: whenExpr, extensionId: ext.description.identifier.value });
        }
      }
      for (const ext of delta2.removed) {
        for (const raw of ext.value) {
          this._extensionPlugins.delete(extensionPluginKey(ext.description.identifier, raw.path));
        }
      }
      this._rebuildWhenKeys();
      scheduler.schedule();
    });
    scheduler.schedule();
  }
  _rebuildWhenKeys() {
    this._whenKeys.clear();
    for (const { when } of this._extensionPlugins.values()) {
      if (when) {
        for (const key3 of when.keys()) {
          this._whenKeys.add(key3);
        }
      }
    }
  }
  async _discoverPluginSources() {
    const sources = [];
    for (const [, entry] of this._extensionPlugins) {
      if (entry.when && !this._contextKeyService.contextMatchesRules(entry.when)) {
        continue;
      }
      let stat;
      try {
        stat = await this._fileService.resolve(entry.uri);
      } catch {
        this._logService.debug(`[ExtensionAgentPluginDiscovery] Could not resolve extension plugin path: ${entry.uri.toString()}`);
        continue;
      }
      if (!stat.isDirectory) {
        this._logService.debug(`[ExtensionAgentPluginDiscovery] Extension plugin path is not a directory: ${entry.uri.toString()}`);
        continue;
      }
      sources.push({
        uri: stat.resource,
        fromMarketplace: void 0,
        remove: () => this._promptUninstallExtension(entry.extensionId)
      });
    }
    return sources;
  }
  async _promptUninstallExtension(extensionId) {
    const { confirmed } = await this._dialogService.confirm({
      message: localize(13012, null, extensionId)
    });
    if (confirmed) {
      await this._commandService.executeCommand("workbench.extensions.uninstallExtension", extensionId);
      return true;
    }
    return false;
  }
};

ExtensionAgentPluginDiscovery = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IPathService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IWorkspaceContextService)
], ExtensionAgentPluginDiscovery);

function extensionPluginKey(extensionId, path) {
  return `${extensionId.value}/${path}`;
}

var ChatPluginsDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.chatPlugins?.length;
  }
  render(manifest) {
    const contributions = manifest.contributes?.chatPlugins ?? [];
    if (!contributions.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(13004, null),
      localize(13005, null)
    ];
    const rows = contributions.map((d) => [
      d.path,
      d.when ?? "-"
    ]);
    return {
      data: { headers, rows },
      dispose: () => {
      }
    };
  }
};

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "chatPlugins",
  label: localize(13000, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ChatPluginsDataRenderer)
});
export { toAgentPluginHooks, resolveWorkspaceRoot, readDiscoveredAgentPlugins, setPolicyBlocked, extensionPluginKey, RULE_FILE_SUFFIXES, AgentPluginService, AbstractAgentPluginDiscovery, ConfiguredAgentPluginDiscovery, MarketplaceAgentPluginDiscovery, COPILOT_CLI_INSTALLED_PLUGINS_DIR, CopilotCliAgentPluginDiscovery, epPlugins, ExtensionAgentPluginDiscovery, ChatPluginsDataRenderer };
