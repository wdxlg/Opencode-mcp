// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/uriIpc.ts
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";


// src/vs/base/common/uriIpc.ts
function toJSON(uri4) {
  return uri4.toJSON();
}

var URITransformer = class {
  constructor(uriTransformer) {
    this._uriTransformer = uriTransformer;
  }
  transformIncoming(uri4) {
    const result = this._uriTransformer.transformIncoming(uri4);
    return result === uri4 ? uri4 : toJSON(URI.from(result));
  }
  transformOutgoing(uri4) {
    const result = this._uriTransformer.transformOutgoing(uri4);
    return result === uri4 ? uri4 : toJSON(URI.from(result));
  }
  transformOutgoingURI(uri4) {
    const result = this._uriTransformer.transformOutgoing(uri4);
    return result === uri4 ? uri4 : URI.from(result);
  }
  transformOutgoingScheme(scheme) {
    return this._uriTransformer.transformOutgoingScheme(scheme);
  }
};

var DefaultURITransformer = new class {
  transformIncoming(uri4) {
    return uri4;
  }
  transformOutgoing(uri4) {
    return uri4;
  }
  transformOutgoingURI(uri4) {
    return uri4;
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
    for (const key3 in obj) {
      if (Object.hasOwnProperty.call(obj, key3)) {
        const r2 = _transformIncomingURIs(obj[key3], transformer, revive2, depth + 1);
        if (r2 !== null) {
          obj[key3] = r2;
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
