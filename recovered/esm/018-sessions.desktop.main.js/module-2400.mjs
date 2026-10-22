// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/find/findFilters.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/find/findFilters.ts
var NotebookFindFilters = class extends Disposable {
  constructor(markupInput, markupPreview, codeInput, codeOutput, findScope) {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._markupInput = true;
    this._markupPreview = true;
    this._codeInput = true;
    this._codeOutput = true;
    this._findScope = { findScopeType: "none" /* None */ };
    this._markupInput = markupInput;
    this._markupPreview = markupPreview;
    this._codeInput = codeInput;
    this._codeOutput = codeOutput;
    this._findScope = findScope;
    this._initialMarkupInput = markupInput;
    this._initialMarkupPreview = markupPreview;
    this._initialCodeInput = codeInput;
    this._initialCodeOutput = codeOutput;
  }
  get markupInput() {
    return this._markupInput;
  }
  set markupInput(value2) {
    if (this._markupInput !== value2) {
      this._markupInput = value2;
      this._onDidChange.fire({ markupInput: value2 });
    }
  }
  get markupPreview() {
    return this._markupPreview;
  }
  set markupPreview(value2) {
    if (this._markupPreview !== value2) {
      this._markupPreview = value2;
      this._onDidChange.fire({ markupPreview: value2 });
    }
  }
  get codeInput() {
    return this._codeInput;
  }
  set codeInput(value2) {
    if (this._codeInput !== value2) {
      this._codeInput = value2;
      this._onDidChange.fire({ codeInput: value2 });
    }
  }
  get codeOutput() {
    return this._codeOutput;
  }
  set codeOutput(value2) {
    if (this._codeOutput !== value2) {
      this._codeOutput = value2;
      this._onDidChange.fire({ codeOutput: value2 });
    }
  }
  get findScope() {
    return this._findScope;
  }
  set findScope(value2) {
    if (this._findScope !== value2) {
      this._findScope = value2;
      this._onDidChange.fire({ findScope: true });
    }
  }
  isModified() {
    return this._markupInput !== this._initialMarkupInput || this._markupPreview !== this._initialMarkupPreview || this._codeInput !== this._initialCodeInput || this._codeOutput !== this._initialCodeOutput;
  }
  update(v2) {
    this._markupInput = v2.markupInput;
    this._markupPreview = v2.markupPreview;
    this._codeInput = v2.codeInput;
    this._codeOutput = v2.codeOutput;
    this._findScope = v2.findScope;
  }
};
export { NotebookFindFilters };
