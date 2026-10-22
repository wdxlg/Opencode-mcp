// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/files/electron-browser/elevatedFileService.ts
import { Schemas } from "./module-0033.mjs";
import { isWindows } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { randomPath } from "./module-0031.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IFileService } from "./module-0269.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { ILabelService } from "./module-0641.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IElevatedFileService } from "./module-1397.mjs";


// src/vs/workbench/services/files/electron-browser/elevatedFileService.ts
var NativeElevatedFileService = class {
  constructor(nativeHostService, fileService, environmentService, workspaceTrustRequestService, labelService) {
    this.nativeHostService = nativeHostService;
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.labelService = labelService;
  }
  isSupported(resource) {
    return resource.scheme === Schemas.file;
  }
  async writeFileElevated(resource, value2, options3) {
    const trusted = await this.workspaceTrustRequestService.requestWorkspaceTrust({
      message: isWindows ? localize(23158, null, this.labelService.getUriLabel(resource)) : localize(23157, null, this.labelService.getUriLabel(resource))
    });
    if (!trusted) {
      throw new Error(localize(23156, null));
    }
    const source = URI.file(randomPath(this.environmentService.userDataPath, "code-elevated"));
    try {
      await this.fileService.writeFile(source, value2, options3);
      await this.nativeHostService.writeElevated(source, resource, options3);
    } finally {
      await this.fileService.del(source);
    }
    return this.fileService.resolve(resource, { resolveMetadata: true });
  }
};

NativeElevatedFileService = __decorateClass([
  __decorateParam(0, INativeHostService),
  __decorateParam(1, IFileService),
  __decorateParam(2, INativeWorkbenchEnvironmentService),
  __decorateParam(3, IWorkspaceTrustRequestService),
  __decorateParam(4, ILabelService)
], NativeElevatedFileService);

registerSingleton(IElevatedFileService, NativeElevatedFileService, 1 /* Delayed */);
export { NativeElevatedFileService };
