// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/quickFix/browser/quickFixAddon.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { updateLayout } from "./module-2327.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { EventType, addDisposableListener } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ITerminalQuickFixService } from "./module-1274.mjs";
import { getLinesForCommand } from "./module-3062.mjs";
import { asArray } from "./module-0007.mjs";
import { hasKey } from "./module-0010.mjs";
import { localize } from "./module-0001.mjs";
import { Schemas } from "./module-0033.mjs";
import { CodeActionKind } from "./module-0558.mjs";


// src/vs/workbench/contrib/terminalContrib/quickFix/browser/quickFixAddon.ts
var quickFixClasses = [
  "quick-fix" /* QuickFix */,
  "codicon" /* Codicon */,
  "terminal-command-decoration" /* CommandDecoration */,
  "xterm-decoration" /* XtermDecoration */
];

var TerminalQuickFixAddon = class extends Disposable {
  constructor(_sessionId, _aliases, _capabilities, _accessibilitySignalService, _actionWidgetService, _commandService, _configurationService, _extensionService, _labelService, _openerService, _telemetryService, _quickFixService) {
    super();
    this._sessionId = _sessionId;
    this._aliases = _aliases;
    this._capabilities = _capabilities;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._actionWidgetService = _actionWidgetService;
    this._commandService = _commandService;
    this._configurationService = _configurationService;
    this._extensionService = _extensionService;
    this._labelService = _labelService;
    this._openerService = _openerService;
    this._telemetryService = _telemetryService;
    this._quickFixService = _quickFixService;
    this._commandListeners = /* @__PURE__ */ new Map();
    this._decoration = this._register(new MutableDisposable());
    this._decorationDisposables = this._register(new MutableDisposable());
    this._registeredSelectors = /* @__PURE__ */ new Set();
    this._didRun = false;
    this._onDidRequestRerunCommand = this._register(new Emitter());
    this.onDidRequestRerunCommand = this._onDidRequestRerunCommand.event;
    this._onDidUpdateQuickFixes = this._register(new Emitter());
    this.onDidUpdateQuickFixes = this._onDidUpdateQuickFixes.event;
    const commandDetectionCapability = this._capabilities.get(2 /* CommandDetection */);
    if (commandDetectionCapability) {
      this._registerCommandHandlers();
    } else {
      this._register(this._capabilities.onDidAddCommandDetectionCapability(() => {
        this._registerCommandHandlers();
      }));
    }
    this._register(this._quickFixService.onDidRegisterProvider((result) => this.registerCommandFinishedListener(convertToQuickFixOptions(result))));
    this._quickFixService.extensionQuickFixes.then((quickFixSelectors) => {
      for (const selector of quickFixSelectors) {
        this.registerCommandSelector(selector);
      }
    });
    this._register(this._quickFixService.onDidRegisterCommandSelector((selector) => this.registerCommandSelector(selector)));
    this._register(this._quickFixService.onDidUnregisterProvider((id2) => this._commandListeners.delete(id2)));
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("terminal.integrated.shellIntegration.quickFixEnabled" /* ShellIntegrationQuickFixEnabled */)) {
        this._decoration.clear();
        this._decorationDisposables.clear();
      }
    }));
  }
  activate(terminal2) {
    this._terminal = terminal2;
  }
  showMenu() {
    if (!this._currentRenderContext) {
      return;
    }
    const actions = this._currentRenderContext.quickFixes.map((f) => new TerminalQuickFixItem(f, f.type, f.source, f.label, f.kind));
    const actionSet = {
      allActions: actions,
      hasAutoFix: false,
      hasAIFix: false,
      allAIFixes: false,
      validActions: actions,
      dispose: () => {
      }
    };
    const delegate = {
      onSelect: async (fix) => {
        fix.action?.run();
        this._actionWidgetService.hide();
      },
      onHide: () => {
        this._terminal?.focus();
      }
    };
    this._actionWidgetService.show("quickFixWidget", false, toActionWidgetItems(actionSet.validActions, true), delegate, this._currentRenderContext.anchor, this._currentRenderContext.parentElement);
  }
  registerCommandSelector(selector) {
    if (this._registeredSelectors.has(selector.id)) {
      return;
    }
    const matcherKey = selector.commandLineMatcher.toString();
    const currentOptions = this._commandListeners.get(matcherKey) || [];
    currentOptions.push({
      id: selector.id,
      type: "unresolved",
      commandLineMatcher: selector.commandLineMatcher,
      outputMatcher: selector.outputMatcher,
      commandExitResult: selector.commandExitResult,
      kind: selector.kind
    });
    this._registeredSelectors.add(selector.id);
    this._commandListeners.set(matcherKey, currentOptions);
  }
  registerCommandFinishedListener(options3) {
    const matcherKey = options3.commandLineMatcher.toString();
    let currentOptions = this._commandListeners.get(matcherKey) || [];
    currentOptions = currentOptions.filter((o) => o.id !== options3.id);
    currentOptions.push(options3);
    this._commandListeners.set(matcherKey, currentOptions);
  }
  _registerCommandHandlers() {
    const terminal2 = this._terminal;
    const commandDetection = this._capabilities.get(2 /* CommandDetection */);
    if (!terminal2 || !commandDetection) {
      return;
    }
    this._register(commandDetection.onCommandFinished(async (command4) => await this._resolveQuickFixes(command4, this._aliases)));
  }
  /**
   * Resolves quick fixes, if any, based on the
   * @param command & its output
   */
  async _resolveQuickFixes(command4, aliases) {
    const terminal2 = this._terminal;
    if (!terminal2 || command4.wasReplayed) {
      return;
    }
    if (command4.command !== "" && this._lastQuickFixId) {
      this._disposeQuickFix(command4, this._lastQuickFixId);
    }
    const resolver = async (selector, lines) => {
      if (lines === void 0) {
        return void 0;
      }
      const id2 = selector.id;
      await this._extensionService.activateByEvent(`onTerminalQuickFixRequest:${id2}`);
      return this._quickFixService.providers.get(id2)?.provideTerminalQuickFixes(command4, lines, {
        type: "resolved",
        commandLineMatcher: selector.commandLineMatcher,
        outputMatcher: selector.outputMatcher,
        commandExitResult: selector.commandExitResult,
        kind: selector.kind,
        id: selector.id
      }, new CancellationTokenSource().token);
    };
    const result = await getQuickFixesForCommand(aliases, terminal2, command4, this._commandListeners, this._commandService, this._openerService, this._labelService, this._onDidRequestRerunCommand, resolver);
    if (!result) {
      return;
    }
    this._quickFixes = result;
    this._lastQuickFixId = this._quickFixes[0].id;
    this._registerQuickFixDecoration();
    this._onDidUpdateQuickFixes.fire({ command: command4, actions: this._quickFixes });
    this._quickFixes = void 0;
  }
  _disposeQuickFix(command4, id2) {
    this._telemetryService?.publicLog2("terminal/quick-fix", {
      quickFixId: id2,
      ranQuickFix: this._didRun,
      terminalSessionId: this._sessionId
    });
    this._decoration.clear();
    this._decorationDisposables.clear();
    this._onDidUpdateQuickFixes.fire({ command: command4, actions: this._quickFixes });
    this._quickFixes = void 0;
    this._lastQuickFixId = void 0;
    this._didRun = false;
  }
  /**
   * Registers a decoration with the quick fixes
   */
  _registerQuickFixDecoration() {
    if (!this._terminal) {
      return;
    }
    const quickFixEnabled = this._configurationService.getValue("terminal.integrated.shellIntegration.quickFixEnabled" /* ShellIntegrationQuickFixEnabled */);
    if (!quickFixEnabled) {
      return;
    }
    this._decoration.clear();
    this._decorationDisposables.clear();
    const quickFixes = this._quickFixes;
    if (!quickFixes || quickFixes.length === 0) {
      return;
    }
    const marker = this._terminal.registerMarker();
    if (!marker) {
      return;
    }
    const decoration3 = this._decoration.value = this._terminal.registerDecoration({ marker, width: 2, layer: "top" });
    if (!decoration3) {
      return;
    }
    const store = this._decorationDisposables.value = new DisposableStore();
    store.add(decoration3.onRender((e4) => {
      const rect = e4.getBoundingClientRect();
      const anchor = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      };
      if (e4.classList.contains("quick-fix" /* QuickFix */)) {
        if (this._currentRenderContext) {
          this._currentRenderContext.anchor = anchor;
        }
        return;
      }
      e4.classList.add(...quickFixClasses);
      const isExplainOnly = quickFixes.every((e5) => e5.kind === "explain");
      if (isExplainOnly) {
        e4.classList.add("explainOnly");
      }
      e4.classList.add(...ThemeIcon.asClassNameArray(isExplainOnly ? Codicon.sparkle : Codicon.lightBulb));
      updateLayout(this._configurationService, e4);
      this._accessibilitySignalService.playSignal(AccessibilitySignal.terminalQuickFix);
      const parentElement = e4.closest(".xterm")?.parentElement;
      if (!parentElement) {
        return;
      }
      this._currentRenderContext = { quickFixes, anchor, parentElement };
      this._register(addDisposableListener(e4, EventType.CLICK, () => this.showMenu()));
    }));
    store.add(decoration3.onDispose(() => this._currentRenderContext = void 0));
  }
};

