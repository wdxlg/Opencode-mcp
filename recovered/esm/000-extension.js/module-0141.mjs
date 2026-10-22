// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/bridge-conversation-overview-prompt.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/bridge-conversation-overview-prompt.ts
init_define_OPENCODE_BUILD_INFO();
var BRIDGE_CONVERSATION_OVERVIEW_PROMPT = `Conversation overview (Chat/Bridge):
- Use actual model if known, else provider. Never infer from client/tools/URL/goal; do not ask the user or look it up. This names the conversation overview, not the task card.
- Generate random UUID v4 per conversation; send as overview_session_id on task updates. Connections may serve many conversations. Omit if unavailable; never merge by connection, owner or client.
- First update: send overview_model if known, else overview_provider; otherwise omit. Identity is unverified self-report, never authorization proof.
- Same-ID cards inherit first accepted overview title; no ID means no cross-task inheritance. The manual title wins; clearing restores suggestion/fallback. Local Chat uses selected model and conversation hint.`;
export { BRIDGE_CONVERSATION_OVERVIEW_PROMPT };
