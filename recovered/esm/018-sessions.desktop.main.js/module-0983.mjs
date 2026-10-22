// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentSessions.ts
import { SessionType, isAgentHostTarget } from "./module-0961.mjs";
import { URI } from "./module-0032.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { registerColor, transparent } from "./module-0226.mjs";
import { foreground } from "./module-0227.mjs";
import { listActiveSelectionForeground } from "./module-0232.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentSessions.ts
var AgentSessionProviders = ((AgentSessionProviders2) => {
  AgentSessionProviders2[AgentSessionProviders2["Local"] = SessionType.Local] = "Local";
  AgentSessionProviders2[AgentSessionProviders2["Background"] = SessionType.CopilotCLI] = "Background";
  AgentSessionProviders2[AgentSessionProviders2["Cloud"] = SessionType.CopilotCloud] = "Cloud";
  AgentSessionProviders2[AgentSessionProviders2["Codex"] = SessionType.Codex] = "Codex";
  AgentSessionProviders2[AgentSessionProviders2["Growth"] = SessionType.Growth] = "Growth";
  AgentSessionProviders2[AgentSessionProviders2["AgentHostCopilot"] = SessionType.AgentHostCopilot] = "AgentHostCopilot";
  AgentSessionProviders2[AgentSessionProviders2["AgentHostClaude"] = SessionType.AgentHostClaude] = "AgentHostClaude";
  AgentSessionProviders2[AgentSessionProviders2["AgentHostCodex"] = SessionType.AgentHostCodex] = "AgentHostCodex";
  return AgentSessionProviders2;
})(AgentSessionProviders || {});

function isBuiltInAgentSessionProvider(provider) {
  return provider === AgentSessionProviders.Local || provider === AgentSessionProviders.Background || provider === AgentSessionProviders.Cloud;
}

function getAgentSessionProvider(sessionResource) {
  const type = URI.isUri(sessionResource) ? getChatSessionType(sessionResource) : sessionResource;
  switch (type) {
    case AgentSessionProviders.Local:
    case AgentSessionProviders.Background:
    case AgentSessionProviders.Cloud:
    case AgentSessionProviders.Codex:
    case AgentSessionProviders.AgentHostCopilot:
    case AgentSessionProviders.AgentHostClaude:
    case AgentSessionProviders.AgentHostCodex:
      return type;
    default:
      return void 0;
  }
}

function getAgentSessionProviderName(provider) {
  switch (provider) {
    case AgentSessionProviders.Local:
      return localize(9081, null);
    case AgentSessionProviders.Background:
      return localize(9079, null);
    case AgentSessionProviders.Cloud:
      return localize(9080, null);
    case AgentSessionProviders.AgentHostClaude:
      return "Claude";
    case AgentSessionProviders.Codex:
    case AgentSessionProviders.AgentHostCodex:
      return "Codex";
    case AgentSessionProviders.Growth:
      return "Growth";
    case AgentSessionProviders.AgentHostCopilot:
      return localize(9078, null);
    default:
      return provider;
  }
}

function getAgentSessionProviderIcon(provider) {
  switch (provider) {
    case AgentSessionProviders.Local:
      return Codicon.vm;
    case AgentSessionProviders.Background:
      return Codicon.copilot;
    case AgentSessionProviders.Cloud:
      return Codicon.cloud;
    case AgentSessionProviders.Codex:
    case AgentSessionProviders.AgentHostCodex:
      return Codicon.openai;
    case AgentSessionProviders.AgentHostClaude:
      return Codicon.claude;
    case AgentSessionProviders.Growth:
      return Codicon.lightbulb;
    case AgentSessionProviders.AgentHostCopilot:
      return Codicon.vm;
    default:
      return Codicon.extensions;
  }
}

function isFirstPartyAgentSessionProvider(provider) {
  switch (provider) {
    case AgentSessionProviders.Local:
    case AgentSessionProviders.Background:
    case AgentSessionProviders.Cloud:
    case AgentSessionProviders.AgentHostCopilot:
      return true;
    case AgentSessionProviders.AgentHostClaude:
    case AgentSessionProviders.Codex:
    case AgentSessionProviders.AgentHostCodex:
    case AgentSessionProviders.Growth:
      return false;
    default:
      return false;
  }
}

var CHAT_DELEGATE_TO_AGENT_HOST_SESSION_COMMAND_ID = "workbench.action.chat.delegateToAgentHostSession";

function getAgentCanContinueIn(provider) {
  switch (provider) {
    case AgentSessionProviders.Local:
      return false;
    case AgentSessionProviders.Background:
    case AgentSessionProviders.Cloud:
    case AgentSessionProviders.AgentHostCopilot:
      return true;
    case AgentSessionProviders.Codex:
    case AgentSessionProviders.Growth:
      return false;
    default:
      return isAgentHostTarget(provider);
  }
}

function getAgentSessionProviderDescription(provider) {
  switch (provider) {
    case AgentSessionProviders.Local:
      return localize(9077, null);
    case AgentSessionProviders.Background:
      return localize(9072, null);
    case AgentSessionProviders.Cloud:
      return localize(9074, null);
    case AgentSessionProviders.AgentHostClaude:
      return localize(9073, null);
    case AgentSessionProviders.Codex:
      return localize(9075, null);
    case AgentSessionProviders.AgentHostCodex:
      return localize(9070, null);
    case AgentSessionProviders.Growth:
      return localize(9076, null);
    case AgentSessionProviders.AgentHostCopilot:
      return localize(9071, null);
    default:
      return "";
  }
}

var agentSessionReadIndicatorForeground = registerColor(
  "agentSessionReadIndicator.foreground",
  { dark: transparent(foreground, 0.2), light: transparent(foreground, 0.2), hcDark: null, hcLight: null },
  localize(9067, null)
);

var agentSessionSelectedBadgeBorder = registerColor(
  "agentSessionSelectedBadge.border",
  { dark: transparent(listActiveSelectionForeground, 0.3), light: transparent(listActiveSelectionForeground, 0.3), hcDark: foreground, hcLight: foreground },
  localize(9068, null)
);

var agentSessionSelectedUnfocusedBadgeBorder = registerColor(
  "agentSessionSelectedUnfocusedBadge.border",
  { dark: transparent(foreground, 0.3), light: transparent(foreground, 0.3), hcDark: foreground, hcLight: foreground },
  localize(9069, null)
);

var AGENT_SESSION_RENAME_ACTION_ID = "agentSession.rename";

var AGENT_SESSION_DELETE_ACTION_ID = "agentSession.delete";
export { isBuiltInAgentSessionProvider, getAgentSessionProvider, getAgentSessionProviderName, getAgentSessionProviderIcon, isFirstPartyAgentSessionProvider, getAgentCanContinueIn, getAgentSessionProviderDescription, AgentSessionProviders, CHAT_DELEGATE_TO_AGENT_HOST_SESSION_COMMAND_ID, agentSessionReadIndicatorForeground, agentSessionSelectedBadgeBorder, agentSessionSelectedUnfocusedBadgeBorder, AGENT_SESSION_RENAME_ACTION_ID, AGENT_SESSION_DELETE_ACTION_ID };
