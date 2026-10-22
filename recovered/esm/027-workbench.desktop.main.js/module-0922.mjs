// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadAgentEditorComments.ts
import { DisposableMap, DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { URI } from "./module-0032.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IAgentEditorCommentsBridge } from "./module-0918.mjs";


// src/vs/workbench/api/browser/mainThreadAgentEditorComments.ts
var MainThreadAgentEditorComments = class {
  constructor(extHostContext, _bridge) {
    this._bridge = _bridge;
    this._resources = /* @__PURE__ */ new Map();
    this._disposables = new DisposableMap();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostAgentEditorComments);
  }
  async $createAgentEditorComments(handle2, uri5) {
    const resource = URI.revive(uri5);
    this._resources.set(handle2, resource);
    const store = new DisposableStore();
    store.add(this._bridge.onDidChangeComments(() => this._sendComments(handle2)));
    store.add(this._bridge.onDidRevealComment((event) => {
      if (isEqual2(event.resource, resource)) {
        this._proxy.$revealAgentEditorComment(handle2, event.id);
      }
    }));
    this._disposables.set(handle2, store);
    this._sendComments(handle2);
  }
  async $addComment(handle2, range2, body) {
    const resource = this._resources.get(handle2);
    if (!resource) {
      return;
    }
    this._bridge.addComment(resource, range2, body);
  }
  async $deleteComment(handle2, id2) {
    const resource = this._resources.get(handle2);
    if (!resource) {
      return;
    }
    this._bridge.deleteComment(resource, id2);
  }
  async $disposeAgentEditorComments(handle2) {
    this._resources.delete(handle2);
    this._disposables.deleteAndDispose(handle2);
  }
  _sendComments(handle2) {
    const resource = this._resources.get(handle2);
    if (!resource) {
      return;
    }
    const comments = this._bridge.getComments(resource).map((comment) => ({ id: comment.id, range: comment.range, body: comment.body }));
    this._proxy.$acceptAgentEditorComments(handle2, comments, this._bridge.acceptsComments(resource));
  }
  dispose() {
    this._disposables.dispose();
    this._resources.clear();
  }
};

MainThreadAgentEditorComments = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadAgentEditorComments),
  __decorateParam(1, IAgentEditorCommentsBridge)
], MainThreadAgentEditorComments);
export { MainThreadAgentEditorComments };
