// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostAuthentication.ts
import { createDecorator } from "./module-0038.mjs";
import { URI } from "./module-0023.mjs";
import { XaaifyAuthProvider } from "./module-0268.mjs";
import { SequencerByKey, raceCancellationError } from "./module-0034.mjs";
import { Emitter, Event } from "./module-0019.mjs";
import { MainContext } from "./module-0025.mjs";
import { ExtensionIdentifier } from "./module-0040.mjs";
import { INTERNAL_AUTH_PROVIDER_PREFIX, isAuthenticationWwwAuthenticateRequest } from "./module-0143.mjs";
import { Disposable2 } from "./module-0238.mjs";
import { fetchDynamicRegistration, getClaimsFromJWT, isAuthorizationErrorResponse, isAuthorizationTokenResponse } from "./module-0263.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0052.mjs";
import { IExtHostInitDataService } from "./module-0049.mjs";
import { IExtHostWindow } from "./module-0264.mjs";
import { IExtHostUrlsService } from "./module-0265.mjs";
import { IExtHostProgress } from "./module-0267.mjs";
import { ILogService, ILoggerService } from "./module-0045.mjs";
import { DisposableStore } from "./module-0011.mjs";
import { localize } from "./module-0015.mjs";
import { equals } from "./module-0004.mjs";
import { CancellationError, isCancellationError } from "./module-0002.mjs";
import { VSBuffer, encodeBase64 } from "./module-0013.mjs";
import { observableValue } from "./module-0104.mjs";
import { derivedOpts } from "./module-0110.mjs";
import { autorun } from "./module-0108.mjs";
import { stringHash } from "./module-0042.mjs";


// src/vs/workbench/api/common/extHostAuthentication.ts
var IExtHostAuthentication = createDecorator("IExtHostAuthentication");

function reviveAccountIcon(account) {
  return { ...account, icon: URI.revive(account.icon) };
}

