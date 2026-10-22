// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/parts/ipc/common/ipc.ts
import { VSBuffer } from "./module-0038.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { dispose, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2, Relay } from "./module-0017.mjs";
import { CancellationError, ErrorNoTelemetry } from "./module-0004.mjs";
import { createCancelablePromise } from "./module-0036.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";
import { revive } from "./module-0265.mjs";
import { isUndefinedOrNull } from "./module-0010.mjs";
import { isUpperAsciiLetter } from "./module-0030.mjs";


// src/vs/base/parts/ipc/common/ipc.ts
function requestTypeToStr(type) {
  switch (type) {
    case 100 /* Promise */:
      return "req";
    case 101 /* PromiseCancel */:
      return "cancel";
    case 102 /* EventListen */:
      return "subscribe";
    case 103 /* EventDispose */:
      return "unsubscribe";
  }
}

function responseTypeToStr(type) {
  switch (type) {
    case 200 /* Initialize */:
      return `init`;
    case 201 /* PromiseSuccess */:
      return `reply:`;
    case 202 /* PromiseError */:
    case 203 /* PromiseErrorObj */:
      return `replyErr:`;
    case 204 /* EventFire */:
      return `event:`;
  }
}

function readIntVQL(reader) {
  let value2 = 0;
  for (let n2 = 0; ; n2 += 7) {
    const next = reader.read(1);
    value2 |= (next.buffer[0] & 127) << n2;
    if (!(next.buffer[0] & 128)) {
      return value2;
    }
  }
}

var vqlZero = createOneByteBuffer(0);

function writeInt32VQL(writer, value2) {
  if (value2 === 0) {
    writer.write(vqlZero);
    return;
  }
  let len = 0;
  for (let v2 = value2; v2 !== 0; v2 = v2 >>> 7) {
    len++;
  }
  const scratch = VSBuffer.alloc(len);
  for (let i2 = 0; value2 !== 0; i2++) {
    scratch.buffer[i2] = value2 & 127;
    value2 = value2 >>> 7;
    if (value2 > 0) {
      scratch.buffer[i2] |= 128;
    }
  }
  writer.write(scratch);
}

var BufferReader = class {
  constructor(buffer) {
    this.buffer = buffer;
    this.pos = 0;
  }
  read(bytes) {
    const result = this.buffer.slice(this.pos, this.pos + bytes);
    this.pos += result.byteLength;
    return result;
  }
};

var BufferWriter = class {
  constructor() {
    this.buffers = [];
  }
  get buffer() {
    return VSBuffer.concat(this.buffers);
  }
  write(buffer) {
    this.buffers.push(buffer);
  }
  dispose() {
    this.buffers.length = 0;
  }
};

function createOneByteBuffer(value2) {
  const result = VSBuffer.alloc(1);
  result.writeUInt8(value2, 0);
  return result;
}

var BufferPresets = {
  Undefined: createOneByteBuffer(0 /* Undefined */),
  String: createOneByteBuffer(1 /* String */),
  Buffer: createOneByteBuffer(2 /* Buffer */),
  VSBuffer: createOneByteBuffer(3 /* VSBuffer */),
  Array: createOneByteBuffer(4 /* Array */),
  Object: createOneByteBuffer(5 /* Object */),
  Uint: createOneByteBuffer(6 /* Int */)
};

function serialize(writer, data) {
  if (typeof data === "undefined") {
    writer.write(BufferPresets.Undefined);
  } else if (typeof data === "string") {
    const buffer = VSBuffer.fromString(data);
    writer.write(BufferPresets.String);
    writeInt32VQL(writer, buffer.byteLength);
    writer.write(buffer);
  } else if (VSBuffer.isNativeBuffer(data)) {
    const buffer = VSBuffer.wrap(data);
    writer.write(BufferPresets.Buffer);
    writeInt32VQL(writer, buffer.byteLength);
    writer.write(buffer);
  } else if (data instanceof VSBuffer) {
    writer.write(BufferPresets.VSBuffer);
    writeInt32VQL(writer, data.byteLength);
    writer.write(data);
  } else if (Array.isArray(data)) {
    writer.write(BufferPresets.Array);
    writeInt32VQL(writer, data.length);
    for (const el of data) {
      serialize(writer, el);
    }
  } else if (typeof data === "number" && (data | 0) === data) {
    writer.write(BufferPresets.Uint);
    writeInt32VQL(writer, data);
  } else {
    const buffer = VSBuffer.fromString(JSON.stringify(data));
    writer.write(BufferPresets.Object);
    writeInt32VQL(writer, buffer.byteLength);
    writer.write(buffer);
  }
}

