// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/abstractSynchronizer.ts
import { uppercaseFirstLetter } from "./module-0030.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ThrottledDelayer, createCancelablePromise } from "./module-0036.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncStoreService, IUserDataSyncUtilService, NON_EXISTING_RESOURCE_REF, PREVIEW_DIR_NAME, USER_DATA_SYNC_CONFIGURATION_SCOPE, USER_DATA_SYNC_SCHEME, UserDataSyncError, getLastSyncResourceUri, getPathSegments } from "./module-1696.mjs";
import { getServiceMachineId } from "./module-0889.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { isString, isUndefined } from "./module-0010.mjs";
import { localize } from "./module-0001.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { equals } from "./module-0007.mjs";
import { FileOperationError, IFileService, toFileOperationResult } from "./module-0269.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { parse5 } from "./module-0883.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/platform/userDataSync/common/abstractSynchronizer.ts
function isRemoteUserData(thing) {
  if (thing && (thing.ref !== void 0 && typeof thing.ref === "string" && thing.ref !== "") && (thing.syncData !== void 0 && (thing.syncData === null || isSyncData(thing.syncData)))) {
    return true;
  }
  return false;
}

function isSyncData(thing) {
  if (thing && (thing.version !== void 0 && typeof thing.version === "number") && (thing.content !== void 0 && typeof thing.content === "string")) {
    if (Object.keys(thing).length === 2) {
      return true;
    }
    if (Object.keys(thing).length === 3 && (thing.machineId !== void 0 && typeof thing.machineId === "string")) {
      return true;
    }
  }
  return false;
}

function getSyncResourceLogLabel(syncResource, profile) {
  return `${uppercaseFirstLetter(syncResource)}${profile.isDefault ? "" : ` (${profile.name})`}`;
}

