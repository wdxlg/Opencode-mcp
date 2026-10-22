// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostMcp.ts
import { createDecorator } from "./module-0038.mjs";
import { vArray, vNumber, vObj, vObjAny, vOptionalProp, vString } from "./module-0319.mjs";
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0011.mjs";
import { Emitter } from "./module-0019.mjs";
import { MainContext } from "./module-0025.mjs";
import { McpServerDefinition2 } from "./module-0239.mjs";
import { McpConnectionState, McpServerLaunch, UserInteractionRequiredError, extensionPrefixedIdentifier } from "./module-0214.mjs";
import { URI } from "./module-0023.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0026.mjs";
import { ExtensionIdentifier } from "./module-0040.mjs";
import { checkProposedApiEnabled, isProposedApiEnabled } from "./module-0167.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0052.mjs";
import { ILogService, canLog } from "./module-0045.mjs";
import { IExtHostInitDataService } from "./module-0049.mjs";
import { IExtHostWorkspace } from "./module-0245.mjs";
import { IExtHostVariableResolverProvider } from "./module-0306.mjs";
import { IExtHostCommands } from "./module-0261.mjs";
import { DeferredPromise, Sequencer, raceCancellationError, timeout } from "./module-0034.mjs";
import { OPENCODE_MANAGED_HTTP_HEADER, OPENCODE_MCP_OAUTH_HEADER, OPENCODE_MCP_TIMEOUT_HEADER, openCodeMcpLaunchOptions } from "./module-0317.mjs";
import { SSEParser } from "./module-0318.mjs";
import { CancellationError } from "./module-0002.mjs";
import { MCP } from "./module-0213.mjs";
import { product_default } from "./module-0129.mjs";
import { AUTH_SCOPE_SEPARATOR, fetchAuthorizationServerMetadata, fetchResourceMetadata, getDefaultMetadataForUrl, parseWWWAuthenticateHeader, scopesMatch } from "./module-0263.mjs";


// src/vs/workbench/api/common/extHostMcp.ts
var IExtHostMpcService = createDecorator("IExtHostMpcService");

var serverDataValidation = vObj({
  label: vString(),
  version: vOptionalProp(vString()),
  metadata: vOptionalProp(vObj({
    capabilities: vOptionalProp(vObjAny()),
    serverInfo: vOptionalProp(vObjAny()),
    tools: vOptionalProp(vArray(vObj({
      availability: vNumber(),
      definition: vObjAny()
    })))
  })),
  authentication: vOptionalProp(vObj({
    providerId: vString(),
    scopes: vArray(vString())
  }))
});

