// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/window.ts
import { Disposable, dispose, toDisposable } from "./module-0012.mjs";
import { EventHelper, EventType, addDisposableListener, getWindow, getWindowById, getWindows, getWindowsCount, hasAppFocus, windowOpenNoOpener, windowOpenPopup, windowOpenWithSuccess } from "./module-0075.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { isAuxiliaryWindow, mainWindow } from "./module-0002.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { isIOS, isMacintosh } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { isSafari2, setFullscreen } from "./module-0018.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHostService } from "./module-1118.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { Event2 } from "./module-0017.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { timeout } from "./module-0036.mjs";
import { severity_default } from "./module-0266.mjs";
import { registerWindowDriver } from "./module-2970.mjs";
import { Schemas, matchesScheme } from "./module-0033.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { URI } from "./module-0032.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { requestHidDevice, requestSerialPort, requestUsbDevice } from "./module-2967.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IProductService } from "./module-0875.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0916.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/browser/window.ts
var BaseWindow = class extends Disposable {
  constructor(targetWindow, dom = { getWindowsCount, getWindows }, hostService, environmentService, contextMenuService, layoutService) {
    super();
    this.hostService = hostService;
    this.environmentService = environmentService;
    this.contextMenuService = contextMenuService;
    this.layoutService = layoutService;
    this.enableWindowFocusOnElementFocus(targetWindow);
    this.enableMultiWindowAwareTimeout(targetWindow, dom);
    this.registerFullScreenListeners(targetWindow.vscodeWindowId);
    this.registerContextMenuListeners(targetWindow);
  }
  static {
    this.TIMEOUT_HANDLES = Number.MIN_SAFE_INTEGER;
  }
  static {
    // try to not compete with the IDs of native `setTimeout`
    this.TIMEOUT_DISPOSABLES = /* @__PURE__ */ new Map();
  }
  //#region focus handling in multi-window applications
  enableWindowFocusOnElementFocus(targetWindow) {
    const originalFocus = targetWindow.HTMLElement.prototype.focus;
    const that = this;
    targetWindow.HTMLElement.prototype.focus = function(options3) {
      that.onElementFocus(getWindow(this));
      originalFocus.apply(this, [options3]);
    };
  }
  onElementFocus(targetWindow) {
    if (!targetWindow.document.hasFocus() && hasAppFocus()) {
      targetWindow.focus();
      if (!this.environmentService.extensionTestsLocationURI && !targetWindow.document.hasFocus()) {
        this.hostService.focus(targetWindow);
      }
    }
  }
  //#endregion
  //#region timeout handling in multi-window applications
  enableMultiWindowAwareTimeout(targetWindow, dom = { getWindowsCount, getWindows }) {
    const originalSetTimeout = targetWindow.setTimeout;
    Object.defineProperty(targetWindow, "vscodeOriginalSetTimeout", { get: () => originalSetTimeout });
    const originalClearTimeout = targetWindow.clearTimeout;
    Object.defineProperty(targetWindow, "vscodeOriginalClearTimeout", { get: () => originalClearTimeout });
    targetWindow.setTimeout = function(handler, timeout2 = 0, ...args2) {
      if (dom.getWindowsCount() === 1 || typeof handler === "string" || timeout2 === 0) {
        return originalSetTimeout.apply(this, [handler, timeout2, ...args2]);
      }
      const timeoutDisposables = /* @__PURE__ */ new Set();
      const timeoutHandle = BaseWindow.TIMEOUT_HANDLES++;
      BaseWindow.TIMEOUT_DISPOSABLES.set(timeoutHandle, timeoutDisposables);
      const handlerFn = createSingleCallFunction(handler, () => {
        dispose(timeoutDisposables);
        BaseWindow.TIMEOUT_DISPOSABLES.delete(timeoutHandle);
      });
      for (const { window: window2, disposables } of dom.getWindows()) {
        if (isAuxiliaryWindow(window2) && window2.document.visibilityState === "hidden") {
          continue;
        }
        let didClear = false;
        const handle2 = window2.vscodeOriginalSetTimeout?.apply(this, [(...args3) => {
          if (didClear) {
            return;
          }
          handlerFn(...args3);
        }, timeout2, ...args2]);
        const timeoutDisposable = toDisposable(() => {
          didClear = true;
          window2.vscodeOriginalClearTimeout?.apply(this, [handle2]);
          timeoutDisposables.delete(timeoutDisposable);
          disposables.deleteAndLeak(timeoutDisposable);
        });
        disposables.add(timeoutDisposable);
        timeoutDisposables.add(timeoutDisposable);
      }
      return timeoutHandle;
    };
    targetWindow.clearTimeout = function(timeoutHandle) {
      const timeoutDisposables = typeof timeoutHandle === "number" ? BaseWindow.TIMEOUT_DISPOSABLES.get(timeoutHandle) : void 0;
      if (timeoutDisposables) {
        dispose(timeoutDisposables);
        BaseWindow.TIMEOUT_DISPOSABLES.delete(timeoutHandle);
      } else {
        originalClearTimeout.apply(this, [timeoutHandle]);
      }
    };
  }
  //#endregion
  //#region Confirm on Shutdown
  static async confirmOnShutdown(accessor, reason) {
    const dialogService = accessor.get(IDialogService);
    const configurationService = accessor.get(IConfigurationService);
    const message = reason === 2 /* QUIT */ ? isMacintosh ? localize(7003, null) : localize(7002, null) : localize(6993, null);
    const primaryButton = reason === 2 /* QUIT */ ? isMacintosh ? localize(7001, null) : localize(6995, null) : localize(6992, null);
    const res = await dialogService.confirm({
      message,
      primaryButton,
      checkbox: {
        label: localize(6994, null)
      }
    });
    if (res.confirmed && res.checkboxChecked) {
      await configurationService.updateValue("window.confirmBeforeClose", "never");
    }
    return res.confirmed;
  }
  //#endregion
  registerFullScreenListeners(targetWindowId) {
    this._register(this.hostService.onDidChangeFullScreen(({ windowId, fullscreen }) => {
      if (windowId === targetWindowId) {
        const targetWindow = getWindowById(targetWindowId);
        if (targetWindow) {
          setFullscreen(fullscreen, targetWindow.window);
        }
      }
    }));
  }
  registerContextMenuListeners(targetWindow) {
    if (targetWindow !== mainWindow) {
      return;
    }
    const update = (visible) => this.layoutService.activeContainer.classList.toggle("context-menu-visible", visible);
    this._register(this.contextMenuService.onDidShowContextMenu(() => update(true)));
    this._register(this.contextMenuService.onDidHideContextMenu(() => update(false)));
  }
};

