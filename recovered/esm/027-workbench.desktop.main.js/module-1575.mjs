// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workspaces/common/workspaceFolderLabelService.ts
import { createDecorator } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/workspaces/common/workspaceFolderLabelService.ts
var IWorkspaceFolderLabelService = createDecorator("workspaceFolderLabelService");

var WorkspaceFolderLabelService = class {
  getWorkspaceFolderLabel(_folder, _verbose) {
    return void 0;
  }
};

registerSingleton(IWorkspaceFolderLabelService, WorkspaceFolderLabelService, 1 /* Delayed */);
export { IWorkspaceFolderLabelService, WorkspaceFolderLabelService };
