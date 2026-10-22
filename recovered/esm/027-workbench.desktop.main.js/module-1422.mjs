// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadAuthentication.ts
import { URI } from "./module-0032.mjs";
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { IAuthenticationExtensionsService, IAuthenticationService, getDynamicAuthenticationProviderId, isAuthenticationWwwAuthenticateRequest } from "./module-0951.mjs";
import { fetchAuthorizationServerMetadata } from "./module-1417.mjs";
import { mcpEnterpriseManagedAuthIdpSection } from "./module-1421.mjs";
import { Emitter } from "./module-0017.mjs";
import { getAuthenticationProviderActivationEvent } from "./module-1418.mjs";
import { DeferredPromise, raceTimeout } from "./module-0036.mjs";
import { localize } from "./module-0001.mjs";
import { severity_default } from "./module-0266.mjs";
import { CancellationError } from "./module-0004.mjs";
import { mcpOAuthClientSecretStorageKey } from "./module-1206.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IProductService } from "./module-0873.mjs";
import { IAuthenticationAccessService } from "./module-0968.mjs";
import { IAuthenticationUsageService } from "./module-1416.mjs";
import { IDialogService } from "./module-0267.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ILogService } from "./module-0095.mjs";
import { IURLService } from "./module-1286.mjs";
import { IDynamicAuthenticationProviderStorageService } from "./module-1419.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ISecretStorageService } from "./module-0948.mjs";


// src/vs/workbench/api/browser/mainThreadAuthentication.ts
function reviveSessionAccountIcon(session) {
  return { ...session, account: { ...session.account, icon: URI.revive(session.account.icon) } };
}

var MainThreadAuthenticationProvider = class extends Disposable {
  constructor(_proxy, id2, label3, supportsMultipleAccounts, authorizationServers, resourceServer, onDidChangeSessionsEmitter) {
    super();
    this._proxy = _proxy;
    this.id = id2;
    this.label = label3;
    this.supportsMultipleAccounts = supportsMultipleAccounts;
    this.authorizationServers = authorizationServers;
    this.resourceServer = resourceServer;
    this.onDidChangeSessions = onDidChangeSessionsEmitter.event;
  }
  async getSessions(scopes, options3) {
    const sessions = await this._proxy.$getSessions(this.id, scopes, options3);
    return sessions.map(reviveSessionAccountIcon);
  }
  async createSession(scopes, options3) {
    return reviveSessionAccountIcon(await this._proxy.$createSession(this.id, scopes, options3));
  }
  async removeSession(sessionId) {
    await this._proxy.$removeSession(this.id, sessionId);
  }
};

var MainThreadAuthenticationProviderWithChallenges = class extends MainThreadAuthenticationProvider {
  constructor(proxy, id2, label3, supportsMultipleAccounts, authorizationServers, resourceServer, onDidChangeSessionsEmitter) {
    super(
      proxy,
      id2,
      label3,
      supportsMultipleAccounts,
      authorizationServers,
      resourceServer,
      onDidChangeSessionsEmitter
    );
  }
  async getSessionsFromChallenges(constraint, options3) {
    const sessions = await this._proxy.$getSessionsFromChallenges(this.id, constraint, options3);
    return sessions.map(reviveSessionAccountIcon);
  }
  async createSessionFromChallenges(constraint, options3) {
    return reviveSessionAccountIcon(await this._proxy.$createSessionFromChallenges(this.id, constraint, options3));
  }
};

