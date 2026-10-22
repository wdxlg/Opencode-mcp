// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostAgentEditorComments.ts
import { Emitter } from "./module-0019.mjs";
import { Range3 } from "./module-0239.mjs";
import { MainContext } from "./module-0025.mjs";


// src/vs/workbench/api/common/extHostAgentEditorComments.ts
var ExtHostAgentEditorCommentsProvider = class {
  constructor(handle, proxy, onDispose) {
    this.handle = handle;
    this.proxy = proxy;
    this.onDispose = onDispose;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this._onDidRevealComment = new Emitter();
    this.onDidRevealComment = this._onDidRevealComment.event;
    this._comments = [];
    this._acceptsComments = false;
  }
  get comments() {
    return this._comments;
  }
  get acceptsComments() {
    return this._acceptsComments;
  }
  $acceptComments(comments, acceptsComments) {
    this._comments = comments.map((comment) => Object.freeze({
      id: comment.id,
      range: Range3.to(comment.range),
      body: comment.body,
      author: comment.author
    }));
    this._acceptsComments = acceptsComments;
    this._onDidChange.fire();
  }
  $revealComment(id2) {
    this._onDidRevealComment.fire(id2);
  }
  addComment(range, body) {
    this.proxy.$addComment(this.handle, Range3.from(range), body);
  }
  deleteComment(id2) {
    this.proxy.$deleteComment(this.handle, id2);
  }
  dispose() {
    this.proxy.$disposeAgentEditorComments(this.handle);
    this._onDidChange.dispose();
    this._onDidRevealComment.dispose();
    this.onDispose(this.handle);
  }
};

var ExtHostAgentEditorComments = class _ExtHostAgentEditorComments {
  constructor(mainContext) {
    this.providers = /* @__PURE__ */ new Map();
    this.proxy = mainContext.getProxy(MainContext.MainThreadAgentEditorComments);
  }
  static {
    this.handlePool = 0;
  }
  createAgentEditorComments(uri2) {
    const handle = _ExtHostAgentEditorComments.handlePool++;
    const provider = new ExtHostAgentEditorCommentsProvider(handle, this.proxy, (h) => this.providers.delete(h));
    this.providers.set(handle, provider);
    this.proxy.$createAgentEditorComments(handle, uri2);
    return provider;
  }
  $acceptAgentEditorComments(handle, comments, acceptsComments) {
    this.providers.get(handle)?.$acceptComments(comments, acceptsComments);
  }
  $revealAgentEditorComment(handle, id2) {
    this.providers.get(handle)?.$revealComment(id2);
  }
};
export { ExtHostAgentEditorCommentsProvider, ExtHostAgentEditorComments };
