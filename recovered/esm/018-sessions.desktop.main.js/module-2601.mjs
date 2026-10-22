// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptValidator.ts
import { AGENTS_SOURCE_FOLDER, CLAUDE_AGENTS_SOURCE_FOLDER, LEGACY_MODE_FILE_EXTENSION, VALID_SKILL_NAME_REGEX, isInClaudeRulesFolder, isSkillFilename } from "./module-0997.mjs";
import { localize } from "./module-0001.mjs";
import { Range2 } from "./module-0106.mjs";
import { PromptHeaderAttributes, parseCommaSeparatedList2 } from "./module-1004.mjs";
import { Lazy } from "./module-0028.mjs";
import { ILanguageModelChatMetadata, ILanguageModelsService } from "./module-0968.mjs";
import { Iterable } from "./module-0011.mjs";
import { isEmptyPattern, parse4, splitGlobAware } from "./module-0857.mjs";
import { HOOKS_BY_TARGET } from "./module-1011.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { ChatMode, IChatModeService } from "./module-1469.mjs";
import { ILanguageModelToolsService, SpecedToolAliases } from "./module-0991.mjs";
import { GithubPromptHeaderAttributes } from "./module-1016.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IPromptsService } from "./module-0987.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { URI } from "./module-0032.mjs";
import { dirname2 } from "./module-0034.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptValidator.ts
var MARKERS_OWNER_ID = "prompts-diagnostics-provider";

