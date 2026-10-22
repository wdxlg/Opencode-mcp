// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/telemetry/common/editTelemetry.ts



// src/vs/platform/telemetry/common/editTelemetry.ts
function sendEditSourcesDetailsTelemetry(telemetryService, data) {
  telemetryService.publicLog2("editTelemetry.editSources.details", data);
}

function sendEditSourcesStatsTelemetry(telemetryService, data) {
  telemetryService.publicLog2("editTelemetry.editSources.stats", data);
}
export { sendEditSourcesDetailsTelemetry, sendEditSourcesStatsTelemetry };
