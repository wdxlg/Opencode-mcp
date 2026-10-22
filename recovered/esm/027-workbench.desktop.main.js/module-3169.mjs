// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugTitle.ts
import { dispose } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1057.mjs";
import { IHostService } from "./module-1117.mjs";
import { ITitleService } from "./module-1595.mjs";


// src/vs/workbench/contrib/debug/browser/debugTitle.ts
var DebugTitleContribution = class {
  constructor(debugService, hostService, titleService) {
    this.toDispose = [];
    const updateTitle = () => {
      if (debugService.state === 2 /* Stopped */ && !hostService.hasFocus) {
        titleService.updateProperties({ prefix: "\u{1F534}" });
      } else {
        titleService.updateProperties({ prefix: "" });
      }
    };
    this.toDispose.push(debugService.onDidChangeState(updateTitle));
    this.toDispose.push(hostService.onDidChangeFocus(updateTitle));
  }
  dispose() {
    dispose(this.toDispose);
  }
};

DebugTitleContribution = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IHostService),
  __decorateParam(2, ITitleService)
], DebugTitleContribution);
export { DebugTitleContribution };
