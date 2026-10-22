// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/notebookDiffList.ts
import { createBareFontInfoFromRawSettings } from "./module-0220.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { $, append } from "./module-0075.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { CellDiffPlaceholderElement, CollapsedCellOverlayWidget, DeletedElement, InsertElement, ModifiedElement, NotebookDocumentMetadataElement, UnchangedCellOverlayWidget, getOptimizedNestedCodeEditorWidgetOptions } from "./module-1950.mjs";
import { localize } from "./module-0001.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { IMenuService, MenuItemAction } from "./module-0092.mjs";
import { CodiconActionViewItem } from "./module-1901.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { MouseController, isMonacoEditor } from "./module-0460.mjs";
import { IListService, WorkbenchList } from "./module-0636.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { DiffEditorWidget } from "./module-0527.mjs";
import { fixedDiffEditorOptions, fixedEditorOptions } from "./module-1942.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { DIFF_CELL_MARGIN } from "./module-1945.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/notebookDiffList.ts
var NotebookCellTextDiffListDelegate = class {
  constructor(targetWindow, configurationService) {
    this.configurationService = configurationService;
    const editorOptions = this.configurationService.getValue("editor");
    this.lineHeight = createBareFontInfoFromRawSettings(editorOptions, PixelRatio.getInstance(targetWindow).value).lineHeight;
  }
  getHeight(element) {
    return element.getHeight(this.lineHeight);
  }
  hasDynamicHeight(element) {
    return false;
  }
  getTemplateId(element) {
    switch (element.type) {
      case "delete":
      case "insert":
        return CellDiffSingleSideRenderer.TEMPLATE_ID;
      case "modified":
      case "unchanged":
        return CellDiffSideBySideRenderer.TEMPLATE_ID;
      case "placeholder":
        return CellDiffPlaceholderRenderer.TEMPLATE_ID;
      case "modifiedMetadata":
      case "unchangedMetadata":
        return NotebookDocumentMetadataDiffRenderer.TEMPLATE_ID;
    }
  }
};

NotebookCellTextDiffListDelegate = __decorateClass([
  __decorateParam(1, IConfigurationService)
], NotebookCellTextDiffListDelegate);

var CellDiffPlaceholderRenderer = class {
  constructor(notebookEditor, instantiationService) {
    this.notebookEditor = notebookEditor;
    this.instantiationService = instantiationService;
  }
  static {
    this.TEMPLATE_ID = "cell_diff_placeholder";
  }
  get templateId() {
    return CellDiffPlaceholderRenderer.TEMPLATE_ID;
  }
  renderTemplate(container2) {
    const body = $(".cell-placeholder-body");
    append(container2, body);
    const elementDisposables = new DisposableStore();
    const marginOverlay = new CollapsedCellOverlayWidget(body);
    const contents = append(body, $(".contents"));
    const placeholder = append(contents, $("span.text", { title: localize(17673, null) }));
    return {
      body,
      container: container2,
      placeholder,
      marginOverlay,
      elementDisposables
    };
  }
  renderElement(element, index2, templateData) {
    templateData.body.classList.remove("left", "right", "full");
    templateData.elementDisposables.add(this.instantiationService.createInstance(CellDiffPlaceholderElement, element, templateData));
  }
  disposeTemplate(templateData) {
    templateData.container.innerText = "";
  }
  disposeElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
  }
};

CellDiffPlaceholderRenderer = __decorateClass([
  __decorateParam(1, IInstantiationService)
], CellDiffPlaceholderRenderer);