var ExtHostAuthentication = class {
  constructor(extHostRpc, _initData, _extHostWindow, _extHostUrls, _extHostProgress, _extHostLoggerService, _logService) {
    this._initData = _initData;
    this._extHostWindow = _extHostWindow;
    this._extHostUrls = _extHostUrls;
    this._extHostProgress = _extHostProgress;
    this._extHostLoggerService = _extHostLoggerService;
    this._logService = _logService;
    this._dynamicAuthProviderCtor = DynamicAuthProvider;
    this._xaaAuthProviderCtor = XaaifyAuthProvider(DynamicAuthProvider);
    this._authenticationProviders = /* @__PURE__ */ new Map();
    this._providerOperations = new SequencerByKey();
    this._onDidChangeSessions = new Emitter();
    this._getSessionTaskSingler = new TaskSingler();
    this._onDidDynamicAuthProviderTokensChange = new Emitter();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadAuthentication);
  }
  /**
   * This sets up an event that will fire when the auth sessions change with a built-in filter for the extensionId
   * if a session change only affects a specific extension.
   * @param extensionId The extension that is interested in the event.
   * @returns An event with a built-in filter for the extensionId
   */
  getExtensionScopedSessionsEvent(extensionId) {
    const normalizedExtensionId = extensionId.toLowerCase();
    return Event.chain(
      this._onDidChangeSessions.event,
      ($) => $.filter((e) => !e.extensionIdFilter || e.extensionIdFilter.includes(normalizedExtensionId)).map((e) => ({ provider: e.provider }))
    );
  }
  async getSession(requestingExtension, providerId, scopesOrRequest, options2 = {}) {
    const extensionId = ExtensionIdentifier.toKey(requestingExtension.identifier);
    const keys = Object.keys(options2);
    const optionsStr = keys.map((key) => {
      switch (key) {
        case "account":
          return `${key}:${options2.account?.id}`;
        case "createIfNone":
        case "forceNewSession": {
          const value = typeof options2[key] === "boolean" ? `${options2[key]}` : `'${options2[key]?.detail}/${options2[key]?.learnMore?.toString()}'`;
          return `${key}:${value}`;
        }
        case "authorizationServer":
          return `${key}:${options2.authorizationServer?.toString(true)}`;
        default:
          return `${key}:${!!options2[key]}`;
      }
    }).sort().join(", ");
    let singlerKey;
    if (isAuthenticationWwwAuthenticateRequest(scopesOrRequest)) {
      const challenge = scopesOrRequest;
      const challengeStr = challenge.wwwAuthenticate;
      const scopesStr = challenge.fallbackScopes ? [...challenge.fallbackScopes].sort().join(" ") : "";
      singlerKey = `${extensionId} ${providerId} challenge:${challengeStr} ${scopesStr} ${optionsStr}`;
    } else {
      const sortedScopes = [...scopesOrRequest].sort().join(" ");
      singlerKey = `${extensionId} ${providerId} ${sortedScopes} ${optionsStr}`;
    }
    return await this._getSessionTaskSingler.getOrCreate(singlerKey, async () => {
      await this._proxy.$ensureProvider(providerId);
      const extensionName = requestingExtension.displayName || requestingExtension.name;
      const session = await this._proxy.$getSession(providerId, scopesOrRequest, extensionId, extensionName, options2);
      return session && { ...session, account: reviveAccountIcon(session.account) };
    });
  }
  async getAccounts(providerId) {
    await this._proxy.$ensureProvider(providerId);
    const accounts = await this._proxy.$getAccounts(providerId);
    return accounts.map((account) => reviveAccountIcon(account));
  }
  registerAuthenticationProvider(id2, label, provider, options2) {
    void this._providerOperations.queue(id2, async () => {
      if (this._authenticationProviders.get(id2)) {
        this._logService.error(`An authentication provider with id '${id2}' is already registered. The existing provider will not be replaced.`);
        return;
      }
      const listener = provider.onDidChangeSessions((e) => this._proxy.$sendDidChangeSessions(id2, e));
      this._authenticationProviders.set(id2, { label, provider, disposable: listener, options: options2 ?? { supportsMultipleAccounts: false } });
      await this._proxy.$registerAuthenticationProvider({
        id: id2,
        label,
        supportsMultipleAccounts: options2?.supportsMultipleAccounts ?? false,
        supportedAuthorizationServers: options2?.supportedAuthorizationServers,
        supportsChallenges: options2?.supportsChallenges
      });
    });
    return new Disposable2(() => {
      void this._providerOperations.queue(id2, async () => {
        const providerData = this._authenticationProviders.get(id2);
        if (providerData) {
          providerData.disposable?.dispose();
          this._authenticationProviders.delete(id2);
          await this._proxy.$unregisterAuthenticationProvider(id2);
        }
      });
    });
  }
  $createSession(providerId, scopes, options2) {
    return this._providerOperations.queue(providerId, async () => {
      const providerData = this._authenticationProviders.get(providerId);
      if (providerData) {
        options2.authorizationServer = URI.revive(options2.authorizationServer);
        if (options2.account) {
          options2.account = reviveAccountIcon(options2.account);
        }
        return await providerData.provider.createSession(scopes, options2);
      }
      throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
    });
  }
  $removeSession(providerId, sessionId) {
    return this._providerOperations.queue(providerId, async () => {
      const providerData = this._authenticationProviders.get(providerId);
      if (providerData) {
        return await providerData.provider.removeSession(sessionId);
      }
      throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
    });
  }
  $getSessions(providerId, scopes, options2) {
    return this._providerOperations.queue(providerId, async () => {
      const providerData = this._authenticationProviders.get(providerId);
      if (providerData) {
        options2.authorizationServer = URI.revive(options2.authorizationServer);
        if (options2.account) {
          options2.account = reviveAccountIcon(options2.account);
        }
        return await providerData.provider.getSessions(scopes, options2);
      }
      throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
    });
  }
  $getSessionsFromChallenges(providerId, constraint, options2) {
    return this._providerOperations.queue(providerId, async () => {
      const providerData = this._authenticationProviders.get(providerId);
      if (providerData) {
        const provider = providerData.provider;
        if (typeof provider.getSessionsFromChallenges === "function") {
          options2.authorizationServer = URI.revive(options2.authorizationServer);
          if (options2.account) {
            options2.account = reviveAccountIcon(options2.account);
          }
          return await provider.getSessionsFromChallenges(constraint, options2);
        }
        throw new Error(`Authentication provider with handle: ${providerId} does not support getSessionsFromChallenges`);
      }
      throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
    });
  }
  $createSessionFromChallenges(providerId, constraint, options2) {
    return this._providerOperations.queue(providerId, async () => {
      const providerData = this._authenticationProviders.get(providerId);
      if (providerData) {
        const provider = providerData.provider;
        if (typeof provider.createSessionFromChallenges === "function") {
          options2.authorizationServer = URI.revive(options2.authorizationServer);
          if (options2.account) {
            options2.account = reviveAccountIcon(options2.account);
          }
          return await provider.createSessionFromChallenges(constraint, options2);
        }
        throw new Error(`Authentication provider with handle: ${providerId} does not support createSessionFromChallenges`);
      }
      throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
    });
  }
  $onDidChangeAuthenticationSessions(id2, label, extensionIdFilter) {
    if (!id2.startsWith(INTERNAL_AUTH_PROVIDER_PREFIX)) {
      this._onDidChangeSessions.fire({ provider: { id: id2, label }, extensionIdFilter });
    }
    return Promise.resolve();
  }
  $onDidUnregisterAuthenticationProvider(id2) {
    return this._providerOperations.queue(id2, async () => {
      const providerData = this._authenticationProviders.get(id2);
      if (providerData) {
        providerData.disposable?.dispose();
        this._authenticationProviders.delete(id2);
      }
    });
  }
  async $registerDynamicAuthProvider(authorizationServerComponents, serverMetadata, resourceMetadata, clientId, clientSecret, initialTokens) {
    if (!clientId) {
      const authorizationServer = URI.revive(authorizationServerComponents);
      if (serverMetadata.registration_endpoint) {
        try {
          const registration = await fetchDynamicRegistration(serverMetadata, this._initData.environment.appName, resourceMetadata?.scopes_supported);
          clientId = registration.client_id;
          clientSecret = registration.client_secret;
        } catch (err) {
          this._logService.warn(`Dynamic registration failed for ${authorizationServer.toString()}: ${err.message}. Prompting user for client ID and client secret...`);
        }
      }
      if (!clientId) {
        this._logService.info(`Prompting user for client registration details for ${authorizationServer.toString()}`);
        const clientDetails = await this._proxy.$promptForClientRegistration(authorizationServer.toString());
        if (!clientDetails) {
          throw new Error("User did not provide client details");
        }
        clientId = clientDetails.clientId;
        clientSecret = clientDetails.clientSecret;
        this._logService.info(`User provided client registration for ${authorizationServer.toString()}`);
        if (clientSecret) {
          this._logService.trace(`User provided client secret for ${authorizationServer.toString()}`);
        } else {
          this._logService.trace(`User did not provide client secret for ${authorizationServer.toString()}`);
        }
      }
    }
    const provider = new this._dynamicAuthProviderCtor(
      this._extHostWindow,
      this._extHostUrls,
      this._initData,
      this._extHostProgress,
      this._extHostLoggerService,
      this._proxy,
      URI.revive(authorizationServerComponents),
      serverMetadata,
      resourceMetadata,
      clientId,
      clientSecret,
      this._onDidDynamicAuthProviderTokensChange,
      initialTokens || []
    );
    await this._providerOperations.queue(provider.id, async () => {
      this._authenticationProviders.set(
        provider.id,
        {
          label: provider.label,
          provider,
          disposable: Disposable2.from(
            provider,
            provider.onDidChangeSessions((e) => this._proxy.$sendDidChangeSessions(provider.id, e)),
            provider.onDidChangeClientId(() => this._proxy.$sendDidChangeDynamicProviderInfo({
              providerId: provider.id,
              clientId: provider.clientId,
              clientSecret: provider.clientSecret
            }))
          ),
          options: { supportsMultipleAccounts: true }
        }
      );
      await this._proxy.$registerDynamicAuthenticationProvider({
        id: provider.id,
        label: provider.label,
        supportsMultipleAccounts: true,
        authorizationServer: authorizationServerComponents,
        resourceServer: resourceMetadata ? URI.parse(resourceMetadata.resource) : void 0,
        clientId: provider.clientId,
        clientSecret: provider.clientSecret
      });
    });
    return provider.id;
  }
  async $registerXaaAuthProvider(issuerComponents, serverMetadata, clientId, clientSecret, initialTokens) {
    const issuer = URI.revive(issuerComponents);
    if (!clientId) {
      this._logService.info(`Prompting user for client registration details for XAA issuer ${issuer.toString()}`);
      const clientDetails = await this._proxy.$promptForClientRegistration(issuer.toString());
      if (!clientDetails) {
        throw new Error("User did not provide client details");
      }
      clientId = clientDetails.clientId;
      clientSecret = clientDetails.clientSecret;
    }
    const provider = new this._xaaAuthProviderCtor(
      this._extHostWindow,
      this._extHostUrls,
      this._initData,
      this._extHostProgress,
      this._extHostLoggerService,
      this._proxy,
      issuer,
      serverMetadata,
      /* resourceMetadata */
      void 0,
      clientId,
      clientSecret,
      this._onDidDynamicAuthProviderTokensChange,
      initialTokens || []
    );
    await this._providerOperations.queue(provider.id, async () => {
      this._authenticationProviders.set(
        provider.id,
        {
          label: provider.label,
          provider,
          disposable: Disposable2.from(
            provider,
            provider.onDidChangeSessions((e) => this._proxy.$sendDidChangeSessions(provider.id, e)),
            provider.onDidChangeClientId(() => this._proxy.$sendDidChangeDynamicProviderInfo({
              providerId: provider.id,
              clientId: provider.clientId,
              clientSecret: provider.clientSecret
            }))
          ),
          options: { supportsMultipleAccounts: true }
        }
      );
      await this._proxy.$registerDynamicAuthenticationProvider({
        id: provider.id,
        label: provider.label,
        supportsMultipleAccounts: true,
        authorizationServer: issuerComponents,
        resourceServer: void 0,
        clientId: provider.clientId,
        clientSecret: provider.clientSecret
      });
    });
    return provider.id;
  }
  async $onDidChangeDynamicAuthProviderTokens(authProviderId, clientId, tokens) {
    this._onDidDynamicAuthProviderTokensChange.fire({ authProviderId, clientId, tokens });
  }
};

