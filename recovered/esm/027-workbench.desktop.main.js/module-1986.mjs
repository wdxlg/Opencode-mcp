// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookInlineDiffWidget.ts
import { Disposable } from "./module-0012.mjs";
import { NotebookEditorExtensionsRegistry } from "./module-1893.mjs";
import { NotebookInlineDiffDecorationContribution } from "./module-1985.mjs";
import { MenuId } from "./module-0092.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { setParentFlowTo } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotebookEditorService } from "./module-1386.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookInlineDiffWidget.ts
var NotebookInlineDiffWidget = class extends Disposable {
  constructor(rootElement, groupId, window2, options3, dimension, instantiationService, widgetService) {
    super();
    this.rootElement = rootElement;
    this.groupId = groupId;
    this.window = window2;
    this.options = options3;
    this.dimension = dimension;
    this.instantiationService = instantiationService;
    this.widgetService = widgetService;
    this.widget = { value: void 0 };
  }
  get editorWidget() {
    return this.widget.value;
  }
  async show(input, model, previousModel, options3) {
    if (!this.widget.value) {
      this.createNotebookWidget(input, this.groupId, this.rootElement);
    }
    if (this.dimension) {
      this.widget.value?.layout(this.dimension, this.rootElement, this.position);
    }
    if (model) {
      await this.widget.value?.setOptions({ ...options3 });
      this.widget.value?.notebookOptions.previousModelToCompare.set(previousModel, void 0);
      await this.widget.value.setModel(model, options3?.viewState);
    }
  }
  hide() {
    if (this.widget.value) {
      this.widget.value.notebookOptions.previousModelToCompare.set(void 0, void 0);
      this.widget.value.onWillHide();
    }
  }
  setLayout(dimension, position2) {
    this.dimension = dimension;
    this.position = position2;
  }
  createNotebookWidget(input, groupId, rootElement) {
    const contributions = NotebookEditorExtensionsRegistry.getSomeEditorContributions([NotebookInlineDiffDecorationContribution.ID]);
    const menuIds = {
      notebookToolbar: MenuId.NotebookToolbar,
      cellTitleToolbar: MenuId.NotebookCellTitle,
      cellDeleteToolbar: MenuId.NotebookCellDelete,
      cellInsertToolbar: MenuId.NotebookCellBetween,
      cellTopInsertToolbar: MenuId.NotebookCellListTop,
      cellExecuteToolbar: MenuId.NotebookCellExecute,
      cellExecutePrimary: void 0
    };
    const skipContributions = [
      "editor.contrib.review",
      "editor.contrib.floatingClickMenu",
      "editor.contrib.dirtydiff",
      "editor.contrib.testingOutputPeek",
      "editor.contrib.testingDecorations",
      "store.contrib.stickyScrollController",
      "editor.contrib.findController",
      "editor.contrib.emptyTextEditorHint"
    ];
    const cellEditorContributions = EditorExtensionsRegistry.getEditorContributions().filter((c) => skipContributions.indexOf(c.id) === -1);
    this.widget = this.instantiationService.invokeFunction(
      this.widgetService.retrieveWidget,
      groupId,
      input,
      { contributions, menuIds, cellEditorContributions, options: this.options },
      this.dimension,
      this.window
    );
    if (this.rootElement && this.widget.value.getDomNode()) {
      this.rootElement.setAttribute("aria-flowto", this.widget.value.getDomNode().id || "");
      setParentFlowTo(this.widget.value.getDomNode(), this.rootElement);
    }
  }
  dispose() {
    super.dispose();
    if (this.widget.value) {
      this.widget.value.dispose();
    }
  }
};

NotebookInlineDiffWidget = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, INotebookEditorService)
], NotebookInlineDiffWidget);
export { NotebookInlineDiffWidget };
