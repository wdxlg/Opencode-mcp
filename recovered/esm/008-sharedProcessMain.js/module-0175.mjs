// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/keybindingsSync.ts
import { isUndefined } from "./module-0006.mjs";
import { OS } from "./module-0014.mjs";
import { AbstractInitializer, AbstractJsonFileSynchroniser } from "./module-0167.mjs";
import { CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM, IUserDataSyncEnablementService, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncStoreService, IUserDataSyncUtilService, USER_DATA_SYNC_SCHEME, UserDataSyncError } from "./module-0157.mjs";
import { Event } from "./module-0018.mjs";
import { localize } from "./module-0007.mjs";
import { merge3 } from "./module-0174.mjs";
import { parse3 } from "./module-0071.mjs";
import { isNonEmptyArray } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { IFileService } from "./module-0057.mjs";
import { IEnvironmentService } from "./module-0047.mjs";
import { IStorageService } from "./module-0096.mjs";
import { ITelemetryService } from "./module-0085.mjs";
import { IUriIdentityService } from "./module-0094.mjs";
import { VSBuffer } from "./module-0031.mjs";
import { IUserDataProfilesService } from "./module-0095.mjs";


// src/vs/platform/userDataSync/common/keybindingsSync.ts
function getKeybindingsContentFromSyncContent(syncContent, platformSpecific, logService) {
  try {
    const parsed = JSON.parse(syncContent);
    if (!platformSpecific) {
      return isUndefined(parsed.all) ? null : parsed.all;
    }
    switch (OS) {
      case 2 /* Macintosh */:
        return isUndefined(parsed.mac) ? null : parsed.mac;
      case 3 /* Linux */:
        return isUndefined(parsed.linux) ? null : parsed.linux;
      case 1 /* Windows */:
        return isUndefined(parsed.windows) ? null : parsed.windows;
    }
  } catch (e) {
    logService.error(e);
    return null;
  }
}

