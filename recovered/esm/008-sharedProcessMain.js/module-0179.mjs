// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/settingsSync.ts
import { AbstractInitializer, AbstractJsonFileSynchroniser } from "./module-0167.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncStoreService, IUserDataSyncUtilService, USER_DATA_SYNC_CONFIGURATION_SCOPE, USER_DATA_SYNC_SCHEME, UserDataSyncError, getIgnoredSettingsForExtension } from "./module-0157.mjs";
import { ConfigurationModelParser } from "./module-0075.mjs";
import { getIgnoredSettings2, isEmpty, merge5, updateIgnoredSettings } from "./module-0178.mjs";
import { Event } from "./module-0018.mjs";
import { distinct } from "./module-0004.mjs";
import { localize } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0057.mjs";
import { IEnvironmentService } from "./module-0047.mjs";
import { IStorageService } from "./module-0096.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { ITelemetryService } from "./module-0085.mjs";
import { IExtensionManagementService } from "./module-0058.mjs";
import { IUriIdentityService } from "./module-0094.mjs";
import { VSBuffer } from "./module-0031.mjs";
import { IUserDataProfilesService } from "./module-0095.mjs";


// src/vs/platform/userDataSync/common/settingsSync.ts
function isSettingsSyncContent(thing) {
  return thing && (thing.settings && typeof thing.settings === "string") && Object.keys(thing).length === 1;
}

function parseSettingsSyncContent(syncContent) {
  const parsed = JSON.parse(syncContent);
  return isSettingsSyncContent(parsed) ? parsed : (
    /* migrate */
    { settings: syncContent }
  );
}

