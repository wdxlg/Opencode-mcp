// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/constants.ts
import { Schemas } from "./module-0033.mjs";
import { IChatSessionsService, SessionType, isAgentHostTarget, localChatSessionType } from "./module-0961.mjs";
import { isVirtualWorkspace } from "./module-0937.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IAgentHostEnablementService } from "./module-0964.mjs";
import { clearUserSelectedSessionType, getRememberedSessionType, storeUserSelectedSessionType } from "./module-0963.mjs";
import { product_default } from "./module-0139.mjs";
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { ChatEntitlementContextKeys } from "./module-0954.mjs";
import { IsAuxiliaryWindowContext, IsSessionsWindowContext } from "./module-0950.mjs";


// src/vs/workbench/contrib/chat/common/constants.ts
var ChatModeKind = /* @__PURE__ */ ((ChatModeKind2) => {
  ChatModeKind2["Ask"] = "ask";
  ChatModeKind2["Edit"] = "edit";
  ChatModeKind2["Agent"] = "agent";
  return ChatModeKind2;
})(ChatModeKind || {});

var ChatPermissionLevel = /* @__PURE__ */ ((ChatPermissionLevel6) => {
  ChatPermissionLevel6["Default"] = "default";
  ChatPermissionLevel6["Assisted"] = "assisted";
  ChatPermissionLevel6["AutoApprove"] = "autoApprove";
  ChatPermissionLevel6["Autopilot"] = "autopilot";
  return ChatPermissionLevel6;
})(ChatPermissionLevel || {});

var chatPermissionLevels = new Set(Object.values(ChatPermissionLevel));

function isChatPermissionLevel(level) {
  return chatPermissionLevels.has(level);
}

function getChatPermissionLevelFromDefaultConfiguration(value2) {
  switch (value2) {
    case "manual" /* Manual */:
    case "default" /* Default */:
      return "default" /* Default */;
    case "assisted" /* Assisted */:
      return "assisted" /* Assisted */;
    case "allowAll" /* AllowAll */:
    case "autoApprove" /* AutoApprove */:
      return "autoApprove" /* AutoApprove */;
    default:
      return void 0;
  }
}

function isAutoApproveLevel(level) {
  return level === "autoApprove" /* AutoApprove */ || level === "autopilot" /* Autopilot */;
}

function isAutopilotLevel(level) {
  return level === "autopilot" /* Autopilot */;
}

var ChatAgentLocation = /* @__PURE__ */ ((ChatAgentLocation5) => {
  ChatAgentLocation5["Chat"] = "panel";
  ChatAgentLocation5["Terminal"] = "terminal";
  ChatAgentLocation5["Notebook"] = "notebook";
  ChatAgentLocation5["EditorInline"] = "editor";
  return ChatAgentLocation5;
})(ChatAgentLocation || {});

((ChatAgentLocation5) => {
  function fromRaw(value2) {
    switch (value2) {
      case "panel":
        return "panel" /* Chat */;
      case "terminal":
        return "terminal" /* Terminal */;
      case "notebook":
        return "notebook" /* Notebook */;
      case "editor":
        return "editor" /* EditorInline */;
    }
    return "panel" /* Chat */;
  }
  ChatAgentLocation5.fromRaw = fromRaw;
})(ChatAgentLocation || (ChatAgentLocation = {}));

var chatAlwaysUnsupportedFileSchemes = /* @__PURE__ */ new Set([
  Schemas.vscodeChatEditor,
  // Chat's own read-only resources, such as a pasted-text artifact: their
  // contents already reach the model through the attachment they belong to.
  Schemas.vscodeChatResponseResource,
  Schemas.walkThrough,
  Schemas.vscodeLocalChatSession,
  Schemas.vscodeSettings,
  Schemas.webviewPanel,
  Schemas.vscodeUserData,
  Schemas.extension,
  "ccreq",
  "openai-codex"
  // Codex session custom editor scheme
]);

var chatInputSchemes = [Schemas.vscodeChatInput, Schemas.sessionsChatInput];

function isChatInputModel(uri4) {
  return chatInputSchemes.includes(uri4.scheme);
}

function isSupportedChatFileScheme(accessor, scheme) {
  const chatService = accessor.get(IChatSessionsService);
  if (chatAlwaysUnsupportedFileSchemes.has(scheme)) {
    return false;
  }
  if (chatService.getContentProviderSchemes().includes(scheme)) {
    return false;
  }
  return true;
}

function getComputedDefaultSessionType(configurationService, chatSessionsService, workspace, agentHostEnabled, managedSandboxEnforced = false) {
  if (isVirtualWorkspace(workspace)) {
    return localChatSessionType;
  }
  if (agentHostEnabled && isCopilotHarnessDefault(configurationService, managedSandboxEnforced)) {
    return SessionType.AgentHostCopilot;
  }
  if (isEditorLocalAgentEnabled(configurationService, workspace, agentHostEnabled && managedSandboxEnforced)) {
    return localChatSessionType;
  }
  return getVisibleNonLocalEditorChatSessionTypes(configurationService, chatSessionsService, workspace)[0] ?? localChatSessionType;
}

