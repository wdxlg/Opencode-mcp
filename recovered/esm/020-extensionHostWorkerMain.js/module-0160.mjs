// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/quickinput/common/quickInput.ts
import { Schemas } from "./module-0031.mjs";
import { createDecorator } from "./module-0038.mjs";


// src/vs/platform/quickinput/common/quickInput.ts
var QuickPickItemScorerAccessor = class {
  constructor(options2) {
    this.options = options2;
  }
  getItemLabel(entry) {
    return entry.label;
  }
  getItemDescription(entry) {
    if (this.options?.skipDescription) {
      return void 0;
    }
    return entry.description;
  }
  getItemPath(entry) {
    if (this.options?.skipPath) {
      return void 0;
    }
    if (entry.resource?.scheme === Schemas.file) {
      return entry.resource.fsPath;
    }
    return entry.resource?.path;
  }
};

var quickPickItemScorerAccessor = new QuickPickItemScorerAccessor();

var IQuickInputService = createDecorator("quickInputService");
export { QuickPickItemScorerAccessor, quickPickItemScorerAccessor, IQuickInputService };
