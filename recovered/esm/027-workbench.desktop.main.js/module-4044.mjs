// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/electron-browser/windowIgnoreMenuShortcutsManager.ts
import { hasNativeTitlebar } from "./module-0515.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { isMacintosh } from "./module-0014.mjs";


// src/vs/workbench/contrib/webview/electron-browser/windowIgnoreMenuShortcutsManager.ts
var WindowIgnoreMenuShortcutsManager = class {
  constructor(configurationService, mainProcessService, _nativeHostService) {
    this._nativeHostService = _nativeHostService;
    this._isUsingNativeTitleBars = hasNativeTitlebar(configurationService);
    this._webviewMainService = ProxyChannel.toService(mainProcessService.getChannel("webview"));
  }
  didFocus() {
    this.setIgnoreMenuShortcuts(true);
  }
  didBlur() {
    this.setIgnoreMenuShortcuts(false);
  }
  get _shouldToggleMenuShortcutsEnablement() {
    return isMacintosh || this._isUsingNativeTitleBars;
  }
  setIgnoreMenuShortcuts(value2) {
    if (this._shouldToggleMenuShortcutsEnablement) {
      this._webviewMainService.setIgnoreMenuShortcuts({ windowId: this._nativeHostService.windowId }, value2);
    }
  }
};
export { WindowIgnoreMenuShortcutsManager };