ExtHostAuthentication = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService),
  __decorateParam(2, IExtHostWindow),
  __decorateParam(3, IExtHostUrlsService),
  __decorateParam(4, IExtHostProgress),
  __decorateParam(5, ILoggerService),
  __decorateParam(6, ILogService)
], ExtHostAuthentication);

var TaskSingler = class {
  constructor() {
    this._inFlightPromises = /* @__PURE__ */ new Map();
  }
  getOrCreate(key, promiseFactory) {
    const inFlight = this._inFlightPromises.get(key);
    if (inFlight) {
      return inFlight;
    }
    const promise = promiseFactory().finally(() => this._inFlightPromises.delete(key));
    this._inFlightPromises.set(key, promise);
    return promise;
  }
};

var DynamicAuthProvider = class {
  constructor(_extHostWindow, _extHostUrls, _initData, _extHostProgress, loggerService, _proxy, authorizationServer, _serverMetadata, _resourceMetadata, _clientId, _clientSecret, onDidDynamicAuthProviderTokensChange, initialTokens, _fetch = fetch) {
    this._extHostWindow = _extHostWindow;
    this._extHostUrls = _extHostUrls;
    this._initData = _initData;
    this._extHostProgress = _extHostProgress;
    this._proxy = _proxy;
    this.authorizationServer = authorizationServer;
    this._serverMetadata = _serverMetadata;
    this._resourceMetadata = _resourceMetadata;
    this._clientId = _clientId;
    this._clientSecret = _clientSecret;
    this._fetch = _fetch;
    this._onDidChangeSessions = new Emitter();
    this.onDidChangeSessions = this._onDidChangeSessions.event;
    this._onDidChangeClientId = new Emitter();
    this.onDidChangeClientId = this._onDidChangeClientId.event;
    const stringifiedServer = authorizationServer.toString(true);
    this.id = _resourceMetadata?.resource ? stringifiedServer + " " + _resourceMetadata?.resource : stringifiedServer;
    this.label = _resourceMetadata?.resource_name ?? this.authorizationServer.authority;
    this._logger = loggerService.createLogger(this.id, { name: `Auth: ${this.label}` });
    this._disposable = new DisposableStore();
    this._disposable.add(this._onDidChangeSessions);
    this._disposable.add(this._onDidChangeClientId);
    const scopedEvent = Event.chain(
      onDidDynamicAuthProviderTokensChange.event,
      ($) => $.filter((e) => e.authProviderId === this.id && e.clientId === _clientId).map((e) => e.tokens)
    );
    this._tokenStore = this._disposable.add(new TokenStore(
      {
        onDidChange: scopedEvent,
        set: (tokens) => _proxy.$setSessionsForDynamicAuthProvider(this.id, this.clientId, tokens)
      },
      initialTokens,
      this._logger
    ));
    this._disposable.add(this._tokenStore.onDidChangeSessions((e) => this._onDidChangeSessions.fire(e)));
    this._createFlows = [];
    if (_serverMetadata.authorization_endpoint) {
      this._createFlows.push({
        label: localize(5875, null),
        handler: (scopes, progress, token) => this._createWithUrlHandler(scopes, progress, token)
      });
    }
  }
  get clientId() {
    return this._clientId;
  }
  get clientSecret() {
    return this._clientSecret;
  }
  async getSessions(scopes, options2) {
    this._logger.info(`Getting sessions for scopes: ${scopes?.join(" ") ?? "all"}`);
    if (!scopes) {
      return this._tokenStore.sessions;
    }
    const sortedScopes = [...scopes].sort();
    const scopeStr = scopes.join(" ");
    let sessions = this._tokenStore.sessions.filter((session) => equals([...session.scopes].sort(), sortedScopes));
    this._logger.info(`Found ${sessions.length} sessions for scopes: ${scopeStr}`);
    if (sessions.length) {
      const newTokens = [];
      const removedTokens = [];
      const tokenMap = new Map(this._tokenStore.tokens.map((token) => [token.access_token, token]));
      for (const session of sessions) {
        const token = tokenMap.get(session.accessToken);
        if (token && token.expires_in) {
          const now = Date.now();
          const expiresInMS = token.expires_in * 1e3;
          if (now > token.created_at + expiresInMS - 5 * 60 * 1e3) {
            this._logger.info(`Token for session ${session.id} is about to expire, refreshing...`);
            removedTokens.push(token);
            if (!token.refresh_token) {
              this._logger.warn(`No refresh token available for scopes ${session.scopes.join(" ")}. Throwing away token.`);
              continue;
            }
            try {
              const newToken = await this.exchangeRefreshTokenForToken(token.refresh_token, options2.silent !== true);
              if (newToken.scope !== scopeStr) {
                this._logger.warn(`Token scopes '${newToken.scope}' do not match requested scopes '${scopeStr}'. Overwriting token with what was requested...`);
                newToken.scope = scopeStr;
              }
              this._logger.info(`Successfully created a new token for scopes ${session.scopes.join(" ")}.`);
              newTokens.push(newToken);
            } catch (err) {
              this._logger.error(`Failed to refresh token: ${err}`);
            }
          }
        }
      }
      if (newTokens.length || removedTokens.length) {
        this._tokenStore.update({ added: newTokens, removed: removedTokens });
        sessions = this._tokenStore.sessions.filter((session) => equals([...session.scopes].sort(), sortedScopes));
      }
      this._logger.info(`Found ${sessions.length} sessions for scopes: ${scopeStr}`);
      return sessions;
    }
    return [];
  }
  async createSession(scopes, _options) {
    this._logger.info(`Creating session for scopes: ${scopes.join(" ")}`);
    let token;
    for (let i = 0; i < this._createFlows.length; i++) {
      const { handler } = this._createFlows[i];
      try {
        token = await this._extHostProgress.withProgressFromSource(
          { label: this.label, id: this.id },
          {
            location: 15 /* Notification */,
            title: localize(5872, null, this.label),
            cancellable: true
          },
          (progress, token2) => handler(scopes, progress, token2)
        );
        if (token) {
          break;
        }
      } catch (err) {
        const nextMode = this._createFlows[i + 1]?.label;
        if (!nextMode) {
          break;
        }
        const message = isCancellationError(err) ? localize(5876, null, this.label, nextMode) : localize(5874, null, this.label, nextMode);
        const result = await this._proxy.$showContinueNotification(message);
        if (!result) {
          throw new CancellationError();
        }
        this._logger.error(`Failed to create token via flow '${nextMode}': ${err}`);
      }
    }
    if (!token) {
      throw new Error("Failed to create authentication token");
    }
    if (token.scope !== scopes.join(" ")) {
      this._logger.warn(`Token scopes '${token.scope}' do not match requested scopes '${scopes.join(" ")}'. Overwriting token with what was requested...`);
      token.scope = scopes.join(" ");
    }
    this._tokenStore.update({ added: [{ ...token, created_at: Date.now() }], removed: [] });
    const session = this._tokenStore.sessions.find((t) => t.accessToken === token.access_token);
    this._logger.info(`Created ${token.refresh_token ? "refreshable" : "non-refreshable"} session for scopes: ${token.scope}${token.expires_in ? ` that expires in ${token.expires_in} seconds` : ""}`);
    return session;
  }
  async removeSession(sessionId) {
    this._logger.info(`Removing session with id: ${sessionId}`);
    const session = this._tokenStore.sessions.find((session2) => session2.id === sessionId);
    if (!session) {
      this._logger.error(`Session with id ${sessionId} not found`);
      return;
    }
    const token = this._tokenStore.tokens.find((token2) => token2.access_token === session.accessToken);
    if (!token) {
      this._logger.error(`Failed to retrieve token for removed session: ${session.id}`);
      return;
    }
    this._tokenStore.update({ added: [], removed: [token] });
    this._logger.info(`Removed token for session: ${session.id} with scopes: ${session.scopes.join(" ")}`);
  }
  dispose() {
    this._disposable.dispose();
  }
  async _createWithUrlHandler(scopes, progress, token) {
    if (!this._serverMetadata.authorization_endpoint) {
      throw new Error("Authorization Endpoint required");
    }
    if (!this._serverMetadata.token_endpoint) {
      throw new Error("Token endpoint not available in server metadata");
    }
    const codeVerifier = this.generateRandomString(64);
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const nonce = this.generateRandomString(32);
    const callbackUri = URI.parse(`${this._initData.environment.appUriScheme}://dynamicauthprovider/${this.authorizationServer.authority}/authorize?nonce=${nonce}`);
    let state;
    try {
      state = await this._extHostUrls.createAppUri(callbackUri);
    } catch (error) {
      throw new Error(`Failed to create external URI: ${error}`);
    }
    const authorizationUrl = new URL(this._serverMetadata.authorization_endpoint);
    authorizationUrl.searchParams.append("client_id", this._clientId);
    authorizationUrl.searchParams.append("response_type", "code");
    authorizationUrl.searchParams.append("state", state.toString());
    authorizationUrl.searchParams.append("code_challenge", codeChallenge);
    authorizationUrl.searchParams.append("code_challenge_method", "S256");
    const scopeString = scopes.join(" ");
    if (scopeString) {
      authorizationUrl.searchParams.append("scope", scopeString);
    }
    if (this._resourceMetadata?.resource) {
      authorizationUrl.searchParams.append("resource", this._resourceMetadata.resource);
    }
    const redirectUri = "https://vscode.dev/redirect";
    authorizationUrl.searchParams.append("redirect_uri", redirectUri);
    const promise = this.waitForAuthorizationCode(callbackUri);
    this._logger.info(`Opening authorization URL for scopes: ${scopeString}`);
    this._logger.trace(`Authorization URL: ${authorizationUrl.toString()}`);
    const opened = await this._extHostWindow.openUri(authorizationUrl.toString(), {});
    if (!opened) {
      throw new CancellationError();
    }
    progress.report({
      message: localize(5873, null)
    });
    let code;
    try {
      const response = await raceCancellationError(promise, token);
      code = response.code;
    } catch (err) {
      if (isCancellationError(err)) {
        this._logger.info("Authorization code request was cancelled by the user.");
        throw err;
      }
      this._logger.error(`Failed to receive authorization code: ${err}`);
      throw new Error(`Failed to receive authorization code: ${err}`);
    }
    this._logger.info(`Authorization code received for scopes: ${scopeString}`);
    const tokenResponse = await this.exchangeCodeForToken(code, codeVerifier, redirectUri);
    return tokenResponse;
  }
  generateRandomString(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join("").substring(0, length);
  }
  async generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data2 = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest("SHA-256", data2);
    return encodeBase64(VSBuffer.wrap(new Uint8Array(digest)), false, false).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  async waitForAuthorizationCode(expectedState) {
    const result = await this._proxy.$waitForUriHandler(expectedState);
    const codeMatch = /[?&]code=([^&]+)/.exec(result.query || "");
    if (!codeMatch || codeMatch.length < 2) {
      throw new Error("Authentication failed: No authorization code received");
    }
    return { code: codeMatch[1] };
  }
  async exchangeCodeForToken(code, codeVerifier, redirectUri) {
    if (!this._serverMetadata.token_endpoint) {
      throw new Error("Token endpoint not available in server metadata");
    }
    const tokenRequest = new URLSearchParams();
    tokenRequest.append("client_id", this._clientId);
    tokenRequest.append("grant_type", "authorization_code");
    tokenRequest.append("code", code);
    tokenRequest.append("redirect_uri", redirectUri);
    tokenRequest.append("code_verifier", codeVerifier);
    if (this._resourceMetadata?.resource) {
      tokenRequest.append("resource", this._resourceMetadata.resource);
    }
    if (this._clientSecret) {
      tokenRequest.append("client_secret", this._clientSecret);
    }
    this._logger.info("Exchanging authorization code for token...");
    this._logger.trace(`Url: ${this._serverMetadata.token_endpoint}`);
    this._logger.trace(`Token request body: ${tokenRequest.toString()}`);
    let response;
    try {
      response = await this._fetch(this._serverMetadata.token_endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: tokenRequest.toString()
      });
    } catch (err) {
      this._logger.error(`Failed to exchange authorization code for token: ${err}`);
      throw new Error(`Failed to exchange authorization code for token: ${err}`);
    }
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${text}`);
    }
    const result = await response.json();
    if (isAuthorizationTokenResponse(result)) {
      this._logger.info(`Successfully exchanged authorization code for token.`);
      return result;
    } else if (isAuthorizationErrorResponse(result) && result.error === "invalid_client" /* InvalidClient */) {
      this._logger.warn(`Client ID (${this._clientId}) was invalid, generated a new one.`);
      await this._generateNewClientId();
      throw new Error(`Client ID was invalid, generated a new one. Please try again.`);
    }
    throw new Error(`Invalid authorization token response: ${JSON.stringify(result)}`);
  }
  async exchangeRefreshTokenForToken(refreshToken, allowClientRegistration) {
    if (!this._serverMetadata.token_endpoint) {
      throw new Error("Token endpoint not available in server metadata");
    }
    const tokenRequest = new URLSearchParams();
    tokenRequest.append("client_id", this._clientId);
    tokenRequest.append("grant_type", "refresh_token");
    tokenRequest.append("refresh_token", refreshToken);
    if (this._resourceMetadata?.resource) {
      tokenRequest.append("resource", this._resourceMetadata.resource);
    }
    if (this._clientSecret) {
      tokenRequest.append("client_secret", this._clientSecret);
    }
    const response = await this._fetch(this._serverMetadata.token_endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: tokenRequest.toString()
    });
    const result = await response.json();
    if (isAuthorizationTokenResponse(result)) {
      return {
        ...result,
        created_at: Date.now()
      };
    } else if (isAuthorizationErrorResponse(result) && result.error === "invalid_client" /* InvalidClient */) {
      if (!allowClientRegistration) {
        this._logger.warn(`Client ID (${this._clientId}) was invalid while silently refreshing the token.`);
        throw new Error(`Client ID was invalid while silently refreshing the token.`);
      }
      this._logger.warn(`Client ID (${this._clientId}) was invalid, generated a new one.`);
      await this._generateNewClientId();
      throw new Error(`Client ID was invalid, generated a new one. Please try again.`);
    }
    throw new Error(`Invalid authorization token response: ${JSON.stringify(result)}`);
  }
  async _generateNewClientId() {
    try {
      const registration = await fetchDynamicRegistration(this._serverMetadata, this._initData.environment.appName, this._resourceMetadata?.scopes_supported);
      this._clientId = registration.client_id;
      this._clientSecret = registration.client_secret;
      this._onDidChangeClientId.fire();
    } catch (err) {
      this._logger.info(`Dynamic registration failed for ${this.authorizationServer.toString()}: ${err}. Prompting user for client ID and client secret.`);
      try {
        const clientDetails = await this._proxy.$promptForClientRegistration(this.authorizationServer.toString());
        if (!clientDetails) {
          throw new Error("User did not provide client details");
        }
        this._clientId = clientDetails.clientId;
        this._clientSecret = clientDetails.clientSecret;
        this._logger.info(`User provided client ID for ${this.authorizationServer.toString()}`);
        if (clientDetails.clientSecret) {
          this._logger.info(`User provided client secret for ${this.authorizationServer.toString()}`);
        } else {
          this._logger.info(`User did not provide client secret for ${this.authorizationServer.toString()} (optional)`);
        }
        this._onDidChangeClientId.fire();
      } catch (promptErr) {
        this._logger.error(`Failed to fetch new client ID and user did not provide one: ${err}`);
        throw new Error(`Failed to fetch new client ID and user did not provide one: ${err}`);
      }
    }
  }
};

DynamicAuthProvider = __decorateClass([
  __decorateParam(0, IExtHostWindow),
  __decorateParam(1, IExtHostUrlsService),
  __decorateParam(2, IExtHostInitDataService),
  __decorateParam(3, IExtHostProgress),
  __decorateParam(4, ILoggerService)
], DynamicAuthProvider);

var TokenStore = class {
  constructor(_persistence, initialTokens, _logger) {
    this._persistence = _persistence;
    this._logger = _logger;
    this._onDidChangeSessions = new Emitter();
    this.onDidChangeSessions = this._onDidChangeSessions.event;
    this._disposable = new DisposableStore();
    this._tokensObservable = observableValue("tokens", initialTokens);
    this._sessionsObservable = derivedOpts(
      { equalsFn: (a, b) => equals(a, b, (a2, b2) => a2.accessToken === b2.accessToken) },
      (reader) => this._tokensObservable.read(reader).map((t) => this._getSessionFromToken(t))
    );
    this._disposable.add(this._registerChangeEventAutorun());
    this._disposable.add(this._persistence.onDidChange((tokens) => this._tokensObservable.set(tokens, void 0)));
  }
  get tokens() {
    return this._tokensObservable.get();
  }
  get sessions() {
    return this._sessionsObservable.get();
  }
  dispose() {
    this._disposable.dispose();
  }
  update({ added, removed }) {
    this._logger.trace(`Updating tokens: added ${added.length}, removed ${removed.length}`);
    const currentTokens = [...this._tokensObservable.get()];
    for (const token of removed) {
      const index = currentTokens.findIndex((t) => t.access_token === token.access_token);
      if (index !== -1) {
        currentTokens.splice(index, 1);
      }
    }
    for (const token of added) {
      const index = currentTokens.findIndex((t) => t.access_token === token.access_token);
      if (index === -1) {
        currentTokens.push(token);
      } else {
        currentTokens[index] = token;
      }
    }
    if (added.length || removed.length) {
      this._tokensObservable.set(currentTokens, void 0);
      void this._persistence.set(currentTokens);
    }
    this._logger.trace(`Tokens updated: ${currentTokens.length} tokens stored.`);
  }
  _registerChangeEventAutorun() {
    let previousSessions = [];
    return autorun((reader) => {
      this._logger.trace("Checking for session changes...");
      const currentSessions = this._sessionsObservable.read(reader);
      if (previousSessions === currentSessions) {
        this._logger.trace("No session changes detected.");
        return;
      }
      if (!currentSessions || currentSessions.length === 0) {
        this._logger.trace("All sessions removed.");
        if (previousSessions.length > 0) {
          this._onDidChangeSessions.fire({
            added: [],
            removed: previousSessions,
            changed: []
          });
          previousSessions = [];
        }
        return;
      }
      const added = [];
      const removed = [];
      for (const current of currentSessions) {
        const exists = previousSessions.some((prev) => prev.accessToken === current.accessToken);
        if (!exists) {
          added.push(current);
        }
      }
      for (const prev of previousSessions) {
        const exists = currentSessions.some((current) => current.accessToken === prev.accessToken);
        if (!exists) {
          removed.push(prev);
        }
      }
      if (added.length > 0 || removed.length > 0) {
        this._logger.trace(`Sessions changed: added ${added.length}, removed ${removed.length}`);
        this._onDidChangeSessions.fire({ added, removed, changed: [] });
      }
      previousSessions = currentSessions;
    });
  }
  _getSessionFromToken(token) {
    let claims;
    if (token.id_token) {
      try {
        claims = getClaimsFromJWT(token.id_token);
      } catch (e) {
      }
    }
    if (!claims) {
      try {
        claims = getClaimsFromJWT(token.access_token);
      } catch (e) {
      }
    }
    const scopes = token.scope !== void 0 ? token.scope ? token.scope.split(" ") : [] : claims?.scope ? claims.scope.split(" ") : [];
    return {
      id: stringHash(token.access_token, 0).toString(),
      accessToken: token.access_token,
      account: {
        id: claims?.sub || "unknown",
        // TODO: Don't say MCP...
        label: claims?.preferred_username || claims?.name || claims?.email || "MCP"
      },
      scopes,
      idToken: token.id_token
    };
  }
};
export { reviveAccountIcon, IExtHostAuthentication, ExtHostAuthentication, TaskSingler, DynamicAuthProvider, TokenStore };
