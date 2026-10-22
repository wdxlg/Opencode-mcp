// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/terminalToolAutoExpand.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { disposableTimeout } from "./module-0036.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/terminalToolAutoExpand.ts
var TerminalToolAutoExpand = class extends Disposable {
  constructor(_options) {
    super();
    this._options = _options;
    this._commandFinished = false;
    this._receivedData = false;
    this._dataEventTimeout = this._register(new MutableDisposable());
    this._noDataTimeout = this._register(new MutableDisposable());
    this._onDidRequestExpand = this._register(new Emitter());
    this.onDidRequestExpand = this._onDidRequestExpand.event;
    this._setupListeners();
  }
  _setupListeners() {
    const store = this._register(new DisposableStore());
    store.add(this._options.onCommandExecuted(() => {
      if (this._options.shouldAutoExpand() && !this._noDataTimeout.value) {
        this._noDataTimeout.value = disposableTimeout(() => {
          this._noDataTimeout.clear();
          const shouldExpand = this._options.shouldAutoExpand();
          const hasOutput = this._options.hasRealOutput();
          if (shouldExpand && hasOutput) {
            this._dataEventTimeout.clear();
            this._onDidRequestExpand.fire();
          }
        }, 500 /* NoData */, store);
      }
    }));
    store.add(this._options.onWillData(() => {
      if (this._receivedData) {
        return;
      }
      this._receivedData = true;
      if (this._options.shouldAutoExpand() && !this._dataEventTimeout.value) {
        this._dataEventTimeout.value = disposableTimeout(() => {
          this._dataEventTimeout.clear();
          const shouldExpand = this._options.shouldAutoExpand();
          const hasOutput = this._options.hasRealOutput();
          if (!this._commandFinished && shouldExpand && hasOutput) {
            this._noDataTimeout.clear();
            this._onDidRequestExpand.fire();
          }
        }, 50 /* DataEvent */, store);
      }
    }));
    store.add(this._options.onCommandFinished(() => {
      this._commandFinished = true;
      this._clearAutoExpandTimeouts();
    }));
  }
  _clearAutoExpandTimeouts() {
    this._dataEventTimeout.clear();
    this._noDataTimeout.clear();
  }
};
export { TerminalToolAutoExpand };
