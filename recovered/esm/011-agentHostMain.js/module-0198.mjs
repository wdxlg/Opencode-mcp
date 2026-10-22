// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostHeadlessTerminal.ts
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { DeferredPromise } from "./module-0027.mjs";


// src/vs/platform/agentHost/node/agentHostHeadlessTerminal.ts
import pkg from "@xterm/headless";

var { Terminal: XtermTerminal } = pkg;

var AgentHostHeadlessTerminal = class extends Disposable {
  constructor(options) {
    super();
    this._onResponseData = this._register(new Emitter());
    this.onResponseData = this._onResponseData.event;
    this._writeBarrier = Promise.resolve();
    this._isDisposed = false;
    this._logService = options.logService;
    const terminalOptions = {
      cols: options.cols,
      rows: options.rows,
      scrollback: options.scrollback,
      allowProposedApi: true
    };
    this._terminal = options.terminalFactory?.(terminalOptions) ?? new XtermTerminal(terminalOptions);
    this._register(this._terminal.onData((data) => {
      if (this._isCursorPositionReportResponse(data)) {
        this._logService.debug(`[AgentHostHeadlessTerminal] Forwarding terminal response ${JSON.stringify(data)}`);
        this._onResponseData.fire(data);
      } else {
        this._logService.debug(`[AgentHostHeadlessTerminal] Dropping terminal response ${JSON.stringify(data)}`);
      }
    }));
    this._register({
      dispose: () => {
        this._isDisposed = true;
        this._terminal.dispose();
      }
    });
  }
  writePtyData(data) {
    this._writeBarrier = this._writeBarrier.catch(() => void 0).then(() => {
      if (this._isDisposed) {
        return;
      }
      return new Promise((resolve3) => {
        try {
          this._terminal.write(data, resolve3);
        } catch {
          resolve3();
        }
      });
    });
    return this._writeBarrier;
  }
  whenPtyDataFlushed() {
    return this._writeBarrier.catch(() => void 0);
  }
  resize(cols, rows) {
    this._terminal.resize(cols, rows);
  }
  isBracketedPasteMode() {
    return this._terminal.modes.bracketedPasteMode;
  }
  isInAltBuffer() {
    return this._terminal.buffer.active === this._terminal.buffer.alternate;
  }
  createAltBufferPromise(store) {
    const deferred = new DeferredPromise();
    const complete = () => {
      if (!deferred.isSettled) {
        this._logService.debug("[AgentHostHeadlessTerminal] Detected alternate buffer entry");
        deferred.complete();
      }
    };
    if (this.isInAltBuffer()) {
      complete();
    } else {
      store.add(this._terminal.buffer.onBufferChange(() => {
        if (this.isInAltBuffer()) {
          complete();
        }
      }));
    }
    return deferred.p;
  }
  clear() {
    void this.writePtyData("\x1B[2J\x1B[3J\x1B[H");
  }
  dispose() {
    this._isDisposed = true;
    super.dispose();
  }
  _isCursorPositionReportResponse(data) {
    return /^(?:\x1b\[\??\d+;\d+R)+$/.test(data);
  }
};
export { pkg, XtermTerminal, AgentHostHeadlessTerminal };
