// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionRecommendations/common/extensionIgnoredRecommendationsService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { distinct } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceExtensionsConfigService } from "./module-1703.mjs";
import { IStorageService } from "./module-0512.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IExtensionIgnoredRecommendationsService } from "./module-1702.mjs";


// src/vs/workbench/services/extensionRecommendations/common/extensionIgnoredRecommendationsService.ts
var ignoredRecommendationsStorageKey = "extensionsAssistant/ignored_recommendations";

var ExtensionIgnoredRecommendationsService = class extends Disposable {
  constructor(workspaceExtensionsConfigService, storageService) {
    super();
    this.workspaceExtensionsConfigService = workspaceExtensionsConfigService;
    this.storageService = storageService;
    this._onDidChangeIgnoredRecommendations = this._register(new Emitter());
    this.onDidChangeIgnoredRecommendations = this._onDidChangeIgnoredRecommendations.event;
    // Global Ignored Recommendations
    this._globalIgnoredRecommendations = [];
    this._onDidChangeGlobalIgnoredRecommendation = this._register(new Emitter());
    this.onDidChangeGlobalIgnoredRecommendation = this._onDidChangeGlobalIgnoredRecommendation.event;
    // Ignored Workspace Recommendations
    this.ignoredWorkspaceRecommendations = [];
    this._globalIgnoredRecommendations = this.getCachedIgnoredRecommendations();
    this._register(this.storageService.onDidChangeValue(0 /* PROFILE */, ignoredRecommendationsStorageKey, this._store)(() => this.onDidStorageChange()));
    this.initIgnoredWorkspaceRecommendations();
  }
  get globalIgnoredRecommendations() {
    return [...this._globalIgnoredRecommendations];
  }
  get ignoredRecommendations() {
    return distinct([...this.globalIgnoredRecommendations, ...this.ignoredWorkspaceRecommendations]);
  }
  async initIgnoredWorkspaceRecommendations() {
    this.ignoredWorkspaceRecommendations = await this.workspaceExtensionsConfigService.getUnwantedRecommendations();
    this._onDidChangeIgnoredRecommendations.fire();
    this._register(this.workspaceExtensionsConfigService.onDidChangeExtensionsConfigs(async () => {
      this.ignoredWorkspaceRecommendations = await this.workspaceExtensionsConfigService.getUnwantedRecommendations();
      this._onDidChangeIgnoredRecommendations.fire();
    }));
  }
  toggleGlobalIgnoredRecommendation(extensionId, shouldIgnore) {
    extensionId = extensionId.toLowerCase();
    const ignored = this._globalIgnoredRecommendations.indexOf(extensionId) !== -1;
    if (ignored === shouldIgnore) {
      return;
    }
    this._globalIgnoredRecommendations = shouldIgnore ? [...this._globalIgnoredRecommendations, extensionId] : this._globalIgnoredRecommendations.filter((id2) => id2 !== extensionId);
    this.storeCachedIgnoredRecommendations(this._globalIgnoredRecommendations);
    this._onDidChangeGlobalIgnoredRecommendation.fire({ extensionId, isRecommended: !shouldIgnore });
    this._onDidChangeIgnoredRecommendations.fire();
  }
  getCachedIgnoredRecommendations() {
    const ignoredRecommendations = JSON.parse(this.ignoredRecommendationsValue);
    return ignoredRecommendations.map((e) => e.toLowerCase());
  }
  onDidStorageChange() {
    if (this.ignoredRecommendationsValue !== this.getStoredIgnoredRecommendationsValue()) {
      this._ignoredRecommendationsValue = void 0;
      this._globalIgnoredRecommendations = this.getCachedIgnoredRecommendations();
      this._onDidChangeIgnoredRecommendations.fire();
    }
  }
  storeCachedIgnoredRecommendations(ignoredRecommendations) {
    this.ignoredRecommendationsValue = JSON.stringify(ignoredRecommendations);
  }
  get ignoredRecommendationsValue() {
    if (!this._ignoredRecommendationsValue) {
      this._ignoredRecommendationsValue = this.getStoredIgnoredRecommendationsValue();
    }
    return this._ignoredRecommendationsValue;
  }
  set ignoredRecommendationsValue(ignoredRecommendationsValue) {
    if (this.ignoredRecommendationsValue !== ignoredRecommendationsValue) {
      this._ignoredRecommendationsValue = ignoredRecommendationsValue;
      this.setStoredIgnoredRecommendationsValue(ignoredRecommendationsValue);
    }
  }
  getStoredIgnoredRecommendationsValue() {
    return this.storageService.get(ignoredRecommendationsStorageKey, 0 /* PROFILE */, "[]");
  }
  setStoredIgnoredRecommendationsValue(value2) {
    this.storageService.store(ignoredRecommendationsStorageKey, value2, 0 /* PROFILE */, 0 /* USER */);
  }
};

ExtensionIgnoredRecommendationsService = __decorateClass([
  __decorateParam(0, IWorkspaceExtensionsConfigService),
  __decorateParam(1, IStorageService)
], ExtensionIgnoredRecommendationsService);

registerSingleton(IExtensionIgnoredRecommendationsService, ExtensionIgnoredRecommendationsService, 1 /* Delayed */);
export { ignoredRecommendationsStorageKey, ExtensionIgnoredRecommendationsService };