var PromptValidator = class {
  constructor(languageModelsService, languageModelToolsService, chatModeService, fileService, labelService, promptsService, logger, configurationService) {
    this.languageModelsService = languageModelsService;
    this.languageModelToolsService = languageModelToolsService;
    this.chatModeService = chatModeService;
    this.fileService = fileService;
    this.labelService = labelService;
    this.promptsService = promptsService;
    this.logger = logger;
    this.configurationService = configurationService;
  }
  async validate(promptAST, promptType, report) {
    promptAST.header?.errors.forEach((error) => report(toMarker(error.message, error.range, 8 /* Error */)));
    const target = getTarget2(promptType, promptAST.header ?? promptAST.uri);
    await this.validateHeader(promptAST, promptType, target, report);
    await this.validateBody(promptAST, target, report);
    await this.validateFileName(promptAST, promptType, report);
    await this.validateSkillAttributes(promptAST, promptType, report);
  }
  async validateFileName(promptAST, promptType, report) {
    if (promptType === "agent" /* agent */ && promptAST.uri.path.endsWith(LEGACY_MODE_FILE_EXTENSION)) {
      const location2 = this.promptsService.getAgentFileURIFromModeFile(promptAST.uri);
      if (location2 && await this.fileService.canCreateFile(location2)) {
        report(toMarker(localize(13283, null, location2.toString()), new Range2(1, 1, 1, 4), 4 /* Warning */));
      } else {
        report(toMarker(localize(13284, null, AGENTS_SOURCE_FOLDER), new Range2(1, 1, 1, 4), 4 /* Warning */));
      }
    }
  }
  async validateSkillAttributes(promptAST, promptType, report) {
    if (promptType !== "skill" /* skill */ || !promptAST.header) {
      return;
    }
    const nameAttribute = promptAST.header.getAttribute(PromptHeaderAttributes.name);
    if (!nameAttribute) {
      report(toMarker(
        localize(13350, null),
        new Range2(1, 1, 1, 4),
        4 /* Warning */
      ));
    } else if (nameAttribute.value.type === "scalar") {
      const skillName = nameAttribute.value.value.trim();
      if (skillName.length > 0) {
        if (!VALID_SKILL_NAME_REGEX.test(skillName)) {
          report(toMarker(
            localize(13349, null),
            nameAttribute.value.range,
            8 /* Error */
          ));
        }
        const pathParts = promptAST.uri.path.split("/");
        const skillIndex = pathParts.findIndex((part) => isSkillFilename(part));
        if (skillIndex > 0) {
          const folderName = pathParts[skillIndex - 1];
          if (folderName && skillName !== folderName) {
            report(toMarker(
              localize(13348, null, skillName, folderName),
              nameAttribute.value.range,
              4 /* Warning */
            ));
          }
        }
      }
    }
    const descriptionAttribute = promptAST.header.getAttribute(PromptHeaderAttributes.description);
    if (!descriptionAttribute) {
      report(toMarker(
        localize(13346, null),
        new Range2(1, 1, 1, 4),
        4 /* Warning */
      ));
      if (promptAST.header.userInvocable === false) {
        const userInvocableAttr = promptAST.header.getAttribute(PromptHeaderAttributes.userInvocable);
        if (userInvocableAttr) {
          report(toMarker(
            localize(13351, null),
            userInvocableAttr.value.range,
            8 /* Error */
          ));
        }
      }
      if (promptAST.header.disableModelInvocation === false) {
        const disableModelInvocationAttr = promptAST.header.getAttribute(PromptHeaderAttributes.disableModelInvocation);
        if (disableModelInvocationAttr) {
          report(toMarker(
            localize(13347, null),
            disableModelInvocationAttr.value.range,
            8 /* Error */
          ));
        }
      }
    }
    const contextAttribute = promptAST.header?.getAttribute(PromptHeaderAttributes.context);
    if (contextAttribute && contextAttribute.value.type === "scalar" && contextAttribute.value.value.trim() === "fork") {
      const skillToolEnabled = this.configurationService.getValue("github.copilot.chat.skillTool.enabled");
      if (!skillToolEnabled) {
        report(toMarker(
          localize(13287, null),
          contextAttribute.value.range,
          4 /* Warning */
        ));
      }
    }
  }
  async validateBody(promptAST, target, report) {
    const body = promptAST.body;
    if (!body) {
      return;
    }
    const fileReferenceChecks = [];
    for (const ref of body.fileReferences) {
      const resolved = body.resolveFilePath(ref.content);
      if (!resolved) {
        report(toMarker(localize(13324, null, ref.content), ref.range, 4 /* Warning */));
        continue;
      }
      if (promptAST.uri.scheme === resolved.scheme) {
        fileReferenceChecks.push((async () => {
          try {
            const exists = await this.fileService.exists(resolved);
            if (!exists) {
              const loc = this.labelService.getUriLabel(resolved);
              report(toMarker(localize(13300, null, ref.content, loc), ref.range, 4 /* Warning */));
            }
          } catch (e4) {
            this.logger.warn(`Error checking existence of file reference '${ref.content}' resolved to '${resolved.toString()}' in prompt file '${promptAST.uri.toString()}': ${e4.message}`);
          }
        })());
      }
    }
    if (body.variableReferences.length && isVSCodeOrDefaultTarget2(target)) {
      const headerTools = promptAST.header?.tools;
      const headerToolsMap = headerTools ? this.languageModelToolsService.toToolAndToolSetEnablementMap(headerTools, void 0) : void 0;
      const available = new Set(this.languageModelToolsService.getFullReferenceNames());
      const deprecatedNames = this.languageModelToolsService.getDeprecatedFullReferenceNames();
      for (const variable of body.variableReferences) {
        if (!available.has(variable.name)) {
          if (deprecatedNames.has(variable.name)) {
            const currentNames = deprecatedNames.get(variable.name);
            if (currentNames && currentNames.size > 0) {
              if (currentNames.size === 1) {
                const newName = Array.from(currentNames)[0];
                report(toMarker(localize(13288, null, variable.name, newName), variable.range, 2 /* Info */));
              } else {
                const newNames = Array.from(currentNames).sort((a, b) => a.localeCompare(b)).join(", ");
                report(toMarker(localize(13289, null, variable.name, newNames), variable.range, 2 /* Info */));
              }
            }
          } else {
            const missingGithubServerMarker = this.getMissingGithubMcpServerMarker(variable.name, variable.range);
            if (missingGithubServerMarker) {
              report(missingGithubServerMarker);
            } else {
              const missingPlaywrightServerMarker = this.getMissingPlaywrightMcpServerMarker(variable.name, variable.range);
              if (missingPlaywrightServerMarker) {
                report(missingPlaywrightServerMarker);
              } else {
                report(this.getUnknownToolMarker(variable.name, variable.range, true));
              }
            }
          }
        } else if (headerToolsMap) {
          const tool = this.languageModelToolsService.getToolByFullReferenceName(variable.name);
          if (tool && headerToolsMap.get(tool) === false) {
            report(toMarker(localize(13292, null, variable.name), variable.range, 4 /* Warning */));
          }
        }
      }
    }
    await Promise.all(fileReferenceChecks);
  }
  async validateHeader(promptAST, promptType, target, report) {
    const header2 = promptAST.header;
    if (!header2) {
      return;
    }
    const attributes = header2.attributes;
    this.checkForInvalidArguments(attributes, promptType, target, report);
    this.validateName(attributes, report);
    this.validateDescription(attributes, report);
    this.validateArgumentHint(attributes, report);
    switch (promptType) {
      case "prompt" /* prompt */: {
        const agent = await this.validateAgent(attributes, report);
        this.validateTools(attributes, agent?.kind ?? "agent" /* Agent */, target, report);
        this.validateModel(attributes, agent?.kind ?? "agent" /* Agent */, report);
        break;
      }
      case "instructions" /* instructions */:
        if (target === "claude" /* Claude */) {
          this.validatePaths(attributes, report);
        } else {
          this.validateApplyTo(attributes, report);
        }
        this.validateExcludeAgent(attributes, report);
        break;
      case "agent" /* agent */: {
        this.validateTarget(attributes, report);
        this.validateInfer(attributes, report);
        this.validateUserInvocable(attributes, report);
        this.validateDisableModelInvocation(attributes, report);
        this.validateTools(attributes, "agent" /* Agent */, target, report);
        this.validateHooks(attributes, target, report);
        if (isVSCodeOrDefaultTarget2(target)) {
          this.validateModel(attributes, "agent" /* Agent */, report);
          this.validateHandoffs(attributes, report);
          await this.validateAgentsAttribute(attributes, header2, report);
          this.validateGithubPermissions(attributes, report);
        } else if (target === "claude" /* Claude */) {
          this.validateClaudeAttributes(attributes, report);
        } else if (target === "github-copilot" /* GitHubCopilot */) {
          this.validateGithubPermissions(attributes, report);
        }
        break;
      }
      case "skill" /* skill */:
        this.validateUserInvocable(attributes, report);
        this.validateDisableModelInvocation(attributes, report);
        break;
    }
  }
  checkForInvalidArguments(attributes, promptType, target, report) {
    const validAttributeNames = getValidAttributeNames2(promptType, true, target);
    const validGithubCopilotAttributeNames = new Lazy(() => new Set(getValidAttributeNames2(promptType, false, "github-copilot" /* GitHubCopilot */)));
    for (const attribute of attributes) {
      if (!validAttributeNames.includes(attribute.key)) {
        const supportedNames = new Lazy(() => {
          const names = getValidAttributeNames2(promptType, false, target);
          return names.sort().join(", ");
        });
        switch (promptType) {
          case "prompt" /* prompt */:
            report(toMarker(localize(13361, null, attribute.key, supportedNames.value), attribute.range, 1 /* Hint */, [1 /* Unnecessary */]));
            break;
          case "agent" /* agent */:
            if (target === "github-copilot" /* GitHubCopilot */) {
              report(toMarker(localize(13359, null, attribute.key, supportedNames.value), attribute.range, 1 /* Hint */, [1 /* Unnecessary */]));
            } else if (target === "claude" /* Claude */) {
            } else {
              if (validGithubCopilotAttributeNames.value.has(attribute.key)) {
                report(toMarker(localize(13322, null, attribute.key), attribute.range, 1 /* Hint */, [1 /* Unnecessary */]));
              } else {
                report(toMarker(localize(13364, null, attribute.key, supportedNames.value), attribute.range, 1 /* Hint */, [1 /* Unnecessary */]));
              }
            }
            break;
          case "instructions" /* instructions */:
            if (target === "claude" /* Claude */) {
              report(toMarker(localize(13362, null, attribute.key, supportedNames.value), attribute.range, 1 /* Hint */, [1 /* Unnecessary */]));
            } else {
              report(toMarker(localize(13360, null, attribute.key, supportedNames.value), attribute.range, 1 /* Hint */, [1 /* Unnecessary */]));
            }
            break;
          case "skill" /* skill */:
            report(toMarker(localize(13363, null, attribute.key, supportedNames.value), attribute.range, 1 /* Hint */, [1 /* Unnecessary */]));
            break;
        }
      }
    }
  }
  validateName(attributes, report) {
    const nameAttribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.name);
    if (!nameAttribute) {
      return;
    }
    if (nameAttribute.value.type !== "scalar") {
      report(toMarker(localize(13338, null), nameAttribute.range, 8 /* Error */));
      return;
    }
    if (nameAttribute.value.value.trim().length === 0) {
      report(toMarker(localize(13339, null), nameAttribute.value.range, 8 /* Error */));
      return;
    }
  }
  validateDescription(attributes, report) {
    const descriptionAttribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.description);
    if (!descriptionAttribute) {
      return;
    }
    if (descriptionAttribute.value.type !== "scalar") {
      report(toMarker(localize(13290, null), descriptionAttribute.range, 8 /* Error */));
      return;
    }
    if (descriptionAttribute.value.value.trim().length === 0) {
      report(toMarker(localize(13291, null), descriptionAttribute.value.range, 8 /* Error */));
      return;
    }
  }
  validateArgumentHint(attributes, report) {
    const argumentHintAttribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.argumentHint);
    if (!argumentHintAttribute) {
      return;
    }
    if (argumentHintAttribute.value.type !== "scalar") {
      report(toMarker(localize(13279, null), argumentHintAttribute.range, 8 /* Error */));
      return;
    }
    if (argumentHintAttribute.value.value.trim().length === 0) {
      report(toMarker(localize(13280, null), argumentHintAttribute.value.range, 4 /* Warning */));
      return;
    }
  }
  validateModel(attributes, agentKind, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.model);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "scalar" && attribute.value.type !== "sequence") {
      report(toMarker(localize(13335, null), attribute.value.range, 8 /* Error */));
      return;
    }
    const modelNames = [];
    if (attribute.value.type === "scalar") {
      const modelName = attribute.value.value.trim();
      if (modelName.length === 0) {
        report(toMarker(localize(13334, null), attribute.value.range, 8 /* Error */));
        return;
      }
      modelNames.push([modelName, attribute.value.range]);
    } else if (attribute.value.type === "sequence") {
      if (attribute.value.items.length === 0) {
        report(toMarker(localize(13333, null), attribute.value.range, 8 /* Error */));
        return;
      }
      for (const item of attribute.value.items) {
        if (item.type !== "scalar") {
          report(toMarker(localize(13332, null), item.range, 8 /* Error */));
          return;
        }
        const modelName = item.value.trim();
        if (modelName.length === 0) {
          report(toMarker(localize(13331, null), item.range, 8 /* Error */));
          return;
        }
        modelNames.push([modelName, item.range]);
      }
    }
    const languageModels = this.languageModelsService.getLanguageModelIds();
    if (languageModels.length === 0) {
      return;
    }
    for (const [modelName, range2] of modelNames) {
      const modelMetadata = this.findModelByName(modelName);
      if (!modelMetadata) {
        report(toMarker(localize(13336, null, modelName), range2, 1 /* Hint */, [1 /* Unnecessary */]));
      } else if (agentKind === "agent" /* Agent */ && !ILanguageModelChatMetadata.suitableForAgentMode(modelMetadata)) {
        report(toMarker(localize(13337, null, modelName), range2, 4 /* Warning */));
      }
    }
  }
  validateClaudeAttributes(attributes, report) {
    for (const claudeAttributeName in claudeAgentAttributes2) {
      const claudeAttribute = claudeAgentAttributes2[claudeAttributeName];
      const enumValues = claudeAttribute.enums;
      if (enumValues) {
        const attribute = attributes.find((attr) => attr.key === claudeAttributeName);
        if (!attribute) {
          continue;
        }
        if (attribute.value.type !== "scalar") {
          report(toMarker(localize(13285, null, claudeAttributeName), attribute.value.range, 8 /* Error */));
          continue;
        } else {
          const modelName = attribute.value.value.trim();
          if (enumValues.every((model) => model.name !== modelName)) {
            const validValues = enumValues.map((model) => model.name).join(", ");
            report(toMarker(localize(13286, null, modelName, validValues), attribute.value.range, 4 /* Warning */));
          }
        }
      }
    }
  }
  findModelByName(modelName) {
    const metadataAndId = this.languageModelsService.lookupLanguageModelByQualifiedName(modelName);
    if (metadataAndId && metadataAndId.metadata.isUserSelectable !== false) {
      return metadataAndId.metadata;
    }
    return void 0;
  }
  async validateAgent(attributes, report) {
    const agentAttribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.agent);
    const modeAttribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.mode);
    if (modeAttribute) {
      if (agentAttribute) {
        report(toMarker(localize(13329, null), modeAttribute.range, 4 /* Warning */, [2 /* Deprecated */]));
      } else {
        report(toMarker(localize(13330, null), modeAttribute.range, 4 /* Warning */, [2 /* Deprecated */]));
      }
    }
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.agent) ?? modeAttribute;
    if (!attribute) {
      return void 0;
    }
    if (attribute.value.type !== "scalar") {
      report(toMarker(localize(13282, null, attribute.key), attribute.value.range, 8 /* Error */));
      return void 0;
    }
    const agentValue = attribute.value.value;
    if (agentValue.trim().length === 0) {
      report(toMarker(localize(13281, null, attribute.key), attribute.value.range, 8 /* Error */));
      return void 0;
    }
    return await this.validateAgentValue(attribute.value, report);
  }
  async validateAgentValue(value2, report) {
    const agents = await this.chatModeService.getLocalModes();
    const availableAgents = [];
    for (const agent of Iterable.concat(agents.builtin, agents.custom)) {
      if (agent.name.get() === value2.value) {
        return agent;
      }
      availableAgents.push(agent.name.get());
    }
    const errorMessage = localize(13274, null, value2.value, availableAgents.join(", "));
    report(toMarker(errorMessage, value2.range, 4 /* Warning */));
    return void 0;
  }
  validateTools(attributes, agentKind, target, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.tools);
    if (!attribute) {
      return;
    }
    if (agentKind !== "agent" /* Agent */) {
      report(toMarker(localize(13358, null), attribute.range, 4 /* Warning */));
    }
    let value2 = attribute.value;
    if (value2.type === "scalar") {
      value2 = parseCommaSeparatedList2(value2);
    }
    if (value2.type !== "sequence") {
      report(toMarker(localize(13357, null), attribute.value.range, 8 /* Error */));
      return;
    }
    if (target === "github-copilot" /* GitHubCopilot */ || target === "claude" /* Claude */) {
    } else {
      this.validateVSCodeTools(value2, report);
    }
  }
  validateVSCodeTools(valueItem, report) {
    if (valueItem.items.length > 0) {
      const available = new Set(this.languageModelToolsService.getFullReferenceNames());
      const deprecatedNames = this.languageModelToolsService.getDeprecatedFullReferenceNames();
      for (const item of valueItem.items) {
        if (item.type !== "scalar") {
          report(toMarker(localize(13298, null), item.range, 8 /* Error */));
        } else if (item.value) {
          if (!available.has(item.value)) {
            const currentNames = deprecatedNames.get(item.value);
            if (currentNames) {
              if (currentNames?.size === 1) {
                const newName = Array.from(currentNames)[0];
                report(toMarker(localize(13355, null, item.value, newName), item.range, 2 /* Info */, [2 /* Deprecated */]));
              } else {
                const newNames = Array.from(currentNames).sort((a, b) => a.localeCompare(b)).join(", ");
                report(toMarker(localize(13356, null, item.value, newNames), item.range, 2 /* Info */, [2 /* Deprecated */]));
              }
            } else {
              const missingGithubServerMarker = this.getMissingGithubMcpServerMarker(item.value, item.range);
              if (missingGithubServerMarker) {
                report(missingGithubServerMarker);
              } else {
                const missingPlaywrightServerMarker = this.getMissingPlaywrightMcpServerMarker(item.value, item.range);
                if (missingPlaywrightServerMarker) {
                  report(missingPlaywrightServerMarker);
                } else {
                  report(this.getUnknownToolMarker(item.value, item.range, false));
                }
              }
            }
          }
        }
      }
    }
  }
  getUnknownToolMarker(toolReferenceName, range2, isVariableReference) {
    const splitBySlash = toolReferenceName.split("/");
    const slashCount = splitBySlash.length - 1;
    const hasExtensionLikeName = splitBySlash[0].includes(".");
    if (slashCount >= 2) {
      return toMarker(
        localize(
          13371,
          null,
          toolReferenceName
        ),
        range2,
        1 /* Hint */,
        [1 /* Unnecessary */],
        "promptValidator.unknownMcpServerReference" /* UnknownMcpServerReference */
      );
    }
    if (hasExtensionLikeName) {
      return toMarker(
        localize(
          13365,
          null,
          toolReferenceName
        ),
        range2,
        1 /* Hint */,
        [1 /* Unnecessary */],
        "promptValidator.unknownExtensionReference" /* UnknownExtensionReference */
      );
    }
    if (isVariableReference) {
      return toMarker(
        localize(
          13374,
          null,
          toolReferenceName
        ),
        range2,
        1 /* Hint */,
        [1 /* Unnecessary */],
        "promptValidator.unknownExtensionOrMcpServerReference" /* UnknownExtensionOrMcpServerReference */
      );
    } else {
      return toMarker(
        localize(
          13373,
          null,
          toolReferenceName
        ),
        range2,
        1 /* Hint */,
        [1 /* Unnecessary */],
        "promptValidator.unknownExtensionOrMcpServerReference" /* UnknownExtensionOrMcpServerReference */
      );
    }
  }
  getMissingGithubMcpServerMarker(toolReferenceName, range2) {
    if (toolReferenceName !== "github/*") {
      return void 0;
    }
    return toMarker(
      localize(
        13326,
        null,
        toolReferenceName
      ),
      range2,
      1 /* Hint */,
      [1 /* Unnecessary */],
      "promptValidator.missingGithubMcpServer" /* MissingGithubMcpServer */
    );
  }
  getMissingPlaywrightMcpServerMarker(toolReferenceName, range2) {
    if (toolReferenceName !== "playwright/*") {
      return void 0;
    }
    return toMarker(
      localize(
        13328,
        null,
        toolReferenceName
      ),
      range2,
      1 /* Hint */,
      [1 /* Unnecessary */],
      "promptValidator.missingPlaywrightMcpServer" /* MissingPlaywrightMcpServer */
    );
  }
  validateApplyTo(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.applyTo);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "scalar") {
      report(toMarker(localize(13277, null), attribute.value.range, 8 /* Error */));
      return;
    }
    const pattern = attribute.value.value;
    try {
      const patterns = splitGlobAware(pattern, ",");
      if (patterns.length === 0) {
        report(toMarker(localize(13278, null), attribute.value.range, 8 /* Error */));
        return;
      }
      for (const pattern2 of patterns) {
        const globPattern = parse4(pattern2);
        if (isEmptyPattern(globPattern)) {
          report(toMarker(localize(13278, null), attribute.value.range, 8 /* Error */));
          return;
        }
      }
    } catch (_error) {
      report(toMarker(localize(13278, null), attribute.value.range, 8 /* Error */));
    }
  }
  validatePaths(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.paths);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "sequence") {
      report(toMarker(localize(13343, null), attribute.value.range, 8 /* Error */));
      return;
    }
    for (const item of attribute.value.items) {
      if (item.type !== "scalar") {
        report(toMarker(localize(13297, null), item.range, 8 /* Error */));
        continue;
      }
      const pattern = item.value.trim();
      if (pattern.length === 0) {
        report(toMarker(localize(13341, null), item.range, 8 /* Error */));
        continue;
      }
      try {
        const globPattern = parse4(pattern);
        if (isEmptyPattern(globPattern)) {
          report(toMarker(localize(13342, null, pattern), item.range, 8 /* Error */));
        }
      } catch (_error) {
        report(toMarker(localize(13342, null, pattern), item.range, 8 /* Error */));
      }
    }
  }
  validateExcludeAgent(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.excludeAgent);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "sequence" && attribute.value.type !== "scalar") {
      report(toMarker(localize(13299, null), attribute.value.range, 8 /* Error */));
      return;
    }
  }
  validateHooks(attributes, target, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.hooks);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "map") {
      report(toMarker(localize(13318, null), attribute.value.range, 8 /* Error */));
      return;
    }
    const validHookNames = new Set(Object.keys(HOOKS_BY_TARGET[target] ?? HOOKS_BY_TARGET["undefined" /* Undefined */]));
    for (const prop of attribute.value.properties) {
      if (!validHookNames.has(prop.key.value)) {
        report(toMarker(localize(13369, null, prop.key.value, Array.from(validHookNames).join(", ")), prop.key.range, 4 /* Warning */));
      }
      if (prop.value.type !== "sequence") {
        report(toMarker(localize(13321, null, prop.key.value), prop.value.range, 8 /* Error */));
        continue;
      }
      for (const item of prop.value.items) {
        this.validateHookCommand(item, target, report);
      }
    }
  }
  validateHookCommand(item, target, report) {
    if (item.type !== "map") {
      report(toMarker(localize(13311, null), item.range, 8 /* Error */));
      return;
    }
    const hooksProperty = item.properties.find((p) => p.key.value === "hooks");
    if (hooksProperty) {
      for (const prop of item.properties) {
        if (prop.key.value !== "hooks" && prop.key.value !== "matcher") {
          report(toMarker(localize(13370, null, prop.key.value), prop.key.range, 4 /* Warning */));
        }
      }
      if (hooksProperty.value.type !== "sequence") {
        report(toMarker(localize(13340, null), hooksProperty.value.range, 8 /* Error */));
        return;
      }
      for (const nestedItem of hooksProperty.value.items) {
        this.validateHookCommand(nestedItem, target, report);
      }
      return;
    }
    const isCopilotCli = target === "github-copilot" /* GitHubCopilot */;
    const validCommandFields = isCopilotCli ? /* @__PURE__ */ new Set(["bash", "powershell"]) : /* @__PURE__ */ new Set(["command", "windows", "linux", "osx", "bash", "powershell"]);
    const validProperties = isCopilotCli ? /* @__PURE__ */ new Set(["type", "bash", "powershell", "cwd", "env", "timeoutSec"]) : /* @__PURE__ */ new Set(["type", "command", "windows", "linux", "osx", "bash", "powershell", "cwd", "env", "timeout"]);
    let hasType = false;
    let hasCommandField = false;
    for (const prop of item.properties) {
      const key3 = prop.key.value;
      if (!validProperties.has(key3)) {
        report(toMarker(localize(13368, null, key3), prop.key.range, 4 /* Warning */));
      }
      if (key3 === "type") {
        hasType = true;
        if (prop.value.type !== "scalar" || prop.value.value !== "command") {
          report(toMarker(localize(13320, null), prop.value.range, 8 /* Error */));
        }
      } else if (validCommandFields.has(key3)) {
        hasCommandField = true;
        if (prop.value.type !== "scalar" || prop.value.value.trim().length === 0) {
          report(toMarker(localize(13310, null, key3), prop.value.range, 8 /* Error */));
        }
      } else if (key3 === "cwd") {
        if (prop.value.type !== "scalar") {
          report(toMarker(localize(13312, null), prop.value.range, 8 /* Error */));
        }
      } else if (key3 === "env") {
        if (prop.value.type !== "map") {
          report(toMarker(localize(13313, null), prop.value.range, 8 /* Error */));
        } else {
          for (const envProp of prop.value.properties) {
            if (envProp.value.type !== "scalar") {
              report(toMarker(localize(13314, null, envProp.key.value), envProp.value.range, 8 /* Error */));
            }
          }
        }
      } else if (key3 === "timeout" || key3 === "timeoutSec") {
        if (prop.value.type !== "scalar" || isNaN(Number(prop.value.value))) {
          report(toMarker(localize(13319, null, key3), prop.value.range, 8 /* Error */));
        }
      }
    }
    if (!hasType) {
      report(toMarker(localize(13317, null), item.range, 8 /* Error */));
    }
    if (!hasCommandField) {
      if (isCopilotCli) {
        report(toMarker(localize(13316, null), item.range, 8 /* Error */));
      } else {
        report(toMarker(localize(13315, null), item.range, 8 /* Error */));
      }
    }
  }
  validateHandoffs(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.handOffs);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "sequence") {
      report(toMarker(localize(13309, null), attribute.value.range, 8 /* Error */));
      return;
    }
    const seenLabels = /* @__PURE__ */ new Map();
    for (const item of attribute.value.items) {
      if (item.type !== "map") {
        report(toMarker(localize(13296, null), item.range, 8 /* Error */));
        continue;
      }
      const required = /* @__PURE__ */ new Set(["label", "agent", "prompt"]);
      for (const prop of item.properties) {
        switch (prop.key.value) {
          case "label":
            if (prop.value.type !== "scalar" || prop.value.value.trim().length === 0) {
              report(toMarker(localize(13303, null), prop.value.range, 8 /* Error */));
            } else if (!/[a-zA-Z0-9]/.test(prop.value.value)) {
              report(toMarker(localize(13304, null), prop.value.range, 8 /* Error */));
            }
            break;
          case "agent":
            if (prop.value.type !== "scalar" || prop.value.value.trim().length === 0) {
              report(toMarker(localize(13302, null), prop.value.range, 8 /* Error */));
            } else {
              this.validateAgentValue(prop.value, report);
            }
            break;
          case "prompt":
            if (prop.value.type !== "scalar") {
              report(toMarker(localize(13306, null), prop.value.range, 8 /* Error */));
            }
            break;
          case "send":
            if (!isTrueOrFalse(prop.value)) {
              report(toMarker(localize(13307, null), prop.value.range, 8 /* Error */));
            }
            break;
          case "showContinueOn":
            if (!isTrueOrFalse(prop.value)) {
              report(toMarker(localize(13308, null), prop.value.range, 8 /* Error */));
            }
            break;
          case "model":
            if (prop.value.type !== "scalar") {
              report(toMarker(localize(13305, null), prop.value.range, 8 /* Error */));
            }
            break;
          default:
            report(toMarker(localize(13367, null, prop.key.value), prop.value.range, 4 /* Warning */));
        }
        required.delete(prop.key.value);
      }
      if (required.size > 0) {
        report(toMarker(localize(13327, null, Array.from(required).map((s) => `'${s}'`).join(", ")), item.range, 8 /* Error */));
      }
      const labelProp = item.properties.find((p) => p.key.value === "label");
      if (labelProp?.value.type === "scalar") {
        const normalizedLabel = labelProp.value.value.toLowerCase();
        if (normalizedLabel && seenLabels.has(normalizedLabel)) {
          report(toMarker(localize(13294, null, labelProp.value.value), labelProp.value.range, 8 /* Error */));
        } else if (normalizedLabel) {
          seenLabels.set(normalizedLabel, labelProp.value.range);
        }
      }
    }
  }
  validateInfer(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.infer);
    if (!attribute) {
      return;
    }
    report(toMarker(localize(13323, null), attribute.value.range, 8 /* Error */));
  }
  validateTarget(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.target);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "scalar") {
      report(toMarker(localize(13354, null), attribute.value.range, 8 /* Error */));
      return;
    }
    const targetValue = attribute.value.value.trim();
    if (targetValue.length === 0) {
      report(toMarker(localize(13353, null), attribute.value.range, 8 /* Error */));
      return;
    }
    const validTargets = ["github-copilot", "vscode"];
    if (!validTargets.includes(targetValue)) {
      report(toMarker(localize(13352, null, validTargets.join(", ")), attribute.value.range, 8 /* Error */));
    }
  }
  validateUserInvocable(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.userInvocable);
    if (!attribute) {
      return;
    }
    if (!isTrueOrFalse(attribute.value)) {
      report(toMarker(localize(13375, null), attribute.value.range, 8 /* Error */));
      return;
    }
  }
  validateDisableModelInvocation(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.disableModelInvocation);
    if (!attribute) {
      return;
    }
    if (!isTrueOrFalse(attribute.value)) {
      report(toMarker(localize(13293, null), attribute.value.range, 8 /* Error */));
      return;
    }
  }
  async validateAgentsAttribute(attributes, header2, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.agents);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "sequence") {
      report(toMarker(localize(13275, null), attribute.value.range, 8 /* Error */));
      return;
    }
    const agents = (await this.promptsService.getCustomAgents(CancellationToken.None)).filter((a) => a.enabled);
    const availableAgentNames = new Set(agents.map((agent) => agent.name));
    availableAgentNames.add(ChatMode.Agent.name.get());
    const agentNames = [];
    for (const item of attribute.value.items) {
      if (item.type !== "scalar") {
        report(toMarker(localize(13295, null), item.range, 8 /* Error */));
      } else if (item.value) {
        agentNames.push(item.value);
        if (item.value !== "*" && !availableAgentNames.has(item.value)) {
          report(toMarker(localize(13273, null, item.value, Array.from(availableAgentNames).join(", ")), item.range, 1 /* Hint */, [1 /* Unnecessary */]));
        }
      }
    }
    if (agentNames.length > 0) {
      const tools = header2.tools;
      if (tools && !tools.includes(SpecedToolAliases.agent)) {
        report(toMarker(localize(13276, null), attribute.value.range, 4 /* Warning */));
      }
    }
  }
  validateGithubPermissions(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === GithubPromptHeaderAttributes.github);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "map") {
      report(toMarker(localize(13301, null), attribute.value.range, 8 /* Error */));
      return;
    }
    for (const prop of attribute.value.properties) {
      if (prop.key.value !== "permissions") {
        report(toMarker(localize(13366, null, prop.key.value), prop.key.range, 4 /* Warning */));
        continue;
      }
      if (prop.value.type !== "map") {
        report(toMarker(localize(13344, null), prop.value.range, 8 /* Error */));
        continue;
      }
      for (const permProp of prop.value.properties) {
        const scope = permProp.key.value;
        const scopeInfo = githubPermissionScopes[scope];
        if (!scopeInfo) {
          const validScopes = Object.keys(githubPermissionScopes).sort().join(", ");
          report(toMarker(localize(13372, null, scope, validScopes), permProp.key.range, 4 /* Warning */));
          continue;
        }
        if (permProp.value.type !== "scalar") {
          report(toMarker(localize(13345, null, scope), permProp.value.range, 8 /* Error */));
          continue;
        }
        const value2 = permProp.value.value;
        if (!scopeInfo.allowedValues.includes(value2)) {
          report(toMarker(localize(13325, null, value2, scope, scopeInfo.allowedValues.join(", ")), permProp.value.range, 8 /* Error */));
        }
      }
    }
  }
};

