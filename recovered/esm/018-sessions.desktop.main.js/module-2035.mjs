// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatIcons.ts
import { ThemeIcon } from "./module-0086.mjs";
import { getIconRegistry } from "./module-0479.mjs";


// src/vs/workbench/contrib/chat/browser/chatIcons.ts
function getCompactCodicon(icon2) {
  const modifier = ThemeIcon.getModifier(icon2);
  const id2 = modifier ? icon2.id.slice(0, -(modifier.length + 1)) : icon2.id;
  const compactId = `${id2}-compact`;
  if (!getIconRegistry().getIcon(compactId)) {
    return icon2;
  }
  return {
    id: modifier ? `${compactId}~${modifier}` : compactId,
    color: icon2.color
  };
}

function compactCodiconsIn(element) {
  const visit2 = (container2) => {
    for (const child of container2.children) {
      if (child.classList.contains("codicon")) {
        const iconClass = [...child.classList].find((className2) => className2.startsWith("codicon-") && !className2.startsWith("codicon-modifier-"));
        if (iconClass) {
          const icon2 = ThemeIcon.fromId(iconClass.substring("codicon-".length));
          const compactIcon = getCompactCodicon(icon2);
          if (compactIcon.id !== icon2.id) {
            child.classList.replace(iconClass, `codicon-${compactIcon.id}`);
          }
        }
      }
      visit2(child);
    }
  };
  visit2(element);
}
export { getCompactCodicon, compactCodiconsIn };
