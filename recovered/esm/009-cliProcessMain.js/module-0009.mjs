// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/base/common/types.ts
import { assert } from "./module-0008.mjs";


// src/vs/base/common/types.ts
function isString(str) {
  return typeof str === "string";
}

function isObject(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && !(obj instanceof RegExp) && !(obj instanceof Date);
}

function isTypedArray(obj) {
  const TypedArray = Object.getPrototypeOf(Uint8Array);
  return typeof obj === "object" && obj instanceof TypedArray;
}

function isNumber(obj) {
  return typeof obj === "number" && !isNaN(obj);
}

function isIterable(obj) {
  return !!obj && typeof obj[Symbol.iterator] === "function";
}

function isBoolean(obj) {
  return obj === true || obj === false;
}

function isUndefined(obj) {
  return typeof obj === "undefined";
}

function isDefined(arg) {
  return !isUndefinedOrNull(arg);
}

function isUndefinedOrNull(obj) {
  return isUndefined(obj) || obj === null;
}

function assertReturnsDefined(arg) {
  assert(
    arg !== null && arg !== void 0,
    "Argument is `undefined` or `null`."
  );
  return arg;
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

function hasKey(x, key) {
  for (const k in key) {
    if (!(k in x)) {
      return false;
    }
  }
  return true;
}
export { isString, isObject, isTypedArray, isNumber, isIterable, isBoolean, isUndefined, isDefined, isUndefinedOrNull, assertReturnsDefined, isEmptyObject, isFunction, hasKey, hasOwnProperty };
