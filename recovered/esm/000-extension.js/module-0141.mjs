// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/bridge-conversation-overview-prompt.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/bridge-conversation-overview-prompt.ts
init_define_OPENCODE_BUILD_INFO();
var BRIDGE_CONVERSATION_OVERVIEW_PROMPT = `Conversation overview (Chat/Bridge):
- Use actual model if known, else provider. Never infer from client/tools/URL/goal; do not ask the user or look it up. This names the conversation overview, not the task card.
- overview_session_id is the fixed identity of this conversation: generate one random UUID v4 per conversation (or reuse the one returned in your first set_todos acknowledgement) and send it on every set_todos, including after a reconnect, a re-initialize or a handoff; the newest task of one identity replaces the display of its older cards. After a handoff the successor continues under the predecessor's identity (the acknowledgement returns it). Connections may serve many conversations; never merge by connection, owner or client.
- First update: send overview_model if known, else overview_provider; otherwise omit. Identity is unverified self-report, never authorization proof.
- Same-ID cards inherit first accepted overview title; no ID means no cross-task inheritance. The manual title wins; clearing restores suggestion/fallback. Local Chat uses selected model and conversation hint.`;
export { BRIDGE_CONVERSATION_OVERVIEW_PROMPT };
