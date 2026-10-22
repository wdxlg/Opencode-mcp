// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/update/electron-main/abstractUpdateService.ts
import { init_platform, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { getWindowsReleaseSync, init_windowsVersion } from "./module-0060.mjs";
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { IntervalTimer, Throttler, init_async, timeout } from "./module-0034.mjs";
import { CancellationToken, CancellationTokenSource, init_cancellation } from "./module-0022.mjs";
import { init_errors, isCancellationError } from "./module-0010.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { Disposable, MutableDisposable, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { IMeteredConnectionService, init_meteredConnection } from "./module-0206.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { IRequestService, init_request } from "./module-0155.mjs";
import { init_storage2 } from "./module-0079.mjs";
import { IApplicationStorageMainService, init_storageMainService } from "./module-0109.mjs";
import { ITelemetryService, init_telemetry } from "./module-0104.mjs";
import { State, init_update } from "./module-0201.mjs";


// src/vs/platform/update/electron-main/abstractUpdateService.ts
import * as os3 from "os";

function createUpdateURL(baseUpdateUrl, platform5, quality, commit, options) {
  const url = new URL(`${baseUpdateUrl}/api/update/${platform5}/${quality}/${commit}`);
  if (options?.background) {
    url.searchParams.set("bg", "true");
  }
  url.searchParams.set("u", options?.internalOrg ?? "none");
  return url.toString();
}

function getUpdateRequestHeaders(productVersion) {
  if (isMacintosh) {
    const darwinVersion = os3.release();
    return {
      "User-Agent": `Code/${productVersion} Darwin/${darwinVersion}`
    };
  }
  if (isWindows2) {
    const match = getWindowsReleaseSync().match(/^(\d+\.\d+)/);
    if (match) {
      return {
        "User-Agent": `Code/${productVersion} Electron/${process.versions.electron} Windows NT ${match[1]}`
      };
    }
  }
  return void 0;
}

function isCancellableState(type3) {
  switch (type3) {
    case "checking for updates" /* CheckingForUpdates */:
    case "available for download" /* AvailableForDownload */:
    case "downloading" /* Downloading */:
    case "downloaded" /* Downloaded */:
    case "updating" /* Updating */:
    case "ready" /* Ready */:
    case "overwriting" /* Overwriting */:
      return true;
    default:
      return false;
  }
}

var LAST_KNOWN_VERSION_STORAGE_KEY, AbstractUpdateService;

var init_abstractUpdateService = __esm({
  "src/vs/platform/update/electron-main/abstractUpdateService.ts"() {
    init_async();
    init_cancellation();
    init_errors();
    init_event();
    init_lifecycle();
    init_platform();
    init_windowsVersion();
    init_meteredConnection();
    init_configuration();
    init_environmentMainService();
    init_lifecycleMainService();
    init_log();
    init_productService();
    init_request();
    init_storage2();
    init_storageMainService();
    init_telemetry();
    init_update();
    LAST_KNOWN_VERSION_STORAGE_KEY = "abstractUpdateService/lastKnownVersion";
    AbstractUpdateService = class extends Disposable {
      constructor(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService, telemetryService, applicationStorageMainService, meteredConnectionService, supportsUpdateOverwrite) {
        super();
        this.lifecycleMainService = lifecycleMainService;
        this.configurationService = configurationService;
        this.environmentMainService = environmentMainService;
        this.requestService = requestService;
        this.logService = logService;
        this.productService = productService;
        this.telemetryService = telemetryService;
        this.applicationStorageMainService = applicationStorageMainService;
        this.meteredConnectionService = meteredConnectionService;
        this.supportsUpdateOverwrite = supportsUpdateOverwrite;
        this._state = { state: State.Uninitialized, deferred: false };
        this._overwrite = false;
        this._hasCheckedForOverwriteOnQuit = false;
        this.overwriteUpdatesCheckInterval = this._register(new IntervalTimer());
        this._internalOrg = void 0;
        /** Disabled for a non-reversible reason (e.g. not built, missing config); ignores `update.mode` changes. */
        this._disabledPermanently = false;
        /** Whether one-time platform init (e.g. background update GC, pending update resume) has run. */
        this._postInitialized = false;
        /** Cancels the pending scheduled update check, if any. */
        this.scheduler = this._register(new MutableDisposable());
        /** Serializes reconfiguration so overlapping `update.mode` changes settle on the latest value. */
        this.reconfigureThrottler = this._register(new Throttler());
        this._onStateChange = this._register(new Emitter());
        this.onStateChange = this._onStateChange.event;
        lifecycleMainService.when(3 /* AfterWindowOpen */).finally(() => this.initialize());
        this._register(this.meteredConnectionService.onDidChangeIsConnectionMetered((isMetered) => {
          if (!isMetered) {
            this.resumeAutomaticUpdates();
          }
        }));
      }
      get state() {
        return this._state.state;
      }
      setState(state, options) {
        if (state.type === "updating" /* Updating */) {
          this.logService.trace("update#setState", state.type);
        } else {
          this.logService.info("update#setState", state.type);
        }
        this._state = { state, deferred: options?.deferred ?? false };
        this._onStateChange.fire(state);
        if (state.type === "idle" /* Idle */ && (state.error || state.notAvailable)) {
          this._state = { state: State.Idle(state.updateType), deferred: false };
        }
        if (this.supportsUpdateOverwrite) {
          if (state.type === "ready" /* Ready */) {
            this.overwriteUpdatesCheckInterval.cancelAndSet(() => this.checkForOverwriteUpdates(), 5 * 60 * 1e3);
          } else {
            this.overwriteUpdatesCheckInterval.cancel();
          }
        }
      }
      setDeferred(deferred) {
        if (this._state.deferred !== deferred) {
          this._state = { ...this._state, deferred };
        }
      }
      /**
       * This must be called before any other call. This is a performance
       * optimization, to avoid using extra CPU cycles before first window open.
       * https://github.com/microsoft/vscode/issues/89784
       */
      async initialize() {
        if (!this.environmentMainService.isBuilt) {
          this.setDisabledPermanently(0 /* NotBuilt */);
          return;
        }
        await this.trackVersionChange();
        if (this.environmentMainService.disableUpdates) {
          this.setDisabledPermanently(1 /* DisabledByEnvironment */);
          this.logService.info("update#ctor - updates are disabled by the environment");
          return;
        }
        if (!this.productService.updateUrl || !this.productService.commit) {
          this.setDisabledPermanently(4 /* MissingConfiguration */);
          this.logService.info("update#ctor - updates are disabled as there is no update URL");
          return;
        }
        await this.meteredConnectionService.whenConnectionStateInitialized;
        this._register(this.configurationService.onDidChangeConfiguration((e) => {
          if (e.affectsConfiguration("update.mode")) {
            this.reconfigure().catch((err) => this.logService.error("update#reconfigure - failed to apply update mode change", err));
          }
        }));
        await this.reconfigure();
      }
      /**
       * Evaluates the current `update.mode` setting (and its policy) and brings the service into the matching state.
       * Runs on startup and on every change, enabling or disabling updates without a restart.
       */
      reconfigure() {
        return this.reconfigureThrottler.queue(() => this.doReconfigure());
      }
      async doReconfigure() {
        if (this._disabledPermanently) {
          return;
        }
        const updateMode = this.configurationService.getValue("update.mode");
        const updateModeInspection = this.configurationService.inspect("update.mode");
        const policyDisablesUpdates = updateModeInspection.policyValue !== void 0 && !this.getProductQuality(updateModeInspection.policyValue);
        const quality = this.getProductQuality(updateMode);
        if (!quality) {
          const reason = policyDisablesUpdates ? 3 /* Policy */ : 2 /* ManuallyDisabled */;
          if (this.state.type === "disabled" /* Disabled */ && this.state.reason === reason) {
            return;
          }
          await this.disable(reason);
          return;
        }
        if (!this.buildUpdateFeedUrl(quality, this.productService.commit)) {
          this.setDisabledPermanently(5 /* InvalidConfiguration */);
          this.logService.info("update#ctor - updates are disabled as the update URL is badly formed");
          return;
        }
        this.quality = quality;
        if (this.state.type === "disabled" /* Disabled */ || this.state.type === "uninitialized" /* Uninitialized */) {
          this.setState(State.Idle(this.getUpdateType()));
        }
        if (!this._postInitialized) {
          await this.postInitialize();
          this._postInitialized = true;
        }
        this.scheduleAccordingToMode(updateMode);
      }
      /**
       * Disables updates for a reversible reason (user preference or policy), cancelling the scheduled check loop
       * and any in-flight or pending update before moving to Disabled.
       */
      async disable(reason) {
        this.scheduler.clear();
        if (isCancellableState(this.state.type)) {
          this.setState(State.Cancelling);
        }
        try {
          await this.cancelUpdate();
        } catch (err) {
          this.logService.warn("update#disable - failed to cancel pending update", err);
        }
        this.quality = void 0;
        if (reason === 3 /* Policy */) {
          this.logService.info("update#disable - updates are disabled by policy");
        } else {
          this.logService.info("update#disable - updates are disabled by user preference");
        }
        this.setState(State.Disabled(reason));
      }
      /** Disables updates for a non-reversible reason; subsequent `update.mode` changes are ignored. */
      setDisabledPermanently(reason) {
        this._disabledPermanently = true;
        this.scheduler.clear();
        this.setState(State.Disabled(reason));
      }
      scheduleAccordingToMode(updateMode) {
        this.scheduler.clear();
        if (updateMode === "manual") {
          this.logService.info("update#ctor - manual checks only; automatic updates are disabled by user preference");
          return;
        }
        if (this._state.deferred && !this.meteredConnectionService.isConnectionMetered) {
          this.resumeAutomaticUpdates();
          return;
        }
        if (this.state.type !== "idle" /* Idle */) {
          return;
        }
        this.setDeferred(false);
        if (updateMode === "start") {
          this.logService.info("update#ctor - startup checks only; automatic updates are disabled by user preference");
          this.scheduleCheckForUpdates(30 * 1e3, false);
        } else {
          this.scheduleCheckForUpdates(30 * 1e3, true);
        }
      }
      resumeAutomaticUpdates() {
        if (this._disabledPermanently || !this._postInitialized || !this.quality) {
          return;
        }
        const updateMode = this.configurationService.getValue("update.mode");
        if (updateMode === "none" || updateMode === "manual") {
          return;
        }
        if (this.state.type === "available for download" /* AvailableForDownload */) {
          if (this._state.deferred) {
            this.resumeDeferredDownload();
          }
          return;
        }
        if (this.state.type === "ready" /* Ready */) {
          if (this._state.deferred) {
            void this.checkForOverwriteUpdates();
          }
          return;
        }
        if (this.state.type !== "idle" /* Idle */) {
          return;
        }
        if (updateMode === "start" && !this._state.deferred) {
          return;
        }
        this.setDeferred(false);
        this.scheduleCheckForUpdates(0, updateMode === "default");
      }
      async trackVersionChange() {
        await this.applicationStorageMainService.whenReady;
        let from;
        const raw = this.applicationStorageMainService.get(LAST_KNOWN_VERSION_STORAGE_KEY, -1 /* APPLICATION */);
        if (typeof raw === "string") {
          try {
            from = JSON.parse(raw);
          } catch (error) {
          }
        }
        const to = {
          version: this.productService.version,
          commit: this.productService.commit,
          timestamp: Date.now()
        };
        if (from?.commit === to.commit) {
          return;
        }
        this.applicationStorageMainService.store(LAST_KNOWN_VERSION_STORAGE_KEY, JSON.stringify(to), -1 /* APPLICATION */, 1 /* MACHINE */);
        if (!from) {
          return;
        }
        this.telemetryService.publicLog2("update:versionChanged", {
          fromVersion: from.version,
          fromCommit: from.commit,
          fromVersionTime: from.timestamp,
          toVersion: to.version,
          toCommit: to.commit,
          timeToUpdateMs: to.timestamp - from.timestamp,
          updateMode: this.configurationService.getValue("update.mode")
        });
      }
      getProductQuality(updateMode) {
        return updateMode === "none" ? void 0 : this.productService.quality;
      }
      scheduleCheckForUpdates(delay = 60 * 60 * 1e3, repeat2 = true) {
        const promise = timeout(delay);
        this.scheduler.value = toDisposable(() => promise.cancel());
        promise.then(() => this.checkForUpdates(false)).then(() => {
          if (repeat2) {
            this.scheduleCheckForUpdates(60 * 60 * 1e3, true);
          }
        }).catch((err) => {
          if (!isCancellationError(err)) {
            this.logService.error(err);
          }
        });
      }
      async checkForUpdates(explicit) {
        this.logService.trace("update#checkForUpdates, state = ", this.state.type);
        if (this.state.type !== "idle" /* Idle */) {
          return;
        }
        if (!explicit && this.meteredConnectionService.isConnectionMetered) {
          this.setDeferred(true);
          this.logService.info("update#checkForUpdates - skipping automatic check because connection is metered");
          return;
        }
        this.setDeferred(false);
        this.doCheckForUpdates(explicit);
      }
      async downloadUpdate(explicit) {
        this.logService.trace("update#downloadUpdate, state = ", this.state.type);
        if (this.state.type !== "available for download" /* AvailableForDownload */) {
          return;
        }
        if (!explicit && this.meteredConnectionService.isConnectionMetered) {
          this.setDeferred(true);
          this.logService.info("update#downloadUpdate - skipping download because connection is metered");
          return;
        }
        this.setDeferred(false);
        await this.doDownloadUpdate(this.state);
      }
      async doDownloadUpdate(state) {
      }
      resumeDeferredDownload() {
        void this.downloadUpdate(false);
      }
      deferAutomaticDownload(update, explicit) {
        if (explicit || !this.meteredConnectionService.isConnectionMetered) {
          return false;
        }
        this.logService.info("update#deferAutomaticDownload - deferring download because connection is metered");
        this.setState(State.AvailableForDownload(update), { deferred: true });
        return true;
      }
      async applyUpdate() {
        this.logService.trace("update#applyUpdate, state = ", this.state.type);
        if (this.state.type !== "downloaded" /* Downloaded */) {
          return;
        }
        await this.doApplyUpdate();
      }
      async doApplyUpdate() {
      }
      async quitAndInstall() {
        this.logService.trace("update#quitAndInstall, state = ", this.state.type);
        if (this.state.type !== "ready" /* Ready */) {
          return void 0;
        }
        if (this.supportsUpdateOverwrite && !this._hasCheckedForOverwriteOnQuit) {
          this._hasCheckedForOverwriteOnQuit = true;
          const didOverwrite = await this.checkForOverwriteUpdates(true);
          if (didOverwrite) {
            this.logService.info("update#quitAndInstall(): overwrite update detected, postponing quitAndInstall");
            return;
          }
        }
        const readyState = this.state;
        this.setState(State.Restarting(this.state.update));
        this.logService.trace("update#quitAndInstall(): before lifecycle quit()");
        this.lifecycleMainService.quit(
          true
          /* will restart */
        ).then((vetod) => {
          this.logService.trace(`update#quitAndInstall(): after lifecycle quit() with veto: ${vetod}`);
          if (vetod) {
            this.logService.info("update#quitAndInstall(): quit was vetoed, restoring Ready state");
            this.setState(readyState);
            return;
          }
          this.logService.trace("update#quitAndInstall(): running raw#quitAndInstall()");
          this.doQuitAndInstall();
        });
        return Promise.resolve(void 0);
      }
      async checkForOverwriteUpdates(explicit = false) {
        if (this.state.type !== "ready" /* Ready */) {
          return false;
        }
        if (this.deferOverwriteCheckIfMetered(explicit)) {
          return false;
        }
        this.setDeferred(false);
        const pendingUpdateCommit = this.state.update.version;
        if (!pendingUpdateCommit || pendingUpdateCommit === "unknown") {
          return false;
        }
        let isLatest;
        const cts = new CancellationTokenSource();
        try {
          const timeoutPromise = timeout(2e3, cts.token).then(() => {
            cts.cancel();
            return void 0;
          });
          isLatest = await Promise.race([this.doIsLatestVersion(pendingUpdateCommit, cts.token), timeoutPromise]);
        } catch (error) {
          this.logService.warn("update#checkForOverwriteUpdates(): failed to check for updates, proceeding with restart");
          this.logService.warn(error);
          return false;
        } finally {
          cts.dispose(true);
        }
        if (isLatest === false && this.state.type === "ready" /* Ready */) {
          if (this.deferOverwriteCheckIfMetered(explicit)) {
            return false;
          }
          this.logService.info("update#readyStateCheck: newer update available, restarting update machinery");
          try {
            await this.cancelPendingUpdate();
          } catch (error) {
            this.logService.error("update#checkForOverwriteUpdates(): failed to cancel pending update, aborting overwrite");
            this.logService.error(error);
            return false;
          }
          if (this.deferOverwriteCheckIfMetered(explicit)) {
            return false;
          }
          this._overwrite = true;
          this.setState(State.Overwriting(this.state.update, explicit));
          this.doCheckForUpdates(explicit, pendingUpdateCommit);
          return true;
        }
        return false;
      }
      deferOverwriteCheckIfMetered(explicit) {
        if (explicit || !this.meteredConnectionService.isConnectionMetered) {
          return false;
        }
        this.setDeferred(true);
        this.logService.info("update#checkForOverwriteUpdates - deferring overwrite because connection is metered");
        return true;
      }
      async isLatestVersion(commit, token = CancellationToken.None) {
        if (this.meteredConnectionService.isConnectionMetered) {
          this.logService.info("update#isLatestVersion - skipping automatic check because connection is metered");
          return void 0;
        }
        return this.doIsLatestVersion(commit, token);
      }
      async doIsLatestVersion(commit, token = CancellationToken.None) {
        if (!this.quality) {
          return void 0;
        }
        const mode = this.configurationService.getValue("update.mode");
        if (mode === "none") {
          return void 0;
        }
        const url = this.buildUpdateFeedUrl(this.quality, commit ?? this.productService.commit, { internalOrg: this.getInternalOrg() });
        if (!url) {
          return void 0;
        }
        const headers = getUpdateRequestHeaders(this.productService.version);
        this.logService.trace("update#isLatestVersion() - checking update server", { url, headers });
        try {
          const context = await this.requestService.request({ url, headers, callSite: "updateService.isLatestVersion" }, token);
          const statusCode = context.res.statusCode;
          this.logService.trace("update#isLatestVersion() - response", { statusCode });
          return statusCode === 204;
        } catch (error) {
          this.logService.error("update#isLatestVersion(): failed to check for updates");
          this.logService.error(error);
          return void 0;
        }
      }
      async _applySpecificUpdate(packagePath) {
      }
      async setInternalOrg(internalOrg) {
        if (this._internalOrg === internalOrg) {
          return;
        }
        this.logService.info("update#setInternalOrg", internalOrg);
        this._internalOrg = internalOrg;
      }
      getInternalOrg() {
        return this._internalOrg;
      }
      getUpdateType() {
        return 1 /* Archive */;
      }
      doQuitAndInstall() {
      }
      async postInitialize() {
      }
      async cancelPendingUpdate() {
      }
      /**
       * Aborts in-flight or pending update work when updates are being disabled at runtime. The default cancels a
       * pending update; platform services override this to also abort in-flight checks/downloads.
       */
      async cancelUpdate() {
        await this.cancelPendingUpdate();
      }
    };
    AbstractUpdateService = __decorateClass([
      __decorateParam(0, ILifecycleMainService),
      __decorateParam(1, IConfigurationService),
      __decorateParam(2, IEnvironmentMainService),
      __decorateParam(3, IRequestService),
      __decorateParam(4, ILogService),
      __decorateParam(5, IProductService),
      __decorateParam(6, ITelemetryService),
      __decorateParam(7, IApplicationStorageMainService),
      __decorateParam(8, IMeteredConnectionService)
    ], AbstractUpdateService);
  }
});
export { createUpdateURL, getUpdateRequestHeaders, isCancellableState, os3, LAST_KNOWN_VERSION_STORAGE_KEY, AbstractUpdateService, init_abstractUpdateService };
