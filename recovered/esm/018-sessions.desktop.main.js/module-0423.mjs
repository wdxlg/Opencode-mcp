// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/textModel.ts
import { PieceTreeTextBufferBuilder } from "./module-0398.mjs";
import { listenStream } from "./module-0037.mjs";
import { TextModelResolvedOptions, ValidAnnotatedEditOperation, isITextSnapshot } from "./module-0117.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { AttachedViews } from "./module-0399.mjs";
import { URI } from "./module-0032.mjs";
import { Range2 } from "./module-0106.mjs";
import { BracketPairsTextModelPart } from "./module-0390.mjs";
import { GuidesTextModelPart } from "./module-0296.mjs";
import { ColorizedBracketPairsDecorationProvider } from "./module-0391.mjs";
import { TokenizationTextModelPart } from "./module-0422.mjs";
import { TokenizationFontDecorationProvider } from "./module-0405.mjs";
import { UNUSUAL_LINE_TERMINATORS, htmlAttributeEncodeValue, isHighSurrogate, singleLetterHash } from "./module-0030.mjs";
import { EditStack } from "./module-0393.mjs";
import { EDITOR_MODEL_DEFAULTS } from "./module-0102.mjs";
import { guessIndentation } from "./module-0394.mjs";
import { PieceTreeTextBuffer } from "./module-0397.mjs";
import { BugIndicatingError, illegalArgument, onUnexpectedError } from "./module-0004.mjs";
import { InternalModelContentChangeEvent, LineInjectedText, ModelFontChanged, ModelFontChangedEvent, ModelInjectedTextChangedEvent, ModelLineHeightChanged, ModelLineHeightChangedEvent, ModelRawContentChangedEvent, ModelRawEOLChanged, ModelRawFlush, ModelRawLineChanged, ModelRawLinesDeleted, ModelRawLinesInserted } from "./module-0369.mjs";
import { EditSources } from "./module-0377.mjs";
import { Position } from "./module-0079.mjs";
import { IntervalNode, IntervalTree, recomputeMaxEnd } from "./module-0373.mjs";
import { normalizeIndentation } from "./module-0111.mjs";
import { Selection } from "./module-0107.mjs";
import { SearchParams, TextModelSearch } from "./module-0171.mjs";
import { countEOL } from "./module-0375.mjs";
import { pushMany } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { LineTokens } from "./module-0145.mjs";
import { isDark } from "./module-0247.mjs";
import { Color } from "./module-0197.mjs";
import { SetWithKey } from "./module-0003.mjs";
import { LineFontChangingDecoration, LineHeightChangingDecoration } from "./module-0400.mjs";


// src/vs/editor/common/model/textModel.ts
function createTextBufferFactory(text2) {
  const builder = new PieceTreeTextBufferBuilder();
  builder.acceptChunk(text2);
  return builder.finish();
}

function createTextBufferFactoryFromStream(stream) {
  return new Promise((resolve3, reject) => {
    const builder = new PieceTreeTextBufferBuilder();
    let done = false;
    listenStream(stream, {
      onData: (chunk2) => {
        builder.acceptChunk(typeof chunk2 === "string" ? chunk2 : chunk2.toString());
      },
      onError: (error) => {
        if (!done) {
          done = true;
          reject(error);
        }
      },
      onEnd: () => {
        if (!done) {
          done = true;
          resolve3(builder.finish());
        }
      }
    });
  });
}

function createTextBufferFactoryFromSnapshot(snapshot) {
  const builder = new PieceTreeTextBufferBuilder();
  let chunk2;
  while (typeof (chunk2 = snapshot.read()) === "string") {
    builder.acceptChunk(chunk2);
  }
  return builder.finish();
}

function createTextBuffer(value2, defaultEOL) {
  let factory;
  if (typeof value2 === "string") {
    factory = createTextBufferFactory(value2);
  } else if (isITextSnapshot(value2)) {
    factory = createTextBufferFactoryFromSnapshot(value2);
  } else {
    factory = value2;
  }
  return factory.create(defaultEOL);
}

var MODEL_ID = 0;

var LIMIT_FIND_COUNT2 = 999;

var LONG_LINE_BOUNDARY = 1e4;

var LINE_HEIGHT_CEILING = 300;

var TextModelSnapshot = class {
  constructor(source) {
    this._source = source;
    this._eos = false;
  }
  read() {
    if (this._eos) {
      return null;
    }
    const result = [];
    let resultCnt = 0;
    let resultLength = 0;
    do {
      const tmp = this._source.read();
      if (tmp === null) {
        this._eos = true;
        if (resultCnt === 0) {
          return null;
        } else {
          return result.join("");
        }
      }
      if (tmp.length > 0) {
        result[resultCnt++] = tmp;
        resultLength += tmp.length;
      }
      if (resultLength >= 64 * 1024) {
        return result.join("");
      }
    } while (true);
  }
};

var invalidFunc2 = () => {
  throw new Error(`Invalid change accessor`);
};

