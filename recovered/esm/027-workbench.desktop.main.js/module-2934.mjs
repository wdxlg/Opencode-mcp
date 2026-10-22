// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionsActivationProgress.ts
import { localize } from "./module-0001.mjs";
import { DeferredPromise, timeout } from "./module-0036.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionsActivationProgress.ts
var ExtensionActivationProgress = class {
  constructor(extensionService, progressService, logService) {
    const options3 = {
      location: 10 /* Window */,
      title: localize(15389, null)
    };
    let deferred;
    let count2 = 0;
    this._listener = extensionService.onWillActivateByEvent((e) => {
      logService.trace("onWillActivateByEvent: ", e.event);
      if (!deferred) {
        deferred = new DeferredPromise();
        progressService.withProgress(options3, (_) => deferred.p);
      }
      count2++;
      Promise.race([e.activation, timeout(5e3, CancellationToken.None)]).finally(() => {
        if (--count2 === 0) {
          deferred.complete(void 0);
          deferred = void 0;
        }
      });
    });
  }
  dispose() {
    this._listener.dispose();
  }
};

ExtensionActivationProgress = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IProgressService),
  __decorateParam(2, ILogService)
], ExtensionActivationProgress);
export { ExtensionActivationProgress };
