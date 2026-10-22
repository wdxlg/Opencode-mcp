// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/url/browser/externalUriResolver.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0915.mjs";


// src/vs/workbench/contrib/url/browser/externalUriResolver.ts
var ExternalUriResolverContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.externalUriResolver";
  }
  constructor(_openerService, _workbenchEnvironmentService) {
    super();
    if (_workbenchEnvironmentService.options?.resolveExternalUri) {
      this._register(_openerService.registerExternalUriResolver({
        resolveExternalUri: async (resource) => {
          return {
            resolved: await _workbenchEnvironmentService.options.resolveExternalUri(resource),
            dispose: () => {
            }
          };
        }
      }));
    }
  }
};

ExternalUriResolverContribution = __decorateClass([
  __decorateParam(0, IOpenerService),
  __decorateParam(1, IBrowserWorkbenchEnvironmentService)
], ExternalUriResolverContribution);
export { ExternalUriResolverContribution };
