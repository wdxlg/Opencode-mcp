// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/userDataAutoSyncService.ts
import { Disposable, MutableDisposable, toDisposable } from "./module-0013.mjs";
import { Emitter, Event } from "./module-0018.mjs";
import { ThrottledDelayer, createCancelablePromise, disposableTimeout, timeout } from "./module-0029.mjs";
import { isEqual2 } from "./module-0027.mjs";
import { URI } from "./module-0024.mjs";
import { toLocalISOString } from "./module-0159.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncLogService, IUserDataSyncService, IUserDataSyncStoreManagementService, IUserDataSyncStoreService, UserDataAutoSyncError, UserDataSyncError } from "./module-0157.mjs";
import { isWeb } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0045.mjs";
import { IUserDataSyncAccountService } from "./module-0158.mjs";
import { ITelemetryService } from "./module-0085.mjs";
import { IUserDataSyncMachinesService } from "./module-0165.mjs";
import { IStorageService } from "./module-0096.mjs";
import { IMeteredConnectionService } from "./module-0258.mjs";
import { isCancellationError } from "./module-0003.mjs";
import { localize } from "./module-0007.mjs";
import { toErrorMessage } from "./module-0008.mjs";


// src/vs/platform/userDataSync/common/userDataAutoSyncService.ts
var disableMachineEventuallyKey = "sync.disableMachineEventually";

var sessionIdKey = "sync.sessionId";

var storeUrlKey = "sync.storeUrl";

var productQualityKey = "sync.productQuality";

