// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/history/browser/historyWidgetKeybindingHint.ts



// src/vs/platform/history/browser/historyWidgetKeybindingHint.ts
function showHistoryKeybindingHint(keybindingService) {
  return keybindingService.lookupKeybinding("history.showPrevious")?.getElectronAccelerator() === "Up" && keybindingService.lookupKeybinding("history.showNext")?.getElectronAccelerator() === "Down";
}
export { showHistoryKeybindingHint };
