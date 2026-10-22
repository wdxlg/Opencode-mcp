// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/electron-browser/localPty.ts
import { BasePty } from "./module-3032.mjs";


// src/vs/workbench/contrib/terminal/electron-browser/localPty.ts
var LocalPty = class extends BasePty {
  constructor(id2, shouldPersist, _proxy) {
    super(id2, shouldPersist);
    this._proxy = _proxy;
  }
  start() {
    return this._proxy.start(this.id);
  }
  detach(forcePersist) {
    return this._proxy.detachFromProcess(this.id, forcePersist);
  }
  shutdown(immediate) {
    this._proxy.shutdown(this.id, immediate);
  }
  async processBinary(data) {
    if (this._inReplay) {
      return;
    }
    return this._proxy.processBinary(this.id, data);
  }
  input(data) {
    if (this._inReplay) {
      return;
    }
    this._proxy.input(this.id, data);
  }
  sendSignal(signal) {
    if (this._inReplay) {
      return;
    }
    this._proxy.sendSignal(this.id, signal);
  }
  resize(cols, rows, pixelWidth, pixelHeight) {
    if (this._inReplay || this._lastDimensions.cols === cols && this._lastDimensions.rows === rows) {
      return;
    }
    this._lastDimensions.cols = cols;
    this._lastDimensions.rows = rows;
    this._proxy.resize(this.id, cols, rows, pixelWidth, pixelHeight);
  }
  async clearBuffer() {
    this._proxy.clearBuffer?.(this.id);
  }
  freePortKillProcess(port) {
    if (!this._proxy.freePortKillProcess) {
      throw new Error("freePortKillProcess does not exist on the local pty service");
    }
    return this._proxy.freePortKillProcess(port);
  }
  async refreshProperty(type) {
    return this._proxy.refreshProperty(this.id, type);
  }
  async updateProperty(type, value2) {
    return this._proxy.updateProperty(this.id, type, value2);
  }
  acknowledgeDataEvent(charCount) {
    if (this._inReplay) {
      return;
    }
    this._proxy.acknowledgeDataEvent(this.id, charCount);
  }
  setUnicodeVersion(version2) {
    return this._proxy.setUnicodeVersion(this.id, version2);
  }
  handleOrphanQuestion() {
    this._proxy.orphanQuestionReply(this.id);
  }
};
export { LocalPty };
