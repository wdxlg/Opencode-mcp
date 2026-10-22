// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/github/common/githubCredentialService.ts
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { GitHubBackoffGate } from "./module-0459.mjs";
import { systemGitHubScheduler } from "./module-0458.mjs";
import { GitHubRequestError } from "./module-0462.mjs";


// src/vs/platform/github/common/githubCredentialService.ts
var defaultBackoffPolicy = {
  immediateRetries: 1,
  base: 5e3,
  maximum: 12e4,
  decay: 3e5,
  jitter: 2e3
};

var GitHubCredentialService = class extends Disposable {
  constructor(scheduler, policy = defaultBackoffPolicy, _transport, _tokenProvider, _endpointProvider, _logService) {
    super();
    this._transport = _transport;
    this._tokenProvider = _tokenProvider;
    this._endpointProvider = _endpointProvider;
    this._logService = _logService;
    this._onDidInvalidate = this._register(new Emitter());
    this.onDidInvalidate = this._onDidInvalidate.event;
    this._generation = 0;
    this._backoff = this._register(new GitHubBackoffGate("GitHub identity resolution", policy, scheduler ?? systemGitHubScheduler, _logService));
    if (this._tokenProvider.onDidChangeToken) {
      this._register(this._tokenProvider.onDidChangeToken(() => this._invalidateCurrent("replacement")));
    }
    this._register(this._endpointProvider.onDidChange(() => this._invalidateCurrent("endpoint")));
  }
  async getCredential(signal) {
    const token = await this._tokenProvider.getToken(signal);
    if (!token) {
      this._logService?.debug("[GitHubCredentialService] Token provider returned no credential");
      throw new GitHubRequestError("GitHub authentication is required", "authentication");
    }
    return this._resolve(token, signal);
  }
  async resolveCredential(token, signal) {
    const current = await this._tokenProvider.getToken(signal);
    if (current !== token) {
      this._logService?.debug("[GitHubCredentialService] Rejected credential resolution for a non-current token");
      throw new GitHubRequestError("GitHub authentication is required", "authentication");
    }
    return this._resolve(token, signal);
  }
  handleRequestError(credential, error) {
    if (!(error instanceof GitHubRequestError) || error.kind !== "authentication") {
      return;
    }
    if (credential.signal.aborted || this._current?.generation !== credential.generation || this._current.token !== credential.token) {
      this._logService?.trace(`[GitHubCredentialService] Ignoring authentication error for stale generation ${credential.generation}`);
      return;
    }
    this._logService?.debug(`[GitHubCredentialService] Invalidating generation ${credential.generation} after an authentication error`);
    this._invalidateCurrent("authentication");
    this._tokenProvider.invalidateToken?.(credential.token);
  }
  dispose() {
    this._invalidateCurrent("shutdown");
    super.dispose();
  }
  async _resolve(token, signal) {
    if (signal.aborted) {
      throw signal.reason;
    }
    if (await this._backoff.wait(this._backoffKey(token, this._currentHost()), signal)) {
      if (await this._tokenProvider.getToken(signal) !== token) {
        this._logService?.debug("[GitHubCredentialService] Abandoning a credential that was replaced while backing off");
        throw new GitHubRequestError("GitHub authentication is required", "authentication");
      }
    }
    if (signal.aborted) {
      throw signal.reason;
    }
    if (!this._current || this._current.token !== token) {
      const previousCredential = this._lastCredential;
      this._invalidateCurrent("replacement");
      const generation = ++this._generation;
      const controller = new AbortController();
      const apiBaseUri = this._endpointProvider.getApiBaseUri();
      const host = new URL(apiBaseUri).host.toLowerCase();
      this._logService?.debug(`[GitHubCredentialService] Resolving account identity for ${host} (generation ${generation})`);
      const current = {
        token,
        generation,
        host,
        controller,
        promise: this._resolveIdentity(token, generation, host, apiBaseUri, controller.signal).then((credential) => {
          current.credential = credential;
          this._logService?.debug(`[GitHubCredentialService] Resolved account identity for ${host} (generation ${generation})`);
          if (previousCredential && !sameAccount(previousCredential.account, credential.account)) {
            this._logService?.debug(`[GitHubCredentialService] Account changed on ${host} at generation ${generation}`);
            this._onDidInvalidate.fire({ credential: previousCredential, reason: "account" });
          }
          this._lastCredential = credential;
          return credential;
        }).catch((error) => {
          if (this._current === current) {
            this._current = void 0;
          }
          if (!controller.signal.aborted) {
            this._backoff.fail(this._backoffKey(token, host));
          }
          this._logService?.debug(`[GitHubCredentialService] Account identity resolution failed for ${host} (generation ${generation}, ${credentialErrorKind(error)})`);
          throw error;
        })
      };
      this._current = current;
    }
    return waitForCredential(this._current.promise, signal);
  }
  /**
   * Names the credential the gate holds back. Two different tokens, or the
   * same token against two hosts, have not each been refused.
   */
  _backoffKey(token, host) {
    return `${host}\0${token}`;
  }
  _currentHost() {
    return new URL(this._endpointProvider.getApiBaseUri()).host.toLowerCase();
  }
  async _resolveIdentity(token, generation, host, apiBaseUri, signal) {
    const bootstrapAccount = { host, accountId: `bootstrap:${generation}` };
    let response;
    try {
      response = await this._transport.rest(bootstrapAccount, token, {
        method: "GET",
        url: `${apiBaseUri}/user`,
        etag: false,
        unconditional: true,
        priority: "interactive"
      }, signal);
    } catch (error) {
      if (error instanceof GitHubRequestError && error.kind === "authentication") {
        this._tokenProvider.invalidateToken?.(token);
      }
      throw error;
    } finally {
      this._transport.invalidateAccount(bootstrapAccount);
    }
    const id2 = response.data?.id;
    if (typeof id2 !== "string" && typeof id2 !== "number" || String(id2).length === 0) {
      throw new GitHubRequestError("GitHub credential could not establish a stable account identity", "malformedResponse");
    }
    return {
      account: { host, accountId: String(id2) },
      token,
      generation,
      signal
    };
  }
  _invalidateCurrent(reason) {
    if (reason === "endpoint") {
      this._backoff.reset();
    }
    const current = this._current;
    if (!current) {
      if (reason === "replacement" && this._lastCredential) {
        this._logService?.debug(`[GitHubCredentialService] Invalidating retained credential (${reason})`);
        this._onDidInvalidate.fire({ credential: this._lastCredential, reason });
      }
      if (reason === "endpoint" || reason === "shutdown") {
        this._lastCredential = void 0;
      }
      return;
    }
    this._logService?.debug(`[GitHubCredentialService] Invalidating generation ${current.generation} on ${current.host} (${reason})`);
    this._current = void 0;
    if (reason === "authentication") {
      this._backoff.fail(this._backoffKey(current.token, current.host));
    }
    current.controller.abort(new GitHubRequestError("GitHub credential generation was invalidated", "authentication"));
    if (current.credential) {
      this._transport.invalidateAccount(current.credential.account);
    }
    this._transport.invalidateAccount({ host: current.host, accountId: `bootstrap:${current.generation}` });
    this._onDidInvalidate.fire({ credential: current.credential, reason });
    if (reason === "endpoint" || reason === "shutdown") {
      this._lastCredential = void 0;
    }
  }
};

function credentialErrorKind(error) {
  if (error instanceof GitHubRequestError) {
    return `${error.kind}${error.statusCode === void 0 ? "" : `:${error.statusCode}`}`;
  }
  return error instanceof Error ? error.name : typeof error;
}

function sameAccount(left, right) {
  return left.host.toLowerCase() === right.host.toLowerCase() && left.accountId === right.accountId;
}

function waitForCredential(promise, signal) {
  return new Promise((resolve3, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    void promise.then(
      (credential) => {
        signal.removeEventListener("abort", onAbort);
        resolve3(credential);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      }
    );
  });
}
export { credentialErrorKind, sameAccount, waitForCredential, defaultBackoffPolicy, GitHubCredentialService };
