// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/git/browser/gitService.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { AutoOpenBarrier } from "./module-0036.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { observableValueOpts } from "./module-0050.mjs";
import { structuralEquals } from "./module-0042.mjs";


// src/vs/workbench/contrib/git/browser/gitService.ts
var GitService = class extends Disposable {
  constructor(logService) {
    super();
    this.logService = logService;
    this._delegateBarrier = new AutoOpenBarrier(1e4);
  }
  get repositories() {
    return this._delegate?.repositories ?? [];
  }
  setDelegate(delegate) {
    if (this._delegate) {
      this.logService.error("[GitService][setDelegate] GitExtension delegate is already set.");
      throw new BugIndicatingError("GitExtension delegate is already set.");
    }
    this._delegate = delegate;
    this._delegateBarrier.open();
    return toDisposable(() => {
      this._delegate = void 0;
    });
  }
  async openRepository(uri5) {
    await this._delegateBarrier.wait();
    if (!this._delegate) {
      this.logService.warn("[GitService][openRepository] GitExtension delegate is not set after 10 seconds. Cannot open repository.");
      return void 0;
    }
    return this._delegate.openRepository(uri5);
  }
};

GitService = __decorateClass([
  __decorateParam(0, ILogService)
], GitService);

var GitRepository = class extends Disposable {
  constructor(rootUri, initialState, delegate) {
    super();
    this.delegate = delegate;
    this.rootUri = rootUri;
    this.state = observableValueOpts({ owner: this, equalsFn: structuralEquals }, initialState);
  }
  updateState(state) {
    this.state.set(state, void 0);
  }
  async getRefs(query, token) {
    return this.delegate.getRefs(this.rootUri, query, token);
  }
  async diffBetweenWithStats(ref1, ref2, path) {
    return this.delegate.diffBetweenWithStats(this.rootUri, ref1, ref2, path);
  }
  async diffBetweenWithStats2(ref, path) {
    return this.delegate.diffBetweenWithStats2(this.rootUri, ref, path);
  }
};
export { GitService, GitRepository };
