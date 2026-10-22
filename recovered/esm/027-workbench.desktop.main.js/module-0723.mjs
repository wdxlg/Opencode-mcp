// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/telemetry.ts



// src/vs/editor/contrib/inlineCompletions/browser/telemetry.ts
function sendInlineCompletionsEndOfLifeTelemetry(dataChannel, endOfLifeSummary) {
  dataChannel.publicLog2("inlineCompletion.endOfLife", endOfLifeSummary);
}
export { sendInlineCompletionsEndOfLifeTelemetry };