function deserialize(reader) {
  const type = reader.read(1).readUInt8(0);
  switch (type) {
    case 0 /* Undefined */:
      return void 0;
    case 1 /* String */:
      return reader.read(readIntVQL(reader)).toString();
    case 2 /* Buffer */:
      return reader.read(readIntVQL(reader)).buffer;
    case 3 /* VSBuffer */:
      return reader.read(readIntVQL(reader));
    case 4 /* Array */: {
      const length = readIntVQL(reader);
      const result = [];
      for (let i2 = 0; i2 < length; i2++) {
        result.push(deserialize(reader));
      }
      return result;
    }
    case 5 /* Object */:
      return JSON.parse(reader.read(readIntVQL(reader)).toString());
    case 6 /* Int */:
      return readIntVQL(reader);
  }
}

var ChannelServer = class {
  constructor(protocol, ctx, logger = null, timeoutDelay = 1e3) {
    this.protocol = protocol;
    this.ctx = ctx;
    this.logger = logger;
    this.timeoutDelay = timeoutDelay;
    this.channels = /* @__PURE__ */ new Map();
    this.activeRequests = /* @__PURE__ */ new Map();
    // Requests might come in for channels which are not yet registered.
    // They will timeout after `timeoutDelay`.
    this.pendingRequests = /* @__PURE__ */ new Map();
    this.protocolListener = this.protocol.onMessage((msg) => this.onRawMessage(msg));
    this.sendResponse({ type: 200 /* Initialize */ });
  }
  registerChannel(channelName, channel) {
    this.channels.set(channelName, channel);
    setTimeout(() => this.flushPendingRequests(channelName), 0);
  }
  sendResponse(response) {
    switch (response.type) {
      case 200 /* Initialize */: {
        const msgLength = this.send([response.type]);
        this.logger?.logOutgoing(msgLength, 0, 1 /* OtherSide */, responseTypeToStr(response.type));
        return;
      }
      case 201 /* PromiseSuccess */:
      case 202 /* PromiseError */:
      case 204 /* EventFire */:
      case 203 /* PromiseErrorObj */: {
        const msgLength = this.send([response.type, response.id], response.data);
        this.logger?.logOutgoing(msgLength, response.id, 1 /* OtherSide */, responseTypeToStr(response.type), response.data);
        return;
      }
    }
  }
  send(header2, body = void 0) {
    const writer = new BufferWriter();
    try {
      serialize(writer, header2);
      serialize(writer, body);
      return this.sendBuffer(writer.buffer);
    } finally {
      writer.dispose();
    }
  }
  sendBuffer(message) {
    try {
      this.protocol.send(message);
      return message.byteLength;
    } catch (err) {
      return 0;
    }
  }
  onRawMessage(message) {
    const reader = new BufferReader(message);
    const header2 = deserialize(reader);
    const body = deserialize(reader);
    const type = header2[0];
    switch (type) {
      case 100 /* Promise */:
        this.logger?.logIncoming(message.byteLength, header2[1], 1 /* OtherSide */, `${requestTypeToStr(type)}: ${header2[2]}.${header2[3]}`, body);
        return this.onPromise({ type, id: header2[1], channelName: header2[2], name: header2[3], arg: body });
      case 102 /* EventListen */:
        this.logger?.logIncoming(message.byteLength, header2[1], 1 /* OtherSide */, `${requestTypeToStr(type)}: ${header2[2]}.${header2[3]}`, body);
        return this.onEventListen({ type, id: header2[1], channelName: header2[2], name: header2[3], arg: body });
      case 101 /* PromiseCancel */:
        this.logger?.logIncoming(message.byteLength, header2[1], 1 /* OtherSide */, `${requestTypeToStr(type)}`);
        return this.disposeActiveRequest({ type, id: header2[1] });
      case 103 /* EventDispose */:
        this.logger?.logIncoming(message.byteLength, header2[1], 1 /* OtherSide */, `${requestTypeToStr(type)}`);
        return this.disposeActiveRequest({ type, id: header2[1] });
    }
  }
  onPromise(request2) {
    const channel = this.channels.get(request2.channelName);
    if (!channel) {
      this.collectPendingRequest(request2);
      return;
    }
    const cancellationTokenSource = new CancellationTokenSource();
    let promise;
    try {
      promise = channel.call(this.ctx, request2.name, request2.arg, cancellationTokenSource.token);
    } catch (err) {
      promise = Promise.reject(err);
    }
    const id2 = request2.id;
    promise.then((data) => {
      this.sendResponse({ id: id2, data, type: 201 /* PromiseSuccess */ });
    }, (err) => {
      if (err instanceof Error) {
        this.sendResponse({
          id: id2,
          data: {
            message: err.message,
            name: err.name,
            stack: err.stack ? err.stack.split("\n") : void 0
          },
          type: 202 /* PromiseError */
        });
      } else {
        this.sendResponse({ id: id2, data: err, type: 203 /* PromiseErrorObj */ });
      }
    }).finally(() => {
      disposable.dispose();
      this.activeRequests.delete(request2.id);
    });
    const disposable = toDisposable(() => cancellationTokenSource.cancel());
    this.activeRequests.set(request2.id, disposable);
  }
  onEventListen(request2) {
    const channel = this.channels.get(request2.channelName);
    if (!channel) {
      this.collectPendingRequest(request2);
      return;
    }
    const id2 = request2.id;
    const event = channel.listen(this.ctx, request2.name, request2.arg);
    const disposable = event((data) => this.sendResponse({ id: id2, data, type: 204 /* EventFire */ }));
    this.activeRequests.set(request2.id, disposable);
  }
  disposeActiveRequest(request2) {
    const disposable = this.activeRequests.get(request2.id);
    if (disposable) {
      disposable.dispose();
      this.activeRequests.delete(request2.id);
    }
  }
  collectPendingRequest(request2) {
    let pendingRequests = this.pendingRequests.get(request2.channelName);
    if (!pendingRequests) {
      pendingRequests = [];
      this.pendingRequests.set(request2.channelName, pendingRequests);
    }
    const timer = setTimeout(() => {
      console.error(`Unknown channel: ${request2.channelName}`);
      if (request2.type === 100 /* Promise */) {
        this.sendResponse({
          id: request2.id,
          data: { name: "Unknown channel", message: `Channel name '${request2.channelName}' timed out after ${this.timeoutDelay}ms`, stack: void 0 },
          type: 202 /* PromiseError */
        });
      }
    }, this.timeoutDelay);
    pendingRequests.push({ request: request2, timeoutTimer: timer });
  }
  flushPendingRequests(channelName) {
    const requests = this.pendingRequests.get(channelName);
    if (requests) {
      for (const request2 of requests) {
        clearTimeout(request2.timeoutTimer);
        switch (request2.request.type) {
          case 100 /* Promise */:
            this.onPromise(request2.request);
            break;
          case 102 /* EventListen */:
            this.onEventListen(request2.request);
            break;
        }
      }
      this.pendingRequests.delete(channelName);
    }
  }
  dispose() {
    if (this.protocolListener) {
      this.protocolListener.dispose();
      this.protocolListener = null;
    }
    dispose(this.activeRequests.values());
    this.activeRequests.clear();
  }
};

