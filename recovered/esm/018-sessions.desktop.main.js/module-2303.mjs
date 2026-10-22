// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/uriTransformer.ts
import { URITransformer } from "./module-1199.mjs";


// src/vs/base/common/uriTransformer.ts
function createRawURITransformer(remoteAuthority) {
  return {
    transformIncoming: (uri4) => {
      if (uri4.scheme === "vscode-remote") {
        return { scheme: "file", path: uri4.path, query: uri4.query, fragment: uri4.fragment };
      }
      if (uri4.scheme === "file") {
        return { scheme: "vscode-local", path: uri4.path, query: uri4.query, fragment: uri4.fragment };
      }
      return uri4;
    },
    transformOutgoing: (uri4) => {
      if (uri4.scheme === "file") {
        return { scheme: "vscode-remote", authority: remoteAuthority, path: uri4.path, query: uri4.query, fragment: uri4.fragment };
      }
      if (uri4.scheme === "vscode-local") {
        return { scheme: "file", path: uri4.path, query: uri4.query, fragment: uri4.fragment };
      }
      return uri4;
    },
    transformOutgoingScheme: (scheme) => {
      if (scheme === "file") {
        return "vscode-remote";
      } else if (scheme === "vscode-local") {
        return "file";
      }
      return scheme;
    }
  };
}

function createURITransformer(remoteAuthority) {
  return new URITransformer(createRawURITransformer(remoteAuthority));
}
export { createRawURITransformer, createURITransformer };
