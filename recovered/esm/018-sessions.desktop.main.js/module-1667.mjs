// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/terminal/common/embedderTerminalService.ts
import { createDecorator } from "./module-0077.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Disposable } from "./module-0012.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/terminal/common/embedderTerminalService.ts
var IEmbedderTerminalService = createDecorator("embedderTerminalService");

var EmbedderTerminalService = class {
  constructor() {
    this._onDidCreateTerminal = new Emitter();
    this.onDidCreateTerminal = Event2.buffer(this._onDidCreateTerminal.event, "onDidCreateTerminal");
  }
  createTerminal(options3) {
    const slc = {
      name: options3.name,
      isFeatureTerminal: true,
      customPtyImplementation(terminalId, cols, rows) {
        return new EmbedderTerminalProcess(terminalId, options3.pty);
      }
    };
    this._onDidCreateTerminal.fire(slc);
  }
};

var EmbedderTerminalProcess = class extends Disposable {
  constructor(id2, pty) {
    super();
    this.id = id2;
    this.shouldPersist = false;
    this._onProcessReady = this._register(new Emitter());
    this.onProcessReady = this._onProcessReady.event;
    this._onDidChangeProperty = this._register(new Emitter());
    this.onDidChangeProperty = this._onDidChangeProperty.event;
    this._onProcessExit = this._register(new Emitter());
    this.onProcessExit = this._onProcessExit.event;
    this._pty = pty;
    this.onProcessData = this._pty.onDidWrite;
    if (this._pty.onDidClose) {
      this._register(this._pty.onDidClose((e4) => this._onProcessExit.fire(e4 || void 0)));
    }
    if (this._pty.onDidChangeName) {
      this._register(this._pty.onDidChangeName((e4) => this._onDidChangeProperty.fire({
        type: "title" /* Title */,
        value: e4
      })));
    }
  }
  async start() {
    this._onProcessReady.fire({ pid: -1, cwd: "", windowsPty: void 0 });
    this._pty.open();
    return void 0;
  }
  shutdown() {
    this._pty.close();
  }
  // TODO: A lot of these aren't useful for some implementations of ITerminalChildProcess, should
  // they be optional? Should there be a base class for "external" consumers to implement?
  input() {
  }
  sendSignal() {
  }
  async processBinary() {
  }
  resize() {
  }
  clearBuffer() {
  }
  acknowledgeDataEvent() {
  }
  async setUnicodeVersion() {
  }
  async getInitialCwd() {
    return "";
  }
  async getCwd() {
    return "";
  }
  refreshProperty(property) {
    throw new Error(`refreshProperty is not suppported in EmbedderTerminalProcess. property: ${property}`);
  }
  updateProperty(property, value2) {
    throw new Error(`updateProperty is not suppported in EmbedderTerminalProcess. property: ${property}, value: ${value2}`);
  }
};

registerSingleton(IEmbedderTerminalService, EmbedderTerminalService, 1 /* Delayed */);
export { IEmbedderTerminalService, EmbedderTerminalService, EmbedderTerminalProcess };
