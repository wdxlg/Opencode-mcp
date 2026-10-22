// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataProfile/browser/globalStateResource.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IUserDataProfileStorageService } from "./module-1658.mjs";
import { ILogService } from "./module-0095.mjs";
import { localize } from "./module-0001.mjs";
import { API_OPEN_EDITOR_COMMAND_ID } from "./module-1530.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/services/userDataProfile/browser/globalStateResource.ts
var GlobalStateResourceInitializer = class {
  constructor(storageService) {
    this.storageService = storageService;
  }
  async initialize(content) {
    const globalState = JSON.parse(content);
    const storageKeys2 = Object.keys(globalState.storage);
    if (storageKeys2.length) {
      const storageEntries = [];
      for (const key3 of storageKeys2) {
        storageEntries.push({ key: key3, value: globalState.storage[key3], scope: 0 /* PROFILE */, target: 0 /* USER */ });
      }
      this.storageService.storeAll(storageEntries, true);
    }
  }
};

GlobalStateResourceInitializer = __decorateClass([
  __decorateParam(0, IStorageService)
], GlobalStateResourceInitializer);

var GlobalStateResource = class {
  constructor(storageService, userDataProfileStorageService, logService) {
    this.storageService = storageService;
    this.userDataProfileStorageService = userDataProfileStorageService;
    this.logService = logService;
  }
  async getContent(profile) {
    const globalState = await this.getGlobalState(profile);
    return JSON.stringify(globalState);
  }
  async apply(content, profile) {
    const globalState = JSON.parse(content);
    await this.writeGlobalState(globalState, profile);
  }
  async getGlobalState(profile) {
    const storage = {};
    const storageData = await this.userDataProfileStorageService.readStorageData(profile);
    for (const [key3, value2] of storageData) {
      if (value2.value !== void 0 && value2.target === 0 /* USER */) {
        storage[key3] = value2.value;
      }
    }
    return { storage };
  }
  async writeGlobalState(globalState, profile) {
    const storageKeys2 = Object.keys(globalState.storage);
    if (storageKeys2.length) {
      const updatedStorage = /* @__PURE__ */ new Map();
      const nonProfileKeys = [
        // Do not include application scope user target keys because they also include default profile user target keys
        ...this.storageService.keys(-1 /* APPLICATION */, 1 /* MACHINE */),
        ...this.storageService.keys(1 /* WORKSPACE */, 0 /* USER */),
        ...this.storageService.keys(1 /* WORKSPACE */, 1 /* MACHINE */)
      ];
      for (const key3 of storageKeys2) {
        if (nonProfileKeys.includes(key3)) {
          this.logService.info(`Importing Profile (${profile.name}): Ignoring global state key '${key3}' because it is not a profile key.`);
        } else {
          updatedStorage.set(key3, globalState.storage[key3]);
        }
      }
      await this.userDataProfileStorageService.updateStorageData(profile, updatedStorage, 0 /* USER */);
    }
  }
};

GlobalStateResource = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IUserDataProfileStorageService),
  __decorateParam(2, ILogService)
], GlobalStateResource);

var GlobalStateResourceTreeItem = class {
  constructor(resource, uriIdentityService) {
    this.resource = resource;
    this.uriIdentityService = uriIdentityService;
    this.type = "globalState" /* GlobalState */;
    this.handle = "globalState" /* GlobalState */;
    this.label = { label: localize(23620, null) };
    this.collapsibleState = 1 /* Collapsed */;
  }
  async getChildren() {
    return [{
      handle: this.resource.toString(),
      resourceUri: this.resource,
      collapsibleState: 0 /* None */,
      accessibilityInformation: {
        label: this.uriIdentityService.extUri.basename(this.resource)
      },
      parent: this,
      command: {
        id: API_OPEN_EDITOR_COMMAND_ID,
        title: "",
        arguments: [this.resource, void 0, void 0]
      }
    }];
  }
};

var GlobalStateResourceExportTreeItem = class extends GlobalStateResourceTreeItem {
  constructor(profile, resource, uriIdentityService, instantiationService) {
    super(resource, uriIdentityService);
    this.profile = profile;
    this.instantiationService = instantiationService;
  }
  async hasContent() {
    const globalState = await this.instantiationService.createInstance(GlobalStateResource).getGlobalState(this.profile);
    return Object.keys(globalState.storage).length > 0;
  }
  async getContent() {
    return this.instantiationService.createInstance(GlobalStateResource).getContent(this.profile);
  }
  isFromDefaultProfile() {
    return !this.profile.isDefault && !!this.profile.useDefaultFlags?.globalState;
  }
};

GlobalStateResourceExportTreeItem = __decorateClass([
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, IInstantiationService)
], GlobalStateResourceExportTreeItem);

var GlobalStateResourceImportTreeItem = class extends GlobalStateResourceTreeItem {
  constructor(content, resource, uriIdentityService) {
    super(resource, uriIdentityService);
    this.content = content;
  }
  async getContent() {
    return this.content;
  }
  isFromDefaultProfile() {
    return false;
  }
};

GlobalStateResourceImportTreeItem = __decorateClass([
  __decorateParam(2, IUriIdentityService)
], GlobalStateResourceImportTreeItem);
export { GlobalStateResourceInitializer, GlobalStateResource, GlobalStateResourceTreeItem, GlobalStateResourceExportTreeItem, GlobalStateResourceImportTreeItem };
