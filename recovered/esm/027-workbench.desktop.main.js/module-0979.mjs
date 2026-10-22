// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/attachments/chatVariableEntries.ts
import { ThemeIcon } from "./module-0086.mjs";
import { URI } from "./module-0032.mjs";
import { generateUuid } from "./module-0190.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { basename2 } from "./module-0034.mjs";
import { isLocation } from "./module-0164.mjs";
import { VSBuffer, decodeBase64, encodeBase64 } from "./module-0038.mjs";


// src/vs/workbench/contrib/chat/common/attachments/chatVariableEntries.ts
function isChatContextIconPath(value2) {
  if (!value2 || typeof value2 !== "object") {
    return false;
  }
  if (ThemeIcon.isThemeIcon(value2) || URI.isUri(value2)) {
    return true;
  }
  const asDualPath = value2;
  return URI.isUri(asDualPath.light) && URI.isUri(asDualPath.dark);
}

function resolveChatContextIcon(iconPath, useDark) {
  if (ThemeIcon.isThemeIcon(iconPath) || URI.isUri(iconPath)) {
    return iconPath;
  }
  return useDark ? iconPath.dark : iconPath.light;
}

var ChatPasteAttachmentMetadata = {
  Kind: "vscode.chat.attachment.kind",
  Language: "vscode.chat.attachment.language",
  FileName: "vscode.chat.attachment.fileName",
  PastedLines: "vscode.chat.attachment.pastedLines",
  TextArtifact: "vscode.chat.attachment.textArtifact"
};

var ChatTranscriptContextMetadataKey = "vscode.chat.transcriptContext";

var ChatTranscriptContextAttachmentDisplayKind = "transcriptContext";

function agentHostCompletionVariableValue(kind) {
  return { $mid: "agentHostCompletion", kind };
}

function agentHostCompletionVariableId(kind, reference) {
  switch (kind) {
    case "skill" /* Skill */:
      return reference.toString();
    case "command" /* Command */:
      return "agent-host-command:" + reference.toString();
  }
}

function toAgentHostCompletionVariableEntry(kind, name, reference, _meta) {
  return {
    kind: "generic",
    id: reference !== void 0 ? agentHostCompletionVariableId(kind, reference) : generateUuid(),
    name,
    value: agentHostCompletionVariableValue(kind),
    _meta
  };
}

function toAgentHostCompletionVariableEntryFromMetadata(kind, name, _meta) {
  switch (kind) {
    case "skill" /* Skill */:
      return toAgentHostCompletionVariableEntry(kind, name, typeof _meta?.uri === "string" ? _meta.uri : void 0, _meta);
    case "command" /* Command */:
      return toAgentHostCompletionVariableEntry(kind, name, typeof _meta?.command === "string" ? _meta.command : void 0, _meta);
  }
}

function getAgentHostCompletionReferenceKind(entry) {
  if (entry.kind !== "generic") {
    return void 0;
  }
  return getAgentHostCompletionReferenceKindFromValue(entry.value);
}

function getAgentHostCompletionReferenceKindFromValue(value2) {
  if (typeof value2 !== "object" || value2 === null) {
    return void 0;
  }
  const record = value2;
  if (record.$mid !== "agentHostCompletion") {
    return void 0;
  }
  switch (record.kind) {
    case "skill" /* Skill */:
    case "command" /* Command */:
      return record.kind;
  }
  return void 0;
}

function isAgentHostCompletionVariableEntry(entry) {
  return getAgentHostCompletionReferenceKind(entry) !== void 0;
}

var CLAUDE_MESSAGES_MAX_IMAGES_PER_REQUEST = 20;

var GEMINI_MAX_IMAGES_PER_REQUEST = 10;

function getImageAttachmentLimit(model) {
  if (!model) {
    return void 0;
  }
  const family = model.family.toLowerCase();
  if (family.startsWith("gemini")) {
    return GEMINI_MAX_IMAGES_PER_REQUEST;
  }
  if (family.startsWith("claude") || family.startsWith("anthropic")) {
    return CLAUDE_MESSAGES_MAX_IMAGES_PER_REQUEST;
  }
  return void 0;
}