var NotebookDocumentMetadataDiffRenderer = class {
  constructor(notebookEditor, instantiationService, contextMenuService, keybindingService, menuService, contextKeyService, notificationService, themeService, accessibilityService) {
    this.notebookEditor = notebookEditor;
    this.instantiationService = instantiationService;
    this.contextMenuService = contextMenuService;
    this.keybindingService = keybindingService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.notificationService = notificationService;
    this.themeService = themeService;
    this.accessibilityService = accessibilityService;
  }
  static {
    this.TEMPLATE_ID = "notebook_metadata_diff_side_by_side";
  }
  get templateId() {
    return NotebookDocumentMetadataDiffRenderer.TEMPLATE_ID;
  }
  renderTemplate(container2) {
    const body = $(".cell-body");
    append(container2, body);
    const diffEditorContainer = $(".cell-diff-editor-container");
    append(body, diffEditorContainer);
    const cellHeaderContainer = append(diffEditorContainer, $(".input-header-container"));
    const sourceContainer = append(diffEditorContainer, $(".source-container"));
    const { editor, editorContainer } = this._buildSourceEditor(sourceContainer);
    const inputToolbarContainer = append(sourceContainer, $(".editor-input-toolbar-container"));
    const cellToolbarContainer = append(inputToolbarContainer, $("div.property-toolbar"));
    const toolbar = this.instantiationService.createInstance(WorkbenchToolBar, cellToolbarContainer, {
      actionViewItemProvider: (action, options3) => {
        if (action instanceof MenuItemAction) {
          const item = new CodiconActionViewItem(action, { hoverDelegate: options3.hoverDelegate }, this.keybindingService, this.notificationService, this.contextKeyService, this.themeService, this.contextMenuService, this.accessibilityService);
          return item;
        }
        return void 0;
      },
      highlightToggledItems: true
    });
    const borderContainer = append(body, $(".border-container"));
    const leftBorder = append(borderContainer, $(".left-border"));
    const rightBorder = append(borderContainer, $(".right-border"));
    const topBorder = append(borderContainer, $(".top-border"));
    const bottomBorder = append(borderContainer, $(".bottom-border"));
    const marginOverlay = new UnchangedCellOverlayWidget(body);
    const elementDisposables = new DisposableStore();
    return {
      body,
      container: container2,
      diffEditorContainer,
      cellHeaderContainer,
      sourceEditor: editor,
      editorContainer,
      inputToolbarContainer,
      toolbar,
      leftBorder,
      rightBorder,
      topBorder,
      bottomBorder,
      marginOverlay,
      elementDisposables
    };
  }
  _buildSourceEditor(sourceContainer) {
    return buildDiffEditorWidget(this.instantiationService, this.notebookEditor, sourceContainer, { readOnly: true });
  }
  renderElement(element, index2, templateData) {
    templateData.body.classList.remove("full");
    templateData.elementDisposables.add(this.instantiationService.createInstance(NotebookDocumentMetadataElement, this.notebookEditor, element, templateData));
  }
  disposeTemplate(templateData) {
    templateData.container.innerText = "";
    templateData.sourceEditor.dispose();
    templateData.toolbar?.dispose();
    templateData.elementDisposables.dispose();
  }
  disposeElement(element, index2, templateData) {
    if (templateData.toolbar) {
      templateData.toolbar.context = void 0;
    }
    templateData.elementDisposables.clear();
  }
};

NotebookDocumentMetadataDiffRenderer = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IAccessibilityService)
], NotebookDocumentMetadataDiffRenderer);

