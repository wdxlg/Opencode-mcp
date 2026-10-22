// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/agentsVoice/common/agentsVoice.ts
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/agentsVoice/common/agentsVoice.ts
var AGENTS_VOICE_CONNECTED = new RawContextKey("agentsVoiceConnected", false);

var AGENTS_VOICE_CONNECTING = new RawContextKey("agentsVoiceConnecting", false);

var AGENTS_VOICE_RECONNECTING = new RawContextKey("agentsVoiceReconnecting", false);

var AGENTS_VOICE_LISTENING = new RawContextKey("agentsVoiceListening", false);

var AGENTS_VOICE_ENTITLED = new RawContextKey("agentsVoiceEntitled", false);

var AGENTS_VOICE_ENABLED = ContextKeyExpr.and(
  ChatContextKeys.enabled,
  ContextKeyExpr.equals("config.agents.voice.enabled", true),
  AGENTS_VOICE_ENTITLED
);

var IAgentsVoiceWindowService = createDecorator("agentsVoiceWindowService");
export { AGENTS_VOICE_CONNECTED, AGENTS_VOICE_CONNECTING, AGENTS_VOICE_RECONNECTING, AGENTS_VOICE_LISTENING, AGENTS_VOICE_ENTITLED, AGENTS_VOICE_ENABLED, IAgentsVoiceWindowService };