var ExtHostMcpService = class extends Disposable {
  constructor(extHostRpc, _logService, _extHostInitData, _workspaceService, _variableResolver, _commands) {
    super();
    this._logService = _logService;
    this._extHostInitData = _extHostInitData;
    this._workspaceService = _workspaceService;
    this._variableResolver = _variableResolver;
    this._commands = _commands;
    this._initialProviderPromises = /* @__PURE__ */ new Set();
    this._sseEventSources = this._register(new DisposableMap());
    this._unresolvedMcpServers = /* @__PURE__ */ new Map();
    // MCP server definitions synced from main thread
    this._onDidChangeMcpServerDefinitions = this._register(new Emitter());
    this.onDidChangeMcpServerDefinitions = this._onDidChangeMcpServerDefinitions.event;
    this._mcpServerDefinitions = [];
    // Active gateways with their server emitters for dynamic updates
    this._activeGateways = /* @__PURE__ */ new Map();
    this._readOpenCodeOAuthToken = (handle, resource, staleStamp) => {
      if (!this._workspaceService.trusted) {
        throw new Error("Workspace trust is required for OAuth.");
      }
      return this._commands.executeCommand("_opencode.mcp.oauthToken", handle, resource, staleStamp);
    };
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadMcp);
  }
  /** Returns all MCP server definitions known to the editor. */
  get mcpServerDefinitions() {
    return this._mcpServerDefinitions;
  }
  /** Called by main thread to notify that MCP server definitions have changed. */
  $onDidChangeMcpServerDefinitions(servers) {
    this._mcpServerDefinitions = servers.map((dto) => McpServerDefinition2.to(dto));
    this._onDidChangeMcpServerDefinitions.fire();
  }
  $startMcp(id2, opts) {
    this._startMcp(id2, McpServerLaunch.fromSerialized(opts.launch), opts.defaultCwd && URI.revive(opts.defaultCwd), opts.errorOnUserInteraction);
  }
  _startMcp(id2, launch, _defaultCwd, errorOnUserInteraction) {
    if (launch.type === 2 /* HTTP */) {
      this._sseEventSources.set(id2, new McpHTTPHandle(id2, launch, this._proxy, this._logService, errorOnUserInteraction, this._readOpenCodeOAuthToken));
      return;
    }
    throw new Error("not implemented");
  }
  async $substituteVariables(_workspaceFolder, value) {
    const folderURI = URI.revive(_workspaceFolder);
    const folder = folderURI && await this._workspaceService.resolveWorkspaceFolder(folderURI);
    const variableResolver = await this._variableResolver.getResolver();
    return variableResolver.resolveAsync(folder && {
      uri: folder.uri,
      name: folder.name,
      index: folder.index
    }, value);
  }
  $stopMcp(id2) {
    this._sseEventSources.get(id2)?.close().then(() => this._didClose(id2));
  }
  _didClose(id2) {
    this._sseEventSources.deleteAndDispose(id2);
  }
  $sendMessage(id2, message) {
    this._sseEventSources.get(id2)?.send(message);
  }
  async $waitForInitialCollectionProviders() {
    await Promise.all(this._initialProviderPromises);
  }
  async $resolveMcpLaunch(collectionId, label) {
    const rec = this._unresolvedMcpServers.get(collectionId);
    if (!rec) {
      return;
    }
    const server = rec.servers.find((s) => s.label === label);
    if (!server) {
      return;
    }
    if (!rec.provider.resolveMcpServerDefinition) {
      return McpServerDefinition2.from(server);
    }
    const resolved = await rec.provider.resolveMcpServerDefinition(server, CancellationToken.None);
    return resolved ? McpServerDefinition2.from(resolved) : void 0;
  }
  /** {@link vscode.lm.registerMcpServerDefinitionProvider} */
  registerMcpConfigurationProvider(extension, id2, provider) {
    const store = new DisposableStore();
    const metadata = extension.contributes?.mcpServerDefinitionProviders?.find((m) => m.id === id2);
    if (!metadata) {
      throw new Error(`MCP configuration providers must be registered in the contributes.mcpServerDefinitionProviders array within your package.json, but "${id2}" was not`);
    }
    const mcp = {
      id: extensionPrefixedIdentifier(extension.identifier, id2),
      isTrustedByDefault: true,
      label: metadata?.label ?? extension.displayName ?? extension.name,
      scope: 1 /* WORKSPACE */,
      canResolveLaunch: typeof provider.resolveMcpServerDefinition === "function",
      extensionId: extension.identifier.value,
      configTarget: this._extHostInitData.remote.isRemote ? 4 /* USER_REMOTE */ : 2 /* USER */
    };
    const update = async () => {
      const list2 = await provider.provideMcpServerDefinitions(CancellationToken.None);
      this._unresolvedMcpServers.set(mcp.id, { servers: list2 ?? [], provider });
      const servers = [];
      for (const item of list2 ?? []) {
        let id3 = ExtensionIdentifier.toKey(extension.identifier) + "/" + item.label;
        if (servers.some((s) => s.id === id3)) {
          let i = 2;
          while (servers.some((s) => s.id === id3 + i)) {
            i++;
          }
          id3 = id3 + i;
        }
        serverDataValidation.validateOrThrow(item);
        if (item.authentication) {
          checkProposedApiEnabled(extension, "mcpToolDefinitions");
        }
        let staticMetadata;
        const castAs2 = item;
        if (isProposedApiEnabled(extension, "mcpToolDefinitions") && castAs2.metadata) {
          staticMetadata = {
            capabilities: castAs2.metadata.capabilities,
            instructions: castAs2.metadata.instructions,
            serverInfo: castAs2.metadata.serverInfo,
            tools: castAs2.metadata.tools?.map((t) => ({
              availability: t.availability === 1 /* Dynamic */ ? 1 /* Dynamic */ : 0 /* Initial */,
              definition: t.definition
            }))
          };
        }
        servers.push({
          id: id3,
          label: item.label,
          cacheNonce: item.version || "$$NONE",
          staticMetadata,
          launch: McpServerDefinition2.from(item)
        });
      }
      this._proxy.$upsertMcpCollection(mcp, servers);
    };
    store.add(toDisposable(() => {
      this._unresolvedMcpServers.delete(mcp.id);
      this._proxy.$deleteMcpCollection(mcp.id);
    }));
    if (provider.onDidChangeMcpServerDefinitions) {
      store.add(provider.onDidChangeMcpServerDefinitions(update));
    }
    if (provider.onDidChangeServerDefinitions) {
      store.add(provider.onDidChangeServerDefinitions(update));
    }
    if (provider.onDidChange) {
      store.add(provider.onDidChange(update));
    }
    const promise = new Promise((resolve2) => {
      setTimeout(() => update().finally(() => {
        this._initialProviderPromises.delete(promise);
        resolve2();
      }), 0);
    });
    this._initialProviderPromises.add(promise);
    return store;
  }
  /** {@link vscode.lm.startMcpGateway} */
  async startMcpGateway(chatSessionResource) {
    const result = await this._proxy.$startMcpGateway(chatSessionResource?.toJSON());
    if (!result) {
      return void 0;
    }
    const gatewayId = result.gatewayId;
    const servers = result.servers.map((s) => ({
      label: s.label,
      address: URI.revive(s.address)
    }));
    const onDidChangeServers = new Emitter();
    this._activeGateways.set(gatewayId, { servers, onDidChangeServers });
    return {
      get servers() {
        return servers;
      },
      onDidChangeServers: onDidChangeServers.event,
      dispose: () => {
        this._activeGateways.delete(gatewayId);
        onDidChangeServers.dispose();
        this._proxy.$disposeMcpGateway(gatewayId);
      }
    };
  }
  /** Called by main thread to notify that a gateway's server set has changed. */
  $onDidChangeGatewayServers(gatewayId, newServers) {
    const gateway = this._activeGateways.get(gatewayId);
    if (!gateway) {
      return;
    }
    const servers = newServers.map((s) => ({
      label: s.label,
      address: URI.revive(s.address)
    }));
    gateway.servers.length = 0;
    gateway.servers.push(...servers);
    gateway.onDidChangeServers.fire(servers);
  }
};

