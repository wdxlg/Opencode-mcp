// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/model/chatModel.ts
import { IChatRequestVariableEntry, isImplicitVariableEntry, isStringImplicitContextValue, isStringVariableEntry } from "./module-0979.mjs";
import { URI } from "./module-0032.mjs";
import { observableValue } from "./module-0048.mjs";
import { generateUuid } from "./module-0190.mjs";
import { MarkdownString, appendEscapedMarkdownInlineCode, isMarkdownString } from "./module-0462.mjs";
import { softAssertNever } from "./module-0009.mjs";
import { localize } from "./module-0001.mjs";
import { migrateLegacyTerminalToolSpecificData } from "./module-1188.mjs";
import { IChatService, IChatToolInvocation, isIUsedContext } from "./module-0972.mjs";
import { Schemas } from "./module-0033.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { asArray } from "./module-0007.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { CellUri } from "./module-0909.mjs";
import { autorun, registerAutorunSelfDisposable } from "./module-0052.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { ChatToolInvocation } from "./module-1190.mjs";
import { observableSignal } from "./module-0058.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { derived } from "./module-0054.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { equals4 } from "./module-0098.mjs";
import { ChatPlanReviewData } from "./module-1191.mjs";
import { ChatQuestionCarouselData } from "./module-1192.mjs";
import { observableValueOpts } from "./module-0050.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { LocalChatSessionUri, chatSessionResourceToId } from "./module-0961.mjs";
import { constObservable } from "./module-0061.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { hasKey } from "./module-0010.mjs";
import { ChatRequestTextPart, reviveParsedChatRequest } from "./module-0987.mjs";
import { reviveChatRequestOrigin, serializeChatRequestOrigin } from "./module-1189.mjs";
import { IChatAgentService, reviveSerializedAgent } from "./module-0974.mjs";
import { revive } from "./module-0265.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { ChatPerfMark, markChat } from "./module-0973.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService, canLog } from "./module-0095.mjs";
import { IChatEditingService } from "./module-1081.mjs";
import { VSBuffer, decodeHex, encodeHex } from "./module-0038.mjs";


// src/vs/workbench/contrib/chat/common/model/chatModel.ts
var CHAT_ATTACHABLE_IMAGE_MIME_TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp"
};

function getAttachableImageExtension(mimeType) {
  return Object.entries(CHAT_ATTACHABLE_IMAGE_MIME_TYPES).find(([_, value2]) => value2 === mimeType)?.[0];
}

var IChatRequestVariableData;

((IChatRequestVariableData5) => {
  function toExport(data) {
    return { variables: data.variables.map(IChatRequestVariableEntry.toExport) };
  }
  IChatRequestVariableData5.toExport = toExport;
})(IChatRequestVariableData || (IChatRequestVariableData = {}));

function isCellTextEditOperation(value2) {
  const candidate = value2;
  return !!candidate && !!candidate.edit && !!candidate.uri && URI.isUri(candidate.uri);
}

function isCellTextEditOperationArray(value2) {
  return value2.some(isCellTextEditOperation);
}

var nonHistoryKinds = /* @__PURE__ */ new Set(["toolInvocation", "toolInvocationSerialized", "undoStop", "voiceProgress"]);

function isChatProgressHistoryResponseContent(content2) {
  return !nonHistoryKinds.has(content2.kind);
}

function toChatHistoryContent(content2) {
  return content2.filter(isChatProgressHistoryResponseContent);
}

var defaultChatResponseModelChangeReason = { reason: "other" };

var ChatRequestModel = class {
  constructor(params) {
    this._shouldBeBlocked = observableValue(this, false);
    this._version = 0;
    this._session = params.session;
    this.message = params.message;
    this._variableData = params.variableData;
    this.requestTimestamp = params.timestamp;
    this.timestamp = params.timestamp ?? params.fallbackTimestamp ?? Date.now();
    this._attempt = params.attempt ?? 0;
    this.modeInfo = params.modeInfo;
    this._confirmation = params.confirmation;
    this._locationData = params.locationData;
    this._attachedContext = params.attachedContext;
    this.isCompleteAddedRequest = params.isCompleteAddedRequest ?? false;
    this.modelId = params.modelId;
    this.id = params.restoredId ?? "request_" + generateUuid();
    this._editedFileEvents = params.editedFileEvents;
    this.userSelectedTools = params.userSelectedTools;
    this.isSystemInitiated = params.isSystemInitiated;
    this.isHiddenFromTranscript = params.isHiddenFromTranscript ?? false;
    this.systemInitiatedLabel = params.systemInitiatedLabel;
    this.terminalExecutionId = params.terminalExecutionId;
    this.isTerminalCommand = params.isTerminalCommand ?? false;
    this.origin = params.origin;
    this.openCodeBranchIntent = params.openCodeBranchIntent;
  }
  get shouldBeBlocked() {
    return this._shouldBeBlocked;
  }
  setShouldBeBlocked(value2) {
    this._shouldBeBlocked.set(value2, void 0);
  }
  get session() {
    return this._session;
  }
  get attempt() {
    return this._attempt;
  }
  get variableData() {
    return this._variableData;
  }
  set variableData(v2) {
    this._version++;
    this._variableData = v2;
  }
  get confirmation() {
    return this._confirmation;
  }
  get locationData() {
    return this._locationData;
  }
  get attachedContext() {
    return this._attachedContext;
  }
  get editedFileEvents() {
    return this._editedFileEvents;
  }
  get version() {
    return this._version;
  }
  adoptTo(session) {
    this._session = session;
  }
};

var AbstractResponse = class {
  get value() {
    return this._responseParts;
  }
  constructor(value2) {
    this._responseParts = value2;
  }
  toString() {
    if (this._responseRepr === void 0) {
      this._responseRepr = this.computeRepr();
    }
    return this._responseRepr;
  }
  /**
   * _Just_ the content of markdown parts in the response
   */
  getMarkdown() {
    if (this._markdownContent === void 0) {
      this._markdownContent = this.computeMarkdownContent();
    }
    return this._markdownContent;
  }
  /**
   * The trailing contiguous markdown/inline-reference content of the response,
   * skipping any trailing tool calls or empty markdown parts.
   */
  getFinalResponse() {
    const parts = this._responseParts;
    let i2 = parts.length - 1;
    while (i2 >= 0) {
      const part = parts[i2];
      if (part.kind === "markdownContent" || part.kind === "markdownVuln") {
        if (part.content.value.length > 0) {
          break;
        }
      } else if (part.kind === "inlineReference") {
        break;
      }
      i2--;
    }
    if (i2 < 0) {
      return "";
    }
    const end = i2;
    while (i2 >= 0) {
      const part = parts[i2];
      if (part.kind === "markdownContent" || part.kind === "markdownVuln" || part.kind === "inlineReference") {
        i2--;
      } else {
        break;
      }
    }
    const start = i2 + 1;
    const segments = [];
    for (let j = start; j <= end; j++) {
      const part = parts[j];
      if (part.kind === "inlineReference") {
        segments.push(this.inlineRefToRepr(part));
      } else if (part.kind === "markdownContent" || part.kind === "markdownVuln") {
        if (part.content.value.length > 0) {
          segments.push(part.content.value);
        }
      }
    }
    return segments.join("");
  }
  /**
   * Invalidate cached representations so they are recomputed on next access.
   */
  _invalidateRepr() {
    this._responseRepr = void 0;
    this._markdownContent = void 0;
  }
  computeMarkdownContent() {
    const segments = [];
    for (const part of this._responseParts) {
      if (part.kind === "inlineReference") {
        segments.push(this.inlineRefToRepr(part));
      } else if (part.kind === "markdownContent" || part.kind === "markdownVuln") {
        if (part.content.value.length > 0) {
          segments.push(part.content.value);
        }
      }
    }
    return segments.join("");
  }
  computeRepr() {
    return this.partsToRepr(this._responseParts);
  }
  partsToRepr(parts) {
    const blocks = [];
    let currentBlockSegments = [];
    let hasEditGroupsAfterLastClear = false;
    for (const part of parts) {
      let segment;
      switch (part.kind) {
        case "clearToPreviousToolInvocation":
          currentBlockSegments = [];
          blocks.length = 0;
          hasEditGroupsAfterLastClear = false;
          continue;
        case "treeData":
        case "progressMessage":
        case "codeblockUri":
        case "extensions":
        case "pullRequest":
        case "undoStop":
        case "workspaceEdit":
        case "externalEdit":
        case "elicitation2":
        case "elicitationSerialized":
        case "thinking":
        case "hook":
        case "voiceProgress":
        case "multiDiffData":
        case "mcpServersStarting":
        case "mcpAuthenticationRequired":
        case "mcpServersStartingSlow":
        case "questionCarousel":
        case "planReview":
        case "disabledClaudeHooks":
        case "autoModeResolution":
          continue;
        case "systemNotification":
          segment = { text: part.content.value, isBlock: true };
          break;
        case "toolInvocation":
        case "toolInvocationSerialized":
          segment = this.getToolInvocationText(part);
          break;
        case "inlineReference":
          segment = { text: this.inlineRefToRepr(part) };
          break;
        case "command":
          segment = { text: part.command.title, isBlock: true };
          break;
        case "textEditGroup":
        case "notebookEditGroup":
          hasEditGroupsAfterLastClear = true;
          continue;
        case "confirmation":
          if (part.message instanceof MarkdownString) {
            segment = { text: `${part.title}
${part.message.value}`, isBlock: true };
            break;
          }
          segment = { text: `${part.title}
${part.message}`, isBlock: true };
          break;
        case "markdownContent":
        case "markdownVuln":
        case "progressTask":
        case "progressTaskSerialized":
        case "warning":
        case "info":
          segment = { text: part.content.value };
          break;
        default:
          softAssertNever(part);
          continue;
      }
      if (segment.isBlock) {
        if (currentBlockSegments.length) {
          blocks.push(currentBlockSegments.join(""));
          currentBlockSegments = [];
        }
        blocks.push(segment.text);
      } else {
        currentBlockSegments.push(segment.text);
      }
    }
    if (currentBlockSegments.length) {
      blocks.push(currentBlockSegments.join(""));
    }
    if (hasEditGroupsAfterLastClear) {
      blocks.push(localize(12988, null));
    }
    return blocks.join("\n\n");
  }
  inlineRefToRepr(part) {
    if ("uri" in part.inlineReference) {
      return this.uriToRepr(part.inlineReference.uri, part.inlineReference.range);
    }
    return "name" in part.inlineReference ? appendEscapedMarkdownInlineCode(part.inlineReference.name) : this.uriToRepr(part.inlineReference);
  }
  getToolInvocationText(toolInvocation) {
    const getTerminalDisplayInput = (terminalData) => terminalData.presentationOverrides?.commandLine ?? terminalData.commandLine.forDisplay ?? terminalData.commandLine.userEdited ?? terminalData.commandLine.toolEdited ?? terminalData.commandLine.original;
    let message = "";
    let input = "";
    if (toolInvocation.pastTenseMessage) {
      message = typeof toolInvocation.pastTenseMessage === "string" ? toolInvocation.pastTenseMessage : toolInvocation.pastTenseMessage.value;
    } else {
      message = typeof toolInvocation.invocationMessage === "string" ? toolInvocation.invocationMessage : toolInvocation.invocationMessage.value;
    }
    if (toolInvocation.toolSpecificData) {
      if (toolInvocation.toolSpecificData.kind === "terminal") {
        message = "Ran terminal command";
        const terminalData = migrateLegacyTerminalToolSpecificData(toolInvocation.toolSpecificData);
        input = getTerminalDisplayInput(terminalData);
      }
    }
    let text2 = message;
    if (input) {
      text2 += `: ${input}`;
    }
    if (toolInvocation.kind === "toolInvocationSerialized" || toolInvocation.kind === "toolInvocation" && IChatToolInvocation.isComplete(toolInvocation)) {
      const resultDetails = IChatToolInvocation.resultDetails(toolInvocation);
      if (resultDetails && "input" in resultDetails) {
        const resultPrefix = toolInvocation.kind === "toolInvocationSerialized" || IChatToolInvocation.isComplete(toolInvocation) ? "Completed" : "Errored";
        const resultInput = toolInvocation.toolSpecificData?.kind === "terminal" ? getTerminalDisplayInput(migrateLegacyTerminalToolSpecificData(toolInvocation.toolSpecificData)) : resultDetails.input;
        text2 += `
${resultPrefix} with input: ${resultInput}`;
      }
    }
    return { text: text2, isBlock: true };
  }
  /**
   * Renders a reference the way the response showed it — the file name plus any line suffix —
   * as code, so a name containing `*` or `_` survives being pasted into another document.
   */
  uriToRepr(uri5, range2) {
    if (uri5.scheme === Schemas.http || uri5.scheme === Schemas.https) {
      return uri5.toString(false);
    }
    const suffix = !range2 ? "" : range2.startLineNumber === range2.endLineNumber ? `:${range2.startLineNumber}` : `:${range2.startLineNumber}-${range2.endLineNumber}`;
    return appendEscapedMarkdownInlineCode(basename2(uri5) + suffix);
  }
};

