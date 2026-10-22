// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/browserView/common/browserViewTelemetry.ts



// src/vs/platform/browserView/common/browserViewTelemetry.ts
function logBrowserOpen(telemetryService, source) {
  telemetryService.publicLog2(
    "integratedBrowser.open",
    { source }
  );
}
export { logBrowserOpen };
