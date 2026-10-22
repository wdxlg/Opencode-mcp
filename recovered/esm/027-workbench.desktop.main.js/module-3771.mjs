// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/remote/browser/browserSocketFactory.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { addDisposableListener } from "./module-0075.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { RemoteAuthorityResolverError } from "./module-0894.mjs";
import { SocketDiagnostics } from "./module-1231.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/platform/remote/browser/browserSocketFactory.ts
var BrowserWebSocket = class extends Disposable {
  constructor(url, debugLabel) {
    super();
    this._onData = this._register(new Emitter());
    this.onData = this._onData.event;
    this._onOpen = this._register(new Emitter());
    this.onOpen = this._onOpen.event;
    this._onClose = this._register(new Emitter());
    this.onClose = this._onClose.event;
    this._onError = this._register(new Emitter());
    this.onError = this._onError.event;
    this._debugLabel = debugLabel;
    this._socket = new WebSocket(url);
    this.traceSocketEvent("created" /* Created */, { type: "BrowserWebSocket", url });
    this._fileReader = new FileReader();
    this._queue = [];
    this._isReading = false;
    this._isClosed = false;
    this._fileReader.onload = (event) => {
      this._isReading = false;
      const buff = event.target.result;
      this.traceSocketEvent("read" /* Read */, buff);
      this._onData.fire(buff);
      if (this._queue.length > 0) {
        enqueue(this._queue.shift());
      }
    };
    const enqueue = (blob) => {
      if (this._isReading) {
        this._queue.push(blob);
        return;
      }
      this._isReading = true;
      this._fileReader.readAsArrayBuffer(blob);
    };
    this._socketMessageListener = (ev) => {
      const blob = ev.data;
      this.traceSocketEvent("browserWebSocketBlobReceived" /* BrowserWebSocketBlobReceived */, { type: blob.type, size: blob.size });
      enqueue(blob);
    };
    this._socket.addEventListener("message", this._socketMessageListener);
    this._register(addDisposableListener(this._socket, "open", (e) => {
      this.traceSocketEvent("open" /* Open */);
      this._onOpen.fire();
    }));
    let pendingErrorEvent = null;
    const sendPendingErrorNow = () => {
      const err = pendingErrorEvent;
      pendingErrorEvent = null;
      this._onError.fire(err);
    };
    const errorRunner = this._register(new RunOnceScheduler(sendPendingErrorNow, 0));
    const sendErrorSoon = (err) => {
      errorRunner.cancel();
      pendingErrorEvent = err;
      errorRunner.schedule();
    };
    const sendErrorNow = (err) => {
      errorRunner.cancel();
      pendingErrorEvent = err;
      sendPendingErrorNow();
    };
    this._register(addDisposableListener(this._socket, "close", (e) => {
      this.traceSocketEvent("close" /* Close */, { code: e.code, reason: e.reason, wasClean: e.wasClean });
      this._isClosed = true;
      if (pendingErrorEvent) {
        if (!navigator.onLine) {
          sendErrorNow(new RemoteAuthorityResolverError("Browser is offline", "TemporarilyNotAvailable" /* TemporarilyNotAvailable */, e));
        } else {
          if (!e.wasClean) {
            sendErrorNow(new RemoteAuthorityResolverError(e.reason || `WebSocket close with status code ${e.code}`, "TemporarilyNotAvailable" /* TemporarilyNotAvailable */, e));
          } else {
            errorRunner.cancel();
            sendPendingErrorNow();
          }
        }
      }
      this._onClose.fire({ code: e.code, reason: e.reason, wasClean: e.wasClean, event: e });
    }));
    this._register(addDisposableListener(this._socket, "error", (err) => {
      this.traceSocketEvent("error" /* Error */, { message: err?.message });
      sendErrorSoon(err);
    }));
  }
  traceSocketEvent(type, data) {
    SocketDiagnostics.traceSocketEvent(this._socket, this._debugLabel, type, data);
  }
  send(data) {
    if (this._isClosed) {
      return;
    }
    this.traceSocketEvent("write" /* Write */, data);
    this._socket.send(data);
  }
  close() {
    this._isClosed = true;
    this.traceSocketEvent("close" /* Close */);
    this._socket.close();
    this._socket.removeEventListener("message", this._socketMessageListener);
    this.dispose();
  }
};

var defaultWebSocketFactory = new class {
  create(url, debugLabel) {
    return new BrowserWebSocket(url, debugLabel);
  }
}();

var BrowserSocket = class {
  traceSocketEvent(type, data) {
    if (typeof this.socket.traceSocketEvent === "function") {
      this.socket.traceSocketEvent(type, data);
    } else {
      SocketDiagnostics.traceSocketEvent(this.socket, this.debugLabel, type, data);
    }
  }
  constructor(socket, debugLabel) {
    this.socket = socket;
    this.debugLabel = debugLabel;
  }
  dispose() {
    this.socket.close();
  }
  onData(listener) {
    return this.socket.onData((data) => listener(VSBuffer.wrap(new Uint8Array(data))));
  }
  onClose(listener) {
    const adapter = (e) => {
      if (typeof e === "undefined") {
        listener(e);
      } else {
        listener({
          type: 1 /* WebSocketCloseEvent */,
          code: e.code,
          reason: e.reason,
          wasClean: e.wasClean,
          event: e.event
        });
      }
    };
    return this.socket.onClose(adapter);
  }
  onEnd(listener) {
    return Disposable.None;
  }
  write(buffer) {
    this.socket.send(buffer.buffer);
  }
  end() {
    this.socket.close();
  }
  drain() {
    return Promise.resolve();
  }
};

var BrowserSocketFactory = class {
  constructor(webSocketFactory) {
    this._webSocketFactory = webSocketFactory || defaultWebSocketFactory;
  }
  supports(connectTo) {
    return true;
  }
  connect({ host, port }, path, query, debugLabel) {
    return new Promise((resolve3, reject) => {
      const webSocketSchema = /^https:/.test(mainWindow.location.href) ? "wss" : "ws";
      const socket = this._webSocketFactory.create(`${webSocketSchema}://${/:/.test(host) && !/\[/.test(host) ? `[${host}]` : host}:${port}${path}?${query}&skipWebSocketFrames=false`, debugLabel);
      const disposables = new DisposableStore();
      disposables.add(socket.onError(reject));
      disposables.add(socket.onOpen(() => {
        disposables.dispose();
        resolve3(new BrowserSocket(socket, debugLabel));
      }));
    });
  }
};
export { BrowserWebSocket, defaultWebSocketFactory, BrowserSocket, BrowserSocketFactory };