function toPasteVariableEntry(name, code, options3) {
  const language2 = options3?.language ?? "markdown";
  const fileName = options3?.fileName ?? name;
  const pastedLines = options3?.pastedLines ?? name;
  return {
    kind: "paste",
    id: options3?.id ?? `chat-paste-${generateUuid()}`,
    name,
    icon: options3?.icon,
    value: code,
    code,
    language: language2,
    pastedLines,
    fileName,
    copiedFrom: void 0,
    _meta: {
      ...options3?._meta,
      [ChatPasteAttachmentMetadata.Kind]: "paste",
      [ChatPasteAttachmentMetadata.Language]: language2,
      [ChatPasteAttachmentMetadata.FileName]: fileName,
      [ChatPasteAttachmentMetadata.PastedLines]: pastedLines
    }
  };
}

function restorePasteVariableEntryFromAttachment(attachment) {
  const modelRepresentation = attachment.modelRepresentation;
  if (typeof modelRepresentation !== "string" || attachment._meta?.[ChatPasteAttachmentMetadata.Kind] !== "paste") {
    return void 0;
  }
  const stringMetadata = (key3, fallback2) => {
    const value2 = attachment._meta?.[key3];
    return typeof value2 === "string" ? value2 : fallback2;
  };
  return toPasteVariableEntry(attachment.label, modelRepresentation, {
    language: stringMetadata(ChatPasteAttachmentMetadata.Language, "markdown"),
    fileName: stringMetadata(ChatPasteAttachmentMetadata.FileName, attachment.label),
    pastedLines: stringMetadata(ChatPasteAttachmentMetadata.PastedLines, attachment.label),
    _meta: attachment._meta
  });
}

var IDiagnosticVariableEntryFilterData;

((IDiagnosticVariableEntryFilterData2) => {
  IDiagnosticVariableEntryFilterData2.icon = Codicon.error;
  function fromMarker(marker) {
    return {
      filterUri: marker.resource,
      owner: marker.owner,
      problemMessage: marker.message,
      filterRange: { startLineNumber: marker.startLineNumber, endLineNumber: marker.endLineNumber, startColumn: marker.startColumn, endColumn: marker.endColumn }
    };
  }
  IDiagnosticVariableEntryFilterData2.fromMarker = fromMarker;
  function toEntry2(data) {
    return {
      id: id2(data),
      name: label3(data),
      icon: IDiagnosticVariableEntryFilterData2.icon,
      value: data,
      kind: "diagnostic",
      ...data
    };
  }
  IDiagnosticVariableEntryFilterData2.toEntry = toEntry2;
  function id2(data) {
    return [data.filterUri, data.owner, data.filterSeverity, data.filterRange?.startLineNumber, data.filterRange?.startColumn].join(":");
  }
  IDiagnosticVariableEntryFilterData2.id = id2;
  function label3(data) {
    let TrimThreshold;
    ((TrimThreshold2) => {
      TrimThreshold2[TrimThreshold2["MaxChars"] = 30] = "MaxChars";
      TrimThreshold2[TrimThreshold2["MaxSpaceLookback"] = 10] = "MaxSpaceLookback";
    })(TrimThreshold || (TrimThreshold = {}));
    if (data.problemMessage) {
      if (data.problemMessage.length < 30 /* MaxChars */) {
        return data.problemMessage;
      }
      const lastSpace = data.problemMessage.lastIndexOf(" ", 30 /* MaxChars */);
      if (lastSpace === -1 || lastSpace + 10 /* MaxSpaceLookback */ < 30 /* MaxChars */) {
        return data.problemMessage.substring(0, 30 /* MaxChars */) + "\u2026";
      }
      return data.problemMessage.substring(0, lastSpace) + "\u2026";
    }
    let labelStr = localize(12834, null);
    if (data.filterUri) {
      labelStr = localize(12835, null, basename2(data.filterUri));
    }
    return labelStr;
  }
  IDiagnosticVariableEntryFilterData2.label = label3;
})(IDiagnosticVariableEntryFilterData || (IDiagnosticVariableEntryFilterData = {}));

