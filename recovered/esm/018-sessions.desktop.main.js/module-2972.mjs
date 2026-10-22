// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/auxiliaryWindow/browser/auxiliaryWindowService.ts
import { createDecorator } from "./module-0077.mjs";
import { $, Dimension, EventHelper, EventType, ModifierKeyEmitter, addDisposableListener, copyAttributes, createLinkElement, createMetaElement, getActiveWindow, getClientArea, getWindowId, isHTMLElement, position, registerWindow, sharedMutationObserver, trackAttributes } from "./module-0075.mjs";
import { DEFAULT_AUX_WINDOW_SIZE, WindowMinimumSize } from "./module-0515.mjs";
import { BaseWindow } from "./module-2971.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { isFirefox, isWeb } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { getZoomLevel } from "./module-0018.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHostService } from "./module-1118.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { ensureCodeWindow, mainWindow } from "./module-0002.mjs";
import { mark } from "./module-0506.mjs";
import { coalesce } from "./module-0007.mjs";
import { severity_default } from "./module-0266.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Barrier } from "./module-0036.mjs";
import { cloneGlobalStylesheets, isGlobalStylesheet } from "./module-0224.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/auxiliaryWindow/browser/auxiliaryWindowService.ts
var IAuxiliaryWindowService = createDecorator("auxiliaryWindowService");

var DEFAULT_AUX_WINDOW_DIMENSIONS = new Dimension(DEFAULT_AUX_WINDOW_SIZE.width, DEFAULT_AUX_WINDOW_SIZE.height);

var AuxiliaryWindow = class extends BaseWindow {
  constructor(window2, container2, stylesHaveLoaded, configurationService, hostService, environmentService, contextMenuService, layoutService) {
    super(window2, void 0, hostService, environmentService, contextMenuService, layoutService);
    this.window = window2;
    this.container = container2;
    this.configurationService = configurationService;
    this._onWillLayout = this._register(new Emitter());
    this.onWillLayout = this._onWillLayout.event;
    this._onDidLayout = this._register(new Emitter());
    this.onDidLayout = this._onDidLayout.event;
    this._onBeforeUnload = this._register(new Emitter());
    this.onBeforeUnload = this._onBeforeUnload.event;
    this._onUnload = this._register(new Emitter());
    this.onUnload = this._onUnload.event;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this.compact = false;
    this.whenStylesHaveLoaded = stylesHaveLoaded.wait().then(() => void 0);
    this.registerListeners();
  }
  updateOptions(options3) {
    this.compact = options3.compact;
  }
  async setBounds(bounds) {
    this.window.moveTo(bounds.x, bounds.y);
    this.window.resizeTo(bounds.width, bounds.height);
  }
  registerListeners() {
    this._register(addDisposableListener(this.window, EventType.BEFORE_UNLOAD, (e4) => this.handleBeforeUnload(e4)));
    this._register(addDisposableListener(this.window, EventType.UNLOAD, () => this.handleUnload()));
    this._register(addDisposableListener(this.window, "unhandledrejection", (e4) => {
      onUnexpectedError(e4.reason);
      e4.preventDefault();
    }));
    this._register(addDisposableListener(this.window, EventType.RESIZE, () => this.layout()));
    this._register(addDisposableListener(this.container, EventType.SCROLL, () => this.container.scrollTop = 0));
    if (isWeb) {
      this._register(addDisposableListener(this.container, EventType.DROP, (e4) => EventHelper.stop(e4, true)));
      this._register(addDisposableListener(this.container, EventType.WHEEL, (e4) => e4.preventDefault(), { passive: false }));
      this._register(addDisposableListener(this.container, EventType.CONTEXT_MENU, (e4) => EventHelper.stop(e4, true)));
    } else {
      this._register(addDisposableListener(this.window.document.body, EventType.DRAG_OVER, (e4) => EventHelper.stop(e4)));
      this._register(addDisposableListener(this.window.document.body, EventType.DROP, (e4) => EventHelper.stop(e4)));
    }
  }
  handleBeforeUnload(e4) {
    let veto;
    this._onBeforeUnload.fire({
      veto(reason) {
        if (reason) {
          veto = reason;
        }
      }
    });
    if (veto) {
      this.handleVetoBeforeClose(e4, veto);
      return;
    }
    const confirmBeforeCloseSetting = this.configurationService.getValue("window.confirmBeforeClose");
    const confirmBeforeClose = confirmBeforeCloseSetting === "always" || confirmBeforeCloseSetting === "keyboardOnly" && ModifierKeyEmitter.getInstance().isModifierPressed;
    if (confirmBeforeClose) {
      this.confirmBeforeClose(e4);
    }
  }
  handleVetoBeforeClose(e4, reason) {
    this.preventUnload(e4);
  }
  preventUnload(e4) {
    e4.preventDefault();
    e4.returnValue = localize(22748, null);
  }
  confirmBeforeClose(e4) {
    this.preventUnload(e4);
  }
  handleUnload() {
    this._onUnload.fire();
  }
  layout() {
    const dimension = getClientArea(this.window.document.body, DEFAULT_AUX_WINDOW_DIMENSIONS, this.container);
    this._onWillLayout.fire(dimension);
    this._onDidLayout.fire(dimension);
  }
  createState() {
    return {
      bounds: {
        x: this.window.screenX,
        y: this.window.screenY,
        width: this.window.outerWidth,
        height: this.window.outerHeight
      },
      zoomLevel: getZoomLevel(this.window),
      compact: this.compact
    };
  }
  dispose() {
    if (this._store.isDisposed) {
      return;
    }
    this._onWillDispose.fire();
    super.dispose();
  }
};

