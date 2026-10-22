// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatService/chatServiceTelemetry.ts
import { ITelemetryService, escapeModelIdForTelemetry } from "./module-0093.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { chatSessionResourceToId, getChatSessionType } from "./module-0961.mjs";
import { isImageVariableEntry } from "./module-0979.mjs";
import { URI } from "./module-0032.mjs";
import { isLocation } from "./module-0164.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";
import { isRemoteAgentHostSessionType, parseRemoteAgentHostHarness } from "./module-0958.mjs";
import { isAgentHostSessionResource } from "./module-0960.mjs";


// src/vs/workbench/contrib/chat/common/chatService/chatServiceTelemetry.ts
var ChatServiceTelemetry = class {
  constructor(telemetryService) {
    this.telemetryService = telemetryService;
  }
  notifyUserAction(action) {
    const isAgentHostSession2 = getIsAgentHostSessionForTelemetry(action.sessionResource);
    if (action.action.kind === "vote") {
      this.telemetryService.publicLog2("interactiveSessionVote", {
        isAgentHostSession: isAgentHostSession2,
        direction: action.action.direction === 1 /* Up */ ? "up" : "down",
        agentId: action.agentId ?? "",
        command: action.command
      });
    } else if (action.action.kind === "copy") {
      this.telemetryService.publicLog2("interactiveSessionCopy", {
        isAgentHostSession: isAgentHostSession2,
        copyKind: action.action.copyKind === 1 /* Action */ ? "action" : "toolbar",
        agentId: action.agentId ?? "",
        command: action.command
      });
    } else if (action.action.kind === "insert") {
      this.telemetryService.publicLog2("interactiveSessionInsert", {
        isAgentHostSession: isAgentHostSession2,
        newFile: !!action.action.newFile,
        agentId: action.agentId ?? "",
        command: action.command
      });
    } else if (action.action.kind === "apply") {
      this.telemetryService.publicLog2("interactiveSessionApply", {
        isAgentHostSession: isAgentHostSession2,
        newFile: !!action.action.newFile,
        codeMapper: action.action.codeMapper,
        agentId: action.agentId ?? "",
        command: action.command,
        editsProposed: !!action.action.editsProposed
      });
    } else if (action.action.kind === "runInTerminal") {
      this.telemetryService.publicLog2("interactiveSessionRunInTerminal", {
        isAgentHostSession: isAgentHostSession2,
        languageId: action.action.languageId ?? "",
        agentId: action.agentId ?? "",
        command: action.command
      });
    } else if (action.action.kind === "followUp") {
      this.telemetryService.publicLog2("chatFollowupClicked", {
        isAgentHostSession: isAgentHostSession2,
        agentId: action.agentId ?? "",
        command: action.command
      });
    } else if (action.action.kind === "chatEditingSessionAction") {
      this.telemetryService.publicLog2("chatEditSession", {
        isAgentHostSession: isAgentHostSession2,
        agentId: action.agentId ?? "",
        outcome: action.action.outcome,
        hasRemainingEdits: action.action.hasRemainingEdits,
        requestId: action.requestId,
        modelId: escapeModelIdForTelemetry(action.modelId) ?? "",
        modeId: action.modeId ?? ""
      });
    } else if (action.action.kind === "chatEditingHunkAction") {
      this.telemetryService.publicLog2("chatEditHunk", {
        isAgentHostSession: isAgentHostSession2,
        agentId: action.agentId ?? "",
        outcome: action.action.outcome,
        lineCount: action.action.lineCount,
        hasRemainingEdits: action.action.hasRemainingEdits,
        requestId: action.requestId,
        modelId: escapeModelIdForTelemetry(action.modelId) ?? "",
        modeId: action.modeId ?? ""
      });
    }
  }
  retrievedFollowups(sessionResource, agentId, command4, numFollowups) {
    this.telemetryService.publicLog2("chatFollowupsRetrieved", {
      isAgentHostSession: getIsAgentHostSessionForTelemetry(sessionResource),
      agentId,
      command: command4,
      numFollowups
    });
  }
};

ChatServiceTelemetry = __decorateClass([
  __decorateParam(0, ITelemetryService)
], ChatServiceTelemetry);

