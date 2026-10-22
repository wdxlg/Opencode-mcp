// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/toggleOvertype.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { InputMode } from "./module-0112.mjs";


// src/vs/workbench/contrib/codeEditor/browser/toggleOvertype.ts
var ToggleOvertypeInsertMode = class extends Action2 {
  constructor() {
    super({
      id: "editor.action.toggleOvertypeInsertMode",
      title: {
        ...localize2(13836, "Toggle Overtype/Insert Mode"),
        mnemonicTitle: localize(13835, null)
      },
      metadata: {
        description: localize2(13837, "Toggle between overtype and insert mode")
      },
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 19 /* Insert */,
        mac: { primary: 512 /* Alt */ | 2048 /* CtrlCmd */ | 45 /* KeyO */ }
      },
      f1: true,
      category: Categories.View
    });
  }
  async run(accessor) {
    const oldInputMode = InputMode.getInputMode();
    const newInputMode = oldInputMode === "insert" ? "overtype" : "insert";
    InputMode.setInputMode(newInputMode);
  }
};

registerAction2(ToggleOvertypeInsertMode);
export { ToggleOvertypeInsertMode };
