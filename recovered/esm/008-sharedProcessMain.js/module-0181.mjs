// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/snippetsSync.ts
import { AbstractInitializer, AbstractSynchroniser } from "./module-0167.mjs";
import { Event } from "./module-0018.mjs";
import { areSame4, merge6 } from "./module-0180.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncStoreService, USER_DATA_SYNC_SCHEME } from "./module-0157.mjs";
import { VSBuffer } from "./module-0031.mjs";
import { deepClone } from "./module-0074.mjs";
import { FileOperationError, IFileService } from "./module-0057.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEnvironmentService } from "./module-0047.mjs";
import { IStorageService } from "./module-0096.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { ITelemetryService } from "./module-0085.mjs";
import { IUriIdentityService } from "./module-0094.mjs";
import { IUserDataProfilesService } from "./module-0095.mjs";


// src/vs/platform/userDataSync/common/snippetsSync.ts
function parseSnippets(syncData) {
  return JSON.parse(syncData.content);
}

var SnippetsSynchroniser = class extends AbstractSynchroniser {
  constructor(profile, collection, environmentService, fileService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, telemetryService, uriIdentityService) {
    super({ syncResource: "snippets" /* Snippets */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
    this.version = 1;
    this.snippetsFolder = profile.snippetsHome;
    this._register(this.fileService.watch(environmentService.userRoamingDataHome));
    this._register(this.fileService.watch(this.snippetsFolder));
    this._register(Event.filter(this.fileService.onDidFilesChange, (e) => e.affects(this.snippetsFolder))(() => this.triggerLocalChange()));
  }
  async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
    const local = await this.getSnippetsFileContents();
    const localSnippets = this.toSnippetsContents(local);
    const remoteSnippets = remoteUserData.syncData ? this.parseSnippets(remoteUserData.syncData) : null;
    lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
    const lastSyncSnippets = lastSyncUserData && lastSyncUserData.syncData ? this.parseSnippets(lastSyncUserData.syncData) : null;
    if (remoteSnippets) {
      this.logService.trace(`${this.syncResourceLogLabel}: Merging remote snippets with local snippets...`);
    } else {
      this.logService.trace(`${this.syncResourceLogLabel}: Remote snippets does not exist. Synchronizing snippets for the first time.`);
    }
    const mergeResult = merge6(localSnippets, remoteSnippets, lastSyncSnippets);
    return this.getResourcePreviews(mergeResult, local, remoteSnippets || {}, lastSyncSnippets || {});
  }
  async hasRemoteChanged(lastSyncUserData) {
    const lastSyncSnippets = lastSyncUserData.syncData ? this.parseSnippets(lastSyncUserData.syncData) : null;
    if (lastSyncSnippets === null) {
      return true;
    }
    const local = await this.getSnippetsFileContents();
    const localSnippets = this.toSnippetsContents(local);
    const mergeResult = merge6(localSnippets, lastSyncSnippets, lastSyncSnippets);
    return Object.keys(mergeResult.remote.added).length > 0 || Object.keys(mergeResult.remote.updated).length > 0 || mergeResult.remote.removed.length > 0 || mergeResult.conflicts.length > 0;
  }
  async getMergeResult(resourcePreview, token) {
    return resourcePreview.previewResult;
  }
  async getAcceptResult(resourcePreview, resource, content, token) {
    if (this.extUri.isEqualOrParent(resource, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }))) {
      return {
        content: resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : null,
        localChange: 0 /* None */,
        remoteChange: resourcePreview.fileContent ? resourcePreview.remoteContent !== null ? 2 /* Modified */ : 1 /* Added */ : 3 /* Deleted */
      };
    }
    if (this.extUri.isEqualOrParent(resource, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }))) {
      return {
        content: resourcePreview.remoteContent,
        localChange: resourcePreview.remoteContent !== null ? resourcePreview.fileContent ? 2 /* Modified */ : 1 /* Added */ : 3 /* Deleted */,
        remoteChange: 0 /* None */
      };
    }
    if (this.extUri.isEqualOrParent(resource, this.syncPreviewFolder)) {
      if (content === void 0) {
        return {
          content: resourcePreview.previewResult.content,
          localChange: resourcePreview.previewResult.localChange,
          remoteChange: resourcePreview.previewResult.remoteChange
        };
      } else {
        return {
          content,
          localChange: content === null ? resourcePreview.fileContent !== null ? 3 /* Deleted */ : 0 /* None */ : 2 /* Modified */,
          remoteChange: content === null ? resourcePreview.remoteContent !== null ? 3 /* Deleted */ : 0 /* None */ : 2 /* Modified */
        };
      }
    }
    throw new Error(`Invalid Resource: ${resource.toString()}`);
  }
  async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
    const accptedResourcePreviews = resourcePreviews.map(([resourcePreview, acceptResult]) => ({ ...resourcePreview, acceptResult }));
    if (accptedResourcePreviews.every(({ localChange, remoteChange }) => localChange === 0 /* None */ && remoteChange === 0 /* None */)) {
      this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing snippets.`);
    }
    if (accptedResourcePreviews.some(({ localChange }) => localChange !== 0 /* None */)) {
      await this.updateLocalBackup(accptedResourcePreviews);
      await this.updateLocalSnippets(accptedResourcePreviews, force);
    }
    if (accptedResourcePreviews.some(({ remoteChange }) => remoteChange !== 0 /* None */)) {
      remoteUserData = await this.updateRemoteSnippets(accptedResourcePreviews, remoteUserData, force);
    }
    if (lastSyncUserData?.ref !== remoteUserData.ref) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized snippets...`);
      await this.updateLastSyncUserData(remoteUserData);
      this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized snippets`);
    }
    for (const { previewResource } of accptedResourcePreviews) {
      try {
        await this.fileService.del(previewResource);
      } catch (e) {
      }
    }
  }
  getResourcePreviews(snippetsMergeResult, localFileContent, remoteSnippets, baseSnippets) {
    const resourcePreviews = /* @__PURE__ */ new Map();
    for (const key of Object.keys(snippetsMergeResult.local.added)) {
      const previewResult = {
        content: snippetsMergeResult.local.added[key],
        hasConflicts: false,
        localChange: 1 /* Added */,
        remoteChange: 0 /* None */
      };
      resourcePreviews.set(key, {
        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
        baseContent: null,
        fileContent: null,
        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
        localContent: null,
        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
        remoteContent: remoteSnippets[key],
        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
        previewResult,
        localChange: previewResult.localChange,
        remoteChange: previewResult.remoteChange,
        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
      });
    }
    for (const key of Object.keys(snippetsMergeResult.local.updated)) {
      const previewResult = {
        content: snippetsMergeResult.local.updated[key],
        hasConflicts: false,
        localChange: 2 /* Modified */,
        remoteChange: 0 /* None */
      };
      const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
      resourcePreviews.set(key, {
        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
        baseContent: baseSnippets[key] ?? null,
        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
        fileContent: localFileContent[key],
        localContent,
        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
        remoteContent: remoteSnippets[key],
        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
        previewResult,
        localChange: previewResult.localChange,
        remoteChange: previewResult.remoteChange,
        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
      });
    }
    for (const key of snippetsMergeResult.local.removed) {
      const previewResult = {
        content: null,
        hasConflicts: false,
        localChange: 3 /* Deleted */,
        remoteChange: 0 /* None */
      };
      const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
      resourcePreviews.set(key, {
        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
        baseContent: baseSnippets[key] ?? null,
        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
        fileContent: localFileContent[key],
        localContent,
        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
        remoteContent: null,
        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
        previewResult,
        localChange: previewResult.localChange,
        remoteChange: previewResult.remoteChange,
        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
      });
    }
    for (const key of Object.keys(snippetsMergeResult.remote.added)) {
      const previewResult = {
        content: snippetsMergeResult.remote.added[key],
        hasConflicts: false,
        localChange: 0 /* None */,
        remoteChange: 1 /* Added */
      };
      const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
      resourcePreviews.set(key, {
        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
        baseContent: baseSnippets[key] ?? null,
        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
        fileContent: localFileContent[key],
        localContent,
        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
        remoteContent: null,
        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
        previewResult,
        localChange: previewResult.localChange,
        remoteChange: previewResult.remoteChange,
        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
      });
    }
    for (const key of Object.keys(snippetsMergeResult.remote.updated)) {
      const previewResult = {
        content: snippetsMergeResult.remote.updated[key],
        hasConflicts: false,
        localChange: 0 /* None */,
        remoteChange: 2 /* Modified */
      };
      const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
      resourcePreviews.set(key, {
        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
        baseContent: baseSnippets[key] ?? null,
        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
        fileContent: localFileContent[key],
        localContent,
        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
        remoteContent: remoteSnippets[key],
        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
        previewResult,
        localChange: previewResult.localChange,
        remoteChange: previewResult.remoteChange,
        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
      });
    }
    for (const key of snippetsMergeResult.remote.removed) {
      const previewResult = {
        content: null,
        hasConflicts: false,
        localChange: 0 /* None */,
        remoteChange: 3 /* Deleted */
      };
      resourcePreviews.set(key, {
        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
        baseContent: baseSnippets[key] ?? null,
        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
        fileContent: null,
        localContent: null,
        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
        remoteContent: remoteSnippets[key],
        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
        previewResult,
        localChange: previewResult.localChange,
        remoteChange: previewResult.remoteChange,
        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
      });
    }
    for (const key of snippetsMergeResult.conflicts) {
      const previewResult = {
        content: baseSnippets[key] ?? null,
        hasConflicts: true,
        localChange: localFileContent[key] ? 2 /* Modified */ : 1 /* Added */,
        remoteChange: remoteSnippets[key] ? 2 /* Modified */ : 1 /* Added */
      };
      const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
      resourcePreviews.set(key, {
        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
        baseContent: baseSnippets[key] ?? null,
        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
        fileContent: localFileContent[key] || null,
        localContent,
        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
        remoteContent: remoteSnippets[key] || null,
        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
        previewResult,
        localChange: previewResult.localChange,
        remoteChange: previewResult.remoteChange,
        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
      });
    }
    for (const key of Object.keys(localFileContent)) {
      if (!resourcePreviews.has(key)) {
        const previewResult = {
          content: localFileContent[key] ? localFileContent[key].value.toString() : null,
          hasConflicts: false,
          localChange: 0 /* None */,
          remoteChange: 0 /* None */
        };
        const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
        resourcePreviews.set(key, {
          baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
          baseContent: baseSnippets[key] ?? null,
          localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
          fileContent: localFileContent[key] || null,
          localContent,
          remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
          remoteContent: remoteSnippets[key] || null,
          previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
          previewResult,
          localChange: previewResult.localChange,
          remoteChange: previewResult.remoteChange,
          acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
        });
      }
    }
    return [...resourcePreviews.values()];
  }
  async resolveContent(uri) {
    if (this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" })) || this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" })) || this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" })) || this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" }))) {
      return this.resolvePreviewContent(uri);
    }
    return null;
  }
  async hasLocalData() {
    try {
      const localSnippets = await this.getSnippetsFileContents();
      if (Object.keys(localSnippets).length) {
        return true;
      }
    } catch (error) {
    }
    return false;
  }
  async updateLocalBackup(resourcePreviews) {
    const local = {};
    for (const resourcePreview of resourcePreviews) {
      if (resourcePreview.fileContent) {
        local[this.extUri.basename(resourcePreview.localResource)] = resourcePreview.fileContent;
      }
    }
    await this.backupLocal(JSON.stringify(this.toSnippetsContents(local)));
  }
  async updateLocalSnippets(resourcePreviews, force) {
    for (const { fileContent, acceptResult, localResource, remoteResource, localChange } of resourcePreviews) {
      if (localChange !== 0 /* None */) {
        const key = remoteResource ? this.extUri.basename(remoteResource) : this.extUri.basename(localResource);
        const resource = this.extUri.joinPath(this.snippetsFolder, key);
        if (localChange === 3 /* Deleted */) {
          this.logService.trace(`${this.syncResourceLogLabel}: Deleting snippet...`, this.extUri.basename(resource));
          await this.fileService.del(resource);
          this.logService.info(`${this.syncResourceLogLabel}: Deleted snippet`, this.extUri.basename(resource));
        } else if (localChange === 1 /* Added */) {
          this.logService.trace(`${this.syncResourceLogLabel}: Creating snippet...`, this.extUri.basename(resource));
          await this.fileService.createFile(resource, VSBuffer.fromString(acceptResult.content), { overwrite: force });
          this.logService.info(`${this.syncResourceLogLabel}: Created snippet`, this.extUri.basename(resource));
        } else {
          this.logService.trace(`${this.syncResourceLogLabel}: Updating snippet...`, this.extUri.basename(resource));
          await this.fileService.writeFile(resource, VSBuffer.fromString(acceptResult.content), force ? void 0 : fileContent);
          this.logService.info(`${this.syncResourceLogLabel}: Updated snippet`, this.extUri.basename(resource));
        }
      }
    }
  }
  async updateRemoteSnippets(resourcePreviews, remoteUserData, forcePush) {
    const currentSnippets = remoteUserData.syncData ? this.parseSnippets(remoteUserData.syncData) : {};
    const newSnippets = deepClone(currentSnippets);
    for (const { acceptResult, localResource, remoteResource, remoteChange } of resourcePreviews) {
      if (remoteChange !== 0 /* None */) {
        const key = localResource ? this.extUri.basename(localResource) : this.extUri.basename(remoteResource);
        if (remoteChange === 3 /* Deleted */) {
          delete newSnippets[key];
        } else {
          newSnippets[key] = acceptResult.content;
        }
      }
    }
    if (!areSame4(currentSnippets, newSnippets)) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating remote snippets...`);
      remoteUserData = await this.updateRemoteUserData(JSON.stringify(newSnippets), forcePush ? null : remoteUserData.ref);
      this.logService.info(`${this.syncResourceLogLabel}: Updated remote snippets`);
    }
    return remoteUserData;
  }
  parseSnippets(syncData) {
    return parseSnippets(syncData);
  }
  toSnippetsContents(snippetsFileContents) {
    const snippets = {};
    for (const key of Object.keys(snippetsFileContents)) {
      snippets[key] = snippetsFileContents[key].value.toString();
    }
    return snippets;
  }
  async getSnippetsFileContents() {
    const snippets = {};
    let stat;
    try {
      stat = await this.fileService.resolve(this.snippetsFolder);
    } catch (e) {
      if (e instanceof FileOperationError && e.fileOperationResult === 1 /* FILE_NOT_FOUND */) {
        return snippets;
      } else {
        throw e;
      }
    }
    for (const entry of stat.children || []) {
      const resource = entry.resource;
      const extension = this.extUri.extname(resource);
      if (extension === ".json" || extension === ".code-snippets") {
        const key = this.extUri.relativePath(this.snippetsFolder, resource);
        const content = await this.fileService.readFile(resource);
        snippets[key] = content;
      }
    }
    return snippets;
  }
};

