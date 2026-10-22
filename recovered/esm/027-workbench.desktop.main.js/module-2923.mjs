// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionRecommendationNotificationService.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { distinct } from "./module-0007.mjs";
import { RecommendationSourceToString } from "./module-2916.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { isString } from "./module-0010.mjs";
import { areSameExtensions } from "./module-0886.mjs";
import { Promises, createCancelablePromise, raceCancellablePromises, raceCancellation, timeout } from "./module-0036.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from "./module-1046.mjs";
import { IExtensionIgnoredRecommendationsService } from "./module-1702.mjs";
import { IUserDataSyncEnablementService } from "./module-1696.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionRecommendationNotificationService.ts
var ignoreImportantExtensionRecommendationStorageKey = "extensionsAssistant/importantRecommendationsIgnore";

var donotShowWorkspaceRecommendationsStorageKey = "extensionsAssistant/workspaceRecommendationsIgnore";

var RecommendationsNotification = class extends Disposable {
  constructor(severity, message, choices, notificationService) {
    super();
    this.severity = severity;
    this.message = message;
    this.choices = choices;
    this.notificationService = notificationService;
    this._onDidClose = this._register(new Emitter());
    this.onDidClose = this._onDidClose.event;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this.cancelled = false;
    this.onDidCloseDisposable = this._register(new MutableDisposable());
    this.onDidChangeVisibilityDisposable = this._register(new MutableDisposable());
  }
  show() {
    if (!this.notificationHandle) {
      this.updateNotificationHandle(this.notificationService.prompt(this.severity, this.message, this.choices, { sticky: true, priority: 1 /* OPTIONAL */, onCancel: () => this.cancelled = true }));
    }
  }
  hide() {
    if (this.notificationHandle) {
      this.onDidCloseDisposable.clear();
      this.notificationHandle.close();
      this.cancelled = false;
      this.updateNotificationHandle(this.notificationService.prompt(this.severity, this.message, this.choices, { priority: 2 /* SILENT */, onCancel: () => this.cancelled = true }));
    }
  }
  isCancelled() {
    return this.cancelled;
  }
  updateNotificationHandle(notificationHandle) {
    this.onDidCloseDisposable.clear();
    this.onDidChangeVisibilityDisposable.clear();
    this.notificationHandle = notificationHandle;
    this.onDidCloseDisposable.value = this.notificationHandle.onDidClose(() => {
      this.onDidCloseDisposable.dispose();
      this.onDidChangeVisibilityDisposable.dispose();
      this._onDidClose.fire();
      this._onDidClose.dispose();
      this._onDidChangeVisibility.dispose();
    });
    this.onDidChangeVisibilityDisposable.value = this.notificationHandle.onDidChangeVisibility((e) => this._onDidChangeVisibility.fire(e));
  }
};

