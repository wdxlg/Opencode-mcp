// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/objects.ts
import { isObject, isTypedArray, isUndefinedOrNull } from "./module-0010.mjs";


// src/vs/base/common/objects.ts
function deepClone(obj) {
  if (!obj || typeof obj !== "object") {
    return obj;
  }
  if (obj instanceof RegExp) {
    return obj;
  }
  const result = Array.isArray(obj) ? [] : {};
  Object.entries(obj).forEach(([key3, value2]) => {
    result[key3] = value2 && typeof value2 === "object" ? deepClone(value2) : value2;
  });
  return result;
}

function deepFreeze(obj) {
  if (!obj || typeof obj !== "object") {
    return obj;
  }
  const stack = [obj];
  while (stack.length > 0) {
    const obj2 = stack.shift();
    Object.freeze(obj2);
    for (const key3 in obj2) {
      if (_hasOwnProperty.call(obj2, key3)) {
        const prop = obj2[key3];
        if (typeof prop === "object" && !Object.isFrozen(prop) && !isTypedArray(prop)) {
          stack.push(prop);
        }
      }
    }
  }
  return obj;
}

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function cloneAndChange(obj, changer) {
  return _cloneAndChange(obj, changer, /* @__PURE__ */ new Set());
}

function _cloneAndChange(obj, changer, seen) {
  if (isUndefinedOrNull(obj)) {
    return obj;
  }
  const changed = changer(obj);
  if (typeof changed !== "undefined") {
    return changed;
  }
  if (Array.isArray(obj)) {
    const r1 = [];
    for (const e4 of obj) {
      r1.push(_cloneAndChange(e4, changer, seen));
    }
    return r1;
  }
  if (isObject(obj)) {
    if (seen.has(obj)) {
      throw new Error("Cannot clone recursive data-structure");
    }
    seen.add(obj);
    const r2 = {};
    for (const i2 in obj) {
      if (_hasOwnProperty.call(obj, i2)) {
        r2[i2] = _cloneAndChange(obj[i2], changer, seen);
      }
    }
    seen.delete(obj);
    return r2;
  }
  return obj;
}

function mixin(destination, source, overwrite = true) {
  if (!isObject(destination)) {
    return source;
  }
  if (isObject(source)) {
    Object.keys(source).forEach((key3) => {
      if (key3 in destination) {
        if (overwrite) {
          if (isObject(destination[key3]) && isObject(source[key3])) {
            mixin(destination[key3], source[key3], overwrite);
          } else {
            destination[key3] = source[key3];
          }
        }
      } else {
        destination[key3] = source[key3];
      }
    });
  }
  return destination;
}

function equals4(one, other) {
  if (one === other) {
    return true;
  }
  if (one === null || one === void 0 || other === null || other === void 0) {
    return false;
  }
  if (typeof one !== typeof other) {
    return false;
  }
  if (typeof one !== "object") {
    return false;
  }
  if (Array.isArray(one) !== Array.isArray(other)) {
    return false;
  }
  let i2;
  let key3;
  if (Array.isArray(one)) {
    if (one.length !== other.length) {
      return false;
    }
    for (i2 = 0; i2 < one.length; i2++) {
      if (!equals4(one[i2], other[i2])) {
        return false;
      }
    }
  } else {
    const oneKeys = [];
    for (key3 in one) {
      oneKeys.push(key3);
    }
    oneKeys.sort();
    const otherKeys = [];
    for (key3 in other) {
      otherKeys.push(key3);
    }
    otherKeys.sort();
    if (!equals4(oneKeys, otherKeys)) {
      return false;
    }
    for (i2 = 0; i2 < oneKeys.length; i2++) {
      if (!equals4(one[oneKeys[i2]], other[oneKeys[i2]])) {
        return false;
      }
    }
  }
  return true;
}

function safeStringify(obj) {
  const seen = /* @__PURE__ */ new Set();
  return JSON.stringify(obj, (key3, value2) => {
    if (isObject(value2) || Array.isArray(value2)) {
      if (seen.has(value2)) {
        return "[Circular]";
      } else {
        seen.add(value2);
      }
    }
    if (typeof value2 === "bigint") {
      return `[BigInt ${value2.toString()}]`;
    }
    return value2;
  });
}

function stableStringify(value2) {
  if (value2 === void 0) {
    return "undefined";
  }
  try {
    return _stableStringify(value2, /* @__PURE__ */ new WeakSet());
  } catch {
    return "";
  }
}

function _stableStringify(value2, seen) {
  if (value2 === null || typeof value2 !== "object") {
    return JSON.stringify(value2) ?? "null";
  }
  if (seen.has(value2)) {
    return '"[Circular]"';
  }
  seen.add(value2);
  let result;
  if (Array.isArray(value2)) {
    result = "[" + value2.map((v2) => _stableStringify(v2, seen)).join(",") + "]";
  } else {
    const keys = Object.keys(value2).sort();
    const parts = [];
    for (const k of keys) {
      const v2 = value2[k];
      if (v2 === void 0) {
        continue;
      }
      parts.push(JSON.stringify(k) + ":" + _stableStringify(v2, seen));
    }
    result = "{" + parts.join(",") + "}";
  }
  seen.delete(value2);
  return result;
}

function distinct2(base, target) {
  const result = /* @__PURE__ */ Object.create(null);
  if (!base || !target) {
    return result;
  }
  const targetKeys = Object.keys(target);
  targetKeys.forEach((k) => {
    const baseValue = base[k];
    const targetValue = target[k];
    if (!equals4(baseValue, targetValue)) {
      result[k] = targetValue;
    }
  });
  return result;
}

function filter(obj, predicate) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const [key3, value2] of Object.entries(obj)) {
    if (predicate(key3, value2)) {
      result[key3] = value2;
    }
  }
  return result;
}

function mapValues(obj, fn) {
  const result = {};
  for (const [key3, value2] of Object.entries(obj)) {
    result[key3] = fn(value2, key3);
  }
  return result;
}
export { deepClone, deepFreeze, cloneAndChange, _cloneAndChange, mixin, equals4, safeStringify, stableStringify, _stableStringify, distinct2, filter, mapValues, _hasOwnProperty };
