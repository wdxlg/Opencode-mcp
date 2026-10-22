// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/browserView/common/browserViewTelemetry.ts
import { __esm } from "./module-0000.mjs";


// src/vs/platform/browserView/common/browserViewTelemetry.ts
function logBrowserOpen(telemetryService, source) {
  telemetryService.publicLog2(
    "integratedBrowser.open",
    { source }
  );
}

var init_browserViewTelemetry = __esm({
  "src/vs/platform/browserView/common/browserViewTelemetry.ts"() {
  }
});
export { logBrowserOpen, init_browserViewTelemetry };
