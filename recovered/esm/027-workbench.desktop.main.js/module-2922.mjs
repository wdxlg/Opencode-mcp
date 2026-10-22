// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionEnablementWorkspaceTrustTransitionParticipant.ts
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IHostService } from "./module-1117.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IWorkbenchExtensionEnablementService } from "./module-1046.mjs";
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService } from "./module-0854.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionEnablementWorkspaceTrustTransitionParticipant.ts
var ExtensionEnablementWorkspaceTrustTransitionParticipant = class extends Disposable {
  constructor(extensionService, hostService, environmentService, extensionEnablementService, workspaceTrustEnablementService, workspaceTrustManagementService) {
    super();
    if (workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
      workspaceTrustManagementService.workspaceTrustInitialized.then(() => {
        const workspaceTrustTransitionParticipant = new class {
          async participate(trusted) {
            if (trusted) {
              await extensionEnablementService.updateExtensionsEnablementsWhenWorkspaceTrustChanges();
            } else {
              if (environmentService.remoteAuthority) {
                hostService.reload();
              } else {
                const stopped = await extensionService.stopExtensionHosts(localize(15039, null));
                await extensionEnablementService.updateExtensionsEnablementsWhenWorkspaceTrustChanges();
                if (stopped) {
                  extensionService.startExtensionHosts();
                }
              }
            }
          }
        }();
        this._register(workspaceTrustManagementService.addWorkspaceTrustTransitionParticipant(workspaceTrustTransitionParticipant));
      });
    }
  }
};

ExtensionEnablementWorkspaceTrustTransitionParticipant = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IHostService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IWorkbenchExtensionEnablementService),
  __decorateParam(4, IWorkspaceTrustEnablementService),
  __decorateParam(5, IWorkspaceTrustManagementService)
], ExtensionEnablementWorkspaceTrustTransitionParticipant);
export { ExtensionEnablementWorkspaceTrustTransitionParticipant };
