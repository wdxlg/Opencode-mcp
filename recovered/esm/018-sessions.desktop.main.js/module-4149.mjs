// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/webview/common/mimeTypes.ts
import { Mimes, getMediaMime } from "./module-0136.mjs";
import { extname } from "./module-0026.mjs";


// src/vs/platform/webview/common/mimeTypes.ts
var webviewMimeTypes = /* @__PURE__ */ new Map([
  [".svg", "image/svg+xml"],
  [".txt", Mimes.text],
  [".css", "text/css"],
  [".js", "application/javascript"],
  [".cjs", "application/javascript"],
  [".mjs", "application/javascript"],
  [".json", "application/json"],
  [".html", "text/html"],
  [".htm", "text/html"],
  [".xhtml", "application/xhtml+xml"],
  [".oft", "font/otf"],
  [".xml", "application/xml"],
  [".wasm", "application/wasm"]
]);

function getWebviewContentMimeType(resource) {
  const ext = extname(resource.fsPath).toLowerCase();
  return webviewMimeTypes.get(ext) || getMediaMime(resource.fsPath) || Mimes.unknown;
}
export { getWebviewContentMimeType, webviewMimeTypes };