var TextModel = class extends Disposable {
  constructor(source, languageIdOrSelection, creationOptions, associatedResource = null, _undoRedoService, _languageService, _languageConfigurationService, instantiationService) {
    super();
    this._undoRedoService = _undoRedoService;
    this._languageService = _languageService;
    this._languageConfigurationService = _languageConfigurationService;
    this.instantiationService = instantiationService;
    //#region Events
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this._onDidChangeDecorations = this._register(new DidChangeDecorationsEmitter((affectedInjectedTextLines, affectedLineHeights, affectedFontLines) => this.handleBeforeFireDecorationsChangedEvent(affectedInjectedTextLines, affectedLineHeights, affectedFontLines)));
    this.onDidChangeDecorations = this._onDidChangeDecorations.event;
    this._onDidChangeOptions = this._register(new Emitter());
    this._onDidChangeAttached = this._register(new Emitter());
    this._onDidChangeLineHeight = this._register(new Emitter());
    this._onDidChangeFont = this._register(new Emitter());
    this._eventEmitter = this._register(new DidChangeContentEmitter());
    this._languageSelectionListener = this._register(new MutableDisposable());
    this._deltaDecorationCallCnt = 0;
    this._attachedViews = this._register(new AttachedViews());
    this._viewModels = /* @__PURE__ */ new Set();
    MODEL_ID++;
    this.id = "$model" + MODEL_ID;
    this.isForSimpleWidget = creationOptions.isForSimpleWidget;
    if (typeof associatedResource === "undefined" || associatedResource === null) {
      this._associatedResource = URI.parse("inmemory://model/" + MODEL_ID);
    } else {
      this._associatedResource = associatedResource;
    }
    this._attachedEditorCount = 0;
    const { textBuffer, disposable } = createTextBuffer(source, creationOptions.defaultEOL);
    this._buffer = textBuffer;
    this._bufferDisposable = disposable;
    const bufferLineCount = this._buffer.getLineCount();
    const bufferTextLength = this._buffer.getValueLengthInRange(new Range2(1, 1, bufferLineCount, this._buffer.getLineLength(bufferLineCount) + 1), 0 /* TextDefined */);
    if (creationOptions.largeFileOptimizations) {
      this._isTooLargeForTokenization = bufferTextLength > TextModel.LARGE_FILE_SIZE_THRESHOLD || bufferLineCount > TextModel.LARGE_FILE_LINE_COUNT_THRESHOLD;
      this._isTooLargeForHeapOperation = bufferTextLength > TextModel.LARGE_FILE_HEAP_OPERATION_THRESHOLD;
    } else {
      this._isTooLargeForTokenization = false;
      this._isTooLargeForHeapOperation = false;
    }
    this._options = TextModel.resolveOptions(this._buffer, creationOptions);
    const languageId = typeof languageIdOrSelection === "string" ? languageIdOrSelection : languageIdOrSelection.languageId;
    if (typeof languageIdOrSelection !== "string") {
      this._languageSelectionListener.value = languageIdOrSelection.onDidChange(() => this._setLanguage(languageIdOrSelection.languageId));
    }
    this._bracketPairs = this._register(new BracketPairsTextModelPart(this, this._languageConfigurationService));
    this._guidesTextModelPart = this._register(new GuidesTextModelPart(this, this._languageConfigurationService));
    this._decorationProvider = this._register(new ColorizedBracketPairsDecorationProvider(this));
    this._tokenizationTextModelPart = this.instantiationService.createInstance(
      TokenizationTextModelPart,
      this,
      this._bracketPairs,
      languageId,
      this._attachedViews
    );
    this._fontTokenDecorationsProvider = this._register(new TokenizationFontDecorationProvider(this, this._tokenizationTextModelPart));
    this._isTooLargeForSyncing = bufferTextLength > TextModel._MODEL_SYNC_LIMIT;
    this._versionId = 1;
    this._alternativeVersionId = 1;
    this._initialUndoRedoSnapshot = null;
    this._isDisposed = false;
    this.__isDisposing = false;
    this._instanceId = singleLetterHash(MODEL_ID);
    this._lastDecorationId = 0;
    this._decorations = /* @__PURE__ */ Object.create(null);
    this._decorationsTree = new DecorationsTrees();
    this._commandManager = new EditStack(this, this._undoRedoService);
    this._isUndoing = false;
    this._isRedoing = false;
    this._trimAutoWhitespaceLines = null;
    this._register(this._decorationProvider.onDidChange(() => {
      this._onDidChangeDecorations.beginDeferredEmit();
      this._onDidChangeDecorations.fire();
      this._onDidChangeDecorations.endDeferredEmit();
    }));
    this._register(this._fontTokenDecorationsProvider.onDidChangeLineHeight((affectedLineHeights) => {
      this._onDidChangeDecorations.beginDeferredEmit();
      this._onDidChangeDecorations.fire();
      this._fireOnDidChangeLineHeight(affectedLineHeights);
      this._onDidChangeDecorations.endDeferredEmit();
    }));
    this._register(this._fontTokenDecorationsProvider.onDidChangeFont((affectedFontLines) => {
      this._onDidChangeDecorations.beginDeferredEmit();
      this._onDidChangeDecorations.fire();
      this._fireOnDidChangeFont(affectedFontLines);
      this._onDidChangeDecorations.endDeferredEmit();
    }));
    this._languageService.requestRichLanguageFeatures(languageId);
    this._register(this._languageConfigurationService.onDidChange((e4) => {
      this._bracketPairs.handleLanguageConfigurationServiceChange(e4);
      this._tokenizationTextModelPart.handleLanguageConfigurationServiceChange(e4);
    }));
  }
  static {
    this._MODEL_SYNC_LIMIT = 50 * 1024 * 1024;
  }
  static {
    // 50 MB,  // used in tests
    this.LARGE_FILE_SIZE_THRESHOLD = 20 * 1024 * 1024;
  }
  static {
    // 20 MB;
    this.LARGE_FILE_LINE_COUNT_THRESHOLD = 300 * 1e3;
  }
  static {
    // 300K lines
    this.LARGE_FILE_HEAP_OPERATION_THRESHOLD = 256 * 1024 * 1024;
  }
  static {
    // 256M characters, usually ~> 512MB memory usage
    this.DEFAULT_CREATION_OPTIONS = {
      isForSimpleWidget: false,
      tabSize: EDITOR_MODEL_DEFAULTS.tabSize,
      indentSize: EDITOR_MODEL_DEFAULTS.indentSize,
      insertSpaces: EDITOR_MODEL_DEFAULTS.insertSpaces,
      detectIndentation: false,
      defaultEOL: 1 /* LF */,
      trimAutoWhitespace: EDITOR_MODEL_DEFAULTS.trimAutoWhitespace,
      largeFileOptimizations: EDITOR_MODEL_DEFAULTS.largeFileOptimizations,
      bracketPairColorizationOptions: EDITOR_MODEL_DEFAULTS.bracketPairColorizationOptions
    };
  }
  static resolveOptions(textBuffer, options3) {
    if (options3.detectIndentation) {
      const guessedIndentation = guessIndentation(textBuffer, options3.tabSize, options3.insertSpaces);
      return new TextModelResolvedOptions({
        tabSize: guessedIndentation.tabSize,
        indentSize: "tabSize",
        // TODO@Alex: guess indentSize independent of tabSize
        insertSpaces: guessedIndentation.insertSpaces,
        trimAutoWhitespace: options3.trimAutoWhitespace,
        defaultEOL: options3.defaultEOL,
        bracketPairColorizationOptions: options3.bracketPairColorizationOptions
      });
    }
    return new TextModelResolvedOptions(options3);
  }
  get onDidChangeLanguage() {
    return this._tokenizationTextModelPart.onDidChangeLanguage;
  }
  get onDidChangeLanguageConfiguration() {
    return this._tokenizationTextModelPart.onDidChangeLanguageConfiguration;
  }
  get onDidChangeTokens() {
    return this._tokenizationTextModelPart.onDidChangeTokens;
  }
  get onDidChangeOptions() {
    return this._onDidChangeOptions.event;
  }
  get onDidChangeAttached() {
    return this._onDidChangeAttached.event;
  }
  get onDidChangeLineHeight() {
    return this._onDidChangeLineHeight.event;
  }
  get onDidChangeFont() {
    return this._onDidChangeFont.event;
  }
  onDidChangeContent(listener) {
    return this._eventEmitter.event((e4) => listener(e4.contentChangedEvent));
  }
  _isDisposing() {
    return this.__isDisposing;
  }
  get tokenization() {
    return this._tokenizationTextModelPart;
  }
  get bracketPairs() {
    return this._bracketPairs;
  }
  get guides() {
    return this._guidesTextModelPart;
  }
  dispose() {
    this.__isDisposing = true;
    this._onWillDispose.fire();
    this._tokenizationTextModelPart.dispose();
    this._isDisposed = true;
    super.dispose();
    this._bufferDisposable.dispose();
    this.__isDisposing = false;
    const emptyDisposedTextBuffer = new PieceTreeTextBuffer([], "", "\n", false, false, true, true);
    emptyDisposedTextBuffer.dispose();
    this._buffer = emptyDisposedTextBuffer;
    this._bufferDisposable = Disposable.None;
  }
  _hasListeners() {
    return this._onWillDispose.hasListeners() || this._onDidChangeDecorations.hasListeners() || this._tokenizationTextModelPart._hasListeners() || this._onDidChangeOptions.hasListeners() || this._onDidChangeAttached.hasListeners() || this._onDidChangeLineHeight.hasListeners() || this._onDidChangeFont.hasListeners() || this._eventEmitter.hasListeners();
  }
  _assertNotDisposed() {
    if (this._isDisposed) {
      throw new BugIndicatingError("Model is disposed!");
    }
  }
  registerViewModel(viewModel) {
    this._viewModels.add(viewModel);
  }
  unregisterViewModel(viewModel) {
    this._viewModels.delete(viewModel);
  }
  equalsTextBuffer(other) {
    this._assertNotDisposed();
    return this._buffer.equals(other);
  }
  getTextBuffer() {
    this._assertNotDisposed();
    return this._buffer;
  }
  _emitContentChangedEvent(rawChange, change, resultingSelection = null) {
    if (this.__isDisposing) {
      return;
    }
    this._tokenizationTextModelPart.handleDidChangeContent(change);
    this._bracketPairs.handleDidChangeContent(change);
    this._fontTokenDecorationsProvider.handleDidChangeContent(change);
    const contentChangeEvent = new InternalModelContentChangeEvent(rawChange, change);
    if (resultingSelection) {
      contentChangeEvent.rawContentChangedEvent.resultingSelection = resultingSelection;
    }
    this._onDidChangeContentOrInjectedText(contentChangeEvent);
    this._eventEmitter.fire(contentChangeEvent);
  }
  setValue(value2, reason = EditSources.setValue()) {
    this._assertNotDisposed();
    if (value2 === null || value2 === void 0) {
      throw illegalArgument();
    }
    const { textBuffer, disposable } = createTextBuffer(value2, this._options.defaultEOL);
    this._setValueFromTextBuffer(textBuffer, disposable, reason);
  }
  _createContentChanged2(range2, rangeOffset, rangeLength, rangeEndPosition, text2, isUndoing, isRedoing, isFlush, isEolChange, reason) {
    return {
      changes: [{
        range: range2,
        rangeOffset,
        rangeLength,
        text: text2
      }],
      eol: this._buffer.getEOL(),
      isEolChange,
      versionId: this.getVersionId(),
      isUndoing,
      isRedoing,
      isFlush,
      detailedReasons: [reason],
      detailedReasonsChangeLengths: [1]
    };
  }
  _setValueFromTextBuffer(textBuffer, textBufferDisposable, reason) {
    this._assertNotDisposed();
    const oldFullModelRange = this.getFullModelRange();
    const oldModelValueLength = this.getValueLengthInRange(oldFullModelRange);
    const endLineNumber = this.getLineCount();
    const endColumn = this.getLineMaxColumn(endLineNumber);
    this._buffer = textBuffer;
    this._bufferDisposable.dispose();
    this._bufferDisposable = textBufferDisposable;
    this._increaseVersionId();
    this._decorations = /* @__PURE__ */ Object.create(null);
    this._decorationsTree = new DecorationsTrees();
    this._commandManager.clear();
    this._trimAutoWhitespaceLines = null;
    this._emitContentChangedEvent(
      new ModelRawContentChangedEvent(
        [
          new ModelRawFlush()
        ],
        this._versionId,
        false,
        false
      ),
      this._createContentChanged2(new Range2(1, 1, endLineNumber, endColumn), 0, oldModelValueLength, new Position(endLineNumber, endColumn), this.getValue(), false, false, true, false, reason)
    );
  }
  setEOL(eol) {
    this._assertNotDisposed();
    const newEOL = eol === 1 /* CRLF */ ? "\r\n" : "\n";
    if (this._buffer.getEOL() === newEOL) {
      return;
    }
    const oldFullModelRange = this.getFullModelRange();
    const oldModelValueLength = this.getValueLengthInRange(oldFullModelRange);
    const endLineNumber = this.getLineCount();
    const endColumn = this.getLineMaxColumn(endLineNumber);
    this._onBeforeEOLChange();
    this._buffer.setEOL(newEOL);
    this._increaseVersionId();
    this._onAfterEOLChange();
    this._emitContentChangedEvent(
      new ModelRawContentChangedEvent(
        [
          new ModelRawEOLChanged()
        ],
        this._versionId,
        false,
        false
      ),
      this._createContentChanged2(new Range2(1, 1, endLineNumber, endColumn), 0, oldModelValueLength, new Position(endLineNumber, endColumn), this.getValue(), false, false, false, true, EditSources.eolChange())
    );
  }
  _onBeforeEOLChange() {
    this._decorationsTree.ensureAllNodesHaveRanges(this);
  }
  _onAfterEOLChange() {
    const versionId = this.getVersionId();
    const allDecorations = this._decorationsTree.collectNodesPostOrder();
    for (let i2 = 0, len = allDecorations.length; i2 < len; i2++) {
      const node = allDecorations[i2];
      const range2 = node.range;
      const delta2 = node.cachedAbsoluteStart - node.start;
      const startOffset = this._buffer.getOffsetAt(range2.startLineNumber, range2.startColumn);
      const endOffset = this._buffer.getOffsetAt(range2.endLineNumber, range2.endColumn);
      node.cachedAbsoluteStart = startOffset;
      node.cachedAbsoluteEnd = endOffset;
      node.cachedVersionId = versionId;
      node.start = startOffset - delta2;
      node.end = endOffset - delta2;
      recomputeMaxEnd(node);
    }
  }
  onBeforeAttached() {
    this._attachedEditorCount++;
    if (this._attachedEditorCount === 1) {
      this._tokenizationTextModelPart.handleDidChangeAttached();
      this._onDidChangeAttached.fire(void 0);
    }
    return this._attachedViews.attachView();
  }
  onBeforeDetached(view) {
    this._attachedEditorCount--;
    if (this._attachedEditorCount === 0) {
      this._tokenizationTextModelPart.handleDidChangeAttached();
      this._onDidChangeAttached.fire(void 0);
    }
    this._attachedViews.detachView(view);
  }
  isAttachedToEditor() {
    return this._attachedEditorCount > 0;
  }
  getAttachedEditorCount() {
    return this._attachedEditorCount;
  }
  isTooLargeForSyncing() {
    return this._isTooLargeForSyncing;
  }
  isTooLargeForTokenization() {
    return this._isTooLargeForTokenization;
  }
  isTooLargeForHeapOperation() {
    return this._isTooLargeForHeapOperation;
  }
  isDisposed() {
    return this._isDisposed;
  }
  isDominatedByLongLines() {
    this._assertNotDisposed();
    if (this.isTooLargeForTokenization()) {
      return false;
    }
    let smallLineCharCount = 0;
    let longLineCharCount = 0;
    const lineCount = this._buffer.getLineCount();
    for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
      const lineLength = this._buffer.getLineLength(lineNumber);
      if (lineLength >= LONG_LINE_BOUNDARY) {
        longLineCharCount += lineLength;
      } else {
        smallLineCharCount += lineLength;
      }
    }
    return longLineCharCount > smallLineCharCount;
  }
  get uri() {
    return this._associatedResource;
  }
  //#region Options
  getOptions() {
    this._assertNotDisposed();
    return this._options;
  }
  getFormattingOptions() {
    return {
      tabSize: this._options.indentSize,
      insertSpaces: this._options.insertSpaces
    };
  }
  updateOptions(_newOpts) {
    this._assertNotDisposed();
    const tabSize = typeof _newOpts.tabSize !== "undefined" ? _newOpts.tabSize : this._options.tabSize;
    const indentSize = typeof _newOpts.indentSize !== "undefined" ? _newOpts.indentSize : this._options.originalIndentSize;
    const insertSpaces = typeof _newOpts.insertSpaces !== "undefined" ? _newOpts.insertSpaces : this._options.insertSpaces;
    const trimAutoWhitespace = typeof _newOpts.trimAutoWhitespace !== "undefined" ? _newOpts.trimAutoWhitespace : this._options.trimAutoWhitespace;
    const bracketPairColorizationOptions = typeof _newOpts.bracketColorizationOptions !== "undefined" ? _newOpts.bracketColorizationOptions : this._options.bracketPairColorizationOptions;
    const newOpts = new TextModelResolvedOptions({
      tabSize,
      indentSize,
      insertSpaces,
      defaultEOL: this._options.defaultEOL,
      trimAutoWhitespace,
      bracketPairColorizationOptions
    });
    if (this._options.equals(newOpts)) {
      return;
    }
    const e4 = this._options.createChangeEvent(newOpts);
    this._options = newOpts;
    this._bracketPairs.handleDidChangeOptions(e4);
    this._decorationProvider.handleDidChangeOptions(e4);
    this._onDidChangeOptions.fire(e4);
  }
  detectIndentation(defaultInsertSpaces, defaultTabSize) {
    this._assertNotDisposed();
    const guessedIndentation = guessIndentation(this._buffer, defaultTabSize, defaultInsertSpaces);
    this.updateOptions({
      insertSpaces: guessedIndentation.insertSpaces,
      tabSize: guessedIndentation.tabSize,
      indentSize: guessedIndentation.tabSize
      // TODO@Alex: guess indentSize independent of tabSize
    });
  }
  normalizeIndentation(str) {
    this._assertNotDisposed();
    return normalizeIndentation(str, this._options.indentSize, this._options.insertSpaces);
  }
  //#endregion
  //#region Reading
  getVersionId() {
    this._assertNotDisposed();
    return this._versionId;
  }
  mightContainRTL() {
    return this._buffer.mightContainRTL();
  }
  mightContainUnusualLineTerminators() {
    return this._buffer.mightContainUnusualLineTerminators();
  }
  removeUnusualLineTerminators(selections = null) {
    const matches2 = this.findMatches(UNUSUAL_LINE_TERMINATORS.source, false, true, false, null, false, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
    this._buffer.resetMightContainUnusualLineTerminators();
    this.pushEditOperations(selections, matches2.map((m) => ({ range: m.range, text: null })), () => null);
  }
  mightContainNonBasicASCII() {
    return this._buffer.mightContainNonBasicASCII();
  }
  getAlternativeVersionId() {
    this._assertNotDisposed();
    return this._alternativeVersionId;
  }
  getInitialUndoRedoSnapshot() {
    this._assertNotDisposed();
    return this._initialUndoRedoSnapshot;
  }
  getOffsetAt(rawPosition) {
    this._assertNotDisposed();
    const position2 = this._validatePosition(rawPosition.lineNumber, rawPosition.column, 0 /* Relaxed */);
    return this._buffer.getOffsetAt(position2.lineNumber, position2.column);
  }
  getPositionAt(rawOffset) {
    this._assertNotDisposed();
    const offset = Math.min(this._buffer.getLength(), Math.max(0, rawOffset));
    return this._buffer.getPositionAt(offset);
  }
  _increaseVersionId() {
    this._versionId = this._versionId + 1;
    this._alternativeVersionId = this._versionId;
  }
  _overwriteVersionId(versionId) {
    this._versionId = versionId;
  }
  _overwriteAlternativeVersionId(newAlternativeVersionId) {
    this._alternativeVersionId = newAlternativeVersionId;
  }
  _overwriteInitialUndoRedoSnapshot(newInitialUndoRedoSnapshot) {
    this._initialUndoRedoSnapshot = newInitialUndoRedoSnapshot;
  }
  getValue(eol, preserveBOM = false) {
    this._assertNotDisposed();
    if (this.isTooLargeForHeapOperation()) {
      throw new BugIndicatingError("Operation would exceed heap memory limits");
    }
    const fullModelRange = this.getFullModelRange();
    const fullModelValue = this.getValueInRange(fullModelRange, eol);
    if (preserveBOM) {
      return this._buffer.getBOM() + fullModelValue;
    }
    return fullModelValue;
  }
  createSnapshot(preserveBOM = false) {
    return new TextModelSnapshot(this._buffer.createSnapshot(preserveBOM));
  }
  getValueLength(eol, preserveBOM = false) {
    this._assertNotDisposed();
    const fullModelRange = this.getFullModelRange();
    const fullModelValue = this.getValueLengthInRange(fullModelRange, eol);
    if (preserveBOM) {
      return this._buffer.getBOM().length + fullModelValue;
    }
    return fullModelValue;
  }
  getValueInRange(rawRange, eol = 0 /* TextDefined */) {
    this._assertNotDisposed();
    return this._buffer.getValueInRange(this.validateRange(rawRange), eol);
  }
  getValueLengthInRange(rawRange, eol = 0 /* TextDefined */) {
    this._assertNotDisposed();
    return this._buffer.getValueLengthInRange(this.validateRange(rawRange), eol);
  }
  getCharacterCountInRange(rawRange, eol = 0 /* TextDefined */) {
    this._assertNotDisposed();
    return this._buffer.getCharacterCountInRange(this.validateRange(rawRange), eol);
  }
  getLineCount() {
    this._assertNotDisposed();
    return this._buffer.getLineCount();
  }
  getLineContent(lineNumber) {
    this._assertNotDisposed();
    if (lineNumber < 1 || lineNumber > this.getLineCount()) {
      throw new BugIndicatingError("Illegal value for lineNumber");
    }
    return this._buffer.getLineContent(lineNumber);
  }
  getLineLength(lineNumber) {
    this._assertNotDisposed();
    if (lineNumber < 1 || lineNumber > this.getLineCount()) {
      throw new BugIndicatingError("Illegal value for lineNumber");
    }
    return this._buffer.getLineLength(lineNumber);
  }
  getLinesContent() {
    this._assertNotDisposed();
    if (this.isTooLargeForHeapOperation()) {
      throw new BugIndicatingError("Operation would exceed heap memory limits");
    }
    return this._buffer.getLinesContent();
  }
  getEOL() {
    this._assertNotDisposed();
    return this._buffer.getEOL();
  }
  getEndOfLineSequence() {
    this._assertNotDisposed();
    return this._buffer.getEOL() === "\n" ? 0 /* LF */ : 1 /* CRLF */;
  }
  getLineMinColumn(lineNumber) {
    this._assertNotDisposed();
    return 1;
  }
  getLineMaxColumn(lineNumber) {
    this._assertNotDisposed();
    if (lineNumber < 1 || lineNumber > this.getLineCount()) {
      throw new BugIndicatingError("Illegal value for lineNumber");
    }
    return this._buffer.getLineLength(lineNumber) + 1;
  }
  getLineFirstNonWhitespaceColumn(lineNumber) {
    this._assertNotDisposed();
    if (lineNumber < 1 || lineNumber > this.getLineCount()) {
      throw new BugIndicatingError("Illegal value for lineNumber");
    }
    return this._buffer.getLineFirstNonWhitespaceColumn(lineNumber);
  }
  getLineLastNonWhitespaceColumn(lineNumber) {
    this._assertNotDisposed();
    if (lineNumber < 1 || lineNumber > this.getLineCount()) {
      throw new BugIndicatingError("Illegal value for lineNumber");
    }
    return this._buffer.getLineLastNonWhitespaceColumn(lineNumber);
  }
  /**
   * Validates `range` is within buffer bounds, but allows it to sit in between surrogate pairs, etc.
   * Will try to not allocate if possible.
   */
  _validateRangeRelaxedNoAllocations(range2) {
    const linesCount = this._buffer.getLineCount();
    const initialStartLineNumber = range2.startLineNumber;
    const initialStartColumn = range2.startColumn;
    let startLineNumber = Math.floor(typeof initialStartLineNumber === "number" && !isNaN(initialStartLineNumber) ? initialStartLineNumber : 1);
    let startColumn = Math.floor(typeof initialStartColumn === "number" && !isNaN(initialStartColumn) ? initialStartColumn : 1);
    if (startLineNumber < 1) {
      startLineNumber = 1;
      startColumn = 1;
    } else if (startLineNumber > linesCount) {
      startLineNumber = linesCount;
      startColumn = this.getLineMaxColumn(startLineNumber);
    } else {
      if (startColumn <= 1) {
        startColumn = 1;
      } else {
        const maxColumn = this.getLineMaxColumn(startLineNumber);
        if (startColumn >= maxColumn) {
          startColumn = maxColumn;
        }
      }
    }
    const initialEndLineNumber = range2.endLineNumber;
    const initialEndColumn = range2.endColumn;
    let endLineNumber = Math.floor(typeof initialEndLineNumber === "number" && !isNaN(initialEndLineNumber) ? initialEndLineNumber : 1);
    let endColumn = Math.floor(typeof initialEndColumn === "number" && !isNaN(initialEndColumn) ? initialEndColumn : 1);
    if (endLineNumber < 1) {
      endLineNumber = 1;
      endColumn = 1;
    } else if (endLineNumber > linesCount) {
      endLineNumber = linesCount;
      endColumn = this.getLineMaxColumn(endLineNumber);
    } else {
      if (endColumn <= 1) {
        endColumn = 1;
      } else {
        const maxColumn = this.getLineMaxColumn(endLineNumber);
        if (endColumn >= maxColumn) {
          endColumn = maxColumn;
        }
      }
    }
    if (initialStartLineNumber === startLineNumber && initialStartColumn === startColumn && initialEndLineNumber === endLineNumber && initialEndColumn === endColumn && range2 instanceof Range2 && !(range2 instanceof Selection)) {
      return range2;
    }
    return new Range2(startLineNumber, startColumn, endLineNumber, endColumn);
  }
  _isValidPosition(lineNumber, column, validationType) {
    if (typeof lineNumber !== "number" || typeof column !== "number") {
      return false;
    }
    if (isNaN(lineNumber) || isNaN(column)) {
      return false;
    }
    if (lineNumber < 1 || column < 1) {
      return false;
    }
    if ((lineNumber | 0) !== lineNumber || (column | 0) !== column) {
      return false;
    }
    const lineCount = this._buffer.getLineCount();
    if (lineNumber > lineCount) {
      return false;
    }
    if (column === 1) {
      return true;
    }
    const maxColumn = this.getLineMaxColumn(lineNumber);
    if (column > maxColumn) {
      return false;
    }
    if (validationType === 1 /* SurrogatePairs */) {
      const charCodeBefore = this._buffer.getLineCharCode(lineNumber, column - 2);
      if (isHighSurrogate(charCodeBefore)) {
        return false;
      }
    }
    return true;
  }
  _validatePosition(_lineNumber, _column, validationType) {
    const lineNumber = Math.floor(typeof _lineNumber === "number" && !isNaN(_lineNumber) ? _lineNumber : 1);
    const column = Math.floor(typeof _column === "number" && !isNaN(_column) ? _column : 1);
    const lineCount = this._buffer.getLineCount();
    if (lineNumber < 1) {
      return new Position(1, 1);
    }
    if (lineNumber > lineCount) {
      return new Position(lineCount, this.getLineMaxColumn(lineCount));
    }
    if (column <= 1) {
      return new Position(lineNumber, 1);
    }
    const maxColumn = this.getLineMaxColumn(lineNumber);
    if (column >= maxColumn) {
      return new Position(lineNumber, maxColumn);
    }
    if (validationType === 1 /* SurrogatePairs */) {
      const charCodeBefore = this._buffer.getLineCharCode(lineNumber, column - 2);
      if (isHighSurrogate(charCodeBefore)) {
        return new Position(lineNumber, column - 1);
      }
    }
    return new Position(lineNumber, column);
  }
  validatePosition(position2) {
    const validationType = 1 /* SurrogatePairs */;
    this._assertNotDisposed();
    if (position2 instanceof Position) {
      if (this._isValidPosition(position2.lineNumber, position2.column, validationType)) {
        return position2;
      }
    }
    return this._validatePosition(position2.lineNumber, position2.column, validationType);
  }
  isValidRange(range2) {
    return this._isValidRange(range2, 1 /* SurrogatePairs */);
  }
  _isValidRange(range2, validationType) {
    const startLineNumber = range2.startLineNumber;
    const startColumn = range2.startColumn;
    const endLineNumber = range2.endLineNumber;
    const endColumn = range2.endColumn;
    if (!this._isValidPosition(startLineNumber, startColumn, 0 /* Relaxed */)) {
      return false;
    }
    if (!this._isValidPosition(endLineNumber, endColumn, 0 /* Relaxed */)) {
      return false;
    }
    if (validationType === 1 /* SurrogatePairs */) {
      const charCodeBeforeStart = startColumn > 1 ? this._buffer.getLineCharCode(startLineNumber, startColumn - 2) : 0;
      const charCodeBeforeEnd = endColumn > 1 && endColumn <= this._buffer.getLineLength(endLineNumber) ? this._buffer.getLineCharCode(endLineNumber, endColumn - 2) : 0;
      const startInsideSurrogatePair = isHighSurrogate(charCodeBeforeStart);
      const endInsideSurrogatePair = isHighSurrogate(charCodeBeforeEnd);
      if (!startInsideSurrogatePair && !endInsideSurrogatePair) {
        return true;
      }
      return false;
    }
    return true;
  }
  validateRange(_range) {
    const validationType = 1 /* SurrogatePairs */;
    this._assertNotDisposed();
    if (_range instanceof Range2 && !(_range instanceof Selection)) {
      if (this._isValidRange(_range, validationType)) {
        return _range;
      }
    }
    const start = this._validatePosition(_range.startLineNumber, _range.startColumn, 0 /* Relaxed */);
    const end = this._validatePosition(_range.endLineNumber, _range.endColumn, 0 /* Relaxed */);
    const startLineNumber = start.lineNumber;
    const startColumn = start.column;
    const endLineNumber = end.lineNumber;
    const endColumn = end.column;
    if (validationType === 1 /* SurrogatePairs */) {
      const charCodeBeforeStart = startColumn > 1 ? this._buffer.getLineCharCode(startLineNumber, startColumn - 2) : 0;
      const charCodeBeforeEnd = endColumn > 1 && endColumn <= this._buffer.getLineLength(endLineNumber) ? this._buffer.getLineCharCode(endLineNumber, endColumn - 2) : 0;
      const startInsideSurrogatePair = isHighSurrogate(charCodeBeforeStart);
      const endInsideSurrogatePair = isHighSurrogate(charCodeBeforeEnd);
      if (!startInsideSurrogatePair && !endInsideSurrogatePair) {
        return new Range2(startLineNumber, startColumn, endLineNumber, endColumn);
      }
      if (startLineNumber === endLineNumber && startColumn === endColumn) {
        return new Range2(startLineNumber, startColumn - 1, endLineNumber, endColumn - 1);
      }
      if (startInsideSurrogatePair && endInsideSurrogatePair) {
        return new Range2(startLineNumber, startColumn - 1, endLineNumber, endColumn + 1);
      }
      if (startInsideSurrogatePair) {
        return new Range2(startLineNumber, startColumn - 1, endLineNumber, endColumn);
      }
      return new Range2(startLineNumber, startColumn, endLineNumber, endColumn + 1);
    }
    return new Range2(startLineNumber, startColumn, endLineNumber, endColumn);
  }
  modifyPosition(rawPosition, offset) {
    this._assertNotDisposed();
    const candidate = this.getOffsetAt(rawPosition) + offset;
    return this.getPositionAt(Math.min(this._buffer.getLength(), Math.max(0, candidate)));
  }
  getFullModelRange() {
    this._assertNotDisposed();
    const lineCount = this.getLineCount();
    return new Range2(1, 1, lineCount, this.getLineMaxColumn(lineCount));
  }
  findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount) {
    return this._buffer.findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount);
  }
  findMatches(searchString, rawSearchScope, isRegex2, matchCase, wordSeparators2, captureMatches, limitResultCount = LIMIT_FIND_COUNT2) {
    this._assertNotDisposed();
    let searchRanges = null;
    if (rawSearchScope !== null && typeof rawSearchScope !== "boolean") {
      if (!Array.isArray(rawSearchScope)) {
        rawSearchScope = [rawSearchScope];
      }
      if (rawSearchScope.every((searchScope) => Range2.isIRange(searchScope))) {
        searchRanges = rawSearchScope.map((searchScope) => this.validateRange(searchScope));
      }
    }
    if (searchRanges === null) {
      searchRanges = [this.getFullModelRange()];
    }
    searchRanges = searchRanges.sort((d1, d2) => d1.startLineNumber - d2.startLineNumber || d1.startColumn - d2.startColumn);
    const uniqueSearchRanges = [];
    uniqueSearchRanges.push(searchRanges.reduce((prev, curr) => {
      if (Range2.areIntersecting(prev, curr)) {
        return prev.plusRange(curr);
      }
      uniqueSearchRanges.push(prev);
      return curr;
    }));
    let matchMapper;
    if (!isRegex2 && searchString.indexOf("\n") < 0) {
      const searchParams = new SearchParams(searchString, isRegex2, matchCase, wordSeparators2);
      const searchData = searchParams.parseSearchRequest();
      if (!searchData) {
        return [];
      }
      matchMapper = (searchRange) => this.findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount);
    } else {
      matchMapper = (searchRange) => TextModelSearch.findMatches(this, new SearchParams(searchString, isRegex2, matchCase, wordSeparators2), searchRange, captureMatches, limitResultCount);
    }
    return uniqueSearchRanges.map(matchMapper).reduce((arr, matches2) => arr.concat(matches2), []);
  }
  findNextMatch(searchString, rawSearchStart, isRegex2, matchCase, wordSeparators2, captureMatches) {
    this._assertNotDisposed();
    const searchStart = this.validatePosition(rawSearchStart);
    if (!isRegex2 && searchString.indexOf("\n") < 0) {
      const searchParams = new SearchParams(searchString, isRegex2, matchCase, wordSeparators2);
      const searchData = searchParams.parseSearchRequest();
      if (!searchData) {
        return null;
      }
      const lineCount = this.getLineCount();
      let searchRange = new Range2(searchStart.lineNumber, searchStart.column, lineCount, this.getLineMaxColumn(lineCount));
      let ret = this.findMatchesLineByLine(searchRange, searchData, captureMatches, 1);
      TextModelSearch.findNextMatch(this, new SearchParams(searchString, isRegex2, matchCase, wordSeparators2), searchStart, captureMatches);
      if (ret.length > 0) {
        return ret[0];
      }
      searchRange = new Range2(1, 1, searchStart.lineNumber, this.getLineMaxColumn(searchStart.lineNumber));
      ret = this.findMatchesLineByLine(searchRange, searchData, captureMatches, 1);
      if (ret.length > 0) {
        return ret[0];
      }
      return null;
    }
    return TextModelSearch.findNextMatch(this, new SearchParams(searchString, isRegex2, matchCase, wordSeparators2), searchStart, captureMatches);
  }
  findPreviousMatch(searchString, rawSearchStart, isRegex2, matchCase, wordSeparators2, captureMatches) {
    this._assertNotDisposed();
    const searchStart = this.validatePosition(rawSearchStart);
    return TextModelSearch.findPreviousMatch(this, new SearchParams(searchString, isRegex2, matchCase, wordSeparators2), searchStart, captureMatches);
  }
  //#endregion
  //#region Editing
  pushStackElement() {
    this._commandManager.pushStackElement();
  }
  popStackElement() {
    this._commandManager.popStackElement();
  }
  pushEOL(eol) {
    const currentEOL = this.getEOL() === "\n" ? 0 /* LF */ : 1 /* CRLF */;
    if (currentEOL === eol) {
      return;
    }
    try {
      this._onDidChangeDecorations.beginDeferredEmit();
      this._eventEmitter.beginDeferredEmit();
      if (this._initialUndoRedoSnapshot === null) {
        this._initialUndoRedoSnapshot = this._undoRedoService.createSnapshot(this.uri);
      }
      this._commandManager.pushEOL(eol);
    } finally {
      this._eventEmitter.endDeferredEmit();
      this._onDidChangeDecorations.endDeferredEmit();
    }
  }
  _validateEditOperation(rawOperation) {
    if (rawOperation instanceof ValidAnnotatedEditOperation) {
      return rawOperation;
    }
    const validatedRange = this.validateRange(rawOperation.range);
    let opText = rawOperation.text;
    if (opText) {
      const endsWithLoneCR = opText.length > 0 && opText.charCodeAt(opText.length - 1) === 13 /* CarriageReturn */;
      const removeTrailingCR = this.getEOL() === "\r\n" && endsWithLoneCR && validatedRange.endColumn === this.getLineMaxColumn(validatedRange.endLineNumber);
      if (removeTrailingCR) {
        opText = opText.substring(0, opText.length - 1);
      }
    }
    return new ValidAnnotatedEditOperation(
      rawOperation.identifier || null,
      validatedRange,
      opText,
      rawOperation.forceMoveMarkers || false,
      rawOperation.isAutoWhitespaceEdit || false,
      rawOperation._isTracked || false
    );
  }
  _validateEditOperations(rawOperations) {
    const result = [];
    for (let i2 = 0, len = rawOperations.length; i2 < len; i2++) {
      result[i2] = this._validateEditOperation(rawOperations[i2]);
    }
    return result;
  }
  edit(edit3, options3) {
    this.pushEditOperations(null, edit3.replacements.map((r2) => ({ range: r2.range, text: r2.text })), null);
  }
  pushEditOperations(beforeCursorState, editOperations, cursorStateComputer, group2, reason) {
    try {
      this._onDidChangeDecorations.beginDeferredEmit();
      this._eventEmitter.beginDeferredEmit();
      return this._pushEditOperations(beforeCursorState, this._validateEditOperations(editOperations), cursorStateComputer, group2, reason);
    } finally {
      this._eventEmitter.endDeferredEmit();
      this._onDidChangeDecorations.endDeferredEmit();
    }
  }
  _pushEditOperations(beforeCursorState, editOperations, cursorStateComputer, group2, reason) {
    if (this._options.trimAutoWhitespace && this._trimAutoWhitespaceLines) {
      const incomingEdits = editOperations.map((op) => {
        return {
          range: this.validateRange(op.range),
          text: op.text
        };
      });
      let editsAreNearCursors = true;
      if (beforeCursorState) {
        for (let i2 = 0, len = beforeCursorState.length; i2 < len; i2++) {
          const sel = beforeCursorState[i2];
          let foundEditNearSel = false;
          for (let j = 0, lenJ = incomingEdits.length; j < lenJ; j++) {
            const editRange = incomingEdits[j].range;
            const selIsAbove = editRange.startLineNumber > sel.endLineNumber;
            const selIsBelow = sel.startLineNumber > editRange.endLineNumber;
            if (!selIsAbove && !selIsBelow) {
              foundEditNearSel = true;
              break;
            }
          }
          if (!foundEditNearSel) {
            editsAreNearCursors = false;
            break;
          }
        }
      }
      if (editsAreNearCursors) {
        for (let i2 = 0, len = this._trimAutoWhitespaceLines.length; i2 < len; i2++) {
          const trimLineNumber = this._trimAutoWhitespaceLines[i2];
          const maxLineColumn = this.getLineMaxColumn(trimLineNumber);
          let allowTrimLine = true;
          for (let j = 0, lenJ = incomingEdits.length; j < lenJ; j++) {
            const editRange = incomingEdits[j].range;
            const editText = incomingEdits[j].text;
            if (trimLineNumber < editRange.startLineNumber || trimLineNumber > editRange.endLineNumber) {
              continue;
            }
            if (trimLineNumber === editRange.startLineNumber && editRange.startColumn === maxLineColumn && editRange.isEmpty() && editText && editText.length > 0 && editText.charAt(0) === "\n") {
              continue;
            }
            if (trimLineNumber === editRange.startLineNumber && editRange.startColumn === 1 && editRange.isEmpty() && editText && editText.length > 0 && editText.charAt(editText.length - 1) === "\n") {
              continue;
            }
            allowTrimLine = false;
            break;
          }
          if (allowTrimLine) {
            const trimRange = new Range2(trimLineNumber, 1, trimLineNumber, maxLineColumn);
            editOperations.push(new ValidAnnotatedEditOperation(null, trimRange, null, false, false, false));
          }
        }
      }
      this._trimAutoWhitespaceLines = null;
    }
    if (this._initialUndoRedoSnapshot === null) {
      this._initialUndoRedoSnapshot = this._undoRedoService.createSnapshot(this.uri);
    }
    return this._commandManager.pushEditOperation(beforeCursorState, editOperations, cursorStateComputer, group2, reason);
  }
  _applyUndo(changes, eol, resultingAlternativeVersionId, resultingSelection) {
    const edits = changes.map((change) => {
      const rangeStart = this.getPositionAt(change.newPosition);
      const rangeEnd = this.getPositionAt(change.newEnd);
      return {
        range: new Range2(rangeStart.lineNumber, rangeStart.column, rangeEnd.lineNumber, rangeEnd.column),
        text: change.oldText
      };
    });
    this._applyUndoRedoEdits(edits, eol, true, false, resultingAlternativeVersionId, resultingSelection);
  }
  _applyRedo(changes, eol, resultingAlternativeVersionId, resultingSelection) {
    const edits = changes.map((change) => {
      const rangeStart = this.getPositionAt(change.oldPosition);
      const rangeEnd = this.getPositionAt(change.oldEnd);
      return {
        range: new Range2(rangeStart.lineNumber, rangeStart.column, rangeEnd.lineNumber, rangeEnd.column),
        text: change.newText
      };
    });
    this._applyUndoRedoEdits(edits, eol, false, true, resultingAlternativeVersionId, resultingSelection);
  }
  _applyUndoRedoEdits(edits, eol, isUndoing, isRedoing, resultingAlternativeVersionId, resultingSelection) {
    try {
      this._onDidChangeDecorations.beginDeferredEmit();
      this._eventEmitter.beginDeferredEmit();
      this._isUndoing = isUndoing;
      this._isRedoing = isRedoing;
      const operations = this._validateEditOperations(edits);
      this._doApplyEdits(operations, false, EditSources.applyEdits(), resultingSelection);
      this.setEOL(eol);
      this._overwriteAlternativeVersionId(resultingAlternativeVersionId);
    } finally {
      this._isUndoing = false;
      this._isRedoing = false;
      this._eventEmitter.endDeferredEmit(resultingSelection);
      this._onDidChangeDecorations.endDeferredEmit();
    }
  }
  applyEdits(rawOperations, computeUndoEdits, reason) {
    try {
      this._onDidChangeDecorations.beginDeferredEmit();
      this._eventEmitter.beginDeferredEmit();
      const operations = this._validateEditOperations(rawOperations);
      return this._doApplyEdits(operations, computeUndoEdits ?? false, reason ?? EditSources.applyEdits());
    } finally {
      this._eventEmitter.endDeferredEmit();
      this._onDidChangeDecorations.endDeferredEmit();
    }
  }
  _doApplyEdits(rawOperations, computeUndoEdits, reason, resultingSelection = null) {
    const oldLineCount = this._buffer.getLineCount();
    const result = this._buffer.applyEdits(rawOperations, this._options.trimAutoWhitespace, computeUndoEdits);
    const newLineCount = this._buffer.getLineCount();
    const contentChanges = result.changes;
    this._trimAutoWhitespaceLines = result.trimAutoWhitespaceLineNumbers;
    if (contentChanges.length !== 0) {
      for (let i2 = 0, len = contentChanges.length; i2 < len; i2++) {
        const change = contentChanges[i2];
        this._decorationsTree.acceptReplace(change.rangeOffset, change.rangeLength, change.text.length, change.forceMoveMarkers);
      }
      const rawContentChanges = [];
      this._increaseVersionId();
      let lineCount = oldLineCount;
      for (let i2 = 0, len = contentChanges.length; i2 < len; i2++) {
        const change = contentChanges[i2];
        const [eolCount] = countEOL(change.text);
        this._onDidChangeDecorations.fire();
        const startLineNumber = change.range.startLineNumber;
        const endLineNumber = change.range.endLineNumber;
        const deletingLinesCnt = endLineNumber - startLineNumber;
        const insertingLinesCnt = eolCount;
        const editingLinesCnt = Math.min(deletingLinesCnt, insertingLinesCnt);
        const changeLineCountDelta = insertingLinesCnt - deletingLinesCnt;
        const currentEditStartLineNumber = newLineCount - lineCount - changeLineCountDelta + startLineNumber;
        for (let j = editingLinesCnt; j >= 0; j--) {
          const editLineNumber = startLineNumber + j;
          const currentEditLineNumber = currentEditStartLineNumber + j;
          rawContentChanges.push(
            new ModelRawLineChanged(
              editLineNumber,
              currentEditLineNumber
            )
          );
        }
        if (editingLinesCnt < deletingLinesCnt) {
          const spliceStartLineNumber = startLineNumber + editingLinesCnt;
          const cnt = insertingLinesCnt - deletingLinesCnt;
          const lastUntouchedLinePostEdit = newLineCount - lineCount - cnt + spliceStartLineNumber;
          rawContentChanges.push(new ModelRawLinesDeleted(spliceStartLineNumber + 1, endLineNumber, lastUntouchedLinePostEdit));
        }
        if (editingLinesCnt < insertingLinesCnt) {
          const spliceLineNumber = startLineNumber + editingLinesCnt;
          const cnt = insertingLinesCnt - editingLinesCnt;
          const fromLineNumber = newLineCount - lineCount - cnt + spliceLineNumber + 1;
          rawContentChanges.push(
            new ModelRawLinesInserted(
              spliceLineNumber + 1,
              fromLineNumber,
              cnt
            )
          );
        }
        lineCount += changeLineCountDelta;
      }
      this._emitContentChangedEvent(
        new ModelRawContentChangedEvent(
          rawContentChanges,
          this.getVersionId(),
          this._isUndoing,
          this._isRedoing
        ),
        {
          changes: contentChanges,
          eol: this._buffer.getEOL(),
          isEolChange: false,
          versionId: this.getVersionId(),
          isUndoing: this._isUndoing,
          isRedoing: this._isRedoing,
          isFlush: false,
          detailedReasons: [reason],
          detailedReasonsChangeLengths: [contentChanges.length]
        },
        resultingSelection
      );
    }
    return result.reverseEdits === null ? void 0 : result.reverseEdits;
  }
  undo() {
    return this._undoRedoService.undo(this.uri);
  }
  canUndo() {
    return this._undoRedoService.canUndo(this.uri);
  }
  redo() {
    return this._undoRedoService.redo(this.uri);
  }
  canRedo() {
    return this._undoRedoService.canRedo(this.uri);
  }
  //#endregion
  //#region Decorations
  handleBeforeFireDecorationsChangedEvent(affectedInjectedTextLines, affectedLineHeights, affectedFontLines) {
    if (affectedInjectedTextLines && affectedInjectedTextLines.size > 0) {
      const affectedLines = Array.from(affectedInjectedTextLines);
      const lineChangeEvents = affectedLines.map((lineNumber) => new ModelRawLineChanged(lineNumber, lineNumber));
      this._onDidChangeContentOrInjectedText(new ModelInjectedTextChangedEvent(lineChangeEvents));
    }
    this._fireOnDidChangeLineHeight(affectedLineHeights);
    this._fireOnDidChangeFont(affectedFontLines);
  }
  _fireOnDidChangeLineHeight(affectedLineHeights) {
    if (affectedLineHeights && affectedLineHeights.size > 0) {
      const affectedLines = Array.from(affectedLineHeights);
      const lineHeightChangeEvent = affectedLines.map((specialLineHeightChange) => new ModelLineHeightChanged(specialLineHeightChange.ownerId, specialLineHeightChange.decorationId, specialLineHeightChange.lineNumber, specialLineHeightChange.lineHeight));
      this._onDidChangeLineHeight.fire(new ModelLineHeightChangedEvent(lineHeightChangeEvent));
    }
  }
  _fireOnDidChangeFont(affectedFontLines) {
    if (affectedFontLines && affectedFontLines.size > 0) {
      const affectedLines = Array.from(affectedFontLines);
      const fontChangeEvent = affectedLines.map((fontChange) => new ModelFontChanged(fontChange.ownerId, fontChange.lineNumber));
      this._onDidChangeFont.fire(new ModelFontChangedEvent(fontChangeEvent));
    }
  }
  _onDidChangeContentOrInjectedText(e4) {
    for (const viewModel of this._viewModels) {
      try {
        viewModel.onDidChangeContentOrInjectedText(e4);
      } catch (error) {
        onUnexpectedError(error);
      }
    }
    for (const viewModel of this._viewModels) {
      try {
        viewModel.emitContentChangeEvent(e4);
      } catch (error) {
        onUnexpectedError(error);
      }
    }
  }
  changeDecorations(callback, ownerId2 = 0) {
    this._assertNotDisposed();
    try {
      this._onDidChangeDecorations.beginDeferredEmit();
      return this._changeDecorations(ownerId2, callback);
    } finally {
      this._onDidChangeDecorations.endDeferredEmit();
    }
  }
  _changeDecorations(ownerId2, callback) {
    const changeAccessor = {
      addDecoration: (range2, options3) => {
        return this._deltaDecorationsImpl(ownerId2, [], [{ range: range2, options: options3 }])[0];
      },
      changeDecoration: (id2, newRange) => {
        this._changeDecorationImpl(ownerId2, id2, newRange);
      },
      changeDecorationOptions: (id2, options3) => {
        this._changeDecorationOptionsImpl(ownerId2, id2, _normalizeOptions(options3));
      },
      removeDecoration: (id2) => {
        this._deltaDecorationsImpl(ownerId2, [id2], []);
      },
      deltaDecorations: (oldDecorations, newDecorations) => {
        if (oldDecorations.length === 0 && newDecorations.length === 0) {
          return [];
        }
        return this._deltaDecorationsImpl(ownerId2, oldDecorations, newDecorations);
      }
    };
    let result = null;
    try {
      result = callback(changeAccessor);
    } catch (e4) {
      onUnexpectedError(e4);
    }
    changeAccessor.addDecoration = invalidFunc2;
    changeAccessor.changeDecoration = invalidFunc2;
    changeAccessor.changeDecorationOptions = invalidFunc2;
    changeAccessor.removeDecoration = invalidFunc2;
    changeAccessor.deltaDecorations = invalidFunc2;
    return result;
  }
  deltaDecorations(oldDecorations, newDecorations, ownerId2 = 0) {
    this._assertNotDisposed();
    if (!oldDecorations) {
      oldDecorations = [];
    }
    if (oldDecorations.length === 0 && newDecorations.length === 0) {
      return [];
    }
    try {
      this._deltaDecorationCallCnt++;
      if (this._deltaDecorationCallCnt > 1) {
        console.warn(`Invoking deltaDecorations recursively could lead to leaking decorations.`);
        onUnexpectedError(new Error(`Invoking deltaDecorations recursively could lead to leaking decorations.`));
      }
      this._onDidChangeDecorations.beginDeferredEmit();
      return this._deltaDecorationsImpl(ownerId2, oldDecorations, newDecorations);
    } finally {
      this._onDidChangeDecorations.endDeferredEmit();
      this._deltaDecorationCallCnt--;
    }
  }
  _getTrackedRange(id2) {
    return this.getDecorationRange(id2);
  }
  _setTrackedRange(id2, newRange, newStickiness) {
    const node = id2 ? this._decorations[id2] : null;
    if (!node) {
      if (!newRange) {
        return null;
      }
      return this._deltaDecorationsImpl(0, [], [{ range: newRange, options: TRACKED_RANGE_OPTIONS[newStickiness] }], true)[0];
    }
    if (!newRange) {
      this._decorationsTree.delete(node);
      delete this._decorations[node.id];
      return null;
    }
    const range2 = this._validateRangeRelaxedNoAllocations(newRange);
    const startOffset = this._buffer.getOffsetAt(range2.startLineNumber, range2.startColumn);
    const endOffset = this._buffer.getOffsetAt(range2.endLineNumber, range2.endColumn);
    this._decorationsTree.delete(node);
    node.reset(this.getVersionId(), startOffset, endOffset, range2);
    node.setOptions(TRACKED_RANGE_OPTIONS[newStickiness]);
    this._decorationsTree.insert(node);
    return node.id;
  }
  removeAllDecorationsWithOwnerId(ownerId2) {
    if (this._isDisposed) {
      return;
    }
    const nodes = this._decorationsTree.collectNodesFromOwner(ownerId2);
    for (let i2 = 0, len = nodes.length; i2 < len; i2++) {
      const node = nodes[i2];
      this._decorationsTree.delete(node);
      delete this._decorations[node.id];
    }
  }
  getDecorationOptions(decorationId) {
    const node = this._decorations[decorationId];
    if (!node) {
      return null;
    }
    return node.options;
  }
  getDecorationRange(decorationId) {
    const node = this._decorations[decorationId];
    if (!node) {
      return null;
    }
    return this._decorationsTree.getNodeRange(this, node);
  }
  getLineDecorations(lineNumber, ownerId2 = 0, filterOutValidation = false, filterFontDecorations2 = false) {
    if (lineNumber < 1 || lineNumber > this.getLineCount()) {
      return [];
    }
    return this.getLinesDecorations(lineNumber, lineNumber, ownerId2, filterOutValidation, filterFontDecorations2);
  }
  getLinesDecorations(_startLineNumber, _endLineNumber, ownerId2 = 0, filterOutValidation = false, filterFontDecorations2 = false, onlyMarginDecorations = false) {
    const lineCount = this.getLineCount();
    const startLineNumber = Math.min(lineCount, Math.max(1, _startLineNumber));
    const endLineNumber = Math.min(lineCount, Math.max(1, _endLineNumber));
    const endColumn = this.getLineMaxColumn(endLineNumber);
    const range2 = new Range2(startLineNumber, 1, endLineNumber, endColumn);
    const decorations = this._getDecorationsInRange(range2, ownerId2, filterOutValidation, filterFontDecorations2, onlyMarginDecorations);
    pushMany(decorations, this._decorationProvider.getDecorationsInRange(range2, ownerId2, filterOutValidation, filterFontDecorations2));
    pushMany(decorations, this._fontTokenDecorationsProvider.getDecorationsInRange(range2, ownerId2, filterOutValidation, filterFontDecorations2));
    return decorations;
  }
  getDecorationsInRange(range2, ownerId2 = 0, filterOutValidation = false, filterFontDecorations2 = false, onlyMinimapDecorations = false, onlyMarginDecorations = false) {
    const validatedRange = this.validateRange(range2);
    const decorations = this._getDecorationsInRange(validatedRange, ownerId2, filterOutValidation, filterFontDecorations2, onlyMarginDecorations);
    pushMany(decorations, this._decorationProvider.getDecorationsInRange(validatedRange, ownerId2, filterOutValidation, filterFontDecorations2, onlyMinimapDecorations));
    pushMany(decorations, this._fontTokenDecorationsProvider.getDecorationsInRange(validatedRange, ownerId2, filterOutValidation, filterFontDecorations2, onlyMinimapDecorations));
    return decorations;
  }
  getOverviewRulerDecorations(ownerId2 = 0, filterOutValidation = false, filterFontDecorations2 = false) {
    return this._decorationsTree.getAll(this, ownerId2, filterOutValidation, filterFontDecorations2, true, false);
  }
  getInjectedTextDecorations(ownerId2 = 0) {
    return this._decorationsTree.getAllInjectedText(this, ownerId2);
  }
  getCustomLineHeightsDecorations(ownerId2 = 0) {
    const decs = this._decorationsTree.getAllCustomLineHeights(this, ownerId2);
    pushMany(decs, this._fontTokenDecorationsProvider.getAllDecorations(ownerId2));
    return decs;
  }
  getCustomLineHeightsDecorationsInRange(range2, ownerId2 = 0) {
    const decs = this._decorationsTree.getCustomLineHeightsInInterval(this, this.getOffsetAt(range2.getStartPosition()), this.getOffsetAt(range2.getEndPosition()), ownerId2);
    pushMany(decs, this._fontTokenDecorationsProvider.getDecorationsInRange(range2, ownerId2));
    return decs;
  }
  getLineInjectedText(lineNumber, ownerId2 = 0) {
    const startOffset = this._buffer.getOffsetAt(lineNumber, 1);
    const endOffset = startOffset + this._buffer.getLineLength(lineNumber);
    const result = this._decorationsTree.getInjectedTextInInterval(this, startOffset, endOffset, ownerId2);
    return LineInjectedText.fromDecorations(result).filter((t2) => t2.lineNumber === lineNumber);
  }
  getFontDecorationsInRange(range2, ownerId2 = 0) {
    const startOffset = this._buffer.getOffsetAt(range2.startLineNumber, range2.startColumn);
    const endOffset = this._buffer.getOffsetAt(range2.endLineNumber, range2.endColumn);
    return this._decorationsTree.getFontDecorationsInInterval(this, startOffset, endOffset, ownerId2);
  }
  getAllDecorations(ownerId2 = 0, filterOutValidation = false, filterFontDecorations2 = false) {
    let result = this._decorationsTree.getAll(this, ownerId2, filterOutValidation, filterFontDecorations2, false, false);
    result = result.concat(this._decorationProvider.getAllDecorations(ownerId2, filterOutValidation));
    result = result.concat(this._fontTokenDecorationsProvider.getAllDecorations(ownerId2, filterOutValidation));
    return result;
  }
  getAllMarginDecorations(ownerId2 = 0) {
    return this._decorationsTree.getAll(this, ownerId2, false, false, false, true);
  }
  _getDecorationsInRange(filterRange, filterOwnerId, filterOutValidation, filterFontDecorations2, onlyMarginDecorations) {
    const startOffset = this._buffer.getOffsetAt(filterRange.startLineNumber, filterRange.startColumn);
    const endOffset = this._buffer.getOffsetAt(filterRange.endLineNumber, filterRange.endColumn);
    return this._decorationsTree.getAllInInterval(this, startOffset, endOffset, filterOwnerId, filterOutValidation, filterFontDecorations2, onlyMarginDecorations);
  }
  getRangeAt(start, end) {
    return this._buffer.getRangeAt(start, end - start);
  }
  _changeDecorationImpl(ownerId2, decorationId, _range) {
    const node = this._decorations[decorationId];
    if (!node) {
      return;
    }
    if (node.options.after) {
      const oldRange = this.getDecorationRange(decorationId);
      this._onDidChangeDecorations.recordLineAffectedByInjectedText(oldRange.endLineNumber);
    }
    if (node.options.before) {
      const oldRange = this.getDecorationRange(decorationId);
      this._onDidChangeDecorations.recordLineAffectedByInjectedText(oldRange.startLineNumber);
    }
    if (node.options.lineHeight !== null) {
      const oldRange = this.getDecorationRange(decorationId);
      this._onDidChangeDecorations.recordLineAffectedByLineHeightChange(ownerId2, decorationId, oldRange.startLineNumber, null);
    }
    if (node.options.affectsFont) {
      const oldRange = this.getDecorationRange(decorationId);
      this._onDidChangeDecorations.recordLineAffectedByFontChange(ownerId2, node.id, oldRange.startLineNumber);
    }
    const range2 = this._validateRangeRelaxedNoAllocations(_range);
    const startOffset = this._buffer.getOffsetAt(range2.startLineNumber, range2.startColumn);
    const endOffset = this._buffer.getOffsetAt(range2.endLineNumber, range2.endColumn);
    this._decorationsTree.delete(node);
    node.reset(this.getVersionId(), startOffset, endOffset, range2);
    this._decorationsTree.insert(node);
    this._onDidChangeDecorations.checkAffectedAndFire(node.options);
    if (node.options.after) {
      this._onDidChangeDecorations.recordLineAffectedByInjectedText(range2.endLineNumber);
    }
    if (node.options.before) {
      this._onDidChangeDecorations.recordLineAffectedByInjectedText(range2.startLineNumber);
    }
    if (node.options.lineHeight !== null) {
      this._onDidChangeDecorations.recordLineAffectedByLineHeightChange(ownerId2, decorationId, range2.startLineNumber, node.options.lineHeight);
    }
    if (node.options.affectsFont) {
      this._onDidChangeDecorations.recordLineAffectedByFontChange(ownerId2, node.id, range2.startLineNumber);
    }
  }
  _changeDecorationOptionsImpl(ownerId2, decorationId, options3) {
    const node = this._decorations[decorationId];
    if (!node) {
      return;
    }
    const nodeWasInOverviewRuler = node.options.overviewRuler && node.options.overviewRuler.color ? true : false;
    const nodeIsInOverviewRuler = options3.overviewRuler && options3.overviewRuler.color ? true : false;
    this._onDidChangeDecorations.checkAffectedAndFire(node.options);
    this._onDidChangeDecorations.checkAffectedAndFire(options3);
    if (node.options.after || options3.after) {
      const nodeRange = this._decorationsTree.getNodeRange(this, node);
      this._onDidChangeDecorations.recordLineAffectedByInjectedText(nodeRange.endLineNumber);
    }
    if (node.options.before || options3.before) {
      const nodeRange = this._decorationsTree.getNodeRange(this, node);
      this._onDidChangeDecorations.recordLineAffectedByInjectedText(nodeRange.startLineNumber);
    }
    if (node.options.lineHeight !== null || options3.lineHeight !== null) {
      const nodeRange = this._decorationsTree.getNodeRange(this, node);
      this._onDidChangeDecorations.recordLineAffectedByLineHeightChange(ownerId2, decorationId, nodeRange.startLineNumber, options3.lineHeight);
    }
    if (node.options.affectsFont || options3.affectsFont) {
      const nodeRange = this._decorationsTree.getNodeRange(this, node);
      this._onDidChangeDecorations.recordLineAffectedByFontChange(ownerId2, decorationId, nodeRange.startLineNumber);
    }
    const movedInOverviewRuler = nodeWasInOverviewRuler !== nodeIsInOverviewRuler;
    const changedWhetherInjectedText = isOptionsInjectedText(options3) !== isNodeInjectedText(node);
    if (movedInOverviewRuler || changedWhetherInjectedText) {
      this._decorationsTree.delete(node);
      node.setOptions(options3);
      this._decorationsTree.insert(node);
    } else {
      node.setOptions(options3);
    }
  }
  _deltaDecorationsImpl(ownerId2, oldDecorationsIds, newDecorations, suppressEvents = false) {
    const versionId = this.getVersionId();
    const oldDecorationsLen = oldDecorationsIds.length;
    let oldDecorationIndex = 0;
    const newDecorationsLen = newDecorations.length;
    let newDecorationIndex = 0;
    this._onDidChangeDecorations.beginDeferredEmit();
    try {
      const result = new Array(newDecorationsLen);
      while (oldDecorationIndex < oldDecorationsLen || newDecorationIndex < newDecorationsLen) {
        let node = null;
        if (oldDecorationIndex < oldDecorationsLen) {
          let decorationId;
          do {
            decorationId = oldDecorationsIds[oldDecorationIndex++];
            node = this._decorations[decorationId];
          } while (!node && oldDecorationIndex < oldDecorationsLen);
          if (node) {
            if (node.options.after) {
              const nodeRange = this._decorationsTree.getNodeRange(this, node);
              this._onDidChangeDecorations.recordLineAffectedByInjectedText(nodeRange.endLineNumber);
            }
            if (node.options.before) {
              const nodeRange = this._decorationsTree.getNodeRange(this, node);
              this._onDidChangeDecorations.recordLineAffectedByInjectedText(nodeRange.startLineNumber);
            }
            if (node.options.lineHeight !== null) {
              const nodeRange = this._decorationsTree.getNodeRange(this, node);
              this._onDidChangeDecorations.recordLineAffectedByLineHeightChange(ownerId2, decorationId, nodeRange.startLineNumber, null);
            }
            if (node.options.affectsFont) {
              const nodeRange = this._decorationsTree.getNodeRange(this, node);
              this._onDidChangeDecorations.recordLineAffectedByFontChange(ownerId2, decorationId, nodeRange.startLineNumber);
            }
            this._decorationsTree.delete(node);
            if (!suppressEvents) {
              this._onDidChangeDecorations.checkAffectedAndFire(node.options);
            }
          }
        }
        if (newDecorationIndex < newDecorationsLen) {
          if (!node) {
            const internalDecorationId = ++this._lastDecorationId;
            const decorationId = `${this._instanceId};${internalDecorationId}`;
            node = new IntervalNode(decorationId, 0, 0);
            this._decorations[decorationId] = node;
          }
          const newDecoration = newDecorations[newDecorationIndex];
          const range2 = this._validateRangeRelaxedNoAllocations(newDecoration.range);
          const options3 = _normalizeOptions(newDecoration.options);
          const startOffset = this._buffer.getOffsetAt(range2.startLineNumber, range2.startColumn);
          const endOffset = this._buffer.getOffsetAt(range2.endLineNumber, range2.endColumn);
          node.ownerId = ownerId2;
          node.reset(versionId, startOffset, endOffset, range2);
          node.setOptions(options3);
          if (node.options.after) {
            this._onDidChangeDecorations.recordLineAffectedByInjectedText(range2.endLineNumber);
          }
          if (node.options.before) {
            this._onDidChangeDecorations.recordLineAffectedByInjectedText(range2.startLineNumber);
          }
          if (node.options.lineHeight !== null) {
            this._onDidChangeDecorations.recordLineAffectedByLineHeightChange(ownerId2, node.id, range2.startLineNumber, node.options.lineHeight);
          }
          if (node.options.affectsFont) {
            this._onDidChangeDecorations.recordLineAffectedByFontChange(ownerId2, node.id, range2.startLineNumber);
          }
          if (!suppressEvents) {
            this._onDidChangeDecorations.checkAffectedAndFire(options3);
          }
          this._decorationsTree.insert(node);
          result[newDecorationIndex] = node.id;
          newDecorationIndex++;
        } else {
          if (node) {
            delete this._decorations[node.id];
          }
        }
      }
      return result;
    } finally {
      this._onDidChangeDecorations.endDeferredEmit();
    }
  }
  //#endregion
  //#region Tokenization
  // TODO move them to the tokenization part.
  getLanguageId() {
    return this.tokenization.getLanguageId();
  }
  setLanguage(languageIdOrSelection, source) {
    if (typeof languageIdOrSelection === "string") {
      this._languageSelectionListener.clear();
      this._setLanguage(languageIdOrSelection, source);
    } else {
      this._languageSelectionListener.value = languageIdOrSelection.onDidChange(() => this._setLanguage(languageIdOrSelection.languageId, source));
      this._setLanguage(languageIdOrSelection.languageId, source);
    }
  }
  _setLanguage(languageId, source) {
    this.tokenization.setLanguageId(languageId, source);
    this._languageService.requestRichLanguageFeatures(languageId);
  }
  getLanguageIdAtPosition(lineNumber, column) {
    return this.tokenization.getLanguageIdAtPosition(lineNumber, column);
  }
  getWordAtPosition(position2) {
    return this._tokenizationTextModelPart.getWordAtPosition(position2);
  }
  getWordUntilPosition(position2) {
    return this._tokenizationTextModelPart.getWordUntilPosition(position2);
  }
  //#endregion
  normalizePosition(position2, affinity) {
    return position2;
  }
  /**
   * Gets the column at which indentation stops at a given line.
   * @internal
  */
  getLineIndentColumn(lineNumber) {
    return indentOfLine(this.getLineContent(lineNumber)) + 1;
  }
  toString() {
    return `TextModel(${this.uri.toString()})`;
  }
};

