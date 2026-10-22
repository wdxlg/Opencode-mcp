// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/quickFix/browser/terminal.quickFix.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { ITerminalQuickFixService } from "./module-1274.mjs";
import { TerminalQuickFixService } from "./module-3219.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { TerminalQuickFixAddon } from "./module-3217.mjs";
import { freePort, gitCreatePr, gitFastForwardPull, gitPushSetUpstream, gitSimilar, gitTwoDashes, pwshGeneralError, pwshUnixCommandNotFoundError } from "./module-3218.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerTerminalContribution } from "./module-2329.mjs";
import { registerActiveInstanceAction } from "./module-3043.mjs";
import { localize2 } from "./module-0001.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";


// src/vs/workbench/contrib/terminalContrib/quickFix/browser/terminal.quickFix.contribution.ts
registerSingleton(ITerminalQuickFixService, TerminalQuickFixService, 1 /* Delayed */);

var TerminalQuickFixContribution = class extends DisposableStore {
  constructor(_ctx, _instantiationService) {
    super();
    this._ctx = _ctx;
    this._instantiationService = _instantiationService;
    this._quickFixMenuItems = this.add(new MutableDisposable());
  }
  static {
    this.ID = "quickFix";
  }
  static get(instance2) {
    return instance2.getContribution(TerminalQuickFixContribution.ID);
  }
  get addon() {
    return this._addon;
  }
  xtermReady(xterm) {
    this._addon = this._instantiationService.createInstance(TerminalQuickFixAddon, this._ctx.instance.sessionId, void 0, this._ctx.instance.capabilities);
    xterm.raw.loadAddon(this._addon);
    this.add(this._addon.onDidRequestRerunCommand((e4) => this._ctx.instance.runCommand(e4.command, e4.shouldExecute || false)));
    this.add(this._addon.onDidUpdateQuickFixes((e4) => {
      this._quickFixMenuItems.value = e4.actions ? xterm.decorationAddon.registerMenuItems(e4.command, e4.actions) : void 0;
    }));
    for (const actionOption of [
      gitTwoDashes(),
      gitFastForwardPull(),
      freePort((port, command4) => this._ctx.instance.freePortKillProcess(port, command4)),
      gitSimilar(),
      gitPushSetUpstream(),
      gitCreatePr(),
      pwshUnixCommandNotFoundError(),
      pwshGeneralError()
    ]) {
      this._addon.registerCommandFinishedListener(actionOption);
    }
  }
};

TerminalQuickFixContribution = __decorateClass([
  __decorateParam(1, IInstantiationService)
], TerminalQuickFixContribution);

registerTerminalContribution(TerminalQuickFixContribution.ID, TerminalQuickFixContribution);

registerActiveInstanceAction({
  id: "workbench.action.terminal.showQuickFixes" /* ShowQuickFixes */,
  title: localize2(20815, "Show Terminal Quick Fixes"),
  precondition: TerminalContextKeys.focus,
  keybinding: {
    primary: 2048 /* CtrlCmd */ | 89 /* Period */,
    weight: 200 /* WorkbenchContrib */
  },
  run: (activeInstance) => TerminalQuickFixContribution.get(activeInstance)?.addon?.showMenu()
});
export { TerminalQuickFixContribution };
