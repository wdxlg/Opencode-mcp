// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/registerDefaultSessionTaskRunners.ts
import { Disposable } from "./module-0012.mjs";
import { WorkbenchSessionTaskRunner } from "./module-3547.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionTaskRunnerRegistry } from "./module-3533.mjs";


// src/vs/sessions/contrib/chat/browser/registerDefaultSessionTaskRunners.ts
var RegisterDefaultSessionTaskRunnersContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.sessions.registerDefaultTaskRunners";
  }
  constructor(instantiationService, registry4) {
    super();
    const runner = instantiationService.createInstance(WorkbenchSessionTaskRunner);
    this._register(registry4.register(runner));
  }
};

RegisterDefaultSessionTaskRunnersContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ISessionTaskRunnerRegistry)
], RegisterDefaultSessionTaskRunnersContribution);
export { RegisterDefaultSessionTaskRunnersContribution };