PromptValidator = __decorateClass([
  __decorateParam(0, ILanguageModelsService),
  __decorateParam(1, ILanguageModelToolsService),
  __decorateParam(2, IChatModeService),
  __decorateParam(3, IFileService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, IPromptsService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IConfigurationService)
], PromptValidator);

var githubPermissionScopes = {
  "actions": { allowedValues: ["read", "write", "none"], description: localize(13237, null) },
  "checks": { allowedValues: ["read", "none"], description: localize(13238, null) },
  "contents": { allowedValues: ["read", "write", "none"], description: localize(13239, null) },
  "discussions": { allowedValues: ["read", "write", "none"], description: localize(13240, null) },
  "issues": { allowedValues: ["read", "write", "none"], description: localize(13241, null) },
  "metadata": { allowedValues: ["read"], description: localize(13242, null) },
  "pull-requests": { allowedValues: ["read", "write", "none"], description: localize(13243, null) },
  "security-events": { allowedValues: ["read", "none"], description: localize(13244, null) },
  "workflows": { allowedValues: ["write", "none"], description: localize(13245, null) }
};

function isTrueOrFalse(value2) {
  if (value2.type === "scalar") {
    return (value2.value === "true" || value2.value === "false") && value2.format === "none";
  }
  return false;
}

var allAttributeNames2 = {
  ["prompt" /* prompt */]: [PromptHeaderAttributes.name, PromptHeaderAttributes.description, PromptHeaderAttributes.model, PromptHeaderAttributes.tools, PromptHeaderAttributes.mode, PromptHeaderAttributes.agent, PromptHeaderAttributes.argumentHint],
  ["instructions" /* instructions */]: [PromptHeaderAttributes.name, PromptHeaderAttributes.description, PromptHeaderAttributes.applyTo, PromptHeaderAttributes.excludeAgent],
  ["agent" /* agent */]: [PromptHeaderAttributes.name, PromptHeaderAttributes.description, PromptHeaderAttributes.model, PromptHeaderAttributes.reasoningEffort, PromptHeaderAttributes.tools, PromptHeaderAttributes.advancedOptions, PromptHeaderAttributes.handOffs, PromptHeaderAttributes.argumentHint, PromptHeaderAttributes.target, PromptHeaderAttributes.infer, PromptHeaderAttributes.agents, PromptHeaderAttributes.hooks, PromptHeaderAttributes.userInvocable, PromptHeaderAttributes.disableModelInvocation, GithubPromptHeaderAttributes.github],
  ["skill" /* skill */]: [PromptHeaderAttributes.name, PromptHeaderAttributes.description, PromptHeaderAttributes.license, PromptHeaderAttributes.compatibility, PromptHeaderAttributes.metadata, PromptHeaderAttributes.argumentHint, PromptHeaderAttributes.userInvocable, PromptHeaderAttributes.disableModelInvocation, PromptHeaderAttributes.context],
  ["hook" /* hook */]: []
  // hooks are JSON files, not markdown with YAML frontmatter
};

