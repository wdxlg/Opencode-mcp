// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/verifier.ts
import { isObject } from "./module-0010.mjs";


// src/vs/base/common/verifier.ts
var Verifier = class {
  constructor(defaultValue) {
    this.defaultValue = defaultValue;
  }
  verify(value2) {
    if (!this.isType(value2)) {
      return this.defaultValue;
    }
    return value2;
  }
};

var BooleanVerifier = class extends Verifier {
  isType(value2) {
    return typeof value2 === "boolean";
  }
};

var NumberVerifier = class extends Verifier {
  isType(value2) {
    return typeof value2 === "number";
  }
};

var SetVerifier = class extends Verifier {
  isType(value2) {
    return value2 instanceof Set;
  }
};

var EnumVerifier = class extends Verifier {
  constructor(defaultValue, allowedValues) {
    super(defaultValue);
    this.allowedValues = allowedValues;
  }
  isType(value2) {
    return this.allowedValues.includes(value2);
  }
};

var ObjectVerifier = class extends Verifier {
  constructor(defaultValue, verifier) {
    super(defaultValue);
    this.verifier = verifier;
  }
  verify(value2) {
    if (!this.isType(value2)) {
      return this.defaultValue;
    }
    return verifyObject(this.verifier, value2);
  }
  isType(value2) {
    return isObject(value2);
  }
};

function verifyObject(verifiers, value2) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const key3 in verifiers) {
    if (Object.hasOwnProperty.call(verifiers, key3)) {
      const verifier = verifiers[key3];
      result[key3] = verifier.verify(value2[key3]);
    }
  }
  return result;
}
export { verifyObject, Verifier, BooleanVerifier, NumberVerifier, SetVerifier, EnumVerifier, ObjectVerifier };
