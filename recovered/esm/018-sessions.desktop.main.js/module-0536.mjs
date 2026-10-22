// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/common/quickInput.ts
import { Schemas } from "./module-0033.mjs";
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/quickinput/common/quickInput.ts
function isKeyModified(keyMods) {
  return keyMods.ctrlCmd || keyMods.alt || keyMods.shift;
}

var NO_KEY_MODS = { ctrlCmd: false, alt: false, shift: false };

var QuickPickItemScorerAccessor = class {
  constructor(options3) {
    this.options = options3;
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
export { isKeyModified, NO_KEY_MODS, QuickPickItemScorerAccessor, quickPickItemScorerAccessor, IQuickInputService };
