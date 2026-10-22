// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatDebugService.ts
import { RawContextKey } from "./module-0089.mjs";
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/common/chatDebugService.ts
var CHAT_DEBUG_HAS_ACTIVE_SESSION = new RawContextKey("chatDebug.hasActiveSession", false);

var CHAT_DEBUG_ACTIVE_SESSION_IS_AGENT_HOST = new RawContextKey("chatDebug.activeSessionIsAgentHost", false);

var IChatDebugService = createDecorator("chatDebugService");
export { CHAT_DEBUG_HAS_ACTIVE_SESSION, CHAT_DEBUG_ACTIVE_SESSION_IS_AGENT_HOST, IChatDebugService };
