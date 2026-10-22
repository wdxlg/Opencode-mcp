// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/diagnostic.ts
import { Range4 } from "./module-0900.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0897.mjs";
import { equals } from "./module-0007.mjs";


// src/vs/workbench/api/common/extHostTypes/diagnostic.ts
var DiagnosticSeverity = /* @__PURE__ */ ((DiagnosticSeverity3) => {
  DiagnosticSeverity3[DiagnosticSeverity3["Hint"] = 3] = "Hint";
  DiagnosticSeverity3[DiagnosticSeverity3["Information"] = 2] = "Information";
  DiagnosticSeverity3[DiagnosticSeverity3["Warning"] = 1] = "Warning";
  DiagnosticSeverity3[DiagnosticSeverity3["Error"] = 0] = "Error";
  return DiagnosticSeverity3;
})(DiagnosticSeverity || {});

var DiagnosticRelatedInformation = class {
  static is(thing) {
    if (!thing) {
      return false;
    }
    return typeof thing.message === "string" && thing.location && Range4.isRange(thing.location.range) && URI.isUri(thing.location.uri);
  }
  constructor(location2, message) {
    this.location = location2;
    this.message = message;
  }
  static isEqual(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.message === b.message && a.location.range.isEqual(b.location.range) && a.location.uri.toString() === b.location.uri.toString();
  }
};

DiagnosticRelatedInformation = __decorateClass([
  es5ClassCompat
], DiagnosticRelatedInformation);

var Diagnostic = class {
  constructor(range2, message, severity = 0 /* Error */) {
    if (!Range4.isRange(range2)) {
      throw new TypeError("range must be set");
    }
    if (!message) {
      throw new TypeError("message must be set");
    }
    this.range = range2;
    this.message = message;
    this.severity = severity;
  }
  toJSON() {
    return {
      severity: DiagnosticSeverity[this.severity],
      message: this.message,
      range: this.range,
      source: this.source,
      code: this.code
    };
  }
  static isEqual(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.message === b.message && a.severity === b.severity && a.code === b.code && a.severity === b.severity && a.source === b.source && a.range.isEqual(b.range) && equals(a.tags, b.tags) && equals(a.relatedInformation, b.relatedInformation, DiagnosticRelatedInformation.isEqual);
  }
};

Diagnostic = __decorateClass([
  es5ClassCompat
], Diagnostic);
export { DiagnosticSeverity, DiagnosticRelatedInformation, Diagnostic };
