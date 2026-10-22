// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/remote/common/remoteAgentConnection.ts
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { createCancelablePromise, promiseWithResolvers } from "./module-0036.mjs";
import { StopWatch } from "./module-0016.mjs";
import { mark } from "./module-0506.mjs";
import { RemoteAuthorities } from "./module-0033.mjs";
import { Client, PersistentProtocol } from "./module-1231.mjs";
import { generateUuid } from "./module-0190.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { RemoteAuthorityResolverError } from "./module-0896.mjs";
import { Emitter } from "./module-0017.mjs";
import { isCancellationError, onUnexpectedError } from "./module-0004.mjs";


// src/vs/platform/remote/common/remoteAgentConnection.ts
var RECONNECT_TIMEOUT = 30 * 1e3;

function connectionTypeToString(connectionType) {
  switch (connectionType) {
    case 1 /* Management */:
      return "Management";
    case 2 /* ExtensionHost */:
      return "ExtensionHost";
    case 3 /* Tunnel */:
      return "Tunnel";
  }
}

function createTimeoutCancellation(millis) {
  const source = new CancellationTokenSource();
  setTimeout(() => source.cancel(), millis);
  return source.token;
}

function combineTimeoutCancellation(a, b) {
  if (a.isCancellationRequested || b.isCancellationRequested) {
    return CancellationToken.Cancelled;
  }
  const source = new CancellationTokenSource();
  a.onCancellationRequested(() => source.cancel());
  b.onCancellationRequested(() => source.cancel());
  return source.token;
}

var PromiseWithTimeout = class {
  get didTimeout() {
    return this._state === "timedout";
  }
  constructor(timeoutCancellationToken) {
    this._state = "pending";
    this._disposables = new DisposableStore();
    ({ promise: this.promise, resolve: this._resolvePromise, reject: this._rejectPromise } = promiseWithResolvers());
    if (timeoutCancellationToken.isCancellationRequested) {
      this._timeout();
    } else {
      this._disposables.add(timeoutCancellationToken.onCancellationRequested(() => this._timeout()));
    }
  }
  registerDisposable(disposable) {
    if (this._state === "pending") {
      this._disposables.add(disposable);
    } else {
      disposable.dispose();
    }
  }
  _timeout() {
    if (this._state !== "pending") {
      return;
    }
    this._disposables.dispose();
    this._state = "timedout";
    this._rejectPromise(this._createTimeoutError());
  }
  _createTimeoutError() {
    const err = new Error("Time limit reached");
    err.code = "ETIMEDOUT";
    err.syscall = "connect";
    return err;
  }
  resolve(value2) {
    if (this._state !== "pending") {
      return;
    }
    this._disposables.dispose();
    this._state = "resolved";
    this._resolvePromise(value2);
  }
  reject(err) {
    if (this._state !== "pending") {
      return;
    }
    this._disposables.dispose();
    this._state = "rejected";
    this._rejectPromise(err);
  }
};

function readOneControlMessage(protocol, timeoutCancellationToken) {
  const result = new PromiseWithTimeout(timeoutCancellationToken);
  result.registerDisposable(protocol.onControlMessage((raw) => {
    const msg = JSON.parse(raw.toString());
    const error = getErrorFromMessage(msg);
    if (error) {
      result.reject(error);
    } else {
      result.resolve(msg);
    }
  }));
  return result.promise;
}

function createSocket(logService, remoteSocketFactoryService, connectTo, path, query, debugConnectionType, debugLabel, timeoutCancellationToken) {
  const result = new PromiseWithTimeout(timeoutCancellationToken);
  const sw = StopWatch.create(false);
  logService.info(`Creating a socket (${debugLabel})...`);
  mark(`code/willCreateSocket/${debugConnectionType}`);
  remoteSocketFactoryService.connect(connectTo, path, query, debugLabel).then((socket) => {
    if (result.didTimeout) {
      mark(`code/didCreateSocketError/${debugConnectionType}`);
      logService.info(`Creating a socket (${debugLabel}) finished after ${sw.elapsed()} ms, but this is too late and has timed out already.`);
      socket?.dispose();
    } else {
      mark(`code/didCreateSocketOK/${debugConnectionType}`);
      logService.info(`Creating a socket (${debugLabel}) was successful after ${sw.elapsed()} ms.`);
      result.resolve(socket);
    }
  }, (err) => {
    mark(`code/didCreateSocketError/${debugConnectionType}`);
    logService.info(`Creating a socket (${debugLabel}) returned an error after ${sw.elapsed()} ms.`);
    logService.error(err);
    result.reject(err);
  });
  return result.promise;
}

