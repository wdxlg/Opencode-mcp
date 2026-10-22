// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/rpcProtocol.ts
import { VSBuffer } from "./module-0038.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ProxyIdentifier, SerializableObjectWithBuffers, getStringIdentifierForProxy } from "./module-0920.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { canceled, transformErrorForSerialization } from "./module-0004.mjs";
import { transformIncomingURIs } from "./module-1199.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { CanceledLazyPromise, LazyPromise } from "./module-3902.mjs";


// src/vs/workbench/services/extensions/common/rpcProtocol.ts
function safeStringify3(obj, replacer2) {
  try {
    return JSON.stringify(obj, replacer2);
  } catch (err) {
    return "null";
  }
}

var refSymbolName = "$$ref$$";

var undefinedRef = { [refSymbolName]: -1 };

function stringifyJsonWithBufferRefs(obj, replacer2 = null, useSafeStringify = false) {
  const foundBuffers = [];
  const serialized = (useSafeStringify ? safeStringify3 : JSON.stringify)(obj, (key3, value2) => {
    if (typeof value2 === "undefined") {
      return undefinedRef;
    } else if (typeof value2 === "object") {
      if (value2 instanceof VSBuffer) {
        const bufferIndex = foundBuffers.push(value2) - 1;
        return { [refSymbolName]: bufferIndex };
      }
      if (replacer2) {
        return replacer2(key3, value2);
      }
    }
    return value2;
  });
  return {
    jsonString: serialized,
    referencedBuffers: foundBuffers
  };
}

function parseJsonAndRestoreBufferRefs(jsonString, buffers, uriTransformer) {
  return JSON.parse(jsonString, (_key, value2) => {
    if (value2) {
      const ref = value2[refSymbolName];
      if (typeof ref === "number") {
        return buffers[ref];
      }
      if (uriTransformer && value2.$mid === 1 /* Uri */) {
        return uriTransformer.transformIncoming(value2);
      }
    }
    return value2;
  });
}

function stringify3(obj, replacer2) {
  return JSON.stringify(obj, replacer2);
}

function createURIReplacer(transformer) {
  if (!transformer) {
    return null;
  }
  return (key3, value2) => {
    if (value2 && value2.$mid === 1 /* Uri */) {
      return transformer.transformOutgoing(value2);
    }
    return value2;
  };
}

var _RPCProtocolSymbol = /* @__PURE__ */ Symbol.for("rpcProtocol");

var _RPCProxySymbol = /* @__PURE__ */ Symbol.for("rpcProxy");

var _a5, _b2;

