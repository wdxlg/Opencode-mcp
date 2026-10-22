// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/profile/notebookProfile.ts
import { NotebookSetting } from "./module-0911.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/profile/notebookProfile.ts
var profiles = {
  ["default" /* default */]: {
    [NotebookSetting.focusIndicator]: "gutter",
    [NotebookSetting.insertToolbarLocation]: "both",
    [NotebookSetting.globalToolbar]: true,
    [NotebookSetting.cellToolbarLocation]: { default: "right" },
    [NotebookSetting.compactView]: true,
    [NotebookSetting.showCellStatusBar]: "visible",
    [NotebookSetting.consolidatedRunButton]: true,
    [NotebookSetting.undoRedoPerCell]: false
  },
  ["jupyter" /* jupyter */]: {
    [NotebookSetting.focusIndicator]: "gutter",
    [NotebookSetting.insertToolbarLocation]: "notebookToolbar",
    [NotebookSetting.globalToolbar]: true,
    [NotebookSetting.cellToolbarLocation]: { default: "left" },
    [NotebookSetting.compactView]: true,
    [NotebookSetting.showCellStatusBar]: "visible",
    [NotebookSetting.consolidatedRunButton]: false,
    [NotebookSetting.undoRedoPerCell]: true
  },
  ["colab" /* colab */]: {
    [NotebookSetting.focusIndicator]: "border",
    [NotebookSetting.insertToolbarLocation]: "betweenCells",
    [NotebookSetting.globalToolbar]: false,
    [NotebookSetting.cellToolbarLocation]: { default: "right" },
    [NotebookSetting.compactView]: false,
    [NotebookSetting.showCellStatusBar]: "hidden",
    [NotebookSetting.consolidatedRunButton]: true,
    [NotebookSetting.undoRedoPerCell]: false
  }
};

async function applyProfile(configService, profile) {
  const promises = [];
  for (const settingKey in profile) {
    promises.push(configService.updateValue(settingKey, profile[settingKey]));
  }
  await Promise.all(promises);
}

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.setProfile",
      title: localize(17499, null)
    });
  }
  async run(accessor, args2) {
    if (!isSetProfileArgs(args2)) {
      return;
    }
    const configService = accessor.get(IConfigurationService);
    return applyProfile(configService, profiles[args2.profile]);
  }
});

function isSetProfileArgs(args2) {
  const setProfileArgs = args2;
  return setProfileArgs.profile === "colab" /* colab */ || setProfileArgs.profile === "default" /* default */ || setProfileArgs.profile === "jupyter" /* jupyter */;
}
export { applyProfile, isSetProfileArgs, profiles };
