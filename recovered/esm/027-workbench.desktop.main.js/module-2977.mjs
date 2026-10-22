// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpServerConnection.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { McpConnectionState } from "./module-1206.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { log } from "./module-0095.mjs";
import { autorun } from "./module-0052.mjs";
import { McpServerRequestHandler } from "./module-2976.mjs";
import { openCodeMcpLaunchOptions } from "./module-2974.mjs";
import { CancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/mcp/common/mcpServerConnection.ts
var McpServerConnection = class extends Disposable {
  constructor(_collection, definition, _delegate2, launchDefinition, _logger, _errorOnUserInteraction, _taskManager, _instantiationService) {
    super();
    this._collection = _collection;
    this.definition = definition;
    this._delegate = _delegate2;
    this.launchDefinition = launchDefinition;
    this._logger = _logger;
    this._errorOnUserInteraction = _errorOnUserInteraction;
    this._taskManager = _taskManager;
    this._instantiationService = _instantiationService;
    this._launch = this._register(new MutableDisposable());
    this._state = observableValue("mcpServerState", { state: McpConnectionState.Kind.Stopped });
    this._requestHandler = observableValue("mcpServerRequestHandler", void 0);
    this._onPotentialSandboxBlock = this._register(new Emitter());
    this.state = this._state;
    this.handler = this._requestHandler;
    this.onPotentialSandboxBlock = this._onPotentialSandboxBlock.event;
  }
  /** @inheritdoc */
  async start(methods) {
    const currentState = this._state.get();
    if (!McpConnectionState.canBeStarted(currentState.state)) {
      return this._waitForState(McpConnectionState.Kind.Running, McpConnectionState.Kind.Error);
    }
    this._launch.value = void 0;
    this._state.set({ state: McpConnectionState.Kind.Starting }, void 0);
    this._logger.info(localize(17201, null, this.definition.label));
    try {
      const launch = this._delegate.start(this._collection, this.definition, this.launchDefinition, { errorOnUserInteraction: this._errorOnUserInteraction });
      this._launch.value = this.adoptLaunch(launch, methods);
      return this._waitForState(McpConnectionState.Kind.Running, McpConnectionState.Kind.Error);
    } catch (e) {
      const errorState = {
        state: McpConnectionState.Kind.Error,
        message: e instanceof Error ? e.message : String(e),
        shouldRetry: true
      };
      this._state.set(errorState, void 0);
      return errorState;
    }
  }
  adoptLaunch(launch, methods) {
    const store = new DisposableStore();
    const cts = new CancellationTokenSource();
    store.add(toDisposable(() => cts.dispose(true)));
    store.add(launch);
    store.add(launch.onDidLog(({ level, message }) => {
      log(this._logger, level, message);
      const potentialBlock = this._toPotentialSandboxBlock(message);
      if (potentialBlock) {
        this._onPotentialSandboxBlock.fire(potentialBlock);
      }
    }));
    let didStart = false;
    store.add(autorun((reader) => {
      const state = launch.state.read(reader);
      if (state.state === McpConnectionState.Kind.Error) {
        this._state.set({ ...state, shouldRetry: true }, void 0);
      } else {
        this._state.set(state, void 0);
      }
      this._logger.info(localize(17202, null, McpConnectionState.toString(state)));
      if (state.state === McpConnectionState.Kind.Running && !didStart) {
        didStart = true;
        McpServerRequestHandler.create(this._instantiationService, {
          ...methods,
          launch,
          logger: this._logger,
          requestLogLevel: this.definition.devMode ? 3 /* Info */ : 2 /* Debug */,
          taskManager: this._taskManager,
          requestTimeoutMs: openCodeMcpLaunchOptions(this.launchDefinition).timeoutMs
        }, cts.token).then(
          (handler) => {
            if (!store.isDisposed) {
              this._requestHandler.set(handler, void 0);
            } else {
              handler.dispose();
            }
          },
          (err) => {
            if (!store.isDisposed && McpConnectionState.isRunning(this._state.read(void 0))) {
              let message = err.message;
              if (err instanceof CancellationError) {
                message = "Server exited before responding to `initialize` request.";
                this._logger.error(message);
              } else {
                this._logger.error(err);
              }
              this._state.set({ state: McpConnectionState.Kind.Error, message, shouldRetry: true }, void 0);
            }
            store.dispose();
          }
        );
      }
    }));
    return { dispose: () => store.dispose(), object: launch };
  }
  async stop() {
    this._logger.info(localize(17203, null, this.definition.label));
    this._launch.value?.object.stop();
    await this._waitForState(McpConnectionState.Kind.Stopped, McpConnectionState.Kind.Error);
  }
  dispose() {
    this._requestHandler.get()?.dispose();
    super.dispose();
    this._state.set({ state: McpConnectionState.Kind.Stopped }, void 0);
  }
  _waitForState(...kinds) {
    const current = this._state.get();
    if (kinds.includes(current.state)) {
      return Promise.resolve(current);
    }
    return new Promise((resolve3) => {
      const disposable = autorun((reader) => {
        const state = this._state.read(reader);
        if (kinds.includes(state.state)) {
          disposable.dispose();
          resolve3(state);
        }
      });
    });
  }
  _toPotentialSandboxBlock(message) {
    if (!this.definition.sandboxEnabled) {
      return void 0;
    }
    if (/No matching config rule, denying:/i.test(message)) {
      return {
        kind: "network",
        message,
        host: this._extractSandboxHost(message)
      };
    }
    if (/(?:\b(?:EACCES|EPERM|ENOENT|EROFS|fail(?:ed|ure)?)\b|not accessible|read[- ]only)/i.test(message)) {
      return {
        kind: "filesystem",
        message,
        path: this._extractSandboxPath(message)
      };
    }
    return void 0;
  }
  _extractSandboxPath(line) {
    const bracketedPath = line.match(/\[(\/[^\]\r\n]+)\]/);
    if (bracketedPath?.[1]) {
      return bracketedPath[1].trim();
    }
    const quotedPath = line.match(/["'`](\/[^"'`]+)["'`]/);
    if (quotedPath?.[1]) {
      return quotedPath[1];
    }
    const trailingPath = line.match(/(\/[\w.\-~/ ]+)$/);
    return trailingPath?.[1]?.trim();
  }
  _extractSandboxHost(value2) {
    const match2 = value2.match(/No matching config rule, denying:\s+(?<host>[^:\s]+):\d+\.?$/i);
    return match2?.groups?.host;
  }
};

McpServerConnection = __decorateClass([
  __decorateParam(7, IInstantiationService)
], McpServerConnection);
export { McpServerConnection };
