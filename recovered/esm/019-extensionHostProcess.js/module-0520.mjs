// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHostAuthentication.ts
import { DynamicAuthProvider, ExtHostAuthentication } from "./module-0275.mjs";
import { localize } from "./module-0013.mjs";
import { URI } from "./module-0025.mjs";
import { LoopbackAuthServer } from "./module-0521.mjs";
import { CancellationError, isCancellationError } from "./module-0003.mjs";
import { raceCancellationError } from "./module-0029.mjs";
import { isAuthorizationDeviceResponse, isAuthorizationTokenResponse } from "./module-0270.mjs";
import { XaaifyAuthProvider } from "./module-0274.mjs";


// src/vs/workbench/api/node/extHostAuthentication.ts
import { URL as URL3 } from "url";


// src/vs/workbench/api/node/extHostAuthentication.ts
var NodeDynamicAuthProvider = class extends DynamicAuthProvider {
  constructor(extHostWindow, extHostUrls, initData, extHostProgress, loggerService, proxy, authorizationServer, serverMetadata, resourceMetadata, clientId, clientSecret, onDidDynamicAuthProviderTokensChange, initialTokens) {
    super(
      extHostWindow,
      extHostUrls,
      initData,
      extHostProgress,
      loggerService,
      proxy,
      authorizationServer,
      serverMetadata,
      resourceMetadata,
      clientId,
      clientSecret,
      onDidDynamicAuthProviderTokensChange,
      initialTokens
    );
    if (!initData.remote.isRemote && serverMetadata.authorization_endpoint) {
      this._createFlows.unshift({
        label: localize(5916, null),
        handler: (scopes, progress, token) => this._createWithLoopbackServer(scopes, progress, token)
      });
    }
    if (serverMetadata.device_authorization_endpoint) {
      this._createFlows.push({
        label: localize(5915, null),
        handler: (scopes, progress, token) => this._createWithDeviceCode(scopes, progress, token)
      });
    }
  }
  async _createWithLoopbackServer(scopes, progress, token) {
    if (!this._serverMetadata.authorization_endpoint) {
      throw new Error("Authorization Endpoint required");
    }
    if (!this._serverMetadata.token_endpoint) {
      throw new Error("Token endpoint not available in server metadata");
    }
    const codeVerifier = this.generateRandomString(64);
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const nonce = this.generateRandomString(32);
    const callbackUri = URI.parse(`${this._initData.environment.appUriScheme}://dynamicauthprovider/${this.authorizationServer.authority}/redirect?nonce=${nonce}`);
    let appUri;
    try {
      appUri = await this._extHostUrls.createAppUri(callbackUri);
    } catch (error) {
      throw new Error(`Failed to create external URI: ${error}`);
    }
    const authorizationUrl = new URL3(this._serverMetadata.authorization_endpoint);
    authorizationUrl.searchParams.append("client_id", this._clientId);
    authorizationUrl.searchParams.append("response_type", "code");
    authorizationUrl.searchParams.append("code_challenge", codeChallenge);
    authorizationUrl.searchParams.append("code_challenge_method", "S256");
    const scopeString = scopes.join(" ");
    if (scopeString) {
      authorizationUrl.searchParams.append("scope", scopeString);
    }
    if (this._resourceMetadata?.resource) {
      authorizationUrl.searchParams.append("resource", this._resourceMetadata.resource);
    }
    const server = new LoopbackAuthServer(
      this._logger,
      appUri,
      this._initData.environment.appName
    );
    try {
      await server.start();
    } catch (err) {
      throw new Error(`Failed to start loopback server: ${err}`);
    }
    authorizationUrl.searchParams.set("redirect_uri", server.redirectUri);
    authorizationUrl.searchParams.set("state", server.state);
    const promise = server.waitForOAuthResponse();
    void this._proxy.$waitForUriHandler(appUri);
    try {
      this._logger.info(`Opening authorization URL for scopes: ${scopeString}`);
      this._logger.trace(`Authorization URL: ${authorizationUrl.toString()}`);
      const opened = await this._extHostWindow.openUri(authorizationUrl.toString(), {});
      if (!opened) {
        throw new CancellationError();
      }
      progress.report({
        message: localize(5914, null)
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
      const tokenResponse = await this.exchangeCodeForToken(code, codeVerifier, server.redirectUri);
      return tokenResponse;
    } finally {
      setTimeout(() => {
        void server.stop();
      }, 5e3);
    }
  }
  async _createWithDeviceCode(scopes, progress, token) {
    if (!this._serverMetadata.token_endpoint) {
      throw new Error("Token endpoint not available in server metadata");
    }
    if (!this._serverMetadata.device_authorization_endpoint) {
      throw new Error("Device authorization endpoint not available in server metadata");
    }
    const deviceAuthUrl = this._serverMetadata.device_authorization_endpoint;
    const scopeString = scopes.join(" ");
    this._logger.info(`Starting device code flow for scopes: ${scopeString}`);
    const deviceCodeRequest = new URLSearchParams();
    deviceCodeRequest.append("client_id", this._clientId);
    if (scopeString) {
      deviceCodeRequest.append("scope", scopeString);
    }
    if (this._resourceMetadata?.resource) {
      deviceCodeRequest.append("resource", this._resourceMetadata.resource);
    }
    let deviceCodeResponse;
    try {
      deviceCodeResponse = await fetch(deviceAuthUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: deviceCodeRequest.toString()
      });
    } catch (error) {
      this._logger.error(`Failed to request device code: ${error}`);
      throw new Error(`Failed to request device code: ${error}`);
    }
    if (!deviceCodeResponse.ok) {
      const text = await deviceCodeResponse.text();
      throw new Error(`Device code request failed: ${deviceCodeResponse.status} ${deviceCodeResponse.statusText} - ${text}`);
    }
    const deviceCodeData = await deviceCodeResponse.json();
    if (!isAuthorizationDeviceResponse(deviceCodeData)) {
      this._logger.error("Invalid device code response received from server");
      throw new Error("Invalid device code response received from server");
    }
    this._logger.info(`Device code received: ${deviceCodeData.user_code}`);
    const userConfirmed = await this._proxy.$showDeviceCodeModal(
      deviceCodeData.user_code,
      deviceCodeData.verification_uri
    );
    if (!userConfirmed) {
      throw new CancellationError();
    }
    progress.report({
      message: localize(5917, null, deviceCodeData.verification_uri, deviceCodeData.user_code)
    });
    const pollInterval = (deviceCodeData.interval || 5) * 1e3;
    const expiresAt = Date.now() + deviceCodeData.expires_in * 1e3;
    while (Date.now() < expiresAt) {
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      await new Promise((resolve2) => setTimeout(resolve2, pollInterval));
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      const tokenRequest = new URLSearchParams();
      tokenRequest.append("grant_type", "urn:ietf:params:oauth:grant-type:device_code");
      tokenRequest.append("device_code", deviceCodeData.device_code);
      tokenRequest.append("client_id", this._clientId);
      if (this._resourceMetadata?.resource) {
        tokenRequest.append("resource", this._resourceMetadata.resource);
      }
      try {
        const tokenResponse = await fetch(this._serverMetadata.token_endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
          },
          body: tokenRequest.toString()
        });
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          if (!isAuthorizationTokenResponse(tokenData)) {
            this._logger.error("Invalid token response received from server");
            throw new Error("Invalid token response received from server");
          }
          this._logger.info(`Device code flow completed successfully for scopes: ${scopeString}`);
          return tokenData;
        } else {
          let errorData;
          try {
            errorData = await tokenResponse.json();
          } catch (e) {
            this._logger.error(`Failed to parse error response: ${e}`);
            throw new Error(`Token request failed with status ${tokenResponse.status}: ${tokenResponse.statusText}`);
          }
          if (errorData.error === "authorization_pending" /* AuthorizationPending */) {
            continue;
          } else if (errorData.error === "slow_down" /* SlowDown */) {
            await new Promise((resolve2) => setTimeout(resolve2, pollInterval));
            continue;
          } else if (errorData.error === "expired_token" /* ExpiredToken */) {
            throw new Error("Device code expired. Please try again.");
          } else if (errorData.error === "access_denied" /* AccessDenied */) {
            throw new CancellationError();
          } else if (errorData.error === "invalid_client" /* InvalidClient */) {
            this._logger.warn(`Client ID (${this._clientId}) was invalid, generated a new one.`);
            await this._generateNewClientId();
            throw new Error(`Client ID was invalid, generated a new one. Please try again.`);
          } else {
            throw new Error(`Token request failed: ${errorData.error_description || errorData.error || "Unknown error"}`);
          }
        }
      } catch (error) {
        if (isCancellationError(error)) {
          throw error;
        }
        throw new Error(`Error polling for token: ${error}`);
      }
    }
    throw new Error("Device code flow timed out. Please try again.");
  }
};

var NodeExtHostAuthentication = class extends ExtHostAuthentication {
  constructor(extHostRpc, initData, extHostWindow, extHostUrls, extHostProgress, extHostLoggerService, extHostLogService) {
    super(extHostRpc, initData, extHostWindow, extHostUrls, extHostProgress, extHostLoggerService, extHostLogService);
    this._dynamicAuthProviderCtor = NodeDynamicAuthProvider;
    this._xaaAuthProviderCtor = XaaifyAuthProvider(NodeDynamicAuthProvider);
  }
};
export { URL3, NodeDynamicAuthProvider, NodeExtHostAuthentication };
