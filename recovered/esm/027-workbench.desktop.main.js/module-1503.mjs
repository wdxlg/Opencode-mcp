// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/workbench.zenMode.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { ZenHideEditorTabsAction, ZenShowMultipleEditorTabsAction, ZenShowSingleEditorTabAction } from "./module-1502.mjs";
import { InEditorZenModeContext, IsAuxiliaryWindowFocusedContext } from "./module-0949.mjs";
import { Categories } from "./module-0847.mjs";
import { KeyChord } from "./module-0019.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/browser/workbench.zenMode.contribution.ts
(function registerZenModeConfiguration() {
  const registry4 = Registry.as(Extensions4.Configuration);
  registry4.registerConfiguration({
    "id": "zenMode",
    "order": 9,
    "title": localize(7277, null),
    "type": "object",
    "properties": {
      "zenMode.fullScreen": {
        "type": "boolean",
        "default": true,
        "description": localize(7267, null)
      },
      "zenMode.centerLayout": {
        "type": "boolean",
        "default": true,
        "description": localize(7266, null)
      },
      "zenMode.showTabs": {
        "type": "string",
        "enum": ["multiple", "single", "none"],
        "description": localize(7272, null),
        "enumDescriptions": [
          localize(7273, null),
          localize(7275, null),
          localize(7274, null)
        ],
        "default": "multiple"
      },
      "zenMode.hideStatusBar": {
        "type": "boolean",
        "default": true,
        "description": localize(7270, null)
      },
      "zenMode.hideActivityBar": {
        "type": "boolean",
        "default": true,
        "description": localize(7268, null)
      },
      "zenMode.hideLineNumbers": {
        "type": "boolean",
        "default": true,
        "description": localize(7269, null)
      },
      "zenMode.restore": {
        "type": "boolean",
        "default": true,
        "description": localize(7271, null)
      },
      "zenMode.silentNotifications": {
        "type": "boolean",
        "default": true,
        "description": localize(7276, null)
      }
    }
  });
})();

registerAction2(ZenHideEditorTabsAction);

registerAction2(ZenShowMultipleEditorTabsAction);

registerAction2(ZenShowSingleEditorTabAction);

MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  submenu: MenuId.EditorTabsBarShowTabsZenModeSubmenu,
  title: localize(7264, null),
  group: "3_workbench_layout_move",
  order: 10,
  when: InEditorZenModeContext
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleZenMode",
      title: {
        ...localize2(7265, "Toggle Zen Mode"),
        mnemonicTitle: localize(7263, null)
      },
      precondition: IsAuxiliaryWindowFocusedContext.toNegated(),
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 56 /* KeyZ */)
      },
      toggled: InEditorZenModeContext,
      menu: [{
        id: MenuId.MenubarAppearanceMenu,
        group: "1_toggle_view",
        order: 2
      }]
    });
  }
  run(accessor) {
    return accessor.get(IWorkbenchLayoutService).toggleZenMode();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.exitZenMode",
  weight: 100 /* EditorContrib */ - 1e3,
  handler(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const contextKeyService = accessor.get(IContextKeyService);
    if (InEditorZenModeContext.getValue(contextKeyService)) {
      layoutService.toggleZenMode();
    }
  },
  when: InEditorZenModeContext,
  primary: KeyChord(9 /* Escape */, 9 /* Escape */)
});
export {};
