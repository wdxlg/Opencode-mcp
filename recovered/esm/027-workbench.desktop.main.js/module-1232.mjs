// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/remote/common/managedSocket.ts
import { VSBuffer, encodeBase64 } from "./module-0038.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter, PauseableEmitter } from "./module-0017.mjs";
import { SocketDiagnostics } from "./module-1231.mjs";


// src/vs/platform/remote/common/managedSocket.ts
var makeRawSocketHeaders = (path, query, deubgLabel) => {
  const buffer = new Uint8Array(16);
  for (let i2 = 0; i2 < 16; i2++) {
    buffer[i2] = Math.round(Math.random() * 256);
  }
  const nonce = encodeBase64(VSBuffer.wrap(buffer));
  const headers = [
    `GET ws://localhost${path}?${query}&skipWebSocketFrames=true HTTP/1.1`,
    `Connection: Upgrade`,
    `Upgrade: websocket`,
    `Sec-WebSocket-Key: ${nonce}`
  ];
  return headers.join("\r\n") + "\r\n\r\n";
};

var socketRawEndHeaderSequence = VSBuffer.fromString("\r\n\r\n");

async function connectManagedSocket(socket, path, query, debugLabel, half) {
  socket.write(VSBuffer.fromString(makeRawSocketHeaders(path, query, debugLabel)));
  const d = new DisposableStore();
  try {
    return await new Promise((resolve3, reject) => {
      let dataSoFar;
      d.add(socket.onData((d_1) => {
        if (!dataSoFar) {
          dataSoFar = d_1;
        } else {
          dataSoFar = VSBuffer.concat([dataSoFar, d_1], dataSoFar.byteLength + d_1.byteLength);
        }
        const index2 = dataSoFar.indexOf(socketRawEndHeaderSequence);
        if (index2 === -1) {
          return;
        }
        resolve3(socket);
        socket.pauseData();
        const rest = dataSoFar.slice(index2 + socketRawEndHeaderSequence.byteLength);
        if (rest.byteLength) {
          half.onData.fire(rest);
        }
      }));
      d.add(socket.onClose((err) => reject(err ?? new Error("socket closed"))));
      d.add(socket.onEnd(() => reject(new Error("socket ended"))));
    });
  } catch (e) {
    socket.dispose();
    throw e;
  } finally {
    d.dispose();
  }
}

var ManagedSocket = class extends Disposable {
  constructor(debugLabel, half) {
    super();
    this.debugLabel = debugLabel;
    this.pausableDataEmitter = this._register(new PauseableEmitter());
    this.onData = (...args2) => {
      if (this.pausableDataEmitter.isPaused) {
        queueMicrotask(() => this.pausableDataEmitter.resume());
      }
      return this.pausableDataEmitter.event(...args2);
    };
    this.didDisposeEmitter = this._register(new Emitter());
    this.onDidDispose = this.didDisposeEmitter.event;
    this.ended = false;
    this._register(half.onData);
    this._register(half.onData.event((data) => this.pausableDataEmitter.fire(data)));
    this.onClose = this._register(half.onClose).event;
    this.onEnd = this._register(half.onEnd).event;
  }
  /** Pauses data events until a new listener comes in onData() */
  pauseData() {
    this.pausableDataEmitter.pause();
  }
  /** Flushes data to the socket. */
  drain() {
    return Promise.resolve();
  }
  /** Ends the remote socket. */
  end() {
    this.ended = true;
    this.closeRemote();
  }
  traceSocketEvent(type, data) {
    SocketDiagnostics.traceSocketEvent(this, this.debugLabel, type, data);
  }
  dispose() {
    if (!this.ended) {
      this.closeRemote();
    }
    this.didDisposeEmitter.fire();
    super.dispose();
  }
};
export { connectManagedSocket, makeRawSocketHeaders, socketRawEndHeaderSequence, ManagedSocket };
