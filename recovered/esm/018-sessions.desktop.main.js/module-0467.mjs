// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/iconLabel/iconLabels.ts
import { ThemeIcon } from "./module-0086.mjs";
import { $ } from "./module-0075.mjs";


// src/vs/base/browser/ui/iconLabel/iconLabels.ts
var labelWithIconsRegex = new RegExp(`(\\\\)?\\$\\((${ThemeIcon.iconNameExpression}(?:${ThemeIcon.iconModifierExpression})?)\\)`, "g");

function renderLabelWithIcons(text2, renderIconsInDefaultColor) {
  const elements = new Array();
  let match2;
  let textStart = 0, textStop = 0;
  while ((match2 = labelWithIconsRegex.exec(text2)) !== null) {
    textStop = match2.index || 0;
    if (textStart < textStop) {
      elements.push(text2.substring(textStart, textStop));
    }
    textStart = (match2.index || 0) + match2[0].length;
    const [, escaped, codicon] = match2;
    elements.push(escaped ? `$(${codicon})` : renderIcon({ id: codicon }, renderIconsInDefaultColor));
  }
  if (textStart < text2.length) {
    elements.push(text2.substring(textStart));
  }
  return elements;
}

function renderIcon(icon2, renderDefaultColor) {
  const node = $(`span`);
  const classes2 = ThemeIcon.asClassNameArray(icon2);
  if (renderDefaultColor) {
    classes2.push("codicon-colored");
  }
  node.classList.add(...classes2);
  return node;
}
export { renderLabelWithIcons, renderIcon, labelWithIconsRegex };
