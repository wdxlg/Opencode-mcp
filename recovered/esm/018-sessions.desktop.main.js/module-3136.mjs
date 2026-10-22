// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineAnalyzer/autoApprove/commandLineAutoApprover.ts
import { Disposable } from "./module-0012.mjs";
import { NpmScriptAutoApprover } from "./module-3135.mjs";
import { isPowerShell } from "./module-3109.mjs";
import { isObject } from "./module-0010.mjs";
import { structuralEquals } from "./module-0042.mjs";
import { escapeRegExpCharacters, regExpLeadsToEndlessLoop } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITerminalChatService } from "./module-1150.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineAnalyzer/autoApprove/commandLineAutoApprover.ts
var neverMatchRegex = /(?!.*)/;

var transientEnvVarRegex = /^[A-Z_][A-Z0-9_]*=/i;

var CommandLineAutoApprover = class extends Disposable {
  constructor(_configurationService, instantiationService, _terminalChatService) {
    super();
    this._configurationService = _configurationService;
    this._terminalChatService = _terminalChatService;
    this._denyListRules = [];
    this._allowListRules = [];
    this._allowListCommandLineRules = [];
    this._denyListCommandLineRules = [];
    this._npmScriptAutoApprover = this._register(instantiationService.createInstance(NpmScriptAutoApprover));
    this.updateConfiguration();
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("chat.tools.terminal.autoApprove" /* AutoApprove */) || e4.affectsConfiguration("chat.tools.terminal.ignoreDefaultAutoApproveRules" /* IgnoreDefaultAutoApproveRules */) || e4.affectsConfiguration("chat.agent.terminal.autoApprove" /* DeprecatedAutoApproveCompatible */)) {
        this.updateConfiguration();
      }
    }));
  }
  updateConfiguration() {
    let configValue = this._configurationService.getValue("chat.tools.terminal.autoApprove" /* AutoApprove */);
    const configInspectValue = this._configurationService.inspect("chat.tools.terminal.autoApprove" /* AutoApprove */);
    const deprecatedValue = this._configurationService.getValue("chat.agent.terminal.autoApprove" /* DeprecatedAutoApproveCompatible */);
    if (deprecatedValue && typeof deprecatedValue === "object" && configValue && typeof configValue === "object") {
      configValue = {
        ...configValue,
        ...deprecatedValue
      };
    }
    const {
      denyListRules,
      allowListRules,
      allowListCommandLineRules,
      denyListCommandLineRules
    } = this._mapAutoApproveConfigToRules(configValue, configInspectValue);
    this._allowListRules = allowListRules;
    this._denyListRules = denyListRules;
    this._allowListCommandLineRules = allowListCommandLineRules;
    this._denyListCommandLineRules = denyListCommandLineRules;
  }
  async isCommandAutoApproved(command4, shell, os, cwd2, chatSessionResource) {
    if (transientEnvVarRegex.test(command4)) {
      return {
        result: "denied",
        reason: `Command '${command4}' is denied because it contains transient environment variables`
      };
    }
    for (const rule of this._denyListRules) {
      if (this._commandMatchesRule(rule, command4, shell, os)) {
        return {
          result: "denied",
          rule,
          reason: `Command '${command4}' is denied by deny list rule: ${rule.sourceText}`
        };
      }
    }
    for (const rule of this._getSessionRules(chatSessionResource).allowListRules) {
      if (this._commandMatchesRule(rule, command4, shell, os)) {
        return {
          result: "approved",
          rule,
          reason: `Command '${command4}' is approved by session allow list rule: ${rule.sourceText}`
        };
      }
    }
    for (const rule of this._allowListRules) {
      if (this._commandMatchesRule(rule, command4, shell, os)) {
        return {
          result: "approved",
          rule,
          reason: `Command '${command4}' is approved by allow list rule: ${rule.sourceText}`
        };
      }
    }
    const npmScriptResult = await this._npmScriptAutoApprover.isCommandAutoApproved(command4, cwd2);
    if (npmScriptResult.isAutoApproved) {
      return {
        result: "approved",
        rule: { type: "npmScript", npmScriptResult },
        reason: `Command '${command4}' is approved as npm script '${npmScriptResult.scriptName}' is defined in package.json`
      };
    }
    return {
      result: "noMatch",
      reason: `Command '${command4}' has no matching auto approve entries`
    };
  }
  isCommandLineAutoApproved(commandLine, chatSessionResource) {
    for (const rule of this._denyListCommandLineRules) {
      if (rule.regex.test(commandLine)) {
        return {
          result: "denied",
          rule,
          reason: `Command line '${commandLine}' is denied by deny list rule: ${rule.sourceText}`
        };
      }
    }
    for (const rule of this._getSessionRules(chatSessionResource).allowListCommandLineRules) {
      if (rule.regex.test(commandLine)) {
        return {
          result: "approved",
          rule,
          reason: `Command line '${commandLine}' is approved by session allow list rule: ${rule.sourceText}`
        };
      }
    }
    for (const rule of this._allowListCommandLineRules) {
      if (rule.regex.test(commandLine)) {
        return {
          result: "approved",
          rule,
          reason: `Command line '${commandLine}' is approved by allow list rule: ${rule.sourceText}`
        };
      }
    }
    return {
      result: "noMatch",
      reason: `Command line '${commandLine}' has no matching auto approve entries`
    };
  }
  _getSessionRules(chatSessionResource) {
    const denyListRules = [];
    const allowListRules = [];
    const allowListCommandLineRules = [];
    const denyListCommandLineRules = [];
    if (!chatSessionResource) {
      return { denyListRules, allowListRules, allowListCommandLineRules, denyListCommandLineRules };
    }
    const sessionRulesConfig = this._terminalChatService.getSessionAutoApproveRules(chatSessionResource);
    for (const [key3, value2] of Object.entries(sessionRulesConfig)) {
      if (typeof value2 === "boolean") {
        const { regex, regexCaseInsensitive } = this._convertAutoApproveEntryToRegex(key3);
        if (value2 === true) {
          allowListRules.push({ regex, regexCaseInsensitive, sourceText: key3, sourceTarget: "session", isDefaultRule: false });
        } else if (value2 === false) {
          denyListRules.push({ regex, regexCaseInsensitive, sourceText: key3, sourceTarget: "session", isDefaultRule: false });
        }
      } else if (typeof value2 === "object" && value2 !== null) {
        const objectValue = value2;
        if (typeof objectValue.approve === "boolean") {
          const { regex, regexCaseInsensitive } = this._convertAutoApproveEntryToRegex(key3);
          if (objectValue.approve === true) {
            if (objectValue.matchCommandLine === true) {
              allowListCommandLineRules.push({ regex, regexCaseInsensitive, sourceText: key3, sourceTarget: "session", isDefaultRule: false });
            } else {
              allowListRules.push({ regex, regexCaseInsensitive, sourceText: key3, sourceTarget: "session", isDefaultRule: false });
            }
          } else if (objectValue.approve === false) {
            if (objectValue.matchCommandLine === true) {
              denyListCommandLineRules.push({ regex, regexCaseInsensitive, sourceText: key3, sourceTarget: "session", isDefaultRule: false });
            } else {
              denyListRules.push({ regex, regexCaseInsensitive, sourceText: key3, sourceTarget: "session", isDefaultRule: false });
            }
          }
        }
      }
    }
    return { denyListRules, allowListRules, allowListCommandLineRules, denyListCommandLineRules };
  }
  _commandMatchesRule(rule, command4, shell, os) {
    const isPwsh = isPowerShell(shell, os);
    if ((isPwsh ? rule.regexCaseInsensitive : rule.regex).test(command4)) {
      return true;
    } else if (isPwsh && command4.startsWith("(")) {
      if (rule.regexCaseInsensitive.test(command4.slice(1))) {
        return true;
      }
    }
    return false;
  }
  _mapAutoApproveConfigToRules(config, configInspectValue) {
    if (!config || typeof config !== "object") {
      return {
        denyListRules: [],
        allowListRules: [],
        allowListCommandLineRules: [],
        denyListCommandLineRules: []
      };
    }
    const denyListRules = [];
    const allowListRules = [];
    const allowListCommandLineRules = [];
    const denyListCommandLineRules = [];
    const ignoreDefaults = this._configurationService.getValue("chat.tools.terminal.ignoreDefaultAutoApproveRules" /* IgnoreDefaultAutoApproveRules */) === true;
    for (const [key3, value2] of Object.entries(config)) {
      let checkTarget = function(inspectValue2) {
        return isObject(inspectValue2) && Object.prototype.hasOwnProperty.call(inspectValue2, key3) && structuralEquals(inspectValue2[key3], value2);
      };
      const defaultValue = configInspectValue?.default?.value;
      const isDefaultRule = !!(isObject(defaultValue) && Object.prototype.hasOwnProperty.call(defaultValue, key3) && structuralEquals(defaultValue[key3], value2));
      const sourceTarget = checkTarget(configInspectValue.workspaceFolderValue) ? 6 /* WORKSPACE_FOLDER */ : checkTarget(configInspectValue.workspaceValue) ? 5 /* WORKSPACE */ : checkTarget(configInspectValue.userRemoteValue) ? 4 /* USER_REMOTE */ : checkTarget(configInspectValue.userLocalValue) ? 3 /* USER_LOCAL */ : checkTarget(configInspectValue.userValue) ? 2 /* USER */ : checkTarget(configInspectValue.applicationValue) ? 1 /* APPLICATION */ : 7 /* DEFAULT */;
      if (ignoreDefaults && isDefaultRule && sourceTarget === 7 /* DEFAULT */) {
        continue;
      }
      if (typeof value2 === "boolean") {
        const { regex, regexCaseInsensitive } = this._convertAutoApproveEntryToRegex(key3);
        if (value2 === true) {
          allowListRules.push({ regex, regexCaseInsensitive, sourceText: key3, sourceTarget, isDefaultRule });
        } else if (value2 === false) {
          denyListRules.push({ regex, regexCaseInsensitive, sourceText: key3, sourceTarget, isDefaultRule });
        }
      } else if (typeof value2 === "object" && value2 !== null) {
        const objectValue = value2;
        if (typeof objectValue.approve === "boolean") {
          const { regex, regexCaseInsensitive } = this._convertAutoApproveEntryToRegex(key3);
          if (objectValue.approve === true) {
            if (objectValue.matchCommandLine === true) {
              allowListCommandLineRules.push({ regex, regexCaseInsensitive, sourceText: key3, sourceTarget, isDefaultRule });
            } else {
              allowListRules.push({ regex, regexCaseInsensitive, sourceText: key3, sourceTarget, isDefaultRule });
            }
          } else if (objectValue.approve === false) {
            if (objectValue.matchCommandLine === true) {
              denyListCommandLineRules.push({ regex, regexCaseInsensitive, sourceText: key3, sourceTarget, isDefaultRule });
            } else {
              denyListRules.push({ regex, regexCaseInsensitive, sourceText: key3, sourceTarget, isDefaultRule });
            }
          }
        }
      }
    }
    return {
      denyListRules,
      allowListRules,
      allowListCommandLineRules,
      denyListCommandLineRules
    };
  }
  _convertAutoApproveEntryToRegex(value2) {
    const regex = this._doConvertAutoApproveEntryToRegex(value2);
    if (regex.flags.includes("i")) {
      return { regex, regexCaseInsensitive: regex };
    }
    return { regex, regexCaseInsensitive: new RegExp(regex.source, regex.flags + "i") };
  }
  _doConvertAutoApproveEntryToRegex(value2) {
    const regexMatch = value2.match(/^\/(?<pattern>.+)\/(?<flags>[dgimsuvy]*)$/);
    const regexPattern = regexMatch?.groups?.pattern;
    if (regexPattern) {
      let flags = regexMatch.groups?.flags;
      if (flags) {
        flags = flags.replaceAll("g", "");
      }
      if (regexPattern === ".*") {
        return new RegExp(regexPattern);
      }
      try {
        const regex = new RegExp(regexPattern, flags || void 0);
        if (regExpLeadsToEndlessLoop(regex)) {
          return neverMatchRegex;
        }
        return regex;
      } catch (error) {
        return neverMatchRegex;
      }
    }
    if (value2 === "") {
      return neverMatchRegex;
    }
    let sanitizedValue;
    if (value2.includes("/") || value2.includes("\\")) {
      let pattern = value2.replace(/[/\\]/g, "%%PATH_SEP%%");
      pattern = escapeRegExpCharacters(pattern);
      pattern = pattern.replace(/%%PATH_SEP%%*/g, "[/\\\\]");
      sanitizedValue = `^(?:\\.[/\\\\])?${pattern}`;
    } else {
      sanitizedValue = escapeRegExpCharacters(value2);
    }
    return new RegExp(`^${sanitizedValue}\\b`);
  }
};

CommandLineAutoApprover = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITerminalChatService)
], CommandLineAutoApprover);
export { neverMatchRegex, transientEnvVarRegex, CommandLineAutoApprover };
