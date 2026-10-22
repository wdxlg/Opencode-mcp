// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/editor/browser/editorPaneService.ts
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IEditorPaneService } from "./module-0871.mjs";


// src/vs/workbench/services/editor/browser/editorPaneService.ts
var EditorPaneService = class {
  constructor() {
    this.onWillInstantiateEditorPane = EditorPaneDescriptor.onWillInstantiateEditorPane;
  }
  didInstantiateEditorPane(typeId) {
    return EditorPaneDescriptor.didInstantiateEditorPane(typeId);
  }
};

registerSingleton(IEditorPaneService, EditorPaneService, 1 /* Delayed */);
export { EditorPaneService };
