// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/githubApiClient.ts
import { Disposable } from "./module-0012.mjs";
import { deriveGitHubEndpoints } from "./module-3590.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IRequestService, asJson } from "./module-0947.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/github/browser/githubApiClient.ts
var LOG_PREFIX2 = "[GitHubApiClient]";

var TRACE_PREFIX = "[PR-ICON-TRACE]";

var GitHubApiError = class extends Error {
  constructor(message, statusCode, rateLimitRemaining) {
    super(message);
    this.statusCode = statusCode;
    this.rateLimitRemaining = rateLimitRemaining;
    this.name = "GitHubApiError";
  }
};

var GitHubAuthenticationError = class extends Error {
  constructor() {
    super("No GitHub authentication sessions available");
    this.name = "GitHubAuthenticationError";
  }
};

var GitHubApiClient = class extends Disposable {
  constructor(_requestService, _authenticationService, _defaultAccountService, _logService) {
    super();
    this._requestService = _requestService;
    this._authenticationService = _authenticationService;
    this._defaultAccountService = _defaultAccountService;
    this._logService = _logService;
  }
  get enterpriseHost() {
    return this._getConnection().endpoints.enterpriseHost;
  }
  async request(method, path, callSite, options3) {
    const connection = this._getConnection();
    return this._request(method, `${connection.endpoints.apiBaseUri}${path}`, path, "application/vnd.github.v3+json", callSite, connection.authenticationProviderId, options3);
  }
  async graphql(query, callSite, variables, options3) {
    const connection = this._getConnection();
    const response = await this._request(
      "POST",
      connection.endpoints.graphQlUri,
      "/graphql",
      "application/vnd.github+json",
      callSite,
      connection.authenticationProviderId,
      { ...options3, data: { query, variables } }
    );
    if (response.data?.errors?.length) {
      throw new GitHubApiError(
        response.data.errors.map((error) => error.message).join("; "),
        200,
        void 0
      );
    }
    if (!response.data?.data) {
      throw new GitHubApiError("GitHub GraphQL response did not include data", 200, void 0);
    }
    return response.data.data;
  }
  _getConnection() {
    const authenticationProvider = this._defaultAccountService.getDefaultAccountAuthenticationProvider();
    const enterpriseUri = authenticationProvider.enterprise ? this._defaultAccountService.resolveGitHubUrl("") : void 0;
    return {
      authenticationProviderId: authenticationProvider.id,
      endpoints: deriveGitHubEndpoints(enterpriseUri)
    };
  }
  async _request(method, url, pathForLogging, accept, callSite, authenticationProviderId, options3) {
    const token = await this._getAuthToken(authenticationProviderId, options3?.createAuthenticationSession !== false);
    this._logService.trace(`${LOG_PREFIX2} ${method} ${pathForLogging}`);
    this._logService.trace(`${TRACE_PREFIX} [GitHubApiClient] -> ${method} ${pathForLogging} (callSite ${callSite}${options3?.etag !== void 0 ? `, ifNoneMatch ${options3.etag}` : ""})`);
    const response = await this._requestService.request({
      type: method,
      url,
      headers: {
        "Authorization": `token ${token}`,
        "Accept": accept,
        "User-Agent": "VSCode-Sessions-GitHub",
        ...options3?.etag !== void 0 ? { "If-None-Match": options3.etag } : {},
        ...options3?.data !== void 0 ? { "Content-Type": "application/json" } : {}
      },
      data: options3?.data !== void 0 ? JSON.stringify(options3.data) : void 0,
      // The renderer cache can return stale 200 responses despite ETag polling.
      disableCache: true,
      callSite
    }, options3?.token ?? CancellationToken.None);
    const rateLimitRemaining = parseRateLimitHeader(response.res.headers?.["x-ratelimit-remaining"]);
    if (rateLimitRemaining !== void 0 && rateLimitRemaining < 100) {
      this._logService.warn(`${LOG_PREFIX2} GitHub API rate limit low: ${rateLimitRemaining} remaining`);
    }
    const statusCode = response.res.statusCode ?? 0;
    const responseETag = response.res.headers?.["etag"];
    this._logService.trace(`${TRACE_PREFIX} [GitHubApiClient] <- ${method} ${pathForLogging} status ${statusCode}${responseETag ? `, etag ${responseETag}` : ""}${rateLimitRemaining !== void 0 ? `, rateLimitRemaining ${rateLimitRemaining}` : ""} (callSite ${callSite})`);
    if (statusCode === 204 || statusCode === 304) {
      return { data: void 0, statusCode, etag: responseETag };
    }
    if (statusCode < 200 || statusCode >= 300) {
      const errorBody = await asJson(response).catch(() => void 0);
      throw new GitHubApiError(
        errorBody?.message ?? `GitHub API request failed: ${method} ${pathForLogging} (${statusCode})`,
        statusCode,
        rateLimitRemaining
      );
    }
    const data = await asJson(response);
    if (!data) {
      throw new GitHubApiError(
        `Failed to parse response for ${method} ${pathForLogging}`,
        statusCode,
        rateLimitRemaining
      );
    }
    return { data, statusCode, etag: responseETag };
  }
  async _getAuthToken(authenticationProviderId, createIfNone) {
    let sessions = await this._authenticationService.getSessions(authenticationProviderId, [], { silent: true });
    if ((!sessions || sessions.length === 0) && createIfNone) {
      sessions = await this._authenticationService.getSessions(authenticationProviderId, [], { createIfNone: true });
    }
    if (!sessions || sessions.length === 0) {
      throw new GitHubAuthenticationError();
    }
    const repoScopeSession = sessions.find((session) => session.scopes.includes("repo"));
    return repoScopeSession?.accessToken ?? sessions[0].accessToken ?? "";
  }
};

GitHubApiClient = __decorateClass([
  __decorateParam(0, IRequestService),
  __decorateParam(1, IAuthenticationService),
  __decorateParam(2, IDefaultAccountService),
  __decorateParam(3, ILogService)
], GitHubApiClient);

function parseRateLimitHeader(value2) {
  if (value2 === void 0) {
    return void 0;
  }
  const str = Array.isArray(value2) ? value2[0] : value2;
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? void 0 : parsed;
}
export { parseRateLimitHeader, LOG_PREFIX2, TRACE_PREFIX, GitHubApiError, GitHubAuthenticationError, GitHubApiClient };
