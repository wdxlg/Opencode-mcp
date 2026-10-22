// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/debug/node/telemetryApp.js
// Original module marker: src/vs/base/common/types.ts



// src/vs/base/common/types.ts
function isString(str) {
  return typeof str === "string";
}

function isObject(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && !(obj instanceof RegExp) && !(obj instanceof Date);
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

var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmptyObject(obj) {
  if (!isObject(obj)) {
    return false;
  }
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}

function isFunction(obj) {
  return typeof obj === "function";
}
export { isString, isObject, isIterable, isUndefined, isUndefinedOrNull, isEmptyObject, isFunction, hasOwnProperty };
