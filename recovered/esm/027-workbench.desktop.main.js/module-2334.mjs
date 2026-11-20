// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpServer.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { LRUCache } from "./module-0008.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { disposableObservableValue, observableValue } from "./module-0048.mjs";
import { derived, derivedDisposable } from "./module-0054.mjs";
import { McpTaskManager } from "./module-2332.mjs";
import { AsyncIterableProducer, Sequencer, raceCancellationError } from "./module-0036.mjs";
import { IMcpElicitationService, IMcpSamplingService, McpConnectionFailedError, McpConnectionState, McpResourceURI, MpcResponseError, UserInteractionRequiredError, extensionMcpCollectionPrefix, mcpPromptReplaceSpecialChars } from "./module-1206.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun, autorunSelfDisposable } from "./module-0052.mjs";
import { McpDevModeServerAttache } from "./module-2329.mjs";
import { basename2 } from "./module-0034.mjs";
import { createURITransformer } from "./module-2328.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { normalizeDriveLetter } from "./module-0711.mjs";
import { McpIcons, parseAndValidateMcpIcon } from "./module-2330.mjs";
import { ObservablePromise } from "./module-0055.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { ConfigurationResolverExpression } from "./module-1406.mjs";
import { mcpActivationEvent } from "./module-1421.mjs";
import { Iterable } from "./module-0011.mjs";
import { localize } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { transaction } from "./module-0045.mjs";
import { findNodeAtOffset, getNodePath, parseTree } from "./module-0883.mjs";
import { IMcpRegistry } from "./module-1447.mjs";
import { IAllowedMcpServersService } from "./module-1196.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ILoggerService } from "./module-0095.mjs";
import { IOutputService } from "./module-1245.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IMcpSandboxService } from "./module-2331.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { generateUuid } from "./module-0190.mjs";
import { chatSessionResourceToId } from "./module-0961.mjs";
import { MCP } from "./module-1205.mjs";
import { IEditorService } from "./module-0934.mjs";
import { UriTemplate } from "./module-2333.mjs";
import { mapValues } from "./module-0098.mjs";


// src/vs/workbench/contrib/mcp/common/mcpServer.ts
var emptyToolEntry = {
  serverName: void 0,
  serverIcons: [],
  serverInstructions: void 0,
  trustedAtNonce: void 0,
  nonce: void 0,
  tools: [],
  prompts: void 0,
  capabilities: void 0
};

var toolInvalidCharRe = /[^a-z0-9_-]/gi;

var McpServerMetadataCache = class extends Disposable {
  constructor(scope, storageService) {
    super();
    this.didChange = false;
    this.cache = new LRUCache(128);
    this.extensionServers = /* @__PURE__ */ new Map();
    const storageKey = "mcpToolCache";
    this._register(storageService.onWillSaveState(() => {
      if (this.didChange) {
        storageService.store(storageKey, {
          extensionServers: [...this.extensionServers],
          serverTools: this.cache.toJSON()
        }, scope, 1 /* MACHINE */);
        this.didChange = false;
      }
    }));
    try {
      const cached = storageService.getObject(storageKey, scope);
      this.extensionServers = new Map(cached?.extensionServers ?? []);
      cached?.serverTools?.forEach(([k, v2]) => this.cache.set(k, v2));
    } catch {
    }
  }
  /** Resets the cache for primitives and extension servers */
  reset() {
    this.cache.clear();
    this.extensionServers.clear();
    this.didChange = true;
  }
  /** Gets cached primitives for a server (used before a server is running) */
  get(definitionId) {
    return this.cache.get(definitionId);
  }
  /** Sets cached primitives for a server */
  store(definitionId, entry) {
    const prev = this.get(definitionId) || emptyToolEntry;
    this.cache.set(definitionId, { ...prev, ...entry });
    this.didChange = true;
  }
  /** Gets cached servers for a collection (used for extensions, before the extension activates) */
  getServers(collectionId) {
    return this.extensionServers.get(collectionId);
  }
  /** Sets cached servers for a collection */
  storeServers(collectionId, entry) {
    if (entry) {
      this.extensionServers.set(collectionId, entry);
    } else {
      this.extensionServers.delete(collectionId);
    }
    this.didChange = true;
  }
};

McpServerMetadataCache = __decorateClass([
  __decorateParam(1, IStorageService)
], McpServerMetadataCache);

var McpPrefixGenerator = class {
  constructor() {
    this._buckets = /* @__PURE__ */ new Map();
  }
  take(name) {
    const safeName = name.toLowerCase().replace(/[^a-z0-9_.-]+/g, "_").slice(0, 18 /* MaxPrefixLen */ - "mcp_" /* Prefix */.length - 1);
    let bucket = this._buckets.get(safeName);
    if (!bucket) {
      bucket = { usedIndexes: /* @__PURE__ */ new Set(), size: 0 };
      this._buckets.set(safeName, bucket);
    }
    let index2 = 1;
    while (bucket.usedIndexes.has(index2)) {
      index2++;
    }
    bucket.usedIndexes.add(index2);
    bucket.size++;
    const suffix = (index2 === 1 ? "" : String(index2)) + "_";
    const maxNameLen = 18 /* MaxPrefixLen */ - "mcp_" /* Prefix */.length - suffix.length;
    const prefix = "mcp_" /* Prefix */ + safeName.slice(0, maxNameLen) + suffix;
    return {
      object: prefix,
      dispose: () => {
        bucket.usedIndexes.delete(index2);
        bucket.size--;
        if (bucket.size === 0) {
          this._buckets.delete(safeName);
        }
      }
    };
  }
};

