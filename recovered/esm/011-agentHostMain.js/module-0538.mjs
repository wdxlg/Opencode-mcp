// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/localCommand/localCommandContribution.ts
import { Disposable } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostLocalCommands } from "./module-0499.mjs";
import { IAgentHostSessionTitleController } from "./module-0491.mjs";


// src/vs/platform/agentHost/node/chatContributions/localCommand/localCommandContribution.ts
var LocalCommandContribution = class extends Disposable {
  constructor(_context, _localCommands, _titleController) {
    super();
    this._context = _context;
    this._localCommands = _localCommands;
    this._titleController = _titleController;
    // Run before turn admission so local commands remain available in read-only and archived chats.
    this.order = 50;
  }
  static {
    this.id = "localCommand";
  }
  onIncomingRequest(request) {
    const handled = this._localCommands.tryHandle({
      turnChannel: request.turnChannel,
      turnId: request.turnId,
      text: request.message.text
    });
    if (!handled) {
      return void 0;
    }
    if (handled.suggestedTitle !== void 0) {
      this._titleController.seedProvisionalTitle(request.session, handled.suggestedTitle, request.chat);
    }
    return { kind: "handled" };
  }
};

LocalCommandContribution = __decorateClass([
  __decorateParam(1, IAgentHostLocalCommands),
  __decorateParam(2, IAgentHostSessionTitleController)
], LocalCommandContribution);
export { LocalCommandContribution };
