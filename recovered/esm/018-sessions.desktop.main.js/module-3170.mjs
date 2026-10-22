// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/clipboard/browser/terminal.clipboard.contribution.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Schemas } from "./module-0033.mjs";
import { shouldPasteTerminalText } from "./module-3169.mjs";
import { BrowserFeatures } from "./module-0020.mjs";
import { isLinux, isMacintosh } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ITerminalConfigurationService } from "./module-1150.mjs";
import { registerTerminalContribution } from "./module-2329.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { registerActiveInstanceAction, registerActiveXtermAction } from "./module-3043.mjs";
import { localize2 } from "./module-0001.mjs";
import { isString } from "./module-0010.mjs";
import { terminalStrings } from "./module-3030.mjs";


// src/vs/workbench/contrib/terminalContrib/clipboard/browser/terminal.clipboard.contribution.ts
var TerminalClipboardContribution = class extends Disposable {
  constructor(_ctx, _clipboardService, _configurationService, _instantiationService, _notificationService, _terminalConfigurationService) {
    super();
    this._ctx = _ctx;
    this._clipboardService = _clipboardService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._notificationService = _notificationService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._overrideCopySelection = void 0;
    this._onWillPaste = this._register(new Emitter());
    this.onWillPaste = this._onWillPaste.event;
    this._onDidPaste = this._register(new Emitter());
    this.onDidPaste = this._onDidPaste.event;
  }
  static {
    this.ID = "terminal.clipboard";
  }
  static get(instance2) {
    return instance2.getContribution(TerminalClipboardContribution.ID);
  }
  xtermReady(xterm) {
    this._xterm = xterm;
    this._register(xterm.onDidRequestCopyAsHtml((e4) => this.copySelection(true, e4.command)));
    this._register(xterm.raw.onSelectionChange(async () => {
      if (this._configurationService.getValue("terminal.integrated.copyOnSelection" /* CopyOnSelection */)) {
        if (this._overrideCopySelection === false) {
          return;
        }
        if (this._ctx.instance.hasSelection()) {
          await this.copySelection();
        }
      }
    }));
  }
  async copySelection(asHtml, command4) {
    this._xterm?.copySelection(asHtml, command4);
  }
  /**
   * Focuses and pastes the contents of the clipboard into the terminal instance.
   */
  async paste() {
    let text2 = await this._clipboardService.readText();
    if (!text2) {
      const [resource] = await this._clipboardService.readResources();
      if (resource?.scheme === Schemas.file) {
        text2 = resource.fsPath;
      }
    }
    await this._paste(text2);
  }
  /**
   * Focuses and pastes the contents of the selection clipboard into the terminal instance.
   */
  async pasteSelection() {
    await this._paste(await this._clipboardService.readText("selection"));
  }
  async _paste(value2) {
    if (!this._xterm) {
      return;
    }
    let currentText = value2;
    const shouldPasteText = await this._instantiationService.invokeFunction(shouldPasteTerminalText, currentText, this._xterm?.raw.modes.bracketedPasteMode);
    if (!shouldPasteText) {
      return;
    }
    if (typeof shouldPasteText === "object") {
      currentText = shouldPasteText.modifiedText;
    }
    this._ctx.instance.focus();
    this._onWillPaste.fire(currentText);
    this._xterm.raw.paste(currentText);
    this._onDidPaste.fire(currentText);
  }
  async handleMouseEvent(event) {
    switch (event.button) {
      case 1: {
        if (this._terminalConfigurationService.config.middleClickBehavior === "paste") {
          this.paste();
          return { handled: true };
        }
        break;
      }
      case 2: {
        if (event.shiftKey) {
          return;
        }
        const rightClickBehavior = this._terminalConfigurationService.config.rightClickBehavior;
        if (rightClickBehavior !== "copyPaste" && rightClickBehavior !== "paste") {
          return;
        }
        if (rightClickBehavior === "copyPaste" && this._ctx.instance.hasSelection()) {
          await this.copySelection();
          this._ctx.instance.clearSelection();
        } else {
          if (BrowserFeatures.clipboard.readText) {
            this.paste();
          } else {
            this._notificationService.info(`This browser doesn't support the clipboard.readText API needed to trigger a paste, try ${isMacintosh ? "\u2318" : "Ctrl"}+V instead.`);
          }
        }
        if (isMacintosh) {
          setTimeout(() => this._ctx.instance.clearSelection(), 0);
        }
        return { handled: true };
      }
    }
  }
  /**
   * Override the copy on selection feature with a custom value.
   * @param value Whether to enable copySelection.
   */
  overrideCopyOnSelection(value2) {
    if (this._overrideCopySelection !== void 0) {
      throw new Error("Cannot set a copy on selection override multiple times");
    }
    this._overrideCopySelection = value2;
    return toDisposable(() => this._overrideCopySelection = void 0);
  }
};

TerminalClipboardContribution = __decorateClass([
  __decorateParam(1, IClipboardService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, ITerminalConfigurationService)
], TerminalClipboardContribution);

registerTerminalContribution(TerminalClipboardContribution.ID, TerminalClipboardContribution, false);

var terminalAvailableWhenClause = ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated);

