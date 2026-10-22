// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/update/electron-main/updateService.darwin.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { CancellationToken, init_cancellation } from "./module-0022.mjs";
import { init_decorators, memoize } from "./module-0052.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { hash, init_hash } from "./module-0067.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { IRequestService, asJson, init_request } from "./module-0155.mjs";
import { IApplicationStorageMainService, init_storageMainService } from "./module-0109.mjs";
import { ITelemetryService, init_telemetry } from "./module-0104.mjs";
import { State, init_update } from "./module-0201.mjs";
import { IMeteredConnectionService, init_meteredConnection } from "./module-0206.mjs";
import { AbstractUpdateService, createUpdateURL, getUpdateRequestHeaders, init_abstractUpdateService } from "./module-0224.mjs";


// src/vs/platform/update/electron-main/updateService.darwin.ts
import * as electron7 from "electron";

var DarwinUpdateService;

var init_updateService_darwin = __esm({
  "src/vs/platform/update/electron-main/updateService.darwin.ts"() {
    init_cancellation();
    init_decorators();
    init_event();
    init_hash();
    init_configuration();
    init_environmentMainService();
    init_lifecycleMainService();
    init_log();
    init_productService();
    init_request();
    init_storageMainService();
    init_telemetry();
    init_update();
    init_meteredConnection();
    init_abstractUpdateService();
    DarwinUpdateService = class extends AbstractUpdateService {
      get onRawError() {
        return Event.fromNodeEventEmitter(electron7.autoUpdater, "error", (_, message) => message);
      }
      get onRawCheckingForUpdate() {
        return Event.fromNodeEventEmitter(electron7.autoUpdater, "checking-for-update");
      }
      get onRawUpdateNotAvailable() {
        return Event.fromNodeEventEmitter(electron7.autoUpdater, "update-not-available");
      }
      get onRawUpdateAvailable() {
        return Event.fromNodeEventEmitter(electron7.autoUpdater, "update-available");
      }
      get onRawUpdateDownloaded() {
        return Event.fromNodeEventEmitter(electron7.autoUpdater, "update-downloaded", (_, version, productVersion, releaseDate) => ({
          version,
          productVersion,
          timestamp: releaseDate instanceof Date ? releaseDate.getTime() || void 0 : releaseDate
        }));
      }
      constructor(lifecycleMainService, configurationService, telemetryService, environmentMainService, requestService, logService, productService, applicationStorageMainService, meteredConnectionService) {
        super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService, telemetryService, applicationStorageMainService, meteredConnectionService, true);
        lifecycleMainService.setRelaunchHandler(this);
      }
      handleRelaunch(options) {
        if (options?.addArgs || options?.removeArgs) {
          return false;
        }
        if (this.state.type !== "ready" /* Ready */) {
          return false;
        }
        this.logService.trace("update#handleRelaunch(): running raw#quitAndInstall()");
        this.doQuitAndInstall();
        return true;
      }
      async initialize() {
        await super.initialize();
        this.onRawError(this.onError, this, this._store);
        this.onRawCheckingForUpdate(this.onCheckingForUpdate, this, this._store);
        this.onRawUpdateAvailable(this.onUpdateAvailable, this, this._store);
        this.onRawUpdateDownloaded(this.onUpdateDownloaded, this, this._store);
        this.onRawUpdateNotAvailable(this.onUpdateNotAvailable, this, this._store);
      }
      onCheckingForUpdate() {
        this.logService.trace("update#onCheckingForUpdate - Electron autoUpdater is checking for updates");
      }
      onError(err) {
        this.telemetryService.publicLog2("update:error", { messageHash: String(hash(String(err))) });
        this.logService.error("UpdateService error:", err);
        if (this.state.type !== "checking for updates" /* CheckingForUpdates */ && this.state.type !== "downloading" /* Downloading */ && this.state.type !== "overwriting" /* Overwriting */) {
          return;
        }
        const message = this.state.type === "checking for updates" /* CheckingForUpdates */ && this.state.explicit ? err : void 0;
        this.setState(State.Idle(1 /* Archive */, message));
      }
      buildUpdateFeedUrl(quality, commit, options) {
        const assetID = this.productService.darwinUniversalAssetId ?? (process.arch === "x64" ? "darwin" : "darwin-arm64");
        const url = createUpdateURL(this.productService.updateUrl, assetID, quality, commit, options);
        const headers = getUpdateRequestHeaders(this.productService.version);
        try {
          this.logService.trace("update#buildUpdateFeedUrl - setting feed URL for Electron autoUpdater", { url, assetID, quality, commit, headers });
          electron7.autoUpdater.setFeedURL({ url, headers });
        } catch (e) {
          this.logService.error("Failed to set update feed URL", e);
          return void 0;
        }
        return url;
      }
      doCheckForUpdates(explicit, pendingCommit) {
        if (!this.quality) {
          return;
        }
        this.setState(State.CheckingForUpdates(explicit));
        const internalOrg = this.getInternalOrg();
        const background = !explicit && !internalOrg;
        const url = this.buildUpdateFeedUrl(this.quality, pendingCommit ?? this.productService.commit, { background, internalOrg });
        if (!url) {
          this.setState(State.Idle(1 /* Archive */));
          return;
        }
        if (!explicit && this.meteredConnectionService.isConnectionMetered) {
          this.logService.info("update#doCheckForUpdates - checking for update without auto-download because connection is metered");
          this.checkForUpdateNoDownload(url);
          return;
        }
        this.logService.trace("update#doCheckForUpdates - using Electron autoUpdater", { url, explicit, background });
        electron7.autoUpdater.checkForUpdates();
      }
      /**
       * Manually check the update feed URL without triggering Electron's auto-download.
       * Used when connection is metered or in the embedded app.
       * @param canInstall When false, signals that the update cannot be installed from this app.
       */
      async checkForUpdateNoDownload(url, canInstall) {
        const headers = getUpdateRequestHeaders(this.productService.version);
        this.logService.trace("update#checkForUpdateNoDownload - checking update server", { url, headers });
        try {
          const context = await this.requestService.request({ url, headers, callSite: "updateService.darwin.checkForUpdates" }, CancellationToken.None);
          const statusCode = context.res.statusCode;
          this.logService.trace("update#checkForUpdateNoDownload - response", { statusCode });
          const update = await asJson(context);
          if (!update || !update.url || !update.version || !update.productVersion) {
            this.logService.trace("update#checkForUpdateNoDownload - no update available");
            const notAvailable = this.state.type === "checking for updates" /* CheckingForUpdates */ && this.state.explicit;
            this.setState(State.Idle(1 /* Archive */, void 0, notAvailable || void 0));
          } else {
            this.logService.trace("update#checkForUpdateNoDownload - update available", { version: update.version, productVersion: update.productVersion });
            this.setState(State.AvailableForDownload(update, canInstall));
          }
        } catch (err) {
          this.logService.error("update#checkForUpdateNoDownload - failed to check for update", err);
          this.setState(State.Idle(1 /* Archive */));
        }
      }
      onUpdateAvailable() {
        this.logService.trace("update#onUpdateAvailable - Electron autoUpdater reported update available");
        if (this.state.type !== "checking for updates" /* CheckingForUpdates */ && this.state.type !== "overwriting" /* Overwriting */) {
          return;
        }
        this.setState(State.Downloading(this.state.type === "overwriting" /* Overwriting */ ? this.state.update : void 0, this.state.explicit, this._overwrite));
      }
      onUpdateDownloaded(update) {
        if (this.state.type !== "downloading" /* Downloading */) {
          return;
        }
        this.setState(State.Downloaded(update, this.state.explicit, this._overwrite));
        this.logService.info(`Update downloaded: ${JSON.stringify(update)}`);
        this.setState(State.Ready(update, this.state.explicit, this._overwrite));
      }
      onUpdateNotAvailable() {
        this.logService.trace("update#onUpdateNotAvailable - Electron autoUpdater reported no update available");
        if (this.state.type !== "checking for updates" /* CheckingForUpdates */) {
          return;
        }
        const notAvailable = this.state.explicit;
        this.setState(State.Idle(1 /* Archive */, void 0, notAvailable || void 0));
      }
      async doDownloadUpdate(state) {
        this.buildUpdateFeedUrl(this.quality, state.update.version, { internalOrg: this.getInternalOrg() });
        this.setState(State.CheckingForUpdates(true));
        electron7.autoUpdater.checkForUpdates();
      }
      doQuitAndInstall() {
        this.logService.trace("update#quitAndInstall(): running raw#quitAndInstall()");
        electron7.autoUpdater.quitAndInstall();
      }
    };
    __decorateClass([
      memoize
    ], DarwinUpdateService.prototype, "onRawError", 1);
    __decorateClass([
      memoize
    ], DarwinUpdateService.prototype, "onRawCheckingForUpdate", 1);
    __decorateClass([
      memoize
    ], DarwinUpdateService.prototype, "onRawUpdateNotAvailable", 1);
    __decorateClass([
      memoize
    ], DarwinUpdateService.prototype, "onRawUpdateAvailable", 1);
    __decorateClass([
      memoize
    ], DarwinUpdateService.prototype, "onRawUpdateDownloaded", 1);
    DarwinUpdateService = __decorateClass([
      __decorateParam(0, ILifecycleMainService),
      __decorateParam(1, IConfigurationService),
      __decorateParam(2, ITelemetryService),
      __decorateParam(3, IEnvironmentMainService),
      __decorateParam(4, IRequestService),
      __decorateParam(5, ILogService),
      __decorateParam(6, IProductService),
      __decorateParam(7, IApplicationStorageMainService),
      __decorateParam(8, IMeteredConnectionService)
    ], DarwinUpdateService);
  }
});
export { electron7, DarwinUpdateService, init_updateService_darwin };
