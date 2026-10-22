// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionApprovalModel.ts
import { Disposable, DisposableResourceMap } from "./module-0012.mjs";
import { autorun, autorunIterableDelta } from "./module-0052.mjs";
import { observableValue } from "./module-0048.mjs";
import { IChatService, IChatToolInvocation } from "./module-0972.mjs";
import { migrateLegacyTerminalToolSpecificData } from "./module-1188.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionApprovalModel.ts
var AgentSessionApprovalModel = class extends Disposable {
  constructor(_chatService, _languageService) {
    super();
    this._chatService = _chatService;
    this._languageService = _languageService;
    this._approvals = /* @__PURE__ */ new Map();
    this._modelTrackers = this._register(new DisposableResourceMap());
    this._register(autorunIterableDelta(
      (reader) => this._chatService.chatModels.read(reader),
      ({ addedValues, removedValues }) => {
        for (const model of addedValues) {
          this._modelTrackers.set(model.sessionResource, this._trackModel(model));
        }
        for (const model of removedValues) {
          this._modelTrackers.deleteAndDispose(model.sessionResource);
          this._approvals.get(model.sessionResource.toString())?.set(void 0, void 0);
        }
      }
    ));
  }
  getApproval(sessionResource) {
    return this._getOrCreateApproval(sessionResource.toString());
  }
  _getOrCreateApproval(key3) {
    let obs = this._approvals.get(key3);
    if (!obs) {
      obs = observableValue(`sessionApproval.${key3}`, void 0);
      this._approvals.set(key3, obs);
    }
    return obs;
  }
  _trackModel(model) {
    const settable = this._getOrCreateApproval(model.sessionResource.toString());
    const setIfChanged = (value2) => {
      const current = settable.get();
      if (current === value2) {
        return;
      }
      if (current !== void 0 && value2 !== void 0 && current.approvalId === value2.approvalId && current.kind === value2.kind && current.label === value2.label && current.languageId === value2.languageId) {
        return;
      }
      settable.set(value2, void 0);
    };
    return autorun((reader) => {
      const needsInput = model.requestNeedsInput.read(reader);
      if (!needsInput) {
        setIfChanged(void 0);
        return;
      }
      const lastResponse = model.lastRequest?.response;
      if (!lastResponse?.response?.value) {
        setIfChanged(void 0);
        return;
      }
      for (const part of lastResponse.response.value) {
        if (part.kind !== "toolInvocation" || part.toolSpecificData?.kind === "modifiedFilesConfirmation") {
          continue;
        }
        const state = part.state.read(reader);
        if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation || state.type === IChatToolInvocation.StateKind.WaitingForPostApproval) {
          let label3;
          let languageId;
          let kind;
          if (part.toolSpecificData?.kind === "terminal") {
            const terminalData = migrateLegacyTerminalToolSpecificData(part.toolSpecificData);
            label3 = terminalData.presentationOverrides?.commandLine ?? terminalData.commandLine.forDisplay ?? terminalData.commandLine.userEdited ?? terminalData.commandLine.toolEdited ?? terminalData.commandLine.original;
            languageId = this._languageService.getLanguageIdByLanguageName(terminalData.presentationOverrides?.language ?? terminalData.language) ?? void 0;
            kind = "terminal" /* Terminal */;
          } else if (needsInput.detail) {
            label3 = needsInput.detail;
            kind = "question" /* Question */;
          } else {
            const msg = part.invocationMessage;
            label3 = typeof msg === "string" ? msg : renderAsPlaintext(msg);
            kind = "other" /* Other */;
          }
          const confirmState = state;
          setIfChanged({
            approvalId: part.toolCallId,
            kind,
            label: label3,
            languageId,
            since: /* @__PURE__ */ new Date(),
            confirm: () => confirmState.confirm({ type: 4 /* UserAction */ })
          });
          return;
        }
      }
      setIfChanged(void 0);
    });
  }
};

AgentSessionApprovalModel = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, ILanguageService)
], AgentSessionApprovalModel);
export { AgentSessionApprovalModel };
