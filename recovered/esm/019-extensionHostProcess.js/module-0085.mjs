// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/iconLabels.ts
import { ThemeIcon } from "./module-0084.mjs";


// src/vs/base/common/iconLabels.ts
var iconsRegex = new RegExp(`\\$\\(${ThemeIcon.iconNameExpression}(?:${ThemeIcon.iconModifierExpression})?\\)`, "g");

var escapeIconsRegex = new RegExp(`(\\\\)?${iconsRegex.source}`, "g");

function escapeIcons(text) {
  return text.replace(escapeIconsRegex, (match2, escaped) => escaped ? match2 : `\\${match2}`);
}

var markdownEscapedIconsRegex = new RegExp(`\\\\${iconsRegex.source}`, "g");

var stripIconsRegex = new RegExp(`(\\s)?(\\\\)?${iconsRegex.source}(\\s)?`, "g");

var _parseIconsRegex = new RegExp(`\\$\\(${ThemeIcon.iconNameCharacter}+\\)`, "g");
export { escapeIcons, iconsRegex, escapeIconsRegex, markdownEscapedIconsRegex, stripIconsRegex, _parseIconsRegex };
