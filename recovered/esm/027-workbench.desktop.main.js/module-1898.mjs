// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewModel/baseCellViewModel.ts
import { Disposable, MutableDisposable, dispose } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Mimes } from "./module-0136.mjs";
import { readTransientState, writeTransientState } from "./module-1865.mjs";
import { Selection } from "./module-0107.mjs";
import { Range2 } from "./module-0106.mjs";
import { SearchParams } from "./module-0171.mjs";


// src/vs/workbench/contrib/notebook/browser/viewModel/baseCellViewModel.ts
var BaseCellViewModel = class extends Disposable {
  constructor(viewType, model, id2, _viewContext, _configurationService, _modelService, _undoRedoService, _codeEditorService, _inlineChatSessionService) {
    super();
    this.viewType = viewType;
    this.model = model;
    this.id = id2;
    this._viewContext = _viewContext;
    this._configurationService = _configurationService;
    this._modelService = _modelService;
    this._undoRedoService = _undoRedoService;
    this._codeEditorService = _codeEditorService;
    this._inlineChatSessionService = _inlineChatSessionService;
    this._onDidChangeEditorAttachState = this._register(new Emitter());
    // Do not merge this event with `onDidChangeState` as we are using `Event.once(onDidChangeEditorAttachState)` elsewhere.
    this.onDidChangeEditorAttachState = this._onDidChangeEditorAttachState.event;
    this._onDidChangeState = this._register(new Emitter());
    this.onDidChangeState = this._onDidChangeState.event;
    this._editState = 0 /* Preview */;
    this._lineNumbers = "inherit";
    this._focusMode = 0 /* Container */;
    this._editorListeners = [];
    this._editorViewStates = null;
    this._editorTransientState = null;
    this._resolvedCellDecorations = /* @__PURE__ */ new Map();
    this._textModelRefChangeDisposable = this._register(new MutableDisposable());
    this._cellDecorationsChanged = this._register(new Emitter());
    this.onCellDecorationsChanged = this._cellDecorationsChanged.event;
    this._resolvedDecorations = /* @__PURE__ */ new Map();
    this._lastDecorationId = 0;
    this._cellStatusBarItems = /* @__PURE__ */ new Map();
    this._onDidChangeCellStatusBarItems = this._register(new Emitter());
    this.onDidChangeCellStatusBarItems = this._onDidChangeCellStatusBarItems.event;
    this._lastStatusBarId = 0;
    this._dragging = false;
    this._inputCollapsed = false;
    this._outputCollapsed = false;
    this._commentHeight = 0;
    this._isDisposed = false;
    this._isReadonly = false;
    this._editStateSource = "";
    this._register(model.onDidChangeMetadata(() => {
      this._onDidChangeState.fire({ metadataChanged: true });
    }));
    this._register(model.onDidChangeInternalMetadata((e) => {
      this._onDidChangeState.fire({ internalMetadataChanged: true });
      if (e.lastRunSuccessChanged) {
        this.layoutChange({});
      }
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("notebook.lineNumbers")) {
        this.lineNumbers = "inherit";
      }
    }));
    if (this.model.collapseState?.inputCollapsed) {
      this._inputCollapsed = true;
    }
    if (this.model.collapseState?.outputCollapsed) {
      this._outputCollapsed = true;
    }
    this._commentOptions = this._configurationService.getValue("editor.comments", { overrideIdentifier: this.language });
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("editor.comments")) {
        this._commentOptions = this._configurationService.getValue("editor.comments", { overrideIdentifier: this.language });
      }
    }));
  }
  get handle() {
    return this.model.handle;
  }
  get uri() {
    return this.model.uri;
  }
  get lineCount() {
    return this.model.textBuffer.getLineCount();
  }
  get metadata() {
    return this.model.metadata;
  }
  get internalMetadata() {
    return this.model.internalMetadata;
  }
  get language() {
    return this.model.language;
  }
  get mime() {
    if (typeof this.model.mime === "string") {
      return this.model.mime;
    }
    switch (this.language) {
      case "markdown":
        return Mimes.markdown;
      default:
        return Mimes.text;
    }
  }
  get lineNumbers() {
    return this._lineNumbers;
  }
  set lineNumbers(lineNumbers) {
    if (lineNumbers === this._lineNumbers) {
      return;
    }
    this._lineNumbers = lineNumbers;
    this._onDidChangeState.fire({ cellLineNumberChanged: true });
  }
  get commentOptions() {
    return this._commentOptions;
  }
  set commentOptions(newOptions) {
    this._commentOptions = newOptions;
  }
  get focusMode() {
    return this._focusMode;
  }
  set focusMode(newMode) {
    if (this._focusMode !== newMode) {
      this._focusMode = newMode;
      this._onDidChangeState.fire({ focusModeChanged: true });
    }
  }
  get editorAttached() {
    return !!this._textEditor;
  }
  get textModel() {
    return this.model.textModel;
  }
  hasModel() {
    return !!this.textModel;
  }
  get dragging() {
    return this._dragging;
  }
  set dragging(v2) {
    this._dragging = v2;
    this._onDidChangeState.fire({ dragStateChanged: true });
  }
  get isInputCollapsed() {
    return this._inputCollapsed;
  }
  set isInputCollapsed(v2) {
    this._inputCollapsed = v2;
    this._onDidChangeState.fire({ inputCollapsedChanged: true });
  }
  get isOutputCollapsed() {
    return this._outputCollapsed;
  }
  set isOutputCollapsed(v2) {
    this._outputCollapsed = v2;
    this._onDidChangeState.fire({ outputCollapsedChanged: true });
  }
  set commentHeight(height) {
    if (this._commentHeight === height) {
      return;
    }
    this._commentHeight = height;
    this.layoutChange({ commentHeight: true }, "BaseCellViewModel#commentHeight");
  }
  updateOptions(e) {
    if (this._textEditor && typeof e.readonly === "boolean") {
      this._textEditor.updateOptions({ readOnly: e.readonly });
    }
    if (typeof e.readonly === "boolean") {
      this._isReadonly = e.readonly;
    }
  }
  assertTextModelAttached() {
    if (this.textModel && this._textEditor && this._textEditor.getModel() === this.textModel) {
      return true;
    }
    return false;
  }
  // private handleKeyDown(e: IKeyboardEvent) {
  // 	if (this.viewType === IPYNB_VIEW_TYPE && isWindows && e.ctrlKey && e.keyCode === KeyCode.Enter) {
  // 		this._keymapService.promptKeymapRecommendation();
  // 	}
  // }
  attachTextEditor(editor, estimatedHasHorizontalScrolling) {
    if (!editor.hasModel()) {
      throw new Error("Invalid editor: model is missing");
    }
    if (this._textEditor === editor) {
      if (this._editorListeners.length === 0) {
        this._editorListeners.push(this._textEditor.onDidChangeCursorSelection(() => {
          this._onDidChangeState.fire({ selectionChanged: true });
        }));
        this._onDidChangeState.fire({ selectionChanged: true });
      }
      return;
    }
    this._textEditor = editor;
    if (this._isReadonly) {
      editor.updateOptions({ readOnly: this._isReadonly });
    }
    if (this._editorViewStates) {
      this._restoreViewState(this._editorViewStates);
    } else {
      if (estimatedHasHorizontalScrolling) {
        this._restoreViewState({
          contributionsState: {},
          cursorState: [],
          viewState: {
            scrollLeft: 0,
            firstPosition: { lineNumber: 1, column: 1 },
            firstPositionDeltaTop: this._viewContext.notebookOptions.getLayoutConfiguration().editorTopPadding
          }
        });
      }
    }
    if (this._editorTransientState) {
      writeTransientState(editor.getModel(), this._editorTransientState, this._codeEditorService);
    }
    if (this._isDisposed) {
      return;
    }
    editor.changeDecorations((accessor) => {
      this._resolvedDecorations.forEach((value2, key3) => {
        if (key3.startsWith("_lazy_")) {
          const ret = accessor.addDecoration(value2.options.range, value2.options.options);
          this._resolvedDecorations.get(key3).id = ret;
        } else {
          const ret = accessor.addDecoration(value2.options.range, value2.options.options);
          this._resolvedDecorations.get(key3).id = ret;
        }
      });
    });
    this._editorListeners.push(editor.onDidChangeCursorSelection(() => {
      this._onDidChangeState.fire({ selectionChanged: true });
    }));
    this._editorListeners.push(this._inlineChatSessionService.onWillStartSession((e) => {
      if (e === this._textEditor && this.textBuffer.getLength() === 0) {
        this.enableAutoLanguageDetection();
      }
    }));
    this._onDidChangeState.fire({ selectionChanged: true });
    this._onDidChangeEditorAttachState.fire();
  }
  detachTextEditor() {
    this.saveViewState();
    this.saveTransientState();
    this._textEditor?.changeDecorations((accessor) => {
      this._resolvedDecorations.forEach((value2) => {
        const resolvedid = value2.id;
        if (resolvedid) {
          accessor.removeDecoration(resolvedid);
        }
      });
    });
    this._textEditor = void 0;
    dispose(this._editorListeners);
    this._editorListeners = [];
    this._onDidChangeEditorAttachState.fire();
    if (this._textModelRef) {
      this._textModelRef.dispose();
      this._textModelRef = void 0;
    }
    this._textModelRefChangeDisposable.clear();
  }
  getText() {
    return this.model.getValue();
  }
  getAlternativeId() {
    return this.model.alternativeId;
  }
  getTextLength() {
    return this.model.getTextLength();
  }
  enableAutoLanguageDetection() {
    this.model.enableAutoLanguageDetection();
  }
  saveViewState() {
    if (!this._textEditor) {
      return;
    }
    this._editorViewStates = this._textEditor.saveViewState();
  }
  saveTransientState() {
    if (!this._textEditor || !this._textEditor.hasModel()) {
      return;
    }
    this._editorTransientState = readTransientState(this._textEditor.getModel(), this._codeEditorService);
  }
  saveEditorViewState() {
    if (this._textEditor) {
      this._editorViewStates = this._textEditor.saveViewState();
    }
    return this._editorViewStates;
  }
  restoreEditorViewState(editorViewStates, totalHeight) {
    this._editorViewStates = editorViewStates;
  }
  _restoreViewState(state) {
    if (state) {
      this._textEditor?.restoreViewState(state);
    }
  }
  addModelDecoration(decoration3) {
    if (!this._textEditor) {
      const id3 = ++this._lastDecorationId;
      const decorationId = `_lazy_${this.id};${id3}`;
      this._resolvedDecorations.set(decorationId, { options: decoration3 });
      return decorationId;
    }
    let id2;
    this._textEditor.changeDecorations((accessor) => {
      id2 = accessor.addDecoration(decoration3.range, decoration3.options);
      this._resolvedDecorations.set(id2, { id: id2, options: decoration3 });
    });
    return id2;
  }
  removeModelDecoration(decorationId) {
    const realDecorationId = this._resolvedDecorations.get(decorationId);
    if (this._textEditor && realDecorationId && realDecorationId.id !== void 0) {
      this._textEditor.changeDecorations((accessor) => {
        accessor.removeDecoration(realDecorationId.id);
      });
    }
    this._resolvedDecorations.delete(decorationId);
  }
  deltaModelDecorations(oldDecorations, newDecorations) {
    oldDecorations.forEach((id2) => {
      this.removeModelDecoration(id2);
    });
    const ret = newDecorations.map((option2) => {
      return this.addModelDecoration(option2);
    });
    return ret;
  }
  _removeCellDecoration(decorationId) {
    const options3 = this._resolvedCellDecorations.get(decorationId);
    this._resolvedCellDecorations.delete(decorationId);
    if (options3) {
      for (const existingOptions of this._resolvedCellDecorations.values()) {
        if (options3.className === existingOptions.className) {
          options3.className = void 0;
        }
        if (options3.outputClassName === existingOptions.outputClassName) {
          options3.outputClassName = void 0;
        }
        if (options3.gutterClassName === existingOptions.gutterClassName) {
          options3.gutterClassName = void 0;
        }
        if (options3.topClassName === existingOptions.topClassName) {
          options3.topClassName = void 0;
        }
      }
      this._cellDecorationsChanged.fire({ added: [], removed: [options3] });
    }
  }
  _addCellDecoration(options3) {
    const id2 = ++this._lastDecorationId;
    const decorationId = `_cell_${this.id};${id2}`;
    this._resolvedCellDecorations.set(decorationId, options3);
    this._cellDecorationsChanged.fire({ added: [options3], removed: [] });
    return decorationId;
  }
  getCellDecorations() {
    return [...this._resolvedCellDecorations.values()];
  }
  getCellDecorationRange(decorationId) {
    if (this._textEditor) {
      return this._textEditor.getModel()?.getDecorationRange(decorationId) ?? null;
    }
    return null;
  }
  deltaCellDecorations(oldDecorations, newDecorations) {
    oldDecorations.forEach((id2) => {
      this._removeCellDecoration(id2);
    });
    const ret = newDecorations.map((option2) => {
      return this._addCellDecoration(option2);
    });
    return ret;
  }
  deltaCellStatusBarItems(oldItems, newItems) {
    oldItems.forEach((id2) => {
      const item = this._cellStatusBarItems.get(id2);
      if (item) {
        this._cellStatusBarItems.delete(id2);
      }
    });
    const newIds = newItems.map((item) => {
      const id2 = ++this._lastStatusBarId;
      const itemId = `_cell_${this.id};${id2}`;
      this._cellStatusBarItems.set(itemId, item);
      return itemId;
    });
    this._onDidChangeCellStatusBarItems.fire();
    return newIds;
  }
  getCellStatusBarItems() {
    return Array.from(this._cellStatusBarItems.values());
  }
  revealRangeInCenter(range2) {
    this._textEditor?.revealRangeInCenter(range2, 1 /* Immediate */);
  }
  setSelection(range2) {
    this._textEditor?.setSelection(range2);
  }
  setSelections(selections) {
    if (selections.length) {
      if (this._textEditor) {
        this._textEditor?.setSelections(selections);
      } else if (this._editorViewStates) {
        this._editorViewStates.cursorState = selections.map((selection) => {
          return {
            inSelectionMode: !selection.isEmpty(),
            selectionStart: selection.getStartPosition(),
            position: selection.getEndPosition()
          };
        });
      }
    }
  }
  getSelections() {
    return this._textEditor?.getSelections() ?? this._editorViewStates?.cursorState.map((state) => new Selection(state.selectionStart.lineNumber, state.selectionStart.column, state.position.lineNumber, state.position.column)) ?? [];
  }
  getSelectionsStartPosition() {
    if (this._textEditor) {
      const selections = this._textEditor.getSelections();
      return selections?.map((s) => s.getStartPosition());
    } else {
      const selections = this._editorViewStates?.cursorState;
      return selections?.map((s) => s.selectionStart);
    }
  }
  getLineScrollTopOffset(line) {
    if (!this._textEditor) {
      return 0;
    }
    const editorPadding = this._viewContext.notebookOptions.computeEditorPadding(this.internalMetadata, this.uri);
    return this._textEditor.getTopForLineNumber(line) + editorPadding.top;
  }
  getPositionScrollTopOffset(range2) {
    if (!this._textEditor) {
      return 0;
    }
    const position2 = range2 instanceof Selection ? range2.getPosition() : range2.getStartPosition();
    const editorPadding = this._viewContext.notebookOptions.computeEditorPadding(this.internalMetadata, this.uri);
    return this._textEditor.getTopForPosition(position2.lineNumber, position2.column) + editorPadding.top;
  }
  cursorAtLineBoundary() {
    if (!this._textEditor || !this.textModel || !this._textEditor.hasTextFocus()) {
      return 0 /* None */;
    }
    const selection = this._textEditor.getSelection();
    if (!selection || !selection.isEmpty()) {
      return 0 /* None */;
    }
    const currentLineLength = this.textModel.getLineLength(selection.startLineNumber);
    if (currentLineLength === 0) {
      return 3 /* Both */;
    }
    switch (selection.startColumn) {
      case 1:
        return 1 /* Start */;
      case currentLineLength + 1:
        return 2 /* End */;
      default:
        return 0 /* None */;
    }
  }
  cursorAtBoundary() {
    if (!this._textEditor) {
      return 0 /* None */;
    }
    if (!this.textModel) {
      return 0 /* None */;
    }
    const selection = this._textEditor.getSelection();
    if (!selection || !selection.isEmpty()) {
      return 0 /* None */;
    }
    const firstViewLineTop = this._textEditor.getTopForPosition(1, 1);
    const lastViewLineTop = this._textEditor.getTopForPosition(this.textModel.getLineCount(), this.textModel.getLineLength(this.textModel.getLineCount()));
    const selectionTop = this._textEditor.getTopForPosition(selection.startLineNumber, selection.startColumn);
    if (selectionTop === lastViewLineTop) {
      if (selectionTop === firstViewLineTop) {
        return 3 /* Both */;
      } else {
        return 2 /* Bottom */;
      }
    } else {
      if (selectionTop === firstViewLineTop) {
        return 1 /* Top */;
      } else {
        return 0 /* None */;
      }
    }
  }
  get editStateSource() {
    return this._editStateSource;
  }
  updateEditState(newState, source) {
    if (newState === this._editState) {
      return;
    }
    this._editStateSource = source;
    this._editState = newState;
    this._onDidChangeState.fire({ editStateChanged: true });
    if (this._editState === 0 /* Preview */) {
      this.focusMode = 0 /* Container */;
    }
  }
  getEditState() {
    return this._editState;
  }
  get textBuffer() {
    return this.model.textBuffer;
  }
  /**
   * Text model is used for editing.
   */
  async resolveTextModel() {
    if (!this._textModelRef || !this.textModel) {
      this._textModelRef = await this._modelService.createModelReference(this.uri);
      if (this._isDisposed) {
        return this.textModel;
      }
      if (!this._textModelRef) {
        throw new Error(`Cannot resolve text model for ${this.uri}`);
      }
      this._textModelRefChangeDisposable.value = this.textModel.onDidChangeContent(() => this.onDidChangeTextModelContent());
    }
    return this.textModel;
  }
  cellStartFind(value2, options3) {
    let cellMatches = [];
    const lineCount = this.textBuffer.getLineCount();
    const findRange2 = options3.findScope?.selectedTextRanges ?? [new Range2(1, 1, lineCount, this.textBuffer.getLineLength(lineCount) + 1)];
    if (this.assertTextModelAttached()) {
      cellMatches = this.textModel.findMatches(
        value2,
        findRange2,
        options3.regex || false,
        options3.caseSensitive || false,
        options3.wholeWord ? options3.wordSeparators || null : null,
        options3.regex || false
      );
    } else {
      const searchParams = new SearchParams(value2, options3.regex || false, options3.caseSensitive || false, options3.wholeWord ? options3.wordSeparators || null : null);
      const searchData = searchParams.parseSearchRequest();
      if (!searchData) {
        return null;
      }
      findRange2.forEach((range2) => {
        cellMatches.push(...this.textBuffer.findMatchesLineByLine(new Range2(range2.startLineNumber, range2.startColumn, range2.endLineNumber, range2.endColumn), searchData, options3.regex || false, 1e3));
      });
    }
    return cellMatches;
  }
  dispose() {
    this._isDisposed = true;
    super.dispose();
    dispose(this._editorListeners);
    if (this._undoRedoService.getUriComparisonKey(this.uri) === this.uri.toString()) {
      this._undoRedoService.removeElements(this.uri);
    }
    this._textModelRef?.dispose();
  }
  toJSON() {
    return {
      handle: this.handle
    };
  }
};
export { BaseCellViewModel };