function getCodeBlocks(text2) {
  const lines = text2.split("\n");
  const codeBlockLanguages = [];
  let codeBlockState;
  for (let i2 = 0; i2 < lines.length; i2++) {
    const line = lines[i2];
    if (codeBlockState) {
      if (new RegExp(`^\\s*${codeBlockState.delimiter}\\s*$`).test(line)) {
        codeBlockLanguages.push(codeBlockState.languageId);
        codeBlockState = void 0;
      }
    } else {
      const match2 = line.match(/^(\s*)(`{3,}|~{3,})(\w*)/);
      if (match2) {
        codeBlockState = { delimiter: match2[2], languageId: match2[3] };
      }
    }
  }
  return codeBlockLanguages;
}

var ChatRequestTelemetry = class {
  constructor(opts, telemetryService, languageModelsService) {
    this.opts = opts;
    this.telemetryService = telemetryService;
    this.languageModelsService = languageModelsService;
    this.isComplete = false;
  }
  complete({ timeToFirstProgress, totalTime, result, requestType, request: request2, detectedAgent }) {
    if (this.isComplete) {
      return;
    }
    this.isComplete = true;
    this.telemetryService.publicLog2("interactiveSessionProviderInvoked", {
      requestIndex: this.opts.requestIndex,
      sessionTypeSelectionReason: this.opts.sessionTypeSelectionReason,
      timeToFirstProgress,
      totalTime,
      result,
      requestType,
      requestId: request2.id,
      agent: detectedAgent?.id ?? this.opts.agent.id,
      agentExtensionId: detectedAgent?.extensionId.value ?? this.opts.agent.extensionId.value,
      slashCommand: this.opts.agentSlashCommandPart ? this.opts.agentSlashCommandPart.command.name : this.opts.commandPart?.slashCommand.command,
      chatSessionId: chatSessionResourceToId(this.opts.sessionResource),
      enableCommandDetection: this.opts.enableCommandDetection,
      isParticipantDetected: !!detectedAgent,
      location: this.opts.location,
      citations: request2.response?.codeCitations.length ?? 0,
      numCodeBlocks: getCodeBlocks(request2.response?.response.toString() ?? "").length,
      attachmentKinds: this.attachmentKindsForTelemetry(request2.variableData),
      model: this.resolveModelId(this.opts.options?.userSelectedModelId),
      permissionLevel: this.opts.options?.modeInfo?.kind === "ask" /* Ask */ ? void 0 : this.opts.options?.modeInfo?.permissionLevel,
      chatMode: this.opts.options?.modeInfo?.telemetryModeName ?? this.opts.options?.modeInfo?.telemetryModeId,
      sessionType: getChatSessionTypeForTelemetry(this.opts.sessionResource),
      harness: getHarnessForTelemetry(this.opts.sessionResource),
      isAgentHostSession: getIsAgentHostSessionForTelemetry(this.opts.sessionResource),
      isVirtualWorkspace: this.opts.isVirtualWorkspace,
      settingDefaultToCopilotHarness: this.opts.settingDefaultToCopilotHarness,
      settingPreferCopilotHarness: this.opts.settingPreferCopilotHarness,
      settingLocalAgentEnabled: this.opts.settingLocalAgentEnabled
    });
  }
  attachmentKindsForTelemetry(variableData) {
    return variableData.variables.map((v2) => {
      if (v2.kind === "implicit") {
        return "implicit";
      } else if (v2.range) {
        if (v2.kind === "tool") {
          return "toolInPrompt";
        } else if (v2.kind === "toolset") {
          return "toolsetInPrompt";
        } else {
          return "fileInPrompt";
        }
      } else if (v2.kind === "command") {
        return "command";
      } else if (v2.kind === "symbol") {
        return "symbol";
      } else if (isImageVariableEntry(v2)) {
        return "image";
      } else if (v2.kind === "directory") {
        return "directory";
      } else if (v2.kind === "tool") {
        return "tool";
      } else if (v2.kind === "toolset") {
        return "toolset";
      } else {
        if (URI.isUri(v2.value)) {
          return "file";
        } else if (isLocation(v2.value)) {
          return "location";
        } else {
          return "otherAttachment";
        }
      }
    });
  }
  resolveModelId(userSelectedModelId) {
    return userSelectedModelId && this.languageModelsService.lookupLanguageModel(userSelectedModelId)?.id;
  }
};

ChatRequestTelemetry = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, ILanguageModelsService)
], ChatRequestTelemetry);

function getChatSessionTypeForTelemetry(sessionResource) {
  const sessionType = getChatSessionType(sessionResource);
  return isRemoteAgentHostSessionType(sessionType) ? "remote-agent-host" : sessionType;
}

function getIsAgentHostSessionForTelemetry(sessionResource) {
  return isAgentHostSessionResource(sessionResource);
}

function getHarnessForTelemetry(sessionResource) {
  return parseRemoteAgentHostHarness(getChatSessionType(sessionResource));
}
export { getCodeBlocks, getChatSessionTypeForTelemetry, getIsAgentHostSessionForTelemetry, getHarnessForTelemetry, ChatServiceTelemetry, ChatRequestTelemetry };
