// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/statusbar/browser/statusbar.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/services/statusbar/browser/statusbar.ts
var IStatusbarService = createDecorator("statusbarService");

function isStatusbarEntryLocation(thing) {
  const candidate = thing;
  return typeof candidate?.location?.id === "string" && typeof candidate.alignment === "number";
}

function isStatusbarEntryPriority(thing) {
  const candidate = thing;
  return (typeof candidate?.primary === "number" || isStatusbarEntryLocation(candidate?.primary)) && typeof candidate?.secondary === "number";
}

var ShowTooltipCommand = {
  id: "statusBar.entry.showTooltip",
  title: ""
};

var StatusbarEntryKinds = ["standard", "warning", "error", "prominent", "remote", "offline"];

function isTooltipWithCommands(thing) {
  const candidate = thing;
  return !!candidate?.content && Array.isArray(candidate?.commands);
}
export { isStatusbarEntryLocation, isStatusbarEntryPriority, isTooltipWithCommands, IStatusbarService, ShowTooltipCommand, StatusbarEntryKinds };
