// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/stickyScroll/browser/terminalStickyScrollColorRegistry.ts
import { registerColor } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminalContrib/stickyScroll/browser/terminalStickyScrollColorRegistry.ts
var terminalStickyScrollBackground = registerColor("terminalStickyScroll.background", null, localize(20845, null));

var terminalStickyScrollHoverBackground = registerColor("terminalStickyScrollHover.background", {
  dark: "#2A2D2E",
  light: "#F0F0F0",
  hcDark: "#E48B39",
  hcLight: "#0f4a85"
}, localize(20847, null));

registerColor("terminalStickyScroll.border", {
  dark: null,
  light: null,
  hcDark: "#6fc3df",
  hcLight: "#0f4a85"
}, localize(20846, null));
export { terminalStickyScrollBackground, terminalStickyScrollHoverBackground };
