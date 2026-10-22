// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { TabFocus } from "./module-0219.mjs";
import { alert } from "./module-0076.mjs";


// src/vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.ts
var ToggleTabFocusModeAction = class _ToggleTabFocusModeAction extends Action2 {
  static {
    this.ID = "editor.action.toggleTabFocusMode";
  }
  constructor() {
    super({
      id: _ToggleTabFocusModeAction.ID,
      title: localize2(1715, "Toggle Tab Key Moves Focus"),
      precondition: void 0,
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 43 /* KeyM */,
        mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 43 /* KeyM */ },
        weight: 100 /* EditorContrib */
      },
      metadata: {
        description: localize2(1714, "Determines whether the tab key moves focus around the workbench or inserts the tab character in the current editor. This is also called tab trapping, tab navigation, or tab focus mode.")
      },
      f1: true
    });
  }
  run() {
    const oldValue = TabFocus.getTabFocusMode();
    const newValue = !oldValue;
    TabFocus.setTabFocusMode(newValue);
    if (newValue) {
      alert(localize(1717, null));
    } else {
      alert(localize(1716, null));
    }
  }
};

registerAction2(ToggleTabFocusModeAction);
export { ToggleTabFocusModeAction };
