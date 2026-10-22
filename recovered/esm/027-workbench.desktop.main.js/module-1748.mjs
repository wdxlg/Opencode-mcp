// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/globalStateSync.ts
import { toFormattedString } from "./module-1377.mjs";
import { AbstractInitializer, AbstractSynchroniser, getSyncResourceLogLabel, isSyncData } from "./module-1746.mjs";
import { ALL_SYNC_RESOURCES, IUserDataSyncEnablementService, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncStoreService, SYNC_SERVICE_URL_TYPE, USER_DATA_SYNC_SCHEME, UserDataSyncError, createSyncHeaders, getEnablementKey } from "./module-1696.mjs";
import { Event2 } from "./module-0017.mjs";
import { merge } from "./module-1747.mjs";
import { isWeb } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfileStorageService } from "./module-1715.mjs";
import { IFileService } from "./module-0269.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { parse5 } from "./module-0883.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { edit2 } from "./module-1708.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { generateUuid } from "./module-0190.mjs";
import { getServiceMachineId } from "./module-0889.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/platform/userDataSync/common/globalStateSync.ts
var argvStoragePrefx = "globalState.argv.";

var argvProperties = ["locale"];

function stringify2(globalState, format5) {
  const storageKeys2 = globalState.storage ? Object.keys(globalState.storage).sort() : [];
  const storage = {};
  storageKeys2.forEach((key3) => storage[key3] = globalState.storage[key3]);
  globalState.storage = storage;
  return format5 ? toFormattedString(globalState, {}) : JSON.stringify(globalState);
}

var GLOBAL_STATE_DATA_VERSION = 1;