function raceWithTimeoutCancellation(promise, timeoutCancellationToken) {
  const result = new PromiseWithTimeout(timeoutCancellationToken);
  promise.then(
    (res) => {
      if (!result.didTimeout) {
        result.resolve(res);
      }
    },
    (err) => {
      if (!result.didTimeout) {
        result.reject(err);
      }
    }
  );
  return result.promise;
}

async function connectToRemoteExtensionHostAgent(options3, connectionType, args2, timeoutCancellationToken) {
  const logPrefix = connectLogPrefix(options3, connectionType);
  options3.logService.trace(`${logPrefix} 1/6. invoking socketFactory.connect().`);
  let socket;
  try {
    socket = await createSocket(options3.logService, options3.remoteSocketFactoryService, options3.connectTo, RemoteAuthorities.getServerRootPath(), `reconnectionToken=${options3.reconnectionToken}&reconnection=${options3.reconnectionProtocol ? "true" : "false"}`, connectionTypeToString(connectionType), `renderer-${connectionTypeToString(connectionType)}-${options3.reconnectionToken}`, timeoutCancellationToken);
  } catch (error) {
    options3.logService.error(`${logPrefix} socketFactory.connect() failed or timed out. Error:`);
    options3.logService.error(error);
    throw error;
  }
  options3.logService.trace(`${logPrefix} 2/6. socketFactory.connect() was successful.`);
  let protocol;
  let ownsProtocol;
  if (options3.reconnectionProtocol) {
    options3.reconnectionProtocol.beginAcceptReconnection(socket, null);
    protocol = options3.reconnectionProtocol;
    ownsProtocol = false;
  } else {
    protocol = new PersistentProtocol({ socket });
    ownsProtocol = true;
  }
  options3.logService.trace(`${logPrefix} 3/6. sending AuthRequest control message.`);
  const message = await raceWithTimeoutCancellation(options3.signService.createNewMessage(generateUuid()), timeoutCancellationToken);
  const authRequest = {
    type: "auth",
    auth: options3.connectionToken || "00000000000000000000",
    data: message.data
  };
  protocol.sendControl(VSBuffer.fromString(JSON.stringify(authRequest)));
  try {
    const msg = await readOneControlMessage(protocol, combineTimeoutCancellation(timeoutCancellationToken, createTimeoutCancellation(1e4)));
    if (msg.type !== "sign" || typeof msg.data !== "string") {
      const error = new Error("Unexpected handshake message");
      error.code = "VSCODE_CONNECTION_ERROR";
      throw error;
    }
    options3.logService.trace(`${logPrefix} 4/6. received SignRequest control message.`);
    const isValid2 = await raceWithTimeoutCancellation(options3.signService.validate(message, msg.signedData), timeoutCancellationToken);
    if (!isValid2) {
      const error = new Error("Refused to connect to unsupported server");
      error.code = "VSCODE_CONNECTION_ERROR";
      throw error;
    }
    const signed = await raceWithTimeoutCancellation(options3.signService.sign(msg.data), timeoutCancellationToken);
    const connTypeRequest = {
      type: "connectionType",
      commit: options3.commit,
      signedData: signed,
      desiredConnectionType: connectionType
    };
    if (args2) {
      connTypeRequest.args = args2;
    }
    options3.logService.trace(`${logPrefix} 5/6. sending ConnectionTypeRequest control message.`);
    protocol.sendControl(VSBuffer.fromString(JSON.stringify(connTypeRequest)));
    return { protocol, ownsProtocol };
  } catch (error) {
    if (error && error.code === "ETIMEDOUT") {
      options3.logService.error(`${logPrefix} the handshake timed out. Error:`);
      options3.logService.error(error);
    }
    if (error && error.code === "VSCODE_CONNECTION_ERROR") {
      options3.logService.error(`${logPrefix} received error control message when negotiating connection. Error:`);
      options3.logService.error(error);
    }
    if (ownsProtocol) {
      safeDisposeProtocolAndSocket(protocol);
    }
    throw error;
  }
}

