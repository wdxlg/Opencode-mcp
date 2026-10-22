// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/base/common/uriIpc.ts
import { URI } from "./module-0024.mjs";
import { VSBuffer } from "./module-0031.mjs";


// src/vs/base/common/uriIpc.ts
var DefaultURITransformer = new class {
  transformIncoming(uri) {
    return uri;
  }
  transformOutgoing(uri) {
    return uri;
  }
  transformOutgoingURI(uri) {
    return uri;
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
        const r = _transformIncomingURIs(obj[key], transformer, revive2, depth + 1);
        if (r !== null) {
          obj[key] = r;
        }
      }
    }
  }
  return null;
}

function transformAndReviveIncomingURIs(obj, transformer) {
  const result = _transformIncomingURIs(obj, transformer, true, 0);
  if (result === null) {
    return obj;
  }
  return result;
}
export { _transformIncomingURIs, transformAndReviveIncomingURIs, DefaultURITransformer };