function isNewChatSessionTypeUsable(sessionType, configurationService, chatSessionsService, workspace, agentHostEnabled = true, managedSandboxEnforced = false) {
  if (sessionType === localChatSessionType) {
    return isEditorLocalAgentEnabled(configurationService, workspace, agentHostEnabled && managedSandboxEnforced);
  }
  if (isAgentHostTarget(sessionType)) {
    return agentHostEnabled;
  }
  return isVisibleEditorChatSessionType(sessionType, configurationService, chatSessionsService, workspace, managedSandboxEnforced);
}

function getLocalFallbackSessionTypeSelectionReason(sessionType, didAcquireSession, inheritedReason) {
  return !didAcquireSession && isAgentHostTarget(sessionType) ? "agentHostUnavailable" : inheritedReason;
}

function getDefaultNewChatSessionType(configurationService, chatSessionsService, storageService, workspace, agentHostEnabled, options3, managedSandboxEnforced = false) {
  return getDefaultNewChatSessionTypeAndReasonFromServices(configurationService, chatSessionsService, storageService, workspace, agentHostEnabled, options3, managedSandboxEnforced).sessionType;
}

function getDefaultNewChatSessionTypeAndReasonFromServices(configurationService, chatSessionsService, storageService, workspace, agentHostEnabled, options3, managedSandboxEnforced = false) {
  if (options3?.explicitOverride) {
    return { sessionType: options3.explicitOverride, selectionReason: "explicitOverride" };
  }
  if (isVirtualWorkspace(workspace)) {
    return { sessionType: localChatSessionType, selectionReason: "virtualWorkspace" };
  }
  const preferCopilotHarness = agentHostEnabled && isCopilotHarnessPreferred(configurationService, managedSandboxEnforced);
  const remembered = getUsableRememberedSessionType(storageService, configurationService, chatSessionsService, workspace, agentHostEnabled, managedSandboxEnforced);
  if (remembered && (remembered !== localChatSessionType || !preferCopilotHarness)) {
    return { sessionType: remembered, selectionReason: "rememberedSelection" };
  }
  let resolved;
  if (options3?.currentSessionType && isNewChatSessionTypeUsable(options3.currentSessionType, configurationService, chatSessionsService, workspace, agentHostEnabled, managedSandboxEnforced)) {
    resolved = { sessionType: options3.currentSessionType, selectionReason: "currentSession" };
  } else if (remembered) {
    resolved = { sessionType: remembered, selectionReason: "rememberedSelection" };
  } else {
    resolved = {
      sessionType: getComputedDefaultSessionType(configurationService, chatSessionsService, workspace, agentHostEnabled, managedSandboxEnforced),
      selectionReason: "computedDefault"
    };
  }
  return resolved.sessionType === localChatSessionType && preferCopilotHarness ? { sessionType: SessionType.AgentHostCopilot, selectionReason: "copilotPreference" } : resolved;
}

function getDefaultNewChatSessionTypeAndReason(accessor, options3) {
  const configurationService = accessor.get(IConfigurationService);
  const chatSessionsService = accessor.get(IChatSessionsService);
  const storageService = accessor.get(IStorageService);
  const workspace = accessor.get(IWorkspaceContextService).getWorkspace();
  const agentHostEnablementService = accessor.get(IAgentHostEnablementService);
  const agentHostEnabled = agentHostEnablementService.enabled.get();
  const managedSandboxEnforced = agentHostEnablementService.managedSandboxEnforced.get();
  return getDefaultNewChatSessionTypeAndReasonFromServices(configurationService, chatSessionsService, storageService, workspace, agentHostEnabled, options3, managedSandboxEnforced);
}

function getUsableRememberedSessionType(storageService, configurationService, chatSessionsService, workspace, agentHostEnabled, managedSandboxEnforced = false) {
  const remembered = getRememberedSessionType(storageService);
  return remembered && isNewChatSessionTypeUsable(remembered, configurationService, chatSessionsService, workspace, agentHostEnabled, managedSandboxEnforced) ? remembered : void 0;
}

function recordUserSelectedSessionType(storageService, configurationService, chatSessionsService, workspace, sessionType, agentHostEnabled) {
  if (sessionType === getComputedDefaultSessionType(configurationService, chatSessionsService, workspace, agentHostEnabled)) {
    clearUserSelectedSessionType(storageService);
  } else {
    storeUserSelectedSessionType(storageService, sessionType);
  }
}

function isCopilotHarnessDefault(configurationService, managedSandboxEnforced = false) {
  return configurationService.getValue("chat.defaultToCopilotHarness" /* DefaultToCopilotHarness */) === true || managedSandboxEnforced;
}

