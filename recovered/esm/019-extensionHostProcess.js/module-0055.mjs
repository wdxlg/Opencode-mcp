// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/uriIpc.ts
import { URI } from "./module-0025.mjs";
import { VSBuffer } from "./module-0031.mjs";


// src/vs/base/common/uriIpc.ts
function toJSON(uri2) {
  return uri2.toJSON();
}

var URITransformer = class {
  constructor(uriTransformer) {
    this._uriTransformer = uriTransformer;
  }
  transformIncoming(uri2) {
    const result = this._uriTransformer.transformIncoming(uri2);
    return result === uri2 ? uri2 : toJSON(URI.from(result));
  }
  transformOutgoing(uri2) {
    const result = this._uriTransformer.transformOutgoing(uri2);
    return result === uri2 ? uri2 : toJSON(URI.from(result));
  }
  transformOutgoingURI(uri2) {
    const result = this._uriTransformer.transformOutgoing(uri2);
    return result === uri2 ? uri2 : URI.from(result);
  }
  transformOutgoingScheme(scheme) {
    return this._uriTransformer.transformOutgoingScheme(scheme);
  }
};

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
export { toJSON, _transformIncomingURIs, transformIncomingURIs, transformAndReviveIncomingURIs, URITransformer, DefaultURITransformer };