TextModel = __decorateClass([
  __decorateParam(4, IUndoRedoService),
  __decorateParam(5, ILanguageService),
  __decorateParam(6, ILanguageConfigurationService),
  __decorateParam(7, IInstantiationService)
], TextModel);

function getLineTokensWithInjections(tokens, injectionOptions, injectionOffsets) {
  let lineTokens;
  if (injectionOffsets) {
    const tokensToInsert = [];
    for (let idx = 0; idx < injectionOffsets.length; idx++) {
      const offset = injectionOffsets[idx];
      const tokens2 = injectionOptions[idx].tokens;
      if (tokens2) {
        tokens2.forEach((range2, info) => {
          tokensToInsert.push({
            offset,
            text: range2.substring(injectionOptions[idx].content),
            tokenMetadata: info.metadata
          });
        });
      } else {
        tokensToInsert.push({
          offset,
          text: injectionOptions[idx].content,
          tokenMetadata: LineTokens.defaultTokenMetadata
        });
      }
    }
    lineTokens = tokens.withInserted(tokensToInsert);
  } else {
    lineTokens = tokens;
  }
  return lineTokens;
}

function indentOfLine(line) {
  let indent = 0;
  for (const c of line) {
    if (c === " " || c === "	") {
      indent++;
    } else {
      break;
    }
  }
  return indent;
}

