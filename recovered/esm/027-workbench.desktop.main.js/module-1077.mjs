// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadEditor.ts
import { Selection } from "./module-0107.mjs";
import { equals } from "./module-0007.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { cursorStyleToString } from "./module-0105.mjs";
import { Range2 } from "./module-0106.mjs";
import { SnippetParser } from "./module-0544.mjs";
import { EditorState } from "./module-0539.mjs";
import { SnippetController2 } from "./module-0714.mjs";


// src/vs/workbench/api/browser/mainThreadEditor.ts
var MainThreadTextEditorProperties = class _MainThreadTextEditorProperties {
  constructor(selections, options3, visibleRanges) {
    this.selections = selections;
    this.options = options3;
    this.visibleRanges = visibleRanges;
  }
  static readFromEditor(previousProperties, model, codeEditor) {
    const selections = _MainThreadTextEditorProperties._readSelectionsFromCodeEditor(previousProperties, codeEditor);
    const options3 = _MainThreadTextEditorProperties._readOptionsFromCodeEditor(previousProperties, model, codeEditor);
    const visibleRanges = _MainThreadTextEditorProperties._readVisibleRangesFromCodeEditor(previousProperties, codeEditor);
    return new _MainThreadTextEditorProperties(selections, options3, visibleRanges);
  }
  static _readSelectionsFromCodeEditor(previousProperties, codeEditor) {
    let result = null;
    if (codeEditor) {
      result = codeEditor.getSelections();
    }
    if (!result && previousProperties) {
      result = previousProperties.selections;
    }
    if (!result) {
      result = [new Selection(1, 1, 1, 1)];
    }
    return result;
  }
  static _readOptionsFromCodeEditor(previousProperties, model, codeEditor) {
    if (model.isDisposed()) {
      if (previousProperties) {
        return previousProperties.options;
      } else {
        throw new Error("No valid properties");
      }
    }
    let cursorStyle;
    let lineNumbers;
    if (codeEditor) {
      const options3 = codeEditor.getOptions();
      const lineNumbersOpts = options3.get(76 /* lineNumbers */);
      cursorStyle = options3.get(34 /* cursorStyle */);
      lineNumbers = lineNumbersOpts.renderType;
    } else if (previousProperties) {
      cursorStyle = previousProperties.options.cursorStyle;
      lineNumbers = previousProperties.options.lineNumbers;
    } else {
      cursorStyle = 1 /* Line */;
      lineNumbers = 1 /* On */;
    }
    const modelOptions = model.getOptions();
    return {
      insertSpaces: modelOptions.insertSpaces,
      tabSize: modelOptions.tabSize,
      indentSize: modelOptions.indentSize,
      originalIndentSize: modelOptions.originalIndentSize,
      cursorStyle,
      lineNumbers
    };
  }
  static _readVisibleRangesFromCodeEditor(previousProperties, codeEditor) {
    if (codeEditor) {
      return codeEditor.getVisibleRanges();
    }
    return [];
  }
  generateDelta(oldProps, selectionChangeSource) {
    const delta2 = {
      options: null,
      selections: null,
      visibleRanges: null
    };
    if (!oldProps || !_MainThreadTextEditorProperties._selectionsEqual(oldProps.selections, this.selections)) {
      delta2.selections = {
        selections: this.selections,
        source: selectionChangeSource ?? void 0
      };
    }
    if (!oldProps || !_MainThreadTextEditorProperties._optionsEqual(oldProps.options, this.options)) {
      delta2.options = this.options;
    }
    if (!oldProps || !_MainThreadTextEditorProperties._rangesEqual(oldProps.visibleRanges, this.visibleRanges)) {
      delta2.visibleRanges = this.visibleRanges;
    }
    if (delta2.selections || delta2.options || delta2.visibleRanges) {
      return delta2;
    }
    return null;
  }
  static _selectionsEqual(a, b) {
    return equals(a, b, (aValue, bValue) => aValue.equalsSelection(bValue));
  }
  static _rangesEqual(a, b) {
    return equals(a, b, (aValue, bValue) => aValue.equalsRange(bValue));
  }
  static _optionsEqual(a, b) {
    if (a && !b || !a && b) {
      return false;
    }
    if (!a && !b) {
      return true;
    }
    return a.tabSize === b.tabSize && a.indentSize === b.indentSize && a.insertSpaces === b.insertSpaces && a.cursorStyle === b.cursorStyle && a.lineNumbers === b.lineNumbers;
  }
};

