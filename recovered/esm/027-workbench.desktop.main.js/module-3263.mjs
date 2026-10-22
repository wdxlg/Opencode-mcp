// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/remotePty.ts
import { BasePty } from "./module-2885.mjs";
import { Barrier } from "./module-0036.mjs";
import { hasKey } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { ITerminalLogService } from "./module-1154.mjs";


// src/vs/workbench/contrib/terminal/browser/remotePty.ts
var RemotePty = class extends BasePty {
  constructor(id2, shouldPersist, _remoteTerminalChannel, _remoteAgentService, _logService) {
    super(id2, shouldPersist);
    this._remoteTerminalChannel = _remoteTerminalChannel;
    this._remoteAgentService = _remoteAgentService;
    this._logService = _logService;
    this._startBarrier = new Barrier();
  }
  async start() {
    const env2 = await this._remoteAgentService.getEnvironment();
    if (!env2) {
      throw new Error("Could not fetch remote environment");
    }
    this._logService.trace("Spawning remote agent process", { terminalId: this.id });
    const startResult = await this._remoteTerminalChannel.start(this.id);
    if (startResult && hasKey(startResult, { message: true })) {
      return startResult;
    }
    this._startBarrier.open();
    return startResult;
  }
  async detach(forcePersist) {
    await this._startBarrier.wait();
    return this._remoteTerminalChannel.detachFromProcess(this.id, forcePersist);
  }
  shutdown(immediate) {
    this._startBarrier.wait().then((_) => {
      this._remoteTerminalChannel.shutdown(this.id, immediate);
    });
  }
  input(data) {
    if (this._inReplay) {
      return;
    }
    this._startBarrier.wait().then((_) => {
      this._remoteTerminalChannel.input(this.id, data);
    });
  }
  sendSignal(signal) {
    if (this._inReplay) {
      return;
    }
    this._startBarrier.wait().then((_) => {
      this._remoteTerminalChannel.sendSignal(this.id, signal);
    });
  }
  processBinary(e) {
    return this._remoteTerminalChannel.processBinary(this.id, e);
  }
  resize(cols, rows, pixelWidth, pixelHeight) {
    if (this._inReplay || this._lastDimensions.cols === cols && this._lastDimensions.rows === rows) {
      return;
    }
    this._startBarrier.wait().then((_) => {
      this._lastDimensions.cols = cols;
      this._lastDimensions.rows = rows;
      this._remoteTerminalChannel.resize(this.id, cols, rows, pixelWidth, pixelHeight);
    });
  }
  async clearBuffer() {
    await this._remoteTerminalChannel.clearBuffer(this.id);
  }
  freePortKillProcess(port) {
    if (!this._remoteTerminalChannel.freePortKillProcess) {
      throw new Error("freePortKillProcess does not exist on the local pty service");
    }
    return this._remoteTerminalChannel.freePortKillProcess(port);
  }
  acknowledgeDataEvent(charCount) {
    if (this._inReplay) {
      return;
    }
    this._startBarrier.wait().then((_) => {
      this._remoteTerminalChannel.acknowledgeDataEvent(this.id, charCount);
    });
  }
  async setUnicodeVersion(version2) {
    return this._remoteTerminalChannel.setUnicodeVersion(this.id, version2);
  }
  async refreshProperty(type) {
    return this._remoteTerminalChannel.refreshProperty(this.id, type);
  }
  async updateProperty(type, value2) {
    return this._remoteTerminalChannel.updateProperty(this.id, type, value2);
  }
  handleOrphanQuestion() {
    this._remoteTerminalChannel.orphanQuestionReply(this.id);
  }
};

RemotePty = __decorateClass([
  __decorateParam(3, IRemoteAgentService),
  __decorateParam(4, ITerminalLogService)
], RemotePty);
export { RemotePty };
