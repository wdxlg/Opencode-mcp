// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/chatLifecycle.ts
import { localize } from "./module-0001.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { isLocalAgentHostTarget, isRemoteAgentHostTarget, isSessionInProgressStatus } from "./module-0960.mjs";
import { AgentSessionProviders } from "./module-0982.mjs";


// src/vs/workbench/contrib/chat/electron-browser/chatLifecycle.ts
function getEffectiveSessionShutdownReason(reason, windowCount, macintosh) {
  return reason === 1 /* CLOSE */ && !macintosh && windowCount === 1 ? 2 /* QUIT */ : reason;
}

async function confirmSessionShutdown(dialogService, reason) {
  let message;
  let detail2;
  switch (reason) {
    case 1 /* CLOSE */:
      message = localize(13602, null);
      detail2 = localize(13601, null);
      break;
    case 4 /* LOAD */:
      message = localize(13600, null);
      detail2 = localize(13599, null);
      break;
    case 3 /* RELOAD */:
      message = localize(13608, null);
      detail2 = localize(13607, null);
      break;
    default:
      message = isMacintosh ? localize(13606, null) : localize(13604, null);
      detail2 = isMacintosh ? localize(13605, null) : localize(13603, null);
      break;
  }
  return (await dialogService.confirm({ message, detail: detail2, custom: true })).confirmed;
}

function shouldWarnForInFlightSessionShutdown(sessionTypes, reason) {
  return reason === 2 /* QUIT */ && sessionTypes.some(isLocalAgentHostTarget);
}

function shouldWarnForSessionShutdown(session, reason) {
  if (!isSessionInProgressStatus(session.status) || session.providerType === AgentSessionProviders.Cloud || session.isArchived()) {
    return false;
  }
  if (isRemoteAgentHostTarget(session.providerType)) {
    return false;
  }
  if (isLocalAgentHostTarget(session.providerType)) {
    return reason === 2 /* QUIT */;
  }
  return true;
}
export { getEffectiveSessionShutdownReason, confirmSessionShutdown, shouldWarnForInFlightSessionShutdown, shouldWarnForSessionShutdown };