function isBrowserViewVariableEntry(entry) {
  return entry.kind === "browserView";
}

function isChatReferenceVariableEntry(entry) {
  return entry.kind === "chatReference";
}

function chatReferenceVariableEntryId(chatResource, endTurn2) {
  return endTurn2 === void 0 ? `agent-host-chat:${chatResource.toString()}` : `agent-host-chat:${chatResource.toString()}\0${endTurn2}`;
}

function createChatReferenceVariableEntry(chatResource, endTurn2, title, _meta, range2) {
  return {
    kind: "chatReference",
    id: chatReferenceVariableEntryId(chatResource, endTurn2),
    name: title,
    value: chatResource,
    endTurn: endTurn2,
    range: range2,
    _meta
  };
}

function toChatReferenceDynamicVariableValue(chatResource, endTurn2) {
  return endTurn2 === void 0 ? { $mid: "agentHostChatReference", chatResource: chatResource.toString() } : { $mid: "agentHostChatReference", chatResource: chatResource.toString(), endTurn: endTurn2 };
}

function isChatReferenceDynamicVariableValue(value2) {
  return typeof value2 === "object" && value2 !== null && value2.$mid === "agentHostChatReference";
}

function chatReferenceVariableEntryFromDynamicValue(value2, id2, name, range2, _meta) {
  let chatResource;
  try {
    chatResource = URI.parse(value2.chatResource);
  } catch {
    return void 0;
  }
  return {
    kind: "chatReference",
    id: id2,
    name,
    value: chatResource,
    endTurn: value2.endTurn,
    range: range2,
    _meta
  };
}

var IChatRequestVariableEntry;

((IChatRequestVariableEntry17) => {
  function toUri(entry) {
    return URI.isUri(entry.value) ? entry.value : isLocation(entry.value) ? entry.value.uri : void 0;
  }
  IChatRequestVariableEntry17.toUri = toUri;
  function toExport(v2) {
    if (v2.value instanceof Uint8Array) {
      const dup = { ...v2 };
      dup.value = { $base64: encodeBase64(VSBuffer.wrap(v2.value)) };
      return dup;
    }
    if (isElementVariableEntry(v2) && v2.imageData instanceof Uint8Array) {
      return {
        ...v2,
        imageData: { $base64: encodeBase64(VSBuffer.wrap(v2.imageData)) }
      };
    }
    return v2;
  }
  IChatRequestVariableEntry17.toExport = toExport;
  function fromExport(v2) {
    if (v2 && "values" in v2 && Array.isArray(v2.values)) {
      return {
        kind: "generic",
        id: v2.id ?? "",
        name: v2.name,
        value: v2.values[0]?.value,
        range: v2.range,
        modelDescription: v2.modelDescription,
        references: v2.references
      };
    } else {
      if (v2.value && typeof v2.value === "object" && "$base64" in v2.value && typeof v2.value.$base64 === "string") {
        const dup = { ...v2 };
        dup.value = decodeBase64(v2.value.$base64).buffer;
        return dup;
      }
      if (isElementVariableEntry(v2) && v2.imageData && typeof v2.imageData === "object" && "$base64" in v2.imageData && typeof v2.imageData.$base64 === "string") {
        return {
          ...v2,
          imageData: decodeBase64(v2.imageData.$base64).buffer
        };
      }
      return v2;
    }
  }
  IChatRequestVariableEntry17.fromExport = fromExport;
})(IChatRequestVariableEntry || (IChatRequestVariableEntry = {}));

function isImplicitVariableEntry(obj) {
  return obj.kind === "implicit";
}

function isStringVariableEntry(obj) {
  return obj.kind === "string";
}

function isChatTranscriptContextVariableEntry(obj) {
  return obj.kind === "transcriptContext";
}

function toChatTranscriptContextAttachmentMeta(entry) {
  return {
    ...entry._meta,
    [ChatTranscriptContextMetadataKey]: {
      uri: entry.uri.toString(),
      iconId: entry.icon?.id,
      tooltip: entry.tooltip,
      fullName: entry.fullName
    }
  };
}