SnippetsSynchroniser = __decorateClass([
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IUserDataSyncStoreService),
  __decorateParam(6, IUserDataSyncLocalStoreService),
  __decorateParam(7, IUserDataSyncLogService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IUserDataSyncEnablementService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IUriIdentityService)
], SnippetsSynchroniser);

var SnippetsInitializer = class extends AbstractInitializer {
  constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
    super("snippets" /* Snippets */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
  }
  async doInitialize(remoteUserData) {
    const remoteSnippets = remoteUserData.syncData ? JSON.parse(remoteUserData.syncData.content) : null;
    if (!remoteSnippets) {
      this.logService.info("Skipping initializing snippets because remote snippets does not exist.");
      return;
    }
    const isEmpty2 = await this.isEmpty();
    if (!isEmpty2) {
      this.logService.info("Skipping initializing snippets because local snippets exist.");
      return;
    }
    for (const key of Object.keys(remoteSnippets)) {
      const content = remoteSnippets[key];
      if (content) {
        const resource = this.extUri.joinPath(this.userDataProfilesService.defaultProfile.snippetsHome, key);
        await this.fileService.createFile(resource, VSBuffer.fromString(content));
        this.logService.info("Created snippet", this.extUri.basename(resource));
      }
    }
    await this.updateLastSyncUserData(remoteUserData);
  }
  async isEmpty() {
    try {
      const stat = await this.fileService.resolve(this.userDataProfilesService.defaultProfile.snippetsHome);
      return !stat.children?.length;
    } catch (error) {
      return error.fileOperationResult === 1 /* FILE_NOT_FOUND */;
    }
  }
};

SnippetsInitializer = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, IUserDataSyncLogService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IUriIdentityService)
], SnippetsInitializer);
export { parseSnippets, SnippetsSynchroniser, SnippetsInitializer };