var CellDiffSingleSideRenderer = class {
  constructor(notebookEditor, instantiationService) {
    this.notebookEditor = notebookEditor;
    this.instantiationService = instantiationService;
  }
  static {
    this.TEMPLATE_ID = "cell_diff_single";
  }
  get templateId() {
    return CellDiffSingleSideRenderer.TEMPLATE_ID;
  }
  renderTemplate(container2) {
    const body = $(".cell-body");
    append(container2, body);
    const diffEditorContainer = $(".cell-diff-editor-container");
    append(body, diffEditorContainer);
    const diagonalFill = append(body, $(".diagonal-fill"));
    const cellHeaderContainer = append(diffEditorContainer, $(".input-header-container"));
    const sourceContainer = append(diffEditorContainer, $(".source-container"));
    const { editor, editorContainer } = this._buildSourceEditor(sourceContainer);
    const metadataHeaderContainer = append(diffEditorContainer, $(".metadata-header-container"));
    const metadataInfoContainer = append(diffEditorContainer, $(".metadata-info-container"));
    const outputHeaderContainer = append(diffEditorContainer, $(".output-header-container"));
    const outputInfoContainer = append(diffEditorContainer, $(".output-info-container"));
    const borderContainer = append(body, $(".border-container"));
    const leftBorder = append(borderContainer, $(".left-border"));
    const rightBorder = append(borderContainer, $(".right-border"));
    const topBorder = append(borderContainer, $(".top-border"));
    const bottomBorder = append(borderContainer, $(".bottom-border"));
    return {
      body,
      container: container2,
      editorContainer,
      diffEditorContainer,
      diagonalFill,
      cellHeaderContainer,
      sourceEditor: editor,
      metadataHeaderContainer,
      metadataInfoContainer,
      outputHeaderContainer,
      outputInfoContainer,
      leftBorder,
      rightBorder,
      topBorder,
      bottomBorder,
      elementDisposables: new DisposableStore()
    };
  }
  _buildSourceEditor(sourceContainer) {
    return buildSourceEditor(this.instantiationService, this.notebookEditor, sourceContainer);
  }
  renderElement(element, index2, templateData) {
    templateData.body.classList.remove("left", "right", "full");
    switch (element.type) {
      case "delete":
        templateData.elementDisposables.add(this.instantiationService.createInstance(DeletedElement, this.notebookEditor, element, templateData));
        return;
      case "insert":
        templateData.elementDisposables.add(this.instantiationService.createInstance(InsertElement, this.notebookEditor, element, templateData));
        return;
      default:
        break;
    }
  }
  disposeTemplate(templateData) {
    templateData.container.innerText = "";
    templateData.sourceEditor.dispose();
    templateData.elementDisposables.dispose();
  }
  disposeElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
  }
};

CellDiffSingleSideRenderer = __decorateClass([
  __decorateParam(1, IInstantiationService)
], CellDiffSingleSideRenderer);

var CellDiffSideBySideRenderer = class {
  constructor(notebookEditor, instantiationService, contextMenuService, keybindingService, menuService, contextKeyService, notificationService, themeService, accessibilityService) {
    this.notebookEditor = notebookEditor;
    this.instantiationService = instantiationService;
    this.contextMenuService = contextMenuService;
    this.keybindingService = keybindingService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.notificationService = notificationService;
    this.themeService = themeService;
    this.accessibilityService = accessibilityService;
  }
  static {
    this.TEMPLATE_ID = "cell_diff_side_by_side";
  }
  get templateId() {
    return CellDiffSideBySideRenderer.TEMPLATE_ID;
  }
  renderTemplate(container2) {
    const body = $(".cell-body");
    append(container2, body);
    const diffEditorContainer = $(".cell-diff-editor-container");
    append(body, diffEditorContainer);
    const cellHeaderContainer = append(diffEditorContainer, $(".input-header-container"));
    const sourceContainer = append(diffEditorContainer, $(".source-container"));
    const { editor, editorContainer } = this._buildSourceEditor(sourceContainer);
    const inputToolbarContainer = append(sourceContainer, $(".editor-input-toolbar-container"));
    const cellToolbarContainer = append(inputToolbarContainer, $("div.property-toolbar"));
    const toolbar = this.instantiationService.createInstance(WorkbenchToolBar, cellToolbarContainer, {
      actionViewItemProvider: (action, options3) => {
        if (action instanceof MenuItemAction) {
          const item = new CodiconActionViewItem(action, { hoverDelegate: options3.hoverDelegate }, this.keybindingService, this.notificationService, this.contextKeyService, this.themeService, this.contextMenuService, this.accessibilityService);
          return item;
        }
        return void 0;
      },
      highlightToggledItems: true
    });
    const metadataHeaderContainer = append(diffEditorContainer, $(".metadata-header-container"));
    const metadataInfoContainer = append(diffEditorContainer, $(".metadata-info-container"));
    const outputHeaderContainer = append(diffEditorContainer, $(".output-header-container"));
    const outputInfoContainer = append(diffEditorContainer, $(".output-info-container"));
    const borderContainer = append(body, $(".border-container"));
    const leftBorder = append(borderContainer, $(".left-border"));
    const rightBorder = append(borderContainer, $(".right-border"));
    const topBorder = append(borderContainer, $(".top-border"));
    const bottomBorder = append(borderContainer, $(".bottom-border"));
    const marginOverlay = new UnchangedCellOverlayWidget(body);
    const elementDisposables = new DisposableStore();
    return {
      body,
      container: container2,
      diffEditorContainer,
      cellHeaderContainer,
      sourceEditor: editor,
      editorContainer,
      inputToolbarContainer,
      toolbar,
      metadataHeaderContainer,
      metadataInfoContainer,
      outputHeaderContainer,
      outputInfoContainer,
      leftBorder,
      rightBorder,
      topBorder,
      bottomBorder,
      marginOverlay,
      elementDisposables
    };
  }
  _buildSourceEditor(sourceContainer) {
    return buildDiffEditorWidget(this.instantiationService, this.notebookEditor, sourceContainer);
  }
  renderElement(element, index2, templateData) {
    templateData.body.classList.remove("left", "right", "full");
    switch (element.type) {
      case "unchanged":
        templateData.elementDisposables.add(this.instantiationService.createInstance(ModifiedElement, this.notebookEditor, element, templateData));
        return;
      case "modified":
        templateData.elementDisposables.add(this.instantiationService.createInstance(ModifiedElement, this.notebookEditor, element, templateData));
        return;
      default:
        break;
    }
  }
  disposeTemplate(templateData) {
    templateData.container.innerText = "";
    templateData.sourceEditor.dispose();
    templateData.toolbar?.dispose();
    templateData.elementDisposables.dispose();
  }
  disposeElement(element, index2, templateData) {
    if (templateData.toolbar) {
      templateData.toolbar.context = void 0;
    }
    templateData.elementDisposables.clear();
  }
};

