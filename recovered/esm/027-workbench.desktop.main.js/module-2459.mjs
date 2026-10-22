// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/multiDiffEditor/colors.ts
import { registerColor } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { editorBackground } from "./module-0229.mjs";


// src/vs/editor/browser/widget/multiDiffEditor/colors.ts
var multiDiffEditorHeaderBackground = registerColor(
  "multiDiffEditor.headerBackground",
  { dark: "#262626", light: "tab.inactiveBackground", hcDark: "tab.inactiveBackground", hcLight: "tab.inactiveBackground" },
  localize(266, null)
);

var multiDiffEditorBackground = registerColor(
  "multiDiffEditor.background",
  editorBackground,
  localize(264, null)
);

var multiDiffEditorBorder = registerColor(
  "multiDiffEditor.border",
  { dark: "sideBarSectionHeader.border", light: "#cccccc", hcDark: "sideBarSectionHeader.border", hcLight: "#cccccc" },
  localize(265, null)
);
export { multiDiffEditorHeaderBackground, multiDiffEditorBackground, multiDiffEditorBorder };
