// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/stickyScroll/browser/terminalStickyScrollContribution.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { TerminalInstance, TerminalInstanceColorProvider } from "./module-3291.mjs";
import { TerminalStickyScrollOverlay } from "./module-3386.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/contrib/terminalContrib/stickyScroll/browser/terminalStickyScrollContribution.ts
var TerminalStickyScrollContribution = class extends Disposable {
  constructor(_ctx, _configurationService, _contextKeyService, _instantiationService, _keybindingService) {
    super();
    this._ctx = _ctx;
    this._configurationService = _configurationService;
    this._contextKeyService = _contextKeyService;
    this._instantiationService = _instantiationService;
    this._keybindingService = _keybindingService;
    this._overlay = this._register(new MutableDisposable());
    this._enableListeners = this._register(new MutableDisposable());
    this._disableListeners = this._register(new MutableDisposable());
    this._richCommandDetectionListeners = this._register(new MutableDisposable());
    this._register(Event2.runAndSubscribe(this._configurationService.onDidChangeConfiguration, (e) => {
      if (!e || e.affectsConfiguration("terminal.integrated.stickyScroll.enabled" /* Enabled */)) {
        this._refreshState();
      }
    }));
  }
  static {
    this.ID = "terminal.stickyScroll";
  }
  static get(instance2) {
    return instance2.getContribution(TerminalStickyScrollContribution.ID);
  }
  xtermReady(xterm) {
    this._xterm = xterm;
    this._refreshState();
  }
  xtermOpen(xterm) {
    this._refreshState();
  }
  hideLock() {
    this._overlay.value?.lockHide();
  }
  hideUnlock() {
    this._overlay.value?.unlockHide();
  }
  _refreshState() {
    if (this._overlay.value) {
      this._tryDisable();
    } else {
      this._tryEnable();
    }
    if (this._overlay.value) {
      this._enableListeners.clear();
      if (!this._disableListeners.value) {
        this._disableListeners.value = this._ctx.instance.capabilities.onDidRemoveCapability((e) => {
          if (e.id === 2 /* CommandDetection */) {
            this._refreshState();
          }
        });
      }
    } else {
      this._disableListeners.clear();
      if (!this._enableListeners.value) {
        this._enableListeners.value = this._ctx.instance.capabilities.onDidAddCapability((e) => {
          if (e.id === 2 /* CommandDetection */) {
            this._refreshState();
          }
        });
      }
    }
  }
  _tryEnable() {
    const capability = this._ctx.instance.capabilities.get(2 /* CommandDetection */);
    if (this._shouldBeEnabled()) {
      const xtermCtorEventually = TerminalInstance.getXtermConstructor(this._keybindingService, this._contextKeyService);
      this._overlay.value = this._instantiationService.createInstance(
        TerminalStickyScrollOverlay,
        this._ctx.instance,
        this._xterm,
        this._instantiationService.createInstance(TerminalInstanceColorProvider, this._ctx.instance.targetRef),
        capability,
        xtermCtorEventually
      );
      this._richCommandDetectionListeners.clear();
    } else if (capability && !capability.hasRichCommandDetection) {
      this._richCommandDetectionListeners.value = capability.onSetRichCommandDetection(() => {
        this._refreshState();
      });
    } else {
      this._richCommandDetectionListeners.clear();
    }
  }
  _tryDisable() {
    if (!this._shouldBeEnabled()) {
      this._overlay.clear();
      this._richCommandDetectionListeners.clear();
    }
  }
  _shouldBeEnabled() {
    const capability = this._ctx.instance.capabilities.get(2 /* CommandDetection */);
    const result = !!(this._configurationService.getValue("terminal.integrated.stickyScroll.enabled" /* Enabled */) && capability && capability.hasRichCommandDetection && this._xterm?.raw?.element);
    return result;
  }
};

TerminalStickyScrollContribution = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IKeybindingService)
], TerminalStickyScrollContribution);
export { TerminalStickyScrollContribution };
