// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/pluginSources.ts
import { isWindows } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { dirname2, isEqualOrParent2, joinPath } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { IPluginGitService } from "./module-2741.mjs";
import { IProgressService } from "./module-0446.mjs";
import { URI } from "./module-0032.mjs";
import { Action } from "./module-0082.mjs";
import { Event2 } from "./module-0017.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { timeout } from "./module-0036.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ITerminalService } from "./module-1149.mjs";


// src/vs/workbench/contrib/chat/browser/pluginSources.ts
function sanitizeCacheSegment(name) {
  return name.replace(/[\\/:*?"<>|]/g, "_");
}

function gitRevisionCacheSuffix(ref, sha) {
  if (sha) {
    return [`sha_${sanitizeCacheSegment(sha)}`];
  }
  if (ref) {
    return [`ref_${sanitizeCacheSegment(ref)}`];
  }
  return [];
}

function shellEscapeArg(value2) {
  if (isWindows) {
    return `"${value2.replace(/[`$"]/g, "`$&")}"`;
  }
  return `'${value2.replace(/'/g, `'\\''`)}'`;
}

function formatShellCommand(args2) {
  const [command4, ...rest] = args2;
  return [command4, ...rest.map((arg) => shellEscapeArg(arg))].join(" ");
}

var AbstractGitPluginSource = class {
  constructor(_commandService, _fileService, _logService, _notificationService, _pluginGit, _progressService) {
    this._commandService = _commandService;
    this._fileService = _fileService;
    this._logService = _logService;
    this._notificationService = _notificationService;
    this._pluginGit = _pluginGit;
    this._progressService = _progressService;
  }
  getCleanupTarget(cacheRoot, descriptor) {
    return this._getRepoDir(cacheRoot, descriptor);
  }
  /**
   * Returns the on-disk directory of the cloned repository. Subclasses that
   * support a sub-path within a repository should override this to return the
   * repository root, while {@link getInstallUri} returns root + sub-path.
   */
  _getRepoDir(cacheRoot, descriptor) {
    return this.getInstallUri(cacheRoot, descriptor);
  }
  async ensure(cacheRoot, plugin, options3) {
    const descriptor = plugin.sourceDescriptor;
    const repoDir = this._getRepoDir(cacheRoot, descriptor);
    const repoExists = await this._fileService.exists(repoDir);
    const label3 = this._displayLabel(descriptor);
    if (repoExists) {
      await this._checkoutRevision(repoDir, descriptor, options3?.failureLabel ?? label3);
      return this.getInstallUri(cacheRoot, descriptor);
    }
    const progressTitle = options3?.progressTitle ?? localize(11381, null, label3);
    const failureLabel = options3?.failureLabel ?? label3;
    const ref = descriptor.ref;
    await this._cloneRepository(repoDir, this._cloneUrl(descriptor), progressTitle, failureLabel, ref);
    await this._checkoutRevision(repoDir, descriptor, failureLabel);
    return this.getInstallUri(cacheRoot, descriptor);
  }
  async update(cacheRoot, plugin, options3) {
    const descriptor = plugin.sourceDescriptor;
    const repoDir = this._getRepoDir(cacheRoot, descriptor);
    const repoExists = await this._fileService.exists(repoDir);
    if (!repoExists) {
      this._logService.warn(`[${this.kind}] Cannot update plugin '${options3?.pluginName ?? plugin.name}': source repository not cloned`);
      return false;
    }
    const updateLabel = options3?.pluginName ?? plugin.name;
    const failureLabel = options3?.failureLabel ?? updateLabel;
    try {
      const doUpdate = async (cts2) => {
        const git = descriptor;
        let changed;
        if (git.sha) {
          const headBefore = await this._pluginGit.revParse(repoDir, "HEAD").catch(() => void 0);
          await this._pluginGit.fetch(repoDir, cts2?.token);
          await this._checkoutRevision(repoDir, descriptor, failureLabel, cts2?.token);
          const headAfter = await this._pluginGit.revParse(repoDir, "HEAD").catch(() => void 0);
          changed = headBefore !== headAfter;
        } else {
          changed = await this._pluginGit.pull(repoDir, cts2?.token);
          await this._checkoutRevision(repoDir, descriptor, failureLabel, cts2?.token);
        }
        return changed;
      };
      if (options3?.silent) {
        return await doUpdate();
      }
      const cts = new CancellationTokenSource();
      try {
        return await this._progressService.withProgress(
          {
            location: 15 /* Notification */,
            title: localize(11393, null, updateLabel),
            cancellable: true
          },
          () => doUpdate(cts),
          () => cts.dispose(true)
        );
      } finally {
        cts.dispose();
      }
    } catch (err) {
      this._logService.error(`[${this.kind}] Failed to update plugin source '${updateLabel}':`, err);
      if (!options3?.silent) {
        this._notificationService.notify({
          severity: Severity2.Error,
          message: localize(11390, null, failureLabel, err?.message ?? String(err))
        });
      }
      throw err;
    }
  }
  // -- internal helpers ---
  async _cloneRepository(repoDir, cloneUrl, progressTitle, failureLabel, ref) {
    const cts = new CancellationTokenSource();
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
      this._logService.error(`[${this.kind}] Failed to clone ${cloneUrl}:`, err);
      this._notificationService.notify({
        severity: Severity2.Error,
        message: localize(11380, null, failureLabel, err?.message ?? String(err))
      });
      throw err;
    } finally {
      cts.dispose();
    }
  }
  async _checkoutRevision(repoDir, descriptor, failureLabel, token) {
    const git = descriptor;
    if (!git.sha && !git.ref) {
      return;
    }
    try {
      if (git.sha) {
        await this._pluginGit.checkoutCommit(repoDir, git.sha, token);
        return;
      }
      await this._pluginGit.checkout(repoDir, git.ref, void 0, token);
    } catch (err) {
      this._logService.error(`[${this.kind}] Failed to checkout revision for '${failureLabel}':`, err);
      this._notificationService.notify({
        severity: Severity2.Error,
        message: localize(11379, null, failureLabel, err?.message ?? String(err))
      });
      throw err;
    }
  }
};

AbstractGitPluginSource = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILogService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IPluginGitService),
  __decorateParam(5, IProgressService)
], AbstractGitPluginSource);

var RelativePathPluginSource = class {
  constructor() {
    this.kind = "relativePath" /* RelativePath */;
  }
  getInstallUri(_cacheRoot, _descriptor) {
    throw new Error("Use getPluginInstallUri() for relative-path sources");
  }
  async ensure(_cacheRoot, _plugin, _options) {
    throw new Error("Use ensureRepository() for relative-path sources");
  }
  async update(_cacheRoot, _plugin, _options) {
    throw new Error("Use pullRepository() for relative-path sources");
  }
  getCleanupTarget(_cacheRoot, _descriptor) {
    return void 0;
  }
  getLabel(descriptor) {
    return descriptor.path || ".";
  }
};

var GitHubPluginSource = class extends AbstractGitPluginSource {
  constructor() {
    super(...arguments);
    this.kind = "github" /* GitHub */;
  }
  /** Returns the URI where the plugin content lives (repo root + optional sub-path). */
  getInstallUri(cacheRoot, descriptor) {
    const repoDir = this._getRepoDir(cacheRoot, descriptor);
    const gh = descriptor;
    if (gh.path) {
      const normalizedPath = gh.path.trim().replace(/^\.?\/+|\/+$/g, "");
      if (normalizedPath) {
        const target = joinPath(repoDir, normalizedPath);
        if (isEqualOrParent2(target, repoDir)) {
          return target;
        }
      }
    }
    return repoDir;
  }
  /** Returns the cloned repository root (without sub-path). */
  _getRepoDir(cacheRoot, descriptor) {
    const gh = descriptor;
    const [owner, repo] = gh.repo.split("/");
    return joinPath(cacheRoot, "github.com", owner, repo, ...gitRevisionCacheSuffix(gh.ref, gh.sha));
  }
  getLabel(descriptor) {
    const gh = descriptor;
    return gh.path ? `${gh.repo}/${gh.path}` : gh.repo;
  }
  _cloneUrl(descriptor) {
    return `https://github.com/${descriptor.repo}.git`;
  }
  _displayLabel(descriptor) {
    return descriptor.repo;
  }
};

var GitUrlPluginSource = class extends AbstractGitPluginSource {
  constructor() {
    super(...arguments);
    this.kind = "url" /* GitUrl */;
  }
  /** Returns the URI where the plugin content lives (repo root + optional sub-path). */
  getInstallUri(cacheRoot, descriptor) {
    const repoDir = this._getRepoDir(cacheRoot, descriptor);
    const git = descriptor;
    if (git.path) {
      const normalizedPath = git.path.trim().replace(/^\.?\/+|\/+$/g, "");
      if (normalizedPath) {
        const target = joinPath(repoDir, normalizedPath);
        if (isEqualOrParent2(target, repoDir)) {
          return target;
        }
      }
    }
    return repoDir;
  }
  /** Returns the cloned repository root (without sub-path). */
  _getRepoDir(cacheRoot, descriptor) {
    const git = descriptor;
    const segments = this._gitUrlCacheSegments(git.url, git.ref, git.sha);
    return joinPath(cacheRoot, ...segments);
  }
  getLabel(descriptor) {
    const git = descriptor;
    return git.path ? `${git.url}/${git.path}` : git.url;
  }
  _cloneUrl(descriptor) {
    return descriptor.url;
  }
  _displayLabel(descriptor) {
    return descriptor.url;
  }
  _gitUrlCacheSegments(url, ref, sha) {
    try {
      const parsed = URI.parse(url);
      const authority = (parsed.authority || "unknown").replace(/[\\/:*?"<>|]/g, "_").toLowerCase();
      const pathPart = parsed.path.replace(/^\/+/, "").replace(/\.git$/i, "").replace(/\/+$/g, "");
      const segments = pathPart.split("/").map((s) => s.replace(/[\\/:*?"<>|]/g, "_"));
      return [authority, ...segments, ...gitRevisionCacheSuffix(ref, sha)];
    } catch {
      return ["git", url.replace(/[\\/:*?"<>|]/g, "_"), ...gitRevisionCacheSuffix(ref, sha)];
    }
  }
};

var AbstractPackagePluginSource = class {
  constructor(_dialogService, _fileService, _logService, _notificationService, _progressService, _terminalService) {
    this._dialogService = _dialogService;
    this._fileService = _fileService;
    this._logService = _logService;
    this._notificationService = _notificationService;
    this._progressService = _progressService;
    this._terminalService = _terminalService;
  }
  getCleanupTarget(cacheRoot, descriptor) {
    return this._getCacheDir(cacheRoot, descriptor);
  }
  async ensure(cacheRoot, plugin, _options) {
    const cacheDir = this._getCacheDir(cacheRoot, plugin.sourceDescriptor);
    await this._fileService.createFolder(cacheDir);
    return cacheDir;
  }
  async update(cacheRoot, plugin, _options) {
    const installDir = this._getCacheDir(cacheRoot, plugin.sourceDescriptor);
    const pluginDir = this.getInstallUri(cacheRoot, plugin.sourceDescriptor);
    await this.runInstall(installDir, pluginDir, plugin, { silent: _options?.silent });
    return true;
  }
  async runInstall(installDir, pluginDir, plugin, options3) {
    const args2 = this._buildInstallArgs(installDir, plugin);
    const command4 = formatShellCommand(args2);
    const confirmed = await this._confirmTerminalCommand(plugin.name, command4, options3?.silent);
    if (!confirmed) {
      return void 0;
    }
    const progressTitle = localize(11387, null, this._managerName, plugin.name);
    const { success, terminal: terminal2 } = await this._runTerminalCommand(command4, progressTitle);
    if (!success) {
      return void 0;
    }
    const exists = await this._fileService.exists(pluginDir);
    if (!exists) {
      this._notificationService.notify({
        severity: Severity2.Error,
        message: localize(11388, null, this._managerName, this.getLabel(plugin.sourceDescriptor))
      });
      return void 0;
    }
    terminal2?.dispose();
    return { pluginDir };
  }
  // -- terminal helpers (moved from PluginInstallService) ---
  async _confirmTerminalCommand(pluginName, command4, silent) {
    if (silent) {
      return new Promise((resolve3) => {
        const n2 = this._notificationService.notify({
          severity: Severity2.Info,
          message: localize(11385, null, pluginName, command4),
          actions: {
            primary: [
              new Action("installPlugin", localize(11386, null), void 0, true, async () => resolve3(true))
            ]
          }
        });
        Event2.once(n2.onDidClose)(() => resolve3(false));
      });
    }
    const { confirmed } = await this._dialogService.confirm({
      type: "question",
      message: localize(11383, null, pluginName),
      detail: localize(11384, null, command4),
      primaryButton: localize(11382, null)
    });
    return confirmed;
  }
  async _runTerminalCommand(command4, progressTitle) {
    let terminal2;
    try {
      await this._progressService.withProgress(
        {
          location: 15 /* Notification */,
          title: progressTitle,
          cancellable: false
        },
        async () => {
          terminal2 = await this._terminalService.createTerminal({
            config: {
              name: localize(11389, null),
              forceShellIntegration: true,
              isTransient: true,
              isFeatureTerminal: true
            }
          });
          await terminal2.processReady;
          this._terminalService.setActiveInstance(terminal2);
          const commandResultPromise = this._waitForTerminalCommandCompletion(terminal2);
          await terminal2.runCommand(command4, true);
          const exitCode = await commandResultPromise;
          if (exitCode !== 0) {
            throw new Error(localize(11391, null, exitCode));
          }
        }
      );
      return { success: true, terminal: terminal2 };
    } catch (err) {
      this._logService.error(`[${this.kind}] Terminal command failed:`, err);
      this._notificationService.notify({
        severity: Severity2.Error,
        message: localize(11392, null, err?.message ?? String(err))
      });
      return { success: false, terminal: terminal2 };
    }
  }
  _waitForTerminalCommandCompletion(terminal2) {
    return new Promise((resolve3) => {
      const disposables = new DisposableStore();
      let isResolved = false;
      const resolveAndDispose = (exitCode) => {
        if (isResolved) {
          return;
        }
        isResolved = true;
        disposables.dispose();
        resolve3(exitCode);
      };
      const attachCommandFinishedListener = () => {
        const commandDetection = terminal2.capabilities.get(2 /* CommandDetection */);
        if (!commandDetection) {
          return;
        }
        disposables.add(commandDetection.onCommandFinished((command4) => {
          resolveAndDispose(command4.exitCode ?? 0);
        }));
      };
      attachCommandFinishedListener();
      disposables.add(terminal2.capabilities.onDidAddCommandDetectionCapability(() => attachCommandFinishedListener()));
      const timeoutHandle = timeout(12e4);
      disposables.add(toDisposable(() => timeoutHandle.cancel()));
      void timeoutHandle.then(() => {
        if (isResolved) {
          return;
        }
        this._logService.warn(`[${this.kind}] Terminal command completion timed out`);
        resolveAndDispose(void 0);
      });
    });
  }
};

AbstractPackagePluginSource = __decorateClass([
  __decorateParam(0, IDialogService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILogService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IProgressService),
  __decorateParam(5, ITerminalService)
], AbstractPackagePluginSource);

var NpmPluginSource = class extends AbstractPackagePluginSource {
  constructor() {
    super(...arguments);
    this.kind = "npm" /* Npm */;
    this._managerName = "npm";
  }
  getInstallUri(cacheRoot, descriptor) {
    const npm = descriptor;
    return joinPath(cacheRoot, "npm", sanitizeCacheSegment(npm.package), "node_modules", npm.package);
  }
  getLabel(descriptor) {
    const npm = descriptor;
    return npm.version ? `${npm.package}@${npm.version}` : npm.package;
  }
  _getCacheDir(cacheRoot, descriptor) {
    const npm = descriptor;
    return joinPath(cacheRoot, "npm", sanitizeCacheSegment(npm.package));
  }
  _buildInstallArgs(installDir, plugin) {
    const npm = plugin.sourceDescriptor;
    const packageSpec = npm.version ? `${npm.package}@${npm.version}` : npm.package;
    const args2 = ["npm", "install", "--prefix", installDir.fsPath, packageSpec];
    if (npm.registry) {
      args2.push("--registry", npm.registry);
    }
    return args2;
  }
};

var PipPluginSource = class extends AbstractPackagePluginSource {
  constructor() {
    super(...arguments);
    this.kind = "pip" /* Pip */;
    this._managerName = "pip";
  }
  getInstallUri(cacheRoot, descriptor) {
    const pip = descriptor;
    return joinPath(cacheRoot, "pip", sanitizeCacheSegment(pip.package));
  }
  getLabel(descriptor) {
    const pip = descriptor;
    return pip.version ? `${pip.package}==${pip.version}` : pip.package;
  }
  _getCacheDir(cacheRoot, descriptor) {
    const pip = descriptor;
    return joinPath(cacheRoot, "pip", sanitizeCacheSegment(pip.package));
  }
  _buildInstallArgs(installDir, plugin) {
    const pip = plugin.sourceDescriptor;
    const packageSpec = pip.version ? `${pip.package}==${pip.version}` : pip.package;
    const args2 = ["pip", "install", "--target", installDir.fsPath, packageSpec];
    if (pip.registry) {
      args2.push("--index-url", pip.registry);
    }
    return args2;
  }
};
export { sanitizeCacheSegment, gitRevisionCacheSuffix, shellEscapeArg, formatShellCommand, AbstractGitPluginSource, RelativePathPluginSource, GitHubPluginSource, GitUrlPluginSource, AbstractPackagePluginSource, NpmPluginSource, PipPluginSource };