function isCopilotHarnessPreferred(configurationService, managedSandboxEnforced = false) {
  return configurationService.getValue("chat.editor.preferCopilotHarness" /* EditorPreferCopilotHarness */) === true || managedSandboxEnforced;
}

function isEditorLocalAgentEnabled(configurationService, workspace, managedSandboxEnforced = false) {
  if (isVirtualWorkspace(workspace)) {
    return true;
  }
  if (managedSandboxEnforced) {
    return false;
  }
  return configurationService.getValue("chat.editor.localAgent.enabled" /* EditorLocalAgentEnabled */) ?? true;
}

function isVisibleEditorChatSessionType(sessionType, configurationService, chatSessionsService, workspace, managedSandboxEnforced = false, agentHostEnabled = true) {
  if (sessionType === localChatSessionType) {
    return isEditorLocalAgentEnabled(configurationService, workspace, agentHostEnabled && managedSandboxEnforced) || getVisibleNonLocalEditorChatSessionTypes(configurationService, chatSessionsService, workspace).length === 0;
  }
  if (sessionType === SessionType.CopilotCLI) {
    return false;
  }
  return !!chatSessionsService.getChatSessionContribution(sessionType);
}

function getVisibleNonLocalEditorChatSessionTypes(configurationService, chatSessionsService, workspace) {
  const sessionTypes = /* @__PURE__ */ new Set();
  for (const contribution of chatSessionsService.getAllChatSessionContributions()) {
    if (contribution.type !== localChatSessionType && isVisibleEditorChatSessionType(contribution.type, configurationService, chatSessionsService, workspace)) {
      sessionTypes.add(contribution.type);
    }
  }
  return Array.from(sessionTypes);
}

var MANAGE_CHAT_COMMAND_ID = "workbench.action.chat.manage";

var CHAT_OPEN_AGENT_HOST_CHAT_COMMAND_ID = "workbench.action.chat.openAgentHostChat";

var CHAT_SUBAGENT_RESOURCE_QUERY_PARAM = "subagentChatResource";

var OPEN_WORKSPACE_IN_AGENTS_WINDOW_COMMAND_ID = "workbench.action.openWorkspaceInAgentsWindow";

var OPEN_AGENTS_WINDOW_COMMAND_ID = "workbench.action.openAgentsWindow";

var OPENCODE_NATIVE_AGENTS_WINDOW_ENABLED = product_default.opencodeAgentsWindowEnabled !== false;

var OPEN_AGENTS_WINDOW_PRECONDITION = OPENCODE_NATIVE_AGENTS_WINDOW_ENABLED ? ContextKeyExpr.and(
  ChatEntitlementContextKeys.Setup.hidden.negate(),
  ChatEntitlementContextKeys.Setup.disabledInWorkspace.negate(),
  IsSessionsWindowContext.negate(),
  ContextKeyExpr.has(`config.${"chat.agent.enabled" /* AgentEnabled */}`),
  IsAuxiliaryWindowContext.negate()
) : ContextKeyExpr.false();

var ChatEditorTitleMaxLength = 30;

var CONTEXT_MODELS_EDITOR = new RawContextKey("inModelsEditor", false);

var CONTEXT_MODELS_SEARCH_FOCUS = new RawContextKey("inModelsSearch", false);
export { isChatPermissionLevel, getChatPermissionLevelFromDefaultConfiguration, isAutoApproveLevel, isAutopilotLevel, isChatInputModel, isSupportedChatFileScheme, getComputedDefaultSessionType, isNewChatSessionTypeUsable, getLocalFallbackSessionTypeSelectionReason, getDefaultNewChatSessionType, getDefaultNewChatSessionTypeAndReasonFromServices, getDefaultNewChatSessionTypeAndReason, getUsableRememberedSessionType, recordUserSelectedSessionType, isCopilotHarnessDefault, isCopilotHarnessPreferred, isEditorLocalAgentEnabled, isVisibleEditorChatSessionType, getVisibleNonLocalEditorChatSessionTypes, ChatModeKind, ChatPermissionLevel, chatPermissionLevels, ChatAgentLocation, chatAlwaysUnsupportedFileSchemes, chatInputSchemes, MANAGE_CHAT_COMMAND_ID, CHAT_OPEN_AGENT_HOST_CHAT_COMMAND_ID, CHAT_SUBAGENT_RESOURCE_QUERY_PARAM, OPEN_WORKSPACE_IN_AGENTS_WINDOW_COMMAND_ID, OPEN_AGENTS_WINDOW_COMMAND_ID, OPENCODE_NATIVE_AGENTS_WINDOW_ENABLED, OPEN_AGENTS_WINDOW_PRECONDITION, ChatEditorTitleMaxLength, CONTEXT_MODELS_EDITOR, CONTEXT_MODELS_SEARCH_FOCUS };
