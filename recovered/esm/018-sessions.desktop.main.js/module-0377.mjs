// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/textModelEditSource.ts
import { TextLength } from "./module-0175.mjs";
import { LineEdit } from "./module-0376.mjs";
import { sumBy } from "./module-0007.mjs";
import { prefixedUuid } from "./module-0190.mjs";


// src/vs/editor/common/textModelEditSource.ts
var privateSymbol = /* @__PURE__ */ Symbol("TextModelEditSource");

var TextModelEditSource = class {
  constructor(metadata, _privateCtorGuard) {
    this.metadata = metadata;
  }
  toString() {
    return `${this.metadata.source}`;
  }
  getType() {
    const metadata = this.metadata;
    switch (metadata.source) {
      case "cursor":
        return metadata.kind;
      case "inlineCompletionAccept":
        return metadata.source + (metadata.$nes ? ":nes" : "");
      case "unknown":
        return metadata.name || "unknown";
      default:
        return metadata.source;
    }
  }
  /**
   * Converts the metadata to a key string.
   * Only includes properties/values that have `level` many `$` prefixes or less.
  */
  toKey(level, filter2 = {}) {
    const metadata = this.metadata;
    const keys = Object.entries(metadata).filter(([key3, value2]) => {
      const filterVal = filter2[key3];
      if (filterVal !== void 0) {
        return filterVal;
      }
      const prefixCount = (key3.match(/\$/g) || []).length;
      return prefixCount <= level && value2 !== void 0 && value2 !== null && value2 !== "";
    }).map(([key3, value2]) => `${key3}:${value2}`);
    return keys.join("-");
  }
  get props() {
    return this.metadata;
  }
};

function createEditSource(metadata) {
  return new TextModelEditSource(metadata, privateSymbol);
}

function isAiEdit(source) {
  switch (source.metadata.source) {
    case "inlineCompletionAccept":
    case "inlineCompletionPartialAccept":
    case "inlineChat.applyEdits":
    case "Chat.applyEdits":
      return true;
  }
  return false;
}

function isUserEdit(source) {
  switch (source.metadata.source) {
    case "cursor":
      return source.metadata.kind === "type";
  }
  return false;
}

var EditSources = {
  unknown(data) {
    return createEditSource({
      source: "unknown",
      name: data.name
    });
  },
  rename: (oldName, newName) => createEditSource({ source: "rename", $$$oldName: oldName, $$$newName: newName }),
  chatApplyEdits(data) {
    return createEditSource({
      source: "Chat.applyEdits",
      $modelId: avoidPathRedaction(data.modelId),
      $extensionId: data.extensionId?.extensionId,
      $extensionVersion: data.extensionId?.version,
      $harness: data.harness,
      $origin: data.origin,
      $$languageId: data.languageId,
      $$sessionId: data.sessionId,
      $$requestId: data.requestId,
      $$mode: data.mode,
      $$codeBlockSuggestionId: data.codeBlockSuggestionId
    });
  },
  agentHostChatApplyEdits(data) {
    return EditSources.chatApplyEdits({
      modelId: data.modelId,
      sessionId: data.sessionId,
      requestId: data.requestId,
      languageId: "",
      mode: void 0,
      extensionId: void 0,
      codeBlockSuggestionId: void 0,
      origin: "agentHost",
      harness: data.harness
    });
  },
  chatUndoEdits: () => createEditSource({ source: "Chat.undoEdits" }),
  chatReset: () => createEditSource({ source: "Chat.reset" }),
  inlineCompletionAccept(data) {
    return createEditSource({
      source: "inlineCompletionAccept",
      $nes: data.nes,
      ...toProperties(data.providerId),
      $$correlationId: data.correlationId,
      $$requestUuid: data.requestUuid,
      $$languageId: data.languageId
    });
  },
  inlineCompletionPartialAccept(data) {
    return createEditSource({
      source: "inlineCompletionPartialAccept",
      type: data.type,
      $nes: data.nes,
      ...toProperties(data.providerId),
      $$correlationId: data.correlationId,
      $$requestUuid: data.requestUuid,
      $$languageId: data.languageId
    });
  },
  inlineChatApplyEdit(data) {
    return createEditSource({
      source: "inlineChat.applyEdits",
      $modelId: avoidPathRedaction(data.modelId),
      $extensionId: data.extensionId?.extensionId,
      $extensionVersion: data.extensionId?.version,
      $$sessionId: data.sessionId,
      $$requestId: data.requestId,
      $$languageId: data.languageId
    });
  },
  reloadFromDisk: () => createEditSource({ source: "reloadFromDisk" }),
  cursor(data) {
    return createEditSource({
      source: "cursor",
      kind: data.kind,
      detailedSource: data.detailedSource
    });
  },
  setValue: () => createEditSource({ source: "setValue" }),
  eolChange: () => createEditSource({ source: "eolChange" }),
  applyEdits: () => createEditSource({ source: "applyEdits" }),
  snippet: () => createEditSource({ source: "snippet" }),
  suggest: (data) => createEditSource({ source: "suggest", ...toProperties(data.providerId) }),
  codeAction: (data) => createEditSource({ source: "codeAction", $kind: data.kind, ...toProperties(data.providerId) })
};