var githubCopilotAgentAttributeNames2 = [PromptHeaderAttributes.name, PromptHeaderAttributes.description, PromptHeaderAttributes.tools, PromptHeaderAttributes.target, PromptHeaderAttributes.model, PromptHeaderAttributes.reasoningEffort, GithubPromptHeaderAttributes.mcpServers, GithubPromptHeaderAttributes.github, PromptHeaderAttributes.infer];

var recommendedAttributeNames2 = {
  ["prompt" /* prompt */]: allAttributeNames2["prompt" /* prompt */].filter((name) => !isNonRecommendedAttribute2(name)),
  ["instructions" /* instructions */]: allAttributeNames2["instructions" /* instructions */].filter((name) => !isNonRecommendedAttribute2(name)),
  ["agent" /* agent */]: allAttributeNames2["agent" /* agent */].filter((name) => !isNonRecommendedAttribute2(name)),
  ["skill" /* skill */]: allAttributeNames2["skill" /* skill */].filter((name) => !isNonRecommendedAttribute2(name)),
  ["hook" /* hook */]: []
  // hooks are JSON files, not markdown with YAML frontmatter
};

function getValidAttributeNames2(promptType, includeNonRecommended, target) {
  if (target === "claude" /* Claude */) {
    if (promptType === "instructions" /* instructions */) {
      return Object.keys(claudeRulesAttributes2);
    }
    return Object.keys(claudeAgentAttributes2);
  } else if (target === "github-copilot" /* GitHubCopilot */) {
    if (promptType === "agent" /* agent */) {
      return githubCopilotAgentAttributeNames2;
    }
  }
  return includeNonRecommended ? allAttributeNames2[promptType] : recommendedAttributeNames2[promptType];
}

