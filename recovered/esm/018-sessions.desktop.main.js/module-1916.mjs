// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/markupCell.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { CellEditorOptions } from "./module-1895.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { disposableTimeout, raceCancellation } from "./module-0036.mjs";
import { $, append, clearNode, hide, reset, show } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { collapsedCellTTPolicy } from "./module-1904.mjs";
import { EXPAND_CELL_INPUT_COMMAND_ID } from "./module-0942.mjs";
import { localize } from "./module-0001.mjs";
import { tokenizeToStringSync } from "./module-0430.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { WordHighlighterContribution } from "./module-0860.mjs";
import { safeSetInnerHtml } from "./module-0466.mjs";
import { renderIcon } from "./module-0467.mjs";
import { collapsedIcon, expandedIcon } from "./module-1846.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/markupCell.ts
var MarkupCell = class extends Disposable {
  constructor(notebookEditor, viewCell, templateData, renderedEditors, accessibilityService, contextKeyService, instantiationService, languageService, configurationService, keybindingService) {
    super();
    this.notebookEditor = notebookEditor;
    this.viewCell = viewCell;
    this.templateData = templateData;
    this.renderedEditors = renderedEditors;
    this.accessibilityService = accessibilityService;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.languageService = languageService;
    this.configurationService = configurationService;
    this.keybindingService = keybindingService;
    this.editor = null;
    this.localDisposables = this._register(new DisposableStore());
    this.focusSwitchDisposable = this._register(new MutableDisposable());
    this.editorDisposables = this._register(new DisposableStore());
    this._isDisposed = false;
    this.constructDOM();
    this.editorPart = templateData.editorPart;
    this.cellEditorOptions = this._register(new CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(viewCell.language), this.notebookEditor.notebookOptions, this.configurationService));
    this.cellEditorOptions.setLineNumbers(this.viewCell.lineNumbers);
    this.editorOptions = this.cellEditorOptions.getValue(this.viewCell.internalMetadata, this.viewCell.uri);
    this._register(toDisposable(() => renderedEditors.delete(this.viewCell)));
    this.registerListeners();
    this.templateData.cellParts.scheduleRenderCell(this.viewCell);
    this._register(toDisposable(() => {
      this.templateData.cellParts.unrenderCell(this.viewCell);
    }));
    this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => {
      this.viewUpdate();
    }));
    this.updateForHover();
    this.updateForFocusModeChange();
    this.foldingState = viewCell.foldingState;
    this.layoutFoldingIndicator();
    this.updateFoldingIconShowClass();
    if (this.viewCell.layoutInfo.totalHeight > 0) {
      this.relayoutCell();
    }
    this.viewUpdate();
    this.layoutCellParts();
    this._register(this.viewCell.onDidChangeLayout(() => {
      this.layoutCellParts();
    }));
  }
  layoutCellParts() {
    this.templateData.cellParts.updateInternalLayoutNow(this.viewCell);
  }
  constructDOM() {
    const id2 = `aria-markup-cell-${this.viewCell.id}`;
    this.markdownAccessibilityContainer = this.templateData.cellContainer;
    this.markdownAccessibilityContainer.id = id2;
    this.markdownAccessibilityContainer.style.height = "1px";
    this.markdownAccessibilityContainer.style.overflow = "hidden";
    this.markdownAccessibilityContainer.style.position = "absolute";
    this.markdownAccessibilityContainer.style.top = "100000px";
    this.markdownAccessibilityContainer.style.left = "10000px";
    this.markdownAccessibilityContainer.ariaHidden = "false";
    this.templateData.rootContainer.setAttribute("aria-describedby", id2);
    this.templateData.container.classList.toggle("webview-backed-markdown-cell", true);
  }
  registerListeners() {
    this._register(this.viewCell.onDidChangeState((e4) => {
      this.templateData.cellParts.updateState(this.viewCell, e4);
    }));
    this._register(this.viewCell.model.onDidChangeMetadata(() => {
      this.viewUpdate();
    }));
    this._register(this.viewCell.onDidChangeState((e4) => {
      if (e4.editStateChanged || e4.contentChanged) {
        this.viewUpdate();
      }
      if (e4.focusModeChanged) {
        this.updateForFocusModeChange();
      }
      if (e4.foldingStateChanged) {
        const foldingState = this.viewCell.foldingState;
        if (foldingState !== this.foldingState) {
          this.foldingState = foldingState;
          this.layoutFoldingIndicator();
        }
      }
      if (e4.cellIsHoveredChanged) {
        this.updateForHover();
      }
      if (e4.inputCollapsedChanged) {
        this.updateCollapsedState();
        this.viewUpdate();
      }
      if (e4.cellLineNumberChanged) {
        this.cellEditorOptions.setLineNumbers(this.viewCell.lineNumbers);
      }
    }));
    this._register(this.notebookEditor.notebookOptions.onDidChangeOptions((e4) => {
      if (e4.showFoldingControls) {
        this.updateFoldingIconShowClass();
      }
    }));
    this._register(this.viewCell.onDidChangeLayout((e4) => {
      const layoutInfo = this.editor?.getLayoutInfo();
      if (e4.outerWidth && this.viewCell.getEditState() === 1 /* Editing */ && layoutInfo && layoutInfo.width !== this.viewCell.layoutInfo.editorWidth) {
        this.onCellEditorWidthChange();
      }
    }));
    this._register(this.cellEditorOptions.onDidChange(() => this.updateMarkupCellOptions()));
  }
  updateMarkupCellOptions() {
    this.updateEditorOptions(this.cellEditorOptions.getUpdatedValue(this.viewCell.internalMetadata, this.viewCell.uri));
    if (this.editor) {
      this.editor.updateOptions(this.cellEditorOptions.getUpdatedValue(this.viewCell.internalMetadata, this.viewCell.uri));
      const cts = new CancellationTokenSource();
      this._register({ dispose() {
        cts.dispose(true);
      } });
      raceCancellation(this.viewCell.resolveTextModel(), cts.token).then((model) => {
        if (this._isDisposed) {
          return;
        }
        if (model) {
          model.updateOptions({
            indentSize: this.cellEditorOptions.indentSize,
            tabSize: this.cellEditorOptions.tabSize,
            insertSpaces: this.cellEditorOptions.insertSpaces
          });
        }
      });
    }
  }
  updateCollapsedState() {
    if (this.viewCell.isInputCollapsed) {
      this.notebookEditor.hideMarkupPreviews([this.viewCell]);
    } else {
      this.notebookEditor.unhideMarkupPreviews([this.viewCell]);
    }
  }
  updateForHover() {
    this.templateData.container.classList.toggle("markdown-cell-hover", this.viewCell.cellIsHovered);
  }
  updateForFocusModeChange() {
    if (this.viewCell.focusMode === 1 /* Editor */) {
      this.focusEditorIfNeeded();
    }
    this.templateData.container.classList.toggle("cell-editor-focus", this.viewCell.focusMode === 1 /* Editor */);
  }
  dispose() {
    this._isDisposed = true;
    if (this.notebookEditor.getActiveCell() === this.viewCell && this.viewCell.focusMode === 1 /* Editor */ && (this.notebookEditor.hasEditorFocus() || this.notebookEditor.getDomNode().ownerDocument.activeElement === this.notebookEditor.getDomNode().ownerDocument.body)) {
      this.notebookEditor.focusContainer();
    }
    this.viewCell.detachTextEditor();
    super.dispose();
  }
  updateFoldingIconShowClass() {
    const showFoldingIcon = this.notebookEditor.notebookOptions.getDisplayOptions().showFoldingControls;
    this.templateData.foldingIndicator.classList.remove("mouseover", "always");
    this.templateData.foldingIndicator.classList.add(showFoldingIcon);
  }
  viewUpdate() {
    if (this.viewCell.isInputCollapsed) {
      this.viewUpdateCollapsed();
    } else if (this.viewCell.getEditState() === 1 /* Editing */) {
      this.viewUpdateEditing();
    } else {
      this.viewUpdatePreview();
    }
  }
  viewUpdateCollapsed() {
    show(this.templateData.cellInputCollapsedContainer);
    hide(this.editorPart);
    this.templateData.cellInputCollapsedContainer.innerText = "";
    const markdownIcon = append(this.templateData.cellInputCollapsedContainer, $("span"));
    markdownIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.markdown));
    const element = $("div");
    element.classList.add("cell-collapse-preview");
    const richEditorText = this.getRichText(this.viewCell.textBuffer, this.viewCell.language);
    element.innerText = richEditorText;
    element.innerHTML = collapsedCellTTPolicy?.createHTML(richEditorText) ?? richEditorText;
    this.templateData.cellInputCollapsedContainer.appendChild(element);
    const expandIcon2 = append(element, $("span.expandInputIcon"));
    expandIcon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.more));
    const keybinding = this.keybindingService.lookupKeybinding(EXPAND_CELL_INPUT_COMMAND_ID);
    if (keybinding) {
      element.title = localize(17893, null, keybinding.getLabel());
      expandIcon2.title = localize(17892, null, keybinding.getLabel());
    }
    this.markdownAccessibilityContainer.ariaHidden = "true";
    this.templateData.container.classList.toggle("input-collapsed", true);
    this.viewCell.renderedMarkdownHeight = 0;
    this.viewCell.layoutChange({});
  }
  getRichText(buffer, language2) {
    return tokenizeToStringSync(this.languageService, buffer.getLineContent(1), language2);
  }
  viewUpdateEditing() {
    let editorHeight;
    show(this.editorPart);
    this.markdownAccessibilityContainer.ariaHidden = "true";
    hide(this.templateData.cellInputCollapsedContainer);
    this.notebookEditor.hideMarkupPreviews([this.viewCell]);
    this.templateData.container.classList.toggle("input-collapsed", false);
    this.templateData.container.classList.toggle("markdown-cell-edit-mode", true);
    if (this.editor && this.editor.hasModel()) {
      editorHeight = this.editor.getContentHeight();
      this.viewCell.attachTextEditor(this.editor);
      this.focusEditorIfNeeded();
      this.bindEditorListeners(this.editor);
      this.editor.layout({
        width: this.viewCell.layoutInfo.editorWidth,
        height: editorHeight
      });
    } else {
      this.editorDisposables.clear();
      const width2 = this.notebookEditor.notebookOptions.computeMarkdownCellEditorWidth(this.notebookEditor.getLayoutInfo().width);
      const lineNum = this.viewCell.lineCount;
      const lineHeight = this.viewCell.layoutInfo.fontInfo?.lineHeight || 17;
      const editorPadding = this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri);
      editorHeight = Math.max(lineNum, 1) * lineHeight + editorPadding.top + editorPadding.bottom;
      this.templateData.editorContainer.innerText = "";
      const editorContextKeyService = this.contextKeyService.createScoped(this.templateData.editorPart);
      EditorContextKeys.inCompositeEditor.bindTo(editorContextKeyService).set(true);
      const editorInstaService = this.editorDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, editorContextKeyService])));
      this.editorDisposables.add(editorContextKeyService);
      this.editor = this.editorDisposables.add(editorInstaService.createInstance(CodeEditorWidget, this.templateData.editorContainer, {
        ...this.editorOptions,
        dimension: {
          width: width2,
          height: editorHeight
        },
        allowVariableLineHeights: false
        // overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode()
      }, {
        contributions: this.notebookEditor.creationOptions.cellEditorContributions
      }));
      this.templateData.currentEditor = this.editor;
      this.editorDisposables.add(this.editor.onDidBlurEditorWidget(() => {
        if (this.editor) {
          WordHighlighterContribution.get(this.editor)?.stopHighlighting();
        }
      }));
      this.editorDisposables.add(this.editor.onDidFocusEditorWidget(() => {
        if (this.editor) {
          WordHighlighterContribution.get(this.editor)?.restoreViewState(true);
        }
      }));
      const cts = new CancellationTokenSource();
      this.editorDisposables.add({ dispose() {
        cts.dispose(true);
      } });
      raceCancellation(this.viewCell.resolveTextModel(), cts.token).then((model) => {
        if (!model) {
          return;
        }
        this.editor.setModel(model);
        model.updateOptions({
          indentSize: this.cellEditorOptions.indentSize,
          tabSize: this.cellEditorOptions.tabSize,
          insertSpaces: this.cellEditorOptions.insertSpaces
        });
        const realContentHeight = this.editor.getContentHeight();
        if (realContentHeight !== editorHeight) {
          this.editor.layout(
            {
              width: width2,
              height: realContentHeight
            }
          );
          editorHeight = realContentHeight;
        }
        this.viewCell.attachTextEditor(this.editor);
        if (this.viewCell.getEditState() === 1 /* Editing */) {
          this.focusEditorIfNeeded();
        }
        this.bindEditorListeners(this.editor);
        this.viewCell.editorHeight = editorHeight;
      });
    }
    this.viewCell.editorHeight = editorHeight;
    this.focusEditorIfNeeded();
    this.renderedEditors.set(this.viewCell, this.editor);
  }
  viewUpdatePreview() {
    this.viewCell.detachTextEditor();
    hide(this.editorPart);
    hide(this.templateData.cellInputCollapsedContainer);
    this.markdownAccessibilityContainer.ariaHidden = "false";
    this.templateData.container.classList.toggle("input-collapsed", false);
    this.templateData.container.classList.toggle("markdown-cell-edit-mode", false);
    this.renderedEditors.delete(this.viewCell);
    this.markdownAccessibilityContainer.innerText = "";
    if (this.viewCell.renderedHtml) {
      if (this.accessibilityService.isScreenReaderOptimized()) {
        safeSetInnerHtml(this.markdownAccessibilityContainer, this.viewCell.renderedHtml);
      } else {
        clearNode(this.markdownAccessibilityContainer);
      }
    }
    this.notebookEditor.createMarkupPreview(this.viewCell);
  }
  focusEditorIfNeeded() {
    if (this.viewCell.focusMode === 1 /* Editor */ && (this.notebookEditor.hasEditorFocus() || this.notebookEditor.getDomNode().ownerDocument.activeElement === this.notebookEditor.getDomNode().ownerDocument.body)) {
      if (!this.editor) {
        return;
      }
      this.editor.focus();
      const primarySelection = this.editor.getSelection();
      if (!primarySelection) {
        return;
      }
      this.notebookEditor.revealRangeInViewAsync(this.viewCell, primarySelection);
    }
  }
  layoutEditor(dimension) {
    this.editor?.layout(dimension);
  }
  onCellEditorWidthChange() {
    const realContentHeight = this.editor.getContentHeight();
    this.layoutEditor(
      {
        width: this.viewCell.layoutInfo.editorWidth,
        height: realContentHeight
      }
    );
  }
  relayoutCell() {
    this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
    this.layoutFoldingIndicator();
  }
  updateEditorOptions(newValue) {
    this.editorOptions = newValue;
    this.editor?.updateOptions(this.editorOptions);
  }
  layoutFoldingIndicator() {
    switch (this.foldingState) {
      case 0 /* None */:
        this.templateData.foldingIndicator.style.display = "none";
        this.templateData.foldingIndicator.innerText = "";
        break;
      case 2 /* Collapsed */:
        this.templateData.foldingIndicator.style.display = "";
        reset(this.templateData.foldingIndicator, renderIcon(collapsedIcon));
        break;
      case 1 /* Expanded */:
        this.templateData.foldingIndicator.style.display = "";
        reset(this.templateData.foldingIndicator, renderIcon(expandedIcon));
        break;
      default:
        break;
    }
  }
  bindEditorListeners(editor) {
    this.localDisposables.clear();
    this.focusSwitchDisposable.clear();
    this.localDisposables.add(editor.onDidContentSizeChange((e4) => {
      if (e4.contentHeightChanged) {
        this.onCellEditorHeightChange(editor, e4.contentHeight);
      }
    }));
    this.localDisposables.add(editor.onDidChangeCursorSelection((e4) => {
      if (e4.source === "restoreState") {
        return;
      }
      const selections = editor.getSelections();
      if (selections?.length) {
        const contentHeight = editor.getContentHeight();
        const layoutContentHeight = this.viewCell.layoutInfo.editorHeight;
        if (contentHeight !== layoutContentHeight) {
          this.onCellEditorHeightChange(editor, contentHeight);
        }
        const lastSelection = selections[selections.length - 1];
        this.notebookEditor.revealRangeInViewAsync(this.viewCell, lastSelection);
      }
    }));
    const updateFocusMode = () => this.viewCell.focusMode = editor.hasWidgetFocus() ? 1 /* Editor */ : 0 /* Container */;
    this.localDisposables.add(editor.onDidFocusEditorWidget(() => {
      updateFocusMode();
    }));
    this.localDisposables.add(editor.onDidBlurEditorWidget(() => {
      if (this.templateData.container.ownerDocument.activeElement?.contains(this.templateData.container)) {
        this.focusSwitchDisposable.value = disposableTimeout(() => updateFocusMode(), 300);
      } else {
        updateFocusMode();
      }
    }));
    updateFocusMode();
  }
  onCellEditorHeightChange(editor, newHeight) {
    const viewLayout = editor.getLayoutInfo();
    this.viewCell.editorHeight = newHeight;
    editor.layout(
      {
        width: viewLayout.width,
        height: newHeight
      }
    );
  }
};

MarkupCell = __decorateClass([
  __decorateParam(4, IAccessibilityService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, ILanguageService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IKeybindingService)
], MarkupCell);
export { MarkupCell };
