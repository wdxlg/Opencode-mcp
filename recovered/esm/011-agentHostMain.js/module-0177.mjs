// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostSessionTitleSignal.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { AgentSession } from "./module-0048.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";


// src/vs/platform/agentHost/node/agentHostSessionTitleSignal.ts
var IAgentHostSessionTitleSignal = createDecorator("agentHostSessionTitleSignal");

var AgentHostSessionTitleSignal = class extends Disposable {
  constructor(stateManager) {
    super();
    this._onDidChangeSessionTitle = this._register(new Emitter());
    this.onDidChangeSessionTitle = this._onDidChangeSessionTitle.event;
    this._register(stateManager.onDidChangeSessionTitle(({ session, title }) => {
      const provider = AgentSession.provider(session);
      if (!provider) {
        return;
      }
      this._onDidChangeSessionTitle.fire({
        provider,
        session: URI.parse(session),
        conversationId: AgentSession.id(session),
        title
      });
    }));
  }
};

AgentHostSessionTitleSignal = __decorateClass([
  __decorateParam(0, IAgentHostStateManager)
], AgentHostSessionTitleSignal);
export { IAgentHostSessionTitleSignal, AgentHostSessionTitleSignal };
