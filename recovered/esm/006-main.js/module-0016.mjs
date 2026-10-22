// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/types.ts
import { assert, init_assert } from "./module-0015.mjs";
import { __esm } from "./module-0000.mjs";


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

function isUndefinedOrNull(obj) {
  return isUndefined(obj) || obj === null;
}

function assertType(condition, type3) {
  if (!condition) {
    throw new Error(type3 ? `Unexpected type, expected '${type3}'` : "Unexpected type");
  }
}

function assertReturnsDefined(arg) {
  assert(
    arg !== null && arg !== void 0,
    "Argument is `undefined` or `null`."
  );
  return arg;
}

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

function upcast(x) {
  return x;
}

function hasKey(x, key) {
  for (const k in key) {
    if (!(k in x)) {
      return false;
    }
  }
  return true;
}

var hasOwnProperty;

var init_types = __esm({
  "src/vs/base/common/types.ts"() {
    init_assert();
    hasOwnProperty = Object.prototype.hasOwnProperty;
  }
});
export { isString, isObject, isTypedArray, isNumber, isIterable, isBoolean, isUndefined, isUndefinedOrNull, assertType, assertReturnsDefined, isEmptyObject, isFunction, upcast, hasKey, hasOwnProperty, init_types };
