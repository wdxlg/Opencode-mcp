// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadWebviewViews.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { ExtHostContext } from "./module-0922.mjs";
import { reviveWebviewExtension } from "./module-1041.mjs";
import { generateUuid } from "./module-0190.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWebviewViewService } from "./module-1306.mjs";


// src/vs/workbench/api/browser/mainThreadWebviewViews.ts
var MainThreadWebviewsViews = class extends Disposable {
  constructor(context2, mainThreadWebviews, _telemetryService, _webviewViewService) {
    super();
    this.mainThreadWebviews = mainThreadWebviews;
    this._telemetryService = _telemetryService;
    this._webviewViewService = _webviewViewService;
    this._webviewViews = this._register(new DisposableMap());
    this._webviewViewProviders = this._register(new DisposableMap());
    this._proxy = context2.getProxy(ExtHostContext.ExtHostWebviewViews);
  }
  $setWebviewViewTitle(handle2, value2) {
    const webviewView = this.getWebviewView(handle2);
    webviewView.title = value2;
  }
  $setWebviewViewDescription(handle2, value2) {
    const webviewView = this.getWebviewView(handle2);
    webviewView.description = value2;
  }
  $setWebviewViewBadge(handle2, badge) {
    const webviewView = this.getWebviewView(handle2);
    webviewView.badge = badge;
  }
  $show(handle2, preserveFocus) {
    const webviewView = this.getWebviewView(handle2);
    webviewView.show(preserveFocus);
  }
  $registerWebviewViewProvider(extensionData, viewType, options3) {
    if (this._webviewViewProviders.has(viewType)) {
      throw new Error(`View provider for ${viewType} already registered`);
    }
    const extension = reviveWebviewExtension(extensionData);
    const registration = this._webviewViewService.register(viewType, {
      resolve: async (webviewView, cancellation) => {
        const handle2 = generateUuid();
        this._webviewViews.set(handle2, webviewView);
        this.mainThreadWebviews.addWebview(handle2, webviewView.webview, { serializeBuffersForPostMessage: options3.serializeBuffersForPostMessage });
        let state = void 0;
        if (webviewView.webview.state) {
          try {
            state = JSON.parse(webviewView.webview.state);
          } catch (e4) {
            console.error("Could not load webview state", e4, webviewView.webview.state);
          }
        }
        webviewView.webview.extension = extension;
        if (options3) {
          webviewView.webview.options = options3;
        }
        const subscriptions = new DisposableStore();
        subscriptions.add(webviewView.onDidChangeVisibility((visible) => {
          this._proxy.$onDidChangeWebviewViewVisibility(handle2, visible);
        }));
        subscriptions.add(webviewView.onDispose(() => {
          this._proxy.$disposeWebviewView(handle2);
          this._webviewViews.deleteAndDispose(handle2);
          subscriptions.dispose();
        }));
        this._telemetryService.publicLog2("webviews:createWebviewView", {
          extensionId: extension.id.value,
          id: viewType
        });
        try {
          await this._proxy.$resolveWebviewView(handle2, viewType, webviewView.title, state, cancellation);
        } catch (error) {
          onUnexpectedError(error);
          webviewView.webview.setHtml(this.mainThreadWebviews.getWebviewResolvedFailedContent(viewType));
        }
      }
    });
    this._webviewViewProviders.set(viewType, registration);
  }
  $unregisterWebviewViewProvider(viewType) {
    if (!this._webviewViewProviders.has(viewType)) {
      throw new Error(`No view provider for ${viewType} registered`);
    }
    this._webviewViewProviders.deleteAndDispose(viewType);
  }
  getWebviewView(handle2) {
    const webviewView = this._webviewViews.get(handle2);
    if (!webviewView) {
      throw new Error("unknown webview view");
    }
    return webviewView;
  }
};

MainThreadWebviewsViews = __decorateClass([
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IWebviewViewService)
], MainThreadWebviewsViews);
export { MainThreadWebviewsViews };
