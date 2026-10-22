// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/theme/browser/iconsStyleSheet.ts
import { DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { getIconRegistry } from "./module-0479.mjs";
import { Builder, asCSSUrl, className, identValue, inline, stringValue } from "./module-0449.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/platform/theme/browser/iconsStyleSheet.ts
function getIconsStyleSheet(themeService) {
  const disposable = new DisposableStore();
  const onDidChangeEmmiter = disposable.add(new Emitter());
  const iconRegistry4 = getIconRegistry();
  disposable.add(iconRegistry4.onDidChange(() => onDidChangeEmmiter.fire()));
  if (themeService) {
    disposable.add(themeService.onDidProductIconThemeChange(() => onDidChangeEmmiter.fire()));
  }
  return {
    dispose: () => disposable.dispose(),
    onDidChange: onDidChangeEmmiter.event,
    getCSS() {
      const productIconTheme = themeService ? themeService.getProductIconTheme() : new UnthemedProductIconTheme();
      const usedFontIds = {};
      const rules = new Builder();
      const rootAttribs = new Builder();
      for (const contribution of iconRegistry4.getIcons()) {
        const definition = productIconTheme.getIcon(contribution);
        if (!definition) {
          continue;
        }
        const fontContribution = definition.font;
        const fontFamilyVar = inline`--vscode-icon-${className(contribution.id)}-font-family`;
        const contentVar = inline`--vscode-icon-${className(contribution.id)}-content`;
        if (fontContribution) {
          usedFontIds[fontContribution.id] = fontContribution.definition;
          rootAttribs.push(
            inline`${fontFamilyVar}: ${stringValue(fontContribution.id)};`,
            inline`${contentVar}: ${stringValue(definition.fontCharacter)};`
          );
          rules.push(inline`.codicon-${className(contribution.id)}:before { content: ${stringValue(definition.fontCharacter)}; font-family: ${stringValue(fontContribution.id)}; }`);
        } else {
          rootAttribs.push(inline`${contentVar}: ${stringValue(definition.fontCharacter)}; ${fontFamilyVar}: 'codicon';`);
          rules.push(inline`.codicon-${className(contribution.id)}:before { content: ${stringValue(definition.fontCharacter)}; }`);
        }
      }
      for (const id2 in usedFontIds) {
        const definition = usedFontIds[id2];
        const fontWeight = definition.weight ? inline`font-weight: ${identValue(definition.weight)};` : inline``;
        const fontStyle = definition.style ? inline`font-style: ${identValue(definition.style)};` : inline``;
        const src = new Builder();
        for (const l of definition.src) {
          src.push(inline`${asCSSUrl(l.location)} format(${stringValue(l.format)})`);
        }
        rules.push(inline`@font-face { src: ${src.join(", ")}; font-family: ${stringValue(id2)};${fontWeight}${fontStyle} font-display: block; }`);
      }
      rules.push(inline`:root { ${rootAttribs.join(" ")} }`);
      return rules.join("\n");
    }
  };
}

var UnthemedProductIconTheme = class {
  getIcon(contribution) {
    const iconRegistry4 = getIconRegistry();
    let definition = contribution.defaults;
    while (ThemeIcon.isThemeIcon(definition)) {
      const c = iconRegistry4.getIcon(definition.id);
      if (!c) {
        return void 0;
      }
      definition = c.defaults;
    }
    return definition;
  }
};
export { getIconsStyleSheet, UnthemedProductIconTheme };
