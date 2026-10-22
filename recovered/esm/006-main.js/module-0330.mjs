// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/iconLabels.ts
import { __esm } from "./module-0000.mjs";
import { init_filters } from "./module-0329.mjs";
import { init_strings } from "./module-0027.mjs";
import { ThemeIcon, init_themables } from "./module-0241.mjs";


// src/vs/base/common/iconLabels.ts
var iconsRegex, escapeIconsRegex, markdownEscapedIconsRegex, stripIconsRegex, _parseIconsRegex;

var init_iconLabels = __esm({
  "src/vs/base/common/iconLabels.ts"() {
    init_filters();
    init_strings();
    init_themables();
    iconsRegex = new RegExp(`\\$\\(${ThemeIcon.iconNameExpression}(?:${ThemeIcon.iconModifierExpression})?\\)`, "g");
    escapeIconsRegex = new RegExp(`(\\\\)?${iconsRegex.source}`, "g");
    markdownEscapedIconsRegex = new RegExp(`\\\\${iconsRegex.source}`, "g");
    stripIconsRegex = new RegExp(`(\\s)?(\\\\)?${iconsRegex.source}(\\s)?`, "g");
    _parseIconsRegex = new RegExp(`\\$\\(${ThemeIcon.iconNameCharacter}+\\)`, "g");
  }
});
export { iconsRegex, escapeIconsRegex, markdownEscapedIconsRegex, stripIconsRegex, _parseIconsRegex, init_iconLabels };
