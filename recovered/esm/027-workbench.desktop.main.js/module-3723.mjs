// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/workbench.ts
import { Layout } from "./module-3720.mjs";
import { Emitter, Event2, setGlobalLeakWarningThreshold } from "./module-0017.mjs";
import { mark } from "./module-0506.mjs";
import { isChrome2, isFirefox2, isSafari2 } from "./module-0018.mjs";
import { mainWindow } from "./module-0002.mjs";
import { onUnexpectedError, setUnexpectedErrorHandler } from "./module-0004.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHostService } from "./module-1117.mjs";
import { IHoverService, WorkbenchHoverDelegate } from "./module-0520.mjs";
import { IDialogService } from "./module-0267.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { EditorMarkdownCodeBlockRenderer } from "./module-3722.mjs";
import { setHoverDelegateFactory } from "./module-0448.mjs";
import { setBaseLayerHoverDelegate } from "./module-0472.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { WorkbenchContextKeysHandler } from "./module-3719.mjs";
import { IWorkbenchLayoutService, positionToString } from "./module-1118.mjs";
import { getSingletonServiceDescriptors } from "./module-0135.mjs";
import { InstantiationService } from "./module-1863.mjs";
import { isLinux, isMacintosh, isNative, isWeb, isWindows } from "./module-0014.mjs";
import { FontMeasurements } from "./module-0217.mjs";
import { createBareFontInfoFromRawSettings } from "./module-0220.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { setARIAContainer } from "./module-0076.mjs";
import { setProgressAccessibilitySignalScheduler } from "./module-1330.mjs";
import { AccessibilityProgressSignalScheduler } from "./module-2638.mjs";
import { coalesce } from "./module-0007.mjs";
import { NotificationsCenter } from "./module-3714.mjs";
import { NotificationsToasts } from "./module-3718.mjs";
import { NotificationsAlerts } from "./module-3715.mjs";
import { NotificationsStatus } from "./module-3716.mjs";
import { registerNotificationCommands } from "./module-3458.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { NotificationAccessibleView } from "./module-3721.mjs";
import { RunOnceScheduler, timeout } from "./module-0036.mjs";
import { runWhenWindowIdle } from "./module-0075.mjs";