var UserDataAutoSyncService = class extends Disposable {
  constructor(productService, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncEnablementService, userDataSyncService, logService, userDataSyncAccountService, telemetryService, userDataSyncMachinesService, storageService, meteredConnectionService) {
    super();
    this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
    this.userDataSyncStoreService = userDataSyncStoreService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.userDataSyncService = userDataSyncService;
    this.logService = logService;
    this.userDataSyncAccountService = userDataSyncAccountService;
    this.telemetryService = telemetryService;
    this.userDataSyncMachinesService = userDataSyncMachinesService;
    this.storageService = storageService;
    this.meteredConnectionService = meteredConnectionService;
    this.autoSync = this._register(new MutableDisposable());
    this.successiveFailures = 0;
    this.lastSyncTriggerTime = void 0;
    this.suspendUntilRestart = false;
    this._onError = this._register(new Emitter());
    this.onError = this._onError.event;
    this.sources = [];
    this.syncTriggerDelayer = this._register(new ThrottledDelayer(this.getSyncTriggerDelayTime()));
    this.lastSyncUrl = this.syncUrl;
    this.syncUrl = userDataSyncStoreManagementService.userDataSyncStore?.url;
    this.previousProductQuality = this.productQuality;
    this.productQuality = productService.quality;
    if (this.syncUrl) {
      this.logService.info("[AutoSync] Using settings sync service", this.syncUrl.toString());
      this._register(userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(() => {
        if (!isEqual2(this.syncUrl, userDataSyncStoreManagementService.userDataSyncStore?.url)) {
          this.lastSyncUrl = this.syncUrl;
          this.syncUrl = userDataSyncStoreManagementService.userDataSyncStore?.url;
          if (this.syncUrl) {
            this.logService.info("[AutoSync] Using settings sync service", this.syncUrl.toString());
          }
        }
      }));
      if (this.userDataSyncEnablementService.isEnabled()) {
        this.logService.info("[AutoSync] Enabled.");
      } else {
        this.logService.info("[AutoSync] Disabled.");
      }
      this.updateAutoSync();
      if (this.hasToDisableMachineEventually()) {
        this.disableMachineEventually();
      }
      this._register(userDataSyncAccountService.onDidChangeAccount(() => this.updateAutoSync()));
      this._register(userDataSyncStoreService.onDidChangeDonotMakeRequestsUntil(() => this.updateAutoSync()));
      this._register(userDataSyncService.onDidChangeLocal((source) => this.triggerSync([source])));
      this._register(Event.filter(this.userDataSyncEnablementService.onDidChangeResourceEnablement, ([, enabled]) => enabled)(() => this.triggerSync(["resourceEnablement"])));
      this._register(this.userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(() => this.triggerSync(["userDataSyncStoreChanged"])));
      this._register(meteredConnectionService.onDidChangeIsConnectionMetered(() => this.updateAutoSync()));
    }
  }
  get syncUrl() {
    const value = this.storageService.get(storeUrlKey, -1 /* APPLICATION */);
    return value ? URI.parse(value) : void 0;
  }
  set syncUrl(syncUrl) {
    if (syncUrl) {
      this.storageService.store(storeUrlKey, syncUrl.toString(), -1 /* APPLICATION */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(storeUrlKey, -1 /* APPLICATION */);
    }
  }
  get productQuality() {
    return this.storageService.get(productQualityKey, -1 /* APPLICATION */);
  }
  set productQuality(productQuality) {
    if (productQuality) {
      this.storageService.store(productQualityKey, productQuality, -1 /* APPLICATION */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(productQualityKey, -1 /* APPLICATION */);
    }
  }
  updateAutoSync() {
    const { enabled, message } = this.isAutoSyncEnabled();
    if (enabled) {
      if (this.autoSync.value === void 0) {
        this.autoSync.value = new AutoSync(this.lastSyncUrl, 1e3 * 60 * 5, this.userDataSyncStoreManagementService, this.userDataSyncStoreService, this.userDataSyncService, this.userDataSyncMachinesService, this.logService, this.telemetryService, this.storageService);
        this.autoSync.value.register(this.autoSync.value.onDidStartSync(() => this.lastSyncTriggerTime = (/* @__PURE__ */ new Date()).getTime()));
        this.autoSync.value.register(this.autoSync.value.onDidFinishSync((e) => this.onDidFinishSync(e)));
        if (this.startAutoSync()) {
          this.autoSync.value.start();
        }
      }
    } else {
      this.syncTriggerDelayer.cancel();
      if (this.autoSync.value !== void 0) {
        if (message) {
          this.logService.info(message);
        }
        this.autoSync.clear();
      } else if (message && this.userDataSyncEnablementService.isEnabled()) {
        this.logService.info(message);
      }
    }
  }
  // For tests purpose only
  startAutoSync() {
    return true;
  }
  isAutoSyncEnabled() {
    if (!this.userDataSyncEnablementService.isEnabled()) {
      return { enabled: false, message: "[AutoSync] Disabled." };
    }
    if (!this.userDataSyncAccountService.account) {
      return { enabled: false, message: "[AutoSync] Suspended until auth token is available." };
    }
    if (this.userDataSyncStoreService.donotMakeRequestsUntil) {
      return { enabled: false, message: `[AutoSync] Suspended until ${toLocalISOString(this.userDataSyncStoreService.donotMakeRequestsUntil)} because server is not accepting requests until then.` };
    }
    if (this.suspendUntilRestart) {
      return { enabled: false, message: "[AutoSync] Suspended until restart." };
    }
    if (this.meteredConnectionService.isConnectionMetered) {
      return { enabled: false, message: "[AutoSync] Suspended because connection is metered." };
    }
    return { enabled: true };
  }
  async turnOn() {
    this.stopDisableMachineEventually();
    this.lastSyncUrl = this.syncUrl;
    this.updateEnablement(true);
  }
  async turnOff(everywhere, softTurnOffOnError, donotRemoveMachine) {
    try {
      if (this.userDataSyncAccountService.account && !donotRemoveMachine) {
        await this.userDataSyncMachinesService.removeCurrentMachine();
      }
      this.updateEnablement(false);
      this.storageService.remove(sessionIdKey, -1 /* APPLICATION */);
      if (everywhere) {
        await this.userDataSyncService.reset();
      } else {
        await this.userDataSyncService.resetLocal();
      }
    } catch (error) {
      this.logService.error(error);
      if (softTurnOffOnError) {
        this.updateEnablement(false);
      } else {
        throw error;
      }
    }
  }
  updateEnablement(enabled) {
    if (this.userDataSyncEnablementService.isEnabled() !== enabled) {
      this.userDataSyncEnablementService.setEnablement(enabled);
      this.updateAutoSync();
    }
  }
  hasProductQualityChanged() {
    return !!this.previousProductQuality && !!this.productQuality && this.previousProductQuality !== this.productQuality;
  }
  async onDidFinishSync(error) {
    this.logService.debug("[AutoSync] Sync Finished");
    if (!error) {
      this.successiveFailures = 0;
      return;
    }
    const userDataSyncError = UserDataSyncError.toUserDataSyncError(error);
    if (userDataSyncError.code === "SessionExpired" /* SessionExpired */) {
      await this.turnOff(
        false,
        true
        /* force soft turnoff on error */
      );
      this.logService.info("[AutoSync] Turned off sync because current session is expired");
    } else if (userDataSyncError.code === "TurnedOff" /* TurnedOff */) {
      await this.turnOff(
        false,
        true
        /* force soft turnoff on error */
      );
      this.logService.info("[AutoSync] Turned off sync because sync is turned off in the cloud");
    } else if (userDataSyncError.code === "LocalTooManyRequests" /* LocalTooManyRequests */) {
      this.suspendUntilRestart = true;
      this.logService.info("[AutoSync] Suspended sync because of making too many requests to server");
      this.updateAutoSync();
    } else if (userDataSyncError.code === "RemoteTooManyRequests" /* TooManyRequests */) {
      await this.turnOff(
        false,
        true,
        true
        /* do not disable machine because disabling a machine makes request to server and can fail with TooManyRequests */
      );
      this.disableMachineEventually();
      this.logService.info("[AutoSync] Turned off sync because of making too many requests to server");
    } else if (userDataSyncError.code === "MethodNotFound" /* MethodNotFound */) {
      await this.turnOff(
        false,
        true
        /* force soft turnoff on error */
      );
      this.logService.info("[AutoSync] Turned off sync because current client is making requests to server that are not supported");
    } else if (userDataSyncError.code === "UpgradeRequired" /* UpgradeRequired */ || userDataSyncError.code === "Gone" /* Gone */) {
      await this.turnOff(
        false,
        true,
        true
        /* do not disable machine because disabling a machine makes request to server and can fail with upgrade required or gone */
      );
      this.disableMachineEventually();
      this.logService.info("[AutoSync] Turned off sync because current client is not compatible with server. Requires client upgrade.");
    } else if (userDataSyncError.code === "IncompatibleLocalContent" /* IncompatibleLocalContent */) {
      await this.turnOff(
        false,
        true
        /* force soft turnoff on error */
      );
      this.logService.info(`[AutoSync] Turned off sync because server has ${userDataSyncError.resource} content with newer version than of client. Requires client upgrade.`);
    } else if (userDataSyncError.code === "IncompatibleRemoteContent" /* IncompatibleRemoteContent */) {
      await this.turnOff(
        false,
        true
        /* force soft turnoff on error */
      );
      this.logService.info(`[AutoSync] Turned off sync because server has ${userDataSyncError.resource} content with older version than of client. Requires server reset.`);
    } else if (userDataSyncError.code === "ServiceChanged" /* ServiceChanged */ || userDataSyncError.code === "DefaultServiceChanged" /* DefaultServiceChanged */) {
      if (isWeb && userDataSyncError.code === "DefaultServiceChanged" /* DefaultServiceChanged */ && !this.hasProductQualityChanged()) {
        await this.turnOff(
          false,
          true
          /* force soft turnoff on error */
        );
        this.logService.info("[AutoSync] Turned off sync because default sync service is changed.");
      } else {
        await this.turnOff(
          false,
          true,
          true
          /* do not disable machine */
        );
        await this.turnOn();
        this.logService.info("[AutoSync] Sync Service changed. Turned off auto sync, reset local state and turned on auto sync.");
      }
    } else {
      this.logService.error(userDataSyncError);
      this.successiveFailures++;
    }
    this._onError.fire(userDataSyncError);
  }
  async disableMachineEventually() {
    this.storageService.store(disableMachineEventuallyKey, true, -1 /* APPLICATION */, 1 /* MACHINE */);
    await timeout(1e3 * 60 * 10);
    if (!this.hasToDisableMachineEventually()) {
      return;
    }
    this.stopDisableMachineEventually();
    if (!this.userDataSyncEnablementService.isEnabled() && this.userDataSyncAccountService.account) {
      await this.userDataSyncMachinesService.removeCurrentMachine();
    }
  }
  hasToDisableMachineEventually() {
    return this.storageService.getBoolean(disableMachineEventuallyKey, -1 /* APPLICATION */, false);
  }
  stopDisableMachineEventually() {
    this.storageService.remove(disableMachineEventuallyKey, -1 /* APPLICATION */);
  }
  async triggerSync(sources, options) {
    if (this.autoSync.value === void 0) {
      return this.syncTriggerDelayer.cancel();
    }
    if (options?.skipIfSyncedRecently && this.lastSyncTriggerTime && (/* @__PURE__ */ new Date()).getTime() - this.lastSyncTriggerTime < 1e4) {
      this.logService.debug("[AutoSync] Skipping because sync was triggered recently.", sources);
      return;
    }
    this.sources.push(...sources);
    return this.syncTriggerDelayer.trigger(async () => {
      this.logService.trace("[AutoSync] Activity sources", ...this.sources);
      this.sources = [];
      if (this.autoSync.value) {
        await this.autoSync.value.sync("Activity", !!options?.disableCache);
      }
    }, this.successiveFailures ? Math.min(this.getSyncTriggerDelayTime() * this.successiveFailures, 6e4) : options?.immediately ? 0 : this.getSyncTriggerDelayTime());
  }
  getSyncTriggerDelayTime() {
    if (this.lastSyncTriggerTime && (/* @__PURE__ */ new Date()).getTime() - this.lastSyncTriggerTime > 1e4) {
      this.logService.debug("[AutoSync] Sync immediately because last sync was triggered more than 10 seconds ago.");
      return 0;
    }
    return 3e3;
  }
};

UserDataAutoSyncService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IUserDataSyncStoreManagementService),
  __decorateParam(2, IUserDataSyncStoreService),
  __decorateParam(3, IUserDataSyncEnablementService),
  __decorateParam(4, IUserDataSyncService),
  __decorateParam(5, IUserDataSyncLogService),
  __decorateParam(6, IUserDataSyncAccountService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IUserDataSyncMachinesService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, IMeteredConnectionService)
], UserDataAutoSyncService);

