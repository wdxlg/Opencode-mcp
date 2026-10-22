// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/languages/supports/tokenization.ts



// src/vs/editor/common/languages/supports/tokenization.ts
var STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|regexp)\b/;

function toStandardTokenType(tokenType) {
  const m = tokenType.match(STANDARD_TOKEN_TYPE_REGEXP);
  if (!m) {
    return 0 /* Other */;
  }
  switch (m[1]) {
    case "comment":
      return 1 /* Comment */;
    case "string":
      return 2 /* String */;
    case "regex":
      return 3 /* RegEx */;
    case "regexp":
      return 3 /* RegEx */;
  }
  throw new Error("Unexpected match for standard token type!");
}

function generateTokensCSSForColorMap(colorMap) {
  const rules = [];
  for (let i2 = 1, len = colorMap.length; i2 < len; i2++) {
    const color2 = colorMap[i2];
    rules[i2] = `.mtk${i2} { color: ${color2}; }`;
  }
  rules.push(".mtki { font-style: italic; }");
  rules.push(".mtkb { font-weight: bold; }");
  rules.push(".mtku { text-decoration: underline; text-underline-position: under; }");
  rules.push(".mtks { text-decoration: line-through; }");
  rules.push(".mtks.mtku { text-decoration: underline line-through; text-underline-position: under; }");
  return rules.join("\n");
}

function generateTokensCSSForFontMap(fontMap) {
  const rules = [];
  const fonts = /* @__PURE__ */ new Set();
  for (let i2 = 1, len = fontMap.length; i2 < len; i2++) {
    const font = fontMap[i2];
    if (!font.fontFamily && !font.fontSizeMultiplier) {
      continue;
    }
    const className2 = classNameForFontTokenDecorations(font.fontFamily ?? "", font.fontSizeMultiplier ?? 0);
    if (fonts.has(className2)) {
      continue;
    }
    fonts.add(className2);
    let rule = `.${className2} {`;
    if (font.fontFamily) {
      rule += `font-family: ${font.fontFamily};`;
    }
    if (font.fontSizeMultiplier) {
      rule += `font-size: calc(var(--editor-font-size)*${font.fontSizeMultiplier});`;
    }
    rule += `}`;
    rules.push(rule);
  }
  return rules.join("\n");
}

function classNameForFontTokenDecorations(fontFamily, fontSize) {
  const safeFontFamily = sanitizeFontFamilyForClassName(fontFamily);
  return cleanClassName(`font-decoration-${safeFontFamily}-${fontSize}`);
}

function sanitizeFontFamilyForClassName(fontFamily) {
  const normalized = fontFamily.toLowerCase().trim();
  if (!normalized) {
    return "default";
  }
  return cleanClassName(normalized);
}

function cleanClassName(className2) {
  return className2.replace(/[^a-z0-9_-]/gi, "-");
}
export { toStandardTokenType, generateTokensCSSForColorMap, generateTokensCSSForFontMap, classNameForFontTokenDecorations, sanitizeFontFamilyForClassName, cleanClassName, STANDARD_TOKEN_TYPE_REGEXP };
