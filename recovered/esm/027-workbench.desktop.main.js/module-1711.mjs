// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataProfile/browser/keybindingsResource.ts
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { FileOperationError, IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { platform } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { API_OPEN_EDITOR_COMMAND_ID } from "./module-1538.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/services/userDataProfile/browser/keybindingsResource.ts
var KeybindingsResourceInitializer = class {
  constructor(userDataProfileService, fileService, logService) {
    this.userDataProfileService = userDataProfileService;
    this.fileService = fileService;
    this.logService = logService;
  }
  async initialize(content2) {
    const keybindingsContent = JSON.parse(content2);
    if (keybindingsContent.keybindings === null) {
      this.logService.info(`Initializing Profile: No keybindings to apply...`);
      return;
    }
    await this.fileService.writeFile(this.userDataProfileService.currentProfile.keybindingsResource, VSBuffer.fromString(keybindingsContent.keybindings));
  }
};

KeybindingsResourceInitializer = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILogService)
], KeybindingsResourceInitializer);

var KeybindingsResource = class {
  constructor(fileService, logService) {
    this.fileService = fileService;
    this.logService = logService;
  }
  async getContent(profile) {
    const keybindingsContent = await this.getKeybindingsResourceContent(profile);
    return JSON.stringify(keybindingsContent);
  }
  async getKeybindingsResourceContent(profile) {
    const keybindings = await this.getKeybindingsContent(profile);
    return { keybindings, platform };
  }
  async apply(content2, profile) {
    const keybindingsContent = JSON.parse(content2);
    if (keybindingsContent.keybindings === null) {
      this.logService.info(`Importing Profile (${profile.name}): No keybindings to apply...`);
      return;
    }
    await this.fileService.writeFile(profile.keybindingsResource, VSBuffer.fromString(keybindingsContent.keybindings));
  }
  async getKeybindingsContent(profile) {
    try {
      const content2 = await this.fileService.readFile(profile.keybindingsResource);
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

KeybindingsResource = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ILogService)
], KeybindingsResource);

var KeybindingsResourceTreeItem = class {
  constructor(profile, uriIdentityService, instantiationService) {
    this.profile = profile;
    this.uriIdentityService = uriIdentityService;
    this.instantiationService = instantiationService;
    this.type = "keybindings" /* Keybindings */;
    this.handle = "keybindings" /* Keybindings */;
    this.label = { label: localize(23621, null) };
    this.collapsibleState = 2 /* Expanded */;
  }
  isFromDefaultProfile() {
    return !this.profile.isDefault && !!this.profile.useDefaultFlags?.keybindings;
  }
  async getChildren() {
    return [{
      handle: this.profile.keybindingsResource.toString(),
      resourceUri: this.profile.keybindingsResource,
      collapsibleState: 0 /* None */,
      parent: this,
      accessibilityInformation: {
        label: this.uriIdentityService.extUri.basename(this.profile.settingsResource)
      },
      command: {
        id: API_OPEN_EDITOR_COMMAND_ID,
        title: "",
        arguments: [this.profile.keybindingsResource, void 0, void 0]
      }
    }];
  }
  async hasContent() {
    const keybindingsContent = await this.instantiationService.createInstance(KeybindingsResource).getKeybindingsResourceContent(this.profile);
    return keybindingsContent.keybindings !== null;
  }
  async getContent() {
    return this.instantiationService.createInstance(KeybindingsResource).getContent(this.profile);
  }
};

KeybindingsResourceTreeItem = __decorateClass([
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, IInstantiationService)
], KeybindingsResourceTreeItem);
export { KeybindingsResourceInitializer, KeybindingsResource, KeybindingsResourceTreeItem };