var SettingsSynchroniser = class extends AbstractJsonFileSynchroniser {
  constructor(profile, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, userDataSyncUtilService, configurationService, userDataSyncEnablementService, telemetryService, extensionManagementService, uriIdentityService) {
    super(profile.settingsResource, { syncResource: "settings" /* Settings */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, userDataSyncUtilService, configurationService, uriIdentityService);
    this.profile = profile;
    this.extensionManagementService = extensionManagementService;
    /* Version 2: Change settings from `sync.${setting}` to `settingsSync.{setting}` */
    this.version = 2;
    this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, "settings.json");
    this.baseResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" });
    this.localResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" });
    this.remoteResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" });
    this.acceptedResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" });
    this.coreIgnoredSettings = void 0;
    this.systemExtensionsIgnoredSettings = void 0;
    this.userExtensionsIgnoredSettings = void 0;
  }
  async getRemoteUserDataSyncConfiguration(refOrLatestData) {
    const lastSyncUserData = await this.getLastSyncUserData();
    const remoteUserData = await this.getLatestRemoteUserData(refOrLatestData, lastSyncUserData);
    const remoteSettingsSyncContent = this.getSettingsSyncContent(remoteUserData);
    const parser = new ConfigurationModelParser(USER_DATA_SYNC_CONFIGURATION_SCOPE, this.logService);
    if (remoteSettingsSyncContent?.settings) {
      parser.parse(remoteSettingsSyncContent.settings);
    }
    return parser.configurationModel.getValue(USER_DATA_SYNC_CONFIGURATION_SCOPE) || {};
  }
  async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
    const fileContent = await this.getLocalFileContent();
    const formattingOptions = await this.getFormattingOptions();
    const remoteSettingsSyncContent = this.getSettingsSyncContent(remoteUserData);
    lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
    const lastSettingsSyncContent = lastSyncUserData ? this.getSettingsSyncContent(lastSyncUserData) : null;
    const ignoredSettings = await this.getIgnoredSettings();
    let mergedContent = null;
    let hasLocalChanged = false;
    let hasRemoteChanged = false;
    let hasConflicts = false;
    if (remoteSettingsSyncContent) {
      let localContent2 = fileContent ? fileContent.value.toString().trim() : "{}";
      localContent2 = localContent2 || "{}";
      this.validateContent(localContent2);
      this.logService.trace(`${this.syncResourceLogLabel}: Merging remote settings with local settings...`);
      const result = merge5(localContent2, remoteSettingsSyncContent.settings, lastSettingsSyncContent ? lastSettingsSyncContent.settings : null, ignoredSettings, [], formattingOptions);
      mergedContent = result.localContent || result.remoteContent;
      hasLocalChanged = result.localContent !== null;
      hasRemoteChanged = result.remoteContent !== null;
      hasConflicts = result.hasConflicts;
    } else if (fileContent) {
      this.logService.trace(`${this.syncResourceLogLabel}: Remote settings does not exist. Synchronizing settings for the first time.`);
      mergedContent = fileContent.value.toString().trim() || "{}";
      this.validateContent(mergedContent);
      hasRemoteChanged = true;
    }
    const localContent = fileContent ? fileContent.value.toString() : null;
    const baseContent = lastSettingsSyncContent?.settings ?? null;
    const previewResult = {
      content: hasConflicts ? baseContent : mergedContent,
      localChange: hasLocalChanged ? 2 /* Modified */ : 0 /* None */,
      remoteChange: hasRemoteChanged ? 2 /* Modified */ : 0 /* None */,
      hasConflicts
    };
    return [{
      fileContent,
      baseResource: this.baseResource,
      baseContent,
      localResource: this.localResource,
      localContent,
      localChange: previewResult.localChange,
      remoteResource: this.remoteResource,
      remoteContent: remoteSettingsSyncContent ? remoteSettingsSyncContent.settings : null,
      remoteChange: previewResult.remoteChange,
      previewResource: this.previewResource,
      previewResult,
      acceptedResource: this.acceptedResource
    }];
  }
  async hasRemoteChanged(lastSyncUserData) {
    const lastSettingsSyncContent = this.getSettingsSyncContent(lastSyncUserData);
    if (lastSettingsSyncContent === null) {
      return true;
    }
    const fileContent = await this.getLocalFileContent();
    const localContent = fileContent ? fileContent.value.toString().trim() : "";
    const ignoredSettings = await this.getIgnoredSettings();
    const formattingOptions = await this.getFormattingOptions();
    const result = merge5(localContent || "{}", lastSettingsSyncContent.settings, lastSettingsSyncContent.settings, ignoredSettings, [], formattingOptions);
    return result.remoteContent !== null;
  }
  async getMergeResult(resourcePreview, token) {
    const formatUtils = await this.getFormattingOptions();
    const ignoredSettings = await this.getIgnoredSettings();
    return {
      ...resourcePreview.previewResult,
      // remove ignored settings from the preview content
      content: resourcePreview.previewResult.content ? updateIgnoredSettings(resourcePreview.previewResult.content, "{}", ignoredSettings, formatUtils) : null
    };
  }
  async getAcceptResult(resourcePreview, resource, content, token) {
    const formattingOptions = await this.getFormattingOptions();
    const ignoredSettings = await this.getIgnoredSettings();
    if (this.extUri.isEqual(resource, this.localResource)) {
      return {
        /* Remove ignored settings */
        content: resourcePreview.fileContent ? updateIgnoredSettings(resourcePreview.fileContent.value.toString(), "{}", ignoredSettings, formattingOptions) : null,
        localChange: 0 /* None */,
        remoteChange: 2 /* Modified */
      };
    }
    if (this.extUri.isEqual(resource, this.remoteResource)) {
      return {
        /* Update ignored settings from local file content */
        content: resourcePreview.remoteContent !== null ? updateIgnoredSettings(resourcePreview.remoteContent, resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : "{}", ignoredSettings, formattingOptions) : null,
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
          /* Add ignored settings from local file content */
          content: content !== null ? updateIgnoredSettings(content, resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : "{}", ignoredSettings, formattingOptions) : null,
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
      this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing settings.`);
    }
    content = content ? content.trim() : "{}";
    content = content || "{}";
    this.validateContent(content);
    if (localChange !== 0 /* None */) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating local settings...`);
      if (fileContent) {
        await this.backupLocal(JSON.stringify(this.toSettingsSyncContent(fileContent.value.toString())));
      }
      await this.updateLocalFileContent(content, fileContent, force);
      await this.configurationService.reloadConfiguration(3 /* USER_LOCAL */);
      this.logService.info(`${this.syncResourceLogLabel}: Updated local settings`);
    }
    if (remoteChange !== 0 /* None */) {
      const formatUtils = await this.getFormattingOptions();
      const remoteSettingsSyncContent = this.getSettingsSyncContent(remoteUserData);
      const ignoredSettings = await this.getIgnoredSettings(content);
      content = updateIgnoredSettings(content, remoteSettingsSyncContent ? remoteSettingsSyncContent.settings : "{}", ignoredSettings, formatUtils);
      this.logService.trace(`${this.syncResourceLogLabel}: Updating remote settings...`);
      remoteUserData = await this.updateRemoteUserData(JSON.stringify(this.toSettingsSyncContent(content)), force ? null : remoteUserData.ref);
      this.logService.info(`${this.syncResourceLogLabel}: Updated remote settings`);
    }
    try {
      await this.fileService.del(this.previewResource);
    } catch (e) {
    }
    if (lastSyncUserData?.ref !== remoteUserData.ref) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized settings...`);
      await this.updateLastSyncUserData(remoteUserData);
      this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized settings`);
    }
  }
  async hasLocalData() {
    try {
      const localFileContent = await this.getLocalFileContent();
      if (localFileContent) {
        return !isEmpty(localFileContent.value.toString());
      }
    } catch (error) {
      if (error.fileOperationResult !== 1 /* FILE_NOT_FOUND */) {
        return true;
      }
    }
    return false;
  }
  async resolveContent(uri) {
    if (this.extUri.isEqual(this.remoteResource, uri) || this.extUri.isEqual(this.localResource, uri) || this.extUri.isEqual(this.acceptedResource, uri) || this.extUri.isEqual(this.baseResource, uri)) {
      return this.resolvePreviewContent(uri);
    }
    return null;
  }
  async resolvePreviewContent(resource) {
    let content = await super.resolvePreviewContent(resource);
    if (content) {
      const formatUtils = await this.getFormattingOptions();
      const ignoredSettings = await this.getIgnoredSettings();
      content = updateIgnoredSettings(content, "{}", ignoredSettings, formatUtils);
    }
    return content;
  }
  getSettingsSyncContent(remoteUserData) {
    return remoteUserData.syncData ? this.parseSettingsSyncContent(remoteUserData.syncData.content) : null;
  }
  parseSettingsSyncContent(syncContent) {
    try {
      return parseSettingsSyncContent(syncContent);
    } catch (e) {
      this.logService.error(e);
    }
    return null;
  }
  toSettingsSyncContent(settings) {
    return { settings };
  }
  async getIgnoredSettings(content) {
    if (!this.coreIgnoredSettings) {
      this.coreIgnoredSettings = this.userDataSyncUtilService.resolveDefaultCoreIgnoredSettings();
    }
    if (!this.systemExtensionsIgnoredSettings) {
      this.systemExtensionsIgnoredSettings = this.getIgnoredSettingForSystemExtensions();
    }
    if (!this.userExtensionsIgnoredSettings) {
      this.userExtensionsIgnoredSettings = this.getIgnoredSettingForUserExtensions();
      const disposable = this._register(Event.any(
        Event.filter(this.extensionManagementService.onDidInstallExtensions, ((e) => e.some(({ local }) => !!local))),
        Event.filter(this.extensionManagementService.onDidUninstallExtension, ((e) => !e.error))
      )(() => {
        disposable.dispose();
        this.userExtensionsIgnoredSettings = void 0;
      }));
    }
    const defaultIgnoredSettings = (await Promise.all([this.coreIgnoredSettings, this.systemExtensionsIgnoredSettings, this.userExtensionsIgnoredSettings])).flat();
    return getIgnoredSettings2(defaultIgnoredSettings, this.configurationService, content);
  }
  async getIgnoredSettingForSystemExtensions() {
    const systemExtensions = await this.extensionManagementService.getInstalled(0 /* System */);
    return distinct(systemExtensions.map((e) => getIgnoredSettingsForExtension(e.manifest)).flat());
  }
  async getIgnoredSettingForUserExtensions() {
    const userExtensions = await this.extensionManagementService.getInstalled(1 /* User */, this.profile.extensionsResource);
    return distinct(userExtensions.map((e) => getIgnoredSettingsForExtension(e.manifest)).flat());
  }
  validateContent(content) {
    if (this.hasErrors(content, false)) {
      throw new UserDataSyncError(localize(3682, null), "LocalInvalidContent" /* LocalInvalidContent */, this.resource);
    }
  }
};

