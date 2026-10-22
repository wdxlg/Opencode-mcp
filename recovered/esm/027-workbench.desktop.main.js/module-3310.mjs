// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/accessibility/browser/terminal.accessibility.contribution.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { TextAreaSyncAddon } from "./module-3309.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerTerminalContribution } from "./module-2354.mjs";
import { AccessibilityHelpAction, AccessibleViewAction } from "./module-1375.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { Event2 } from "./module-0017.mjs";
import { accessibleViewCurrentProviderId, accessibleViewIsShown } from "./module-1370.mjs";
import { BufferContentTracker } from "./module-3306.mjs";
import { TerminalAccessibleBufferProvider } from "./module-3308.mjs";
import { TerminalAccessibilityHelpProvider } from "./module-3307.mjs";
import { isWindows } from "./module-0014.mjs";
import { Position } from "./module-0079.mjs";
import { status } from "./module-0076.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { isFullTerminalCommand } from "./module-3053.mjs";
import { IAccessibleViewService } from "./module-0799.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { ITerminalService } from "./module-1149.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { registerTerminalAction } from "./module-3272.mjs";


// src/vs/workbench/contrib/terminalContrib/accessibility/browser/terminal.accessibility.contribution.ts
var TextAreaSyncContribution = class extends DisposableStore {
  constructor(_ctx, _instantiationService) {
    super();
    this._ctx = _ctx;
    this._instantiationService = _instantiationService;
  }
  static {
    this.ID = "terminal.textAreaSync";
  }
  static get(instance2) {
    return instance2.getContribution(TextAreaSyncContribution.ID);
  }
  layout(xterm) {
    if (this._addon) {
      return;
    }
    this._addon = this.add(this._instantiationService.createInstance(TextAreaSyncAddon, this._ctx.instance.capabilities));
    xterm.raw.loadAddon(this._addon);
    this._addon.activate(xterm.raw);
  }
};

TextAreaSyncContribution = __decorateClass([
  __decorateParam(1, IInstantiationService)
], TextAreaSyncContribution);

registerTerminalContribution(TextAreaSyncContribution.ID, TextAreaSyncContribution);

