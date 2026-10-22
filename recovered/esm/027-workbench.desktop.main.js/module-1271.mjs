// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalProcessExtHostProxy.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalService } from "./module-1149.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalProcessExtHostProxy.ts
var TerminalProcessExtHostProxy = class extends Disposable {
  constructor(instanceId, _cols, _rows, _terminalService) {
    super();
    this.instanceId = instanceId;
    this._cols = _cols;
    this._rows = _rows;
    this._terminalService = _terminalService;
    this.id = 0;
    this.shouldPersist = false;
    this._onProcessData = this._register(new Emitter());
    this.onProcessData = this._onProcessData.event;
    this._onProcessReady = this._register(new Emitter());
    this._onStart = this._register(new Emitter());
    this.onStart = this._onStart.event;
    this._onInput = this._register(new Emitter());
    this.onInput = this._onInput.event;
    this._onBinary = this._register(new Emitter());
    this.onBinary = this._onBinary.event;
    this._onResize = this._register(new Emitter());
    this.onResize = this._onResize.event;
    this._onAcknowledgeDataEvent = this._register(new Emitter());
    this.onAcknowledgeDataEvent = this._onAcknowledgeDataEvent.event;
    this._onShutdown = this._register(new Emitter());
    this.onShutdown = this._onShutdown.event;
    this._onRequestInitialCwd = this._register(new Emitter());
    this.onRequestInitialCwd = this._onRequestInitialCwd.event;
    this._onRequestCwd = this._register(new Emitter());
    this.onRequestCwd = this._onRequestCwd.event;
    this._onDidChangeProperty = this._register(new Emitter());
    this.onDidChangeProperty = this._onDidChangeProperty.event;
    this._onProcessExit = this._register(new Emitter());
    this.onProcessExit = this._onProcessExit.event;
    this._pendingInitialCwdRequests = [];
    this._pendingCwdRequests = [];
  }
  get onProcessReady() {
    return this._onProcessReady.event;
  }
  emitData(data) {
    this._onProcessData.fire(data);
  }
  emitTitle(title) {
    this._onDidChangeProperty.fire({ type: "title" /* Title */, value: title });
  }
  emitReady(pid, cwd2) {
    this._onProcessReady.fire({ pid, cwd: cwd2, windowsPty: void 0 });
  }
  emitProcessProperty({ type, value: value2 }) {
    switch (type) {
      case "cwd" /* Cwd */:
        this.emitCwd(value2);
        break;
      case "initialCwd" /* InitialCwd */:
        this.emitInitialCwd(value2);
        break;
      case "title" /* Title */:
        this.emitTitle(value2);
        break;
      case "overrideDimensions" /* OverrideDimensions */:
        this.emitOverrideDimensions(value2);
        break;
      case "resolvedShellLaunchConfig" /* ResolvedShellLaunchConfig */:
        this.emitResolvedShellLaunchConfig(value2);
        break;
    }
  }
  emitExit(exitCode) {
    this._onProcessExit.fire(exitCode);
    this.dispose();
  }
  emitOverrideDimensions(dimensions) {
    this._onDidChangeProperty.fire({ type: "overrideDimensions" /* OverrideDimensions */, value: dimensions });
  }
  emitResolvedShellLaunchConfig(shellLaunchConfig) {
    this._onDidChangeProperty.fire({ type: "resolvedShellLaunchConfig" /* ResolvedShellLaunchConfig */, value: shellLaunchConfig });
  }
  emitInitialCwd(initialCwd) {
    while (this._pendingInitialCwdRequests.length > 0) {
      this._pendingInitialCwdRequests.pop()(initialCwd);
    }
  }
  emitCwd(cwd2) {
    while (this._pendingCwdRequests.length > 0) {
      this._pendingCwdRequests.pop()(cwd2);
    }
  }
  async start() {
    return this._terminalService.requestStartExtensionTerminal(this, this._cols, this._rows);
  }
  shutdown(immediate) {
    this._onShutdown.fire(immediate);
  }
  input(data) {
    this._onInput.fire(data);
  }
  sendSignal(signal) {
  }
  resize(cols, rows) {
    this._onResize.fire({ cols, rows });
  }
  clearBuffer() {
  }
  acknowledgeDataEvent() {
  }
  async setUnicodeVersion(version2) {
  }
  async processBinary(data) {
    this._onBinary.fire(data);
  }
  getInitialCwd() {
    return new Promise((resolve3) => {
      this._onRequestInitialCwd.fire();
      this._pendingInitialCwdRequests.push(resolve3);
    });
  }
  getCwd() {
    return new Promise((resolve3) => {
      this._onRequestCwd.fire();
      this._pendingCwdRequests.push(resolve3);
    });
  }
  async refreshProperty(type) {
    throw new Error("refreshProperty not implemented on extension host");
  }
  async updateProperty(type, value2) {
  }
};

TerminalProcessExtHostProxy = __decorateClass([
  __decorateParam(3, ITerminalService)
], TerminalProcessExtHostProxy);
export { TerminalProcessExtHostProxy };
