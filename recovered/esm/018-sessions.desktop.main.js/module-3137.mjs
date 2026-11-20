// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineAnalyzer/commandLineAutoApproveAnalyzer.ts
import { Disposable } from "./module-0012.mjs";
import { CommandLineAutoApprover } from "./module-3136.mjs";
import { MarkdownString, createCommandUri } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { isAutoApproveRule, isNpmScriptAutoApproveRule } from "./module-3108.mjs";
import { dedupeRules, generateAutoApproveActions, isPowerShell } from "./module-3109.mjs";
import { asArray } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITerminalChatService } from "./module-1150.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineAnalyzer/commandLineAutoApproveAnalyzer.ts
var promptInjectionWarningCommandsLower = [
  "curl",
  "wget"
];

var promptInjectionWarningCommandsLowerPwshOnly = [
  "invoke-restmethod",
  "invoke-webrequest",
  "irm",
  "iwr"
];

var CommandLineAutoApproveAnalyzer = class extends Disposable {
  constructor(_treeSitterCommandParser, _telemetry, _log2, _configurationService, instantiationService, _storageService, _terminalChatService) {
    super();
    this._treeSitterCommandParser = _treeSitterCommandParser;
    this._telemetry = _telemetry;
    this._log = _log2;
    this._configurationService = _configurationService;
    this._storageService = _storageService;
    this._terminalChatService = _terminalChatService;
    this._commandLineAutoApprover = this._register(instantiationService.createInstance(CommandLineAutoApprover));
  }
  async analyze(options3) {
    const isAutoApproveEnabledInSettings = this._configurationService.getValue("chat.tools.terminal.enableAutoApprove" /* EnableAutoApprove */) === true;
    if (isAutoApproveEnabledInSettings && options3.chatSessionResource && this._terminalChatService.hasChatSessionAutoApproval(options3.chatSessionResource)) {
      this._log("Session has auto approval enabled, auto approving command");
      const disableUri = createCommandUri("workbench.action.terminal.chat.disableSessionAutoApproval" /* DisableSessionAutoApproval */, options3.chatSessionResource);
      const mdTrustSettings = {
        isTrusted: {
          enabledCommands: ["workbench.action.terminal.chat.disableSessionAutoApproval" /* DisableSessionAutoApproval */]
        }
      };
      return {
        isAutoApproved: true,
        isAutoApproveAllowed: true,
        disclaimers: [],
        autoApproveInfo: new MarkdownString(`${localize(20462, null)} ([${localize(20463, null)}](${disableUri.toString()}))`, mdTrustSettings)
      };
    }
    const trimmedCommandLine = options3.commandLine.trimStart();
    let subCommands;
    let hasUnanalyzableSyntax = false;
    try {
      const parseResult = await this._treeSitterCommandParser.extractAutoApprovalSubCommands(options3.treeSitterLanguage, trimmedCommandLine);
      subCommands = parseResult.subCommands;
      hasUnanalyzableSyntax = parseResult.hasUnanalyzableSyntax;
      this._log(`Parsed sub-commands via ${options3.treeSitterLanguage} grammar`, subCommands);
      if (hasUnanalyzableSyntax) {
        this._log("Command line contains syntax that cannot be safely auto-approved");
      }
    } catch (e4) {
      console.error(e4);
      this._log(`Failed to parse sub-commands via ${options3.treeSitterLanguage} grammar`);
    }
    let isAutoApproved = false;
    let autoApproveInfo;
    let customActions;
    if (!subCommands?.length) {
      if (trimmedCommandLine.length === 0) {
        this._log("Command line is empty, auto approving");
        return {
          isAutoApproved: true,
          isAutoApproveAllowed: true,
          disclaimers: []
        };
      }
      this._log("No sub-commands were parsed, auto approval is not allowed");
      return {
        isAutoApproveAllowed: false,
        disclaimers: []
      };
    }
    const subCommandResults = await Promise.all(subCommands.map((e4) => this._commandLineAutoApprover.isCommandAutoApproved(e4, options3.shell, options3.os, options3.cwd, options3.chatSessionResource)));
    const commandLineResult = this._commandLineAutoApprover.isCommandLineAutoApproved(trimmedCommandLine, options3.chatSessionResource);
    const autoApproveReasons = [
      ...subCommandResults.map((e4) => e4.reason),
      commandLineResult.reason
    ];
    let isDenied = false;
    let autoApproveReason;
    let autoApproveDefault;
    const deniedSubCommandResult = subCommandResults.find((e4) => e4.result === "denied");
    if (deniedSubCommandResult) {
      this._log("Sub-command DENIED auto approval");
      isDenied = true;
      autoApproveDefault = isAutoApproveRule(deniedSubCommandResult.rule) ? deniedSubCommandResult.rule.isDefaultRule : void 0;
      autoApproveReason = "subCommand";
    } else if (commandLineResult.result === "denied") {
      this._log("Command line DENIED auto approval");
      isDenied = true;
      autoApproveDefault = isAutoApproveRule(commandLineResult.rule) ? commandLineResult.rule.isDefaultRule : void 0;
      autoApproveReason = "commandLine";
    } else {
      if (subCommandResults.every((e4) => e4.result === "approved")) {
        this._log("All sub-commands auto-approved");
        isAutoApproved = true;
        autoApproveReason = "subCommand";
        autoApproveDefault = subCommandResults.every((e4) => isAutoApproveRule(e4.rule) && e4.rule.isDefaultRule);
      } else {
        this._log("All sub-commands NOT auto-approved");
        if (commandLineResult.result === "approved") {
          this._log("Command line auto-approved");
          autoApproveReason = "commandLine";
          isAutoApproved = true;
          autoApproveDefault = isAutoApproveRule(commandLineResult.rule) ? commandLineResult.rule.isDefaultRule : void 0;
        } else {
          this._log("Command line NOT auto-approved");
        }
      }
    }
    if (hasUnanalyzableSyntax) {
      isAutoApproved = false;
    }
    for (const reason of autoApproveReasons) {
      this._log(`- ${reason}`);
    }
    const isAutoApproveEnabled = this._configurationService.getValue("chat.tools.terminal.enableAutoApprove" /* EnableAutoApprove */) === true;
    const isAutoApproveWarningAccepted = this._storageService.getBoolean("chat.tools.terminal.autoApprove.warningAccepted" /* TerminalAutoApproveWarningAccepted */, -1 /* APPLICATION */, false);
    if (isAutoApproveEnabled && isAutoApproved) {
      autoApproveInfo = this._createAutoApproveInfo(
        isAutoApproved,
        isDenied,
        autoApproveReason,
        subCommandResults,
        commandLineResult
      );
    } else {
      isAutoApproved = false;
    }
    this._telemetry.logPrepare({
      terminalToolSessionId: options3.terminalToolSessionId,
      subCommands,
      autoApproveAllowed: !isAutoApproveEnabled ? "off" : isAutoApproveWarningAccepted ? "allowed" : "needsOptIn",
      autoApproveResult: isAutoApproved ? "approved" : isDenied ? "denied" : "manual",
      autoApproveReason,
      autoApproveDefault
    });
    const disclaimers = [];
    const subCommandsLowerFirstWordOnly = subCommands.map((command4) => command4.split(" ")[0].toLowerCase());
    if (!isAutoApproved && (subCommandsLowerFirstWordOnly.some((command4) => promptInjectionWarningCommandsLower.includes(command4)) || isPowerShell(options3.shell, options3.os) && subCommandsLowerFirstWordOnly.some((command4) => promptInjectionWarningCommandsLowerPwshOnly.includes(command4)))) {
      disclaimers.push(localize(20469, null));
    }
    if (isAutoApproveEnabled && isDenied) {
      const denialInfo = this._createAutoApproveInfo(
        isAutoApproved,
        isDenied,
        autoApproveReason,
        subCommandResults,
        commandLineResult
      );
      if (denialInfo) {
        disclaimers.push(denialInfo);
      }
    }
    if (!isAutoApproved && isAutoApproveEnabled && !hasUnanalyzableSyntax) {
      customActions = generateAutoApproveActions(trimmedCommandLine, subCommands, { subCommandResults, commandLineResult });
    }
    return {
      isAutoApproved,
      // Denied rules stay configurable; unanalyzable syntax cannot be auto-approved safely.
      isAutoApproveAllowed: !hasUnanalyzableSyntax,
      disclaimers,
      autoApproveInfo,
      customActions
    };
  }
  _createAutoApproveInfo(isAutoApproved, isDenied, autoApproveReason, subCommandResults, commandLineResult) {
    const formatRuleLinks = (result) => {
      return asArray(result).filter((e4) => isAutoApproveRule(e4.rule)).map((e4) => {
        const escapedSourceText = e4.rule.sourceText.replaceAll("$", "\\$");
        if (e4.rule.sourceTarget === "session") {
          return localize(20466, null, `\`${escapedSourceText}\``);
        }
        const settingsUri = createCommandUri("workbench.action.terminal.chat.openTerminalSettingsLink" /* OpenTerminalSettingsLink */, e4.rule.sourceTarget);
        const tooltip = localize(20467, null);
        let label3 = escapedSourceText;
        switch (e4.rule?.sourceTarget) {
          case 7 /* DEFAULT */:
            label3 = `${label3} (default)`;
            break;
          case 2 /* USER */:
          case 3 /* USER_LOCAL */:
            label3 = `${label3} (user)`;
            break;
          case 4 /* USER_REMOTE */:
            label3 = `${label3} (remote)`;
            break;
          case 5 /* WORKSPACE */:
          case 6 /* WORKSPACE_FOLDER */:
            label3 = `${label3} (workspace)`;
            break;
        }
        return `[\`${label3}\`](${settingsUri.toString()} "${tooltip}")`;
      }).join(", ");
    };
    const mdTrustSettings = {
      isTrusted: {
        enabledCommands: ["workbench.action.terminal.chat.openTerminalSettingsLink" /* OpenTerminalSettingsLink */]
      }
    };
    if (isAutoApproved) {
      switch (autoApproveReason) {
        case "commandLine": {
          if (isAutoApproveRule(commandLineResult.rule)) {
            return new MarkdownString(localize(20460, null, formatRuleLinks(commandLineResult)), mdTrustSettings);
          }
          break;
        }
        case "subCommand": {
          const npmScriptApproval = subCommandResults.find((e4) => isNpmScriptAutoApproveRule(e4.rule));
          if (npmScriptApproval && isNpmScriptAutoApproveRule(npmScriptApproval.rule) && npmScriptApproval.rule.npmScriptResult.autoApproveInfo) {
            return npmScriptApproval.rule.npmScriptResult.autoApproveInfo;
          }
          const uniqueRules = dedupeRules(subCommandResults);
          if (uniqueRules.length === 1) {
            return new MarkdownString(localize(20460, null, formatRuleLinks(uniqueRules)), mdTrustSettings);
          } else if (uniqueRules.length > 1) {
            return new MarkdownString(localize(20461, null, formatRuleLinks(uniqueRules)), mdTrustSettings);
          }
          break;
        }
      }
    } else if (isDenied) {
      switch (autoApproveReason) {
        case "commandLine": {
          if (commandLineResult.rule) {
            return new MarkdownString(localize(20464, null, formatRuleLinks(commandLineResult)), mdTrustSettings);
          }
          break;
        }
        case "subCommand": {
          const uniqueRules = dedupeRules(subCommandResults.filter((e4) => e4.result === "denied"));
          if (uniqueRules.length === 1) {
            return new MarkdownString(localize(20464, null, formatRuleLinks(uniqueRules)), mdTrustSettings);
          } else if (uniqueRules.length > 1) {
            return new MarkdownString(localize(20465, null, formatRuleLinks(uniqueRules)), mdTrustSettings);
          }
          break;
        }
      }
    }
    return void 0;
  }
};

CommandLineAutoApproveAnalyzer = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, ITerminalChatService)
], CommandLineAutoApproveAnalyzer);
export { promptInjectionWarningCommandsLower, promptInjectionWarningCommandsLowerPwshOnly, CommandLineAutoApproveAnalyzer };
