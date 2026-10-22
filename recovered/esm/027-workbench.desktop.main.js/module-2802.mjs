// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/pluginInstallService.ts
import { CancellationError } from "./module-0004.mjs";
import { parseMarketplaceReference, parseMarketplaceReferences, readConfiguredMarketplaces } from "./module-1025.mjs";
import { localize } from "./module-0001.mjs";
import { posix, win32 } from "./module-0026.mjs";
import { untildify } from "./module-0711.mjs";
import { URI } from "./module-0032.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { IPluginMarketplaceService, hasSourceChanged } from "./module-1028.mjs";
import { Action } from "./module-0082.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentPluginRepositoryService } from "./module-1023.mjs";
import { IFileService } from "./module-0269.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ILogService } from "./module-0095.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IPathService } from "./module-0938.mjs";


// src/vs/workbench/contrib/chat/browser/pluginInstallService.ts
var PluginInstallService = class {
  constructor(_pluginRepositoryService, _pluginMarketplaceService, _fileService, _notificationService, _dialogService, _logService, _progressService, _commandService, _quickInputService, _configurationService, _pathService) {
    this._pluginRepositoryService = _pluginRepositoryService;
    this._pluginMarketplaceService = _pluginMarketplaceService;
    this._fileService = _fileService;
    this._notificationService = _notificationService;
    this._dialogService = _dialogService;
    this._logService = _logService;
    this._progressService = _progressService;
    this._commandService = _commandService;
    this._quickInputService = _quickInputService;
    this._configurationService = _configurationService;
    this._pathService = _pathService;
  }
  async installPlugin(plugin) {
    if (!await this._ensureMarketplaceTrusted(plugin)) {
      throw new CancellationError();
    }
    const kind = plugin.sourceDescriptor.kind;
    if (kind === "relativePath" /* RelativePath */) {
      return this._installRelativePathPlugin(plugin);
    }
    if (kind === "npm" /* Npm */ || kind === "pip" /* Pip */) {
      await this._installPackagePlugin(plugin);
      return;
    }
    return this._installGitPlugin(plugin);
  }
  validatePluginSource(source) {
    const reference = parseMarketplaceReference(source);
    if (reference || this._isLocalPathSource(source)) {
      return void 0;
    }
    return localize(11360, null, source);
  }
  async installPluginFromSource(source, options3) {
    const reference = parseMarketplaceReference(source);
    if (reference && reference.kind !== "localFileUri" /* LocalFileUri */) {
      return this._doInstallFromSource(reference, options3);
    }
    const local = await this._resolveLocalDirectorySource(source);
    if (local) {
      return this._doInstallFromLocalSource(local.reference, local.configPath, options3);
    }
    return {
      success: false,
      message: localize(11360, null, source)
    };
  }
  async _doInstallFromSource(reference, options3) {
    const sourceDescriptor = reference.kind === "githubShorthand" /* GitHubShorthand */ ? { kind: "github" /* GitHub */, repo: reference.githubRepo } : { kind: "url" /* GitUrl */, url: reference.cloneUrl };
    const tempPlugin = {
      name: reference.displayLabel,
      description: "",
      version: "",
      source: "",
      sourceDescriptor,
      marketplace: reference.displayLabel,
      marketplaceReference: reference,
      marketplaceType: "openPlugin" /* OpenPlugin */
    };
    if (!await this._ensureMarketplaceTrusted(tempPlugin)) {
      return { success: false };
    }
    let repoDir;
    try {
      repoDir = await this._pluginRepositoryService.ensurePluginSource(tempPlugin, {
        progressTitle: localize(11358, null, reference.displayLabel),
        failureLabel: reference.displayLabel,
        marketplaceType: "openPlugin" /* OpenPlugin */
      });
    } catch (e) {
      const detail2 = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        message: localize(11357, null, reference.displayLabel, detail2)
      };
    }
    const repoExists = await this._fileService.exists(repoDir);
    if (!repoExists) {
      return {
        success: false,
        message: localize(11356, null, reference.displayLabel)
      };
    }
    const discoveredPlugins = await this._pluginMarketplaceService.readPluginsFromDirectory(repoDir, reference);
    if (discoveredPlugins.length === 0) {
      const singlePlugin = await this._pluginMarketplaceService.readSinglePluginManifest(repoDir, reference);
      if (singlePlugin) {
        if (options3?.plugin && options3.plugin !== singlePlugin.name) {
          return {
            success: false,
            message: localize(11366, null, options3.plugin, reference.displayLabel)
          };
        }
        await this.installPlugin(singlePlugin);
        return options3?.plugin ? { success: true, matchedPlugin: singlePlugin } : { success: true };
      }
      void this._pluginRepositoryService.cleanupPluginSource(tempPlugin);
      return {
        success: false,
        message: localize(11363, null, reference.displayLabel)
      };
    }
    return this._installDiscoveredPlugins(reference, discoveredPlugins, options3);
  }
  /**
   * Installs a plugin from a local folder path (`file://` URI, absolute path,
   * or `~`-prefixed path). Inspects the directory to decide whether it is a
   * marketplace or a standalone plugin and writes to the appropriate setting:
   * - a marketplace is registered under `chat.plugins.marketplaces`,
   * - a standalone plugin path is registered under `chat.pluginLocations`.
   */
  async _doInstallFromLocalSource(reference, configPath, options3) {
    const repoDir = reference.localRepositoryUri;
    if (!repoDir) {
      return {
        success: false,
        message: localize(11360, null, reference.rawValue)
      };
    }
    let isDirectory = false;
    try {
      isDirectory = (await this._fileService.resolve(repoDir)).isDirectory;
    } catch {
    }
    if (!isDirectory) {
      return {
        success: false,
        message: localize(11362, null, repoDir.fsPath)
      };
    }
    const discoveredPlugins = await this._pluginMarketplaceService.readPluginsFromDirectory(repoDir, reference);
    if (discoveredPlugins.length > 0) {
      const tempPlugin = {
        name: reference.displayLabel,
        description: "",
        version: "",
        source: "",
        sourceDescriptor: { kind: "relativePath" /* RelativePath */, path: "" },
        marketplace: reference.displayLabel,
        marketplaceReference: reference,
        marketplaceType: "openPlugin" /* OpenPlugin */
      };
      if (!await this._ensureMarketplaceTrusted(tempPlugin)) {
        return { success: false };
      }
      return this._installDiscoveredPlugins(reference, discoveredPlugins, options3);
    }
    if (await this._pluginMarketplaceService.isPluginDirectory(repoDir)) {
      await this._addPluginLocationToConfig(configPath);
      return { success: true };
    }
    return {
      success: false,
      message: localize(11361, null, repoDir.fsPath)
    };
  }
  /**
   * Registers the marketplace and installs the discovered plugin(s): when a
   * specific plugin is targeted it installs that one, when there is exactly
   * one it installs it directly, and otherwise prompts the user to choose.
   */
  async _installDiscoveredPlugins(reference, discoveredPlugins, options3) {
    if (options3?.plugin) {
      const matchedPlugin = discoveredPlugins.find((p) => p.name === options3.plugin);
      if (!matchedPlugin) {
        return {
          success: false,
          message: localize(11366, null, options3.plugin, reference.displayLabel)
        };
      }
      await this._addMarketplaceToConfig(reference);
      await this.installPlugin(matchedPlugin);
      return { success: true, matchedPlugin };
    }
    if (discoveredPlugins.length === 1) {
      await this._addMarketplaceToConfig(reference);
      await this.installPlugin(discoveredPlugins[0]);
      return { success: true };
    }
    const picks = discoveredPlugins.map((p) => ({
      label: p.name,
      description: p.description,
      plugin: p
    }));
    const selected = await this._quickInputService.pick(picks, {
      placeHolder: localize(11368, null, reference.displayLabel),
      canPickMany: false
    });
    if (!selected) {
      return { success: false };
    }
    await this._addMarketplaceToConfig(reference);
    await this.installPlugin(selected.plugin);
    return { success: true };
  }
  _addMarketplaceToConfig(reference) {
    const { userValues, effectiveValues } = readConfiguredMarketplaces(this._configurationService);
    const existingRefs = parseMarketplaceReferences(effectiveValues);
    if (existingRefs.some((r2) => r2.canonicalId === reference.canonicalId)) {
      return;
    }
    return this._configurationService.updateValue("chat.plugins.marketplaces" /* PluginMarketplaces */, [...userValues, reference.rawValue]);
  }
  _addPluginLocationToConfig(pathKey) {
    const current = this._configurationService.inspect("chat.pluginLocations" /* PluginLocations */).userValue ?? {};
    if (current[pathKey] === true) {
      return;
    }
    return this._configurationService.updateValue("chat.pluginLocations" /* PluginLocations */, { ...current, [pathKey]: true });
  }
  /**
   * Returns `true` when the source string looks like a local folder path —
   * a `file://` URI, an absolute filesystem path, or a `~`-prefixed path.
   * This is a synchronous format check only; existence is verified later.
   */
  _isLocalPathSource(source) {
    const trimmed = source.trim();
    if (!trimmed) {
      return false;
    }
    if (/^file:\/\//i.test(trimmed)) {
      return true;
    }
    if (trimmed === "~" || trimmed.startsWith("~/") || trimmed.startsWith("~\\")) {
      return true;
    }
    return win32.isAbsolute(trimmed) || posix.isAbsolute(trimmed);
  }
  /**
   * Resolves a local folder source string to a {@link MarketplaceReferenceKind.LocalFileUri}
   * reference plus the path to persist in `chat.pluginLocations`. Tilde paths
   * are expanded against the user home. Returns `undefined` when the string
   * does not resolve to an absolute local folder.
   */
  async _resolveLocalDirectorySource(source) {
    const trimmed = source.trim();
    const parsed = parseMarketplaceReference(trimmed);
    if (parsed?.kind === "localFileUri" /* LocalFileUri */ && parsed.localRepositoryUri) {
      return { reference: parsed, configPath: parsed.localRepositoryUri.fsPath };
    }
    if (!this._isLocalPathSource(trimmed)) {
      return void 0;
    }
    let resolvedPath = trimmed;
    if (resolvedPath.startsWith("~")) {
      const userHome = await this._pathService.userHome();
      const home2 = userHome.scheme === "file" ? userHome.fsPath : userHome.path;
      resolvedPath = untildify(resolvedPath, home2);
    }
    if (!win32.isAbsolute(resolvedPath) && !posix.isAbsolute(resolvedPath)) {
      return void 0;
    }
    const reference = parseMarketplaceReference(URI.file(resolvedPath).toString());
    if (reference?.kind !== "localFileUri" /* LocalFileUri */) {
      return void 0;
    }
    return { reference, configPath: trimmed };
  }
  async updatePlugin(plugin, silent) {
    if (this._pluginMarketplaceService.isStrictMarketplacePolicyActive() && !this._pluginMarketplaceService.isMarketplaceTrusted(plugin.marketplaceReference)) {
      this._notificationService.notify({
        severity: Severity2.Warning,
        message: localize(11371, null, plugin.marketplaceReference.displayLabel)
      });
      return false;
    }
    const kind = plugin.sourceDescriptor.kind;
    if (kind === "npm" /* Npm */ || kind === "pip" /* Pip */) {
      return this._installPackagePlugin(plugin, silent);
    }
    return this._pluginRepositoryService.updatePluginSource(plugin, {
      pluginName: plugin.name,
      failureLabel: plugin.name,
      marketplaceType: plugin.marketplaceType
    });
  }
  async updateAllPlugins(options3, token) {
    const allInstalled = this._pluginMarketplaceService.installedPlugins.get();
    const installed = allInstalled.filter(
      (entry) => (!options3.marketplaceIds || options3.marketplaceIds.has(entry.plugin.marketplaceReference.canonicalId)) && (!options3.automatic || this._pluginMarketplaceService.isMarketplaceAutoUpdateEnabled(entry.plugin.marketplaceReference))
    );
    if (installed.length === 0) {
      return { updatedNames: [], failedNames: [] };
    }
    const updatedNames = [];
    const failedNames = [];
    const doUpdate = async () => {
      const gitTasks = [];
      const packagePlugins = [];
      const seenMarketplaces = /* @__PURE__ */ new Set();
      for (const entry of installed) {
        const ref = entry.plugin.marketplaceReference;
        if (seenMarketplaces.has(ref.canonicalId)) {
          continue;
        }
        seenMarketplaces.add(ref.canonicalId);
        if (this._pluginMarketplaceService.isStrictMarketplacePolicyActive() && !this._pluginMarketplaceService.isMarketplaceTrusted(ref)) {
          failedNames.push(ref.displayLabel);
          continue;
        }
        gitTasks.push((async () => {
          if (token.isCancellationRequested) {
            return;
          }
          try {
            const changed = await this._pluginRepositoryService.pullRepository(ref, {
              pluginName: ref.displayLabel,
              failureLabel: ref.displayLabel,
              marketplaceType: entry.plugin.marketplaceType,
              silent: options3.silent
            });
            if (changed) {
              updatedNames.push(ref.displayLabel);
            }
          } catch (err) {
            this._logService.error(`[PluginInstallService] Failed to pull marketplace '${ref.displayLabel}':`, err);
            failedNames.push(ref.displayLabel);
          }
        })());
      }
      await Promise.all(gitTasks);
      const marketplaceIds = new Set(installed.map((entry) => entry.plugin.marketplaceReference.canonicalId));
      const marketplacePlugins = await this._pluginMarketplaceService.fetchMarketplacePlugins(token, marketplaceIds);
      const marketplaceByKey = /* @__PURE__ */ new Map();
      for (const mp of marketplacePlugins) {
        marketplaceByKey.set(`${mp.marketplaceReference.canonicalId}::${mp.name}`, mp);
      }
      const independentGitTasks = [];
      for (const entry of installed) {
        if (entry.plugin.sourceDescriptor.kind === "relativePath" /* RelativePath */) {
          continue;
        }
        const livePlugin = marketplaceByKey.get(`${entry.plugin.marketplaceReference.canonicalId}::${entry.plugin.name}`);
        if (!livePlugin || !hasSourceChanged(entry.plugin.sourceDescriptor, livePlugin.sourceDescriptor)) {
          continue;
        }
        const desc = livePlugin.sourceDescriptor;
        if (desc.kind === "npm" /* Npm */ || desc.kind === "pip" /* Pip */) {
          if (!options3.force && !desc.version) {
            continue;
          }
          packagePlugins.push({ installed: entry.plugin, marketplace: livePlugin });
          continue;
        }
        independentGitTasks.push((async () => {
          if (token.isCancellationRequested) {
            return;
          }
          try {
            const changed = await this._pluginRepositoryService.updatePluginSource(livePlugin, {
              pluginName: livePlugin.name,
              failureLabel: livePlugin.name,
              marketplaceType: livePlugin.marketplaceType,
              silent: options3.silent
            });
            if (changed) {
              updatedNames.push(livePlugin.name);
              this._pluginMarketplaceService.addInstalledPlugin(entry.pluginUri, livePlugin);
            }
          } catch (err) {
            this._logService.error(`[PluginInstallService] Failed to update plugin '${livePlugin.name}':`, err);
            failedNames.push(livePlugin.name);
          }
        })());
      }
      await Promise.all(independentGitTasks);
      for (const { installed: _installed, marketplace } of packagePlugins) {
        if (token.isCancellationRequested) {
          return;
        }
        try {
          const changed = await this.updatePlugin(marketplace, options3?.silent);
          if (changed) {
            updatedNames.push(marketplace.name);
            const pluginUri = this._pluginRepositoryService.getPluginSourceInstallUri(marketplace.sourceDescriptor);
            this._pluginMarketplaceService.addInstalledPlugin(pluginUri, marketplace);
          }
        } catch (err) {
          this._logService.error(`[PluginInstallService] Failed to update plugin '${marketplace.name}':`, err);
          failedNames.push(marketplace.name);
        }
      }
    };
    if (options3.silent) {
      await doUpdate();
    } else {
      await this._progressService.withProgress(
        {
          location: 15 /* Notification */,
          title: localize(11377, null)
        },
        doUpdate
      );
    }
    if (failedNames.length > 0) {
      this._notificationService.notify({
        severity: Severity2.Error,
        message: localize(11375, null, failedNames.join(", ")),
        actions: {
          primary: [new Action("showGitOutput", localize(11369, null), void 0, true, () => {
            this._commandService.executeCommand("git.showOutput");
          })]
        }
      });
    } else if (updatedNames.length > 0) {
      if (!options3.automatic) {
        this._pluginMarketplaceService.clearUpdatesAvailable(options3.marketplaceIds);
      }
      this._notificationService.notify({
        severity: Severity2.Info,
        message: localize(11376, null, updatedNames.join(", "))
      });
    } else if (!token.isCancellationRequested) {
      if (!options3.automatic) {
        this._pluginMarketplaceService.clearUpdatesAvailable(options3.marketplaceIds);
      }
    }
    return { updatedNames, failedNames };
  }
  getPluginInstallUri(plugin) {
    return this._pluginRepositoryService.getPluginInstallUri(plugin);
  }
  // --- Trust gate -------------------------------------------------------------
  async _ensureMarketplaceTrusted(plugin) {
    if (this._pluginMarketplaceService.isMarketplaceTrusted(plugin.marketplaceReference)) {
      return true;
    }
    if (this._pluginMarketplaceService.isStrictMarketplacePolicyActive()) {
      this._notificationService.notify({
        severity: Severity2.Warning,
        message: localize(11370, null, plugin.marketplaceReference.displayLabel),
        actions: {
          primary: [new Action("chat.plugins.viewMarketplacePolicy", localize(11378, null), void 0, true, () => {
            return this._commandService.executeCommand("workbench.action.openSettings", "chat.plugins.strictMarketplaces" /* StrictMarketplaces */);
          })]
        }
      });
      return false;
    }
    const { confirmed } = await this._dialogService.confirm({
      type: "question",
      message: localize(11373, null, plugin.marketplaceReference.displayLabel),
      detail: localize(11374, null, plugin.marketplaceReference.rawValue),
      primaryButton: localize(11372, null),
      custom: {
        icon: Codicon.shield
      }
    });
    if (!confirmed) {
      return false;
    }
    this._pluginMarketplaceService.trustMarketplace(plugin.marketplaceReference);
    return true;
  }
  // --- Relative-path source (existing git-based flow) -----------------------
  async _installRelativePathPlugin(plugin) {
    try {
      await this._pluginRepositoryService.ensureRepository(plugin.marketplaceReference, {
        progressTitle: localize(11359, null, plugin.name),
        failureLabel: plugin.name,
        marketplaceType: plugin.marketplaceType
      });
    } catch {
      return;
    }
    let pluginDir;
    try {
      pluginDir = this._pluginRepositoryService.getPluginInstallUri(plugin);
    } catch {
      this._notificationService.notify({
        severity: Severity2.Error,
        message: localize(11364, null, plugin.source, plugin.marketplace)
      });
      return;
    }
    const pluginExists = await this._fileService.exists(pluginDir);
    if (!pluginExists) {
      this._notificationService.notify({
        severity: Severity2.Error,
        message: localize(11365, null, plugin.source, plugin.marketplace)
      });
      return;
    }
    this._pluginMarketplaceService.addInstalledPlugin(pluginDir, plugin);
  }
  // --- GitHub / Git URL source (independent clone) --------------------------
  async _installGitPlugin(plugin) {
    const repo = this._pluginRepositoryService.getPluginSource(plugin.sourceDescriptor.kind);
    let pluginDir;
    try {
      pluginDir = await this._pluginRepositoryService.ensurePluginSource(plugin, {
        progressTitle: localize(11359, null, plugin.name),
        failureLabel: plugin.name,
        marketplaceType: plugin.marketplaceType
      });
    } catch {
      return;
    }
    const pluginExists = await this._fileService.exists(pluginDir);
    if (!pluginExists) {
      this._notificationService.notify({
        severity: Severity2.Error,
        message: localize(11367, null, repo.getLabel(plugin.sourceDescriptor))
      });
      return;
    }
    this._pluginMarketplaceService.addInstalledPlugin(pluginDir, plugin);
  }
  // --- Package-manager sources (npm / pip) ----------------------------------
  async _installPackagePlugin(plugin, silent) {
    const repo = this._pluginRepositoryService.getPluginSource(plugin.sourceDescriptor.kind);
    if (!repo.runInstall) {
      this._logService.error(`[PluginInstallService] Expected package repository for kind '${plugin.sourceDescriptor.kind}'`);
      return false;
    }
    const installDir = await this._pluginRepositoryService.ensurePluginSource(plugin);
    const pluginDir = this._pluginRepositoryService.getPluginSourceInstallUri(plugin.sourceDescriptor);
    const result = await repo.runInstall(installDir, pluginDir, plugin, { silent });
    if (!result) {
      return false;
    }
    this._pluginMarketplaceService.addInstalledPlugin(result.pluginDir, plugin);
    return true;
  }
};

PluginInstallService = __decorateClass([
  __decorateParam(0, IAgentPluginRepositoryService),
  __decorateParam(1, IPluginMarketplaceService),
  __decorateParam(2, IFileService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IProgressService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IQuickInputService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IPathService)
], PluginInstallService);
export { PluginInstallService };
