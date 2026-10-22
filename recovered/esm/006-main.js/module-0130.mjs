// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/severity.ts
import { __esm } from "./module-0000.mjs";
import { equalsIgnoreCase, init_strings } from "./module-0027.mjs";


// src/vs/base/common/severity.ts
var Severity, severity_default;

var init_severity = __esm({
  "src/vs/base/common/severity.ts"() {
    init_strings();
    Severity = /* @__PURE__ */ ((Severity2) => {
      Severity2[Severity2["Ignore"] = 0] = "Ignore";
      Severity2[Severity2["Info"] = 1] = "Info";
      Severity2[Severity2["Warning"] = 2] = "Warning";
      Severity2[Severity2["Error"] = 3] = "Error";
      return Severity2;
    })(Severity || {});
    ((Severity2) => {
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
      Severity2.fromValue = fromValue;
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
      Severity2.toString = toString;
    })(Severity || (Severity = {}));
    severity_default = Severity;
  }
});
export { Severity, severity_default, init_severity };
