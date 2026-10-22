// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/symbolInformation.ts
import { Location2 } from "./module-0903.mjs";
import { Range4 } from "./module-0900.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0897.mjs";


// src/vs/workbench/api/common/extHostTypes/symbolInformation.ts
var SymbolKind2 = /* @__PURE__ */ ((SymbolKind8) => {
  SymbolKind8[SymbolKind8["File"] = 0] = "File";
  SymbolKind8[SymbolKind8["Module"] = 1] = "Module";
  SymbolKind8[SymbolKind8["Namespace"] = 2] = "Namespace";
  SymbolKind8[SymbolKind8["Package"] = 3] = "Package";
  SymbolKind8[SymbolKind8["Class"] = 4] = "Class";
  SymbolKind8[SymbolKind8["Method"] = 5] = "Method";
  SymbolKind8[SymbolKind8["Property"] = 6] = "Property";
  SymbolKind8[SymbolKind8["Field"] = 7] = "Field";
  SymbolKind8[SymbolKind8["Constructor"] = 8] = "Constructor";
  SymbolKind8[SymbolKind8["Enum"] = 9] = "Enum";
  SymbolKind8[SymbolKind8["Interface"] = 10] = "Interface";
  SymbolKind8[SymbolKind8["Function"] = 11] = "Function";
  SymbolKind8[SymbolKind8["Variable"] = 12] = "Variable";
  SymbolKind8[SymbolKind8["Constant"] = 13] = "Constant";
  SymbolKind8[SymbolKind8["String"] = 14] = "String";
  SymbolKind8[SymbolKind8["Number"] = 15] = "Number";
  SymbolKind8[SymbolKind8["Boolean"] = 16] = "Boolean";
  SymbolKind8[SymbolKind8["Array"] = 17] = "Array";
  SymbolKind8[SymbolKind8["Object"] = 18] = "Object";
  SymbolKind8[SymbolKind8["Key"] = 19] = "Key";
  SymbolKind8[SymbolKind8["Null"] = 20] = "Null";
  SymbolKind8[SymbolKind8["EnumMember"] = 21] = "EnumMember";
  SymbolKind8[SymbolKind8["Struct"] = 22] = "Struct";
  SymbolKind8[SymbolKind8["Event"] = 23] = "Event";
  SymbolKind8[SymbolKind8["Operator"] = 24] = "Operator";
  SymbolKind8[SymbolKind8["TypeParameter"] = 25] = "TypeParameter";
  return SymbolKind8;
})(SymbolKind2 || {});

var SymbolInformation = class {
  static validate(candidate) {
    if (!candidate.name) {
      throw new Error("name must not be falsy");
    }
  }
  constructor(name, kind, rangeOrContainer, locationOrUri, containerName) {
    this.name = name;
    this.kind = kind;
    this.containerName = containerName;
    if (typeof rangeOrContainer === "string") {
      this.containerName = rangeOrContainer;
    }
    if (locationOrUri instanceof Location2) {
      this.location = locationOrUri;
    } else if (rangeOrContainer instanceof Range4) {
      this.location = new Location2(locationOrUri, rangeOrContainer);
    }
    SymbolInformation.validate(this);
  }
  toJSON() {
    return {
      name: this.name,
      kind: SymbolKind2[this.kind],
      location: this.location,
      containerName: this.containerName
    };
  }
};

SymbolInformation = __decorateClass([
  es5ClassCompat
], SymbolInformation);
export { SymbolKind2, SymbolInformation };
