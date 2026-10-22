// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/requestParser/chatRequestParser.ts
import { getChatSessionType } from "./module-0961.mjs";
import { isToolSet } from "./module-0990.mjs";
import { ChatRequestAgentPart, ChatRequestAgentSubcommandPart, ChatRequestDynamicVariablePart, ChatRequestSlashCommandPart, ChatRequestSlashPromptPart, ChatRequestTextPart, ChatRequestToolPart, ChatRequestToolSetPart, chatAgentLeader, chatSubcommandLeader, chatVariableLeader } from "./module-0987.mjs";
import { Position } from "./module-0079.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { Range2 } from "./module-0106.mjs";
import { IPromptsService, matchesSessionType } from "./module-0986.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { IChatVariablesService } from "./module-0983.mjs";
import { IChatSlashCommandService } from "./module-0988.mjs";


// src/vs/workbench/contrib/chat/common/requestParser/chatRequestParser.ts
var agentReg = /^@([\w_\-\.]+)(?=(\s|$|\b))/i;

var variableReg = /^#([\w_\-]+)(:\d+)?(?=(\s|$|\b))/i;

var slashReg = /^\/([\p{L}\d_\-\.:]+)(?=(\s|$|\b))/iu;

var ChatRequestParser = class {
  constructor(agentService, variableService, slashCommandService, promptsService) {
    this.agentService = agentService;
    this.variableService = variableService;
    this.slashCommandService = slashCommandService;
    this.promptsService = promptsService;
  }
  parseChatRequest(sessionResource, message, location2 = "panel" /* Chat */, context2 = {}) {
    const references = this.variableService.getDynamicVariables(sessionResource);
    const selectedToolAndToolSets = this.variableService.getSelectedToolAndToolSets(sessionResource);
    if (!context2.sessionType) {
      context2 = { ...context2, sessionType: getChatSessionType(sessionResource) };
    }
    return this.parseChatRequestWithReferences(references, selectedToolAndToolSets, message, location2, context2);
  }
  parseChatRequestWithReferences(references, selectedToolAndToolSets, message, location2 = "panel" /* Chat */, context2) {
    const parts = [];
    const toolsByName = /* @__PURE__ */ new Map();
    const toolSetsByName = /* @__PURE__ */ new Map();
    for (const [entry, enabled] of selectedToolAndToolSets) {
      if (enabled) {
        if (isToolSet(entry)) {
          toolSetsByName.set(entry.referenceName, entry);
        } else {
          toolsByName.set(entry.toolReferenceName ?? entry.displayName, entry);
        }
      }
    }
    let lineNumber = 1;
    let column = 1;
    for (let i2 = 0; i2 < message.length; i2++) {
      const previousChar = message.charAt(i2 - 1);
      const char = message.charAt(i2);
      let newPart;
      if (previousChar.match(/\s/) || i2 === 0) {
        if (char === chatVariableLeader) {
          newPart = this.tryToParseVariable(message.slice(i2), i2, new Position(lineNumber, column), parts, toolsByName, toolSetsByName);
        } else if (char === chatAgentLeader) {
          newPart = this.tryToParseAgent(message.slice(i2), message, i2, new Position(lineNumber, column), parts, location2, context2);
        } else if (char === chatSubcommandLeader) {
          newPart = this.tryToParseSlashCommand(message.slice(i2), message, i2, new Position(lineNumber, column), parts, location2, context2);
        }
        if (!newPart) {
          newPart = this.tryToParseDynamicVariable(message.slice(i2), i2, new Position(lineNumber, column), references);
        }
      }
      if (newPart) {
        if (i2 !== 0) {
          const previousPart = parts.at(-1);
          const previousPartEnd = previousPart?.range.endExclusive ?? 0;
          const previousPartEditorRangeEndLine = previousPart?.editorRange.endLineNumber ?? 1;
          const previousPartEditorRangeEndCol = previousPart?.editorRange.endColumn ?? 1;
          parts.push(new ChatRequestTextPart(
            new OffsetRange(previousPartEnd, i2),
            new Range2(previousPartEditorRangeEndLine, previousPartEditorRangeEndCol, lineNumber, column),
            message.slice(previousPartEnd, i2)
          ));
        }
        parts.push(newPart);
      }
      if (char === "\n") {
        lineNumber++;
        column = 1;
      } else {
        column++;
      }
    }
    const lastPart = parts.at(-1);
    const lastPartEnd = lastPart?.range.endExclusive ?? 0;
    if (lastPartEnd < message.length) {
      parts.push(new ChatRequestTextPart(
        new OffsetRange(lastPartEnd, message.length),
        new Range2(lastPart?.editorRange.endLineNumber ?? 1, lastPart?.editorRange.endColumn ?? 1, lineNumber, column),
        message.slice(lastPartEnd, message.length)
      ));
    }
    return {
      parts,
      text: message
    };
  }
  tryToParseAgent(message, fullMessage, offset, position2, parts, location2, context2) {
    const nextAgentMatch = message.match(agentReg);
    if (!nextAgentMatch) {
      return;
    }
    const [full, name] = nextAgentMatch;
    const agentRange = new OffsetRange(offset, offset + full.length);
    const agentEditorRange = new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column + full.length);
    let agents = this.agentService.getAgentsByName(name);
    if (!agents.length) {
      const fqAgent = this.agentService.getAgentByFullyQualifiedId(name);
      if (fqAgent) {
        agents = [fqAgent];
      }
    }
    const agent = agents.length > 1 && context2?.selectedAgent ? context2.selectedAgent : agents.find((a) => a.locations.includes(location2));
    if (!agent) {
      return;
    }
    if (context2?.mode && !agent.modes.includes(context2.mode)) {
      return;
    }
    if (parts.some((p) => p instanceof ChatRequestAgentPart)) {
      return;
    }
    if (parts.some((p) => p instanceof ChatRequestTextPart && p.text.trim() !== "" || !(p instanceof ChatRequestAgentPart))) {
      return;
    }
    const previousPart = parts.at(-1);
    const previousPartEnd = previousPart?.range.endExclusive ?? 0;
    const textSincePreviousPart = fullMessage.slice(previousPartEnd, offset);
    if (textSincePreviousPart.trim() !== "") {
      return;
    }
    return new ChatRequestAgentPart(agentRange, agentEditorRange, agent);
  }
  tryToParseVariable(message, offset, position2, parts, toolsByName, toolSetsByName) {
    const nextVariableMatch = message.match(variableReg);
    if (!nextVariableMatch) {
      return;
    }
    const [full, name] = nextVariableMatch;
    const varRange = new OffsetRange(offset, offset + full.length);
    const varEditorRange = new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column + full.length);
    const tool = toolsByName.get(name);
    if (tool) {
      return new ChatRequestToolPart(varRange, varEditorRange, name, tool.id, tool.displayName, tool.icon);
    }
    const toolset = toolSetsByName.get(name);
    if (toolset) {
      const value2 = Array.from(toolset.getTools()).map((t2) => new ChatRequestToolPart(varRange, varEditorRange, t2.toolReferenceName ?? t2.displayName, t2.id, t2.displayName, t2.icon).toVariableEntry());
      return new ChatRequestToolSetPart(varRange, varEditorRange, toolset.id, toolset.referenceName, toolset.icon, value2);
    }
    return;
  }
  tryToParseSlashCommand(remainingMessage, fullMessage, offset, position2, parts, location2, context2) {
    const nextSlashMatch = remainingMessage.match(slashReg);
    if (!nextSlashMatch) {
      return;
    }
    if (parts.some((p) => !(p instanceof ChatRequestAgentPart) && !(p instanceof ChatRequestTextPart && p.text.trim() === ""))) {
      return;
    }
    const previousPart = parts.at(-1);
    const previousPartEnd = previousPart?.range.endExclusive ?? 0;
    const textSincePreviousPart = fullMessage.slice(previousPartEnd, offset);
    if (textSincePreviousPart.trim() !== "") {
      return;
    }
    const [full, command4] = nextSlashMatch;
    const slashRange = new OffsetRange(offset, offset + full.length);
    const slashEditorRange = new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column + full.length);
    const usedAgent = parts.find((p) => p instanceof ChatRequestAgentPart)?.agent ?? (context2?.forcedAgent ? context2.forcedAgent : void 0);
    if (usedAgent) {
      const subCommand = usedAgent.slashCommands.find((c) => c.name === command4);
      if (subCommand) {
        return new ChatRequestAgentSubcommandPart(slashRange, slashEditorRange, subCommand);
      }
    }
    const capabilities = context2?.attachmentCapabilities ?? usedAgent?.capabilities;
    const slashCommands = this.slashCommandService.getCommands(location2, context2?.mode ?? "ask" /* Ask */);
    const slashCommand = slashCommands.find((c) => c.command === command4 && matchesSessionType(c.sessionTypes, context2?.sessionType));
    if (!usedAgent || slashCommand?.silent || capabilities?.supportsPromptAttachments) {
      if (slashCommand) {
        return new ChatRequestSlashCommandPart(slashRange, slashEditorRange, slashCommand);
      } else if (!usedAgent) {
        const defaultAgent = this.agentService.getDefaultAgent(location2, context2?.mode);
        const subCommand = defaultAgent?.slashCommands.find((c) => c.name === command4);
        if (subCommand) {
          return new ChatRequestAgentSubcommandPart(slashRange, slashEditorRange, subCommand);
        }
      }
      const afterSlash = remainingMessage.slice(full.length);
      const subMatch = afterSlash.match(/^[ \t]+([\p{L}\d_\-\.]+)/u);
      if (subMatch) {
        const candidate = `${command4}:${subMatch[1]}`;
        if (this.promptsService.hasPromptSlashCommand(candidate)) {
          const consumedLength = full.length + subMatch[0].length;
          const extendedRange = new OffsetRange(offset, offset + consumedLength);
          const extendedEditorRange = new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column + consumedLength);
          const displayText = remainingMessage.slice(0, consumedLength);
          return new ChatRequestSlashPromptPart(extendedRange, extendedEditorRange, candidate, displayText);
        }
      }
      if (this.promptsService.isValidSlashCommandName(command4)) {
        return new ChatRequestSlashPromptPart(slashRange, slashEditorRange, command4);
      }
    }
    return;
  }
  tryToParseDynamicVariable(message, offset, position2, references) {
    const refAtThisPosition = references.find((r2) => r2.range.startLineNumber === position2.lineNumber && r2.range.startColumn === position2.column);
    if (refAtThisPosition) {
      const length = refAtThisPosition.range.endColumn - refAtThisPosition.range.startColumn;
      const text2 = message.substring(0, length);
      const range2 = new OffsetRange(offset, offset + length);
      return new ChatRequestDynamicVariablePart(range2, refAtThisPosition.range, text2, refAtThisPosition.id, refAtThisPosition.modelDescription, refAtThisPosition.data, refAtThisPosition.fullName, refAtThisPosition.icon, refAtThisPosition.isFile, refAtThisPosition.isDirectory, refAtThisPosition._meta, refAtThisPosition.isAttachmentReference);
    }
    return;
  }
};

ChatRequestParser = __decorateClass([
  __decorateParam(0, IChatAgentService),
  __decorateParam(1, IChatVariablesService),
  __decorateParam(2, IChatSlashCommandService),
  __decorateParam(3, IPromptsService)
], ChatRequestParser);
export { agentReg, variableReg, slashReg, ChatRequestParser };
