// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/severity.ts
import { equalsIgnoreCase } from "./module-0030.mjs";


// src/vs/base/common/severity.ts
var Severity = /* @__PURE__ */ ((Severity4) => {
  Severity4[Severity4["Ignore"] = 0] = "Ignore";
  Severity4[Severity4["Info"] = 1] = "Info";
  Severity4[Severity4["Warning"] = 2] = "Warning";
  Severity4[Severity4["Error"] = 3] = "Error";
  return Severity4;
})(Severity || {});

((Severity4) => {
  const _error = "error";
  const _warning = "warning";
  const _warn = "warn";
  const _info = "info";
  const _ignore = "ignore";
  function fromValue(value2) {
    if (!value2) {
      return 0 /* Ignore */;
    }
    if (equalsIgnoreCase(_error, value2)) {
      return 3 /* Error */;
    }
    if (equalsIgnoreCase(_warning, value2) || equalsIgnoreCase(_warn, value2)) {
      return 2 /* Warning */;
    }
    if (equalsIgnoreCase(_info, value2)) {
      return 1 /* Info */;
    }
    return 0 /* Ignore */;
  }
  Severity4.fromValue = fromValue;
  function toString(severity) {
    switch (severity) {
      case 3 /* Error */:
        return _error;
      case 2 /* Warning */:
        return _warning;
      case 1 /* Info */:
        return _info;
      default:
        return _ignore;
    }
  }
  Severity4.toString = toString;
})(Severity || (Severity = {}));

var severity_default = Severity;
export { Severity, severity_default };