var GlobalStateSynchroniser = class extends AbstractSynchroniser {
  constructor(profile, collection, userDataProfileStorageService, fileService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, environmentService, userDataSyncEnablementService, telemetryService, configurationService, storageService, uriIdentityService, instantiationService) {
    super({ syncResource: "globalState" /* GlobalState */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
    this.userDataProfileStorageService = userDataProfileStorageService;
    this.version = GLOBAL_STATE_DATA_VERSION;
    this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, "globalState.json");
    this.baseResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" });
    this.localResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" });
    this.remoteResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" });
    this.acceptedResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" });
    this.localGlobalStateProvider = instantiationService.createInstance(LocalGlobalStateProvider);
    this._register(fileService.watch(this.extUri.dirname(this.environmentService.argvResource)));
    this._register(
      Event2.any(
        /* Locale change */
        Event2.filter(fileService.onDidFilesChange, (e) => e.contains(this.environmentService.argvResource)),
        Event2.filter(userDataProfileStorageService.onDidChange, (e) => {
          if (e.targetChanges.some((profile2) => this.syncResource.profile.id === profile2.id)) {
            return true;
          }
          if (e.valueChanges.some(({ profile: profile2, changes }) => this.syncResource.profile.id === profile2.id && changes.some((change) => change.target === 0 /* USER */))) {
            return true;
          }
          return false;
        })
      )((() => this.triggerLocalChange()))
    );
  }
  async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
    const remoteGlobalState = remoteUserData.syncData ? JSON.parse(remoteUserData.syncData.content) : null;
    lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
    const lastSyncGlobalState = lastSyncUserData && lastSyncUserData.syncData ? JSON.parse(lastSyncUserData.syncData.content) : null;
    const localGlobalState = await this.localGlobalStateProvider.getLocalGlobalState(this.syncResource.profile);
    if (remoteGlobalState) {
      this.logService.trace(`${this.syncResourceLogLabel}: Merging remote ui state with local ui state...`);
    } else {
      this.logService.trace(`${this.syncResourceLogLabel}: Remote ui state does not exist. Synchronizing ui state for the first time.`);
    }
    const storageKeys2 = await this.getStorageKeys(lastSyncGlobalState);
    const { local, remote } = merge(localGlobalState.storage, remoteGlobalState ? remoteGlobalState.storage : null, lastSyncGlobalState ? lastSyncGlobalState.storage : null, storageKeys2, this.logService);
    const previewResult = {
      content: null,
      local,
      remote,
      localChange: Object.keys(local.added).length > 0 || Object.keys(local.updated).length > 0 || local.removed.length > 0 ? 2 /* Modified */ : 0 /* None */,
      remoteChange: remote.all !== null ? 2 /* Modified */ : 0 /* None */
    };
    const localContent = stringify2(localGlobalState, false);
    return [{
      baseResource: this.baseResource,
      baseContent: lastSyncGlobalState ? stringify2(lastSyncGlobalState, false) : localContent,
      localResource: this.localResource,
      localContent,
      localUserData: localGlobalState,
      remoteResource: this.remoteResource,
      remoteContent: remoteGlobalState ? stringify2(remoteGlobalState, false) : null,
      previewResource: this.previewResource,
      previewResult,
      localChange: previewResult.localChange,
      remoteChange: previewResult.remoteChange,
      acceptedResource: this.acceptedResource,
      storageKeys: storageKeys2
    }];
  }
  async hasRemoteChanged(lastSyncUserData) {
    const lastSyncGlobalState = lastSyncUserData.syncData ? JSON.parse(lastSyncUserData.syncData.content) : null;
    if (lastSyncGlobalState === null) {
      return true;
    }
    const localGlobalState = await this.localGlobalStateProvider.getLocalGlobalState(this.syncResource.profile);
    const storageKeys2 = await this.getStorageKeys(lastSyncGlobalState);
    const { remote } = merge(localGlobalState.storage, lastSyncGlobalState.storage, lastSyncGlobalState.storage, storageKeys2, this.logService);
    return remote.all !== null;
  }
  async getMergeResult(resourcePreview, token) {
    return { ...resourcePreview.previewResult, hasConflicts: false };
  }
  async getAcceptResult(resourcePreview, resource, content2, token) {
    if (this.extUri.isEqual(resource, this.localResource)) {
      return this.acceptLocal(resourcePreview);
    }
    if (this.extUri.isEqual(resource, this.remoteResource)) {
      return this.acceptRemote(resourcePreview);
    }
    if (this.extUri.isEqual(resource, this.previewResource)) {
      return resourcePreview.previewResult;
    }
    throw new Error(`Invalid Resource: ${resource.toString()}`);
  }
  async acceptLocal(resourcePreview) {
    if (resourcePreview.remoteContent !== null) {
      const remoteGlobalState = JSON.parse(resourcePreview.remoteContent);
      const { local, remote } = merge(resourcePreview.localUserData.storage, remoteGlobalState.storage, remoteGlobalState.storage, resourcePreview.storageKeys, this.logService);
      return {
        content: resourcePreview.remoteContent,
        local,
        remote,
        localChange: 0 /* None */,
        remoteChange: remote.all !== null ? 2 /* Modified */ : 0 /* None */
      };
    } else {
      return {
        content: resourcePreview.localContent,
        local: { added: {}, removed: [], updated: {} },
        remote: { added: Object.keys(resourcePreview.localUserData.storage), removed: [], updated: [], all: resourcePreview.localUserData.storage },
        localChange: 0 /* None */,
        remoteChange: 2 /* Modified */
      };
    }
  }
  async acceptRemote(resourcePreview) {
    if (resourcePreview.remoteContent !== null) {
      const remoteGlobalState = JSON.parse(resourcePreview.remoteContent);
      const { local, remote } = merge(resourcePreview.localUserData.storage, remoteGlobalState.storage, resourcePreview.localUserData.storage, resourcePreview.storageKeys, this.logService);
      return {
        content: resourcePreview.remoteContent,
        local,
        remote,
        localChange: Object.keys(local.added).length > 0 || Object.keys(local.updated).length > 0 || local.removed.length > 0 ? 2 /* Modified */ : 0 /* None */,
        remoteChange: 0 /* None */
      };
    } else {
      return {
        content: resourcePreview.remoteContent,
        local: { added: {}, removed: [], updated: {} },
        remote: { added: [], removed: [], updated: [], all: null },
        localChange: 0 /* None */,
        remoteChange: 0 /* None */
      };
    }
  }
  async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
    const { localUserData } = resourcePreviews[0][0];
    const { local, remote, localChange, remoteChange } = resourcePreviews[0][1];
    if (localChange === 0 /* None */ && remoteChange === 0 /* None */) {
      this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing ui state.`);
    }
    if (localChange !== 0 /* None */) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating local ui state...`);
      await this.backupLocal(JSON.stringify(localUserData));
      await this.localGlobalStateProvider.writeLocalGlobalState(local, this.syncResource.profile);
      this.logService.info(`${this.syncResourceLogLabel}: Updated local ui state`);
    }
    if (remoteChange !== 0 /* None */) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating remote ui state...`);
      const content2 = JSON.stringify({ storage: remote.all });
      remoteUserData = await this.updateRemoteUserData(content2, force ? null : remoteUserData.ref);
      this.logService.info(`${this.syncResourceLogLabel}: Updated remote ui state.${remote.added.length ? ` Added: ${remote.added}.` : ""}${remote.updated.length ? ` Updated: ${remote.updated}.` : ""}${remote.removed.length ? ` Removed: ${remote.removed}.` : ""}`);
    }
    if (lastSyncUserData?.ref !== remoteUserData.ref) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized ui state...`);
      await this.updateLastSyncUserData(remoteUserData);
      this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized ui state`);
    }
  }
  async resolveContent(uri5) {
    if (this.extUri.isEqual(this.remoteResource, uri5) || this.extUri.isEqual(this.baseResource, uri5) || this.extUri.isEqual(this.localResource, uri5) || this.extUri.isEqual(this.acceptedResource, uri5)) {
      const content2 = await this.resolvePreviewContent(uri5);
      return content2 ? stringify2(JSON.parse(content2), true) : content2;
    }
    return null;
  }
  async hasLocalData() {
    try {
      const { storage } = await this.localGlobalStateProvider.getLocalGlobalState(this.syncResource.profile);
      if (Object.keys(storage).length > 1 || storage[`${argvStoragePrefx}.locale`]?.value !== "en") {
        return true;
      }
    } catch (error) {
    }
    return false;
  }
  async getStorageKeys(lastSyncGlobalState) {
    const storageData = await this.userDataProfileStorageService.readStorageData(this.syncResource.profile);
    const user = [], machine = [];
    for (const [key3, value2] of storageData) {
      if (value2.target === 0 /* USER */) {
        user.push(key3);
      } else if (value2.target === 1 /* MACHINE */) {
        machine.push(key3);
      }
    }
    const registered = [...user, ...machine];
    const unregistered = lastSyncGlobalState?.storage ? Object.keys(lastSyncGlobalState.storage).filter((key3) => !key3.startsWith(argvStoragePrefx) && !registered.includes(key3) && storageData.get(key3) !== void 0) : [];
    if (!isWeb) {
      const keysSyncedOnlyInWeb = [...ALL_SYNC_RESOURCES.map((resource) => getEnablementKey(resource)), SYNC_SERVICE_URL_TYPE];
      unregistered.push(...keysSyncedOnlyInWeb);
      machine.push(...keysSyncedOnlyInWeb);
    }
    return { user, machine, unregistered };
  }
};

GlobalStateSynchroniser = __decorateClass([
  __decorateParam(2, IUserDataProfileStorageService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IUserDataSyncStoreService),
  __decorateParam(5, IUserDataSyncLocalStoreService),
  __decorateParam(6, IUserDataSyncLogService),
  __decorateParam(7, IEnvironmentService),
  __decorateParam(8, IUserDataSyncEnablementService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IStorageService),
  __decorateParam(12, IUriIdentityService),
  __decorateParam(13, IInstantiationService)
], GlobalStateSynchroniser);

var LocalGlobalStateProvider = class {
  constructor(fileService, environmentService, userDataProfileStorageService, logService) {
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.userDataProfileStorageService = userDataProfileStorageService;
    this.logService = logService;
  }
  async getLocalGlobalState(profile) {
    const storage = {};
    if (profile.isDefault) {
      const argvContent = await this.getLocalArgvContent();
      const argvValue = parse5(argvContent);
      for (const argvProperty of argvProperties) {
        if (argvValue[argvProperty] !== void 0) {
          storage[`${argvStoragePrefx}${argvProperty}`] = { version: 1, value: argvValue[argvProperty] };
        }
      }
    }
    const storageData = await this.userDataProfileStorageService.readStorageData(profile);
    for (const [key3, value2] of storageData) {
      if (value2.value && value2.target === 0 /* USER */) {
        storage[key3] = { version: 1, value: value2.value, scope: value2.scope };
      }
    }
    return { storage };
  }
  async getLocalArgvContent() {
    try {
      this.logService.debug("GlobalStateSync#getLocalArgvContent", this.environmentService.argvResource);
      const content2 = await this.fileService.readFile(this.environmentService.argvResource);
      this.logService.debug("GlobalStateSync#getLocalArgvContent - Resolved", this.environmentService.argvResource);
      return content2.value.toString();
    } catch (error) {
      this.logService.debug(getErrorMessage(error));
    }
    return "{}";
  }
  async writeLocalGlobalState({ added, removed, updated }, profile) {
    const syncResourceLogLabel = getSyncResourceLogLabel("globalState" /* GlobalState */, profile);
    const argv = {};
    const updatedProfileStorage = /* @__PURE__ */ new Map();
    const updatedSharedStorage = profile.isDefault ? /* @__PURE__ */ new Map() : void 0;
    const storageData = await this.userDataProfileStorageService.readStorageData(profile);
    const handleUpdatedStorage = (keys, storage) => {
      for (const key3 of keys) {
        if (key3.startsWith(argvStoragePrefx)) {
          argv[key3.substring(argvStoragePrefx.length)] = storage ? storage[key3].value : void 0;
          continue;
        }
        if (storage) {
          const storageValue = storage[key3];
          if (storageValue.value !== storageData.get(key3)?.value) {
            const targetMap = updatedSharedStorage && storageValue.scope === -2 /* APPLICATION_SHARED */ ? updatedSharedStorage : updatedProfileStorage;
            targetMap.set(key3, storageValue.value);
          }
        } else {
          if (storageData.get(key3) !== void 0) {
            const targetMap = updatedSharedStorage && storageData.get(key3)?.scope === -2 /* APPLICATION_SHARED */ ? updatedSharedStorage : updatedProfileStorage;
            targetMap.set(key3, void 0);
          }
        }
      }
    };
    handleUpdatedStorage(Object.keys(added), added);
    handleUpdatedStorage(Object.keys(updated), updated);
    handleUpdatedStorage(removed);
    if (Object.keys(argv).length) {
      this.logService.trace(`${syncResourceLogLabel}: Updating locale...`);
      const argvContent = await this.getLocalArgvContent();
      let content2 = argvContent;
      for (const argvProperty of Object.keys(argv)) {
        content2 = edit2(content2, [argvProperty], argv[argvProperty], {});
      }
      if (argvContent !== content2) {
        this.logService.trace(`${syncResourceLogLabel}: Updating locale...`);
        await this.fileService.writeFile(this.environmentService.argvResource, VSBuffer.fromString(content2));
        this.logService.info(`${syncResourceLogLabel}: Updated locale.`);
      }
      this.logService.info(`${syncResourceLogLabel}: Updated locale`);
    }
    if (updatedProfileStorage.size) {
      this.logService.trace(`${syncResourceLogLabel}: Updating global state...`);
      await this.userDataProfileStorageService.updateStorageData(profile, updatedProfileStorage, 0 /* USER */);
      this.logService.info(`${syncResourceLogLabel}: Updated global state`, [...updatedProfileStorage.keys()]);
    }
    if (updatedSharedStorage?.size) {
      this.logService.trace(`${syncResourceLogLabel}: Updating application shared state...`);
      await this.userDataProfileStorageService.updateStorageData(profile, updatedSharedStorage, 0 /* USER */, -2 /* APPLICATION_SHARED */);
      this.logService.info(`${syncResourceLogLabel}: Updated application shared state`, [...updatedSharedStorage.keys()]);
    }
  }
};

LocalGlobalStateProvider = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, IUserDataProfileStorageService),
  __decorateParam(3, IUserDataSyncLogService)
], LocalGlobalStateProvider);

var GlobalStateInitializer = class extends AbstractInitializer {
  constructor(storageService, fileService, userDataProfilesService, environmentService, logService, uriIdentityService) {
    super("globalState" /* GlobalState */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
  }
  async doInitialize(remoteUserData) {
    const remoteGlobalState = remoteUserData.syncData ? JSON.parse(remoteUserData.syncData.content) : null;
    if (!remoteGlobalState) {
      this.logService.info("Skipping initializing global state because remote global state does not exist.");
      return;
    }
    const argv = {};
    const isDefaultProfile = this.storageService.hasScope(this.userDataProfilesService.defaultProfile);
    const storage = {};
    for (const key3 of Object.keys(remoteGlobalState.storage)) {
      if (key3.startsWith(argvStoragePrefx)) {
        argv[key3.substring(argvStoragePrefx.length)] = remoteGlobalState.storage[key3].value;
      } else {
        const isSharedScope = remoteGlobalState.storage[key3].scope === -2 /* APPLICATION_SHARED */;
        if (isSharedScope && !isDefaultProfile) {
          continue;
        }
        const scope = isSharedScope ? -2 /* APPLICATION_SHARED */ : 0 /* PROFILE */;
        if (this.storageService.get(key3, scope) === void 0) {
          storage[key3] = { value: remoteGlobalState.storage[key3].value, scope };
        }
      }
    }
    if (Object.keys(argv).length) {
      let content2 = "{}";
      try {
        const fileContent = await this.fileService.readFile(this.environmentService.argvResource);
        content2 = fileContent.value.toString();
      } catch (error) {
      }
      for (const argvProperty of Object.keys(argv)) {
        content2 = edit2(content2, [argvProperty], argv[argvProperty], {});
      }
      await this.fileService.writeFile(this.environmentService.argvResource, VSBuffer.fromString(content2));
    }
    if (Object.keys(storage).length) {
      const storageEntries = [];
      for (const key3 of Object.keys(storage)) {
        storageEntries.push({ key: key3, value: storage[key3].value, scope: storage[key3].scope, target: 0 /* USER */ });
      }
      this.storageService.storeAll(storageEntries, true);
    }
  }
};

GlobalStateInitializer = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IUserDataProfilesService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, IUserDataSyncLogService),
  __decorateParam(5, IUriIdentityService)
], GlobalStateInitializer);

var UserDataSyncStoreTypeSynchronizer = class {
  constructor(userDataSyncStoreClient, storageService, environmentService, fileService, logService) {
    this.userDataSyncStoreClient = userDataSyncStoreClient;
    this.storageService = storageService;
    this.environmentService = environmentService;
    this.fileService = fileService;
    this.logService = logService;
  }
  getSyncStoreType(userData) {
    const remoteGlobalState = this.parseGlobalState(userData);
    return remoteGlobalState?.storage[SYNC_SERVICE_URL_TYPE]?.value;
  }
  async sync(userDataSyncStoreType) {
    const syncHeaders = createSyncHeaders(generateUuid());
    try {
      return await this.doSync(userDataSyncStoreType, syncHeaders);
    } catch (e) {
      if (e instanceof UserDataSyncError) {
        switch (e.code) {
          case "PreconditionFailed" /* PreconditionFailed */:
            this.logService.info(`Failed to synchronize UserDataSyncStoreType as there is a new remote version available. Synchronizing again...`);
            return this.doSync(userDataSyncStoreType, syncHeaders);
        }
      }
      throw e;
    }
  }
  async doSync(userDataSyncStoreType, syncHeaders) {
    const globalStateUserData = await this.userDataSyncStoreClient.readResource("globalState" /* GlobalState */, null, void 0, syncHeaders);
    const remoteGlobalState = this.parseGlobalState(globalStateUserData) || { storage: {} };
    remoteGlobalState.storage[SYNC_SERVICE_URL_TYPE] = { value: userDataSyncStoreType, version: GLOBAL_STATE_DATA_VERSION };
    const machineId = await getServiceMachineId(this.environmentService, this.fileService, this.storageService);
    const syncDataToUpdate = { version: GLOBAL_STATE_DATA_VERSION, machineId, content: stringify2(remoteGlobalState, false) };
    await this.userDataSyncStoreClient.writeResource("globalState" /* GlobalState */, JSON.stringify(syncDataToUpdate), globalStateUserData.ref, void 0, syncHeaders);
  }
  parseGlobalState({ content: content2 }) {
    if (!content2) {
      return null;
    }
    const syncData = JSON.parse(content2);
    if (isSyncData(syncData)) {
      return syncData ? JSON.parse(syncData.content) : null;
    }
    throw new Error("Invalid remote data");
  }
};

UserDataSyncStoreTypeSynchronizer = __decorateClass([
  __decorateParam(1, IStorageService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, IFileService),
  __decorateParam(4, ILogService)
], UserDataSyncStoreTypeSynchronizer);
export { stringify2, argvStoragePrefx, argvProperties, GLOBAL_STATE_DATA_VERSION, GlobalStateSynchroniser, LocalGlobalStateProvider, GlobalStateInitializer, UserDataSyncStoreTypeSynchronizer };
