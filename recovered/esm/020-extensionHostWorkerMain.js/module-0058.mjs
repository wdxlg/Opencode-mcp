// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/severity.ts
import { equalsIgnoreCase } from "./module-0029.mjs";


// src/vs/base/common/severity.ts
var Severity = /* @__PURE__ */ ((Severity3) => {
  Severity3[Severity3["Ignore"] = 0] = "Ignore";
  Severity3[Severity3["Info"] = 1] = "Info";
  Severity3[Severity3["Warning"] = 2] = "Warning";
  Severity3[Severity3["Error"] = 3] = "Error";
  return Severity3;
})(Severity || {});

((Severity3) => {
  const _error = "error";
  const _warning = "warning";
  const _warn = "warn";
  const _info = "info";
  const _ignore = "ignore";
  function fromValue(value) {
    if (!value) {
      return 0 /* Ignore */;
    }
    if (equalsIgnoreCase(_error, value)) {
      return 3 /* Error */;
    }
    if (equalsIgnoreCase(_warning, value) || equalsIgnoreCase(_warn, value)) {
      return 2 /* Warning */;
    }
    if (equalsIgnoreCase(_info, value)) {
      return 1 /* Info */;
    }
    return 0 /* Ignore */;
  }
  Severity3.fromValue = fromValue;
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
  Severity3.toString = toString;
})(Severity || (Severity = {}));

var severity_default = Severity;
export { Severity, severity_default };