function isNonRecommendedAttribute2(attributeName) {
  return attributeName === PromptHeaderAttributes.advancedOptions || attributeName === PromptHeaderAttributes.excludeAgent || attributeName === PromptHeaderAttributes.mode || attributeName === PromptHeaderAttributes.infer;
}

var knownGithubCopilotTools2 = [
  { name: SpecedToolAliases.execute, description: localize(13234, null) },
  { name: SpecedToolAliases.read, description: localize(13235, null) },
  { name: SpecedToolAliases.edit, description: localize(13233, null) },
  { name: SpecedToolAliases.search, description: localize(13236, null) },
  { name: SpecedToolAliases.agent, description: localize(13232, null) }
];

var knownClaudeTools2 = [
  { name: "Bash", description: localize(13206, null), toolEquivalent: [SpecedToolAliases.execute] },
  { name: "Edit", description: localize(13207, null), toolEquivalent: ["edit/editNotebook", "edit/editFiles"] },
  { name: "Glob", description: localize(13208, null), toolEquivalent: ["search/fileSearch"] },
  { name: "Grep", description: localize(13209, null), toolEquivalent: ["search/textSearch"] },
  { name: "Read", description: localize(13225, null), toolEquivalent: ["read/readFile", "read/getNotebookSummary"] },
  { name: "Write", description: localize(13231, null), toolEquivalent: ["edit/createDirectory", "edit/createFile", "edit/createJupyterNotebook"] },
  { name: "WebFetch", description: localize(13229, null), toolEquivalent: [SpecedToolAliases.web] },
  { name: "WebSearch", description: localize(13230, null), toolEquivalent: [SpecedToolAliases.web] },
  { name: "Task", description: localize(13228, null), toolEquivalent: [SpecedToolAliases.agent] },
  { name: "Skill", description: localize(13226, null), toolEquivalent: [] },
  { name: "LSP", description: localize(13212, null), toolEquivalent: [] },
  { name: "NotebookEdit", description: localize(13217, null), toolEquivalent: ["edit/editNotebook"] },
  { name: "AskUserQuestion", description: localize(13205, null), toolEquivalent: ["vscode/askQuestions"] },
  { name: "MCPSearch", description: localize(13213, null), toolEquivalent: [] }
];

