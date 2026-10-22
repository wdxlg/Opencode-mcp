// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/localCommands/renameLocalCommand.ts
import { Disposable } from "./module-0010.mjs";
import { parseRenameCommand } from "./module-0497.mjs";
import { isAhpChatChannel, isDefaultChatUri, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { AGENT_HOST_TITLE_SOURCE_USER, SESSION_CUSTOM_TITLE_KEY, SESSION_CUSTOM_TITLE_SOURCE_KEY, customChatTitleMetadataKey, customChatTitleSourceMetadataKey } from "./module-0482.mjs";
import { generateUuid } from "./module-0042.mjs";
import { localize } from "./module-0012.mjs";
import { LocalChatCommandRegistry } from "./module-0499.mjs";


// src/vs/platform/agentHost/node/localCommands/renameLocalCommand.ts
var RenameLocalCommand = class extends Disposable {
  constructor(_context) {
    super();
    this._context = _context;
    this.name = "rename";
    this.recordsLocalTurn = true;
  }
  tryHandle(request) {
    const title = parseRenameCommand(request.text);
    if (title === void 0) {
      return void 0;
    }
    return { run: async () => this._run(request.turnChannel, request.turnId, title), suggestedTitle: title };
  }
  _run(channel, turnId, title) {
    if (title.length === 0) {
      return;
    }
    const chatTarget = isAhpChatChannel(channel) ? channel : void 0;
    const sessionChannel = isAhpChatChannel(channel) ? parseRequiredSessionUriFromChatUri(channel) : channel;
    if (chatTarget) {
      this._context.updateChatTitle(sessionChannel, chatTarget, title);
      this._context.markTitleRenamed(sessionChannel, chatTarget);
      this._context.persistSessionFlag(sessionChannel, customChatTitleMetadataKey(chatTarget), title);
      this._context.persistSessionFlag(sessionChannel, customChatTitleSourceMetadataKey(chatTarget), AGENT_HOST_TITLE_SOURCE_USER);
      if (isDefaultChatUri(chatTarget)) {
        this._context.dispatch(sessionChannel, { type: "session/titleChanged" /* SessionTitleChanged */, title });
        this._context.markTitleRenamed(sessionChannel);
        this._context.persistSessionFlag(sessionChannel, SESSION_CUSTOM_TITLE_KEY, title);
        this._context.persistSessionFlag(sessionChannel, SESSION_CUSTOM_TITLE_SOURCE_KEY, AGENT_HOST_TITLE_SOURCE_USER);
      }
    } else {
      this._context.dispatch(sessionChannel, { type: "session/titleChanged" /* SessionTitleChanged */, title });
      this._context.markTitleRenamed(sessionChannel);
      this._context.persistSessionFlag(sessionChannel, SESSION_CUSTOM_TITLE_KEY, title);
      this._context.persistSessionFlag(sessionChannel, SESSION_CUSTOM_TITLE_SOURCE_KEY, AGENT_HOST_TITLE_SOURCE_USER);
    }
    this._context.dispatch(channel, {
      type: "chat/responsePart" /* ChatResponsePart */,
      turnId,
      part: {
        kind: "markdown" /* Markdown */,
        id: generateUuid(),
        content: localize(2633, null, title)
      }
    });
  }
};

LocalChatCommandRegistry.register(RenameLocalCommand);
export { RenameLocalCommand };
