// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/chat/common/requestParser/chatParserTypes.ts
import { arrayEquals } from "./module-0105.mjs";
import { OffsetRange } from "./module-0184.mjs";
import { Range } from "./module-0091.mjs";
import { ThemeIcon } from "./module-0084.mjs";
import { IDiagnosticVariableEntryFilterData, chatReferenceVariableEntryFromDynamicValue, isChatReferenceDynamicVariableValue } from "./module-0103.mjs";
import { reviveSerializedAgent } from "./module-0179.mjs";
import { revive } from "./module-0036.mjs";


// src/vs/workbench/contrib/chat/common/requestParser/chatParserTypes.ts
var IParsedChatRequest;

((IParsedChatRequest3) => {
  function equals5(a, b) {
    return a.text === b.text && arrayEquals(
      a.parts,
      b.parts,
      (p1, p2) => p1.kind === p2.kind && OffsetRange.equals(p1.range, p2.range) && Range.equalsRange(p1.editorRange, p2.editorRange) && p1.text === p2.text
    );
  }
  IParsedChatRequest3.equals = equals5;
})(IParsedChatRequest || (IParsedChatRequest = {}));

var ChatRequestTextPart = class _ChatRequestTextPart {
  constructor(range, editorRange, text) {
    this.range = range;
    this.editorRange = editorRange;
    this.text = text;
    this.kind = _ChatRequestTextPart.Kind;
  }
  static {
    this.Kind = "text";
  }
  get promptText() {
    return this.text;
  }
};

var chatVariableLeader = "#";

var chatAgentLeader = "@";

var chatSubcommandLeader = "/";

var ChatRequestVariablePart = class _ChatRequestVariablePart {
  constructor(range, editorRange, variableName, variableArg, variableId) {
    this.range = range;
    this.editorRange = editorRange;
    this.variableName = variableName;
    this.variableArg = variableArg;
    this.variableId = variableId;
    this.kind = _ChatRequestVariablePart.Kind;
  }
  static {
    this.Kind = "var";
  }
  get text() {
    const argPart = this.variableArg ? `:${this.variableArg}` : "";
    return `${chatVariableLeader}${this.variableName}${argPart}`;
  }
  get promptText() {
    return this.text;
  }
};

var ChatRequestToolPart = class _ChatRequestToolPart {
  constructor(range, editorRange, toolName, toolId, displayName, icon) {
    this.range = range;
    this.editorRange = editorRange;
    this.toolName = toolName;
    this.toolId = toolId;
    this.displayName = displayName;
    this.icon = icon;
    this.kind = _ChatRequestToolPart.Kind;
  }
  static {
    this.Kind = "tool";
  }
  get text() {
    return `${chatVariableLeader}${this.toolName}`;
  }
  get promptText() {
    return this.text;
  }
  toVariableEntry() {
    return { kind: "tool", id: this.toolId, name: this.toolName, range: this.range, value: void 0, icon: ThemeIcon.isThemeIcon(this.icon) ? this.icon : void 0, fullName: this.displayName };
  }
};

var ChatRequestToolSetPart = class _ChatRequestToolSetPart {
  constructor(range, editorRange, id2, name, icon, tools) {
    this.range = range;
    this.editorRange = editorRange;
    this.id = id2;
    this.name = name;
    this.icon = icon;
    this.tools = tools;
    this.kind = _ChatRequestToolSetPart.Kind;
  }
  static {
    this.Kind = "toolset";
  }
  get text() {
    return `${chatVariableLeader}${this.name}`;
  }
  get promptText() {
    return this.text;
  }
  toVariableEntry() {
    return { kind: "toolset", id: this.id, name: this.name, range: this.range, icon: this.icon, value: this.tools };
  }
};

var ChatRequestAgentPart = class _ChatRequestAgentPart {
  constructor(range, editorRange, agent) {
    this.range = range;
    this.editorRange = editorRange;
    this.agent = agent;
    this.kind = _ChatRequestAgentPart.Kind;
  }
  static {
    this.Kind = "agent";
  }
  get text() {
    return `${chatAgentLeader}${this.agent.name}`;
  }
  get promptText() {
    return "";
  }
};

var ChatRequestAgentSubcommandPart = class _ChatRequestAgentSubcommandPart {
  constructor(range, editorRange, command) {
    this.range = range;
    this.editorRange = editorRange;
    this.command = command;
    this.kind = _ChatRequestAgentSubcommandPart.Kind;
  }
  static {
    this.Kind = "subcommand";
  }
  get text() {
    return `${chatSubcommandLeader}${this.command.name}`;
  }
  get promptText() {
    return "";
  }
};

