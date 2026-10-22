// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/notebookEditorExtensions.ts



// src/vs/workbench/contrib/notebook/browser/notebookEditorExtensions.ts
var EditorContributionRegistry2 = class _EditorContributionRegistry {
  static {
    this.INSTANCE = new _EditorContributionRegistry();
  }
  constructor() {
    this.editorContributions = [];
  }
  registerEditorContribution(id2, ctor) {
    this.editorContributions.push({ id: id2, ctor });
  }
  getEditorContributions() {
    return this.editorContributions.slice(0);
  }
};

function registerNotebookContribution(id2, ctor) {
  EditorContributionRegistry2.INSTANCE.registerEditorContribution(id2, ctor);
}

var NotebookEditorExtensionsRegistry;

((NotebookEditorExtensionsRegistry2) => {
  function getEditorContributions() {
    return EditorContributionRegistry2.INSTANCE.getEditorContributions();
  }
  NotebookEditorExtensionsRegistry2.getEditorContributions = getEditorContributions;
  function getSomeEditorContributions(ids) {
    return EditorContributionRegistry2.INSTANCE.getEditorContributions().filter((c) => ids.indexOf(c.id) >= 0);
  }
  NotebookEditorExtensionsRegistry2.getSomeEditorContributions = getSomeEditorContributions;
})(NotebookEditorExtensionsRegistry || (NotebookEditorExtensionsRegistry = {}));
export { registerNotebookContribution, EditorContributionRegistry2, NotebookEditorExtensionsRegistry };