var ResponseView = class extends AbstractResponse {
  constructor(_response, undoStop) {
    let idx = _response.value.findIndex((v2) => v2.kind === "undoStop" && v2.id === undoStop);
    if (_response.value[idx + 1]?.kind === "codeblockUri" && _response.value[idx - 1]?.kind === "markdownContent") {
      idx--;
    }
    super(idx === -1 ? _response.value.slice() : _response.value.slice(0, idx));
    this.undoStop = undoStop;
  }
};

var Response = class extends AbstractResponse {
  constructor(value2) {
    super(asArray(value2).map((v2) => "kind" in v2 ? v2 : isMarkdownString(v2) ? { content: v2, kind: "markdownContent" } : { kind: "treeData", treeData: v2 }));
    this._store = new DisposableStore();
    this._onDidChangeValue = this._store.add(new Emitter());
    this._citations = [];
  }
  get onDidChangeValue() {
    return this._onDidChangeValue.event;
  }
  dispose() {
    this._store.dispose();
  }
  clear() {
    this.finalizeReasoningDuration();
    this._responseParts = [];
    this._contentChanged(true);
  }
  clearToPreviousToolInvocation(message) {
    this.finalizeReasoningDuration();
    let lastToolInvocationIndex = -1;
    for (let i2 = this._responseParts.length - 1; i2 >= 0; i2--) {
      const part = this._responseParts[i2];
      if (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") {
        lastToolInvocationIndex = i2;
        break;
      }
    }
    if (lastToolInvocationIndex !== -1) {
      this._responseParts = this._responseParts.slice(0, lastToolInvocationIndex + 1);
    } else {
      this._responseParts = [];
    }
    if (message) {
      this._responseParts.push({ kind: "warning", content: new MarkdownString(message) });
    }
    this._contentChanged(true);
  }
  updateContent(progress, quiet) {
    if (progress.kind !== "thinking") {
      this.finalizeReasoningDuration();
    }
    if (progress.kind === "clearToPreviousToolInvocation") {
      if (progress.reason === 2 /* CopyrightContentRetry */) {
        this.clearToPreviousToolInvocation(localize(12987, null));
      } else if (progress.reason === 1 /* FilteredContentRetry */) {
        this.clearToPreviousToolInvocation(localize(12989, null));
      } else {
        this.clearToPreviousToolInvocation();
      }
      return;
    } else if (progress.kind === "markdownContent") {
      const lastResponsePart = this._responseParts.filter((p) => p.kind !== "textEditGroup" && !isNestedSubagentResponsePart(p)).at(-1);
      if (!lastResponsePart || lastResponsePart.kind !== "markdownContent" || !canMergeMarkdownStrings(lastResponsePart.content, progress.content)) {
        this._responseParts.push(progress);
      } else {
        const idx = this._responseParts.indexOf(lastResponsePart);
        this._responseParts[idx] = { ...lastResponsePart, content: appendMarkdownString(lastResponsePart.content, progress.content) };
      }
      this._contentChanged(quiet);
    } else if (progress.kind === "systemNotification") {
      const lastResponsePart = this._responseParts.at(-1);
      if (lastResponsePart?.kind === "toolInvocation" && IChatToolInvocation.isStreaming(lastResponsePart) && !IChatToolInvocation.isEffectivelyHidden(lastResponsePart)) {
        this._responseParts.splice(this._responseParts.length - 1, 0, progress);
      } else {
        this._responseParts.push(progress);
      }
      this._contentChanged(quiet);
    } else if (progress.kind === "thinking") {
      const lastResponsePart = this._responseParts.filter((p) => p.kind !== "textEditGroup").at(-1);
      const lastText = lastResponsePart && lastResponsePart.kind === "thinking" ? Array.isArray(lastResponsePart.value) ? lastResponsePart.value.join("") : lastResponsePart.value || "" : "";
      const currText = Array.isArray(progress.value) ? progress.value.join("") : progress.value || "";
      const isEmpty = (s) => s.length === 0;
      if (isEmpty(currText)) {
        this.finalizeReasoningDuration();
      } else if (!this._activeReasoning) {
        this._activeReasoning = { part: progress, startedAt: Date.now() };
      }
      if (!lastResponsePart || lastResponsePart.kind !== "thinking" || isEmpty(currText) || isEmpty(lastText) || !canMergeMarkdownStrings(new MarkdownString(lastText), new MarkdownString(currText))) {
        this._responseParts.push(progress);
      } else {
        const idx = this._responseParts.indexOf(lastResponsePart);
        const mergedPart = {
          ...lastResponsePart,
          value: appendMarkdownString(new MarkdownString(lastText), new MarkdownString(currText)).value
        };
        this._responseParts[idx] = mergedPart;
        if (this._activeReasoning?.part === lastResponsePart) {
          this._activeReasoning.part = mergedPart;
        }
      }
      this._contentChanged(quiet);
    } else if (progress.kind === "textEdit" || progress.kind === "notebookEdit") {
      const notebookUri = CellUri.parse(progress.uri)?.notebook;
      const uri5 = notebookUri ?? progress.uri;
      const isExternalEdit = progress.isExternalEdit;
      if (progress.kind === "textEdit" && !notebookUri) {
        this._mergeOrPushTextEditGroup(uri5, progress.edits, progress.done, isExternalEdit);
      } else if (progress.kind === "textEdit") {
        const cellEdits = progress.edits.map((edit3) => ({ uri: progress.uri, edit: edit3 }));
        this._mergeOrPushNotebookEditGroup(uri5, cellEdits, progress.done, isExternalEdit);
      } else {
        this._mergeOrPushNotebookEditGroup(uri5, progress.edits, progress.done, isExternalEdit);
      }
      this._contentChanged(quiet);
    } else if (progress.kind === "progressTask") {
      const responsePosition = this._responseParts.push(progress) - 1;
      this._contentChanged(quiet);
      const disp = progress.onDidAddProgress(() => {
        this._contentChanged(false);
      });
      progress.task?.().then((content2) => {
        disp.dispose();
        if (typeof content2 === "string") {
          this._responseParts[responsePosition].content = new MarkdownString(content2);
        }
        this._contentChanged(false);
      });
    } else if (progress.kind === "toolInvocation") {
      registerAutorunSelfDisposable(this._store, (reader) => {
        progress.state.read(reader);
        this._contentChanged(false);
        if (IChatToolInvocation.isComplete(progress, reader)) {
          reader.dispose();
        }
      });
      this._responseParts.push(progress);
      this._contentChanged(quiet);
    } else if (progress.kind === "externalToolInvocationUpdate") {
      this._handleExternalToolInvocationUpdate(progress);
      this._contentChanged(quiet);
    } else if (progress.kind === "progressMessage" && progress.id !== void 0) {
      const idx = this._responseParts.findIndex((p) => p.kind === "progressMessage" && p.id === progress.id);
      if (idx === -1) {
        this._responseParts.push(progress);
      } else {
        this._responseParts[idx] = progress;
      }
      this._contentChanged(quiet);
    } else if (progress.kind === "autoModeResolution") {
      const idx = this._responseParts.findIndex((p) => p.kind === "autoModeResolution" && !p.resolved);
      if (idx === -1) {
        this._responseParts.push(progress);
      } else {
        this._responseParts[idx] = progress;
      }
      this._contentChanged(quiet);
    } else {
      this._responseParts.push(progress);
      this._contentChanged(quiet);
    }
  }
  /**
   * Persists the duration of the active reasoning interval.
   */
  finalizeReasoningDuration() {
    if (!this._activeReasoning) {
      return;
    }
    this._activeReasoning.part.reasoningDurationMs = Math.max(0, Date.now() - this._activeReasoning.startedAt);
    this._activeReasoning = void 0;
  }
  addCitation(citation) {
    this._citations.push(citation);
    this._contentChanged();
  }
  resolveInlineReference(resolveId, resolvedReference) {
    for (let i2 = 0; i2 < this._responseParts.length; i2++) {
      const current = this._responseParts[i2];
      if (current.kind !== "inlineReference" || current.resolveId !== resolveId) {
        continue;
      }
      this._responseParts[i2] = {
        ...current,
        inlineReference: resolvedReference.inlineReference,
        name: resolvedReference.name ?? current.name
      };
      this._contentChanged();
      return true;
    }
    return false;
  }
  _mergeOrPushTextEditGroup(uri5, edits, done, isExternalEdit) {
    for (const candidate of this._responseParts) {
      if (candidate.kind === "textEditGroup" && !candidate.done && isEqual2(candidate.uri, uri5)) {
        candidate.edits.push(edits);
        candidate.done = done;
        return;
      }
    }
    this._responseParts.push({ kind: "textEditGroup", uri: uri5, edits: [edits], done, isExternalEdit });
  }
  _mergeOrPushNotebookEditGroup(uri5, edits, done, isExternalEdit) {
    for (const candidate of this._responseParts) {
      if (candidate.kind === "notebookEditGroup" && !candidate.done && isEqual2(candidate.uri, uri5)) {
        candidate.edits.push(edits);
        candidate.done = done;
        return;
      }
    }
    this._responseParts.push({ kind: "notebookEditGroup", uri: uri5, edits: [edits], done, isExternalEdit });
  }
  _handleExternalToolInvocationUpdate(progress) {
    const existingInvocation = this._responseParts.findLast(
      (part) => part.kind === "toolInvocation" && part.toolCallId === progress.toolCallId
    );
    if (existingInvocation) {
      if (progress.toolSpecificData !== void 0) {
        existingInvocation.toolSpecificData = progress.toolSpecificData;
      }
      if (progress.isComplete) {
        existingInvocation.didExecuteTool({
          content: [],
          toolResultMessage: progress.pastTenseMessage,
          toolResultError: progress.errorMessage,
          toolResultDetails: progress.resultDetails
        });
      }
      return;
    }
    const toolData = {
      id: progress.toolName,
      source: ToolDataSource.External,
      displayName: progress.toolName,
      modelDescription: progress.toolName
    };
    const invocation = new ChatToolInvocation(
      {
        invocationMessage: progress.invocationMessage,
        pastTenseMessage: progress.pastTenseMessage,
        toolSpecificData: progress.toolSpecificData
      },
      toolData,
      progress.toolCallId,
      progress.subagentInvocationId,
      void 0,
      // parameters
      {},
      void 0
      // chatRequestId
    );
    if (progress.isComplete) {
      if (progress.toolSpecificData !== void 0) {
        invocation.toolSpecificData = progress.toolSpecificData;
      }
      invocation.didExecuteTool({
        content: [],
        toolResultMessage: progress.pastTenseMessage,
        toolResultError: progress.errorMessage,
        toolResultDetails: progress.resultDetails
      });
    }
    this._responseParts.push(invocation);
  }
  computeRepr() {
    let repr = super.computeRepr();
    if (this._citations.length) {
      repr += "\n\n" + getCodeCitationsMessage(this._citations);
    }
    return repr;
  }
  _contentChanged(quiet) {
    this._invalidateRepr();
    if (!quiet) {
      this._onDidChangeValue.fire();
    }
  }
};

