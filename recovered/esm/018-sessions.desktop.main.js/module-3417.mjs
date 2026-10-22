// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/telemetry/arcTelemetrySender.ts
import { Disposable } from "./module-0012.mjs";
import { runOnChange } from "./module-0064.mjs";
import { AnnotatedStringEdit } from "./module-0193.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { createDocWithJustReason } from "./module-3410.mjs";
import { ArcTelemetryReporter } from "./module-3415.mjs";
import { forwardToChannelIf, isCopilotLikeExtension } from "./module-0722.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ProviderId } from "./module-0164.mjs";
import { EditDeltaInfo } from "./module-0377.mjs";
import { IAiEditTelemetryService } from "./module-1218.mjs";
import { IRandomService } from "./module-3416.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/telemetry/arcTelemetrySender.ts
var EditTelemetryReportInlineEditArcSender = class extends Disposable {
  constructor(docWithAnnotatedEdits, scmRepoBridge, _instantiationService) {
    super();
    this._instantiationService = _instantiationService;
    this._register(runOnChange(docWithAnnotatedEdits.value, (_val, _prev, changes) => {
      const edit3 = AnnotatedStringEdit.compose(changes.map((c) => c.edit));
      if (!edit3.replacements.some((r2) => r2.data.editSource.metadata.source === "inlineCompletionAccept")) {
        return;
      }
      if (!edit3.replacements.every((r2) => r2.data.editSource.metadata.source === "inlineCompletionAccept")) {
        onUnexpectedError(new Error("ArcTelemetrySender: Not all edits are inline completion accept edits!"));
        return;
      }
      if (edit3.replacements[0].data.editSource.metadata.source !== "inlineCompletionAccept") {
        return;
      }
      const data = edit3.replacements[0].data.editSource.metadata;
      const docWithJustReason = createDocWithJustReason(docWithAnnotatedEdits, this._store);
      const reporter = this._store.add(this._instantiationService.createInstance(ArcTelemetryReporter, [0, 30, 120, 300, 600, 900].map((s) => s * 1e3), _prev, docWithJustReason, scmRepoBridge, edit3, (res) => {
        res.telemetryService.publicLog2("editTelemetry.reportInlineEditArc", {
          extensionId: data.$extensionId ?? "",
          extensionVersion: data.$extensionVersion ?? "",
          opportunityId: data.$$requestUuid ?? "unknown",
          languageId: data.$$languageId,
          correlationId: data.$$correlationId,
          didBranchChange: res.didBranchChange ? 1 : 0,
          timeDelayMs: res.timeDelayMs,
          originalCharCount: res.originalCharCount,
          originalLineCount: res.originalLineCount,
          originalDeletedLineCount: res.originalDeletedLineCount,
          arc: res.arc,
          currentLineCount: res.currentLineCount,
          currentDeletedLineCount: res.currentDeletedLineCount,
          ...forwardToChannelIf(isCopilotLikeExtension(data.$extensionId))
        });
      }, () => {
        this._store.delete(reporter);
      }));
    }));
  }
};

EditTelemetryReportInlineEditArcSender = __decorateClass([
  __decorateParam(2, IInstantiationService)
], EditTelemetryReportInlineEditArcSender);

var CreateSuggestionIdForChatOrInlineChatCaller = class extends Disposable {
  constructor(docWithAnnotatedEdits, _aiEditTelemetryService) {
    super();
    this._aiEditTelemetryService = _aiEditTelemetryService;
    this._register(runOnChange(docWithAnnotatedEdits.value, (_val, _prev, changes) => {
      const edit3 = AnnotatedStringEdit.compose(changes.map((c) => c.edit));
      const supportedSource = /* @__PURE__ */ new Set(["Chat.applyEdits", "inlineChat.applyEdits"]);
      if (!edit3.replacements.some((r2) => supportedSource.has(r2.data.editSource.metadata.source))) {
        return;
      }
      if (!edit3.replacements.every((r2) => supportedSource.has(r2.data.editSource.metadata.source))) {
        onUnexpectedError(new Error(`ArcTelemetrySender: Not all edits are ${edit3.replacements[0].data.editSource.metadata.source}!`));
        return;
      }
      let applyCodeBlockSuggestionId = void 0;
      const data = edit3.replacements[0].data.editSource;
      let feature;
      if (data.metadata.source === "Chat.applyEdits") {
        feature = "sideBarChat";
        if (data.metadata.$$mode === "applyCodeBlock") {
          applyCodeBlockSuggestionId = data.metadata.$$codeBlockSuggestionId;
        }
      } else {
        feature = "inlineChat";
      }
      const providerId = new ProviderId(data.props.$extensionId, data.props.$extensionVersion, data.props.$providerId);
      this._aiEditTelemetryService.createSuggestionId({
        applyCodeBlockSuggestionId,
        languageId: data.props.$$languageId,
        presentation: "highlightedEdit",
        feature,
        source: providerId,
        modelId: data.props.$modelId,
        // eslint-disable-next-line local/code-no-any-casts
        modeId: data.props.$$mode,
        editDeltaInfo: EditDeltaInfo.fromEdit(edit3, _prev),
        sourceRequestId: void 0
      });
    }));
  }
};