var ChatRequestSlashCommandPart = class _ChatRequestSlashCommandPart {
  constructor(range, editorRange, slashCommand) {
    this.range = range;
    this.editorRange = editorRange;
    this.slashCommand = slashCommand;
    this.kind = _ChatRequestSlashCommandPart.Kind;
  }
  static {
    this.Kind = "slash";
  }
  get text() {
    return `${chatSubcommandLeader}${this.slashCommand.command}`;
  }
  get promptText() {
    return `${chatSubcommandLeader}${this.slashCommand.command}`;
  }
};

var ChatRequestSlashPromptPart = class _ChatRequestSlashPromptPart {
  constructor(range, editorRange, name, displayText) {
    this.range = range;
    this.editorRange = editorRange;
    this.name = name;
    this.kind = _ChatRequestSlashPromptPart.Kind;
    if (displayText !== void 0) {
      this.displayText = displayText;
    }
  }
  static {
    this.Kind = "prompt";
  }
  get text() {
    return this.displayText ?? `${chatSubcommandLeader}${this.name}`;
  }
  get promptText() {
    return this.displayText ?? `${chatSubcommandLeader}${this.name}`;
  }
};

var ChatRequestDynamicVariablePart = class _ChatRequestDynamicVariablePart {
  constructor(range, editorRange, text, id2, modelDescription, data, fullName, icon, isFile, isDirectory, _meta, isAttachmentReference) {
    this.range = range;
    this.editorRange = editorRange;
    this.text = text;
    this.id = id2;
    this.modelDescription = modelDescription;
    this.data = data;
    this.fullName = fullName;
    this.icon = icon;
    this.isFile = isFile;
    this.isDirectory = isDirectory;
    this._meta = _meta;
    this.isAttachmentReference = isAttachmentReference;
    this.kind = _ChatRequestDynamicVariablePart.Kind;
  }
  static {
    this.Kind = "dynamic";
  }
  get referenceText() {
    return this.text.replace(chatVariableLeader, "");
  }
  get promptText() {
    return this.text;
  }
  toVariableEntry() {
    if (this.id === "vscode.problems") {
      return IDiagnosticVariableEntryFilterData.toEntry(this.data.filter);
    }
    if (isChatReferenceDynamicVariableValue(this.data)) {
      const entry = chatReferenceVariableEntryFromDynamicValue(this.data, this.id, this.fullName ?? this.referenceText, this.range, this._meta);
      if (entry) {
        return entry;
      }
    }
    return { kind: this.isDirectory ? "directory" : this.isFile ? "file" : "generic", id: this.id, name: this.referenceText, range: this.range, value: this.data, fullName: this.fullName, icon: this.icon, _meta: this._meta };
  }
};

function reviveParsedChatRequest(serialized) {
  return {
    text: serialized.text,
    parts: serialized.parts.map((part) => {
      if (part.kind === ChatRequestTextPart.Kind) {
        return new ChatRequestTextPart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          part.text
        );
      } else if (part.kind === ChatRequestVariablePart.Kind) {
        return new ChatRequestVariablePart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          part.variableName,
          part.variableArg,
          part.variableId || ""
        );
      } else if (part.kind === ChatRequestToolPart.Kind) {
        return new ChatRequestToolPart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          part.toolName,
          part.toolId,
          part.displayName,
          part.icon
        );
      } else if (part.kind === ChatRequestToolSetPart.Kind) {
        return new ChatRequestToolSetPart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          part.id,
          part.name,
          part.icon,
          part.tools ?? []
        );
      } else if (part.kind === ChatRequestAgentPart.Kind) {
        let agent = part.agent;
        agent = reviveSerializedAgent(agent);
        return new ChatRequestAgentPart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          agent
        );
      } else if (part.kind === ChatRequestAgentSubcommandPart.Kind) {
        return new ChatRequestAgentSubcommandPart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          part.command
        );
      } else if (part.kind === ChatRequestSlashCommandPart.Kind) {
        return new ChatRequestSlashCommandPart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          part.slashCommand
        );
      } else if (part.kind === ChatRequestSlashPromptPart.Kind) {
        return new ChatRequestSlashPromptPart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          part.name,
          part.displayText
        );
      } else if (part.kind === ChatRequestDynamicVariablePart.Kind) {
        return new ChatRequestDynamicVariablePart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          part.text,
          part.id,
          part.modelDescription,
          revive(part.data),
          part.fullName,
          part.icon,
          part.isFile,
          part.isDirectory,
          part._meta,
          part.isAttachmentReference
        );
      } else {
        throw new Error(`Unknown chat request part: ${part.kind}`);
      }
    })
  };
}
export { reviveParsedChatRequest, IParsedChatRequest, ChatRequestTextPart, chatVariableLeader, chatAgentLeader, chatSubcommandLeader, ChatRequestVariablePart, ChatRequestToolPart, ChatRequestToolSetPart, ChatRequestAgentPart, ChatRequestAgentSubcommandPart, ChatRequestSlashCommandPart, ChatRequestSlashPromptPart, ChatRequestDynamicVariablePart };
