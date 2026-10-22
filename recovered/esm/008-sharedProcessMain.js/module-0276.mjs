// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/code/electron-utility/sharedProcess/contrib/defaultExtensionsInitializer.ts
import { Disposable } from "./module-0013.mjs";
import { isWindows } from "./module-0014.mjs";
import { IFileService, toFileOperationResult } from "./module-0057.mjs";
import { getErrorMessage } from "./module-0003.mjs";
import { URI } from "./module-0024.mjs";
import { dirname, join } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeEnvironmentService } from "./module-0047.mjs";
import { INativeServerExtensionManagementService } from "./module-0118.mjs";
import { IStorageService } from "./module-0096.mjs";
import { ILogService } from "./module-0044.mjs";
import { IProductService } from "./module-0045.mjs";


// src/vs/code/electron-utility/sharedProcess/contrib/defaultExtensionsInitializer.ts
var defaultExtensionsInitStatusKey = "initializing-default-extensions";

var DefaultExtensionsInitializer = class extends Disposable {
  constructor(environmentService, extensionManagementService, storageService, fileService, logService, productService) {
    super();
    this.environmentService = environmentService;
    this.extensionManagementService = extensionManagementService;
    this.fileService = fileService;
    this.logService = logService;
    this.productService = productService;
    if (isWindows && storageService.getBoolean(defaultExtensionsInitStatusKey, -1 /* APPLICATION */, true)) {
      storageService.store(defaultExtensionsInitStatusKey, true, -1 /* APPLICATION */, 1 /* MACHINE */);
      this.initializeDefaultExtensions().then(() => storageService.store(defaultExtensionsInitStatusKey, false, -1 /* APPLICATION */, 1 /* MACHINE */));
    }
  }
  async initializeDefaultExtensions() {
    const extensionsLocation = this.getDefaultExtensionVSIXsLocation();
    let stat;
    try {
      stat = await this.fileService.resolve(extensionsLocation);
      if (!stat.children) {
        this.logService.debug("There are no default extensions to initialize", extensionsLocation.toString());
        return;
      }
    } catch (error) {
      if (toFileOperationResult(error) === 1 /* FILE_NOT_FOUND */) {
        this.logService.debug("There are no default extensions to initialize", extensionsLocation.toString());
        return;
      }
      this.logService.error("Error initializing extensions", error);
      return;
    }
    const vsixs = stat.children.filter((child) => child.name.toLowerCase().endsWith(".vsix"));
    if (vsixs.length === 0) {
      this.logService.debug("There are no default extensions to initialize", extensionsLocation.toString());
      return;
    }
    this.logService.info("Initializing default extensions", extensionsLocation.toString());
    await Promise.all(vsixs.map(async (vsix) => {
      this.logService.info("Installing default extension", vsix.resource.toString());
      try {
        await this.extensionManagementService.install(vsix.resource, { donotIncludePackAndDependencies: true, keepExisting: false });
        this.logService.info("Default extension installed", vsix.resource.toString());
      } catch (error) {
        this.logService.error("Error installing default extension", vsix.resource.toString(), getErrorMessage(error));
      }
    }));
    this.logService.info("Default extensions initialized", extensionsLocation.toString());
  }
  getDefaultExtensionVSIXsLocation() {
    if (this.productService.win32VersionedUpdate) {
      return URI.file(join(dirname(dirname(dirname(this.environmentService.appRoot))), "bootstrap", "extensions"));
    } else {
      return URI.file(join(dirname(dirname(this.environmentService.appRoot)), "bootstrap", "extensions"));
    }
  }
};

DefaultExtensionsInitializer = __decorateClass([
  __decorateParam(0, INativeEnvironmentService),
  __decorateParam(1, INativeServerExtensionManagementService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IFileService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IProductService)
], DefaultExtensionsInitializer);
export { defaultExtensionsInitStatusKey, DefaultExtensionsInitializer };
