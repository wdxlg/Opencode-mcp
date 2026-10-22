// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/zoom/common/terminal.zoom.ts
import { isMacintosh } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminalContrib/zoom/common/terminal.zoom.ts
var terminalZoomConfiguration = {
  ["terminal.integrated.mouseWheelZoom" /* MouseWheelZoom */]: {
    markdownDescription: isMacintosh ? localize(20989, null) : localize(20988, null),
    type: "boolean",
    default: false
  }
};
export { terminalZoomConfiguration };
