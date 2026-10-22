// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/commandGuide/browser/terminal.commandGuide.contribution.ts
import { Disposable, MutableDisposable, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { terminalCommandGuideConfigSection } from "./module-1162.mjs";
import { addDisposableListener } from "./module-0075.mjs";
import { isFullTerminalCommand } from "./module-3053.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerTerminalContribution } from "./module-2354.mjs";
import { registerColor, transparent } from "./module-0226.mjs";
import { listInactiveSelectionBackground } from "./module-0232.mjs";
import { PANEL_BORDER } from "./module-0912.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminalContrib/commandGuide/browser/terminal.commandGuide.contribution.ts
var TerminalCommandGuideContribution = class extends Disposable {
  constructor(_ctx, _configurationService) {
    super();
    this._ctx = _ctx;
    this._configurationService = _configurationService;
    this._activeCommandGuide = this._register(new MutableDisposable());
  }
  static {
    this.ID = "terminal.commandGuide";
  }
  static get(instance2) {
    return instance2.getContribution(TerminalCommandGuideContribution.ID);
  }
  xtermOpen(xterm) {
    this._xterm = xterm;
    this._refreshActivatedState();
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("terminal.integrated.shellIntegration.showCommandGuide" /* ShowCommandGuide */)) {
        this._refreshActivatedState();
      }
    }));
  }
  _refreshActivatedState() {
    const xterm = this._xterm;
    if (!xterm) {
      return;
    }
    const showCommandGuide = this._configurationService.getValue(terminalCommandGuideConfigSection).showCommandGuide;
    if (!!this._activeCommandGuide.value === showCommandGuide) {
      return;
    }
    if (!showCommandGuide) {
      this._activeCommandGuide.clear();
    } else {
      const screenElement = xterm.raw.element.querySelector(".xterm-screen");
      const viewportElement = xterm.raw.element.querySelector(".xterm-viewport");
      this._activeCommandGuide.value = combinedDisposable(
        addDisposableListener(screenElement, "mousemove", (e) => this._tryShowHighlight(screenElement, xterm, e)),
        addDisposableListener(viewportElement, "mousemove", (e) => this._tryShowHighlight(screenElement, xterm, e)),
        addDisposableListener(xterm.raw.element, "mouseleave", () => xterm.markTracker.showCommandGuide(void 0)),
        xterm.raw.onData(() => xterm.markTracker.showCommandGuide(void 0)),
        toDisposable(() => xterm.markTracker.showCommandGuide(void 0))
      );
    }
  }
  _tryShowHighlight(element, xterm, e) {
    const rect = element.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const mouseCursorY = Math.floor((e.clientY - rect.top) / (rect.height / xterm.raw.rows));
    const command4 = this._ctx.instance.capabilities.get(2 /* CommandDetection */)?.getCommandForLine(xterm.raw.buffer.active.viewportY + mouseCursorY);
    if (command4 && isFullTerminalCommand(command4)) {
      xterm.markTracker.showCommandGuide(command4);
    } else {
      xterm.markTracker.showCommandGuide(void 0);
    }
  }
};

TerminalCommandGuideContribution = __decorateClass([
  __decorateParam(1, IConfigurationService)
], TerminalCommandGuideContribution);

registerTerminalContribution(TerminalCommandGuideContribution.ID, TerminalCommandGuideContribution, false);

var TERMINAL_COMMAND_GUIDE_COLOR = registerColor("terminalCommandGuide.foreground", {
  dark: transparent(listInactiveSelectionBackground, 1),
  light: transparent(listInactiveSelectionBackground, 1),
  hcDark: PANEL_BORDER,
  hcLight: PANEL_BORDER
}, localize(20706, null));
export { TerminalCommandGuideContribution, TERMINAL_COMMAND_GUIDE_COLOR };
