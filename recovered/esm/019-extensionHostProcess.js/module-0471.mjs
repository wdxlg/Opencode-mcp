// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostWebviewPanels.ts
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0017.mjs";
import { URI } from "./module-0025.mjs";
import { ViewColumn2 } from "./module-0245.mjs";
import { MainContext } from "./module-0054.mjs";
import { generateUuid } from "./module-0040.mjs";
import { serializeWebviewOptions, shouldSerializeBuffersForPostMessage, toExtensionData } from "./module-0380.mjs";
import { Disposable3 } from "./module-0244.mjs";


// src/vs/workbench/api/common/extHostWebviewPanels.ts
var ExtHostWebviewPanel = class extends Disposable {
  constructor(handle, proxy, webview, params) {
    super();
    this.#viewColumn = void 0;
    this.#visible = true;
    this.#isDisposed = false;
    this.#onDidDispose = this._register(new Emitter());
    this.onDidDispose = this.#onDidDispose.event;
    this.#onDidChangeViewState = this._register(new Emitter());
    this.onDidChangeViewState = this.#onDidChangeViewState.event;
    this.#handle = handle;
    this.#proxy = proxy;
    this.#webview = webview;
    this.#viewType = params.viewType;
    this.#options = params.panelOptions;
    this.#viewColumn = params.viewColumn;
    this.#title = params.title;
    this.#active = params.active;
  }
  #handle;
  #proxy;
  #viewType;
  #webview;
  #options;
  #title;
  #iconPath;
  #viewColumn;
  #visible;
  #active;
  #isDisposed;
  #onDidDispose;
  #onDidChangeViewState;
  dispose() {
    if (this.#isDisposed) {
      return;
    }
    this.#isDisposed = true;
    this.#onDidDispose.fire();
    this.#proxy.$disposeWebview(this.#handle);
    this.#webview.dispose();
    super.dispose();
  }
  get webview() {
    this.assertNotDisposed();
    return this.#webview;
  }
  get viewType() {
    this.assertNotDisposed();
    return this.#viewType;
  }
  get title() {
    this.assertNotDisposed();
    return this.#title;
  }
  set title(value) {
    this.assertNotDisposed();
    if (this.#title !== value) {
      this.#title = value;
      this.#proxy.$setTitle(this.#handle, value);
    }
  }
  get iconPath() {
    this.assertNotDisposed();
    return this.#iconPath;
  }
  set iconPath(value) {
    this.assertNotDisposed();
    if (this.#iconPath !== value) {
      this.#iconPath = value;
      if (URI.isUri(value)) {
        this.#proxy.$setIconPath(this.#handle, { light: value, dark: value });
      } else {
        this.#proxy.$setIconPath(this.#handle, value);
      }
    }
  }
  get options() {
    return this.#options;
  }
  get viewColumn() {
    this.assertNotDisposed();
    if (typeof this.#viewColumn === "number" && this.#viewColumn < 0) {
      return void 0;
    }
    return this.#viewColumn;
  }
  get active() {
    this.assertNotDisposed();
    return this.#active;
  }
  get visible() {
    this.assertNotDisposed();
    return this.#visible;
  }
  _updateViewState(newState) {
    if (this.#isDisposed) {
      return;
    }
    if (this.active !== newState.active || this.visible !== newState.visible || this.viewColumn !== newState.viewColumn) {
      this.#active = newState.active;
      this.#visible = newState.visible;
      this.#viewColumn = newState.viewColumn;
      this.#onDidChangeViewState.fire({ webviewPanel: this });
    }
  }
  reveal(viewColumn, preserveFocus) {
    this.assertNotDisposed();
    this.#proxy.$reveal(this.#handle, {
      viewColumn: typeof viewColumn === "undefined" ? void 0 : ViewColumn2.from(viewColumn),
      preserveFocus: !!preserveFocus
    });
  }
  assertNotDisposed() {
    if (this.#isDisposed) {
      throw new Error("Webview is disposed");
    }
  }
};