async function connectToRemoteExtensionHostAgentAndReadOneMessage(options3, connectionType, args2, timeoutCancellationToken) {
  const startTime = Date.now();
  const logPrefix = connectLogPrefix(options3, connectionType);
  const { protocol, ownsProtocol } = await connectToRemoteExtensionHostAgent(options3, connectionType, args2, timeoutCancellationToken);
  const result = new PromiseWithTimeout(timeoutCancellationToken);
  result.registerDisposable(protocol.onControlMessage((raw) => {
    const msg = JSON.parse(raw.toString());
    const error = getErrorFromMessage(msg);
    if (error) {
      options3.logService.error(`${logPrefix} received error control message when negotiating connection. Error:`);
      options3.logService.error(error);
      if (ownsProtocol) {
        safeDisposeProtocolAndSocket(protocol);
      }
      result.reject(error);
    } else {
      options3.reconnectionProtocol?.endAcceptReconnection();
      options3.logService.trace(`${logPrefix} 6/6. handshake finished, connection is up and running after ${logElapsed(startTime)}!`);
      result.resolve({ protocol, firstMessage: msg });
    }
  }));
  return result.promise;
}

async function doConnectRemoteAgentManagement(options3, timeoutCancellationToken) {
  const { protocol } = await connectToRemoteExtensionHostAgentAndReadOneMessage(options3, 1 /* Management */, void 0, timeoutCancellationToken);
  return { protocol };
}

async function doConnectRemoteAgentExtensionHost(options3, startArguments, timeoutCancellationToken) {
  const { protocol, firstMessage } = await connectToRemoteExtensionHostAgentAndReadOneMessage(options3, 2 /* ExtensionHost */, startArguments, timeoutCancellationToken);
  const debugPort = firstMessage && firstMessage.debugPort;
  return { protocol, debugPort };
}

async function resolveConnectionOptions(options3, reconnectionToken, reconnectionProtocol) {
  const { connectTo, connectionToken } = await options3.addressProvider.getAddress();
  return {
    commit: options3.commit,
    quality: options3.quality,
    connectTo,
    connectionToken,
    reconnectionToken,
    reconnectionProtocol,
    remoteSocketFactoryService: options3.remoteSocketFactoryService,
    signService: options3.signService,
    logService: options3.logService
  };
}

async function connectRemoteAgentManagement(options3, remoteAuthority, clientId) {
  return createInitialConnection(
    options3,
    async (simpleOptions) => {
      const { protocol } = await doConnectRemoteAgentManagement(simpleOptions, CancellationToken.None);
      return new ManagementPersistentConnection(options3, remoteAuthority, clientId, simpleOptions.reconnectionToken, protocol);
    }
  );
}

async function connectRemoteAgentExtensionHost(options3, startArguments) {
  return createInitialConnection(
    options3,
    async (simpleOptions) => {
      const { protocol, debugPort } = await doConnectRemoteAgentExtensionHost(simpleOptions, startArguments, CancellationToken.None);
      return new ExtensionHostPersistentConnection(options3, startArguments, simpleOptions.reconnectionToken, protocol, debugPort);
    }
  );
}

