// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/extensionsSync.ts
import { areSameExtensions } from "./module-0886.mjs";
import { compare } from "./module-0030.mjs";
import { toFormattedString } from "./module-1377.mjs";
import { AbstractInitializer, AbstractSynchroniser, getSyncResourceLogLabel } from "./module-1746.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncStoreService, USER_DATA_SYNC_SCHEME } from "./module-1696.mjs";
import { Event2 } from "./module-0017.mjs";
import { DISABLED_EXTENSIONS_STORAGE_PATH, EXTENSION_INSTALL_SKIP_PUBLISHER_TRUST_CONTEXT, EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT, EXTENSION_INSTALL_SOURCE_CONTEXT, ExtensionManagementError, IExtensionGalleryService, IExtensionManagementService } from "./module-0872.mjs";
import { merge3 } from "./module-3973.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IFileService } from "./module-0269.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IIgnoredExtensionsManagementService } from "./module-1818.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ExtensionStorageService, IExtensionStorageService } from "./module-1265.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IUserDataProfileStorageService } from "./module-1715.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { isApplicationScopedExtension } from "./module-0688.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { Promises } from "./module-0036.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { GlobalExtensionEnablementService } from "./module-1695.mjs";
import { IProductService } from "./module-0873.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/platform/userDataSync/common/extensionsSync.ts
async function parseAndMigrateExtensions(syncData, extensionManagementService) {
  const extensions = JSON.parse(syncData.content);
  if (syncData.version === 1 || syncData.version === 2) {
    const builtinExtensions = (await extensionManagementService.getInstalled(0 /* System */)).filter((e) => e.isBuiltin);
    for (const extension of extensions) {
      if (syncData.version === 1) {
        if (extension.enabled === false) {
          extension.disabled = true;
        }
        delete extension.enabled;
      }
      if (syncData.version === 2) {
        if (builtinExtensions.every((installed) => !areSameExtensions(installed.identifier, extension.identifier))) {
          extension.installed = true;
        }
      }
    }
  }
  return extensions;
}

function stringify4(extensions, format5) {
  extensions.sort((e1, e2) => {
    if (!e1.identifier.uuid && e2.identifier.uuid) {
      return -1;
    }
    if (e1.identifier.uuid && !e2.identifier.uuid) {
      return 1;
    }
    return compare(e1.identifier.id, e2.identifier.id);
  });
  return format5 ? toFormattedString(extensions, {}) : JSON.stringify(extensions);
}

