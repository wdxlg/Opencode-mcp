// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/equals.ts
import { equals } from "./module-0007.mjs";


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
    for (let i2 = 0; i2 < a.length; i2++) {
      if (!structuralEquals(a[i2], b[i2])) {
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
      for (const key3 of keysA) {
        if (!keysBSet.has(key3)) {
          return false;
        }
        if (!structuralEquals(aObj[key3], bObj[key3])) {
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

function getStructuralKey(t2) {
  return JSON.stringify(toNormalizedJsonStructure(t2));
}

var objectId = 0;

var objIds = /* @__PURE__ */ new WeakMap();

function toNormalizedJsonStructure(t2) {
  if (Array.isArray(t2)) {
    return t2.map(toNormalizedJsonStructure);
  }
  if (t2 && typeof t2 === "object") {
    if (Object.getPrototypeOf(t2) === Object.prototype) {
      const tObj = t2;
      const res = /* @__PURE__ */ Object.create(null);
      for (const key3 of Object.keys(tObj).sort()) {
        res[key3] = toNormalizedJsonStructure(tObj[key3]);
      }
      return res;
    } else {
      let objId = objIds.get(t2);
      if (objId === void 0) {
        objId = objectId++;
        objIds.set(t2, objId);
      }
      return objId + "----2b76a038c20c4bcc";
    }
  }
  return t2;
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

var equals3;

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
})(equals3 || (equals3 = {}));
export { strictEquals, strictEqualsC, arrayEquals, arrayEqualsC, structuralEquals, structuralEqualsC, getStructuralKey, toNormalizedJsonStructure, jsonStringifyEquals, jsonStringifyEqualsC, thisEqualsC, equalsIfDefined, equalsIfDefinedC, objectId, objIds, equals3 };
