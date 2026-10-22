// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesView.ts
import { ViewPane } from "./module-1334.mjs";
import { NOTEBOOK_TITLE, NotebookVariableAccessibilityProvider, NotebookVariableRenderer, NotebookVariablesDelegate, REPL_TITLE } from "./module-2452.mjs";
import { NotebookVariableDataSource } from "./module-2451.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { WorkbenchAsyncDataTree } from "./module-0636.mjs";
import { CONTEXT_VARIABLE_EXTENSIONID, CONTEXT_VARIABLE_INTERFACES, CONTEXT_VARIABLE_LANGUAGE, CONTEXT_VARIABLE_NAME, CONTEXT_VARIABLE_TYPE, CONTEXT_VARIABLE_VALUE } from "./module-1058.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { isCompositeNotebookEditorInput } from "./module-0940.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { INotebookKernelService } from "./module-1387.mjs";
import { INotebookExecutionStateService } from "./module-1386.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesView.ts
var NotebookVariablesView = class extends ViewPane {
  constructor(options3, editorService, notebookKernelService, notebookExecutionStateService, keybindingService, contextMenuService, contextKeyService, configurationService, instantiationService, viewDescriptorService, openerService, quickInputService, commandService, themeService, hoverService, menuService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.editorService = editorService;
    this.notebookKernelService = notebookKernelService;
    this.notebookExecutionStateService = notebookExecutionStateService;
    this.quickInputService = quickInputService;
    this.commandService = commandService;
    this.menuService = menuService;
    this._register(this.editorService.onDidActiveEditorChange(() => this.handleActiveEditorChange()));
    this._register(this.notebookKernelService.onDidNotebookVariablesUpdate(this.handleVariablesChanged.bind(this)));
    this._register(this.notebookExecutionStateService.onDidChangeExecution(this.handleExecutionStateChange.bind(this)));
    this._register(this.editorService.onDidCloseEditor((e4) => this.handleCloseEditor(e4)));
    this.accessibilityProvider = new NotebookVariableAccessibilityProvider();
    this.handleActiveEditorChange(false);
    this.dataSource = new NotebookVariableDataSource(this.notebookKernelService);
    this.updateScheduler = this._register(new RunOnceScheduler(() => this.tree?.updateChildren(), 100));
  }
  static {
    this.ID = "notebookVariablesView";
  }
  renderBody(container2) {
    super.renderBody(container2);
    this.element.classList.add("debug-pane");
    this.tree = this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "notebookVariablesTree",
      container2,
      new NotebookVariablesDelegate(),
      [this.instantiationService.createInstance(NotebookVariableRenderer)],
      this.dataSource,
      {
        accessibilityProvider: this.accessibilityProvider,
        identityProvider: { getId: (e4) => e4.id }
      }
    );
    this.tree.layout();
    if (this.activeNotebook) {
      this.tree.setInput({ kind: "root", notebook: this.activeNotebook });
    }
    this._register(this.tree.onContextMenu((e4) => this.onContextMenu(e4)));
  }
  onContextMenu(e4) {
    if (!e4.element) {
      return;
    }
    const element = e4.element;
    const arg = {
      source: element.notebook.uri.toString(),
      name: element.name,
      value: element.value,
      type: element.type,
      expression: element.expression,
      language: element.language,
      extensionId: element.extensionId
    };
    const overlayedContext = this.contextKeyService.createOverlay([
      [CONTEXT_VARIABLE_NAME.key, element.name],
      [CONTEXT_VARIABLE_VALUE.key, element.value],
      [CONTEXT_VARIABLE_TYPE.key, element.type],
      [CONTEXT_VARIABLE_INTERFACES.key, element.interfaces],
      [CONTEXT_VARIABLE_LANGUAGE.key, element.language],
      [CONTEXT_VARIABLE_EXTENSIONID.key, element.extensionId]
    ]);
    const menuActions = this.menuService.getMenuActions(MenuId.NotebookVariablesContext, overlayedContext, { arg, shouldForwardArgs: true });
    const actions = getFlatContextMenuActions(menuActions);
    this.contextMenuService.showContextMenu({
      getAnchor: () => e4.anchor,
      getActions: () => actions
    });
  }
  focus() {
    super.focus();
    this.tree?.domFocus();
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.tree?.layout(height, width2);
  }
  setActiveNotebook(notebookDocument, editor, doUpdate = true) {
    this.activeNotebook = notebookDocument;
    if (isCompositeNotebookEditorInput(editor.input)) {
      this.updateTitle(REPL_TITLE.value);
      this.accessibilityProvider.updateWidgetAriaLabel(REPL_TITLE.value);
    } else {
      this.updateTitle(NOTEBOOK_TITLE.value);
      this.accessibilityProvider.updateWidgetAriaLabel(NOTEBOOK_TITLE.value);
    }
    if (doUpdate) {
      this.tree?.setInput({ kind: "root", notebook: notebookDocument });
      this.updateScheduler.schedule();
    }
  }
  getActiveNotebook() {
    const notebookEditor = this.editorService.activeEditorPane;
    const notebookDocument = getNotebookEditorFromEditorPane(notebookEditor)?.textModel;
    return notebookDocument && notebookEditor ? { notebookDocument, notebookEditor } : void 0;
  }
  handleCloseEditor(e4) {
    if (e4.editor.resource && e4.editor.resource.toString() === this.activeNotebook?.uri.toString()) {
      this.tree?.setInput({ kind: "empty" });
      this.updateScheduler.schedule();
    }
  }
  handleActiveEditorChange(doUpdate = true) {
    const found = this.getActiveNotebook();
    if (found && found.notebookDocument !== this.activeNotebook) {
      this.setActiveNotebook(found.notebookDocument, found.notebookEditor, doUpdate);
    }
  }
  handleExecutionStateChange(event) {
    if (this.activeNotebook && event.affectsNotebook(this.activeNotebook.uri)) {
      this.dataSource.cancel();
      if (event.changed === void 0) {
        this.updateScheduler.schedule();
      } else {
        this.updateScheduler.cancel();
      }
    } else if (!this.getActiveNotebook()) {
      this.editorService.visibleEditorPanes.forEach((editor) => {
        const notebookDocument = getNotebookEditorFromEditorPane(editor)?.textModel;
        if (notebookDocument && event.affectsNotebook(notebookDocument.uri)) {
          this.setActiveNotebook(notebookDocument, editor);
        }
      });
    }
  }
  handleVariablesChanged(notebookUri) {
    if (this.activeNotebook && notebookUri.toString() === this.activeNotebook.uri.toString()) {
      this.updateScheduler.schedule();
    } else if (!this.getActiveNotebook()) {
      this.editorService.visibleEditorPanes.forEach((editor) => {
        const notebookDocument = getNotebookEditorFromEditorPane(editor)?.textModel;
        if (notebookDocument && notebookDocument.uri.toString() === notebookUri.toString()) {
          this.setActiveNotebook(notebookDocument, editor);
        }
      });
    }
  }
};

NotebookVariablesView = __decorateClass([
  __decorateParam(1, IEditorService),
  __decorateParam(2, INotebookKernelService),
  __decorateParam(3, INotebookExecutionStateService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IViewDescriptorService),
  __decorateParam(10, IOpenerService),
  __decorateParam(11, IQuickInputService),
  __decorateParam(12, ICommandService),
  __decorateParam(13, IThemeService),
  __decorateParam(14, IHoverService),
  __decorateParam(15, IMenuService)
], NotebookVariablesView);
export { NotebookVariablesView };
