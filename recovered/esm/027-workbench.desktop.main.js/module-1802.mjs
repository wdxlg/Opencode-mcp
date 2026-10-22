// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/github/browser/githubService.ts
import { Event2 } from "./module-0017.mjs";
import { deriveGitHubEndpoints } from "./module-1786.mjs";
import { GitHubService, IGitHubService } from "./module-1801.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/github/browser/githubService.ts
var WorkbenchGitHubEndpointProvider = class {
  constructor(_defaultAccountService) {
    this._defaultAccountService = _defaultAccountService;
    this.onDidChange = Event2.map(_defaultAccountService.onDidChangeDefaultAccount, () => void 0);
  }
  getApiBaseUri() {
    return this._getEndpoints().apiBaseUri;
  }
  getGraphQlUri() {
    return this._getEndpoints().graphQlUri;
  }
  _getEndpoints() {
    const authenticationProvider = this._defaultAccountService.getDefaultAccountAuthenticationProvider();
    const enterpriseUri = authenticationProvider.enterprise ? this._defaultAccountService.resolveGitHubUrl("") : void 0;
    return deriveGitHubEndpoints(enterpriseUri);
  }
};

var WorkbenchGitHubTokenProvider = class {
  constructor(_authenticationService, _defaultAccountService) {
    this._authenticationService = _authenticationService;
    this._defaultAccountService = _defaultAccountService;
    this.onDidChangeToken = Event2.any(
      Event2.map(Event2.filter(
        _authenticationService.onDidChangeSessions,
        (event) => event.providerId === _defaultAccountService.getDefaultAccountAuthenticationProvider().id
      ), () => void 0),
      Event2.map(_defaultAccountService.onDidChangeDefaultAccount, () => void 0)
    );
  }
  async getToken() {
    const provider = this._defaultAccountService.getDefaultAccountAuthenticationProvider();
    const defaultAccount = this._defaultAccountService.currentDefaultAccount ?? await this._defaultAccountService.getDefaultAccount();
    const sessions = await this._authenticationService.getSessions(provider.id, [], { silent: true }, true);
    const defaultSession = defaultAccount ? sessions.find((session) => session.id === defaultAccount.sessionId) : void 0;
    if (defaultAccount && !defaultSession) {
      return void 0;
    }
    if (defaultSession?.scopes.includes("repo")) {
      return defaultSession.accessToken;
    }
    const repositorySessions = await this._authenticationService.getSessions(provider.id, ["repo"], {
      createIfNone: true,
      ...defaultSession ? { account: defaultSession.account } : {}
    }, true);
    return repositorySessions.find((session) => !defaultSession || session.account.id === defaultSession.account.id)?.accessToken;
  }
};

var WorkbenchGitHubService = class extends GitHubService {
  constructor(authenticationService, defaultAccountService, logService) {
    super({
      endpoint: new WorkbenchGitHubEndpointProvider(defaultAccountService),
      tokenProvider: new WorkbenchGitHubTokenProvider(authenticationService, defaultAccountService)
    }, logService);
  }
};

WorkbenchGitHubService = __decorateClass([
  __decorateParam(0, IAuthenticationService),
  __decorateParam(1, IDefaultAccountService),
  __decorateParam(2, ILogService)
], WorkbenchGitHubService);

registerSingleton(IGitHubService, WorkbenchGitHubService, 1 /* Delayed */);
export { WorkbenchGitHubEndpointProvider, WorkbenchGitHubTokenProvider, WorkbenchGitHubService };