CreateSuggestionIdForChatOrInlineChatCaller = __decorateClass([
  __decorateParam(1, IAiEditTelemetryService)
], CreateSuggestionIdForChatOrInlineChatCaller);

var EditTelemetryReportEditArcForChatOrInlineChatSender = class extends Disposable {
  constructor(docWithAnnotatedEdits, scmRepoBridge, _instantiationService, _randomService) {
    super();
    this._instantiationService = _instantiationService;
    this._randomService = _randomService;
    this._register(runOnChange(docWithAnnotatedEdits.value, (_val, _prev, changes) => {
      const edit3 = AnnotatedStringEdit.compose(changes.map((c) => c.edit));
      const supportedSource = /* @__PURE__ */ new Set(["Chat.applyEdits", "inlineChat.applyEdits"]);
      if (!edit3.replacements.some((r2) => supportedSource.has(r2.data.editSource.metadata.source))) {
        return;
      }
      if (!edit3.replacements.every((r2) => supportedSource.has(r2.data.editSource.metadata.source))) {
        onUnexpectedError(new Error(`ArcTelemetrySender: Not all edits are ${edit3.replacements[0].data.editSource.metadata.source}!`));
        return;
      }
      const data = edit3.replacements[0].data.editSource;
      const uniqueEditId = this._randomService.generateUuid();
      const docWithJustReason = createDocWithJustReason(docWithAnnotatedEdits, this._store);
      const reporter = this._store.add(this._instantiationService.createInstance(ArcTelemetryReporter, [0, 60, 300].map((s) => s * 1e3), _prev, docWithJustReason, scmRepoBridge, edit3, (res) => {
        res.telemetryService.publicLog2("editTelemetry.reportEditArc", {
          sourceKeyCleaned: data.toKey(Number.MAX_SAFE_INTEGER, {
            $extensionId: false,
            $extensionVersion: false,
            $$requestUuid: false,
            $$sessionId: false,
            $$requestId: false,
            $$languageId: false,
            $modelId: false
          }),
          extensionId: data.props.$extensionId,
          extensionVersion: data.props.$extensionVersion,
          opportunityId: data.props.$$requestUuid,
          editSessionId: data.props.$$sessionId,
          requestId: data.props.$$requestId,
          modelId: data.props.$modelId,
          languageId: data.props.$$languageId,
          mode: data.props.$$mode,
          uniqueEditId,
          provider: void 0,
          agentSessionId: void 0,
          isSubagentSession: void 0,
          didBranchChange: res.didBranchChange ? 1 : 0,
          timeDelayMs: res.timeDelayMs,
          originalCharCount: res.originalCharCount,
          originalLineCount: res.originalLineCount,
          originalDeletedLineCount: res.originalDeletedLineCount,
          arc: res.arc,
          currentLineCount: res.currentLineCount,
          currentDeletedLineCount: res.currentDeletedLineCount,
          ...forwardToChannelIf(isCopilotLikeExtension(data.props.$extensionId))
        });
      }, () => {
        this._store.delete(reporter);
      }));
    }));
  }
};

EditTelemetryReportEditArcForChatOrInlineChatSender = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IRandomService)
], EditTelemetryReportEditArcForChatOrInlineChatSender);
export { EditTelemetryReportInlineEditArcSender, CreateSuggestionIdForChatOrInlineChatCaller, EditTelemetryReportEditArcForChatOrInlineChatSender };