var ChannelClient = class {
  constructor(protocol, logger = null) {
    this.protocol = protocol;
    this.isDisposed = false;
    this.state = 0 /* Uninitialized */;
    this.activeRequests = /* @__PURE__ */ new Set();
    this.handlers = /* @__PURE__ */ new Map();
    this.lastRequestId = 0;
    this._onDidInitialize = new Emitter();
    this.onDidInitialize = this._onDidInitialize.event;
    this.protocolListener = this.protocol.onMessage((msg) => this.onBuffer(msg));
    this.logger = logger;
  }
  getChannel(channelName) {
    const that = this;
    return {
      call(command4, arg, cancellationToken) {
        if (that.isDisposed) {
          return Promise.reject(new CancellationError());
        }
        return that.requestPromise(channelName, command4, arg, cancellationToken);
      },
      listen(event, arg) {
        if (that.isDisposed) {
          return Event2.None;
        }
        return that.requestEvent(channelName, event, arg);
      }
    };
  }
  requestPromise(channelName, name, arg, cancellationToken = CancellationToken.None) {
    const id2 = this.lastRequestId++;
    const type = 100 /* Promise */;
    const request2 = { id: id2, type, channelName, name, arg };
    if (cancellationToken.isCancellationRequested) {
      return Promise.reject(new CancellationError());
    }
    let disposable;
    let disposableWithRequestCancel;
    const result = new Promise((c, e) => {
      if (cancellationToken.isCancellationRequested) {
        return e(new CancellationError());
      }
      const doRequest = () => {
        const handler = (response) => {
          switch (response.type) {
            case 201 /* PromiseSuccess */:
              this.handlers.delete(id2);
              c(response.data);
              break;
            case 202 /* PromiseError */: {
              this.handlers.delete(id2);
              const error = new Error(response.data.message);
              error.stack = Array.isArray(response.data.stack) ? response.data.stack.join("\n") : response.data.stack;
              error.name = response.data.name;
              e(error);
              break;
            }
            case 203 /* PromiseErrorObj */:
              this.handlers.delete(id2);
              e(response.data);
              break;
          }
        };
        this.handlers.set(id2, handler);
        try {
          this.sendRequest(request2);
        } catch (err) {
          this.handlers.delete(id2);
          e(err);
        }
      };
      let uninitializedPromise = null;
      if (this.state === 1 /* Idle */) {
        doRequest();
      } else {
        uninitializedPromise = createCancelablePromise((_) => this.whenInitialized());
        uninitializedPromise.then(() => {
          uninitializedPromise = null;
          doRequest();
        }, () => {
        });
      }
      const cancel = () => {
        if (uninitializedPromise) {
          uninitializedPromise.cancel();
          uninitializedPromise = null;
        } else {
          this.sendRequest({ id: id2, type: 101 /* PromiseCancel */ });
        }
        e(new CancellationError());
      };
      disposable = cancellationToken.onCancellationRequested(cancel);
      disposableWithRequestCancel = {
        dispose: createSingleCallFunction(() => {
          cancel();
          disposable.dispose();
        })
      };
      this.activeRequests.add(disposableWithRequestCancel);
    });
    return result.finally(() => {
      disposable?.dispose();
      this.activeRequests.delete(disposableWithRequestCancel);
    });
  }
  requestEvent(channelName, name, arg) {
    const id2 = this.lastRequestId++;
    const type = 102 /* EventListen */;
    const request2 = { id: id2, type, channelName, name, arg };
    let uninitializedPromise = null;
    const emitter = new Emitter({
      onWillAddFirstListener: () => {
        const handler = (res) => emitter.fire(res.data);
        this.handlers.set(id2, handler);
        const doRequest = () => {
          this.activeRequests.add(emitter);
          this.sendRequest(request2);
        };
        if (this.state === 1 /* Idle */) {
          doRequest();
        } else {
          uninitializedPromise = createCancelablePromise((_) => this.whenInitialized());
          uninitializedPromise.then(() => {
            uninitializedPromise = null;
            doRequest();
          }, () => {
          });
        }
      },
      onDidRemoveLastListener: () => {
        if (uninitializedPromise) {
          uninitializedPromise.cancel();
          uninitializedPromise = null;
        } else {
          this.activeRequests.delete(emitter);
          this.sendRequest({ id: id2, type: 103 /* EventDispose */ });
        }
        this.handlers.delete(id2);
      }
    });
    return emitter.event;
  }
  sendRequest(request2) {
    switch (request2.type) {
      case 100 /* Promise */:
      case 102 /* EventListen */: {
        const msgLength = this.send([request2.type, request2.id, request2.channelName, request2.name], request2.arg);
        this.logger?.logOutgoing(msgLength, request2.id, 0 /* LocalSide */, `${requestTypeToStr(request2.type)}: ${request2.channelName}.${request2.name}`, request2.arg);
        return;
      }
      case 101 /* PromiseCancel */:
      case 103 /* EventDispose */: {
        const msgLength = this.send([request2.type, request2.id]);
        this.logger?.logOutgoing(msgLength, request2.id, 0 /* LocalSide */, requestTypeToStr(request2.type));
        return;
      }
    }
  }
  send(header2, body = void 0) {
    const writer = new BufferWriter();
    try {
      serialize(writer, header2);
      serialize(writer, body);
      return this.sendBuffer(writer.buffer);
    } finally {
      writer.dispose();
    }
  }
  sendBuffer(message) {
    try {
      this.protocol.send(message);
      return message.byteLength;
    } catch (err) {
      return 0;
    }
  }
  onBuffer(message) {
    const reader = new BufferReader(message);
    const header2 = deserialize(reader);
    const body = deserialize(reader);
    const type = header2[0];
    switch (type) {
      case 200 /* Initialize */:
        this.logger?.logIncoming(message.byteLength, 0, 0 /* LocalSide */, responseTypeToStr(type));
        return this.onResponse({ type: header2[0] });
      case 201 /* PromiseSuccess */:
      case 202 /* PromiseError */:
      case 204 /* EventFire */:
      case 203 /* PromiseErrorObj */:
        this.logger?.logIncoming(message.byteLength, header2[1], 0 /* LocalSide */, responseTypeToStr(type), body);
        return this.onResponse({ type: header2[0], id: header2[1], data: body });
    }
  }
  onResponse(response) {
    if (response.type === 200 /* Initialize */) {
      this.state = 1 /* Idle */;
      this._onDidInitialize.fire();
      return;
    }
    const handler = this.handlers.get(response.id);
    handler?.(response);
  }
  get onDidInitializePromise() {
    return Event2.toPromise(this.onDidInitialize);
  }
  whenInitialized() {
    if (this.state === 1 /* Idle */) {
      return Promise.resolve();
    } else {
      return this.onDidInitializePromise;
    }
  }
  dispose() {
    this.isDisposed = true;
    if (this.protocolListener) {
      this.protocolListener.dispose();
      this.protocolListener = null;
    }
    dispose(this.activeRequests.values());
    this.activeRequests.clear();
    this._onDidInitialize.dispose();
  }
};