var RPCProtocol = class _RPCProtocol extends (_b2 = Disposable, _a5 = _RPCProtocolSymbol, _b2) {
  constructor(protocol, logger = null, transformer = null) {
    super();
    this[_a5] = true;
    // 3s
    this._onDidChangeResponsiveState = this._register(new Emitter());
    this.onDidChangeResponsiveState = this._onDidChangeResponsiveState.event;
    this._protocol = protocol;
    this._logger = logger;
    this._uriTransformer = transformer;
    this._uriReplacer = createURIReplacer(this._uriTransformer);
    this._isDisposed = false;
    this._locals = [];
    this._proxies = [];
    for (let i2 = 0, len = ProxyIdentifier.count; i2 < len; i2++) {
      this._locals[i2] = null;
      this._proxies[i2] = null;
    }
    this._lastMessageId = 0;
    this._cancelInvokedHandlers = /* @__PURE__ */ Object.create(null);
    this._pendingRPCReplies = {};
    this._responsiveState = 0 /* Responsive */;
    this._unacknowledgedCount = 0;
    this._unresponsiveTime = 0;
    this._asyncCheckUresponsive = this._register(new RunOnceScheduler(() => this._checkUnresponsive(), 1e3));
    this._register(this._protocol.onMessage((msg) => this._receiveOneMessage(msg)));
  }
  static {
    this.UNRESPONSIVE_TIME = 3 * 1e3;
  }
  dispose() {
    this._isDisposed = true;
    Object.keys(this._pendingRPCReplies).forEach((msgId) => {
      const pending = this._pendingRPCReplies[msgId];
      delete this._pendingRPCReplies[msgId];
      pending.resolveErr(canceled());
    });
    super.dispose();
  }
  drain() {
    if (typeof this._protocol.drain === "function") {
      return this._protocol.drain();
    }
    return Promise.resolve();
  }
  _onWillSendRequest(req) {
    if (this._unacknowledgedCount === 0) {
      this._unresponsiveTime = Date.now() + _RPCProtocol.UNRESPONSIVE_TIME;
    }
    this._unacknowledgedCount++;
    if (!this._asyncCheckUresponsive.isScheduled()) {
      this._asyncCheckUresponsive.schedule();
    }
  }
  _onDidReceiveAcknowledge(req) {
    this._unresponsiveTime = Date.now() + _RPCProtocol.UNRESPONSIVE_TIME;
    this._unacknowledgedCount--;
    if (this._unacknowledgedCount === 0) {
      this._asyncCheckUresponsive.cancel();
    }
    this._setResponsiveState(0 /* Responsive */);
  }
  _checkUnresponsive() {
    if (this._unacknowledgedCount === 0) {
      return;
    }
    if (Date.now() > this._unresponsiveTime) {
      this._setResponsiveState(1 /* Unresponsive */);
    } else {
      this._asyncCheckUresponsive.schedule();
    }
  }
  _setResponsiveState(newResponsiveState) {
    if (this._responsiveState === newResponsiveState) {
      return;
    }
    this._responsiveState = newResponsiveState;
    this._onDidChangeResponsiveState.fire(this._responsiveState);
  }
  get responsiveState() {
    return this._responsiveState;
  }
  transformIncomingURIs(obj) {
    if (!this._uriTransformer) {
      return obj;
    }
    return transformIncomingURIs(obj, this._uriTransformer);
  }
  getProxy(identifier2) {
    const { nid: rpcId, sid } = identifier2;
    if (!this._proxies[rpcId]) {
      this._proxies[rpcId] = this._createProxy(rpcId, sid);
    }
    return this._proxies[rpcId];
  }
  _createProxy(rpcId, debugName) {
    const handler = {
      get: (target, name) => {
        if (typeof name === "string" && !target[name] && name.charCodeAt(0) === 36 /* DollarSign */) {
          target[name] = (...myArgs) => {
            return this._remoteCall(rpcId, name, myArgs);
          };
        }
        if (name === _RPCProxySymbol) {
          return debugName;
        }
        return target[name];
      }
    };
    return new Proxy(/* @__PURE__ */ Object.create(null), handler);
  }
  set(identifier2, value2) {
    this._locals[identifier2.nid] = value2;
    return value2;
  }
  assertRegistered(identifiers2) {
    for (let i2 = 0, len = identifiers2.length; i2 < len; i2++) {
      const identifier2 = identifiers2[i2];
      if (!this._locals[identifier2.nid]) {
        throw new Error(`Missing proxy instance ${identifier2.sid}`);
      }
    }
  }
  _receiveOneMessage(rawmsg) {
    if (this._isDisposed) {
      return;
    }
    const msgLength = rawmsg.byteLength;
    const buff = MessageBuffer.read(rawmsg, 0);
    const messageType = buff.readUInt8();
    const req = buff.readUInt32();
    switch (messageType) {
      case 1 /* RequestJSONArgs */:
      case 2 /* RequestJSONArgsWithCancellation */: {
        let { rpcId, method, args: args2 } = MessageIO.deserializeRequestJSONArgs(buff);
        if (this._uriTransformer) {
          args2 = transformIncomingURIs(args2, this._uriTransformer);
        }
        this._receiveRequest(msgLength, req, rpcId, method, args2, messageType === 2 /* RequestJSONArgsWithCancellation */);
        break;
      }
      case 3 /* RequestMixedArgs */:
      case 4 /* RequestMixedArgsWithCancellation */: {
        let { rpcId, method, args: args2 } = MessageIO.deserializeRequestMixedArgs(buff);
        if (this._uriTransformer) {
          args2 = transformIncomingURIs(args2, this._uriTransformer);
        }
        this._receiveRequest(msgLength, req, rpcId, method, args2, messageType === 4 /* RequestMixedArgsWithCancellation */);
        break;
      }
      case 5 /* Acknowledged */: {
        this._logger?.logIncoming(msgLength, req, 0 /* LocalSide */, `ack`);
        this._onDidReceiveAcknowledge(req);
        break;
      }
      case 6 /* Cancel */: {
        this._receiveCancel(msgLength, req);
        break;
      }
      case 7 /* ReplyOKEmpty */: {
        this._receiveReply(msgLength, req, void 0);
        break;
      }
      case 9 /* ReplyOKJSON */: {
        let value2 = MessageIO.deserializeReplyOKJSON(buff);
        if (this._uriTransformer) {
          value2 = transformIncomingURIs(value2, this._uriTransformer);
        }
        this._receiveReply(msgLength, req, value2);
        break;
      }
      case 10 /* ReplyOKJSONWithBuffers */: {
        const value2 = MessageIO.deserializeReplyOKJSONWithBuffers(buff, this._uriTransformer);
        this._receiveReply(msgLength, req, value2);
        break;
      }
      case 8 /* ReplyOKVSBuffer */: {
        const value2 = MessageIO.deserializeReplyOKVSBuffer(buff);
        this._receiveReply(msgLength, req, value2);
        break;
      }
      case 11 /* ReplyErrError */: {
        let err = MessageIO.deserializeReplyErrError(buff);
        if (this._uriTransformer) {
          err = transformIncomingURIs(err, this._uriTransformer);
        }
        this._receiveReplyErr(msgLength, req, err);
        break;
      }
      case 12 /* ReplyErrEmpty */: {
        this._receiveReplyErr(msgLength, req, void 0);
        break;
      }
      default:
        console.error(`received unexpected message`);
        console.error(rawmsg);
    }
  }
  _receiveRequest(msgLength, req, rpcId, method, args2, usesCancellationToken) {
    this._logger?.logIncoming(msgLength, req, 1 /* OtherSide */, `receiveRequest ${getStringIdentifierForProxy(rpcId)}.${method}(`, args2);
    const callId = String(req);
    let promise;
    let cancel;
    if (usesCancellationToken) {
      const cancellationTokenSource = new CancellationTokenSource();
      args2.push(cancellationTokenSource.token);
      promise = this._invokeHandler(rpcId, method, args2);
      cancel = () => cancellationTokenSource.cancel();
    } else {
      promise = this._invokeHandler(rpcId, method, args2);
    }
    if (cancel) {
      this._cancelInvokedHandlers[callId] = cancel;
    }
    const msg = MessageIO.serializeAcknowledged(req);
    this._logger?.logOutgoing(msg.byteLength, req, 1 /* OtherSide */, `ack`);
    this._protocol.send(msg);
    promise.then((r2) => {
      delete this._cancelInvokedHandlers[callId];
      const msg2 = MessageIO.serializeReplyOK(req, r2, this._uriReplacer);
      this._logger?.logOutgoing(msg2.byteLength, req, 1 /* OtherSide */, `reply:`, r2);
      this._protocol.send(msg2);
    }, (err) => {
      delete this._cancelInvokedHandlers[callId];
      const msg2 = MessageIO.serializeReplyErr(req, err);
      this._logger?.logOutgoing(msg2.byteLength, req, 1 /* OtherSide */, `replyErr:`, err);
      this._protocol.send(msg2);
    });
  }
  _receiveCancel(msgLength, req) {
    this._logger?.logIncoming(msgLength, req, 1 /* OtherSide */, `receiveCancel`);
    const callId = String(req);
    const cancel = this._cancelInvokedHandlers[callId];
    delete this._cancelInvokedHandlers[callId];
    cancel?.();
  }
  _receiveReply(msgLength, req, value2) {
    this._logger?.logIncoming(msgLength, req, 0 /* LocalSide */, `receiveReply:`, value2);
    const callId = String(req);
    if (!this._pendingRPCReplies.hasOwnProperty(callId)) {
      return;
    }
    const pendingReply = this._pendingRPCReplies[callId];
    delete this._pendingRPCReplies[callId];
    pendingReply.resolveOk(value2);
  }
  _receiveReplyErr(msgLength, req, value2) {
    this._logger?.logIncoming(msgLength, req, 0 /* LocalSide */, `receiveReplyErr:`, value2);
    const callId = String(req);
    if (!this._pendingRPCReplies.hasOwnProperty(callId)) {
      return;
    }
    const pendingReply = this._pendingRPCReplies[callId];
    delete this._pendingRPCReplies[callId];
    let err = void 0;
    if (value2) {
      if (value2.$isError) {
        err = new Error();
        err.name = value2.name;
        err.message = value2.message;
        err.stack = value2.stack;
      } else {
        err = value2;
      }
    }
    pendingReply.resolveErr(err);
  }
  _invokeHandler(rpcId, methodName, args2) {
    try {
      return Promise.resolve(this._doInvokeHandler(rpcId, methodName, args2));
    } catch (err) {
      return Promise.reject(err);
    }
  }
  _doInvokeHandler(rpcId, methodName, args2) {
    const actor = this._locals[rpcId];
    if (!actor) {
      throw new Error("Unknown actor " + getStringIdentifierForProxy(rpcId));
    }
    const method = actor[methodName];
    if (typeof method !== "function") {
      throw new Error("Unknown method " + methodName + " on actor " + getStringIdentifierForProxy(rpcId));
    }
    return method.apply(actor, args2);
  }
  _remoteCall(rpcId, methodName, args2) {
    if (this._isDisposed) {
      return new CanceledLazyPromise();
    }
    let cancellationToken = null;
    if (args2.length > 0 && CancellationToken.isCancellationToken(args2[args2.length - 1])) {
      cancellationToken = args2.pop();
    }
    if (cancellationToken && cancellationToken.isCancellationRequested) {
      return Promise.reject(canceled());
    }
    const serializedRequestArguments = MessageIO.serializeRequestArguments(args2, this._uriReplacer);
    const req = ++this._lastMessageId;
    const callId = String(req);
    const result = new LazyPromise();
    const disposable = new DisposableStore();
    if (cancellationToken) {
      disposable.add(cancellationToken.onCancellationRequested(() => {
        const msg2 = MessageIO.serializeCancel(req);
        this._logger?.logOutgoing(msg2.byteLength, req, 0 /* LocalSide */, `cancel`);
        this._protocol.send(msg2);
      }));
    }
    this._pendingRPCReplies[callId] = new PendingRPCReply(result, disposable);
    this._onWillSendRequest(req);
    const msg = MessageIO.serializeRequest(req, rpcId, methodName, serializedRequestArguments, !!cancellationToken);
    this._logger?.logOutgoing(msg.byteLength, req, 0 /* LocalSide */, `request: ${getStringIdentifierForProxy(rpcId)}.${methodName}(`, args2);
    this._protocol.send(msg);
    return result;
  }
};