var TerminalAccessibleViewContribution = class extends Disposable {
  constructor(_ctx, _accessibilitySignalService, _accessibleViewService, _configurationService, _contextKeyService, _instantiationService, _terminalService) {
    super();
    this._ctx = _ctx;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._accessibleViewService = _accessibleViewService;
    this._configurationService = _configurationService;
    this._contextKeyService = _contextKeyService;
    this._instantiationService = _instantiationService;
    this._terminalService = _terminalService;
    this._onDidRunCommand = this._register(new MutableDisposable());
    this._register(AccessibleViewAction.addImplementation(90, "terminal", () => {
      if (this._terminalService.activeInstance !== this._ctx.instance) {
        return false;
      }
      this.show();
      return true;
    }, TerminalContextKeys.focus));
    this._register(this._ctx.instance.onDidExecuteText(() => {
      const focusAfterRun = _configurationService.getValue("terminal.integrated.focusAfterRun" /* FocusAfterRun */);
      if (focusAfterRun === "terminal") {
        this._ctx.instance.focus(true);
      } else if (focusAfterRun === "accessible-buffer") {
        this.show();
      }
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("terminal.integrated.accessibleViewFocusOnCommandExecution" /* AccessibleViewFocusOnCommandExecution */)) {
        this._updateCommandExecutedListener();
      }
    }));
    this._register(this._ctx.instance.capabilities.onDidAddCapability((e) => {
      if (e.capability.type === 2 /* CommandDetection */) {
        this._updateCommandExecutedListener();
      }
    }));
  }
  static {
    this.ID = "terminal.accessibleBufferProvider";
  }
  static get(instance2) {
    return instance2.getContribution(TerminalAccessibleViewContribution.ID);
  }
  xtermReady(xterm) {
    const addon = this._instantiationService.createInstance(TextAreaSyncAddon, this._ctx.instance.capabilities);
    xterm.raw.loadAddon(addon);
    addon.activate(xterm.raw);
    this._xterm = xterm;
    this._register(this._xterm.raw.onWriteParsed(async () => {
      if (this._terminalService.activeInstance !== this._ctx.instance) {
        return;
      }
      if (this._isTerminalAccessibleViewOpen() && this._xterm.raw.buffer.active.baseY === 0) {
        this._bufferProvider?.refresh();
      }
    }));
    const onRequestUpdateEditor = Event2.latch(this._xterm.raw.onScroll);
    this._register(onRequestUpdateEditor(() => {
      if (this._terminalService.activeInstance !== this._ctx.instance) {
        return;
      }
      if (this._isTerminalAccessibleViewOpen()) {
        this._bufferProvider?.refresh();
      }
    }));
  }
  _updateCommandExecutedListener() {
    if (!this._ctx.instance.capabilities.has(2 /* CommandDetection */)) {
      return;
    }
    if (!this._configurationService.getValue("terminal.integrated.accessibleViewFocusOnCommandExecution" /* AccessibleViewFocusOnCommandExecution */)) {
      this._onDidRunCommand.clear();
      return;
    } else if (this._onDidRunCommand.value) {
      return;
    }
    const capability = this._ctx.instance.capabilities.get(2 /* CommandDetection */);
    this._onDidRunCommand.value = capability.onCommandExecuted(() => {
      if (this._ctx.instance.hasFocus) {
        this.show();
      }
    });
  }
  _isTerminalAccessibleViewOpen() {
    return accessibleViewCurrentProviderId.getValue(this._contextKeyService) === "terminal" /* Terminal */;
  }
  show() {
    if (!this._xterm) {
      return;
    }
    if (!this._bufferTracker) {
      this._bufferTracker = this._register(this._instantiationService.createInstance(BufferContentTracker, this._xterm));
    }
    if (!this._bufferProvider) {
      this._bufferProvider = this._register(this._instantiationService.createInstance(TerminalAccessibleBufferProvider, this._ctx.instance, this._bufferTracker, () => {
        return this._register(this._instantiationService.createInstance(TerminalAccessibilityHelpProvider, this._ctx.instance, this._xterm)).provideContent();
      }));
    }
    this._accessibleViewService.show(this._bufferProvider);
  }
  navigateToCommand(type) {
    const currentLine = this._accessibleViewService.getPosition("terminal" /* Terminal */)?.lineNumber;
    const commands = this._getCommandsWithEditorLine();
    if (!commands?.length || !currentLine) {
      return;
    }
    const filteredCommands = type === "previous" /* Previous */ ? commands.filter((c) => c.lineNumber < currentLine).sort((a, b) => b.lineNumber - a.lineNumber) : commands.filter((c) => c.lineNumber > currentLine).sort((a, b) => a.lineNumber - b.lineNumber);
    if (!filteredCommands.length) {
      return;
    }
    const command4 = filteredCommands[0];
    const commandLine = command4.command.command;
    if (!isWindows && commandLine) {
      this._accessibleViewService.setPosition(new Position(command4.lineNumber, 1), true);
      status(commandLine);
    } else {
      this._accessibleViewService.setPosition(new Position(command4.lineNumber, 1), true, true);
    }
    if (command4.exitCode) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.terminalCommandFailed);
    } else {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.terminalCommandSucceeded);
    }
  }
  _getCommandsWithEditorLine() {
    const capability = this._ctx.instance.capabilities.get(2 /* CommandDetection */);
    const commands = capability?.commands;
    const currentCommand = capability?.currentCommand;
    if (!commands?.length) {
      return;
    }
    const result = [];
    for (const command4 of commands) {
      const lineNumber = this._getEditorLineForCommand(command4);
      if (!lineNumber) {
        continue;
      }
      result.push({ command: command4, lineNumber, exitCode: command4.exitCode });
    }
    if (currentCommand) {
      const lineNumber = this._getEditorLineForCommand(currentCommand);
      if (!!lineNumber) {
        result.push({ command: currentCommand, lineNumber });
      }
    }
    return result;
  }
  _getEditorLineForCommand(command4) {
    if (!this._bufferTracker) {
      return;
    }
    let line;
    if (isFullTerminalCommand(command4)) {
      line = command4.marker?.line;
    } else {
      line = command4.commandStartMarker?.line;
    }
    if (line === void 0 || line < 0) {
      return;
    }
    line = this._bufferTracker.bufferToEditorLineMapping.get(line);
    if (line === void 0) {
      return;
    }
    return line + 1;
  }
};

TerminalAccessibleViewContribution = __decorateClass([
  __decorateParam(1, IAccessibilitySignalService),
  __decorateParam(2, IAccessibleViewService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ITerminalService)
], TerminalAccessibleViewContribution);

registerTerminalContribution(TerminalAccessibleViewContribution.ID, TerminalAccessibleViewContribution);

