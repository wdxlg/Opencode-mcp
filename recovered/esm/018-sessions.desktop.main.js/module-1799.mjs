// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/sessionsAuthGate.ts
import { isWeb } from "./module-0014.mjs";
import { AgentHostAllowSignedOutWhenUsableSettingId } from "./module-1108.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { Event2 } from "./module-0017.mjs";


// src/vs/sessions/browser/sessionsAuthGate.ts
function isAllowSignedOutWhenUsableEnabled(configurationService) {
  return !isWeb && configurationService.getValue(AgentHostAllowSignedOutWhenUsableSettingId) === true;
}

function resolveSignedOutWindowGate(allowSignedOutWhenUsable, authRequirements) {
  if (!allowSignedOutWhenUsable) {
    return 2 /* ForceGitHubSignIn */;
  }
  if (authRequirements.length === 0) {
    return 0 /* Unresolved */;
  }
  return authRequirements.some((requirement) => requirement !== "github" /* GitHub */) ? 1 /* Proceed */ : 2 /* ForceGitHubSignIn */;
}

function shouldShowGitHubWorkspaceGroupSignIn(signedIn, allowSignedOutWhenUsable) {
  return !signedIn && allowSignedOutWhenUsable;
}

function conditionalAuthState(accountResolved, signedIn) {
  if (!accountResolved) {
    return 0 /* Unresolved */;
  }
  return signedIn ? 1 /* SignedIn */ : 2 /* SignedOut */;
}

function observeAllowSignedOutWhenUsable(configurationService) {
  return observableFromEvent(
    Event2.filter(configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration(AgentHostAllowSignedOutWhenUsableSettingId)),
    () => isAllowSignedOutWhenUsableEnabled(configurationService)
  );
}
export { isAllowSignedOutWhenUsableEnabled, resolveSignedOutWindowGate, shouldShowGitHubWorkspaceGroupSignIn, conditionalAuthState, observeAllowSignedOutWhenUsable };