function sumModelOutputTokens(modelTotals) {
  return modelTotals?.reduce((total, entry) => total + entry.outputTokens, 0);
}

var ChatResponseModel = class extends Disposable {
  constructor(params) {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._modelState = observableValue(this, { value: 0 /* Pending */ });
    this._usageObs = observableValue(this, void 0);
    this._subagentCopilotCredits = /* @__PURE__ */ new Map();
    this._completionTokenCountObs = observableValue(this, void 0);
    this._shouldBeBlocked = observableValue(this, false);
    this._timingChanged = observableSignal(this);
    this._contentReferences = [];
    this._codeCitations = [];
    this._progressMessages = [];
    this._isStale = false;
    this._session = params.session;
    this._agent = params.agent;
    this._slashCommand = params.slashCommand;
    this.requestId = params.requestId;
    this._timestamp = params.timestamp || Date.now();
    if (params.modelState) {
      this._modelState.set(params.modelState, void 0);
    }
    this._completionTimestamp = params.completionTimestamp === null ? void 0 : params.completionTimestamp ?? (params.modelState && "completedAt" in params.modelState ? params.modelState.completedAt : void 0);
    this._timeSpentWaitingAccumulator = params.timeSpentWaiting || 0;
    this._elapsedMs = params.elapsedMs;
    this._vote = params.vote;
    this._result = params.result;
    this._followups = params.followups ? [...params.followups] : void 0;
    this.isCompleteAddedRequest = params.isCompleteAddedRequest ?? false;
    this._shouldBeRemovedOnSend = params.shouldBeRemovedOnSend;
    this._shouldBeBlocked.set(params.shouldBeBlocked ?? false, void 0);
    this._isStale = Array.isArray(params.responseContent) && (params.responseContent.length !== 0 || isMarkdownString(params.responseContent) && params.responseContent.value.length !== 0);
    this._response = this._register(new Response(params.responseContent));
    this._codeBlockInfos = params.codeBlockInfos ? [...params.codeBlockInfos] : void 0;
    const signal = observableSignalFromEvent(this, this.onDidChange);
    const _pendingInfo = signal.map((_value, r2) => {
      signal.read(r2);
      for (const part of this._response.value) {
        if (part.kind === "toolInvocation") {
          const state = part.state.read(r2);
          if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation) {
            const title = state.confirmationMessages?.title;
            return title ? isMarkdownString(title) ? title.value : title : void 0;
          }
          if (state.type === IChatToolInvocation.StateKind.WaitingForPostApproval) {
            return localize(12991, null);
          }
          if (state.type === IChatToolInvocation.StateKind.WaitingForAuthentication) {
            return localize(12992, null, state.server.name);
          }
        }
        if (part.kind === "confirmation" && !part.isUsed) {
          return part.title;
        }
        if (part.kind === "questionCarousel" && !part.isUsed) {
          return localize(12990, null);
        }
        if (part.kind === "planReview" && !part.isUsed) {
          return localize(12993, null);
        }
        if (part.kind === "elicitation2" && part.state.read(r2) === "pending" /* Pending */) {
          const title = part.title;
          return isMarkdownString(title) ? title.value : title;
        }
      }
      return void 0;
    });
    const _startedWaitingAt = _pendingInfo.map((p) => !!p).map((p) => p ? Date.now() : void 0);
    this.isPendingConfirmation = _startedWaitingAt.map((waiting, r2) => waiting ? { startedWaitingAt: waiting, detail: _pendingInfo.read(r2) } : void 0);
    this.isInProgress = signal.map((_value, r2) => {
      signal.read(r2);
      return !_pendingInfo.read(r2) && !this.shouldBeRemovedOnSend && (this._modelState.read(r2).value === 0 /* Pending */ || this._modelState.read(r2).value === 4 /* NeedsInput */);
    });
    this.isIncomplete = this._modelState.map((state) => {
      return state.value === 0 /* Pending */ || state.value === 4 /* NeedsInput */;
    });
    this._register(this._response.onDidChangeValue(() => this._onDidChange.fire(defaultChatResponseModelChangeReason)));
    this.id = params.restoredId ?? "response_" + generateUuid();
    let lastStartedWaitingAt = void 0;
    this.confirmationAdjustedTimestamp = derived((reader) => {
      this._timingChanged.read(reader);
      const pending = this.isPendingConfirmation.read(reader);
      if (pending) {
        this._modelState.set({ value: 4 /* NeedsInput */ }, void 0);
        if (!lastStartedWaitingAt) {
          lastStartedWaitingAt = pending.startedWaitingAt;
        }
      } else if (lastStartedWaitingAt) {
        if (this._modelState.read(reader).value === 4 /* NeedsInput */) {
          this._modelState.set({ value: 0 /* Pending */ }, void 0);
        }
        this._timeSpentWaitingAccumulator += Date.now() - lastStartedWaitingAt;
        lastStartedWaitingAt = void 0;
      }
      return this._timestamp + this._timeSpentWaitingAccumulator;
    }).recomputeInitiallyAndOnChange(this._store);
  }
  get shouldBeBlocked() {
    return this._shouldBeBlocked;
  }
  get request() {
    return this.session.getRequests().find((r2) => r2.id === this.requestId);
  }
  get session() {
    return this._session;
  }
  get shouldBeRemovedOnSend() {
    return this._shouldBeRemovedOnSend;
  }
  get isHiddenFromTranscript() {
    return this.request?.isHiddenFromTranscript ?? false;
  }
  get isComplete() {
    return this._modelState.get().value !== 0 /* Pending */ && this._modelState.get().value !== 4 /* NeedsInput */;
  }
  get timestamp() {
    return this._timestamp;
  }
  set shouldBeRemovedOnSend(disablement) {
    if (this._shouldBeRemovedOnSend === disablement) {
      return;
    }
    this._shouldBeRemovedOnSend = disablement;
    this._onDidChange.fire(defaultChatResponseModelChangeReason);
  }
  get isCanceled() {
    return this._modelState.get().value === 2 /* Cancelled */;
  }
  get completedAt() {
    const state = this._modelState.get();
    if (state.value === 1 /* Complete */ || state.value === 2 /* Cancelled */ || state.value === 3 /* Failed */) {
      return state.completedAt;
    }
    return void 0;
  }
  get completionTimestamp() {
    return this._completionTimestamp;
  }
  get state() {
    const state = this._modelState.get().value;
    if (state === 1 /* Complete */ && !!this._result?.errorDetails && this.result?.errorDetails?.code !== "canceled") {
      return 3 /* Failed */;
    }
    return state;
  }
  get stateT() {
    return this._modelState.get();
  }
  get vote() {
    return this._vote;
  }
  get followups() {
    return this._followups;
  }
  get entireResponse() {
    return this._finalizedResponse || this._response;
  }
  get result() {
    return this._result;
  }
  get usage() {
    return this._usageObs.get();
  }
  get usageObs() {
    return this._usageObs;
  }
  get completionTokenCount() {
    return this._completionTokenCountObs.get();
  }
  get completionTokenCountObs() {
    return this._completionTokenCountObs;
  }
  get elapsedMs() {
    return this._elapsedMs;
  }
  get username() {
    return this.session.responderUsername;
  }
  get agent() {
    return this._agent;
  }
  get slashCommand() {
    return this._slashCommand;
  }
  get agentOrSlashCommandDetected() {
    return this._agentOrSlashCommandDetected ?? false;
  }
  get usedContext() {
    return this._usedContext;
  }
  get contentReferences() {
    return Array.from(this._contentReferences);
  }
  get codeCitations() {
    return this._codeCitations;
  }
  get progressMessages() {
    return this._progressMessages;
  }
  get isStale() {
    return this._isStale;
  }
  get response() {
    const undoStop = this._shouldBeRemovedOnSend?.afterUndoStop;
    if (!undoStop) {
      return this._finalizedResponse || this._response;
    }
    if (this._responseView?.undoStop !== undoStop) {
      this._responseView = new ResponseView(this._response, undoStop);
    }
    return this._responseView;
  }
  get codeBlockInfos() {
    return this._codeBlockInfos;
  }
  initializeCodeBlockInfos(codeBlockInfo) {
    if (this._codeBlockInfos) {
      throw new BugIndicatingError("Code block infos have already been initialized");
    }
    this._codeBlockInfos = [...codeBlockInfo];
  }
  setBlockedState(isBlocked) {
    this._shouldBeBlocked.set(isBlocked, void 0);
  }
  /**
   * Apply a progress update to the actual response content.
   */
  updateContent(responsePart, quiet) {
    this._response.updateContent(responsePart, quiet);
  }
  resolveInlineReference(resolveId, resolvedReference) {
    return this._response.resolveInlineReference(resolveId, resolvedReference);
  }
  /**
   * Adds an undo stop at the current position in the stream.
   */
  addUndoStop(undoStop) {
    this._onDidChange.fire({ reason: "undoStop", id: undoStop.id });
    this._response.updateContent(undoStop, true);
  }
  /**
   * Apply one of the progress updates that are not part of the actual response content.
   */
  applyReference(progress) {
    if (progress.kind === "usedContext") {
      this._usedContext = progress;
    } else if (progress.kind === "reference") {
      this._contentReferences.push(progress);
      this._onDidChange.fire(defaultChatResponseModelChangeReason);
    }
  }
  applyCodeCitation(progress) {
    this._codeCitations.push(progress);
    this._response.addCitation(progress);
    this._onDidChange.fire(defaultChatResponseModelChangeReason);
  }
  setAgent(agent, slashCommand) {
    this._agent = agent;
    this._slashCommand = slashCommand;
    this._agentOrSlashCommandDetected = !agent.isDefault || !!slashCommand;
    this._onDidChange.fire(defaultChatResponseModelChangeReason);
  }
  setResult(result) {
    if (this.isCanceled && result.errorDetails) {
      const { errorDetails: _errorDetails, ...rest } = result;
      this._result = rest;
    } else {
      this._result = result;
    }
    this._onDidChange.fire(defaultChatResponseModelChangeReason);
  }
  setUsage(usage) {
    this._parentUsage = usage;
    this._setUsage(this._withSubagentCopilotCredits(usage), true);
  }
  setSubagentCopilotCredits(subagentCallId, copilotCredits) {
    const currentCredits = this._subagentCopilotCredits.get(subagentCallId);
    if (!Number.isFinite(copilotCredits) || copilotCredits < 0 || currentCredits !== void 0 && copilotCredits <= currentCredits) {
      return;
    }
    this._subagentCopilotCredits.set(subagentCallId, copilotCredits);
    const usage = this._parentUsage ?? { kind: "usage", promptTokens: 0, completionTokens: 0 };
    this._setUsage(this._withSubagentCopilotCredits(usage), false);
  }
  _withSubagentCopilotCredits(usage) {
    let subagentCopilotCredits = 0;
    for (const credits of this._subagentCopilotCredits.values()) {
      subagentCopilotCredits += credits;
    }
    return subagentCopilotCredits === 0 ? usage : { ...usage, copilotCredits: (usage.copilotCredits ?? 0) + subagentCopilotCredits };
  }
  _setUsage(usage, countCompletionTokens) {
    const currentUsage = this._usageObs.get();
    if (currentUsage && this.isSameUsage(currentUsage, usage)) {
      return;
    }
    const isNewCall = !currentUsage || currentUsage.promptTokens !== usage.promptTokens || currentUsage.completionTokens !== usage.completionTokens || currentUsage.outputBuffer !== usage.outputBuffer;
    this._usageObs.set(usage, void 0);
    const reportedOutputTokens = sumModelOutputTokens(usage.modelTotals);
    if (reportedOutputTokens !== void 0) {
      this._completionTokenCountObs.set(reportedOutputTokens, void 0);
    } else if (countCompletionTokens && isNewCall) {
      const previousCompletionTokens = this._completionTokenCountObs.get() ?? 0;
      this._completionTokenCountObs.set(previousCompletionTokens + usage.completionTokens, void 0);
    }
    this._onDidChange.fire(defaultChatResponseModelChangeReason);
  }
  setElapsedMs(elapsedMs) {
    this._elapsedMs = Math.max(0, elapsedMs);
  }
  isSameUsage(currentUsage, usage) {
    return currentUsage.promptTokens === usage.promptTokens && currentUsage.completionTokens === usage.completionTokens && currentUsage.outputBuffer === usage.outputBuffer && currentUsage.copilotCredits === usage.copilotCredits && currentUsage.sessionCopilotCredits === usage.sessionCopilotCredits && equals4(currentUsage.promptTokenDetails, usage.promptTokenDetails) && equals4(currentUsage.modelTotals, usage.modelTotals);
  }
  complete(completedAt = Date.now()) {
    this._complete(completedAt, completedAt);
  }
  completeWithoutTimestamp() {
    this._complete(Date.now(), void 0);
  }
  reopen() {
    if (!this.isComplete) {
      return;
    }
    this._response.clear();
    if (this._result?.errorDetails) {
      const { errorDetails: _errorDetails, ...result } = this._result;
      this._result = result;
    }
    if (this.completedAt !== void 0) {
      this._timeSpentWaitingAccumulator += Math.max(0, Date.now() - this.completedAt);
      this._timingChanged.trigger(void 0);
    }
    this._completionTimestamp = void 0;
    this._elapsedMs = void 0;
    this._modelState.set({ value: 0 /* Pending */ }, void 0);
    this._onDidChange.fire(defaultChatResponseModelChangeReason);
  }
  _complete(completedAt, completionTimestamp) {
    if (this.isComplete) {
      return;
    }
    if (this._result?.errorDetails?.responseIsRedacted) {
      this._response.clear();
    }
    this._response.finalizeReasoningDuration();
    this._elapsedMs ??= Math.max(0, completedAt - this.confirmationAdjustedTimestamp.get());
    const state = !!this._result?.errorDetails && this._result.errorDetails.code !== "canceled" ? 3 /* Failed */ : 1 /* Complete */;
    this._completionTimestamp = completionTimestamp;
    this._modelState.set({ value: state, completedAt }, void 0);
    this._onDidChange.fire({ reason: "completedRequest" });
  }
  cancel() {
    this._response.finalizeReasoningDuration();
    for (const part of this._response.value) {
      if (part.kind === "toolInvocation" && part instanceof ChatToolInvocation) {
        part.cancelFromStreaming(5 /* Skipped */);
      } else if (part instanceof ChatPlanReviewData) {
        part.dismiss();
      } else if (part instanceof ChatQuestionCarouselData) {
        part.dismiss(void 0);
      }
    }
    const completedAt = Date.now();
    this._elapsedMs ??= Math.max(0, completedAt - this.confirmationAdjustedTimestamp.get());
    this._completionTimestamp = completedAt;
    this._modelState.set({ value: 2 /* Cancelled */, completedAt }, void 0);
    this._onDidChange.fire({ reason: "completedRequest" });
  }
  setFollowups(followups) {
    this._followups = followups;
    this._onDidChange.fire(defaultChatResponseModelChangeReason);
  }
  setVote(vote) {
    this._vote = vote;
    this._onDidChange.fire(defaultChatResponseModelChangeReason);
  }
  setEditApplied(edit3, editCount) {
    if (!this.response.value.includes(edit3)) {
      return false;
    }
    if (!edit3.state) {
      return false;
    }
    edit3.state.applied = editCount;
    this._onDidChange.fire(defaultChatResponseModelChangeReason);
    return true;
  }
  adoptTo(session) {
    this._session = session;
    this._onDidChange.fire(defaultChatResponseModelChangeReason);
  }
  finalizeUndoState() {
    this._finalizedResponse = this.response;
    this._responseView = void 0;
    this._shouldBeRemovedOnSend = void 0;
  }
  dispose() {
    super.dispose();
    this._response.clear();
    if (this._codeBlockInfos) {
      this._codeBlockInfos.length = 0;
    }
  }
  toJSON() {
    const modelState = this._modelState.get();
    const pendingConfirmation = this.isPendingConfirmation.get();
    return {
      responseId: this.id,
      result: this.result,
      responseMarkdownInfo: this.codeBlockInfos?.map((info) => ({ suggestionId: info.suggestionId })),
      followups: this.followups,
      modelState: modelState.value === 0 /* Pending */ || modelState.value === 4 /* NeedsInput */ ? { value: 2 /* Cancelled */, completedAt: Date.now() } : modelState,
      vote: this.vote,
      slashCommand: this.slashCommand,
      usedContext: this.usedContext,
      contentReferences: this.contentReferences,
      codeCitations: this.codeCitations,
      responseTimestamp: this._timestamp,
      timeSpentWaiting: (pendingConfirmation ? Date.now() - pendingConfirmation.startedWaitingAt : 0) + this._timeSpentWaitingAccumulator,
      promptTokens: this.usage?.promptTokens,
      completionTokens: this.completionTokenCount,
      outputBuffer: this.usage?.outputBuffer,
      promptTokenDetails: this.usage?.promptTokenDetails,
      copilotCredits: this.usage?.copilotCredits,
      modelTotals: this.usage?.modelTotals,
      sessionCopilotCredits: this.usage?.sessionCopilotCredits,
      elapsedMs: this.elapsedMs ?? (this.completedAt ? Math.max(0, this.completedAt - this.confirmationAdjustedTimestamp.get()) : void 0)
    };
  }
};

