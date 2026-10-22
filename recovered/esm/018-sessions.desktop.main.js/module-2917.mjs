// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/quickAccess/browser/commandsQuickAccess.ts
import { AbstractCommandsQuickAccessProvider } from "./module-2916.mjs";
import { isLocalizedString } from "./module-0505.mjs";
import { stripIcons } from "./module-0461.mjs";


// src/vs/editor/contrib/quickAccess/browser/commandsQuickAccess.ts
var AbstractEditorCommandsQuickAccessProvider = class extends AbstractCommandsQuickAccessProvider {
  constructor(options3, instantiationService, keybindingService, commandService, telemetryService, dialogService) {
    super(options3, instantiationService, keybindingService, commandService, telemetryService, dialogService);
  }
  getCodeEditorCommandPicks() {
    const activeTextEditorControl = this.activeTextEditorControl;
    if (!activeTextEditorControl) {
      return [];
    }
    const editorCommandPicks = [];
    for (const editorAction of activeTextEditorControl.getSupportedActions()) {
      let commandDescription;
      if (editorAction.metadata?.description) {
        if (isLocalizedString(editorAction.metadata.description)) {
          commandDescription = editorAction.metadata.description;
        } else {
          commandDescription = { original: editorAction.metadata.description, value: editorAction.metadata.description };
        }
      }
      editorCommandPicks.push({
        commandId: editorAction.id,
        commandAlias: editorAction.alias,
        commandDescription,
        label: stripIcons(editorAction.label) || editorAction.id
      });
    }
    return editorCommandPicks;
  }
};
export { AbstractEditorCommandsQuickAccessProvider };