async function createInitialConnection(options3, connectionFactory) {
  const MAX_ATTEMPTS = 5;
  for (let attempt = 1; ; attempt++) {
    try {
      const reconnectionToken = generateUuid();
      const simpleOptions = await resolveConnectionOptions(options3, reconnectionToken, null);
      const result = await connectionFactory(simpleOptions);
      return result;
    } catch (err) {
      if (attempt < MAX_ATTEMPTS) {
        options3.logService.error(`[remote-connection][attempt ${attempt}] An error occurred in initial connection! Will retry... Error:`);
        options3.logService.error(err);
      } else {
        options3.logService.error(`[remote-connection][attempt ${attempt}]  An error occurred in initial connection! It will be treated as a permanent error. Error:`);
        options3.logService.error(err);
        PersistentConnection.triggerPermanentFailure(0, 0, RemoteAuthorityResolverError.isHandled(err));
        throw err;
      }
    }
  }
}

function sleep(seconds) {
  return createCancelablePromise((token) => {
    return new Promise((resolve3, reject) => {
      const timeout2 = setTimeout(resolve3, seconds * 1e3);
      token.onCancellationRequested(() => {
        clearTimeout(timeout2);
        resolve3();
      });
    });
  });
}

var ConnectionLostEvent = class {
  constructor(reconnectionToken, millisSinceLastIncomingData) {
    this.reconnectionToken = reconnectionToken;
    this.millisSinceLastIncomingData = millisSinceLastIncomingData;
    this.type = 0 /* ConnectionLost */;
  }
};

var ReconnectionWaitEvent = class {
  constructor(reconnectionToken, millisSinceLastIncomingData, durationSeconds, cancellableTimer) {
    this.reconnectionToken = reconnectionToken;
    this.millisSinceLastIncomingData = millisSinceLastIncomingData;
    this.durationSeconds = durationSeconds;
    this.cancellableTimer = cancellableTimer;
    this.type = 1 /* ReconnectionWait */;
  }
  skipWait() {
    this.cancellableTimer.cancel();
  }
};

var ReconnectionRunningEvent = class {
  constructor(reconnectionToken, millisSinceLastIncomingData, attempt) {
    this.reconnectionToken = reconnectionToken;
    this.millisSinceLastIncomingData = millisSinceLastIncomingData;
    this.attempt = attempt;
    this.type = 2 /* ReconnectionRunning */;
  }
};

var ConnectionGainEvent = class {
  constructor(reconnectionToken, millisSinceLastIncomingData, attempt) {
    this.reconnectionToken = reconnectionToken;
    this.millisSinceLastIncomingData = millisSinceLastIncomingData;
    this.attempt = attempt;
    this.type = 4 /* ConnectionGain */;
  }
};

var ReconnectionPermanentFailureEvent = class {
  constructor(reconnectionToken, millisSinceLastIncomingData, attempt, handled) {
    this.reconnectionToken = reconnectionToken;
    this.millisSinceLastIncomingData = millisSinceLastIncomingData;
    this.attempt = attempt;
    this.handled = handled;
    this.type = 3 /* ReconnectionPermanentFailure */;
  }
};

