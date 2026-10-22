// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/view/colors.ts
import { registerColor, transparent } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { mergeCurrentHeaderBackground, mergeIncomingHeaderBackground } from "./module-0229.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/view/colors.ts
var diff3 = registerColor(
  "mergeEditor.change.background",
  "#9bb95533",
  localize(17292, null)
);

var diffWord = registerColor(
  "mergeEditor.change.word.background",
  { dark: "#9ccc2c33", light: "#9ccc2c66", hcDark: "#9ccc2c33", hcLight: "#9ccc2c66" },
  localize(17293, null)
);

var diffBase = registerColor(
  "mergeEditor.changeBase.background",
  { dark: "#4B1818FF", light: "#FFCCCCFF", hcDark: "#4B1818FF", hcLight: "#FFCCCCFF" },
  localize(17294, null)
);

var diffWordBase = registerColor(
  "mergeEditor.changeBase.word.background",
  { dark: "#6F1313FF", light: "#FFA3A3FF", hcDark: "#6F1313FF", hcLight: "#FFA3A3FF" },
  localize(17295, null)
);

var conflictBorderUnhandledUnfocused = registerColor(
  "mergeEditor.conflict.unhandledUnfocused.border",
  { dark: "#ffa6007a", light: "#ffa600FF", hcDark: "#ffa6007a", hcLight: "#ffa6007a" },
  localize(17303, null)
);

var conflictBorderUnhandledFocused = registerColor(
  "mergeEditor.conflict.unhandledFocused.border",
  "#ffa600",
  localize(17302, null)
);

var conflictBorderHandledUnfocused = registerColor(
  "mergeEditor.conflict.handledUnfocused.border",
  "#86868649",
  localize(17298, null)
);

var conflictBorderHandledFocused = registerColor(
  "mergeEditor.conflict.handledFocused.border",
  "#c1c1c1cc",
  localize(17297, null)
);

var handledConflictMinimapOverViewRulerColor = registerColor(
  "mergeEditor.conflict.handled.minimapOverViewRuler",
  "#adaca8ee",
  localize(17296, null)
);

var unhandledConflictMinimapOverViewRulerColor = registerColor(
  "mergeEditor.conflict.unhandled.minimapOverViewRuler",
  "#fcba03FF",
  localize(17301, null)
);

var conflictingLinesBackground = registerColor(
  "mergeEditor.conflictingLines.background",
  "#ffea0047",
  localize(17304, null)
);

var contentTransparency2 = 0.4;

var conflictInput1Background = registerColor(
  "mergeEditor.conflict.input1.background",
  transparent(mergeCurrentHeaderBackground, contentTransparency2),
  localize(17299, null)
);

var conflictInput2Background = registerColor(
  "mergeEditor.conflict.input2.background",
  transparent(mergeIncomingHeaderBackground, contentTransparency2),
  localize(17300, null)
);
export { diff3, diffWord, diffBase, diffWordBase, conflictBorderUnhandledUnfocused, conflictBorderUnhandledFocused, conflictBorderHandledUnfocused, conflictBorderHandledFocused, handledConflictMinimapOverViewRulerColor, unhandledConflictMinimapOverViewRulerColor, conflictingLinesBackground, contentTransparency2, conflictInput1Background, conflictInput2Background };