var knownClaudeModels2 = [
  { name: "sonnet", description: localize(13227, null), modelEquivalent: "Claude Sonnet 4.5 (copilot)" },
  { name: "opus", description: localize(13218, null), modelEquivalent: "Claude Opus 4.6 (copilot)" },
  { name: "haiku", description: localize(13210, null), modelEquivalent: "Claude Haiku 4.5 (copilot)" },
  { name: "inherit", description: localize(13211, null), modelEquivalent: void 0 }
];

var claudeAgentAttributes2 = {
  "name": {
    type: "scalar",
    description: localize(13199, null)
  },
  "description": {
    type: "scalar",
    description: localize(13193, null)
  },
  "tools": {
    type: "sequence",
    description: localize(13204, null),
    defaults: ["Read, Edit, Bash"],
    items: knownClaudeTools2
  },
  "disallowedTools": {
    type: "sequence",
    description: localize(13194, null),
    defaults: ["Write, Edit, Bash"],
    items: knownClaudeTools2
  },
  "model": {
    type: "scalar",
    description: localize(13198, null),
    defaults: ["sonnet", "opus", "haiku", "inherit"],
    enums: knownClaudeModels2
  },
  "permissionMode": {
    type: "scalar",
    description: localize(13200, null),
    defaults: ["default", "acceptEdits", "dontAsk", "bypassPermissions", "plan"],
    enums: [
      { name: "default", description: localize(13221, null) },
      { name: "acceptEdits", description: localize(13219, null) },
      { name: "plan", description: localize(13224, null) },
      { name: "delegate", description: localize(13222, null) },
      { name: "dontAsk", description: localize(13223, null) },
      { name: "bypassPermissions", description: localize(13220, null) }
    ]
  },
  "skills": {
    type: "sequence",
    description: localize(13203, null)
  },
  "mcpServers": {
    type: "sequence",
    description: localize(13196, null)
  },
  "hooks": {
    type: "object",
    description: localize(13195, null)
  },
  "memory": {
    type: "scalar",
    description: localize(13197, null),
    defaults: ["user", "project", "local"],
    enums: [
      { name: "user", description: localize(13216, null) },
      { name: "project", description: localize(13215, null) },
      { name: "local", description: localize(13214, null) }
    ]
  }
};

