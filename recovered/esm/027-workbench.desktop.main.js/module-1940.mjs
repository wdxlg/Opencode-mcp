// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/renderers/cellRenderer.ts
import { $, append, getWindow } from "./module-0075.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { createBareFontInfoFromRawSettings } from "./module-0220.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { CellEditorOptions } from "./module-1918.mjs";
import { FastDomNode } from "./module-0212.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { BetweenCellToolbar, CellTitleToolbarPart } from "./module-1926.mjs";
import { CellPartsCollection } from "./module-1896.mjs";
import { CellChatPart } from "./module-1914.mjs";
import { CellEditorStatusBar } from "./module-1923.mjs";
import { CellFocusIndicator } from "./module-1921.mjs";
import { FoldedCellHint } from "./module-1938.mjs";
import { CellDecorations } from "./module-1916.mjs";
import { CellComments } from "./module-1915.mjs";
import { CollapsedCellInput } from "./module-1934.mjs";
import { CellFocusPart } from "./module-1920.mjs";
import { CellDragAndDropPart } from "./module-1903.mjs";
import { CellContextKeyPart } from "./module-1902.mjs";
import { MarkupCell } from "./module-1939.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IMenuService } from "./module-0092.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { INotificationService } from "./module-0336.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { localize } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { CellProgressBar } from "./module-1922.mjs";
import { CellExecutionPart } from "./module-1919.mjs";
import { CollapsedCellOutput } from "./module-1935.mjs";
import { RunToolbar } from "./module-1933.mjs";
import { CodeCellDragImageRenderer } from "./module-1917.mjs";
import { CodeCell } from "./module-1931.mjs";


// src/vs/workbench/contrib/notebook/browser/view/renderers/cellRenderer.ts
var $33 = $;

var NotebookCellListDelegate = class extends Disposable {
  constructor(targetWindow, configurationService) {
    super();
    this.configurationService = configurationService;
    const editorOptions2 = this.configurationService.getValue("editor");
    this.lineHeight = createBareFontInfoFromRawSettings(editorOptions2, PixelRatio.getInstance(targetWindow).value).lineHeight;
  }
  getHeight(element) {
    return element.getHeight(this.lineHeight);
  }
  getDynamicHeight(element) {
    return element.getDynamicHeight();
  }
  getTemplateId(element) {
    if (element.cellKind === 1 /* Markup */) {
      return MarkupCellRenderer.TEMPLATE_ID;
    } else {
      return CodeCellRenderer.TEMPLATE_ID;
    }
  }
};

NotebookCellListDelegate = __decorateClass([
  __decorateParam(1, IConfigurationService)
], NotebookCellListDelegate);

var AbstractCellRenderer = class extends Disposable {
  constructor(instantiationService, notebookEditor, contextMenuService, menuService, configurationService, keybindingService, notificationService, contextKeyServiceProvider, language2, dndController) {
    super();
    this.instantiationService = instantiationService;
    this.notebookEditor = notebookEditor;
    this.contextMenuService = contextMenuService;
    this.menuService = menuService;
    this.keybindingService = keybindingService;
    this.notificationService = notificationService;
    this.contextKeyServiceProvider = contextKeyServiceProvider;
    this.dndController = dndController;
    this.editorOptions = this._register(new CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(language2), this.notebookEditor.notebookOptions, configurationService));
  }
  dispose() {
    super.dispose();
    this.dndController = void 0;
  }
};

