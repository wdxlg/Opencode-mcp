// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/editorAction.ts



// src/vs/editor/common/editorAction.ts
var InternalEditorAction = class {
  constructor(id2, label3, alias, metadata, _precondition, _run, _contextKeyService) {
    this.id = id2;
    this.label = label3;
    this.alias = alias;
    this.metadata = metadata;
    this._precondition = _precondition;
    this._run = _run;
    this._contextKeyService = _contextKeyService;
  }
  isSupported() {
    return this._contextKeyService.contextMatchesRules(this._precondition);
  }
  run(args2) {
    if (!this.isSupported()) {
      return Promise.resolve(void 0);
    }
    return this._run(args2);
  }
};
export { InternalEditorAction };