var PersistentConnection = class _PersistentConnection extends Disposable {
  constructor(_connectionType, _options, reconnectionToken, protocol, _reconnectionFailureIsFatal) {
    super();
    this._connectionType = _connectionType;
    this._options = _options;
    this.reconnectionToken = reconnectionToken;
    this.protocol = protocol;
    this._reconnectionFailureIsFatal = _reconnectionFailureIsFatal;
    this._onDidStateChange = this._register(new Emitter());
    this.onDidStateChange = this._onDidStateChange.event;
    this._permanentFailure = false;
    this._isReconnecting = false;
    this._isDisposed = false;
    this._reconnectionGraceTime = 108e5 /* ReconnectionGraceTime */;
    this._onDidStateChange.fire(new ConnectionGainEvent(this.reconnectionToken, 0, 0));
    this._register(protocol.onSocketClose((e4) => {
      const logPrefix = commonLogPrefix(this._connectionType, this.reconnectionToken, true);
      if (!e4) {
        this._options.logService.info(`${logPrefix} received socket close event.`);
      } else if (e4.type === 0 /* NodeSocketCloseEvent */) {
        this._options.logService.info(`${logPrefix} received socket close event (hadError: ${e4.hadError}).`);
        if (e4.error) {
          this._options.logService.error(e4.error);
        }
      } else {
        this._options.logService.info(`${logPrefix} received socket close event (wasClean: ${e4.wasClean}, code: ${e4.code}, reason: ${e4.reason}).`);
        if (e4.event) {
          this._options.logService.error(e4.event);
        }
      }
      this._beginReconnecting();
    }));
    this._register(protocol.onSocketTimeout((e4) => {
      const logPrefix = commonLogPrefix(this._connectionType, this.reconnectionToken, true);
      this._options.logService.info(`${logPrefix} received socket timeout event (reason: ${e4.reason}, unacknowledgedMsgCount: ${e4.unacknowledgedMsgCount}, timeSinceOldestUnacknowledgedMsg: ${e4.timeSinceOldestUnacknowledgedMsg}, timeSinceLastReceivedSomeData: ${e4.timeSinceLastReceivedSomeData}).`);
      this._beginReconnecting();
    }));
    _PersistentConnection._instances.push(this);
    this._register(toDisposable(() => {
      const myIndex = _PersistentConnection._instances.indexOf(this);
      if (myIndex >= 0) {
        _PersistentConnection._instances.splice(myIndex, 1);
      }
    }));
    if (this._isPermanentFailure) {
      this._gotoPermanentFailure(_PersistentConnection._permanentFailureMillisSinceLastIncomingData, _PersistentConnection._permanentFailureAttempt, _PersistentConnection._permanentFailureHandled);
    }
  }
  static triggerPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
    this._permanentFailure = true;
    this._permanentFailureMillisSinceLastIncomingData = millisSinceLastIncomingData;
    this._permanentFailureAttempt = attempt;
    this._permanentFailureHandled = handled;
    this._instances.forEach((instance2) => instance2._gotoPermanentFailure(this._permanentFailureMillisSinceLastIncomingData, this._permanentFailureAttempt, this._permanentFailureHandled));
  }
  static debugTriggerReconnection() {
    this._instances.forEach((instance2) => instance2._beginReconnecting());
  }
  static debugPauseSocketWriting() {
    this._instances.forEach((instance2) => instance2._pauseSocketWriting());
  }
  static {
    this._permanentFailure = false;
  }
  static {
    this._permanentFailureMillisSinceLastIncomingData = 0;
  }
  static {
    this._permanentFailureAttempt = 0;
  }
  static {
    this._permanentFailureHandled = false;
  }
  static {
    this._instances = [];
  }
  get _isPermanentFailure() {
    return this._permanentFailure || _PersistentConnection._permanentFailure;
  }
  updateGraceTime(graceTime) {
    const sanitizedGrace = sanitizeGraceTime(graceTime, 108e5 /* ReconnectionGraceTime */);
    const logPrefix = commonLogPrefix(this._connectionType, this.reconnectionToken, false);
    this._options.logService.trace(`${logPrefix} Applying reconnection grace time: ${sanitizedGrace}ms (${Math.floor(sanitizedGrace / 1e3)}s)`);
    this._reconnectionGraceTime = sanitizedGrace;
  }
  dispose() {
    super.dispose();
    this._isDisposed = true;
  }
  async _beginReconnecting() {
    if (this._isReconnecting) {
      return;
    }
    try {
      this._isReconnecting = true;
      await this._runReconnectingLoop();
    } finally {
      this._isReconnecting = false;
    }
  }
  async _runReconnectingLoop() {
    if (this._isPermanentFailure || this._isDisposed) {
      return;
    }
    const logPrefix = commonLogPrefix(this._connectionType, this.reconnectionToken, true);
    this._options.logService.info(`${logPrefix} starting reconnecting loop. You can get more information with the trace log level.`);
    this._onDidStateChange.fire(new ConnectionLostEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData()));
    const TIMES = [0, 5, 5, 10, 10, 10, 10, 10, 30];
    const graceTime = this._reconnectionGraceTime;
    this._options.logService.info(`${logPrefix} starting reconnection with grace time: ${graceTime}ms (${Math.floor(graceTime / 1e3)}s)`);
    if (graceTime <= 0) {
      this._options.logService.error(`${logPrefix} reconnection grace time is set to 0ms, will not attempt to reconnect.`);
      this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), 0, false);
      return;
    }
    const loopStartTime = Date.now();
    let attempt = -1;
    do {
      attempt++;
      const waitTime = attempt < TIMES.length ? TIMES[attempt] : TIMES[TIMES.length - 1];
      try {
        if (waitTime > 0) {
          const sleepPromise = sleep(waitTime);
          this._onDidStateChange.fire(new ReconnectionWaitEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), waitTime, sleepPromise));
          this._options.logService.info(`${logPrefix} waiting for ${waitTime} seconds before reconnecting...`);
          try {
            await sleepPromise;
          } catch {
          }
        }
        if (this._isPermanentFailure) {
          this._options.logService.error(`${logPrefix} permanent failure occurred while running the reconnecting loop.`);
          break;
        }
        this._onDidStateChange.fire(new ReconnectionRunningEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), attempt + 1));
        this._options.logService.info(`${logPrefix} resolving connection...`);
        const simpleOptions = await resolveConnectionOptions(this._options, this.reconnectionToken, this.protocol);
        this._options.logService.info(`${logPrefix} connecting to ${simpleOptions.connectTo}...`);
        await this._reconnect(simpleOptions, createTimeoutCancellation(RECONNECT_TIMEOUT));
        this._options.logService.info(`${logPrefix} reconnected!`);
        this._onDidStateChange.fire(new ConnectionGainEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), attempt + 1));
        break;
      } catch (err) {
        if (err.code === "VSCODE_CONNECTION_ERROR") {
          this._options.logService.error(`${logPrefix} A permanent error occurred in the reconnecting loop! Will give up now! Error:`);
          this._options.logService.error(err);
          this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
          break;
        }
        if (Date.now() - loopStartTime >= graceTime) {
          const graceSeconds = Math.round(graceTime / 1e3);
          this._options.logService.error(`${logPrefix} An error occurred while reconnecting, but it will be treated as a permanent error because the reconnection grace time (${graceSeconds}s) has expired! Will give up now! Error:`);
          this._options.logService.error(err);
          this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
          break;
        }
        if (RemoteAuthorityResolverError.isTemporarilyNotAvailable(err)) {
          this._options.logService.info(`${logPrefix} A temporarily not available error occurred while trying to reconnect, will try again...`);
          this._options.logService.trace(err);
          continue;
        }
        if ((err.code === "ETIMEDOUT" || err.code === "ENETUNREACH" || err.code === "ECONNREFUSED" || err.code === "ECONNRESET") && err.syscall === "connect") {
          this._options.logService.info(`${logPrefix} A network error occurred while trying to reconnect, will try again...`);
          this._options.logService.trace(err);
          continue;
        }
        if (isCancellationError(err)) {
          this._options.logService.info(`${logPrefix} A promise cancelation error occurred while trying to reconnect, will try again...`);
          this._options.logService.trace(err);
          continue;
        }
        if (err instanceof RemoteAuthorityResolverError) {
          this._options.logService.error(`${logPrefix} A RemoteAuthorityResolverError occurred while trying to reconnect. Will give up now! Error:`);
          this._options.logService.error(err);
          this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, RemoteAuthorityResolverError.isHandled(err));
          break;
        }
        this._options.logService.error(`${logPrefix} An unknown error occurred while trying to reconnect, since this is an unknown case, it will be treated as a permanent error! Will give up now! Error:`);
        this._options.logService.error(err);
        this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
        break;
      }
    } while (!this._isPermanentFailure && !this._isDisposed);
  }
  _onReconnectionPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
    if (this._reconnectionFailureIsFatal) {
      _PersistentConnection.triggerPermanentFailure(millisSinceLastIncomingData, attempt, handled);
    } else {
      this._gotoPermanentFailure(millisSinceLastIncomingData, attempt, handled);
    }
  }
  _gotoPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
    this._onDidStateChange.fire(new ReconnectionPermanentFailureEvent(this.reconnectionToken, millisSinceLastIncomingData, attempt, handled));
    safeDisposeProtocolAndSocket(this.protocol);
  }
  _pauseSocketWriting() {
    this.protocol.pauseSocketWriting();
  }
};

