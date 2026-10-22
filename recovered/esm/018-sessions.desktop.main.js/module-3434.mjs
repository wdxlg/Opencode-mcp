// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/telemetry/aiEditTelemetry/aiEditTelemetryServiceImpl.ts
import { DataChannelForwardingTelemetryService, forwardToChannelIf, isCopilotLikeExtension } from "./module-0722.mjs";
import { EditSuggestionId } from "./module-0377.mjs";
import { escapeModelIdForTelemetry } from "./module-0093.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IRandomService } from "./module-3416.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/telemetry/aiEditTelemetry/aiEditTelemetryServiceImpl.ts
var AiEditTelemetryServiceImpl = class {
  constructor(instantiationService, _randomService) {
    this.instantiationService = instantiationService;
    this._randomService = _randomService;
    this._telemetryService = this.instantiationService.createInstance(DataChannelForwardingTelemetryService);
  }
  createSuggestionId(data) {
    const suggestionId = EditSuggestionId.newId((ns) => this._randomService.generatePrefixedUuid(ns));
    this._telemetryService.publicLog2("editTelemetry.codeSuggested", {
      eventId: this._randomService.generatePrefixedUuid("evt"),
      suggestionId,
      presentation: data.presentation,
      feature: data.feature,
      sourceExtensionId: data.source?.extensionId,
      sourceExtensionVersion: data.source?.extensionVersion,
      sourceProviderId: data.source?.providerId,
      languageId: data.languageId,
      editCharsInserted: data.editDeltaInfo?.charsAdded,
      editCharsDeleted: data.editDeltaInfo?.charsRemoved,
      editLinesInserted: data.editDeltaInfo?.linesAdded,
      editLinesDeleted: data.editDeltaInfo?.linesRemoved,
      modeId: data.modeId,
      modelId: escapeModelIdForTelemetry(data.modelId),
      applyCodeBlockSuggestionId: data.applyCodeBlockSuggestionId,
      sourceRequestId: data.sourceRequestId,
      isAgentHostSession: data.isAgentHostSession,
      ...forwardToChannelIf(isCopilotLikeExtension(data.source?.extensionId))
    });
    return suggestionId;
  }
  handleCodeAccepted(data) {
    this._telemetryService.publicLog2("editTelemetry.codeAccepted", {
      eventId: this._randomService.generatePrefixedUuid("evt"),
      suggestionId: data.suggestionId,
      presentation: data.presentation,
      feature: data.feature,
      sourceExtensionId: data.source?.extensionId,
      sourceExtensionVersion: data.source?.extensionVersion,
      sourceProviderId: data.source?.providerId,
      languageId: data.languageId,
      editCharsInserted: data.editDeltaInfo?.charsAdded,
      editCharsDeleted: data.editDeltaInfo?.charsRemoved,
      editLinesInserted: data.editDeltaInfo?.linesAdded,
      editLinesDeleted: data.editDeltaInfo?.linesRemoved,
      modeId: data.modeId,
      modelId: escapeModelIdForTelemetry(data.modelId),
      applyCodeBlockSuggestionId: data.applyCodeBlockSuggestionId,
      sourceRequestId: data.sourceRequestId,
      isAgentHostSession: data.isAgentHostSession,
      acceptanceMethod: data.acceptanceMethod,
      ...forwardToChannelIf(isCopilotLikeExtension(data.source?.extensionId))
    });
  }
  handleCodeRejected(data) {
    this._telemetryService.publicLog2("editTelemetry.codeRejected", {
      eventId: this._randomService.generatePrefixedUuid("evt"),
      suggestionId: data.suggestionId,
      presentation: data.presentation,
      feature: data.feature,
      sourceExtensionId: data.source?.extensionId,
      sourceExtensionVersion: data.source?.extensionVersion,
      sourceProviderId: data.source?.providerId,
      languageId: data.languageId,
      editCharsInserted: data.editDeltaInfo?.charsAdded,
      editCharsDeleted: data.editDeltaInfo?.charsRemoved,
      editLinesInserted: data.editDeltaInfo?.linesAdded,
      editLinesDeleted: data.editDeltaInfo?.linesRemoved,
      modeId: data.modeId,
      modelId: escapeModelIdForTelemetry(data.modelId),
      applyCodeBlockSuggestionId: data.applyCodeBlockSuggestionId,
      sourceRequestId: data.sourceRequestId,
      isAgentHostSession: data.isAgentHostSession,
      rejectionMethod: data.rejectionMethod,
      ...forwardToChannelIf(isCopilotLikeExtension(data.source?.extensionId))
    });
  }
};

AiEditTelemetryServiceImpl = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IRandomService)
], AiEditTelemetryServiceImpl);
export { AiEditTelemetryServiceImpl };