ExtHostMcpService = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IExtHostInitDataService),
  __decorateParam(3, IExtHostWorkspace),
  __decorateParam(4, IExtHostVariableResolverProvider),
  __decorateParam(5, IExtHostCommands)
], ExtHostMcpService);

var MAX_FOLLOW_REDIRECTS = 5;

var REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308];

var ALLOWED_REDIRECT_PROTOCOLS = /* @__PURE__ */ new Set(["http:", "https:"]);

function safeMcpHttpOrigin(value) {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "MCP HTTP endpoint";
  }
}

function safeMcpHttpError(error) {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError") ? error.name : "connection error";
}

var CROSS_ORIGIN_STRIPPED_HEADERS = /* @__PURE__ */ new Set(["authorization", "cookie", "proxy-authorization", "mcp-session-id"]);

function setHostHeader(headers, name2, value) {
  for (const configuredName of Object.keys(headers)) {
    if (configuredName.toLowerCase() === name2.toLowerCase()) {
      delete headers[configuredName];
    }
  }
  headers[name2] = value;
}

var McpHTTPHandle = class extends Disposable {
  constructor(_id, _launch, _proxy, _logService, _errorOnUserInteraction, _openCodeOAuthToken) {
    super();
    this._id = _id;
    this._launch = _launch;
    this._proxy = _proxy;
    this._logService = _logService;
    this._errorOnUserInteraction = _errorOnUserInteraction;
    this._openCodeOAuthToken = _openCodeOAuthToken;
    this._requestSequencer = new Sequencer();
    this._mode = { value: 0 /* Unknown */ };
    this._cts = new CancellationTokenSource();
    this._abortCtrl = new AbortController();
    this._didSendClose = false;
    this._register(toDisposable(() => {
      this._abortCtrl.abort();
      this._cts.dispose(true);
    }));
    this._proxy.$onDidChangeState(this._id, { state: McpConnectionState.Kind.Running });
  }
  get _openCodeManaged() {
    return openCodeMcpLaunchOptions(this._launch).managed;
  }
  get _openCodeHttpTransport() {
    return openCodeMcpLaunchOptions(this._launch).httpTransport;
  }
  _configuredHeaders() {
    return Object.fromEntries([...this._launch.headers].filter(([name2]) => ![OPENCODE_MANAGED_HTTP_HEADER, OPENCODE_MCP_TIMEOUT_HEADER, OPENCODE_MCP_OAUTH_HEADER].includes(name2.toLowerCase())));
  }
  async send(message) {
    try {
      if (this._mode.value === 0 /* Unknown */) {
        await this._requestSequencer.queue(() => this._send(message));
      } else {
        await this._send(message);
      }
    } catch (err) {
      const msg = `Error sending message to ${safeMcpHttpOrigin(this._launch.uri.toString(true))}: ${safeMcpHttpError(err)}`;
      this._proxy.$onDidChangeState(this._id, { state: McpConnectionState.Kind.Error, message: msg });
    }
  }
  async close() {
    if (this._mode.value === 1 /* Http */ && this._mode.sessionId && !this._didSendClose) {
      this._didSendClose = true;
      try {
        await this._closeSession(this._mode.sessionId);
      } catch {
      }
    }
    this._proxy.$onDidChangeState(this._id, { state: McpConnectionState.Kind.Stopped });
  }
  async _closeSession(sessionId) {
    const headers = {
      ...this._configuredHeaders(),
      "Mcp-Session-Id": sessionId
    };
    try {
      await this._addAuthHeader(headers, { errorOnUserInteraction: true });
    } catch (e) {
      this._log(2 /* Debug */, `Skipping session close: authentication no longer available`);
      return;
    }
    await this._fetch(
      this._launch.uri.toString(true),
      {
        method: "DELETE",
        headers
      }
    );
  }
  _send(message) {
    if (this._mode.value === 0 /* Unknown */ && this._openCodeManaged && this._openCodeHttpTransport === "sse") {
      return this._sseFallbackWithMessage(message);
    }
    if (this._mode.value === 2 /* SSE */) {
      return this._sendLegacySSE(this._mode.endpoint, message);
    } else {
      return this._sendStreamableHttp(message, this._mode.value === 1 /* Http */ ? this._mode.sessionId : void 0);
    }
  }
  /**
   * Sends a streamable-HTTP request.
   * 1. Posts to the endpoint
   * 2. Updates internal state as needed. Falls back to SSE if appropriate.
   * 3. If the response body is empty, JSON, or a JSON stream, handle it appropriately.
   */
  async _sendStreamableHttp(message, sessionId) {
    const asBytes = new TextEncoder().encode(message);
    const headers = {
      ...this._configuredHeaders(),
      "Content-Type": "application/json",
      Accept: "text/event-stream, application/json"
    };
    if (sessionId) {
      headers["Mcp-Session-Id"] = sessionId;
    }
    await this._addAuthHeader(headers);
    const res = await this._fetchWithAuthRetry(
      this._launch.uri.toString(true),
      {
        method: "POST",
        headers,
        body: asBytes
      },
      headers
    );
    const wasUnknown = this._mode.value === 0 /* Unknown */;
    const nextSessionId = res.headers.get("Mcp-Session-Id");
    if (nextSessionId) {
      this._mode = { value: 1 /* Http */, sessionId: nextSessionId };
    }
    if (this._mode.value === 0 /* Unknown */ && // We care about 4xx errors...
    res.status >= 400 && res.status < 500 && !isAuthStatusCode(res.status) && (!this._openCodeManaged || this._openCodeHttpTransport === "auto" && [400, 404, 405, 406, 415].includes(res.status))) {
      this._log(3 /* Info */, `${res.status} status sending message to ${safeMcpHttpOrigin(this._launch.uri.toString(true))}, will attempt to fall back to legacy SSE`);
      await this._sseFallbackWithMessage(message);
      return;
    }
    if (res.status >= 300) {
      const retryWithSessionId = this._mode.value === 1 /* Http */ && !!this._mode.sessionId && (res.status === 400 || res.status === 404);
      this._proxy.$onDidChangeState(this._id, {
        state: McpConnectionState.Kind.Error,
        message: `${res.status} status sending message to ${safeMcpHttpOrigin(this._launch.uri.toString(true))}: response body omitted` + (retryWithSessionId ? `; will retry with new session ID` : ""),
        shouldRetry: retryWithSessionId
      });
      return;
    }
    if (this._mode.value === 0 /* Unknown */) {
      this._mode = { value: 1 /* Http */, sessionId: void 0 };
    }
    if (wasUnknown) {
      this._attachStreamableBackchannel();
    }
    await this._handleSuccessfulStreamableHttp(res, message);
  }
  async _sseFallbackWithMessage(message) {
    if (this._openCodeManaged && this._openCodeHttpTransport === "streamable-http") {
      this._proxy.$onDidChangeState(this._id, { state: McpConnectionState.Kind.Error, message: "This MCP service is configured for Streamable HTTP only" });
      return;
    }
    const endpoint = await this._attachSSE();
    if (endpoint) {
      this._mode = { value: 2 /* SSE */, endpoint };
      await this._sendLegacySSE(endpoint, message);
    }
  }
  async _handleSuccessfulStreamableHttp(res, message) {
    if (res.status === 202) {
      return;
    }
    const contentType = res.headers.get("Content-Type")?.toLowerCase() || "";
    if (contentType.startsWith("text/event-stream")) {
      const parser2 = new SSEParser((event) => {
        if (event.type === "message") {
          this._proxy.$onDidReceiveMessage(this._id, event.data);
        } else if (event.type === "endpoint") {
          if (this._openCodeManaged) {
            this._proxy.$onDidChangeState(this._id, { state: McpConnectionState.Kind.Error, message: "OpenCode-managed MCP refuses legacy SSE after a successful HTTP response" });
            throw new CancellationError();
          }
          this._log(4 /* Warning */, `Received SSE endpoint from a POST to ${safeMcpHttpOrigin(this._launch.uri.toString(true))}, will fall back to legacy SSE`);
          void this._sseFallbackWithMessage(message).catch((err) => {
            this._proxy.$onDidChangeState(this._id, { state: McpConnectionState.Kind.Error, message: safeMcpHttpError(err) });
          });
          throw new CancellationError();
        }
      });
      try {
        await this._doSSE(parser2, res);
      } catch (err) {
        this._log(4 /* Warning */, `Error reading SSE stream: ${safeMcpHttpError(err)}`);
      }
    } else if (contentType.startsWith("application/json")) {
      this._proxy.$onDidReceiveMessage(this._id, await res.text());
    } else {
      const responseBody = await res.text();
      if (isJSON(responseBody)) {
        this._proxy.$onDidReceiveMessage(this._id, responseBody);
      } else {
        this._log(4 /* Warning */, `Unexpected ${res.status} response for MCP HTTP request`);
      }
    }
  }
  /**
   * Attaches the SSE backchannel that streamable HTTP servers can use
   * for async notifications. This is a "MAY" support, so if the server gives
   * us a 4xx code, we'll stop trying to connect..
   */
  async _attachStreamableBackchannel() {
    let lastEventId;
    let canReconnectAt;
    for (let retry = 0; !this._store.isDisposed; retry++) {
      if (canReconnectAt !== void 0) {
        await timeout(Math.max(0, canReconnectAt - Date.now()), this._cts.token);
        canReconnectAt = void 0;
      } else {
        await timeout(Math.min(retry * 1e3, 3e4), this._cts.token);
      }
      let res;
      try {
        const headers = {
          ...this._configuredHeaders(),
          "Accept": "text/event-stream"
        };
        await this._addAuthHeader(headers);
        if (this._mode.value === 1 /* Http */ && this._mode.sessionId !== void 0) {
          headers["Mcp-Session-Id"] = this._mode.sessionId;
        }
        if (lastEventId) {
          headers["Last-Event-ID"] = lastEventId;
        }
        res = await this._fetchWithAuthRetry(
          this._launch.uri.toString(true),
          {
            method: "GET",
            headers
          },
          headers
        );
      } catch (e) {
        this._log(3 /* Info */, `Error connecting to ${safeMcpHttpOrigin(this._launch.uri.toString(true))} for async notifications, will retry`);
        continue;
      }
      if (res.status >= 400) {
        this._log(2 /* Debug */, `${res.status} status connecting to ${safeMcpHttpOrigin(this._launch.uri.toString(true))} for async notifications; they will be disabled: response body omitted`);
        return;
      }
      if (res.headers.get("content-type")?.toLowerCase().includes("text/event-stream")) {
        retry = 0;
      }
      const parser2 = new SSEParser((event) => {
        if (event.retry) {
          canReconnectAt = Date.now() + event.retry;
        }
        if (event.type === "message" && event.data) {
          this._proxy.$onDidReceiveMessage(this._id, event.data);
        }
        if (event.id) {
          lastEventId = event.id;
        }
      });
      try {
        await this._doSSE(parser2, res);
      } catch (e) {
        this._log(3 /* Info */, `Error reading from async stream, we will reconnect: ${safeMcpHttpError(e)}`);
      }
    }
  }
  /**
   * Starts a legacy SSE attachment, where the SSE response is the session lifetime.
   * Unlike `_attachStreamableBackchannel`, this fails the server if it disconnects.
   */
  async _attachSSE() {
    const postEndpoint = new DeferredPromise();
    const headers = {
      ...this._configuredHeaders(),
      "Accept": "text/event-stream"
    };
    await this._addAuthHeader(headers);
    let res;
    try {
      res = await this._fetchWithAuthRetry(
        this._launch.uri.toString(true),
        {
          method: "GET",
          headers
        },
        headers
      );
      if (res.status >= 300) {
        this._proxy.$onDidChangeState(this._id, { state: McpConnectionState.Kind.Error, message: `${res.status} status connecting to ${safeMcpHttpOrigin(this._launch.uri.toString(true))} as SSE: response body omitted` });
        return;
      }
    } catch (e) {
      this._proxy.$onDidChangeState(this._id, { state: McpConnectionState.Kind.Error, message: `Error connecting to ${safeMcpHttpOrigin(this._launch.uri.toString(true))} as SSE: ${safeMcpHttpError(e)}` });
      return;
    }
    const parser2 = new SSEParser((event) => {
      if (event.type === "message") {
        this._proxy.$onDidReceiveMessage(this._id, event.data);
      } else if (event.type === "endpoint") {
        postEndpoint.complete(new URL(event.data, this._launch.uri.toString(true)).toString());
      }
    });
    this._register(toDisposable(() => postEndpoint.cancel()));
    this._doSSE(parser2, res).catch((err) => {
      this._proxy.$onDidChangeState(this._id, { state: McpConnectionState.Kind.Error, message: `Error reading SSE stream: ${safeMcpHttpError(err)}` });
    });
    return postEndpoint.p;
  }
  /**
   * Sends a legacy SSE message to the server. The response is always empty and
   * is otherwise received in {@link _attachSSE}'s loop.
   */
  async _sendLegacySSE(url, message) {
    const asBytes = new TextEncoder().encode(message);
    const headers = {
      ...this._configuredHeaders(),
      "Content-Type": "application/json"
    };
    await this._addAuthHeader(headers);
    const res = await this._fetch(url, {
      method: "POST",
      headers,
      body: asBytes
    });
    if (res.status >= 300) {
      this._log(4 /* Warning */, `${res.status} status sending message to MCP HTTP endpoint: response body omitted`);
    }
  }
  /** Generic handle to pipe a response into an SSE parser. */
  async _doSSE(parser2, res) {
    if (!res.body) {
      return;
    }
    const reader = res.body.getReader();
    let chunk;
    do {
      try {
        chunk = await raceCancellationError(reader.read(), this._cts.token);
      } catch (err) {
        await reader.cancel().catch(() => void 0);
        if (this._store.isDisposed) {
          return;
        } else {
          throw err;
        }
      }
      if (chunk.value) {
        parser2.feed(chunk.value);
      }
    } while (!chunk.done);
  }
  async _addAuthHeader(headers, options2) {
    const errorOnUserInteraction = options2?.errorOnUserInteraction ?? this._errorOnUserInteraction;
    if (this._authMetadata) {
      try {
        const authDetails = {
          authorizationServer: this._authMetadata.authorizationServer.toJSON(),
          authorizationServerMetadata: this._authMetadata.serverMetadata,
          resourceMetadata: this._authMetadata.resourceMetadata,
          scopes: this._authMetadata.scopes,
          clientId: this._launch.oauth?.clientId,
          enterpriseManaged: this._launch.oauth?.enterpriseManaged
        };
        const token = await this._proxy.$getTokenFromServerMetadata(
          this._id,
          authDetails,
          {
            errorOnUserInteraction,
            forceNewRegistration: options2?.forceNewRegistration
          }
        );
        if (token) {
          setHostHeader(headers, "Authorization", `Bearer ${token}`);
        }
      } catch (e) {
        if (UserInteractionRequiredError.is(e)) {
          this._proxy.$onDidChangeState(this._id, { state: McpConnectionState.Kind.Stopped, reason: "needs-user-interaction" });
          throw new CancellationError();
        }
        this._log(4 /* Warning */, `Error getting token from server metadata`);
      }
    }
    if (this._launch.authentication) {
      try {
        this._log(2 /* Debug */, `Using provided authentication config: providerId=${this._launch.authentication.providerId}, scopes=${this._launch.authentication.scopes.join(", ")}`);
        const token = await this._proxy.$getTokenForProviderId(
          this._id,
          this._launch.authentication.providerId,
          this._launch.authentication.scopes,
          {
            errorOnUserInteraction,
            forceNewRegistration: options2?.forceNewRegistration,
            clientId: this._launch.oauth?.clientId
          }
        );
        if (token) {
          setHostHeader(headers, "Authorization", `Bearer ${token}`);
          this._log(3 /* Info */, "Successfully obtained token from provided authentication config");
        }
      } catch (e) {
        if (UserInteractionRequiredError.is(e)) {
          this._proxy.$onDidChangeState(this._id, { state: McpConnectionState.Kind.Stopped, reason: "needs-user-interaction" });
          throw new CancellationError();
        }
        this._log(4 /* Warning */, `Error getting token from provided authentication config`);
      }
    }
    return headers;
  }
  _log(level, message) {
    if (!this._store.isDisposed) {
      this._proxy.$onDidPublishLog(this._id, level, message);
    }
  }
  /**
   * Helper method to perform fetch with authentication retry logic.
   * If the initial request returns an auth error and we don't have auth metadata,
   * it will populate the auth metadata and retry once.
   * If we already have auth metadata, check if the scopes changed and update them.
   */
  async _fetchWithAuthRetry(mcpUrl, init, headers) {
    const doFetch = () => this._fetch(mcpUrl, init);
    let res = await doFetch();
    if (isAuthStatusCode(res.status) && !this._openCodeManaged) {
      if (!this._authMetadata) {
        this._authMetadata = await createAuthMetadata(mcpUrl, res.headers, {
          sameOriginHeaders: {
            ...this._configuredHeaders(),
            "MCP-Protocol-Version": MCP.LATEST_PROTOCOL_VERSION
          },
          fetch: (url, init2) => this._fetch(url, init2),
          log: (level, message) => this._log(level, message)
        });
        this._proxy.$logMcpAuthSetup(this._authMetadata.telemetry);
        await this._addAuthHeader(headers);
        if (headers["Authorization"]) {
          init.headers = headers;
          res = await doFetch();
        }
      } else {
        if (this._authMetadata.update(res.headers)) {
          await this._addAuthHeader(headers);
          if (headers["Authorization"]) {
            init.headers = headers;
            res = await doFetch();
          }
        }
      }
    }
    if (headers["Authorization"] && isAuthStatusCode(res.status) && !this._openCodeManaged) {
      this._log(3 /* Info */, `Received ${res.status} status with Authorization header, retrying with new auth registration`);
      await this._addAuthHeader(headers, { forceNewRegistration: true });
      res = await doFetch();
    }
    return res;
  }
  async _fetch(url, init) {
    if (this._openCodeManaged) {
      const target = new URL(url);
      if (target.origin !== new URL(this._launch.uri.toString(true)).origin || target.username || target.password || target.hash) {
        throw new Error("OpenCode-managed MCP endpoint must stay on the configured origin");
      }
    }
    setHostHeader(init.headers, "user-agent", `${product_default.nameLong}/${product_default.version}`);
    if (canLog(this._logService.getLevel(), 1 /* Trace */)) {
      this._log(1 /* Trace */, `Fetching ${safeMcpHttpOrigin(url)} with method ${init.method}`);
    }
    const oauthHandle = this._openCodeManaged ? [...this._launch.headers].find(([name2]) => name2.toLowerCase() === OPENCODE_MCP_OAUTH_HEADER)?.[1] : void 0;
    let oauthStamp;
    if (oauthHandle) {
      if (!this._openCodeOAuthToken) {
        throw new Error("OAuth credential resolver is unavailable.");
      }
      const authorization = await this._openCodeOAuthToken(oauthHandle, this._launch.uri.toString(true));
      setHostHeader(init.headers, "Authorization", `Bearer ${authorization.token}`);
      oauthStamp = authorization.stamp;
    }
    let currentUrl = url;
    let response;
    for (let redirectCount = 0; redirectCount < MAX_FOLLOW_REDIRECTS; redirectCount++) {
      response = await this._fetchInternal(currentUrl, {
        ...init,
        signal: this._abortCtrl.signal,
        redirect: "manual"
      });
      if (response.status === 401 && oauthHandle && oauthStamp && this._openCodeOAuthToken) {
        await response.body?.cancel().catch(() => void 0);
        const authorization = await this._openCodeOAuthToken(oauthHandle, this._launch.uri.toString(true), oauthStamp);
        oauthStamp = void 0;
        setHostHeader(init.headers, "Authorization", `Bearer ${authorization.token}`);
        response = await this._fetchInternal(currentUrl, { ...init, signal: this._abortCtrl.signal, redirect: "manual" });
      }
      if (!REDIRECT_STATUS_CODES.includes(response.status)) {
        break;
      }
      if (this._openCodeManaged) {
        throw new Error("OpenCode-managed MCP refuses HTTP redirects");
      }
      const location2 = response.headers.get("location");
      if (!location2) {
        break;
      }
      const currentUrlParsed = new URL(currentUrl);
      const nextUrlParsed = new URL(location2, currentUrl);
      if (!ALLOWED_REDIRECT_PROTOCOLS.has(nextUrlParsed.protocol)) {
        throw new Error(`MCP server redirected to a non-http(s) target (${nextUrlParsed.protocol}), which is not allowed`);
      }
      if (currentUrlParsed.origin !== nextUrlParsed.origin) {
        for (const name2 of Object.keys(init.headers)) {
          if (CROSS_ORIGIN_STRIPPED_HEADERS.has(name2.toLowerCase())) {
            delete init.headers[name2];
          }
        }
      }
      const nextUrl = nextUrlParsed.toString();
      this._log(1 /* Trace */, `Redirect (${response.status}) from ${safeMcpHttpOrigin(currentUrl)} to ${safeMcpHttpOrigin(nextUrl)}`);
      currentUrl = nextUrl;
      if (response.status === 303 || (response.status === 301 || response.status === 302) && init.method === "POST") {
        init.method = "GET";
        delete init.body;
      }
    }
    if (canLog(this._logService.getLevel(), 1 /* Trace */)) {
      this._log(1 /* Trace */, `Fetched ${safeMcpHttpOrigin(currentUrl)}: ${response.status}`);
    }
    return response;
  }
  _fetchInternal(url, init) {
    return fetch(url, init);
  }
};