var ExtHostWebviewPanels = class _ExtHostWebviewPanels extends Disposable {
  constructor(mainContext, webviews, workspace) {
    super();
    this.webviews = webviews;
    this.workspace = workspace;
    this._webviewPanels = /* @__PURE__ */ new Map();
    this._serializers = /* @__PURE__ */ new Map();
    this._proxy = mainContext.getProxy(MainContext.MainThreadWebviewPanels);
  }
  static newHandle() {
    return generateUuid();
  }
  dispose() {
    super.dispose();
    this._webviewPanels.forEach((value) => value.dispose());
    this._webviewPanels.clear();
  }
  createWebviewPanel(extension, viewType, title, showOptions, options2 = {}) {
    const viewColumn = typeof showOptions === "object" ? showOptions.viewColumn : showOptions;
    const webviewShowOptions = {
      viewColumn: ViewColumn2.from(viewColumn),
      preserveFocus: typeof showOptions === "object" && !!showOptions.preserveFocus
    };
    const serializeBuffersForPostMessage = shouldSerializeBuffersForPostMessage(extension);
    const handle = _ExtHostWebviewPanels.newHandle();
    this._proxy.$createWebviewPanel(toExtensionData(extension), handle, viewType, {
      title,
      panelOptions: serializeWebviewPanelOptions(options2),
      webviewOptions: serializeWebviewOptions(extension, this.workspace, options2),
      serializeBuffersForPostMessage
    }, webviewShowOptions);
    const webview = this.webviews.createNewWebview(handle, options2, extension);
    const panel = this.createNewWebviewPanel(handle, viewType, title, viewColumn, options2, webview, true);
    return panel;
  }
  $onDidChangeWebviewPanelViewStates(newStates) {
    const handles = Object.keys(newStates);
    handles.sort((a, b) => {
      const stateA = newStates[a];
      const stateB = newStates[b];
      if (stateA.active) {
        return 1;
      }
      if (stateB.active) {
        return -1;
      }
      return +stateA.visible - +stateB.visible;
    });
    for (const handle of handles) {
      const panel = this.getWebviewPanel(handle);
      if (!panel) {
        continue;
      }
      const newState = newStates[handle];
      panel._updateViewState({
        active: newState.active,
        visible: newState.visible,
        viewColumn: ViewColumn2.to(newState.position)
      });
    }
  }
  async $onDidDisposeWebviewPanel(handle) {
    const panel = this.getWebviewPanel(handle);
    panel?.dispose();
    this._webviewPanels.delete(handle);
    this.webviews.deleteWebview(handle);
  }
  registerWebviewPanelSerializer(extension, viewType, serializer) {
    if (this._serializers.has(viewType)) {
      throw new Error(`Serializer for '${viewType}' already registered`);
    }
    this._serializers.set(viewType, { serializer, extension });
    this._proxy.$registerSerializer(viewType, {
      serializeBuffersForPostMessage: shouldSerializeBuffersForPostMessage(extension)
    });
    return new Disposable3(() => {
      this._serializers.delete(viewType);
      this._proxy.$unregisterSerializer(viewType);
    });
  }
  async $deserializeWebviewPanel(webviewHandle, viewType, initData, position) {
    const entry = this._serializers.get(viewType);
    if (!entry) {
      throw new Error(`No serializer found for '${viewType}'`);
    }
    const { serializer, extension } = entry;
    const webview = this.webviews.createNewWebview(webviewHandle, initData.webviewOptions, extension);
    const revivedPanel = this.createNewWebviewPanel(webviewHandle, viewType, initData.title, position, initData.panelOptions, webview, initData.active);
    await serializer.deserializeWebviewPanel(revivedPanel, initData.state);
  }
  createNewWebviewPanel(webviewHandle, viewType, title, position, options2, webview, active) {
    const panel = new ExtHostWebviewPanel(webviewHandle, this._proxy, webview, { viewType, title, viewColumn: position, panelOptions: options2, active });
    this._webviewPanels.set(webviewHandle, panel);
    return panel;
  }
  getWebviewPanel(handle) {
    return this._webviewPanels.get(handle);
  }
};

function serializeWebviewPanelOptions(options2) {
  return {
    enableFindWidget: options2.enableFindWidget,
    retainContextWhenHidden: options2.retainContextWhenHidden
  };
}
export { serializeWebviewPanelOptions, ExtHostWebviewPanel, ExtHostWebviewPanels };
