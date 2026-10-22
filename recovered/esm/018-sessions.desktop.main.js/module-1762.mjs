// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostAuth.ts
import { readAgentModelByokIdentifier } from "./module-1761.mjs";
import { CancellationError } from "./module-0004.mjs";
import { IAuthenticationService, getDynamicAuthenticationProviderId } from "./module-0952.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ILogService } from "./module-0095.mjs";
import { URI } from "./module-0032.mjs";
import { CHAT_SETUP_ACTION_ID } from "./module-1475.mjs";
import { localize } from "./module-0001.mjs";
import { IAuthenticationMcpAccessService } from "./module-1447.mjs";
import { IAuthenticationMcpService } from "./module-1450.mjs";
import { IAuthenticationMcpUsageService } from "./module-1449.mjs";
import { IDynamicAuthenticationProviderStorageService } from "./module-1418.mjs";
import { ILabelService } from "./module-0641.mjs";
import { fetchAuthorizationServerMetadata } from "./module-1416.mjs";
import { SequencerByKey } from "./module-0036.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostAuth.ts
function agentHostMcpServerId(authority, serverName, resourceUrl) {
  return `agent-host-mcp:${authority}/${encodeURIComponent(serverName)}/${encodeURIComponent(resourceUrl)}`;
}

function modelRequiresAgentAuthentication(agent, model, allowSignedOutWhenUsable = false) {
  if (!agent?.protectedResources?.length) {
    return false;
  }
  const requiresAuthentication = agent.protectedResources.some((resource) => resource.required !== false);
  if (!allowSignedOutWhenUsable || !agent.models.some((candidate) => readAgentModelByokIdentifier(candidate) !== void 0)) {
    return requiresAuthentication;
  }
  if (!model) {
    return true;
  }
  const selectedModel = agent.models.find((candidate) => candidate.id === model.id);
  return !selectedModel || readAgentModelByokIdentifier(selectedModel) === void 0;
}

var AgentHostAuthTokenCache = class {
  constructor() {
    this._completedTokens = /* @__PURE__ */ new Map();
    this._pendingAuthentications = /* @__PURE__ */ new Map();
    this._keyGenerations = /* @__PURE__ */ new Map();
    this._globalGeneration = 0;
  }
  /**
   * Forwards a token once per resource/scope pair. Same-token callers share
   * and await an in-flight authentication.
   */
  async authenticate(resource, scopes, token, authenticate) {
    const key3 = this._key(resource, scopes);
    const globalGeneration = this._globalGeneration;
    const keyGeneration = this._keyGenerations.get(key3) ?? 0;
    const pending = this._pendingAuthentications.get(key3);
    if (pending) {
      if (pending.token === token) {
        await pending.promise;
        if (!this._isCurrentGeneration(key3, globalGeneration, keyGeneration)) {
          throw new CancellationError();
        }
        return false;
      }
      try {
        await pending.promise;
      } catch {
      }
      if (!this._isCurrentGeneration(key3, globalGeneration, keyGeneration)) {
        throw new CancellationError();
      }
      return this.authenticate(resource, scopes, token, authenticate);
    }
    if (this._completedTokens.get(key3) === token) {
      return false;
    }
    const promise = (async () => {
      await authenticate();
      if (!this._isCurrentGeneration(key3, globalGeneration, keyGeneration)) {
        throw new CancellationError();
      }
      this._completedTokens.set(key3, token);
    })();
    this._pendingAuthentications.set(key3, { token, promise });
    try {
      await promise;
      return true;
    } finally {
      if (this._pendingAuthentications.get(key3)?.promise === promise) {
        this._pendingAuthentications.delete(key3);
      }
    }
  }
  /**
   * Clear the cached token for a specific resource/scope pair, a whole resource,
   * or all resources if no argument is given. Call after a failed `authenticate`
   * RPC or when the agent host process restarts.
   */
  clear(resource, scopes) {
    if (resource !== void 0) {
      if (scopes !== void 0) {
        const key3 = this._key(resource, scopes);
        this._invalidateKey(key3);
        this._completedTokens.delete(key3);
        this._pendingAuthentications.delete(key3);
        return;
      }
      const prefix = `${resource}\0`;
      const keys = /* @__PURE__ */ new Set([...this._completedTokens.keys(), ...this._pendingAuthentications.keys(), ...this._keyGenerations.keys()]);
      for (const key3 of keys) {
        if (key3.startsWith(prefix)) {
          this._invalidateKey(key3);
          this._completedTokens.delete(key3);
          this._pendingAuthentications.delete(key3);
        }
      }
    } else {
      this._globalGeneration++;
      this._completedTokens.clear();
      this._pendingAuthentications.clear();
      this._keyGenerations.clear();
    }
  }
  _invalidateKey(key3) {
    this._keyGenerations.set(key3, (this._keyGenerations.get(key3) ?? 0) + 1);
  }
  _isCurrentGeneration(key3, globalGeneration, keyGeneration) {
    return this._globalGeneration === globalGeneration && (this._keyGenerations.get(key3) ?? 0) === keyGeneration;
  }
  _key(resource, scopes) {
    return `${resource}\0${scopes ? [...new Set(scopes)].sort().join("\0") : ""}`;
  }
};

