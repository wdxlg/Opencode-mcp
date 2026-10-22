// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/electron-browser/webviewCommands.ts
import { Action2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { getActiveWindow } from "./module-0075.mjs";


// src/vs/workbench/contrib/webview/electron-browser/webviewCommands.ts
var OpenWebviewDeveloperToolsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.webview.openDeveloperTools",
      title: localize2(21859, "Open Webview Developer Tools"),
      category: Categories.Developer,
      metadata: {
        description: localize(21858, null)
      },
      f1: true
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const iframeWebviewElements = getActiveWindow().document.querySelectorAll("iframe.webview.ready");
    if (iframeWebviewElements.length) {
      console.info(localize(21857, null));
      nativeHostService.openDevTools();
    }
  }
};
export { OpenWebviewDeveloperToolsAction };