TerminalQuickFixAddon = __decorateClass([
  __decorateParam(3, IAccessibilitySignalService),
  __decorateParam(4, IActionWidgetService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, ILabelService),
  __decorateParam(9, IOpenerService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, ITerminalQuickFixService)
], TerminalQuickFixAddon);

async function getQuickFixesForCommand(aliases, terminal2, terminalCommand, quickFixOptions, commandService, openerService, labelService, onDidRequestRerunCommand, getResolvedFixes) {
  const commandQuickFixSet = /* @__PURE__ */ new Set();
  const openQuickFixSet = /* @__PURE__ */ new Set();
  const fixes = [];
  const newCommand = terminalCommand.command;
  for (const options3 of quickFixOptions.values()) {
    for (const option2 of options3) {
      if (option2.commandExitResult === "success" && terminalCommand.exitCode !== 0 || option2.commandExitResult === "error" && terminalCommand.exitCode === 0) {
        continue;
      }
      let quickFixes;
      if (option2.type === "resolved") {
        quickFixes = await option2.getQuickFixes(terminalCommand, getLinesForCommand(terminal2.buffer.active, terminalCommand, terminal2.cols, option2.outputMatcher), option2, new CancellationTokenSource().token);
      } else if (option2.type === "unresolved") {
        if (!getResolvedFixes) {
          throw new Error("No resolved fix provider");
        }
        quickFixes = await getResolvedFixes(option2, option2.outputMatcher ? getLinesForCommand(terminal2.buffer.active, terminalCommand, terminal2.cols, option2.outputMatcher) : void 0);
      } else if (option2.type === "internal") {
        const commandLineMatch = newCommand.match(option2.commandLineMatcher);
        if (!commandLineMatch) {
          continue;
        }
        const outputMatcher = option2.outputMatcher;
        let outputMatch;
        if (outputMatcher) {
          outputMatch = terminalCommand.getOutputMatch(outputMatcher);
        }
        if (!outputMatch) {
          continue;
        }
        const matchResult = { commandLineMatch, outputMatch, commandLine: terminalCommand.command };
        quickFixes = option2.getQuickFixes(matchResult);
      }
      if (quickFixes) {
        for (const quickFix of asArray(quickFixes)) {
          let action;
          if (hasKey(quickFix, { type: true })) {
            switch (quickFix.type) {
              case 0 /* TerminalCommand */: {
                const fix = quickFix;
                if (commandQuickFixSet.has(fix.terminalCommand)) {
                  continue;
                }
                commandQuickFixSet.add(fix.terminalCommand);
                const label3 = localize(20813, null, fix.terminalCommand);
                action = {
                  type: 0 /* TerminalCommand */,
                  kind: option2.kind,
                  class: void 0,
                  source: quickFix.source,
                  id: quickFix.id,
                  label: label3,
                  enabled: true,
                  run: () => {
                    onDidRequestRerunCommand?.fire({
                      command: fix.terminalCommand,
                      shouldExecute: fix.shouldExecute ?? true
                    });
                  },
                  tooltip: label3,
                  command: fix.terminalCommand,
                  shouldExecute: fix.shouldExecute
                };
                break;
              }
              case 1 /* Opener */: {
                const fix = quickFix;
                if (!fix.uri) {
                  return;
                }
                if (openQuickFixSet.has(fix.uri.toString())) {
                  continue;
                }
                openQuickFixSet.add(fix.uri.toString());
                const isUrl = fix.uri.scheme === Schemas.http || fix.uri.scheme === Schemas.https;
                const uriLabel = isUrl ? encodeURI(fix.uri.toString(true)) : labelService.getUriLabel(fix.uri);
                const label3 = localize(20814, null, uriLabel);
                action = {
                  source: quickFix.source,
                  id: quickFix.id,
                  label: label3,
                  type: 1 /* Opener */,
                  kind: option2.kind,
                  class: void 0,
                  enabled: true,
                  run: () => openerService.open(fix.uri),
                  tooltip: label3,
                  uri: fix.uri
                };
                break;
              }
              case 2 /* Port */: {
                const fix = quickFix;
                action = {
                  source: "builtin",
                  type: fix.type,
                  kind: option2.kind,
                  id: fix.id,
                  label: fix.label,
                  class: fix.class,
                  enabled: fix.enabled,
                  run: () => {
                    fix.run();
                  },
                  tooltip: fix.tooltip
                };
                break;
              }
              case 3 /* VscodeCommand */: {
                const fix = quickFix;
                action = {
                  source: quickFix.source,
                  type: fix.type,
                  kind: option2.kind,
                  id: fix.id,
                  label: fix.title,
                  class: void 0,
                  enabled: true,
                  run: () => commandService.executeCommand(fix.id),
                  tooltip: fix.title
                };
                break;
              }
            }
            if (action) {
              fixes.push(action);
            }
          }
        }
      }
    }
  }
  return fixes.length > 0 ? fixes : void 0;
}

