// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionsQuickAccess.ts
import { PickerQuickAccessProvider } from "./module-1528.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { IExtensionGalleryService, IExtensionManagementService } from "./module-0872.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionsQuickAccess.ts
var InstallExtensionQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(extensionsWorkbenchService, galleryService, extensionsService, notificationService, logService) {
    super(InstallExtensionQuickAccessProvider.PREFIX);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.galleryService = galleryService;
    this.extensionsService = extensionsService;
    this.notificationService = notificationService;
    this.logService = logService;
  }
  static {
    this.PREFIX = "ext install ";
  }
  _getPicks(filter2, disposables, token) {
    if (!filter2) {
      return [{
        label: localize(15424, null)
      }];
    }
    const genericSearchPickItem = {
      label: localize(15423, null, filter2),
      accept: () => this.extensionsWorkbenchService.openSearch(filter2)
    };
    if (/\./.test(filter2)) {
      return this.getPicksForExtensionId(filter2, genericSearchPickItem, token);
    }
    return [genericSearchPickItem];
  }
  async getPicksForExtensionId(filter2, fallback2, token) {
    try {
      const [galleryExtension] = await this.galleryService.getExtensions([{ id: filter2 }], token);
      if (token.isCancellationRequested) {
        return [];
      }
      if (!galleryExtension) {
        return [fallback2];
      }
      return [{
        label: localize(15421, null, filter2),
        accept: () => this.installExtension(galleryExtension, filter2)
      }];
    } catch (error) {
      if (token.isCancellationRequested) {
        return [];
      }
      this.logService.error(error);
      return [fallback2];
    }
  }
  async installExtension(extension, name) {
    try {
      await this.extensionsWorkbenchService.openSearch(`@id:${name}`);
      await this.extensionsService.installFromGallery(extension);
    } catch (error) {
      this.notificationService.error(error);
    }
  }
};

InstallExtensionQuickAccessProvider = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IExtensionGalleryService),
  __decorateParam(2, IExtensionManagementService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, ILogService)
], InstallExtensionQuickAccessProvider);

var ManageExtensionsQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(extensionsWorkbenchService) {
    super(ManageExtensionsQuickAccessProvider.PREFIX);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
  }
  static {
    this.PREFIX = "ext ";
  }
  _getPicks() {
    return [{
      label: localize(15422, null),
      accept: () => this.extensionsWorkbenchService.openSearch("")
    }];
  }
};

ManageExtensionsQuickAccessProvider = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService)
], ManageExtensionsQuickAccessProvider);
export { InstallExtensionQuickAccessProvider, ManageExtensionsQuickAccessProvider };
