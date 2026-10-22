// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/update/electron-main/updateService.win32.ts
import { getWin32UpdateType, init_win32UpdateType } from "./module-0230.mjs";
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Delayer, ProcessTimeRunOnceScheduler, init_async, timeout } from "./module-0034.mjs";
import { VSBuffer, init_buffer } from "./module-0050.mjs";
import { CancellationTokenSource, init_cancellation } from "./module-0022.mjs";
import { init_decorators, memoize } from "./module-0052.mjs";
import { init_errors, isCancellationError } from "./module-0010.mjs";
import { hash, init_hash } from "./module-0067.mjs";
import { basename, dirname3, init_path, join4 } from "./module-0008.mjs";
import { init_stream, transform } from "./module-0049.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { checksum, init_crypto } from "./module-0228.mjs";
import { Promises2, init_pfs } from "./module-0036.mjs";
import { init_processes2, killTree } from "./module-0165.mjs";
import { getWindowsRelease, init_windowsVersion } from "./module-0060.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { IFileService, init_files } from "./module-0072.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IMeteredConnectionService, init_meteredConnection } from "./module-0206.mjs";
import { INativeHostMainService, init_nativeHostMainService } from "./module-0156.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { IRequestService, asJson, init_request } from "./module-0155.mjs";
import { IApplicationStorageMainService, init_storageMainService } from "./module-0109.mjs";
import { ITelemetryService, init_telemetry } from "./module-0104.mjs";
import { State, init_update } from "./module-0201.mjs";
import { AbstractUpdateService, createUpdateURL, getUpdateRequestHeaders, init_abstractUpdateService } from "./module-0224.mjs";
import { getRelaunchArguments, init_updateRelaunchArguments } from "./module-0229.mjs";


// src/vs/platform/update/electron-main/updateService.win32.ts
import { spawn as spawn5 } from "child_process";

import { app as app9 } from "electron";

import { unlinkSync, writeFileSync as writeFileSync2 } from "fs";

import { mkdir, readFile as readFile2, unlink } from "fs/promises";

import { release as release5, tmpdir as tmpdir3 } from "os";

function getUpdateType() {
  if (typeof _updateType === "undefined") {
    _updateType = getWin32UpdateType();
  }
  return _updateType;
}

var RELAUNCH_ARGUMENTS_FILE_PREFIX, _updateType, Win32UpdateService;

