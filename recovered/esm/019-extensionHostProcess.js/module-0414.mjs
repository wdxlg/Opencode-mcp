// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/computeAutomaticInstructions.ts
import { ResourceMap, ResourceSet } from "./module-0007.mjs";
import { IPromptsService, matchesSessionType, newInstructionsCollectionDebugInfo, newInstructionsCollectionEvent } from "./module-0410.mjs";
import { hash } from "./module-0061.mjs";
import { PromptsConfig } from "./module-0412.mjs";
import { basename2, dirname2 } from "./module-0027.mjs";
import { localize } from "./module-0013.mjs";
import { isInClaudeAgentsFolder, isInClaudeRulesFolder, isPromptOrInstructionsFile } from "./module-0411.mjs";
import { ChatRequestVariableSet, IChatRequestVariableEntry, isPromptFileVariableEntry, toPromptFileVariableEntry, toPromptTextVariableEntry, toToolVariableEntry } from "./module-0103.mjs";
import { match, splitGlobAware } from "./module-0185.mjs";
import { ILanguageModelToolsService, VSCodeToolReference } from "./module-0191.mjs";
import { escape } from "./module-0023.mjs";
import { AGENT_DEBUG_LOG_FILE_LOGGING_ENABLED_SETTING, TROUBLESHOOT_SKILL_PATH } from "./module-0202.mjs";
import { OffsetRange } from "./module-0184.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0062.mjs";
import { ILabelService } from "./module-0409.mjs";
import { IConfigurationService } from "./module-0131.mjs";
import { IWorkspaceContextService } from "./module-0076.mjs";
import { IFileService } from "./module-0073.mjs";
import { IRemoteAgentService } from "./module-0213.mjs";
import { ITelemetryService } from "./module-0148.mjs";
import { IAgentPluginService } from "./module-0413.mjs";
import { Schemas } from "./module-0026.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/computeAutomaticInstructions.ts
var lastInstructionsCollectionResult;

