// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostAuthenticationService.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";


// src/vs/platform/agentHost/node/agentHostAuthenticationService.ts
var IAgentHostAuthenticationService = createDecorator("agentHostAuthenticationService");

var IAgentHostAuthenticationController = createDecorator("agentHostAuthenticationController");

var AgentHostAuthenticationService = class extends Disposable {
  constructor(_logService) {
    super();
    this._logService = _logService;
    this._tokens = /* @__PURE__ */ new Map();
    this._onDidChangeAuthToken = this._register(new Emitter());
    this.onDidChangeAuthToken = this._onDidChangeAuthToken.event;
  }
  async authenticate(params, providers) {
    this._logService.trace(`[AgentHostAuthenticationService] authenticate called: resource=${params.resource}`);
    const providerList = [...providers];
    const matching = providerList.filter(
      (p) => p.getProtectedResources().some((r) => r.resource === params.resource)
    );
    const settled = await Promise.allSettled(
      matching.map((p) => p.authenticate(params.resource, params.token))
    );
    let authenticated = false;
    let rejected = false;
    for (let i = 0; i < settled.length; i++) {
      const result = settled[i];
      if (result.status === "fulfilled") {
        authenticated ||= result.value;
      } else {
        rejected = true;
        this._logService.error(
          result.reason,
          `[AgentHostAuthenticationService] Provider '${matching[i].id}' authenticate threw for resource=${params.resource}`
        );
      }
    }
    const sessionResourceHandlers = providerList.filter((p) => p.handleAuthenticationToken);
    const sessionResourceSettled = await Promise.allSettled(
      sessionResourceHandlers.map((p) => p.handleAuthenticationToken ? p.handleAuthenticationToken(params) : Promise.resolve(false))
    );
    for (let i = 0; i < sessionResourceSettled.length; i++) {
      const result = sessionResourceSettled[i];
      if (result.status === "fulfilled") {
        authenticated ||= result.value;
      } else {
        rejected = true;
        this._logService.error(
          result.reason,
          `[AgentHostAuthenticationService] Provider '${sessionResourceHandlers[i].id}' handleAuthenticationToken threw for resource=${params.resource}`
        );
      }
    }
    const scopes = this._normalizeScopes(params.scopes);
    const key = this._key(params.resource, scopes);
    const previousToken = this._tokens.get(key)?.token;
    if (!authenticated && !rejected) {
      authenticated = this._tokens.get(key)?.token === params.token;
    }
    if (!params.token) {
      this._tokens.delete(key);
    } else if (authenticated) {
      this._tokens.set(key, { resource: params.resource, scopes, token: params.token });
    }
    const token = this._tokens.get(key)?.token;
    if (previousToken !== token) {
      this._onDidChangeAuthToken.fire({ resource: params.resource, scopes, token });
    }
    return { authenticated };
  }
  async replay(provider) {
    const protectedResources = new Set(provider.getProtectedResources().map((resource) => resource.resource));
    for (const stored of this._tokens.values()) {
      const params = { resource: stored.resource, scopes: stored.scopes, token: stored.token };
      if (protectedResources.has(stored.resource)) {
        try {
          await provider.authenticate(stored.resource, stored.token);
        } catch (error) {
          this._logService.error(error, `[AgentHostAuthenticationService] Provider '${provider.id}' rejected replayed authentication for resource=${stored.resource}`);
        }
      }
      if (provider.handleAuthenticationToken) {
        try {
          await provider.handleAuthenticationToken(params);
        } catch (error) {
          this._logService.error(error, `[AgentHostAuthenticationService] Provider '${provider.id}' rejected replayed session authentication for resource=${stored.resource}`);
        }
      }
    }
  }
  getAuthToken(request) {
    const scopes = this._normalizeScopes(request.scopes);
    const exact = this._tokens.get(this._key(request.resource, scopes));
    if (exact) {
      return exact.token;
    }
    if (scopes.length === 0) {
      return void 0;
    }
    const requested = new Set(scopes);
    let best;
    for (const candidate of this._tokens.values()) {
      if (candidate.resource !== request.resource || candidate.scopes.length === 0) {
        continue;
      }
      if (!this._containsAll(candidate.scopes, requested)) {
        continue;
      }
      if (!best || candidate.scopes.length < best.scopes.length) {
        best = candidate;
      }
    }
    if (best) {
      return best.token;
    }
    return this._tokens.get(this._key(request.resource, []))?.token;
  }
  _containsAll(scopes, requested) {
    for (const scope of requested) {
      if (!scopes.includes(scope)) {
        return false;
      }
    }
    return true;
  }
  _key(resource, scopes) {
    return `${resource}\0${scopes.join("\0")}`;
  }
  _normalizeScopes(scopes) {
    return scopes ? [...new Set(scopes)].sort() : [];
  }
};
export { IAgentHostAuthenticationService, IAgentHostAuthenticationController, AgentHostAuthenticationService };
