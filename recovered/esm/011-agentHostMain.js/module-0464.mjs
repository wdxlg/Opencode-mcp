// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/github/common/githubHostCapabilitiesService.ts
import { Disposable } from "./module-0010.mjs";
import { systemGitHubScheduler } from "./module-0458.mjs";
import { gitHubBackoffDelay } from "./module-0459.mjs";


// src/vs/platform/github/common/githubHostCapabilitiesService.ts
var unavailableCapabilities = {
  graphql: false,
  mergeQueue: false,
  internalMergeStatus: false,
  reviewThreads: false,
  checkContextRequiredness: false
};

var capabilitiesQuery = `query AgentHostGitHubCapabilities {
	pullRequest: __type(name: "PullRequest") { fields { name } }
	repository: __type(name: "Repository") { fields { name } }
	requirableByPullRequest: __type(name: "RequirableByPullRequest") { name }
	rateLimit { limit remaining used resetAt }
}`;

var defaultProbeBackoff = {
  immediateRetries: 0,
  base: 6e4,
  maximum: 9e5,
  jitter: 5e3
};

var GitHubHostCapabilitiesService = class extends Disposable {
  constructor(scheduler, _policy = defaultProbeBackoff, _transport, _endpointService, _logService) {
    super();
    this._policy = _policy;
    this._transport = _transport;
    this._endpointService = _endpointService;
    this._logService = _logService;
    this._cache = /* @__PURE__ */ new Map();
    this._degraded = /* @__PURE__ */ new Map();
    this._scheduler = scheduler ?? systemGitHubScheduler;
    this._register(this._endpointService.onDidChange(() => this.clear()));
  }
  getCapabilities(credential, enterpriseVersion, signal) {
    if (signal.aborted) {
      return Promise.reject(signal.reason);
    }
    const key = `${credential.account.host.toLowerCase()}\0${enterpriseVersion ?? ""}`;
    const degraded = this._degraded.get(key);
    if (degraded && degraded.generation !== credential.generation) {
      this._degraded.delete(key);
      this._logService?.debug(`[GitHubHostCapabilitiesService] Discarding degraded capabilities for ${credential.account.host} because the credential changed`);
    } else if (degraded && this._scheduler.now() < degraded.retryAt) {
      this._logService?.trace(`[GitHubHostCapabilitiesService] Reusing degraded capabilities for ${credential.account.host} for another ${degraded.retryAt - this._scheduler.now()}ms`);
      return Promise.resolve(degraded.capabilities);
    }
    let cached = this._cache.get(key);
    if (!cached) {
      this._logService?.debug(`[GitHubHostCapabilitiesService] Probing capabilities for ${credential.account.host}${enterpriseVersion ? ` (${enterpriseVersion})` : ""}`);
      const controller = new AbortController();
      const entry = {
        controller,
        promise: this._probe(credential, controller.signal).then((result) => {
          if (result.cache) {
            this._degraded.delete(key);
          } else {
            this._recordDegraded(key, credential, result.capabilities);
            if (this._cache.get(key) === entry) {
              this._cache.delete(key);
            }
          }
          this._logService?.debug(`[GitHubHostCapabilitiesService] Capabilities for ${credential.account.host}: ${formatCapabilities(result.capabilities)} (cached: ${result.cache})`);
          return result.capabilities;
        }).catch((error) => {
          if (this._cache.get(key) === entry) {
            this._cache.delete(key);
          }
          this._logService?.debug(`[GitHubHostCapabilitiesService] Capability probe failed for ${credential.account.host} (${capabilityErrorKind(error)})`);
          throw error;
        }).finally(() => entry.settled = true),
        waiters: 0,
        settled: false
      };
      cached = entry;
      this._cache.set(key, cached);
    } else {
      this._logService?.trace(`[GitHubHostCapabilitiesService] Reusing capability probe for ${credential.account.host}${enterpriseVersion ? ` (${enterpriseVersion})` : ""}`);
    }
    cached.waiters++;
    return waitForCapabilities(cached.promise, signal).finally(() => {
      cached.waiters--;
      if (cached.waiters === 0 && !cached.settled && this._cache.get(key) === cached) {
        this._cache.delete(key);
        cached.controller.abort(new Error("All GitHub capability waiters cancelled"));
      }
    });
  }
  clear() {
    if (this._cache.size > 0) {
      this._logService?.debug(`[GitHubHostCapabilitiesService] Clearing ${this._cache.size} cached capability probe(s)`);
    }
    for (const entry of this._cache.values()) {
      entry.controller.abort(new Error("GitHub capability cache was cleared"));
    }
    this._cache.clear();
    this._degraded.clear();
  }
  dispose() {
    this.clear();
    super.dispose();
  }
  _recordDegraded(key, credential, capabilities) {
    const previous = this._degraded.get(key);
    const attempts = (previous?.generation === credential.generation ? previous.attempts : 0) + 1;
    const delay = gitHubBackoffDelay(this._policy, this._scheduler, attempts);
    this._degraded.set(key, { capabilities, attempts, retryAt: this._scheduler.now() + delay, generation: credential.generation });
    this._logService?.debug(`[GitHubHostCapabilitiesService] Reusing degraded capabilities for ${credential.account.host} for ${delay}ms after ${attempts} unusable probe(s)`);
  }
  async _probe(credential, signal) {
    const response = await this._transport.graphql(
      credential.account,
      credential.token,
      this._endpointService.getGraphQlUri(),
      capabilitiesQuery,
      {},
      AbortSignal.any([signal, credential.signal]),
      "enrichment"
    );
    if (response.errors.length > 0) {
      const schemaValidation = response.errors.every(isSchemaValidationError);
      const detail = response.errors.map(formatGraphQLError).join("; ");
      if (schemaValidation) {
        this._logService?.debug(`[GitHubHostCapabilitiesService] Host ${credential.account.host} lacks the expected GraphQL schema, disabling GraphQL capabilities: ${detail}`);
      } else {
        this._logService?.warn(`[GitHubHostCapabilitiesService] Capability probe for ${credential.account.host} returned errors, disabling GraphQL capabilities: ${detail}`);
      }
      return {
        capabilities: unavailableCapabilities,
        cache: schemaValidation
      };
    }
    if (!response.data?.pullRequest) {
      this._logService?.warn(`[GitHubHostCapabilitiesService] Capability probe for ${credential.account.host} did not return the PullRequest type, disabling GraphQL capabilities`);
      return { capabilities: unavailableCapabilities, cache: false };
    }
    const pullRequestFields = fieldNames(response.data.pullRequest);
    const repositoryFields = fieldNames(response.data.repository);
    return {
      capabilities: {
        graphql: true,
        mergeQueue: pullRequestFields.has("mergeQueueEntry") && repositoryFields.has("mergeQueue"),
        internalMergeStatus: false,
        reviewThreads: pullRequestFields.has("reviewThreads"),
        checkContextRequiredness: typeof response.data.requirableByPullRequest?.name === "string"
      },
      cache: true
    };
  }
};

