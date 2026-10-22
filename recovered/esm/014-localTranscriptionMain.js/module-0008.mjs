// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/localTranscription/node/localTranscriptionMain.js
// Original module marker: src/vs/base/common/types.ts
import { assert } from "./module-0007.mjs";


// src/vs/base/common/types.ts
function isIterable(obj) {
  return !!obj && typeof obj[Symbol.iterator] === "function";
}

function isUndefined(obj) {
  return typeof obj === "undefined";
}

function isUndefinedOrNull(obj) {
  return isUndefined(obj) || obj === null;
}

function assertType(condition, type) {
  if (!condition) {
    throw new Error(type ? `Unexpected type, expected '${type}'` : "Unexpected type");
  }
}

function assertReturnsDefined(arg) {
  assert(
    arg !== null && arg !== void 0,
    "Argument is `undefined` or `null`."
  );
  return arg;
}

function isFunction(obj) {
  return typeof obj === "function";
}
export { isIterable, isUndefined, isUndefinedOrNull, assertType, assertReturnsDefined, isFunction };
