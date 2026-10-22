// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/typeAhead/browser/terminal.typeAhead.contribution.ts
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { TERMINAL_CONFIG_SECTION } from "./module-1174.mjs";
import { TypeAheadAddon } from "./module-3221.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerTerminalContribution } from "./module-2329.mjs";


// src/vs/workbench/contrib/terminalContrib/typeAhead/browser/terminal.typeAhead.contribution.ts
var TerminalTypeAheadContribution = class extends DisposableStore {
  constructor(_ctx, _configurationService, _instantiationService) {
    super();
    this._ctx = _ctx;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this.add(toDisposable(() => this._addon?.dispose()));
  }
  static {
    this.ID = "terminal.typeAhead";
  }
  static get(instance2) {
    return instance2.getContribution(TerminalTypeAheadContribution.ID);
  }
  xtermReady(xterm) {
    this._loadTypeAheadAddon(xterm.raw);
    this.add(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("terminal.integrated.localEchoEnabled" /* LocalEchoEnabled */)) {
        this._loadTypeAheadAddon(xterm.raw);
      }
    }));
    this.add(this._ctx.processManager.onProcessReady(() => {
      this._addon?.reset();
    }));
  }
  _loadTypeAheadAddon(xterm) {
    const enabled = this._configurationService.getValue(TERMINAL_CONFIG_SECTION).localEchoEnabled;
    const isRemote = !!this._ctx.processManager.remoteAuthority;
    if (enabled === "off" || enabled === "auto" && !isRemote) {
      this._addon?.dispose();
      this._addon = void 0;
      return;
    }
    if (this._addon) {
      return;
    }
    if (enabled === "on" || enabled === "auto" && isRemote) {
      this._addon = this._instantiationService.createInstance(TypeAheadAddon, this._ctx.processManager);
      xterm.loadAddon(this._addon);
    }
  }
};

TerminalTypeAheadContribution = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IInstantiationService)
], TerminalTypeAheadContribution);

registerTerminalContribution(TerminalTypeAheadContribution.ID, TerminalTypeAheadContribution);
export { TerminalTypeAheadContribution };
