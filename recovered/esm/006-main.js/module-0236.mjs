// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/webview/electron-main/webviewProtocolProvider.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { COI, FileAccess, Schemas, init_network } from "./module-0031.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { IFileService, init_files } from "./module-0072.mjs";


// src/vs/platform/webview/electron-main/webviewProtocolProvider.ts
import { protocol } from "electron";

var WebviewProtocolProvider;

var init_webviewProtocolProvider = __esm({
  "src/vs/platform/webview/electron-main/webviewProtocolProvider.ts"() {
    init_network();
    init_uri();
    init_files();
    WebviewProtocolProvider = class {
      constructor(_fileService) {
        this._fileService = _fileService;
        const webviewHandler = this.handleWebviewRequest.bind(this);
        protocol.handle(Schemas.vscodeWebview, webviewHandler);
      }
      static {
        this.validWebviewFilePaths = /* @__PURE__ */ new Map([
          ["/index.html", { mime: "text/html" }],
          ["/fake.html", { mime: "text/html" }],
          ["/service-worker.js", { mime: "application/javascript" }]
        ]);
      }
      dispose() {
        protocol.unhandle(Schemas.vscodeWebview);
      }
      async handleWebviewRequest(request) {
        try {
          const uri = URI.parse(request.url);
          const entry = WebviewProtocolProvider.validWebviewFilePaths.get(uri.path);
          if (entry) {
            const relativeResourcePath = `vs/workbench/contrib/webview/browser/pre${uri.path}`;
            const url = FileAccess.asFileUri(relativeResourcePath);
            const content = await this._fileService.readFile(url);
            return new Response(content.value.buffer, {
              headers: {
                "Content-Type": entry.mime,
                ...COI.getHeadersFromQuery(request.url),
                "Cross-Origin-Resource-Policy": "cross-origin"
              }
            });
          } else {
            return new Response(null, { status: 403 });
          }
        } catch {
        }
        return new Response(null, { status: 500 });
      }
    };
    WebviewProtocolProvider = __decorateClass([
      __decorateParam(0, IFileService)
    ], WebviewProtocolProvider);
  }
});
export { protocol, WebviewProtocolProvider, init_webviewProtocolProvider };
