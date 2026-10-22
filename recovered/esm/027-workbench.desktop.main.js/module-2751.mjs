// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentPluginRepositoryService.ts
import { Lazy } from "./module-0028.mjs";
import { SequencerByKey } from "./module-0036.mjs";
import { dirname2, isEqual2, isEqualOrParent2, joinPath } from "./module-0034.mjs";
import { GitHubPluginSource, GitUrlPluginSource, NpmPluginSource, PipPluginSource, RelativePathPluginSource } from "./module-2750.mjs";
import { localize } from "./module-0001.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { Action } from "./module-0082.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { revive } from "./module-0265.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IFileService } from "./module-0269.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { IPluginGitService } from "./module-2741.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";


// src/vs/workbench/contrib/chat/browser/agentPluginRepositoryService.ts
var MARKETPLACE_INDEX_STORAGE_KEY = "chat.plugins.marketplaces.index.v1";

var SHA_REF_PATTERN = /^[0-9a-f]{40}$/i;

var AgentPluginRepositoryService = class {
  constructor(_commandService, environmentService, _fileService, instantiationService, _logService, _notificationService, _pluginGit, _progressService, _storageService, userDataProfileService) {
    this._commandService = _commandService;
    this._fileService = _fileService;
    this._logService = _logService;
    this._notificationService = _notificationService;
    this._pluginGit = _pluginGit;
    this._progressService = _progressService;
    this._storageService = _storageService;
    this._marketplaceIndex = new Lazy(() => this._loadMarketplaceIndex());
    this._cloneSequencer = new SequencerByKey();
    this.agentPluginsHome = userDataProfileService.currentProfile.agentPluginsHome;
    const legacyCacheRoot = joinPath(environmentService.cacheHome, "agentPlugins");
    const oldCacheRoot = environmentService.cacheHome.scheme === "file" ? legacyCacheRoot : this.agentPluginsHome;
    this._cacheRoot = this.agentPluginsHome;
    if (!isEqual2(oldCacheRoot, this.agentPluginsHome)) {
      this._migrationDone = this._migrateDirectory(oldCacheRoot);
    } else {
      this._migrationDone = Promise.resolve();
    }
    this._pluginSources = /* @__PURE__ */ new Map([
      ["relativePath" /* RelativePath */, new RelativePathPluginSource()],
      ["github" /* GitHub */, instantiationService.createInstance(GitHubPluginSource)],
      ["url" /* GitUrl */, instantiationService.createInstance(GitUrlPluginSource)],
      ["npm" /* Npm */, instantiationService.createInstance(NpmPluginSource)],
      ["pip" /* Pip */, instantiationService.createInstance(PipPluginSource)]
    ]);
  }
  getPluginSource(kind) {
    const repo = this._pluginSources.get(kind);
    if (!repo) {
      throw new Error(`No source repository registered for kind '${kind}'`);
    }
    return repo;
  }
  getRepositoryUri(marketplace, marketplaceType) {
    if (marketplace.kind === "localFileUri" /* LocalFileUri */ && marketplace.localRepositoryUri) {
      return marketplace.localRepositoryUri;
    }
    const indexed = this._marketplaceIndex.value.get(marketplace.canonicalId);
    if (indexed?.repositoryUri) {
      return indexed.repositoryUri;
    }
    return this._getRepoCacheDirForReference(marketplace);
  }
  getPluginInstallUri(plugin) {
    if (plugin.sourceDescriptor.kind !== "relativePath" /* RelativePath */) {
      return this.getPluginSourceInstallUri(plugin.sourceDescriptor);
    }
    const repoDir = this.getRepositoryUri(plugin.marketplaceReference, plugin.marketplaceType);
    const normalizedSource = plugin.source.trim().replace(/^\.?\/+|\/+$/g, "");
    const pluginDir = normalizedSource ? joinPath(repoDir, normalizedSource) : repoDir;
    if (!isEqualOrParent2(pluginDir, repoDir)) {
      throw new Error(`Invalid plugin source path '${plugin.source}'`);
    }
    return pluginDir;
  }
  async ensureRepository(marketplace, options3) {
    await this._migrationDone;
    const repoDir = this.getRepositoryUri(marketplace, options3?.marketplaceType);
    return this._cloneSequencer.queue(repoDir.fsPath, async () => {
      const repoExists = await this._fileService.exists(repoDir);
      if (repoExists) {
        const refreshedAt = this._isRefreshDue(marketplace, options3) ? await this._refreshRepository(repoDir, marketplace, options3?.token) : void 0;
        this._updateMarketplaceIndex(marketplace, repoDir, options3?.marketplaceType, refreshedAt);
        return repoDir;
      }
      if (marketplace.kind === "localFileUri" /* LocalFileUri */) {
        throw new Error(`Local marketplace repository does not exist: ${repoDir.fsPath}`);
      }
      const progressTitle = options3?.progressTitle ?? localize(8903, null, marketplace.displayLabel);
      const failureLabel = options3?.failureLabel ?? marketplace.displayLabel;
      await this._cloneRepository(repoDir, marketplace.cloneUrl, progressTitle, failureLabel, marketplace.ref, options3?.token);
      this._updateMarketplaceIndex(marketplace, repoDir, options3?.marketplaceType, Date.now());
      return repoDir;
    });
  }
  /**
   * Whether an existing clone is stale enough to warrant a silent pull.
   * Local (user-owned) directories and SHA-pinned refs are never refreshed.
   */
  _isRefreshDue(marketplace, options3) {
    const refreshIfOlderThanMs = options3?.refreshIfOlderThanMs;
    if (refreshIfOlderThanMs === void 0 || options3?.token?.isCancellationRequested) {
      return false;
    }
    if (marketplace.kind === "localFileUri" /* LocalFileUri */ || SHA_REF_PATTERN.test(marketplace.ref ?? "")) {
      return false;
    }
    const lastRefreshedAt = this._marketplaceIndex.value.get(marketplace.canonicalId)?.lastRefreshedAt;
    return lastRefreshedAt === void 0 || Date.now() - lastRefreshedAt >= refreshIfOlderThanMs;
  }
  /**
   * Silently pulls an existing clone, never throwing — a marketplace that
   * cannot be refreshed still serves its cached contents.
   *
   * Returns the timestamp to record as the last refresh attempt, or
   * `undefined` when the pull was cancelled so that cancellation does not
   * suppress the next attempt. Genuine failures are recorded, otherwise an
   * unreachable remote would be retried on every single fetch.
   */
  async _refreshRepository(repoDir, marketplace, token) {
    try {
      await this._pluginGit.pull(repoDir, token);
    } catch (err) {
      if (isCancellationError(err)) {
        return void 0;
      }
      this._logService.debug(`[AgentPluginRepositoryService] Failed to refresh ${marketplace.displayLabel}:`, err);
    }
    return token?.isCancellationRequested ? void 0 : Date.now();
  }
  async pullRepository(marketplace, options3) {
    const repoDir = this.getRepositoryUri(marketplace, options3?.marketplaceType);
    const repoExists = await this._fileService.exists(repoDir);
    if (!repoExists) {
      this._logService.warn(`[AgentPluginRepositoryService] Cannot update plugin '${options3?.pluginName ?? marketplace.displayLabel}': repository not cloned`);
      return false;
    }
    const updateLabel = options3?.pluginName ?? marketplace.displayLabel;
    try {
      const changed = options3?.silent ? await this._pluginGit.pull(repoDir) : await this._pullWithProgress(repoDir, updateLabel);
      this._updateMarketplaceIndex(marketplace, repoDir, options3?.marketplaceType, Date.now());
      return changed;
    } catch (err) {
      this._logService.error(`[AgentPluginRepositoryService] Failed to update ${marketplace.displayLabel}:`, err);
      if (!options3?.silent) {
        const primaryActions = [new Action("showGitOutput", localize(8910, null), void 0, true, () => this._commandService.executeCommand("git.showOutput"))];
        const failureLabel = options3?.failureLabel ?? updateLabel;
        if (marketplace.kind !== "localFileUri" /* LocalFileUri */) {
          primaryActions.push(new Action("purgeAndRecloneMarketplace", localize(8905, null), void 0, true, () => this._purgeAndRecloneMarketplace(marketplace, options3?.marketplaceType, failureLabel)));
        }
        this._notificationService.notify({
          severity: Severity2.Error,
          message: localize(8904, null, failureLabel, err?.message ?? String(err)),
          actions: {
            primary: primaryActions
          }
        });
      }
      throw err;
    }
  }
  /** Pulls a clone behind a cancellable progress notification. */
  async _pullWithProgress(repoDir, updateLabel) {
    const cts = new CancellationTokenSource();
    try {
      return await this._progressService.withProgress(
        {
          location: 15 /* Notification */,
          title: localize(8911, null, updateLabel),
          cancellable: true
        },
        () => this._pluginGit.pull(repoDir, cts.token),
        () => cts.dispose(true)
      );
    } finally {
      cts.dispose();
    }
  }
  async _purgeAndRecloneMarketplace(marketplace, marketplaceType, label3) {
    if (marketplace.kind === "localFileUri" /* LocalFileUri */) {
      return;
    }
    const repoDir = this.getRepositoryUri(marketplace, marketplaceType);
    try {
      await this._progressService.withProgress(
        {
          location: 15 /* Notification */,
          title: localize(8908, null, marketplace.displayLabel),
          cancellable: false
        },
        async () => {
          const exists = await this._fileService.exists(repoDir);
          if (exists) {
            await this._fileService.del(repoDir, { recursive: true, useTrash: false });
          }
          await this.ensureRepository(marketplace, {
            marketplaceType,
            progressTitle: localize(8909, null, marketplace.displayLabel),
            failureLabel: label3
          });
        }
      );
      this._notificationService.info(localize(8907, null, marketplace.displayLabel));
    } catch (err) {
      this._notificationService.notify({
        severity: Severity2.Error,
        message: localize(8906, null, marketplace.displayLabel, err?.message ?? String(err)),
        actions: {
          primary: [new Action("showGitOutput", localize(8910, null), void 0, true, () => {
            return this._commandService.executeCommand("git.showOutput");
          })]
        }
      });
    }
  }
  _getRepoCacheDirForReference(reference) {
    return joinPath(this._cacheRoot, ...reference.cacheSegments);
  }
  _loadMarketplaceIndex() {
    const result = /* @__PURE__ */ new Map();
    const stored = this._storageService.getObject(MARKETPLACE_INDEX_STORAGE_KEY, -1 /* APPLICATION */);
    if (!stored) {
      return result;
    }
    const revived = revive(stored);
    for (const [canonicalId, entry] of Object.entries(revived)) {
      if (!entry || !entry.repositoryUri) {
        continue;
      }
      result.set(canonicalId, {
        repositoryUri: entry.repositoryUri,
        marketplaceType: entry.marketplaceType,
        lastRefreshedAt: entry.lastRefreshedAt
      });
    }
    return result;
  }
  _updateMarketplaceIndex(marketplace, repositoryUri, marketplaceType, lastRefreshedAt) {
    if (marketplace.kind === "localFileUri" /* LocalFileUri */) {
      return;
    }
    const previous = this._marketplaceIndex.value.get(marketplace.canonicalId);
    const updatedLastRefreshedAt = lastRefreshedAt ?? previous?.lastRefreshedAt;
    if (previous && previous.repositoryUri.toString() === repositoryUri.toString() && previous.marketplaceType === marketplaceType && previous.lastRefreshedAt === updatedLastRefreshedAt) {
      return;
    }
    this._marketplaceIndex.value.set(marketplace.canonicalId, { repositoryUri, marketplaceType, lastRefreshedAt: updatedLastRefreshedAt });
    this._saveMarketplaceIndex();
  }
  _saveMarketplaceIndex() {
    const serialized = {};
    for (const [canonicalId, entry] of this._marketplaceIndex.value) {
      serialized[canonicalId] = JSON.parse(JSON.stringify({
        repositoryUri: entry.repositoryUri,
        marketplaceType: entry.marketplaceType,
        lastRefreshedAt: entry.lastRefreshedAt
      }));
    }
    if (Object.keys(serialized).length === 0) {
      this._storageService.remove(MARKETPLACE_INDEX_STORAGE_KEY, -1 /* APPLICATION */);
      return;
    }
    this._storageService.store(MARKETPLACE_INDEX_STORAGE_KEY, JSON.stringify(serialized), -1 /* APPLICATION */, 1 /* MACHINE */);
  }
  async _cloneRepository(repoDir, cloneUrl, progressTitle, failureLabel, ref, token) {
    const cts = new CancellationTokenSource();
    const tokenListener = token?.onCancellationRequested(() => cts.cancel());
    try {
      await this._progressService.withProgress(
        {
          location: 15 /* Notification */,
          title: progressTitle,
          cancellable: true
        },
        async () => {
          await this._fileService.createFolder(dirname2(repoDir));
          await this._pluginGit.cloneRepository(cloneUrl, repoDir, ref, cts.token);
        },
        () => cts.dispose(true)
      );
    } catch (err) {
      this._logService.error(`[AgentPluginRepositoryService] Failed to clone ${cloneUrl}:`, err);
      if (!isCancellationError(err)) {
        this._notificationService.notify({
          severity: Severity2.Error,
          message: localize(8902, null, failureLabel, err?.message ?? String(err)),
          actions: {
            primary: [new Action("showGitOutput", localize(8910, null), void 0, true, () => {
              this._commandService.executeCommand("git.showOutput");
            })]
          }
        });
      }
      throw err;
    } finally {
      tokenListener?.dispose();
      cts.dispose();
    }
  }
  getPluginSourceInstallUri(sourceDescriptor) {
    return this.getPluginSource(sourceDescriptor.kind).getInstallUri(this._cacheRoot, sourceDescriptor);
  }
  async ensurePluginSource(plugin, options3) {
    await this._migrationDone;
    const repo = this.getPluginSource(plugin.sourceDescriptor.kind);
    if (plugin.sourceDescriptor.kind === "relativePath" /* RelativePath */) {
      return this.ensureRepository(plugin.marketplaceReference, options3);
    }
    return repo.ensure(this._cacheRoot, plugin, options3);
  }
  async updatePluginSource(plugin, options3) {
    const repo = this.getPluginSource(plugin.sourceDescriptor.kind);
    if (plugin.sourceDescriptor.kind === "relativePath" /* RelativePath */) {
      return this.pullRepository(plugin.marketplaceReference, options3);
    }
    return repo.update(this._cacheRoot, plugin, options3);
  }
  async fetchRepository(marketplace) {
    const repoDir = this.getRepositoryUri(marketplace);
    const repoExists = await this._fileService.exists(repoDir);
    if (!repoExists) {
      return false;
    }
    try {
      await this._pluginGit.fetchRepository(repoDir);
      const behindCount = await this._pluginGit.revListCount(repoDir, "HEAD", "@{u}");
      return behindCount > 0;
    } catch (err) {
      this._logService.debug(`[AgentPluginRepositoryService] Silent fetch failed for ${marketplace.displayLabel}:`, err);
      return false;
    }
  }
  async cleanupPluginSource(plugin, otherInstalledDescriptors) {
    const repo = this.getPluginSource(plugin.sourceDescriptor.kind);
    const cleanupDir = repo.getCleanupTarget(this._cacheRoot, plugin.sourceDescriptor);
    if (!cleanupDir) {
      return;
    }
    if (otherInstalledDescriptors) {
      const shared = otherInstalledDescriptors.some((other) => {
        const otherRepo = this.getPluginSource(other.kind);
        const otherTarget = otherRepo.getCleanupTarget(this._cacheRoot, other);
        return otherTarget && isEqual2(otherTarget, cleanupDir);
      });
      if (shared) {
        this._logService.info(`[${plugin.sourceDescriptor.kind}] Skipping cleanup of shared cache: ${cleanupDir.toString()}`);
        return;
      }
    }
    try {
      const exists = await this._fileService.exists(cleanupDir);
      if (exists) {
        await this._fileService.del(cleanupDir, { recursive: true });
        this._logService.info(`[${plugin.sourceDescriptor.kind}] Removed plugin cache: ${cleanupDir.toString()}`);
      }
    } catch (err) {
      this._logService.warn(`[${plugin.sourceDescriptor.kind}] Failed to remove plugin cache '${cleanupDir.toString()}':`, err);
    }
    try {
      await this._pruneEmptyParents(cleanupDir);
    } catch (err) {
      this._logService.warn(`[${plugin.sourceDescriptor.kind}] Failed to cleanup plugin source:`, err);
    }
  }
  /**
   * Walk from {@link child}'s parent toward {@link _cacheRoot}, removing
   * each directory that is empty. Stops as soon as a non-empty directory
   * is found or the cache root is reached. Only operates on descendants
   * of the cache root — returns immediately for paths outside it.
   */
  async _pruneEmptyParents(child) {
    if (!isEqualOrParent2(child, this._cacheRoot)) {
      return;
    }
    let current = dirname2(child);
    while (isEqualOrParent2(current, this._cacheRoot) && !isEqual2(current, this._cacheRoot)) {
      try {
        const stat = await this._fileService.resolve(current);
        if (stat.children && stat.children.length > 0) {
          break;
        }
        await this._fileService.del(current);
      } catch {
        break;
      }
      current = dirname2(current);
    }
  }
  /**
   * One-time migration of plugin files from the old internal cache
   * directory (`{cacheHome}/agentPlugins/`) to the new well-known
   * location (`~/{dataFolderName}/agent-plugins/`).
   */
  async _migrateDirectory(oldCacheRoot) {
    try {
      const oldExists = await this._fileService.exists(oldCacheRoot);
      if (!oldExists) {
        return;
      }
      const newExists = await this._fileService.exists(this.agentPluginsHome);
      if (newExists) {
        this._logService.info("[AgentPluginRepositoryService] Both old and new agent-plugins directories exist; skipping directory migration");
        return;
      }
      this._logService.info(`[AgentPluginRepositoryService] Migrating agent plugins from ${oldCacheRoot.toString()} to ${this.agentPluginsHome.toString()}`);
      await this._fileService.move(oldCacheRoot, this.agentPluginsHome, false);
      this._storageService.remove(MARKETPLACE_INDEX_STORAGE_KEY, -1 /* APPLICATION */);
      this._marketplaceIndex.value.clear();
    } catch (error) {
      this._logService.error("[AgentPluginRepositoryService] Directory migration failed", error);
    }
  }
};

AgentPluginRepositoryService = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILogService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IPluginGitService),
  __decorateParam(7, IProgressService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IUserDataProfileService)
], AgentPluginRepositoryService);
export { MARKETPLACE_INDEX_STORAGE_KEY, SHA_REF_PATTERN, AgentPluginRepositoryService };
