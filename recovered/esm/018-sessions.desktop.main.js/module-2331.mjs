// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/detachedTerminal.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { TerminalWidgetManager } from "./module-2330.mjs";
import { TerminalCapabilityStore } from "./module-2328.mjs";
import { TerminalExtensionsRegistry } from "./module-2329.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { Delayer } from "./module-0036.mjs";
import { MicrotaskDelay } from "./module-0035.mjs";
import { EventType, addDisposableListener, getActiveWindow } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/terminal/browser/detachedTerminal.ts
var DetachedTerminal = class extends Disposable {
  constructor(_xterm, options3, instantiationService) {
    super();
    this._xterm = _xterm;
    this._widgets = this._register(new TerminalWidgetManager());
    this._contributions = /* @__PURE__ */ new Map();
    this._attachDisposables = this._register(new MutableDisposable());
    this.onData = this._xterm.raw.onData;
    const capabilities = options3.capabilities ?? new TerminalCapabilityStore();
    this._register(capabilities);
    this.capabilities = capabilities;
    this._register(_xterm);
    const contributionDescs = TerminalExtensionsRegistry.getTerminalContributions();
    for (const desc of contributionDescs) {
      if (this._contributions.has(desc.id)) {
        onUnexpectedError(new Error(`Cannot have two terminal contributions with the same id ${desc.id}`));
        continue;
      }
      if (desc.canRunInDetachedTerminals === false) {
        continue;
      }
      let contribution;
      try {
        contribution = instantiationService.createInstance(desc.ctor, {
          instance: this,
          processManager: options3.processInfo,
          widgetManager: this._widgets
        });
        this._contributions.set(desc.id, contribution);
        this._register(contribution);
      } catch (err) {
        onUnexpectedError(err);
      }
    }
    this._register(new Delayer(MicrotaskDelay)).trigger(() => {
      for (const contr of this._contributions.values()) {
        contr.xtermReady?.(this._xterm);
      }
    });
  }
  get xterm() {
    return this._xterm;
  }
  get selection() {
    return this._xterm && this.hasSelection() ? this._xterm.raw.getSelection() : void 0;
  }
  hasSelection() {
    return this._xterm.hasSelection();
  }
  clearSelection() {
    this._xterm.clearSelection();
  }
  focus(force) {
    if (force || !getActiveWindow().getSelection()?.toString()) {
      this.xterm.focus();
    }
  }
  attachToElement(container2, options3) {
    this.domElement = container2;
    const screenElement = this._xterm.attachToElement(container2, options3);
    this._widgets.attachToElement(screenElement);
    const attachStore = new DisposableStore();
    const scheduleFocus = () => {
      setTimeout(() => this.focus(true), 0);
    };
    attachStore.add(addDisposableListener(container2, EventType.MOUSE_DOWN, scheduleFocus));
    this._attachDisposables.value = attachStore;
  }
  forceScrollbarVisibility() {
    this.domElement?.classList.add("force-scrollbar");
  }
  resetScrollbarVisibility() {
    this.domElement?.classList.remove("force-scrollbar");
  }
  getContribution(id2) {
    return this._contributions.get(id2);
  }
};

DetachedTerminal = __decorateClass([
  __decorateParam(2, IInstantiationService)
], DetachedTerminal);

var DetachedProcessInfo = class extends Disposable {
  constructor(initialValues) {
    super();
    this.processState = 3 /* Running */;
    this.ptyProcessReady = Promise.resolve();
    this.initialCwd = "";
    this.shouldPersist = false;
    this.hasWrittenData = false;
    this.hasChildProcesses = false;
    this.shellIntegrationNonce = "";
    Object.assign(this, initialValues);
    this.capabilities = this._register(new TerminalCapabilityStore());
  }
};
export { DetachedTerminal, DetachedProcessInfo };