var TerminalAccessibilityHelpContribution = class extends Disposable {
  constructor() {
    super();
    this._register(AccessibilityHelpAction.addImplementation(105, "terminal", async (accessor) => {
      const instantiationService = accessor.get(IInstantiationService);
      const terminalService = accessor.get(ITerminalService);
      const accessibleViewService = accessor.get(IAccessibleViewService);
      const instance2 = await terminalService.getActiveOrCreateInstance();
      await terminalService.revealActiveTerminal();
      const terminal2 = instance2?.xterm;
      if (!terminal2) {
        return;
      }
      accessibleViewService.show(instantiationService.createInstance(TerminalAccessibilityHelpProvider, instance2, terminal2));
    }, ContextKeyExpr.or(TerminalContextKeys.focus, ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal" /* Terminal */)))));
  }
};

registerTerminalContribution(TerminalAccessibilityHelpContribution.ID, TerminalAccessibilityHelpContribution);

var FocusAccessibleBufferAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.terminal.focusAccessibleBuffer" /* FocusAccessibleBuffer */,
      title: localize2(20372, "Focus Accessible Terminal View"),
      precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
      keybinding: [
        {
          primary: 512 /* Alt */ | 60 /* F2 */,
          secondary: [2048 /* CtrlCmd */ | 16 /* UpArrow */],
          linux: {
            primary: 512 /* Alt */ | 60 /* F2 */ | 1024 /* Shift */,
            secondary: [2048 /* CtrlCmd */ | 16 /* UpArrow */]
          },
          weight: 200 /* WorkbenchContrib */,
          when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, TerminalContextKeys.focus)
        }
      ]
    });
  }
  async run(accessor, ...args2) {
    const terminalService = accessor.get(ITerminalService);
    const terminal2 = await terminalService.getActiveOrCreateInstance();
    if (!terminal2?.xterm) {
      return;
    }
    TerminalAccessibleViewContribution.get(terminal2)?.show();
  }
};

registerAction2(FocusAccessibleBufferAction);

registerTerminalAction({
  id: "workbench.action.terminal.accessibleBufferGoToNextCommand" /* AccessibleBufferGoToNextCommand */,
  title: localize2(20370, "Accessible Buffer Go to Next Command"),
  precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated, ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal" /* Terminal */))),
  keybinding: [
    {
      primary: 512 /* Alt */ | 18 /* DownArrow */,
      when: ContextKeyExpr.and(ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal" /* Terminal */))),
      weight: 200 /* WorkbenchContrib */ + 2
    }
  ],
  run: async (c) => {
    const instance2 = c.service.activeInstance;
    if (!instance2) {
      return;
    }
    TerminalAccessibleViewContribution.get(instance2)?.navigateToCommand("next" /* Next */);
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.accessibleBufferGoToPreviousCommand" /* AccessibleBufferGoToPreviousCommand */,
  title: localize2(20371, "Accessible Buffer Go to Previous Command"),
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal" /* Terminal */))),
  keybinding: [
    {
      primary: 512 /* Alt */ | 16 /* UpArrow */,
      when: ContextKeyExpr.and(ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal" /* Terminal */))),
      weight: 200 /* WorkbenchContrib */ + 2
    }
  ],
  run: async (c) => {
    const instance2 = c.service.activeInstance;
    if (!instance2) {
      return;
    }
    TerminalAccessibleViewContribution.get(instance2)?.navigateToCommand("previous" /* Previous */);
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.scrollToBottomAccessibleView" /* ScrollToBottomAccessibleView */,
  title: localize2(20373, "Scroll to Accessible View Bottom"),
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal" /* Terminal */))),
  keybinding: {
    primary: 2048 /* CtrlCmd */ | 13 /* End */,
    linux: { primary: 1024 /* Shift */ | 13 /* End */ },
    when: accessibleViewCurrentProviderId.isEqualTo("terminal" /* Terminal */),
    weight: 200 /* WorkbenchContrib */
  },
  run: (c, accessor) => {
    const accessibleViewService = accessor.get(IAccessibleViewService);
    const lastPosition = accessibleViewService.getLastPosition();
    if (!lastPosition) {
      return;
    }
    accessibleViewService.setPosition(lastPosition, true);
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.scrollToTopAccessibleView" /* ScrollToTopAccessibleView */,
  title: localize2(20374, "Scroll to Accessible View Top"),
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal" /* Terminal */))),
  keybinding: {
    primary: 2048 /* CtrlCmd */ | 14 /* Home */,
    linux: { primary: 1024 /* Shift */ | 14 /* Home */ },
    when: accessibleViewCurrentProviderId.isEqualTo("terminal" /* Terminal */),
    weight: 200 /* WorkbenchContrib */
  },
  run: (c, accessor) => accessor.get(IAccessibleViewService)?.setPosition(new Position(1, 1), true)
});
export { TextAreaSyncContribution, TerminalAccessibleViewContribution, TerminalAccessibilityHelpContribution, FocusAccessibleBufferAction };
