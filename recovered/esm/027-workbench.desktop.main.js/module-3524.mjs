// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions.ts
import { localize2 } from "./module-0001.mjs";
import { Action2 } from "./module-0092.mjs";
import { EditorAction2 } from "./module-0097.mjs";


// src/vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions.ts
var defaultOptions3 = {
  category: localize2(19320, "Snippets")
};

var SnippetsAction = class extends Action2 {
  constructor(desc) {
    super({ ...defaultOptions3, ...desc });
  }
};

var SnippetEditorAction = class extends EditorAction2 {
  constructor(desc) {
    super({ ...defaultOptions3, ...desc });
  }
};
export { defaultOptions3, SnippetsAction, SnippetEditorAction };
