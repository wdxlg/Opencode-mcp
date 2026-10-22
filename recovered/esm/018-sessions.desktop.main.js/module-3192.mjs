// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/history/browser/terminal.history.contribution.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { clearShellFileHistory, getCommandHistory, getDirectoryHistory } from "./module-3189.mjs";
import { showRunRecentQuickPick } from "./module-3191.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerTerminalContribution } from "./module-2329.mjs";
import { registerActiveInstanceAction, registerTerminalAction } from "./module-3043.mjs";
import { localize2 } from "./module-0001.mjs";
import { MenuId } from "./module-0092.mjs";
import { TERMINAL_VIEW_ID } from "./module-1174.mjs";
import { ResourceContextKey } from "./module-0950.mjs";
import { Schemas } from "./module-0033.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { accessibleViewCurrentProviderId, accessibleViewIsShown } from "./module-1369.mjs";


// src/vs/workbench/contrib/terminalContrib/history/browser/terminal.history.contribution.ts
var TerminalHistoryContribution = class extends Disposable {
  constructor(_ctx, contextKeyService, _instantiationService) {
    super();
    this._ctx = _ctx;
    this._instantiationService = _instantiationService;
    this._terminalInRunCommandPicker = TerminalContextKeys.inTerminalRunCommandPicker.bindTo(contextKeyService);
    const capabilityListeners = this._register(new DisposableMap());
    this._register(_ctx.instance.capabilities.onDidAddCapability((e4) => {
      capabilityListeners.deleteAndDispose(e4.id);
      switch (e4.id) {
        case 0 /* CwdDetection */: {
          const store = new DisposableStore();
          store.add(e4.capability.onDidChangeCwd((e5) => {
            this._instantiationService.invokeFunction(getDirectoryHistory)?.add(e5, { remoteAuthority: _ctx.instance.remoteAuthority });
          }));
          capabilityListeners.set(e4.id, store);
          break;
        }
        case 2 /* CommandDetection */: {
          const store = new DisposableStore();
          store.add(e4.capability.onCommandFinished((e5) => {
            if (e5.command.trim().length > 0) {
              this._instantiationService.invokeFunction(getCommandHistory)?.add(e5.command, { shellType: _ctx.instance.shellType });
            }
          }));
          capabilityListeners.set(e4.id, store);
          break;
        }
      }
    }));
    this._register(_ctx.instance.capabilities.onDidRemoveCapability((e4) => {
      capabilityListeners.deleteAndDispose(e4.id);
    }));
  }
  static {
    this.ID = "terminal.history";
  }
  static get(instance2) {
    return instance2.getContribution(TerminalHistoryContribution.ID);
  }
  /**
   * Triggers a quick pick that displays recent commands or cwds. Selecting one will
   * rerun it in the active terminal.
   */
  async runRecent(type, filterMode, value2) {
    return this._instantiationService.invokeFunction(
      showRunRecentQuickPick,
      this._ctx.instance,
      this._terminalInRunCommandPicker,
      type,
      filterMode,
      value2
    );
  }
};

TerminalHistoryContribution = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IInstantiationService)
], TerminalHistoryContribution);

registerTerminalContribution(TerminalHistoryContribution.ID, TerminalHistoryContribution);

var precondition = ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated);

registerTerminalAction({
  id: "workbench.action.terminal.clearPreviousSessionHistory" /* ClearPreviousSessionHistory */,
  title: localize2(20756, "Clear Previous Session History"),
  precondition,
  run: async (c, accessor) => {
    getCommandHistory(accessor).clear();
    clearShellFileHistory();
  }
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.goToRecentDirectory" /* GoToRecentDirectory */,
  title: localize2(20757, "Go to Recent Directory..."),
  metadata: {
    description: localize2(20755, "Goes to a recent folder")
  },
  precondition,
  keybinding: {
    primary: 2048 /* CtrlCmd */ | 37 /* KeyG */,
    when: TerminalContextKeys.focus,
    weight: 200 /* WorkbenchContrib */
  },
  menu: [
    {
      id: MenuId.ViewTitle,
      group: "shellIntegration",
      order: 0,
      when: ContextKeyExpr.equals("view", TERMINAL_VIEW_ID),
      isHiddenByDefault: true
    },
    ...[MenuId.EditorTitle, MenuId.CompactWindowEditorTitle].map((id2) => ({
      id: id2,
      group: "1_shellIntegration",
      order: 0,
      when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
      isHiddenByDefault: true
    }))
  ],
  run: async (activeInstance, c) => {
    const history = TerminalHistoryContribution.get(activeInstance);
    if (!history) {
      return;
    }
    await history.runRecent("cwd");
    if (activeInstance?.target === 2 /* Editor */) {
      await c.editorService.revealActiveEditor();
    } else {
      await c.groupService.showPanel(false);
    }
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.runRecentCommand" /* RunRecentCommand */,
  title: localize2(20758, "Run Recent Command..."),
  precondition,
  keybinding: [
    {
      primary: 2048 /* CtrlCmd */ | 48 /* KeyR */,
      when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, ContextKeyExpr.or(TerminalContextKeys.focus, ContextKeyExpr.and(accessibleViewIsShown, accessibleViewCurrentProviderId.isEqualTo("terminal" /* Terminal */)))),
      weight: 200 /* WorkbenchContrib */
    },
    {
      primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 48 /* KeyR */,
      mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 48 /* KeyR */ },
      when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      weight: 200 /* WorkbenchContrib */
    }
  ],
  menu: [
    {
      id: MenuId.ViewTitle,
      group: "shellIntegration",
      order: 1,
      when: ContextKeyExpr.equals("view", TERMINAL_VIEW_ID),
      isHiddenByDefault: true
    },
    ...[MenuId.EditorTitle, MenuId.CompactWindowEditorTitle].map((id2) => ({
      id: id2,
      group: "1_shellIntegration",
      order: 1,
      when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
      isHiddenByDefault: true
    }))
  ],
  run: async (c, accessor) => {
    let activeInstance = c.service.activeInstance;
    if (!activeInstance) {
      const newInstance = activeInstance = await c.service.getActiveOrCreateInstance();
      await c.service.revealActiveTerminal();
      const store = new DisposableStore();
      const wasDisposedPrematurely = await new Promise((r2) => {
        store.add(newInstance.onDidChangeShellType(() => r2(false)));
        store.add(newInstance.onDisposed(() => r2(true)));
      });
      store.dispose();
      if (wasDisposedPrematurely) {
        return;
      }
    }
    const history = TerminalHistoryContribution.get(activeInstance);
    if (!history) {
      return;
    }
    await history.runRecent("command");
    if (activeInstance?.target === 2 /* Editor */) {
      await c.editorService.revealActiveEditor();
    } else {
      await c.groupService.showPanel(false);
    }
  }
});
export { TerminalHistoryContribution, precondition };
