// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/files/node/watcher/watcherMain.js
// Original module marker: src/vs/base/common/types.ts



// src/vs/base/common/types.ts
function isString(str) {
  return typeof str === "string";
}

function isNumber(obj) {
  return typeof obj === "number" && !isNaN(obj);
}

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

function isFunction(obj) {
  return typeof obj === "function";
}
export { isString, isNumber, isIterable, isUndefined, isUndefinedOrNull, assertType, isFunction };