function isNodeInOverviewRuler(node) {
  return node.options.overviewRuler && node.options.overviewRuler.color ? true : false;
}

function isOptionsInjectedText(options3) {
  return !!options3.after || !!options3.before;
}

function isNodeInjectedText(node) {
  return !!node.options.after || !!node.options.before;
}

var DecorationsTrees = class {
  constructor() {
    this._decorationsTree0 = new IntervalTree();
    this._decorationsTree1 = new IntervalTree();
    this._injectedTextDecorationsTree = new IntervalTree();
  }
  ensureAllNodesHaveRanges(host) {
    this.getAll(host, 0, false, false, false, false);
  }
  _ensureNodesHaveRanges(host, nodes) {
    for (const node of nodes) {
      if (node.range === null) {
        node.range = host.getRangeAt(node.cachedAbsoluteStart, node.cachedAbsoluteEnd);
      }
    }
    return nodes;
  }
  getAllInInterval(host, start, end, filterOwnerId, filterOutValidation, filterFontDecorations2, onlyMarginDecorations) {
    const versionId = host.getVersionId();
    const result = this._intervalSearch(start, end, filterOwnerId, filterOutValidation, filterFontDecorations2, versionId, onlyMarginDecorations);
    return this._ensureNodesHaveRanges(host, result);
  }
  _intervalSearch(start, end, filterOwnerId, filterOutValidation, filterFontDecorations2, cachedVersionId, onlyMarginDecorations) {
    const r0 = this._decorationsTree0.intervalSearch(start, end, filterOwnerId, filterOutValidation, filterFontDecorations2, cachedVersionId, onlyMarginDecorations);
    const r1 = this._decorationsTree1.intervalSearch(start, end, filterOwnerId, filterOutValidation, filterFontDecorations2, cachedVersionId, onlyMarginDecorations);
    const r2 = this._injectedTextDecorationsTree.intervalSearch(start, end, filterOwnerId, filterOutValidation, filterFontDecorations2, cachedVersionId, onlyMarginDecorations);
    return r0.concat(r1).concat(r2);
  }
  getInjectedTextInInterval(host, start, end, filterOwnerId) {
    const versionId = host.getVersionId();
    const result = this._injectedTextDecorationsTree.intervalSearch(start, end, filterOwnerId, false, false, versionId, false);
    return this._ensureNodesHaveRanges(host, result).filter((i2) => i2.options.showIfCollapsed || !i2.range.isEmpty());
  }
  getFontDecorationsInInterval(host, start, end, filterOwnerId) {
    const versionId = host.getVersionId();
    const decorations = this._decorationsTree0.intervalSearch(start, end, filterOwnerId, false, false, versionId, false);
    return this._ensureNodesHaveRanges(host, decorations).filter((i2) => i2.options.affectsFont);
  }
  getAllInjectedText(host, filterOwnerId) {
    const versionId = host.getVersionId();
    const result = this._injectedTextDecorationsTree.search(filterOwnerId, false, false, versionId, false);
    return this._ensureNodesHaveRanges(host, result).filter((i2) => i2.options.showIfCollapsed || !i2.range.isEmpty());
  }
  getAllCustomLineHeights(host, filterOwnerId) {
    const versionId = host.getVersionId();
    const result = this._search(filterOwnerId, false, false, false, versionId, false);
    return this._ensureNodesHaveRanges(host, result).filter((i2) => typeof i2.options.lineHeight === "number");
  }
  getCustomLineHeightsInInterval(host, start, end, filterOwnerId) {
    const versionId = host.getVersionId();
    const result = this._intervalSearch(start, end, filterOwnerId, false, false, versionId, false);
    return this._ensureNodesHaveRanges(host, result).filter((i2) => typeof i2.options.lineHeight === "number");
  }
  getAll(host, filterOwnerId, filterOutValidation, filterFontDecorations2, overviewRulerOnly, onlyMarginDecorations) {
    const versionId = host.getVersionId();
    const result = this._search(filterOwnerId, filterOutValidation, filterFontDecorations2, overviewRulerOnly, versionId, onlyMarginDecorations);
    return this._ensureNodesHaveRanges(host, result);
  }
  _search(filterOwnerId, filterOutValidation, filterFontDecorations2, overviewRulerOnly, cachedVersionId, onlyMarginDecorations) {
    if (overviewRulerOnly) {
      return this._decorationsTree1.search(filterOwnerId, filterOutValidation, filterFontDecorations2, cachedVersionId, onlyMarginDecorations);
    } else {
      const r0 = this._decorationsTree0.search(filterOwnerId, filterOutValidation, filterFontDecorations2, cachedVersionId, onlyMarginDecorations);
      const r1 = this._decorationsTree1.search(filterOwnerId, filterOutValidation, filterFontDecorations2, cachedVersionId, onlyMarginDecorations);
      const r2 = this._injectedTextDecorationsTree.search(filterOwnerId, filterOutValidation, filterFontDecorations2, cachedVersionId, onlyMarginDecorations);
      return r0.concat(r1).concat(r2);
    }
  }
  collectNodesFromOwner(ownerId2) {
    const r0 = this._decorationsTree0.collectNodesFromOwner(ownerId2);
    const r1 = this._decorationsTree1.collectNodesFromOwner(ownerId2);
    const r2 = this._injectedTextDecorationsTree.collectNodesFromOwner(ownerId2);
    return r0.concat(r1).concat(r2);
  }
  collectNodesPostOrder() {
    const r0 = this._decorationsTree0.collectNodesPostOrder();
    const r1 = this._decorationsTree1.collectNodesPostOrder();
    const r2 = this._injectedTextDecorationsTree.collectNodesPostOrder();
    return r0.concat(r1).concat(r2);
  }
  insert(node) {
    if (isNodeInjectedText(node)) {
      this._injectedTextDecorationsTree.insert(node);
    } else if (isNodeInOverviewRuler(node)) {
      this._decorationsTree1.insert(node);
    } else {
      this._decorationsTree0.insert(node);
    }
  }
  delete(node) {
    if (isNodeInjectedText(node)) {
      this._injectedTextDecorationsTree.delete(node);
    } else if (isNodeInOverviewRuler(node)) {
      this._decorationsTree1.delete(node);
    } else {
      this._decorationsTree0.delete(node);
    }
  }
  getNodeRange(host, node) {
    const versionId = host.getVersionId();
    if (node.cachedVersionId !== versionId) {
      this._resolveNode(node, versionId);
    }
    if (node.range === null) {
      node.range = host.getRangeAt(node.cachedAbsoluteStart, node.cachedAbsoluteEnd);
    }
    return node.range;
  }
  _resolveNode(node, cachedVersionId) {
    if (isNodeInjectedText(node)) {
      this._injectedTextDecorationsTree.resolveNode(node, cachedVersionId);
    } else if (isNodeInOverviewRuler(node)) {
      this._decorationsTree1.resolveNode(node, cachedVersionId);
    } else {
      this._decorationsTree0.resolveNode(node, cachedVersionId);
    }
  }
  acceptReplace(offset, length, textLength, forceMoveMarkers) {
    this._decorationsTree0.acceptReplace(offset, length, textLength, forceMoveMarkers);
    this._decorationsTree1.acceptReplace(offset, length, textLength, forceMoveMarkers);
    this._injectedTextDecorationsTree.acceptReplace(offset, length, textLength, forceMoveMarkers);
  }
};