var MainThreadAuthentication = class extends Disposable {
  constructor(extHostContext, productService, authenticationService, authenticationExtensionsService, authenticationAccessService, authenticationUsageService, dialogService, notificationService, extensionService, telemetryService, openerService, logService, urlService, dynamicAuthProviderStorageService, clipboardService, quickInputService, configurationService, secretStorageService) {
    super();
    this.productService = productService;
    this.authenticationService = authenticationService;
    this.authenticationExtensionsService = authenticationExtensionsService;
    this.authenticationAccessService = authenticationAccessService;
    this.authenticationUsageService = authenticationUsageService;
    this.dialogService = dialogService;
    this.notificationService = notificationService;
    this.extensionService = extensionService;
    this.telemetryService = telemetryService;
    this.openerService = openerService;
    this.logService = logService;
    this.urlService = urlService;
    this.dynamicAuthProviderStorageService = dynamicAuthProviderStorageService;
    this.clipboardService = clipboardService;
    this.quickInputService = quickInputService;
    this.configurationService = configurationService;
    this.secretStorageService = secretStorageService;
    this._registrations = this._register(new DisposableMap());
    this._sentProviderUsageEvents = /* @__PURE__ */ new Set();
    this._suppressUnregisterEvent = false;
    // TODO@TylerLeonhardt this is a temporary addition to telemetry to understand what extensions are overriding the client id.
    // We can use this telemetry to reach out to these extension authors and let them know that they many need configuration changes
    // due to the adoption of the Microsoft broker.
    // Remove this in a few iterations.
    this._sentClientIdUsageEvents = /* @__PURE__ */ new Set();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostAuthentication);
    this._register(this.authenticationService.onDidChangeSessions((e) => this._proxy.$onDidChangeAuthenticationSessions(e.providerId, e.label)));
    this._register(this.authenticationService.onDidUnregisterAuthenticationProvider((e) => {
      if (!this._suppressUnregisterEvent) {
        this._proxy.$onDidUnregisterAuthenticationProvider(e.id);
      }
    }));
    this._register(this.authenticationExtensionsService.onDidChangeAccountPreference((e) => {
      const providerInfo = this.authenticationService.getProvider(e.providerId);
      this._proxy.$onDidChangeAuthenticationSessions(providerInfo.id, providerInfo.label, e.extensionIds);
    }));
    this._register(this.dynamicAuthProviderStorageService.onDidChangeTokens((e) => {
      this._proxy.$onDidChangeDynamicAuthProviderTokens(e.authProviderId, e.clientId, e.tokens);
    }));
    this._register(authenticationService.registerAuthenticationProviderHostDelegate({
      // Prefer Node.js extension hosts when they're available. No CORS issues etc.
      priority: extHostContext.extensionHostKind === 2 /* LocalWebWorker */ ? 0 : 1,
      create: async (authorizationServer, serverMetadata, resource, overrideClientId, overrideClientSecret) => {
        const authProviderId = getDynamicAuthenticationProviderId(authorizationServer, resource);
        const clientDetails = await this.dynamicAuthProviderStorageService.getClientRegistration(authProviderId);
        let clientId = overrideClientId ?? clientDetails?.clientId;
        const clientSecret = overrideClientId ? overrideClientSecret : overrideClientSecret ?? clientDetails?.clientSecret;
        let initialTokens = void 0;
        if (clientId) {
          initialTokens = await this.dynamicAuthProviderStorageService.getSessionsForDynamicAuthProvider(authProviderId, clientId);
        } else if (serverMetadata.client_id_metadata_document_supported) {
          clientId = this.productService.authClientIdMetadataUrl;
        }
        return await this._proxy.$registerDynamicAuthProvider(
          authorizationServer,
          serverMetadata,
          resource,
          clientId,
          clientSecret,
          initialTokens
        );
      },
      createXaa: async (issuer) => {
        const authProviderId = `xaa:${issuer.toString(true)}`;
        const { metadata: serverMetadata } = await fetchAuthorizationServerMetadata(issuer.toString(true));
        const configuredIdp = this.configurationService.getValue(mcpEnterpriseManagedAuthIdpSection) ?? {};
        const configuredClientId = configuredIdp.clientId?.trim() || void 0;
        const configuredClientSecret = configuredIdp.clientSecret?.trim() || void 0;
        const cached = await this.dynamicAuthProviderStorageService.getClientRegistration(authProviderId);
        const clientId = configuredClientId ?? cached?.clientId;
        const clientSecret = configuredClientSecret ?? cached?.clientSecret;
        let initialTokens = void 0;
        if (clientId) {
          initialTokens = await this.dynamicAuthProviderStorageService.getSessionsForDynamicAuthProvider(authProviderId, clientId);
        }
        return await this._proxy.$registerXaaAuthProvider(
          issuer,
          serverMetadata,
          clientId,
          clientSecret,
          initialTokens
        );
      }
    }));
  }
  async $registerAuthenticationProvider({ id: id2, label: label3, supportsMultipleAccounts, resourceServer, supportedAuthorizationServers, supportsChallenges }) {
    if (!this.authenticationService.declaredProviders.find((p) => p.id === id2)) {
      this.logService.warn(`Authentication provider ${id2} was not declared in the Extension Manifest.`);
      this.telemetryService.publicLog2("authentication.providerNotDeclared", { id: id2 });
    }
    const emitter = new Emitter();
    this._registrations.set(id2, emitter);
    const supportedAuthorizationServerUris = (supportedAuthorizationServers ?? []).map((i2) => URI.revive(i2));
    const provider = supportsChallenges ? new MainThreadAuthenticationProviderWithChallenges(
      this._proxy,
      id2,
      label3,
      supportsMultipleAccounts,
      supportedAuthorizationServerUris,
      resourceServer ? URI.revive(resourceServer) : void 0,
      emitter
    ) : new MainThreadAuthenticationProvider(
      this._proxy,
      id2,
      label3,
      supportsMultipleAccounts,
      supportedAuthorizationServerUris,
      resourceServer ? URI.revive(resourceServer) : void 0,
      emitter
    );
    this.authenticationService.registerAuthenticationProvider(id2, provider);
  }
  async $unregisterAuthenticationProvider(id2) {
    this._registrations.deleteAndDispose(id2);
    this._suppressUnregisterEvent = true;
    try {
      this.authenticationService.unregisterAuthenticationProvider(id2);
    } finally {
      this._suppressUnregisterEvent = false;
    }
  }
  async $ensureProvider(id2) {
    if (!this.authenticationService.isAuthenticationProviderRegistered(id2)) {
      return await this.extensionService.activateByEvent(getAuthenticationProviderActivationEvent(id2), 1 /* Immediate */);
    }
  }
  async $sendDidChangeSessions(providerId, event) {
    const obj = this._registrations.get(providerId);
    if (obj instanceof Emitter) {
      obj.fire({
        added: event.added?.map(reviveSessionAccountIcon),
        removed: event.removed?.map(reviveSessionAccountIcon),
        changed: event.changed?.map(reviveSessionAccountIcon)
      });
    }
  }
  $removeSession(providerId, sessionId) {
    return this.authenticationService.removeSession(providerId, sessionId);
  }
  async $waitForUriHandler(expectedUri) {
    const deferredPromise = new DeferredPromise();
    const disposable = this.urlService.registerHandler({
      handleURL: async (uri5) => {
        if (uri5.scheme !== expectedUri.scheme || uri5.authority !== expectedUri.authority || uri5.path !== expectedUri.path) {
          return false;
        }
        deferredPromise.complete(uri5);
        disposable.dispose();
        return true;
      }
    });
    const result = await raceTimeout(deferredPromise.p, 5 * 60 * 1e3);
    if (!result) {
      throw new Error("Timed out waiting for URI handler");
    }
    return await deferredPromise.p;
  }
  $showContinueNotification(message) {
    const yes = localize(5669, null);
    const no = localize(5665, null);
    const deferredPromise = new DeferredPromise();
    let result = false;
    const handle2 = this.notificationService.prompt(
      severity_default.Warning,
      message,
      [{
        label: yes,
        run: () => result = true
      }, {
        label: no,
        run: () => result = false
      }]
    );
    const disposable = handle2.onDidClose(() => {
      deferredPromise.complete(result);
      disposable.dispose();
    });
    return deferredPromise.p;
  }
  async $registerDynamicAuthenticationProvider(details) {
    await this.$registerAuthenticationProvider({
      id: details.id,
      label: details.label,
      supportsMultipleAccounts: true,
      supportedAuthorizationServers: [details.authorizationServer],
      resourceServer: details.resourceServer
    });
    await this.dynamicAuthProviderStorageService.storeClientRegistration(details.id, URI.revive(details.authorizationServer).toString(true), details.clientId, details.clientSecret, details.label);
  }
  async $setSessionsForDynamicAuthProvider(authProviderId, clientId, sessions) {
    await this.dynamicAuthProviderStorageService.setSessionsForDynamicAuthProvider(authProviderId, clientId, sessions);
  }
  async $sendDidChangeDynamicProviderInfo({ providerId, clientId, authorizationServer, label: label3, clientSecret }) {
    this.logService.info(`Client ID for authentication provider ${providerId} changed to ${clientId}`);
    const existing = this.dynamicAuthProviderStorageService.getInteractedProviders().find((p) => p.providerId === providerId);
    if (!existing) {
      throw new Error(`Dynamic authentication provider ${providerId} not found. Has it been registered?`);
    }
    await this.dynamicAuthProviderStorageService.storeClientRegistration(
      providerId || existing.providerId,
      authorizationServer ? URI.revive(authorizationServer).toString(true) : existing.authorizationServer,
      clientId || existing.clientId,
      clientSecret,
      label3 || existing.label
    );
  }
  async loginPrompt(provider, extensionName, recreatingSession, options3) {
    let message;
    const customMessage = provider.confirmation?.(extensionName, recreatingSession);
    if (customMessage) {
      message = customMessage;
    } else {
      message = recreatingSession ? localize(5651, null, extensionName, provider.label) : localize(5650, null, extensionName, provider.label);
    }
    const buttons = [
      {
        label: localize(5643, null),
        run() {
          return true;
        }
      }
    ];
    if (options3?.learnMore) {
      buttons.push({
        label: localize(5663, null),
        run: async () => {
          const result2 = this.loginPrompt(provider, extensionName, recreatingSession, options3);
          await this.openerService.open(URI.revive(options3.learnMore), { allowCommands: true });
          return await result2;
        }
      });
    }
    const { result } = await this.dialogService.prompt({
      type: severity_default.Info,
      message,
      buttons,
      detail: options3?.detail,
      cancelButton: true
    });
    return result ?? false;
  }
  async continueWithIncorrectAccountPrompt(chosenAccountLabel, requestedAccountLabel) {
    const result = await this.dialogService.prompt({
      message: localize(5660, null),
      detail: localize(5661, null, chosenAccountLabel, requestedAccountLabel),
      type: severity_default.Warning,
      cancelButton: true,
      buttons: [
        {
          label: localize(5662, null, chosenAccountLabel),
          run: () => chosenAccountLabel
        },
        {
          label: localize(5664, null, requestedAccountLabel),
          run: () => requestedAccountLabel
        }
      ]
    });
    if (!result.result) {
      throw new CancellationError();
    }
    return result.result === chosenAccountLabel;
  }
  async doGetSession(providerId, scopeListOrRequest, extensionId, extensionName, options3) {
    const authorizationServer = URI.revive(options3.authorizationServer);
    const sessions = await this.authenticationService.getSessions(providerId, scopeListOrRequest, { account: options3.account, authorizationServer }, true);
    const provider = this.authenticationService.getProvider(providerId);
    if (options3.forceNewSession && options3.createIfNone) {
      throw new Error("Invalid combination of options. Please remove one of the following: forceNewSession, createIfNone");
    }
    if (options3.forceNewSession && options3.silent) {
      throw new Error("Invalid combination of options. Please remove one of the following: forceNewSession, silent");
    }
    if (options3.createIfNone && options3.silent) {
      throw new Error("Invalid combination of options. Please remove one of the following: createIfNone, silent");
    }
    if (options3.clearSessionPreference) {
      this.authenticationExtensionsService.removeAccountPreference(extensionId, providerId);
    }
    const matchingAccountPreferenceSession = (
      // If an account was passed in, that takes precedence over the account preference
      options3.account ? sessions[0] : this._getAccountPreference(extensionId, providerId, sessions)
    );
    if (!options3.forceNewSession && sessions.length) {
      if (matchingAccountPreferenceSession && this.authenticationAccessService.isAccessAllowed(providerId, matchingAccountPreferenceSession.account.label, extensionId)) {
        return matchingAccountPreferenceSession;
      }
      if (!provider.supportsMultipleAccounts && this.authenticationAccessService.isAccessAllowed(providerId, sessions[0].account.label, extensionId)) {
        return sessions[0];
      }
    }
    if (options3.createIfNone || options3.forceNewSession) {
      let uiOptions;
      if (typeof options3.forceNewSession === "object") {
        uiOptions = options3.forceNewSession;
      } else if (typeof options3.createIfNone === "object") {
        uiOptions = options3.createIfNone;
      }
      const recreatingSession = !!(options3.forceNewSession && sessions.length);
      const isAllowed = await this.loginPrompt(provider, extensionName, recreatingSession, uiOptions);
      if (!isAllowed) {
        throw new Error("User did not consent to login.");
      }
      let session;
      if (sessions?.length && !options3.forceNewSession) {
        session = provider.supportsMultipleAccounts && !options3.account ? await this.authenticationExtensionsService.selectSession(providerId, extensionId, extensionName, scopeListOrRequest, sessions) : sessions[0];
      } else {
        const accountToCreate = options3.account ?? matchingAccountPreferenceSession?.account;
        do {
          session = await this.authenticationService.createSession(
            providerId,
            scopeListOrRequest,
            {
              activateImmediate: true,
              account: accountToCreate,
              authorizationServer
            }
          );
        } while (accountToCreate && accountToCreate.label !== session.account.label && !await this.continueWithIncorrectAccountPrompt(session.account.label, accountToCreate.label));
      }
      this.authenticationAccessService.updateAllowedExtensions(providerId, session.account.label, [{ id: extensionId, name: extensionName, allowed: true }]);
      this.authenticationExtensionsService.updateNewSessionRequests(providerId, [session]);
      this.authenticationExtensionsService.updateAccountPreference(extensionId, providerId, session.account);
      return session;
    }
    if (!matchingAccountPreferenceSession) {
      const validSessions = sessions.filter((session) => this.authenticationAccessService.isAccessAllowed(providerId, session.account.label, extensionId));
      if (validSessions.length === 1) {
        return validSessions[0];
      }
    }
    if (!options3.silent) {
      sessions.length ? this.authenticationExtensionsService.requestSessionAccess(providerId, extensionId, extensionName, scopeListOrRequest, sessions) : await this.authenticationExtensionsService.requestNewSession(providerId, scopeListOrRequest, extensionId, extensionName);
    }
    return void 0;
  }
  async $getSession(providerId, scopeListOrRequest, extensionId, extensionName, options3) {
    const scopes = isAuthenticationWwwAuthenticateRequest(scopeListOrRequest) ? scopeListOrRequest.fallbackScopes : scopeListOrRequest;
    if (scopes) {
      this.sendClientIdUsageTelemetry(extensionId, providerId, scopes);
    }
    const session = await this.doGetSession(providerId, scopeListOrRequest, extensionId, extensionName, options3);
    if (session) {
      this.sendProviderUsageTelemetry(extensionId, providerId);
      this.authenticationUsageService.addAccountUsage(providerId, session.account.label, session.scopes, extensionId, extensionName);
    }
    return session;
  }
  async $getAccounts(providerId) {
    const accounts = await this.authenticationService.getAccounts(providerId);
    return accounts;
  }
  sendClientIdUsageTelemetry(extensionId, providerId, scopes) {
    const containsVSCodeClientIdScope = scopes.some((scope) => scope.startsWith("VSCODE_CLIENT_ID:"));
    const key3 = `${extensionId}|${providerId}|${containsVSCodeClientIdScope}`;
    if (this._sentClientIdUsageEvents.has(key3)) {
      return;
    }
    this._sentClientIdUsageEvents.add(key3);
    if (containsVSCodeClientIdScope) {
      this.telemetryService.publicLog2("authentication.clientIdUsage", { extensionId });
    }
  }
  sendProviderUsageTelemetry(extensionId, providerId) {
    const key3 = `${extensionId}|${providerId}`;
    if (this._sentProviderUsageEvents.has(key3)) {
      return;
    }
    this._sentProviderUsageEvents.add(key3);
    this.telemetryService.publicLog2("authentication.providerUsage", { providerId, extensionId });
  }
  //#region Account Preferences
  // TODO@TylerLeonhardt: Update this after a few iterations to no longer fallback to the session preference
  _getAccountPreference(extensionId, providerId, sessions) {
    if (sessions.length === 0) {
      return void 0;
    }
    const accountNamePreference = this.authenticationExtensionsService.getAccountPreference(extensionId, providerId);
    if (accountNamePreference) {
      const session = sessions.find((session2) => session2.account.label === accountNamePreference);
      return session;
    }
    return void 0;
  }
  //#endregion
  async $showDeviceCodeModal(userCode, verificationUri) {
    const { result } = await this.dialogService.prompt({
      type: severity_default.Info,
      message: localize(5658, null),
      detail: localize(5657, null, userCode, verificationUri),
      buttons: [
        {
          label: localize(5652, null),
          run: () => true
        }
      ],
      cancelButton: true
    });
    if (result) {
      try {
        await this.clipboardService.writeText(userCode);
        return await this.openerService.open(URI.parse(verificationUri));
      } catch (error) {
        this.notificationService.error(localize(5659, null, verificationUri));
      }
    }
    return false;
  }
  async $promptForClientRegistration(authorizationServerUrl) {
    const redirectUrls = "http://127.0.0.1:33418\nhttps://vscode.dev/redirect";
    const result = await this.dialogService.prompt({
      type: severity_default.Info,
      message: localize(5655, null),
      detail: localize(5656, null, authorizationServerUrl, redirectUrls),
      buttons: [
        {
          label: localize(5653, null),
          run: async () => {
            try {
              await this.clipboardService.writeText(redirectUrls);
            } catch (error) {
              this.notificationService.error(localize(5654, null));
            }
            return true;
          }
        }
      ],
      cancelButton: {
        label: localize(5644, null),
        run: () => false
      }
    });
    if (!result) {
      return void 0;
    }
    const sharedTitle = localize(5642, null);
    const clientId = await this.quickInputService.input({
      title: sharedTitle,
      prompt: localize(5646, null),
      placeHolder: localize(5645, null),
      ignoreFocusLost: true,
      validateInput: async (value2) => {
        if (!value2 || value2.trim().length === 0) {
          return localize(5647, null);
        }
        return void 0;
      }
    });
    if (!clientId || clientId.trim().length === 0) {
      return void 0;
    }
    const clientSecret = await this.quickInputService.input({
      title: sharedTitle,
      prompt: localize(5649, null, clientId),
      placeHolder: localize(5648, null),
      password: true,
      ignoreFocusLost: true
    });
    return {
      clientId: clientId.trim(),
      clientSecret: clientSecret?.trim() || void 0
    };
  }
  async $promptForResourceClientSecret(resourceClientId, resource) {
    const value2 = await this.quickInputService.input({
      title: localize(5668, null),
      prompt: localize(
        5667,
        null,
        resource,
        resourceClientId
      ),
      placeHolder: localize(5666, null),
      password: true,
      ignoreFocusLost: true
    });
    if (value2 === void 0) {
      return void 0;
    }
    const trimmed = value2.trim();
    const key3 = mcpOAuthClientSecretStorageKey(resource, resourceClientId);
    try {
      if (trimmed.length === 0) {
        await this.secretStorageService.delete(key3);
      } else {
        await this.secretStorageService.set(key3, trimmed);
      }
    } catch (err) {
      this.logService.warn(`[XAA] Failed to persist resource client secret for ${resource} / ${resourceClientId}: ${err.message}`);
    }
    return trimmed;
  }
};

MainThreadAuthentication = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadAuthentication),
  __decorateParam(1, IProductService),
  __decorateParam(2, IAuthenticationService),
  __decorateParam(3, IAuthenticationExtensionsService),
  __decorateParam(4, IAuthenticationAccessService),
  __decorateParam(5, IAuthenticationUsageService),
  __decorateParam(6, IDialogService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IExtensionService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, IOpenerService),
  __decorateParam(11, ILogService),
  __decorateParam(12, IURLService),
  __decorateParam(13, IDynamicAuthenticationProviderStorageService),
  __decorateParam(14, IClipboardService),
  __decorateParam(15, IQuickInputService),
  __decorateParam(16, IConfigurationService),
  __decorateParam(17, ISecretStorageService)
], MainThreadAuthentication);
export { reviveSessionAccountIcon, MainThreadAuthenticationProvider, MainThreadAuthenticationProviderWithChallenges, MainThreadAuthentication };
