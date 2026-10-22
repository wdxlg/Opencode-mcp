// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/common/types.ts



// src/vs/base/common/types.ts
function isString(str2) {
  return typeof str2 === "string";
}

function isStringArray(value) {
  return isArrayOf(value, isString);
}

function isArrayOf(value, check) {
  return Array.isArray(value) && value.every(check);
}

function isObject(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && !(obj instanceof RegExp) && !(obj instanceof Date);
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

function assertType(condition, type) {
  if (!condition) {
    throw new Error(type ? `Unexpected type, expected '${type}'` : "Unexpected type");
  }
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

function hasKey(x2, key) {
  for (const k in key) {
    if (!(k in x2)) {
      return false;
    }
  }
  return true;
}
export { isString, isStringArray, isArrayOf, isObject, isNumber, isIterable, isBoolean, isUndefined, isDefined, isUndefinedOrNull, assertType, isEmptyObject, isFunction, hasKey, hasOwnProperty };
