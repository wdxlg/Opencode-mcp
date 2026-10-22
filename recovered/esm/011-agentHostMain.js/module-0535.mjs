// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/chatSurface/chatSurfaceContribution.ts
import { Disposable } from "./module-0010.mjs";
import { createEditorInlineChatInstruction, createTerminalChatInstruction } from "./module-0102.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";


// src/vs/platform/agentHost/node/chatContributions/chatSurface/chatSurfaceContribution.ts
var ChatSurfaceContribution = class extends Disposable {
  constructor(_context, _stateManager) {
    super();
    this._context = _context;
    this._stateManager = _stateManager;
    this.order = 300;
  }
  static {
    this.id = "chatSurface";
  }
  onOutgoingTurn(turn) {
    const surface = this._stateManager.getSessionSurfaceMeta(turn.session);
    const instruction = surface?.surface === "terminal" ? createTerminalChatInstruction(surface) : surface?.surface === "editorInline" ? createEditorInlineChatInstruction(surface) : void 0;
    return instruction ? { instructions: [instruction] } : void 0;
  }
};

ChatSurfaceContribution = __decorateClass([
  __decorateParam(1, IAgentHostStateManager)
], ChatSurfaceContribution);
export { ChatSurfaceContribution };
