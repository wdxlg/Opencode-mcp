// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/accessibility/browser/terminalAccessibleBufferProvider.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { isFullTerminalCommand } from "./module-3053.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITerminalService } from "./module-1149.mjs";


// src/vs/workbench/contrib/terminalContrib/accessibility/browser/terminalAccessibleBufferProvider.ts
var TerminalAccessibleBufferProvider = class extends Disposable {
  constructor(_instance, _bufferTracker, customHelp, configurationService, terminalService) {
    super();
    this._instance = _instance;
    this._bufferTracker = _bufferTracker;
    this.id = "terminal" /* Terminal */;
    this.options = { type: "view" /* View */, language: "terminal", id: "terminal" /* Terminal */ };
    this.verbositySettingKey = "accessibility.verbosity.terminal" /* Terminal */;
    this._onDidRequestClearProvider = this._register(new Emitter());
    this.onDidRequestClearLastProvider = this._onDidRequestClearProvider.event;
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this.options.customHelp = customHelp;
    this._updatePosition(configurationService);
    this._register(this._instance.onDisposed(() => this._onDidRequestClearProvider.fire("terminal" /* Terminal */)));
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("terminal.integrated.accessibleViewPreserveCursorPosition" /* AccessibleViewPreserveCursorPosition */)) {
        this._updatePosition(configurationService);
      }
    }));
    this._focusedInstance = terminalService.activeInstance;
    this._register(terminalService.onDidChangeActiveInstance(() => {
      if (terminalService.activeInstance && this._focusedInstance?.instanceId !== terminalService.activeInstance?.instanceId) {
        this._onDidRequestClearProvider.fire("terminal" /* Terminal */);
        this._focusedInstance = terminalService.activeInstance;
      }
    }));
  }
  _updatePosition(configurationService) {
    const preserveCursorPosition = configurationService.getValue("terminal.integrated.accessibleViewPreserveCursorPosition" /* AccessibleViewPreserveCursorPosition */);
    this.options.position = preserveCursorPosition === "always" /* Always */ ? "initial-bottom-preserve" : preserveCursorPosition ? "initial-bottom" : "bottom";
  }
  refresh() {
    this._onDidChangeContent.fire();
  }
  onClose() {
    this._instance.focus();
  }
  provideContent() {
    this._bufferTracker.update();
    return this._bufferTracker.lines.join("\n");
  }
  getSymbols() {
    const commands = this._getCommandsWithEditorLine() ?? [];
    const symbols = [];
    for (const command4 of commands) {
      const label3 = command4.command.command;
      if (label3) {
        symbols.push({
          label: label3,
          lineNumber: command4.lineNumber
        });
      }
    }
    return symbols;
  }
  _getCommandsWithEditorLine() {
    const capability = this._instance.capabilities.get(2 /* CommandDetection */);
    const commands = capability?.commands;
    const currentCommand = capability?.currentCommand;
    if (!commands?.length) {
      return;
    }
    const result = [];
    for (const command4 of commands) {
      const lineNumber = this._getEditorLineForCommand(command4);
      if (lineNumber === void 0) {
        continue;
      }
      result.push({ command: command4, lineNumber, exitCode: command4.exitCode });
    }
    if (currentCommand) {
      const lineNumber = this._getEditorLineForCommand(currentCommand);
      if (lineNumber !== void 0) {
        result.push({ command: currentCommand, lineNumber });
      }
    }
    return result;
  }
  _getEditorLineForCommand(command4) {
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

TerminalAccessibleBufferProvider = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ITerminalService)
], TerminalAccessibleBufferProvider);
export { TerminalAccessibleBufferProvider };