function protectedResourceAuthenticationKey(resource) {
  return JSON.stringify([
    resource.resource,
    [...new Set(resource.scopes_supported ?? [])].sort(),
    resource.authorization_servers ?? []
  ]);
}

var AgentHostAuthenticationRecovery = class {
  constructor() {
    this._resentTokens = /* @__PURE__ */ new Map();
    this._pendingRecoveries = /* @__PURE__ */ new Map();
  }
  clear() {
    this._resentTokens.clear();
    this._pendingRecoveries.clear();
  }
  recover(accessor, resource, options3) {
    const key3 = protectedResourceAuthenticationKey(resource);
    const pendingRecovery = this._pendingRecoveries.get(key3);
    if (pendingRecovery) {
      return pendingRecovery;
    }
    const recovery = this._recover(accessor, key3, resource, options3).finally(() => {
      if (this._pendingRecoveries.get(key3) === recovery) {
        this._pendingRecoveries.delete(key3);
      }
    });
    this._pendingRecoveries.set(key3, recovery);
    return recovery;
  }
  async _recover(accessor, key3, resource, options3) {
    throwIfAuthenticationStale(options3);
    const authenticationService = accessor.get(IAuthenticationService);
    const commandService = accessor.get(ICommandService);
    const logService = accessor.get(ILogService);
    const scopes = resource.scopes_supported ?? [];
    const token = await resolveTokenForResource(
      URI.parse(resource.resource),
      resource.authorization_servers ?? [],
      scopes,
      authenticationService,
      logService,
      options3.logPrefix
    );
    throwIfAuthenticationStale(options3);
    if (!token) {
      logService.info(`${options3.logPrefix} No token resolved for resource: ${resource.resource}`);
      options3.authTokenCache?.clear(resource.resource, resource.scopes_supported);
      if (await forwardAuthenticationToken(options3, resource.resource, scopes, "")) {
        this._resentTokens.delete(key3);
        logService.info(`${options3.logPrefix} Clearing authentication for resource: ${resource.resource}`);
      }
      return;
    }
    const previousToken = this._resentTokens.get(key3);
    if (previousToken !== void 0 && previousToken === token) {
      options3.authTokenCache?.clear(resource.resource, resource.scopes_supported);
      throwIfAuthenticationStale(options3);
      const interactiveToken = await forceAuthenticationInteractively(authenticationService, commandService, logService, resource, options3);
      throwIfAuthenticationStale(options3);
      if (interactiveToken) {
        this._resentTokens.set(key3, interactiveToken);
        if (interactiveToken === token) {
          logService.info(`${options3.logPrefix} Interactive authentication completed without a new token for ${resource.resource}`);
        }
      }
      return;
    }
    options3.authTokenCache?.clear(resource.resource, resource.scopes_supported);
    if (await forwardAuthenticationToken(options3, resource.resource, resource.scopes_supported ?? [], token)) {
      this._resentTokens.set(key3, token);
      logService.info(`${options3.logPrefix} Authenticating for resource: ${resource.resource}`);
    }
  }
};