function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function isAuthStatusCode(status) {
  return status === 401 || status === 403;
}

var AuthMetadata = class {
  constructor(authorizationServer, serverMetadata, resourceMetadata, scopes, telemetry, _log) {
    this.authorizationServer = authorizationServer;
    this.serverMetadata = serverMetadata;
    this.resourceMetadata = resourceMetadata;
    this.telemetry = telemetry;
    this._log = _log;
    this._scopes = scopes;
  }
  get scopes() {
    return this._scopes;
  }
  update(responseHeaders) {
    const scopesChallenge = this._parseScopesFromResponse(responseHeaders);
    if (!scopesMatch(scopesChallenge, this._scopes)) {
      this._log(3 /* Info */, `Scopes changed from ${JSON.stringify(this._scopes)} to ${JSON.stringify(scopesChallenge)}, updating`);
      this._scopes = scopesChallenge;
      return true;
    }
    return false;
  }
  _parseScopesFromResponse(responseHeaders) {
    const authHeader = responseHeaders.get("WWW-Authenticate");
    if (!authHeader) {
      return void 0;
    }
    const challenges = parseWWWAuthenticateHeader(authHeader);
    for (const challenge of challenges) {
      if (challenge.scheme === "Bearer" && challenge.params["scope"]) {
        const scopes = challenge.params["scope"].split(AUTH_SCOPE_SEPARATOR).filter((s) => s.trim().length);
        if (scopes.length) {
          this._log(3 /* Info */, `Found scope challenge in WWW-Authenticate header: ${challenge.params["scope"]}`);
          return scopes;
        }
      }
    }
    return void 0;
  }
};

