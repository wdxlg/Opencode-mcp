// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/electron-browser/webviewElement.ts
import { WebviewElement } from "./module-4041.mjs";
import { Delayer } from "./module-0036.mjs";
import { WindowIgnoreMenuShortcutsManager } from "./module-4044.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ITunnelService } from "./module-1409.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IRemoteAuthorityResolverService } from "./module-0894.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IMainProcessService } from "./module-3728.mjs";
import { INotificationService } from "./module-0336.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/contrib/webview/electron-browser/webviewElement.ts
var ElectronWebviewElement = class extends WebviewElement {
  constructor(initInfo, webviewThemeDataProvider, contextMenuService, tunnelService, environmentService, remoteAuthorityResolverService, logService, configurationService, mainProcessService, notificationService, _nativeHostService, instantiationService, accessibilityService) {
    super(
      initInfo,
      webviewThemeDataProvider,
      configurationService,
      contextMenuService,
      notificationService,
      environmentService,
      logService,
      remoteAuthorityResolverService,
      tunnelService,
      accessibilityService,
      instantiationService
    );
    this._nativeHostService = _nativeHostService;
    this._findStarted = false;
    this._iframeDelayer = this._register(new Delayer(200));
    this._webviewKeyboardHandler = new WindowIgnoreMenuShortcutsManager(configurationService, mainProcessService, _nativeHostService);
    this._webviewMainService = ProxyChannel.toService(mainProcessService.getChannel("webview"));
    if (initInfo.options.enableFindWidget) {
      this._register(this.onDidHtmlChange((newContent) => {
        if (this._findStarted && this._cachedHtmlContent !== newContent) {
          this.stopFind(false);
          this._cachedHtmlContent = newContent;
        }
      }));
      this._register(this._webviewMainService.onFoundInFrame((result) => {
        this._hasFindResult.fire(result.matches > 0);
      }));
    }
  }
  get platform() {
    return "electron";
  }
  dispose() {
    this._webviewKeyboardHandler.didBlur();
    super.dispose();
  }
  webviewContentEndpoint(iframeId) {
    return `${Schemas.vscodeWebview}://${iframeId}`;
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
    if (!this._findStarted) {
      this.updateFind(value2);
    } else {
      const options3 = { forward: !previous, findNext: false, matchCase: false };
      this._webviewMainService.findInFrame({ windowId: this._nativeHostService.windowId }, this.id, value2, options3);
    }
  }
  updateFind(value2) {
    if (!value2 || !this.element) {
      return;
    }
    const options3 = {
      forward: true,
      findNext: true,
      matchCase: false
    };
    this._iframeDelayer.trigger(() => {
      this._findStarted = true;
      this._webviewMainService.findInFrame({ windowId: this._nativeHostService.windowId }, this.id, value2, options3);
    });
  }
  stopFind(keepSelection) {
    if (!this.element) {
      return;
    }
    this._iframeDelayer.cancel();
    this._findStarted = false;
    this._webviewMainService.stopFindInFrame({ windowId: this._nativeHostService.windowId }, this.id, {
      keepSelection
    });
    this._onDidStopFind.fire();
  }
  handleFocusChange(isFocused) {
    super.handleFocusChange(isFocused);
    if (isFocused) {
      this._webviewKeyboardHandler.didFocus();
    } else {
      this._webviewKeyboardHandler.didBlur();
    }
  }
};

ElectronWebviewElement = __decorateClass([
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, ITunnelService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, IRemoteAuthorityResolverService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IMainProcessService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, INativeHostService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, IAccessibilityService)
], ElectronWebviewElement);
export { ElectronWebviewElement };