var PendingRPCReply = class {
  constructor(_promise, _disposable) {
    this._promise = _promise;
    this._disposable = _disposable;
  }
  resolveOk(value2) {
    this._promise.resolveOk(value2);
    this._disposable.dispose();
  }
  resolveErr(err) {
    this._promise.resolveErr(err);
    this._disposable.dispose();
  }
};

var MessageBuffer = class _MessageBuffer {
  static alloc(type, req, messageSize) {
    const result = new _MessageBuffer(VSBuffer.alloc(
      messageSize + 1 + 4
      /* req */
    ), 0);
    result.writeUInt8(type);
    result.writeUInt32(req);
    return result;
  }
  static read(buff, offset) {
    return new _MessageBuffer(buff, offset);
  }
  get buffer() {
    return this._buff;
  }
  constructor(buff, offset) {
    this._buff = buff;
    this._offset = offset;
  }
  static sizeUInt8() {
    return 1;
  }
  static {
    this.sizeUInt32 = 4;
  }
  writeUInt8(n2) {
    this._buff.writeUInt8(n2, this._offset);
    this._offset += 1;
  }
  readUInt8() {
    const n2 = this._buff.readUInt8(this._offset);
    this._offset += 1;
    return n2;
  }
  writeUInt32(n2) {
    this._buff.writeUInt32BE(n2, this._offset);
    this._offset += 4;
  }
  readUInt32() {
    const n2 = this._buff.readUInt32BE(this._offset);
    this._offset += 4;
    return n2;
  }
  static sizeShortString(str) {
    return 1 + str.byteLength;
  }
  writeShortString(str) {
    this._buff.writeUInt8(str.byteLength, this._offset);
    this._offset += 1;
    this._buff.set(str, this._offset);
    this._offset += str.byteLength;
  }
  readShortString() {
    const strByteLength = this._buff.readUInt8(this._offset);
    this._offset += 1;
    const strBuff = this._buff.slice(this._offset, this._offset + strByteLength);
    const str = strBuff.toString();
    this._offset += strByteLength;
    return str;
  }
  static sizeLongString(str) {
    return 4 + str.byteLength;
  }
  writeLongString(str) {
    this._buff.writeUInt32BE(str.byteLength, this._offset);
    this._offset += 4;
    this._buff.set(str, this._offset);
    this._offset += str.byteLength;
  }
  readLongString() {
    const strByteLength = this._buff.readUInt32BE(this._offset);
    this._offset += 4;
    const strBuff = this._buff.slice(this._offset, this._offset + strByteLength);
    const str = strBuff.toString();
    this._offset += strByteLength;
    return str;
  }
  writeBuffer(buff) {
    this._buff.writeUInt32BE(buff.byteLength, this._offset);
    this._offset += 4;
    this._buff.set(buff, this._offset);
    this._offset += buff.byteLength;
  }
  static sizeVSBuffer(buff) {
    return 4 + buff.byteLength;
  }
  writeVSBuffer(buff) {
    this._buff.writeUInt32BE(buff.byteLength, this._offset);
    this._offset += 4;
    this._buff.set(buff, this._offset);
    this._offset += buff.byteLength;
  }
  readVSBuffer() {
    const buffLength = this._buff.readUInt32BE(this._offset);
    this._offset += 4;
    const buff = this._buff.slice(this._offset, this._offset + buffLength);
    this._offset += buffLength;
    return buff;
  }
  static sizeMixedArray(arr) {
    let size3 = 0;
    size3 += 1;
    for (let i2 = 0, len = arr.length; i2 < len; i2++) {
      const el = arr[i2];
      size3 += 1;
      switch (el.type) {
        case 1 /* String */:
          size3 += this.sizeLongString(el.value);
          break;
        case 2 /* VSBuffer */:
          size3 += this.sizeVSBuffer(el.value);
          break;
        case 3 /* SerializedObjectWithBuffers */:
          size3 += this.sizeUInt32;
          size3 += this.sizeLongString(el.value);
          for (let i3 = 0; i3 < el.buffers.length; ++i3) {
            size3 += this.sizeVSBuffer(el.buffers[i3]);
          }
          break;
        case 4 /* Undefined */:
          break;
      }
    }
    return size3;
  }
  writeMixedArray(arr) {
    this._buff.writeUInt8(arr.length, this._offset);
    this._offset += 1;
    for (let i2 = 0, len = arr.length; i2 < len; i2++) {
      const el = arr[i2];
      switch (el.type) {
        case 1 /* String */:
          this.writeUInt8(1 /* String */);
          this.writeLongString(el.value);
          break;
        case 2 /* VSBuffer */:
          this.writeUInt8(2 /* VSBuffer */);
          this.writeVSBuffer(el.value);
          break;
        case 3 /* SerializedObjectWithBuffers */:
          this.writeUInt8(3 /* SerializedObjectWithBuffers */);
          this.writeUInt32(el.buffers.length);
          this.writeLongString(el.value);
          for (let i3 = 0; i3 < el.buffers.length; ++i3) {
            this.writeBuffer(el.buffers[i3]);
          }
          break;
        case 4 /* Undefined */:
          this.writeUInt8(4 /* Undefined */);
          break;
      }
    }
  }
  readMixedArray() {
    const arrLen = this._buff.readUInt8(this._offset);
    this._offset += 1;
    const arr = new Array(arrLen);
    for (let i2 = 0; i2 < arrLen; i2++) {
      const argType = this.readUInt8();
      switch (argType) {
        case 1 /* String */:
          arr[i2] = this.readLongString();
          break;
        case 2 /* VSBuffer */:
          arr[i2] = this.readVSBuffer();
          break;
        case 3 /* SerializedObjectWithBuffers */: {
          const bufferCount = this.readUInt32();
          const jsonString = this.readLongString();
          const buffers = [];
          for (let i3 = 0; i3 < bufferCount; ++i3) {
            buffers.push(this.readVSBuffer());
          }
          arr[i2] = new SerializableObjectWithBuffers(parseJsonAndRestoreBufferRefs(jsonString, buffers, null));
          break;
        }
        case 4 /* Undefined */:
          arr[i2] = void 0;
          break;
      }
    }
    return arr;
  }
};

