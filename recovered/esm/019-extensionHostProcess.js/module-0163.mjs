// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/chat/common/constants.ts
import { Schemas } from "./module-0026.mjs";
import { product_default } from "./module-0052.mjs";
import { ContextKeyExpr, RawContextKey } from "./module-0049.mjs";
import { ChatEntitlementContextKeys } from "./module-0156.mjs";
import { IsAuxiliaryWindowContext, IsSessionsWindowContext } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/common/constants.ts
var ChatPermissionLevel = /* @__PURE__ */ ((ChatPermissionLevel4) => {
  ChatPermissionLevel4["Default"] = "default";
  ChatPermissionLevel4["Assisted"] = "assisted";
  ChatPermissionLevel4["AutoApprove"] = "autoApprove";
  ChatPermissionLevel4["Autopilot"] = "autopilot";
  return ChatPermissionLevel4;
})(ChatPermissionLevel || {});

var chatPermissionLevels = new Set(Object.values(ChatPermissionLevel));

var ChatAgentLocation = /* @__PURE__ */ ((ChatAgentLocation3) => {
  ChatAgentLocation3["Chat"] = "panel";
  ChatAgentLocation3["Terminal"] = "terminal";
  ChatAgentLocation3["Notebook"] = "notebook";
  ChatAgentLocation3["EditorInline"] = "editor";
  return ChatAgentLocation3;
})(ChatAgentLocation || {});

((ChatAgentLocation3) => {
  function fromRaw(value) {
    switch (value) {
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
  ChatAgentLocation3.fromRaw = fromRaw;
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

var OPENCODE_NATIVE_AGENTS_WINDOW_ENABLED = product_default.opencodeAgentsWindowEnabled !== false;

var OPEN_AGENTS_WINDOW_PRECONDITION = OPENCODE_NATIVE_AGENTS_WINDOW_ENABLED ? ContextKeyExpr.and(
  ChatEntitlementContextKeys.Setup.hidden.negate(),
  ChatEntitlementContextKeys.Setup.disabledInWorkspace.negate(),
  IsSessionsWindowContext.negate(),
  ContextKeyExpr.has(`config.${"chat.agent.enabled" /* AgentEnabled */}`),
  IsAuxiliaryWindowContext.negate()
) : ContextKeyExpr.false();

var CONTEXT_MODELS_EDITOR = new RawContextKey("inModelsEditor", false);

var CONTEXT_MODELS_SEARCH_FOCUS = new RawContextKey("inModelsSearch", false);
export { ChatPermissionLevel, chatPermissionLevels, ChatAgentLocation, chatAlwaysUnsupportedFileSchemes, chatInputSchemes, OPENCODE_NATIVE_AGENTS_WINDOW_ENABLED, OPEN_AGENTS_WINDOW_PRECONDITION, CONTEXT_MODELS_EDITOR, CONTEXT_MODELS_SEARCH_FOCUS };