function toProperties(version2) {
  if (!version2) {
    return {};
  }
  return {
    $extensionId: version2.extensionId,
    $extensionVersion: version2.extensionVersion,
    $providerId: version2.providerId
  };
}

function avoidPathRedaction(str) {
  if (str === void 0) {
    return void 0;
  }
  return str.replaceAll("/", "|");
}

var EditDeltaInfo = class _EditDeltaInfo {
  constructor(linesAdded, linesRemoved, charsAdded, charsRemoved) {
    this.linesAdded = linesAdded;
    this.linesRemoved = linesRemoved;
    this.charsAdded = charsAdded;
    this.charsRemoved = charsRemoved;
  }
  static fromText(text2) {
    const linesAdded = TextLength.ofText(text2).lineCount;
    const charsAdded = text2.length;
    return new _EditDeltaInfo(linesAdded, 0, charsAdded, 0);
  }
  /** @internal */
  static fromEdit(edit3, originalString) {
    const lineEdit = LineEdit.fromStringEdit(edit3, originalString);
    const linesAdded = sumBy(lineEdit.replacements, (r2) => r2.newLines.length);
    const linesRemoved = sumBy(lineEdit.replacements, (r2) => r2.lineRange.length);
    const charsAdded = sumBy(edit3.replacements, (r2) => r2.getNewLength());
    const charsRemoved = sumBy(edit3.replacements, (r2) => r2.replaceRange.length);
    return new _EditDeltaInfo(linesAdded, linesRemoved, charsAdded, charsRemoved);
  }
  static tryCreate(linesAdded, linesRemoved, charsAdded, charsRemoved) {
    if (linesAdded === void 0 || linesRemoved === void 0 || charsAdded === void 0 || charsRemoved === void 0) {
      return void 0;
    }
    return new _EditDeltaInfo(linesAdded, linesRemoved, charsAdded, charsRemoved);
  }
};

var EditSuggestionId;

((EditSuggestionId4) => {
  function newId(genPrefixedUuid) {
    const id2 = genPrefixedUuid ? genPrefixedUuid("sgt") : prefixedUuid("sgt");
    return toEditIdentity(id2);
  }
  EditSuggestionId4.newId = newId;
})(EditSuggestionId || (EditSuggestionId = {}));

function toEditIdentity(id2) {
  return id2;
}
export { createEditSource, isAiEdit, isUserEdit, toProperties, avoidPathRedaction, toEditIdentity, privateSymbol, TextModelEditSource, EditSources, EditDeltaInfo, EditSuggestionId };