var ComputeAutomaticInstructions = class {
  constructor(_modeKind, _enabledTools, _enabledSubagents, _currentSessionType, _promptsService, _logService, _labelService, _configurationService, _workspaceService, _fileService, _remoteAgentService, _telemetryService, _languageModelToolsService, _agentPluginService) {
    this._modeKind = _modeKind;
    this._enabledTools = _enabledTools;
    this._enabledSubagents = _enabledSubagents;
    this._currentSessionType = _currentSessionType;
    this._promptsService = _promptsService;
    this._logService = _logService;
    this._labelService = _labelService;
    this._configurationService = _configurationService;
    this._workspaceService = _workspaceService;
    this._fileService = _fileService;
    this._remoteAgentService = _remoteAgentService;
    this._telemetryService = _telemetryService;
    this._languageModelToolsService = _languageModelToolsService;
    this._agentPluginService = _agentPluginService;
    this._parseResults = new ResourceMap();
  }
  async _parseInstructionsFile(uri2, token) {
    if (this._parseResults.has(uri2)) {
      return this._parseResults.get(uri2);
    }
    try {
      const result = await this._promptsService.parseNew(uri2, token);
      this._parseResults.set(uri2, result);
      return result;
    } catch (error) {
      this._logService.error(`[InstructionsContextComputer] Failed to parse instruction file: ${uri2}`, error);
      return void 0;
    }
  }
  async collect(variables, token) {
    const startTime = performance.now();
    const instructionFiles = await this._promptsService.getInstructionFiles(token);
    this._logService.trace(`[InstructionsContextComputer] ${instructionFiles.length} instruction files available.`);
    const telemetryEvent = newInstructionsCollectionEvent();
    const debugInfo = newInstructionsCollectionDebugInfo();
    const context = this._getContext(variables);
    await this.addApplyingInstructions(instructionFiles, context, variables, telemetryEvent, debugInfo, token);
    await this._addReferencedInstructions(variables, telemetryEvent, debugInfo, token);
    await this._addAgentInstructions(variables, telemetryEvent, debugInfo, token);
    const customizationsIndexVariable = await this._getCustomizationsIndex(instructionFiles, variables, telemetryEvent, debugInfo, token);
    if (customizationsIndexVariable) {
      variables.add(customizationsIndexVariable);
      telemetryEvent.listedInstructionsCount++;
    }
    debugInfo.durationInMillis = performance.now() - startTime;
    this.sendTelemetry(telemetryEvent);
    lastInstructionsCollectionResult = { telemetryEvent, debugInfo };
  }
  sendTelemetry(telemetryEvent) {
    telemetryEvent.totalInstructionsCount = telemetryEvent.agentInstructionsCount + telemetryEvent.referencedInstructionsCount + telemetryEvent.applyingInstructionsCount + telemetryEvent.listedInstructionsCount;
    this._telemetryService.publicLog2("instructionsCollected", telemetryEvent);
  }
  async _logSkillLoadedTelemetry(skills) {
    try {
      const pluginByUri = new ResourceMap();
      const allPlugins = this._agentPluginService.plugins.get();
      for (const plugin of allPlugins) {
        pluginByUri.set(plugin.uri, plugin);
      }
      const hashOrEmpty = (value) => {
        return value !== void 0 ? String(hash(value)) : "";
      };
      for (const skill of skills) {
        const skillPlugin = skill.pluginUri ? pluginByUri.get(skill.pluginUri) : void 0;
        this._telemetryService.publicLog2("skillLoadedIntoContext", {
          skillNameHash: hashOrEmpty(skill.name),
          skillStorage: skill.storage,
          extensionIdHash: hashOrEmpty(skill.extension?.identifier.value),
          extensionVersion: skill.extension?.version ?? "",
          pluginNameHash: hashOrEmpty(skillPlugin?.label),
          pluginVersion: skillPlugin?.fromMarketplace?.version ?? ""
        });
      }
    } catch (err) {
      this._logService.error("[InstructionsContextComputer] Failed to log skill telemetry", err);
    }
  }
  /** public for testing */
  async addApplyingInstructions(instructionFiles, context, variables, telemetryEvent, debugInfo, token) {
    const includeApplyingInstructions = this._configurationService.getValue(PromptsConfig.INCLUDE_APPLYING_INSTRUCTIONS);
    if (!includeApplyingInstructions && this._modeKind !== "edit" /* Edit */) {
      this._logService.trace(`[InstructionsContextComputer] includeApplyingInstructions is disabled and agent kind is not Edit. No applying instructions will be added.`);
      return;
    }
    const currentSessionType = this._currentSessionType;
    for (const instructionFile of instructionFiles) {
      if (token.isCancellationRequested) {
        return;
      }
      const { uri: uri2, pattern } = instructionFile;
      if (!matchesSessionType(instructionFile.sessionTypes, currentSessionType)) {
        continue;
      }
      if (!pattern) {
        this._logService.trace(`[InstructionsContextComputer] No pattern (applyTo / paths) found: ${uri2}`);
        debugInfo.debugDetails.push({ category: "skipped", name: basename2(uri2).toString(), uri: uri2, reason: localize(13037, null) });
        continue;
      }
      const isClaudeRules = isInClaudeRulesFolder(uri2);
      if (context.instructions.has(uri2)) {
        this._logService.trace(`[InstructionsContextComputer] Skipping already processed instruction file: ${uri2}`);
        debugInfo.debugDetails.push({ category: "skipped", name: basename2(uri2).toString(), uri: uri2, reason: localize(13035, null) });
        continue;
      }
      const match2 = this._matches(context.files, pattern);
      if (match2) {
        this._logService.trace(`[InstructionsContextComputer] Match for ${uri2} with ${match2.pattern}${match2.file ? ` for file ${match2.file}` : ""}`);
        const reason = !match2.file ? localize(13044, null) : localize(13046, null, pattern, this._labelService.getUriLabel(match2.file, { relative: true }));
        variables.add(toPromptFileVariableEntry(uri2, "vscode.instructions.file.root" /* Instruction */, reason, true));
        telemetryEvent.applyingInstructionsCount++;
        debugInfo.debugDetails.push({ category: "applying", name: basename2(uri2).toString(), uri: uri2, reason });
        if (isClaudeRules) {
          telemetryEvent.claudeRulesCount++;
        }
      } else {
        this._logService.trace(`[InstructionsContextComputer] No match for ${uri2} with ${pattern}`);
        debugInfo.debugDetails.push({ category: "skipped", name: basename2(uri2).toString(), uri: uri2, reason: localize(13036, null, pattern) });
      }
    }
  }
  _getContext(attachedContext) {
    const files = new ResourceSet();
    const instructions = new ResourceSet();
    for (const variable of attachedContext.asArray()) {
      if (isPromptFileVariableEntry(variable)) {
        instructions.add(variable.value);
      } else {
        const uri2 = IChatRequestVariableEntry.toUri(variable);
        if (uri2) {
          files.add(uri2);
        }
      }
    }
    return { files, instructions };
  }
  async _addAgentInstructions(variables, telemetryEvent, debugInfo, token) {
    const logger = {
      logInfo: (message) => this._logService.trace(`[InstructionsContextComputer] ${message}`)
    };
    const allCandidates = await this._promptsService.listAgentInstructions(token, logger);
    const entries = new ChatRequestVariableSet();
    const copilotEntries = new ChatRequestVariableSet();
    for (const { uri: uri2, type } of allCandidates) {
      const varEntry = toPromptFileVariableEntry(uri2, "vscode.instructions.file.root" /* Instruction */, void 0, true);
      entries.add(varEntry);
      if (type === "copilotInstructionsMd" /* copilotInstructionsMd */) {
        copilotEntries.add(varEntry);
      }
      telemetryEvent.agentInstructionsCount++;
      if (type === "claudeMd" /* claudeMd */) {
        telemetryEvent.claudeMdCount++;
      }
      debugInfo.debugDetails.push({ category: "applying", name: basename2(uri2).toString(), uri: uri2, reason: localize(13033, null) });
      logger.logInfo(`Agent instruction file added: ${uri2.toString()}`);
    }
    if (copilotEntries.length > 0) {
      await this._addReferencedInstructions(copilotEntries, telemetryEvent, debugInfo, token);
      for (const entry of copilotEntries.asArray()) {
        variables.add(entry);
      }
    }
    for (const entry of entries.asArray()) {
      variables.add(entry);
    }
  }
  _matches(files, applyToPattern) {
    const patterns = splitGlobAware(applyToPattern, ",");
    const patterMatches = (pattern) => {
      pattern = pattern.trim();
      if (pattern.length === 0) {
        return void 0;
      }
      if (pattern === "**" || pattern === "**/*" || pattern === "*") {
        return { pattern };
      }
      if (!pattern.startsWith("/") && !pattern.startsWith("**/")) {
        pattern = "**/" + pattern;
      }
      for (const file of files) {
        if (match(pattern, file.path, { ignoreCase: true })) {
          return { pattern, file };
        }
      }
      return void 0;
    };
    for (const pattern of patterns) {
      const matchResult = patterMatches(pattern);
      if (matchResult) {
        return matchResult;
      }
    }
    return void 0;
  }
  _getTool(referenceName) {
    if (!this._enabledTools) {
      return void 0;
    }
    const tool = this._languageModelToolsService.getToolByName(referenceName);
    if (tool && this._enabledTools[tool.id]) {
      return { tool, variable: `#tool:${this._languageModelToolsService.getFullReferenceName(tool)}` };
    }
    return void 0;
  }
  async _getCustomizationsIndex(instructionFiles, _existingVariables, telemetryEvent, debugInfo, token) {
    const readTool = this._getTool("readFile");
    const runInTerminalTool = this._getTool("runInTerminal");
    const fileReadTool = readTool ?? runInTerminalTool;
    const runSubagentTool = this._getTool(VSCodeToolReference.runSubagent);
    const skillTool = this._getTool("skill");
    const currentSessionType = this._currentSessionType;
    const remoteEnv = await this._remoteAgentService.getEnvironment();
    const remoteOS = remoteEnv?.os;
    const isRemote = this._remoteAgentService.getConnection() !== null;
    const filePath = (uri2) => getFilePath(uri2, remoteOS, isRemote);
    const entries = [];
    if (fileReadTool) {
      const searchNestedAgentMd = this._configurationService.getValue(PromptsConfig.USE_NESTED_AGENT_MD);
      const agentsMdPromise = searchNestedAgentMd ? this._promptsService.listNestedAgentMDs(token) : Promise.resolve([]);
      entries.push("<instructions>");
      entries.push("Here is a list of instruction files that contain rules for working with this codebase.");
      entries.push("These files are important for understanding the codebase structure, conventions, and best practices.");
      entries.push("When an instruction file applies to your task (based on its description or applyTo pattern), follow the rules specified in it.");
      entries.push(`If the file content is not already included in the context, use the ${fileReadTool.variable} tool to read it before proceeding. Use the exact value from the <file> element as-is with the tool; do not add or remove prefixes or otherwise modify it.`);
      entries.push("Only load instruction files when they are relevant to the current task. Do not eagerly load all instructions upfront.");
      entries.push("When modifying or creating files, check for instructions whose applyTo pattern matches the file path and follow them.");
      let hasContent = false;
      for (const instruction of instructionFiles) {
        if (!matchesSessionType(instruction.sessionTypes, currentSessionType)) {
          continue;
        }
        entries.push("<instruction>");
        entries.push(`<file>${filePath(instruction.uri)}</file>`);
        if (instruction.description) {
          entries.push(`<description>${escape(instruction.description)}</description>`);
        }
        if (instruction.pattern) {
          entries.push(`<applyTo>${escape(instruction.pattern)}</applyTo>`);
        }
        entries.push("</instruction>");
        hasContent = true;
      }
      const agentsMdFiles = await agentsMdPromise;
      for (const { uri: uri2 } of agentsMdFiles) {
        const folderName = this._labelService.getUriLabel(dirname2(uri2), { relative: true });
        const description = folderName.trim().length === 0 ? localize(13043, null) : localize(13042, null, folderName);
        entries.push("<instruction>");
        entries.push(`<file>${filePath(uri2)}</file>`);
        entries.push(`<description>${escape(description)}</description>`);
        entries.push("</instruction>");
        hasContent = true;
      }
      if (!hasContent) {
        entries.length = 0;
      } else {
        entries.push("</instructions>", "", "");
      }
      const agentSkills = await this._promptsService.findAgentSkills(token);
      const isFileLoggingEnabled = this._configurationService.getValue(AGENT_DEBUG_LOG_FILE_LOGGING_ENABLED_SETTING);
      const modelInvocableSkills = agentSkills?.filter((skill) => {
        if (!skill.description) {
          debugInfo.debugDetails.push({ category: "skipped", name: skill.name, uri: skill.uri, reason: localize(13039, null) });
          return false;
        }
        if (skill.disableModelInvocation) {
          debugInfo.debugDetails.push({ category: "skipped", name: skill.name, uri: skill.uri, reason: localize(13040, null) });
          return false;
        }
        if (!matchesSessionType(skill.sessionTypes, currentSessionType)) {
          debugInfo.debugDetails.push({ category: "skipped", name: skill.name, uri: skill.uri, reason: localize(13041, null) });
          return false;
        }
        if (!isFileLoggingEnabled && skill.uri.path.includes(TROUBLESHOOT_SKILL_PATH)) {
          debugInfo.debugDetails.push({ category: "skipped", name: skill.name, uri: skill.uri, reason: localize(13038, null) });
          return false;
        }
        return true;
      });
      if (modelInvocableSkills && modelInvocableSkills.length > 0) {
        this._logSkillLoadedTelemetry(modelInvocableSkills);
        for (const skill of modelInvocableSkills) {
          debugInfo.debugDetails.push({ category: "skill", name: skill.name, uri: skill.uri, reason: skill.storage });
        }
        const useSkillAdherencePrompt = this._configurationService.getValue(PromptsConfig.USE_SKILL_ADHERENCE_PROMPT);
        const skillLoadTool = skillTool ?? fileReadTool;
        entries.push("<skills>");
        if (useSkillAdherencePrompt) {
          entries.push("Skills provide specialized capabilities, domain knowledge, and refined workflows for producing high-quality outputs. Each skill folder contains tested instructions for specific domains like testing strategies, API design, or performance optimization. Multiple skills can be combined when a task spans different domains.");
          if (skillTool) {
            entries.push(`BLOCKING REQUIREMENT: When a skill applies to the user's request, you MUST invoke it IMMEDIATELY as your first action, BEFORE generating any other response or taking action on the task. Use ${skillTool.variable} with the skill name to load the relevant skill(s).`);
          } else {
            entries.push(`BLOCKING REQUIREMENT: When a skill applies to the user's request, you MUST load and read the SKILL.md file IMMEDIATELY as your first action, BEFORE generating any other response or taking action on the task. Use ${fileReadTool.variable} to load the relevant skill(s).`);
          }
          entries.push("NEVER just mention or reference a skill in your response without actually loading it first. If a skill is relevant, load it before proceeding.");
          entries.push("How to determine if a skill applies:");
          entries.push("1. Review the available skills below and match their descriptions against the user's request");
          entries.push("2. If any skill's domain overlaps with the task, load that skill immediately");
          entries.push("3. When multiple skills apply (e.g., a flowchart in documentation), load all relevant skills");
          entries.push("Examples:");
          entries.push(`- "Help me write unit tests for this module" -> Load the testing skill via ${skillLoadTool.variable} FIRST, then proceed`);
          entries.push(`- "Optimize this slow function" -> Load the performance-profiling skill via ${skillLoadTool.variable} FIRST, then proceed`);
          entries.push(`- "Add a discount code field to checkout" -> Load both the checkout-flow and form-validation skills FIRST`);
          entries.push("Available skills:");
        } else {
          if (skillTool) {
            entries.push("Here is a list of skills that contain domain specific knowledge on a variety of topics.");
            entries.push(`When a user asks you to perform a task that falls within the domain of a skill, use the ${skillTool.variable} tool with the skill name to load it.`);
          } else {
            entries.push("Here is a list of skills that contain domain specific knowledge on a variety of topics.");
            entries.push("Each skill comes with a description of the topic and a file path that contains the detailed instructions.");
            entries.push(`When a user asks you to perform a task that falls within the domain of a skill, use the ${fileReadTool.variable} tool to acquire the full instructions from the file URI.`);
          }
        }
        const SKILL_DESCRIPTION_CHAR_BUDGET = 15e3;
        const TRUNCATED_NAMES_CHAR_BUDGET = 5e3;
        let skillCharCount = 0;
        let truncatedAtIndex = modelInvocableSkills.length;
        for (let i = 0; i < modelInvocableSkills.length; i++) {
          const skill = modelInvocableSkills[i];
          const skillEntry = [`<skill>`, `<name>${escape(skill.name)}</name>`];
          if (skill.description) {
            skillEntry.push(`<description>${escape(skill.description)}</description>`);
          }
          skillEntry.push(`<file>${filePath(skill.uri)}</file>`);
          skillEntry.push(`</skill>`);
          const entryLength = skillEntry.join("\n").length + 1;
          if (skillTool && skillCharCount + entryLength > SKILL_DESCRIPTION_CHAR_BUDGET) {
            truncatedAtIndex = i;
            break;
          }
          skillCharCount += entryLength;
          entries.push(...skillEntry);
        }
        if (truncatedAtIndex < modelInvocableSkills.length) {
          const truncatedSkills = modelInvocableSkills.slice(truncatedAtIndex);
          const names = [];
          let nameListLength = 0;
          for (const skill of truncatedSkills) {
            const escapedName = escape(skill.name);
            const addition = (names.length > 0 ? 2 : 0) + escapedName.length;
            if (nameListLength + addition > TRUNCATED_NAMES_CHAR_BUDGET) {
              break;
            }
            nameListLength += addition;
            names.push(escapedName);
          }
          const remaining = truncatedSkills.length - names.length;
          const nameList = names.join(", ");
          entries.push(remaining > 0 ? `Additional skills available (invoke by name): ${nameList}... and ${remaining} more` : `Additional skills available (invoke by name): ${nameList}`);
        }
        entries.push("</skills>", "", "");
      }
    }
    if (runSubagentTool) {
      const canUseAgent = (() => {
        if (!this._enabledSubagents || this._enabledSubagents.includes("*")) {
          return (agent) => agent.visibility.agentInvocable && matchesSessionType(agent.sessionTypes, currentSessionType);
        } else {
          const subagents = this._enabledSubagents;
          return (agent) => subagents.includes(agent.name) && matchesSessionType(agent.sessionTypes, currentSessionType);
        }
      })();
      const agents = (await this._promptsService.getCustomAgents(token)).filter((a) => a.enabled);
      if (agents.length > 0) {
        entries.push("<agents>");
        entries.push("Here is a list of agents that can be used when running a subagent.");
        entries.push("Each agent has optionally a description with the agent's purpose and expertise. When asked to run a subagent, choose the most appropriate agent from this list.");
        entries.push(`Use the ${runSubagentTool.variable} tool with the agent name to run the subagent.`);
        for (const agent of agents) {
          if (canUseAgent(agent)) {
            entries.push("<agent>");
            entries.push(`<name>${escape(agent.name)}</name>`);
            if (agent.description) {
              entries.push(`<description>${escape(agent.description)}</description>`);
            }
            if (agent.argumentHint) {
              entries.push(`<argumentHint>${escape(agent.argumentHint)}</argumentHint>`);
            }
            entries.push("</agent>");
            debugInfo.debugDetails.push({ category: "custom-agent", name: agent.name, uri: agent.uri });
            if (isInClaudeAgentsFolder(agent.uri)) {
              telemetryEvent.claudeAgentsCount++;
            }
          } else {
            debugInfo.debugDetails.push({ category: "skipped", name: agent.name, uri: agent.uri, reason: localize(13034, null) });
          }
        }
        entries.push("</agents>", "", "");
      }
    }
    if (entries.length === 0) {
      return void 0;
    }
    const content = entries.join("\n");
    const toolReferences = [];
    const collectToolReference = (tool) => {
      if (tool) {
        let offset = content.indexOf(tool.variable);
        while (offset >= 0) {
          toolReferences.push(toToolVariableEntry(tool.tool, new OffsetRange(offset, offset + tool.variable.length)));
          offset = content.indexOf(tool.variable, offset + 1);
        }
      }
    };
    collectToolReference(fileReadTool);
    collectToolReference(runSubagentTool);
    collectToolReference(skillTool);
    return toPromptTextVariableEntry(content, true, toolReferences);
  }
  async _addReferencedInstructions(attachedContext, telemetryEvent, debugInfo, token) {
    const includeReferencedInstructions = this._configurationService.getValue(PromptsConfig.INCLUDE_REFERENCED_INSTRUCTIONS);
    if (!includeReferencedInstructions && this._modeKind !== "edit" /* Edit */) {
      this._logService.trace(`[InstructionsContextComputer] includeReferencedInstructions is disabled and agent kind is not Edit. No referenced instructions will be added.`);
      return;
    }
    const seen = new ResourceSet();
    const todo = [];
    for (const variable of attachedContext.asArray()) {
      if (isPromptFileVariableEntry(variable)) {
        if (!seen.has(variable.value)) {
          todo.push(variable.value);
          seen.add(variable.value);
        }
      }
    }
    let next = todo.pop();
    while (next) {
      const result = await this._parseInstructionsFile(next, token);
      if (result && result.body) {
        const refsToCheck = [];
        for (const ref of result.body.fileReferences) {
          const url = result.body.resolveFilePath(ref.content);
          if (url && !seen.has(url) && (isPromptOrInstructionsFile(url) || this._workspaceService.getWorkspaceFolder(url) !== void 0)) {
            refsToCheck.push({ resource: url });
            seen.add(url);
          }
        }
        if (refsToCheck.length > 0) {
          const stats = await this._fileService.resolveAll(refsToCheck);
          for (let i = 0; i < stats.length; i++) {
            const stat2 = stats[i];
            const uri2 = refsToCheck[i].resource;
            if (stat2.success && stat2.stat?.isFile) {
              if (isPromptOrInstructionsFile(uri2)) {
                todo.push(uri2);
              }
              const reason = localize(13045, null, basename2(next));
              attachedContext.add(toPromptFileVariableEntry(uri2, "vscode.instructions.file.reference" /* InstructionReference */, reason, true));
              telemetryEvent.referencedInstructionsCount++;
              debugInfo.debugDetails.push({ category: "referenced", name: basename2(uri2).toString(), uri: uri2, reason });
              this._logService.trace(`[InstructionsContextComputer] ${uri2.toString()} added, referenced by ${next.toString()}`);
            }
          }
        }
      }
      next = todo.pop();
    }
  }
};

ComputeAutomaticInstructions = __decorateClass([
  __decorateParam(4, IPromptsService),
  __decorateParam(5, ILogService),
  __decorateParam(6, ILabelService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, IFileService),
  __decorateParam(10, IRemoteAgentService),
  __decorateParam(11, ITelemetryService),
  __decorateParam(12, ILanguageModelToolsService),
  __decorateParam(13, IAgentPluginService)
], ComputeAutomaticInstructions);

function getFilePath(uri2, remoteOS, isRemote = false) {
  if (isRemote && uri2.scheme === Schemas.file) {
    return uri2.with({ scheme: "vscode-local" }).toString();
  }
  if (uri2.scheme === Schemas.file || uri2.scheme === Schemas.vscodeRemote) {
    const fsPath = uri2.fsPath;
    if (remoteOS !== void 0) {
      if (remoteOS === 1 /* Windows */) {
        return fsPath.replace(/\//g, "\\");
      }
      return fsPath.replace(/\\/g, "/");
    }
    return fsPath;
  }
  return uri2.toString();
}
export { getFilePath, lastInstructionsCollectionResult, ComputeAutomaticInstructions };