async function createAuthMetadata(resourceUrl, initialResponseHeaders, options2) {
  const { sameOriginHeaders, fetch: fetch2, log: log2 } = options2;
  let resourceMetadataSource = "none" /* None */;
  let serverMetadataSource;
  const { resourceMetadataChallenge, scopesChallenge: scopesChallengeFromHeader } = parseWWWAuthenticateHeaderForChallenges(initialResponseHeaders.get("WWW-Authenticate") ?? void 0, log2);
  let serverMetadataUrl;
  let resource;
  let scopesChallenge = scopesChallengeFromHeader;
  try {
    const { metadata, discoveryUrl, errors } = await fetchResourceMetadata(resourceUrl, resourceMetadataChallenge, {
      sameOriginHeaders,
      fetch: (url, init) => fetch2(url, init)
    });
    for (const err of errors) {
      log2(4 /* Warning */, `Error fetching resource metadata: ${err}`);
    }
    log2(3 /* Info */, `Discovered resource metadata at ${discoveryUrl}`);
    resourceMetadataSource = resourceMetadataChallenge ? "header" /* Header */ : "wellKnown" /* WellKnown */;
    serverMetadataUrl = metadata.authorization_servers?.[0];
    if (!serverMetadataUrl) {
      log2(4 /* Warning */, `No authorization_servers found in resource metadata ${discoveryUrl} - Is this resource metadata configured correctly?`);
    } else {
      log2(3 /* Info */, `Using auth server metadata url: ${serverMetadataUrl}`);
      serverMetadataSource = "resourceMetadata" /* ResourceMetadata */;
    }
    scopesChallenge ??= metadata.scopes_supported;
    resource = metadata;
  } catch (e) {
    log2(4 /* Warning */, `Could not fetch resource metadata: ${String(e)}`);
  }
  const baseUrl = new URL(resourceUrl).origin;
  let additionalHeaders = {};
  if (!serverMetadataUrl) {
    serverMetadataUrl = baseUrl;
    if (sameOriginHeaders) {
      additionalHeaders = sameOriginHeaders;
    }
  }
  try {
    log2(2 /* Debug */, `Fetching auth server metadata for: ${serverMetadataUrl} ...`);
    const { metadata, discoveryUrl, errors } = await fetchAuthorizationServerMetadata(serverMetadataUrl, {
      additionalHeaders,
      fetch: (url, init) => fetch2(url, init)
    });
    for (const err of errors) {
      log2(4 /* Warning */, `Error fetching authorization server metadata: ${err}`);
    }
    log2(3 /* Info */, `Discovered authorization server metadata at ${discoveryUrl}`);
    serverMetadataSource ??= "wellKnown" /* WellKnown */;
    return new AuthMetadata(
      URI.parse(serverMetadataUrl),
      metadata,
      resource,
      scopesChallenge,
      { resourceMetadataSource, serverMetadataSource },
      log2
    );
  } catch (e) {
    log2(4 /* Warning */, `Error populating auth server metadata for ${serverMetadataUrl}: ${String(e)}`);
  }
  const defaultMetadata = getDefaultMetadataForUrl(new URL(baseUrl));
  log2(3 /* Info */, "Using default auth metadata");
  return new AuthMetadata(
    URI.parse(baseUrl),
    defaultMetadata,
    resource,
    scopesChallenge,
    { resourceMetadataSource, serverMetadataSource: "default" /* Default */ },
    log2
  );
}

