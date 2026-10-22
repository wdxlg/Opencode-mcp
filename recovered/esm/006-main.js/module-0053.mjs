// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/marshalling.ts
import { URI, init_uri } from "./module-0030.mjs";
import { VSBuffer, init_buffer } from "./module-0050.mjs";
import { __esm } from "./module-0000.mjs";
import { init_marshallingIds } from "./module-0029.mjs";


// src/vs/base/common/marshalling.ts
function stringify(obj) {
  return JSON.stringify(obj, replacer);
}

function parse3(text) {
  let data = JSON.parse(text);
  data = revive(data);
  return data;
}

function replacer(key, value) {
  if (value instanceof RegExp) {
    return {
      $mid: 2 /* Regexp */,
      source: value.source,
      flags: value.flags
    };
  }
  return value;
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

var init_marshalling = __esm({
  "src/vs/base/common/marshalling.ts"() {
    init_buffer();
    init_uri();
    init_marshallingIds();
  }
});
export { stringify, parse3, replacer, revive, init_marshalling };
