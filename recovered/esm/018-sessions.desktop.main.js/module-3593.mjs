// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/models/githubRepositoryModel.ts
import { Disposable, ReferenceCollection } from "./module-0012.mjs";
import { GitHubRepositoryFetcher } from "./module-3592.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { observableValue } from "./module-0048.mjs";


// src/vs/sessions/contrib/github/browser/models/githubRepositoryModel.ts
var LOG_PREFIX3 = "[GitHubRepositoryModel]";

var GitHubRepositoryModelReferenceCollection = class extends ReferenceCollection {
  constructor(apiClient, _logService) {
    super();
    this._logService = _logService;
    this._fetcher = new GitHubRepositoryFetcher(apiClient);
  }
  createReferencedObject(key3, owner, repo) {
    this._logService.trace(`[GitHubRepositoryModelReferenceCollection][createReferencedObject] Creating repository model for ${key3}`);
    return new GitHubRepositoryModel(owner, repo, this._fetcher, this._logService);
  }
  destroyReferencedObject(key3, object2) {
    this._logService.trace(`[GitHubRepositoryModelReferenceCollection][destroyReferencedObject] Disposing repository model for ${key3}`);
    object2.dispose();
  }
};

GitHubRepositoryModelReferenceCollection = __decorateClass([
  __decorateParam(1, ILogService)
], GitHubRepositoryModelReferenceCollection);

var GitHubRepositoryModel = class extends Disposable {
  constructor(owner, repo, _fetcher, _logService) {
    super();
    this.owner = owner;
    this.repo = repo;
    this._fetcher = _fetcher;
    this._logService = _logService;
    this._repositoryEtag = void 0;
    this._repository = observableValue(this, void 0);
    this.repository = this._repository;
    this._refreshPromise = void 0;
  }
  refresh() {
    if (!this._refreshPromise) {
      this._refreshPromise = this._refresh().finally(() => {
        this._refreshPromise = void 0;
      });
    }
    return this._refreshPromise;
  }
  async _refresh() {
    try {
      const response = await this._fetcher.getRepository(this.owner, this.repo, this._repositoryEtag);
      if (response.statusCode === 200 && response.data) {
        this._repositoryEtag = response.etag;
        this._repository.set(response.data, void 0);
      }
    } catch (err) {
      this._logService.error(`${LOG_PREFIX3} Failed to refresh repository ${this.owner}/${this.repo}:`, err);
    }
  }
};
export { LOG_PREFIX3, GitHubRepositoryModelReferenceCollection, GitHubRepositoryModel };
