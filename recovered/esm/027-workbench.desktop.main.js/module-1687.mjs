// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/browser/colorThemeCss.ts
import { asCssVariableName, getColorRegistry } from "./module-0226.mjs";
import { asCssVariableName2, getSizeRegistry, sizeValueToCss } from "./module-1505.mjs";


// src/vs/workbench/services/themes/browser/colorThemeCss.ts
function generateColorThemeCSS(theme, scopeSelector, themingParticipants, environmentService) {
  const cssRules = /* @__PURE__ */ new Set();
  const ruleCollector = {
    addRule: (rule) => {
      if (!cssRules.has(rule)) {
        cssRules.add(rule);
      }
    }
  };
  ruleCollector.addRule(`${scopeSelector} { forced-color-adjust: none; }`);
  if (themingParticipants && environmentService) {
    for (const participant of themingParticipants) {
      participant(theme, ruleCollector, environmentService);
    }
  }
  const variables = [];
  for (const item of getColorRegistry().getColors()) {
    const color2 = theme.getColor(item.id, true);
    if (color2) {
      variables.push(`${asCssVariableName(item.id)}: ${color2.toString()};`);
    }
  }
  for (const item of getSizeRegistry().getSizes()) {
    const sizeValue2 = getSizeRegistry().resolveDefaultSize(item.id, theme);
    if (sizeValue2) {
      variables.push(`${asCssVariableName2(item.id)}: ${sizeValueToCss(sizeValue2)};`);
    }
  }
  ruleCollector.addRule(`${scopeSelector} { ${variables.join("\n")} }`);
  return new CSSValue([...cssRules].join("\n"));
}

var CSSValue = class {
  constructor(code) {
    this.code = code;
  }
};
export { generateColorThemeCSS, CSSValue };
