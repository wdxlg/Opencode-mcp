// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/sessionTypeAvailability.ts
import { SessionType } from "./module-0961.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/sessionTypeAvailability.ts
function getSessionTypePickerAvailability(type, availability, allowSignedOutWhenUsable, hasSetupBanner) {
  if (!allowSignedOutWhenUsable) {
    return availability;
  }
  if (type === SessionType.AgentHostCopilot && availability === 1 /* SignInRequired */) {
    return 0 /* Available */;
  }
  if (hasSetupBanner && availability === 3 /* NoModels */) {
    return 0 /* Available */;
  }
  return availability;
}

function getSessionTypeAvailability(chatSessionsService, chatEntitlementService, languageModelsService, type, allowSignedOutWhenUsable = false) {
  if (!chatSessionsService.getChatSessionContribution(type)) {
    return 0 /* Available */;
  }
  const entitlement = chatEntitlementService.entitlement;
  const hasTargetedModels = hasAnyModelTargetingSessionType(languageModelsService, type);
  const hasVisibleByokModels = allowSignedOutWhenUsable && chatEntitlementService.clientByokEnabled && hasVisibleByokModelsTargetingSessionType(languageModelsService, type);
  if (entitlement === 1 /* Unknown */ && !chatEntitlementService.anonymous && chatSessionsService.requiresCopilotSignInForSessionType(type) && !hasVisibleByokModels) {
    return 1 /* SignInRequired */;
  }
  if (hasTargetedModels || chatSessionsService.supportsAutoModelForSessionType(type)) {
    return 0 /* Available */;
  }
  const canUpgrade = entitlement === 5 /* Free */ || entitlement === 10 /* EDU */;
  if (canUpgrade) {
    return 2 /* UpgradeRequired */;
  }
  return chatSessionsService.requiresCustomModelsForSessionType(type) ? 3 /* NoModels */ : 0 /* Available */;
}

function hasAnyModelTargetingSessionType(languageModelsService, type) {
  return languageModelsService.getLanguageModelIds().some((id2) => {
    const metadata = languageModelsService.lookupLanguageModel(id2);
    return metadata?.targetChatSessionType === type;
  });
}

function hasVisibleByokModelsTargetingSessionType(languageModelsService, type) {
  return languageModelsService.getLanguageModelIds().some((id2) => {
    const metadata = languageModelsService.lookupLanguageModel(id2);
    const byokIdentifier = metadata?.byokModelIdentifier;
    const byokSource = byokIdentifier ? languageModelsService.lookupLanguageModel(byokIdentifier) : void 0;
    return metadata?.targetChatSessionType === type && byokIdentifier !== void 0 && byokSource?.isBYOK === true && !languageModelsService.isModelHidden(id2) && !languageModelsService.isModelHidden(byokIdentifier);
  });
}

function getSessionTypeUnavailableDescription(availability) {
  switch (availability) {
    case 1 /* SignInRequired */:
      return new MarkdownString(
        localize(9265, null),
        { isTrusted: { enabledCommands: ["workbench.action.chat.triggerSetup"] } }
      );
    case 2 /* UpgradeRequired */:
      return new MarkdownString(
        localize(9268, null),
        { isTrusted: { enabledCommands: ["workbench.action.chat.upgradePlan"] } }
      );
    case 3 /* NoModels */:
      return new MarkdownString(localize(9262, null));
    default:
      return void 0;
  }
}

function getSessionTypeUnavailableHover(availability) {
  switch (availability) {
    case 1 /* SignInRequired */: {
      const hover = new MarkdownString("", { isTrusted: { enabledCommands: ["workbench.action.chat.triggerSetup"] }, supportThemeIcons: true });
      hover.appendMarkdown(localize(9264, null));
      return hover;
    }
    case 2 /* UpgradeRequired */: {
      const hover = new MarkdownString("", { isTrusted: { enabledCommands: ["workbench.action.chat.upgradePlan"] }, supportThemeIcons: true });
      hover.appendMarkdown(localize(9267, null));
      return hover;
    }
    case 3 /* NoModels */:
      return new MarkdownString(localize(9263, null));
    default:
      return void 0;
  }
}

function getSessionTypeUnavailableLabel(availability) {
  switch (availability) {
    case 1 /* SignInRequired */:
      return localize(9266, null);
    case 2 /* UpgradeRequired */:
      return localize(9269, null);
    case 3 /* NoModels */:
      return localize(9262, null);
    default:
      return void 0;
  }
}
export { getSessionTypePickerAvailability, getSessionTypeAvailability, hasAnyModelTargetingSessionType, hasVisibleByokModelsTargetingSessionType, getSessionTypeUnavailableDescription, getSessionTypeUnavailableHover, getSessionTypeUnavailableLabel };
