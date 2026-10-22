// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { AgentSessionsModel } from "./module-1463.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { IChatService } from "./module-0972.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsService.ts
var AgentSessionsService = class extends Disposable {
  constructor(instantiationService, chatService) {
    super();
    this.instantiationService = instantiationService;
    this.chatService = chatService;
    this._onDidChangeSessionArchivedState = this._register(new Emitter());
    this.onDidChangeSessionArchivedState = this._onDidChangeSessionArchivedState.event;
  }
  get model() {
    if (!this._model) {
      this._model = this._register(this.instantiationService.createInstance(AgentSessionsModel));
      this._register(this._model.onDidChangeSessionArchivedState((session) => {
        if (session.isArchived()) {
          void this.chatService.cancelCurrentRequestForSession(session.resource, "archive");
        }
        this._onDidChangeSessionArchivedState.fire(session);
      }));
      this._model.resolve(
        void 0
        /* all providers */
      );
    }
    return this._model;
  }
  getSession(resource) {
    return this.model.getSession(resource);
  }
};

AgentSessionsService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IChatService)
], AgentSessionsService);

var IAgentSessionsService = createDecorator("agentSessions");
export { AgentSessionsService, IAgentSessionsService };
