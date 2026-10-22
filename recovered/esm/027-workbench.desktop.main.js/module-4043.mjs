// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/browser/webviewService.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { WebviewThemeDataProvider } from "./module-4036.mjs";
import { WebviewElement } from "./module-4041.mjs";
import { OverlayWebview } from "./module-4042.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/webview/browser/webviewService.ts
var WebviewService = class extends Disposable {
  constructor(_instantiationService) {
    super();
    this._instantiationService = _instantiationService;
    this._webviews = /* @__PURE__ */ new Set();
    this._onDidChangeActiveWebview = this._register(new Emitter());
    this.onDidChangeActiveWebview = this._onDidChangeActiveWebview.event;
    this._webviewThemeDataProvider = this._instantiationService.createInstance(WebviewThemeDataProvider);
  }
  get activeWebview() {
    return this._activeWebview;
  }
  _updateActiveWebview(value2) {
    if (value2 !== this._activeWebview) {
      this._activeWebview = value2;
      this._onDidChangeActiveWebview.fire(value2);
    }
  }
  get webviews() {
    return this._webviews.values();
  }
  createWebviewElement(initInfo) {
    const webview = this._instantiationService.createInstance(WebviewElement, initInfo, this._webviewThemeDataProvider);
    this.registerNewWebview(webview);
    return webview;
  }
  createWebviewOverlay(initInfo) {
    const webview = this._instantiationService.createInstance(OverlayWebview, initInfo);
    this.registerNewWebview(webview);
    return webview;
  }
  registerNewWebview(webview) {
    this._webviews.add(webview);
    const store = new DisposableStore();
    store.add(webview.onDidFocus(() => {
      this._updateActiveWebview(webview);
    }));
    const onBlur = () => {
      if (this._activeWebview === webview) {
        this._updateActiveWebview(void 0);
      }
    };
    store.add(webview.onDidBlur(onBlur));
    store.add(webview.onDidDispose(() => {
      onBlur();
      store.dispose();
      this._webviews.delete(webview);
    }));
  }
};

WebviewService = __decorateClass([
  __decorateParam(0, IInstantiationService)
], WebviewService);
export { WebviewService };