BaseWindow = __decorateClass([
  __decorateParam(2, IHostService),
  __decorateParam(3, IWorkbenchEnvironmentService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IWorkbenchLayoutService)
], BaseWindow);

var BrowserWindow = class extends BaseWindow {
  constructor(openerService, lifecycleService, dialogService, labelService, productService, browserEnvironmentService, layoutService, instantiationService, hostService, contextMenuService) {
    super(mainWindow, void 0, hostService, browserEnvironmentService, contextMenuService, layoutService);
    this.openerService = openerService;
    this.lifecycleService = lifecycleService;
    this.dialogService = dialogService;
    this.labelService = labelService;
    this.productService = productService;
    this.browserEnvironmentService = browserEnvironmentService;
    this.instantiationService = instantiationService;
    this.registerListeners();
    this.create();
  }
  registerListeners() {
    this._register(this.lifecycleService.onWillShutdown(() => this.onWillShutdown()));
    const viewport = isIOS && mainWindow.visualViewport ? mainWindow.visualViewport : mainWindow;
    this._register(addDisposableListener(viewport, EventType.RESIZE, () => {
      this.layoutService.layout();
      if (isIOS) {
        mainWindow.scrollTo(0, 0);
      }
    }));
    this._register(addDisposableListener(this.layoutService.mainContainer, EventType.WHEEL, (e4) => e4.preventDefault(), { passive: false }));
    this._register(addDisposableListener(this.layoutService.mainContainer, EventType.CONTEXT_MENU, (e4) => EventHelper.stop(e4, true)));
    this._register(addDisposableListener(this.layoutService.mainContainer, EventType.DROP, (e4) => EventHelper.stop(e4, true)));
  }
  onWillShutdown() {
    Event2.toPromise(Event2.any(
      Event2.once(new DomEmitter(mainWindow.document.body, EventType.KEY_DOWN, true).event),
      Event2.once(new DomEmitter(mainWindow.document.body, EventType.MOUSE_DOWN, true).event)
    )).then(async () => {
      await timeout(3e3);
      await this.dialogService.prompt({
        type: severity_default.Error,
        message: localize(7006, null),
        detail: localize(7007, null),
        buttons: [
          {
            label: localize(7004, null),
            run: () => mainWindow.location.reload()
            // do not use any services at this point since they are likely not functional at this point
          }
        ]
      });
    });
  }
  create() {
    this.setupOpenHandlers();
    this.registerLabelFormatters();
    this.registerCommands();
    this.setupDriver();
  }
  setupDriver() {
    if (this.environmentService.enableSmokeTestDriver) {
      registerWindowDriver(this.instantiationService);
    }
  }
  setupOpenHandlers() {
    this.openerService.setDefaultExternalOpener({
      openExternal: async (href) => {
        let isAllowedOpener = false;
        if (this.browserEnvironmentService.options?.openerAllowedExternalUrlPrefixes) {
          for (const trustedPopupPrefix of this.browserEnvironmentService.options.openerAllowedExternalUrlPrefixes) {
            if (href.startsWith(trustedPopupPrefix)) {
              isAllowedOpener = true;
              break;
            }
          }
        }
        if (matchesScheme(href, Schemas.http) || matchesScheme(href, Schemas.https)) {
          if (isSafari2) {
            const opened = windowOpenWithSuccess(href, !isAllowedOpener);
            if (!opened) {
              await this.dialogService.prompt({
                type: severity_default.Warning,
                message: localize(7008, null),
                custom: {
                  markdownDetails: [{ markdown: new MarkdownString(localize(7009, null, "https://aka.ms/allow-vscode-popup"), true) }]
                },
                buttons: [
                  {
                    label: localize(7005, null),
                    run: () => isAllowedOpener ? windowOpenPopup(href) : windowOpenNoOpener(href)
                  }
                ],
                cancelButton: true
              });
            }
          } else {
            if (isAllowedOpener) {
              windowOpenPopup(href);
            } else {
              windowOpenNoOpener(href);
            }
          }
        } else {
          const invokeProtocolHandler = () => {
            this.lifecycleService.withExpectedShutdown({ disableShutdownHandling: true }, () => mainWindow.location.href = href);
          };
          invokeProtocolHandler();
          const showProtocolUrlOpenedDialog = async () => {
            const { downloadUrl } = this.productService;
            let detail2;
            const buttons = [
              {
                label: localize(6997, null),
                run: () => invokeProtocolHandler()
              }
            ];
            if (downloadUrl !== void 0) {
              detail2 = localize(
                6998,
                null,
                this.productService.nameLong,
                this.productService.nameLong
              );
              buttons.push({
                label: localize(6996, null),
                run: async () => {
                  await this.openerService.open(URI.parse(downloadUrl));
                  showProtocolUrlOpenedDialog();
                }
              });
            } else {
              detail2 = localize(
                6999,
                null,
                this.productService.nameLong,
                this.productService.nameLong
              );
            }
            await this.hostService.withExpectedShutdown(() => this.dialogService.prompt({
              type: severity_default.Info,
              message: localize(7000, null),
              detail: detail2,
              buttons,
              cancelButton: true
            }));
          };
          if (matchesScheme(href, this.productService.urlProtocol)) {
            await showProtocolUrlOpenedDialog();
          }
        }
        return true;
      }
    });
  }
  registerLabelFormatters() {
    this._register(this.labelService.registerFormatter({
      scheme: Schemas.vscodeUserData,
      priority: true,
      formatting: {
        label: "(Settings) ${path}",
        separator: "/"
      }
    }));
  }
  registerCommands() {
    CommandsRegistry.registerCommand("workbench.experimental.requestUsbDevice", async (_accessor, options3) => {
      return requestUsbDevice(options3);
    });
    CommandsRegistry.registerCommand("workbench.experimental.requestSerialPort", async (_accessor, options3) => {
      return requestSerialPort(options3);
    });
    CommandsRegistry.registerCommand("workbench.experimental.requestHidDevice", async (_accessor, options3) => {
      return requestHidDevice(options3);
    });
  }
};

BrowserWindow = __decorateClass([
  __decorateParam(0, IOpenerService),
  __decorateParam(1, ILifecycleService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IBrowserWorkbenchEnvironmentService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IHostService),
  __decorateParam(9, IContextMenuService)
], BrowserWindow);
export { BaseWindow, BrowserWindow };
