// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/voiceClient/voiceConfirmation.ts
import { AskQuestionsToolId } from "./module-2067.mjs";
import { IChatToolInvocation } from "./module-0972.mjs";


// src/vs/workbench/contrib/chat/common/voiceClient/voiceConfirmation.ts
function isVoiceQuestionnaireInvocation(part) {
  return part.kind === "toolInvocation" && part.toolId === AskQuestionsToolId;
}

function isPendingVoiceQuestionnaireInvocation(part) {
  if (!isVoiceQuestionnaireInvocation(part)) {
    return false;
  }
  const state = part.state.get();
  return state.type === IChatToolInvocation.StateKind.WaitingForConfirmation || state.type === IChatToolInvocation.StateKind.WaitingForPostApproval;
}

function getVoiceConfirmationType(parts) {
  for (let index2 = parts.length - 1; index2 >= 0; index2--) {
    const part = parts[index2];
    if (part.kind === "questionCarousel" && !part.isUsed) {
      return "questionnaire";
    }
    if (part.kind === "elicitation2" && part.state.get() === "pending" /* Pending */) {
      return "elicitation";
    }
    if (isPendingVoiceQuestionnaireInvocation(part)) {
      return "questionnaire";
    }
  }
  for (let index2 = parts.length - 1; index2 >= 0; index2--) {
    const part = parts[index2];
    if (part.kind === "planReview" && !part.isUsed) {
      return "plan";
    }
    if (part.kind === "toolInvocation") {
      const state = part.state.get();
      if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation || state.type === IChatToolInvocation.StateKind.WaitingForPostApproval) {
        return "tool";
      }
      if (state.type === IChatToolInvocation.StateKind.WaitingForAuthentication) {
        return "generic";
      }
    }
    if (part.kind === "confirmation" && !part.isUsed) {
      return "generic";
    }
  }
  return void 0;
}
export { isVoiceQuestionnaireInvocation, isPendingVoiceQuestionnaireInvocation, getVoiceConfirmationType };
