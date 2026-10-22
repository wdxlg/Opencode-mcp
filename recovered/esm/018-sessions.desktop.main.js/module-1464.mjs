// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatSessions/chatSessionDescription.ts
import { IChatToolInvocation } from "./module-0973.mjs";
import { localize } from "./module-0001.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";


// src/vs/workbench/contrib/chat/browser/chatSessions/chatSessionDescription.ts
function getInProgressSessionDescription(chatModel) {
  const requests = chatModel.getRequests();
  if (requests.length === 0) {
    return void 0;
  }
  const lastRequest2 = requests.at(-1);
  const response = lastRequest2?.response;
  if (!response) {
    return void 0;
  }
  if (response.isComplete) {
    return void 0;
  }
  const responseParts = response.response.value;
  let description = "";
  for (let i2 = responseParts.length - 1; i2 >= 0; i2--) {
    const part = responseParts[i2];
    if (description) {
      break;
    }
    if (part.kind === "confirmation" && typeof part.message === "string") {
      description = part.message;
    } else if (part.kind === "toolInvocation") {
      const toolInvocation = part;
      if (IChatToolInvocation.isEffectivelyHidden(toolInvocation)) {
        continue;
      }
      const state = toolInvocation.state.get();
      description = toolInvocation.generatedTitle || toolInvocation.pastTenseMessage || toolInvocation.invocationMessage;
      if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation) {
        const confirmationTitle = state.confirmationMessages?.title;
        const titleMessage = confirmationTitle && (typeof confirmationTitle === "string" ? confirmationTitle : confirmationTitle.value);
        const descriptionValue = typeof description === "string" ? description : description.value;
        description = titleMessage ?? localize(11081, null, descriptionValue);
      }
    } else if (part.kind === "toolInvocationSerialized") {
      if (IChatToolInvocation.isEffectivelyHidden(part)) {
        continue;
      }
      description = part.invocationMessage;
    } else if (part.kind === "progressMessage") {
      description = part.content;
    } else if (part.kind === "thinking") {
      description = localize(11080, null);
    }
  }
  return description ? renderAsPlaintext(description, { useLinkFormatter: true }) : "";
}
export { getInProgressSessionDescription };