var AbstractSynchroniser = class extends Disposable {
  constructor(syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService) {
    super();
    this.syncResource = syncResource;
    this.collection = collection;
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.storageService = storageService;
    this.userDataSyncStoreService = userDataSyncStoreService;
    this.userDataSyncLocalStoreService = userDataSyncLocalStoreService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.telemetryService = telemetryService;
    this.logService = logService;
    this.configurationService = configurationService;
    this.syncPreviewPromise = null;
    this._status = "idle" /* Idle */;
    this._onDidChangStatus = this._register(new Emitter());
    this.onDidChangeStatus = this._onDidChangStatus.event;
    this._conflicts = [];
    this._onDidChangeConflicts = this._register(new Emitter());
    this.onDidChangeConflicts = this._onDidChangeConflicts.event;
    this.localChangeTriggerThrottler = this._register(new ThrottledDelayer(50));
    this._onDidChangeLocal = this._register(new Emitter());
    this.onDidChangeLocal = this._onDidChangeLocal.event;
    this.hasSyncResourceStateVersionChanged = false;
    this.syncHeaders = {};
    this.lastSyncUserDataStateKey = `${collection ? `${collection}.` : ""}${syncResource.syncResource}.lastSyncUserData`;
    this.resource = syncResource.syncResource;
    this.syncResourceLogLabel = getSyncResourceLogLabel(syncResource.syncResource, syncResource.profile);
    this.extUri = uriIdentityService.extUri;
    this.syncFolder = this.extUri.joinPath(environmentService.userDataSyncHome, ...getPathSegments(syncResource.profile.isDefault ? void 0 : syncResource.profile.id, syncResource.syncResource));
    this.syncPreviewFolder = this.extUri.joinPath(this.syncFolder, PREVIEW_DIR_NAME);
    this.lastSyncResource = getLastSyncResourceUri(syncResource.profile.isDefault ? void 0 : syncResource.profile.id, syncResource.syncResource, environmentService, this.extUri);
    this.currentMachineIdPromise = getServiceMachineId(environmentService, fileService, storageService);
  }
  get status() {
    return this._status;
  }
  get conflicts() {
    return { ...this.syncResource, conflicts: this._conflicts };
  }
  triggerLocalChange() {
    this.localChangeTriggerThrottler.trigger(() => this.doTriggerLocalChange());
  }
  async doTriggerLocalChange() {
    if (this.status === "hasConflicts" /* HasConflicts */) {
      this.logService.info(`${this.syncResourceLogLabel}: In conflicts state and local change detected. Syncing again...`);
      const preview = await this.syncPreviewPromise;
      this.syncPreviewPromise = null;
      const status2 = await this.performSync(preview.remoteUserData, preview.lastSyncUserData, "merge" /* Merge */, this.getUserDataSyncConfiguration());
      this.setStatus(status2);
    } else {
      this.logService.trace(`${this.syncResourceLogLabel}: Checking for local changes...`);
      const lastSyncUserData = await this.getLastSyncUserData();
      const hasRemoteChanged = lastSyncUserData ? await this.hasRemoteChanged(lastSyncUserData) : true;
      if (hasRemoteChanged) {
        this._onDidChangeLocal.fire();
      }
    }
  }
  setStatus(status2) {
    if (this._status !== status2) {
      this._status = status2;
      this._onDidChangStatus.fire(status2);
    }
  }
  async sync(refOrUserData, preview = false, userDataSyncConfiguration = this.getUserDataSyncConfiguration(), headers = {}) {
    try {
      this.syncHeaders = { ...headers };
      if (this.status === "hasConflicts" /* HasConflicts */) {
        this.logService.info(`${this.syncResourceLogLabel}: Skipped synchronizing ${this.resource.toLowerCase()} as there are conflicts.`);
        return this.syncPreviewPromise;
      }
      if (this.status === "syncing" /* Syncing */) {
        this.logService.info(`${this.syncResourceLogLabel}: Skipped synchronizing ${this.resource.toLowerCase()} as it is running already.`);
        return this.syncPreviewPromise;
      }
      this.logService.trace(`${this.syncResourceLogLabel}: Started synchronizing ${this.resource.toLowerCase()}...`);
      this.setStatus("syncing" /* Syncing */);
      let status2 = "idle" /* Idle */;
      try {
        const lastSyncUserData = await this.getLastSyncUserData();
        const remoteUserData = await this.getLatestRemoteUserData(refOrUserData, lastSyncUserData);
        status2 = await this.performSync(remoteUserData, lastSyncUserData, preview ? "preview" /* Preview */ : "merge" /* Merge */, userDataSyncConfiguration);
        if (status2 === "hasConflicts" /* HasConflicts */) {
          this.logService.info(`${this.syncResourceLogLabel}: Detected conflicts while synchronizing ${this.resource.toLowerCase()}.`);
        } else if (status2 === "idle" /* Idle */) {
          this.logService.trace(`${this.syncResourceLogLabel}: Finished synchronizing ${this.resource.toLowerCase()}.`);
        }
        return this.syncPreviewPromise || null;
      } finally {
        this.setStatus(status2);
      }
    } finally {
      this.syncHeaders = {};
    }
  }
  async apply(force, headers = {}) {
    try {
      this.syncHeaders = { ...headers };
      const status2 = await this.doApply(force);
      this.setStatus(status2);
      return this.syncPreviewPromise;
    } finally {
      this.syncHeaders = {};
    }
  }
  async replace(content2) {
    const syncData = this.parseSyncData(content2);
    if (!syncData) {
      return false;
    }
    await this.stop();
    try {
      this.logService.trace(`${this.syncResourceLogLabel}: Started resetting ${this.resource.toLowerCase()}...`);
      this.setStatus("syncing" /* Syncing */);
      const lastSyncUserData = await this.getLastSyncUserData();
      const remoteUserData = await this.getLatestRemoteUserData(null, lastSyncUserData);
      const isRemoteDataFromCurrentMachine = await this.isRemoteDataFromCurrentMachine(remoteUserData);
      const resourcePreviewResults = await this.generateSyncPreview({ ref: remoteUserData.ref, syncData }, lastSyncUserData, isRemoteDataFromCurrentMachine, this.getUserDataSyncConfiguration(), CancellationToken.None);
      const resourcePreviews = [];
      for (const resourcePreviewResult of resourcePreviewResults) {
        const acceptResult = await this.getAcceptResult(resourcePreviewResult, resourcePreviewResult.remoteResource, void 0, CancellationToken.None);
        const { remoteChange } = await this.getAcceptResult(resourcePreviewResult, resourcePreviewResult.previewResource, resourcePreviewResult.remoteContent, CancellationToken.None);
        resourcePreviews.push([resourcePreviewResult, { ...acceptResult, remoteChange: remoteChange !== 0 /* None */ ? remoteChange : 2 /* Modified */ }]);
      }
      await this.applyResult(remoteUserData, lastSyncUserData, resourcePreviews, false);
      this.logService.info(`${this.syncResourceLogLabel}: Finished resetting ${this.resource.toLowerCase()}.`);
    } finally {
      this.setStatus("idle" /* Idle */);
    }
    return true;
  }
  async isRemoteDataFromCurrentMachine(remoteUserData) {
    const machineId = await this.currentMachineIdPromise;
    return !!remoteUserData.syncData?.machineId && remoteUserData.syncData.machineId === machineId;
  }
  async getLatestRemoteUserData(refOrLatestData, lastSyncUserData) {
    if (refOrLatestData === null) {
      return { ref: NON_EXISTING_RESOURCE_REF, syncData: null };
    }
    if (!isString(refOrLatestData)) {
      return this.toRemoteUserData(refOrLatestData);
    }
    if (lastSyncUserData?.ref === refOrLatestData) {
      return lastSyncUserData;
    }
    return this.getRemoteUserData(lastSyncUserData);
  }
  async performSync(remoteUserData, lastSyncUserData, strategy, userDataSyncConfiguration) {
    if (remoteUserData.syncData && remoteUserData.syncData.version > this.version) {
      throw new UserDataSyncError(localize(3679, null, this.resource, this.version, remoteUserData.syncData.version), "IncompatibleLocalContent" /* IncompatibleLocalContent */, this.resource);
    }
    try {
      return await this.doSync(remoteUserData, lastSyncUserData, strategy, userDataSyncConfiguration);
    } catch (e) {
      if (e instanceof UserDataSyncError) {
        switch (e.code) {
          case "LocalPreconditionFailed" /* LocalPreconditionFailed */:
            this.logService.info(`${this.syncResourceLogLabel}: Failed to synchronize ${this.syncResourceLogLabel} as there is a new local version available. Synchronizing again...`);
            return this.performSync(remoteUserData, lastSyncUserData, strategy, userDataSyncConfiguration);
          case "Conflict" /* Conflict */:
          case "PreconditionFailed" /* PreconditionFailed */:
            this.logService.info(`${this.syncResourceLogLabel}: Failed to synchronize as there is a new remote version available. Synchronizing again...`);
            remoteUserData = await this.getRemoteUserData(null);
            lastSyncUserData = await this.getLastSyncUserData();
            return this.performSync(remoteUserData, lastSyncUserData, "merge" /* Merge */, userDataSyncConfiguration);
        }
      }
      throw e;
    }
  }
  async doSync(remoteUserData, lastSyncUserData, strategy, userDataSyncConfiguration) {
    try {
      const isRemoteDataFromCurrentMachine = await this.isRemoteDataFromCurrentMachine(remoteUserData);
      const acceptRemote = !isRemoteDataFromCurrentMachine && lastSyncUserData === null && this.getStoredLastSyncUserDataStateContent() !== void 0;
      const merge4 = strategy === "preview" /* Preview */ || strategy === "merge" /* Merge */ && !acceptRemote;
      const apply2 = strategy === "merge" /* Merge */ || strategy === "pull-push" /* PullOrPush */;
      if (!this.syncPreviewPromise) {
        this.syncPreviewPromise = createCancelablePromise((token) => this.doGenerateSyncResourcePreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, merge4, userDataSyncConfiguration, token));
      }
      let preview = await this.syncPreviewPromise;
      if (strategy === "merge" /* Merge */ && acceptRemote) {
        this.logService.info(`${this.syncResourceLogLabel}: Accepting remote because it was synced before and the last sync data is not available.`);
        for (const resourcePreview of preview.resourcePreviews) {
          preview = await this.accept(resourcePreview.remoteResource) || preview;
        }
      } else if (strategy === "pull-push" /* PullOrPush */) {
        for (const resourcePreview of preview.resourcePreviews) {
          if (resourcePreview.mergeState === "accepted" /* Accepted */) {
            continue;
          }
          if (remoteUserData.ref === lastSyncUserData?.ref || isRemoteDataFromCurrentMachine) {
            preview = await this.accept(resourcePreview.localResource) ?? preview;
          } else {
            preview = await this.accept(resourcePreview.remoteResource) ?? preview;
          }
        }
      }
      this.updateConflicts(preview.resourcePreviews);
      if (preview.resourcePreviews.some(({ mergeState }) => mergeState === "conflict" /* Conflict */)) {
        return "hasConflicts" /* HasConflicts */;
      }
      if (apply2) {
        return await this.doApply(false);
      }
      return "syncing" /* Syncing */;
    } catch (error) {
      this.syncPreviewPromise = null;
      throw error;
    }
  }
  async accept(resource, content2) {
    await this.updateSyncResourcePreview(resource, async (resourcePreview) => {
      const acceptResult = await this.getAcceptResult(resourcePreview, resource, content2, CancellationToken.None);
      resourcePreview.acceptResult = acceptResult;
      resourcePreview.mergeState = "accepted" /* Accepted */;
      resourcePreview.localChange = acceptResult.localChange;
      resourcePreview.remoteChange = acceptResult.remoteChange;
      return resourcePreview;
    });
    return this.syncPreviewPromise;
  }
  async discard(resource) {
    await this.updateSyncResourcePreview(resource, async (resourcePreview) => {
      const mergeResult = await this.getMergeResult(resourcePreview, CancellationToken.None);
      await this.fileService.writeFile(resourcePreview.previewResource, VSBuffer.fromString(mergeResult.content || ""));
      resourcePreview.acceptResult = void 0;
      resourcePreview.mergeState = "preview" /* Preview */;
      resourcePreview.localChange = mergeResult.localChange;
      resourcePreview.remoteChange = mergeResult.remoteChange;
      return resourcePreview;
    });
    return this.syncPreviewPromise;
  }
  async updateSyncResourcePreview(resource, updateResourcePreview) {
    if (!this.syncPreviewPromise) {
      return;
    }
    let preview = await this.syncPreviewPromise;
    const index2 = preview.resourcePreviews.findIndex(({ localResource, remoteResource, previewResource }) => this.extUri.isEqual(localResource, resource) || this.extUri.isEqual(remoteResource, resource) || this.extUri.isEqual(previewResource, resource));
    if (index2 === -1) {
      return;
    }
    this.syncPreviewPromise = createCancelablePromise(async (token) => {
      const resourcePreviews = [...preview.resourcePreviews];
      resourcePreviews[index2] = await updateResourcePreview(resourcePreviews[index2]);
      return {
        ...preview,
        resourcePreviews
      };
    });
    preview = await this.syncPreviewPromise;
    this.updateConflicts(preview.resourcePreviews);
    if (preview.resourcePreviews.some(({ mergeState }) => mergeState === "conflict" /* Conflict */)) {
      this.setStatus("hasConflicts" /* HasConflicts */);
    } else {
      this.setStatus("syncing" /* Syncing */);
    }
  }
  async doApply(force) {
    if (!this.syncPreviewPromise) {
      return "idle" /* Idle */;
    }
    const preview = await this.syncPreviewPromise;
    if (preview.resourcePreviews.some(({ mergeState }) => mergeState === "conflict" /* Conflict */)) {
      return "hasConflicts" /* HasConflicts */;
    }
    if (preview.resourcePreviews.some(({ mergeState }) => mergeState !== "accepted" /* Accepted */)) {
      return "syncing" /* Syncing */;
    }
    await this.applyResult(preview.remoteUserData, preview.lastSyncUserData, preview.resourcePreviews.map((resourcePreview) => [resourcePreview, resourcePreview.acceptResult]), force);
    this.syncPreviewPromise = null;
    await this.clearPreviewFolder();
    return "idle" /* Idle */;
  }
  async clearPreviewFolder() {
    try {
      await this.fileService.del(this.syncPreviewFolder, { recursive: true });
    } catch (error) {
    }
  }
  updateConflicts(resourcePreviews) {
    const conflicts = resourcePreviews.filter(({ mergeState }) => mergeState === "conflict" /* Conflict */);
    if (!equals(this._conflicts, conflicts, (a, b) => this.extUri.isEqual(a.previewResource, b.previewResource))) {
      this._conflicts = conflicts;
      this._onDidChangeConflicts.fire(this.conflicts);
    }
  }
  async hasPreviouslySynced() {
    const lastSyncData = await this.getLastSyncUserData();
    return !!lastSyncData && lastSyncData.syncData !== null;
  }
  async resolvePreviewContent(uri5) {
    const syncPreview = this.syncPreviewPromise ? await this.syncPreviewPromise : null;
    if (syncPreview) {
      for (const resourcePreview of syncPreview.resourcePreviews) {
        if (this.extUri.isEqual(resourcePreview.acceptedResource, uri5)) {
          return resourcePreview.acceptResult ? resourcePreview.acceptResult.content : null;
        }
        if (this.extUri.isEqual(resourcePreview.remoteResource, uri5)) {
          return resourcePreview.remoteContent;
        }
        if (this.extUri.isEqual(resourcePreview.localResource, uri5)) {
          return resourcePreview.localContent;
        }
        if (this.extUri.isEqual(resourcePreview.baseResource, uri5)) {
          return resourcePreview.baseContent;
        }
      }
    }
    return null;
  }
  async resetLocal() {
    this.storageService.remove(this.lastSyncUserDataStateKey, -1 /* APPLICATION */);
    try {
      await this.fileService.del(this.lastSyncResource);
    } catch (error) {
      if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
        this.logService.error(error);
      }
    }
  }
  async doGenerateSyncResourcePreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, merge4, userDataSyncConfiguration, token) {
    const resourcePreviewResults = await this.generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration, token);
    const resourcePreviews = [];
    for (const resourcePreviewResult of resourcePreviewResults) {
      const acceptedResource = resourcePreviewResult.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" });
      if (resourcePreviewResult.localChange === 0 /* None */ && resourcePreviewResult.remoteChange === 0 /* None */) {
        resourcePreviews.push({
          ...resourcePreviewResult,
          acceptedResource,
          acceptResult: { content: null, localChange: 0 /* None */, remoteChange: 0 /* None */ },
          mergeState: "accepted" /* Accepted */
        });
      } else {
        const mergeResult = merge4 ? await this.getMergeResult(resourcePreviewResult, token) : void 0;
        if (token.isCancellationRequested) {
          break;
        }
        await this.fileService.writeFile(resourcePreviewResult.previewResource, VSBuffer.fromString(mergeResult?.content || ""));
        const acceptResult = mergeResult && !mergeResult.hasConflicts ? await this.getAcceptResult(resourcePreviewResult, resourcePreviewResult.previewResource, void 0, token) : void 0;
        resourcePreviews.push({
          ...resourcePreviewResult,
          acceptResult,
          mergeState: mergeResult?.hasConflicts ? "conflict" /* Conflict */ : acceptResult ? "accepted" /* Accepted */ : "preview" /* Preview */,
          localChange: acceptResult ? acceptResult.localChange : mergeResult ? mergeResult.localChange : resourcePreviewResult.localChange,
          remoteChange: acceptResult ? acceptResult.remoteChange : mergeResult ? mergeResult.remoteChange : resourcePreviewResult.remoteChange
        });
      }
    }
    return { syncResource: this.resource, profile: this.syncResource.profile, remoteUserData, lastSyncUserData, resourcePreviews, isLastSyncFromCurrentMachine: isRemoteDataFromCurrentMachine };
  }
  async getLastSyncUserData() {
    const storedLastSyncUserDataStateContent = this.getStoredLastSyncUserDataStateContent();
    if (!storedLastSyncUserDataStateContent) {
      this.logService.info(`${this.syncResourceLogLabel}: Last sync data state does not exist.`);
      return null;
    }
    const lastSyncUserDataState = JSON.parse(storedLastSyncUserDataStateContent);
    const resourceSyncStateVersion = this.userDataSyncEnablementService.getResourceSyncStateVersion(this.resource);
    this.hasSyncResourceStateVersionChanged = !!lastSyncUserDataState.version && !!resourceSyncStateVersion && lastSyncUserDataState.version !== resourceSyncStateVersion;
    if (this.hasSyncResourceStateVersionChanged) {
      this.logService.info(`${this.syncResourceLogLabel}: Reset last sync state because last sync state version ${lastSyncUserDataState.version} is not compatible with current sync state version ${resourceSyncStateVersion}.`);
      await this.resetLocal();
      return null;
    }
    let syncData = void 0;
    let retrial = 1;
    while (syncData === void 0 && retrial++ < 6) {
      try {
        const lastSyncStoredRemoteUserData = await this.readLastSyncStoredRemoteUserData();
        if (lastSyncStoredRemoteUserData) {
          if (lastSyncStoredRemoteUserData.ref === lastSyncUserDataState.ref) {
            syncData = lastSyncStoredRemoteUserData.syncData;
          } else {
            this.logService.info(`${this.syncResourceLogLabel}: Last sync data stored locally is not same as the last sync state.`);
          }
        }
        break;
      } catch (error) {
        if (error instanceof FileOperationError && error.fileOperationResult === 1 /* FILE_NOT_FOUND */) {
          this.logService.info(`${this.syncResourceLogLabel}: Last sync resource does not exist locally.`);
          break;
        } else if (error instanceof UserDataSyncError) {
          throw error;
        } else {
          this.logService.error(error, retrial);
        }
      }
    }
    if (syncData === void 0) {
      try {
        const content2 = await this.userDataSyncStoreService.resolveResourceContent(this.resource, lastSyncUserDataState.ref, this.collection, this.syncHeaders);
        syncData = content2 === null ? null : this.parseSyncData(content2);
        await this.writeLastSyncStoredRemoteUserData({ ref: lastSyncUserDataState.ref, syncData });
      } catch (error) {
        if (error instanceof UserDataSyncError && error.code === "NotFound" /* NotFound */) {
          this.logService.info(`${this.syncResourceLogLabel}: Last sync resource does not exist remotely.`);
        } else {
          throw error;
        }
      }
    }
    if (syncData === void 0) {
      return null;
    }
    return {
      ...lastSyncUserDataState,
      syncData
    };
  }
  async updateLastSyncUserData(lastSyncRemoteUserData, additionalProps = {}) {
    if (additionalProps["ref"] || additionalProps["version"]) {
      throw new Error("Cannot have core properties as additional");
    }
    const version2 = this.userDataSyncEnablementService.getResourceSyncStateVersion(this.resource);
    const lastSyncUserDataState = {
      ref: lastSyncRemoteUserData.ref,
      version: version2,
      ...additionalProps
    };
    this.storageService.store(this.lastSyncUserDataStateKey, JSON.stringify(lastSyncUserDataState), -1 /* APPLICATION */, 1 /* MACHINE */);
    await this.writeLastSyncStoredRemoteUserData(lastSyncRemoteUserData);
  }
  getStoredLastSyncUserDataStateContent() {
    return this.storageService.get(this.lastSyncUserDataStateKey, -1 /* APPLICATION */);
  }
  async readLastSyncStoredRemoteUserData() {
    const content2 = (await this.fileService.readFile(this.lastSyncResource)).value.toString();
    try {
      const lastSyncStoredRemoteUserData = content2 ? JSON.parse(content2) : void 0;
      if (isRemoteUserData(lastSyncStoredRemoteUserData)) {
        return lastSyncStoredRemoteUserData;
      }
    } catch (e) {
      this.logService.error(e);
    }
    return void 0;
  }
  async writeLastSyncStoredRemoteUserData(lastSyncRemoteUserData) {
    await this.fileService.writeFile(this.lastSyncResource, VSBuffer.fromString(JSON.stringify(lastSyncRemoteUserData)));
  }
  async getRemoteUserData(lastSyncData) {
    const userData = await this.getUserData(lastSyncData);
    return this.toRemoteUserData(userData);
  }
  toRemoteUserData({ ref, content: content2 }) {
    let syncData = null;
    if (content2 !== null) {
      syncData = this.parseSyncData(content2);
    }
    return { ref, syncData };
  }
  parseSyncData(content2) {
    try {
      const syncData = JSON.parse(content2);
      if (isSyncData(syncData)) {
        return syncData;
      }
    } catch (error) {
      this.logService.error(error);
    }
    throw new UserDataSyncError(localize(3680, null), "IncompatibleRemoteContent" /* IncompatibleRemoteContent */, this.resource);
  }
  async getUserData(lastSyncData) {
    const lastSyncUserData = lastSyncData ? { ref: lastSyncData.ref, content: lastSyncData.syncData ? JSON.stringify(lastSyncData.syncData) : null } : null;
    return this.userDataSyncStoreService.readResource(this.resource, lastSyncUserData, this.collection, this.syncHeaders);
  }
  async updateRemoteUserData(content2, ref) {
    const machineId = await this.currentMachineIdPromise;
    const syncData = { version: this.version, machineId, content: content2 };
    try {
      ref = await this.userDataSyncStoreService.writeResource(this.resource, JSON.stringify(syncData), ref, this.collection, this.syncHeaders);
      return { ref, syncData };
    } catch (error) {
      if (error instanceof UserDataSyncError && error.code === "TooLarge" /* TooLarge */) {
        error = new UserDataSyncError(error.message, error.code, this.resource);
      }
      throw error;
    }
  }
  async backupLocal(content2) {
    const syncData = { version: this.version, content: content2 };
    return this.userDataSyncLocalStoreService.writeResource(this.resource, JSON.stringify(syncData), /* @__PURE__ */ new Date(), this.syncResource.profile.isDefault ? void 0 : this.syncResource.profile.id);
  }
  async stop() {
    if (this.status === "idle" /* Idle */) {
      return;
    }
    this.logService.trace(`${this.syncResourceLogLabel}: Stopping synchronizing ${this.resource.toLowerCase()}.`);
    if (this.syncPreviewPromise) {
      this.syncPreviewPromise.cancel();
      this.syncPreviewPromise = null;
    }
    this.updateConflicts([]);
    await this.clearPreviewFolder();
    this.setStatus("idle" /* Idle */);
    this.logService.info(`${this.syncResourceLogLabel}: Stopped synchronizing ${this.resource.toLowerCase()}.`);
  }
  getUserDataSyncConfiguration() {
    return this.configurationService.getValue(USER_DATA_SYNC_CONFIGURATION_SCOPE);
  }
};

