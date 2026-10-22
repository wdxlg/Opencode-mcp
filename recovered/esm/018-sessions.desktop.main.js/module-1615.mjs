// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/common/themeCompatibility.ts
import { Color } from "./module-0197.mjs";
import { editorBackground, editorFindMatch, editorFindMatchHighlight, editorFindRangeHighlight, editorForeground, editorHoverHighlight, editorInactiveSelection, editorSelectionBackground, editorSelectionHighlight } from "./module-0229.mjs";
import { editorActiveIndentGuide1, editorCursorForeground, editorIndentGuide1, editorLineHighlight, editorRangeHighlight, editorWhitespaces } from "./module-0288.mjs";


// src/vs/workbench/services/themes/common/themeCompatibility.ts
var settingToColorIdMapping = {};

function addSettingMapping(settingId, colorId) {
  let colorIds = settingToColorIdMapping[settingId];
  if (!colorIds) {
    settingToColorIdMapping[settingId] = colorIds = [];
  }
  colorIds.push(colorId);
}

function convertSettings(oldSettings, result) {
  for (const rule of oldSettings) {
    result.textMateRules.push(rule);
    if (!rule.scope) {
      const settings = rule.settings;
      if (!settings) {
        rule.settings = {};
      } else {
        for (const settingKey in settings) {
          const key3 = settingKey;
          const mappings = settingToColorIdMapping[key3];
          if (mappings) {
            const colorHex = settings[key3];
            if (typeof colorHex === "string") {
              const color2 = Color.fromHex(colorHex);
              for (const colorId of mappings) {
                result.colors[colorId] = color2;
              }
            }
          }
          if (key3 !== "foreground" && key3 !== "background" && key3 !== "fontStyle") {
            delete settings[key3];
          }
        }
      }
    }
  }
}

addSettingMapping("background", editorBackground);

addSettingMapping("foreground", editorForeground);

addSettingMapping("selection", editorSelectionBackground);

addSettingMapping("inactiveSelection", editorInactiveSelection);

addSettingMapping("selectionHighlightColor", editorSelectionHighlight);

addSettingMapping("findMatchHighlight", editorFindMatchHighlight);

addSettingMapping("currentFindMatchHighlight", editorFindMatch);

addSettingMapping("hoverHighlight", editorHoverHighlight);

addSettingMapping("wordHighlight", "editor.wordHighlightBackground");

addSettingMapping("wordHighlightStrong", "editor.wordHighlightStrongBackground");

addSettingMapping("findRangeHighlight", editorFindRangeHighlight);

addSettingMapping("findMatchHighlight", "peekViewResult.matchHighlightBackground");

addSettingMapping("referenceHighlight", "peekViewEditor.matchHighlightBackground");

addSettingMapping("lineHighlight", editorLineHighlight);

addSettingMapping("rangeHighlight", editorRangeHighlight);

addSettingMapping("caret", editorCursorForeground);

addSettingMapping("invisibles", editorWhitespaces);

addSettingMapping("guide", editorIndentGuide1);

addSettingMapping("activeGuide", editorActiveIndentGuide1);

var ansiColorMap2 = [
  "ansiBlack",
  "ansiRed",
  "ansiGreen",
  "ansiYellow",
  "ansiBlue",
  "ansiMagenta",
  "ansiCyan",
  "ansiWhite",
  "ansiBrightBlack",
  "ansiBrightRed",
  "ansiBrightGreen",
  "ansiBrightYellow",
  "ansiBrightBlue",
  "ansiBrightMagenta",
  "ansiBrightCyan",
  "ansiBrightWhite"
];

for (const color2 of ansiColorMap2) {
  addSettingMapping(color2, "terminal." + color2);
}
export { addSettingMapping, convertSettings, settingToColorIdMapping, ansiColorMap2 };
