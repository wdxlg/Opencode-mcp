// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/extensionManagement/common/allowedExtensionsService.ts
import { Disposable } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";
import { AllowedExtensionsConfigKey } from "./module-0058.mjs";
import { isBoolean, isObject, isUndefined } from "./module-0006.mjs";
import { MarkdownString, createCommandUri } from "./module-0115.mjs";
import { localize } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0045.mjs";
import { IConfigurationService } from "./module-0049.mjs";


// src/vs/platform/extensionManagement/common/allowedExtensionsService.ts
function isGalleryExtension(extension) {
  return extension.type === "gallery";
}

function isIExtension(extension) {
  return extension.type === 1 /* User */ || extension.type === 0 /* System */;
}

var VersionRegex = /^(?<version>\d+\.\d+\.\d+(-.*)?)(@(?<platform>.+))?$/;

var AllowedExtensionsService = class extends Disposable {
  constructor(productService, configurationService) {
    super();
    this.configurationService = configurationService;
    this._onDidChangeAllowedExtensions = this._register(new Emitter());
    this.onDidChangeAllowedExtensionsConfigValue = this._onDidChangeAllowedExtensions.event;
    this.publisherOrgs = productService.extensionPublisherOrgs?.map((p) => p.toLowerCase()) ?? [];
    this._allowedExtensionsConfigValue = this.getAllowedExtensionsValue();
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(AllowedExtensionsConfigKey)) {
        this._allowedExtensionsConfigValue = this.getAllowedExtensionsValue();
        this._onDidChangeAllowedExtensions.fire();
      }
    }));
  }
  get allowedExtensionsConfigValue() {
    return this._allowedExtensionsConfigValue;
  }
  getAllowedExtensionsValue() {
    const value = this.configurationService.getValue(AllowedExtensionsConfigKey);
    if (!isObject(value) || Array.isArray(value)) {
      return void 0;
    }
    const entries = Object.entries(value).map(([key, value2]) => [key.toLowerCase(), value2]);
    if (entries.length === 1 && entries[0][0] === "*" && entries[0][1] === true) {
      return void 0;
    }
    return Object.fromEntries(entries);
  }
  isAllowed(extension) {
    if (!this._allowedExtensionsConfigValue) {
      return true;
    }
    let id2, version, targetPlatform, prerelease2, publisher, publisherDisplayName;
    if (isGalleryExtension(extension)) {
      id2 = extension.identifier.id.toLowerCase();
      version = extension.version;
      prerelease2 = extension.properties.isPreReleaseVersion;
      publisher = extension.publisher.toLowerCase();
      publisherDisplayName = extension.publisherDisplayName.toLowerCase();
      targetPlatform = extension.properties.targetPlatform;
    } else if (isIExtension(extension)) {
      id2 = extension.identifier.id.toLowerCase();
      version = extension.manifest.version;
      prerelease2 = extension.preRelease;
      publisher = extension.manifest.publisher.toLowerCase();
      publisherDisplayName = extension.publisherDisplayName?.toLowerCase();
      targetPlatform = extension.targetPlatform;
    } else {
      id2 = extension.id.toLowerCase();
      version = extension.version ?? "*";
      targetPlatform = extension.targetPlatform ?? "universal" /* UNIVERSAL */;
      prerelease2 = extension.prerelease ?? false;
      publisher = extension.id.substring(0, extension.id.indexOf(".")).toLowerCase();
      publisherDisplayName = extension.publisherDisplayName?.toLowerCase();
    }
    const settingsCommandLink = createCommandUri("workbench.action.openSettings", { query: `@id:${AllowedExtensionsConfigKey}` }).toString();
    const extensionValue = this._allowedExtensionsConfigValue[id2];
    const extensionReason = new MarkdownString(localize(2916, null, settingsCommandLink));
    if (!isUndefined(extensionValue)) {
      if (isBoolean(extensionValue)) {
        return extensionValue ? true : extensionReason;
      }
      if (extensionValue === "stable" && prerelease2) {
        return new MarkdownString(localize(2913, null, settingsCommandLink));
      }
      if (version !== "*" && Array.isArray(extensionValue) && !extensionValue.some((v) => {
        const match = VersionRegex.exec(v);
        if (match && match.groups) {
          const { platform: p, version: v2 } = match.groups;
          if (v2 !== version) {
            return false;
          }
          if (targetPlatform !== "universal" /* UNIVERSAL */ && p && targetPlatform !== p) {
            return false;
          }
          return true;
        }
        return false;
      })) {
        return new MarkdownString(localize(2917, null, version, settingsCommandLink));
      }
      return true;
    }
    const publisherKey = publisherDisplayName && this.publisherOrgs.includes(publisherDisplayName) ? publisherDisplayName : publisher;
    const publisherValue = this._allowedExtensionsConfigValue[publisherKey];
    if (!isUndefined(publisherValue)) {
      if (isBoolean(publisherValue)) {
        return publisherValue ? true : new MarkdownString(localize(2915, null, publisherKey, settingsCommandLink));
      }
      if (publisherValue === "stable" && prerelease2) {
        return new MarkdownString(localize(2914, null, publisherKey, settingsCommandLink));
      }
      return true;
    }
    if (this._allowedExtensionsConfigValue["*"] === true) {
      return true;
    }
    return extensionReason;
  }
};

AllowedExtensionsService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IConfigurationService)
], AllowedExtensionsService);
export { isGalleryExtension, isIExtension, VersionRegex, AllowedExtensionsService };
