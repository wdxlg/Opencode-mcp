// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalIcon.ts
import { isString } from "./module-0010.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { ansiColorMap } from "./module-1174.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { getIconRegistry } from "./module-0479.mjs";
import { URI } from "./module-0032.mjs";
import { isDark } from "./module-0247.mjs";
import { hash } from "./module-0039.mjs";
import { ITerminalProfileResolverService } from "./module-1173.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalIcon.ts
function getColorClass(terminalOrColorKey) {
  let color2 = void 0;
  if (isString(terminalOrColorKey)) {
    color2 = terminalOrColorKey;
  } else if (terminalOrColorKey.color) {
    color2 = terminalOrColorKey.color.replace(/\./g, "_");
  } else if (ThemeIcon.isThemeIcon(terminalOrColorKey.icon) && terminalOrColorKey.icon.color) {
    color2 = terminalOrColorKey.icon.color.id.replace(/\./g, "_");
  }
  if (color2) {
    return `terminal-icon-${color2.replace(/\./g, "_")}`;
  }
  return void 0;
}

function getStandardColors(colorTheme) {
  const standardColors = [];
  for (const colorKey in ansiColorMap) {
    const color2 = colorTheme.getColor(colorKey);
    if (color2 && !colorKey.toLowerCase().includes("bright")) {
      standardColors.push(colorKey);
    }
  }
  return standardColors;
}

function createColorStyleElement(colorTheme) {
  const disposable = new DisposableStore();
  const standardColors = getStandardColors(colorTheme);
  const styleElement = createStyleSheet(void 0, void 0, disposable);
  let css = "";
  for (const colorKey of standardColors) {
    const colorClass = getColorClass(colorKey);
    const color2 = colorTheme.getColor(colorKey);
    if (color2) {
      css += `.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon){ color: ${color2} !important; }`;
    }
  }
  styleElement.textContent = css;
  return disposable;
}

function getColorStyleContent(colorTheme, editor) {
  const standardColors = getStandardColors(colorTheme);
  let css = "";
  for (const colorKey of standardColors) {
    const colorClass = getColorClass(colorKey);
    const color2 = colorTheme.getColor(colorKey);
    if (color2) {
      if (editor) {
        css += `.monaco-workbench .show-file-icons .predefined-file-icon.terminal-tab.${colorClass}::before,.monaco-workbench .show-file-icons .file-icon.terminal-tab.${colorClass}::before{ color: ${color2} !important; }`;
      } else {
        css += `.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon){ color: ${color2} !important; }`;
      }
    }
  }
  return css;
}

function getUriClasses(terminal2, colorScheme, extensionContributed) {
  const icon2 = terminal2.icon;
  if (!icon2) {
    return void 0;
  }
  const iconClasses = [];
  let uri5 = void 0;
  if (extensionContributed) {
    if (isString(icon2) && (icon2.startsWith("$(") || getIconRegistry().getIcon(icon2))) {
      return iconClasses;
    } else if (isString(icon2)) {
      uri5 = URI.parse(icon2);
    }
  }
  if (URI.isUri(icon2)) {
    uri5 = icon2;
  } else if (!ThemeIcon.isThemeIcon(icon2) && !isString(icon2)) {
    uri5 = isDark(colorScheme) ? icon2.dark : icon2.light;
  }
  if (uri5 instanceof URI) {
    const uriIconKey = hash(uri5.path).toString(36);
    const className2 = `terminal-uri-icon-${uriIconKey}`;
    iconClasses.push(className2);
    iconClasses.push(`terminal-uri-icon`);
  }
  return iconClasses;
}

function getIconId(accessor, terminal2) {
  if (isString(terminal2.icon)) {
    return terminal2.icon;
  }
  if (ThemeIcon.isThemeIcon(terminal2.icon)) {
    return terminal2.icon.id;
  }
  return accessor.get(ITerminalProfileResolverService).getDefaultIcon().id;
}
export { getColorClass, getStandardColors, createColorStyleElement, getColorStyleContent, getUriClasses, getIconId };
