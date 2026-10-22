// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/types.ts
import { assert } from "./module-0009.mjs";


// src/vs/base/common/types.ts
function isString(str) {
  return typeof str === "string";
}

function isStringArray(value2) {
  return isArrayOf(value2, isString);
}

function isArrayOf(value2, check) {
  return Array.isArray(value2) && value2.every(check);
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

function assertDefined(value2, error) {
  if (value2 === null || value2 === void 0) {
    const errorToThrow = typeof error === "string" ? new Error(error) : error;
    throw errorToThrow;
  }
}

function assertReturnsAllDefined(...args2) {
  const result = [];
  for (let i2 = 0; i2 < args2.length; i2++) {
    const arg = args2[i2];
    if (isUndefinedOrNull(arg)) {
      throw new Error(`Assertion Failed: argument at index ${i2} is undefined or null`);
    }
    result.push(arg);
  }
  return result;
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmptyObject(obj) {
  if (!isObject(obj)) {
    return false;
  }
  for (const key3 in obj) {
    if (hasOwnProperty.call(obj, key3)) {
      return false;
    }
  }
  return true;
}

function isFunction(obj) {
  return typeof obj === "function";
}

function areFunctions(...objects) {
  return objects.length > 0 && objects.every(isFunction);
}

function validateConstraints(args2, constraints) {
  const len = Math.min(args2.length, constraints.length);
  for (let i2 = 0; i2 < len; i2++) {
    validateConstraint(args2[i2], constraints[i2]);
  }
}

function validateConstraint(arg, constraint) {
  if (isString(constraint)) {
    if (typeof arg !== constraint) {
      throw new Error(`argument does not match constraint: typeof ${constraint}`);
    }
  } else if (isFunction(constraint)) {
    try {
      if (arg instanceof constraint) {
        return;
      }
    } catch {
    }
    if (!isUndefinedOrNull(arg) && arg.constructor === constraint) {
      return;
    }
    if (constraint.length === 1 && constraint.call(void 0, arg) === true) {
      return;
    }
    throw new Error(`argument does not match one of these constraints: arg instanceof constraint, arg.constructor === constraint, nor constraint(arg) === true`);
  }
}

function upcast(x) {
  return x;
}

function hasKey(x, key3) {
  for (const k in key3) {
    if (!(k in x)) {
      return false;
    }
  }
  return true;
}
export { isString, isStringArray, isArrayOf, isObject, isTypedArray, isNumber, isIterable, isBoolean, isUndefined, isDefined, isUndefinedOrNull, assertType, assertReturnsDefined, assertDefined, assertReturnsAllDefined, isEmptyObject, isFunction, areFunctions, validateConstraints, validateConstraint, upcast, hasKey, hasOwnProperty };
