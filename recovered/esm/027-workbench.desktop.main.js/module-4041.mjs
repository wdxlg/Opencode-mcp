// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/browser/webviewElement.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { generateUuid } from "./module-0190.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { ThrottledDelayer, promiseWithResolvers } from "./module-0036.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { WebviewPortMappingManager } from "./module-4037.mjs";
import { localize } from "./module-0001.mjs";
import { MenuId } from "./module-0092.mjs";
import { decodeAuthority, webviewGenericCspSource, webviewRootResourceAuthority } from "./module-1911.mjs";
import { URI } from "./module-0032.mjs";
import { WebviewFindWidget } from "./module-4040.mjs";
import { EventType, addDisposableListener, getWindow, getWindowById } from "./module-0075.mjs";
import { Lazy } from "./module-0028.mjs";
import { isFirefox2 } from "./module-0018.mjs";
import { COI } from "./module-0033.mjs";
import { parentOriginHash } from "./module-0023.mjs";
import { areWebviewContentOptionsEqual } from "./module-1042.mjs";
import { WebviewResourceResponse, loadLocalResource } from "./module-4039.mjs";
import { listenStream } from "./module-0037.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { ILogService } from "./module-0095.mjs";
import { IRemoteAuthorityResolverService } from "./module-0894.mjs";
import { ITunnelService } from "./module-1409.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/webview/browser/webviewElement.ts
var WebviewState;

((WebviewState2) => {
  let Type3;
  ((Type4) => {
    Type4[Type4["Initializing"] = 0] = "Initializing";
    Type4[Type4["Ready"] = 1] = "Ready";
  })(Type3 = WebviewState2.Type || (WebviewState2.Type = {}));
  class Initializing {
    constructor(pendingMessages) {
      this.pendingMessages = pendingMessages;
      this.type = 0 /* Initializing */;
    }
  }
  WebviewState2.Initializing = Initializing;
  WebviewState2.Ready = { type: 1 /* Ready */ };
})(WebviewState || (WebviewState = {}));

var webviewIdContext = "webviewId";