function cleanClassName2(className2) {
  return className2.replace(/[^a-z0-9\-_]/gi, " ");
}

var DecorationOptions = class {
  constructor(options3) {
    this.color = options3.color || "";
    this.darkColor = options3.darkColor || "";
  }
};

var ModelDecorationOverviewRulerOptions = class extends DecorationOptions {
  constructor(options3) {
    super(options3);
    this._resolvedColor = null;
    this.position = typeof options3.position === "number" ? options3.position : 2 /* Center */;
  }
  getColor(theme) {
    if (!this._resolvedColor) {
      if (isDark(theme.type) && this.darkColor) {
        this._resolvedColor = this._resolveColor(this.darkColor, theme);
      } else {
        this._resolvedColor = this._resolveColor(this.color, theme);
      }
    }
    return this._resolvedColor;
  }
  invalidateCachedColor() {
    this._resolvedColor = null;
  }
  _resolveColor(color2, theme) {
    if (typeof color2 === "string") {
      return color2;
    }
    const c = color2 ? theme.getColor(color2.id) : null;
    if (!c) {
      return "";
    }
    return c.toString();
  }
};

var ModelDecorationGlyphMarginOptions = class {
  constructor(options3) {
    this.position = options3?.position ?? 2 /* Center */;
    this.persistLane = options3?.persistLane;
  }
};

