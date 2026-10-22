// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/find/browser/terminal.find.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { Lazy } from "./module-0028.mjs";
import { TerminalFindWidget } from "./module-3171.mjs";
import { ITerminalService, isDetachedTerminalInstance } from "./module-1150.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerTerminalContribution } from "./module-2329.mjs";
import { registerActiveInstanceAction, registerActiveXtermAction } from "./module-3043.mjs";
import { localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { findInFilesCommand } from "./module-2811.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { TerminalFindAccessibilityHelp } from "./module-3172.mjs";


// src/vs/workbench/contrib/terminalContrib/find/browser/terminal.find.contribution.ts
var TerminalFindContribution = class extends Disposable {
  static {
    this.ID = "terminal.find";
  }
  static get(instance2) {
    return instance2.getContribution(TerminalFindContribution.ID);
  }
  get findWidget() {
    return this._findWidget.value;
  }
  constructor(ctx, instantiationService, terminalService) {
    super();
    this._findWidget = new Lazy(() => {
      const findWidget = instantiationService.createInstance(TerminalFindWidget, ctx.instance);
      findWidget.focusTracker.onDidFocus(() => {
        TerminalFindContribution.activeFindWidget = this;
        ctx.instance.forceScrollbarVisibility();
        if (!isDetachedTerminalInstance(ctx.instance)) {
          terminalService.setActiveInstance(ctx.instance);
        }
      });
      findWidget.focusTracker.onDidBlur(() => {
        TerminalFindContribution.activeFindWidget = void 0;
        ctx.instance.resetScrollbarVisibility();
      });
      if (!ctx.instance.domElement) {
        throw new Error("FindWidget expected terminal DOM to be initialized");
      }
      ctx.instance.domElement?.appendChild(findWidget.getDomNode());
      if (this._lastLayoutDimensions) {
        findWidget.layout(this._lastLayoutDimensions.width);
      }
      return findWidget;
    });
  }
  layout(_xterm, dimension) {
    this._lastLayoutDimensions = dimension;
    this._findWidget.rawValue?.layout(dimension.width);
  }
  xtermReady(xterm) {
    this._register(xterm.onDidChangeFindResults(() => this._findWidget.rawValue?.updateResultCount()));
  }
  dispose() {
    if (TerminalFindContribution.activeFindWidget === this) {
      TerminalFindContribution.activeFindWidget = void 0;
    }
    super.dispose();
    this._findWidget.rawValue?.dispose();
  }
};

TerminalFindContribution = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITerminalService)
], TerminalFindContribution);

registerTerminalContribution(TerminalFindContribution.ID, TerminalFindContribution, true);

registerActiveXtermAction({
  id: "workbench.action.terminal.focusFind" /* FindFocus */,
  title: localize2(20720, "Focus Find"),
  keybinding: {
    primary: 2048 /* CtrlCmd */ | 36 /* KeyF */,
    when: ContextKeyExpr.or(TerminalContextKeys.findFocus, TerminalContextKeys.focusInAny),
    weight: 200 /* WorkbenchContrib */
  },
  precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
  run: (_xterm, _accessor, activeInstance) => {
    const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
    contr?.findWidget.reveal();
  }
});

registerActiveXtermAction({
  id: "workbench.action.terminal.hideFind" /* FindHide */,
  title: localize2(20721, "Hide Find"),
  keybinding: {
    primary: 9 /* Escape */,
    secondary: [1024 /* Shift */ | 9 /* Escape */],
    when: ContextKeyExpr.and(TerminalContextKeys.focusInAny, TerminalContextKeys.findVisible),
    weight: 200 /* WorkbenchContrib */
  },
  precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
  run: (_xterm, _accessor, activeInstance) => {
    const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
    contr?.findWidget.hide();
  }
});

