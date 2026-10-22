// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/electron-browser/webviewService.ts
import { WebviewService } from "./module-4043.mjs";
import { ElectronWebviewElement } from "./module-4045.mjs";


// src/vs/workbench/contrib/webview/electron-browser/webviewService.ts
var ElectronWebviewService = class extends WebviewService {
  createWebviewElement(initInfo) {
    const webview = this._instantiationService.createInstance(ElectronWebviewElement, initInfo, this._webviewThemeDataProvider);
    this.registerNewWebview(webview);
    return webview;
  }
};
export { ElectronWebviewService };
