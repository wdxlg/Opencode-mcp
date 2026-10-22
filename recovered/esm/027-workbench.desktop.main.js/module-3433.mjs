// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/resizeDimensionsOverlay/browser/terminal.resizeDimensionsOverlay.contribution.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { timeout } from "./module-0036.mjs";
import { TerminalResizeDimensionsOverlay } from "./module-3432.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerTerminalContribution } from "./module-2354.mjs";


// src/vs/workbench/contrib/terminalContrib/resizeDimensionsOverlay/browser/terminal.resizeDimensionsOverlay.contribution.ts
var TerminalResizeDimensionsOverlayContribution = class extends Disposable {
  constructor(_ctx, _configurationService) {
    super();
    this._ctx = _ctx;
    this._configurationService = _configurationService;
    this._overlay = this._register(new MutableDisposable());
  }
  static {
    this.ID = "terminal.resizeDimensionsOverlay";
  }
  xtermOpen(xterm) {
    this._ctx.processManager.ptyProcessReady.then(() => {
      timeout(1e3).then(() => {
        if (this._store.isDisposed) {
          return;
        }
        this._updateOverlay(xterm);
        this._register(this._configurationService.onDidChangeConfiguration((e) => {
          if (e.affectsConfiguration("terminal.integrated.resizeDimensionsOverlay.enabled" /* Enabled */)) {
            this._updateOverlay(xterm);
          }
        }));
      });
    });
  }
  _updateOverlay(xterm) {
    const enabled = this._configurationService.getValue("terminal.integrated.resizeDimensionsOverlay.enabled" /* Enabled */) !== false;
    if (enabled) {
      if (!this._overlay.value) {
        this._overlay.value = new TerminalResizeDimensionsOverlay(this._ctx.instance.domElement, xterm);
      }
    } else {
      this._overlay.clear();
    }
  }
};

TerminalResizeDimensionsOverlayContribution = __decorateClass([
  __decorateParam(1, IConfigurationService)
], TerminalResizeDimensionsOverlayContribution);

registerTerminalContribution(TerminalResizeDimensionsOverlayContribution.ID, TerminalResizeDimensionsOverlayContribution);
export { TerminalResizeDimensionsOverlayContribution };