var claudeRulesAttributes2 = {
  "description": {
    type: "scalar",
    description: localize(13201, null)
  },
  "paths": {
    type: "sequence",
    description: localize(13202, null)
  }
};

function isVSCodeOrDefaultTarget2(target) {
  return target === "vscode" /* VSCode */ || target === "undefined" /* Undefined */;
}

function getTarget2(promptType, header2) {
  const uri4 = header2 instanceof URI ? header2 : header2.uri;
  if (promptType === "agent" /* agent */) {
    const parentDir = dirname2(uri4);
    if (parentDir.path.endsWith(`/${CLAUDE_AGENTS_SOURCE_FOLDER}`)) {
      return "claude" /* Claude */;
    }
    if (!(header2 instanceof URI)) {
      const target = header2.target;
      if (target === "github-copilot" /* GitHubCopilot */ || target === "vscode" /* VSCode */) {
        return target;
      }
    }
    return "undefined" /* Undefined */;
  } else if (promptType === "instructions" /* instructions */) {
    if (isInClaudeRulesFolder(uri4)) {
      return "claude" /* Claude */;
    }
  }
  return "undefined" /* Undefined */;
}

function toMarker(message, range2, severity = 8 /* Error */, tags, code) {
  return { severity, message, ...tags ? { tags } : {}, ...code ? { code } : {}, ...range2 };
}
export { isTrueOrFalse, getValidAttributeNames2, isNonRecommendedAttribute2, isVSCodeOrDefaultTarget2, getTarget2, toMarker, MARKERS_OWNER_ID, PromptValidator, githubPermissionScopes, allAttributeNames2, githubCopilotAgentAttributeNames2, recommendedAttributeNames2, knownGithubCopilotTools2, knownClaudeTools2, knownClaudeModels2, claudeAgentAttributes2, claudeRulesAttributes2 };
