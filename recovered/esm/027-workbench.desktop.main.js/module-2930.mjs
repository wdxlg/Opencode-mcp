// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/configBasedRecommendations.ts
import { ExtensionRecommendations } from "./module-2924.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionTipsService } from "./module-0872.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/workbench/contrib/extensions/browser/configBasedRecommendations.ts
var ConfigBasedRecommendations = class extends ExtensionRecommendations {
  constructor(extensionTipsService, workspaceContextService) {
    super();
    this.extensionTipsService = extensionTipsService;
    this.workspaceContextService = workspaceContextService;
    this.importantTips = [];
    this.otherTips = [];
    this._onDidChangeRecommendations = this._register(new Emitter());
    this.onDidChangeRecommendations = this._onDidChangeRecommendations.event;
    this._otherRecommendations = [];
    this._importantRecommendations = [];
  }
  get otherRecommendations() {
    return this._otherRecommendations;
  }
  get importantRecommendations() {
    return this._importantRecommendations;
  }
  get recommendations() {
    return [...this.importantRecommendations, ...this.otherRecommendations];
  }
  async doActivate() {
    await this.fetch();
    this._register(this.workspaceContextService.onDidChangeWorkspaceFolders((e) => this.onWorkspaceFoldersChanged(e)));
  }
  async fetch() {
    const workspace = this.workspaceContextService.getWorkspace();
    const importantTips = /* @__PURE__ */ new Map();
    const otherTips = /* @__PURE__ */ new Map();
    for (const folder of workspace.folders) {
      const configBasedTips = await this.extensionTipsService.getConfigBasedTips(folder.uri);
      for (const tip of configBasedTips) {
        if (tip.important) {
          importantTips.set(tip.extensionId, tip);
        } else {
          otherTips.set(tip.extensionId, tip);
        }
      }
    }
    this.importantTips = [...importantTips.values()];
    this.otherTips = [...otherTips.values()].filter((tip) => !importantTips.has(tip.extensionId));
    this._otherRecommendations = this.otherTips.map((tip) => this.toExtensionRecommendation(tip));
    this._importantRecommendations = this.importantTips.map((tip) => this.toExtensionRecommendation(tip));
  }
  async onWorkspaceFoldersChanged(event) {
    if (event.added.length) {
      const oldImportantRecommended = this.importantTips;
      await this.fetch();
      if (this.importantTips.some((current) => oldImportantRecommended.every((old) => current.extensionId !== old.extensionId))) {
        this._onDidChangeRecommendations.fire();
      }
    }
  }
  toExtensionRecommendation(tip) {
    return {
      extension: tip.extensionId,
      reason: {
        reasonId: 3 /* WorkspaceConfig */,
        reasonText: localize(14994, null)
      },
      whenNotInstalled: tip.whenNotInstalled
    };
  }
};

ConfigBasedRecommendations = __decorateClass([
  __decorateParam(0, IExtensionTipsService),
  __decorateParam(1, IWorkspaceContextService)
], ConfigBasedRecommendations);
export { ConfigBasedRecommendations };