var IntendedModelSlot = class {
  setIntendedModel(selection) {
    this.intendedModel = selection;
  }
};

function reviveSerializableInputState(state) {
  return {
    attachments: (state.attachments ?? []).map(IChatRequestVariableEntry.fromExport),
    mode: state.mode,
    selectedModel: state.selectedModel && {
      identifier: state.selectedModel.identifier,
      metadata: state.selectedModel.metadata
    },
    modelConfiguration: state.selectedModel ? state.selectedModel.modelConfiguration ?? state.modelConfiguration : void 0,
    contrib: state.contrib,
    inputText: state.inputText,
    selections: state.selections,
    permissionLevel: state.permissionLevel
  };
}

function normalizeSerializableChatData(raw) {
  normalizeOldFields(raw);
  if (!("version" in raw)) {
    return {
      version: 3,
      ...raw,
      customTitle: void 0
    };
  }
  if (raw.version === 2) {
    return {
      ...raw,
      version: 3,
      customTitle: raw.computedTitle
    };
  }
  return raw;
}

function normalizeOldFields(raw) {
  if (!raw.sessionId) {
    raw.sessionId = generateUuid();
  }
  if (!raw.creationDate) {
    raw.creationDate = getLastYearDate();
  }
  if (raw.initialLocation === "editing-session") {
    raw.initialLocation = "panel" /* Chat */;
  }
}