var init_updateService_win32 = __esm({
  "src/vs/platform/update/electron-main/updateService.win32.ts"() {
    init_async();
    init_buffer();
    init_cancellation();
    init_decorators();
    init_errors();
    init_hash();
    init_path();
    init_path();
    init_stream();
    init_uri();
    init_crypto();
    init_pfs();
    init_processes2();
    init_windowsVersion();
    init_configuration();
    init_environmentMainService();
    init_files();
    init_lifecycleMainService();
    init_log();
    init_meteredConnection();
    init_nativeHostMainService();
    init_productService();
    init_request();
    init_storageMainService();
    init_telemetry();
    init_update();
    init_abstractUpdateService();
    init_updateRelaunchArguments();
    init_win32UpdateType();
    RELAUNCH_ARGUMENTS_FILE_PREFIX = "relaunch-args-";
    _updateType = void 0;
    Win32UpdateService = class extends AbstractUpdateService {
      constructor(lifecycleMainService, configurationService, telemetryService, environmentMainService, requestService, logService, fileService, nativeHostMainService, productService, applicationStorageMainService, meteredConnectionService) {
        super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService, telemetryService, applicationStorageMainService, meteredConnectionService, true);
        this.fileService = fileService;
        this.nativeHostMainService = nativeHostMainService;
        this.readyMutexName = `${productService.win32MutexName}-ready`;
        this.updatingMutexName = `${productService.win32MutexName}-updating`;
        this.setupMutexName = `${productService.win32MutexName}setup`;
        lifecycleMainService.setRelaunchHandler(this);
      }
      get cachePathSync() {
        return join4(tmpdir3(), `vscode-${this.productService.quality}-${this.productService.target}-${process.arch}`);
      }
      get cachePath() {
        const result = this.cachePathSync;
        return mkdir(result, { recursive: true }).then(() => result);
      }
      get mutex() {
        return import("@vscode/windows-mutex");
      }
      handleRelaunch(options) {
        if (options?.addArgs || options?.removeArgs) {
          return false;
        }
        if (this.state.type !== "ready" /* Ready */ || !this.availableUpdate) {
          return false;
        }
        this.logService.trace("update#handleRelaunch(): running raw#quitAndInstall()");
        this.doQuitAndInstall();
        return true;
      }
      async initialize() {
        if (this.productService.win32VersionedUpdate) {
          const cachePath = await this.cachePath;
          app9.setPath("appUpdate", cachePath);
          await this.unlink(join4(cachePath, "session-ending.flag"));
        }
        const osRelease = await getWindowsRelease();
        const osNodeRelease = release5();
        this.telemetryService.publicLog2("windowsUpdateInit", { osRelease, osNodeRelease });
        if (this.productService.target === "user" && await this.nativeHostMainService.isAdmin(void 0)) {
          this.setState(State.Disabled(6 /* RunningAsAdmin */));
          this.logService.info("update#ctor - updates are disabled due to running as Admin in user setup");
          return;
        }
        await super.initialize();
      }
      async postInitialize() {
        if (!this.productService.win32VersionedUpdate) {
          return;
        }
        const exePath = app9.getPath("exe");
        const exeDir = dirname3(exePath);
        const updatingVersionPath = join4(exeDir, "updating_version");
        if (await Promises2.exists(updatingVersionPath)) {
          try {
            const updatingVersion = (await readFile2(updatingVersionPath, "utf8")).trim();
            this.logService.info(`update#doCheckForUpdates - application was updating to version ${updatingVersion}`);
            const updatePackagePath = await this.getUpdatePackagePath(updatingVersion);
            if (await Promises2.exists(updatePackagePath)) {
              await this._applySpecificUpdate(updatePackagePath, updatingVersion);
              this.logService.info(`update#doCheckForUpdates - successfully applied update to version ${updatingVersion}`);
            }
          } catch (e) {
            this.logService.error(`update#doCheckForUpdates - could not read ${updatingVersionPath}`, e);
          } finally {
          }
        } else {
          await this.collectGarbage();
        }
      }
      async collectGarbage() {
        if (!this.productService.win32VersionedUpdate) {
          return;
        }
        const fastUpdatesEnabled = this.configurationService.getValue("update.enableWindowsBackgroundUpdates");
        if (!fastUpdatesEnabled || this.productService.target !== "user" || !this.productService.commit) {
          return;
        }
        const exePath = app9.getPath("exe");
        const exeDir = dirname3(exePath);
        const versionedResourcesFolder = this.productService.commit.substring(0, 10);
        const innoUpdater = join4(exeDir, versionedResourcesFolder, "tools", "inno_updater.exe");
        const exeName = basename(exePath);
        await new Promise((resolve3) => {
          const child = spawn5(innoUpdater, ["--gc", exePath, versionedResourcesFolder, exeName], {
            stdio: ["ignore", "ignore", "ignore"],
            windowsHide: true,
            timeout: 2 * 60 * 1e3
          });
          child.once("error", (err) => {
            this.logService.error("update#collectGarbage - failed to spawn inno_updater", err);
            resolve3();
          });
          child.once("exit", () => resolve3());
        });
      }
      buildUpdateFeedUrl(quality, commit, options) {
        let platform5 = `win32-${process.arch}`;
        if (getUpdateType() === 1 /* Archive */) {
          platform5 += "-archive";
        } else if (this.productService.target === "user") {
          platform5 += "-user";
        }
        return createUpdateURL(this.productService.updateUrl, platform5, quality, commit, options);
      }
      doCheckForUpdates(explicit, pendingCommit) {
        if (!this.quality) {
          return;
        }
        const internalOrg = this.getInternalOrg();
        const background = !explicit && !internalOrg;
        const url = this.buildUpdateFeedUrl(this.quality, pendingCommit ?? this.productService.commit, { background, internalOrg });
        if (this.state.type !== "overwriting" /* Overwriting */) {
          this.setState(State.CheckingForUpdates(explicit));
        }
        this.checkCancellationTokenSource?.dispose(true);
        const cts = this.checkCancellationTokenSource = new CancellationTokenSource();
        const token = cts.token;
        const headers = getUpdateRequestHeaders(this.productService.version);
        const promise = this.requestService.request({ url, headers, callSite: "updateService.win32.checkForUpdates" }, token).then(asJson).then((update) => {
          const updateType = getUpdateType();
          if (token.isCancellationRequested) {
            return Promise.resolve(null);
          }
          if (!update || !update.url || !update.version || !update.productVersion) {
            if (this.state.type === "overwriting" /* Overwriting */) {
              this._overwrite = false;
              this.setState(State.Ready(this.state.update, this.state.explicit, false));
            } else {
              this.setState(State.Idle(updateType, void 0, explicit || void 0));
            }
            return Promise.resolve(null);
          }
          if (updateType === 1 /* Archive */) {
            this.setState(State.AvailableForDownload(update));
            return Promise.resolve(null);
          }
          if (this.deferAutomaticDownload(update, explicit)) {
            return Promise.resolve(null);
          }
          const startTime = Date.now();
          this.setState(State.Downloading(update, explicit, this._overwrite, 0, void 0, startTime));
          return this.cleanup(update.version).then(() => {
            return this.getUpdatePackagePath(update.version).then((updatePackagePath) => {
              return Promises2.exists(updatePackagePath).then((exists) => {
                if (exists) {
                  return Promise.resolve(updatePackagePath);
                }
                if (this.deferAutomaticDownload(update, explicit)) {
                  return void 0;
                }
                const downloadPath = `${updatePackagePath}.tmp`;
                return this.requestService.request({ url: update.url, callSite: "updateService.win32.downloadUpdate" }, token).then((context) => {
                  const contentLengthHeader = context.res.headers["content-length"];
                  const contentLength = typeof contentLengthHeader === "string" ? contentLengthHeader : void 0;
                  const totalBytes = contentLength ? parseInt(contentLength, 10) : void 0;
                  let downloadedBytes = 0;
                  const progressDelayer = new Delayer(500);
                  const progressStream = transform(
                    context.stream,
                    {
                      data: (data) => {
                        downloadedBytes += data.byteLength;
                        progressDelayer.trigger(() => {
                          this.setState(State.Downloading(update, explicit, this._overwrite, downloadedBytes, totalBytes, startTime));
                        });
                        return data;
                      }
                    },
                    (chunks) => VSBuffer.concat(chunks)
                  );
                  return this.fileService.writeFile(URI.file(downloadPath), progressStream).finally(() => progressDelayer.dispose());
                }).then(update.sha256hash ? () => checksum(downloadPath, update.sha256hash) : () => void 0).then(() => Promises2.rename(
                  downloadPath,
                  updatePackagePath,
                  false
                  /* no retry */
                )).then(() => updatePackagePath);
              });
            }).then((packagePath) => {
              if (!packagePath || token.isCancellationRequested) {
                return;
              }
              this.availableUpdate = { packagePath };
              this.saveUpdateMetadata(update);
              this.setState(State.Downloaded(update, explicit, this._overwrite));
              const fastUpdatesEnabled = this.configurationService.getValue("update.enableWindowsBackgroundUpdates");
              if (fastUpdatesEnabled && this.productService.target === "user") {
                this.doApplyUpdate();
              } else {
                this.setState(State.Ready(update, explicit, this._overwrite));
              }
            });
          });
        }).then(void 0, (err) => {
          if (token.isCancellationRequested || isCancellationError(err)) {
            return;
          }
          this.telemetryService.publicLog2("update:error", { messageHash: String(hash(String(err))) });
          this.logService.error(err);
          const message = explicit ? err.message || err : void 0;
          if (this.state.type === "overwriting" /* Overwriting */) {
            this._overwrite = false;
            this.setState(State.Ready(this.state.update, this.state.explicit, false));
          } else {
            this.setState(State.Idle(getUpdateType(), message));
          }
        });
        this.checkPromise = promise;
        promise.finally(() => {
          if (this.checkCancellationTokenSource === cts) {
            this.checkCancellationTokenSource = void 0;
          }
          if (this.checkPromise === promise) {
            this.checkPromise = void 0;
          }
          cts.dispose();
        });
      }
      async doDownloadUpdate(state) {
        if (state.update.url) {
          this.nativeHostMainService.openExternal(void 0, state.update.url);
        }
        this.setState(State.Idle(getUpdateType()));
      }
      resumeDeferredDownload() {
        this.setState(State.Idle(getUpdateType()));
        void this.checkForUpdates(false);
      }
      async getUpdatePackagePath(version) {
        const cachePath = await this.cachePath;
        return join4(cachePath, `CodeSetup-${this.productService.quality}-${version}.exe`);
      }
      async cleanup(exceptVersion = null) {
        const relaunchArgumentsFileName = exceptVersion ? `${RELAUNCH_ARGUMENTS_FILE_PREFIX}${exceptVersion}` : void 0;
        const filter = exceptVersion ? (one) => one !== relaunchArgumentsFileName && !new RegExp(`${this.productService.quality}-${exceptVersion}\\.exe$`).test(one) : () => true;
        const cachePath = await this.cachePath;
        const versions = await Promises2.readdir(cachePath);
        const promises18 = versions.filter(filter).map((one) => this.unlink(join4(cachePath, one)));
        await Promise.all(promises18);
      }
      async doApplyUpdate() {
        if (this.state.type !== "downloaded" /* Downloaded */) {
          return Promise.resolve(void 0);
        }
        if (!this.availableUpdate) {
          return Promise.resolve(void 0);
        }
        const update = this.state.update;
        const explicit = this.state.explicit;
        this.setState(State.Updating(update, explicit));
        const cachePath = await this.cachePath;
        const sessionEndFlagPath = join4(cachePath, "session-ending.flag");
        const cancelFilePath = join4(cachePath, `cancel.flag`);
        const progressFilePath = join4(cachePath, `update-progress`);
        this.availableUpdate.updateFilePath = join4(cachePath, `CodeSetup-${this.productService.quality}-${update.version}.flag`);
        this.availableUpdate.cancelFilePath = cancelFilePath;
        const mutex = await this.mutex;
        const skippedSpawn = this.isInstallerActive(mutex);
        if (skippedSpawn) {
          this.logService.info("update#doApplyUpdate: another instance is already running setup, waiting for it to finish");
        } else {
          await this.unlink(cancelFilePath);
          await this.unlink(progressFilePath);
          await Promises2.writeFile(this.availableUpdate.updateFilePath, "flag");
          const installerArgs = [
            "/verysilent",
            "/log",
            `/update="${this.availableUpdate.updateFilePath}"`,
            `/progress="${progressFilePath}"`,
            `/sessionend="${sessionEndFlagPath}"`,
            `/cancel="${cancelFilePath}"`,
            "/nocloseapplications",
            "/mergetasks=runcode,!desktopicon,!quicklaunchicon"
          ];
          const relaunchArgsFilePath = this.getRelaunchArgumentsFilePath(cachePath, update.version);
          installerArgs.push(`/relaunchargs="${relaunchArgsFilePath}"`);
          const child = spawn5(
            this.availableUpdate.packagePath,
            installerArgs,
            {
              detached: true,
              stdio: ["ignore", "ignore", "ignore"],
              windowsVerbatimArguments: true,
              env: { ...process.env, __COMPAT_LAYER: "RunAsInvoker" }
            }
          );
          this.availableUpdate.updateProcess = child;
          child.once("exit", () => {
            this.availableUpdate = void 0;
            this.setState(State.Idle(getUpdateType()));
          });
        }
        this.updateCancellationTokenSource?.dispose(true);
        const cts = this.updateCancellationTokenSource = new CancellationTokenSource();
        const token = cts.token;
        const poll = async () => {
          let seenRunning = skippedSpawn;
          while (this.state.type === "updating" /* Updating */ && !token.isCancellationRequested) {
            if (mutex.isActive(this.readyMutexName)) {
              this.setState(State.Ready(update, explicit, this._overwrite));
              return;
            }
            if (this.isInstallerActive(mutex)) {
              seenRunning = true;
            } else if (seenRunning) {
              if (!this.availableUpdate?.updateProcess) {
                this.availableUpdate = void 0;
                this.setState(State.Idle(getUpdateType()));
              }
              return;
            }
            try {
              const progressContent = await readFile2(progressFilePath, "utf8");
              if (!token.isCancellationRequested) {
                const [currentStr, maxStr] = progressContent.split(",");
                const currentProgress = parseInt(currentStr, 10);
                const maxProgress = parseInt(maxStr, 10);
                if (!isNaN(currentProgress) && !isNaN(maxProgress) && this.state.type === "updating" /* Updating */) {
                  if (this.state.currentProgress !== currentProgress || this.state.maxProgress !== maxProgress) {
                    this.setState(State.Updating(update, explicit, currentProgress, maxProgress));
                  }
                }
              }
            } catch {
            }
            await timeout(500);
          }
        };
        const cancelTimeout = new ProcessTimeRunOnceScheduler(() => {
          this.logService.warn("update#doApplyUpdate: polling timed out waiting for update to be ready");
          this.setState(State.Idle(getUpdateType(), "Update did not complete within expected time"));
        }, 60 * 60 * 1e3);
        cancelTimeout.schedule();
        poll().finally(() => {
          cancelTimeout.dispose();
          if (this.updateCancellationTokenSource === cts) {
            this.updateCancellationTokenSource = void 0;
          }
          cts.dispose();
        });
      }
      async cancelUpdate() {
        const hadInFlightCheck = !!this.checkCancellationTokenSource;
        const hadPendingUpdate = !!this.availableUpdate;
        this.checkCancellationTokenSource?.dispose(true);
        this.checkCancellationTokenSource = void 0;
        if (hadInFlightCheck) {
          try {
            await this.checkPromise;
          } catch {
          }
          await this.cleanupTempFiles();
        }
        await this.cancelPendingUpdate();
        if (hadInFlightCheck || hadPendingUpdate) {
          this.collectGarbage().catch((err) => this.logService.error("update#collectGarbage - failed to collect garbage", err));
        }
      }
      async cleanupTempFiles() {
        try {
          const cachePath = await this.cachePath;
          const files = await Promises2.readdir(cachePath);
          await Promise.all(files.filter((file) => file.endsWith(".tmp")).map((file) => this.unlink(join4(cachePath, file))));
        } catch (err) {
          this.logService.warn("update#cleanupTempFiles: failed to remove temporary download files", err);
        }
      }
      async cancelPendingUpdate() {
        if (!this.availableUpdate) {
          return;
        }
        const { updateProcess, updateFilePath, cancelFilePath } = this.availableUpdate;
        if (!updateProcess && this.isInstallerActive(await this.mutex)) {
          throw new Error("Cannot cancel pending update: another instance is still running setup");
        }
        this.updateCancellationTokenSource?.dispose(true);
        this.updateCancellationTokenSource = void 0;
        if (updateProcess && updateProcess.exitCode === null) {
          this.logService.trace("update#cancelPendingUpdate: cancelling pending update");
          updateProcess.removeAllListeners();
          const exitPromise = new Promise((resolve3) => updateProcess.once("exit", () => resolve3(true)));
          if (cancelFilePath) {
            try {
              await Promises2.writeFile(cancelFilePath, "cancel");
            } catch (err) {
              this.logService.warn("update#cancelPendingUpdate: failed to write cancel file", err);
            }
          }
          const pid = updateProcess.pid;
          const exited = await Promise.race([exitPromise, timeout(30 * 1e3).then(() => false)]);
          if (pid && !exited) {
            this.logService.trace("update#cancelPendingUpdate: process did not exit gracefully, killing process tree");
            await killTree(pid, true);
          }
        }
        await this.unlink(updateFilePath);
        await this.unlink(cancelFilePath);
        this.availableUpdate = void 0;
      }
      doQuitAndInstall() {
        if (this.state.type !== "ready" /* Ready */ && this.state.type !== "restarting" /* Restarting */ || !this.availableUpdate) {
          return;
        }
        this.logService.trace("update#quitAndInstall(): running raw#quitAndInstall()");
        if (this.availableUpdate.updateFilePath) {
          this.writeRelaunchArgumentsFile(this.cachePathSync, this.state.update.version);
          try {
            unlinkSync(this.availableUpdate.updateFilePath);
          } catch {
          }
        } else {
          const installerArgs = ["/silent", "/log", "/mergetasks=runcode,!desktopicon,!quicklaunchicon"];
          const relaunchArgsFilePath = this.writeRelaunchArgumentsFile(this.cachePathSync, this.state.update.version);
          if (relaunchArgsFilePath) {
            installerArgs.push(`/relaunchargs="${relaunchArgsFilePath}"`);
          }
          spawn5(this.availableUpdate.packagePath, installerArgs, {
            detached: true,
            stdio: ["ignore", "ignore", "ignore"],
            windowsVerbatimArguments: true,
            env: { ...process.env, __COMPAT_LAYER: "RunAsInvoker" }
          });
        }
      }
      getRelaunchArgumentsFilePath(cachePath, version) {
        return join4(cachePath, `${RELAUNCH_ARGUMENTS_FILE_PREFIX}${version}`);
      }
      /**
       * Writes the arguments from {@link getRelaunchArguments} to a file in the update cache and returns its path (or
       * `undefined` when there is nothing to carry forward). The installer reads it and passes the arguments to `Code.exe`.
       */
      writeRelaunchArgumentsFile(cachePath, version) {
        const relaunchArguments = getRelaunchArguments(this.environmentMainService.args, process.argv);
        const relaunchArgsFilePath = this.getRelaunchArgumentsFilePath(cachePath, version);
        if (!relaunchArguments) {
          try {
            unlinkSync(relaunchArgsFilePath);
          } catch {
          }
          return void 0;
        }
        try {
          writeFileSync2(relaunchArgsFilePath, relaunchArguments);
          return relaunchArgsFilePath;
        } catch (err) {
          this.logService.error("update#writeRelaunchArgumentsFile: failed to write relaunch arguments", err);
          return void 0;
        }
      }
      async saveUpdateMetadata(update) {
        try {
          const cachePath = await this.cachePath;
          const metadataPath = join4(cachePath, "update-metadata.json");
          await Promises2.writeFile(metadataPath, JSON.stringify(update));
        } catch (e) {
          this.logService.error("update#saveUpdateMetadata: failed to save", e);
        }
      }
      async loadUpdateMetadata() {
        try {
          const cachePath = await this.cachePath;
          const metadataPath = join4(cachePath, "update-metadata.json");
          if (await Promises2.exists(metadataPath)) {
            const content = await readFile2(metadataPath, "utf8");
            return JSON.parse(content);
          }
        } catch (e) {
          this.logService.error("update#loadUpdateMetadata: failed to load", e);
        }
        return void 0;
      }
      getUpdateType() {
        return getUpdateType();
      }
      async _applySpecificUpdate(packagePath, commit) {
        if (this.state.type !== "idle" /* Idle */) {
          return;
        }
        const fastUpdatesEnabled = this.configurationService.getValue("update.enableWindowsBackgroundUpdates");
        const update = await this.loadUpdateMetadata() ?? { version: commit ?? "unknown", productVersion: "unknown" };
        this.setState(State.Downloading(update, true, false));
        this.availableUpdate = { packagePath };
        this.setState(State.Downloaded(update, true, false));
        if (fastUpdatesEnabled && this.productService.target === "user") {
          this.doApplyUpdate();
        } else {
          this.setState(State.Ready(update, true, false));
        }
      }
      isInstallerActive(mutex) {
        return mutex.isActive(this.updatingMutexName) || mutex.isActive(this.setupMutexName);
      }
      async unlink(path4) {
        if (path4) {
          try {
            await unlink(path4);
          } catch (err) {
            const error = err;
            if (error && error.code === "ENOENT") {
              return;
            } else {
              this.logService.warn(`update#unlink: failed to unlink ${basename(path4)}`, err);
            }
          }
        }
      }
    };
    __decorateClass([
      memoize
    ], Win32UpdateService.prototype, "cachePath", 1);
    __decorateClass([
      memoize
    ], Win32UpdateService.prototype, "mutex", 1);
    Win32UpdateService = __decorateClass([
      __decorateParam(0, ILifecycleMainService),
      __decorateParam(1, IConfigurationService),
      __decorateParam(2, ITelemetryService),
      __decorateParam(3, IEnvironmentMainService),
      __decorateParam(4, IRequestService),
      __decorateParam(5, ILogService),
      __decorateParam(6, IFileService),
      __decorateParam(7, INativeHostMainService),
      __decorateParam(8, IProductService),
      __decorateParam(9, IApplicationStorageMainService),
      __decorateParam(10, IMeteredConnectionService)
    ], Win32UpdateService);
  }
});
export { getUpdateType, spawn5, app9, unlinkSync, writeFileSync2, mkdir, readFile2, unlink, release5, tmpdir3, RELAUNCH_ARGUMENTS_FILE_PREFIX, _updateType, Win32UpdateService, init_updateService_win32 };
