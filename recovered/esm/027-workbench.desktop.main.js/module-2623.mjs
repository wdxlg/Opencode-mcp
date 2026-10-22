// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptHeaderAutocompletion.ts
import { getPromptsTypeForLanguageId } from "./module-0985.mjs";
import { localize } from "./module-0001.mjs";
import { Position } from "./module-0079.mjs";
import { ClaudeHeaderAttributes, getAttributeDefinition, getTarget, getValidAttributeNames, knownClaudeTools, knownGithubCopilotTools } from "./module-1015.mjs";
import { PromptHeaderAttributes, parseCommaSeparatedList2 } from "./module-1003.mjs";
import { HOOKS_BY_TARGET, HOOK_METADATA } from "./module-1010.mjs";
import { Range2 } from "./module-0106.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { HOOK_COMMAND_FIELD_DESCRIPTIONS } from "./module-1011.mjs";
import { Iterable } from "./module-0011.mjs";
import { ILanguageModelChatMetadata, ILanguageModelsService } from "./module-0967.mjs";
import { formatArrayValue, getQuotePreference } from "./module-2162.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { IChatModeService } from "./module-1470.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptHeaderAutocompletion.ts
var PromptHeaderAutocompletion = class {
  constructor(promptsService, languageModelsService, languageModelToolsService, chatModeService, environmentService) {
    this.promptsService = promptsService;
    this.languageModelsService = languageModelsService;
    this.languageModelToolsService = languageModelToolsService;
    this.chatModeService = chatModeService;
    this.environmentService = environmentService;
    /**
     * Debug display name for this provider.
     */
    this._debugDisplayName = "PromptHeaderAutocompletion";
    /**
     * List of trigger characters handled by this provider.
     */
    this.triggerCharacters = [":"];
  }
  /**
   * The main function of this provider that calculates
   * completion items based on the provided arguments.
   */
  async provideCompletionItems(model, position2, context2, token) {
    const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
    if (!promptType) {
      return void 0;
    }
    if (/^\s*$/.test(model.getValue())) {
      return {
        suggestions: [{
          label: localize(13176, null),
          kind: 28 /* Snippet */,
          insertText: [
            `---`,
            `description: $1`,
            `---`,
            `$0`
          ].join("\n"),
          insertTextRules: 4 /* InsertAsSnippet */,
          range: model.getFullModelRange()
        }]
      };
    }
    const parsedAST = this.promptsService.getParsedPromptFile(model);
    const header2 = parsedAST.header;
    if (!header2) {
      return void 0;
    }
    const headerRange = parsedAST.header.range;
    if (position2.lineNumber < headerRange.startLineNumber || position2.lineNumber >= headerRange.endLineNumber) {
      return void 0;
    }
    const lineText = model.getLineContent(position2.lineNumber);
    const colonIndex = lineText.indexOf(":");
    const colonPosition = colonIndex !== -1 ? new Position(position2.lineNumber, colonIndex + 1) : void 0;
    if (!colonPosition || position2.isBeforeOrEqual(colonPosition)) {
      let containingAttribute = header2.attributes.find(({ range: range2 }) => range2.startLineNumber < position2.lineNumber && position2.lineNumber <= range2.endLineNumber);
      if (!containingAttribute) {
        for (let i2 = header2.attributes.length - 1; i2 >= 0; i2--) {
          const attr = header2.attributes[i2];
          if (attr.range.endLineNumber < position2.lineNumber && attr.value.type === "map") {
            const nextAttr = header2.attributes[i2 + 1];
            const nextStartLine = nextAttr ? nextAttr.range.startLineNumber : headerRange.endLineNumber;
            if (position2.lineNumber < nextStartLine) {
              containingAttribute = attr;
            }
            break;
          }
        }
      }
      if (containingAttribute) {
        const attrLineText = model.getLineContent(containingAttribute.range.startLineNumber);
        const attrColonIndex = attrLineText.indexOf(":");
        if (attrColonIndex !== -1) {
          return this.provideValueCompletions(model, position2, header2, new Position(containingAttribute.range.startLineNumber, attrColonIndex + 1), promptType, containingAttribute);
        }
      }
      return this.provideAttributeNameCompletions(model, position2, header2, colonPosition, promptType);
    } else if (colonPosition && colonPosition.isBefore(position2)) {
      return this.provideValueCompletions(model, position2, header2, colonPosition, promptType);
    }
    return void 0;
  }
  async provideAttributeNameCompletions(model, position2, header2, colonPosition, promptType) {
    const suggestions = [];
    const target = getTarget(promptType, header2);
    const attributesToPropose = new Set(getValidAttributeNames(promptType, false, target));
    for (const attr of header2.attributes) {
      attributesToPropose.delete(attr.key);
    }
    const getInsertText = async (key3) => {
      if (colonPosition) {
        return key3;
      }
      if (key3 === PromptHeaderAttributes.hooks && promptType === "agent" /* agent */ && target !== "claude" /* Claude */) {
        const hookNames = Object.keys(HOOKS_BY_TARGET[target] ?? HOOKS_BY_TARGET["undefined" /* Undefined */]);
        return `${key3}:
  \${1|${hookNames.join(",")}|}:
    - type: command
      command: "$2"`;
      }
      const valueSuggestions = await this.getValueSuggestions(promptType, key3, target);
      if (valueSuggestions.length > 0) {
        return `${key3}: \${0:${valueSuggestions[0].name}}`;
      } else {
        return `${key3}: $0`;
      }
    };
    for (const attribute of attributesToPropose) {
      const item = {
        label: attribute,
        documentation: getAttributeDefinition(attribute, promptType, target)?.description,
        kind: 9 /* Property */,
        insertText: await getInsertText(attribute),
        insertTextRules: 4 /* InsertAsSnippet */,
        range: new Range2(position2.lineNumber, 1, position2.lineNumber, !colonPosition ? model.getLineMaxColumn(position2.lineNumber) : colonPosition.column)
      };
      suggestions.push(item);
    }
    return { suggestions };
  }
  async provideValueCompletions(model, position2, header2, colonPosition, promptType, preFoundAttribute) {
    const suggestions = [];
    const posLineNumber = position2.lineNumber;
    const attribute = preFoundAttribute ?? header2.attributes.find(({ range: range2 }) => range2.startLineNumber <= posLineNumber && posLineNumber <= range2.endLineNumber);
    if (!attribute) {
      return void 0;
    }
    const target = getTarget(promptType, header2);
    if (!getValidAttributeNames(promptType, true, target).includes(attribute.key)) {
      return void 0;
    }
    if (promptType === "prompt" /* prompt */ || promptType === "agent" /* agent */) {
      if (attribute.key === PromptHeaderAttributes.model) {
        if (attribute.value.type === "sequence") {
          const getValues = async () => {
            if (target === "claude" /* Claude */) {
              return knownClaudeTools;
            } else {
              return this.getModelNames(promptType === "agent" /* agent */);
            }
          };
          return this.provideArrayCompletions(model, position2, attribute.value, getValues);
        }
      }
      if (attribute.key === PromptHeaderAttributes.tools || attribute.key === ClaudeHeaderAttributes.disallowedTools) {
        let value2 = attribute.value;
        if (value2.type === "scalar") {
          value2 = parseCommaSeparatedList2(value2);
        }
        if (value2.type === "sequence") {
          const getValues = async () => {
            if (target === "github-copilot" /* GitHubCopilot */ || this.environmentService.isSessionsWindow) {
              return knownGithubCopilotTools;
            } else if (target === "claude" /* Claude */) {
              return knownClaudeTools;
            } else {
              return Array.from(this.languageModelToolsService.getFullReferenceNames()).map((name) => ({ name }));
            }
          };
          return this.provideArrayCompletions(model, position2, value2, getValues);
        }
      }
    }
    if (attribute.key === PromptHeaderAttributes.agents) {
      if (attribute.value.type === "sequence") {
        return this.provideArrayCompletions(model, position2, attribute.value, async () => {
          return (await this.promptsService.getCustomAgents(CancellationToken.None)).filter((a) => a.enabled);
        });
      }
    }
    if (attribute.key === PromptHeaderAttributes.hooks) {
      if (attribute.value.type === "map") {
        return this.provideHookEventCompletions(model, position2, attribute.value, target);
      }
      if (position2.lineNumber !== attribute.range.startLineNumber) {
        const emptyMap = { type: "map", properties: [], range: attribute.value.range };
        return this.provideHookEventCompletions(model, position2, emptyMap, target);
      }
    }
    const lineContent = model.getLineContent(attribute.range.startLineNumber);
    const whilespaceAfterColon = lineContent.substring(colonPosition.column).match(/^\s*/)?.[0].length ?? 0;
    const entries2 = await this.getValueSuggestions(promptType, attribute.key, target);
    for (const entry of entries2) {
      const item = {
        label: entry.name,
        documentation: entry.description,
        kind: 13 /* Value */,
        insertText: whilespaceAfterColon === 0 ? ` ${entry.name}` : entry.name,
        range: new Range2(position2.lineNumber, colonPosition.column + whilespaceAfterColon + 1, position2.lineNumber, model.getLineMaxColumn(position2.lineNumber))
      };
      suggestions.push(item);
    }
    if (attribute.key === PromptHeaderAttributes.handOffs) {
      const value2 = [
        "",
        "  - label: Start Implementation",
        "    agent: agent",
        "    prompt: Implement the plan",
        "    send: true"
      ].join("\n");
      const item = {
        label: localize(13177, null),
        kind: 13 /* Value */,
        insertText: whilespaceAfterColon === 0 ? ` ${value2}` : value2,
        range: new Range2(position2.lineNumber, colonPosition.column + whilespaceAfterColon + 1, position2.lineNumber, model.getLineMaxColumn(position2.lineNumber))
      };
      suggestions.push(item);
    }
    if (attribute.key === PromptHeaderAttributes.hooks && promptType === "agent" /* agent */) {
      const hookSnippet = [
        "",
        "  ${1|" + Object.keys(HOOKS_BY_TARGET[target] ?? HOOKS_BY_TARGET["undefined" /* Undefined */]).join(",") + "|}:",
        "    - type: command",
        '      command: "$2"'
      ].join("\n");
      const item = {
        label: localize(13180, null),
        kind: 28 /* Snippet */,
        insertText: whilespaceAfterColon === 0 ? ` ${hookSnippet}` : hookSnippet,
        insertTextRules: 4 /* InsertAsSnippet */,
        range: new Range2(position2.lineNumber, colonPosition.column + whilespaceAfterColon + 1, position2.lineNumber, model.getLineMaxColumn(position2.lineNumber))
      };
      suggestions.push(item);
    }
    return { suggestions };
  }
  /**
   * Provides completions inside the `hooks:` map.
   * Determines what to suggest based on nesting depth:
   * - At hook event level: suggest event names (SessionStart, PreToolUse, etc.)
   * - Inside a command object: suggest command fields (type, command, timeout, etc.)
   */
  provideHookEventCompletions(model, position2, hooksMap, target) {
    const hookEventOnLine = hooksMap.properties.find((p) => p.key.range.startLineNumber === position2.lineNumber);
    if (hookEventOnLine) {
      const lineText2 = model.getLineContent(position2.lineNumber);
      const colonIdx = lineText2.indexOf(":");
      if (colonIdx !== -1 && position2.column > colonIdx + 1) {
        const whilespaceAfterColon = lineText2.substring(colonIdx + 1).match(/^\s*/)?.[0].length ?? 0;
        const commandSnippet = [
          "",
          "  - type: command",
          '    command: "$1"'
        ].join("\n");
        return {
          suggestions: [{
            label: localize(13178, null),
            documentation: localize(13179, null),
            kind: 28 /* Snippet */,
            insertText: whilespaceAfterColon === 0 ? ` ${commandSnippet}` : commandSnippet,
            insertTextRules: 4 /* InsertAsSnippet */,
            range: new Range2(position2.lineNumber, colonIdx + 1 + whilespaceAfterColon + 1, position2.lineNumber, model.getLineMaxColumn(position2.lineNumber))
          }]
        };
      }
    }
    const commandFieldCompletions = this.provideHookCommandFieldCompletions(model, position2, hooksMap, target);
    if (commandFieldCompletions) {
      return commandFieldCompletions;
    }
    const suggestions = [];
    const hooksByTarget = HOOKS_BY_TARGET[target] ?? HOOKS_BY_TARGET["undefined" /* Undefined */];
    const lineText = model.getLineContent(position2.lineNumber);
    const firstNonWhitespace = lineText.search(/\S/);
    const isEmptyLine = firstNonWhitespace === -1;
    const rangeStartColumn = isEmptyLine ? position2.column : firstNonWhitespace + 1;
    const existingKeys = new Set(
      hooksMap.properties.filter((p) => p.key.range.startLineNumber !== position2.lineNumber).map((p) => p.key.value)
    );
    const expectedIndent = hooksMap.properties.length > 0 ? hooksMap.properties[0].key.range.startColumn - 1 : -1;
    if (expectedIndent >= 0) {
      const scanEnd = model.getLineCount();
      for (let lineNum = hooksMap.range.endLineNumber + 1; lineNum <= scanEnd; lineNum++) {
        if (lineNum === position2.lineNumber) {
          continue;
        }
        const lt2 = model.getLineContent(lineNum);
        const lineIndent = lt2.search(/\S/);
        if (lineIndent === -1) {
          continue;
        }
        if (lineIndent < expectedIndent) {
          break;
        }
        if (lineIndent === expectedIndent) {
          const match2 = lt2.match(/^\s+(\S+)\s*:/);
          if (match2) {
            existingKeys.add(match2[1]);
          }
        }
      }
    }
    const lineHasColon = lineText.indexOf(":") !== -1;
    for (const [hookName, hookType] of Object.entries(hooksByTarget)) {
      if (existingKeys.has(hookName)) {
        continue;
      }
      const meta = HOOK_METADATA[hookType];
      let insertText;
      if (isEmptyLine) {
        insertText = [
          `${hookName}:`,
          `  - type: command`,
          `    command: "$1"`
        ].join("\n");
      } else if (lineHasColon) {
        insertText = `${hookName}:`;
      } else {
        insertText = hookName;
      }
      suggestions.push({
        label: hookName,
        documentation: meta?.description,
        kind: 9 /* Property */,
        insertText,
        insertTextRules: 4 /* InsertAsSnippet */,
        range: new Range2(position2.lineNumber, rangeStartColumn, position2.lineNumber, model.getLineMaxColumn(position2.lineNumber))
      });
    }
    return { suggestions };
  }
  /**
   * Provides completions for hook command fields (type, command, windows, etc.)
   * when the cursor is inside a command object within the hooks map.
   * Detects nesting by checking if the position falls within a sequence item
   * of a hook event's value.
   */
  provideHookCommandFieldCompletions(model, position2, hooksMap, target) {
    const containingCommandMap = this.findContainingCommandMap(model, position2, hooksMap);
    if (!containingCommandMap) {
      return void 0;
    }
    const isCopilotCli = target === "github-copilot" /* GitHubCopilot */;
    const validFields = isCopilotCli ? ["type", "bash", "powershell", "cwd", "env", "timeoutSec"] : ["type", "command", "windows", "linux", "osx", "bash", "powershell", "cwd", "env", "timeout"];
    const existingFields = new Set(
      containingCommandMap.properties.filter((p) => p.key.range.startLineNumber !== position2.lineNumber).map((p) => p.key.value)
    );
    const lineText = model.getLineContent(position2.lineNumber);
    const firstNonWhitespace = lineText.search(/\S/);
    const isEmptyLine = firstNonWhitespace === -1;
    const dashPrefixMatch = lineText.match(/^(\s*-\s+)/);
    const fieldStart = dashPrefixMatch ? dashPrefixMatch[1].length : firstNonWhitespace;
    const rangeStartColumn = isEmptyLine ? position2.column : fieldStart + 1;
    const colonIndex = lineText.indexOf(":");
    const suggestions = [];
    for (const fieldName of validFields) {
      if (existingFields.has(fieldName)) {
        continue;
      }
      const desc = HOOK_COMMAND_FIELD_DESCRIPTIONS[fieldName];
      const insertText = colonIndex !== -1 ? fieldName : `${fieldName}: $0`;
      suggestions.push({
        label: fieldName,
        documentation: desc,
        kind: 9 /* Property */,
        insertText,
        insertTextRules: 4 /* InsertAsSnippet */,
        range: new Range2(position2.lineNumber, rangeStartColumn, position2.lineNumber, colonIndex !== -1 ? colonIndex + 1 : model.getLineMaxColumn(position2.lineNumber))
      });
    }
    return suggestions.length > 0 ? { suggestions } : void 0;
  }
  /**
   * Walks the hooks map AST to find the command map object containing the position.
   * Handles both direct command objects and nested matcher format.
   * Also handles trailing lines after the last parsed property of a command map.
   */
  findContainingCommandMap(model, position2, hooksMap) {
    for (let i2 = 0; i2 < hooksMap.properties.length; i2++) {
      const prop = hooksMap.properties[i2];
      if (prop.value.type !== "sequence") {
        continue;
      }
      const seqRange = prop.value.range;
      const nextProp = hooksMap.properties[i2 + 1];
      const isInSeq = seqRange.containsPosition(position2);
      const isTrailingSeq = !isInSeq && seqRange.endLineNumber < position2.lineNumber && (!nextProp || nextProp.key.range.startLineNumber > position2.lineNumber);
      if (isInSeq || isTrailingSeq) {
        if (isTrailingSeq) {
          const lineText = model.getLineContent(position2.lineNumber);
          const firstNonWs = lineText.search(/\S/);
          const effectiveIndent = firstNonWs === -1 ? position2.column - 1 : firstNonWs;
          const hookKeyIndent = prop.key.range.startColumn - 1;
          if (effectiveIndent <= hookKeyIndent) {
            continue;
          }
        }
        const result = this.findCommandMapInSequence(position2, prop.value);
        if (result) {
          return result;
        }
      }
    }
    return void 0;
  }
  findCommandMapInSequence(position2, sequence2) {
    for (let i2 = 0; i2 < sequence2.items.length; i2++) {
      const item = sequence2.items[i2];
      if (item.type !== "map") {
        if (item.type === "scalar" && item.range.startLineNumber === position2.lineNumber) {
          return { type: "map", properties: [], range: item.range };
        }
        continue;
      }
      const isInRange = item.range.containsPosition(position2);
      const isTrailing = !isInRange && item.range.endLineNumber < position2.lineNumber && (i2 + 1 >= sequence2.items.length || sequence2.items[i2 + 1].range.startLineNumber > position2.lineNumber);
      if (!isInRange && !isTrailing) {
        continue;
      }
      const nestedHooks = item.properties.find((p) => p.key.value === "hooks");
      if (nestedHooks?.value.type === "sequence") {
        const result = this.findCommandMapInSequence(position2, nestedHooks.value);
        if (result) {
          return result;
        }
      }
      return item;
    }
    return void 0;
  }
  async getValueSuggestions(promptType, attribute, target) {
    const attributeDesc = getAttributeDefinition(attribute, promptType, target);
    if (attributeDesc?.enums) {
      return attributeDesc.enums;
    }
    if (attributeDesc?.defaults) {
      return attributeDesc.defaults.map((value2) => ({ name: value2 }));
    }
    switch (attribute) {
      case PromptHeaderAttributes.agent:
      case PromptHeaderAttributes.mode:
        if (promptType === "prompt" /* prompt */) {
          const agents = await this.chatModeService.getLocalModes();
          const suggestions = [];
          for (const agent of Iterable.concat(agents.builtin, agents.custom)) {
            suggestions.push({ name: agent.name.get(), description: agent.label.get() });
          }
          return suggestions;
        }
        break;
      case PromptHeaderAttributes.model:
        if (promptType === "prompt" /* prompt */ || promptType === "agent" /* agent */) {
          return this.getModelNames(promptType === "agent" /* agent */);
        }
        break;
    }
    return [];
  }
  getModelNames(agentModeOnly) {
    const result = [];
    for (const model of this.languageModelsService.getLanguageModelIds()) {
      const metadata = this.languageModelsService.lookupLanguageModel(model);
      if (metadata && metadata.isUserSelectable !== false && !metadata.targetChatSessionType) {
        if (!agentModeOnly || ILanguageModelChatMetadata.suitableForAgentMode(metadata)) {
          result.push({
            name: ILanguageModelChatMetadata.asQualifiedName(metadata),
            description: metadata.tooltip
          });
        }
      }
    }
    return result;
  }
  async provideArrayCompletions(model, position2, arrayValue, getValues) {
    const getSuggestions = async (toolRange, currentItem) => {
      const suggestions = [];
      const entries2 = await getValues();
      const quotePreference = getQuotePreference(arrayValue, model);
      const existingValues = new Set(arrayValue.items.filter((item) => item !== currentItem).filter((item) => item.type === "scalar").map((item) => item.value));
      for (const entry of entries2) {
        const entryName = entry.name;
        if (existingValues.has(entryName)) {
          continue;
        }
        let insertText;
        if (!toolRange.isEmpty()) {
          const firstChar = model.getValueInRange(toolRange).charCodeAt(0);
          insertText = firstChar === 39 /* SingleQuote */ ? `'${entryName}'` : firstChar === 34 /* DoubleQuote */ ? `"${entryName}"` : entryName;
        } else {
          insertText = formatArrayValue(entryName, quotePreference);
        }
        suggestions.push({
          label: entryName,
          documentation: entry.description,
          kind: 13 /* Value */,
          filterText: insertText,
          insertText,
          range: toolRange
        });
      }
      return { suggestions };
    };
    for (const item of arrayValue.items) {
      if (item.range.containsPosition(position2)) {
        return await getSuggestions(item.range, item);
      }
    }
    const prefix = model.getValueInRange(new Range2(position2.lineNumber, 1, position2.lineNumber, position2.column));
    if (prefix.match(/[:,[]\s*$/)) {
      return await getSuggestions(new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column));
    }
    return void 0;
  }
};

PromptHeaderAutocompletion = __decorateClass([
  __decorateParam(0, IPromptsService),
  __decorateParam(1, ILanguageModelsService),
  __decorateParam(2, ILanguageModelToolsService),
  __decorateParam(3, IChatModeService),
  __decorateParam(4, IWorkbenchEnvironmentService)
], PromptHeaderAutocompletion);
export { PromptHeaderAutocompletion };