AuxiliaryWindow = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IHostService),
  __decorateParam(5, IWorkbenchEnvironmentService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IWorkbenchLayoutService)
], AuxiliaryWindow);

var BrowserAuxiliaryWindowService = class extends Disposable {
  constructor(layoutService, dialogService, configurationService, telemetryService, hostService, environmentService, contextMenuService) {
    super();
    this.layoutService = layoutService;
    this.dialogService = dialogService;
    this.configurationService = configurationService;
    this.telemetryService = telemetryService;
    this.hostService = hostService;
    this.environmentService = environmentService;
    this.contextMenuService = contextMenuService;
    // start from the main window ID + 1
    this._onDidOpenAuxiliaryWindow = this._register(new Emitter());
    this.onDidOpenAuxiliaryWindow = this._onDidOpenAuxiliaryWindow.event;
    this.windows = /* @__PURE__ */ new Map();
  }
  static {
    this.WINDOW_IDS = getWindowId(mainWindow) + 1;
  }
  async open(options3) {
    mark("code/auxiliaryWindow/willOpen");
    const targetWindow = await this.openWindow(options3);
    if (!targetWindow) {
      throw new Error(localize(22752, null));
    }
    const resolvedWindowId = await this.resolveWindowId(targetWindow);
    ensureCodeWindow(targetWindow, resolvedWindowId);
    const containerDisposables = new DisposableStore();
    const { container: container2, stylesLoaded } = this.createContainer(targetWindow, containerDisposables, options3);
    const auxiliaryWindow = this.createAuxiliaryWindow(targetWindow, container2, stylesLoaded);
    auxiliaryWindow.updateOptions({ compact: options3?.compact ?? false });
    const registryDisposables = new DisposableStore();
    this.windows.set(targetWindow.vscodeWindowId, auxiliaryWindow);
    registryDisposables.add(toDisposable(() => this.windows.delete(targetWindow.vscodeWindowId)));
    const eventDisposables = new DisposableStore();
    Event2.once(auxiliaryWindow.onWillDispose)(() => {
      targetWindow.close();
      containerDisposables.dispose();
      registryDisposables.dispose();
      eventDisposables.dispose();
    });
    registryDisposables.add(registerWindow(targetWindow));
    this._onDidOpenAuxiliaryWindow.fire({ window: auxiliaryWindow, disposables: eventDisposables });
    mark("code/auxiliaryWindow/didOpen");
    this.telemetryService.publicLog2("auxiliaryWindowOpen", { bounds: !!options3?.bounds });
    return auxiliaryWindow;
  }
  createAuxiliaryWindow(targetWindow, container2, stylesLoaded) {
    return new AuxiliaryWindow(targetWindow, container2, stylesLoaded, this.configurationService, this.hostService, this.environmentService, this.contextMenuService, this.layoutService);
  }
  async openWindow(options3) {
    const activeWindow = getActiveWindow();
    const activeWindowBounds = {
      x: activeWindow.screenX,
      y: activeWindow.screenY,
      width: activeWindow.outerWidth,
      height: activeWindow.outerHeight
    };
    const defaultSize = DEFAULT_AUX_WINDOW_SIZE;
    const width2 = options3?.frameless ? options3?.bounds?.width ?? defaultSize.width : Math.max(options3?.bounds?.width ?? defaultSize.width, WindowMinimumSize.WIDTH);
    const height = options3?.frameless ? options3?.bounds?.height ?? defaultSize.height : Math.max(options3?.bounds?.height ?? defaultSize.height, WindowMinimumSize.HEIGHT);
    let newWindowBounds = {
      x: options3?.bounds?.x ?? Math.max(activeWindowBounds.x + activeWindowBounds.width / 2 - width2 / 2, 0),
      y: options3?.bounds?.y ?? Math.max(activeWindowBounds.y + activeWindowBounds.height / 2 - height / 2, 0),
      width: width2,
      height
    };
    if (!options3?.bounds && newWindowBounds.x === activeWindowBounds.x && newWindowBounds.y === activeWindowBounds.y) {
      newWindowBounds = {
        ...newWindowBounds,
        x: newWindowBounds.x + 30,
        y: newWindowBounds.y + 30
      };
    }
    const features = coalesce([
      "popup=yes",
      `left=${newWindowBounds.x}`,
      `top=${newWindowBounds.y}`,
      `width=${newWindowBounds.width}`,
      `height=${newWindowBounds.height}`,
      // non-standard properties
      options3?.nativeTitlebar ? "window-native-titlebar=yes" : void 0,
      options3?.disableFullscreen ? "window-disable-fullscreen=yes" : void 0,
      options3?.alwaysOnTop ? "window-always-on-top=yes" : void 0,
      options3?.mode === 0 /* Maximized */ ? "window-maximized=yes" : void 0,
      options3?.mode === 2 /* Fullscreen */ ? "window-fullscreen=yes" : void 0,
      options3?.frameless ? "window-frameless=yes" : void 0,
      options3?.transparent ? "window-transparent=yes" : void 0,
      options3?.notResizable ? "window-not-resizable=yes" : void 0,
      options3?.disableMaximize ? "window-disable-maximize=yes" : void 0,
      options3?.noBackgroundThrottling ? "window-no-background-throttling=yes" : void 0,
      options3?.backgroundColor && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(options3.backgroundColor) ? `window-background-color=${options3.backgroundColor}` : void 0
    ]);
    const auxiliaryWindow = mainWindow.open(isFirefox ? "" : "about:blank", void 0, features.join(","));
    if (!auxiliaryWindow && isWeb) {
      return (await this.dialogService.prompt({
        type: severity_default.Warning,
        message: localize(22750, null),
        custom: {
          markdownDetails: [{ markdown: new MarkdownString(localize(22751, null, "https://aka.ms/allow-vscode-popup"), true) }]
        },
        buttons: [
          {
            label: localize(22749, null),
            run: () => this.openWindow(options3)
          }
        ],
        cancelButton: true
      })).result;
    }
    return auxiliaryWindow?.window;
  }
  async resolveWindowId(auxiliaryWindow) {
    return BrowserAuxiliaryWindowService.WINDOW_IDS++;
  }
  createContainer(auxiliaryWindow, disposables, options3) {
    auxiliaryWindow.document.createElement = function() {
      throw new Error('Not allowed to create elements in child window JavaScript context. Always use the main window so that "xyz instanceof HTMLElement" continues to work.');
    };
    this.applyMeta(auxiliaryWindow);
    const { stylesLoaded } = this.applyCSS(auxiliaryWindow, disposables);
    const container2 = this.applyHTML(auxiliaryWindow, disposables);
    return { stylesLoaded, container: container2 };
  }
  applyMeta(auxiliaryWindow) {
    for (const metaTag of ['meta[charset="utf-8"]', 'meta[http-equiv="Content-Security-Policy"]', 'meta[name="viewport"]', 'meta[name="theme-color"]']) {
      const metaElement = mainWindow.document.querySelector(metaTag);
      if (metaElement) {
        const clonedMetaElement = createMetaElement(auxiliaryWindow.document.head);
        copyAttributes(metaElement, clonedMetaElement);
        if (metaTag === 'meta[http-equiv="Content-Security-Policy"]') {
          const content = clonedMetaElement.getAttribute("content");
          if (content) {
            clonedMetaElement.setAttribute("content", content.replace(/(script-src[^\;]*)/, `script-src 'none'`));
          }
        }
      }
    }
    const originalIconLinkTag = mainWindow.document.querySelector('link[rel="icon"]');
    if (originalIconLinkTag) {
      const icon2 = createLinkElement(auxiliaryWindow.document.head);
      copyAttributes(originalIconLinkTag, icon2);
    }
  }
  applyCSS(auxiliaryWindow, disposables) {
    mark("code/auxiliaryWindow/willApplyCSS");
    const mapOriginalToClone = /* @__PURE__ */ new Map();
    const stylesLoaded = new Barrier();
    stylesLoaded.wait().then(() => mark("code/auxiliaryWindow/didLoadCSSStyles"));
    const pendingLinksDisposables = disposables.add(new DisposableStore());
    let pendingLinksToSettle = 0;
    function onLinkSettled() {
      if (--pendingLinksToSettle === 0) {
        pendingLinksDisposables.dispose();
        stylesLoaded.open();
      }
    }
    function cloneNode(originalNode) {
      if (isGlobalStylesheet(originalNode)) {
        return;
      }
      const clonedNode = auxiliaryWindow.document.head.appendChild(originalNode.cloneNode(true));
      if (originalNode.tagName.toLowerCase() === "link") {
        pendingLinksToSettle++;
        pendingLinksDisposables.add(addDisposableListener(clonedNode, "load", onLinkSettled));
        pendingLinksDisposables.add(addDisposableListener(clonedNode, "error", onLinkSettled));
      }
      mapOriginalToClone.set(originalNode, clonedNode);
    }
    pendingLinksToSettle++;
    try {
      for (const originalNode of mainWindow.document.head.querySelectorAll('link[rel="stylesheet"], style')) {
        cloneNode(originalNode);
      }
    } finally {
      onLinkSettled();
    }
    disposables.add(cloneGlobalStylesheets(auxiliaryWindow));
    disposables.add(sharedMutationObserver.observe(mainWindow.document.head, disposables, { childList: true, subtree: true })((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "childList" || // only interested in added/removed nodes
        mutation.target.nodeName.toLowerCase() === "title" || // skip over title changes that happen frequently
        mutation.target.nodeName.toLowerCase() === "script" || // block <script> changes that are unsupported anyway
        mutation.target.nodeName.toLowerCase() === "meta") {
          continue;
        }
        for (const node of mutation.addedNodes) {
          if (isHTMLElement(node) && (node.tagName.toLowerCase() === "style" || node.tagName.toLowerCase() === "link")) {
            cloneNode(node);
          } else if (node.nodeType === Node.TEXT_NODE && node.parentNode) {
            const clonedNode = mapOriginalToClone.get(node.parentNode);
            if (clonedNode) {
              clonedNode.textContent = node.textContent;
            }
          }
        }
        for (const node of mutation.removedNodes) {
          const clonedNode = mapOriginalToClone.get(node);
          if (clonedNode) {
            clonedNode.parentNode?.removeChild(clonedNode);
            mapOriginalToClone.delete(node);
          }
        }
      }
    }));
    mark("code/auxiliaryWindow/didApplyCSS");
    return { stylesLoaded };
  }
  applyHTML(auxiliaryWindow, disposables) {
    mark("code/auxiliaryWindow/willApplyHTML");
    const container2 = $("div", { role: "application" });
    position(container2, 0, 0, 0, 0, "relative");
    container2.style.display = "flex";
    container2.style.height = "100%";
    container2.style.flexDirection = "column";
    auxiliaryWindow.document.body.append(container2);
    disposables.add(trackAttributes(mainWindow.document.documentElement, auxiliaryWindow.document.documentElement));
    disposables.add(trackAttributes(mainWindow.document.body, auxiliaryWindow.document.body));
    disposables.add(trackAttributes(this.layoutService.mainContainer, container2, ["class"]));
    mark("code/auxiliaryWindow/didApplyHTML");
    return container2;
  }
  getWindow(windowId) {
    return this.windows.get(windowId);
  }
};

BrowserAuxiliaryWindowService = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, IDialogService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IHostService),
  __decorateParam(5, IWorkbenchEnvironmentService),
  __decorateParam(6, IContextMenuService)
], BrowserAuxiliaryWindowService);

registerSingleton(IAuxiliaryWindowService, BrowserAuxiliaryWindowService, 1 /* Delayed */);
export { IAuxiliaryWindowService, DEFAULT_AUX_WINDOW_DIMENSIONS, AuxiliaryWindow, BrowserAuxiliaryWindowService };