async function resolveTokenForResource(resourceServer, authorizationServers, scopes, authenticationService, logService, logPrefix) {
  for (const server of authorizationServers) {
    const serverUri = URI.parse(server);
    const providerId = await authenticationService.getOrActivateProviderIdForServer(serverUri, resourceServer);
    if (!providerId) {
      logService.trace(`${logPrefix} No auth provider found for server: ${server}`);
      continue;
    }
    logService.trace(`${logPrefix} Resolved auth provider '${providerId}' for server: ${server}`);
    const sessions = await authenticationService.getSessions(providerId, [...scopes], { authorizationServer: serverUri }, true);
    const exactSession = sessions[0];
    if (exactSession) {
      return exactSession.accessToken;
    }
    const allSessions = await authenticationService.getSessions(providerId, void 0, { authorizationServer: serverUri }, true);
    const requestedSet = new Set(scopes);
    let bestToken;
    let bestExtraScopes = Infinity;
    for (const session of allSessions) {
      const sessionScopes = new Set(session.scopes);
      let isSuperset = true;
      for (const scope of requestedSet) {
        if (!sessionScopes.has(scope)) {
          isSuperset = false;
          break;
        }
      }
      if (isSuperset) {
        const extraScopes = sessionScopes.size - requestedSet.size;
        if (extraScopes < bestExtraScopes) {
          bestExtraScopes = extraScopes;
          bestToken = session.accessToken;
        }
      }
    }
    if (bestToken) {
      return bestToken;
    }
  }
  return void 0;
}

async function forwardAuthenticationToken(options3, resource, scopes, token) {
  throwIfAuthenticationStale(options3);
  const request2 = { resource, scopes, token };
  if (options3.authTokenCache) {
    return options3.authTokenCache.authenticate(resource, scopes, token, () => options3.authenticate(request2));
  }
  await options3.authenticate(request2);
  return true;
}

function throwIfAuthenticationStale(options3) {
  if (options3.isCurrent?.() === false) {
    throw new CancellationError();
  }
}

async function authenticateProtectedResources(accessor, agents, options3) {
  const authenticationService = accessor.get(IAuthenticationService);
  const logService = accessor.get(ILogService);
  for (const agent of agents) {
    for (const resource of agent.protectedResources ?? []) {
      await authenticateProtectedResourceWithServices(authenticationService, logService, resource, options3);
    }
  }
}

async function authenticateProtectedResourceWithServices(authenticationService, logService, resource, options3) {
  throwIfAuthenticationStale(options3);
  const token = await resolveTokenForProtectedResource(authenticationService, logService, resource, options3);
  throwIfAuthenticationStale(options3);
  const authenticated = await forwardAuthenticationToken(options3, resource.resource, resource.scopes_supported ?? [], token ?? "");
  if (!authenticated) {
    logService.trace(`${options3.logPrefix} Authentication state for ${resource.resource} unchanged; skipping authenticate RPC`);
    return false;
  }
  logService.info(token ? `${options3.logPrefix} Authenticating for resource: ${resource.resource}` : `${options3.logPrefix} Clearing authentication for resource: ${resource.resource}`);
  return true;
}

async function resolveTokenForProtectedResource(authenticationService, logService, resource, options3) {
  const token = await resolveTokenForResource(
    URI.parse(resource.resource),
    resource.authorization_servers ?? [],
    resource.scopes_supported ?? [],
    authenticationService,
    logService,
    options3.logPrefix
  );
  if (!token) {
    logService.info(`${options3.logPrefix} No token resolved for resource: ${resource.resource}`);
  }
  return token;
}

async function resolveAuthenticationInteractively(accessor, protectedResources, options3) {
  const authenticationService = accessor.get(IAuthenticationService);
  const commandService = accessor.get(ICommandService);
  const logService = accessor.get(ILogService);
  for (const resource of protectedResources) {
    throwIfAuthenticationStale(options3);
    const resourceUri = URI.parse(resource.resource);
    const scopes = resource.scopes_supported ?? [];
    const existingToken = await resolveTokenForResource(
      resourceUri,
      resource.authorization_servers ?? [],
      scopes,
      authenticationService,
      logService,
      options3.logPrefix
    );
    throwIfAuthenticationStale(options3);
    if (existingToken) {
      await forwardAuthenticationToken(options3, resource.resource, scopes, existingToken);
      logService.info(`${options3.logPrefix} Interactive authentication succeeded for ${resource.resource}`);
      return true;
    }
    return await forceAuthenticationInteractively(authenticationService, commandService, logService, resource, options3) !== void 0;
  }
  return false;
}