var ExtensionRecommendationNotificationService = class extends Disposable {
  constructor(configurationService, storageService, notificationService, telemetryService, extensionsWorkbenchService, extensionManagementService, extensionEnablementService, extensionIgnoredRecommendationsService, userDataSyncEnablementService, workbenchEnvironmentService, uriIdentityService) {
    super();
    this.configurationService = configurationService;
    this.storageService = storageService;
    this.notificationService = notificationService;
    this.telemetryService = telemetryService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionManagementService = extensionManagementService;
    this.extensionEnablementService = extensionEnablementService;
    this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.workbenchEnvironmentService = workbenchEnvironmentService;
    this.uriIdentityService = uriIdentityService;
    this.recommendedExtensions = [];
    this.recommendationSources = [];
    this.pendingNotificaitons = [];
  }
  // Ignored Important Recommendations
  get ignoredRecommendations() {
    return distinct([...JSON.parse(this.storageService.get(ignoreImportantExtensionRecommendationStorageKey, 0 /* PROFILE */, "[]"))].map((i2) => i2.toLowerCase()));
  }
  hasToIgnoreRecommendationNotifications() {
    const config = this.configurationService.getValue("extensions");
    return config.ignoreRecommendations || !!config.showRecommendationsOnlyOnDemand;
  }
  async promptImportantExtensionsInstallNotification(extensionRecommendations) {
    const ignoredRecommendations = [...this.extensionIgnoredRecommendationsService.ignoredRecommendations, ...this.ignoredRecommendations];
    const extensions = extensionRecommendations.extensions.filter((id2) => !ignoredRecommendations.includes(id2));
    if (!extensions.length) {
      return "ignored" /* Ignored */;
    }
    return this.promptRecommendationsNotification({ ...extensionRecommendations, extensions }, {
      onDidInstallRecommendedExtensions: (extensions2) => extensions2.forEach((extension) => this.telemetryService.publicLog2("extensionRecommendations:popup", { userReaction: "install", extensionId: extension.identifier.id, source: RecommendationSourceToString(extensionRecommendations.source) })),
      onDidShowRecommendedExtensions: (extensions2) => extensions2.forEach((extension) => this.telemetryService.publicLog2("extensionRecommendations:popup", { userReaction: "show", extensionId: extension.identifier.id, source: RecommendationSourceToString(extensionRecommendations.source) })),
      onDidCancelRecommendedExtensions: (extensions2) => extensions2.forEach((extension) => this.telemetryService.publicLog2("extensionRecommendations:popup", { userReaction: "cancelled", extensionId: extension.identifier.id, source: RecommendationSourceToString(extensionRecommendations.source) })),
      onDidNeverShowRecommendedExtensionsAgain: (extensions2) => {
        for (const extension of extensions2) {
          this.addToImportantRecommendationsIgnore(extension.identifier.id);
          this.telemetryService.publicLog2("extensionRecommendations:popup", { userReaction: "neverShowAgain", extensionId: extension.identifier.id, source: RecommendationSourceToString(extensionRecommendations.source) });
        }
        this.notificationService.prompt(
          Severity2.Info,
          localize(15065, null),
          [{
            label: localize(15064, null),
            run: () => this.setIgnoreRecommendationsConfig(true)
          }, {
            label: localize(15068, null),
            run: () => this.setIgnoreRecommendationsConfig(false)
          }]
        );
      }
    });
  }
  async promptWorkspaceRecommendations(recommendations) {
    if (this.storageService.getBoolean(donotShowWorkspaceRecommendationsStorageKey, 1 /* WORKSPACE */, false)) {
      return;
    }
    let installed = await this.extensionManagementService.getInstalled();
    installed = installed.filter((l) => this.extensionEnablementService.getEnablementState(l) !== 1 /* DisabledByExtensionKind */);
    recommendations = recommendations.filter((recommendation) => installed.every(
      (local) => isString(recommendation) ? !areSameExtensions({ id: recommendation }, local.identifier) : !this.uriIdentityService.extUri.isEqual(recommendation, local.location)
    ));
    if (!recommendations.length) {
      return;
    }
    await this.promptRecommendationsNotification({ extensions: recommendations, source: 2 /* WORKSPACE */, name: localize(15071, null) }, {
      onDidInstallRecommendedExtensions: () => this.telemetryService.publicLog2("extensionWorkspaceRecommendations:popup", { userReaction: "install" }),
      onDidShowRecommendedExtensions: () => this.telemetryService.publicLog2("extensionWorkspaceRecommendations:popup", { userReaction: "show" }),
      onDidCancelRecommendedExtensions: () => this.telemetryService.publicLog2("extensionWorkspaceRecommendations:popup", { userReaction: "cancelled" }),
      onDidNeverShowRecommendedExtensionsAgain: () => {
        this.telemetryService.publicLog2("extensionWorkspaceRecommendations:popup", { userReaction: "neverShowAgain" });
        this.storageService.store(donotShowWorkspaceRecommendationsStorageKey, true, 1 /* WORKSPACE */, 1 /* MACHINE */);
      }
    });
  }
  async promptRecommendationsNotification({ extensions: extensionIds, source, name, searchValue }, recommendationsNotificationActions) {
    if (this.hasToIgnoreRecommendationNotifications()) {
      return "ignored" /* Ignored */;
    }
    if (source === 3 /* EXE */ && this.workbenchEnvironmentService.remoteAuthority) {
      return "incompatibleWindow" /* IncompatibleWindow */;
    }
    if (source === 3 /* EXE */ && (this.recommendationSources.includes(3 /* EXE */) || this.recommendationSources.length >= 2)) {
      return "toomany" /* TooMany */;
    }
    this.recommendationSources.push(source);
    if (source === 3 /* EXE */ && extensionIds.every((id2) => isString(id2) && this.recommendedExtensions.includes(id2))) {
      return "ignored" /* Ignored */;
    }
    const extensions = await this.getInstallableExtensions(extensionIds);
    if (!extensions.length) {
      return "ignored" /* Ignored */;
    }
    this.recommendedExtensions = distinct([...this.recommendedExtensions, ...extensionIds.filter(isString)]);
    let extensionsMessage = "";
    if (extensions.length === 1) {
      extensionsMessage = localize(15060, null, extensions[0].displayName, extensions[0].publisherDisplayName);
    } else {
      const publishers = [...extensions.reduce((result, extension) => result.add(extension.publisherDisplayName), /* @__PURE__ */ new Set())];
      if (publishers.length > 2) {
        extensionsMessage = localize(15061, null, publishers[0], publishers[1]);
      } else if (publishers.length === 2) {
        extensionsMessage = localize(15063, null, publishers[0], publishers[1]);
      } else {
        extensionsMessage = localize(15062, null, publishers[0]);
      }
    }
    let message = localize(15069, null, extensionsMessage, name);
    if (source === 3 /* EXE */) {
      message = localize(15059, null, name, extensionsMessage);
    }
    if (!searchValue) {
      searchValue = source === 2 /* WORKSPACE */ ? "@recommended" : extensions.map((extensionId) => `@id:${extensionId.identifier.id}`).join(" ");
    }
    const donotShowAgainLabel = source === 2 /* WORKSPACE */ ? localize(15056, null) : extensions.length > 1 ? localize(15057, null) : localize(15058, null);
    return raceCancellablePromises([
      this._registerP(this.showRecommendationsNotification(extensions, message, searchValue, donotShowAgainLabel, source, recommendationsNotificationActions)),
      this._registerP(this.waitUntilRecommendationsAreInstalled(extensions))
    ]);
  }
  showRecommendationsNotification(extensions, message, searchValue, donotShowAgainLabel, source, { onDidInstallRecommendedExtensions, onDidShowRecommendedExtensions, onDidCancelRecommendedExtensions, onDidNeverShowRecommendedExtensionsAgain }) {
    return createCancelablePromise(async (token) => {
      let accepted = false;
      const choices = [];
      const installExtensions = async (isMachineScoped) => {
        this.extensionsWorkbenchService.openSearch(searchValue);
        onDidInstallRecommendedExtensions(extensions);
        const galleryExtensions = [], resourceExtensions = [];
        for (const extension of extensions) {
          if (extension.gallery) {
            galleryExtensions.push(extension.gallery);
          } else if (extension.resourceExtension) {
            resourceExtensions.push(extension);
          }
        }
        await Promises.settled([
          Promises.settled(extensions.map((extension) => this.extensionsWorkbenchService.open(extension, { pinned: true }))),
          galleryExtensions.length ? this.extensionManagementService.installGalleryExtensions(galleryExtensions.map((e) => ({ extension: e, options: { isMachineScoped } }))) : Promise.resolve(),
          resourceExtensions.length ? Promise.allSettled(resourceExtensions.map((r2) => this.extensionsWorkbenchService.install(r2))) : Promise.resolve()
        ]);
      };
      choices.push({
        label: localize(15066, null),
        run: () => installExtensions(false),
        menu: this.userDataSyncEnablementService.isEnabled() && this.userDataSyncEnablementService.isResourceEnabled("extensions" /* Extensions */) ? [{
          label: localize(15067, null),
          run: () => installExtensions(true)
        }] : void 0
      });
      choices.push(...[{
        label: localize(15070, null),
        run: async () => {
          onDidShowRecommendedExtensions(extensions);
          for (const extension of extensions) {
            this.extensionsWorkbenchService.open(extension, { pinned: true });
          }
          this.extensionsWorkbenchService.openSearch(searchValue);
        }
      }, {
        label: donotShowAgainLabel,
        isSecondary: true,
        run: () => {
          onDidNeverShowRecommendedExtensionsAgain(extensions);
        }
      }]);
      try {
        accepted = await this.doShowRecommendationsNotification(Severity2.Info, message, choices, source, token);
      } catch (error) {
        if (!isCancellationError(error)) {
          throw error;
        }
      }
      if (accepted) {
        return "reacted" /* Accepted */;
      } else {
        onDidCancelRecommendedExtensions(extensions);
        return "cancelled" /* Cancelled */;
      }
    });
  }
  waitUntilRecommendationsAreInstalled(extensions) {
    const installedExtensions = [];
    const disposables = new DisposableStore();
    return createCancelablePromise(async (token) => {
      disposables.add(token.onCancellationRequested((e) => disposables.dispose()));
      return new Promise((c, e) => {
        disposables.add(this.extensionManagementService.onInstallExtension((e2) => {
          installedExtensions.push(e2.identifier.id.toLowerCase());
          if (extensions.every((e3) => installedExtensions.includes(e3.identifier.id.toLowerCase()))) {
            c("reacted" /* Accepted */);
          }
        }));
      });
    });
  }
  /**
   * Show recommendations in Queue
   * At any time only one recommendation is shown
   * If a new recommendation comes in
   * 		=> If no recommendation is visible, show it immediately
   *		=> Otherwise, add to the pending queue
   * 			=> If it is not exe based and has higher or same priority as current, hide the current notification after showing it for 3s.
   * 			=> Otherwise wait until the current notification is hidden.
   */
  async doShowRecommendationsNotification(severity, message, choices, source, token) {
    const disposables = new DisposableStore();
    try {
      const recommendationsNotification = disposables.add(new RecommendationsNotification(severity, message, choices, this.notificationService));
      disposables.add(Event2.once(Event2.filter(recommendationsNotification.onDidChangeVisibility, (e) => !e))(() => this.showNextNotification()));
      if (this.visibleNotification) {
        const index2 = this.pendingNotificaitons.length;
        disposables.add(token.onCancellationRequested(() => this.pendingNotificaitons.splice(index2, 1)));
        this.pendingNotificaitons.push({ recommendationsNotification, source, token });
        if (source !== 3 /* EXE */ && source <= this.visibleNotification.source) {
          this.hideVisibleNotification(3e3);
        }
      } else {
        this.visibleNotification = { recommendationsNotification, source, from: Date.now() };
        recommendationsNotification.show();
      }
      await raceCancellation(new Promise((c) => disposables.add(Event2.once(recommendationsNotification.onDidClose)(c))), token);
      return !recommendationsNotification.isCancelled();
    } finally {
      disposables.dispose();
    }
  }
  showNextNotification() {
    const index2 = this.getNextPendingNotificationIndex();
    const [nextNotificaiton] = index2 > -1 ? this.pendingNotificaitons.splice(index2, 1) : [];
    timeout(nextNotificaiton ? 500 : 0).then(() => {
      this.unsetVisibileNotification();
      if (nextNotificaiton) {
        this.visibleNotification = { recommendationsNotification: nextNotificaiton.recommendationsNotification, source: nextNotificaiton.source, from: Date.now() };
        nextNotificaiton.recommendationsNotification.show();
      }
    });
  }
  /**
   * Return the recent high priroity pending notification
   */
  getNextPendingNotificationIndex() {
    let index2 = this.pendingNotificaitons.length - 1;
    if (this.pendingNotificaitons.length) {
      for (let i2 = 0; i2 < this.pendingNotificaitons.length; i2++) {
        if (this.pendingNotificaitons[i2].source <= this.pendingNotificaitons[index2].source) {
          index2 = i2;
        }
      }
    }
    return index2;
  }
  hideVisibleNotification(timeInMillis) {
    if (this.visibleNotification && !this.hideVisibleNotificationPromise) {
      const visibleNotification = this.visibleNotification;
      this.hideVisibleNotificationPromise = timeout(Math.max(timeInMillis - (Date.now() - visibleNotification.from), 0));
      this.hideVisibleNotificationPromise.then(() => visibleNotification.recommendationsNotification.hide());
    }
  }
  unsetVisibileNotification() {
    this.hideVisibleNotificationPromise?.cancel();
    this.hideVisibleNotificationPromise = void 0;
    this.visibleNotification = void 0;
  }
  async getInstallableExtensions(recommendations) {
    const result = [];
    if (recommendations.length) {
      const galleryExtensions = [];
      const resourceExtensions = [];
      for (const recommendation of recommendations) {
        if (typeof recommendation === "string") {
          galleryExtensions.push(recommendation);
        } else {
          resourceExtensions.push(recommendation);
        }
      }
      if (galleryExtensions.length) {
        const extensions = await this.extensionsWorkbenchService.getExtensions(galleryExtensions.map((id2) => ({ id: id2 })), { source: "install-recommendations" }, CancellationToken.None);
        for (const extension of extensions) {
          if (extension.gallery && await this.extensionManagementService.canInstall(extension.gallery) === true) {
            result.push(extension);
          }
        }
      }
      if (resourceExtensions.length) {
        const extensions = await this.extensionsWorkbenchService.getResourceExtensions(resourceExtensions, true);
        for (const extension of extensions) {
          if (await this.extensionsWorkbenchService.canInstall(extension) === true) {
            result.push(extension);
          }
        }
      }
    }
    return result;
  }
  addToImportantRecommendationsIgnore(id2) {
    const importantRecommendationsIgnoreList = [...this.ignoredRecommendations];
    if (!importantRecommendationsIgnoreList.includes(id2.toLowerCase())) {
      importantRecommendationsIgnoreList.push(id2.toLowerCase());
      this.storageService.store(ignoreImportantExtensionRecommendationStorageKey, JSON.stringify(importantRecommendationsIgnoreList), 0 /* PROFILE */, 0 /* USER */);
    }
  }
  setIgnoreRecommendationsConfig(configVal) {
    this.configurationService.updateValue("extensions.ignoreRecommendations", configVal);
  }
  _registerP(o) {
    this._register(toDisposable(() => o.cancel()));
    return o;
  }
};

ExtensionRecommendationNotificationService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IExtensionsWorkbenchService),
  __decorateParam(5, IWorkbenchExtensionManagementService),
  __decorateParam(6, IWorkbenchExtensionEnablementService),
  __decorateParam(7, IExtensionIgnoredRecommendationsService),
  __decorateParam(8, IUserDataSyncEnablementService),
  __decorateParam(9, IWorkbenchEnvironmentService),
  __decorateParam(10, IUriIdentityService)
], ExtensionRecommendationNotificationService);
export { ignoreImportantExtensionRecommendationStorageKey, donotShowWorkspaceRecommendationsStorageKey, RecommendationsNotification, ExtensionRecommendationNotificationService };
