// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/diagnostics/common/diagnostics.ts
import { createDecorator } from "./module-0042.mjs";


// src/vs/platform/diagnostics/common/diagnostics.ts
var ID = "diagnosticsService";

var IDiagnosticsService = createDecorator(ID);

function isRemoteDiagnosticError(x) {
  const candidate = x;
  return !!candidate?.hostName && !!candidate?.errorMessage;
}
export { isRemoteDiagnosticError, ID, IDiagnosticsService };