var MarkupCellRenderer = class extends AbstractCellRenderer {
  constructor(notebookEditor, dndController, renderedEditors, contextKeyServiceProvider, configurationService, instantiationService, contextMenuService, menuService, keybindingService, notificationService, notebookExecutionStateService) {
    super(instantiationService, notebookEditor, contextMenuService, menuService, configurationService, keybindingService, notificationService, contextKeyServiceProvider, "markdown", dndController);
    this.renderedEditors = renderedEditors;
    this._notebookExecutionStateService = notebookExecutionStateService;
  }
  static {
    this.TEMPLATE_ID = "markdown_cell";
  }
  get templateId() {
    return MarkupCellRenderer.TEMPLATE_ID;
  }
  renderTemplate(rootContainer) {
    rootContainer.classList.add("markdown-cell-row");
    const container3 = append(rootContainer, $(".cell-inner-container"));
    const templateDisposables = new DisposableStore();
    const contextKeyService = templateDisposables.add(this.contextKeyServiceProvider(container3));
    const decorationContainer = append(rootContainer, $33(".cell-decoration"));
    const titleToolbarContainer = append(container3, $33(".cell-title-toolbar"));
    const focusIndicatorTop = new FastDomNode(append(container3, $33(".cell-focus-indicator.cell-focus-indicator-top")));
    const focusIndicatorLeft = new FastDomNode(append(container3, $(".cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-left")));
    const foldingIndicator = append(focusIndicatorLeft.domNode, $(".notebook-folding-indicator"));
    const focusIndicatorRight = new FastDomNode(append(container3, $(".cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-right")));
    const codeInnerContent = append(container3, $33(".cell.code"));
    const editorPart = append(codeInnerContent, $33(".cell-editor-part"));
    const cellChatPart = append(editorPart, $33(".cell-chat-part"));
    const cellInputCollapsedContainer = append(codeInnerContent, $33(".input-collapse-container"));
    cellInputCollapsedContainer.style.display = "none";
    const editorContainer = append(editorPart, $33(".cell-editor-container"));
    editorPart.style.display = "none";
    const cellCommentPartContainer = append(container3, $33(".cell-comment-container"));
    const innerContent = append(container3, $33(".cell.markdown"));
    const bottomCellContainer = append(container3, $33(".cell-bottom-toolbar-container"));
    const scopedInstaService = templateDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
    const rootClassDelegate = {
      toggle: (className2, force) => container3.classList.toggle(className2, force)
    };
    const titleToolbar = templateDisposables.add(scopedInstaService.createInstance(
      CellTitleToolbarPart,
      titleToolbarContainer,
      rootClassDelegate,
      this.notebookEditor.creationOptions.menuIds.cellTitleToolbar,
      this.notebookEditor.creationOptions.menuIds.cellDeleteToolbar,
      this.notebookEditor
    ));
    const focusIndicatorBottom = new FastDomNode(append(container3, $33(".cell-focus-indicator.cell-focus-indicator-bottom")));
    const cellParts = new CellPartsCollection(getWindow(rootContainer), [
      templateDisposables.add(scopedInstaService.createInstance(CellChatPart, this.notebookEditor, cellChatPart)),
      templateDisposables.add(scopedInstaService.createInstance(CellEditorStatusBar, this.notebookEditor, container3, editorPart, void 0)),
      templateDisposables.add(new CellFocusIndicator(this.notebookEditor, titleToolbar, focusIndicatorTop, focusIndicatorLeft, focusIndicatorRight, focusIndicatorBottom)),
      templateDisposables.add(new FoldedCellHint(this.notebookEditor, append(container3, $33(".notebook-folded-hint")), this._notebookExecutionStateService)),
      templateDisposables.add(new CellDecorations(this.notebookEditor, rootContainer, decorationContainer)),
      templateDisposables.add(scopedInstaService.createInstance(CellComments, this.notebookEditor, cellCommentPartContainer)),
      templateDisposables.add(new CollapsedCellInput(this.notebookEditor, cellInputCollapsedContainer)),
      templateDisposables.add(new CellFocusPart(container3, void 0, this.notebookEditor)),
      templateDisposables.add(new CellDragAndDropPart(container3)),
      templateDisposables.add(scopedInstaService.createInstance(CellContextKeyPart, this.notebookEditor))
    ], [
      titleToolbar,
      templateDisposables.add(scopedInstaService.createInstance(BetweenCellToolbar, this.notebookEditor, titleToolbarContainer, bottomCellContainer))
    ]);
    templateDisposables.add(cellParts);
    const templateData = {
      rootContainer,
      cellInputCollapsedContainer,
      instantiationService: scopedInstaService,
      container: container3,
      cellContainer: innerContent,
      editorPart,
      editorContainer,
      foldingIndicator,
      templateDisposables,
      elementDisposables: templateDisposables.add(new DisposableStore()),
      cellParts,
      toJSON: () => {
        return {};
      }
    };
    return templateData;
  }
  renderElement(element, index2, templateData, details) {
    if (!this.notebookEditor.hasModel()) {
      throw new Error("The notebook editor is not attached with view model yet.");
    }
    templateData.currentRenderedCell = element;
    templateData.currentEditor = void 0;
    templateData.editorPart.style.display = "none";
    templateData.cellContainer.innerText = "";
    if (details?.height === void 0) {
      return;
    }
    templateData.elementDisposables.add(templateData.instantiationService.createInstance(MarkupCell, this.notebookEditor, element, templateData, this.renderedEditors));
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
  disposeElement(_element, _index, templateData) {
    templateData.elementDisposables.clear();
  }
};

MarkupCellRenderer = __decorateClass([
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IMenuService),
  __decorateParam(8, IKeybindingService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, INotebookExecutionStateService)
], MarkupCellRenderer);

