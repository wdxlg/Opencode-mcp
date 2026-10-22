// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewParts/notebookKernelView.ts
import { getNotebookEditorFromEditorPane } from "./module-0941.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { NOTEBOOK_ACTIONS_CATEGORY, SELECT_KERNEL_ID } from "./module-1869.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { selectKernelIcon } from "./module-1870.mjs";
import { NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_KERNEL_COUNT } from "./module-1868.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0934.mjs";
import { INotebookKernelHistoryService, INotebookKernelService } from "./module-1388.mjs";
import { KernelPickerMRUStrategy } from "./module-1871.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/workbench/contrib/notebook/browser/viewParts/notebookKernelView.ts
function getEditorFromContext(editorService, context2) {
  let editor;
  if (context2 !== void 0 && "notebookEditorId" in context2) {
    const editorId = context2.notebookEditorId;
    const matchingEditor = editorService.visibleEditorPanes.find((editorPane) => {
      const notebookEditor = getNotebookEditorFromEditorPane(editorPane);
      return notebookEditor?.getId() === editorId;
    });
    editor = getNotebookEditorFromEditorPane(matchingEditor);
  } else if (context2 !== void 0 && "notebookEditor" in context2) {
    editor = context2?.notebookEditor;
  } else {
    editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  }
  return editor;
}

function shouldSkip(selected, controllerId, extensionId, context2) {
  return !!(selected && (context2 && "skipIfAlreadySelected" in context2 && context2.skipIfAlreadySelected || // target kernel is already selected
  controllerId && selected.id === controllerId && ExtensionIdentifier.equals(selected.extension, extensionId)));
}

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SELECT_KERNEL_ID,
      category: NOTEBOOK_ACTIONS_CATEGORY,
      title: localize2(17914, "Select Notebook Kernel"),
      icon: selectKernelIcon,
      f1: true,
      precondition: NOTEBOOK_IS_ACTIVE_EDITOR,
      menu: [{
        id: MenuId.EditorTitle,
        when: ContextKeyExpr.and(
          NOTEBOOK_IS_ACTIVE_EDITOR,
          ContextKeyExpr.notEquals("config.notebook.globalToolbar", true)
        ),
        group: "navigation",
        order: -10
      }, {
        id: MenuId.NotebookToolbar,
        when: ContextKeyExpr.equals("config.notebook.globalToolbar", true),
        group: "status",
        order: -10
      }, {
        id: MenuId.InteractiveToolbar,
        when: NOTEBOOK_KERNEL_COUNT.notEqualsTo(0),
        group: "status",
        order: -10
      }],
      metadata: {
        description: localize(17915, null),
        args: [
          {
            name: "kernelInfo",
            description: "The kernel info",
            schema: {
              "type": "object",
              "required": ["id", "extension"],
              "properties": {
                "id": {
                  "type": "string"
                },
                "extension": {
                  "type": "string"
                },
                "notebookEditorId": {
                  "type": "string"
                }
              }
            }
          }
        ]
      }
    });
  }
  async run(accessor, context2) {
    const instantiationService = accessor.get(IInstantiationService);
    const editorService = accessor.get(IEditorService);
    const editor = getEditorFromContext(editorService, context2);
    if (!editor || !editor.hasModel()) {
      return false;
    }
    let controllerId = context2 && "id" in context2 ? context2.id : void 0;
    let extensionId = context2 && "extension" in context2 ? context2.extension : void 0;
    if (controllerId && (typeof controllerId !== "string" || typeof extensionId !== "string")) {
      controllerId = void 0;
      extensionId = void 0;
    }
    const notebook = editor.textModel;
    const notebookKernelService = accessor.get(INotebookKernelService);
    const { selected } = notebookKernelService.getMatchingKernel(notebook);
    if (shouldSkip(selected, controllerId, extensionId, context2)) {
      return true;
    }
    const wantedKernelId = controllerId ? `${extensionId}/${controllerId}` : void 0;
    const strategy = instantiationService.createInstance(KernelPickerMRUStrategy);
    return strategy.showQuickPick(editor, wantedKernelId);
  }
});

var NotebooKernelActionViewItem = class extends ActionViewItem {
  constructor(actualAction, _editor, options3, _notebookKernelService, _notebookKernelHistoryService) {
    const action = new Action("fakeAction", void 0, ThemeIcon.asClassName(selectKernelIcon), true, (event) => actualAction.run(event));
    super(
      void 0,
      action,
      { ...options3, label: false, icon: true }
    );
    this._editor = _editor;
    this._notebookKernelService = _notebookKernelService;
    this._notebookKernelHistoryService = _notebookKernelHistoryService;
    this._register(action);
    this._register(_editor.onDidChangeModel(this._update, this));
    this._register(_notebookKernelService.onDidAddKernel(this._update, this));
    this._register(_notebookKernelService.onDidRemoveKernel(this._update, this));
    this._register(_notebookKernelService.onDidChangeNotebookAffinity(this._update, this));
    this._register(_notebookKernelService.onDidChangeSelectedNotebooks(this._update, this));
    this._register(_notebookKernelService.onDidChangeSourceActions(this._update, this));
    this._register(_notebookKernelService.onDidChangeKernelDetectionTasks(this._update, this));
  }
  render(container3) {
    this._update();
    super.render(container3);
    container3.classList.add("kernel-action-view-item");
    this._kernelLabel = document.createElement("a");
    container3.appendChild(this._kernelLabel);
    this.updateLabel();
  }
  updateLabel() {
    if (this._kernelLabel) {
      this._kernelLabel.classList.add("kernel-label");
      this._kernelLabel.innerText = this._action.label;
    }
  }
  _update() {
    const notebook = this._editor.textModel;
    if (!notebook) {
      this._resetAction();
      return;
    }
    KernelPickerMRUStrategy.updateKernelStatusAction(notebook, this._action, this._notebookKernelService, this._notebookKernelHistoryService);
    this.updateClass();
  }
  _resetAction() {
    this._action.enabled = false;
    this._action.label = "";
    this._action.class = "";
  }
};

NotebooKernelActionViewItem = __decorateClass([
  __decorateParam(3, INotebookKernelService),
  __decorateParam(4, INotebookKernelHistoryService)
], NotebooKernelActionViewItem);
export { getEditorFromContext, shouldSkip, NotebooKernelActionViewItem };