var ModelDecorationMinimapOptions = class extends DecorationOptions {
  constructor(options3) {
    super(options3);
    this.position = options3.position;
    this.sectionHeaderStyle = options3.sectionHeaderStyle ?? null;
    this.sectionHeaderText = options3.sectionHeaderText ?? null;
  }
  getColor(theme) {
    if (!this._resolvedColor) {
      if (isDark(theme.type) && this.darkColor) {
        this._resolvedColor = this._resolveColor(this.darkColor, theme);
      } else {
        this._resolvedColor = this._resolveColor(this.color, theme);
      }
    }
    return this._resolvedColor;
  }
  invalidateCachedColor() {
    this._resolvedColor = void 0;
  }
  _resolveColor(color2, theme) {
    if (typeof color2 === "string") {
      return Color.fromHex(color2);
    }
    return theme.getColor(color2.id);
  }
};

var ModelDecorationInjectedTextOptions = class _ModelDecorationInjectedTextOptions {
  static from(options3) {
    if (options3 instanceof _ModelDecorationInjectedTextOptions) {
      return options3;
    }
    return new _ModelDecorationInjectedTextOptions(options3);
  }
  constructor(options3) {
    this.content = options3.content || "";
    this.tokens = options3.tokens ?? null;
    this.inlineClassName = options3.inlineClassName || null;
    this.inlineClassNameAffectsLetterSpacing = options3.inlineClassNameAffectsLetterSpacing || false;
    this.widthInEm = options3.widthInEm !== void 0 && Number.isFinite(options3.widthInEm) && options3.widthInEm >= 0 ? options3.widthInEm : void 0;
    this.attachedData = options3.attachedData || null;
    this.cursorStops = options3.cursorStops || null;
  }
};