var KeybindingsSynchroniser = class extends AbstractJsonFileSynchroniser {
  constructor(profile, collection, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, fileService, environmentService, storageService, userDataSyncUtilService, telemetryService, uriIdentityService) {
    super(profile.keybindingsResource, { syncResource: "keybindings" /* Keybindings */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, userDataSyncUtilService, configurationService, uriIdentityService);
    /* Version 2: Change settings from `sync.${setting}` to `settingsSync.{setting}` */
    this.version = 2;
    this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, "keybindings.json");
    this.baseResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" });
    this.localResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" });
    this.remoteResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" });
    this.acceptedResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" });
    this._register(Event.filter(configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("settingsSync.keybindingsPerPlatform"))(() => this.triggerLocalChange()));
  }
  async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration) {
    const remoteContent = remoteUserData.syncData ? getKeybindingsContentFromSyncContent(remoteUserData.syncData.content, userDataSyncConfiguration.keybindingsPerPlatform ?? this.syncKeybindingsPerPlatform(), this.logService) : null;
    lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
    const lastSyncContent = lastSyncUserData ? this.getKeybindingsContentFromLastSyncUserData(lastSyncUserData) : null;
    const fileContent = await this.getLocalFileContent();
    const formattingOptions = await this.getFormattingOptions();
    let mergedContent = null;
    let hasLocalChanged = false;
    let hasRemoteChanged = false;
    let hasConflicts = false;
    if (remoteContent) {
      let localContent2 = fileContent ? fileContent.value.toString() : "[]";
      localContent2 = localContent2 || "[]";
      if (this.hasErrors(localContent2, true)) {
        throw new UserDataSyncError(localize(3681, null), "LocalInvalidContent" /* LocalInvalidContent */, this.resource);
      }
      if (!lastSyncContent || lastSyncContent !== localContent2 || lastSyncContent !== remoteContent) {
        this.logService.trace(`${this.syncResourceLogLabel}: Merging remote keybindings with local keybindings...`);
        const result = await merge3(localContent2, remoteContent, lastSyncContent, formattingOptions, this.userDataSyncUtilService);
        if (result.hasChanges) {
          mergedContent = result.mergeContent;
          hasConflicts = result.hasConflicts;
          hasLocalChanged = hasConflicts || result.mergeContent !== localContent2;
          hasRemoteChanged = hasConflicts || result.mergeContent !== remoteContent;
        }
      }
    } else if (fileContent) {
      this.logService.trace(`${this.syncResourceLogLabel}: Remote keybindings does not exist. Synchronizing keybindings for the first time.`);
      mergedContent = fileContent.value.toString();
      hasRemoteChanged = true;
    }
    const previewResult = {
      content: hasConflicts ? lastSyncContent : mergedContent,
      localChange: hasLocalChanged ? fileContent ? 2 /* Modified */ : 1 /* Added */ : 0 /* None */,
      remoteChange: hasRemoteChanged ? 2 /* Modified */ : 0 /* None */,
      hasConflicts
    };
    const localContent = fileContent ? fileContent.value.toString() : null;
    return [{
      fileContent,
      baseResource: this.baseResource,
      baseContent: lastSyncContent,
      localResource: this.localResource,
      localContent,
      localChange: previewResult.localChange,
      remoteResource: this.remoteResource,
      remoteContent,
      remoteChange: previewResult.remoteChange,
      previewResource: this.previewResource,
      previewResult,
      acceptedResource: this.acceptedResource
    }];
  }
  async hasRemoteChanged(lastSyncUserData) {
    const lastSyncContent = this.getKeybindingsContentFromLastSyncUserData(lastSyncUserData);
    if (lastSyncContent === null) {
      return true;
    }
    const fileContent = await this.getLocalFileContent();
    const localContent = fileContent ? fileContent.value.toString() : "";
    const formattingOptions = await this.getFormattingOptions();
    const result = await merge3(localContent || "[]", lastSyncContent, lastSyncContent, formattingOptions, this.userDataSyncUtilService);
    return result.hasConflicts || result.mergeContent !== lastSyncContent;
  }
  async getMergeResult(resourcePreview, token) {
    return resourcePreview.previewResult;
  }
  async getAcceptResult(resourcePreview, resource, content, token) {
    if (this.extUri.isEqual(resource, this.localResource)) {
      return {
        content: resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : null,
        localChange: 0 /* None */,
        remoteChange: 2 /* Modified */
      };
    }
    if (this.extUri.isEqual(resource, this.remoteResource)) {
      return {
        content: resourcePreview.remoteContent,
        localChange: 2 /* Modified */,
        remoteChange: 0 /* None */
      };
    }
    if (this.extUri.isEqual(resource, this.previewResource)) {
      if (content === void 0) {
        return {
          content: resourcePreview.previewResult.content,
          localChange: resourcePreview.previewResult.localChange,
          remoteChange: resourcePreview.previewResult.remoteChange
        };
      } else {
        return {
          content,
          localChange: 2 /* Modified */,
          remoteChange: 2 /* Modified */
        };
      }
    }
    throw new Error(`Invalid Resource: ${resource.toString()}`);
  }
  async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
    const { fileContent } = resourcePreviews[0][0];
    let { content, localChange, remoteChange } = resourcePreviews[0][1];
    if (localChange === 0 /* None */ && remoteChange === 0 /* None */) {
      this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing keybindings.`);
    }
    if (content !== null) {
      content = content.trim();
      content = content || "[]";
      if (this.hasErrors(content, true)) {
        throw new UserDataSyncError(localize(3681, null), "LocalInvalidContent" /* LocalInvalidContent */, this.resource);
      }
    }
    if (localChange !== 0 /* None */) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating local keybindings...`);
      if (fileContent) {
        await this.backupLocal(this.toSyncContent(fileContent.value.toString()));
      }
      await this.updateLocalFileContent(content || "[]", fileContent, force);
      this.logService.info(`${this.syncResourceLogLabel}: Updated local keybindings`);
    }
    if (remoteChange !== 0 /* None */) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating remote keybindings...`);
      const remoteContents = this.toSyncContent(content || "[]", remoteUserData.syncData?.content);
      remoteUserData = await this.updateRemoteUserData(remoteContents, force ? null : remoteUserData.ref);
      this.logService.info(`${this.syncResourceLogLabel}: Updated remote keybindings`);
    }
    try {
      await this.fileService.del(this.previewResource);
    } catch (e) {
    }
    if (lastSyncUserData?.ref !== remoteUserData.ref) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized keybindings...`);
      await this.updateLastSyncUserData(remoteUserData, { platformSpecific: this.syncKeybindingsPerPlatform() });
      this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized keybindings`);
    }
  }
  async hasLocalData() {
    try {
      const localFileContent = await this.getLocalFileContent();
      if (localFileContent) {
        const keybindings = parse3(localFileContent.value.toString());
        if (isNonEmptyArray(keybindings)) {
          return true;
        }
      }
    } catch (error) {
      if (error.fileOperationResult !== 1 /* FILE_NOT_FOUND */) {
        return true;
      }
    }
    return false;
  }
  async resolveContent(uri) {
    if (this.extUri.isEqual(this.remoteResource, uri) || this.extUri.isEqual(this.baseResource, uri) || this.extUri.isEqual(this.localResource, uri) || this.extUri.isEqual(this.acceptedResource, uri)) {
      return this.resolvePreviewContent(uri);
    }
    return null;
  }
  getKeybindingsContentFromLastSyncUserData(lastSyncUserData) {
    if (!lastSyncUserData.syncData) {
      return null;
    }
    if (lastSyncUserData.platformSpecific !== void 0 && lastSyncUserData.platformSpecific !== this.syncKeybindingsPerPlatform()) {
      return null;
    }
    return getKeybindingsContentFromSyncContent(lastSyncUserData.syncData.content, this.syncKeybindingsPerPlatform(), this.logService);
  }
  toSyncContent(keybindingsContent, syncContent) {
    let parsed = {};
    try {
      parsed = JSON.parse(syncContent || "{}");
    } catch (e) {
      this.logService.error(e);
    }
    if (this.syncKeybindingsPerPlatform()) {
      delete parsed.all;
    } else {
      parsed.all = keybindingsContent;
    }
    switch (OS) {
      case 2 /* Macintosh */:
        parsed.mac = keybindingsContent;
        break;
      case 3 /* Linux */:
        parsed.linux = keybindingsContent;
        break;
      case 1 /* Windows */:
        parsed.windows = keybindingsContent;
        break;
    }
    return JSON.stringify(parsed);
  }
  syncKeybindingsPerPlatform() {
    return !!this.configurationService.getValue(CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM);
  }
};

KeybindingsSynchroniser = __decorateClass([
  __decorateParam(2, IUserDataSyncStoreService),
  __decorateParam(3, IUserDataSyncLocalStoreService),
  __decorateParam(4, IUserDataSyncLogService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IUserDataSyncEnablementService),
  __decorateParam(7, IFileService),
  __decorateParam(8, IEnvironmentService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, IUserDataSyncUtilService),
  __decorateParam(11, ITelemetryService),
  __decorateParam(12, IUriIdentityService)
], KeybindingsSynchroniser);

var KeybindingsInitializer = class extends AbstractInitializer {
  constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
    super("keybindings" /* Keybindings */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
  }
  async doInitialize(remoteUserData) {
    const keybindingsContent = remoteUserData.syncData ? this.getKeybindingsContentFromSyncContent(remoteUserData.syncData.content) : null;
    if (!keybindingsContent) {
      this.logService.info("Skipping initializing keybindings because remote keybindings does not exist.");
      return;
    }
    const isEmpty2 = await this.isEmpty();
    if (!isEmpty2) {
      this.logService.info("Skipping initializing keybindings because local keybindings exist.");
      return;
    }
    await this.fileService.writeFile(this.userDataProfilesService.defaultProfile.keybindingsResource, VSBuffer.fromString(keybindingsContent));
    await this.updateLastSyncUserData(remoteUserData);
  }
  async isEmpty() {
    try {
      const fileContent = await this.fileService.readFile(this.userDataProfilesService.defaultProfile.settingsResource);
      const keybindings = parse3(fileContent.value.toString());
      return !isNonEmptyArray(keybindings);
    } catch (error) {
      return error.fileOperationResult === 1 /* FILE_NOT_FOUND */;
    }
  }
  getKeybindingsContentFromSyncContent(syncContent) {
    try {
      return getKeybindingsContentFromSyncContent(syncContent, true, this.logService);
    } catch (e) {
      this.logService.error(e);
      return null;
    }
  }
};

KeybindingsInitializer = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, IUserDataSyncLogService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IUriIdentityService)
], KeybindingsInitializer);
export { getKeybindingsContentFromSyncContent, KeybindingsSynchroniser, KeybindingsInitializer };
