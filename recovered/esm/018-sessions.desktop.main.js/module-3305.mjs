// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/toggleRenderControlCharacter.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/codeEditor/browser/toggleRenderControlCharacter.ts
var ToggleRenderControlCharacterAction = class _ToggleRenderControlCharacterAction extends Action2 {
  static {
    this.ID = "editor.action.toggleRenderControlCharacter";
  }
  constructor() {
    super({
      id: _ToggleRenderControlCharacterAction.ID,
      title: {
        ...localize2(13839, "Toggle Control Characters"),
        mnemonicTitle: localize(13838, null)
      },
      category: Categories.View,
      f1: true,
      toggled: ContextKeyExpr.equals("config.editor.renderControlCharacters", true),
      menu: {
        id: MenuId.MenubarAppearanceMenu,
        group: "4_editor",
        order: 5
      }
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const newRenderControlCharacters = !configurationService.getValue("editor.renderControlCharacters");
    return configurationService.updateValue("editor.renderControlCharacters", newRenderControlCharacters);
  }
};

registerAction2(ToggleRenderControlCharacterAction);
export { ToggleRenderControlCharacterAction };
