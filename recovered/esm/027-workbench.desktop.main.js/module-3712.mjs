// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/style.ts
import { registerThemingParticipant } from "./module-0287.mjs";
import { TITLE_BAR_ACTIVE_BACKGROUND, WORKBENCH_BACKGROUND } from "./module-0912.mjs";
import { selectionBackground } from "./module-0227.mjs";
import { isIOS, isWeb } from "./module-0014.mjs";
import { mainWindow } from "./module-0002.mjs";
import { createMetaElement } from "./module-0075.mjs";
import { isSafari2, isStandalone } from "./module-0018.mjs";


// src/vs/workbench/browser/style.ts
registerThemingParticipant((theme, collector) => {
  const workbenchBackground = WORKBENCH_BACKGROUND(theme);
  collector.addRule(`.monaco-workbench { background-color: ${workbenchBackground}; }`);
  const windowSelectionBackground = theme.getColor(selectionBackground);
  if (windowSelectionBackground) {
    collector.addRule(`.monaco-workbench ::selection { background-color: ${windowSelectionBackground}; }`);
  }
  if (isWeb) {
    const titleBackground = theme.getColor(TITLE_BAR_ACTIVE_BACKGROUND);
    if (titleBackground) {
      const metaElementId = "monaco-workbench-meta-theme-color";
      let metaElement = mainWindow.document.getElementById(metaElementId);
      if (!metaElement) {
        metaElement = createMetaElement();
        metaElement.name = "theme-color";
        metaElement.id = metaElementId;
      }
      metaElement.content = titleBackground.toString();
    }
  }
  if (isSafari2) {
    collector.addRule(`
			body.web {
				touch-action: none;
			}
			.monaco-workbench .monaco-editor .view-lines {
				user-select: text;
				-webkit-user-select: text;
			}
		`);
  }
  if (isIOS && isStandalone()) {
    collector.addRule(`body { background-color: ${workbenchBackground}; }`);
  }
});
export {};
