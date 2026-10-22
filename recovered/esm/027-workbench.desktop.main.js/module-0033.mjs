// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/network.ts
import { URI } from "./module-0032.mjs";
import { equalsIgnoreCase, startsWithIgnoreCase } from "./module-0030.mjs";
import { join, posix } from "./module-0026.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { isNative, isWeb, webWorkerOrigin } from "./module-0014.mjs";


// src/vs/base/common/network.ts
var Schemas;

((Schemas3) => {
  Schemas3.inMemory = "inmemory";
  Schemas3.vscode = "vscode";
  Schemas3.internal = "private";
  Schemas3.walkThrough = "walkThrough";
  Schemas3.walkThroughSnippet = "walkThroughSnippet";
  Schemas3.http = "http";
  Schemas3.https = "https";
  Schemas3.file = "file";
  Schemas3.mailto = "mailto";
  Schemas3.untitled = "untitled";
  Schemas3.data = "data";
  Schemas3.command = "command";
  Schemas3.vscodeRemote = "vscode-remote";
  Schemas3.vscodeRemoteResource = "vscode-remote-resource";
  Schemas3.vscodeManagedRemoteResource = "vscode-managed-remote-resource";
  Schemas3.vscodeUserData = "vscode-userdata";
  Schemas3.vscodeCustomEditor = "vscode-custom-editor";
  Schemas3.vscodeNotebookCell = "vscode-notebook-cell";
  Schemas3.vscodeNotebookCellMetadata = "vscode-notebook-cell-metadata";
  Schemas3.vscodeNotebookCellMetadataDiff = "vscode-notebook-cell-metadata-diff";
  Schemas3.vscodeNotebookCellOutput = "vscode-notebook-cell-output";
  Schemas3.vscodeNotebookCellOutputDiff = "vscode-notebook-cell-output-diff";
  Schemas3.vscodeNotebookMetadata = "vscode-notebook-metadata";
  Schemas3.vscodeInteractiveInput = "vscode-interactive-input";
  Schemas3.vscodeSettings = "vscode-settings";
  Schemas3.vscodeWorkspaceTrust = "vscode-workspace-trust";
  Schemas3.vscodeTerminal = "vscode-terminal";
  Schemas3.vscodeImageCarousel = "vscode-image-carousel";
  Schemas3.vscodeChatCodeBlock = "vscode-chat-code-block";
  Schemas3.vscodeChatCodeCompareBlock = "vscode-chat-code-compare-block";
  Schemas3.vscodeChatEditor = "vscode-chat-editor";
  Schemas3.vscodeChatInput = "chatSessionInput";
  Schemas3.sessionsChatInput = "sessions-chat";
  Schemas3.vscodeLocalChatSession = "vscode-chat-session";
  Schemas3.vscodeChatResponseResource = "vscode-chat-response-resource";
  Schemas3.webviewPanel = "webview-panel";
  Schemas3.vscodeWebview = "vscode-webview";
  Schemas3.vscodeBrowser = "vscode-browser";
  Schemas3.extension = "extension";
  Schemas3.vscodeFileResource = "vscode-file";
  Schemas3.tmp = "tmp";
  Schemas3.vsls = "vsls";
  Schemas3.vscodeSourceControl = "vscode-scm";
  Schemas3.commentsInput = "comment";
  Schemas3.codeSetting = "code-setting";
  Schemas3.outputChannel = "output";
  Schemas3.accessibleView = "accessible-view";
  Schemas3.chatEditingSnapshotScheme = "chat-editing-snapshot-text-model";
  Schemas3.chatEditingModel = "chat-editing-text-model";
  Schemas3.copilotPr = "copilot-pr";
})(Schemas || (Schemas = {}));

function matchesScheme(target, scheme) {
  if (URI.isUri(target)) {
    return equalsIgnoreCase(target.scheme, scheme);
  } else {
    return startsWithIgnoreCase(target, scheme + ":");
  }
}

function matchesSomeScheme(target, ...schemes) {
  return schemes.some((scheme) => matchesScheme(target, scheme));
}

