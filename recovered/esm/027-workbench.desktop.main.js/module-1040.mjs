// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadWebviews.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ExtHostContext } from "./module-0921.mjs";
import { Schemas } from "./module-0033.mjs";
import { deserializeWebviewMessage, serializeWebviewMessage } from "./module-1039.mjs";
import { SerializableObjectWithBuffers } from "./module-0920.mjs";
import { URI } from "./module-0032.mjs";
import { isWeb } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { escape } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IProductService } from "./module-0873.mjs";


// src/vs/workbench/api/browser/mainThreadWebviews.ts
var MainThreadWebviews = class extends Disposable {
  constructor(context2, _openerService, _productService) {
    super();
    this._openerService = _openerService;
    this._productService = _productService;
    this._webviews = /* @__PURE__ */ new Map();
    this._proxy = context2.getProxy(ExtHostContext.ExtHostWebviews);
  }
  static {
    this.standardSupportedLinkSchemes = /* @__PURE__ */ new Set([
      Schemas.http,
      Schemas.https,
      Schemas.mailto,
      Schemas.vscode,
      "vscode-insider"
    ]);
  }
  addWebview(handle2, webview, options3) {
    if (this._webviews.has(handle2)) {
      throw new Error("Webview already registered");
    }
    this._webviews.set(handle2, webview);
    this.hookupWebviewEventDelegate(handle2, webview, options3);
  }
  $setHtml(handle2, value2) {
    this.tryGetWebview(handle2)?.setHtml(value2);
  }
  $setOptions(handle2, options3) {
    const webview = this.tryGetWebview(handle2);
    if (webview) {
      webview.contentOptions = reviveWebviewContentOptions(options3);
    }
  }
  async $postMessage(handle2, jsonMessage, ...buffers) {
    const webview = this.tryGetWebview(handle2);
    if (!webview) {
      return false;
    }
    const { message, arrayBuffers } = deserializeWebviewMessage(jsonMessage, buffers);
    return webview.postMessage(message, arrayBuffers);
  }
  hookupWebviewEventDelegate(handle2, webview, options3) {
    const disposables = new DisposableStore();
    disposables.add(webview.onDidClickLink((uri5) => this.onDidClickLink(handle2, uri5)));
    disposables.add(webview.onMessage((message) => {
      const serialized = serializeWebviewMessage(message.message, options3);
      this._proxy.$onMessage(handle2, serialized.message, new SerializableObjectWithBuffers(serialized.buffers));
    }));
    disposables.add(webview.onMissingCsp((extension) => this._proxy.$onMissingCsp(handle2, extension.value)));
    disposables.add(webview.onDidDispose(() => {
      disposables.dispose();
      this._webviews.delete(handle2);
    }));
  }
  onDidClickLink(handle2, link2) {
    const webview = this.getWebview(handle2);
    if (this.isSupportedLink(webview, URI.parse(link2))) {
      this._openerService.open(link2, { fromUserGesture: true, allowContributedOpeners: true, allowCommands: Array.isArray(webview.contentOptions.enableCommandUris) || webview.contentOptions.enableCommandUris === true, fromWorkspace: true });
    }
  }
  isSupportedLink(webview, link2) {
    if (MainThreadWebviews.standardSupportedLinkSchemes.has(link2.scheme)) {
      return true;
    }
    if (!isWeb && this._productService.urlProtocol === link2.scheme) {
      return true;
    }
    if (link2.scheme === Schemas.command) {
      if (Array.isArray(webview.contentOptions.enableCommandUris)) {
        return webview.contentOptions.enableCommandUris.includes(link2.path);
      }
      return webview.contentOptions.enableCommandUris === true;
    }
    return false;
  }
  tryGetWebview(handle2) {
    return this._webviews.get(handle2);
  }
  getWebview(handle2) {
    const webview = this.tryGetWebview(handle2);
    if (!webview) {
      throw new Error(`Unknown webview handle:${handle2}`);
    }
    return webview;
  }
  getWebviewResolvedFailedContent(viewType) {
    return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none';">
			</head>
			<body>${localize(5740, null, escape(viewType))}</body>
		</html>`;
  }
};

MainThreadWebviews = __decorateClass([
  __decorateParam(1, IOpenerService),
  __decorateParam(2, IProductService)
], MainThreadWebviews);

function reviveWebviewExtension(extensionData) {
  return {
    id: extensionData.id,
    location: URI.revive(extensionData.location)
  };
}

function reviveWebviewContentOptions(webviewOptions) {
  return {
    allowScripts: webviewOptions.enableScripts,
    allowForms: webviewOptions.enableForms,
    forwardUntrustedKeypressEvents: true,
    // This is always enabled for extensions
    enableCommandUris: webviewOptions.enableCommandUris,
    localResourceRoots: Array.isArray(webviewOptions.localResourceRoots) ? webviewOptions.localResourceRoots.map((r2) => URI.revive(r2)) : void 0,
    portMapping: webviewOptions.portMapping
  };
}
export { reviveWebviewExtension, reviveWebviewContentOptions, MainThreadWebviews };