var MainThreadTextEditor = class {
  constructor(id2, model, codeEditor, focusTracker, mainThreadDocuments, modelService, clipboardService) {
    this._modelListeners = new DisposableStore();
    this._codeEditorListeners = new DisposableStore();
    this._id = id2;
    this._model = model;
    this._codeEditor = null;
    this._properties = null;
    this._focusTracker = focusTracker;
    this._mainThreadDocuments = mainThreadDocuments;
    this._modelService = modelService;
    this._clipboardService = clipboardService;
    this._onPropertiesChanged = new Emitter();
    this._modelListeners.add(this._model.onDidChangeOptions((e) => {
      this._updatePropertiesNow(null);
    }));
    this.setCodeEditor(codeEditor);
    this._updatePropertiesNow(null);
  }
  dispose() {
    this._modelListeners.dispose();
    this._onPropertiesChanged.dispose();
    this._codeEditor = null;
    this._codeEditorListeners.dispose();
  }
  _updatePropertiesNow(selectionChangeSource) {
    this._setProperties(
      MainThreadTextEditorProperties.readFromEditor(this._properties, this._model, this._codeEditor),
      selectionChangeSource
    );
  }
  _setProperties(newProperties, selectionChangeSource) {
    const delta2 = newProperties.generateDelta(this._properties, selectionChangeSource);
    this._properties = newProperties;
    if (delta2) {
      this._onPropertiesChanged.fire(delta2);
    }
  }
  getId() {
    return this._id;
  }
  getModel() {
    return this._model;
  }
  getCodeEditor() {
    return this._codeEditor;
  }
  hasCodeEditor(codeEditor) {
    return this._codeEditor === codeEditor;
  }
  setCodeEditor(codeEditor) {
    if (this.hasCodeEditor(codeEditor)) {
      return;
    }
    this._codeEditorListeners.clear();
    this._codeEditor = codeEditor;
    if (this._codeEditor) {
      this._codeEditorListeners.add(this._codeEditor.onDidChangeModel(() => {
        this.setCodeEditor(null);
      }));
      this._codeEditorListeners.add(this._codeEditor.onDidFocusEditorWidget(() => {
        this._focusTracker.onGainedFocus();
      }));
      this._codeEditorListeners.add(this._codeEditor.onDidBlurEditorWidget(() => {
        this._focusTracker.onLostFocus();
      }));
      let nextSelectionChangeSource = null;
      this._codeEditorListeners.add(this._mainThreadDocuments.onIsCaughtUpWithContentChanges((uri5) => {
        if (uri5.toString() === this._model.uri.toString()) {
          const selectionChangeSource = nextSelectionChangeSource;
          nextSelectionChangeSource = null;
          this._updatePropertiesNow(selectionChangeSource);
        }
      }));
      const isValidCodeEditor = () => {
        return this._codeEditor && this._codeEditor.getModel() === this._model;
      };
      const updateProperties = (selectionChangeSource) => {
        if (this._mainThreadDocuments.isCaughtUpWithContentChanges(this._model.uri)) {
          nextSelectionChangeSource = null;
          this._updatePropertiesNow(selectionChangeSource);
        } else {
          nextSelectionChangeSource = selectionChangeSource;
        }
      };
      this._codeEditorListeners.add(this._codeEditor.onDidChangeCursorSelection((e) => {
        if (!isValidCodeEditor()) {
          return;
        }
        updateProperties(e.source);
      }));
      this._codeEditorListeners.add(this._codeEditor.onDidChangeConfiguration((e) => {
        if (!isValidCodeEditor()) {
          return;
        }
        updateProperties(null);
      }));
      this._codeEditorListeners.add(this._codeEditor.onDidLayoutChange(() => {
        if (!isValidCodeEditor()) {
          return;
        }
        updateProperties(null);
      }));
      this._codeEditorListeners.add(this._codeEditor.onDidScrollChange(() => {
        if (!isValidCodeEditor()) {
          return;
        }
        updateProperties(null);
      }));
      this._updatePropertiesNow(null);
    }
  }
  isVisible() {
    return !!this._codeEditor;
  }
  getProperties() {
    return this._properties;
  }
  get onPropertiesChanged() {
    return this._onPropertiesChanged.event;
  }
  setSelections(selections) {
    if (this._codeEditor) {
      this._codeEditor.setSelections(selections);
      return;
    }
    const newSelections = selections.map(Selection.liftSelection);
    this._setProperties(
      new MainThreadTextEditorProperties(newSelections, this._properties.options, this._properties.visibleRanges),
      null
    );
  }
  _setIndentConfiguration(newConfiguration) {
    const creationOpts = this._modelService.getCreationOptions(this._model.getLanguageId(), this._model.uri, this._model.isForSimpleWidget);
    if (newConfiguration.tabSize === "auto" || newConfiguration.insertSpaces === "auto") {
      let insertSpaces = creationOpts.insertSpaces;
      let tabSize = creationOpts.tabSize;
      if (newConfiguration.insertSpaces !== "auto" && typeof newConfiguration.insertSpaces !== "undefined") {
        insertSpaces = newConfiguration.insertSpaces;
      }
      if (newConfiguration.tabSize !== "auto" && typeof newConfiguration.tabSize !== "undefined") {
        tabSize = newConfiguration.tabSize;
      }
      this._model.detectIndentation(insertSpaces, tabSize);
      return;
    }
    const newOpts = {};
    if (typeof newConfiguration.insertSpaces !== "undefined") {
      newOpts.insertSpaces = newConfiguration.insertSpaces;
    }
    if (typeof newConfiguration.tabSize !== "undefined") {
      newOpts.tabSize = newConfiguration.tabSize;
    }
    if (typeof newConfiguration.indentSize !== "undefined") {
      newOpts.indentSize = newConfiguration.indentSize;
    }
    this._model.updateOptions(newOpts);
  }
  setConfiguration(newConfiguration) {
    this._setIndentConfiguration(newConfiguration);
    if (!this._codeEditor) {
      return;
    }
    if (newConfiguration.cursorStyle) {
      const newCursorStyle = cursorStyleToString(newConfiguration.cursorStyle);
      this._codeEditor.updateOptions({
        cursorStyle: newCursorStyle
      });
    }
    if (typeof newConfiguration.lineNumbers !== "undefined") {
      let lineNumbers;
      switch (newConfiguration.lineNumbers) {
        case 1 /* On */:
          lineNumbers = "on";
          break;
        case 2 /* Relative */:
          lineNumbers = "relative";
          break;
        case 3 /* Interval */:
          lineNumbers = "interval";
          break;
        default:
          lineNumbers = "off";
      }
      this._codeEditor.updateOptions({
        lineNumbers
      });
    }
  }
  setDecorations(key3, ranges) {
    if (!this._codeEditor) {
      return;
    }
    this._codeEditor.setDecorationsByType("exthost-api", key3, ranges);
  }
  setDecorationsFast(key3, _ranges) {
    if (!this._codeEditor) {
      return;
    }
    const ranges = [];
    for (let i2 = 0, len = Math.floor(_ranges.length / 4); i2 < len; i2++) {
      ranges[i2] = new Range2(_ranges[4 * i2], _ranges[4 * i2 + 1], _ranges[4 * i2 + 2], _ranges[4 * i2 + 3]);
    }
    this._codeEditor.setDecorationsByTypeFast(key3, ranges);
  }
  revealRange(range2, revealType) {
    if (!this._codeEditor) {
      return;
    }
    switch (revealType) {
      case 0 /* Default */:
        this._codeEditor.revealRange(range2, 0 /* Smooth */);
        break;
      case 1 /* InCenter */:
        this._codeEditor.revealRangeInCenter(range2, 0 /* Smooth */);
        break;
      case 2 /* InCenterIfOutsideViewport */:
        this._codeEditor.revealRangeInCenterIfOutsideViewport(range2, 0 /* Smooth */);
        break;
      case 3 /* AtTop */:
        this._codeEditor.revealRangeAtTop(range2, 0 /* Smooth */);
        break;
      default:
        console.warn(`Unknown revealType: ${revealType}`);
        break;
    }
  }
  isFocused() {
    if (this._codeEditor) {
      return this._codeEditor.hasTextFocus();
    }
    return false;
  }
  matches(editor) {
    if (!editor) {
      return false;
    }
    return editor.getControl() === this._codeEditor;
  }
  applyEdits(versionIdCheck, edits, opts) {
    if (this._model.getVersionId() !== versionIdCheck) {
      return false;
    }
    if (!this._codeEditor) {
      return false;
    }
    if (typeof opts.setEndOfLine !== "undefined") {
      this._model.pushEOL(opts.setEndOfLine);
    }
    const transformedEdits = edits.map((edit3) => {
      return {
        range: Range2.lift(edit3.range),
        text: edit3.text,
        forceMoveMarkers: edit3.forceMoveMarkers
      };
    });
    if (opts.undoStopBefore) {
      this._codeEditor.pushUndoStop();
    }
    this._codeEditor.executeEdits("MainThreadTextEditor", transformedEdits);
    if (opts.undoStopAfter) {
      this._codeEditor.pushUndoStop();
    }
    return true;
  }
  async insertSnippet(modelVersionId, template2, ranges, opts) {
    if (!this._codeEditor || !this._codeEditor.hasModel()) {
      return false;
    }
    let clipboardText;
    const needsTemplate = SnippetParser.guessNeedsClipboard(template2);
    if (needsTemplate) {
      const state = new EditorState(this._codeEditor, 1 /* Value */ | 4 /* Position */);
      clipboardText = await this._clipboardService.readText();
      if (!state.validate(this._codeEditor)) {
        return false;
      }
    }
    if (this._codeEditor.getModel().getVersionId() !== modelVersionId) {
      return false;
    }
    const snippetController = SnippetController2.get(this._codeEditor);
    if (!snippetController) {
      return false;
    }
    this._codeEditor.focus();
    const edits = ranges.map((range2) => ({ range: Range2.lift(range2), template: template2 }));
    snippetController.apply(edits, {
      overwriteBefore: 0,
      overwriteAfter: 0,
      undoStopBefore: opts.undoStopBefore,
      undoStopAfter: opts.undoStopAfter,
      adjustWhitespace: !opts.keepWhitespace,
      clipboardText
    });
    return true;
  }
};
export { MainThreadTextEditorProperties, MainThreadTextEditor };
