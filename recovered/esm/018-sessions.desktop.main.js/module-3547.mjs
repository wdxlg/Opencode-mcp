// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/workbenchSessionTaskRunner.ts
import { Schemas } from "./module-0033.mjs";
import { toDisposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITaskService } from "./module-1403.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/sessions/contrib/chat/browser/workbenchSessionTaskRunner.ts
var WorkbenchSessionTaskRunner = class {
  constructor(_taskService, _workspaceContextService) {
    this._taskService = _taskService;
    this._workspaceContextService = _workspaceContextService;
    this.id = "workbench";
    this.priority = 0;
  }
  canRun(session) {
    const cwd2 = this._getCwd(session);
    if (!cwd2 || cwd2.scheme !== Schemas.file) {
      return false;
    }
    return !!this._workspaceContextService.getWorkspaceFolder(cwd2);
  }
  async runTask(task, session) {
    const cwd2 = this._getCwd(session);
    if (!cwd2) {
      return void 0;
    }
    const workspaceFolder = this._workspaceContextService.getWorkspaceFolder(cwd2);
    if (!workspaceFolder) {
      return void 0;
    }
    const resolved = await this._taskService.getTask(workspaceFolder, task.label);
    if (!resolved) {
      return void 0;
    }
    await this._taskService.run(resolved, void 0, 1 /* User */);
    return toDisposable(() => {
      this._taskService.terminate(resolved);
    });
  }
  _getCwd(session) {
    const repo = session.workspace.get()?.folders[0];
    return repo?.workingDirectory ?? repo?.root;
  }
};

WorkbenchSessionTaskRunner = __decorateClass([
  __decorateParam(0, ITaskService),
  __decorateParam(1, IWorkspaceContextService)
], WorkbenchSessionTaskRunner);
export { WorkbenchSessionTaskRunner };
