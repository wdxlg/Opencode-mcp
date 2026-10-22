// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/common/webview.ts
import { Schemas } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/webview/common/webview.ts
var webviewResourceBaseHost = "vscode-cdn.net";

var webviewRootResourceAuthority = `vscode-resource.${webviewResourceBaseHost}`;

var webviewGenericCspSource = `'self' https://*.${webviewResourceBaseHost}`;

function asWebviewUri(resource, remoteInfo) {
  if (resource.scheme === Schemas.http || resource.scheme === Schemas.https) {
    return resource;
  }
  if (remoteInfo && remoteInfo.authority && remoteInfo.isRemote && resource.scheme === Schemas.file) {
    resource = URI.from({
      scheme: Schemas.vscodeRemote,
      authority: remoteInfo.authority,
      path: resource.path
    });
  }
  return URI.from({
    scheme: Schemas.https,
    authority: `${resource.scheme}+${encodeAuthority(resource.authority)}.${webviewRootResourceAuthority}`,
    path: resource.path,
    fragment: resource.fragment,
    query: resource.query
  });
}

function encodeAuthority(authority) {
  return authority.replace(/./g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 97 /* a */ && code <= 122 /* z */ || code >= 65 /* A */ && code <= 90 /* Z */ || code >= 48 /* Digit0 */ && code <= 57 /* Digit9 */) {
      return char;
    }
    return "-" + code.toString(16).padStart(4, "0");
  });
}

function decodeAuthority(authority) {
  return authority.replace(/-([0-9a-f]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}
export { asWebviewUri, encodeAuthority, decodeAuthority, webviewResourceBaseHost, webviewRootResourceAuthority, webviewGenericCspSource };
