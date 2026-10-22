// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/uriTransformer.ts
import { URITransformer } from "./module-0055.mjs";


// src/vs/base/common/uriTransformer.ts
function createRawURITransformer(remoteAuthority) {
  return {
    transformIncoming: (uri2) => {
      if (uri2.scheme === "vscode-remote") {
        return { scheme: "file", path: uri2.path, query: uri2.query, fragment: uri2.fragment };
      }
      if (uri2.scheme === "file") {
        return { scheme: "vscode-local", path: uri2.path, query: uri2.query, fragment: uri2.fragment };
      }
      return uri2;
    },
    transformOutgoing: (uri2) => {
      if (uri2.scheme === "file") {
        return { scheme: "vscode-remote", authority: remoteAuthority, path: uri2.path, query: uri2.query, fragment: uri2.fragment };
      }
      if (uri2.scheme === "vscode-local") {
        return { scheme: "file", path: uri2.path, query: uri2.query, fragment: uri2.fragment };
      }
      return uri2;
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