// src/vs/workbench/browser/workbench.ts
var Workbench = class extends Layout {
  constructor(parent, options3, serviceCollection, logService) {
    super(parent, { resetLayout: Boolean(options3?.resetLayout) });
    this.options = options3;
    this.serviceCollection = serviceCollection;
    this._onWillShutdown = this._register(new Emitter());
    this.onWillShutdown = this._onWillShutdown.event;
    this._onDidShutdown = this._register(new Emitter());
    this.onDidShutdown = this._onDidShutdown.event;
    this.previousUnexpectedError = { message: void 0, time: 0 };
    mark("code/willStartWorkbench");
    this.registerErrorHandler(logService);
  }
  registerErrorHandler(logService) {
    if (!isFirefox2) {
      Error.stackTraceLimit = 100;
    }
    mainWindow.addEventListener("unhandledrejection", (event) => {
      onUnexpectedError(event.reason);
      event.preventDefault();
    });
    setUnexpectedErrorHandler((error) => this.handleUnexpectedError(error, logService));
  }
  handleUnexpectedError(error, logService) {
    const message = toErrorMessage(error, true);
    if (!message) {
      return;
    }
    const now = Date.now();
    if (message === this.previousUnexpectedError.message && now - this.previousUnexpectedError.time <= 1e3) {
      return;
    }
    this.previousUnexpectedError.time = now;
    this.previousUnexpectedError.message = message;
    logService.error(message);
  }
  startup() {
    try {
      this._register(setGlobalLeakWarningThreshold(175));
      const instantiationService = this.initServices(this.serviceCollection);
      instantiationService.invokeFunction((accessor) => {
        const lifecycleService = accessor.get(ILifecycleService);
        const storageService = accessor.get(IStorageService);
        const configurationService = accessor.get(IConfigurationService);
        const hostService = accessor.get(IHostService);
        const hoverService = accessor.get(IHoverService);
        const dialogService = accessor.get(IDialogService);
        const notificationService = accessor.get(INotificationService);
        const markdownRendererService = accessor.get(IMarkdownRendererService);
        markdownRendererService.setDefaultCodeBlockRenderer(instantiationService.createInstance(EditorMarkdownCodeBlockRenderer));
        setHoverDelegateFactory((placement, enableInstantHover) => instantiationService.createInstance(WorkbenchHoverDelegate, placement, { instantHover: enableInstantHover }, {}));
        setBaseLayerHoverDelegate(hoverService);
        this.initLayout(accessor);
        Registry.as(Extensions10.Workbench).start(accessor);
        Registry.as(EditorExtensions.EditorFactory).start(accessor);
        this._register(instantiationService.createInstance(WorkbenchContextKeysHandler));
        this.registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService);
        this.renderWorkbench(instantiationService, notificationService, storageService, configurationService);
        this.createWorkbenchLayout();
        this.layout();
        this.restore(lifecycleService);
      });
      return instantiationService;
    } catch (error) {
      onUnexpectedError(error);
      throw error;
    }
  }
  initServices(serviceCollection) {
    serviceCollection.set(IWorkbenchLayoutService, this);
    const contributedServices = getSingletonServiceDescriptors();
    for (const [id2, descriptor] of contributedServices) {
      serviceCollection.set(id2, descriptor);
    }
    const instantiationService = new InstantiationService(serviceCollection, true);
    instantiationService.invokeFunction((accessor) => {
      const lifecycleService = accessor.get(ILifecycleService);
      const configurationService = accessor.get(IConfigurationService);
      if (configurationService && "acquireInstantiationService" in configurationService) {
        configurationService.acquireInstantiationService(instantiationService);
      }
      lifecycleService.phase = 2 /* Ready */;
    });
    return instantiationService;
  }
  registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService) {
    this._register(configurationService.onDidChangeConfiguration((e) => this.updateFontAliasing(e, configurationService)));
    if (isNative) {
      this._register(storageService.onWillSaveState((e) => {
        if (e.reason === 1 /* SHUTDOWN */) {
          this.storeFontInfo(storageService);
        }
      }));
    } else {
      this._register(lifecycleService.onWillShutdown(() => this.storeFontInfo(storageService)));
    }
    this._register(lifecycleService.onWillShutdown((event) => this._onWillShutdown.fire(event)));
    this._register(lifecycleService.onDidShutdown(() => {
      this._onDidShutdown.fire();
      this.dispose();
    }));
    this._register(hostService.onDidChangeFocus((focus) => {
      if (!focus) {
        storageService.flush();
      }
    }));
    this._register(dialogService.onWillShowDialog(() => this.mainContainer.classList.add("modal-dialog-visible")));
    this._register(dialogService.onDidShowDialog(() => this.mainContainer.classList.remove("modal-dialog-visible")));
  }
  updateFontAliasing(e, configurationService) {
    if (!isMacintosh) {
      return;
    }
    if (e && !e.affectsConfiguration("workbench.fontAliasing")) {
      return;
    }
    const aliasing = configurationService.getValue("workbench.fontAliasing");
    if (this.fontAliasing === aliasing) {
      return;
    }
    this.fontAliasing = aliasing;
    const fontAliasingValues = ["antialiased", "none", "auto"];
    this.mainContainer.classList.remove(...fontAliasingValues.map((value2) => `monaco-font-aliasing-${value2}`));
    if (fontAliasingValues.some((option2) => option2 === aliasing)) {
      this.mainContainer.classList.add(`monaco-font-aliasing-${aliasing}`);
    }
  }
  restoreFontInfo(storageService, configurationService) {
    const storedFontInfoRaw = storageService.get("editorFontInfo", -1 /* APPLICATION */);
    if (storedFontInfoRaw) {
      try {
        const storedFontInfo = JSON.parse(storedFontInfoRaw);
        if (Array.isArray(storedFontInfo)) {
          FontMeasurements.restoreFontInfo(mainWindow, storedFontInfo);
        }
      } catch (err) {
      }
    }
    FontMeasurements.readFontInfo(mainWindow, createBareFontInfoFromRawSettings(configurationService.getValue("editor"), PixelRatio.getInstance(mainWindow).value));
  }
  storeFontInfo(storageService) {
    const serializedFontInfo = FontMeasurements.serializeFontInfo(mainWindow);
    if (serializedFontInfo) {
      storageService.store("editorFontInfo", JSON.stringify(serializedFontInfo), -1 /* APPLICATION */, 1 /* MACHINE */);
    }
  }
  renderWorkbench(instantiationService, notificationService, storageService, configurationService) {
    setARIAContainer(this.mainContainer);
    setProgressAccessibilitySignalScheduler((msDelayTime, msLoopTime) => instantiationService.createInstance(AccessibilityProgressSignalScheduler, msDelayTime, msLoopTime));
    const platformClass = isWindows ? "windows" : isLinux ? "linux" : "mac";
    const workbenchClasses = coalesce([
      "monaco-workbench",
      platformClass,
      isWeb ? "web" : void 0,
      isChrome2 ? "chromium" : isFirefox2 ? "firefox" : isSafari2 ? "safari" : void 0,
      ...this.getLayoutClasses(),
      ...this.options?.extraClasses ? this.options.extraClasses : []
    ]);
    this.mainContainer.classList.add(...workbenchClasses);
    this.updateFontAliasing(void 0, configurationService);
    this.restoreFontInfo(storageService, configurationService);
    for (const { id: id2, role, classes: classes2, options: options3 } of [
      { id: "workbench.parts.titlebar" /* TITLEBAR_PART */, role: "none", classes: ["titlebar"] },
      { id: "workbench.parts.banner" /* BANNER_PART */, role: "banner", classes: ["banner"] },
      { id: "workbench.parts.activitybar" /* ACTIVITYBAR_PART */, role: "none", classes: ["activitybar", this.getSideBarPosition() === 0 /* LEFT */ ? "left" : "right"] },
      // Use role 'none' for some parts to make screen readers less chatty #114892
      { id: "workbench.parts.sidebar" /* SIDEBAR_PART */, role: "none", classes: ["sidebar", this.getSideBarPosition() === 0 /* LEFT */ ? "left" : "right"] },
      { id: "workbench.parts.editor" /* EDITOR_PART */, role: "main", classes: ["editor"], options: { restorePreviousState: this.willRestoreEditors() } },
      { id: "workbench.parts.panel" /* PANEL_PART */, role: "none", classes: ["panel", "basepanel", positionToString(this.getPanelPosition())] },
      { id: "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */, role: "none", classes: ["auxiliarybar", "basepanel", this.getSideBarPosition() === 0 /* LEFT */ ? "right" : "left"] },
      { id: "workbench.parts.statusbar" /* STATUSBAR_PART */, role: "status", classes: ["statusbar"] }
    ]) {
      const partContainer = this.createPart(id2, role, classes2);
      mark(`code/willCreatePart/${id2}`);
      this.getPart(id2).create(partContainer, options3);
      mark(`code/didCreatePart/${id2}`);
    }
    this.createNotificationsHandlers(instantiationService, notificationService);
    this.parent.appendChild(this.mainContainer);
  }
  createPart(id2, role, classes2) {
    const part = document.createElement(role === "status" ? "footer" : "div");
    part.classList.add("part", ...classes2);
    part.id = id2;
    part.setAttribute("role", role);
    if (role === "status") {
      part.setAttribute("aria-live", "off");
    }
    return part;
  }
  createNotificationsHandlers(instantiationService, notificationService) {
    const notificationsCenter = this._register(instantiationService.createInstance(NotificationsCenter, this.mainContainer, notificationService.model));
    const notificationsToasts = this._register(instantiationService.createInstance(NotificationsToasts, this.mainContainer, notificationService.model));
    this._register(instantiationService.createInstance(NotificationsAlerts, notificationService.model));
    const notificationsStatus = instantiationService.createInstance(NotificationsStatus, notificationService.model);
    this._register(notificationsCenter.onDidChangeVisibility(() => {
      notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
      notificationsToasts.update(notificationsCenter.isVisible);
    }));
    this._register(notificationsToasts.onDidChangeVisibility(() => {
      notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
    }));
    registerNotificationCommands(notificationsCenter, notificationsToasts, notificationService.model);
    AccessibleViewRegistry.register(new NotificationAccessibleView());
    this.registerNotifications({
      onDidChangeNotificationsVisibility: Event2.map(Event2.any(notificationsToasts.onDidChangeVisibility, notificationsCenter.onDidChangeVisibility), () => notificationsToasts.isVisible || notificationsCenter.isVisible)
    });
  }
  restore(lifecycleService) {
    try {
      this.restoreParts();
    } catch (error) {
      onUnexpectedError(error);
    }
    this.whenReady.finally(
      () => Promise.race([
        this.whenRestored,
        timeout(2e3)
      ]).finally(() => {
        function markDidStartWorkbench() {
          mark("code/didStartWorkbench");
          performance.measure("perf: workbench create & restore", "code/didLoadWorkbenchMain", "code/didStartWorkbench");
        }
        if (this.isRestored()) {
          markDidStartWorkbench();
        } else {
          this.whenRestored.finally(() => markDidStartWorkbench());
        }
        lifecycleService.phase = 3 /* Restored */;
        const eventuallyPhaseScheduler = this._register(new RunOnceScheduler(() => {
          this._register(runWhenWindowIdle(mainWindow, () => lifecycleService.phase = 4 /* Eventually */, 2500));
        }, 2500));
        eventuallyPhaseScheduler.schedule();
      })
    );
  }
};
export { Workbench };
