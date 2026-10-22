// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionRecommendationsService.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { WorkspaceRecommendations } from "./module-2926.mjs";
import { FileBasedRecommendations } from "./module-2927.mjs";
import { ConfigBasedRecommendations } from "./module-2930.mjs";
import { ExeBasedRecommendations } from "./module-2925.mjs";
import { KeymapRecommendations } from "./module-2928.mjs";
import { WebRecommendations } from "./module-2931.mjs";
import { LanguageRecommendations } from "./module-2929.mjs";
import { RemoteRecommendations } from "./module-2932.mjs";
import { isString } from "./module-0010.mjs";
import { shuffle } from "./module-0007.mjs";
import { URI } from "./module-0032.mjs";
import { areSameExtensions } from "./module-0886.mjs";
import { timeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IExtensionGalleryService, IExtensionManagementService } from "./module-0872.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IExtensionIgnoredRecommendationsService } from "./module-1702.mjs";
import { IExtensionRecommendationNotificationService } from "./module-2916.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { IRemoteExtensionsScannerService } from "./module-1721.mjs";
import { IUserDataInitializationService } from "./module-1684.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionRecommendationsService.ts
var ExtensionRecommendationsService = class extends Disposable {
  constructor(instantiationService, lifecycleService, galleryService, telemetryService, environmentService, extensionManagementService, extensionRecommendationsManagementService, extensionRecommendationNotificationService, extensionsWorkbenchService, remoteExtensionsScannerService, userDataInitializationService) {
    super();
    this.lifecycleService = lifecycleService;
    this.galleryService = galleryService;
    this.telemetryService = telemetryService;
    this.environmentService = environmentService;
    this.extensionManagementService = extensionManagementService;
    this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
    this.extensionRecommendationNotificationService = extensionRecommendationNotificationService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.remoteExtensionsScannerService = remoteExtensionsScannerService;
    this.userDataInitializationService = userDataInitializationService;
    this._onDidChangeRecommendations = this._register(new Emitter());
    this.onDidChangeRecommendations = this._onDidChangeRecommendations.event;
    this.workspaceRecommendations = this._register(instantiationService.createInstance(WorkspaceRecommendations));
    this.fileBasedRecommendations = this._register(instantiationService.createInstance(FileBasedRecommendations));
    this.configBasedRecommendations = this._register(instantiationService.createInstance(ConfigBasedRecommendations));
    this.exeBasedRecommendations = this._register(instantiationService.createInstance(ExeBasedRecommendations));
    this.keymapRecommendations = this._register(instantiationService.createInstance(KeymapRecommendations));
    this.webRecommendations = this._register(instantiationService.createInstance(WebRecommendations));
    this.languageRecommendations = this._register(instantiationService.createInstance(LanguageRecommendations));
    this.remoteRecommendations = this._register(instantiationService.createInstance(RemoteRecommendations));
    if (!this.isEnabled()) {
      this.sessionSeed = 0;
      this.activationPromise = Promise.resolve();
      return;
    }
    this.sessionSeed = +/* @__PURE__ */ new Date();
    this.activationPromise = this.activate();
    this._register(this.extensionManagementService.onDidInstallExtensions((e) => this.onDidInstallExtensions(e)));
  }
  async activate() {
    try {
      await Promise.allSettled([
        this.remoteExtensionsScannerService.whenExtensionsReady(),
        this.userDataInitializationService.whenInitializationFinished(),
        this.lifecycleService.when(3 /* Restored */)
      ]);
    } catch (error) {
    }
    await Promise.all([
      this.workspaceRecommendations.activate(),
      this.configBasedRecommendations.activate(),
      this.fileBasedRecommendations.activate(),
      this.keymapRecommendations.activate(),
      this.languageRecommendations.activate(),
      this.webRecommendations.activate(),
      this.remoteRecommendations.activate()
    ]);
    this._register(Event2.any(this.workspaceRecommendations.onDidChangeRecommendations, this.configBasedRecommendations.onDidChangeRecommendations, this.extensionRecommendationsManagementService.onDidChangeIgnoredRecommendations)(() => this._onDidChangeRecommendations.fire()));
    this.promptWorkspaceRecommendations();
  }
  isEnabled() {
    return this.galleryService.isEnabled() && !this.environmentService.isExtensionDevelopment;
  }
  async activateProactiveRecommendations() {
    await Promise.all([this.exeBasedRecommendations.activate(), this.configBasedRecommendations.activate()]);
  }
  getAllRecommendationsWithReason() {
    this.activateProactiveRecommendations();
    const output = /* @__PURE__ */ Object.create(null);
    const allRecommendations = [
      ...this.configBasedRecommendations.recommendations,
      ...this.exeBasedRecommendations.recommendations,
      ...this.fileBasedRecommendations.recommendations,
      ...this.workspaceRecommendations.recommendations,
      ...this.keymapRecommendations.recommendations,
      ...this.languageRecommendations.recommendations,
      ...this.webRecommendations.recommendations
    ];
    for (const { extension, reason } of allRecommendations) {
      if (isString(extension) && this.isExtensionAllowedToBeRecommended(extension)) {
        output[extension.toLowerCase()] = reason;
      }
    }
    return output;
  }
  async getConfigBasedRecommendations() {
    await this.configBasedRecommendations.activate();
    return {
      important: this.toExtensionIds(this.configBasedRecommendations.importantRecommendations),
      others: this.toExtensionIds(this.configBasedRecommendations.otherRecommendations)
    };
  }
  async getOtherRecommendations() {
    await this.activationPromise;
    await this.activateProactiveRecommendations();
    const recommendations = [
      ...this.configBasedRecommendations.otherRecommendations,
      ...this.exeBasedRecommendations.otherRecommendations,
      ...this.webRecommendations.recommendations
    ];
    const extensionIds = this.toExtensionIds(recommendations);
    shuffle(extensionIds, this.sessionSeed);
    return extensionIds;
  }
  async getImportantRecommendations() {
    await this.activateProactiveRecommendations();
    const recommendations = [
      ...this.fileBasedRecommendations.importantRecommendations,
      ...this.configBasedRecommendations.importantRecommendations,
      ...this.exeBasedRecommendations.importantRecommendations
    ];
    const extensionIds = this.toExtensionIds(recommendations);
    shuffle(extensionIds, this.sessionSeed);
    return extensionIds;
  }
  getKeymapRecommendations() {
    return this.toExtensionIds(this.keymapRecommendations.recommendations);
  }
  getLanguageRecommendations() {
    return this.toExtensionIds(this.languageRecommendations.recommendations);
  }
  getRemoteRecommendations() {
    return this.toExtensionIds(this.remoteRecommendations.recommendations);
  }
  async getWorkspaceRecommendations() {
    if (!this.isEnabled()) {
      return [];
    }
    await this.workspaceRecommendations.activate();
    const result = [];
    for (const { extension } of this.workspaceRecommendations.recommendations) {
      if (isString(extension)) {
        if (!result.includes(extension.toLowerCase()) && this.isExtensionAllowedToBeRecommended(extension)) {
          result.push(extension.toLowerCase());
        }
      } else {
        result.push(extension);
      }
    }
    return result;
  }
  async getExeBasedRecommendations(exe) {
    await this.exeBasedRecommendations.activate();
    const { important, others } = exe ? this.exeBasedRecommendations.getRecommendations(exe) : { important: this.exeBasedRecommendations.importantRecommendations, others: this.exeBasedRecommendations.otherRecommendations };
    return { important: this.toExtensionIds(important), others: this.toExtensionIds(others) };
  }
  getFileBasedRecommendations() {
    return this.toExtensionIds(this.fileBasedRecommendations.recommendations);
  }
  onDidInstallExtensions(results) {
    for (const e of results) {
      if (e.source && !URI.isUri(e.source) && e.operation === 2 /* Install */) {
        const extRecommendations = this.getAllRecommendationsWithReason() || {};
        const recommendationReason = extRecommendations[e.source.identifier.id.toLowerCase()];
        if (recommendationReason) {
          this.telemetryService.publicLog("extensionGallery:install:recommendations", { ...e.source.telemetryData, recommendationReason: recommendationReason.reasonId });
        }
      }
    }
  }
  toExtensionIds(recommendations) {
    const extensionIds = [];
    for (const { extension } of recommendations) {
      if (isString(extension) && this.isExtensionAllowedToBeRecommended(extension) && !extensionIds.includes(extension.toLowerCase())) {
        extensionIds.push(extension.toLowerCase());
      }
    }
    return extensionIds;
  }
  isExtensionAllowedToBeRecommended(extensionId) {
    return !this.extensionRecommendationsManagementService.ignoredRecommendations.includes(extensionId.toLowerCase());
  }
  async promptWorkspaceRecommendations() {
    const installed = await this.extensionsWorkbenchService.queryLocal();
    const allowedRecommendations = [
      ...this.workspaceRecommendations.recommendations,
      ...this.configBasedRecommendations.importantRecommendations.filter(
        (recommendation) => !recommendation.whenNotInstalled || recommendation.whenNotInstalled.every((id2) => installed.every((local) => !areSameExtensions(local.identifier, { id: id2 })))
      )
    ].map(({ extension }) => extension).filter((extension) => !isString(extension) || this.isExtensionAllowedToBeRecommended(extension));
    if (allowedRecommendations.length) {
      await this._registerP(timeout(5e3));
      await this.extensionRecommendationNotificationService.promptWorkspaceRecommendations(allowedRecommendations);
    }
  }
  _registerP(o) {
    this._register(toDisposable(() => o.cancel()));
    return o;
  }
};

ExtensionRecommendationsService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ILifecycleService),
  __decorateParam(2, IExtensionGalleryService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IEnvironmentService),
  __decorateParam(5, IExtensionManagementService),
  __decorateParam(6, IExtensionIgnoredRecommendationsService),
  __decorateParam(7, IExtensionRecommendationNotificationService),
  __decorateParam(8, IExtensionsWorkbenchService),
  __decorateParam(9, IRemoteExtensionsScannerService),
  __decorateParam(10, IUserDataInitializationService)
], ExtensionRecommendationsService);
export { ExtensionRecommendationsService };
