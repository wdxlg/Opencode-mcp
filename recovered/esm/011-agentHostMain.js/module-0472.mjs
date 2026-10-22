// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/github/common/githubService.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable } from "./module-0010.mjs";
import { GitHubTransport } from "./module-0462.mjs";
import { GitHubCredentialService } from "./module-0463.mjs";
import { GitHubHostCapabilitiesService } from "./module-0464.mjs";
import { PullRequestQueryService } from "./module-0469.mjs";
import { PullRequestResourceService } from "./module-0471.mjs";
import { PullRequestMutationService } from "./module-0467.mjs";
import { GitHubQueryService } from "./module-0466.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/github/common/githubService.ts
var IGitHubService = createDecorator("gitHubService");

var GitHubService = class extends Disposable {
  constructor(options, _logService) {
    super();
    this._logService = _logService;
    this._logService.debug("[GitHubService] Initializing reusable GitHub service");
    this.endpoint = options.endpoint;
    this.transport = this._register(new GitHubTransport(options.fetch, void 0, false, this._logService));
    this.credentials = this._register(new GitHubCredentialService(void 0, void 0, this.transport, options.tokenProvider, options.endpoint, this._logService));
    this.capabilities = this._register(new GitHubHostCapabilitiesService(void 0, void 0, this.transport, options.endpoint, this._logService));
    const pullRequestQuery = new PullRequestQueryService(this.transport, this.capabilities, options.endpoint, this._logService);
    this.pullRequests = this._register(new PullRequestResourceService(
      void 0,
      void 0,
      this.credentials,
      pullRequestQuery,
      this._logService
    ));
    this.mutations = this._register(new PullRequestMutationService(
      void 0,
      this.credentials,
      this.transport,
      this.pullRequests,
      options.endpoint,
      this._logService
    ));
    this.query = this._register(new GitHubQueryService(
      void 0,
      void 0,
      this.credentials,
      this.transport,
      options.endpoint,
      this.capabilities,
      this._logService
    ));
    this._logService.debug("[GitHubService] Reusable GitHub service initialized");
  }
  dispose() {
    this._logService.debug("[GitHubService] Disposing reusable GitHub service");
    super.dispose();
  }
};

GitHubService = __decorateClass([
  __decorateParam(1, ILogService)
], GitHubService);
export { IGitHubService, GitHubService };
