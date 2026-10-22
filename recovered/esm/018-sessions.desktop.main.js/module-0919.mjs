// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/agentEditorComments/common/agentEditorComments.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/agentEditorComments/common/agentEditorComments.ts
var IAgentEditorCommentsBridge = createDecorator("agentEditorCommentsBridge");

var AgentEditorCommentsBridge = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidChangeComments = this._register(new Emitter());
    this.onDidChangeComments = this._onDidChangeComments.event;
    this._onDidRevealComment = this._register(new Emitter());
    this.onDidRevealComment = this._onDidRevealComment.event;
    this._providers = [];
  }
  registerProvider(provider) {
    const entry = {
      provider,
      listener: combinedDisposable(
        provider.onDidChangeComments(() => this._onDidChangeComments.fire()),
        provider.onDidRevealComment((event) => {
          if (this._getProvider(event.resource) === provider) {
            this._onDidRevealComment.fire(event);
          }
        })
      )
    };
    this._providers.push(entry);
    this._onDidChangeComments.fire();
    return toDisposable(() => {
      const index2 = this._providers.indexOf(entry);
      if (index2 !== -1) {
        this._providers.splice(index2, 1);
        entry.listener.dispose();
        this._onDidChangeComments.fire();
      }
    });
  }
  acceptsComments(resource) {
    return !!this._getProvider(resource);
  }
  getComments(resource, includeRelated = false) {
    const comments = this._getProvider(resource)?.getComments(resource, includeRelated) ?? [];
    return includeRelated ? comments : comments.filter((comment) => isEqual2(comment.resource, resource));
  }
  getCommentIds(resource, includeRelated = false) {
    const provider = this._getProvider(resource);
    return provider?.getCommentIds?.(resource, includeRelated) ?? provider?.getComments(resource, includeRelated).map((comment) => comment.id) ?? [];
  }
  addComment(resource, range2, body) {
    this._getProvider(resource)?.addComment(resource, range2, body);
  }
  deleteComment(resource, id2) {
    this._getProvider(resource)?.deleteComment(resource, id2);
  }
  revealComment(resource, id2) {
    this._onDidRevealComment.fire({ resource, id: id2 });
  }
  _getProvider(resource) {
    return this._providers.filter((entry) => entry.provider.acceptsComments(resource)).sort((first2, second) => (second.provider.priority ?? 0) - (first2.provider.priority ?? 0))[0]?.provider;
  }
  dispose() {
    for (const entry of this._providers) {
      entry.listener.dispose();
    }
    this._providers.length = 0;
    super.dispose();
  }
};

registerSingleton(IAgentEditorCommentsBridge, AgentEditorCommentsBridge, 1 /* Delayed */);
export { IAgentEditorCommentsBridge, AgentEditorCommentsBridge };