var AutoSync = class _AutoSync extends Disposable {
  constructor(lastSyncUrl, interval, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncService, userDataSyncMachinesService, logService, telemetryService, storageService) {
    super();
    this.lastSyncUrl = lastSyncUrl;
    this.interval = interval;
    this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
    this.userDataSyncStoreService = userDataSyncStoreService;
    this.userDataSyncService = userDataSyncService;
    this.userDataSyncMachinesService = userDataSyncMachinesService;
    this.logService = logService;
    this.telemetryService = telemetryService;
    this.storageService = storageService;
    this.intervalHandler = this._register(new MutableDisposable());
    this._onDidStartSync = this._register(new Emitter());
    this.onDidStartSync = this._onDidStartSync.event;
    this._onDidFinishSync = this._register(new Emitter());
    this.onDidFinishSync = this._onDidFinishSync.event;
    this.manifest = null;
  }
  static {
    this.INTERVAL_SYNCING = "Interval";
  }
  start() {
    this._register(this.onDidFinishSync(() => this.waitUntilNextIntervalAndSync()));
    this._register(toDisposable(() => {
      if (this.syncPromise) {
        this.syncPromise.cancel();
        this.logService.info("[AutoSync] Cancelled sync that is in progress");
        this.syncPromise = void 0;
      }
      this.syncTask?.stop();
      this.logService.info("[AutoSync] Stopped");
    }));
    this.sync(_AutoSync.INTERVAL_SYNCING, false);
  }
  waitUntilNextIntervalAndSync() {
    this.intervalHandler.value = disposableTimeout(() => {
      this.sync(_AutoSync.INTERVAL_SYNCING, false);
      this.intervalHandler.value = void 0;
    }, this.interval);
  }
  sync(reason, disableCache) {
    const syncPromise = createCancelablePromise(async (token) => {
      if (this.syncPromise) {
        try {
          this.logService.debug("[AutoSync] Waiting until sync is finished.");
          await this.syncPromise;
        } catch (error) {
          if (isCancellationError(error)) {
            return;
          }
        }
      }
      return this.doSync(reason, disableCache, token);
    });
    this.syncPromise = syncPromise;
    this.syncPromise.finally(() => this.syncPromise = void 0);
    return this.syncPromise;
  }
  hasSyncServiceChanged() {
    return this.lastSyncUrl !== void 0 && !isEqual2(this.lastSyncUrl, this.userDataSyncStoreManagementService.userDataSyncStore?.url);
  }
  async hasDefaultServiceChanged() {
    const previous = await this.userDataSyncStoreManagementService.getPreviousUserDataSyncStore();
    const current = this.userDataSyncStoreManagementService.userDataSyncStore;
    return !!current && !!previous && (!isEqual2(current.defaultUrl, previous.defaultUrl) || !isEqual2(current.insidersUrl, previous.insidersUrl) || !isEqual2(current.stableUrl, previous.stableUrl));
  }
  async doSync(reason, disableCache, token) {
    this.logService.info(`[AutoSync] Triggered by ${reason}`);
    this._onDidStartSync.fire();
    let error;
    try {
      await this.createAndRunSyncTask(disableCache, token);
    } catch (e) {
      this.logService.error(e);
      error = e;
      if (UserDataSyncError.toUserDataSyncError(e).code === "MethodNotFound" /* MethodNotFound */) {
        try {
          this.logService.info("[AutoSync] Client is making invalid requests. Cleaning up data...");
          await this.userDataSyncService.cleanUpRemoteData();
          this.logService.info("[AutoSync] Retrying sync...");
          await this.createAndRunSyncTask(disableCache, token);
          error = void 0;
        } catch (e1) {
          this.logService.error(e1);
          error = e1;
        }
      }
    }
    this._onDidFinishSync.fire(error);
  }
  async createAndRunSyncTask(disableCache, token) {
    this.syncTask = await this.userDataSyncService.createSyncTask(this.manifest, disableCache);
    if (token.isCancellationRequested) {
      return;
    }
    this.manifest = this.syncTask.manifest;
    if (this.manifest === null && await this.userDataSyncService.hasPreviouslySynced()) {
      if (this.hasSyncServiceChanged()) {
        if (await this.hasDefaultServiceChanged()) {
          throw new UserDataAutoSyncError(localize(3683, null), "DefaultServiceChanged" /* DefaultServiceChanged */);
        } else {
          throw new UserDataAutoSyncError(localize(3684, null), "ServiceChanged" /* ServiceChanged */);
        }
      } else {
        throw new UserDataAutoSyncError(localize(3686, null), "TurnedOff" /* TurnedOff */);
      }
    }
    const sessionId = this.storageService.get(sessionIdKey, -1 /* APPLICATION */);
    if (sessionId && this.manifest && sessionId !== this.manifest.session) {
      if (this.hasSyncServiceChanged()) {
        if (await this.hasDefaultServiceChanged()) {
          throw new UserDataAutoSyncError(localize(3683, null), "DefaultServiceChanged" /* DefaultServiceChanged */);
        } else {
          throw new UserDataAutoSyncError(localize(3684, null), "ServiceChanged" /* ServiceChanged */);
        }
      } else {
        throw new UserDataAutoSyncError(localize(3685, null), "SessionExpired" /* SessionExpired */);
      }
    }
    const machines = await this.userDataSyncMachinesService.getMachines(this.manifest || void 0);
    if (token.isCancellationRequested) {
      return;
    }
    const currentMachine = machines.find((machine) => machine.isCurrent);
    if (currentMachine?.disabled) {
      throw new UserDataAutoSyncError(localize(3687, null), "TurnedOff" /* TurnedOff */);
    }
    const startTime = (/* @__PURE__ */ new Date()).getTime();
    await this.syncTask.run();
    this.telemetryService.publicLog2("settingsSync:sync", { duration: (/* @__PURE__ */ new Date()).getTime() - startTime });
    if (this.manifest === null) {
      try {
        this.manifest = await this.userDataSyncStoreService.manifest(null);
      } catch (error) {
        throw new UserDataAutoSyncError(toErrorMessage(error), error instanceof UserDataSyncError ? error.code : "Unknown" /* Unknown */);
      }
    }
    if (this.manifest && this.manifest.session !== sessionId) {
      this.storageService.store(sessionIdKey, this.manifest.session, -1 /* APPLICATION */, 1 /* MACHINE */);
    }
    if (token.isCancellationRequested) {
      return;
    }
    if (!currentMachine) {
      await this.userDataSyncMachinesService.addCurrentMachine(this.manifest || void 0);
    }
  }
  register(t) {
    return super._register(t);
  }
};
export { disableMachineEventuallyKey, sessionIdKey, storeUrlKey, productQualityKey, UserDataAutoSyncService, AutoSync };