var CodeCellRenderer = class extends AbstractCellRenderer {
  constructor(notebookEditor, renderedEditors, editorPool, dndController, contextKeyServiceProvider, configurationService, contextMenuService, menuService, instantiationService, keybindingService, notificationService) {
    super(instantiationService, notebookEditor, contextMenuService, menuService, configurationService, keybindingService, notificationService, contextKeyServiceProvider, PLAINTEXT_LANGUAGE_ID, dndController);
    this.renderedEditors = renderedEditors;
    this.editorPool = editorPool;
  }
  static {
    this.TEMPLATE_ID = "code_cell";
  }
  get templateId() {
    return CodeCellRenderer.TEMPLATE_ID;
  }
  renderTemplate(rootContainer) {
    rootContainer.classList.add("code-cell-row");
    const container3 = append(rootContainer, $(".cell-inner-container"));
    const templateDisposables = new DisposableStore();
    const contextKeyService = templateDisposables.add(this.contextKeyServiceProvider(container3));
    const decorationContainer = append(rootContainer, $33(".cell-decoration"));
    const focusIndicatorTop = new FastDomNode(append(container3, $33(".cell-focus-indicator.cell-focus-indicator-top")));
    const titleToolbarContainer = append(container3, $33(".cell-title-toolbar"));
    const focusIndicatorLeft = new FastDomNode(append(container3, $(".cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-left")));
    const cellChatPart = append(container3, $33(".cell-chat-part"));
    const cellContainer = append(container3, $33(".cell.code"));
    const runButtonContainer = append(cellContainer, $33(".run-button-container"));
    const cellInputCollapsedContainer = append(cellContainer, $33(".input-collapse-container"));
    cellInputCollapsedContainer.style.display = "none";
    const executionOrderLabel = append(focusIndicatorLeft.domNode, $33("div.execution-count-label"));
    executionOrderLabel.title = localize(17898, null);
    const editorPart = append(cellContainer, $33(".cell-editor-part"));
    const editorContainer = append(editorPart, $33(".cell-editor-container"));
    const cellCommentPartContainer = append(container3, $33(".cell-comment-container"));
    const editorContextKeyService = templateDisposables.add(this.contextKeyServiceProvider(editorPart));
    const editorInstaService = templateDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, editorContextKeyService])));
    EditorContextKeys.inCompositeEditor.bindTo(editorContextKeyService).set(true);
    const editor = editorInstaService.createInstance(CodeEditorWidget, editorContainer, {
      ...this.editorOptions.getDefaultValue(),
      allowVariableLineHeights: false,
      dimension: {
        width: 0,
        height: 0
      },
      scrollbar: {
        vertical: "hidden",
        horizontal: "auto",
        handleMouseWheel: false,
        useShadows: false
      }
    }, {
      contributions: this.notebookEditor.creationOptions.cellEditorContributions
    });
    templateDisposables.add(editor);
    const outputContainer = new FastDomNode(append(container3, $33(".output")));
    const cellOutputCollapsedContainer = append(outputContainer.domNode, $33(".output-collapse-container"));
    const outputShowMoreContainer = new FastDomNode(append(container3, $33(".output-show-more-container")));
    const focusIndicatorRight = new FastDomNode(append(container3, $(".cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-right")));
    const focusSinkElement = append(container3, $33(".cell-editor-focus-sink"));
    focusSinkElement.setAttribute("tabindex", "0");
    const bottomCellToolbarContainer = append(container3, $33(".cell-bottom-toolbar-container"));
    const focusIndicatorBottom = new FastDomNode(append(container3, $33(".cell-focus-indicator.cell-focus-indicator-bottom")));
    const scopedInstaService = templateDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
    const rootClassDelegate = {
      toggle: (className2, force) => container3.classList.toggle(className2, force)
    };
    const titleToolbar = templateDisposables.add(scopedInstaService.createInstance(
      CellTitleToolbarPart,
      titleToolbarContainer,
      rootClassDelegate,
      this.notebookEditor.creationOptions.menuIds.cellTitleToolbar,
      this.notebookEditor.creationOptions.menuIds.cellDeleteToolbar,
      this.notebookEditor
    ));
    const focusIndicatorPart = templateDisposables.add(new CellFocusIndicator(this.notebookEditor, titleToolbar, focusIndicatorTop, focusIndicatorLeft, focusIndicatorRight, focusIndicatorBottom));
    const contentParts = [
      focusIndicatorPart,
      templateDisposables.add(scopedInstaService.createInstance(CellChatPart, this.notebookEditor, cellChatPart)),
      templateDisposables.add(scopedInstaService.createInstance(CellEditorStatusBar, this.notebookEditor, container3, editorPart, editor)),
      templateDisposables.add(scopedInstaService.createInstance(CellProgressBar, editorPart, cellInputCollapsedContainer)),
      templateDisposables.add(new CellDecorations(this.notebookEditor, rootContainer, decorationContainer)),
      templateDisposables.add(scopedInstaService.createInstance(CellComments, this.notebookEditor, cellCommentPartContainer)),
      templateDisposables.add(scopedInstaService.createInstance(CellExecutionPart, this.notebookEditor, executionOrderLabel)),
      templateDisposables.add(scopedInstaService.createInstance(CollapsedCellOutput, this.notebookEditor, cellOutputCollapsedContainer)),
      templateDisposables.add(new CollapsedCellInput(this.notebookEditor, cellInputCollapsedContainer)),
      templateDisposables.add(new CellFocusPart(container3, focusSinkElement, this.notebookEditor)),
      templateDisposables.add(new CellDragAndDropPart(container3)),
      templateDisposables.add(scopedInstaService.createInstance(CellContextKeyPart, this.notebookEditor))
    ];
    const { cellExecutePrimary, cellExecuteToolbar } = this.notebookEditor.creationOptions.menuIds;
    if (cellExecutePrimary && cellExecuteToolbar) {
      contentParts.push(templateDisposables.add(
        scopedInstaService.createInstance(RunToolbar, this.notebookEditor, contextKeyService, container3, runButtonContainer, cellExecutePrimary, cellExecuteToolbar)
      ));
    }
    const cellParts = new CellPartsCollection(getWindow(rootContainer), contentParts, [
      titleToolbar,
      templateDisposables.add(scopedInstaService.createInstance(BetweenCellToolbar, this.notebookEditor, titleToolbarContainer, bottomCellToolbarContainer))
    ]);
    templateDisposables.add(cellParts);
    const templateData = {
      rootContainer,
      editorPart,
      cellInputCollapsedContainer,
      cellOutputCollapsedContainer,
      instantiationService: scopedInstaService,
      container: container3,
      cellContainer,
      focusSinkElement,
      outputContainer,
      outputShowMoreContainer,
      editor,
      templateDisposables,
      elementDisposables: templateDisposables.add(new DisposableStore()),
      cellParts,
      toJSON: () => {
        return {};
      }
    };
    const dragHandles = [focusIndicatorLeft.domNode, focusIndicatorPart.codeFocusIndicator.domNode, focusIndicatorPart.outputFocusIndicator.domNode];
    this.dndController?.registerDragHandle(templateData, rootContainer, dragHandles, () => new CodeCellDragImageRenderer().getDragImage(templateData, templateData.editor, "code"));
    return templateData;
  }
  renderElement(element, index2, templateData, details) {
    if (!this.notebookEditor.hasModel()) {
      throw new Error("The notebook editor is not attached with view model yet.");
    }
    templateData.currentRenderedCell = element;
    if (details?.height === void 0) {
      return;
    }
    templateData.outputContainer.domNode.innerText = "";
    templateData.outputContainer.domNode.appendChild(templateData.cellOutputCollapsedContainer);
    templateData.elementDisposables.add(templateData.instantiationService.createInstance(CodeCell, this.notebookEditor, element, templateData, this.editorPool));
    this.renderedEditors.set(element, templateData.editor);
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
  disposeElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
    this.renderedEditors.delete(element);
  }
};

CodeCellRenderer = __decorateClass([
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IMenuService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, INotificationService)
], CodeCellRenderer);
export { $33, NotebookCellListDelegate, AbstractCellRenderer, MarkupCellRenderer, CodeCellRenderer };
