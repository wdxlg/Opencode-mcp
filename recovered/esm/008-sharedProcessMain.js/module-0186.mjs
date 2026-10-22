// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/userDataProfilesManifestSync.ts
import { AbstractSynchroniser } from "./module-0167.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncStoreService, USER_DATA_SYNC_SCHEME, UserDataSyncError } from "./module-0157.mjs";
import { merge7 } from "./module-0185.mjs";
import { toFormattedString } from "./module-0072.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfilesService } from "./module-0095.mjs";
import { IFileService } from "./module-0057.mjs";
import { IEnvironmentService } from "./module-0047.mjs";
import { IStorageService } from "./module-0096.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { ITelemetryService } from "./module-0085.mjs";
import { IUriIdentityService } from "./module-0094.mjs";


// src/vs/platform/userDataSync/common/userDataProfilesManifestSync.ts
var UserDataProfilesManifestSynchroniser = class extends AbstractSynchroniser {
  constructor(profile, collection, userDataProfilesService, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, telemetryService, uriIdentityService) {
    super({ syncResource: "profiles" /* Profiles */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
    this.userDataProfilesService = userDataProfilesService;
    this.version = 2;
    this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, "profiles.json");
    this.baseResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" });
    this.localResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" });
    this.remoteResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" });
    this.acceptedResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" });
    this._register(userDataProfilesService.onDidChangeProfiles(() => this.triggerLocalChange()));
  }
  async getLastSyncedProfiles() {
    const lastSyncUserData = await this.getLastSyncUserData();
    return lastSyncUserData?.syncData ? parseUserDataProfilesManifest(lastSyncUserData.syncData) : null;
  }
  async getRemoteSyncedProfiles(refOrLatestData) {
    const lastSyncUserData = await this.getLastSyncUserData();
    const remoteUserData = await this.getLatestRemoteUserData(refOrLatestData, lastSyncUserData);
    return remoteUserData?.syncData ? parseUserDataProfilesManifest(remoteUserData.syncData) : null;
  }
  async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
    const remoteProfiles = remoteUserData.syncData ? parseUserDataProfilesManifest(remoteUserData.syncData) : null;
    const lastSyncProfiles = lastSyncUserData?.syncData ? parseUserDataProfilesManifest(lastSyncUserData.syncData) : null;
    const localProfiles = this.getLocalUserDataProfiles();
    const { local, remote } = merge7(localProfiles, remoteProfiles, lastSyncProfiles, []);
    const previewResult = {
      local,
      remote,
      content: lastSyncProfiles ? this.stringifyRemoteProfiles(lastSyncProfiles) : null,
      localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Modified */ : 0 /* None */,
      remoteChange: remote !== null ? 2 /* Modified */ : 0 /* None */
    };
    const localContent = stringifyLocalProfiles(localProfiles, false);
    return [{
      baseResource: this.baseResource,
      baseContent: lastSyncProfiles ? this.stringifyRemoteProfiles(lastSyncProfiles) : null,
      localResource: this.localResource,
      localContent,
      remoteResource: this.remoteResource,
      remoteContent: remoteProfiles ? this.stringifyRemoteProfiles(remoteProfiles) : null,
      remoteProfiles,
      previewResource: this.previewResource,
      previewResult,
      localChange: previewResult.localChange,
      remoteChange: previewResult.remoteChange,
      acceptedResource: this.acceptedResource
    }];
  }
  async hasRemoteChanged(lastSyncUserData) {
    const lastSyncProfiles = lastSyncUserData?.syncData ? parseUserDataProfilesManifest(lastSyncUserData.syncData) : null;
    const localProfiles = this.getLocalUserDataProfiles();
    const { remote } = merge7(localProfiles, lastSyncProfiles, lastSyncProfiles, []);
    return !!remote?.added.length || !!remote?.removed.length || !!remote?.updated.length;
  }
  async getMergeResult(resourcePreview, token) {
    return { ...resourcePreview.previewResult, hasConflicts: false };
  }
  async getAcceptResult(resourcePreview, resource, content, token) {
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
    const localProfiles = this.getLocalUserDataProfiles();
    const mergeResult = merge7(localProfiles, null, null, []);
    const { local, remote } = mergeResult;
    return {
      content: resourcePreview.localContent,
      local,
      remote,
      localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Modified */ : 0 /* None */,
      remoteChange: remote !== null ? 2 /* Modified */ : 0 /* None */
    };
  }
  async acceptRemote(resourcePreview) {
    const remoteProfiles = resourcePreview.remoteContent ? JSON.parse(resourcePreview.remoteContent) : null;
    const lastSyncProfiles = [];
    const localProfiles = [];
    for (const profile of this.getLocalUserDataProfiles()) {
      const remoteProfile = remoteProfiles?.find((remoteProfile2) => remoteProfile2.id === profile.id);
      if (remoteProfile) {
        lastSyncProfiles.push({ id: profile.id, name: profile.name, collection: remoteProfile.collection });
        localProfiles.push(profile);
      }
    }
    if (remoteProfiles !== null) {
      const mergeResult = merge7(localProfiles, remoteProfiles, lastSyncProfiles, []);
      const { local, remote } = mergeResult;
      return {
        content: resourcePreview.remoteContent,
        local,
        remote,
        localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Modified */ : 0 /* None */,
        remoteChange: remote !== null ? 2 /* Modified */ : 0 /* None */
      };
    } else {
      return {
        content: resourcePreview.remoteContent,
        local: { added: [], removed: [], updated: [] },
        remote: null,
        localChange: 0 /* None */,
        remoteChange: 0 /* None */
      };
    }
  }
  async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
    const { local, remote, localChange, remoteChange } = resourcePreviews[0][1];
    if (localChange === 0 /* None */ && remoteChange === 0 /* None */) {
      this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing profiles.`);
    }
    const remoteProfiles = resourcePreviews[0][0].remoteProfiles || [];
    if (remoteProfiles.length + (remote?.added.length ?? 0) - (remote?.removed.length ?? 0) > 20) {
      throw new UserDataSyncError("Too many profiles to sync. Please remove some profiles and try again.", "LocalTooManyProfiles" /* LocalTooManyProfiles */);
    }
    if (localChange !== 0 /* None */) {
      await this.backupLocal(stringifyLocalProfiles(this.getLocalUserDataProfiles(), false));
      await Promise.all(local.removed.map(async (profile) => {
        this.logService.trace(`${this.syncResourceLogLabel}: Removing '${profile.name}' profile...`);
        await this.userDataProfilesService.removeProfile(profile);
        this.logService.info(`${this.syncResourceLogLabel}: Removed profile '${profile.name}'.`);
      }));
      await Promise.all(local.added.map(async (profile) => {
        this.logService.trace(`${this.syncResourceLogLabel}: Creating '${profile.name}' profile...`);
        await this.userDataProfilesService.createProfile(profile.id, profile.name, { icon: profile.icon, useDefaultFlags: profile.useDefaultFlags });
        this.logService.info(`${this.syncResourceLogLabel}: Created profile '${profile.name}'.`);
      }));
      await Promise.all(local.updated.map(async (profile) => {
        const localProfile = this.userDataProfilesService.profiles.find((p) => p.id === profile.id);
        if (localProfile) {
          this.logService.trace(`${this.syncResourceLogLabel}: Updating '${profile.name}' profile...`);
          await this.userDataProfilesService.updateProfile(localProfile, { name: profile.name, icon: profile.icon, useDefaultFlags: profile.useDefaultFlags });
          this.logService.info(`${this.syncResourceLogLabel}: Updated profile '${profile.name}'.`);
        } else {
          this.logService.info(`${this.syncResourceLogLabel}: Could not find profile with id '${profile.id}' to update.`);
        }
      }));
    }
    if (remoteChange !== 0 /* None */) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating remote profiles...`);
      const addedCollections = [];
      const canAddRemoteProfiles = remoteProfiles.length + (remote?.added.length ?? 0) <= 20;
      if (canAddRemoteProfiles) {
        for (const profile of remote?.added || []) {
          const collection = await this.userDataSyncStoreService.createCollection(this.syncHeaders);
          this.logService.trace(`${this.syncResourceLogLabel}: Created collection "${collection}" for "${profile.name}".`);
          addedCollections.push(collection);
          remoteProfiles.push({ id: profile.id, name: profile.name, collection, icon: profile.icon, useDefaultFlags: profile.useDefaultFlags });
        }
      } else {
        this.logService.info(`${this.syncResourceLogLabel}: Could not create remote profiles as there are too many profiles.`);
      }
      for (const profile of remote?.removed || []) {
        remoteProfiles.splice(remoteProfiles.findIndex(({ id: id2 }) => profile.id === id2), 1);
      }
      for (const profile of remote?.updated || []) {
        const profileToBeUpdated = remoteProfiles.find(({ id: id2 }) => profile.id === id2);
        if (profileToBeUpdated) {
          remoteProfiles.splice(remoteProfiles.indexOf(profileToBeUpdated), 1, { ...profileToBeUpdated, id: profile.id, name: profile.name, icon: profile.icon, useDefaultFlags: profile.useDefaultFlags });
        }
      }
      try {
        remoteUserData = await this.updateRemoteProfiles(remoteProfiles, force ? null : remoteUserData.ref);
        this.logService.info(`${this.syncResourceLogLabel}: Updated remote profiles.${canAddRemoteProfiles && remote?.added.length ? ` Added: ${JSON.stringify(remote.added.map((e) => e.name))}.` : ""}${remote?.updated.length ? ` Updated: ${JSON.stringify(remote.updated.map((e) => e.name))}.` : ""}${remote?.removed.length ? ` Removed: ${JSON.stringify(remote.removed.map((e) => e.name))}.` : ""}`);
      } catch (error) {
        if (addedCollections.length) {
          this.logService.info(`${this.syncResourceLogLabel}: Failed to update remote profiles. Cleaning up added collections...`);
          for (const collection of addedCollections) {
            await this.userDataSyncStoreService.deleteCollection(collection, this.syncHeaders);
          }
        }
        throw error;
      }
      for (const profile of remote?.removed || []) {
        await this.userDataSyncStoreService.deleteCollection(profile.collection, this.syncHeaders);
      }
    }
    if (lastSyncUserData?.ref !== remoteUserData.ref) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized profiles...`);
      await this.updateLastSyncUserData(remoteUserData);
      this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized profiles.`);
    }
  }
  async updateRemoteProfiles(profiles, ref) {
    return this.updateRemoteUserData(this.stringifyRemoteProfiles(profiles), ref);
  }
  async hasLocalData() {
    return this.getLocalUserDataProfiles().length > 0;
  }
  async resolveContent(uri) {
    if (this.extUri.isEqual(this.remoteResource, uri) || this.extUri.isEqual(this.baseResource, uri) || this.extUri.isEqual(this.localResource, uri) || this.extUri.isEqual(this.acceptedResource, uri)) {
      const content = await this.resolvePreviewContent(uri);
      return content ? toFormattedString(JSON.parse(content), {}) : content;
    }
    return null;
  }
  getLocalUserDataProfiles() {
    return this.userDataProfilesService.profiles.filter((p) => !p.isDefault && !p.isTransient);
  }
  stringifyRemoteProfiles(profiles) {
    return JSON.stringify([...profiles].sort((a, b) => a.name.localeCompare(b.name)));
  }
};

UserDataProfilesManifestSynchroniser = __decorateClass([
  __decorateParam(2, IUserDataProfilesService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IEnvironmentService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IUserDataSyncStoreService),
  __decorateParam(7, IUserDataSyncLocalStoreService),
  __decorateParam(8, IUserDataSyncLogService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IUserDataSyncEnablementService),
  __decorateParam(11, ITelemetryService),
  __decorateParam(12, IUriIdentityService)
], UserDataProfilesManifestSynchroniser);

function stringifyLocalProfiles(profiles, format5) {
  const result = [...profiles].sort((a, b) => a.name.localeCompare(b.name)).map((p) => ({ id: p.id, name: p.name }));
  return format5 ? toFormattedString(result, {}) : JSON.stringify(result);
}

function parseUserDataProfilesManifest(syncData) {
  return JSON.parse(syncData.content);
}
export { stringifyLocalProfiles, parseUserDataProfilesManifest, UserDataProfilesManifestSynchroniser };
