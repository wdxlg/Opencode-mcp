// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/attachments/chatVariableEntries.ts
import { ThemeIcon } from "./module-0070.mjs";
import { URI } from "./module-0023.mjs";
import { Codicon } from "./module-0069.mjs";
import { localize } from "./module-0015.mjs";
import { basename2 } from "./module-0032.mjs";
import { isLocation } from "./module-0086.mjs";
import { VSBuffer, decodeBase64, encodeBase64 } from "./module-0013.mjs";


// src/vs/workbench/contrib/chat/common/attachments/chatVariableEntries.ts
function isChatContextIconPath(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (ThemeIcon.isThemeIcon(value) || URI.isUri(value)) {
    return true;
  }
  const asDualPath = value;
  return URI.isUri(asDualPath.light) && URI.isUri(asDualPath.dark);
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
  function toEntry(data2) {
    return {
      id: id2(data2),
      name: label(data2),
      icon: IDiagnosticVariableEntryFilterData2.icon,
      value: data2,
      kind: "diagnostic",
      ...data2
    };
  }
  IDiagnosticVariableEntryFilterData2.toEntry = toEntry;
  function id2(data2) {
    return [data2.filterUri, data2.owner, data2.filterSeverity, data2.filterRange?.startLineNumber, data2.filterRange?.startColumn].join(":");
  }
  IDiagnosticVariableEntryFilterData2.id = id2;
  function label(data2) {
    let TrimThreshold;
    ((TrimThreshold2) => {
      TrimThreshold2[TrimThreshold2["MaxChars"] = 30] = "MaxChars";
      TrimThreshold2[TrimThreshold2["MaxSpaceLookback"] = 10] = "MaxSpaceLookback";
    })(TrimThreshold || (TrimThreshold = {}));
    if (data2.problemMessage) {
      if (data2.problemMessage.length < 30 /* MaxChars */) {
        return data2.problemMessage;
      }
      const lastSpace = data2.problemMessage.lastIndexOf(" ", 30 /* MaxChars */);
      if (lastSpace === -1 || lastSpace + 10 /* MaxSpaceLookback */ < 30 /* MaxChars */) {
        return data2.problemMessage.substring(0, 30 /* MaxChars */) + "\u2026";
      }
      return data2.problemMessage.substring(0, lastSpace) + "\u2026";
    }
    let labelStr = localize(12834, null);
    if (data2.filterUri) {
      labelStr = localize(12835, null, basename2(data2.filterUri));
    }
    return labelStr;
  }
  IDiagnosticVariableEntryFilterData2.label = label;
})(IDiagnosticVariableEntryFilterData || (IDiagnosticVariableEntryFilterData = {}));

function isChatReferenceDynamicVariableValue(value) {
  return typeof value === "object" && value !== null && value.$mid === "agentHostChatReference";
}

function chatReferenceVariableEntryFromDynamicValue(value, id2, name2, range, _meta) {
  let chatResource;
  try {
    chatResource = URI.parse(value.chatResource);
  } catch {
    return void 0;
  }
  return {
    kind: "chatReference",
    id: id2,
    name: name2,
    value: chatResource,
    endTurn: value.endTurn,
    range,
    _meta
  };
}

var IChatRequestVariableEntry;