function getLastYearDate() {
  const lastYearDate = /* @__PURE__ */ new Date();
  lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
  return lastYearDate.getTime();
}

function isExportableSessionData(obj) {
  return !!obj && Array.isArray(obj.requests) && typeof obj.responderUsername === "string";
}

function extractExportableSessionData(data) {
  return {
    initialLocation: data.initialLocation,
    requests: data.requests,
    responderUsername: data.responderUsername
  };
}

function isSerializableSessionData(obj) {
  const data = obj;
  return isExportableSessionData(obj) && typeof data.creationDate === "number" && typeof data.sessionId === "string" && obj.requests.every(
    (request2) => !request2.usedContext || isIUsedContext(request2.usedContext)
  );
}

var InputModel = class {
  constructor(initialState, logger, sessionId) {
    this.logger = logger;
    this.sessionId = sessionId;
    this._state = observableValueOpts({ debugName: "inputModelState", equalsFn: equals4 }, initialState);
    this.state = this._state;
  }
  get intendedModel() {
    return this._intendedModel;
  }
  setIntendedModel(selection) {
    this._intendedModel = selection;
  }
  setState(state) {
    const current = this._state.get();
    _logChangesToStateModel(state, current, this.logger, this.sessionId);
    this._state.set({
      // If current is undefined, provide defaults for required fields
      attachments: [],
      mode: { id: "agent", kind: "agent" /* Agent */ },
      selectedModel: void 0,
      inputText: "",
      selections: [],
      contrib: {},
      ...current,
      ...state,
      origin: state.origin
    }, void 0);
  }
  clearState() {
    this._state.set(void 0, void 0);
  }
  toJSON() {
    const value2 = this.state.get();
    if (!value2) {
      return void 0;
    }
    const persistableAttachments = value2.attachments.filter((attachment) => {
      if (isStringVariableEntry(attachment)) {
        return false;
      }
      if (isImplicitVariableEntry(attachment) && isStringImplicitContextValue(attachment.value)) {
        return false;
      }
      return true;
    });
    return {
      contrib: value2.contrib,
      attachments: persistableAttachments.map(IChatRequestVariableEntry.toExport),
      mode: value2.mode,
      selectedModel: value2.selectedModel ? {
        identifier: value2.selectedModel.identifier,
        metadata: value2.selectedModel.metadata,
        modelConfiguration: value2.modelConfiguration
      } : void 0,
      inputText: value2.inputText,
      selections: value2.selections,
      permissionLevel: value2.permissionLevel
    };
  }
};