var CachedPrimitive = class {
  /**
   * @param _definitionId Server definition ID
   * @param _cache Metadata cache instance
   * @param _fromStaticDefinition Static definition that came with the server.
   * This should ONLY have a value if it should be used instead of whatever
   * is currently in the cache.
   * @param _fromCache Pull the value from the cache entry.
   * @param _toT Transform the value to the observable type.
   * @param defaultValue Default value if no cache entry.
   */
  constructor(_definitionId, _cache, _fromStaticDefinition, _fromCache, _toT, defaultValue) {
    this._definitionId = _definitionId;
    this._cache = _cache;
    this._fromStaticDefinition = _fromStaticDefinition;
    this._fromCache = _fromCache;
    this._toT = _toT;
    this.defaultValue = defaultValue;
    this.fromServerPromise = observableValue(this, void 0);
    this.fromServer = derived((reader) => this.fromServerPromise.read(reader)?.promiseResult.read(reader)?.data);
    this.value = derived((reader) => {
      const serverTools = this.fromServer.read(reader);
      const definitions3 = serverTools?.data ?? this._fromStaticDefinition?.read(reader) ?? this.fromCache?.data ?? this.defaultValue;
      return this._toT(definitions3, reader);
    });
  }
  get fromCache() {
    const c = this._cache.get(this._definitionId);
    return c ? { data: this._fromCache(c), nonce: c.nonce } : void 0;
  }
  hasStaticDefinition(reader) {
    return !!this._fromStaticDefinition?.read(reader);
  }
};

