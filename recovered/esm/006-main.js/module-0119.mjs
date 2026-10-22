// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/diagnostics/common/diagnostics.ts
import { __esm } from "./module-0000.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/diagnostics/common/diagnostics.ts
function isRemoteDiagnosticError(x) {
  const candidate = x;
  return !!candidate?.hostName && !!candidate?.errorMessage;
}

var ID, IDiagnosticsService;

var init_diagnostics = __esm({
  "src/vs/platform/diagnostics/common/diagnostics.ts"() {
    init_instantiation();
    ID = "diagnosticsService";
    IDiagnosticsService = createDecorator(ID);
  }
});
export { isRemoteDiagnosticError, ID, IDiagnosticsService, init_diagnostics };
