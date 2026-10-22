// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/agentHost/common/state/sessionState.ts
import { VSBuffer, decodeBase64, encodeBase64, init_buffer } from "./module-0050.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { __esm } from "./module-0000.mjs";
import { init_arrays } from "./module-0013.mjs";
import { init_types } from "./module-0016.mjs";
import { init_agentToolCallMeta } from "./module-0281.mjs";
import { init_legacyProtocolCompatibility } from "./module-0305.mjs";
import { init_state13 } from "./module-0304.mjs";
import { init_commands9 } from "./module-0314.mjs";


// src/vs/platform/agentHost/common/state/sessionState.ts
function buildSubagentChatUri(sessionUri, toolCallId) {
  const session4 = typeof sessionUri === "string" ? sessionUri : sessionUri.toString();
  const encoded = encodeBase64(VSBuffer.fromString(session4), false, true);
  return `${AHP_CHAT_SCHEME}://${SUBAGENT_CHAT_ID}/${encoded}/${encodeURIComponent(toolCallId)}`;
}

function parseChatUri(uri) {
  let parsed;
  try {
    parsed = typeof uri === "string" ? URI.parse(uri) : uri;
  } catch {
    return void 0;
  }
  if (parsed.scheme !== AHP_CHAT_SCHEME || !parsed.authority) {
    return void 0;
  }
  const encoded = parsed.path.replace(/^\//, "");
  if (!encoded) {
    return void 0;
  }
  try {
    if (parsed.authority === SUBAGENT_CHAT_ID) {
      const [sessionPart, ...toolCallIdParts] = encoded.split("/");
      const toolCallId = toolCallIdParts.join("/");
      if (!sessionPart || !toolCallId) {
        return void 0;
      }
      return { session: decodeBase64(sessionPart).toString(), chatId: `${SUBAGENT_CHAT_ID}/${decodeURIComponent(toolCallId)}` };
    }
    return { session: decodeBase64(encoded).toString(), chatId: parsed.authority };
  } catch {
    return void 0;
  }
}

function parseDefaultChatUri(uri) {
  return parseChatUri(uri)?.session;
}

function parseRequiredSessionUriFromChatUri(uri) {
  const session4 = parseDefaultChatUri(uri);
  if (session4 === void 0) {
    throw new Error(`Malformed AHP chat URI: ${typeof uri === "string" ? uri : uri.toString()}`);
  }
  return session4;
}

var SUBAGENT_URI_SEGMENT, SUBAGENT_URI_MARKER, STATUS_ACTIVITY_MASK, AHP_CHAT_SCHEME, SUBAGENT_CHAT_ID;

var init_sessionState = __esm({
  "src/vs/platform/agentHost/common/state/sessionState.ts"() {
    init_arrays();
    init_buffer();
    init_types();
    init_uri();
    init_agentToolCallMeta();
    init_legacyProtocolCompatibility();
    init_state13();
    init_state13();
    init_commands9();
    init_state13();
    SUBAGENT_URI_SEGMENT = "subagent";
    SUBAGENT_URI_MARKER = `/${SUBAGENT_URI_SEGMENT}/`;
    STATUS_ACTIVITY_MASK = (1 << 5) - 1;
    AHP_CHAT_SCHEME = "ahp-chat";
    SUBAGENT_CHAT_ID = "subagent";
  }
});
export { buildSubagentChatUri, parseChatUri, parseDefaultChatUri, parseRequiredSessionUriFromChatUri, SUBAGENT_URI_SEGMENT, SUBAGENT_URI_MARKER, STATUS_ACTIVITY_MASK, AHP_CHAT_SCHEME, SUBAGENT_CHAT_ID, init_sessionState };
