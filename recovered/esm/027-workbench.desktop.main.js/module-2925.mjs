// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/exeBasedRecommendations.ts
import { ExtensionRecommendations } from "./module-2924.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionTipsService } from "./module-0872.mjs";


// src/vs/workbench/contrib/extensions/browser/exeBasedRecommendations.ts
var ExeBasedRecommendations = class extends ExtensionRecommendations {
  constructor(extensionTipsService) {
    super();
    this.extensionTipsService = extensionTipsService;
    this._otherTips = [];
    this._importantTips = [];
  }
  get otherRecommendations() {
    return this._otherTips.map((tip) => this.toExtensionRecommendation(tip));
  }
  get importantRecommendations() {
    return this._importantTips.map((tip) => this.toExtensionRecommendation(tip));
  }
  get recommendations() {
    return [...this.importantRecommendations, ...this.otherRecommendations];
  }
  getRecommendations(exe) {
    const important = this._importantTips.filter((tip) => tip.exeName.toLowerCase() === exe.toLowerCase()).map((tip) => this.toExtensionRecommendation(tip));
    const others = this._otherTips.filter((tip) => tip.exeName.toLowerCase() === exe.toLowerCase()).map((tip) => this.toExtensionRecommendation(tip));
    return { important, others };
  }
  async doActivate() {
    this._otherTips = await this.extensionTipsService.getOtherExecutableBasedTips();
    await this.fetchImportantExeBasedRecommendations();
  }
  async fetchImportantExeBasedRecommendations() {
    if (!this._importantExeBasedRecommendations) {
      this._importantExeBasedRecommendations = this.doFetchImportantExeBasedRecommendations();
    }
    return this._importantExeBasedRecommendations;
  }
  async doFetchImportantExeBasedRecommendations() {
    const importantExeBasedRecommendations = /* @__PURE__ */ new Map();
    this._importantTips = await this.extensionTipsService.getImportantExecutableBasedTips();
    this._importantTips.forEach((tip) => importantExeBasedRecommendations.set(tip.extensionId.toLowerCase(), tip));
    return importantExeBasedRecommendations;
  }
  toExtensionRecommendation(tip) {
    return {
      extension: tip.extensionId.toLowerCase(),
      reason: {
        reasonId: 2 /* Executable */,
        reasonText: localize(14995, null, tip.exeFriendlyName)
      }
    };
  }
};

ExeBasedRecommendations = __decorateClass([
  __decorateParam(0, IExtensionTipsService)
], ExeBasedRecommendations);
export { ExeBasedRecommendations };