var ModelDecorationOptions = class _ModelDecorationOptions {
  static register(options3) {
    return new _ModelDecorationOptions(options3);
  }
  static createDynamic(options3) {
    return new _ModelDecorationOptions(options3);
  }
  constructor(options3) {
    this.description = options3.description;
    this.blockClassName = options3.blockClassName ? cleanClassName2(options3.blockClassName) : null;
    this.blockDoesNotCollapse = options3.blockDoesNotCollapse ?? null;
    this.blockIsAfterEnd = options3.blockIsAfterEnd ?? null;
    this.blockPadding = options3.blockPadding ?? null;
    this.stickiness = options3.stickiness || 0 /* AlwaysGrowsWhenTypingAtEdges */;
    this.zIndex = options3.zIndex || 0;
    this.className = options3.className ? cleanClassName2(options3.className) : null;
    this.shouldFillLineOnLineBreak = options3.shouldFillLineOnLineBreak ?? null;
    this.hoverMessage = options3.hoverMessage || null;
    this.glyphMarginHoverMessage = options3.glyphMarginHoverMessage || null;
    this.lineNumberHoverMessage = options3.lineNumberHoverMessage || null;
    this.isWholeLine = options3.isWholeLine || false;
    this.lineHeight = options3.lineHeight ? Math.min(options3.lineHeight, LINE_HEIGHT_CEILING) : null;
    this.fontSize = options3.fontSize || null;
    this.affectsFont = !!options3.fontSize || !!options3.fontFamily || !!options3.fontWeight || !!options3.fontStyle;
    this.showIfCollapsed = options3.showIfCollapsed || false;
    this.collapseOnReplaceEdit = options3.collapseOnReplaceEdit || false;
    this.overviewRuler = options3.overviewRuler ? new ModelDecorationOverviewRulerOptions(options3.overviewRuler) : null;
    this.minimap = options3.minimap ? new ModelDecorationMinimapOptions(options3.minimap) : null;
    this.glyphMargin = options3.glyphMarginClassName ? new ModelDecorationGlyphMarginOptions(options3.glyphMargin) : null;
    this.glyphMarginClassName = options3.glyphMarginClassName ? cleanClassName2(options3.glyphMarginClassName) : null;
    this.linesDecorationsClassName = options3.linesDecorationsClassName ? cleanClassName2(options3.linesDecorationsClassName) : null;
    this.lineNumberClassName = options3.lineNumberClassName ? cleanClassName2(options3.lineNumberClassName) : null;
    this.linesDecorationsTooltip = options3.linesDecorationsTooltip ? htmlAttributeEncodeValue(options3.linesDecorationsTooltip) : null;
    this.firstLineDecorationClassName = options3.firstLineDecorationClassName ? cleanClassName2(options3.firstLineDecorationClassName) : null;
    this.marginClassName = options3.marginClassName ? cleanClassName2(options3.marginClassName) : null;
    this.inlineClassName = options3.inlineClassName ? cleanClassName2(options3.inlineClassName) : null;
    this.inlineClassNameAffectsLetterSpacing = options3.inlineClassNameAffectsLetterSpacing || false;
    this.beforeContentClassName = options3.beforeContentClassName ? cleanClassName2(options3.beforeContentClassName) : null;
    this.afterContentClassName = options3.afterContentClassName ? cleanClassName2(options3.afterContentClassName) : null;
    this.after = options3.after ? ModelDecorationInjectedTextOptions.from(options3.after) : null;
    this.before = options3.before ? ModelDecorationInjectedTextOptions.from(options3.before) : null;
    this.hideInCommentTokens = options3.hideInCommentTokens ?? false;
    this.hideInStringTokens = options3.hideInStringTokens ?? false;
    this.textDirection = options3.textDirection ?? null;
  }
};

