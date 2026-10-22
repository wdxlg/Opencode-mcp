// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataProfile/browser/settingsResource.ts
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { FileOperationError, IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { updateIgnoredSettings } from "./module-1709.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { IUserDataSyncUtilService } from "./module-1696.mjs";
import { localize } from "./module-0001.mjs";
import { API_OPEN_EDITOR_COMMAND_ID } from "./module-1538.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/services/userDataProfile/browser/settingsResource.ts
var SettingsResourceInitializer = class {
  constructor(userDataProfileService, fileService, logService) {
    this.userDataProfileService = userDataProfileService;
    this.fileService = fileService;
    this.logService = logService;
  }
  async initialize(content2) {
    const settingsContent = JSON.parse(content2);
    if (settingsContent.settings === null) {
      this.logService.info(`Initializing Profile: No settings to apply...`);
      return;
    }
    await this.fileService.writeFile(this.userDataProfileService.currentProfile.settingsResource, VSBuffer.fromString(settingsContent.settings));
  }
};

SettingsResourceInitializer = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILogService)
], SettingsResourceInitializer);

var SettingsResource = class {
  constructor(fileService, userDataSyncUtilService, logService) {
    this.fileService = fileService;
    this.userDataSyncUtilService = userDataSyncUtilService;
    this.logService = logService;
  }
  async getContent(profile) {
    const settingsContent = await this.getSettingsContent(profile);
    return JSON.stringify(settingsContent);
  }
  async getSettingsContent(profile) {
    const localContent = await this.getLocalFileContent(profile);
    if (localContent === null) {
      return { settings: null };
    } else {
      const ignoredSettings = this.getIgnoredSettings();
      const formattingOptions = await this.userDataSyncUtilService.resolveFormattingOptions(profile.settingsResource);
      const settings = updateIgnoredSettings(localContent || "{}", "{}", ignoredSettings, formattingOptions);
      return { settings };
    }
  }
  async apply(content2, profile) {
    const settingsContent = JSON.parse(content2);
    if (settingsContent.settings === null) {
      this.logService.info(`Importing Profile (${profile.name}): No settings to apply...`);
      return;
    }
    const localSettingsContent = await this.getLocalFileContent(profile);
    const formattingOptions = await this.userDataSyncUtilService.resolveFormattingOptions(profile.settingsResource);
    const contentToUpdate = updateIgnoredSettings(settingsContent.settings, localSettingsContent || "{}", this.getIgnoredSettings(), formattingOptions);
    await this.fileService.writeFile(profile.settingsResource, VSBuffer.fromString(contentToUpdate));
  }
  getIgnoredSettings() {
    const allSettings2 = Registry.as(Extensions4.Configuration).getConfigurationProperties();
    const ignoredSettings = Object.keys(allSettings2).filter((key3) => allSettings2[key3]?.scope === 2 /* MACHINE */ || allSettings2[key3]?.scope === 3 /* APPLICATION_MACHINE */ || allSettings2[key3]?.scope === 7 /* MACHINE_OVERRIDABLE */);
    return ignoredSettings;
  }
  async getLocalFileContent(profile) {
    try {
      const content2 = await this.fileService.readFile(profile.settingsResource);
      return content2.value.toString();
    } catch (error) {
      if (error instanceof FileOperationError && error.fileOperationResult === 1 /* FILE_NOT_FOUND */) {
        return null;
      } else {
        throw error;
      }
    }
  }
};

SettingsResource = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUserDataSyncUtilService),
  __decorateParam(2, ILogService)
], SettingsResource);

var SettingsResourceTreeItem = class {
  constructor(profile, uriIdentityService, instantiationService) {
    this.profile = profile;
    this.uriIdentityService = uriIdentityService;
    this.instantiationService = instantiationService;
    this.type = "settings" /* Settings */;
    this.handle = "settings" /* Settings */;
    this.label = { label: localize(23623, null) };
    this.collapsibleState = 2 /* Expanded */;
  }
  async getChildren() {
    return [{
      handle: this.profile.settingsResource.toString(),
      resourceUri: this.profile.settingsResource,
      collapsibleState: 0 /* None */,
      parent: this,
      accessibilityInformation: {
        label: this.uriIdentityService.extUri.basename(this.profile.settingsResource)
      },
      command: {
        id: API_OPEN_EDITOR_COMMAND_ID,
        title: "",
        arguments: [this.profile.settingsResource, void 0, void 0]
      }
    }];
  }
  async hasContent() {
    const settingsContent = await this.instantiationService.createInstance(SettingsResource).getSettingsContent(this.profile);
    return settingsContent.settings !== null;
  }
  async getContent() {
    return this.instantiationService.createInstance(SettingsResource).getContent(this.profile);
  }
  isFromDefaultProfile() {
    return !this.profile.isDefault && !!this.profile.useDefaultFlags?.settings;
  }
};

SettingsResourceTreeItem = __decorateClass([
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, IInstantiationService)
], SettingsResourceTreeItem);
export { SettingsResourceInitializer, SettingsResource, SettingsResourceTreeItem };
