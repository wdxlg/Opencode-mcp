// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/toggleMinimap.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/codeEditor/browser/toggleMinimap.ts
var ToggleMinimapAction = class _ToggleMinimapAction extends Action2 {
  static {
    this.ID = "editor.action.toggleMinimap";
  }
  constructor() {
    super({
      id: _ToggleMinimapAction.ID,
      title: {
        ...localize2(13830, "Toggle Minimap"),
        mnemonicTitle: localize(13829, null)
      },
      category: Categories.View,
      f1: true,
      toggled: ContextKeyExpr.equals("config.editor.minimap.enabled", true),
      menu: {
        id: MenuId.MenubarAppearanceMenu,
        group: "4_editor",
        order: 1
      }
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue("editor.minimap.enabled");
    return configurationService.updateValue("editor.minimap.enabled", newValue);
  }
};

registerAction2(ToggleMinimapAction);
export { ToggleMinimapAction };
