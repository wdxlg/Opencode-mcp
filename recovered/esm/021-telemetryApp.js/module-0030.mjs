// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/debug/node/telemetryApp.js
// Original module marker: src/vs/base/common/objects.ts
import { isObject } from "./module-0009.mjs";


// src/vs/base/common/objects.ts
function mixin(destination, source, overwrite = true) {
  if (!isObject(destination)) {
    return source;
  }
  if (isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (key in destination) {
        if (overwrite) {
          if (isObject(destination[key]) && isObject(source[key])) {
            mixin(destination[key], source[key], overwrite);
          } else {
            destination[key] = source[key];
          }
        }
      } else {
        destination[key] = source[key];
      }
    });
  }
  return destination;
}

function safeStringify(obj) {
  const seen = /* @__PURE__ */ new Set();
  return JSON.stringify(obj, (key, value) => {
    if (isObject(value) || Array.isArray(value)) {
      if (seen.has(value)) {
        return "[Circular]";
      } else {
        seen.add(value);
      }
    }
    if (typeof value === "bigint") {
      return `[BigInt ${value.toString()}]`;
    }
    return value;
  });
}
export { mixin, safeStringify };
