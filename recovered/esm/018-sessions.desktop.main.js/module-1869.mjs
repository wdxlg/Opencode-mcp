// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugColors.ts
import { registerColor } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/debug/browser/debugColors.ts
var debugToolBarBackground = registerColor("debugToolBar.background", {
  dark: "#333333",
  light: "#F3F3F3",
  hcDark: "#000000",
  hcLight: "#FFFFFF"
}, localize(14394, null));

var debugToolBarBorder = registerColor("debugToolBar.border", null, localize(14395, null));

var debugIconStartForeground = registerColor("debugIcon.startForeground", {
  dark: "#89D185",
  light: "#388A34",
  hcDark: "#89D185",
  hcLight: "#388A34"
}, localize(14388, null));
export { debugToolBarBackground, debugToolBarBorder, debugIconStartForeground };
