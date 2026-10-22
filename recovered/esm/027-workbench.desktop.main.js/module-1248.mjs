// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadProgress.ts
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { toAction } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/api/browser/mainThreadProgress.ts
var MainThreadProgress = class {
  constructor(extHostContext, progressService, _commandService) {
    this._commandService = _commandService;
    this._progress = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostProgress);
    this._progressService = progressService;
  }
  dispose() {
    this._progress.forEach((handle2) => handle2.resolve());
    this._progress.clear();
  }
  async $startProgress(handle2, options3, extensionId) {
    const task = this._createTask(handle2);
    if (options3.location === 15 /* Notification */ && extensionId) {
      const sourceIsUrgent = MainThreadProgress.URGENT_PROGRESS_SOURCES.includes(extensionId);
      const notificationOptions = {
        ...options3,
        priority: sourceIsUrgent ? 3 /* URGENT */ : 0 /* DEFAULT */,
        location: 15 /* Notification */,
        secondaryActions: [toAction({
          id: extensionId,
          label: localize(5733, null),
          run: () => this._commandService.executeCommand("_extensions.manage", extensionId)
        })]
      };
      options3 = notificationOptions;
    }
    try {
      this._progressService.withProgress(options3, task, () => this._proxy.$acceptProgressCanceled(handle2));
    } catch (err) {
      onUnexpectedExternalError(err);
    }
  }
  $progressReport(handle2, message) {
    const entry = this._progress.get(handle2);
    entry?.progress.report(message);
  }
  $progressEnd(handle2) {
    const entry = this._progress.get(handle2);
    if (entry) {
      entry.resolve();
      this._progress.delete(handle2);
    }
  }
  _createTask(handle2) {
    return (progress) => {
      return new Promise((resolve3) => {
        this._progress.set(handle2, { resolve: resolve3, progress });
      });
    };
  }
};

MainThreadProgress.URGENT_PROGRESS_SOURCES = [
  "vscode.github-authentication",
  "vscode.microsoft-authentication"
];

MainThreadProgress = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadProgress),
  __decorateParam(1, IProgressService),
  __decorateParam(2, ICommandService)
], MainThreadProgress);
export { MainThreadProgress };