var connectionTokenQueryName = "tkn";

var RemoteAuthoritiesImpl = class {
  constructor() {
    this._hosts = /* @__PURE__ */ Object.create(null);
    this._ports = /* @__PURE__ */ Object.create(null);
    this._connectionTokens = /* @__PURE__ */ Object.create(null);
    this._preferredWebSchema = "http";
    this._delegate = null;
    this._serverRootPath = "/";
  }
  setPreferredWebSchema(schema10) {
    this._preferredWebSchema = schema10;
  }
  setDelegate(delegate) {
    this._delegate = delegate;
  }
  setServerRootPath(product2, serverBasePath) {
    this._serverRootPath = posix.join(serverBasePath ?? "/", getServerProductSegment(product2));
  }
  getServerRootPath() {
    return this._serverRootPath;
  }
  get _remoteResourcesPath() {
    return posix.join(this._serverRootPath, Schemas.vscodeRemoteResource);
  }
  set(authority, host, port) {
    this._hosts[authority] = host;
    this._ports[authority] = port;
  }
  setConnectionToken(authority, connectionToken) {
    this._connectionTokens[authority] = connectionToken;
  }
  getPreferredWebSchema() {
    return this._preferredWebSchema;
  }
  rewrite(uri5) {
    if (this._delegate) {
      try {
        return this._delegate(uri5);
      } catch (err) {
        onUnexpectedExternalError(err);
        return uri5;
      }
    }
    const authority = uri5.authority;
    let host = this._hosts[authority];
    if (host && host.indexOf(":") !== -1 && host.indexOf("[") === -1) {
      host = `[${host}]`;
    }
    const port = this._ports[authority];
    const connectionToken = this._connectionTokens[authority];
    let query = `path=${encodeURIComponent(uri5.path)}`;
    if (typeof connectionToken === "string") {
      query += `&${connectionTokenQueryName}=${encodeURIComponent(connectionToken)}`;
    }
    return URI.from({
      scheme: isWeb ? this._preferredWebSchema : Schemas.vscodeRemoteResource,
      authority: `${host}:${port}`,
      path: this._remoteResourcesPath,
      query
    });
  }
};

var RemoteAuthorities = new RemoteAuthoritiesImpl();

function getServerProductSegment(product2) {
  return `${product2.quality ?? "oss"}-${product2.commit ?? "dev"}`;
}

var builtinExtensionsPath = "vs/../../extensions";

var nodeModulesPath = "vs/../../node_modules";

var nodeModulesAsarPath = "vs/../../node_modules.asar";

var nodeModulesAsarUnpackedPath = "vs/../../node_modules.asar.unpacked";

var VSCODE_AUTHORITY = "vscode-app";

