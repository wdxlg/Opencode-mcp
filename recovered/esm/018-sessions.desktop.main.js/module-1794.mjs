// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/extensionManagement/common/allowedExtensionsService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { AllowedExtensionsConfigKey } from "./module-0874.mjs";
import { isBoolean, isObject, isUndefined } from "./module-0010.mjs";
import { MarkdownString, createCommandUri } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";
import { IConfigurationService } from "./module-0132.mjs";


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
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(AllowedExtensionsConfigKey)) {
        this._allowedExtensionsConfigValue = this.getAllowedExtensionsValue();
        this._onDidChangeAllowedExtensions.fire();
      }
    }));
  }
  get allowedExtensionsConfigValue() {
    return this._allowedExtensionsConfigValue;
  }
  getAllowedExtensionsValue() {
    const value2 = this.configurationService.getValue(AllowedExtensionsConfigKey);
    if (!isObject(value2) || Array.isArray(value2)) {
      return void 0;
    }
    const entries2 = Object.entries(value2).map(([key3, value3]) => [key3.toLowerCase(), value3]);
    if (entries2.length === 1 && entries2[0][0] === "*" && entries2[0][1] === true) {
      return void 0;
    }
    return Object.fromEntries(entries2);
  }
  isAllowed(extension) {
    if (!this._allowedExtensionsConfigValue) {
      return true;
    }
    let id2, version2, targetPlatform, prerelease2, publisher, publisherDisplayName;
    if (isGalleryExtension(extension)) {
      id2 = extension.identifier.id.toLowerCase();
      version2 = extension.version;
      prerelease2 = extension.properties.isPreReleaseVersion;
      publisher = extension.publisher.toLowerCase();
      publisherDisplayName = extension.publisherDisplayName.toLowerCase();
      targetPlatform = extension.properties.targetPlatform;
    } else if (isIExtension(extension)) {
      id2 = extension.identifier.id.toLowerCase();
      version2 = extension.manifest.version;
      prerelease2 = extension.preRelease;
      publisher = extension.manifest.publisher.toLowerCase();
      publisherDisplayName = extension.publisherDisplayName?.toLowerCase();
      targetPlatform = extension.targetPlatform;
    } else {
      id2 = extension.id.toLowerCase();
      version2 = extension.version ?? "*";
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
      if (version2 !== "*" && Array.isArray(extensionValue) && !extensionValue.some((v2) => {
        const match2 = VersionRegex.exec(v2);
        if (match2 && match2.groups) {
          const { platform: p, version: v3 } = match2.groups;
          if (v3 !== version2) {
            return false;
          }
          if (targetPlatform !== "universal" /* UNIVERSAL */ && p && targetPlatform !== p) {
            return false;
          }
          return true;
        }
        return false;
      })) {
        return new MarkdownString(localize(2917, null, version2, settingsCommandLink));
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
