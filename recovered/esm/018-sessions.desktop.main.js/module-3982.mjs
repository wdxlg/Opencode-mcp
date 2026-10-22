// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionManagement/electron-browser/extensionTipsService.ts
import { ExtensionTipsService } from "./module-3981.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IProductService } from "./module-0875.mjs";
import { ISharedProcessService } from "./module-3826.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IExtensionTipsService } from "./module-0874.mjs";


// src/vs/workbench/services/extensionManagement/electron-browser/extensionTipsService.ts
var NativeExtensionTipsService = class extends ExtensionTipsService {
  constructor(fileService, productService, sharedProcessService) {
    super(fileService, productService);
    this.channel = sharedProcessService.getChannel("extensionTipsService");
  }
  getConfigBasedTips(folder) {
    if (folder.scheme === Schemas.file) {
      return this.channel.call("getConfigBasedTips", [folder]);
    }
    return super.getConfigBasedTips(folder);
  }
  getImportantExecutableBasedTips() {
    return this.channel.call("getImportantExecutableBasedTips");
  }
  getOtherExecutableBasedTips() {
    return this.channel.call("getOtherExecutableBasedTips");
  }
};

NativeExtensionTipsService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IProductService),
  __decorateParam(2, ISharedProcessService)
], NativeExtensionTipsService);

registerSingleton(IExtensionTipsService, NativeExtensionTipsService, 1 /* Delayed */);
export { NativeExtensionTipsService };
