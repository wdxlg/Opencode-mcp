// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/abstractJsonSynchronizer.ts
import { AbstractFileSynchroniser } from "./module-0167.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncStoreService, USER_DATA_SYNC_SCHEME } from "./module-0157.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0057.mjs";
import { IEnvironmentService } from "./module-0047.mjs";
import { IStorageService } from "./module-0096.mjs";
import { ITelemetryService } from "./module-0085.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { IUriIdentityService } from "./module-0094.mjs";


// src/vs/platform/userDataSync/common/abstractJsonSynchronizer.ts
var AbstractJsonSynchronizer = class extends AbstractFileSynchroniser {
  constructor(fileResource, syncResourceMetadata, collection, previewFileName, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService) {
    super(fileResource, syncResourceMetadata, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
    this.version = 1;
    this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, previewFileName);
    this.baseResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" });
    this.localResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" });
    this.remoteResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" });
    this.acceptedResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" });
  }
  async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration) {
    const remoteContent = remoteUserData.syncData ? this.getContentFromSyncContent(remoteUserData.syncData.content) : null;
    lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
    const lastSyncContent = lastSyncUserData?.syncData ? this.getContentFromSyncContent(lastSyncUserData.syncData.content) : null;
    const fileContent = await this.getLocalFileContent();
    let content = null;
    let hasLocalChanged = false;
    let hasRemoteChanged = false;
    let hasConflicts = false;
    if (remoteUserData.syncData) {
      const localContent2 = fileContent ? fileContent.value.toString() : null;
      if (!lastSyncContent || lastSyncContent !== localContent2 || lastSyncContent !== remoteContent) {
        this.logService.trace(`${this.syncResourceLogLabel}: Merging remote ${this.syncResource.syncResource} with local ${this.syncResource.syncResource}...`);
        const result = this.merge(localContent2, remoteContent, lastSyncContent);
        content = result.content;
        hasConflicts = result.hasConflicts;
        hasLocalChanged = result.hasLocalChanged;
        hasRemoteChanged = result.hasRemoteChanged;
      }
    } else if (fileContent) {
      this.logService.trace(`${this.syncResourceLogLabel}: Remote ${this.syncResource.syncResource} does not exist. Synchronizing ${this.syncResource.syncResource} for the first time.`);
      content = fileContent.value.toString();
      hasRemoteChanged = true;
    }
    const previewResult = {
      content: hasConflicts ? lastSyncContent : content,
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
    const lastSyncContent = lastSyncUserData?.syncData ? this.getContentFromSyncContent(lastSyncUserData.syncData.content) : null;
    if (lastSyncContent === null) {
      return true;
    }
    const fileContent = await this.getLocalFileContent();
    const localContent = fileContent ? fileContent.value.toString() : null;
    const result = this.merge(localContent, lastSyncContent, lastSyncContent);
    return result.hasLocalChanged || result.hasRemoteChanged;
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
    const { content, localChange, remoteChange } = resourcePreviews[0][1];
    if (localChange === 0 /* None */ && remoteChange === 0 /* None */) {
      this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing ${this.syncResource.syncResource}.`);
    }
    if (localChange !== 0 /* None */) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating local ${this.syncResource.syncResource}...`);
      if (fileContent) {
        await this.backupLocal(JSON.stringify(this.toSyncContent(fileContent.value.toString())));
      }
      if (content) {
        await this.updateLocalFileContent(content, fileContent, force);
      } else {
        await this.deleteLocalFile();
      }
      this.logService.info(`${this.syncResourceLogLabel}: Updated local ${this.syncResource.syncResource}`);
    }
    if (remoteChange !== 0 /* None */) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating remote ${this.syncResource.syncResource}...`);
      const remoteContents = JSON.stringify(this.toSyncContent(content));
      remoteUserData = await this.updateRemoteUserData(remoteContents, force ? null : remoteUserData.ref);
      this.logService.info(`${this.syncResourceLogLabel}: Updated remote ${this.syncResource.syncResource}`);
    }
    try {
      await this.fileService.del(this.previewResource);
    } catch (e) {
    }
    if (lastSyncUserData?.ref !== remoteUserData.ref) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized ${this.syncResource.syncResource}...`);
      await this.updateLastSyncUserData(remoteUserData);
      this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized ${this.syncResource.syncResource}`);
    }
  }
  async hasLocalData() {
    return this.fileService.exists(this.file);
  }
  async resolveContent(uri) {
    if (this.extUri.isEqual(this.remoteResource, uri) || this.extUri.isEqual(this.baseResource, uri) || this.extUri.isEqual(this.localResource, uri) || this.extUri.isEqual(this.acceptedResource, uri)) {
      return this.resolvePreviewContent(uri);
    }
    return null;
  }
  merge(originalLocalContent, originalRemoteContent, baseContent) {
    if (originalLocalContent === null && originalRemoteContent === null && baseContent === null) {
      return { content: null, hasLocalChanged: false, hasRemoteChanged: false, hasConflicts: false };
    }
    originalRemoteContent = originalRemoteContent ?? "";
    originalLocalContent = originalLocalContent ?? "";
    baseContent = baseContent ?? "";
    if (originalLocalContent === originalRemoteContent) {
      return { content: null, hasLocalChanged: false, hasRemoteChanged: false, hasConflicts: false };
    }
    const localForwarded = baseContent !== originalLocalContent;
    const remoteForwarded = baseContent !== originalRemoteContent;
    if (!localForwarded && !remoteForwarded) {
      return { content: null, hasLocalChanged: false, hasRemoteChanged: false, hasConflicts: false };
    }
    if (localForwarded && !remoteForwarded) {
      return { content: originalLocalContent, hasRemoteChanged: true, hasLocalChanged: false, hasConflicts: false };
    }
    if (remoteForwarded && !localForwarded) {
      return { content: originalRemoteContent, hasLocalChanged: true, hasRemoteChanged: false, hasConflicts: false };
    }
    return { content: originalLocalContent, hasLocalChanged: true, hasRemoteChanged: true, hasConflicts: true };
  }
};

AbstractJsonSynchronizer = __decorateClass([
  __decorateParam(4, IFileService),
  __decorateParam(5, IEnvironmentService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IUserDataSyncStoreService),
  __decorateParam(8, IUserDataSyncLocalStoreService),
  __decorateParam(9, IUserDataSyncEnablementService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IUserDataSyncLogService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, IUriIdentityService)
], AbstractJsonSynchronizer);
export { AbstractJsonSynchronizer };
