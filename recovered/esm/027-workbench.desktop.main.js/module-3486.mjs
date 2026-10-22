// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remote/browser/showCandidate.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteExplorerService } from "./module-1414.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0915.mjs";


// src/vs/workbench/contrib/remote/browser/showCandidate.ts
var ShowCandidateContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.showPortCandidate";
  }
  constructor(remoteExplorerService, environmentService) {
    super();
    const showPortCandidate = environmentService.options?.tunnelProvider?.showPortCandidate;
    if (showPortCandidate) {
      this._register(remoteExplorerService.setCandidateFilter(async (candidates) => {
        const filters2 = await Promise.all(candidates.map((candidate) => showPortCandidate(candidate.host, candidate.port, candidate.detail ?? "")));
        const filteredCandidates = [];
        if (filters2.length !== candidates.length) {
          return candidates;
        }
        for (let i2 = 0; i2 < candidates.length; i2++) {
          if (filters2[i2]) {
            filteredCandidates.push(candidates[i2]);
          }
        }
        return filteredCandidates;
      }));
    }
  }
};

ShowCandidateContribution = __decorateClass([
  __decorateParam(0, IRemoteExplorerService),
  __decorateParam(1, IBrowserWorkbenchEnvironmentService)
], ShowCandidateContribution);
export { ShowCandidateContribution };
