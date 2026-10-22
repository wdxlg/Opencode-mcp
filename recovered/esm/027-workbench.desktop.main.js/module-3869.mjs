// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionTipsService.ts
import { Disposable } from "./module-0012.mjs";
import { joinPath } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IProductService } from "./module-0873.mjs";


// src/vs/platform/extensionManagement/common/extensionTipsService.ts
var ExtensionTipsService = class extends Disposable {
  constructor(fileService, productService) {
    super();
    this.fileService = fileService;
    this.productService = productService;
    this.allConfigBasedTips = /* @__PURE__ */ new Map();
    if (this.productService.configBasedExtensionTips) {
      Object.entries(this.productService.configBasedExtensionTips).forEach(([, value2]) => this.allConfigBasedTips.set(value2.configPath, value2));
    }
  }
  getConfigBasedTips(folder) {
    return this.getValidConfigBasedTips(folder);
  }
  async getImportantExecutableBasedTips() {
    return [];
  }
  async getOtherExecutableBasedTips() {
    return [];
  }
  async getValidConfigBasedTips(folder) {
    const result = [];
    for (const [configPath, tip] of this.allConfigBasedTips) {
      if (tip.configScheme && tip.configScheme !== folder.scheme) {
        continue;
      }
      try {
        const content2 = (await this.fileService.readFile(joinPath(folder, configPath))).value.toString();
        for (const [key3, value2] of Object.entries(tip.recommendations)) {
          if (!value2.contentPattern || new RegExp(value2.contentPattern, "mig").test(content2)) {
            result.push({
              extensionId: key3,
              extensionName: value2.name,
              configName: tip.configName,
              important: !!value2.important,
              isExtensionPack: !!value2.isExtensionPack,
              whenNotInstalled: value2.whenNotInstalled
            });
          }
        }
      } catch (error) {
      }
    }
    return result;
  }
};

ExtensionTipsService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IProductService)
], ExtensionTipsService);
export { ExtensionTipsService };