registerActiveInstanceAction({
  id: "workbench.action.terminal.copyLastCommand" /* CopyLastCommand */,
  title: localize2(20694, "Copy Last Command"),
  precondition: terminalAvailableWhenClause,
  run: async (instance2, c, accessor) => {
    const clipboardService = accessor.get(IClipboardService);
    const commands = instance2.capabilities.get(2 /* CommandDetection */)?.commands;
    if (!commands || commands.length === 0) {
      return;
    }
    const command4 = commands[commands.length - 1];
    if (!command4.command) {
      return;
    }
    await clipboardService.writeText(command4.command);
  }
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.copyLastCommandOutput" /* CopyLastCommandOutput */,
  title: localize2(20696, "Copy Last Command Output"),
  precondition: terminalAvailableWhenClause,
  run: async (instance2, c, accessor) => {
    const clipboardService = accessor.get(IClipboardService);
    const commands = instance2.capabilities.get(2 /* CommandDetection */)?.commands;
    if (!commands || commands.length === 0) {
      return;
    }
    const command4 = commands[commands.length - 1];
    if (!command4?.hasOutput()) {
      return;
    }
    const output = command4.getOutput();
    if (isString(output)) {
      await clipboardService.writeText(output);
    }
  }
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.copyLastCommandAndLastCommandOutput" /* CopyLastCommandAndLastCommandOutput */,
  title: localize2(20695, "Copy Last Command and Output"),
  precondition: terminalAvailableWhenClause,
  run: async (instance2, c, accessor) => {
    const clipboardService = accessor.get(IClipboardService);
    const commands = instance2.capabilities.get(2 /* CommandDetection */)?.commands;
    if (!commands || commands.length === 0) {
      return;
    }
    const command4 = commands[commands.length - 1];
    if (!command4?.hasOutput()) {
      return;
    }
    const output = command4.getOutput();
    if (isString(output)) {
      await clipboardService.writeText(`${command4.command !== "" ? command4.command + "\n" : ""}${output}`);
    }
  }
});

if (BrowserFeatures.clipboard.writeText) {
  registerActiveXtermAction({
    id: "workbench.action.terminal.copySelection" /* CopySelection */,
    title: localize2(20697, "Copy Selection"),
    // TODO: Why is copy still showing up when text isn't selected?
    precondition: ContextKeyExpr.or(TerminalContextKeys.textSelectedInFocused, ContextKeyExpr.and(terminalAvailableWhenClause, TerminalContextKeys.textSelected)),
    keybinding: [{
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 33 /* KeyC */,
      mac: { primary: 2048 /* CtrlCmd */ | 33 /* KeyC */ },
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.or(
        ContextKeyExpr.and(TerminalContextKeys.textSelected, TerminalContextKeys.focus),
        TerminalContextKeys.textSelectedInFocused
      )
    }],
    run: (activeInstance) => activeInstance.copySelection()
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.copyAndClearSelection" /* CopyAndClearSelection */,
    title: localize2(20693, "Copy and Clear Selection"),
    precondition: ContextKeyExpr.or(TerminalContextKeys.textSelectedInFocused, ContextKeyExpr.and(terminalAvailableWhenClause, TerminalContextKeys.textSelected)),
    keybinding: [{
      win: { primary: 2048 /* CtrlCmd */ | 33 /* KeyC */ },
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.or(
        ContextKeyExpr.and(TerminalContextKeys.textSelected, TerminalContextKeys.focus),
        TerminalContextKeys.textSelectedInFocused
      )
    }],
    run: async (xterm) => {
      await xterm.copySelection();
      xterm.clearSelection();
    }
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.copySelectionAsHtml" /* CopySelectionAsHtml */,
    title: localize2(20698, "Copy Selection as HTML"),
    f1: true,
    category: terminalStrings.actionCategory,
    precondition: ContextKeyExpr.or(TerminalContextKeys.textSelectedInFocused, ContextKeyExpr.and(terminalAvailableWhenClause, TerminalContextKeys.textSelected)),
    run: (xterm) => xterm.copySelection(true)
  });
}

if (BrowserFeatures.clipboard.readText) {
  registerActiveInstanceAction({
    id: "workbench.action.terminal.paste" /* Paste */,
    title: localize2(20699, "Paste into Active Terminal"),
    precondition: terminalAvailableWhenClause,
    keybinding: [{
      primary: 2048 /* CtrlCmd */ | 52 /* KeyV */,
      win: { primary: 2048 /* CtrlCmd */ | 52 /* KeyV */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 52 /* KeyV */] },
      linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 52 /* KeyV */ },
      weight: 200 /* WorkbenchContrib */,
      when: TerminalContextKeys.focus
    }],
    run: (activeInstance) => TerminalClipboardContribution.get(activeInstance)?.paste()
  });
}

if (BrowserFeatures.clipboard.readText && isLinux) {
  registerActiveInstanceAction({
    id: "workbench.action.terminal.pasteSelection" /* PasteSelection */,
    title: localize2(20700, "Paste Selection into Active Terminal"),
    precondition: terminalAvailableWhenClause,
    keybinding: [{
      linux: { primary: 1024 /* Shift */ | 19 /* Insert */ },
      weight: 200 /* WorkbenchContrib */,
      when: TerminalContextKeys.focus
    }],
    run: (activeInstance) => TerminalClipboardContribution.get(activeInstance)?.pasteSelection()
  });
}
export { TerminalClipboardContribution, terminalAvailableWhenClause };
