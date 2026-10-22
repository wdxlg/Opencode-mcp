// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/uriTransformer.ts
import { URITransformer } from "./module-1199.mjs";


// src/vs/base/common/uriTransformer.ts
function createRawURITransformer(remoteAuthority) {
  return {
    transformIncoming: (uri5) => {
      if (uri5.scheme === "vscode-remote") {
        return { scheme: "file", path: uri5.path, query: uri5.query, fragment: uri5.fragment };
      }
      if (uri5.scheme === "file") {
        return { scheme: "vscode-local", path: uri5.path, query: uri5.query, fragment: uri5.fragment };
      }
      return uri5;
    },
    transformOutgoing: (uri5) => {
      if (uri5.scheme === "file") {
        return { scheme: "vscode-remote", authority: remoteAuthority, path: uri5.path, query: uri5.query, fragment: uri5.fragment };
      }
      if (uri5.scheme === "vscode-local") {
        return { scheme: "file", path: uri5.path, query: uri5.query, fragment: uri5.fragment };
      }
      return uri5;
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