function restoreChatTranscriptContextVariableEntry(label3, value2, meta) {
  const raw = meta?.[ChatTranscriptContextMetadataKey];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return void 0;
  }
  const record = raw;
  if (typeof record.uri !== "string") {
    return void 0;
  }
  return {
    kind: "transcriptContext",
    id: generateUuid(),
    name: label3,
    ...typeof record.fullName === "string" ? { fullName: record.fullName } : {},
    ...typeof record.iconId === "string" ? { icon: ThemeIcon.fromId(record.iconId) } : {},
    ...typeof record.tooltip === "string" ? { tooltip: record.tooltip } : {},
    value: value2,
    uri: URI.parse(record.uri),
    _meta: meta
  };
}

function isTerminalVariableEntry(obj) {
  return obj.kind === "terminalCommand";
}

function isAgentFeedbackVariableEntry(obj) {
  return obj.kind === "agentFeedback";
}

function isPasteVariableEntry(obj) {
  return obj.kind === "paste";
}

function isPastedTextArtifact(obj) {
  return isPasteVariableEntry(obj) && obj._meta?.[ChatPasteAttachmentMetadata.TextArtifact] === true;
}

function isWorkspaceVariableEntry(obj) {
  return obj.kind === "workspace";
}

function isImageVariableEntry(obj) {
  return obj.kind === "image";
}

function isExplicitFileOrImageVariableEntry(obj) {
  return obj.kind === "file" || obj.kind === "directory" || obj.kind === "image";
}

function getExplicitFileOrImageAttachmentSummary(entries2) {
  const fileOrImageEntries = entries2.filter(isExplicitFileOrImageVariableEntry);
  if (!fileOrImageEntries.length) {
    return void 0;
  }
  if (fileOrImageEntries.every(isImageVariableEntry)) {
    return fileOrImageEntries.length === 1 ? localize(12839, null) : localize(12838, null, fileOrImageEntries.length);
  }
  return fileOrImageEntries.length === 1 ? localize(12837, null) : localize(12836, null, fileOrImageEntries.length);
}

function isNotebookOutputVariableEntry(obj) {
  return obj.kind === "notebookOutput";
}

function isElementVariableEntry(obj) {
  return obj.kind === "element";
}

function isPromptFileVariableEntry(obj) {
  return obj.kind === "promptFile";
}

function isPromptTextVariableEntry(obj) {
  return obj.kind === "promptText";
}

function isSCMHistoryItemVariableEntry(obj) {
  return obj.kind === "scmHistoryItem";
}

function isSCMHistoryItemChangeVariableEntry(obj) {
  return obj.kind === "scmHistoryItemChange";
}

function isSCMHistoryItemChangeRangeVariableEntry(obj) {
  return obj.kind === "scmHistoryItemChangeRange";
}

function isStringImplicitContextValue(value2) {
  const asStringImplicitContextValue = value2;
  return typeof asStringImplicitContextValue === "object" && asStringImplicitContextValue !== null && (typeof asStringImplicitContextValue.value === "string" || typeof asStringImplicitContextValue.value === "undefined") && (typeof asStringImplicitContextValue.name === "string" || typeof asStringImplicitContextValue.name === "undefined") && (asStringImplicitContextValue.resourceUri === void 0 || URI.isUri(asStringImplicitContextValue.resourceUri)) && (typeof asStringImplicitContextValue.name === "string" || URI.isUri(asStringImplicitContextValue.resourceUri)) && (asStringImplicitContextValue.iconPath === void 0 || isChatContextIconPath(asStringImplicitContextValue.iconPath)) && URI.isUri(asStringImplicitContextValue.uri) && typeof asStringImplicitContextValue.handle === "number";
}

function toPromptFileVariableEntry(uri5, kind, originLabel, automaticallyAdded = false, toolReferences) {
  return {
    id: `${kind}__${uri5.toString()}`,
    name: `prompt:${basename2(uri5)}`,
    value: uri5,
    kind: "promptFile",
    modelDescription: "Prompt instructions file",
    isRoot: kind !== "vscode.instructions.file.reference" /* InstructionReference */,
    originLabel,
    toolReferences,
    automaticallyAdded
  };
}