registerActiveXtermAction({
  id: "workbench.action.terminal.toggleFindRegex" /* ToggleFindRegex */,
  title: localize2(20724, "Toggle Find Using Regex"),
  keybinding: {
    primary: 512 /* Alt */ | 48 /* KeyR */,
    mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 48 /* KeyR */ },
    when: TerminalContextKeys.findVisible,
    weight: 200 /* WorkbenchContrib */
  },
  precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
  run: (_xterm, _accessor, activeInstance) => {
    const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
    const state = contr?.findWidget.state;
    state?.change({ isRegex: !state.isRegex }, false);
  }
});

registerActiveXtermAction({
  id: "workbench.action.terminal.toggleFindWholeWord" /* ToggleFindWholeWord */,
  title: localize2(20725, "Toggle Find Using Whole Word"),
  keybinding: {
    primary: 512 /* Alt */ | 53 /* KeyW */,
    mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 53 /* KeyW */ },
    when: TerminalContextKeys.findVisible,
    weight: 200 /* WorkbenchContrib */
  },
  precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
  run: (_xterm, _accessor, activeInstance) => {
    const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
    const state = contr?.findWidget.state;
    state?.change({ wholeWord: !state.wholeWord }, false);
  }
});

registerActiveXtermAction({
  id: "workbench.action.terminal.toggleFindCaseSensitive" /* ToggleFindCaseSensitive */,
  title: localize2(20723, "Toggle Find Using Case Sensitive"),
  keybinding: {
    primary: 512 /* Alt */ | 33 /* KeyC */,
    mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 33 /* KeyC */ },
    when: TerminalContextKeys.findVisible,
    weight: 200 /* WorkbenchContrib */
  },
  precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
  run: (_xterm, _accessor, activeInstance) => {
    const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
    const state = contr?.findWidget.state;
    state?.change({ matchCase: !state.matchCase }, false);
  }
});

registerActiveXtermAction({
  id: "workbench.action.terminal.findNext" /* FindNext */,
  title: localize2(20718, "Find Next"),
  keybinding: [
    {
      primary: 61 /* F3 */,
      mac: { primary: 2048 /* CtrlCmd */ | 37 /* KeyG */, secondary: [61 /* F3 */] },
      when: ContextKeyExpr.or(TerminalContextKeys.focusInAny, TerminalContextKeys.findFocus),
      weight: 200 /* WorkbenchContrib */
    },
    {
      primary: 1024 /* Shift */ | 3 /* Enter */,
      when: TerminalContextKeys.findInputFocus,
      weight: 200 /* WorkbenchContrib */
    }
  ],
  precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
  run: (_xterm, _accessor, activeInstance) => {
    const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
    const widget = contr?.findWidget;
    if (widget) {
      widget.show();
      widget.find(false);
    }
  }
});

registerActiveXtermAction({
  id: "workbench.action.terminal.findPrevious" /* FindPrevious */,
  title: localize2(20719, "Find Previous"),
  keybinding: [
    {
      primary: 1024 /* Shift */ | 61 /* F3 */,
      mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KeyG */, secondary: [1024 /* Shift */ | 61 /* F3 */] },
      when: ContextKeyExpr.or(TerminalContextKeys.focusInAny, TerminalContextKeys.findFocus),
      weight: 200 /* WorkbenchContrib */
    },
    {
      primary: 3 /* Enter */,
      when: TerminalContextKeys.findInputFocus,
      weight: 200 /* WorkbenchContrib */
    }
  ],
  precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
  run: (_xterm, _accessor, activeInstance) => {
    const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
    const widget = contr?.findWidget;
    if (widget) {
      widget.show();
      widget.find(true);
    }
  }
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.searchWorkspace" /* SearchWorkspace */,
  title: localize2(20722, "Search Workspace"),
  keybinding: [
    {
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 36 /* KeyF */,
      when: ContextKeyExpr.and(TerminalContextKeys.processSupported, TerminalContextKeys.focus, TerminalContextKeys.textSelected),
      weight: 200 /* WorkbenchContrib */ + 50
    }
  ],
  run: (activeInstance, c, accessor) => findInFilesCommand(accessor, { query: activeInstance.selection })
});

AccessibleViewRegistry.register(new TerminalFindAccessibilityHelp());
export { TerminalFindContribution };
