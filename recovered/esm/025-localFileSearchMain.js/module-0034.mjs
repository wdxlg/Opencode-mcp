// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/search/worker/localFileSearchMain.js
// Original module marker: src/vs/base/common/marshalling.ts
import { URI } from "./module-0023.mjs";
import { VSBuffer } from "./module-0033.mjs";


// src/vs/base/common/marshalling.ts
function revive(obj, depth = 0) {
  if (!obj || depth > 200) {
    return obj;
  }
  if (typeof obj === "object") {
    switch (obj.$mid) {
      // eslint-disable-next-line local/code-no-any-casts
      case 1 /* Uri */:
        return URI.revive(obj);
      // eslint-disable-next-line local/code-no-any-casts
      case 2 /* Regexp */:
        return new RegExp(obj.source, obj.flags);
      // eslint-disable-next-line local/code-no-any-casts
      case 17 /* Date */:
        return new Date(obj.source);
    }
    if (obj instanceof VSBuffer || obj instanceof Uint8Array) {
      return obj;
    }
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; ++i) {
        obj[i] = revive(obj[i], depth + 1);
      }
    } else {
      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          obj[key] = revive(obj[key], depth + 1);
        }
      }
    }
  }
  return obj;
}
export { revive };
