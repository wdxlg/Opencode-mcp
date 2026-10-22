// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/toggleMultiCursorModifier.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { isMacintosh } from "./module-0014.mjs";


// src/vs/workbench/contrib/codeEditor/browser/toggleMultiCursorModifier.ts
var ToggleMultiCursorModifierAction = class _ToggleMultiCursorModifierAction extends Action2 {
  static {
    this.ID = "workbench.action.toggleMultiCursorModifier";
  }
  static {
    this.multiCursorModifierConfigurationKey = "editor.multiCursorModifier";
  }
  constructor() {
    super({
      id: _ToggleMultiCursorModifierAction.ID,
      title: localize2(13834, "Toggle Multi-Cursor Modifier"),
      f1: true
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const editorConf = configurationService.getValue("editor");
    const newValue = editorConf.multiCursorModifier === "ctrlCmd" ? "alt" : "ctrlCmd";
    return configurationService.updateValue(_ToggleMultiCursorModifierAction.multiCursorModifierConfigurationKey, newValue);
  }
};

var multiCursorModifier = new RawContextKey("multiCursorModifier", "altKey");

var MultiCursorModifierContextKeyController = class extends Disposable {
  constructor(configurationService, contextKeyService) {
    super();
    this.configurationService = configurationService;
    this._multiCursorModifier = multiCursorModifier.bindTo(contextKeyService);
    this._update();
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("editor.multiCursorModifier")) {
        this._update();
      }
    }));
  }
  _update() {
    const editorConf = this.configurationService.getValue("editor");
    const value2 = editorConf.multiCursorModifier === "ctrlCmd" ? "ctrlCmd" : "altKey";
    this._multiCursorModifier.set(value2);
  }
};

MultiCursorModifierContextKeyController = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IContextKeyService)
], MultiCursorModifierContextKeyController);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(MultiCursorModifierContextKeyController, 3 /* Restored */);

registerAction2(ToggleMultiCursorModifierAction);

MenuRegistry.appendMenuItem(MenuId.MenubarSelectionMenu, {
  group: "4_config",
  command: {
    id: ToggleMultiCursorModifierAction.ID,
    title: localize(13831, null)
  },
  when: multiCursorModifier.isEqualTo("ctrlCmd"),
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarSelectionMenu, {
  group: "4_config",
  command: {
    id: ToggleMultiCursorModifierAction.ID,
    title: isMacintosh ? localize(13832, null) : localize(13833, null)
  },
  when: multiCursorModifier.isEqualTo("altKey"),
  order: 1
});
export { ToggleMultiCursorModifierAction, multiCursorModifier, MultiCursorModifierContextKeyController };