var ManagementPersistentConnection = class extends PersistentConnection {
  constructor(options3, remoteAuthority, clientId, reconnectionToken, protocol) {
    super(
      1 /* Management */,
      options3,
      reconnectionToken,
      protocol,
      /*reconnectionFailureIsFatal*/
      true
    );
    this.client = this._register(new Client(protocol, {
      remoteAuthority,
      clientId
    }, options3.ipcLogger));
  }
  async _reconnect(options3, timeoutCancellationToken) {
    await doConnectRemoteAgentManagement(options3, timeoutCancellationToken);
  }
};

var ExtensionHostPersistentConnection = class extends PersistentConnection {
  constructor(options3, startArguments, reconnectionToken, protocol, debugPort) {
    super(
      2 /* ExtensionHost */,
      options3,
      reconnectionToken,
      protocol,
      /*reconnectionFailureIsFatal*/
      false
    );
    this._startArguments = startArguments;
    this.debugPort = debugPort;
  }
  async _reconnect(options3, timeoutCancellationToken) {
    await doConnectRemoteAgentExtensionHost(options3, this._startArguments, timeoutCancellationToken);
  }
};

function safeDisposeProtocolAndSocket(protocol) {
  try {
    protocol.acceptDisconnect();
    const socket = protocol.getSocket();
    protocol.dispose();
    socket.dispose();
  } catch (err) {
    onUnexpectedError(err);
  }
}