var ChatModel = class extends Disposable {
  constructor(dataRef, initialModelProps, logService, chatAgentService, chatEditingService, chatService) {
    super();
    this.logService = logService;
    this.chatAgentService = chatAgentService;
    this.chatEditingService = chatEditingService;
    this.chatService = chatService;
    this._onDidDispose = this._register(new Emitter());
    this.onDidDispose = this._onDidDispose.event;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._pendingRequests = [];
    this._onDidChangePendingRequests = this._register(new Emitter());
    this.onDidChangePendingRequests = this._onDidChangePendingRequests.event;
    this._isImported = false;
    this._isDeleted = false;
    this._canUseTools = true;
    this.currentEditedFileEvents = new ResourceMap();
    this._checkpoint = void 0;
    const initialData = dataRef?.value;
    const isValidExportedData = isExportableSessionData(initialData);
    const isValidFullData = isValidExportedData && isSerializableSessionData(initialData);
    if (initialData && !isValidExportedData) {
      this.logService.warn(`ChatModel#constructor: Loaded malformed session data: ${JSON.stringify(initialData)}`);
    }
    this._isImported = !!initialData && isValidExportedData && !isValidFullData;
    if (initialModelProps.resource) {
      this._sessionId = chatSessionResourceToId(initialModelProps.resource);
      this._sessionResource = initialModelProps.resource;
    } else if (isValidFullData) {
      this._sessionId = initialData.sessionId;
      this._sessionResource = LocalChatSessionUri.forSession(initialData.sessionId);
    } else {
      this._sessionId = generateUuid();
      this._sessionResource = LocalChatSessionUri.forSession(this._sessionId);
    }
    this._disableBackgroundKeepAlive = initialModelProps.disableBackgroundKeepAlive ?? false;
    this._timestamp = isValidFullData && initialData.creationDate || Date.now();
    this._requests = initialData ? this._deserialize(initialData) : [];
    this._customTitle = isValidFullData ? initialData.customTitle : void 0;
    const serializedInputState = initialModelProps.inputState || (isValidFullData && initialData.inputState ? initialData.inputState : void 0);
    this.inputModel = new InputModel(serializedInputState && reviveSerializableInputState(serializedInputState), this.logService, this._sessionId);
    this.dataSerializer = dataRef?.serializer;
    this._initialResponderUsername = initialData?.responderUsername;
    this._repoData = isValidFullData && initialData.repoData ? initialData.repoData : void 0;
    this._workingDirectory = isValidFullData && initialData.workingDirectory ? URI.parse(initialData.workingDirectory) : void 0;
    if (isValidFullData && initialData.pendingRequests) {
      this._pendingRequests = this._deserializePendingRequests(initialData.pendingRequests);
    }
    this._initialLocation = initialData?.initialLocation ?? initialModelProps.initialLocation;
    this.sessionTypeSelectionReason = initialModelProps.sessionTypeSelectionReason;
    this._canUseTools = initialModelProps.canUseTools;
    this.isReadOnly = initialModelProps.isReadOnly ?? constObservable(false);
    this.lastRequestObs = observableFromEvent(this, this.onDidChange, () => this._requests.at(-1));
    this._register(autorun((reader) => {
      const request2 = this.lastRequestObs.read(reader);
      if (!request2?.response) {
        return;
      }
      reader.store.add(request2.response.onDidChange(async (ev) => {
        if (!this._editingSession || ev.reason !== "completedRequest") {
          return;
        }
        this._onDidChange.fire({ kind: "completedRequest", request: request2 });
      }));
    }));
    this.requestInProgress = this.lastRequestObs.map((request2, r2) => {
      return request2?.response?.isInProgress.read(r2) ?? false;
    });
    this.hasActiveRequest = this.lastRequestObs.map((request2, r2) => {
      return request2?.response?.isIncomplete.read(r2) ?? false;
    });
    this.requestNeedsInput = this.lastRequestObs.map((request2, r2) => {
      const pendingInfo = request2?.response?.isPendingConfirmation.read(r2);
      if (!pendingInfo) {
        return void 0;
      }
      return {
        title: this.title,
        detail: pendingInfo.detail
      };
    });
    if (this.initialLocation === "panel" /* Chat */ && !initialModelProps.disableBackgroundKeepAlive) {
      const selfRef = this._register(new MutableDisposable());
      this._register(autorun((r2) => {
        const inProgress = this.requestInProgress.read(r2);
        const needsInput = this.requestNeedsInput.read(r2);
        const shouldStayAlive = inProgress || !!needsInput;
        if (shouldStayAlive && !selfRef.value) {
          selfRef.value = chatService.acquireExistingSession(this._sessionResource, "ChatModel#requestInProgressKeepAlive");
        } else if (!shouldStayAlive && selfRef.value) {
          selfRef.clear();
        }
      }));
    }
  }
  static getDefaultTitle(requests) {
    const firstRequestMessage = requests.at(0)?.message ?? "";
    const message = typeof firstRequestMessage === "string" ? firstRequestMessage : firstRequestMessage.text;
    return message.split("\n")[0].substring(0, 200);
  }
  get repoData() {
    return this._repoData;
  }
  setRepoData(data) {
    this._repoData = data;
  }
  get workingDirectory() {
    return this._workingDirectory;
  }
  setWorkingDirectory(uri5) {
    this._workingDirectory = uri5;
  }
  getPendingRequests() {
    return this._pendingRequests;
  }
  setPendingRequests(requests) {
    const existingMap = new Map(this._pendingRequests.map((p) => [p.request.id, p]));
    const newPending = [];
    for (const { requestId, kind } of requests) {
      const existing = existingMap.get(requestId);
      if (existing) {
        newPending.push(existing.kind === kind ? existing : { request: existing.request, kind, sendOptions: existing.sendOptions });
      }
    }
    this._pendingRequests.length = 0;
    this._pendingRequests.push(...newPending);
    this._onDidChangePendingRequests.fire();
  }
  /**
   * @internal Used by ChatService to atomically replace the pending request queue.
   */
  replacePendingRequests(requests) {
    if (this._pendingRequests.length === requests.length && requests.every((request2, index2) => this._pendingRequests[index2] === request2)) {
      return;
    }
    this._pendingRequests.length = 0;
    this._pendingRequests.push(...requests);
    this._onDidChangePendingRequests.fire();
  }
  /**
   * @internal Used by ChatService to add a request to the queue.
   * Steering messages are placed before queued messages.
   */
  addPendingRequest(request2, kind, sendOptions) {
    const pendingRequest = {
      request: request2,
      kind,
      sendOptions
    };
    if (kind === "steering" /* Steering */) {
      let insertIndex = 0;
      for (let i2 = 0; i2 < this._pendingRequests.length; i2++) {
        if (this._pendingRequests[i2].kind === "steering" /* Steering */) {
          insertIndex = i2 + 1;
        } else {
          break;
        }
      }
      this._pendingRequests.splice(insertIndex, 0, pendingRequest);
    } else {
      this._pendingRequests.push(pendingRequest);
    }
    this._onDidChangePendingRequests.fire();
    return pendingRequest;
  }
  /**
   * @internal Used by ChatService to remove a pending request
   */
  removePendingRequest(id2) {
    const index2 = this._pendingRequests.findIndex((r2) => r2.request.id === id2);
    if (index2 !== -1) {
      this._pendingRequests.splice(index2, 1);
      this._onDidChangePendingRequests.fire();
    }
  }
  /**
   * @internal Used by ChatService to dequeue the next pending request
   */
  dequeuePendingRequest() {
    const request2 = this._pendingRequests.shift();
    if (request2) {
      this._onDidChangePendingRequests.fire();
    }
    return request2;
  }
  /**
   * @internal Used by ChatService to dequeue all consecutive steering requests at the front of the queue.
   * Returns an empty array if the first pending request is not a steering request.
   */
  dequeueAllSteeringRequests() {
    const steeringRequests = [];
    while (this._pendingRequests.at(0)?.kind === "steering" /* Steering */) {
      steeringRequests.push(this._pendingRequests.shift());
    }
    if (steeringRequests.length > 0) {
      this._onDidChangePendingRequests.fire();
    }
    return steeringRequests;
  }
  /**
   * @internal Used by ChatService to clear all pending requests
   */
  clearPendingRequests() {
    if (this._pendingRequests.length > 0) {
      this._pendingRequests.length = 0;
      this._onDidChangePendingRequests.fire();
    }
  }
  /** @deprecated Use {@link sessionResource} instead */
  get sessionId() {
    return this._sessionId;
  }
  get sessionResource() {
    return this._sessionResource;
  }
  get hasRequests() {
    return this._requests.length > 0;
  }
  get lastRequest() {
    return this._requests.at(-1);
  }
  get sessionCost() {
    let summedCredits = 0;
    let reportedSessionCredits = 0;
    for (const request2 of this._requests) {
      const usage = request2.response?.usage;
      if (typeof usage?.copilotCredits === "number") {
        summedCredits += usage.copilotCredits;
      }
      if (typeof usage?.sessionCopilotCredits === "number") {
        reportedSessionCredits = Math.max(reportedSessionCredits, usage.sessionCopilotCredits);
      }
    }
    return Math.max(summedCredits, reportedSessionCredits);
  }
  get timestamp() {
    return this._timestamp;
  }
  get timing() {
    const lastRequest2 = this._requests.at(-1);
    const lastResponse = lastRequest2?.response;
    const lastRequestStarted = lastRequest2?.timestamp;
    const lastRequestEnded = lastResponse?.completedAt ?? lastResponse?.timestamp;
    return {
      created: this._timestamp,
      lastRequestStarted,
      lastRequestEnded
    };
  }
  get lastMessageDate() {
    return this._requests.at(-1)?.timestamp ?? this._timestamp;
  }
  get _defaultAgent() {
    return this.chatAgentService.getDefaultAgent("panel" /* Chat */, "ask" /* Ask */);
  }
  get responderUsername() {
    return this._defaultAgent?.fullName ?? this._initialResponderUsername ?? "";
  }
  get isImported() {
    return this._isImported;
  }
  get isDeleted() {
    return this._isDeleted;
  }
  markDeleted() {
    this._isDeleted = true;
  }
  get customTitle() {
    return this._customTitle;
  }
  get title() {
    return this._customTitle || ChatModel.getDefaultTitle(this._requests);
  }
  get hasCustomTitle() {
    return this._customTitle !== void 0;
  }
  get editingSession() {
    return this._editingSession;
  }
  get initialLocation() {
    return this._initialLocation;
  }
  get canUseTools() {
    return this._canUseTools;
  }
  get willKeepAlive() {
    return !this._disableBackgroundKeepAlive;
  }
  startEditingSession(isGlobalEditingSession, transferFromSession) {
    const session = this._editingSession ??= this._register(
      transferFromSession ? this.chatEditingService.transferEditingSession(this, transferFromSession) : isGlobalEditingSession ? this.chatEditingService.startOrContinueGlobalEditingSession(this) : this.chatEditingService.createEditingSession(this)
    );
    if (!this._disableBackgroundKeepAlive) {
      const selfRef = this._register(new MutableDisposable());
      this._register(autorun((r2) => {
        const hasModified = session.entries.read(r2).some((e) => e.state.read(r2) === 0 /* Modified */);
        if (hasModified && !selfRef.value) {
          selfRef.value = this.chatService.acquireExistingSession(this._sessionResource, "ChatModel#modifiedEditsKeepAlive");
        } else if (!hasModified && selfRef.value) {
          selfRef.clear();
        }
      }));
    }
    this._register(autorun((reader) => {
      this._setDisabledRequests(session.requestDisablement.read(reader));
    }));
  }
  notifyEditingAction(action) {
    const state = action.outcome === "accepted" ? 1 /* Keep */ : action.outcome === "rejected" ? 2 /* Undo */ : action.outcome === "userModified" ? 3 /* UserModification */ : null;
    if (state === null) {
      return;
    }
    if (!this.currentEditedFileEvents.has(action.uri) || this.currentEditedFileEvents.get(action.uri)?.eventKind === 1 /* Keep */) {
      this.currentEditedFileEvents.set(action.uri, { eventKind: state, uri: action.uri });
    }
  }
  _deserialize(obj) {
    const requests = hasKey(obj, { serializer: true }) ? obj.value.requests : obj.requests;
    if (!Array.isArray(requests)) {
      this.logService.error(`Ignoring malformed session data: ${JSON.stringify(obj)}`);
      return [];
    }
    try {
      return requests.map((r2) => this._deserializeRequest(r2));
    } catch (error) {
      this.logService.error("Failed to parse chat data", error);
      return [];
    }
  }
  _deserializeRequest(raw) {
    const parsedRequest = typeof raw.message === "string" ? this.getParsedRequestFromString(raw.message) : reviveParsedChatRequest(raw.message);
    const variableData = this.reviveVariableData(raw.variableData);
    const requestTimestamp = typeof raw.timestamp === "number" && raw.timestamp > 0 ? raw.timestamp : void 0;
    const request2 = new ChatRequestModel({
      session: this,
      message: parsedRequest,
      variableData,
      timestamp: requestTimestamp,
      fallbackTimestamp: this._timestamp,
      restoredId: raw.requestId,
      confirmation: raw.confirmation,
      editedFileEvents: raw.editedFileEvents,
      modelId: raw.modelId,
      modeInfo: raw.modeInfo,
      isSystemInitiated: raw.isSystemInitiated,
      isHiddenFromTranscript: raw.hiddenFromTranscript,
      systemInitiatedLabel: raw.systemInitiatedLabel,
      terminalExecutionId: raw.terminalExecutionId,
      origin: reviveChatRequestOrigin(raw.origin)
    });
    request2.shouldBeRemovedOnSend = raw.isHidden ? { requestId: raw.requestId } : raw.shouldBeRemovedOnSend;
    if (raw.response || raw.result || raw.responseErrorDetails) {
      const agent = raw.agent && "metadata" in raw.agent ? (
        // Check for the new format, ignore entries in the old format
        reviveSerializedAgent(raw.agent)
      ) : void 0;
      const result = "responseErrorDetails" in raw ? (
        // eslint-disable-next-line local/code-no-dangerous-type-assertions
        { errorDetails: raw.responseErrorDetails }
      ) : raw.result;
      let modelState = raw.modelState || { value: raw.isCanceled ? 2 /* Cancelled */ : 1 /* Complete */, completedAt: Date.now() };
      if (modelState.value === 0 /* Pending */ || modelState.value === 4 /* NeedsInput */) {
        modelState = { value: 2 /* Cancelled */, completedAt: Date.now() };
      }
      if (raw.response) {
        for (const part of raw.response) {
          if (hasKey(part, { kind: true }) && (part.kind === "questionCarousel" || part.kind === "planReview")) {
            part.isUsed = true;
          }
        }
      }
      request2.response = new ChatResponseModel({
        responseContent: raw.response ?? [new MarkdownString(raw.response)],
        session: this,
        agent,
        slashCommand: raw.slashCommand,
        requestId: request2.id,
        modelState,
        completionTimestamp: raw.modelState && "completedAt" in raw.modelState && Number.isFinite(raw.modelState.completedAt) && raw.modelState.completedAt > 0 ? raw.modelState.completedAt : null,
        vote: raw.vote,
        timestamp: typeof raw.responseTimestamp === "number" && raw.responseTimestamp > 0 ? raw.responseTimestamp : requestTimestamp,
        result,
        followups: raw.followups,
        restoredId: raw.responseId,
        timeSpentWaiting: raw.timeSpentWaiting,
        elapsedMs: raw.elapsedMs,
        shouldBeBlocked: request2.shouldBeBlocked.get(),
        codeBlockInfos: raw.responseMarkdownInfo?.map((info) => ({ suggestionId: info.suggestionId }))
      });
      request2.response.shouldBeRemovedOnSend = raw.isHidden ? { requestId: raw.requestId } : raw.shouldBeRemovedOnSend;
      if (typeof raw.completionTokens === "number" || typeof raw.promptTokens === "number" || typeof raw.copilotCredits === "number" || typeof raw.sessionCopilotCredits === "number") {
        request2.response.setUsage({
          kind: "usage",
          promptTokens: raw.promptTokens ?? 0,
          completionTokens: raw.completionTokens ?? 0,
          outputBuffer: raw.outputBuffer,
          promptTokenDetails: raw.promptTokenDetails,
          copilotCredits: raw.copilotCredits,
          modelTotals: raw.modelTotals,
          sessionCopilotCredits: raw.sessionCopilotCredits
        });
      }
      if (raw.usedContext) {
        request2.response.applyReference(revive(raw.usedContext));
      }
      raw.contentReferences?.forEach((r2) => request2.response.applyReference(revive(r2)));
      raw.codeCitations?.forEach((c) => request2.response.applyCodeCitation(revive(c)));
    }
    return request2;
  }
  reviveVariableData(raw) {
    const variableData = raw && Array.isArray(raw.variables) ? raw : { variables: [] };
    variableData.variables = variableData.variables.map(IChatRequestVariableEntry.fromExport);
    return variableData;
  }
  getParsedRequestFromString(message) {
    const parts = [new ChatRequestTextPart(new OffsetRange(0, message.length), { startColumn: 1, startLineNumber: 1, endColumn: 1, endLineNumber: 1 }, message)];
    return {
      text: message,
      parts
    };
  }
  /**
   * Hydrates pending requests from serialized data.
   * For each serialized pending request, finds the matching request model and adds it to the pending queue.
   */
  _deserializePendingRequests(pendingRequests) {
    try {
      return pendingRequests.map((pending) => ({
        id: pending.id,
        request: this._deserializeRequest(pending.request),
        kind: pending.kind,
        sendOptions: {
          ...pending.sendOptions,
          userSelectedTools: pending.sendOptions.userSelectedTools ? constObservable(pending.sendOptions.userSelectedTools) : void 0
        }
      }));
    } catch (e) {
      this.logService.error("Failed to parse pending chat requests", e);
      return [];
    }
  }
  getRequests() {
    return this._requests;
  }
  resetCheckpoint() {
    for (const request2 of this._requests) {
      request2.setShouldBeBlocked(false);
      if (request2.response) {
        request2.response.setBlockedState(false);
      }
    }
  }
  setCheckpoint(requestId) {
    let checkpoint;
    let checkpointIndex = -1;
    if (requestId !== void 0) {
      this._requests.forEach((request2, index2) => {
        if (request2.id === requestId) {
          checkpointIndex = index2;
          checkpoint = request2;
          request2.setShouldBeBlocked(true);
        }
      });
      if (!checkpoint) {
        return;
      }
    }
    for (let i2 = this._requests.length - 1; i2 >= 0; i2 -= 1) {
      const request2 = this._requests[i2];
      if (this._checkpoint && !checkpoint) {
        request2.setShouldBeBlocked(false);
        if (request2.response) {
          request2.response.setBlockedState(false);
        }
      } else if (checkpoint && i2 >= checkpointIndex) {
        request2.setShouldBeBlocked(true);
        if (request2.response) {
          request2.response.setBlockedState(true);
        }
      } else if (checkpoint && i2 < checkpointIndex) {
        request2.setShouldBeBlocked(false);
        if (request2.response) {
          request2.response.setBlockedState(false);
        }
      }
    }
    this._checkpoint = checkpoint;
  }
  get checkpoint() {
    return this._checkpoint;
  }
  _setDisabledRequests(requestIds) {
    this._requests.forEach((request2) => {
      const shouldBeRemovedOnSend = requestIds.find((r2) => r2.requestId === request2.id);
      request2.shouldBeRemovedOnSend = shouldBeRemovedOnSend;
      if (request2.response) {
        request2.response.shouldBeRemovedOnSend = shouldBeRemovedOnSend;
      }
    });
    this._onDidChange.fire({ kind: "setHidden" });
  }
  addRequest(message, variableData, attempt, modeInfo, chatAgent, slashCommand, confirmation, locationData, attachments, isCompleteAddedRequest, modelId, userSelectedTools, id2, isSystemInitiated, systemInitiatedLabel, terminalExecutionId, isTerminalCommand, timestamp, hideFromTranscript, origin, openCodeBranchIntent) {
    const editedFileEvents = [...this.currentEditedFileEvents.values()];
    this.currentEditedFileEvents.clear();
    const requestTimestamp = timestamp === void 0 ? Date.now() : typeof timestamp === "number" && Number.isFinite(timestamp) && timestamp > 0 ? timestamp : void 0;
    const request2 = new ChatRequestModel({
      restoredId: id2,
      session: this,
      message,
      variableData,
      timestamp: requestTimestamp,
      fallbackTimestamp: this._timestamp,
      attempt,
      modeInfo,
      confirmation,
      locationData,
      attachedContext: attachments,
      isCompleteAddedRequest,
      modelId,
      editedFileEvents: editedFileEvents.length ? editedFileEvents : void 0,
      userSelectedTools,
      isSystemInitiated,
      isHiddenFromTranscript: hideFromTranscript,
      systemInitiatedLabel,
      terminalExecutionId,
      isTerminalCommand,
      origin,
      openCodeBranchIntent
    });
    request2.response = new ChatResponseModel({
      responseContent: [],
      session: this,
      agent: chatAgent,
      slashCommand,
      requestId: request2.id,
      isCompleteAddedRequest,
      codeBlockInfos: void 0
    });
    this._requests.push(request2);
    markChat(this.sessionResource, ChatPerfMark.RequestUiUpdated);
    this._onDidChange.fire({ kind: "addRequest", request: request2 });
    return request2;
  }
  setCustomTitle(title) {
    this._customTitle = title;
    this._onDidChange.fire({ kind: "setCustomTitle", title });
  }
  updateRequest(request2, variableData) {
    request2.variableData = variableData;
    this._onDidChange.fire({ kind: "changedRequest", request: request2 });
  }
  adoptRequest(request2) {
    const oldOwner = request2.session;
    const index2 = oldOwner._requests.findIndex((candidate) => candidate.id === request2.id);
    if (index2 === -1) {
      return;
    }
    oldOwner._requests.splice(index2, 1);
    request2.adoptTo(this);
    request2.response?.adoptTo(this);
    this._requests.push(request2);
    oldOwner._onDidChange.fire({ kind: "removeRequest", requestId: request2.id, responseId: request2.response?.id, reason: 2 /* Adoption */ });
    this._onDidChange.fire({ kind: "addRequest", request: request2 });
  }
  acceptResponseProgress(request2, progress, quiet) {
    if (!request2.response) {
      request2.response = new ChatResponseModel({
        responseContent: [],
        session: this,
        requestId: request2.id,
        codeBlockInfos: void 0
      });
    }
    if (request2.response.isComplete) {
      throw new Error("acceptResponseProgress: Adding progress to a completed response");
    }
    if (progress.kind === "usage") {
      request2.response.setUsage(progress);
    } else if (progress.kind === "usedContext" || progress.kind === "reference") {
      request2.response.applyReference(progress);
    } else if (progress.kind === "codeCitation") {
      request2.response.applyCodeCitation(progress);
    } else if (progress.kind === "move") {
      this._onDidChange.fire({ kind: "move", target: progress.uri, range: progress.range });
    } else if (progress.kind === "codeblockUri" && progress.isEdit) {
      request2.response.addUndoStop({ id: progress.undoStopId ?? generateUuid(), kind: "undoStop" });
      request2.response.updateContent(progress, quiet);
    } else if (progress.kind === "progressTaskResult") {
      this.logService.error(`Couldn't handle progress: ${JSON.stringify(progress)}`);
    } else {
      request2.response.updateContent(progress, quiet);
    }
  }
  removeRequest(id2, reason = 0 /* Removal */) {
    const index2 = this._requests.findIndex((request3) => request3.id === id2);
    const request2 = this._requests[index2];
    if (index2 !== -1) {
      this._onDidChange.fire({ kind: "removeRequest", requestId: request2.id, responseId: request2.response?.id, reason });
      this._requests.splice(index2, 1);
      request2.response?.dispose();
    }
  }
  cancelRequest(request2) {
    if (request2.response) {
      request2.response.cancel();
    }
  }
  setResponse(request2, result) {
    if (!request2.response) {
      request2.response = new ChatResponseModel({
        responseContent: [],
        session: this,
        requestId: request2.id,
        codeBlockInfos: void 0
      });
    }
    request2.response.setResult(result);
  }
  setFollowups(request2, followups) {
    if (!request2.response) {
      return;
    }
    request2.response.setFollowups(followups);
  }
  setResponseModel(request2, response) {
    request2.response = response;
    this._onDidChange.fire({ kind: "addResponse", response });
  }
  toExport() {
    return {
      responderUsername: this.responderUsername,
      initialLocation: this.initialLocation,
      requests: this._requests.map((r2) => {
        const message = {
          ...r2.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parts: r2.message.parts.map((p) => p && "toJSON" in p ? p.toJSON() : p)
        };
        const agent = r2.response?.agent;
        const agentJson = agent && "toJSON" in agent ? agent.toJSON() : agent ? { ...agent } : void 0;
        return {
          requestId: r2.id,
          message,
          variableData: IChatRequestVariableData.toExport(r2.variableData),
          response: r2.response ? r2.response.entireResponse.value.filter((item) => item.kind !== "voiceProgress").map((item) => {
            if (item.kind === "treeData") {
              return item.treeData;
            } else if (item.kind === "markdownContent") {
              return item.content;
            } else {
              return item;
            }
          }) : void 0,
          shouldBeRemovedOnSend: r2.shouldBeRemovedOnSend,
          agent: agentJson,
          timestamp: r2.requestTimestamp,
          confirmation: r2.confirmation,
          editedFileEvents: r2.editedFileEvents,
          modelId: r2.modelId,
          modeInfo: r2.modeInfo,
          isSystemInitiated: r2.isSystemInitiated || void 0,
          hiddenFromTranscript: r2.isHiddenFromTranscript || void 0,
          systemInitiatedLabel: r2.systemInitiatedLabel,
          terminalExecutionId: r2.terminalExecutionId,
          origin: r2.origin ? serializeChatRequestOrigin(r2.origin) : void 0,
          ...r2.response?.toJSON()
        };
      })
    };
  }
  toJSON() {
    return {
      version: 3,
      ...this.toExport(),
      sessionId: this.sessionId,
      creationDate: this._timestamp,
      customTitle: this._customTitle,
      inputState: this.inputModel.toJSON(),
      workingDirectory: this._workingDirectory?.toString()
    };
  }
  dispose() {
    this._requests.forEach((r2) => r2.response?.dispose());
    this._onDidDispose.fire();
    super.dispose();
    this._requests.length = 0;
    this.dataSerializer = void 0;
    this._editingSession = void 0;
  }
};

