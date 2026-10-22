// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/fileTreeView/browser/fileTreeView.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { GitHubFileSystemProvider } from "./module-3759.mjs";
import { GITHUB_REMOTE_FILE_SCHEME } from "./module-1767.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/fileTreeView/browser/fileTreeView.contribution.ts
var GitHubFileSystemProviderContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.githubFileSystemProvider";
  }
  constructor(fileService, instantiationService) {
    super();
    const provider = this._register(instantiationService.createInstance(GitHubFileSystemProvider));
    this._register(fileService.registerProvider(GITHUB_REMOTE_FILE_SCHEME, provider));
  }
};

GitHubFileSystemProviderContribution = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IInstantiationService)
], GitHubFileSystemProviderContribution);

registerWorkbenchContribution2(
  GitHubFileSystemProviderContribution.ID,
  GitHubFileSystemProviderContribution,
  WorkbenchPhase.AfterRestored
);
export { GitHubFileSystemProviderContribution };