((IChatRequestVariableEntry5) => {
  function toUri(entry) {
    return URI.isUri(entry.value) ? entry.value : isLocation(entry.value) ? entry.value.uri : void 0;
  }
  IChatRequestVariableEntry5.toUri = toUri;
  function toExport(v) {
    if (v.value instanceof Uint8Array) {
      const dup = { ...v };
      dup.value = { $base64: encodeBase64(VSBuffer.wrap(v.value)) };
      return dup;
    }
    if (isElementVariableEntry(v) && v.imageData instanceof Uint8Array) {
      return {
        ...v,
        imageData: { $base64: encodeBase64(VSBuffer.wrap(v.imageData)) }
      };
    }
    return v;
  }
  IChatRequestVariableEntry5.toExport = toExport;
  function fromExport(v) {
    if (v && "values" in v && Array.isArray(v.values)) {
      return {
        kind: "generic",
        id: v.id ?? "",
        name: v.name,
        value: v.values[0]?.value,
        range: v.range,
        modelDescription: v.modelDescription,
        references: v.references
      };
    } else {
      if (v.value && typeof v.value === "object" && "$base64" in v.value && typeof v.value.$base64 === "string") {
        const dup = { ...v };
        dup.value = decodeBase64(v.value.$base64).buffer;
        return dup;
      }
      if (isElementVariableEntry(v) && v.imageData && typeof v.imageData === "object" && "$base64" in v.imageData && typeof v.imageData.$base64 === "string") {
        return {
          ...v,
          imageData: decodeBase64(v.imageData.$base64).buffer
        };
      }
      return v;
    }
  }
  IChatRequestVariableEntry5.fromExport = fromExport;
})(IChatRequestVariableEntry || (IChatRequestVariableEntry = {}));

function isImplicitVariableEntry(obj) {
  return obj.kind === "implicit";
}

function isStringVariableEntry(obj) {
  return obj.kind === "string";
}

function isImageVariableEntry(obj) {
  return obj.kind === "image";
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

function isStringImplicitContextValue(value) {
  const asStringImplicitContextValue = value;
  return typeof asStringImplicitContextValue === "object" && asStringImplicitContextValue !== null && (typeof asStringImplicitContextValue.value === "string" || typeof asStringImplicitContextValue.value === "undefined") && (typeof asStringImplicitContextValue.name === "string" || typeof asStringImplicitContextValue.name === "undefined") && (asStringImplicitContextValue.resourceUri === void 0 || URI.isUri(asStringImplicitContextValue.resourceUri)) && (typeof asStringImplicitContextValue.name === "string" || URI.isUri(asStringImplicitContextValue.resourceUri)) && (asStringImplicitContextValue.iconPath === void 0 || isChatContextIconPath(asStringImplicitContextValue.iconPath)) && URI.isUri(asStringImplicitContextValue.uri) && typeof asStringImplicitContextValue.handle === "number";
}

function toPromptFileVariableEntry(uri2, kind, originLabel, automaticallyAdded = false, toolReferences) {
  return {
    id: `${kind}__${uri2.toString()}`,
    name: `prompt:${basename2(uri2)}`,
    value: uri2,
    kind: "promptFile",
    modelDescription: "Prompt instructions file",
    isRoot: kind !== "vscode.instructions.file.reference" /* InstructionReference */,
    originLabel,
    toolReferences,
    automaticallyAdded
  };
}

function toPromptTextVariableEntry(content, automaticallyAdded = false, toolReferences) {
  return {
    id: "vscode.customizations.index" /* CustomizationsIndex */,
    name: `prompt:customizationsIndex`,
    value: content,
    kind: "promptText",
    modelDescription: "Chat customizations index",
    automaticallyAdded,
    toolReferences
  };
}

function toToolVariableEntry(entry, range) {
  return {
    kind: "tool",
    id: entry.id,
    icon: ThemeIcon.isThemeIcon(entry.icon) ? entry.icon : void 0,
    name: entry.displayName,
    value: void 0,
    range
  };
}

var ChatRequestVariableSet = class {
  constructor(entries) {
    this._ids = /* @__PURE__ */ new Set();
    this._entries = [];
    if (entries) {
      this.add(...entries);
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
export { isChatContextIconPath, isChatReferenceDynamicVariableValue, chatReferenceVariableEntryFromDynamicValue, isImplicitVariableEntry, isStringVariableEntry, isImageVariableEntry, isElementVariableEntry, isPromptFileVariableEntry, isPromptTextVariableEntry, isStringImplicitContextValue, toPromptFileVariableEntry, toPromptTextVariableEntry, toToolVariableEntry, IDiagnosticVariableEntryFilterData, IChatRequestVariableEntry, ChatRequestVariableSet };
