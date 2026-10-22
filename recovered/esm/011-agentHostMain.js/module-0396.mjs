// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codexCompactCommand.ts
import { AgentSession, CODEX_AGENT_PROVIDER_ID } from "./module-0048.mjs";
import { extractLeadingSlashToken, matchesSlashCompletion } from "./module-0298.mjs";
import { toCommandCompletionAttachmentMeta } from "./module-0297.mjs";
import { localize } from "./module-0012.mjs";


// src/vs/platform/agentHost/node/codexCompactCommand.ts
var CODEX_COMPACT_SLASH_COMMAND = "compact";

var CodexCompactCompletionProvider = class {
  constructor(_hasHistory) {
    this._hasHistory = _hasHistory;
    this.kinds = /* @__PURE__ */ new Set(["userMessage" /* UserMessage */]);
    this.triggerCharacters = ["/" /* Slash */];
  }
  async provideCompletionItems(params, _token) {
    if (AgentSession.provider(params.channel) !== CODEX_AGENT_PROVIDER_ID || !this._hasHistory(params.channel)) {
      return [];
    }
    const leading = extractLeadingSlashToken(params.text, params.offset);
    if (!leading || !matchesSlashCompletion(leading.typed, CODEX_COMPACT_SLASH_COMMAND)) {
      return [];
    }
    return [{
      insertText: `/${CODEX_COMPACT_SLASH_COMMAND} `,
      rangeStart: leading.rangeStart,
      rangeEnd: leading.rangeEnd,
      attachment: {
        type: "simple" /* Simple */,
        label: `/${CODEX_COMPACT_SLASH_COMMAND}`,
        _meta: toCommandCompletionAttachmentMeta({
          command: CODEX_COMPACT_SLASH_COMMAND,
          description: localize(2475, null)
        })
      }
    }];
  }
};
export { CODEX_COMPACT_SLASH_COMMAND, CodexCompactCompletionProvider };
