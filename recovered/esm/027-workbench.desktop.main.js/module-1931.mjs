// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/codeCell.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { CellEditorOptions } from "./module-1918.mjs";
import { CellOutputContainer } from "./module-1929.mjs";
import { outputDisplayLimit } from "./module-1900.mjs";
import { $, addDisposableListener, append, getWindow, hide, modify, runAtThisOrScheduleAtNextAnimationFrame, setVisibility, show } from "./module-0075.mjs";
import { Event2 } from "./module-0017.mjs";
import { CollapsedCodeCellExecutionIcon } from "./module-1930.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { raceCancellation } from "./module-0036.mjs";
import { clamp } from "./module-0040.mjs";
import { CodeActionController } from "./module-0566.mjs";
import { collapsedCellTTPolicy } from "./module-1927.mjs";
import { EXPAND_CELL_INPUT_COMMAND_ID } from "./module-0941.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { tokenizeToStringSync } from "./module-0430.mjs";
import { escape } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";
import { INotebookLoggingService } from "./module-1395.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/codeCell.ts
var CodeCell = class extends Disposable {
  constructor(notebookEditor, viewCell, templateData, editorPool, instantiationService, keybindingService, languageService, configurationService, notebookExecutionStateService, notebookLogService) {
    super();
    this.notebookEditor = notebookEditor;
    this.viewCell = viewCell;
    this.templateData = templateData;
    this.editorPool = editorPool;
    this.instantiationService = instantiationService;
    this.keybindingService = keybindingService;
    this.languageService = languageService;
    this.configurationService = configurationService;
    this._isDisposed = false;
    this._useNewApproachForEditorLayout = true;
    this._pointerDownInEditor = false;
    this._pointerDraggingInEditor = false;
    const cellIndex = this.notebookEditor.getCellIndex(this.viewCell);
    const debugPrefix = `[Cell ${cellIndex}]`;
    const debug = this._debug = (output) => {
      notebookLogService.debug("CellLayout", `${debugPrefix} ${output}`);
    };
    this._cellEditorOptions = this._register(new CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(viewCell.language), this.notebookEditor.notebookOptions, this.configurationService));
    this._outputContainerRenderer = this.instantiationService.createInstance(CellOutputContainer, notebookEditor, viewCell, templateData, { limit: outputDisplayLimit });
    this.cellParts = this._register(templateData.cellParts.concatContentPart([this._cellEditorOptions, this._outputContainerRenderer], getWindow(notebookEditor.getDomNode())));
    const initialEditorDimension = { height: this.calculateInitEditorHeight(), width: this.viewCell.layoutInfo.editorWidth };
    this._cellLayout = new CodeCellLayout(this._useNewApproachForEditorLayout, notebookEditor, viewCell, templateData, { debug }, initialEditorDimension);
    this.initializeEditor(initialEditorDimension);
    this._renderedInputCollapseState = false;
    this.registerNotebookEditorListeners();
    this.registerViewCellLayoutChange();
    this.registerCellEditorEventListeners();
    this.registerMouseListener();
    this._register(Event2.any(this.viewCell.onDidStartExecution, this.viewCell.onDidStopExecution)((e) => {
      this.cellParts.updateForExecutionState(this.viewCell, e);
    }));
    this._register(this.viewCell.onDidChangeState((e) => {
      this.cellParts.updateState(this.viewCell, e);
      if (e.outputIsHoveredChanged) {
        this.updateForOutputHover();
      }
      if (e.outputIsFocusedChanged) {
        this.updateForOutputFocus();
      }
      if (e.metadataChanged || e.internalMetadataChanged) {
        this.updateEditorOptions();
      }
      if (e.inputCollapsedChanged || e.outputCollapsedChanged) {
        this.viewCell.pauseLayout();
        const updated = this.updateForCollapseState();
        this.viewCell.resumeLayout();
        if (updated) {
          this.relayoutCell();
        }
      }
      if (e.focusModeChanged) {
        this.updateEditorForFocusModeChange(true);
      }
    }));
    this.updateEditorOptions();
    this.updateEditorForFocusModeChange(false);
    this.updateForOutputHover();
    this.updateForOutputFocus();
    this.cellParts.scheduleRenderCell(this.viewCell);
    this._register(toDisposable(() => {
      this.cellParts.unrenderCell(this.viewCell);
    }));
    this.viewCell.editorHeight = initialEditorDimension.height;
    this._outputContainerRenderer.render();
    this._renderedOutputCollapseState = false;
    this.initialViewUpdateExpanded();
    this._register(this.viewCell.onLayoutInfoRead(() => {
      this.cellParts.prepareLayout();
    }));
    const executionItemElement = append(this.templateData.cellInputCollapsedContainer, $(".collapsed-execution-icon"));
    this._register(toDisposable(() => {
      executionItemElement.remove();
    }));
    this._collapsedExecutionIcon = this._register(this.instantiationService.createInstance(CollapsedCodeCellExecutionIcon, this.notebookEditor, this.viewCell, executionItemElement));
    this.updateForCollapseState();
    this._register(Event2.runAndSubscribe(viewCell.onDidChangeOutputs, this.updateForOutputs.bind(this)));
    this._register(Event2.runAndSubscribe(viewCell.onDidChangeLayout, this.updateForLayout.bind(this)));
    this._cellEditorOptions.setLineNumbers(this.viewCell.lineNumbers);
    templateData.editor.updateOptions(this._cellEditorOptions.getUpdatedValue(this.viewCell.internalMetadata, this.viewCell.uri));
  }
  updateCodeCellOptions(templateData) {
    templateData.editor.updateOptions(this._cellEditorOptions.getUpdatedValue(this.viewCell.internalMetadata, this.viewCell.uri));
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
          indentSize: this._cellEditorOptions.indentSize,
          tabSize: this._cellEditorOptions.tabSize,
          insertSpaces: this._cellEditorOptions.insertSpaces
        });
      }
    });
  }
  updateForLayout() {
    this._pendingLayout?.dispose();
    this._pendingLayout = modify(getWindow(this.notebookEditor.getDomNode()), () => {
      this.cellParts.updateInternalLayoutNow(this.viewCell);
    });
  }
  updateForOutputHover() {
    this.templateData.container.classList.toggle("cell-output-hover", this.viewCell.outputIsHovered);
  }
  updateForOutputFocus() {
    this.templateData.container.classList.toggle("cell-output-focus", this.viewCell.outputIsFocused);
  }
  calculateInitEditorHeight() {
    const lineNum = this.viewCell.lineCount;
    const lineHeight = this.viewCell.layoutInfo.fontInfo?.lineHeight || 17;
    const editorPadding = this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri);
    const editorHeight = this.viewCell.layoutInfo.editorHeight === 0 ? lineNum * lineHeight + editorPadding.top + editorPadding.bottom : this.viewCell.layoutInfo.editorHeight;
    return editorHeight;
  }
  initializeEditor(dimension) {
    this._debug(`Initialize Editor ${dimension.height} x ${dimension.width}, Scroll Top = ${this.notebookEditor.scrollTop}`);
    this._cellLayout.layoutEditor("init");
    this.layoutEditor(dimension);
    const cts = new CancellationTokenSource();
    this._register({ dispose() {
      cts.dispose(true);
    } });
    raceCancellation(this.viewCell.resolveTextModel(), cts.token).then((model) => {
      if (this._isDisposed || model?.isDisposed()) {
        return;
      }
      if (model && this.templateData.editor) {
        this._reigsterModelListeners(model);
        this.templateData.editor.setModel(model);
        if (this._isDisposed) {
          return;
        }
        model.updateOptions({
          indentSize: this._cellEditorOptions.indentSize,
          tabSize: this._cellEditorOptions.tabSize,
          insertSpaces: this._cellEditorOptions.insertSpaces
        });
        this.viewCell.attachTextEditor(this.templateData.editor, this.viewCell.layoutInfo.estimatedHasHorizontalScrolling);
        const focusEditorIfNeeded = () => {
          if (this.notebookEditor.getActiveCell() === this.viewCell && this.viewCell.focusMode === 1 /* Editor */ && (this.notebookEditor.hasEditorFocus() || this.notebookEditor.getDomNode().ownerDocument.activeElement === this.notebookEditor.getDomNode().ownerDocument.body)) {
            this.templateData.editor.focus();
          }
        };
        focusEditorIfNeeded();
        const realContentHeight = this.templateData.editor.getContentHeight();
        if (realContentHeight !== dimension.height) {
          this.onCellEditorHeightChange("onDidResolveTextModel");
        }
        if (this._isDisposed) {
          return;
        }
        focusEditorIfNeeded();
      }
      this._register(this._cellEditorOptions.onDidChange(() => this.updateCodeCellOptions(this.templateData)));
    });
  }
  updateForOutputs() {
    setVisibility(this.viewCell.outputsViewModels.length > 0, this.templateData.focusSinkElement);
  }
  updateEditorOptions() {
    const editor = this.templateData.editor;
    if (!editor) {
      return;
    }
    const isReadonly = this.notebookEditor.isReadOnly;
    const padding = this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri);
    const options3 = editor.getOptions();
    if (options3.get(104 /* readOnly */) !== isReadonly || options3.get(96 /* padding */) !== padding) {
      editor.updateOptions({
        readOnly: this.notebookEditor.isReadOnly,
        padding: this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri)
      });
    }
  }
  registerNotebookEditorListeners() {
    this._register(this.notebookEditor.onDidScroll(() => {
      this.adjustEditorPosition();
      this._cellLayout.layoutEditor("nbDidScroll");
    }));
    this._register(this.notebookEditor.onDidChangeLayout(() => {
      this.adjustEditorPosition();
      this.onCellWidthChange("nbLayoutChange");
    }));
  }
  adjustEditorPosition() {
    if (this._useNewApproachForEditorLayout) {
      return;
    }
    const extraOffset = -6 - 1;
    const min = 0;
    const scrollTop = this.notebookEditor.scrollTop;
    const elementTop = this.notebookEditor.getAbsoluteTopOfElement(this.viewCell);
    const diff4 = scrollTop - elementTop + extraOffset;
    const notebookEditorLayout = this.notebookEditor.getLayoutInfo();
    const editorMaxHeight = notebookEditorLayout.height - notebookEditorLayout.stickyHeight - 26;
    const maxTop = this.viewCell.layoutInfo.editorHeight - editorMaxHeight;
    const top2 = maxTop > 20 ? clamp(min, diff4, maxTop) : min;
    this.templateData.editorPart.style.top = `${top2}px`;
    this.templateData.editor.setScrollTop(top2);
  }
  registerViewCellLayoutChange() {
    this._register(this.viewCell.onDidChangeLayout((e) => {
      if (e.outerWidth !== void 0) {
        const layoutInfo = this.templateData.editor.getLayoutInfo();
        if (layoutInfo.width !== this.viewCell.layoutInfo.editorWidth) {
          this.onCellWidthChange("viewCellLayoutChange");
          this.adjustEditorPosition();
        }
      }
    }));
  }
  registerCellEditorEventListeners() {
    this._register(this.templateData.editor.onDidContentSizeChange((e) => {
      if (e.contentHeightChanged) {
        if (this.viewCell.layoutInfo.editorHeight !== e.contentHeight) {
          this.onCellEditorHeightChange(`onDidContentSizeChange`);
          this.adjustEditorPosition();
        }
      }
    }));
    if (this._useNewApproachForEditorLayout) {
      this._register(this.templateData.editor.onDidScrollChange((e) => {
        if (this._pointerDownInEditor || this._pointerDraggingInEditor) {
          return;
        }
        if (this._cellLayout.editorVisibility === "Invisible" || !this.templateData.editor.hasTextFocus()) {
          return;
        }
        if (this._cellLayout._lastChangedEditorScrolltop === e.scrollTop || this._cellLayout.isUpdatingLayout) {
          return;
        }
        const scrollTop = this.notebookEditor.scrollTop;
        const diff4 = e.scrollTop - (this._cellLayout._lastChangedEditorScrolltop ?? 0);
        if (this._cellLayout.editorVisibility === "Full (Small Viewport)" && typeof this._cellLayout._lastChangedEditorScrolltop === "number") {
          this._debug(`Scroll Change (1) = ${e.scrollTop} changed by ${diff4} (notebook scrollTop: ${scrollTop}, setEditorScrollTop: ${e.scrollTop})`);
        } else if (this._cellLayout.editorVisibility === "Bottom Clipped" && typeof this._cellLayout._lastChangedEditorScrolltop === "number") {
          this._debug(`Scroll Change (2) = ${e.scrollTop} changed by ${diff4} (notebook scrollTop: ${scrollTop}, setNotebookScrollTop: ${scrollTop + e.scrollTop})`);
          this.notebookEditor.setScrollTop(scrollTop + e.scrollTop);
        } else if (this._cellLayout.editorVisibility === "Top Clipped" && typeof this._cellLayout._lastChangedEditorScrolltop === "number") {
          const newScrollTop = scrollTop + diff4 - 1;
          this._debug(`Scroll Change (3) = ${e.scrollTop} changed by ${diff4} (notebook scrollTop: ${scrollTop}, setNotebookScrollTop?: ${newScrollTop})`);
          if (scrollTop !== newScrollTop) {
            this.notebookEditor.setScrollTop(newScrollTop);
          }
        } else {
          this._debug(`Scroll Change (4) = ${e.scrollTop} changed by ${diff4} (notebook scrollTop: ${scrollTop})`);
          this._cellLayout._lastChangedEditorScrolltop = void 0;
        }
      }));
    }
    this._register(this.templateData.editor.onDidChangeCursorSelection((e) => {
      if (
        // do not reveal the cell into view if this selection change was caused by restoring editors
        e.source === "restoreState" || e.oldModelVersionId === 0 || !this.templateData.editor.hasTextFocus()
      ) {
        return;
      }
      if ((this._pointerDownInEditor || this._pointerDraggingInEditor) && this._useNewApproachForEditorLayout) {
        return;
      }
      const selections = this.templateData.editor.getSelections();
      if (selections?.length) {
        const contentHeight = this.templateData.editor.getContentHeight();
        const layoutContentHeight = this.viewCell.layoutInfo.editorHeight;
        if (contentHeight !== layoutContentHeight) {
          if (!this._useNewApproachForEditorLayout) {
            this._debug(`onDidChangeCursorSelection`);
            this.onCellEditorHeightChange("onDidChangeCursorSelection");
          }
          if (this._isDisposed) {
            return;
          }
        }
        const lastSelection = selections[selections.length - 1];
        this.notebookEditor.revealRangeInViewAsync(this.viewCell, lastSelection);
      }
    }));
    this._register(this.templateData.editor.onDidBlurEditorWidget(() => {
      CodeActionController.get(this.templateData.editor)?.hideLightBulbWidget();
    }));
  }
  _reigsterModelListeners(model) {
    this._register(model.onDidChangeTokens(() => {
      if (this.viewCell.isInputCollapsed && this._inputCollapseElement) {
        const content2 = this._getRichTextFromLineTokens(model);
        this._inputCollapseElement.innerHTML = collapsedCellTTPolicy?.createHTML(content2) ?? content2;
        this._attachInputExpandButton(this._inputCollapseElement);
      }
    }));
  }
  registerMouseListener() {
    const resetPointerState = () => {
      this._pointerDownInEditor = false;
      this._pointerDraggingInEditor = false;
      this._cellLayout.setPointerDown(false);
    };
    this._register(this.templateData.editor.onMouseDown((e) => {
      if (e.event.rightButton) {
        e.event.preventDefault();
      }
      if (this._useNewApproachForEditorLayout) {
        if (e.event.leftButton) {
          this._pointerDownInEditor = true;
          this._pointerDraggingInEditor = false;
          this._cellLayout.setPointerDown(false);
        }
      }
    }));
    if (this._useNewApproachForEditorLayout) {
      this._register(this.templateData.editor.onMouseMove((e) => {
        if (!this._pointerDownInEditor) {
          return;
        }
        if (!e.event.leftButton) {
          resetPointerState();
          return;
        }
        if (!this._pointerDraggingInEditor) {
          this._pointerDraggingInEditor = true;
          this._cellLayout.setPointerDown(true);
        }
      }));
    }
    if (this._useNewApproachForEditorLayout) {
      const win = getWindow(this.notebookEditor.getDomNode());
      this._register(addDisposableListener(win, "mouseup", resetPointerState));
      this._register(addDisposableListener(win, "pointerup", resetPointerState));
      this._register(addDisposableListener(win, "pointercancel", resetPointerState));
      this._register(addDisposableListener(win, "blur", resetPointerState));
      this._register(addDisposableListener(win, "keydown", (e) => {
        if (e.key === "Escape" && (this._pointerDownInEditor || this._pointerDraggingInEditor)) {
          resetPointerState();
        }
      }));
    }
  }
  shouldPreserveEditor() {
    return this.notebookEditor.getActiveCell() === this.viewCell && this.viewCell.focusMode === 1 /* Editor */ && (this.notebookEditor.hasEditorFocus() || this.notebookEditor.getDomNode().ownerDocument.activeElement === this.notebookEditor.getDomNode().ownerDocument.body);
  }
  updateEditorForFocusModeChange(sync) {
    if (this.shouldPreserveEditor()) {
      if (sync) {
        this.templateData.editor.focus();
      } else {
        this._register(runAtThisOrScheduleAtNextAnimationFrame(getWindow(this.templateData.container), () => {
          this.templateData.editor.focus();
        }));
      }
    }
    this.templateData.container.classList.toggle("cell-editor-focus", this.viewCell.focusMode === 1 /* Editor */);
    this.templateData.container.classList.toggle("cell-output-focus", this.viewCell.focusMode === 2 /* Output */);
  }
  updateForCollapseState() {
    if (this.viewCell.isOutputCollapsed === this._renderedOutputCollapseState && this.viewCell.isInputCollapsed === this._renderedInputCollapseState) {
      return false;
    }
    this.viewCell.layoutChange({ editorHeight: true });
    if (this.viewCell.isInputCollapsed) {
      this._collapseInput();
    } else {
      this._showInput();
    }
    if (this.viewCell.isOutputCollapsed) {
      this._collapseOutput();
    } else {
      this._showOutput(false);
    }
    this.relayoutCell();
    this._renderedOutputCollapseState = this.viewCell.isOutputCollapsed;
    this._renderedInputCollapseState = this.viewCell.isInputCollapsed;
    return true;
  }
  _collapseInput() {
    hide(this.templateData.editorPart);
    this.templateData.container.classList.toggle("input-collapsed", true);
    this._removeInputCollapsePreview();
    this._collapsedExecutionIcon.setVisibility(true);
    const richEditorText = this.templateData.editor.hasModel() ? this._getRichTextFromLineTokens(this.templateData.editor.getModel()) : this._getRichText(this.viewCell.textBuffer, this.viewCell.language);
    const element = $("div.cell-collapse-preview");
    element.innerHTML = collapsedCellTTPolicy?.createHTML(richEditorText) ?? richEditorText;
    this._inputCollapseElement = element;
    this.templateData.cellInputCollapsedContainer.appendChild(element);
    this._attachInputExpandButton(element);
    show(this.templateData.cellInputCollapsedContainer);
  }
  _attachInputExpandButton(element) {
    const expandIcon2 = $("span.expandInputIcon");
    const keybinding = this.keybindingService.lookupKeybinding(EXPAND_CELL_INPUT_COMMAND_ID);
    if (keybinding) {
      element.title = localize(17881, null, keybinding.getLabel());
      expandIcon2.title = localize(17880, null, keybinding.getLabel());
    }
    expandIcon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.more));
    element.appendChild(expandIcon2);
  }
  _showInput() {
    this._collapsedExecutionIcon.setVisibility(false);
    show(this.templateData.editorPart);
    hide(this.templateData.cellInputCollapsedContainer);
  }
  _getRichText(buffer, language2) {
    return tokenizeToStringSync(this.languageService, buffer.getLineContent(1), language2);
  }
  _getRichTextFromLineTokens(model) {
    let result = `<div class="monaco-tokenized-source">`;
    const firstLineTokens = model.tokenization.getLineTokens(1);
    const viewLineTokens = firstLineTokens.inflate();
    const line = model.getLineContent(1);
    let startOffset = 0;
    for (let j = 0, lenJ = viewLineTokens.getCount(); j < lenJ; j++) {
      const type = viewLineTokens.getClassName(j);
      const endIndex = viewLineTokens.getEndOffset(j);
      result += `<span class="${type}">${escape(line.substring(startOffset, endIndex))}</span>`;
      startOffset = endIndex;
    }
    result += `</div>`;
    return result;
  }
  _removeInputCollapsePreview() {
    const children = this.templateData.cellInputCollapsedContainer.children;
    const elements = [];
    for (let i2 = 0; i2 < children.length; i2++) {
      if (children[i2].classList.contains("cell-collapse-preview")) {
        elements.push(children[i2]);
      }
    }
    elements.forEach((element) => {
      element.remove();
    });
  }
  _updateOutputInnerContainer(hide4) {
    const children = this.templateData.outputContainer.domNode.children;
    for (let i2 = 0; i2 < children.length; i2++) {
      if (children[i2].classList.contains("output-inner-container")) {
        setVisibility(!hide4, children[i2]);
      }
    }
  }
  _collapseOutput() {
    this.templateData.container.classList.toggle("output-collapsed", true);
    show(this.templateData.cellOutputCollapsedContainer);
    this._updateOutputInnerContainer(true);
    this._outputContainerRenderer.viewUpdateHideOuputs();
  }
  _showOutput(initRendering) {
    this.templateData.container.classList.toggle("output-collapsed", false);
    hide(this.templateData.cellOutputCollapsedContainer);
    this._updateOutputInnerContainer(false);
    this._outputContainerRenderer.viewUpdateShowOutputs(initRendering);
  }
  initialViewUpdateExpanded() {
    this.templateData.container.classList.toggle("input-collapsed", false);
    show(this.templateData.editorPart);
    hide(this.templateData.cellInputCollapsedContainer);
    this.templateData.container.classList.toggle("output-collapsed", false);
    this._showOutput(true);
  }
  layoutEditor(dimension) {
    if (this._useNewApproachForEditorLayout) {
      return;
    }
    const editorLayout = this.notebookEditor.getLayoutInfo();
    const maxHeight = Math.min(
      editorLayout.height - editorLayout.stickyHeight - 26,
      dimension.height
    );
    this._debug(`Layout Editor: Width = ${dimension.width}, Height = ${maxHeight} (Requested: ${dimension.height}, Editor Layout Height: ${editorLayout.height}, Sticky: ${editorLayout.stickyHeight})`);
    this.templateData.editor.layout({
      width: dimension.width,
      height: maxHeight
    }, true);
  }
  onCellWidthChange(dbgReasonForChange) {
    this._debug(`Cell Editor Width Change, ${dbgReasonForChange}, Content Height = ${this.templateData.editor.getContentHeight()}`);
    const height = this.templateData.editor.getContentHeight();
    if (this.templateData.editor.hasModel()) {
      this._debug(`**** Updating Cell Editor Height (1), ContentHeight: ${height}, CodeCellLayoutInfo.EditorWidth ${this.viewCell.layoutInfo.editorWidth}, EditorLayoutInfo ${this.templateData.editor.getLayoutInfo().height} ****`);
      this.viewCell.editorHeight = height;
      this.relayoutCell();
      this.layoutEditor(
        {
          width: this.viewCell.layoutInfo.editorWidth,
          height
        }
      );
    } else {
      this._debug(`Cell Editor Width Change without model, return (1), ContentHeight: ${height}, CodeCellLayoutInfo.EditorWidth ${this.viewCell.layoutInfo.editorWidth}, EditorLayoutInfo ${this.templateData.editor.getLayoutInfo().height}`);
    }
    this._cellLayout.layoutEditor(dbgReasonForChange);
  }
  onCellEditorHeightChange(dbgReasonForChange) {
    const height = this.templateData.editor.getContentHeight();
    if (!this.templateData.editor.hasModel()) {
      this._debug(`Cell Editor Height Change without model, return (2), ContentHeight: ${height}, CodeCellLayoutInfo.EditorWidth ${this.viewCell.layoutInfo.editorWidth}, EditorLayoutInfo ${this.templateData.editor.getLayoutInfo()}`);
    }
    this._debug(`Cell Editor Height Change (${dbgReasonForChange}): ${height}`);
    this._debug(`**** Updating Cell Editor Height (2), ContentHeight: ${height}, CodeCellLayoutInfo.EditorWidth ${this.viewCell.layoutInfo.editorWidth}, EditorLayoutInfo ${this.templateData.editor.getLayoutInfo().height} ****`);
    const viewLayout = this.templateData.editor.getLayoutInfo();
    this.viewCell.editorHeight = height;
    this.relayoutCell();
    this.layoutEditor(
      {
        width: viewLayout.width,
        height
      }
    );
    this._cellLayout.layoutEditor(dbgReasonForChange);
  }
  relayoutCell() {
    this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
  }
  dispose() {
    this._isDisposed = true;
    if (this.shouldPreserveEditor()) {
      this.editorPool.preserveFocusedEditor(this.viewCell);
    }
    this.viewCell.detachTextEditor();
    this._removeInputCollapsePreview();
    this._outputContainerRenderer.dispose();
    this._pendingLayout?.dispose();
    super.dispose();
  }
};