var McpServer = class extends Disposable {
  constructor(initialCollection, definition, explicitRoots, _requiresExtensionActivation, _primitiveCache, prefixGenerator, enablementModel, _mcpRegistry, _allowedMcpServersService, workspacesService, _extensionService, _loggerService, _outputService, _telemetryService, _commandService, _instantiationService, _dialogService, _notificationService, _openerService, _samplingService, _elicitationService, _mcpSandboxService, environmentService) {
    super();
    this.definition = definition;
    this._requiresExtensionActivation = _requiresExtensionActivation;
    this._primitiveCache = _primitiveCache;
    this._mcpRegistry = _mcpRegistry;
    this._allowedMcpServersService = _allowedMcpServersService;
    this._extensionService = _extensionService;
    this._loggerService = _loggerService;
    this._outputService = _outputService;
    this._telemetryService = _telemetryService;
    this._commandService = _commandService;
    this._instantiationService = _instantiationService;
    this._dialogService = _dialogService;
    this._notificationService = _notificationService;
    this._openerService = _openerService;
    this._samplingService = _samplingService;
    this._elicitationService = _elicitationService;
    this._mcpSandboxService = _mcpSandboxService;
    /** Shared task manager that survives reconnections */
    this._taskManager = this._register(new McpTaskManager());
    this._connectionSequencer = new Sequencer();
    this._connection = this._register(disposableObservableValue(this, void 0));
    this.connection = this._connection;
    this.connectionState = derived((reader) => this._policyBlock.read(reader) ?? this._connection.read(reader)?.state.read(reader) ?? { state: McpConnectionState.Kind.Stopped });
    /** Cached tools are suppressed while the server is blocked by policy so they cannot be listed, referenced, or executed. */
    this._gatedTools = derived((reader) => this._policyBlock.read(reader) ? [] : this._tools.value.read(reader));
    /** Cached prompts are suppressed while the server is blocked by policy. */
    this._gatedPrompts = derived((reader) => this._policyBlock.read(reader) ? [] : this._prompts.value.read(reader));
    this.cacheState = derived((reader) => {
      const currentNonce = () => this._fullDefinitions.read(reader)?.server?.cacheNonce;
      const stateWhenServingFromCache = () => {
        if (this._tools.hasStaticDefinition(reader)) {
          return 1 /* Cached */;
        }
        if (!this._tools.fromCache) {
          return 0 /* Unknown */;
        }
        return currentNonce() === this._tools.fromCache.nonce ? 1 /* Cached */ : 2 /* Outdated */;
      };
      const fromServer = this._tools.fromServerPromise.read(reader);
      const connectionState = this.connectionState.read(reader);
      const isIdle = McpConnectionState.canBeStarted(connectionState.state) || !fromServer;
      if (isIdle) {
        return stateWhenServingFromCache();
      }
      const fromServerResult = fromServer?.promiseResult.read(reader);
      if (!fromServerResult) {
        return this._tools.fromCache ? 4 /* RefreshingFromCached */ : 3 /* RefreshingFromUnknown */;
      }
      if (fromServerResult.error) {
        return stateWhenServingFromCache();
      }
      return fromServerResult.data?.nonce === currentNonce() ? 5 /* Live */ : 2 /* Outdated */;
    });
    this._lastModeDebugged = false;
    this._isQuietStart = false;
    this._isSandboxSuggestionDialogVisible = false;
    this._potentialSandboxBlocks = [];
    this._potentialSandboxBlockListener = this._register(new MutableDisposable());
    /** Count of running tool calls, used to detect if sampling is during an LM call */
    this.runningToolCalls = /* @__PURE__ */ new Set();
    this.collection = initialCollection;
    this._fullDefinitions = this._mcpRegistry.getServerDefinition(this.collection, this.definition);
    this.enablement = derived((r2) => enablementModel.readEnabled(definition.id, r2));
    this._policyEpoch = observableFromEvent(this, this._allowedMcpServersService.onDidChangeAllowedMcpServers, () => void 0);
    this._policyBlock = derived(this, (reader) => {
      this._policyEpoch.read(reader);
      const connection = this._connection.read(reader);
      if (connection) {
        return this._evaluatePolicy(this._identityFromLaunch(connection.launchDefinition));
      }
      const launch = this._fullDefinitions.read(reader).server?.launch;
      if (!launch) {
        return void 0;
      }
      const identity2 = this._identityFromLaunch(launch);
      if (McpServer._hasUnresolvedVariables(identity2)) {
        return void 0;
      }
      return this._evaluatePolicy(identity2);
    });
    this._register(autorun((reader) => {
      if (this._policyBlock.read(reader) && this._connection.read(void 0)) {
        this._connection.set(void 0, void 0);
      }
    }));
    this._loggerId = `mcpServer.${definition.id}`;
    this._logger = this._register(_loggerService.createLogger(this._loggerId, { hidden: true, name: `MCP: ${definition.label}` }));
    const that = this;
    this._register(this._instantiationService.createInstance(McpDevModeServerAttache, this, { get lastModeDebugged() {
      return that._lastModeDebugged;
    } }));
    this._register(toDisposable(() => _loggerService.deregisterLogger(this._loggerId)));
    const workspaces = explicitRoots ? observableValue(this, explicitRoots.map((uri5) => ({ uri: uri5, name: basename2(uri5) }))) : observableFromEvent(
      this,
      workspacesService.onDidChangeWorkspaceFolders,
      () => workspacesService.getWorkspace().folders
    );
    const uriTransformer = environmentService.remoteAuthority ? createURITransformer(environmentService.remoteAuthority) : void 0;
    this._register(autorun((reader) => {
      const cnx = this._connection.read(reader)?.handler.read(reader);
      if (!cnx) {
        return;
      }
      cnx.roots = workspaces.read(reader).filter((w) => w.uri.authority === (initialCollection.remoteAuthority || "")).map((w) => {
        let uri5 = URI.from(uriTransformer?.transformIncoming(w.uri) ?? w.uri);
        if (uri5.scheme === Schemas.file) {
          uri5 = URI.file(normalizeDriveLetter(uri5.fsPath, true));
        }
        return { name: w.name, uri: uri5.toString() };
      });
    }));
    this._register(autorun((reader) => {
      const cnx = this._connection.read(reader);
      const handler = cnx?.handler.read(reader);
      if (handler) {
        this._populateLiveData(handler, cnx?.definition.cacheNonce, reader.store);
      } else if (this._tools) {
        this.resetLiveData();
      }
    }));
    this._register(autorun((reader) => {
      const cnx = this._connection.read(reader);
      this._potentialSandboxBlockListener.value = cnx?.onPotentialSandboxBlock((block2) => this.recordPotentialSandboxBlock(block2));
    }));
    const staticMetadata = derived((reader) => {
      const def2 = this._fullDefinitions.read(reader).server;
      return def2 && def2.cacheNonce !== this._tools.fromCache?.nonce ? def2.staticMetadata : void 0;
    });
    this._serverMetadata = new CachedPrimitive(
      this.definition.id,
      this._primitiveCache,
      staticMetadata.map((m) => m ? this._toStoredMetadata(m?.serverInfo, m?.instructions) : void 0),
      (entry) => ({ serverName: entry.serverName, serverInstructions: entry.serverInstructions, serverIcons: entry.serverIcons }),
      (entry) => ({ serverName: entry?.serverName, serverInstructions: entry?.serverInstructions, icons: McpIcons.fromStored(entry?.serverIcons) }),
      void 0
    );
    const preferredName = derived((reader) => this._serverMetadata.value.read(reader)?.serverName || this.definition.label);
    const prefixRef = derivedDisposable((reader) => prefixGenerator.take(preferredName.read(reader)));
    const toolPrefix = prefixRef.map((ref) => ref.object);
    this._tools = new CachedPrimitive(
      this.definition.id,
      this._primitiveCache,
      staticMetadata.map((m) => {
        const tools = m?.tools?.filter((t2) => t2.availability === 0 /* Initial */).map((t2) => t2.definition);
        return tools?.length ? new ObservablePromise(this._getValidatedTools(tools)) : void 0;
      }).map((o, reader) => o?.promiseResult.read(reader)?.data),
      (entry) => entry.tools,
      (entry, reader) => entry.map((def2) => this._instantiationService.createInstance(McpTool, this, toolPrefix.read(reader), def2)).sort((a, b) => a.compare(b)),
      []
    );
    this._prompts = new CachedPrimitive(
      this.definition.id,
      this._primitiveCache,
      void 0,
      (entry) => entry.prompts || [],
      (entry) => entry.map((e) => new McpPrompt(this, e)),
      []
    );
    this._capabilities = new CachedPrimitive(
      this.definition.id,
      this._primitiveCache,
      staticMetadata.map((m) => m?.capabilities !== void 0 ? encodeCapabilities(m.capabilities) : void 0),
      (entry) => entry.capabilities,
      (entry) => entry,
      void 0
    );
    prefixRef.recomputeInitiallyAndOnChange(this._store);
  }
  /**
   * Helper function to call the function on the handler once it's online. The
   * connection started if it is not already.
   */
  static async callOn(server, fn, token = CancellationToken.None) {
    await server.start({ promptType: "all-untrusted" });
    let ranOnce = false;
    let d;
    const callPromise = new Promise((resolve3, reject) => {
      d = autorun((reader) => {
        if (ranOnce) {
          return;
        }
        const connection = server.connection.read(reader);
        if (!connection) {
          const state = server.connectionState.read(reader);
          if (state.state === McpConnectionState.Kind.Error) {
            reject(new McpConnectionFailedError(`MCP server could not be started: ${state.message}`));
          } else if (state.state === McpConnectionState.Kind.Stopped) {
            reject(new McpConnectionFailedError("MCP server has stopped"));
          }
          return;
        }
        const handler = connection.handler.read(reader);
        if (!handler) {
          const state = connection.state.read(reader);
          if (state.state === McpConnectionState.Kind.Error) {
            reject(new McpConnectionFailedError(`MCP server could not be started: ${state.message}`));
            return;
          } else if (state.state === McpConnectionState.Kind.Stopped) {
            reject(new McpConnectionFailedError("MCP server has stopped"));
            return;
          } else {
            return;
          }
        }
        resolve3(fn(handler, connection));
        ranOnce = true;
      });
    });
    return raceCancellationError(callPromise, token).finally(() => d.dispose());
  }
  get capabilities() {
    return this._capabilities.value;
  }
  get tools() {
    return this._gatedTools;
  }
  get prompts() {
    return this._gatedPrompts;
  }
  get serverMetadata() {
    return this._serverMetadata.value;
  }
  get trustedAtNonce() {
    return this._primitiveCache.get(this.definition.id)?.trustedAtNonce;
  }
  set trustedAtNonce(nonce) {
    this._primitiveCache.store(this.definition.id, { trustedAtNonce: nonce });
  }
  get logger() {
    return this._logger;
  }
  readDefinitions() {
    return this._fullDefinitions;
  }
  showOutput(preserveFocus) {
    this._loggerService.setVisibility(this._loggerId, true);
    return this._outputService.showChannel(this._loggerId, preserveFocus);
  }
  resources(token) {
    const cts = new CancellationTokenSource(token);
    return new AsyncIterableProducer(async (emitter) => {
      await McpServer.callOn(this, async (handler) => {
        for await (const resource of handler.listResourcesIterable({}, cts.token)) {
          emitter.emitOne(resource.map((r2) => new McpResource(this, r2, McpIcons.fromParsed(this._parseIcons(r2)))));
          if (cts.token.isCancellationRequested) {
            return;
          }
        }
      });
    }, () => cts.dispose(true));
  }
  resourceTemplates(token) {
    return McpServer.callOn(this, async (handler) => {
      const templates = await handler.listResourceTemplates({}, token);
      return templates.map((t2) => new McpResourceTemplate(this, t2, McpIcons.fromParsed(this._parseIcons(t2))));
    }, token);
  }
  _identityFromLaunch(launch) {
    if (launch?.type === 2 /* HTTP */) {
      return { name: this.definition.label, url: launch.uri.toString(true) };
    }
    if (launch?.type === 1 /* Stdio */) {
      return typeof launch.command === "string" ? { name: this.definition.label, command: [launch.command, ...(launch.args ?? []).filter((arg) => typeof arg === "string")] } : { name: this.definition.label };
    }
    return { name: this.definition.label };
  }
  _evaluatePolicy(identity2) {
    const allowed = this._allowedMcpServersService.isServerAllowed(identity2);
    return allowed === true ? void 0 : { state: McpConnectionState.Kind.Error, message: allowed.value };
  }
  /**
   * Whether the URL/command fields matched by the policy still contain unresolved `${...}`
   * configuration variables. When they do, matching against allow/deny URL or command rules is
   * unreliable, so the block is deferred until the launch is resolved. The server name is used
   * verbatim and is not considered here.
   */
  static _hasUnresolvedVariables(identity2) {
    const variableMarker = ConfigurationResolverExpression.VARIABLE_LHS;
    return !!identity2.url?.includes(variableMarker) || !!identity2.command?.some((arg) => arg.includes(variableMarker));
  }
  start({ interaction, autoTrustChanges, promptType, debug, errorOnUserInteraction } = {}) {
    interaction?.participants.set(this.definition.id, { s: "unknown" });
    return this._connectionSequencer.queue(async () => {
      const preStartBlock = this._policyBlock.get();
      if (preStartBlock) {
        return preStartBlock;
      }
      const activationEvent = mcpActivationEvent(this.collection.id.slice(extensionMcpCollectionPrefix.length));
      if (this._requiresExtensionActivation && !this._extensionService.activationEventIsDone(activationEvent)) {
        await this._extensionService.activateByEvent(activationEvent);
        await Promise.all(this._mcpRegistry.delegates.get().map((r2) => r2.waitForInitialProviderPromises()));
        if (this._store.isDisposed) {
          return { state: McpConnectionState.Kind.Stopped };
        }
      }
      let connection = this._connection.get();
      this._isQuietStart = !!errorOnUserInteraction;
      if (connection && McpConnectionState.canBeStarted(connection.state.get().state)) {
        connection.dispose();
        connection = void 0;
        this._connection.set(connection, void 0);
      }
      if (!connection) {
        this._lastModeDebugged = !!debug;
        const that = this;
        connection = await this._mcpRegistry.resolveConnection({
          interaction,
          autoTrustChanges,
          promptType,
          trustNonceBearer: {
            get trustedAtNonce() {
              return that.trustedAtNonce;
            },
            set trustedAtNonce(nonce) {
              that.trustedAtNonce = nonce;
            }
          },
          logger: this._logger,
          collectionRef: this.collection,
          definitionRef: this.definition,
          debug,
          errorOnUserInteraction,
          taskManager: this._taskManager
        });
        if (!connection) {
          return { state: McpConnectionState.Kind.Stopped };
        }
        if (this._store.isDisposed) {
          connection.dispose();
          return { state: McpConnectionState.Kind.Stopped };
        }
        this._connection.set(connection, void 0);
        if (connection.definition.devMode) {
          this.showOutput();
        }
      }
      const resolvedBlock = this._policyBlock.get();
      if (resolvedBlock) {
        this._connection.set(void 0, void 0);
        return resolvedBlock;
      }
      this._potentialSandboxBlocks.length = 0;
      const start = Date.now();
      let state = await connection.start({
        createMessageRequestHandler: (params, token) => this._samplingService.sample({
          isDuringToolCall: this.runningToolCalls.size > 0,
          server: this,
          params
        }, token).then((r2) => r2.sample),
        elicitationRequestHandler: async (req, token) => {
          const serverInfo = connection.handler.get()?.serverInfo;
          if (serverInfo) {
            this._telemetryService.publicLog2("mcp.elicitationRequested", {
              serverName: serverInfo.name,
              serverVersion: serverInfo.version
            });
          }
          const r2 = await this._elicitationService.elicit(this, Iterable.first(this.runningToolCalls), req, token || CancellationToken.None);
          r2.dispose();
          return r2.value;
        }
      });
      this._telemetryService.publicLog2("mcp/serverBootState", {
        state: McpConnectionState.toKindString(state.state),
        time: Date.now() - start
      });
      if (errorOnUserInteraction && state.state === McpConnectionState.Kind.Running) {
        let disposable;
        state = await new Promise((resolve3, reject) => {
          disposable = autorun((reader) => {
            const handler = connection.handler.read(reader);
            if (handler) {
              resolve3(state);
            }
            const s = connection.state.read(reader);
            if (s.state === McpConnectionState.Kind.Stopped && s.reason === "needs-user-interaction") {
              reject(new UserInteractionRequiredError("auth"));
            }
            if (!McpConnectionState.isRunning(s)) {
              resolve3(s);
            }
          });
        }).finally(() => disposable.dispose());
      }
      if (state.state === McpConnectionState.Kind.Error) {
        let disposable;
        state = await new Promise((resolve3, reject) => {
          disposable = autorun((reader) => {
            const cnx = this._connection.read(reader);
            const state2 = cnx?.state.read(reader);
            if (cnx && state2?.state === McpConnectionState.Kind.Error) {
              if (!this._isQuietStart) {
                this.showInteractiveError(cnx, state2, this._lastModeDebugged);
              } else {
                reject(new UserInteractionRequiredError("start"));
              }
            }
          });
        }).finally(() => disposable.dispose());
      }
      return state;
    }).finally(() => {
      interaction?.participants.set(this.definition.id, { s: "resolved" });
    });
  }
  showInteractiveError(cnx, error, debug) {
    if (cnx.definition.sandboxEnabled) {
      if (!this.showSandboxConfigSuggestionFromPotentialBlocks(cnx, this._potentialSandboxBlocks)) {
        this._notificationService.warn(localize(17197, null, cnx.definition.label, error.message));
      }
      return;
    }
    if (error.code === "ENOENT" && cnx.launchDefinition.type === 1 /* Stdio */) {
      let docsLink;
      switch (cnx.launchDefinition.command) {
        case "uvx":
          docsLink = `https://aka.ms/vscode-mcp-install/uvx`;
          break;
        case "npx":
          docsLink = `https://aka.ms/vscode-mcp-install/npx`;
          break;
        case "dnx":
          docsLink = `https://aka.ms/vscode-mcp-install/dnx`;
          break;
        case "dotnet":
          docsLink = `https://aka.ms/vscode-mcp-install/dotnet`;
          break;
      }
      const options3 = [{
        label: localize(17186, null),
        run: () => this.showOutput()
      }];
      if (cnx.definition.devMode?.debug?.type === "debugpy" && debug) {
        this._notificationService.prompt(Severity2.Error, localize(17190, null, cnx.launchDefinition.command, cnx.definition.label), [...options3, {
          label: localize(17200, null),
          run: () => this._openerService.open(URI.parse("https://aka.ms/vscode-mcp-install/debugpy"))
        }]);
        return;
      }
      if (docsLink) {
        options3.push({
          label: localize(17198, null, cnx.launchDefinition.command),
          run: () => this._openerService.open(URI.parse(docsLink))
        });
      }
      this._notificationService.prompt(Severity2.Error, localize(17199, null, cnx.launchDefinition.command, cnx.definition.label), options3);
    } else {
      this._notificationService.warn(localize(17197, null, cnx.definition.label, error.message));
    }
  }
  showSandboxConfigSuggestionFromPotentialBlocks(cnx, potentialBlocks) {
    if (!cnx.definition.sandboxEnabled || !potentialBlocks.length || this._isSandboxSuggestionDialogVisible) {
      return false;
    }
    if (this._isQuietStart) {
      throw new UserInteractionRequiredError("sandbox-suggestion");
    }
    const existingSandboxConfig = this._fullDefinitions.get().collection?.sandbox;
    const suggestion = this._mcpSandboxService.getSandboxConfigSuggestionMessage(cnx.definition.label, potentialBlocks, existingSandboxConfig);
    if (!suggestion) {
      this._removePotentialSandboxBlocks(potentialBlocks);
      return false;
    }
    this._confirmAndApplySandboxConfigSuggestion(cnx, potentialBlocks, suggestion);
    return true;
  }
  _confirmAndApplySandboxConfigSuggestion(cnx, potentialBlocks, suggestion) {
    const mcpResource = cnx.definition.presentation?.origin?.uri ?? this.collection.presentation?.origin;
    const configTarget = this._fullDefinitions.get().collection?.configTarget;
    this._isSandboxSuggestionDialogVisible = true;
    void this._dialogService.confirm({
      type: "warning",
      message: localize(17194, null, cnx.definition.label),
      detail: suggestion.message,
      primaryButton: localize(17196, null),
      cancelButton: localize(17195, null)
    }).then(async (result) => {
      if (!result.confirmed) {
        return;
      }
      if (!mcpResource || configTarget === void 0) {
        this._notificationService.warn(localize(17193, null, cnx.definition.label));
        return;
      }
      try {
        const updated = await this._mcpSandboxService.applySandboxConfigSuggestion(cnx.definition, mcpResource, configTarget, potentialBlocks, suggestion.sandboxConfig);
        if (updated) {
          this._removePotentialSandboxBlocks(potentialBlocks);
          this._notificationService.info(localize(17192, null, cnx.definition.label));
        }
      } catch (e) {
        this._notificationService.error(localize(17191, null, cnx.definition.label, e instanceof Error ? e.message : String(e)));
      }
    }).finally(() => {
      this._isSandboxSuggestionDialogVisible = false;
    });
  }
  recordPotentialSandboxBlock(block2) {
    this._potentialSandboxBlocks.push(block2);
    if (this._potentialSandboxBlocks.length > 200) {
      this._potentialSandboxBlocks.splice(0, this._potentialSandboxBlocks.length - 200);
    }
    const connection = this._connection.get();
    if (connection?.state.get().state === McpConnectionState.Kind.Running) {
      this.showSandboxConfigSuggestionFromPotentialBlocks(connection, this._potentialSandboxBlocks);
    }
  }
  _removePotentialSandboxBlocks(blocks) {
    if (!blocks.length || !this._potentialSandboxBlocks.length) {
      return;
    }
    const toRemove = new Set(blocks);
    this._potentialSandboxBlocks = this._potentialSandboxBlocks.filter((block2) => !toRemove.has(block2));
  }
  stop() {
    return this._connection.get()?.stop() || Promise.resolve();
  }
  /** Waits for any ongoing tools to be refreshed before resolving. */
  awaitToolRefresh() {
    return new Promise((resolve3) => {
      autorunSelfDisposable((reader) => {
        const promise = this._tools.fromServerPromise.read(reader);
        const result = promise?.promiseResult.read(reader);
        if (result) {
          resolve3();
        }
      });
    });
  }
  resetLiveData() {
    transaction((tx) => {
      this._tools.fromServerPromise.set(void 0, tx);
      this._prompts.fromServerPromise.set(void 0, tx);
    });
  }
  async _normalizeTool(originalTool) {
    const uiMeta = originalTool._meta?.ui;
    let visibility = 1 /* Model */ | 2 /* App */;
    if (uiMeta?.visibility && Array.isArray(uiMeta.visibility)) {
      visibility &= 0;
      if (uiMeta.visibility.includes("model")) {
        visibility |= 1 /* Model */;
      }
      if (uiMeta.visibility.includes("app")) {
        visibility |= 2 /* App */;
      }
    }
    const tool = {
      ...originalTool,
      serverToolName: originalTool.name,
      _icons: this._parseIcons(originalTool),
      visibility,
      uiResourceUri: uiMeta?.resourceUri
    };
    if (!tool.description) {
      this._logger.warn(`Tool ${tool.name} does not have a description. Tools must be accurately described to be called`);
      tool.description = "<empty>";
    }
    if (toolInvalidCharRe.test(tool.name)) {
      this._logger.warn(`Tool ${JSON.stringify(tool.name)} is invalid. Tools names may only contain [a-z0-9_-]`);
      tool.name = tool.name.replace(toolInvalidCharRe, "_");
    }
    if (tool.inputSchema && !tool.inputSchema.properties) {
      tool.inputSchema = { ...tool.inputSchema, properties: {} };
    }
    let diagnostics = [];
    const toolJson = JSON.stringify(tool.inputSchema);
    try {
      const schemaUri = URI.parse("https://json-schema.org/draft-07/schema");
      diagnostics = await this._commandService.executeCommand("json.validate", schemaUri, toolJson) || [];
    } catch (e) {
    }
    if (!diagnostics.length) {
      return tool;
    }
    const tree = parseTree(toolJson);
    const messages = diagnostics.map((d) => {
      const node = findNodeAtOffset(tree, d.range[0].character);
      const path = node && `/${getNodePath(node).join("/")}`;
      return d.message + (path ? ` (at ${path})` : "");
    });
    return { error: messages };
  }
  async _getValidatedTools(tools) {
    let error = "";
    const validations = await Promise.all(tools.map((t2) => this._normalizeTool(t2)));
    const validated = [];
    for (const [i2, result] of validations.entries()) {
      if ("error" in result) {
        error += localize(17189, null, tools[i2].name) + "\n";
        for (const message of result.error) {
          error += `	- ${message}
`;
        }
        error += `	- Schema: ${JSON.stringify(tools[i2].inputSchema)}

`;
      } else {
        validated.push(result);
      }
    }
    if (error) {
      this._logger.warn(`${tools.length - validated.length} tools have invalid JSON schemas and will be omitted`);
      warnInvalidTools(this._instantiationService, this.definition.label, error);
    }
    return validated;
  }
  /**
   * Parses incoming MCP icons and returns the resulting 'stored' record. Note
   * that this requires an active MCP server connection since we validate
   * against some of that connection's data. The icons may however be stored
   * and rehydrated later.
   */
  _parseIcons(icons2) {
    const cnx = this._connection.get();
    if (!cnx) {
      return [];
    }
    return parseAndValidateMcpIcon(icons2, cnx.launchDefinition, this._logger);
  }
  _setServerTools(nonce, toolsPromise, tx) {
    const toolPromiseSafe = toolsPromise.then(async (tools) => {
      this._logger.info(`Discovered ${tools.length} tools`);
      const data = await this._getValidatedTools(tools);
      this._primitiveCache.store(this.definition.id, { tools: data, nonce });
      return { data, nonce };
    });
    this._tools.fromServerPromise.set(new ObservablePromise(toolPromiseSafe), tx);
    return toolPromiseSafe;
  }
  _setServerPrompts(nonce, promptsPromise, tx) {
    const promptsPromiseSafe = promptsPromise.then((result) => {
      const data = result.map((prompt) => ({
        ...prompt,
        _icons: this._parseIcons(prompt)
      }));
      this._primitiveCache.store(this.definition.id, { prompts: data, nonce });
      return { data, nonce };
    });
    this._prompts.fromServerPromise.set(new ObservablePromise(promptsPromiseSafe), tx);
    return promptsPromiseSafe;
  }
  _toStoredMetadata(serverInfo, instructions) {
    return {
      serverName: serverInfo ? serverInfo.title || serverInfo.name : void 0,
      serverInstructions: instructions,
      serverIcons: serverInfo ? this._parseIcons(serverInfo) : void 0
    };
  }
  _setServerMetadata(nonce, { serverInfo, instructions, capabilities }, tx) {
    const serverMetadata = this._toStoredMetadata(serverInfo, instructions);
    this._serverMetadata.fromServerPromise.set(ObservablePromise.resolved({ nonce, data: serverMetadata }), tx);
    const capabilitiesEncoded = encodeCapabilities(capabilities);
    this._capabilities.fromServerPromise.set(ObservablePromise.resolved({ data: capabilitiesEncoded, nonce }), tx);
    this._primitiveCache.store(this.definition.id, { ...serverMetadata, nonce, capabilities: capabilitiesEncoded });
  }
  _populateLiveData(handler, cacheNonce, store) {
    const cts = new CancellationTokenSource();
    store.add(toDisposable(() => cts.dispose(true)));
    const updateTools = (tx) => {
      const toolPromise = handler.capabilities.tools ? handler.listTools({}, cts.token) : Promise.resolve([]);
      return this._setServerTools(cacheNonce, toolPromise, tx);
    };
    const updatePrompts = (tx) => {
      const promptsPromise = handler.capabilities.prompts ? handler.listPrompts({}, cts.token) : Promise.resolve([]);
      return this._setServerPrompts(cacheNonce, promptsPromise, tx);
    };
    store.add(handler.onDidChangeToolList(() => {
      this._logger.info("Tool list changed, refreshing tools...");
      updateTools(void 0);
    }));
    store.add(handler.onDidChangePromptList(() => {
      this._logger.info("Prompts list changed, refreshing prompts...");
      updatePrompts(void 0);
    }));
    transaction((tx) => {
      this._setServerMetadata(cacheNonce, { serverInfo: handler.serverInfo, instructions: handler.serverInstructions, capabilities: handler.capabilities }, tx);
      updatePrompts(tx);
      const toolUpdate = updateTools(tx);
      toolUpdate.then((tools) => {
        this._telemetryService.publicLog2("mcp/serverBoot", {
          supportsLogging: !!handler.capabilities.logging,
          supportsPrompts: !!handler.capabilities.prompts,
          supportsResources: !!handler.capabilities.resources,
          toolCount: tools.data.length,
          serverName: handler.serverInfo.name,
          serverVersion: handler.serverInfo.version
        });
      });
    });
  }
};

