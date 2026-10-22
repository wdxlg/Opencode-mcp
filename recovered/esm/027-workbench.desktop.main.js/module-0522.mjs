// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/multiDiffEditor/utils.ts
import { ActionRunner } from "./module-0082.mjs";


// src/vs/editor/browser/widget/multiDiffEditor/utils.ts
var ActionRunnerWithContext = class extends ActionRunner {
  constructor(_getContext) {
    super();
    this._getContext = _getContext;
  }
  runAction(action, _context) {
    const ctx = this._getContext();
    return super.runAction(action, ctx);
  }
};
export { ActionRunnerWithContext };
