// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/browser/webSocketClientTransport.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { AhpJsonlLogger, getAhpLogByteLength } from "./module-3921.mjs";
import { connectionTokenQueryName } from "./module-0033.mjs";
import { MALFORMED_FRAMES_FORCE_CLOSE_THRESHOLD, MALFORMED_FRAMES_LOG_CAP } from "./module-3922.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/platform/agentHost/browser/webSocketClientTransport.ts
var WebSocketClientTransport = class extends Disposable {
  constructor(_address, _connectionToken, ahpLogOptions, instantiationService) {
    super();
    this._address = _address;
    this._connectionToken = _connectionToken;
    this.clientConnectionKind = "direct_websocket" /* DirectWebSocket */;
    this._onMessage = this._register(new Emitter());
    this.onMessage = this._onMessage.event;
    this._onClose = this._register(new Emitter());
    this.onClose = this._onClose.event;
    this._onOpen = this._register(new Emitter());
    this.onOpen = this._onOpen.event;
    this._malformedFrames = 0;
    /** Guards against firing onClose more than once. */
    this._closeFired = false;
    if (ahpLogOptions) {
      this._ahpLogger = this._register(instantiationService.createInstance(AhpJsonlLogger, ahpLogOptions));
    }
  }
  get isOpen() {
    return this._ws?.readyState === WebSocket.OPEN;
  }
  /**
   * Initiate the WebSocket connection. Resolves when the connection
   * is open, or rejects on error/timeout.
   */
  connect() {
    return new Promise((resolve3, reject) => {
      if (this._store.isDisposed) {
        reject(new Error("Transport is disposed"));
        return;
      }
      let url = this._address.startsWith("ws://") || this._address.startsWith("wss://") ? this._address : `ws://${this._address}`;
      if (this._connectionToken) {
        const separator2 = url.includes("?") ? "&" : "?";
        url += `${separator2}${connectionTokenQueryName}=${encodeURIComponent(this._connectionToken)}`;
      }
      const ws = new WebSocket(url);
      this._ws = ws;
      const onOpen = () => {
        cleanup();
        this._onOpen.fire();
        resolve3();
      };
      const onError = () => {
        cleanup();
        reject(new Error(`WebSocket connection failed: ${this._address}`));
      };
      const onClose = () => {
        cleanup();
        reject(new Error(`WebSocket closed before connection was established: ${this._address}`));
      };
      const cleanup = () => {
        ws.removeEventListener("open", onOpen);
        ws.removeEventListener("error", onError);
        ws.removeEventListener("close", onClose);
      };
      ws.addEventListener("open", onOpen);
      ws.addEventListener("error", onError);
      ws.addEventListener("close", onClose);
      ws.addEventListener("message", (event) => {
        if (typeof event.data !== "string") {
          this._malformedFrames++;
          if (this._malformedFrames <= MALFORMED_FRAMES_LOG_CAP) {
            const dataType = event.data instanceof ArrayBuffer ? "ArrayBuffer" : event.data instanceof Blob ? "Blob" : typeof event.data;
            const byteLen = event.data instanceof ArrayBuffer ? event.data.byteLength : event.data instanceof Blob ? event.data.size : 0;
            console.warn(
              `[WebSocketClientTransport] Non-string frame #${this._malformedFrames} (type=${dataType}, bytes=${byteLen})`
            );
          }
          if (this._malformedFrames > MALFORMED_FRAMES_FORCE_CLOSE_THRESHOLD) {
            console.warn(
              `[WebSocketClientTransport] Malformed frame threshold exceeded; forcing close of ${this._address}.`
            );
            this._ws?.close(4002, "malformed-frames");
          }
          return;
        }
        const text2 = event.data;
        let message;
        try {
          message = JSON.parse(text2);
        } catch (err) {
          this._malformedFrames++;
          if (this._malformedFrames <= MALFORMED_FRAMES_LOG_CAP) {
            const preview = text2.length > 80 ? text2.slice(0, 80) + "\u2026" : text2;
            console.warn(
              `[WebSocketClientTransport] Malformed frame #${this._malformedFrames} (len=${text2.length}): ${preview}`,
              err instanceof Error ? err.message : String(err)
            );
          }
          if (this._malformedFrames > MALFORMED_FRAMES_FORCE_CLOSE_THRESHOLD) {
            console.warn(
              `[WebSocketClientTransport] Malformed frame threshold exceeded; forcing close of ${this._address}.`
            );
            this._ws?.close(4002, "malformed-frames");
          }
          return;
        }
        this._ahpLogger?.log(message, "s2c", getAhpLogByteLength(text2));
        this._onMessage.fire(message);
      });
      ws.addEventListener("close", () => {
        if (!this._closeFired) {
          this._closeFired = true;
          this._onClose.fire();
        }
      });
      ws.addEventListener("error", () => {
        if (!this._closeFired) {
          this._closeFired = true;
          this._onClose.fire();
        }
      });
    });
  }
  /**
   * Send a message to the remote end. Returns `true` if the message was
   * sent, `false` if it was dropped (socket not open). On failure, the
   * transport is force-closed so reconnection is triggered immediately
   * rather than silently losing messages.
   */
  send(message) {
    if (this._ws?.readyState === WebSocket.OPEN) {
      const text2 = JSON.stringify(message);
      this._ahpLogger?.log(message, "c2s", getAhpLogByteLength(text2));
      this._ws.send(text2);
      return true;
    }
    console.warn(
      `[WebSocketClientTransport] Message dropped: readyState=${this._ws?.readyState ?? "no-socket"}`
    );
    this._ws?.close(4001, "send-on-dead-socket");
    if (!this._closeFired) {
      this._closeFired = true;
      this._onClose.fire();
    }
    return false;
  }
  dispose() {
    this._ws?.close();
    super.dispose();
  }
};

WebSocketClientTransport = __decorateClass([
  __decorateParam(3, IInstantiationService)
], WebSocketClientTransport);
export { WebSocketClientTransport };