McpServer = __decorateClass([
  __decorateParam(7, IMcpRegistry),
  __decorateParam(8, IAllowedMcpServersService),
  __decorateParam(9, IWorkspaceContextService),
  __decorateParam(10, IExtensionService),
  __decorateParam(11, ILoggerService),
  __decorateParam(12, IOutputService),
  __decorateParam(13, ITelemetryService),
  __decorateParam(14, ICommandService),
  __decorateParam(15, IInstantiationService),
  __decorateParam(16, IDialogService),
  __decorateParam(17, INotificationService),
  __decorateParam(18, IOpenerService),
  __decorateParam(19, IMcpSamplingService),
  __decorateParam(20, IMcpElicitationService),
  __decorateParam(21, IMcpSandboxService),
  __decorateParam(22, IWorkbenchEnvironmentService)
], McpServer);

var McpPrompt = class {
  constructor(_server, _definition) {
    this._server = _server;
    this._definition = _definition;
    this.id = mcpPromptReplaceSpecialChars(this._server.definition.label + "." + _definition.name);
    this.name = _definition.name;
    this.title = _definition.title;
    this.description = _definition.description;
    this.arguments = _definition.arguments || [];
    this.icons = McpIcons.fromStored(this._definition._icons);
  }
  async resolve(args2, token) {
    const result = await McpServer.callOn(this._server, (h3) => h3.getPrompt({ name: this._definition.name, arguments: args2 }, token), token);
    return result.messages;
  }
  async complete(argument, prefix, alreadyResolved, token) {
    const result = await McpServer.callOn(this._server, (h3) => h3.complete({
      ref: { type: "ref/prompt", name: this._definition.name },
      argument: { name: argument, value: prefix },
      context: { arguments: alreadyResolved }
    }, token), token);
    return result.completion.values;
  }
};

