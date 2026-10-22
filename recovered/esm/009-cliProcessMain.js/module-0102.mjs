// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/base/common/iconLabels.ts
import { ThemeIcon } from "./module-0101.mjs";


// src/vs/base/common/iconLabels.ts
var iconsRegex = new RegExp(`\\$\\(${ThemeIcon.iconNameExpression}(?:${ThemeIcon.iconModifierExpression})?\\)`, "g");

var escapeIconsRegex = new RegExp(`(\\\\)?${iconsRegex.source}`, "g");

function escapeIcons(text) {
  return text.replace(escapeIconsRegex, (match, escaped) => escaped ? match : `\\${match}`);
}

var markdownEscapedIconsRegex = new RegExp(`\\\\${iconsRegex.source}`, "g");

var stripIconsRegex = new RegExp(`(\\s)?(\\\\)?${iconsRegex.source}(\\s)?`, "g");

var _parseIconsRegex = new RegExp(`\\$\\(${ThemeIcon.iconNameCharacter}+\\)`, "g");
export { escapeIcons, iconsRegex, escapeIconsRegex, markdownEscapedIconsRegex, stripIconsRegex, _parseIconsRegex };
