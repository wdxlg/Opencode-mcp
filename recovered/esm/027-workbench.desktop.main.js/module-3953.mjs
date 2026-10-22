// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/electron-browser/inputClipboardActions.ts
import { isMacintosh } from "./module-0014.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";


// src/vs/workbench/contrib/codeEditor/electron-browser/inputClipboardActions.ts
if (isMacintosh) {
  let bindExecuteCommand = function(command4) {
    return () => {
      getActiveWindow().document.execCommand(command4);
    };
  };
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "execCut",
    primary: 2048 /* CtrlCmd */ | 54 /* KeyX */,
    handler: bindExecuteCommand("cut"),
    weight: 0,
    when: void 0
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "execCopy",
    primary: 2048 /* CtrlCmd */ | 33 /* KeyC */,
    handler: bindExecuteCommand("copy"),
    weight: 0,
    when: void 0
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "execPaste",
    primary: 2048 /* CtrlCmd */ | 52 /* KeyV */,
    handler: bindExecuteCommand("paste"),
    weight: 0,
    when: void 0
  });
}
export {};