CellDiffSideBySideRenderer = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IAccessibilityService)
], CellDiffSideBySideRenderer);

var NotebookMouseController = class extends MouseController {
  onViewPointer(e4) {
    if (isMonacoEditor(e4.browserEvent.target)) {
      const focus = typeof e4.index === "undefined" ? [] : [e4.index];
      this.list.setFocus(focus, e4.browserEvent);
    } else {
      super.onViewPointer(e4);
    }
  }
};

var NotebookTextDiffList = class extends WorkbenchList {
  get rowsContainer() {
    return this.view.containerDomNode;
  }
  constructor(listUser, container2, delegate, renderers, contextKeyService, options3, listService, configurationService, instantiationService) {
    super(listUser, container2, delegate, renderers, options3, contextKeyService, listService, configurationService, instantiationService);
  }
  createMouseController(options3) {
    return new NotebookMouseController(this);
  }
  getCellViewScrollTop(element) {
    const index2 = this.indexOf(element);
    return this.view.elementTop(index2);
  }
  getScrollHeight() {
    return this.view.scrollHeight;
  }
  triggerScrollFromMouseWheelEvent(browserEvent) {
    this.view.delegateScrollFromMouseWheelEvent(browserEvent);
  }
  delegateVerticalScrollbarPointerDown(browserEvent) {
    this.view.delegateVerticalScrollbarPointerDown(browserEvent);
  }
  clear() {
    super.splice(0, this.length);
  }
  updateElementHeight2(element, size3) {
    const viewIndex = this.indexOf(element);
    const focused = this.getFocus();
    this.view.updateElementHeight(viewIndex, size3, focused.length ? focused[0] : null);
  }
  style(styles) {
    const selectorSuffix = this.view.domId;
    if (!this.styleElement) {
      this.styleElement = createStyleSheet(this.view.domNode);
    }
    const suffix = selectorSuffix && `.${selectorSuffix}`;
    const content = [];
    if (styles.listBackground) {
      content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows { background: ${styles.listBackground}; }`);
    }
    if (styles.listFocusBackground) {
      content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
      content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`);
    }
    if (styles.listFocusForeground) {
      content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
    }
    if (styles.listActiveSelectionBackground) {
      content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
      content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`);
    }
    if (styles.listActiveSelectionForeground) {
      content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
    }
    if (styles.listFocusAndSelectionBackground) {
      content.push(`
				.monaco-drag-image${suffix},
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { background-color: ${styles.listFocusAndSelectionBackground}; }
			`);
    }
    if (styles.listFocusAndSelectionForeground) {
      content.push(`
				.monaco-drag-image${suffix},
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { color: ${styles.listFocusAndSelectionForeground}; }
			`);
    }
    if (styles.listInactiveFocusBackground) {
      content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color:  ${styles.listInactiveFocusBackground}; }`);
      content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color:  ${styles.listInactiveFocusBackground}; }`);
    }
    if (styles.listInactiveSelectionBackground) {
      content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color:  ${styles.listInactiveSelectionBackground}; }`);
      content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color:  ${styles.listInactiveSelectionBackground}; }`);
    }
    if (styles.listInactiveSelectionForeground) {
      content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listInactiveSelectionForeground}; }`);
    }
    if (styles.listHoverBackground) {
      content.push(`.monaco-list${suffix}:not(.drop-target) > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { background-color:  ${styles.listHoverBackground}; }`);
    }
    if (styles.listHoverForeground) {
      content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${styles.listHoverForeground}; }`);
    }
    if (styles.listSelectionOutline) {
      content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { outline: 1px dotted ${styles.listSelectionOutline}; outline-offset: -1px; }`);
    }
    if (styles.listFocusOutline) {
      content.push(`
				.monaco-drag-image${suffix},
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
			`);
    }
    if (styles.listInactiveFocusOutline) {
      content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px dotted ${styles.listInactiveFocusOutline}; outline-offset: -1px; }`);
    }
    if (styles.listHoverOutline) {
      content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
    }
    if (styles.listDropOverBackground) {
      content.push(`
				.monaco-list${suffix}.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-row.drop-target { background-color: ${styles.listDropOverBackground} !important; color: inherit !important; }
			`);
    }
    const newStyles = content.join("\n");
    if (newStyles !== this.styleElement.textContent) {
      this.styleElement.textContent = newStyles;
    }
  }
};

NotebookTextDiffList = __decorateClass([
  __decorateParam(6, IListService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IInstantiationService)
], NotebookTextDiffList);

function buildDiffEditorWidget(instantiationService, notebookEditor, sourceContainer, options3 = {}) {
  const editorContainer = append(sourceContainer, $(".editor-container"));
  const editor = instantiationService.createInstance(DiffEditorWidget, editorContainer, {
    ...fixedDiffEditorOptions,
    overflowWidgetsDomNode: notebookEditor.getOverflowContainerDomNode(),
    originalEditable: false,
    ignoreTrimWhitespace: false,
    automaticLayout: false,
    dimension: {
      height: 0,
      width: 0
    },
    renderSideBySide: true,
    useInlineViewWhenSpaceIsLimited: false,
    ...options3
  }, {
    originalEditor: getOptimizedNestedCodeEditorWidgetOptions(),
    modifiedEditor: getOptimizedNestedCodeEditorWidgetOptions()
  });
  return {
    editor,
    editorContainer
  };
}

function buildSourceEditor(instantiationService, notebookEditor, sourceContainer, options3 = {}) {
  const editorContainer = append(sourceContainer, $(".editor-container"));
  const skipContributions = [
    "editor.contrib.emptyTextEditorHint"
  ];
  const editor = instantiationService.createInstance(CodeEditorWidget, editorContainer, {
    ...fixedEditorOptions,
    glyphMargin: false,
    dimension: {
      width: (notebookEditor.getLayoutInfo().width - 2 * DIFF_CELL_MARGIN) / 2 - 18,
      height: 0
    },
    automaticLayout: false,
    overflowWidgetsDomNode: notebookEditor.getOverflowContainerDomNode(),
    allowVariableLineHeights: false,
    readOnly: true
  }, {
    contributions: EditorExtensionsRegistry.getEditorContributions().filter((c) => skipContributions.indexOf(c.id) === -1)
  });
  return { editor, editorContainer };
}
export { buildDiffEditorWidget, buildSourceEditor, NotebookCellTextDiffListDelegate, CellDiffPlaceholderRenderer, NotebookDocumentMetadataDiffRenderer, CellDiffSingleSideRenderer, CellDiffSideBySideRenderer, NotebookMouseController, NotebookTextDiffList };