var ExtensionsSynchroniser = class extends AbstractSynchroniser {
  constructor(profile, collection, environmentService, fileService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, extensionManagementService, ignoredExtensionsManagementService, logService, configurationService, userDataSyncEnablementService, telemetryService, extensionStorageService, uriIdentityService, userDataProfileStorageService, instantiationService) {
    super({ syncResource: "extensions" /* Extensions */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
    this.extensionManagementService = extensionManagementService;
    this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
    this.instantiationService = instantiationService;
    /*
    	Version 3 - Introduce installed property to skip installing built in extensions
    	protected readonly version: number = 3;
    */
    /* Version 4: Change settings from `sync.${setting}` to `settingsSync.{setting}` */
    /* Version 5: Introduce extension state */
    /* Version 6: Added isApplicationScoped property */
    this.version = 6;
    this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, "extensions.json");
    this.baseResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" });
    this.localResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" });
    this.remoteResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" });
    this.acceptedResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" });
    this.localExtensionsProvider = this.instantiationService.createInstance(LocalExtensionsProvider);
    this._register(
      Event2.any(
        Event2.filter(this.extensionManagementService.onDidInstallExtensions, ((e) => e.some(({ local }) => !!local))),
        Event2.filter(this.extensionManagementService.onDidUninstallExtension, ((e) => !e.error)),
        Event2.filter(userDataProfileStorageService.onDidChange, (e) => e.valueChanges.some(({ profile: profile2, changes }) => this.syncResource.profile.id === profile2.id && changes.some((change) => change.key === DISABLED_EXTENSIONS_STORAGE_PATH))),
        extensionStorageService.onDidChangeExtensionStorageToSync
      )(() => this.triggerLocalChange())
    );
  }
  async generateSyncPreview(remoteUserData, lastSyncUserData) {
    const remoteExtensions = remoteUserData.syncData ? await parseAndMigrateExtensions(remoteUserData.syncData, this.extensionManagementService) : null;
    const skippedExtensions = lastSyncUserData?.skippedExtensions ?? [];
    const builtinExtensions = lastSyncUserData?.builtinExtensions ?? null;
    const lastSyncExtensions = lastSyncUserData?.syncData ? await parseAndMigrateExtensions(lastSyncUserData.syncData, this.extensionManagementService) : null;
    const { localExtensions, ignoredExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
    if (remoteExtensions) {
      this.logService.trace(`${this.syncResourceLogLabel}: Merging remote extensions with local extensions...`);
    } else {
      this.logService.trace(`${this.syncResourceLogLabel}: Remote extensions does not exist. Synchronizing extensions for the first time.`);
    }
    const { local, remote } = merge3(localExtensions, remoteExtensions, lastSyncExtensions, skippedExtensions, ignoredExtensions, builtinExtensions);
    const previewResult = {
      local,
      remote,
      content: this.getPreviewContent(localExtensions, local.added, local.updated, local.removed),
      localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Modified */ : 0 /* None */,
      remoteChange: remote !== null ? 2 /* Modified */ : 0 /* None */
    };
    const localContent = this.stringify(localExtensions, false);
    return [{
      skippedExtensions,
      builtinExtensions,
      baseResource: this.baseResource,
      baseContent: lastSyncExtensions ? this.stringify(lastSyncExtensions, false) : localContent,
      localResource: this.localResource,
      localContent,
      localExtensions,
      remoteResource: this.remoteResource,
      remoteExtensions,
      remoteContent: remoteExtensions ? this.stringify(remoteExtensions, false) : null,
      previewResource: this.previewResource,
      previewResult,
      localChange: previewResult.localChange,
      remoteChange: previewResult.remoteChange,
      acceptedResource: this.acceptedResource
    }];
  }
  async hasRemoteChanged(lastSyncUserData) {
    const lastSyncExtensions = lastSyncUserData.syncData ? await parseAndMigrateExtensions(lastSyncUserData.syncData, this.extensionManagementService) : null;
    const { localExtensions, ignoredExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
    const { remote } = merge3(localExtensions, lastSyncExtensions, lastSyncExtensions, lastSyncUserData.skippedExtensions || [], ignoredExtensions, lastSyncUserData.builtinExtensions || []);
    return remote !== null;
  }
  getPreviewContent(localExtensions, added, updated, removed) {
    const preview = [...added, ...updated];
    const idsOrUUIDs = /* @__PURE__ */ new Set();
    const addIdentifier = (identifier2) => {
      idsOrUUIDs.add(identifier2.id.toLowerCase());
      if (identifier2.uuid) {
        idsOrUUIDs.add(identifier2.uuid);
      }
    };
    preview.forEach(({ identifier: identifier2 }) => addIdentifier(identifier2));
    removed.forEach(addIdentifier);
    for (const localExtension of localExtensions) {
      if (idsOrUUIDs.has(localExtension.identifier.id.toLowerCase()) || localExtension.identifier.uuid && idsOrUUIDs.has(localExtension.identifier.uuid)) {
        continue;
      }
      preview.push(localExtension);
    }
    return this.stringify(preview, false);
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
    const installedExtensions = await this.extensionManagementService.getInstalled(void 0, this.syncResource.profile.extensionsResource);
    const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
    const remoteExtensions = resourcePreview.remoteContent ? JSON.parse(resourcePreview.remoteContent) : null;
    const mergeResult = merge3(resourcePreview.localExtensions, remoteExtensions, remoteExtensions, resourcePreview.skippedExtensions, ignoredExtensions, resourcePreview.builtinExtensions);
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
    const installedExtensions = await this.extensionManagementService.getInstalled(void 0, this.syncResource.profile.extensionsResource);
    const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
    const remoteExtensions = resourcePreview.remoteContent ? JSON.parse(resourcePreview.remoteContent) : null;
    if (remoteExtensions !== null) {
      const mergeResult = merge3(resourcePreview.localExtensions, remoteExtensions, resourcePreview.localExtensions, [], ignoredExtensions, resourcePreview.builtinExtensions);
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
    let { skippedExtensions, builtinExtensions, localExtensions } = resourcePreviews[0][0];
    const { local, remote, localChange, remoteChange } = resourcePreviews[0][1];
    if (localChange === 0 /* None */ && remoteChange === 0 /* None */) {
      this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing extensions.`);
    }
    if (localChange !== 0 /* None */) {
      await this.backupLocal(JSON.stringify(localExtensions));
      skippedExtensions = await this.localExtensionsProvider.updateLocalExtensions(local.added, local.removed, local.updated, skippedExtensions, this.syncResource.profile);
    }
    if (remote) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating remote extensions...`);
      const content2 = JSON.stringify(remote.all);
      remoteUserData = await this.updateRemoteUserData(content2, force ? null : remoteUserData.ref);
      this.logService.info(`${this.syncResourceLogLabel}: Updated remote extensions.${remote.added.length ? ` Added: ${JSON.stringify(remote.added.map((e) => e.identifier.id))}.` : ""}${remote.updated.length ? ` Updated: ${JSON.stringify(remote.updated.map((e) => e.identifier.id))}.` : ""}${remote.removed.length ? ` Removed: ${JSON.stringify(remote.removed.map((e) => e.identifier.id))}.` : ""}`);
    }
    if (lastSyncUserData?.ref !== remoteUserData.ref) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized extensions...`);
      builtinExtensions = this.computeBuiltinExtensions(localExtensions, builtinExtensions);
      await this.updateLastSyncUserData(remoteUserData, { skippedExtensions, builtinExtensions });
      this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized extensions.${skippedExtensions.length ? ` Skipped: ${JSON.stringify(skippedExtensions.map((e) => e.identifier.id))}.` : ""}`);
    }
  }
  computeBuiltinExtensions(localExtensions, previousBuiltinExtensions) {
    const localExtensionsSet = /* @__PURE__ */ new Set();
    const builtinExtensions = [];
    for (const localExtension of localExtensions) {
      localExtensionsSet.add(localExtension.identifier.id.toLowerCase());
      if (!localExtension.installed) {
        builtinExtensions.push(localExtension.identifier);
      }
    }
    if (previousBuiltinExtensions) {
      for (const builtinExtension of previousBuiltinExtensions) {
        if (!localExtensionsSet.has(builtinExtension.id.toLowerCase())) {
          builtinExtensions.push(builtinExtension);
        }
      }
    }
    return builtinExtensions;
  }
  async resolveContent(uri5) {
    if (this.extUri.isEqual(this.remoteResource, uri5) || this.extUri.isEqual(this.baseResource, uri5) || this.extUri.isEqual(this.localResource, uri5) || this.extUri.isEqual(this.acceptedResource, uri5)) {
      const content2 = await this.resolvePreviewContent(uri5);
      return content2 ? this.stringify(JSON.parse(content2), true) : content2;
    }
    return null;
  }
  stringify(extensions, format5) {
    return stringify4(extensions, format5);
  }
  async hasLocalData() {
    try {
      const { localExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
      if (localExtensions.some((e) => e.installed || e.disabled)) {
        return true;
      }
    } catch (error) {
    }
    return false;
  }
};

ExtensionsSynchroniser = __decorateClass([
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IUserDataSyncStoreService),
  __decorateParam(6, IUserDataSyncLocalStoreService),
  __decorateParam(7, IExtensionManagementService),
  __decorateParam(8, IIgnoredExtensionsManagementService),
  __decorateParam(9, IUserDataSyncLogService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IUserDataSyncEnablementService),
  __decorateParam(12, ITelemetryService),
  __decorateParam(13, IExtensionStorageService),
  __decorateParam(14, IUriIdentityService),
  __decorateParam(15, IUserDataProfileStorageService),
  __decorateParam(16, IInstantiationService)
], ExtensionsSynchroniser);

var LocalExtensionsProvider = class {
  constructor(extensionManagementService, userDataProfileStorageService, extensionGalleryService, ignoredExtensionsManagementService, instantiationService, logService, productService) {
    this.extensionManagementService = extensionManagementService;
    this.userDataProfileStorageService = userDataProfileStorageService;
    this.extensionGalleryService = extensionGalleryService;
    this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.productService = productService;
  }
  async getLocalExtensions(profile) {
    const installedExtensions = await this.extensionManagementService.getInstalled(void 0, profile.extensionsResource);
    const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
    const localExtensions = await this.withProfileScopedServices(profile, async (extensionEnablementService, extensionStorageService) => {
      const disabledExtensions = extensionEnablementService.getDisabledExtensions();
      return installedExtensions.map((extension) => {
        const { identifier: identifier2, isBuiltin, manifest, preRelease, pinned, isApplicationScoped } = extension;
        const syncExtension = { identifier: identifier2, preRelease, version: manifest.version, pinned: !!pinned };
        if (isApplicationScoped && !isApplicationScopedExtension(manifest)) {
          syncExtension.isApplicationScoped = isApplicationScoped;
        }
        if (this.productService.builtInExtensionsEnabledWithAutoUpdates?.some((id2) => id2.toLowerCase() === identifier2.id.toLowerCase())) {
          syncExtension.isApplicationScoped = true;
        }
        if (disabledExtensions.some((disabledExtension) => areSameExtensions(disabledExtension, identifier2))) {
          syncExtension.disabled = true;
        }
        if (!isBuiltin) {
          syncExtension.installed = true;
        }
        try {
          const keys = extensionStorageService.getKeysForSync({ id: identifier2.id, version: manifest.version });
          if (keys) {
            const extensionStorageState = extensionStorageService.getExtensionState(extension, true) || {};
            syncExtension.state = Object.keys(extensionStorageState).reduce((state, key3) => {
              if (keys.includes(key3)) {
                state[key3] = extensionStorageState[key3];
              }
              return state;
            }, {});
          }
        } catch (error) {
          this.logService.info(`${getSyncResourceLogLabel("extensions" /* Extensions */, profile)}: Error while parsing extension state`, getErrorMessage(error));
        }
        return syncExtension;
      });
    });
    return { localExtensions, ignoredExtensions };
  }
  async updateLocalExtensions(added, removed, updated, skippedExtensions, profile) {
    const syncResourceLogLabel = getSyncResourceLogLabel("extensions" /* Extensions */, profile);
    const extensionsToInstall = [];
    const syncExtensionsToInstall = /* @__PURE__ */ new Map();
    const removeFromSkipped = [];
    const addToSkipped = [];
    const installedExtensions = await this.extensionManagementService.getInstalled(void 0, profile.extensionsResource);
    if (added.length || updated.length) {
      await this.withProfileScopedServices(profile, async (extensionEnablementService, extensionStorageService) => {
        await Promises.settled([...added, ...updated].map(async (e) => {
          const installedExtension = installedExtensions.find((installed) => areSameExtensions(installed.identifier, e.identifier));
          if (installedExtension && installedExtension.isBuiltin) {
            if (e.state && installedExtension.manifest.version === e.version) {
              this.updateExtensionState(e.state, installedExtension, installedExtension.manifest.version, extensionStorageService);
            }
            const isDisabled = extensionEnablementService.getDisabledExtensions().some((disabledExtension) => areSameExtensions(disabledExtension, e.identifier));
            if (isDisabled !== !!e.disabled) {
              if (e.disabled) {
                this.logService.trace(`${syncResourceLogLabel}: Disabling extension...`, e.identifier.id);
                await extensionEnablementService.disableExtension(e.identifier);
                this.logService.info(`${syncResourceLogLabel}: Disabled extension`, e.identifier.id);
              } else {
                this.logService.trace(`${syncResourceLogLabel}: Enabling extension...`, e.identifier.id);
                await extensionEnablementService.enableExtension(e.identifier);
                this.logService.info(`${syncResourceLogLabel}: Enabled extension`, e.identifier.id);
              }
            }
            removeFromSkipped.push(e.identifier);
            return;
          }
          const version2 = e.pinned ? e.version : void 0;
          const extension = (await this.extensionGalleryService.getExtensions([{ ...e.identifier, version: version2, preRelease: version2 ? void 0 : e.preRelease }], CancellationToken.None))[0];
          if (e.state && (installedExtension ? installedExtension.manifest.version === e.version : !!extension)) {
            this.updateExtensionState(e.state, installedExtension || extension, installedExtension?.manifest.version, extensionStorageService);
          }
          if (extension) {
            try {
              const isDisabled = extensionEnablementService.getDisabledExtensions().some((disabledExtension) => areSameExtensions(disabledExtension, e.identifier));
              if (isDisabled !== !!e.disabled) {
                if (e.disabled) {
                  this.logService.trace(`${syncResourceLogLabel}: Disabling extension...`, e.identifier.id, extension.version);
                  await extensionEnablementService.disableExtension(extension.identifier);
                  this.logService.info(`${syncResourceLogLabel}: Disabled extension`, e.identifier.id, extension.version);
                } else {
                  this.logService.trace(`${syncResourceLogLabel}: Enabling extension...`, e.identifier.id, extension.version);
                  await extensionEnablementService.enableExtension(extension.identifier);
                  this.logService.info(`${syncResourceLogLabel}: Enabled extension`, e.identifier.id, extension.version);
                }
              }
              if (!installedExtension || installedExtension.preRelease !== e.preRelease || installedExtension.pinned !== e.pinned || version2 && installedExtension.manifest.version !== version2) {
                if (await this.extensionManagementService.canInstall(extension) === true) {
                  extensionsToInstall.push({
                    extension,
                    options: {
                      isMachineScoped: false,
                      donotIncludePackAndDependencies: true,
                      installGivenVersion: e.pinned && !!e.version,
                      pinned: e.pinned,
                      installPreReleaseVersion: e.preRelease,
                      preRelease: e.preRelease,
                      profileLocation: profile.extensionsResource,
                      isApplicationScoped: e.isApplicationScoped,
                      context: { [EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true, [EXTENSION_INSTALL_SOURCE_CONTEXT]: "settingsSync" /* SETTINGS_SYNC */, [EXTENSION_INSTALL_SKIP_PUBLISHER_TRUST_CONTEXT]: true }
                    }
                  });
                  syncExtensionsToInstall.set(extension.identifier.id.toLowerCase(), e);
                } else {
                  this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because it cannot be installed.`, extension.displayName || extension.identifier.id);
                  addToSkipped.push(e);
                }
              }
            } catch (error) {
              addToSkipped.push(e);
              this.logService.error(error);
              this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension`, extension.displayName || extension.identifier.id);
            }
          } else {
            addToSkipped.push(e);
            this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because the extension is not found.`, e.identifier.id);
          }
        }));
      });
    }
    if (removed.length) {
      const extensionsToRemove = installedExtensions.filter(({ identifier: identifier2, isBuiltin }) => !isBuiltin && removed.some((r2) => areSameExtensions(identifier2, r2)));
      await Promises.settled(extensionsToRemove.map(async (extensionToRemove) => {
        this.logService.trace(`${syncResourceLogLabel}: Uninstalling local extension...`, extensionToRemove.identifier.id);
        await this.extensionManagementService.uninstall(extensionToRemove, { donotIncludePack: true, donotCheckDependents: true, profileLocation: profile.extensionsResource });
        this.logService.info(`${syncResourceLogLabel}: Uninstalled local extension.`, extensionToRemove.identifier.id);
        removeFromSkipped.push(extensionToRemove.identifier);
      }));
    }
    const results = await this.extensionManagementService.installGalleryExtensions(extensionsToInstall);
    for (const { identifier: identifier2, local, error, source } of results) {
      const gallery = source;
      if (local) {
        this.logService.info(`${syncResourceLogLabel}: Installed extension.`, identifier2.id, gallery.version);
        removeFromSkipped.push(identifier2);
      } else {
        const e = syncExtensionsToInstall.get(identifier2.id.toLowerCase());
        if (e) {
          addToSkipped.push(e);
          this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension`, gallery.displayName || gallery.identifier.id);
        }
        if (error instanceof ExtensionManagementError && ["Incompatible" /* Incompatible */, "IncompatibleApi" /* IncompatibleApi */, "IncompatibleTargetPlatform" /* IncompatibleTargetPlatform */].includes(error.code)) {
          this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because the compatible extension is not found.`, gallery.displayName || gallery.identifier.id);
        } else if (error) {
          this.logService.error(error);
        }
      }
    }
    const newSkippedExtensions = [];
    for (const skippedExtension of skippedExtensions) {
      if (!removeFromSkipped.some((e) => areSameExtensions(e, skippedExtension.identifier))) {
        newSkippedExtensions.push(skippedExtension);
      }
    }
    for (const skippedExtension of addToSkipped) {
      if (!newSkippedExtensions.some((e) => areSameExtensions(e.identifier, skippedExtension.identifier))) {
        newSkippedExtensions.push(skippedExtension);
      }
    }
    return newSkippedExtensions;
  }
  updateExtensionState(state, extension, version2, extensionStorageService) {
    const extensionState = extensionStorageService.getExtensionState(extension, true) || {};
    const keys = version2 ? extensionStorageService.getKeysForSync({ id: extension.identifier.id, version: version2 }) : void 0;
    if (keys) {
      keys.forEach((key3) => {
        extensionState[key3] = state[key3];
      });
    } else {
      Object.keys(state).forEach((key3) => extensionState[key3] = state[key3]);
    }
    extensionStorageService.setExtensionState(extension, extensionState, true);
  }
  async withProfileScopedServices(profile, fn) {
    return this.userDataProfileStorageService.withProfileScopedStorageService(
      profile,
      async (storageService) => {
        const disposables = new DisposableStore();
        const instantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection([IStorageService, storageService])));
        const extensionEnablementService = disposables.add(instantiationService.createInstance(GlobalExtensionEnablementService));
        const extensionStorageService = disposables.add(instantiationService.createInstance(ExtensionStorageService));
        try {
          return await fn(extensionEnablementService, extensionStorageService);
        } finally {
          disposables.dispose();
        }
      }
    );
  }
};

LocalExtensionsProvider = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, IUserDataProfileStorageService),
  __decorateParam(2, IExtensionGalleryService),
  __decorateParam(3, IIgnoredExtensionsManagementService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IUserDataSyncLogService),
  __decorateParam(6, IProductService)
], LocalExtensionsProvider);

var AbstractExtensionsInitializer = class extends AbstractInitializer {
  constructor(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
    super("extensions" /* Extensions */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
    this.extensionManagementService = extensionManagementService;
    this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
  }
  async parseExtensions(remoteUserData) {
    return remoteUserData.syncData ? await parseAndMigrateExtensions(remoteUserData.syncData, this.extensionManagementService) : null;
  }
  generatePreview(remoteExtensions, localExtensions) {
    const installedExtensions = [];
    const newExtensions = [];
    const disabledExtensions = [];
    for (const extension of remoteExtensions) {
      if (this.ignoredExtensionsManagementService.hasToNeverSyncExtension(extension.identifier.id)) {
        continue;
      }
      const installedExtension = localExtensions.find((i2) => areSameExtensions(i2.identifier, extension.identifier));
      if (installedExtension) {
        installedExtensions.push(installedExtension);
        if (extension.disabled) {
          disabledExtensions.push(extension.identifier);
        }
      } else if (extension.installed) {
        newExtensions.push({ ...extension.identifier, preRelease: !!extension.preRelease });
        if (extension.disabled) {
          disabledExtensions.push(extension.identifier);
        }
      }
    }
    return { installedExtensions, newExtensions, disabledExtensions, remoteExtensions };
  }
};

AbstractExtensionsInitializer = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, IIgnoredExtensionsManagementService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IUserDataProfilesService),
  __decorateParam(4, IEnvironmentService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IUriIdentityService)
], AbstractExtensionsInitializer);
export { parseAndMigrateExtensions, stringify4, ExtensionsSynchroniser, LocalExtensionsProvider, AbstractExtensionsInitializer };
