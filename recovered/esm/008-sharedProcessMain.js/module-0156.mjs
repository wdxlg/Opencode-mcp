// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/ignoredExtensions.ts
import { createDecorator } from "./module-0042.mjs";
import { distinct } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0049.mjs";


// src/vs/platform/userDataSync/common/ignoredExtensions.ts
var IIgnoredExtensionsManagementService = createDecorator("IIgnoredExtensionsManagementService");

var IgnoredExtensionsManagementService = class {
  constructor(configurationService) {
    this.configurationService = configurationService;
  }
  hasToNeverSyncExtension(extensionId) {
    const configuredIgnoredExtensions = this.getConfiguredIgnoredExtensions();
    return configuredIgnoredExtensions.includes(extensionId.toLowerCase());
  }
  hasToAlwaysSyncExtension(extensionId) {
    const configuredIgnoredExtensions = this.getConfiguredIgnoredExtensions();
    return configuredIgnoredExtensions.includes(`-${extensionId.toLowerCase()}`);
  }
  updateIgnoredExtensions(ignoredExtensionId, ignore) {
    let currentValue = [...this.configurationService.getValue("settingsSync.ignoredExtensions")].map((id2) => id2.toLowerCase());
    currentValue = currentValue.filter((v) => v !== ignoredExtensionId && v !== `-${ignoredExtensionId}`);
    if (ignore) {
      currentValue.push(ignoredExtensionId.toLowerCase());
    }
    return this.configurationService.updateValue("settingsSync.ignoredExtensions", currentValue.length ? currentValue : void 0, 2 /* USER */);
  }
  updateSynchronizedExtensions(extensionId, sync) {
    let currentValue = [...this.configurationService.getValue("settingsSync.ignoredExtensions")].map((id2) => id2.toLowerCase());
    currentValue = currentValue.filter((v) => v !== extensionId && v !== `-${extensionId}`);
    if (sync) {
      currentValue.push(`-${extensionId.toLowerCase()}`);
    }
    return this.configurationService.updateValue("settingsSync.ignoredExtensions", currentValue.length ? currentValue : void 0, 2 /* USER */);
  }
  getIgnoredExtensions(installed) {
    const defaultIgnoredExtensions = installed.filter((i) => i.isMachineScoped).map((i) => i.identifier.id.toLowerCase());
    const value = this.getConfiguredIgnoredExtensions().map((id2) => id2.toLowerCase());
    const added = [], removed = [];
    if (Array.isArray(value)) {
      for (const key of value) {
        if (key.startsWith("-")) {
          removed.push(key.substring(1));
        } else {
          added.push(key);
        }
      }
    }
    return distinct([...defaultIgnoredExtensions, ...added].filter((setting) => !removed.includes(setting)));
  }
  getConfiguredIgnoredExtensions() {
    return (this.configurationService.getValue("settingsSync.ignoredExtensions") || []).map((id2) => id2.toLowerCase());
  }
};

IgnoredExtensionsManagementService = __decorateClass([
  __decorateParam(0, IConfigurationService)
], IgnoredExtensionsManagementService);
export { IIgnoredExtensionsManagementService, IgnoredExtensionsManagementService };