function encodeCapabilities(cap) {
  let out = 0;
  if (cap.logging) {
    out |= 1 /* Logging */;
  }
  if (cap.completions) {
    out |= 2 /* Completions */;
  }
  if (cap.prompts) {
    out |= 4 /* Prompts */;
    if (cap.prompts.listChanged) {
      out |= 8 /* PromptsListChanged */;
    }
  }
  if (cap.resources) {
    out |= 16 /* Resources */;
    if (cap.resources.subscribe) {
      out |= 32 /* ResourcesSubscribe */;
    }
    if (cap.resources.listChanged) {
      out |= 64 /* ResourcesListChanged */;
    }
  }
  if (cap.tools) {
    out |= 128 /* Tools */;
    if (cap.tools.listChanged) {
      out |= 256 /* ToolsListChanged */;
    }
  }
  return out;
}

var McpTool = class {
  constructor(_server, idPrefix, _definition, _elicitationService) {
    this._server = _server;
    this._definition = _definition;
    this._elicitationService = _elicitationService;
    this.referenceName = _definition.name.replaceAll(".", "_");
    this.id = (idPrefix + _definition.name).replaceAll(".", "_").slice(0, 64 /* MaxLength */);
    this.icons = McpIcons.fromStored(this._definition._icons);
    this.visibility = _definition.visibility ?? 1 /* Model */ | 2 /* App */;
  }
  get definition() {
    return this._definition;
  }
  get uiResourceUri() {
    return this._definition.uiResourceUri;
  }
  async call(params, context2, token) {
    if (context2) {
      this._server.runningToolCalls.add(context2);
    }
    try {
      return await this._ocGuardedCall(params, void 0, context2, token);
    } finally {
      if (context2) {
        this._server.runningToolCalls.delete(context2);
      }
    }
  }
  async callWithProgress(params, progress, context2, token) {
    if (context2) {
      this._server.runningToolCalls.add(context2);
    }
    try {
      return await this._ocGuardedCall(params, progress, context2, token);
    } finally {
      if (context2) {
        this._server.runningToolCalls.delete(context2);
      }
    }
  }
  /**
   * OpenCode: 调用时的兜底——
   *  - 单次调用默认 120 秒超时，超时取消并返回明确错误；
   *  - 调用时服务器刚好断开：立即重连（callOn 会启动服务器），成功后重试 1 次；
   *  - 仍失败：返回「某某 MCP 未连接，正在重连」这类明确错误，不让对话卡住（MCP 守护会继续在后台重连）。
   */
  async _ocGuardedCall(params, progress, context2, token = CancellationToken.None) {
    const label = this._server.definition?.label ?? "MCP";
    const cts = new CancellationTokenSource(token);
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      cts.cancel();
    }, 120e3);
    const timeoutError = () => new Error(`MCP 工具调用超时（120 秒），已取消：${label} / ${this._definition.name}`);
    try {
      try {
        return await this._callWithProgress(params, progress, context2, cts.token);
      } catch (err) {
        if (timedOut) throw timeoutError();
        if (token?.isCancellationRequested) throw err;
        const lost = err instanceof McpConnectionFailedError || !McpConnectionState.isRunning(this._server.connectionState.get());
        if (!lost) throw err;
        try {
          return await this._callWithProgress(params, progress, context2, cts.token);
        } catch (err2) {
          if (timedOut) throw timeoutError();
          if (token?.isCancellationRequested) throw err2;
          throw new McpConnectionFailedError(`MCP 服务器「${label}」未连接，正在后台重连（${err2?.message || err2}）。请稍后再调用这个工具，或先用其他工具继续。`);
        }
      }
    } finally {
      clearTimeout(timer);
      cts.dispose();
    }
  }
  _callWithProgress(params, progress, context2, token = CancellationToken.None, allowRetry = true) {
    const name = this._definition.serverToolName ?? this._definition.name;
    const progressToken = progress ? generateUuid() : void 0;
    const store = new DisposableStore();
    return McpServer.callOn(this._server, async (h3) => {
      if (progress) {
        store.add(h3.onDidReceiveProgressNotification((e) => {
          if (e.params.progressToken === progressToken) {
            progress.report({
              message: e.params.message,
              progress: e.params.total !== void 0 && e.params.progress !== void 0 ? e.params.progress / e.params.total : void 0
            });
          }
        }));
      }
      const meta = { progressToken };
      if (context2?.chatSessionResource) {
        meta["vscode.conversationId"] = chatSessionResourceToId(context2.chatSessionResource);
      }
      if (context2?.chatRequestId) {
        meta["vscode.requestId"] = context2.chatRequestId;
      }
      if (context2?.traceparent) {
        meta["traceparent"] = context2.traceparent;
        if (context2.tracestate) {
          meta["tracestate"] = context2.tracestate;
        }
      }
      const taskHint = this._definition.execution?.taskSupport;
      const serverSupportsTasksForTools = h3.capabilities.tasks?.requests?.tools?.call !== void 0;
      const shouldUseTask = serverSupportsTasksForTools && (taskHint === "required" || taskHint === "optional");
      try {
        const result = await h3.callTool({
          name,
          arguments: params,
          task: shouldUseTask ? {} : void 0,
          _meta: meta
        }, token, progress ? (message) => progress.report({ message }) : void 0);
        await this._server.awaitToolRefresh();
        return result;
      } catch (err) {
        if (err instanceof MpcResponseError && err.code === MCP.URL_ELICITATION_REQUIRED && allowRetry) {
          await this._handleElicitationErr(err, context2, token);
          return this._callWithProgress(params, progress, context2, token, false);
        }
        const state = this._server.connectionState.get();
        if (allowRetry && state.state === McpConnectionState.Kind.Error && state.shouldRetry) {
          return this._callWithProgress(params, progress, context2, token, false);
        } else {
          throw err;
        }
      } finally {
        store.dispose();
      }
    }, token);
  }
  async _handleElicitationErr(err, context2, token) {
    const elicitations = err.data?.elicitations;
    if (Array.isArray(elicitations) && elicitations.length > 0) {
      for (const elicitation of elicitations) {
        const elicitResult = await this._elicitationService.elicit(this._server, context2, elicitation, token);
        try {
          if (elicitResult.value.action !== "accept") {
            throw err;
          }
          if (elicitResult.kind === 1 /* URL */) {
            await elicitResult.wait;
          }
        } finally {
          elicitResult.dispose();
        }
      }
    }
  }
  compare(other) {
    return this._definition.name.localeCompare(other.definition.name);
  }
};

