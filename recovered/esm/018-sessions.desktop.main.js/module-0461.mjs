// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/iconLabels.ts
import { ThemeIcon } from "./module-0086.mjs";
import { matchesFuzzy } from "./module-0453.mjs";
import { ltrim } from "./module-0030.mjs";


// src/vs/base/common/iconLabels.ts
var iconStartMarker = "$(";

var iconsRegex = new RegExp(`\\$\\(${ThemeIcon.iconNameExpression}(?:${ThemeIcon.iconModifierExpression})?\\)`, "g");

var escapeIconsRegex = new RegExp(`(\\\\)?${iconsRegex.source}`, "g");

function escapeIcons(text2) {
  return text2.replace(escapeIconsRegex, (match2, escaped) => escaped ? match2 : `\\${match2}`);
}

var markdownEscapedIconsRegex = new RegExp(`\\\\${iconsRegex.source}`, "g");

function markdownEscapeEscapedIcons(text2) {
  return text2.replace(markdownEscapedIconsRegex, (match2) => `\\${match2}`);
}

var stripIconsRegex = new RegExp(`(\\s)?(\\\\)?${iconsRegex.source}(\\s)?`, "g");

function stripIcons(text2) {
  if (text2.indexOf(iconStartMarker) === -1) {
    return text2;
  }
  return text2.replace(stripIconsRegex, (match2, preWhitespace, escaped, postWhitespace) => escaped ? match2 : preWhitespace || postWhitespace || "");
}

function getCodiconAriaLabel(text2) {
  if (!text2) {
    return "";
  }
  return text2.replace(/\$\((.*?)\)/g, (_match, codiconName) => ` ${codiconName} `).trim();
}

var _parseIconsRegex = new RegExp(`\\$\\(${ThemeIcon.iconNameCharacter}+\\)`, "g");

function parseLabelWithIcons(input) {
  _parseIconsRegex.lastIndex = 0;
  let text2 = "";
  const iconOffsets = [];
  let iconsOffset = 0;
  while (true) {
    const pos = _parseIconsRegex.lastIndex;
    const match2 = _parseIconsRegex.exec(input);
    const chars = input.substring(pos, match2?.index);
    if (chars.length > 0) {
      text2 += chars;
      for (let i2 = 0; i2 < chars.length; i2++) {
        iconOffsets.push(iconsOffset);
      }
    }
    if (!match2) {
      break;
    }
    iconsOffset += match2[0].length;
  }
  return { text: text2, iconOffsets };
}

function matchesFuzzyIconAware(query, target, enableSeparateSubstringMatching = false) {
  const { text: text2, iconOffsets } = target;
  if (!iconOffsets || iconOffsets.length === 0) {
    return matchesFuzzy(query, text2, enableSeparateSubstringMatching);
  }
  const wordToMatchAgainstWithoutIconsTrimmed = ltrim(text2, " ");
  const leadingWhitespaceOffset = text2.length - wordToMatchAgainstWithoutIconsTrimmed.length;
  const matches2 = matchesFuzzy(query, wordToMatchAgainstWithoutIconsTrimmed, enableSeparateSubstringMatching);
  if (matches2) {
    for (const match2 of matches2) {
      const iconOffset = iconOffsets[match2.start + leadingWhitespaceOffset] + leadingWhitespaceOffset;
      match2.start += iconOffset;
      match2.end += iconOffset;
    }
  }
  return matches2;
}
export { escapeIcons, markdownEscapeEscapedIcons, stripIcons, getCodiconAriaLabel, parseLabelWithIcons, matchesFuzzyIconAware, iconStartMarker, iconsRegex, escapeIconsRegex, markdownEscapedIconsRegex, stripIconsRegex, _parseIconsRegex };
