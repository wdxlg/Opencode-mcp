// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostWebview.ts
import { Emitter } from "./module-0017.mjs";
import { asWebviewUri, webviewGenericCspSource } from "./module-0373.mjs";
import { Schemas } from "./module-0026.mjs";
import { equals3 } from "./module-0042.mjs";
import { deserializeWebviewMessage, serializeWebviewMessage } from "./module-0379.mjs";
import { URI } from "./module-0025.mjs";
import { normalizeVersion, parseVersion } from "./module-0378.mjs";
import { Disposable } from "./module-0011.mjs";
import { MainContext } from "./module-0054.mjs";


// src/vs/workbench/api/common/extHostWebview.ts
var ExtHostWebview = class {
  constructor(handle, proxy, options2, remoteInfo, workspace, extension, deprecationService) {
    this.#html = "";
    this.#isDisposed = false;
    this.#hasCalledAsWebviewUri = false;
    /* internal */
    this._onMessageEmitter = new Emitter();
    this.onDidReceiveMessage = this._onMessageEmitter.event;
    this.#onDidDisposeEmitter = new Emitter();
    /* internal */
    this._onDidDispose = this.#onDidDisposeEmitter.event;
    this.#handle = handle;
    this.#proxy = proxy;
    this.#options = options2;
    this.#remoteInfo = remoteInfo;
    this.#workspace = workspace;
    this.#extension = extension;
    this.#serializeBuffersForPostMessage = shouldSerializeBuffersForPostMessage(extension);
    this.#shouldRewriteOldResourceUris = shouldTryRewritingOldResourceUris(extension);
    this.#deprecationService = deprecationService;
  }
  #handle;
  #proxy;
  #deprecationService;
  #remoteInfo;
  #workspace;
  #extension;
  #html;
  #options;
  #isDisposed;
  #hasCalledAsWebviewUri;
  #serializeBuffersForPostMessage;
  #shouldRewriteOldResourceUris;
  #onDidDisposeEmitter;
  dispose() {
    this.#isDisposed = true;
    this.#onDidDisposeEmitter.fire();
    this.#onDidDisposeEmitter.dispose();
    this._onMessageEmitter.dispose();
  }
  asWebviewUri(resource) {
    this.#hasCalledAsWebviewUri = true;
    return asWebviewUri(resource, this.#remoteInfo);
  }
  get cspSource() {
    const extensionLocation = this.#extension.extensionLocation;
    if (extensionLocation.scheme === Schemas.https || extensionLocation.scheme === Schemas.http) {
      let extensionCspRule = extensionLocation.toString();
      if (!extensionCspRule.endsWith("/")) {
        extensionCspRule += "/";
      }
      return extensionCspRule + " " + webviewGenericCspSource;
    }
    return webviewGenericCspSource;
  }
  get html() {
    this.assertNotDisposed();
    return this.#html;
  }
  set html(value) {
    this.assertNotDisposed();
    if (this.#html !== value) {
      this.#html = value;
      if (this.#shouldRewriteOldResourceUris && !this.#hasCalledAsWebviewUri && /(["'])vscode-resource:([^\s'"]+?)(["'])/i.test(value)) {
        this.#hasCalledAsWebviewUri = true;
        this.#deprecationService.report(
          "Webview vscode-resource: uris",
          this.#extension,
          `Please migrate to use the 'webview.asWebviewUri' api instead: https://aka.ms/vscode-webview-use-aswebviewuri`
        );
      }
      this.#proxy.$setHtml(this.#handle, this.rewriteOldResourceUrlsIfNeeded(value));
    }
  }
  get options() {
    this.assertNotDisposed();
    return this.#options;
  }
  set options(newOptions) {
    this.assertNotDisposed();
    if (!equals3(this.#options, newOptions)) {
      this.#proxy.$setOptions(this.#handle, serializeWebviewOptions(this.#extension, this.#workspace, newOptions));
    }
    this.#options = newOptions;
  }
  async postMessage(message) {
    if (this.#isDisposed) {
      return false;
    }
    const serialized = serializeWebviewMessage(message, { serializeBuffersForPostMessage: this.#serializeBuffersForPostMessage });
    return this.#proxy.$postMessage(this.#handle, serialized.message, ...serialized.buffers);
  }
  assertNotDisposed() {
    if (this.#isDisposed) {
      throw new Error("Webview is disposed");
    }
  }
  rewriteOldResourceUrlsIfNeeded(value) {
    if (!this.#shouldRewriteOldResourceUris) {
      return value;
    }
    const isRemote = this.#extension.extensionLocation?.scheme === Schemas.vscodeRemote;
    const remoteAuthority = this.#extension.extensionLocation.scheme === Schemas.vscodeRemote ? this.#extension.extensionLocation.authority : void 0;
    return value.replace(/(["'])(?:vscode-resource):(\/\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi, (_match, startQuote, _1, scheme, path, endQuote) => {
      const uri2 = URI.from({
        scheme: scheme || "file",
        path: decodeURIComponent(path)
      });
      const webviewUri = asWebviewUri(uri2, { isRemote, authority: remoteAuthority }).toString();
      return `${startQuote}${webviewUri}${endQuote}`;
    }).replace(/(["'])(?:vscode-webview-resource):(\/\/[^\s\/'"]+\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi, (_match, startQuote, _1, scheme, path, endQuote) => {
      const uri2 = URI.from({
        scheme: scheme || "file",
        path: decodeURIComponent(path)
      });
      const webviewUri = asWebviewUri(uri2, { isRemote, authority: remoteAuthority }).toString();
      return `${startQuote}${webviewUri}${endQuote}`;
    });
  }
};

function shouldSerializeBuffersForPostMessage(extension) {
  try {
    const version = normalizeVersion(parseVersion(extension.engines.vscode));
    return !!version && version.majorBase >= 1 && version.minorBase >= 57;
  } catch {
    return false;
  }
}

function shouldTryRewritingOldResourceUris(extension) {
  try {
    const version = normalizeVersion(parseVersion(extension.engines.vscode));
    if (!version) {
      return false;
    }
    return version.majorBase < 1 || version.majorBase === 1 && version.minorBase < 60;
  } catch {
    return false;
  }
}

var ExtHostWebviews = class extends Disposable {
  constructor(mainContext, remoteInfo, workspace, _logService, _deprecationService) {
    super();
    this.remoteInfo = remoteInfo;
    this.workspace = workspace;
    this._logService = _logService;
    this._deprecationService = _deprecationService;
    this._webviews = /* @__PURE__ */ new Map();
    this._webviewProxy = mainContext.getProxy(MainContext.MainThreadWebviews);
  }
  dispose() {
    super.dispose();
    for (const webview of this._webviews.values()) {
      webview.dispose();
    }
    this._webviews.clear();
  }
  $onMessage(handle, jsonMessage, buffers) {
    const webview = this.getWebview(handle);
    if (webview) {
      const { message } = deserializeWebviewMessage(jsonMessage, buffers.value);
      webview._onMessageEmitter.fire(message);
    }
  }
  $onMissingCsp(_handle, extensionId) {
    this._logService.warn(`${extensionId} created a webview without a content security policy: https://aka.ms/vscode-webview-missing-csp`);
  }
  createNewWebview(handle, options2, extension) {
    const webview = new ExtHostWebview(handle, this._webviewProxy, reviveOptions(options2), this.remoteInfo, this.workspace, extension, this._deprecationService);
    this._webviews.set(handle, webview);
    const sub = webview._onDidDispose(() => {
      sub.dispose();
      this.deleteWebview(handle);
    });
    return webview;
  }
  /**
   * Ensures that the main thread side of the webview has `localResourceRoots`
   * populated when the caller did not supply any.
   *
   * This honors the documented `WebviewOptions.localResourceRoots` contract
   * ("Default to ... the workspace folders and the extension's install
   * directory") for code paths that construct the webview's content options
   * outside of the extension host (e.g. custom editors), where the main
   * thread starts with empty content options.
   */
  ensureDefaultContentOptions(handle, contentOptions, extension) {
    if (contentOptions.localResourceRoots) {
      return;
    }
    this._webviewProxy.$setOptions(handle, {
      ...contentOptions,
      localResourceRoots: getDefaultLocalResourceRoots(extension, this.workspace)
    });
  }
  deleteWebview(handle) {
    this._webviews.delete(handle);
  }
  getWebview(handle) {
    return this._webviews.get(handle);
  }
};

function toExtensionData(extension) {
  return { id: extension.identifier, location: extension.extensionLocation };
}

function serializeWebviewOptions(extension, workspace, options2) {
  return {
    enableCommandUris: options2.enableCommandUris,
    enableScripts: options2.enableScripts,
    enableForms: options2.enableForms,
    portMapping: options2.portMapping,
    localResourceRoots: options2.localResourceRoots || getDefaultLocalResourceRoots(extension, workspace)
  };
}

function reviveOptions(options2) {
  return {
    enableCommandUris: options2.enableCommandUris,
    enableScripts: options2.enableScripts,
    enableForms: options2.enableForms,
    portMapping: options2.portMapping,
    localResourceRoots: options2.localResourceRoots?.map((components) => URI.from(components))
  };
}

function getDefaultLocalResourceRoots(extension, workspace) {
  return [
    ...(workspace?.getWorkspaceFolders() || []).map((x) => x.uri),
    extension.extensionLocation
  ];
}
export { shouldSerializeBuffersForPostMessage, shouldTryRewritingOldResourceUris, toExtensionData, serializeWebviewOptions, reviveOptions, getDefaultLocalResourceRoots, ExtHostWebview, ExtHostWebviews };