async function forceAuthenticationInteractively(authenticationService, commandService, logService, resource, options3) {
  throwIfAuthenticationStale(options3);
  const scopes = resource.scopes_supported ?? [];
  const setupResult = await commandService.executeCommand(CHAT_SETUP_ACTION_ID, void 0, {
    forceSignInDialog: true,
    additionalScopes: scopes,
    dialogTitle: localize(8929, null),
    disableChatViewReveal: true,
    returnResult: true
  });
  throwIfAuthenticationStale(options3);
  if (setupResult?.success === void 0) {
    return void 0;
  }
  if (!setupResult.success) {
    throw setupResult.error ?? new Error(localize(8930, null));
  }
  const token = await resolveTokenForResource(
    URI.parse(resource.resource),
    resource.authorization_servers ?? [],
    scopes,
    authenticationService,
    logService,
    options3.logPrefix
  );
  throwIfAuthenticationStale(options3);
  if (!token) {
    logService.info(`${options3.logPrefix} Interactive authentication did not provide a token for ${resource.resource}`);
    return void 0;
  }
  options3.authTokenCache?.clear(resource.resource, scopes);
  if (!await forwardAuthenticationToken(options3, resource.resource, scopes, token)) {
    return void 0;
  }
  logService.info(`${options3.logPrefix} Interactive authentication completed for ${resource.resource}`);
  return token;
}

async function resolveMcpServerAuthentication(accessor, protectedResource, options3) {
  const authenticationService = accessor.get(IAuthenticationService);
  const authenticationMcpAccessService = accessor.get(IAuthenticationMcpAccessService);
  const authenticationMcpService = accessor.get(IAuthenticationMcpService);
  const authenticationMcpUsageService = accessor.get(IAuthenticationMcpUsageService);
  const dynamicAuthenticationProviderStorageService = accessor.get(IDynamicAuthenticationProviderStorageService);
  const logService = accessor.get(ILogService);
  const agentHostMeta = options3.agentHost ? { authority: options3.agentHost.authority, label: accessor.get(ILabelService).getHostLabel(options3.agentHost.scheme, options3.agentHost.authority) } : void 0;
  const scopes = options3.scopes.length > 0 || isGitHubMcpResource(protectedResource) ? options3.scopes : protectedResource.scopes_supported ?? [];
  const authenticationOperations = getMcpAuthenticationOperations(authenticationService);
  for (const authorizationServer of protectedResource.authorization_servers ?? []) {
    const authorizationServerUri = URI.parse(authorizationServer);
    const providerOperationId = getDynamicAuthenticationProviderId(authorizationServerUri, protectedResource);
    const authenticated = await authenticationOperations.queue(providerOperationId, async () => {
      const providerId = await getOrCreateProviderForMcpResource(
        authorizationServerUri,
        protectedResource,
        options3.oauthClient,
        authenticationService,
        dynamicAuthenticationProviderStorageService,
        logService,
        options3.logPrefix,
        options3.allowInteraction,
        options3.authorizationServerMetadataFetcher ?? fetchAuthorizationServerMetadata
      );
      if (!providerId) {
        return false;
      }
      const oauthClientOptions = options3.oauthClient ? { clientId: options3.oauthClient.clientId, clientSecret: options3.oauthClient.clientSecret } : {};
      const sessions = await authenticationService.getSessions(providerId, [...scopes], {
        authorizationServer: authorizationServerUri,
        resource: protectedResource.resource,
        ...oauthClientOptions,
        silent: !options3.allowInteraction
      }, true);
      const allowedSession = getAllowedMcpSession(providerId, sessions, authenticationMcpAccessService, authenticationMcpService, options3);
      if (allowedSession) {
        await authenticateMcpSession(providerId, allowedSession, scopes, authenticationMcpAccessService, authenticationMcpService, authenticationMcpUsageService, logService, options3, false, agentHostMeta);
        return true;
      }
      if (!options3.allowInteraction) {
        return false;
      }
      const provider = authenticationService.getProvider(providerId);
      const session = sessions.length ? provider.supportsMultipleAccounts ? await authenticationMcpService.selectSession(providerId, options3.mcpServerId, options3.mcpServerName, [...scopes], sessions) : sessions[0] : await authenticationService.createSession(providerId, [...scopes], {
        activateImmediate: true,
        authorizationServer: authorizationServerUri,
        resource: protectedResource.resource,
        ...oauthClientOptions
      });
      await authenticateMcpSession(providerId, session, scopes, authenticationMcpAccessService, authenticationMcpService, authenticationMcpUsageService, logService, options3, true, agentHostMeta);
      return true;
    });
    if (authenticated) {
      return true;
    }
  }
  return false;
}

var mcpAuthenticationOperations = /* @__PURE__ */ new WeakMap();

function getMcpAuthenticationOperations(authenticationService) {
  let operations = mcpAuthenticationOperations.get(authenticationService);
  if (!operations) {
    operations = new SequencerByKey();
    mcpAuthenticationOperations.set(authenticationService, operations);
  }
  return operations;
}

function isGitHubMcpResource(resource) {
  return resource.resource_name === "GitHub MCP Server";
}