function getErrorFromMessage(msg) {
  if (msg && msg.type === "error") {
    const error = new Error(`Connection error: ${msg.reason}`);
    error.code = "VSCODE_CONNECTION_ERROR";
    return error;
  }
  return null;
}

function sanitizeGraceTime(candidate, fallback2) {
  if (typeof candidate !== "number" || !isFinite(candidate) || candidate < 0) {
    return fallback2;
  }
  if (candidate > Number.MAX_SAFE_INTEGER) {
    return Number.MAX_SAFE_INTEGER;
  }
  return Math.floor(candidate);
}

function stringRightPad(str, len) {
  while (str.length < len) {
    str += " ";
  }
  return str;
}

function _commonLogPrefix(connectionType, reconnectionToken) {
  return `[remote-connection][${stringRightPad(connectionTypeToString(connectionType), 13)}][${reconnectionToken.substr(0, 5)}\u2026]`;
}

function commonLogPrefix(connectionType, reconnectionToken, isReconnect) {
  return `${_commonLogPrefix(connectionType, reconnectionToken)}[${isReconnect ? "reconnect" : "initial"}]`;
}

function connectLogPrefix(options3, connectionType) {
  return `${commonLogPrefix(connectionType, options3.reconnectionToken, !!options3.reconnectionProtocol)}[${options3.connectTo}]`;
}

function logElapsed(startTime) {
  return `${Date.now() - startTime} ms`;
}
export { connectionTypeToString, createTimeoutCancellation, combineTimeoutCancellation, readOneControlMessage, createSocket, raceWithTimeoutCancellation, connectToRemoteExtensionHostAgent, connectToRemoteExtensionHostAgentAndReadOneMessage, doConnectRemoteAgentManagement, doConnectRemoteAgentExtensionHost, resolveConnectionOptions, connectRemoteAgentManagement, connectRemoteAgentExtensionHost, createInitialConnection, sleep, safeDisposeProtocolAndSocket, getErrorFromMessage, sanitizeGraceTime, stringRightPad, _commonLogPrefix, commonLogPrefix, connectLogPrefix, logElapsed, RECONNECT_TIMEOUT, PromiseWithTimeout, ConnectionLostEvent, ReconnectionWaitEvent, ReconnectionRunningEvent, ConnectionGainEvent, ReconnectionPermanentFailureEvent, PersistentConnection, ManagementPersistentConnection, ExtensionHostPersistentConnection };
