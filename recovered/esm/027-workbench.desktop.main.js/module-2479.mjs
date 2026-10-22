// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariables.ts
import { Disposable } from "./module-0012.mjs";
import { NOTEBOOK_VARIABLE_VIEW_ENABLED } from "./module-2420.mjs";
import { NotebookSetting } from "./module-0909.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0941.mjs";
import { VIEWLET_ID3 } from "./module-1057.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13, IViewDescriptorService } from "./module-1093.mjs";
import { localize2 } from "./module-0001.mjs";
import { variablesViewIcon } from "./module-1870.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { NotebookVariablesView } from "./module-2478.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEditorService } from "./module-0934.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";
import { INotebookKernelService } from "./module-1388.mjs";
import { INotebookService } from "./module-0926.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariables.ts
var NotebookVariables = class extends Disposable {
  constructor(contextKeyService, configurationService, editorService, notebookExecutionStateService, notebookKernelService, notebookDocumentService, viewDescriptorService) {
    super();
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.notebookExecutionStateService = notebookExecutionStateService;
    this.notebookKernelService = notebookKernelService;
    this.notebookDocumentService = notebookDocumentService;
    this.viewDescriptorService = viewDescriptorService;
    this.listeners = [];
    this.initialized = false;
    this.viewEnabled = NOTEBOOK_VARIABLE_VIEW_ENABLED.bindTo(contextKeyService);
    this.listeners.push(this.editorService.onDidActiveEditorChange(() => this.handleInitEvent()));
    this.listeners.push(this.notebookExecutionStateService.onDidChangeExecution((e) => this.handleInitEvent(e.notebook)));
    this.configListener = configurationService.onDidChangeConfiguration((e) => this.handleConfigChange(e));
  }
  handleConfigChange(e) {
    if (e.affectsConfiguration(NotebookSetting.notebookVariablesView)) {
      this.handleInitEvent();
    }
  }
  handleInitEvent(notebook) {
    const enabled = this.editorService.activeEditorPane?.getId() === "workbench.editor.repl" || this.configurationService.getValue(NotebookSetting.notebookVariablesView) || // old setting key
    this.configurationService.getValue("notebook.experimental.variablesView");
    if (enabled && (!!notebook || this.editorService.activeEditorPane?.getId() === "workbench.editor.notebook")) {
      if (this.hasVariableProvider(notebook) && !this.initialized && this.initializeView()) {
        this.viewEnabled.set(true);
        this.initialized = true;
        this.listeners.forEach((listener) => listener.dispose());
      }
    }
  }
  hasVariableProvider(notebookUri) {
    const notebook = notebookUri ? this.notebookDocumentService.getNotebookTextModel(notebookUri) : getNotebookEditorFromEditorPane(this.editorService.activeEditorPane)?.getViewModel()?.notebookDocument;
    return notebook && this.notebookKernelService.getMatchingKernel(notebook).selected?.hasVariableProvider;
  }
  initializeView() {
    const debugViewContainer = this.viewDescriptorService.getViewContainerById(VIEWLET_ID3);
    if (debugViewContainer) {
      const viewsRegistry9 = Registry.as(Extensions13.ViewsRegistry);
      const viewDescriptor4 = {
        id: "workbench.notebook.variables",
        name: localize2(17485, "Notebook Variables"),
        containerIcon: variablesViewIcon,
        ctorDescriptor: new SyncDescriptor(NotebookVariablesView),
        order: 50,
        weight: 5,
        canToggleVisibility: true,
        canMoveView: true,
        collapsed: false,
        when: NOTEBOOK_VARIABLE_VIEW_ENABLED
      };
      viewsRegistry9.registerViews([viewDescriptor4], debugViewContainer);
      return true;
    }
    return false;
  }
  dispose() {
    super.dispose();
    this.listeners.forEach((listener) => listener.dispose());
    this.configListener.dispose();
  }
};

NotebookVariables = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, INotebookExecutionStateService),
  __decorateParam(4, INotebookKernelService),
  __decorateParam(5, INotebookService),
  __decorateParam(6, IViewDescriptorService)
], NotebookVariables);
export { NotebookVariables };