McpTool = __decorateClass([
  __decorateParam(3, IMcpElicitationService)
], McpTool);

function warnInvalidTools(instaService, serverName, errorText) {
  instaService.invokeFunction((accessor) => {
    const notificationService = accessor.get(INotificationService);
    const editorService = accessor.get(IEditorService);
    notificationService.notify({
      severity: Severity2.Warning,
      message: localize(17187, null, serverName),
      actions: {
        primary: [{
          class: void 0,
          enabled: true,
          id: "mcpBadSchema.show",
          tooltip: "",
          label: localize(17188, null),
          run: () => {
            editorService.openEditor({
              resource: void 0,
              contents: errorText
            });
          }
        }]
      }
    });
  });
}

var McpResource = class {
  constructor(server, original, icons2) {
    this.icons = icons2;
    this.mcpUri = original.uri;
    this.title = original.title;
    this.uri = McpResourceURI.fromServer(server.definition, original.uri);
    this.name = original.name;
    this.description = original.description;
    this.mimeType = original.mimeType;
    this.sizeInBytes = original.size;
  }
};

var McpResourceTemplate = class {
  constructor(_server, _definition, icons2) {
    this._server = _server;
    this._definition = _definition;
    this.icons = icons2;
    this.name = _definition.name;
    this.description = _definition.description;
    this.mimeType = _definition.mimeType;
    this.title = _definition.title;
    this.template = UriTemplate.parse(_definition.uriTemplate);
  }
  resolveURI(vars) {
    const serverUri = this.template.resolve(vars);
    return McpResourceURI.fromServer(this._server.definition, serverUri);
  }
  async complete(templatePart, prefix, alreadyResolved, token) {
    const result = await McpServer.callOn(this._server, (h3) => h3.complete({
      ref: { type: "ref/resource", uri: this._definition.uriTemplate },
      argument: { name: templatePart, value: prefix },
      context: {
        arguments: mapValues(alreadyResolved, (v2) => Array.isArray(v2) ? v2.join("/") : v2)
      }
    }, token), token);
    return result.completion.values;
  }
};
export { encodeCapabilities, warnInvalidTools, emptyToolEntry, toolInvalidCharRe, McpServerMetadataCache, McpPrefixGenerator, CachedPrimitive, McpServer, McpPrompt, McpTool, McpResource, McpResourceTemplate };