var MessageIO = class {
  static _useMixedArgSerialization(arr) {
    for (let i2 = 0, len = arr.length; i2 < len; i2++) {
      if (arr[i2] instanceof VSBuffer) {
        return true;
      }
      if (arr[i2] instanceof SerializableObjectWithBuffers) {
        return true;
      }
      if (typeof arr[i2] === "undefined") {
        return true;
      }
    }
    return false;
  }
  static serializeRequestArguments(args2, replacer2) {
    if (this._useMixedArgSerialization(args2)) {
      const massagedArgs = [];
      for (let i2 = 0, len = args2.length; i2 < len; i2++) {
        const arg = args2[i2];
        if (arg instanceof VSBuffer) {
          massagedArgs[i2] = { type: 2 /* VSBuffer */, value: arg };
        } else if (typeof arg === "undefined") {
          massagedArgs[i2] = { type: 4 /* Undefined */ };
        } else if (arg instanceof SerializableObjectWithBuffers) {
          const { jsonString, referencedBuffers } = stringifyJsonWithBufferRefs(arg.value, replacer2);
          massagedArgs[i2] = { type: 3 /* SerializedObjectWithBuffers */, value: VSBuffer.fromString(jsonString), buffers: referencedBuffers };
        } else {
          massagedArgs[i2] = { type: 1 /* String */, value: VSBuffer.fromString(stringify3(arg, replacer2)) };
        }
      }
      return {
        type: 1 /* Mixed */,
        args: massagedArgs
      };
    }
    return {
      type: 0 /* Simple */,
      args: stringify3(args2, replacer2)
    };
  }
  static serializeRequest(req, rpcId, method, serializedArgs, usesCancellationToken) {
    switch (serializedArgs.type) {
      case 0 /* Simple */:
        return this._requestJSONArgs(req, rpcId, method, serializedArgs.args, usesCancellationToken);
      case 1 /* Mixed */:
        return this._requestMixedArgs(req, rpcId, method, serializedArgs.args, usesCancellationToken);
    }
  }
  static _requestJSONArgs(req, rpcId, method, args2, usesCancellationToken) {
    const methodBuff = VSBuffer.fromString(method);
    const argsBuff = VSBuffer.fromString(args2);
    let len = 0;
    len += MessageBuffer.sizeUInt8();
    len += MessageBuffer.sizeShortString(methodBuff);
    len += MessageBuffer.sizeLongString(argsBuff);
    const result = MessageBuffer.alloc(usesCancellationToken ? 2 /* RequestJSONArgsWithCancellation */ : 1 /* RequestJSONArgs */, req, len);
    result.writeUInt8(rpcId);
    result.writeShortString(methodBuff);
    result.writeLongString(argsBuff);
    return result.buffer;
  }
  static deserializeRequestJSONArgs(buff) {
    const rpcId = buff.readUInt8();
    const method = buff.readShortString();
    const args2 = buff.readLongString();
    return {
      rpcId,
      method,
      args: JSON.parse(args2)
    };
  }
  static _requestMixedArgs(req, rpcId, method, args2, usesCancellationToken) {
    const methodBuff = VSBuffer.fromString(method);
    let len = 0;
    len += MessageBuffer.sizeUInt8();
    len += MessageBuffer.sizeShortString(methodBuff);
    len += MessageBuffer.sizeMixedArray(args2);
    const result = MessageBuffer.alloc(usesCancellationToken ? 4 /* RequestMixedArgsWithCancellation */ : 3 /* RequestMixedArgs */, req, len);
    result.writeUInt8(rpcId);
    result.writeShortString(methodBuff);
    result.writeMixedArray(args2);
    return result.buffer;
  }
  static deserializeRequestMixedArgs(buff) {
    const rpcId = buff.readUInt8();
    const method = buff.readShortString();
    const rawargs = buff.readMixedArray();
    const args2 = new Array(rawargs.length);
    for (let i2 = 0, len = rawargs.length; i2 < len; i2++) {
      const rawarg = rawargs[i2];
      if (typeof rawarg === "string") {
        args2[i2] = JSON.parse(rawarg);
      } else {
        args2[i2] = rawarg;
      }
    }
    return {
      rpcId,
      method,
      args: args2
    };
  }
  static serializeAcknowledged(req) {
    return MessageBuffer.alloc(5 /* Acknowledged */, req, 0).buffer;
  }
  static serializeCancel(req) {
    return MessageBuffer.alloc(6 /* Cancel */, req, 0).buffer;
  }
  static serializeReplyOK(req, res, replacer2) {
    if (typeof res === "undefined") {
      return this._serializeReplyOKEmpty(req);
    } else if (res instanceof VSBuffer) {
      return this._serializeReplyOKVSBuffer(req, res);
    } else if (res instanceof SerializableObjectWithBuffers) {
      const { jsonString, referencedBuffers } = stringifyJsonWithBufferRefs(res.value, replacer2, true);
      return this._serializeReplyOKJSONWithBuffers(req, jsonString, referencedBuffers);
    } else {
      return this._serializeReplyOKJSON(req, safeStringify3(res, replacer2));
    }
  }
  static _serializeReplyOKEmpty(req) {
    return MessageBuffer.alloc(7 /* ReplyOKEmpty */, req, 0).buffer;
  }
  static _serializeReplyOKVSBuffer(req, res) {
    let len = 0;
    len += MessageBuffer.sizeVSBuffer(res);
    const result = MessageBuffer.alloc(8 /* ReplyOKVSBuffer */, req, len);
    result.writeVSBuffer(res);
    return result.buffer;
  }
  static deserializeReplyOKVSBuffer(buff) {
    return buff.readVSBuffer();
  }
  static _serializeReplyOKJSON(req, res) {
    const resBuff = VSBuffer.fromString(res);
    let len = 0;
    len += MessageBuffer.sizeLongString(resBuff);
    const result = MessageBuffer.alloc(9 /* ReplyOKJSON */, req, len);
    result.writeLongString(resBuff);
    return result.buffer;
  }
  static _serializeReplyOKJSONWithBuffers(req, res, buffers) {
    const resBuff = VSBuffer.fromString(res);
    let len = 0;
    len += MessageBuffer.sizeUInt32;
    len += MessageBuffer.sizeLongString(resBuff);
    for (const buffer of buffers) {
      len += MessageBuffer.sizeVSBuffer(buffer);
    }
    const result = MessageBuffer.alloc(10 /* ReplyOKJSONWithBuffers */, req, len);
    result.writeUInt32(buffers.length);
    result.writeLongString(resBuff);
    for (const buffer of buffers) {
      result.writeBuffer(buffer);
    }
    return result.buffer;
  }
  static deserializeReplyOKJSON(buff) {
    const res = buff.readLongString();
    return JSON.parse(res);
  }
  static deserializeReplyOKJSONWithBuffers(buff, uriTransformer) {
    const bufferCount = buff.readUInt32();
    const res = buff.readLongString();
    const buffers = [];
    for (let i2 = 0; i2 < bufferCount; ++i2) {
      buffers.push(buff.readVSBuffer());
    }
    return new SerializableObjectWithBuffers(parseJsonAndRestoreBufferRefs(res, buffers, uriTransformer));
  }
  static serializeReplyErr(req, err) {
    const errStr = err ? safeStringify3(transformErrorForSerialization(err), null) : void 0;
    if (typeof errStr !== "string") {
      return this._serializeReplyErrEmpty(req);
    }
    const errBuff = VSBuffer.fromString(errStr);
    let len = 0;
    len += MessageBuffer.sizeLongString(errBuff);
    const result = MessageBuffer.alloc(11 /* ReplyErrError */, req, len);
    result.writeLongString(errBuff);
    return result.buffer;
  }
  static deserializeReplyErrError(buff) {
    const err = buff.readLongString();
    return JSON.parse(err);
  }
  static _serializeReplyErrEmpty(req) {
    return MessageBuffer.alloc(12 /* ReplyErrEmpty */, req, 0).buffer;
  }
};
export { safeStringify3, stringifyJsonWithBufferRefs, parseJsonAndRestoreBufferRefs, stringify3, createURIReplacer, refSymbolName, undefinedRef, _RPCProtocolSymbol, _RPCProxySymbol, _a5, _b2, RPCProtocol, PendingRPCReply, MessageBuffer, MessageIO };
