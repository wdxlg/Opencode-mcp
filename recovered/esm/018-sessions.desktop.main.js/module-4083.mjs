// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/electron-browser/extensionsActions.ts
import { Action2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { IFileService } from "./module-0269.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3824.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { IExtensionManagementService } from "./module-0874.mjs";


// src/vs/workbench/contrib/extensions/electron-browser/extensionsActions.ts
var OpenExtensionsFolderAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.extensions.action.openExtensionsFolder",
      title: localize2(15636, "Open Extensions Folder"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const fileService = accessor.get(IFileService);
    const environmentService = accessor.get(INativeWorkbenchEnvironmentService);
    const extensionsHome = URI.file(environmentService.extensionsPath);
    const file = await fileService.resolve(extensionsHome);
    let itemToShow;
    if (file.children && file.children.length > 0) {
      itemToShow = file.children[0].resource;
    } else {
      itemToShow = extensionsHome;
    }
    if (itemToShow.scheme === Schemas.file) {
      return nativeHostService.showItemInFolder(itemToShow.fsPath);
    }
  }
};

var CleanUpExtensionsFolderAction = class extends Action2 {
  constructor() {
    super({
      id: "_workbench.extensions.action.cleanUpExtensionsFolder",
      title: localize2(15635, "Cleanup Extensions Folder"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const extensionManagementService = accessor.get(IExtensionManagementService);
    return extensionManagementService.cleanUp();
  }
};
export { OpenExtensionsFolderAction, CleanUpExtensionsFolderAction };
