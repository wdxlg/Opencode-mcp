// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/logs/electron-browser/logs.contribution.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { OpenExtensionLogsFolderAction, OpenLogsFolderAction } from "./module-4057.mjs";
import { Categories } from "./module-0847.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/logs/electron-browser/logs.contribution.ts
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: OpenLogsFolderAction.ID,
      title: OpenLogsFolderAction.TITLE,
      category: Categories.Developer,
      f1: true
    });
  }
  run(servicesAccessor) {
    return servicesAccessor.get(IInstantiationService).createInstance(OpenLogsFolderAction, OpenLogsFolderAction.ID, OpenLogsFolderAction.TITLE.value).run();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: OpenExtensionLogsFolderAction.ID,
      title: OpenExtensionLogsFolderAction.TITLE,
      category: Categories.Developer,
      f1: true
    });
  }
  run(servicesAccessor) {
    return servicesAccessor.get(IInstantiationService).createInstance(OpenExtensionLogsFolderAction, OpenExtensionLogsFolderAction.ID, OpenExtensionLogsFolderAction.TITLE.value).run();
  }
});
export {};