SettingsSynchroniser = __decorateClass([
  __decorateParam(2, IFileService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IUserDataSyncStoreService),
  __decorateParam(6, IUserDataSyncLocalStoreService),
  __decorateParam(7, IUserDataSyncLogService),
  __decorateParam(8, IUserDataSyncUtilService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IUserDataSyncEnablementService),
  __decorateParam(11, ITelemetryService),
  __decorateParam(12, IExtensionManagementService),
  __decorateParam(13, IUriIdentityService)
], SettingsSynchroniser);

var SettingsInitializer = class extends AbstractInitializer {
  constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
    super("settings" /* Settings */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
  }
  async doInitialize(remoteUserData) {
    const settingsSyncContent = remoteUserData.syncData ? this.parseSettingsSyncContent(remoteUserData.syncData.content) : null;
    if (!settingsSyncContent) {
      this.logService.info("Skipping initializing settings because remote settings does not exist.");
      return;
    }
    const isEmpty2 = await this.isEmpty();
    if (!isEmpty2) {
      this.logService.info("Skipping initializing settings because local settings exist.");
      return;
    }
    await this.fileService.writeFile(this.userDataProfilesService.defaultProfile.settingsResource, VSBuffer.fromString(settingsSyncContent.settings));
    await this.updateLastSyncUserData(remoteUserData);
  }
  async isEmpty() {
    try {
      const fileContent = await this.fileService.readFile(this.userDataProfilesService.defaultProfile.settingsResource);
      return isEmpty(fileContent.value.toString().trim());
    } catch (error) {
      return error.fileOperationResult === 1 /* FILE_NOT_FOUND */;
    }
  }
  parseSettingsSyncContent(syncContent) {
    try {
      return parseSettingsSyncContent(syncContent);
    } catch (e) {
      this.logService.error(e);
    }
    return null;
  }
};

SettingsInitializer = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, IUserDataSyncLogService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IUriIdentityService)
], SettingsInitializer);
export { isSettingsSyncContent, parseSettingsSyncContent, SettingsSynchroniser, SettingsInitializer };
