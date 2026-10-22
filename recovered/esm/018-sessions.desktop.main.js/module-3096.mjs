// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/accessibility/browser/terminalAccessibilityHelp.ts
import { Disposable } from "./module-0012.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { accessibleViewCurrentProviderId, accessibleViewIsShown } from "./module-1369.mjs";
import { localize } from "./module-0001.mjs";
import { HasSpeechProvider } from "./module-1254.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/terminalContrib/accessibility/browser/terminalAccessibilityHelp.ts
var TerminalAccessibilityHelpProvider = class extends Disposable {
  constructor(_instance, _xterm, _commandService, _configurationService, _contextKeyService) {
    super();
    this._instance = _instance;
    this._commandService = _commandService;
    this._configurationService = _configurationService;
    this._contextKeyService = _contextKeyService;
    this.id = "terminal-help" /* TerminalHelp */;
    this._hasShellIntegration = false;
    this.options = {
      type: "help" /* Help */,
      readMoreUrl: "https://code.visualstudio.com/docs/editor/accessibility#_terminal-accessibility"
    };
    this.verbositySettingKey = "accessibility.verbosity.terminal" /* Terminal */;
    this._hasShellIntegration = _xterm.shellIntegration.status === 2 /* VSCode */;
  }
  onClose() {
    const expr = ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal-help" /* TerminalHelp */));
    if (expr?.evaluate(this._contextKeyService.getContext(null))) {
      this._commandService.executeCommand("workbench.action.terminal.focusAccessibleBuffer" /* FocusAccessibleBuffer */);
    } else {
      this._instance.focus();
    }
    this.dispose();
  }
  provideContent() {
    const content = [
      localize(20376, null, "workbench.action.terminal.focusAccessibleBuffer" /* FocusAccessibleBuffer */),
      localize(20386, null),
      localize(20385, null, "workbench.action.terminal.openDetectedLink" /* OpenDetectedLink */),
      localize(20383, null, "workbench.action.terminal.newWithProfile" /* NewWithProfile */),
      localize(20377, null, "terminal.integrated.focusAfterRun" /* FocusAfterRun */)
    ];
    if (!this._configurationService.getValue("terminal.integrated.accessibleViewFocusOnCommandExecution" /* AccessibleViewFocusOnCommandExecution */)) {
      content.push(localize(20378, null));
    }
    if (this._configurationService.getValue("terminal.integrated.suggest.enabled" /* Enabled */)) {
      content.push(localize(20394, null, "workbench.action.terminal.triggerSuggest" /* TriggerSuggest */));
      content.push(localize(20389, null));
      content.push(localize(20390, null, "workbench.action.terminal.acceptSelectedSuggestion" /* AcceptSelectedSuggestion */, "workbench.action.terminal.configureSuggestSettings" /* ConfigureSettings */));
      content.push(localize(20391, null, "workbench.action.terminal.suggestToggleDetails" /* ToggleDetails */, "workbench.action.terminal.suggestToggleDetailsFocus" /* ToggleDetailsFocus */));
      content.push(localize(20393, null, "workbench.action.terminal.suggestLearnMore" /* LearnMore */));
      content.push(localize(20392, null, "workbench.action.terminal.configureSuggestSettings" /* ConfigureSettings */));
    }
    if (this._instance.shellType === "cmd" /* CommandPrompt */) {
      content.push(localize(20375, null));
    }
    if (HasSpeechProvider.getValue(this._contextKeyService) || ChatContextKeys.enabled.getValue(this._contextKeyService) && ChatContextKeys.speechToTextConfigured.getValue(this._contextKeyService)) {
      content.push(localize(20395, null, "workbench.action.terminal.startVoice" /* StartVoice */));
    }
    if (this._hasShellIntegration) {
      content.push(localize(20388, null));
      content.push("- " + localize(20379, null, "workbench.action.terminal.accessibleBufferGoToNextCommand" /* AccessibleBufferGoToNextCommand */));
      content.push("- " + localize(20380, null, "workbench.action.terminal.accessibleBufferGoToPreviousCommand" /* AccessibleBufferGoToPreviousCommand */));
      content.push("- " + localize(20382, null, "editor.action.accessibleViewGoToSymbol" /* GoToSymbol */));
      content.push("- " + localize(20387, null, "workbench.action.terminal.runRecentCommand" /* RunRecentCommand */));
      content.push("- " + localize(20381, null, "workbench.action.terminal.goToRecentDirectory" /* GoToRecentDirectory */));
    } else {
      content.push(localize(20384, null));
    }
    return content.join("\n");
  }
};

TerminalAccessibilityHelpProvider = __decorateClass([
  __decorateParam(2, ICommandService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService)
], TerminalAccessibilityHelpProvider);
export { TerminalAccessibilityHelpProvider };
