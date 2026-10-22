// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webviewPanel/browser/webviewEditor.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { EditorPane } from "./module-1089.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { WebviewInput } from "./module-1116.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isWeb } from "./module-0014.mjs";
import { isHTMLElement, setParentFlowTo, trackFocus } from "./module-0075.mjs";
import { WebviewWindowDragMonitor } from "./module-1115.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IHostService } from "./module-1117.mjs";


// src/vs/workbench/contrib/webviewPanel/browser/webviewEditor.ts
var CONTEXT_ACTIVE_WEBVIEW_PANEL_ID = new RawContextKey("activeWebviewPanelId", "", {
  type: "string",
  description: localize(21865, null)
});

var WebviewEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, _editorGroupsService, _editorService, _workbenchLayoutService, _hostService, _contextKeyService) {
    super(WebviewEditor.ID, group2, telemetryService, themeService, storageService);
    this._editorGroupsService = _editorGroupsService;
    this._editorService = _editorService;
    this._workbenchLayoutService = _workbenchLayoutService;
    this._hostService = _hostService;
    this._contextKeyService = _contextKeyService;
    this._visible = false;
    this._isDisposed = false;
    this._webviewVisibleDisposables = this._register(new DisposableStore());
    this._onFocusWindowHandler = this._register(new MutableDisposable());
    this._onDidFocusWebview = this._register(new Emitter());
    this._scopedContextKeyService = this._register(new MutableDisposable());
  }
  static {
    this.ID = "WebviewEditor";
  }
  get onDidFocus() {
    return this._onDidFocusWebview.event;
  }
  get webview() {
    return this.input instanceof WebviewInput ? this.input.webview : void 0;
  }
  get scopedContextKeyService() {
    return this._scopedContextKeyService.value;
  }
  createEditor(parent) {
    const element = document.createElement("div");
    this._element = element;
    this._element.id = `webview-editor-element-${generateUuid()}`;
    parent.appendChild(element);
    this._scopedContextKeyService.value = this._register(this._contextKeyService.createScoped(element));
  }
  dispose() {
    this._isDisposed = true;
    this._element?.remove();
    this._element = void 0;
    super.dispose();
  }
  layout(dimension) {
    this.setEditorVisible(dimension.width > 0 && dimension.height > 0);
  }
  focus() {
    super.focus();
    if (!this._onFocusWindowHandler.value && !isWeb) {
      this._onFocusWindowHandler.value = this._hostService.onDidChangeFocus((focused) => {
        if (focused && this._editorService.activeEditorPane === this && this._workbenchLayoutService.hasFocus("workbench.parts.editor" /* EDITOR_PART */)) {
          this.focus();
        }
      });
    }
    this.webview?.focus();
  }
  setEditorVisible(visible) {
    if (visible === this._visible) {
      return;
    }
    this._visible = visible;
    if (this.input instanceof WebviewInput && this.webview) {
      if (visible) {
        this.claimWebview(this.input);
      } else {
        this.webview.release(this);
      }
    }
    super.setEditorVisible(visible);
  }
  clearInput() {
    if (this.webview) {
      this.webview.release(this);
      this._webviewVisibleDisposables.clear();
    }
    super.clearInput();
  }
  async setInput(input, options3, context2, token) {
    if (this.input && input.matches(this.input)) {
      return;
    }
    const alreadyOwnsWebview = input instanceof WebviewInput && input.webview === this.webview;
    if (this.webview && !alreadyOwnsWebview) {
      this.webview.release(this);
    }
    await super.setInput(input, options3, context2, token);
    await input.resolve();
    if (token.isCancellationRequested || this._isDisposed) {
      return;
    }
    if (input instanceof WebviewInput) {
      input.updateGroup(this.group.id);
      if (!alreadyOwnsWebview) {
        this.claimWebview(input);
      }
    }
  }
  claimWebview(input) {
    input.claim(this, this.window, this.scopedContextKeyService);
    if (this._element) {
      this._element.setAttribute("aria-flowto", input.webview.container.id);
      setParentFlowTo(input.webview.container, this._element);
    }
    const modalEditorContainer = this._editorGroupsService.activeModalEditorPart?.modalElement;
    const isModal = isHTMLElement(modalEditorContainer) && this._element && modalEditorContainer.contains(this._element);
    this._clippingContainer = isModal ? void 0 : this._workbenchLayoutService.getContainer(this.window, "workbench.parts.editor" /* EDITOR_PART */);
    this._webviewVisibleDisposables.clear();
    this._webviewVisibleDisposables.add(this._editorGroupsService.createEditorDropTarget(input.webview.container, {
      containsGroup: (group2) => this.group.id === group2.id
    }));
    this._webviewVisibleDisposables.add(new WebviewWindowDragMonitor(this.window, () => this.webview));
    this.setWebviewAnchorElement(input.webview);
    this._webviewVisibleDisposables.add(this.trackFocus(input.webview));
  }
  setWebviewAnchorElement(webview) {
    if (!this._element?.isConnected) {
      return;
    }
    webview.setAnchorElement(this._element.parentElement, this._clippingContainer);
  }
  trackFocus(webview) {
    const store = new DisposableStore();
    const webviewContentFocusTracker = trackFocus(webview.container);
    store.add(webviewContentFocusTracker);
    store.add(webviewContentFocusTracker.onDidFocus(() => this._onDidFocusWebview.fire()));
    store.add(webview.onDidFocus(() => this._onDidFocusWebview.fire()));
    return store;
  }
};

WebviewEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IEditorGroupsService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, IHostService),
  __decorateParam(8, IContextKeyService)
], WebviewEditor);
export { CONTEXT_ACTIVE_WEBVIEW_PANEL_ID, WebviewEditor };
