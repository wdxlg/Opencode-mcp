// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/parts/ipc/node/ipc.net.ts
import { init_path, join4 } from "./module-0008.mjs";
import { init_platform, platform } from "./module-0006.mjs";
import { Client, Protocol, SocketDiagnostics, init_ipc_net } from "./module-0056.mjs";
import { __esm } from "./module-0000.mjs";
import { VSBuffer, init_buffer } from "./module-0050.mjs";
import { init_errors, onUnexpectedError } from "./module-0010.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { init_uuid } from "./module-0055.mjs";
import { IPCServer, init_ipc } from "./module-0054.mjs";
import { WebSocketFrameParser, encodeWebSocketFrame, init_webSocketFraming } from "./module-0057.mjs";


// src/vs/base/parts/ipc/node/ipc.net.ts
import { createHash as createHash2 } from "crypto";

import { createConnection, createServer } from "net";

import { createDeflateRaw, createInflateRaw } from "zlib";

function upgradeToISocket(req, socket, {
  debugLabel,
  skipWebSocketFrames = false,
  disableWebSocketCompression = false,
  enableMessageSplitting = true
}) {
  if (req.headers.upgrade === void 0 || req.headers.upgrade.toLowerCase() !== "websocket") {
    socket.end("HTTP/1.1 400 Bad Request");
    return;
  }
  const requestNonce = req.headers["sec-websocket-key"];
  const hash2 = createHash2("sha1");
  hash2.update(requestNonce + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
  const responseNonce = hash2.digest("base64");
  const responseHeaders = [
    `HTTP/1.1 101 Switching Protocols`,
    `Upgrade: websocket`,
    `Connection: Upgrade`,
    `Sec-WebSocket-Accept: ${responseNonce}`
  ];
  let permessageDeflate = false;
  if (!skipWebSocketFrames && !disableWebSocketCompression && req.headers["sec-websocket-extensions"]) {
    const websocketExtensionOptions = Array.isArray(req.headers["sec-websocket-extensions"]) ? req.headers["sec-websocket-extensions"] : [req.headers["sec-websocket-extensions"]];
    for (const websocketExtensionOption of websocketExtensionOptions) {
      if (/\b((server_max_window_bits)|(server_no_context_takeover)|(client_no_context_takeover))\b/.test(websocketExtensionOption)) {
        continue;
      }
      if (/\b(permessage-deflate)\b/.test(websocketExtensionOption)) {
        permessageDeflate = true;
        responseHeaders.push(`Sec-WebSocket-Extensions: permessage-deflate`);
        break;
      }
      if (/\b(x-webkit-deflate-frame)\b/.test(websocketExtensionOption)) {
        permessageDeflate = true;
        responseHeaders.push(`Sec-WebSocket-Extensions: x-webkit-deflate-frame`);
        break;
      }
    }
  }
  socket.write(responseHeaders.join("\r\n") + "\r\n\r\n");
  socket.setTimeout(0);
  socket.setNoDelay(true);
  if (skipWebSocketFrames) {
    return new NodeSocket(socket, debugLabel);
  } else {
    return new WebSocketNodeSocket(new NodeSocket(socket, debugLabel), permessageDeflate, null, true, enableMessageSplitting);
  }
}

function createStaticIPCHandle(directoryPath, type3, version) {
  const scope = createHash2("sha256").update(directoryPath).digest("hex");
  const scopeForSocket = scope.substr(0, 8);
  if (process.platform === "win32") {
    return `\\\\.\\pipe\\${scopeForSocket}-${version}-${type3}-sock`;
  }
  const versionForSocket = version.substr(0, 4);
  const typeForSocket = type3.substr(0, 6);
  let result;
  if (process.platform !== "darwin" && XDG_RUNTIME_DIR && !process.env["VSCODE_PORTABLE"]) {
    result = join4(XDG_RUNTIME_DIR, `vscode-${scopeForSocket}-${versionForSocket}-${typeForSocket}.sock`);
  } else {
    result = join4(directoryPath, `${versionForSocket}-${typeForSocket}.sock`);
  }
  validateIPCHandleLength(result);
  return result;
}

function validateIPCHandleLength(handle) {
  const limit = safeIpcPathLengths[platform];
  if (typeof limit === "number" && handle.length >= limit) {
    console.warn(`WARNING: IPC handle "${handle}" is longer than ${limit} chars, try a shorter --user-data-dir`);
  }
}

function serve(hook) {
  return new Promise((resolve3, reject) => {
    const server = createServer();
    server.on("error", reject);
    server.listen(hook, () => {
      server.removeListener("error", reject);
      resolve3(new Server(server));
    });
  });
}

function connect(hook, clientId) {
  return new Promise((resolve3, reject) => {
    let socket;
    const callbackHandler = () => {
      socket.removeListener("error", reject);
      resolve3(Client.fromSocket(new NodeSocket(socket, `ipc-client${clientId}`), clientId));
    };
    if (typeof hook === "string") {
      socket = createConnection(hook, callbackHandler);
    } else {
      socket = createConnection(hook, callbackHandler);
    }
    socket.once("error", reject);
  });
}

var socketEndTimeoutMs, NodeSocket, WebSocketNodeSocket, WebSocketFlowManager, ZlibInflateStream, ZlibDeflateStream, XDG_RUNTIME_DIR, safeIpcPathLengths, Server;

var init_ipc_net2 = __esm({
  "src/vs/base/parts/ipc/node/ipc.net.ts"() {
    init_buffer();
    init_errors();
    init_event();
    init_lifecycle();
    init_path();
    init_platform();
    init_uuid();
    init_ipc();
    init_ipc_net();
    init_webSocketFraming();
    socketEndTimeoutMs = 3e4;
    NodeSocket = class {
      constructor(socket, debugLabel = "") {
        this._canWrite = true;
        this.debugLabel = debugLabel;
        this.socket = socket;
        this.traceSocketEvent("created" /* Created */, { type: "NodeSocket" });
        this._errorListener = (err) => {
          this.traceSocketEvent("error" /* Error */, { code: err?.code, message: err?.message });
          if (err) {
            if (err.code === "EPIPE") {
              return;
            }
            onUnexpectedError(err);
          }
        };
        this.socket.on("error", this._errorListener);
        this._closeListener = (hadError) => {
          this.traceSocketEvent("close" /* Close */, { hadError });
          this._canWrite = false;
          if (this._endTimeoutHandle) {
            clearTimeout(this._endTimeoutHandle);
          }
        };
        this.socket.on("close", this._closeListener);
        this._endListener = () => {
          this.traceSocketEvent("nodeEndReceived" /* NodeEndReceived */);
          this._canWrite = false;
          this._endTimeoutHandle = setTimeout(() => socket.destroy(), socketEndTimeoutMs);
        };
        this.socket.on("end", this._endListener);
      }
      traceSocketEvent(type3, data) {
        SocketDiagnostics.traceSocketEvent(this.socket, this.debugLabel, type3, data);
      }
      dispose(destroySocket = true) {
        if (this._endTimeoutHandle) {
          clearTimeout(this._endTimeoutHandle);
          this._endTimeoutHandle = void 0;
        }
        this.socket.off("error", this._errorListener);
        this.socket.off("close", this._closeListener);
        this.socket.off("end", this._endListener);
        if (destroySocket) {
          this.socket.destroy();
        }
      }
      onData(_listener) {
        const listener = (buff) => {
          this.traceSocketEvent("read" /* Read */, buff);
          _listener(VSBuffer.wrap(buff));
        };
        this.socket.on("data", listener);
        return {
          dispose: () => this.socket.off("data", listener)
        };
      }
      onClose(listener) {
        const adapter = (hadError) => {
          listener({
            type: 0 /* NodeSocketCloseEvent */,
            hadError,
            error: void 0
          });
        };
        this.socket.on("close", adapter);
        return {
          dispose: () => this.socket.off("close", adapter)
        };
      }
      onEnd(listener) {
        const adapter = () => {
          listener();
        };
        this.socket.on("end", adapter);
        return {
          dispose: () => this.socket.off("end", adapter)
        };
      }
      write(buffer) {
        if (this.socket.destroyed || !this._canWrite) {
          return;
        }
        try {
          this.traceSocketEvent("write" /* Write */, buffer);
          this.socket.write(buffer.buffer, (err) => {
            if (err) {
              if (err.code === "EPIPE") {
                return;
              }
              onUnexpectedError(err);
            }
          });
        } catch (err) {
          if (err.code === "EPIPE") {
            return;
          }
          onUnexpectedError(err);
        }
      }
      end() {
        this.traceSocketEvent("nodeEndSent" /* NodeEndSent */);
        this.socket.end();
      }
      drain() {
        this.traceSocketEvent("nodeDrainBegin" /* NodeDrainBegin */);
        return new Promise((resolve3, reject) => {
          if (this.socket.bufferSize === 0) {
            this.traceSocketEvent("nodeDrainEnd" /* NodeDrainEnd */);
            resolve3();
            return;
          }
          const finished = () => {
            this.socket.off("close", finished);
            this.socket.off("end", finished);
            this.socket.off("error", finished);
            this.socket.off("timeout", finished);
            this.socket.off("drain", finished);
            this.traceSocketEvent("nodeDrainEnd" /* NodeDrainEnd */);
            resolve3();
          };
          this.socket.on("close", finished);
          this.socket.on("end", finished);
          this.socket.on("error", finished);
          this.socket.on("timeout", finished);
          this.socket.on("drain", finished);
        });
      }
    };
    WebSocketNodeSocket = class extends Disposable {
      /**
       * Create a socket which can communicate using WebSocket frames.
       *
       * **NOTE**: When using the permessage-deflate WebSocket extension, if parts of inflating was done
       *  in a different zlib instance, we need to pass all those bytes into zlib, otherwise the inflate
       *  might hit an inflated portion referencing a distance too far back.
       *
       * @param socket The underlying socket
       * @param permessageDeflate Use the permessage-deflate WebSocket extension
       * @param inflateBytes "Seed" zlib inflate with these bytes.
       * @param recordInflateBytes Record all bytes sent to inflate
       */
      constructor(socket, permessageDeflate, inflateBytes, recordInflateBytes, enableMessageSplitting = true) {
        super();
        this._frameParser = new WebSocketFrameParser({ unmaskInPlace: true });
        this._onData = this._register(new Emitter());
        this._onClose = this._register(new Emitter());
        this._isEnded = false;
        this._compressedMessage = false;
        this.socket = socket;
        this._maxSocketMessageLength = enableMessageSplitting ? 262144 /* MaxWebSocketMessageLength */ : Infinity;
        this.traceSocketEvent("created" /* Created */, { type: "WebSocketNodeSocket", permessageDeflate, inflateBytesLength: inflateBytes?.byteLength || 0, recordInflateBytes });
        this._flowManager = this._register(new WebSocketFlowManager(
          this,
          permessageDeflate,
          inflateBytes,
          recordInflateBytes,
          this._onData,
          (data, options) => this._write(data, options)
        ));
        this._register(this._flowManager.onError((err) => {
          console.error(err);
          onUnexpectedError(err);
          this._onClose.fire({
            type: 0 /* NodeSocketCloseEvent */,
            hadError: true,
            error: err
          });
        }));
        this._register(this.socket.onData((data) => this._acceptChunk(data)));
        this._register(this.socket.onClose(async (e) => {
          if (this._flowManager.isProcessingReadQueue()) {
            await Event.toPromise(this._flowManager.onDidFinishProcessingReadQueue);
          }
          this._onClose.fire(e);
        }));
      }
      get permessageDeflate() {
        return this._flowManager.permessageDeflate;
      }
      get recordedInflateBytes() {
        return this._flowManager.recordedInflateBytes;
      }
      setRecordInflateBytes(record) {
        this._flowManager.setRecordInflateBytes(record);
      }
      traceSocketEvent(type3, data) {
        this.socket.traceSocketEvent(type3, data);
      }
      dispose() {
        if (this._flowManager.isProcessingWriteQueue()) {
          this._register(this._flowManager.onDidFinishProcessingWriteQueue(() => {
            this.dispose();
          }));
        } else {
          this.socket.dispose();
          super.dispose();
        }
      }
      onData(listener) {
        return this._onData.event(listener);
      }
      onClose(listener) {
        return this._onClose.event(listener);
      }
      onEnd(listener) {
        return this.socket.onEnd(listener);
      }
      write(buffer) {
        let start = 0;
        while (start < buffer.byteLength) {
          this._flowManager.writeMessage(buffer.slice(start, Math.min(start + this._maxSocketMessageLength, buffer.byteLength)), { compressed: true, opcode: 2 /* Binary */ });
          start += this._maxSocketMessageLength;
        }
      }
      _write(buffer, { compressed, opcode }) {
        if (this._isEnded) {
          return;
        }
        this.traceSocketEvent("webSocketNodeSocketWrite" /* WebSocketNodeSocketWrite */, buffer);
        this.socket.write(encodeWebSocketFrame(buffer, { compressed, opcode }));
      }
      end() {
        this._isEnded = true;
        this.socket.end();
      }
      _acceptChunk(data) {
        for (const frame of this._frameParser.acceptChunk(data)) {
          const compressed = frame.opcode === 0 /* Continuation */ ? this._compressedMessage : frame.compressed;
          if (frame.opcode === 1 /* Text */ || frame.opcode === 2 /* Binary */) {
            this._compressedMessage = frame.compressed;
          }
          this.traceSocketEvent("webSocketNodeSocketPeekedHeader" /* WebSocketNodeSocketPeekedHeader */, { bodySize: frame.payload.byteLength, compressed, fin: Number(frame.final), mask: frame.mask, opcode: frame.opcode });
          this.traceSocketEvent("webSocketNodeSocketReadData" /* WebSocketNodeSocketReadData */, frame.payload);
          if (frame.mask !== void 0) {
            this.traceSocketEvent("webSocketNodeSocketUnmaskedData" /* WebSocketNodeSocketUnmaskedData */, frame.payload);
          }
          if (frame.opcode === 0 /* Continuation */ || frame.opcode === 1 /* Text */ || frame.opcode === 2 /* Binary */) {
            this._flowManager.acceptFrame(frame.payload, compressed, frame.final);
            if (frame.final) {
              this._compressedMessage = false;
            }
          } else if (frame.opcode === 9 /* Ping */) {
            this._flowManager.writeMessage(frame.payload, { compressed: false, opcode: 10 /* Pong */ });
          }
        }
      }
      async drain() {
        this.traceSocketEvent("webSocketNodeSocketDrainBegin" /* WebSocketNodeSocketDrainBegin */);
        if (this._flowManager.isProcessingWriteQueue()) {
          await Event.toPromise(this._flowManager.onDidFinishProcessingWriteQueue);
        }
        await this.socket.drain();
        this.traceSocketEvent("webSocketNodeSocketDrainEnd" /* WebSocketNodeSocketDrainEnd */);
      }
    };
    WebSocketFlowManager = class extends Disposable {
      constructor(_tracer, permessageDeflate, inflateBytes, recordInflateBytes, _onData, _writeFn) {
        super();
        this._tracer = _tracer;
        this._onData = _onData;
        this._writeFn = _writeFn;
        this._onError = this._register(new Emitter());
        this.onError = this._onError.event;
        this._writeQueue = [];
        this._readQueue = [];
        this._onDidFinishProcessingReadQueue = this._register(new Emitter());
        this.onDidFinishProcessingReadQueue = this._onDidFinishProcessingReadQueue.event;
        this._onDidFinishProcessingWriteQueue = this._register(new Emitter());
        this.onDidFinishProcessingWriteQueue = this._onDidFinishProcessingWriteQueue.event;
        this._isProcessingWriteQueue = false;
        this._isProcessingReadQueue = false;
        if (permessageDeflate) {
          this._zlibInflateStream = this._register(new ZlibInflateStream(this._tracer, recordInflateBytes, inflateBytes, { windowBits: 15 }));
          this._zlibDeflateStream = this._register(new ZlibDeflateStream(this._tracer, { windowBits: 15 }));
          this._register(this._zlibInflateStream.onError((err) => this._onError.fire(err)));
          this._register(this._zlibDeflateStream.onError((err) => this._onError.fire(err)));
        } else {
          this._zlibInflateStream = null;
          this._zlibDeflateStream = null;
        }
      }
      get permessageDeflate() {
        return Boolean(this._zlibInflateStream && this._zlibDeflateStream);
      }
      get recordedInflateBytes() {
        if (this._zlibInflateStream) {
          return this._zlibInflateStream.recordedInflateBytes;
        }
        return VSBuffer.alloc(0);
      }
      setRecordInflateBytes(record) {
        this._zlibInflateStream?.setRecordInflateBytes(record);
      }
      writeMessage(data, options) {
        this._writeQueue.push({ data, options });
        this._processWriteQueue();
      }
      async _processWriteQueue() {
        if (this._isProcessingWriteQueue) {
          return;
        }
        this._isProcessingWriteQueue = true;
        while (this._writeQueue.length > 0) {
          const { data, options } = this._writeQueue.shift();
          if (this._zlibDeflateStream && options.compressed) {
            const compressedData = await this._deflateMessage(this._zlibDeflateStream, data);
            this._writeFn(compressedData, options);
          } else {
            this._writeFn(data, { ...options, compressed: false });
          }
        }
        this._isProcessingWriteQueue = false;
        this._onDidFinishProcessingWriteQueue.fire();
      }
      isProcessingWriteQueue() {
        return this._isProcessingWriteQueue;
      }
      /**
       * Subsequent calls should wait for the previous `_deflateBuffer` call to complete.
       */
      _deflateMessage(zlibDeflateStream, buffer) {
        return new Promise((resolve3, reject) => {
          zlibDeflateStream.write(buffer);
          zlibDeflateStream.flush((data) => resolve3(data));
        });
      }
      acceptFrame(data, isCompressed, isLastFrameOfMessage) {
        this._readQueue.push({ data, isCompressed, isLastFrameOfMessage });
        this._processReadQueue();
      }
      async _processReadQueue() {
        if (this._isProcessingReadQueue) {
          return;
        }
        this._isProcessingReadQueue = true;
        while (this._readQueue.length > 0) {
          const frameInfo = this._readQueue.shift();
          if (this._zlibInflateStream && frameInfo.isCompressed) {
            const data = await this._inflateFrame(this._zlibInflateStream, frameInfo.data, frameInfo.isLastFrameOfMessage);
            this._onData.fire(data);
          } else {
            this._onData.fire(frameInfo.data);
          }
        }
        this._isProcessingReadQueue = false;
        this._onDidFinishProcessingReadQueue.fire();
      }
      isProcessingReadQueue() {
        return this._isProcessingReadQueue;
      }
      /**
       * Subsequent calls should wait for the previous `transformRead` call to complete.
       */
      _inflateFrame(zlibInflateStream, buffer, isLastFrameOfMessage) {
        return new Promise((resolve3, reject) => {
          zlibInflateStream.write(buffer);
          if (isLastFrameOfMessage) {
            zlibInflateStream.write(VSBuffer.fromByteArray([0, 0, 255, 255]));
          }
          zlibInflateStream.flush((data) => resolve3(data));
        });
      }
    };
    ZlibInflateStream = class extends Disposable {
      constructor(_tracer, recordInflateBytes, inflateBytes, options) {
        super();
        this._tracer = _tracer;
        this._onError = this._register(new Emitter());
        this.onError = this._onError.event;
        this._recordedInflateBytes = [];
        this._pendingInflateData = [];
        this._recordInflateBytes = recordInflateBytes;
        this._zlibInflate = createInflateRaw(options);
        this._zlibInflate.on("error", (err) => {
          this._tracer.traceSocketEvent("zlibInflateError" /* zlibInflateError */, { message: err?.message, code: err?.code });
          this._onError.fire(err);
        });
        this._zlibInflate.on("data", (data) => {
          this._tracer.traceSocketEvent("zlibInflateData" /* zlibInflateData */, data);
          this._pendingInflateData.push(VSBuffer.wrap(data));
        });
        if (inflateBytes) {
          this._tracer.traceSocketEvent("zlibInflateInitialWrite" /* zlibInflateInitialWrite */, inflateBytes.buffer);
          this._zlibInflate.write(inflateBytes.buffer);
          this._zlibInflate.flush(() => {
            this._tracer.traceSocketEvent("zlibInflateInitialFlushFired" /* zlibInflateInitialFlushFired */);
            this._pendingInflateData.length = 0;
          });
        }
      }
      get recordedInflateBytes() {
        if (this._recordInflateBytes) {
          return VSBuffer.concat(this._recordedInflateBytes);
        }
        return VSBuffer.alloc(0);
      }
      write(buffer) {
        if (this._recordInflateBytes) {
          this._recordedInflateBytes.push(buffer.clone());
        }
        this._tracer.traceSocketEvent("zlibInflateWrite" /* zlibInflateWrite */, buffer);
        this._zlibInflate.write(buffer.buffer);
      }
      setRecordInflateBytes(record) {
        this._recordInflateBytes = record;
        if (!record) {
          this._recordedInflateBytes.length = 0;
        }
      }
      flush(callback) {
        this._zlibInflate.flush(() => {
          this._tracer.traceSocketEvent("zlibInflateFlushFired" /* zlibInflateFlushFired */);
          const data = VSBuffer.concat(this._pendingInflateData);
          this._pendingInflateData.length = 0;
          callback(data);
        });
      }
      dispose() {
        this._recordedInflateBytes.length = 0;
        this._pendingInflateData.length = 0;
        try {
          this._zlibInflate.close();
        } catch {
        }
        super.dispose();
      }
    };
    ZlibDeflateStream = class extends Disposable {
      constructor(_tracer, options) {
        super();
        this._tracer = _tracer;
        this._onError = this._register(new Emitter());
        this.onError = this._onError.event;
        this._pendingDeflateData = [];
        this._zlibDeflate = createDeflateRaw({
          windowBits: 15
        });
        this._zlibDeflate.on("error", (err) => {
          this._tracer.traceSocketEvent("zlibDeflateError" /* zlibDeflateError */, { message: err?.message, code: err?.code });
          this._onError.fire(err);
        });
        this._zlibDeflate.on("data", (data) => {
          this._tracer.traceSocketEvent("zlibDeflateData" /* zlibDeflateData */, data);
          this._pendingDeflateData.push(VSBuffer.wrap(data));
        });
      }
      write(buffer) {
        this._tracer.traceSocketEvent("zlibDeflateWrite" /* zlibDeflateWrite */, buffer.buffer);
        this._zlibDeflate.write(buffer.buffer);
      }
      flush(callback) {
        this._zlibDeflate.flush(
          /*Z_SYNC_FLUSH*/
          2,
          () => {
            this._tracer.traceSocketEvent("zlibDeflateFlushFired" /* zlibDeflateFlushFired */);
            let data = VSBuffer.concat(this._pendingDeflateData);
            this._pendingDeflateData.length = 0;
            data = data.slice(0, data.byteLength - 4);
            callback(data);
          }
        );
      }
      dispose() {
        this._pendingDeflateData.length = 0;
        try {
          this._zlibDeflate.close();
        } catch {
        }
        super.dispose();
      }
    };
    XDG_RUNTIME_DIR = process.env["XDG_RUNTIME_DIR"];
    safeIpcPathLengths = {
      [2 /* Linux */]: 107,
      [1 /* Mac */]: 103
    };
    Server = class _Server extends IPCServer {
      static toClientConnectionEvent(server) {
        const onConnection = Event.fromNodeEventEmitter(server, "connection");
        return Event.map(onConnection, (socket) => ({
          protocol: new Protocol(new NodeSocket(socket, "ipc-server-connection")),
          onDidClientDisconnect: Event.once(Event.fromNodeEventEmitter(socket, "close"))
        }));
      }
      constructor(server) {
        super(_Server.toClientConnectionEvent(server));
        this.server = server;
      }
      dispose() {
        super.dispose();
        if (this.server) {
          this.server.close();
          this.server = null;
        }
      }
    };
  }
});
export { upgradeToISocket, createStaticIPCHandle, validateIPCHandleLength, serve, connect, createHash2, createConnection, createServer, createDeflateRaw, createInflateRaw, socketEndTimeoutMs, NodeSocket, WebSocketNodeSocket, WebSocketFlowManager, ZlibInflateStream, ZlibDeflateStream, XDG_RUNTIME_DIR, safeIpcPathLengths, Server, init_ipc_net2 };