AbstractSynchroniser = __decorateClass([
  __decorateParam(2, IFileService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IUserDataSyncStoreService),
  __decorateParam(6, IUserDataSyncLocalStoreService),
  __decorateParam(7, IUserDataSyncEnablementService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, IUserDataSyncLogService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IUriIdentityService)
], AbstractSynchroniser);

var AbstractFileSynchroniser = class extends AbstractSynchroniser {
  constructor(file, syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService) {
    super(syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
    this.file = file;
    this._register(this.fileService.watch(this.extUri.dirname(file)));
    this._register(this.fileService.onDidFilesChange((e) => this.onFileChanges(e)));
  }
  async getLocalFileContent() {
    try {
      return await this.fileService.readFile(this.file);
    } catch (error) {
      return null;
    }
  }
  async updateLocalFileContent(newContent, oldContent, force) {
    try {
      if (oldContent) {
        await this.fileService.writeFile(this.file, VSBuffer.fromString(newContent), force ? void 0 : oldContent);
      } else {
        await this.fileService.createFile(this.file, VSBuffer.fromString(newContent), { overwrite: force });
      }
    } catch (e) {
      if (e instanceof FileOperationError && e.fileOperationResult === 1 /* FILE_NOT_FOUND */ || e instanceof FileOperationError && e.fileOperationResult === 3 /* FILE_MODIFIED_SINCE */) {
        throw new UserDataSyncError(e.message, "LocalPreconditionFailed" /* LocalPreconditionFailed */);
      } else {
        throw e;
      }
    }
  }
  async deleteLocalFile() {
    try {
      await this.fileService.del(this.file);
    } catch (e) {
      if (!(e instanceof FileOperationError && e.fileOperationResult === 1 /* FILE_NOT_FOUND */)) {
        throw e;
      }
    }
  }
  onFileChanges(e) {
    if (!e.contains(this.file)) {
      return;
    }
    this.triggerLocalChange();
  }
};

AbstractFileSynchroniser = __decorateClass([
  __decorateParam(3, IFileService),
  __decorateParam(4, IEnvironmentService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IUserDataSyncStoreService),
  __decorateParam(7, IUserDataSyncLocalStoreService),
  __decorateParam(8, IUserDataSyncEnablementService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, IUserDataSyncLogService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IUriIdentityService)
], AbstractFileSynchroniser);

var AbstractJsonFileSynchroniser = class extends AbstractFileSynchroniser {
  constructor(file, syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, userDataSyncUtilService, configurationService, uriIdentityService) {
    super(file, syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
    this.userDataSyncUtilService = userDataSyncUtilService;
    this._formattingOptions = void 0;
  }
  hasErrors(content2, isArray) {
    const parseErrors = [];
    const result = parse5(content2, parseErrors, { allowEmptyContent: true, allowTrailingComma: true });
    return parseErrors.length > 0 || !isUndefined(result) && isArray !== Array.isArray(result);
  }
  getFormattingOptions() {
    if (!this._formattingOptions) {
      this._formattingOptions = this.userDataSyncUtilService.resolveFormattingOptions(this.file);
    }
    return this._formattingOptions;
  }
};

AbstractJsonFileSynchroniser = __decorateClass([
  __decorateParam(3, IFileService),
  __decorateParam(4, IEnvironmentService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IUserDataSyncStoreService),
  __decorateParam(7, IUserDataSyncLocalStoreService),
  __decorateParam(8, IUserDataSyncEnablementService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, IUserDataSyncLogService),
  __decorateParam(11, IUserDataSyncUtilService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, IUriIdentityService)
], AbstractJsonFileSynchroniser);

var AbstractInitializer = class {
  constructor(resource, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService) {
    this.resource = resource;
    this.userDataProfilesService = userDataProfilesService;
    this.environmentService = environmentService;
    this.logService = logService;
    this.fileService = fileService;
    this.storageService = storageService;
    this.extUri = uriIdentityService.extUri;
    this.lastSyncResource = getLastSyncResourceUri(void 0, this.resource, environmentService, this.extUri);
  }
  async initialize({ ref, content: content2 }) {
    if (!content2) {
      this.logService.info("Remote content does not exist.", this.resource);
      return;
    }
    const syncData = this.parseSyncData(content2);
    if (!syncData) {
      return;
    }
    try {
      await this.doInitialize({ ref, syncData });
    } catch (error) {
      this.logService.error(error);
    }
  }
  parseSyncData(content2) {
    try {
      const syncData = JSON.parse(content2);
      if (isSyncData(syncData)) {
        return syncData;
      }
    } catch (error) {
      this.logService.error(error);
    }
    this.logService.info("Cannot parse sync data as it is not compatible with the current version.", this.resource);
    return void 0;
  }
  async updateLastSyncUserData(lastSyncRemoteUserData, additionalProps = {}) {
    if (additionalProps["ref"] || additionalProps["version"]) {
      throw new Error("Cannot have core properties as additional");
    }
    const lastSyncUserDataState = {
      ref: lastSyncRemoteUserData.ref,
      version: void 0,
      ...additionalProps
    };
    this.storageService.store(`${this.resource}.lastSyncUserData`, JSON.stringify(lastSyncUserDataState), -1 /* APPLICATION */, 1 /* MACHINE */);
    await this.fileService.writeFile(this.lastSyncResource, VSBuffer.fromString(JSON.stringify(lastSyncRemoteUserData)));
  }
};

AbstractInitializer = __decorateClass([
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IFileService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IUriIdentityService)
], AbstractInitializer);
export { isRemoteUserData, isSyncData, getSyncResourceLogLabel, AbstractSynchroniser, AbstractFileSynchroniser, AbstractJsonFileSynchroniser, AbstractInitializer };
