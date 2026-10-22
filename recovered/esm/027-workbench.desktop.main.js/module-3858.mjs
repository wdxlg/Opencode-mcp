// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/extensionResourceLoader/common/extensionResourceLoaderService.ts
import { AbstractExtensionResourceLoaderService, IExtensionResourceLoaderService } from "./module-0891.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IRequestService, asTextOrError } from "./module-0946.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IProductService } from "./module-0873.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IExtensionGalleryManifestService } from "./module-0890.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/platform/extensionResourceLoader/common/extensionResourceLoaderService.ts
var ExtensionResourceLoaderService = class extends AbstractExtensionResourceLoaderService {
  constructor(fileService, storageService, productService, environmentService, configurationService, extensionGalleryManifestService, _requestService, logService) {
    super(fileService, storageService, productService, environmentService, configurationService, extensionGalleryManifestService, logService);
    this._requestService = _requestService;
  }
  async readExtensionResource(uri5) {
    if (await this.isExtensionGalleryResource(uri5)) {
      const headers = await this.getExtensionGalleryRequestHeaders();
      const requestContext = await this._requestService.request({ url: uri5.toString(), headers, callSite: "extensionResourceLoader.readExtensionResource" }, CancellationToken.None);
      return await asTextOrError(requestContext) || "";
    }
    const result = await this._fileService.readFile(uri5);
    return result.value.toString();
  }
};

ExtensionResourceLoaderService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IProductService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IExtensionGalleryManifestService),
  __decorateParam(6, IRequestService),
  __decorateParam(7, ILogService)
], ExtensionResourceLoaderService);

registerSingleton(IExtensionResourceLoaderService, ExtensionResourceLoaderService, 1 /* Delayed */);
export { ExtensionResourceLoaderService };
