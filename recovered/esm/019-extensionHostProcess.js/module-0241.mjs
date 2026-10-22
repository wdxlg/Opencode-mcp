// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/symbolInformation.ts
import { Location2 } from "./module-0236.mjs";
import { Range2 } from "./module-0233.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0230.mjs";


// src/vs/workbench/api/common/extHostTypes/symbolInformation.ts
var SymbolKind2 = /* @__PURE__ */ ((SymbolKind5) => {
  SymbolKind5[SymbolKind5["File"] = 0] = "File";
  SymbolKind5[SymbolKind5["Module"] = 1] = "Module";
  SymbolKind5[SymbolKind5["Namespace"] = 2] = "Namespace";
  SymbolKind5[SymbolKind5["Package"] = 3] = "Package";
  SymbolKind5[SymbolKind5["Class"] = 4] = "Class";
  SymbolKind5[SymbolKind5["Method"] = 5] = "Method";
  SymbolKind5[SymbolKind5["Property"] = 6] = "Property";
  SymbolKind5[SymbolKind5["Field"] = 7] = "Field";
  SymbolKind5[SymbolKind5["Constructor"] = 8] = "Constructor";
  SymbolKind5[SymbolKind5["Enum"] = 9] = "Enum";
  SymbolKind5[SymbolKind5["Interface"] = 10] = "Interface";
  SymbolKind5[SymbolKind5["Function"] = 11] = "Function";
  SymbolKind5[SymbolKind5["Variable"] = 12] = "Variable";
  SymbolKind5[SymbolKind5["Constant"] = 13] = "Constant";
  SymbolKind5[SymbolKind5["String"] = 14] = "String";
  SymbolKind5[SymbolKind5["Number"] = 15] = "Number";
  SymbolKind5[SymbolKind5["Boolean"] = 16] = "Boolean";
  SymbolKind5[SymbolKind5["Array"] = 17] = "Array";
  SymbolKind5[SymbolKind5["Object"] = 18] = "Object";
  SymbolKind5[SymbolKind5["Key"] = 19] = "Key";
  SymbolKind5[SymbolKind5["Null"] = 20] = "Null";
  SymbolKind5[SymbolKind5["EnumMember"] = 21] = "EnumMember";
  SymbolKind5[SymbolKind5["Struct"] = 22] = "Struct";
  SymbolKind5[SymbolKind5["Event"] = 23] = "Event";
  SymbolKind5[SymbolKind5["Operator"] = 24] = "Operator";
  SymbolKind5[SymbolKind5["TypeParameter"] = 25] = "TypeParameter";
  return SymbolKind5;
})(SymbolKind2 || {});

var SymbolTag = /* @__PURE__ */ ((SymbolTag4) => {
  SymbolTag4[SymbolTag4["Deprecated"] = 1] = "Deprecated";
  return SymbolTag4;
})(SymbolTag || {});

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
    } else if (rangeOrContainer instanceof Range2) {
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
export { SymbolKind2, SymbolTag, SymbolInformation };
