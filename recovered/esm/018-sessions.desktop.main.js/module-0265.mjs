// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/marshalling.ts
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";


// src/vs/base/common/marshalling.ts
function stringify(obj) {
  return JSON.stringify(obj, replacer);
}

function parse2(text2) {
  let data = JSON.parse(text2);
  data = revive(data);
  return data;
}

function replacer(key3, value2) {
  if (value2 instanceof RegExp) {
    return {
      $mid: 2 /* Regexp */,
      source: value2.source,
      flags: value2.flags
    };
  }
  return value2;
}

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
      for (let i2 = 0; i2 < obj.length; ++i2) {
        obj[i2] = revive(obj[i2], depth + 1);
      }
    } else {
      for (const key3 in obj) {
        if (Object.hasOwnProperty.call(obj, key3)) {
          obj[key3] = revive(obj[key3], depth + 1);
        }
      }
    }
  }
  return obj;
}
export { stringify, parse2, replacer, revive };