__decorateClass([
  memoize
], ChannelClient.prototype, "onDidInitializePromise", 1);

var IPCClient = class {
  constructor(protocol, ctx, ipcLogger = null) {
    const writer = new BufferWriter();
    try {
      serialize(writer, ctx);
      protocol.send(writer.buffer);
    } finally {
      writer.dispose();
    }
    this.channelClient = new ChannelClient(protocol, ipcLogger);
    this.channelServer = new ChannelServer(protocol, ctx, ipcLogger);
  }
  getChannel(channelName) {
    return this.channelClient.getChannel(channelName);
  }
  registerChannel(channelName, channel) {
    this.channelServer.registerChannel(channelName, channel);
  }
  dispose() {
    this.channelClient.dispose();
    this.channelServer.dispose();
  }
};

function getDelayedChannel(promise) {
  return {
    call(command4, arg, cancellationToken) {
      return promise.then((c) => c.call(command4, arg, cancellationToken));
    },
    listen(event, arg) {
      const relay = new Relay();
      void promise.then(
        (c) => relay.input = c.listen(event, arg),
        () => relay.dispose()
      );
      return relay.event;
    }
  };
}

var ProxyChannel;

((ProxyChannel2) => {
  function fromService(service, disposables, options3) {
    const handler = service;
    const disableMarshalling = options3?.disableMarshalling;
    const unbufferedEvents = options3?.unbufferedEvents ? new Set(options3.unbufferedEvents) : void 0;
    const mapEventNameToEvent = /* @__PURE__ */ new Map();
    for (const key3 in handler) {
      if (propertyIsEvent2(key3) && !unbufferedEvents?.has(key3)) {
        mapEventNameToEvent.set(key3, Event2.buffer(handler[key3], key3, true, void 0, disposables));
      }
    }
    return new class {
      listen(_, event, arg) {
        const eventImpl = mapEventNameToEvent.get(event);
        if (eventImpl) {
          return eventImpl;
        }
        const target = handler[event];
        if (typeof target === "function") {
          if (propertyIsDynamicEvent2(event)) {
            return target.call(handler, arg);
          }
          if (propertyIsEvent2(event)) {
            if (unbufferedEvents?.has(event)) {
              return handler[event];
            }
            mapEventNameToEvent.set(event, Event2.buffer(handler[event], event, true, void 0, disposables));
            return mapEventNameToEvent.get(event);
          }
        }
        throw new ErrorNoTelemetry(`Event not found: ${event}`);
      }
      call(_, command4, args2) {
        const target = handler[command4];
        if (typeof target === "function") {
          if (!disableMarshalling && Array.isArray(args2)) {
            for (let i2 = 0; i2 < args2.length; i2++) {
              args2[i2] = revive(args2[i2]);
            }
          }
          let res = target.apply(handler, args2);
          if (!(res instanceof Promise)) {
            res = Promise.resolve(res);
          }
          return res;
        }
        throw new ErrorNoTelemetry(`Method not found: ${command4}`);
      }
    }();
  }
  ProxyChannel2.fromService = fromService;
  function toService(channel, options3) {
    const disableMarshalling = options3?.disableMarshalling;
    return new Proxy({}, {
      get(_target, propKey) {
        if (typeof propKey === "string") {
          if (options3?.properties?.has(propKey)) {
            return options3.properties.get(propKey);
          }
          if (propKey === "then") {
            return void 0;
          }
          if (propertyIsDynamicEvent2(propKey)) {
            return function(arg) {
              return channel.listen(propKey, arg);
            };
          }
          if (propertyIsEvent2(propKey)) {
            return channel.listen(propKey);
          }
          return async function(...args2) {
            let methodArgs;
            if (options3 && !isUndefinedOrNull(options3.context)) {
              methodArgs = [options3.context, ...args2];
            } else {
              methodArgs = args2;
            }
            const result = await channel.call(propKey, methodArgs);
            if (!disableMarshalling) {
              return revive(result);
            }
            return result;
          };
        }
        throw new ErrorNoTelemetry(`Property not found: ${String(propKey)}`);
      }
    });
  }
  ProxyChannel2.toService = toService;
  function propertyIsEvent2(name) {
    return name[0] === "o" && name[1] === "n" && isUpperAsciiLetter(name.charCodeAt(2));
  }
  function propertyIsDynamicEvent2(name) {
    return /^onDynamic/.test(name) && isUpperAsciiLetter(name.charCodeAt(9));
  }
})(ProxyChannel || (ProxyChannel = {}));
export { requestTypeToStr, responseTypeToStr, readIntVQL, writeInt32VQL, createOneByteBuffer, serialize, deserialize, getDelayedChannel, vqlZero, BufferReader, BufferWriter, BufferPresets, ChannelServer, ChannelClient, IPCClient, ProxyChannel };
