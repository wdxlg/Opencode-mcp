// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/uriIpc.ts
import { URI } from "./module-0023.mjs";
import { VSBuffer } from "./module-0013.mjs";


// src/vs/base/common/uriIpc.ts
var DefaultURITransformer = new class {
  transformIncoming(uri2) {
    return uri2;
  }
  transformOutgoing(uri2) {
    return uri2;
  }
  transformOutgoingURI(uri2) {
    return uri2;
  }
  transformOutgoingScheme(scheme) {
    return scheme;
  }
}();

function _transformIncomingURIs(obj, transformer, revive2, depth) {
  if (!obj || depth > 200) {
    return null;
  }
  if (typeof obj === "object") {
    if (obj.$mid === 1 /* Uri */) {
      return revive2 ? URI.revive(transformer.transformIncoming(obj)) : transformer.transformIncoming(obj);
    }
    if (obj instanceof VSBuffer) {
      return null;
    }
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const r2 = _transformIncomingURIs(obj[key], transformer, revive2, depth + 1);
        if (r2 !== null) {
          obj[key] = r2;
        }
      }
    }
  }
  return null;
}

function transformIncomingURIs(obj, transformer) {
  const result = _transformIncomingURIs(obj, transformer, false, 0);
  if (result === null) {
    return obj;
  }
  return result;
}

function transformAndReviveIncomingURIs(obj, transformer) {
  const result = _transformIncomingURIs(obj, transformer, true, 0);
  if (result === null) {
    return obj;
  }
  return result;
}
export { _transformIncomingURIs, transformIncomingURIs, transformAndReviveIncomingURIs, DefaultURITransformer };
