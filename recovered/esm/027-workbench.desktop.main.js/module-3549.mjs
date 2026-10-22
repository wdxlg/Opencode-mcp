// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedColors.ts
import { darken, lighten, registerColor } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { editorWidgetBackground } from "./module-0229.mjs";
import { contrastBorder, textLinkForeground } from "./module-0227.mjs";
import { inputBackground } from "./module-0233.mjs";


// src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedColors.ts
var welcomePageBackground = registerColor("welcomePage.background", null, localize(21949, null));

var welcomePageTileBackground = registerColor("welcomePage.tileBackground", { dark: editorWidgetBackground, light: editorWidgetBackground, hcDark: "#000", hcLight: editorWidgetBackground }, localize(21952, null));

var welcomePageTileHoverBackground = registerColor("welcomePage.tileHoverBackground", { dark: lighten(editorWidgetBackground, 0.2), light: darken(editorWidgetBackground, 0.1), hcDark: null, hcLight: null }, localize(21954, null));

var welcomePageTileBorder = registerColor("welcomePage.tileBorder", { dark: "#ffffff1a", light: "#0000001a", hcDark: contrastBorder, hcLight: contrastBorder }, localize(21953, null));

var welcomePageProgressBackground = registerColor("welcomePage.progress.background", inputBackground, localize(21950, null));

var welcomePageProgressForeground = registerColor("welcomePage.progress.foreground", textLinkForeground, localize(21951, null));

var walkthroughStepTitleForeground = registerColor("walkthrough.stepTitle.foreground", { light: "#000000", dark: "#ffffff", hcDark: null, hcLight: null }, localize(21948, null));
export { welcomePageBackground, welcomePageTileBackground, welcomePageTileHoverBackground, welcomePageTileBorder, welcomePageProgressBackground, welcomePageProgressForeground, walkthroughStepTitleForeground };