function toPromptTextVariableEntry(content2, automaticallyAdded = false, toolReferences) {
  return {
    id: "vscode.customizations.index" /* CustomizationsIndex */,
    name: `prompt:customizationsIndex`,
    value: content2,
    kind: "promptText",
    modelDescription: "Chat customizations index",
    automaticallyAdded,
    toolReferences
  };
}

function toToolVariableEntry(entry, range2) {
  return {
    kind: "tool",
    id: entry.id,
    icon: ThemeIcon.isThemeIcon(entry.icon) ? entry.icon : void 0,
    name: entry.displayName,
    value: void 0,
    range: range2
  };
}

function toToolSetVariableEntry(entry, range2) {
  return {
    kind: "toolset",
    id: entry.id,
    icon: entry.icon,
    name: entry.referenceName,
    value: Array.from(entry.getTools()).map((t2) => toToolVariableEntry(t2)),
    range: range2
  };
}

var ChatRequestVariableSet = class {
  constructor(entries2) {
    this._ids = /* @__PURE__ */ new Set();
    this._entries = [];
    if (entries2) {
      this.add(...entries2);
    }
  }
  add(...entry) {
    for (const e of entry) {
      if (!this._ids.has(e.id)) {
        this._ids.add(e.id);
        this._entries.push(e);
      }
    }
  }
  insertFirst(entry) {
    if (!this._ids.has(entry.id)) {
      this._ids.add(entry.id);
      this._entries.unshift(entry);
    }
  }
  remove(entry) {
    this._ids.delete(entry.id);
    this._entries = this._entries.filter((e) => e.id !== entry.id);
  }
  has(entry) {
    return this._ids.has(entry.id);
  }
  asArray() {
    return this._entries.slice(0);
  }
  get length() {
    return this._entries.length;
  }
};
export { isChatContextIconPath, resolveChatContextIcon, agentHostCompletionVariableValue, agentHostCompletionVariableId, toAgentHostCompletionVariableEntry, toAgentHostCompletionVariableEntryFromMetadata, getAgentHostCompletionReferenceKind, getAgentHostCompletionReferenceKindFromValue, isAgentHostCompletionVariableEntry, getImageAttachmentLimit, toPasteVariableEntry, restorePasteVariableEntryFromAttachment, isBrowserViewVariableEntry, isChatReferenceVariableEntry, chatReferenceVariableEntryId, createChatReferenceVariableEntry, toChatReferenceDynamicVariableValue, isChatReferenceDynamicVariableValue, chatReferenceVariableEntryFromDynamicValue, isImplicitVariableEntry, isStringVariableEntry, isChatTranscriptContextVariableEntry, toChatTranscriptContextAttachmentMeta, restoreChatTranscriptContextVariableEntry, isTerminalVariableEntry, isAgentFeedbackVariableEntry, isPasteVariableEntry, isPastedTextArtifact, isWorkspaceVariableEntry, isImageVariableEntry, isExplicitFileOrImageVariableEntry, getExplicitFileOrImageAttachmentSummary, isNotebookOutputVariableEntry, isElementVariableEntry, isPromptFileVariableEntry, isPromptTextVariableEntry, isSCMHistoryItemVariableEntry, isSCMHistoryItemChangeVariableEntry, isSCMHistoryItemChangeRangeVariableEntry, isStringImplicitContextValue, toPromptFileVariableEntry, toPromptTextVariableEntry, toToolVariableEntry, toToolSetVariableEntry, ChatPasteAttachmentMetadata, ChatTranscriptContextMetadataKey, ChatTranscriptContextAttachmentDisplayKind, CLAUDE_MESSAGES_MAX_IMAGES_PER_REQUEST, GEMINI_MAX_IMAGES_PER_REQUEST, IDiagnosticVariableEntryFilterData, IChatRequestVariableEntry, ChatRequestVariableSet };
