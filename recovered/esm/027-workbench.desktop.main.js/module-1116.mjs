// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webviewPanel/browser/webviewEditorInput.ts
import { EditorInput } from "./module-0928.mjs";
import { generateUuid } from "./module-0190.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { isDark } from "./module-0247.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/workbench/contrib/webviewPanel/browser/webviewEditorInput.ts
var WebviewInput = class extends EditorInput {
  constructor(init, webview, _themeService) {
    super();
    this._themeService = _themeService;
    this._resourceId = generateUuid();
    this._hasTransfered = false;
    this.viewType = init.viewType;
    this.providerId = init.providedId;
    this._webviewTitle = init.name;
    this._iconPath = init.iconPath;
    this._webview = webview;
    this._register(_themeService.onDidColorThemeChange(() => {
      this._onDidChangeLabel.fire();
    }));
  }
  static {
    this.typeId = "workbench.editors.webviewInput";
  }
  get typeId() {
    return WebviewInput.typeId;
  }
  get editorId() {
    return this.viewType;
  }
  get capabilities() {
    return 2 /* Readonly */ | 8 /* Singleton */ | 128 /* CanDropIntoEditor */;
  }
  get resource() {
    return URI.from({
      scheme: Schemas.webviewPanel,
      path: `webview-panel/webview-${this.providerId}-${this._resourceId}`
    });
  }
  dispose() {
    if (!this.isDisposed()) {
      if (!this._hasTransfered) {
        this._webview?.dispose();
      }
    }
    super.dispose();
  }
  getName() {
    return this._webviewTitle;
  }
  getTitle(_verbosity) {
    return this.getName();
  }
  getDescription() {
    return void 0;
  }
  setWebviewTitle(value2) {
    this._webviewTitle = value2;
    this.webview.setTitle(value2);
    this._onDidChangeLabel.fire();
  }
  getWebviewTitle() {
    return this._webviewTitle;
  }
  get webview() {
    return this._webview;
  }
  get extension() {
    return this.webview.extension;
  }
  getIcon() {
    if (!this._iconPath) {
      return;
    }
    if (ThemeIcon.isThemeIcon(this._iconPath)) {
      return this._iconPath;
    }
    return isDark(this._themeService.getColorTheme().type) ? this._iconPath.dark : this._iconPath.light ?? this._iconPath.dark;
  }
  get iconPath() {
    return this._iconPath;
  }
  set iconPath(value2) {
    this._iconPath = value2;
    this._onDidChangeLabel.fire();
  }
  matches(other) {
    return super.matches(other) || other === this;
  }
  get group() {
    return this._group;
  }
  updateGroup(group2) {
    this._group = group2;
  }
  transfer(other) {
    if (this._hasTransfered) {
      return void 0;
    }
    this._hasTransfered = true;
    other._webview = this._webview;
    return other;
  }
  claim(claimant, targetWindow, scopedContextKeyService) {
    return this._webview.claim(claimant, targetWindow, scopedContextKeyService);
  }
};

WebviewInput = __decorateClass([
  __decorateParam(2, IThemeService)
], WebviewInput);
export { WebviewInput };
