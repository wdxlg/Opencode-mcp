// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostRenameCommand.ts
import { extractLeadingSlashToken, matchesSlashCompletion } from "./module-0298.mjs";
import { toCommandCompletionAttachmentMeta } from "./module-0297.mjs";
import { localize } from "./module-0012.mjs";


// src/vs/platform/agentHost/node/agentHostRenameCommand.ts
var RENAME_SLASH_COMMAND = "rename";

function parseRenameCommand(prompt) {
  const match2 = /^\/rename(?:$|\s+([\s\S]*))/.exec(prompt);
  if (!match2) {
    return void 0;
  }
  return (match2[1] ?? "").trim();
}

var AgentHostRenameCompletionProvider = class {
  constructor(_hasHistory) {
    this._hasHistory = _hasHistory;
    this.kinds = /* @__PURE__ */ new Set(["userMessage" /* UserMessage */]);
    this.triggerCharacters = ["/" /* Slash */];
  }
  async provideCompletionItems(params, _token) {
    const leading = extractLeadingSlashToken(params.text, params.offset);
    if (!leading) {
      return [];
    }
    if (!this._hasHistory(params.channel)) {
      return [];
    }
    const typed = leading.typed;
    if (!matchesSlashCompletion(typed, RENAME_SLASH_COMMAND)) {
      return [];
    }
    return [{
      insertText: "/" + RENAME_SLASH_COMMAND + " ",
      rangeStart: leading.rangeStart,
      rangeEnd: leading.rangeEnd,
      attachment: {
        type: "simple" /* Simple */,
        label: "/" + RENAME_SLASH_COMMAND,
        _meta: toCommandCompletionAttachmentMeta({
          command: RENAME_SLASH_COMMAND,
          description: localize(2284, null)
        })
      }
    }];
  }
};
export { parseRenameCommand, RENAME_SLASH_COMMAND, AgentHostRenameCompletionProvider };