CodeCell = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, ILanguageService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, INotebookExecutionStateService),
  __decorateParam(9, INotebookLoggingService)
], CodeCell);

var CodeCellLayout = class {
  constructor(_enabled, notebookEditor, viewCell, templateData, _logService, _initialEditorDimension) {
    this._enabled = _enabled;
    this.notebookEditor = notebookEditor;
    this.viewCell = viewCell;
    this.templateData = templateData;
    this._logService = _logService;
    this._initialEditorDimension = _initialEditorDimension;
    this._initialized = false;
    this._pointerDown = false;
  }
  get editorVisibility() {
    return this._editorVisibility;
  }
  get isUpdatingLayout() {
    return this._isUpdatingLayout;
  }
  setPointerDown(isDown) {
    this._pointerDown = isDown;
  }
  /**
   * Dynamically lays out the code cell's Monaco editor to simulate a "sticky" run/exec area while
   * constraining the visible editor height to the notebook viewport. It adjusts two things:
   *  - The absolute `top` offset of the editor part inside the cell (so the run / execution order
   *    area remains visible for a limited vertical travel band ~45px).
   *  - The editor's layout height plus the editor's internal scroll position (`editorScrollTop`) to
   *    crop content when the cell is partially visible (top or bottom clipped) or when content is
   *    taller than the viewport.
   *
   * Additional invariants:
   *  - Content height stability: once the layout has been initialized, scroll-driven re-layouts can
   *    observe transient Monaco content heights that reflect the current clipped layout (rather than
   *    the full input height). To keep the notebook list layout stable (avoiding overlapping cells
   *    while navigating/scrolling), we store the actual content height in `_establishedContentHeight`
   *    and reuse it for scroll-driven relayouts. This prevents the editor from shrinking back to its
   *    initial height after content has been added (e.g., pasting text) or when Monaco reports a
   *    transient smaller content height while the cell is clipped.
   *
   *    We refresh `_establishedContentHeight` when the editor's content size changes
   *    (`onDidContentSizeChange`) and also when width/layout changes can affect wrapping-driven height
   *    (`viewCellLayoutChange`/`nbLayoutChange`).
   *  - Pointer-drag gating: while the user is holding the mouse button down in the editor (drag
   *    selection or potential drag selection), we avoid programmatic `editor.setScrollTop(...)` updates
   *    to prevent selection/scroll feedback loops and "stuck selection" behavior.
   *
   * ---------------------------------------------------------------------------
   * SECTION 1. OVERALL NOTEBOOK VIEW (EACH CELL HAS AN 18px GAP ABOVE IT)
   * Legend:
   *   GAP (between cells & before first cell) ............. 18px
   *   CELL PADDING (top & bottom inside cell) ............. 6px
   *   STATUS BAR HEIGHT (typical) ......................... 22px
   *   LINE HEIGHT (logic clamp) ........................... 21px
   *   BORDER/OUTLINE HEIGHT (visual conceal adjustment) ... 1px
   *   EDITOR_HEIGHT (example visible editor) .............. 200px (capped by viewport)
   *   EDITOR_CONTENT_HEIGHT (example full content) ........ 380px (e.g. 50 lines)
   *   extraOffset = -(CELL_PADDING + BORDER_HEIGHT) ....... -7
   *
   *   (The list ensures the editor's laid out height never exceeds viewport height.)
   *
   *   ┌────────────────────────────── Notebook Viewport (scrolling container) ────────────────────────────┐
   *   │ (scrollTop)                                                                                       │
   *   │                                                                                                   │
   *   │  18px GAP (top spacing before first cell)                                                         │
   *   │  ▼                                                                                                │
   *   │  ┌──────── Cell A Outer Container ────────────────────────────────────────────────────────────┐   │
   *   │  │ ▲ 6px top padding                                                                          │   │
   *   │  │ │                                                                                          │   │
   *   │  │ │  ┌─ Execution Order / Run Column (~45px vertical travel band)─┐  ┌─ Editor Part ───────┐ │   │
   *   │  │ │  │ (Run button, execution # label)                            │  │ Visible Lines ...   │ │   │
   *   │  │ │  │                                                            │  │                     │ │   │
   *   │  │ │  │                                                            │  │ EDITOR_HEIGHT=200px │ │   │
   *   │  │ │  │                                                            │  │ (Content=380px)     │ │   │
   *   │  │ │  └────────────────────────────────────────────────────────────┘  └─────────────────────┘ │   │
   *   │  │ │                                                                                          │   │
   *   │  │ │  ┌─ Status Bar (22px) ─────────────────────────────────────────────────────────────────┐ │   │
   *   │  │ │  │ language | indent | selection info | kernel/status bits ...                         │ │   │
   *   │  │ │  └─────────────────────────────────────────────────────────────────────────────────────┘ │   │
   *   │  │ │                                                                                          │   │
   *   │  │ ▼ 6px bottom padding                                                                       │   │
   *   │  └────────────────────────────────────────────────────────────────────────────────────────────┘   │
   *   │  18px GAP                                                                                         │
   *   │  ┌──────── Cell B Outer Container ────────────────────────────────────────────────────────────┐   │
   *   │  │ (same structure as Cell A)                                                                 │   │
   *   │  └────────────────────────────────────────────────────────────────────────────────────────────┘   │
   *   │                                                                                                   │
   *   │ (scrollBottom)                                                                                    │
   *   └───────────────────────────────────────────────────────────────────────────────────────────────────┘
   *
   * SECTION 2. SINGLE CELL STRUCTURE (VERTICAL LAYERS)
   *
   *   Inter-Cell GAP (18px)
   *   ┌─────────────────────────────── Cell Wrapper (<li>) ──────────────────────────────┐
   *   │ ┌──────────────────────────── .cell-inner-container ───────────────────────────┐ │
   *   │ │ 6px top padding                                                              │ │
   *   │ │                                                                              │ │
   *   │ │ ┌─ Left Gutter (Run / Exec / Focus Border) ─┬──────── Editor Part ─────────┐ │ │
   *   │ │ │  Sticky vertical travel (~45px allowance) │  (Monaco surface)            │ │ │
   *   │ │ │                                         │  Visible height 200px          │ │ │
   *   │ │ │                                         │  Content height 380px          │ │ │
   *   │ │ └─────────────────────────────────────────┴────────────────────────────────┘ │ │
   *   │ │                                                                              │ │
   *   │ │ ┌─ Status Bar (22px) ──────────────────────────────────────────────────────┐ │ │
   *   │ │ │ language | indent | selection | kernel | state                           │ │ │
   *   │ │ └──────────────────────────────────────────────────────────────────────────┘ │ │
   *   │ │ 6px bottom padding                                                           │ │
   *   │ └──────────────────────────────────────────────────────────────────────────────┘ │
   *   │ (Outputs region begins at outputContainerOffset below input area)                │
   *   └──────────────────────────────────────────────────────────────────────────────────┘
   */
  layoutEditor(reason) {
    if (!this._enabled) {
      return;
    }
    const element = this.templateData.editorPart;
    if (this.viewCell.isInputCollapsed) {
      element.style.top = "";
      return;
    }
    const LINE_HEIGHT = this.notebookEditor.getLayoutInfo().fontInfo.lineHeight;
    const CELL_TOP_MARGIN = this.viewCell.layoutInfo.topMargin;
    const CELL_OUTLINE_WIDTH = this.viewCell.layoutInfo.outlineWidth;
    const STATUSBAR_HEIGHT = this.viewCell.layoutInfo.statusBarHeight;
    const editor = this.templateData.editor;
    const editorLayout = this.templateData.editor.getLayoutInfo();
    const editorWidth = this._initialized && (reason === "nbLayoutChange" || reason === "viewCellLayoutChange") ? this.viewCell.layoutInfo.editorWidth : editorLayout.width;
    const editorHeight = this.viewCell.layoutInfo.editorHeight;
    const scrollTop = this.notebookEditor.scrollTop;
    const elementTop = this.notebookEditor.getAbsoluteTopOfElement(this.viewCell);
    const elementBottom = this.notebookEditor.getAbsoluteBottomOfElement(this.viewCell);
    const elementHeight = this.notebookEditor.getHeightOfElement(this.viewCell);
    let editorContentHeight;
    const isInit = !this._initialized && reason === "init";
    if (isInit) {
      editorContentHeight = this._initialEditorDimension.height;
      this._establishedContentHeight = editorContentHeight;
    } else {
      const gotContentHeight = editor.getContentHeight();
      const fallbackEditorContentHeight = gotContentHeight === -1 ? Math.max(editor.getLayoutInfo().height, this._initialEditorDimension.height) : gotContentHeight;
      const shouldRefreshContentHeight = !this._initialized || reason === "onDidContentSizeChange" || reason === "viewCellLayoutChange" || reason === "nbLayoutChange";
      if (shouldRefreshContentHeight) {
        editorContentHeight = fallbackEditorContentHeight;
        this._establishedContentHeight = editorContentHeight;
      } else {
        editorContentHeight = this._establishedContentHeight ?? fallbackEditorContentHeight;
      }
    }
    const editorBottom = elementTop + this.viewCell.layoutInfo.outputContainerOffset;
    const scrollBottom = this.notebookEditor.scrollBottom;
    const viewportHeight = scrollBottom - scrollTop === 0 ? this.notebookEditor.getLayoutInfo().height : scrollBottom - scrollTop;
    const outputContainerOffset = this.viewCell.layoutInfo.outputContainerOffset;
    const scrollDirection = typeof this._previousScrollBottom === "number" ? scrollBottom < this._previousScrollBottom ? "up" : "down" : "down";
    this._previousScrollBottom = scrollBottom;
    let top2 = Math.max(0, scrollTop - elementTop - CELL_TOP_MARGIN - CELL_OUTLINE_WIDTH);
    const possibleEditorHeight = editorHeight - top2;
    if (possibleEditorHeight < LINE_HEIGHT) {
      top2 = top2 - (LINE_HEIGHT - possibleEditorHeight) - CELL_OUTLINE_WIDTH;
    }
    let height = editorContentHeight;
    let editorScrollTop = 0;
    if (scrollTop <= elementTop + CELL_TOP_MARGIN) {
      const minimumEditorHeight = LINE_HEIGHT + this.notebookEditor.notebookOptions.getLayoutConfiguration().editorTopPadding;
      if (scrollBottom >= editorBottom) {
        height = clamp(editorContentHeight, minimumEditorHeight, editorContentHeight);
        this._editorVisibility = "Full";
      } else {
        height = clamp(scrollBottom - (elementTop + CELL_TOP_MARGIN) - STATUSBAR_HEIGHT, minimumEditorHeight, editorContentHeight) + 2 * CELL_OUTLINE_WIDTH;
        this._editorVisibility = "Bottom Clipped";
        editorScrollTop = 0;
      }
    } else {
      if (viewportHeight <= editorContentHeight && scrollBottom <= editorBottom) {
        const minimumEditorHeight = LINE_HEIGHT + this.notebookEditor.notebookOptions.getLayoutConfiguration().editorTopPadding;
        height = clamp(viewportHeight - STATUSBAR_HEIGHT, minimumEditorHeight, editorContentHeight - STATUSBAR_HEIGHT) + 2 * CELL_OUTLINE_WIDTH;
        this._editorVisibility = "Full (Small Viewport)";
        editorScrollTop = top2;
      } else {
        const minimumEditorHeight = LINE_HEIGHT;
        height = clamp(editorContentHeight - (scrollTop - (elementTop + CELL_TOP_MARGIN)), minimumEditorHeight, editorContentHeight);
        if (scrollTop > editorBottom) {
          this._editorVisibility = "Invisible";
        } else {
          this._editorVisibility = "Top Clipped";
        }
        editorScrollTop = editorContentHeight - height;
      }
    }
    this._logService.debug(`${reason} (${this._editorVisibility}, ${this._initialized})`);
    this._logService.debug(`=> Editor Top = ${top2}px (editHeight = ${editorHeight}, editContentHeight: ${editorContentHeight})`);
    this._logService.debug(`=> eleTop = ${elementTop}, eleBottom = ${elementBottom}, eleHeight = ${elementHeight}`);
    this._logService.debug(`=> scrollTop = ${scrollTop}, top = ${top2}`);
    this._logService.debug(`=> cellTopMargin = ${CELL_TOP_MARGIN}, cellBottomMargin = ${this.viewCell.layoutInfo.topMargin}, cellOutline = ${CELL_OUTLINE_WIDTH}`);
    this._logService.debug(`=> scrollBottom: ${scrollBottom}, editBottom: ${editorBottom}, viewport: ${viewportHeight}, scroll: ${scrollDirection}, contOffset: ${outputContainerOffset})`);
    this._logService.debug(`=> Editor Height = ${height}px, Width: ${editorWidth}px, Initial Width: ${this._initialEditorDimension.width}, EditorScrollTop = ${editorScrollTop}px, StatusbarHeight = ${STATUSBAR_HEIGHT}, lineHeight = ${this.notebookEditor.getLayoutInfo().fontInfo.lineHeight}`);
    try {
      this._isUpdatingLayout = true;
      element.style.top = `${top2}px`;
      editor.layout({
        width: this._initialized ? editorWidth : this._initialEditorDimension.width,
        height
      }, true);
      if (!this._pointerDown && editorScrollTop >= 0) {
        this._lastChangedEditorScrolltop = editorScrollTop;
        editor.setScrollTop(editorScrollTop);
      }
    } finally {
      this._initialized = true;
      this._isUpdatingLayout = false;
      this._logService.debug("Updated Editor Layout");
    }
  }
};
export { CodeCell, CodeCellLayout };