async function getOrCreateProviderForMcpResource(authorizationServer, protectedResource, oauthClient, authenticationService, dynamicAuthenticationProviderStorageService, logService, logPrefix, allowCreation, authorizationServerMetadataFetcher) {
  const resourceUri = URI.parse(protectedResource.resource);
  const dynamicProviderId = getDynamicAuthenticationProviderId(authorizationServer, protectedResource);
  let clientId = oauthClient?.clientId;
  let clientSecret = oauthClient?.clientSecret;
  if (oauthClient) {
    const isProviderActive = authenticationService.isDynamicAuthenticationProvider(dynamicProviderId);
    const registeredClient = await dynamicAuthenticationProviderStorageService.getClientRegistration(dynamicProviderId);
    const clientMatches = registeredClient?.clientId === oauthClient.clientId && registeredClient.clientSecret === oauthClient.clientSecret;
    if (clientMatches) {
      if (isProviderActive) {
        return dynamicProviderId;
      }
    } else {
      if (!allowCreation) {
        return void 0;
      }
      if (isProviderActive) {
        authenticationService.unregisterAuthenticationProvider(dynamicProviderId);
        await dynamicAuthenticationProviderStorageService.removeDynamicProvider(dynamicProviderId);
      }
    }
  } else {
    const existing = await authenticationService.getOrActivateProviderIdForServer(authorizationServer, resourceUri);
    if (existing) {
      return existing;
    }
    const registeredClient = await dynamicAuthenticationProviderStorageService.getClientRegistration(dynamicProviderId);
    if (!registeredClient?.clientId && !allowCreation) {
      return void 0;
    }
    clientId = registeredClient?.clientId;
    clientSecret = registeredClient?.clientSecret;
  }
  try {
    const { metadata } = await authorizationServerMetadataFetcher(authorizationServer.toString(true));
    const provider = await authenticationService.createDynamicAuthenticationProvider(authorizationServer, metadata, protectedResource, clientId, clientSecret);
    return provider?.id;
  } catch (err) {
    logService.warn(`${logPrefix} Failed to create MCP auth provider for ${authorizationServer.toString(true)}`, err);
    return void 0;
  }
}

function getAllowedMcpSession(providerId, sessions, authenticationMcpAccessService, authenticationMcpService, options3) {
  const accountNamePreference = authenticationMcpService.getAccountPreference(options3.mcpServerId, providerId);
  if (accountNamePreference) {
    const preferred = sessions.find((session) => session.account.label === accountNamePreference);
    if (preferred && authenticationMcpAccessService.isAccessAllowedForUrl(providerId, preferred.account.label, options3.mcpServerId, options3.mcpServerUrl)) {
      return preferred;
    }
  }
  if (sessions.length === 1 && authenticationMcpAccessService.isAccessAllowedForUrl(providerId, sessions[0].account.label, options3.mcpServerId, options3.mcpServerUrl)) {
    return sessions[0];
  }
  return void 0;
}

async function authenticateMcpSession(providerId, session, scopes, authenticationMcpAccessService, authenticationMcpService, authenticationMcpUsageService, logService, options3, updateAccess, agentHost) {
  await forwardAuthenticationToken(options3, options3.mcpServerUrl, scopes, session.accessToken);
  if (updateAccess) {
    authenticationMcpAccessService.updateAllowedMcpServers(providerId, session.account.label, [{ id: options3.mcpServerId, name: options3.mcpServerName, allowed: true, url: options3.mcpServerUrl, agentHost }]);
    authenticationMcpService.updateAccountPreference(options3.mcpServerId, providerId, session.account);
  }
  authenticationMcpUsageService.addAccountUsage(providerId, session.account.label, scopes, options3.mcpServerId, options3.mcpServerName);
  logService.info(`${options3.logPrefix} MCP authentication succeeded for ${options3.mcpServerName}`);
}
export { agentHostMcpServerId, modelRequiresAgentAuthentication, protectedResourceAuthenticationKey, resolveTokenForResource, forwardAuthenticationToken, throwIfAuthenticationStale, authenticateProtectedResources, authenticateProtectedResourceWithServices, resolveTokenForProtectedResource, resolveAuthenticationInteractively, forceAuthenticationInteractively, resolveMcpServerAuthentication, getMcpAuthenticationOperations, isGitHubMcpResource, getOrCreateProviderForMcpResource, getAllowedMcpSession, authenticateMcpSession, AgentHostAuthTokenCache, AgentHostAuthenticationRecovery, mcpAuthenticationOperations };
