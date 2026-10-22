// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/checksViewModel.ts
import { Disposable } from "./module-0012.mjs";
import { derived } from "./module-0054.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IGitHubService } from "./module-3607.mjs";


// src/vs/sessions/contrib/changes/browser/checksViewModel.ts
var ChecksViewModel = class extends Disposable {
  constructor(gitHubService) {
    super();
    this.checksObs = derived(this, (reader) => {
      return gitHubService.activeSessionPullRequestCIObs.read(reader);
    });
  }
};

ChecksViewModel = __decorateClass([
  __decorateParam(0, IGitHubService)
], ChecksViewModel);
export { ChecksViewModel };
