// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadGitExtensionService.ts
import { URI } from "./module-0032.mjs";
import { Disposable } from "./module-0012.mjs";
import { Sequencer } from "./module-0036.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { GitRepository } from "./module-1485.mjs";
import { waitForState } from "./module-0056.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IGitService } from "./module-1486.mjs";


// src/vs/workbench/api/browser/mainThreadGitExtensionService.ts
function toGitRefType(type) {
  switch (type) {
    case 0 /* Head */:
      return 0 /* Head */;
    case 1 /* RemoteHead */:
      return 1 /* RemoteHead */;
    case 2 /* Tag */:
      return 2 /* Tag */;
    default:
      throw new Error(`Unknown GitRefType: ${type}`);
  }
}

function toGitDiffChange(dto) {
  return {
    uri: URI.revive(dto.uri),
    originalUri: dto.originalUri ? URI.revive(dto.originalUri) : void 0,
    modifiedUri: dto.modifiedUri ? URI.revive(dto.modifiedUri) : void 0,
    insertions: dto.insertions,
    deletions: dto.deletions
  };
}

function toGitRepositoryState(dto) {
  return {
    HEAD: dto?.HEAD ? {
      type: toGitRefType(dto.HEAD.type),
      name: dto.HEAD.name,
      commit: dto.HEAD.commit,
      remote: dto.HEAD.remote,
      upstream: dto.HEAD.upstream,
      ahead: dto.HEAD.ahead,
      behind: dto.HEAD.behind
    } : void 0,
    remotes: dto?.remotes ?? [],
    mergeChanges: dto?.mergeChanges?.map((c) => ({
      uri: URI.revive(c.uri),
      originalUri: c.originalUri ? URI.revive(c.originalUri) : void 0,
      modifiedUri: c.modifiedUri ? URI.revive(c.modifiedUri) : void 0
    })) ?? [],
    indexChanges: dto?.indexChanges?.map((c) => ({
      uri: URI.revive(c.uri),
      originalUri: c.originalUri ? URI.revive(c.originalUri) : void 0,
      modifiedUri: c.modifiedUri ? URI.revive(c.modifiedUri) : void 0
    })) ?? [],
    workingTreeChanges: dto?.workingTreeChanges?.map((c) => ({
      uri: URI.revive(c.uri),
      originalUri: c.originalUri ? URI.revive(c.originalUri) : void 0,
      modifiedUri: c.modifiedUri ? URI.revive(c.modifiedUri) : void 0
    })) ?? [],
    untrackedChanges: dto?.untrackedChanges?.map((c) => ({
      uri: URI.revive(c.uri),
      originalUri: c.originalUri ? URI.revive(c.originalUri) : void 0,
      modifiedUri: c.modifiedUri ? URI.revive(c.modifiedUri) : void 0
    })) ?? []
  };
}

var MainThreadGitExtensionService = class extends Disposable {
  constructor(extHostContext, gitService) {
    super();
    this.gitService = gitService;
    this._openRepositorySequencer = new Sequencer();
    this._repositoryHandles = new ResourceMap();
    this._repositories = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostGitExtension);
    this._initializeDelegate();
  }
  get repositories() {
    return this._repositories.values();
  }
  async _initializeDelegate() {
    const isExtensionAvailable = await this._proxy.$isGitExtensionAvailable();
    if (isExtensionAvailable && !this._store.isDisposed) {
      this._register(this.gitService.setDelegate(this));
    }
  }
  async openRepository(uri5) {
    return this._openRepositorySequencer.queue(async () => {
      const result = await this._proxy.$openRepository(uri5);
      if (!result) {
        return void 0;
      }
      const repositoryRootUri = URI.revive(result.rootUri);
      const state = toGitRepositoryState(result.state);
      const repository = new GitRepository(repositoryRootUri, state, this);
      this._repositories.set(result.handle, repository);
      this._repositoryHandles.set(repositoryRootUri, result.handle);
      await waitForState(repository.state, (state2) => state2.HEAD !== void 0);
      return repository;
    });
  }
  async getRefs(root, query, token) {
    const handle2 = this._repositoryHandles.get(root);
    if (handle2 === void 0) {
      return [];
    }
    const result = await this._proxy.$getRefs(handle2, query, token);
    if (token?.isCancellationRequested) {
      return [];
    }
    return result.map((ref) => ({
      ...ref,
      type: toGitRefType(ref.type)
    }));
  }
  async diffBetweenWithStats(root, ref1, ref2, path) {
    const handle2 = this._repositoryHandles.get(root);
    if (handle2 === void 0) {
      return [];
    }
    const result = await this._proxy.$diffBetweenWithStats(handle2, ref1, ref2, path);
    return result.map(toGitDiffChange);
  }
  async diffBetweenWithStats2(root, ref, path) {
    const handle2 = this._repositoryHandles.get(root);
    if (handle2 === void 0) {
      return [];
    }
    const result = await this._proxy.$diffBetweenWithStats2(handle2, ref, path);
    return result.map(toGitDiffChange);
  }
  async $onDidChangeRepository(handle2) {
    const repository = this._repositories.get(handle2);
    if (!repository) {
      return;
    }
    const state = await this._proxy.$getRepositoryState(handle2);
    if (!state) {
      return;
    }
    repository.updateState(toGitRepositoryState(state));
  }
};

MainThreadGitExtensionService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadGitExtension),
  __decorateParam(1, IGitService)
], MainThreadGitExtensionService);
export { toGitRefType, toGitDiffChange, toGitRepositoryState, MainThreadGitExtensionService };