function parseWWWAuthenticateHeaderForChallenges(wwwAuthenticateValue, log2) {
  if (!wwwAuthenticateValue) {
    return {};
  }
  let resourceMetadataChallenge;
  let scopesChallenge;
  const challenges = parseWWWAuthenticateHeader(wwwAuthenticateValue);
  for (const challenge of challenges) {
    if (challenge.scheme === "Bearer") {
      if (!resourceMetadataChallenge && challenge.params["resource_metadata"]) {
        resourceMetadataChallenge = challenge.params["resource_metadata"];
        log2(2 /* Debug */, `Found resource_metadata challenge in WWW-Authenticate header: ${resourceMetadataChallenge}`);
      }
      if (!scopesChallenge && challenge.params["scope"]) {
        const scopes = challenge.params["scope"].split(AUTH_SCOPE_SEPARATOR).filter((s) => s.trim().length);
        if (scopes.length) {
          log2(2 /* Debug */, `Found scope challenge in WWW-Authenticate header: ${challenge.params["scope"]}`);
          scopesChallenge = scopes;
        }
      }
      if (resourceMetadataChallenge && scopesChallenge) {
        break;
      }
    }
  }
  return { resourceMetadataChallenge, scopesChallenge };
}
export { safeMcpHttpOrigin, safeMcpHttpError, setHostHeader, isJSON, isAuthStatusCode, createAuthMetadata, parseWWWAuthenticateHeaderForChallenges, IExtHostMpcService, serverDataValidation, ExtHostMcpService, MAX_FOLLOW_REDIRECTS, REDIRECT_STATUS_CODES, ALLOWED_REDIRECT_PROTOCOLS, CROSS_ORIGIN_STRIPPED_HEADERS, McpHTTPHandle, AuthMetadata };