var FileAccessImpl = class _FileAccessImpl {
  static {
    this.FALLBACK_AUTHORITY = VSCODE_AUTHORITY;
  }
  /**
   * Returns a URI to use in contexts where the browser is responsible
   * for loading (e.g. fetch()) or when used within the DOM.
   *
   * **Note:** use `dom.ts#asCSSUrl` whenever the URL is to be used in CSS context.
   */
  asBrowserUri(resourcePath) {
    const uri5 = this.toUri(resourcePath);
    return this.uriToBrowserUri(uri5);
  }
  /**
   * Returns a URI to use in contexts where the browser is responsible
   * for loading (e.g. fetch()) or when used within the DOM.
   *
   * **Note:** use `dom.ts#asCSSUrl` whenever the URL is to be used in CSS context.
   */
  uriToBrowserUri(uri5) {
    if (uri5.scheme === Schemas.vscodeRemote) {
      return RemoteAuthorities.rewrite(uri5);
    }
    if (
      // ...only ever for `file` resources
      uri5.scheme === Schemas.file && // ...and we run in native environments
      (isNative || // ...or web worker extensions on desktop
      webWorkerOrigin === `${Schemas.vscodeFileResource}://${_FileAccessImpl.FALLBACK_AUTHORITY}`)
    ) {
      return uri5.with({
        scheme: Schemas.vscodeFileResource,
        // We need to provide an authority here so that it can serve
        // as origin for network and loading matters in chromium.
        // If the URI is not coming with an authority already, we
        // add our own
        authority: uri5.authority || _FileAccessImpl.FALLBACK_AUTHORITY,
        query: null,
        fragment: null
      });
    }
    return uri5;
  }
  /**
   * Returns the `file` URI to use in contexts where node.js
   * is responsible for loading.
   */
  asFileUri(resourcePath) {
    const uri5 = this.toUri(resourcePath);
    return this.uriToFileUri(uri5);
  }
  /**
   * Returns the `file` URI to use in contexts where node.js
   * is responsible for loading.
   */
  uriToFileUri(uri5) {
    if (uri5.scheme === Schemas.vscodeFileResource) {
      return uri5.with({
        scheme: Schemas.file,
        // Only preserve the `authority` if it is different from
        // our fallback authority. This ensures we properly preserve
        // Windows UNC paths that come with their own authority.
        authority: uri5.authority !== _FileAccessImpl.FALLBACK_AUTHORITY ? uri5.authority : null,
        query: null,
        fragment: null
      });
    }
    return uri5;
  }
  toUri(uriOrModule) {
    if (URI.isUri(uriOrModule)) {
      return uriOrModule;
    }
    if (globalThis._VSCODE_FILE_ROOT) {
      const rootUriOrPath = globalThis._VSCODE_FILE_ROOT;
      if (/^\w[\w\d+.-]*:\/\//.test(rootUriOrPath)) {
        return URI.joinPath(URI.parse(rootUriOrPath, true), uriOrModule);
      }
      const modulePath = join(rootUriOrPath, uriOrModule);
      return URI.file(modulePath);
    }
    throw new Error("Cannot determine URI for module id!");
  }
};

var FileAccess = new FileAccessImpl();

var CacheControlheaders = Object.freeze({
  "Cache-Control": "no-cache, no-store"
});

var DocumentPolicyheaders = Object.freeze({
  "Document-Policy": "include-js-call-stacks-in-crash-reports"
});

var COI;

((COI2) => {
  const coiHeaders = /* @__PURE__ */ new Map([
    ["1", { "Cross-Origin-Opener-Policy": "same-origin" }],
    ["2", { "Cross-Origin-Embedder-Policy": "require-corp" }],
    ["3", { "Cross-Origin-Opener-Policy": "same-origin", "Cross-Origin-Embedder-Policy": "require-corp" }]
  ]);
  COI2.CoopAndCoep = Object.freeze(coiHeaders.get("3"));
  const coiSearchParamName = "vscode-coi";
  function getHeadersFromQuery(url) {
    let params;
    if (typeof url === "string") {
      params = new URL(url).searchParams;
    } else if (url instanceof URL) {
      params = url.searchParams;
    } else if (URI.isUri(url)) {
      params = new URL(url.toString(true)).searchParams;
    }
    const value2 = params?.get(coiSearchParamName);
    if (!value2) {
      return void 0;
    }
    return coiHeaders.get(value2);
  }
  COI2.getHeadersFromQuery = getHeadersFromQuery;
  function addSearchParam(urlOrSearch, coop, coep) {
    if (!globalThis.crossOriginIsolated) {
      return;
    }
    const value2 = coop && coep ? "3" : coep ? "2" : "1";
    if (urlOrSearch instanceof URLSearchParams) {
      urlOrSearch.set(coiSearchParamName, value2);
    } else {
      urlOrSearch[coiSearchParamName] = value2;
    }
  }
  COI2.addSearchParam = addSearchParam;
})(COI || (COI = {}));
export { matchesScheme, matchesSomeScheme, getServerProductSegment, Schemas, connectionTokenQueryName, RemoteAuthoritiesImpl, RemoteAuthorities, builtinExtensionsPath, nodeModulesPath, nodeModulesAsarPath, nodeModulesAsarUnpackedPath, VSCODE_AUTHORITY, FileAccessImpl, FileAccess, CacheControlheaders, DocumentPolicyheaders, COI };
