// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/agentHostPty.ts
import { BasePty } from "./module-2885.mjs";
import { Barrier, DeferredPromise, disposableTimeout, raceCancellation } from "./module-0036.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { AGENT_HOST_SCHEME, fromAgentHostUri } from "./module-1000.mjs";


// src/vs/workbench/contrib/terminal/browser/agentHostPty.ts
function getAhpCommandMarkId(commandId, kind) {
  return `ahp-${commandId}-${kind}`;
}

function getAhpCommandMarkCode(commandId, kind) {
  return `\x1B]633;SetMark;Id=${getAhpCommandMarkId(commandId, kind)};Hidden\x07`;
}

var COPILOT_SENTINEL_PREFIX = "<<<COPILOT_SENTINEL_";

function isCopilotSentinelCommand(commandLine) {
  return commandLine.includes(COPILOT_SENTINEL_PREFIX);
}

var AgentHostPty = class extends BasePty {
  constructor(id2, _connection, _terminalUri, _options, _logService) {
    super(
      id2,
      /* shouldPersist */
      false
    );
    this._connection = _connection;
    this._terminalUri = _terminalUri;
    this._options = _options;
    this._logService = _logService;
    this._startBarrier = new Barrier();
    this._lifetime = this._register(new CancellationTokenSource());
    this._subscription = this._register(new MutableDisposable());
    this._initialCwd = "";
    this._didSignalReady = false;
    this._onCommandExecuted = this._register(new Emitter());
    this.onCommandExecuted = this._onCommandExecuted.event;
    this._onCommandFinished = this._register(new Emitter());
    this.onCommandFinished = this._onCommandFinished.event;
    this._onSupportsCommandDetection = this._register(new Emitter());
    this.onSupportsCommandDetection = this._onSupportsCommandDetection.event;
    this._supportsCommandDetection = false;
    /**
     * Command IDs for sentinel commands that should be suppressed from shell
     * integration events. When the copilot shell tools fall back to sentinel-
     * based exit code detection, shell integration may also detect the sentinel
     * echo as a real command — we filter those out here.
     */
    this._suppressedCommandIds = /* @__PURE__ */ new Set();
  }
  get supportsCommandDetection() {
    return this._supportsCommandDetection;
  }
  async start() {
    const connection = this._connection;
    try {
      if (this._lifetime.token.isCancellationRequested) {
        return void 0;
      }
      if (!this._options?.attachOnly) {
        const terminalCreation = connection.createTerminal({
          channel: this._terminalUri.toString(),
          claim: { kind: "client" /* Client */, clientId: connection.clientId },
          name: this._options?.name,
          cwd: this._resolveCwdForProtocol(this._options?.cwd),
          cols: this._lastDimensions.cols > 0 ? this._lastDimensions.cols : void 0,
          rows: this._lastDimensions.rows > 0 ? this._lastDimensions.rows : void 0
        });
        this._terminalCreation = terminalCreation;
        terminalCreation.then(
          () => this._clearTerminalCreation(terminalCreation),
          () => this._clearTerminalCreation(terminalCreation)
        );
        const created = await raceCancellation(terminalCreation.then(() => true), this._lifetime.token, false);
        if (!created) {
          return void 0;
        }
      }
      if (this._lifetime.token.isCancellationRequested || this._connection !== connection) {
        return void 0;
      }
      const { subscription, store } = this._createSubscription(this._connection);
      if (!await this._waitForHydration(subscription, store)) {
        return void 0;
      }
      if (this._lifetime.token.isCancellationRequested || this._subscription.value !== store) {
        return void 0;
      }
      const state = subscription.value;
      if (state.supportsCommandDetection) {
        this._supportsCommandDetection = true;
        this._onSupportsCommandDetection.fire();
      }
      this._replayContent(state.content);
      this._initialCwd = state.cwd?.toString() ?? "";
      this._properties.cwd = this._initialCwd;
      this._properties.initialCwd = this._initialCwd;
      if (state.title) {
        this._properties.title = state.title;
      }
      this._signalReady();
      store.add(subscription.onDidApplyAction((envelope) => {
        this._handleAction(envelope);
      }));
      return void 0;
    } catch (err) {
      if (this._lifetime.token.isCancellationRequested || this._connection !== connection) {
        return void 0;
      }
      return { message: err instanceof Error ? err.message : String(err) };
    } finally {
      this._startBarrier.open();
    }
  }
  _clearTerminalCreation(terminalCreation) {
    if (this._terminalCreation === terminalCreation) {
      this._terminalCreation = void 0;
    }
  }
  _signalReady() {
    if (this._didSignalReady || this._lifetime.token.isCancellationRequested) {
      return;
    }
    this._didSignalReady = true;
    this.handleReady({ pid: -1, cwd: this._initialCwd, windowsPty: void 0 });
  }
  _handleAction(envelope) {
    if (this._lifetime.token.isCancellationRequested) {
      return;
    }
    const action = envelope.action;
    switch (action.type) {
      case "terminal/data" /* TerminalData */:
        this.handleData(action.data);
        break;
      case "terminal/exited" /* TerminalExited */:
        this._exitAndDispose(action.exitCode);
        break;
      case "terminal/cwdChanged" /* TerminalCwdChanged */:
        this._properties.cwd = action.cwd.toString();
        this.handleDidChangeProperty({ type: "cwd" /* Cwd */, value: action.cwd.toString() });
        break;
      case "terminal/titleChanged" /* TerminalTitleChanged */:
        this._properties.title = action.title;
        this.handleDidChangeProperty({ type: "title" /* Title */, value: action.title });
        break;
      case "terminal/resized" /* TerminalResized */:
        if (envelope.origin?.clientId !== this._connection.clientId) {
          this.handleDidChangeProperty({
            type: "overrideDimensions" /* OverrideDimensions */,
            value: { cols: action.cols, rows: action.rows }
          });
        }
        break;
      case "terminal/commandDetectionAvailable" /* TerminalCommandDetectionAvailable */:
        if (!this._supportsCommandDetection) {
          this._supportsCommandDetection = true;
          this._onSupportsCommandDetection.fire();
        }
        break;
      case "terminal/commandExecuted" /* TerminalCommandExecuted */:
        if (isCopilotSentinelCommand(action.commandLine)) {
          this._suppressedCommandIds.add(action.commandId);
          break;
        }
        this.handleData(getAhpCommandMarkCode(action.commandId, "s" /* Executed */));
        this._onCommandExecuted.fire({
          commandId: action.commandId,
          commandLine: action.commandLine,
          timestamp: action.timestamp
        });
        break;
      case "terminal/commandFinished" /* TerminalCommandFinished */:
        if (this._suppressedCommandIds.delete(action.commandId)) {
          break;
        }
        this.handleData(getAhpCommandMarkCode(action.commandId, "e" /* End */));
        this._onCommandFinished.fire({
          commandId: action.commandId,
          exitCode: action.exitCode,
          durationMs: action.durationMs
        });
        break;
    }
  }
  /**
   * Replays structured terminal content parts from the initial state snapshot.
   * Emits command lifecycle events for command parts so that consumers
   * (e.g. {@link AhpTerminalCommandSource}) can reconstruct command history.
   */
  _replayContent(content2) {
    for (const part of content2) {
      if (part.type === "unclassified") {
        if (part.value) {
          this.handleData(part.value);
        }
      } else if (part.type === "command") {
        if (isCopilotSentinelCommand(part.commandLine)) {
          continue;
        }
        this.handleData(getAhpCommandMarkCode(part.commandId, "s" /* Executed */));
        this._onCommandExecuted.fire({
          commandId: part.commandId,
          commandLine: part.commandLine,
          timestamp: part.timestamp,
          storedOutput: part.output
        });
        if (part.output) {
          this.handleData(part.output);
        }
        if (part.isComplete) {
          this.handleData(getAhpCommandMarkCode(part.commandId, "e" /* End */));
          this._onCommandFinished.fire({
            commandId: part.commandId,
            exitCode: part.exitCode,
            durationMs: part.durationMs
          });
        }
      }
    }
  }
  /**
   * Resolves a cwd URI for sending over the protocol. Agent-host URIs
   * are unwrapped to their original URI via {@link fromAgentHostUri}.
   */
  _resolveCwdForProtocol(cwd2) {
    if (!cwd2) {
      return void 0;
    }
    if (cwd2.scheme === AGENT_HOST_SCHEME) {
      return fromAgentHostUri(cwd2).toString();
    }
    return cwd2.toString();
  }
  _createSubscription(connection) {
    const store = new DisposableStore();
    try {
      const subscription = store.add(connection.getSubscription(3 /* Terminal */, this._terminalUri, "AgentHostPty")).object;
      this._subscription.value = store;
      return { subscription, store };
    } catch (error) {
      store.dispose();
      throw error;
    }
  }
  async _waitForHydration(subscription, store, timeoutMs) {
    if (subscription.value !== void 0) {
      return true;
    }
    const hydration = new DeferredPromise();
    const timeout2 = timeoutMs === void 0 ? void 0 : disposableTimeout(() => hydration.error(new Error("Reconnect hydration timed out")), timeoutMs, store);
    store.add(toDisposable(() => hydration.complete(false)));
    store.add(Event2.once(subscription.onDidChange)(() => {
      timeout2?.dispose();
      hydration.complete(true);
    }));
    return raceCancellation(hydration.p, this._lifetime.token, false);
  }
  input(data) {
    if (this._inReplay || this._lifetime.token.isCancellationRequested) {
      return;
    }
    this._startBarrier.wait().then(() => {
      if (this._lifetime.token.isCancellationRequested) {
        return;
      }
      this._connection.dispatch(
        this._terminalUri.toString(),
        { type: "terminal/input" /* TerminalInput */, data }
      );
    });
  }
  resize(cols, rows) {
    if (this._lifetime.token.isCancellationRequested || this._inReplay || this._lastDimensions.cols === cols && this._lastDimensions.rows === rows) {
      return;
    }
    this._lastDimensions.cols = cols;
    this._lastDimensions.rows = rows;
    this._startBarrier.wait().then(() => {
      if (this._lifetime.token.isCancellationRequested) {
        return;
      }
      this._connection.dispatch(
        this._terminalUri.toString(),
        { type: "terminal/resized" /* TerminalResized */, cols, rows }
      );
    });
  }
  shutdown(_immediate) {
    if (this._lifetime.token.isCancellationRequested) {
      return;
    }
    this._requestHostTerminalDisposal();
    this._exitAndDispose(void 0);
  }
  _requestHostTerminalDisposal() {
    if (this._options?.attachOnly) {
      return;
    }
    this._disposeHostTerminal();
    if (this._terminalCreation) {
      void this._terminalCreation.then(
        () => this._disposeHostTerminal(),
        () => this._disposeHostTerminal()
      );
    }
  }
  _disposeHostTerminal() {
    try {
      void this._connection.disposeTerminal(this._terminalUri).catch((err) => this._logHostDisposalError(err));
    } catch (err) {
      this._logHostDisposalError(err);
    }
  }
  _logHostDisposalError(err) {
    this._logService.warn(`[AgentHostPty] Failed to dispose host terminal: ${err instanceof Error ? err.message : String(err)}`);
  }
  _exitAndDispose(exitCode) {
    if (this._lifetime.token.isCancellationRequested) {
      return;
    }
    this._lifetime.cancel();
    this._subscription.clear();
    this._startBarrier.open();
    queueMicrotask(() => {
      this.handleExit(exitCode);
      this.dispose();
    });
  }
  async getInitialCwd() {
    return this._initialCwd;
  }
  async getCwd() {
    return this._properties.cwd || this._initialCwd;
  }
  async clearBuffer() {
    if (this._lifetime.token.isCancellationRequested) {
      return;
    }
    this._connection.dispatch(
      this._terminalUri.toString(),
      { type: "terminal/cleared" /* TerminalCleared */ }
    );
  }
  acknowledgeDataEvent(_charCount) {
  }
  async setUnicodeVersion(_version) {
  }
  processBinary(_data) {
    return Promise.resolve();
  }
  sendSignal(_signal) {
  }
  async refreshProperty(type) {
    return this._properties[type];
  }
  async updateProperty(_type, _value) {
  }
  /**
   * Reconnect this pty to a new agent host connection. Tears down the
   * old subscription and re-subscribes with the new connection, replaying
   * content from the server-side snapshot. Terminal output during the
   * disconnect gap is a stream (not state), so some loss is expected.
   *
   * @returns `true` if reconnection succeeded, `false` otherwise.
   */
  async reconnect(newConnection) {
    if (this._lifetime.token.isCancellationRequested) {
      return false;
    }
    this._subscription.clear();
    this._connection = newConnection;
    let subscriptionStore;
    try {
      const result = this._createSubscription(this._connection);
      const subscription = result.subscription;
      subscriptionStore = result.store;
      const RECONNECT_HYDRATE_TIMEOUT_MS = 1e4;
      if (!await this._waitForHydration(subscription, subscriptionStore, RECONNECT_HYDRATE_TIMEOUT_MS)) {
        return false;
      }
      if (this._lifetime.token.isCancellationRequested || this._subscription.value !== subscriptionStore) {
        return false;
      }
      const state = subscription.value;
      if (state.supportsCommandDetection && !this._supportsCommandDetection) {
        this._supportsCommandDetection = true;
        this._onSupportsCommandDetection.fire();
      }
      this.handleData("\x1B[2J\x1B[3J\x1B[H");
      this._replayContent(state.content);
      if (state.cwd) {
        this._properties.cwd = state.cwd.toString();
      }
      if (state.title) {
        this._properties.title = state.title;
      }
      this._signalReady();
      subscriptionStore.add(subscription.onDidApplyAction((envelope) => {
        this._handleAction(envelope);
      }));
      return true;
    } catch (err) {
      if (!this._lifetime.token.isCancellationRequested) {
        this._logService.warn(`[AgentHostPty] Reconnection failed: ${err instanceof Error ? err.message : String(err)}`);
      }
      if (subscriptionStore && this._subscription.value === subscriptionStore) {
        this._subscription.clear();
      }
      if (!this._didSignalReady && !this._lifetime.token.isCancellationRequested) {
        this._requestHostTerminalDisposal();
        this._exitAndDispose(void 0);
      }
      return false;
    }
  }
  /** The terminal URI this pty is subscribed to. */
  get terminalUri() {
    return this._terminalUri;
  }
  dispose() {
    this._lifetime.cancel();
    this._subscription.clear();
    super.dispose();
  }
};
export { getAhpCommandMarkId, getAhpCommandMarkCode, isCopilotSentinelCommand, COPILOT_SENTINEL_PREFIX, AgentHostPty };