var WebviewElement = class extends Disposable {
  constructor(initInfo, webviewThemeDataProvider, configurationService, contextMenuService, notificationService, _environmentService, _logService, _remoteAuthorityResolverService, _tunnelService, _accessibilityService, _instantiationService) {
    super();
    this.webviewThemeDataProvider = webviewThemeDataProvider;
    this._environmentService = _environmentService;
    this._logService = _logService;
    this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
    this._tunnelService = _tunnelService;
    this._accessibilityService = _accessibilityService;
    this._instantiationService = _instantiationService;
    this.id = generateUuid();
    this._windowId = void 0;
    this._expectedServiceWorkerVersion = 6;
    this._state = new WebviewState.Initializing([]);
    this._resourceLoadingCts = this._register(new CancellationTokenSource());
    this._activeStreamControllers = /* @__PURE__ */ new Set();
    this._focusDelayer = this._register(new ThrottledDelayer(50));
    this._onDidHtmlChange = this._register(new Emitter());
    this.onDidHtmlChange = this._onDidHtmlChange.event;
    this._messageHandlers = /* @__PURE__ */ new Map();
    this.checkImeCompletionState = true;
    this.intrinsicContentSize = observableValue("WebviewIntrinsicContentSize", void 0);
    this._disposed = false;
    this._onMissingCsp = this._register(new Emitter());
    this.onMissingCsp = this._onMissingCsp.event;
    this._onDidClickLink = this._register(new Emitter());
    this.onDidClickLink = this._onDidClickLink.event;
    this._onMessage = this._register(new Emitter());
    this.onMessage = this._onMessage.event;
    this._onDidScroll = this._register(new Emitter());
    this.onDidScroll = this._onDidScroll.event;
    this._onDidWheel = this._register(new Emitter());
    this.onDidWheel = this._onDidWheel.event;
    this._onDidUpdateState = this._register(new Emitter());
    this.onDidUpdateState = this._onDidUpdateState.event;
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._onDidBlur = this._register(new Emitter());
    this.onDidBlur = this._onDidBlur.event;
    this._onFatalError = this._register(new Emitter());
    this.onFatalError = this._onFatalError.event;
    this._onDidDispose = this._register(new Emitter());
    this.onDidDispose = this._onDidDispose.event;
    this._hasAlertedAboutMissingCsp = false;
    this._hasFindResult = this._register(new Emitter());
    this.hasFindResult = this._hasFindResult.event;
    this._onDidStopFind = this._register(new Emitter());
    this.onDidStopFind = this._onDidStopFind.event;
    this.providedViewType = initInfo.providedViewType;
    this.origin = initInfo.origin ?? this.id;
    this._options = initInfo.options;
    this.extension = initInfo.extension;
    this._content = {
      html: "",
      title: initInfo.title,
      options: initInfo.contentOptions,
      state: void 0
    };
    this._portMappingManager = this._register(new WebviewPortMappingManager(
      () => this.extension?.location,
      () => this._content.options.portMapping || [],
      this._tunnelService
    ));
    this._element = this._createElement(initInfo.options, initInfo.contentOptions);
    this._register(this.on("no-csp-found", () => {
      this.handleNoCspFound();
    }));
    this._register(this.on("did-click-link", ({ uri: uri5 }) => {
      if (!this.isActiveElement()) {
        return;
      }
      this._onDidClickLink.fire(uri5);
    }));
    this._register(this.on("onmessage", ({ message, transfer }) => {
      this._onMessage.fire({ message, transfer });
    }));
    this._register(this.on("did-scroll", ({ scrollYPercentage }) => {
      this._onDidScroll.fire({ scrollYPercentage });
    }));
    this._register(this.on("do-reload", () => {
      this.reload();
    }));
    this._register(this.on("do-update-state", (state) => {
      this.state = state;
      this._onDidUpdateState.fire(state);
    }));
    this._register(this.on("did-focus", () => {
      this.handleFocusChange(true);
    }));
    this._register(this.on("did-blur", () => {
      this.handleFocusChange(false);
    }));
    this._register(this.on("did-scroll-wheel", (event) => {
      this._onDidWheel.fire(event);
    }));
    this._register(this.on("did-find", ({ didFind }) => {
      this._hasFindResult.fire(didFind);
    }));
    this._register(this.on("fatal-error", (e) => {
      notificationService.error(localize(21826, null, e.message));
      this._onFatalError.fire({ message: e.message });
    }));
    this._register(this.on("did-keydown", (data) => {
      this.handleKeyEvent("keydown", data);
    }));
    this._register(this.on("did-keyup", (data) => {
      this.handleKeyEvent("keyup", data);
    }));
    this._register(this.on("did-context-menu", (data) => {
      if (!this.element) {
        return;
      }
      if (!this._contextKeyService) {
        return;
      }
      const elementBox = this.element.getBoundingClientRect();
      const contextKeyService = this._contextKeyService.createOverlay([
        ...Object.entries(data.context),
        [webviewIdContext, this.providedViewType]
      ]);
      contextMenuService.showContextMenu({
        menuId: MenuId.WebviewContext,
        menuActionOptions: { shouldForwardArgs: true },
        contextKeyService,
        getActionsContext: () => ({ ...data.context, webview: this.providedViewType }),
        getAnchor: () => ({
          x: elementBox.x + data.clientX,
          y: elementBox.y + data.clientY
        })
      });
      this._send("set-context-menu-visible", { visible: true });
    }));
    this._register(this.on("load-resource", async (entry) => {
      try {
        const authority = decodeAuthority(entry.authority);
        const uri5 = URI.from({
          scheme: entry.scheme,
          authority,
          path: decodeURIComponent(entry.path),
          // This gets re-encoded
          query: entry.query ? decodeURIComponent(entry.query) : entry.query
        });
        this.loadResource(entry.id, uri5, { ifNoneMatch: entry.ifNoneMatch, range: entry.range }, this._resourceLoadingCts.token);
      } catch (e) {
        this._send("did-load-resource", {
          id: entry.id,
          status: 404,
          path: entry.path
        });
      }
    }));
    this._register(this.on("load-localhost", (entry) => {
      this.localLocalhost(entry.id, entry.origin);
    }));
    this._register(Event2.runAndSubscribe(webviewThemeDataProvider.onThemeDataChanged, () => this.style()));
    this._register(_accessibilityService.onDidChangeReducedMotion(() => this.style()));
    this._register(_accessibilityService.onDidChangeScreenReaderOptimized(() => this.style()));
    this._register(contextMenuService.onDidHideContextMenu(() => this._send("set-context-menu-visible", { visible: false })));
    this._confirmBeforeClose = configurationService.getValue("window.confirmBeforeClose");
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("window.confirmBeforeClose")) {
        this._confirmBeforeClose = configurationService.getValue("window.confirmBeforeClose");
        this._send("set-confirm-before-close", this._confirmBeforeClose);
      }
    }));
    this._register(this.on("drag-start", () => {
      this._startBlockingIframeDragEvents();
    }));
    this._register(this.on("drag", (event) => {
      this.handleDragEvent("drag", event);
    }));
    this._register(this.on("updated-intrinsic-content-size", (event) => {
      this.intrinsicContentSize.set({ width: event.width, height: event.height }, void 0, void 0);
    }));
    if (initInfo.options.enableFindWidget) {
      this._webviewFindWidget = this._register(this._instantiationService.createInstance(WebviewFindWidget, this));
    }
  }
  get window() {
    return typeof this._windowId === "number" ? getWindowById(this._windowId)?.window : void 0;
  }
  get platform() {
    return "browser";
  }
  static {
    this._supportsTransferableStreams = new Lazy(() => {
      try {
        const stream = new ReadableStream();
        const mc = new MessageChannel();
        mc.port1.postMessage(stream, [stream]);
        mc.port1.close();
        mc.port2.close();
        return true;
      } catch {
        return false;
      }
    });
  }
  get element() {
    return this._element;
  }
  get isFocused() {
    if (!this._focused) {
      return false;
    }
    if (!this.window) {
      return false;
    }
    if (this.window.document.activeElement && this.window.document.activeElement !== this.element) {
      return false;
    }
    return true;
  }
  dispose() {
    this._disposed = true;
    this.element?.remove();
    this._element = void 0;
    this._messagePort = void 0;
    if (this._state.type === 0 /* Initializing */) {
      for (const message of this._state.pendingMessages) {
        message.resolve(false);
      }
      this._state.pendingMessages = [];
    }
    this._onDidDispose.fire();
    for (const controller of this._activeStreamControllers) {
      try {
        controller.close();
      } catch {
      }
    }
    this._activeStreamControllers.clear();
    this._resourceLoadingCts.dispose(true);
    super.dispose();
  }
  setContextKeyService(contextKeyService) {
    this._contextKeyService = contextKeyService;
  }
  postMessage(message, transfer) {
    return this._send("message", { message, transfer });
  }
  async _send(channel, data, _createElement = []) {
    if (this._state.type === 0 /* Initializing */) {
      const { promise, resolve: resolve3 } = promiseWithResolvers();
      this._state.pendingMessages.push({ channel, data, transferable: _createElement, resolve: resolve3 });
      return promise;
    } else {
      return this.doPostMessage(channel, data, _createElement);
    }
  }
  _createElement(options3, _contentOptions) {
    const element = document.createElement("iframe");
    element.name = this.id;
    element.className = `webview ${options3.customClasses || ""}`;
    element.sandbox.add("allow-scripts", "allow-same-origin", "allow-forms", "allow-pointer-lock", "allow-downloads");
    const allowRules = ["cross-origin-isolated", "autoplay", "local-network-access"];
    if (!isFirefox2) {
      allowRules.push("clipboard-read", "clipboard-write");
    }
    element.setAttribute("allow", allowRules.join("; "));
    element.style.border = "none";
    element.style.width = "100%";
    element.style.height = "100%";
    element.focus = () => {
      this._doFocus();
    };
    return element;
  }
  _initElement(encodedWebviewOrigin, extension, options3, targetWindow) {
    const params = {
      id: this.id,
      parentId: targetWindow.vscodeWindowId.toString(),
      origin: this.origin,
      swVersion: String(this._expectedServiceWorkerVersion),
      extensionId: extension?.id.value ?? "",
      platform: this.platform,
      "vscode-resource-base-authority": webviewRootResourceAuthority,
      parentOrigin: targetWindow.origin
    };
    if (this._options.disableServiceWorker) {
      params.disableServiceWorker = "true";
    }
    if (this._environmentService.remoteAuthority) {
      params.remoteAuthority = this._environmentService.remoteAuthority;
    }
    if (options3.purpose) {
      params.purpose = options3.purpose;
    }
    COI.addSearchParam(params, true, true);
    const queryString = new URLSearchParams(params).toString();
    this.perfMark("init/set-src");
    const fileName = "index.html";
    this.element.setAttribute("src", `${this.webviewContentEndpoint(encodedWebviewOrigin)}/${fileName}?${queryString}`);
  }
  mountTo(element, targetWindow) {
    if (!this.element) {
      return;
    }
    this._windowId = targetWindow.vscodeWindowId;
    this._encodedWebviewOriginPromise = parentOriginHash(targetWindow.origin, this.origin).then((id2) => this._encodedWebviewOrigin = id2);
    this._encodedWebviewOriginPromise.then((encodedWebviewOrigin) => {
      if (!this._disposed) {
        this._initElement(encodedWebviewOrigin, this.extension, this._options, targetWindow);
      }
    });
    this._registerMessageHandler(targetWindow);
    if (this._webviewFindWidget) {
      element.appendChild(this._webviewFindWidget.getDomNode());
    }
    for (const eventName of [EventType.MOUSE_DOWN, EventType.MOUSE_MOVE, EventType.DROP]) {
      this._register(addDisposableListener(element, eventName, () => {
        this._stopBlockingIframeDragEvents();
      }));
    }
    for (const node of [element, targetWindow]) {
      this._register(addDisposableListener(node, EventType.DRAG_END, () => {
        this._stopBlockingIframeDragEvents();
      }));
    }
    element.id = this.id;
    this.perfMark("mounted");
    element.appendChild(this.element);
  }
  _registerMessageHandler(targetWindow) {
    const subscription = this._register(addDisposableListener(targetWindow, "message", (e) => {
      if (!this._encodedWebviewOrigin || e?.data?.target !== this.id) {
        return;
      }
      if (e.origin !== this._webviewContentOrigin(this._encodedWebviewOrigin)) {
        console.log(`Skipped renderer receiving message due to mismatched origins: ${e.origin} ${this._webviewContentOrigin}`);
        return;
      }
      if (e.data.channel === "webview-ready") {
        if (this._messagePort) {
          return;
        }
        this.perfMark("webview-ready");
        this._logService.trace(`Webview(${this.id}): webview ready`);
        this._messagePort = e.ports[0];
        this._messagePort.onmessage = (e2) => {
          const handlers = this._messageHandlers.get(e2.data.channel);
          if (!handlers) {
            console.log(`No handlers found for '${e2.data.channel}'`);
            return;
          }
          handlers?.forEach((handler) => handler(e2.data.data, e2));
        };
        this.element?.classList.add("ready");
        if (this._state.type === 0 /* Initializing */) {
          this._state.pendingMessages.forEach(({ channel, data, resolve: resolve3 }) => resolve3(this.doPostMessage(channel, data)));
        }
        this._state = WebviewState.Ready;
        subscription.dispose();
      }
    }));
  }
  perfMark(name) {
    performance.mark(`webview/webviewElement/${name}`, {
      detail: {
        id: this.id
      }
    });
  }
  _startBlockingIframeDragEvents() {
    if (this.element) {
      this.element.style.pointerEvents = "none";
    }
  }
  _stopBlockingIframeDragEvents() {
    if (this.element) {
      this.element.style.pointerEvents = "auto";
    }
  }
  webviewContentEndpoint(encodedWebviewOrigin) {
    const webviewExternalEndpoint = this._environmentService.webviewExternalEndpoint;
    if (!webviewExternalEndpoint) {
      throw new Error(`'webviewExternalEndpoint' has not been configured. Webviews will not work!`);
    }
    const endpoint = webviewExternalEndpoint.replace("{{uuid}}", encodedWebviewOrigin);
    if (endpoint[endpoint.length - 1] === "/") {
      return endpoint.slice(0, endpoint.length - 1);
    }
    return endpoint;
  }
  _webviewContentOrigin(encodedWebviewOrigin) {
    const uri5 = URI.parse(this.webviewContentEndpoint(encodedWebviewOrigin));
    return uri5.scheme + "://" + uri5.authority.toLowerCase();
  }
  doPostMessage(channel, data, transferable = []) {
    if (this.element && this._messagePort) {
      this._messagePort.postMessage({ channel, args: data }, transferable);
      return true;
    }
    return false;
  }
  on(channel, handler) {
    let handlers = this._messageHandlers.get(channel);
    if (!handlers) {
      handlers = /* @__PURE__ */ new Set();
      this._messageHandlers.set(channel, handlers);
    }
    handlers.add(handler);
    return toDisposable(() => {
      this._messageHandlers.get(channel)?.delete(handler);
    });
  }
  handleNoCspFound() {
    if (this._hasAlertedAboutMissingCsp) {
      return;
    }
    this._hasAlertedAboutMissingCsp = true;
    if (this.extension?.id) {
      if (this._environmentService.isExtensionDevelopment) {
        this._onMissingCsp.fire(this.extension.id);
      }
    }
  }
  reload() {
    this.doUpdateContent(this._content);
  }
  reinitializeAfterDismount() {
    this._state = new WebviewState.Initializing([]);
    this._messagePort = void 0;
    this.mountTo(this.element.parentElement, getWindow(this.element));
    this.style();
    this.reload();
  }
  setHtml(html3) {
    this.doUpdateContent({ ...this._content, html: html3 });
    this._onDidHtmlChange.fire(html3);
  }
  setTitle(title) {
    this._content = { ...this._content, title };
    this._send("set-title", title);
  }
  set contentOptions(options3) {
    this._logService.debug(`Webview(${this.id}): will update content options`);
    if (areWebviewContentOptionsEqual(options3, this._content.options)) {
      this._logService.debug(`Webview(${this.id}): skipping content options update`);
      return;
    }
    this.doUpdateContent({ ...this._content, options: options3 });
  }
  set localResourcesRoot(resources) {
    this._content = {
      ...this._content,
      options: { ...this._content.options, localResourceRoots: resources }
    };
  }
  set state(state) {
    this._content = { ...this._content, state };
  }
  set initialScrollProgress(value2) {
    this._send("initial-scroll-position", value2);
  }
  doUpdateContent(newContent) {
    this._logService.debug(`Webview(${this.id}): will update content`);
    this._content = newContent;
    const allowScripts = !!this._content.options.allowScripts;
    this.perfMark("set-content");
    this._send("content", {
      contents: this._content.html,
      title: this._content.title,
      options: {
        allowMultipleAPIAcquire: !!this._content.options.allowMultipleAPIAcquire,
        allowScripts,
        allowForms: this._content.options.allowForms ?? allowScripts
        // For back compat, we allow forms by default when scripts are enabled
      },
      state: this._content.state,
      cspSource: webviewGenericCspSource,
      confirmBeforeClose: this._confirmBeforeClose
    });
  }
  style() {
    let { styles, activeTheme, themeLabel, themeId } = this.webviewThemeDataProvider.getWebviewThemeData();
    if (this._options.transformCssVariables) {
      styles = this._options.transformCssVariables(styles);
    }
    const reduceMotion = this._accessibilityService.isMotionReduced();
    const screenReader = this._accessibilityService.isScreenReaderOptimized();
    this._send("styles", { styles, activeTheme, themeId, themeLabel, reduceMotion, screenReader });
  }
  handleFocusChange(isFocused) {
    this._focused = isFocused;
    if (isFocused) {
      this._onDidFocus.fire();
    } else {
      this._onDidBlur.fire();
    }
  }
  shouldForwardKeyEvent(event) {
    return event.isTrusted || !!this._content.options.forwardUntrustedKeypressEvents;
  }
  isActiveElement() {
    return !!this.element && this.window?.document.activeElement === this.element;
  }
  handleKeyEvent(type, event) {
    if (!this.shouldForwardKeyEvent(event) || !this.isActiveElement()) {
      return;
    }
    const emulatedKeyboardEvent = new KeyboardEvent(type, event);
    Object.defineProperty(emulatedKeyboardEvent, "target", {
      get: () => this.element
    });
    this.window?.dispatchEvent(emulatedKeyboardEvent);
  }
  handleDragEvent(type, event) {
    const emulatedDragEvent = new DragEvent(type, event);
    Object.defineProperty(emulatedDragEvent, "target", {
      get: () => this.element
    });
    this.window?.dispatchEvent(emulatedDragEvent);
  }
  windowDidDragStart() {
    this._startBlockingIframeDragEvents();
  }
  windowDidDragEnd() {
    this._stopBlockingIframeDragEvents();
  }
  selectAll() {
    this.execCommand("selectAll");
  }
  copy() {
    this.execCommand("copy");
  }
  paste() {
    this.execCommand("paste");
  }
  cut() {
    this.execCommand("cut");
  }
  undo() {
    this.execCommand("undo");
  }
  redo() {
    this.execCommand("redo");
  }
  execCommand(command4) {
    if (this.element) {
      this._send("execCommand", command4);
    }
  }
  async loadResource(id2, uri5, options3, token) {
    if (this._disposed) {
      return;
    }
    try {
      const result = await this._instantiationService.invokeFunction(loadLocalResource, uri5, {
        ifNoneMatch: options3.ifNoneMatch,
        roots: this._content.options.localResourceRoots || [],
        range: options3.range
      }, token);
      if (this._disposed) {
        return;
      }
      switch (result.type) {
        case WebviewResourceResponse.Type.Success: {
          const range2 = options3.range;
          const requestedRangeEnd = range2?.end !== void 0 ? range2.end : result.size - 1;
          const rangeEnd = Math.min(requestedRangeEnd, result.size - 1);
          const rangeHeader = range2 ? `bytes ${range2.start}-${rangeEnd}/${result.size}` : void 0;
          if (WebviewElement._supportsTransferableStreams.value) {
            const streamCts = this.platform === "electron" ? new CancellationTokenSource(token) : void 0;
            let controller;
            let closed = false;
            const close2 = () => {
              if (!closed) {
                closed = true;
                streamCts?.dispose();
                if (controller) {
                  this._activeStreamControllers.delete(controller);
                  try {
                    controller.close();
                  } catch {
                  }
                }
              }
            };
            const stream = new ReadableStream({
              start: (newController) => {
                controller = newController;
                this._activeStreamControllers.add(controller);
                listenStream(result.stream, {
                  onData: (chunk) => {
                    if (!closed) {
                      try {
                        controller?.enqueue(new Uint8Array(chunk.buffer));
                      } catch {
                        close2();
                      }
                    }
                  },
                  onError: (err) => {
                    if (!closed) {
                      closed = true;
                      streamCts?.dispose();
                      const currentController = controller;
                      if (currentController) {
                        this._activeStreamControllers.delete(currentController);
                        try {
                          currentController.error(err);
                        } catch {
                        }
                      }
                    }
                  },
                  onEnd: () => close2()
                }, streamCts?.token ?? token);
              },
              cancel: streamCts ? () => {
                streamCts.dispose(true);
                result.stream.destroy();
                close2();
              } : void 0
            });
            this._send("did-load-resource", {
              id: id2,
              status: range2 ? 206 : 200,
              path: uri5.path,
              mime: result.mimeType,
              etag: result.etag,
              mtime: result.mtime,
              range: rangeHeader,
              stream
            }, [stream]);
          } else {
            this._send("did-load-resource", {
              id: id2,
              status: range2 ? 206 : 200,
              path: uri5.path,
              mime: result.mimeType,
              etag: result.etag,
              mtime: result.mtime,
              range: rangeHeader
            });
            listenStream(result.stream, {
              onData: (chunk) => {
                const data = new Uint8Array(chunk.buffer);
                this._send("did-load-resource-chunk", { id: id2, data }, [data.buffer]);
              },
              onError: () => {
                this._send("did-load-resource-end", { id: id2, error: true });
              },
              onEnd: () => {
                this._send("did-load-resource-end", { id: id2 });
              }
            }, token);
          }
          return;
        }
        case WebviewResourceResponse.Type.NotModified: {
          return this._send("did-load-resource", {
            id: id2,
            status: 304,
            // not modified
            path: uri5.path,
            mime: result.mimeType,
            mtime: result.mtime
          });
        }
        case WebviewResourceResponse.Type.AccessDenied: {
          return this._send("did-load-resource", {
            id: id2,
            status: 401,
            // unauthorized
            path: uri5.path
          });
        }
      }
    } catch {
    }
    return this._send("did-load-resource", {
      id: id2,
      status: 404,
      path: uri5.path
    });
  }
  async localLocalhost(id2, origin) {
    const authority = this._environmentService.remoteAuthority;
    const resolveAuthority = authority ? await this._remoteAuthorityResolverService.resolveAuthority(authority) : void 0;
    const redirect = resolveAuthority ? await this._portMappingManager.getRedirect(resolveAuthority.authority, origin) : void 0;
    return this._send("did-load-localhost", {
      id: id2,
      origin,
      location: redirect
    });
  }
  focus() {
    this._doFocus();
    this.handleFocusChange(true);
  }
  _doFocus() {
    if (!this.element) {
      return;
    }
    try {
      this.element.contentWindow?.focus();
    } catch {
    }
    this._focusDelayer.trigger(async () => {
      if (!this.isFocused || !this.element) {
        return;
      }
      if (this.window?.document.activeElement && this.window.document.activeElement !== this.element && this.window.document.activeElement?.tagName !== "BODY") {
        return;
      }
      this.window?.document.body?.focus();
      this._send("focus", void 0);
    });
  }
  /**
   * Webviews expose a stateful find API.
   * Successive calls to find will move forward or backward through onFindResults
   * depending on the supplied options.
   *
   * @param value The string to search for. Empty strings are ignored.
   */
  find(value2, previous) {
    if (!this.element) {
      return;
    }
    this._send("find", { value: value2, previous });
  }
  updateFind(value2) {
    if (!value2 || !this.element) {
      return;
    }
    this._send("find", { value: value2 });
  }
  stopFind(keepSelection) {
    if (!this.element) {
      return;
    }
    this._send("find-stop", { clearSelection: !keepSelection });
    this._onDidStopFind.fire();
  }
  showFind(animated = true) {
    this._webviewFindWidget?.reveal(void 0, animated);
  }
  hideFind(animated = true) {
    this._webviewFindWidget?.hide(animated);
  }
  runFindAction(previous) {
    this._webviewFindWidget?.find(previous);
  }
};

WebviewElement = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IWorkbenchEnvironmentService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IRemoteAuthorityResolverService),
  __decorateParam(8, ITunnelService),
  __decorateParam(9, IAccessibilityService),
  __decorateParam(10, IInstantiationService)
], WebviewElement);
export { WebviewState, webviewIdContext, WebviewElement };
