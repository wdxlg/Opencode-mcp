// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/reconnectingTransport.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/platform/agentHost/common/reconnectingTransport.ts
var EstablishedTransportStore = class extends DisposableStore {
  constructor(transport) {
    super();
    this.transport = transport;
  }
};

var ReconnectingTransport = class extends Disposable {
  constructor(_establish, _logService, _logPrefix, clientConnectionKind = void 0, _sendBeforeConnectWarning = "send before the transport was established; dropping message") {
    super();
    this._establish = _establish;
    this._logService = _logService;
    this._logPrefix = _logPrefix;
    this.clientConnectionKind = clientConnectionKind;
    this._sendBeforeConnectWarning = _sendBeforeConnectWarning;
    this._onMessage = this._register(new Emitter());
    this.onMessage = this._onMessage.event;
    this._onClose = this._register(new Emitter());
    this.onClose = this._onClose.event;
    this._establishedTransport = this._register(new MutableDisposable());
  }
  /** Establishes and adopts the inner transport. */
  connect() {
    if (this._store.isDisposed) {
      return Promise.reject(new Error("Transport is disposed"));
    }
    this._connectPromise ??= this._establishTransport();
    return this._connectPromise;
  }
  /** Routes a protocol message through the established inner transport. */
  send(message) {
    const establishedTransport = this._establishedTransport.value;
    if (!establishedTransport) {
      this._logService.warn(`${this._logPrefix} ${this._sendBeforeConnectWarning}`);
      return;
    }
    establishedTransport.transport.send(message);
  }
  async _establishTransport() {
    const establishedTransport = await this._establish();
    if (this._store.isDisposed) {
      await this._disposeEstablishedTransport(establishedTransport);
      throw new Error(`${this._logPrefix} transport was disposed while establishing`);
    }
    const transportStore = new EstablishedTransportStore(establishedTransport.transport);
    transportStore.add(toDisposable(() => void this._disposeEstablishedTransport(establishedTransport)));
    try {
      transportStore.add(establishedTransport.transport.onMessage((message) => this._onMessage.fire(message)));
      transportStore.add(establishedTransport.transport.onClose(() => this._onClose.fire()));
      this._establishedTransport.value = transportStore;
    } catch (err) {
      transportStore.dispose();
      throw err;
    }
  }
  async _disposeEstablishedTransport(establishedTransport) {
    try {
      establishedTransport.transport.dispose();
    } catch (err) {
      this._logService.error(`${this._logPrefix} inner transport dispose failed`, err);
    }
    try {
      await establishedTransport.close?.();
    } catch (err) {
      this._logService.error(`${this._logPrefix} transport close failed`, err);
    }
  }
};
export { EstablishedTransportStore, ReconnectingTransport };
