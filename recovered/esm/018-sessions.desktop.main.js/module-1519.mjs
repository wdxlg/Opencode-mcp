// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/tree/treeDefaults.ts
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/base/browser/ui/tree/treeDefaults.ts
var CollapseAllAction = class extends Action {
  constructor(viewer, enabled) {
    super("vs.tree.collapse", localize(45, null), "collapse-all", enabled);
    this.viewer = viewer;
  }
  async run() {
    this.viewer.collapseAll();
    this.viewer.setSelection([]);
    this.viewer.setFocus([]);
  }
};
export { CollapseAllAction };