ModelDecorationOptions.EMPTY = ModelDecorationOptions.register({ description: "empty" });

var TRACKED_RANGE_OPTIONS = [
  ModelDecorationOptions.register({ description: "tracked-range-always-grows-when-typing-at-edges", stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */ }),
  ModelDecorationOptions.register({ description: "tracked-range-never-grows-when-typing-at-edges", stickiness: 1 /* NeverGrowsWhenTypingAtEdges */ }),
  ModelDecorationOptions.register({ description: "tracked-range-grows-only-when-typing-before", stickiness: 2 /* GrowsOnlyWhenTypingBefore */ }),
  ModelDecorationOptions.register({ description: "tracked-range-grows-only-when-typing-after", stickiness: 3 /* GrowsOnlyWhenTypingAfter */ })
];

function _normalizeOptions(options3) {
  if (options3 instanceof ModelDecorationOptions) {
    return options3;
  }
  return ModelDecorationOptions.createDynamic(options3);
}

var DidChangeDecorationsEmitter = class extends Disposable {
  constructor(handleBeforeFire) {
    super();
    this.handleBeforeFire = handleBeforeFire;
    this._actual = this._register(new Emitter());
    this.event = this._actual.event;
    this._affectedInjectedTextLines = null;
    this._affectedLineHeights = null;
    this._affectedFontLines = null;
    this._deferredCnt = 0;
    this._shouldFireDeferred = false;
    this._affectsMinimap = false;
    this._affectsOverviewRuler = false;
    this._affectsGlyphMargin = false;
    this._affectsLineNumber = false;
  }
  hasListeners() {
    return this._actual.hasListeners();
  }
  beginDeferredEmit() {
    this._deferredCnt++;
  }
  endDeferredEmit() {
    this._deferredCnt--;
    if (this._deferredCnt === 0) {
      if (this._shouldFireDeferred) {
        this.doFire();
      }
      this._affectedInjectedTextLines?.clear();
      this._affectedInjectedTextLines = null;
      this._affectedLineHeights?.clear();
      this._affectedLineHeights = null;
      this._affectedFontLines?.clear();
      this._affectedFontLines = null;
    }
  }
  recordLineAffectedByInjectedText(lineNumber) {
    if (!this._affectedInjectedTextLines) {
      this._affectedInjectedTextLines = /* @__PURE__ */ new Set();
    }
    this._affectedInjectedTextLines.add(lineNumber);
  }
  recordLineAffectedByLineHeightChange(ownerId2, decorationId, lineNumber, lineHeight) {
    if (!this._affectedLineHeights) {
      this._affectedLineHeights = new SetWithKey([], LineHeightChangingDecoration.toKey);
    }
    this._affectedLineHeights.add(new LineHeightChangingDecoration(ownerId2, decorationId, lineNumber, lineHeight));
  }
  recordLineAffectedByFontChange(ownerId2, decorationId, lineNumber) {
    if (!this._affectedFontLines) {
      this._affectedFontLines = new SetWithKey([], LineFontChangingDecoration.toKey);
    }
    this._affectedFontLines.add(new LineFontChangingDecoration(ownerId2, decorationId, lineNumber));
  }
  checkAffectedAndFire(options3) {
    this._affectsMinimap ||= !!options3.minimap?.position;
    this._affectsOverviewRuler ||= !!options3.overviewRuler?.color;
    this._affectsGlyphMargin ||= !!options3.glyphMarginClassName;
    this._affectsLineNumber ||= !!options3.lineNumberClassName;
    this.tryFire();
  }
  fire() {
    this._affectsMinimap = true;
    this._affectsOverviewRuler = true;
    this._affectsGlyphMargin = true;
    this.tryFire();
  }
  tryFire() {
    if (this._deferredCnt === 0) {
      this.doFire();
    } else {
      this._shouldFireDeferred = true;
    }
  }
  doFire() {
    this.handleBeforeFire(this._affectedInjectedTextLines, this._affectedLineHeights, this._affectedFontLines);
    const event = {
      affectsMinimap: this._affectsMinimap,
      affectsOverviewRuler: this._affectsOverviewRuler,
      affectsGlyphMargin: this._affectsGlyphMargin,
      affectsLineNumber: this._affectsLineNumber
    };
    this._shouldFireDeferred = false;
    this._affectsMinimap = false;
    this._affectsOverviewRuler = false;
    this._affectsGlyphMargin = false;
    this._actual.fire(event);
  }
};

var DidChangeContentEmitter = class extends Disposable {
  constructor() {
    super();
    this._emitter = this._register(new Emitter());
    this.event = this._emitter.event;
    this._deferredCnt = 0;
    this._deferredEvent = null;
  }
  hasListeners() {
    return this._emitter.hasListeners();
  }
  beginDeferredEmit() {
    this._deferredCnt++;
  }
  endDeferredEmit(resultingSelection = null) {
    this._deferredCnt--;
    if (this._deferredCnt === 0) {
      if (this._deferredEvent !== null) {
        this._deferredEvent.rawContentChangedEvent.resultingSelection = resultingSelection;
        const e4 = this._deferredEvent;
        this._deferredEvent = null;
        this._emitter.fire(e4);
      }
    }
  }
  fire(e4) {
    if (this._deferredCnt > 0) {
      if (this._deferredEvent) {
        this._deferredEvent = this._deferredEvent.merge(e4);
      } else {
        this._deferredEvent = e4;
      }
      return;
    }
    this._emitter.fire(e4);
  }
};
export { createTextBufferFactory, createTextBufferFactoryFromStream, createTextBufferFactoryFromSnapshot, createTextBuffer, getLineTokensWithInjections, indentOfLine, isNodeInOverviewRuler, isOptionsInjectedText, isNodeInjectedText, cleanClassName2, _normalizeOptions, MODEL_ID, LIMIT_FIND_COUNT2, LONG_LINE_BOUNDARY, LINE_HEIGHT_CEILING, TextModelSnapshot, invalidFunc2, TextModel, DecorationsTrees, DecorationOptions, ModelDecorationOverviewRulerOptions, ModelDecorationGlyphMarginOptions, ModelDecorationMinimapOptions, ModelDecorationInjectedTextOptions, ModelDecorationOptions, TRACKED_RANGE_OPTIONS, DidChangeDecorationsEmitter, DidChangeContentEmitter };