ChatModel = __decorateClass([
  __decorateParam(2, ILogService),
  __decorateParam(3, IChatAgentService),
  __decorateParam(4, IChatEditingService),
  __decorateParam(5, IChatService)
], ChatModel);

function updateRanges(variableData, diff4) {
  return {
    variables: variableData.variables.map((v2) => ({
      ...v2,
      range: v2.range && {
        start: v2.range.start - diff4,
        endExclusive: v2.range.endExclusive - diff4
      }
    }))
  };
}

function canMergeMarkdownStrings(md1, md2) {
  if (md1.baseUri && md2.baseUri) {
    const baseUriEquals = md1.baseUri.scheme === md2.baseUri.scheme && md1.baseUri.authority === md2.baseUri.authority && md1.baseUri.path === md2.baseUri.path && md1.baseUri.query === md2.baseUri.query && md1.baseUri.fragment === md2.baseUri.fragment;
    if (!baseUriEquals) {
      return false;
    }
  } else if (md1.baseUri || md2.baseUri) {
    return false;
  }
  return equals4(md1.isTrusted, md2.isTrusted) && md1.supportHtml === md2.supportHtml && md1.supportThemeIcons === md2.supportThemeIcons;
}

function isNestedSubagentResponsePart(part) {
  return "subAgentInvocationId" in part && !!part.subAgentInvocationId;
}

