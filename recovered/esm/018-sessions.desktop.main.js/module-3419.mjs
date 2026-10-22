// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/telemetry/scmAdapter.ts
import { WeakCachedFunction } from "./module-0027.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISCMService } from "./module-1081.mjs";
import { derived } from "./module-0054.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/telemetry/scmAdapter.ts
var ScmAdapter = class {
  constructor(_scmService) {
    this._scmService = _scmService;
    this._repos = new WeakCachedFunction((repo) => new ScmRepoAdapter(repo));
    this._reposChangedSignal = observableSignalFromEvent(this, Event2.any(this._scmService.onDidAddRepository, this._scmService.onDidRemoveRepository));
  }
  getRepo(uri4, reader) {
    this._reposChangedSignal.read(reader);
    const repo = this._scmService.getRepository(uri4);
    if (!repo) {
      return void 0;
    }
    return this._repos.get(repo);
  }
};

ScmAdapter = __decorateClass([
  __decorateParam(0, ISCMService)
], ScmAdapter);

var ScmRepoAdapter = class {
  constructor(_repo) {
    this._repo = _repo;
    this.headBranchNameObs = derived((reader) => this._repo.provider.historyProvider.read(reader)?.historyItemRef.read(reader)?.name);
    this.headCommitHashObs = derived((reader) => this._repo.provider.historyProvider.read(reader)?.historyItemRef.read(reader)?.revision);
  }
  async isIgnored(uri4) {
    return false;
  }
};
export { ScmAdapter, ScmRepoAdapter };
