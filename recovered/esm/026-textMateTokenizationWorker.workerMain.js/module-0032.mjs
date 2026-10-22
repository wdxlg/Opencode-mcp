// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js
// Original module marker: src/vs/base/common/equals.ts
import { equals } from "./module-0008.mjs";


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

function equalsIfDefined(v1, v2, equals3) {
  if (v1 === void 0 || v1 === null || v2 === void 0 || v2 === null) {
    return v2 === v1;
  }
  return equals3(v1, v2);
}

function equalsIfDefinedC(equals3) {
  return (v1, v2) => {
    if (v1 === void 0 || v1 === null || v2 === void 0 || v2 === null) {
      return v2 === v1;
    }
    return equals3(v1, v2);
  };
}

var equals2;

((equals3) => {
  equals3.strict = strictEquals;
  equals3.strictC = strictEqualsC;
  equals3.array = arrayEquals;
  equals3.arrayC = arrayEqualsC;
  equals3.structural = structuralEquals;
  equals3.structuralC = structuralEqualsC;
  equals3.jsonStringify = jsonStringifyEquals;
  equals3.jsonStringifyC = jsonStringifyEqualsC;
  equals3.thisC = thisEqualsC;
  equals3.ifDefined = equalsIfDefined;
  equals3.ifDefinedC = equalsIfDefinedC;
})(equals2 || (equals2 = {}));
export { strictEquals, strictEqualsC, arrayEquals, arrayEqualsC, structuralEquals, structuralEqualsC, jsonStringifyEquals, jsonStringifyEqualsC, thisEqualsC, equalsIfDefined, equalsIfDefinedC, equals2 };
