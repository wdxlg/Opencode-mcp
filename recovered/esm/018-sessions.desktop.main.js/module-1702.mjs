// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/diagnostics/common/diagnostics.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/diagnostics/common/diagnostics.ts
var ID2 = "diagnosticsService";

var IDiagnosticsService = createDecorator(ID2);

function isRemoteDiagnosticError(x) {
  const candidate = x;
  return !!candidate?.hostName && !!candidate?.errorMessage;
}
export { isRemoteDiagnosticError, ID2, IDiagnosticsService };