function formatCapabilities(capabilities) {
  return [
    `graphql=${capabilities.graphql}`,
    `mergeQueue=${capabilities.mergeQueue}`,
    `reviewThreads=${capabilities.reviewThreads}`,
    `checkContextRequiredness=${capabilities.checkContextRequiredness}`
  ].join(", ");
}

function capabilityErrorKind(error) {
  return error instanceof Error ? error.name : typeof error;
}

function formatGraphQLError(error) {
  const kind = error.type ?? error.extensions?.code;
  return kind ? `${kind}: ${error.message ?? "no message"}` : error.message ?? "unknown error";
}

function waitForCapabilities(promise, signal) {
  return new Promise((resolve3, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    void promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve3(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      }
    );
  });
}

function isSchemaValidationError(error) {
  const type = error.type?.toUpperCase();
  const code = error.extensions?.code?.toUpperCase();
  return type === "VALIDATION" || type === "GRAPHQL_VALIDATION_ERROR" || type === "GRAPHQL_VALIDATION_FAILED" || code === "UNDEFINEDFIELD" || code === "ARGUMENTNOTACCEPTED" || code === "VARIABLEMISMATCH";
}

function fieldNames(type) {
  const result = /* @__PURE__ */ new Set();
  for (const field of type?.fields ?? []) {
    if (typeof field.name === "string") {
      result.add(field.name);
    }
  }
  return result;
}
export { formatCapabilities, capabilityErrorKind, formatGraphQLError, waitForCapabilities, isSchemaValidationError, fieldNames, unavailableCapabilities, capabilitiesQuery, defaultProbeBackoff, GitHubHostCapabilitiesService };