function appendMarkdownString(md1, md2) {
  const appendedValue = typeof md2 === "string" ? md2 : md2.value;
  return {
    value: md1.value + appendedValue,
    isTrusted: md1.isTrusted,
    supportThemeIcons: md1.supportThemeIcons,
    supportHtml: md1.supportHtml,
    baseUri: md1.baseUri
  };
}

function getCodeCitationsMessage(citations) {
  if (citations.length === 0) {
    return "";
  }
  const licenseTypes = citations.reduce((set, c) => set.add(c.license), /* @__PURE__ */ new Set());
  const label3 = licenseTypes.size === 1 ? localize(12985, null, licenseTypes.size) : localize(12986, null, licenseTypes.size);
  return label3;
}

function serializeSendOptions(options3) {
  return {
    modeInfo: options3.modeInfo,
    userSelectedModelId: options3.userSelectedModelId,
    userSelectedModelConfiguration: options3.userSelectedModelConfiguration,
    userSelectedTools: options3.userSelectedTools?.get(),
    instructionContext: options3.instructionContext,
    location: options3.location,
    locationData: options3.locationData,
    attempt: options3.attempt,
    noCommandDetection: options3.noCommandDetection,
    isVoiceModeInput: options3.isVoiceModeInput,
    agentId: options3.agentId,
    agentIdSilent: options3.agentIdSilent,
    slashCommand: options3.slashCommand,
    confirmation: options3.confirmation,
    isSystemInitiated: options3.isSystemInitiated,
    hideFromTranscript: options3.hideFromTranscript,
    systemInitiatedLabel: options3.systemInitiatedLabel,
    terminalExecutionId: options3.terminalExecutionId
  };
}

var ChatResponseResource;

((ChatResponseResource2) => {
  ChatResponseResource2.scheme = Schemas.vscodeChatResponseResource;
  function createUri(sessionResource, toolCallId, index2, basename3) {
    return URI.from({
      scheme: ChatResponseResource2.scheme,
      authority: encodeHex(VSBuffer.fromString(sessionResource.toString())),
      path: `/tool/${toolCallId}/${index2}` + (basename3 ? `/${basename3}` : "")
    });
  }
  ChatResponseResource2.createUri = createUri;
  function parseUri(uri5) {
    if (uri5.scheme !== ChatResponseResource2.scheme) {
      return void 0;
    }
    const parts = uri5.path.split("/");
    if (parts.length < 4) {
      return void 0;
    }
    const [, kind, toolCallId, index2] = parts;
    if (kind !== "tool") {
      return void 0;
    }
    let sessionResource;
    try {
      sessionResource = URI.parse(decodeHex(uri5.authority).toString());
    } catch (e) {
      if (e instanceof SyntaxError) {
        sessionResource = LocalChatSessionUri.forSession(uri5.authority);
      } else {
        throw e;
      }
    }
    return {
      sessionResource,
      toolCallId,
      index: Number(index2)
    };
  }
  ChatResponseResource2.parseUri = parseUri;
})(ChatResponseResource || (ChatResponseResource = {}));

function _logChangesToStateModel(newState, oldState, logger, sessionId) {
  if (!canLog(logger.getLevel(), 2 /* Debug */) || newState?.selectedModel?.identifier === oldState?.selectedModel?.identifier) {
    return;
  }
  const stack = new Error().stack;
  const message = `[ChatModelChanged] ChatModel Input State model changed: ${newState?.selectedModel?.identifier} (was: ${oldState?.selectedModel?.identifier}) in session ${sessionId} ${stack}`;
  logger.debug(message);
}

function logChangesToStateModel(model, message, newState, oldState, logger) {
  if (!canLog(logger.getLevel(), 2 /* Debug */)) {
    return;
  }
  message = [
    message,
    `model.selectedModel: ${model?.state.get()?.selectedModel?.identifier}`,
    `new state: ${newState?.selectedModel?.identifier}`,
    `old state: ${oldState?.selectedModel?.identifier}`,
    new Error().stack
  ].join(", ");
  logger.debug(`[ChatModelChanged] Chat Model Changed,${message}`);
}
export { getAttachableImageExtension, isCellTextEditOperation, isCellTextEditOperationArray, isChatProgressHistoryResponseContent, toChatHistoryContent, sumModelOutputTokens, reviveSerializableInputState, normalizeSerializableChatData, normalizeOldFields, getLastYearDate, isExportableSessionData, extractExportableSessionData, isSerializableSessionData, updateRanges, canMergeMarkdownStrings, isNestedSubagentResponsePart, appendMarkdownString, getCodeCitationsMessage, serializeSendOptions, _logChangesToStateModel, logChangesToStateModel, CHAT_ATTACHABLE_IMAGE_MIME_TYPES, IChatRequestVariableData, nonHistoryKinds, defaultChatResponseModelChangeReason, ChatRequestModel, AbstractResponse, ResponseView, Response, ChatResponseModel, IntendedModelSlot, InputModel, ChatModel, ChatResponseResource };
