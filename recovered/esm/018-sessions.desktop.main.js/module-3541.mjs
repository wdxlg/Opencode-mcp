// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/newChatPickerTelemetry.ts



// src/vs/sessions/contrib/chat/browser/newChatPickerTelemetry.ts
function reportNewChatPickerClosed(telemetryService, data) {
  telemetryService.publicLog2(
    "newChatPickerClosed",
    {
      id: data.id,
      name: data.name,
      selectionChanged: data.optionIdBefore !== data.optionIdAfter,
      optionIdBefore: data.isPII ? void 0 : data.optionIdBefore,
      optionIdAfter: data.isPII ? void 0 : data.optionIdAfter,
      optionLabelBefore: data.isPII ? void 0 : data.optionLabelBefore,
      optionLabelAfter: data.isPII ? void 0 : data.optionLabelAfter
    }
  );
}
export { reportNewChatPickerClosed };
