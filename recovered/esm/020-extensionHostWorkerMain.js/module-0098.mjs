// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/equals.ts
import { equals } from "./module-0004.mjs";


// src/vs/base/common/equals.ts
function strictEquals(a, b) {
  return a === b;
}

function strictEqualsC() {
  return (a, b) => a === b;
}

function arrayEquals(a, b, itemEquals) {
  return equals(a, b, itemEquals ?? strictEquals);
}

function arrayEqualsC(itemEquals) {
  return (a, b) => equals(a, b, itemEquals ?? strictEquals);
}

function structuralEquals(a, b) {
  if (a === b) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!structuralEquals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  if (a && typeof a === "object" && b && typeof b === "object") {
    if (Object.getPrototypeOf(a) === Object.prototype && Object.getPrototypeOf(b) === Object.prototype) {
      const aObj = a;
      const bObj = b;
      const keysA = Object.keys(aObj);
      const keysB = Object.keys(bObj);
      const keysBSet = new Set(keysB);
      if (keysA.length !== keysB.length) {
        return false;
      }
      for (const key of keysA) {
        if (!keysBSet.has(key)) {
          return false;
        }
        if (!structuralEquals(aObj[key], bObj[key])) {
          return false;
        }
      }
      return true;
    }
  }
  return false;
}

function structuralEqualsC() {
  return (a, b) => structuralEquals(a, b);
}

function jsonStringifyEquals(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function jsonStringifyEqualsC() {
  return (a, b) => JSON.stringify(a) === JSON.stringify(b);
}

function thisEqualsC() {
  return (a, b) => a.equals(b);
}

function equalsIfDefined(v1, v2, equals5) {
  if (v1 === void 0 || v1 === null || v2 === void 0 || v2 === null) {
    return v2 === v1;
  }
  return equals5(v1, v2);
}

function equalsIfDefinedC(equals5) {
  return (v1, v2) => {
    if (v1 === void 0 || v1 === null || v2 === void 0 || v2 === null) {
      return v2 === v1;
    }
    return equals5(v1, v2);
  };
}

var equals4;

((equals5) => {
  equals5.strict = strictEquals;
  equals5.strictC = strictEqualsC;
  equals5.array = arrayEquals;
  equals5.arrayC = arrayEqualsC;
  equals5.structural = structuralEquals;
  equals5.structuralC = structuralEqualsC;
  equals5.jsonStringify = jsonStringifyEquals;
  equals5.jsonStringifyC = jsonStringifyEqualsC;
  equals5.thisC = thisEqualsC;
  equals5.ifDefined = equalsIfDefined;
  equals5.ifDefinedC = equalsIfDefinedC;
})(equals4 || (equals4 = {}));
export { strictEquals, strictEqualsC, arrayEquals, arrayEqualsC, structuralEquals, structuralEqualsC, jsonStringifyEquals, jsonStringifyEqualsC, thisEqualsC, equalsIfDefined, equalsIfDefinedC, equals4 };