function convertToQuickFixOptions(selectorProvider) {
  return {
    id: selectorProvider.selector.id,
    type: "resolved",
    commandLineMatcher: selectorProvider.selector.commandLineMatcher,
    outputMatcher: selectorProvider.selector.outputMatcher,
    commandExitResult: selectorProvider.selector.commandExitResult,
    kind: selectorProvider.selector.kind,
    getQuickFixes: selectorProvider.provider.provideTerminalQuickFixes
  };
}

var TerminalQuickFixItem = class {
  constructor(action, type, source, title, kind = "fix") {
    this.action = action;
    this.type = type;
    this.source = source;
    this.title = title;
    this.kind = kind;
    this.disabled = false;
  }
};

function toActionWidgetItems(inputQuickFixes, showHeaders) {
  const menuItems = [];
  menuItems.push({
    kind: "header" /* Header */,
    group: {
      kind: CodeActionKind.QuickFix,
      title: localize(20812, null)
    }
  });
  for (const quickFix of showHeaders ? inputQuickFixes : inputQuickFixes.filter((i2) => !!i2.action)) {
    if (!quickFix.disabled && quickFix.action) {
      menuItems.push({
        kind: "action" /* Action */,
        item: quickFix,
        group: {
          kind: CodeActionKind.QuickFix,
          icon: getQuickFixIcon(quickFix),
          title: quickFix.action.label
        },
        disabled: false,
        label: quickFix.title
      });
    }
  }
  return menuItems;
}

function getQuickFixIcon(quickFix) {
  if (quickFix.kind === "explain") {
    return Codicon.sparkle;
  }
  switch (quickFix.type) {
    case 1 /* Opener */:
      if (quickFix.action.uri) {
        const isUrl = quickFix.action.uri.scheme === Schemas.http || quickFix.action.uri.scheme === Schemas.https;
        return isUrl ? Codicon.linkExternal : Codicon.goToFile;
      }
    case 0 /* TerminalCommand */:
      return Codicon.run;
    case 2 /* Port */:
      return Codicon.debugDisconnect;
    case 3 /* VscodeCommand */:
      return Codicon.lightbulb;
  }
}
export { getQuickFixesForCommand, convertToQuickFixOptions, toActionWidgetItems, getQuickFixIcon, quickFixClasses, TerminalQuickFixAddon, TerminalQuickFixItem };
