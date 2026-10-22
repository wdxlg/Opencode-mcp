// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/cursor/cursor.ts
import { Disposable, dispose } from "./module-0012.mjs";
import { CursorContext } from "./module-0427.mjs";
import { CursorCollection } from "./module-0426.mjs";
import { Range2 } from "./module-0106.mjs";
import { ViewCursorStateChangedEvent, ViewRevealRangeRequestEvent } from "./module-0155.mjs";
import { CursorState, EditOperationResult } from "./module-0113.mjs";
import { ModelInjectedTextChangedEvent } from "./module-0369.mjs";
import { BaseTypeWithAutoClosingCommand } from "./module-0151.mjs";
import { CursorStateChangedEvent } from "./module-0428.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { EditSources } from "./module-0377.mjs";
import { CompositionOutcome, TypeOperations } from "./module-0152.mjs";
import { commonPrefixLength2, commonSuffixLength, nextCharLength } from "./module-0030.mjs";
import { Selection } from "./module-0107.mjs";
import { DeleteOperations } from "./module-0119.mjs";


// src/vs/editor/common/cursor/cursor.ts
var CursorsController = class extends Disposable {
  constructor(model, viewModel, coordinatesConverter, cursorConfig) {
    super();
    this._model = model;
    this._knownModelVersionId = this._model.getVersionId();
    this._viewModel = viewModel;
    this._coordinatesConverter = coordinatesConverter;
    this.context = new CursorContext(this._model, this._viewModel, this._coordinatesConverter, cursorConfig);
    this._cursors = new CursorCollection(this.context);
    this._hasFocus = false;
    this._isHandling = false;
    this._compositionState = null;
    this._columnSelectData = null;
    this._autoClosedActions = [];
    this._prevEditOperationType = 0 /* Other */;
  }
  dispose() {
    this._cursors.dispose();
    this._autoClosedActions = dispose(this._autoClosedActions);
    super.dispose();
  }
  updateConfiguration(cursorConfig) {
    this.context = new CursorContext(this._model, this._viewModel, this._coordinatesConverter, cursorConfig);
    this._cursors.updateContext(this.context);
  }
  onLineMappingChanged(eventsCollector) {
    if (this._knownModelVersionId !== this._model.getVersionId()) {
      return;
    }
    this.setStates(eventsCollector, "viewModel", 0 /* NotSet */, this.getCursorStates());
  }
  setHasFocus(hasFocus) {
    this._hasFocus = hasFocus;
  }
  _validateAutoClosedActions() {
    if (this._autoClosedActions.length > 0) {
      const selections = this._cursors.getSelections();
      for (let i2 = 0; i2 < this._autoClosedActions.length; i2++) {
        const autoClosedAction = this._autoClosedActions[i2];
        if (!autoClosedAction.isValid(selections)) {
          autoClosedAction.dispose();
          this._autoClosedActions.splice(i2, 1);
          i2--;
        }
      }
    }
  }
  // ------ some getters/setters
  getPrimaryCursorState() {
    return this._cursors.getPrimaryCursor();
  }
  getLastAddedCursorIndex() {
    return this._cursors.getLastAddedCursorIndex();
  }
  getCursorStates() {
    return this._cursors.getAll();
  }
  setStates(eventsCollector, source, reason, states) {
    let reachedMaxCursorCount = false;
    const multiCursorLimit = this.context.cursorConfig.multiCursorLimit;
    if (states !== null && states.length > multiCursorLimit) {
      states = states.slice(0, multiCursorLimit);
      reachedMaxCursorCount = true;
    }
    const oldState = CursorModelState.from(this._model, this);
    this._cursors.setStates(states);
    this._cursors.normalize();
    this._columnSelectData = null;
    this._validateAutoClosedActions();
    return this._emitStateChangedIfNecessary(eventsCollector, source, reason, oldState, reachedMaxCursorCount);
  }
  setCursorColumnSelectData(columnSelectData) {
    this._columnSelectData = columnSelectData;
  }
  revealAll(eventsCollector, source, minimalReveal, verticalType, revealHorizontal, scrollType) {
    const viewPositions = this._cursors.getViewPositions();
    let revealViewRange = null;
    let revealViewSelections = null;
    if (viewPositions.length > 1) {
      revealViewSelections = this._cursors.getViewSelections();
    } else {
      revealViewRange = Range2.fromPositions(viewPositions[0], viewPositions[0]);
    }
    eventsCollector.emitViewEvent(new ViewRevealRangeRequestEvent(source, minimalReveal, revealViewRange, revealViewSelections, verticalType, revealHorizontal, scrollType));
  }
  revealPrimary(eventsCollector, source, minimalReveal, verticalType, revealHorizontal, scrollType) {
    const primaryCursor = this._cursors.getPrimaryCursor();
    const revealViewSelections = [primaryCursor.viewState.selection];
    eventsCollector.emitViewEvent(new ViewRevealRangeRequestEvent(source, minimalReveal, null, revealViewSelections, verticalType, revealHorizontal, scrollType));
  }
  saveState() {
    const result = [];
    const selections = this._cursors.getSelections();
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const selection = selections[i2];
      result.push({
        inSelectionMode: !selection.isEmpty(),
        selectionStart: {
          lineNumber: selection.selectionStartLineNumber,
          column: selection.selectionStartColumn
        },
        position: {
          lineNumber: selection.positionLineNumber,
          column: selection.positionColumn
        }
      });
    }
    return result;
  }
  restoreState(eventsCollector, states) {
    const desiredSelections = [];
    for (let i2 = 0, len = states.length; i2 < len; i2++) {
      const state = states[i2];
      let positionLineNumber = 1;
      let positionColumn = 1;
      if (state.position && state.position.lineNumber) {
        positionLineNumber = state.position.lineNumber;
      }
      if (state.position && state.position.column) {
        positionColumn = state.position.column;
      }
      let selectionStartLineNumber = positionLineNumber;
      let selectionStartColumn = positionColumn;
      if (state.selectionStart && state.selectionStart.lineNumber) {
        selectionStartLineNumber = state.selectionStart.lineNumber;
      }
      if (state.selectionStart && state.selectionStart.column) {
        selectionStartColumn = state.selectionStart.column;
      }
      desiredSelections.push({
        selectionStartLineNumber,
        selectionStartColumn,
        positionLineNumber,
        positionColumn
      });
    }
    this.setStates(eventsCollector, "restoreState", 0 /* NotSet */, CursorState.fromModelSelections(desiredSelections));
    this.revealAll(eventsCollector, "restoreState", false, 0 /* Simple */, true, 1 /* Immediate */);
  }
  onModelContentChanged(eventsCollector, event) {
    if (event instanceof ModelInjectedTextChangedEvent) {
      if (this._isHandling) {
        return;
      }
      this._isHandling = true;
      try {
        this.setStates(eventsCollector, "modelChange", 0 /* NotSet */, this.getCursorStates());
      } finally {
        this._isHandling = false;
      }
    } else {
      const e = event.rawContentChangedEvent;
      this._knownModelVersionId = e.versionId;
      if (this._isHandling) {
        return;
      }
      const hadFlushEvent = e.containsEvent(1 /* Flush */);
      this._prevEditOperationType = 0 /* Other */;
      if (hadFlushEvent) {
        this._cursors.dispose();
        this._cursors = new CursorCollection(this.context);
        this._validateAutoClosedActions();
        this._emitStateChangedIfNecessary(eventsCollector, "model", 1 /* ContentFlush */, null, false);
      } else {
        if (this._hasFocus && e.resultingSelection && e.resultingSelection.length > 0) {
          const cursorState = CursorState.fromModelSelections(e.resultingSelection);
          if (this.setStates(eventsCollector, "modelChange", e.isUndoing ? 5 /* Undo */ : e.isRedoing ? 6 /* Redo */ : 2 /* RecoverFromMarkers */, cursorState)) {
            this.revealAll(eventsCollector, "modelChange", false, 0 /* Simple */, true, 0 /* Smooth */);
          }
        } else {
          const selectionsFromMarkers = this._cursors.readSelectionFromMarkers();
          this.setStates(eventsCollector, "modelChange", 2 /* RecoverFromMarkers */, CursorState.fromModelSelections(selectionsFromMarkers));
        }
      }
    }
  }
  getSelection() {
    return this._cursors.getPrimaryCursor().modelState.selection;
  }
  getTopMostViewPosition() {
    return this._cursors.getTopMostViewPosition();
  }
  getBottomMostViewPosition() {
    return this._cursors.getBottomMostViewPosition();
  }
  getCursorColumnSelectData() {
    if (this._columnSelectData) {
      return this._columnSelectData;
    }
    const primaryCursor = this._cursors.getPrimaryCursor();
    const viewSelectionStart = primaryCursor.viewState.selectionStart.getStartPosition();
    const viewPosition = primaryCursor.viewState.position;
    return {
      isReal: false,
      fromViewLineNumber: viewSelectionStart.lineNumber,
      fromViewVisualColumn: this.context.cursorConfig.visibleColumnFromColumn(this._viewModel, viewSelectionStart),
      toViewLineNumber: viewPosition.lineNumber,
      toViewVisualColumn: this.context.cursorConfig.visibleColumnFromColumn(this._viewModel, viewPosition)
    };
  }
  getSelections() {
    return this._cursors.getSelections();
  }
  getPosition() {
    return this._cursors.getPrimaryCursor().modelState.position;
  }
  setSelections(eventsCollector, source, selections, reason) {
    this.setStates(eventsCollector, source, reason, CursorState.fromModelSelections(selections));
  }
  getPrevEditOperationType() {
    return this._prevEditOperationType;
  }
  setPrevEditOperationType(type) {
    this._prevEditOperationType = type;
  }
  // ------ auxiliary handling logic
  _pushAutoClosedAction(autoClosedCharactersRanges, autoClosedEnclosingRanges) {
    const autoClosedCharactersDeltaDecorations = [];
    const autoClosedEnclosingDeltaDecorations = [];
    for (let i2 = 0, len = autoClosedCharactersRanges.length; i2 < len; i2++) {
      autoClosedCharactersDeltaDecorations.push({
        range: autoClosedCharactersRanges[i2],
        options: {
          description: "auto-closed-character",
          inlineClassName: "auto-closed-character",
          stickiness: 1 /* NeverGrowsWhenTypingAtEdges */
        }
      });
      autoClosedEnclosingDeltaDecorations.push({
        range: autoClosedEnclosingRanges[i2],
        options: {
          description: "auto-closed-enclosing",
          stickiness: 1 /* NeverGrowsWhenTypingAtEdges */
        }
      });
    }
    const autoClosedCharactersDecorations = this._model.deltaDecorations([], autoClosedCharactersDeltaDecorations);
    const autoClosedEnclosingDecorations = this._model.deltaDecorations([], autoClosedEnclosingDeltaDecorations);
    this._autoClosedActions.push(new AutoClosedAction(this._model, autoClosedCharactersDecorations, autoClosedEnclosingDecorations));
  }
  _executeEditOperation(opResult, editReason) {
    if (!opResult) {
      return;
    }
    if (opResult.shouldPushStackElementBefore) {
      this._model.pushStackElement();
    }
    const result = CommandExecutor.executeCommands(this._model, this._cursors.getSelections(), opResult.commands, editReason);
    if (result) {
      this._interpretCommandResult(result);
      const autoClosedCharactersRanges = [];
      const autoClosedEnclosingRanges = [];
      for (let i2 = 0; i2 < opResult.commands.length; i2++) {
        const command4 = opResult.commands[i2];
        if (command4 instanceof BaseTypeWithAutoClosingCommand && command4.enclosingRange && command4.closeCharacterRange) {
          autoClosedCharactersRanges.push(command4.closeCharacterRange);
          autoClosedEnclosingRanges.push(command4.enclosingRange);
        }
      }
      if (autoClosedCharactersRanges.length > 0) {
        this._pushAutoClosedAction(autoClosedCharactersRanges, autoClosedEnclosingRanges);
      }
      this._prevEditOperationType = opResult.type;
    }
    if (opResult.shouldPushStackElementAfter) {
      this._model.pushStackElement();
    }
  }
  _interpretCommandResult(cursorState) {
    if (!cursorState || cursorState.length === 0) {
      cursorState = this._cursors.readSelectionFromMarkers();
    }
    this._columnSelectData = null;
    this._cursors.setSelections(cursorState);
    this._cursors.normalize();
  }
  // -----------------------------------------------------------------------------------------------------------
  // ----- emitting events
  _emitStateChangedIfNecessary(eventsCollector, source, reason, oldState, reachedMaxCursorCount) {
    const newState = CursorModelState.from(this._model, this);
    if (newState.equals(oldState)) {
      return false;
    }
    const selections = this._cursors.getSelections();
    const viewSelections = this._cursors.getViewSelections();
    eventsCollector.emitViewEvent(new ViewCursorStateChangedEvent(viewSelections, selections, reason));
    if (!oldState || oldState.cursorState.length !== newState.cursorState.length || newState.cursorState.some((newCursorState, i2) => !newCursorState.modelState.equals(oldState.cursorState[i2].modelState))) {
      const oldSelections = oldState ? oldState.cursorState.map((s) => s.modelState.selection) : null;
      const oldModelVersionId = oldState ? oldState.modelVersionId : 0;
      eventsCollector.emitOutgoingEvent(new CursorStateChangedEvent(oldSelections, selections, oldModelVersionId, newState.modelVersionId, source || "keyboard", reason, reachedMaxCursorCount));
    }
    return true;
  }
  // -----------------------------------------------------------------------------------------------------------
  // ----- handlers beyond this point
  _findAutoClosingPairs(edits) {
    if (!edits.length) {
      return null;
    }
    const indices = [];
    for (let i2 = 0, len = edits.length; i2 < len; i2++) {
      const edit3 = edits[i2];
      if (!edit3.text || edit3.text.indexOf("\n") >= 0) {
        return null;
      }
      const m = edit3.text.match(/([)\]}>'"`])([^)\]}>'"`]*)$/);
      if (!m) {
        return null;
      }
      const closeChar = m[1];
      const autoClosingPairsCandidates = this.context.cursorConfig.autoClosingPairs.autoClosingPairsCloseSingleChar.get(closeChar);
      if (!autoClosingPairsCandidates || autoClosingPairsCandidates.length !== 1) {
        return null;
      }
      const openChar = autoClosingPairsCandidates[0].open;
      const closeCharIndex = edit3.text.length - m[2].length - 1;
      const openCharIndex = edit3.text.lastIndexOf(openChar, closeCharIndex - 1);
      if (openCharIndex === -1) {
        return null;
      }
      indices.push([openCharIndex, closeCharIndex]);
    }
    return indices;
  }
  executeEdits(eventsCollector, source, edits, cursorStateComputer, reason) {
    let autoClosingIndices = null;
    if (source === "snippet") {
      autoClosingIndices = this._findAutoClosingPairs(edits);
    }
    if (autoClosingIndices) {
      edits[0]._isTracked = true;
    }
    const autoClosedCharactersRanges = [];
    const autoClosedEnclosingRanges = [];
    const selections = this._model.pushEditOperations(this.getSelections(), edits, (undoEdits) => {
      if (autoClosingIndices) {
        for (let i2 = 0, len = autoClosingIndices.length; i2 < len; i2++) {
          const [openCharInnerIndex, closeCharInnerIndex] = autoClosingIndices[i2];
          const undoEdit = undoEdits[i2];
          const lineNumber = undoEdit.range.startLineNumber;
          const openCharIndex = undoEdit.range.startColumn - 1 + openCharInnerIndex;
          const closeCharIndex = undoEdit.range.startColumn - 1 + closeCharInnerIndex;
          autoClosedCharactersRanges.push(new Range2(lineNumber, closeCharIndex + 1, lineNumber, closeCharIndex + 2));
          autoClosedEnclosingRanges.push(new Range2(lineNumber, openCharIndex + 1, lineNumber, closeCharIndex + 2));
        }
      }
      const selections2 = cursorStateComputer(undoEdits);
      if (selections2) {
        this._isHandling = true;
      }
      return selections2;
    }, void 0, reason);
    if (selections) {
      this._isHandling = false;
      this.setSelections(eventsCollector, source, selections, 0 /* NotSet */);
    }
    if (autoClosedCharactersRanges.length > 0) {
      this._pushAutoClosedAction(autoClosedCharactersRanges, autoClosedEnclosingRanges);
    }
  }
  _executeEdit(callback, eventsCollector, source, cursorChangeReason = 0 /* NotSet */) {
    if (this.context.cursorConfig.readOnly) {
      return;
    }
    const oldState = CursorModelState.from(this._model, this);
    this._cursors.stopTrackingSelections();
    this._isHandling = true;
    try {
      this._cursors.ensureValidState();
      callback();
    } catch (err) {
      onUnexpectedError(err);
    }
    this._isHandling = false;
    this._cursors.startTrackingSelections();
    this._validateAutoClosedActions();
    if (this._emitStateChangedIfNecessary(eventsCollector, source, cursorChangeReason, oldState, false)) {
      this.revealAll(eventsCollector, source, false, 0 /* Simple */, true, 0 /* Smooth */);
    }
  }
  getAutoClosedCharacters() {
    return AutoClosedAction.getAllAutoClosedCharacters(this._autoClosedActions);
  }
  startComposition(eventsCollector) {
    this._compositionState = new CompositionState(this._model, this.getSelections());
  }
  endComposition(eventsCollector, source) {
    const reason = EditSources.cursor({ kind: "compositionEnd", detailedSource: source });
    const compositionOutcome = this._compositionState ? this._compositionState.deduceOutcome(this._model, this.getSelections()) : null;
    this._compositionState = null;
    this._executeEdit(() => {
      if (source === "keyboard") {
        this._executeEditOperation(TypeOperations.compositionEndWithInterceptors(this._prevEditOperationType, this.context.cursorConfig, this._model, compositionOutcome, this.getSelections(), this.getAutoClosedCharacters()), reason);
      }
    }, eventsCollector, source);
  }
  type(eventsCollector, text2, source) {
    const reason = EditSources.cursor({ kind: "type", detailedSource: source });
    this._executeEdit(() => {
      if (source === "keyboard") {
        const len = text2.length;
        let offset = 0;
        while (offset < len) {
          const charLength = nextCharLength(text2, offset);
          const chr = text2.substr(offset, charLength);
          this._executeEditOperation(TypeOperations.typeWithInterceptors(!!this._compositionState, this._prevEditOperationType, this.context.cursorConfig, this._model, this.getSelections(), this.getAutoClosedCharacters(), chr), reason);
          offset += charLength;
        }
      } else {
        this._executeEditOperation(TypeOperations.typeWithoutInterceptors(this._prevEditOperationType, this.context.cursorConfig, this._model, this.getSelections(), text2), reason);
      }
    }, eventsCollector, source);
  }
  compositionType(eventsCollector, text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta, source) {
    const reason = EditSources.cursor({ kind: "compositionType", detailedSource: source });
    if (text2.length === 0 && replacePrevCharCnt === 0 && replaceNextCharCnt === 0) {
      if (positionDelta !== 0) {
        const newSelections = this.getSelections().map((selection) => {
          const position2 = selection.getPosition();
          return new Selection(position2.lineNumber, position2.column + positionDelta, position2.lineNumber, position2.column + positionDelta);
        });
        this.setSelections(eventsCollector, source, newSelections, 0 /* NotSet */);
      }
      return;
    }
    this._executeEdit(() => {
      this._executeEditOperation(TypeOperations.compositionType(this._prevEditOperationType, this.context.cursorConfig, this._model, this.getSelections(), text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta), reason);
    }, eventsCollector, source);
  }
  paste(eventsCollector, text2, pasteOnNewLine, multicursorText, source) {
    const reason = EditSources.cursor({ kind: "paste", detailedSource: source });
    this._executeEdit(() => {
      this._executeEditOperation(TypeOperations.paste(this.context.cursorConfig, this._model, this.getSelections(), text2, pasteOnNewLine, multicursorText || []), reason);
    }, eventsCollector, source, 4 /* Paste */);
  }
  cut(eventsCollector, source) {
    const reason = EditSources.cursor({ kind: "cut", detailedSource: source });
    this._executeEdit(() => {
      this._executeEditOperation(DeleteOperations.cut(this.context.cursorConfig, this._model, this.getSelections()), reason);
    }, eventsCollector, source);
  }
  executeCommand(eventsCollector, command4, source) {
    const reason = EditSources.cursor({ kind: "executeCommand", detailedSource: source });
    this._executeEdit(() => {
      this._cursors.killSecondaryCursors();
      this._executeEditOperation(new EditOperationResult(0 /* Other */, [command4], {
        shouldPushStackElementBefore: false,
        shouldPushStackElementAfter: false
      }), reason);
    }, eventsCollector, source);
  }
  executeCommands(eventsCollector, commands, source) {
    const reason = EditSources.cursor({ kind: "executeCommands", detailedSource: source });
    this._executeEdit(() => {
      this._executeEditOperation(new EditOperationResult(0 /* Other */, commands, {
        shouldPushStackElementBefore: false,
        shouldPushStackElementAfter: false
      }), reason);
    }, eventsCollector, source);
  }
};

var CursorModelState = class _CursorModelState {
  constructor(modelVersionId, cursorState) {
    this.modelVersionId = modelVersionId;
    this.cursorState = cursorState;
  }
  static from(model, cursor) {
    return new _CursorModelState(model.getVersionId(), cursor.getCursorStates());
  }
  equals(other) {
    if (!other) {
      return false;
    }
    if (this.modelVersionId !== other.modelVersionId) {
      return false;
    }
    if (this.cursorState.length !== other.cursorState.length) {
      return false;
    }
    for (let i2 = 0, len = this.cursorState.length; i2 < len; i2++) {
      if (!this.cursorState[i2].equals(other.cursorState[i2])) {
        return false;
      }
    }
    return true;
  }
};

var AutoClosedAction = class {
  static getAllAutoClosedCharacters(autoClosedActions) {
    let autoClosedCharacters = [];
    for (const autoClosedAction of autoClosedActions) {
      autoClosedCharacters = autoClosedCharacters.concat(autoClosedAction.getAutoClosedCharactersRanges());
    }
    return autoClosedCharacters;
  }
  constructor(model, autoClosedCharactersDecorations, autoClosedEnclosingDecorations) {
    this._model = model;
    this._autoClosedCharactersDecorations = autoClosedCharactersDecorations;
    this._autoClosedEnclosingDecorations = autoClosedEnclosingDecorations;
  }
  dispose() {
    this._autoClosedCharactersDecorations = this._model.deltaDecorations(this._autoClosedCharactersDecorations, []);
    this._autoClosedEnclosingDecorations = this._model.deltaDecorations(this._autoClosedEnclosingDecorations, []);
  }
  getAutoClosedCharactersRanges() {
    const result = [];
    for (let i2 = 0; i2 < this._autoClosedCharactersDecorations.length; i2++) {
      const decorationRange = this._model.getDecorationRange(this._autoClosedCharactersDecorations[i2]);
      if (decorationRange) {
        result.push(decorationRange);
      }
    }
    return result;
  }
  isValid(selections) {
    const enclosingRanges = [];
    for (let i2 = 0; i2 < this._autoClosedEnclosingDecorations.length; i2++) {
      const decorationRange = this._model.getDecorationRange(this._autoClosedEnclosingDecorations[i2]);
      if (decorationRange) {
        enclosingRanges.push(decorationRange);
        if (decorationRange.startLineNumber !== decorationRange.endLineNumber) {
          return false;
        }
      }
    }
    enclosingRanges.sort(Range2.compareRangesUsingStarts);
    selections.sort(Range2.compareRangesUsingStarts);
    for (let i2 = 0; i2 < selections.length; i2++) {
      if (i2 >= enclosingRanges.length) {
        return false;
      }
      if (!enclosingRanges[i2].strictContainsRange(selections[i2])) {
        return false;
      }
    }
    return true;
  }
};

var CommandExecutor = class {
  static executeCommands(model, selectionsBefore, commands, editReason = EditSources.unknown({ name: "executeCommands" })) {
    const ctx = {
      model,
      selectionsBefore,
      trackedRanges: [],
      trackedRangesDirection: []
    };
    const result = this._innerExecuteCommands(ctx, commands, editReason);
    for (let i2 = 0, len = ctx.trackedRanges.length; i2 < len; i2++) {
      ctx.model._setTrackedRange(ctx.trackedRanges[i2], null, 0 /* AlwaysGrowsWhenTypingAtEdges */);
    }
    return result;
  }
  static _innerExecuteCommands(ctx, commands, editReason) {
    if (this._arrayIsEmpty(commands)) {
      return null;
    }
    const commandsData = this._getEditOperations(ctx, commands);
    if (commandsData.operations.length === 0) {
      return null;
    }
    const rawOperations = commandsData.operations;
    const loserCursorsMap = this._getLoserCursorMap(rawOperations);
    if (loserCursorsMap.hasOwnProperty("0")) {
      console.warn("Ignoring commands");
      return null;
    }
    const filteredOperations = [];
    for (let i2 = 0, len = rawOperations.length; i2 < len; i2++) {
      if (!loserCursorsMap.hasOwnProperty(rawOperations[i2].identifier.major.toString())) {
        filteredOperations.push(rawOperations[i2]);
      }
    }
    if (commandsData.hadTrackedEditOperation && filteredOperations.length > 0) {
      filteredOperations[0]._isTracked = true;
    }
    let selectionsAfter = ctx.model.pushEditOperations(ctx.selectionsBefore, filteredOperations, (inverseEditOperations) => {
      const groupedInverseEditOperations = [];
      for (let i2 = 0; i2 < ctx.selectionsBefore.length; i2++) {
        groupedInverseEditOperations[i2] = [];
      }
      for (const op of inverseEditOperations) {
        if (!op.identifier) {
          continue;
        }
        groupedInverseEditOperations[op.identifier.major].push(op);
      }
      const minorBasedSorter = (a, b) => {
        return a.identifier.minor - b.identifier.minor;
      };
      const cursorSelections = [];
      for (let i2 = 0; i2 < ctx.selectionsBefore.length; i2++) {
        if (groupedInverseEditOperations[i2].length > 0) {
          groupedInverseEditOperations[i2].sort(minorBasedSorter);
          cursorSelections[i2] = commands[i2].computeCursorState(ctx.model, {
            getInverseEditOperations: () => {
              return groupedInverseEditOperations[i2];
            },
            getTrackedSelection: (id2) => {
              const idx = parseInt(id2, 10);
              const range2 = ctx.model._getTrackedRange(ctx.trackedRanges[idx]);
              if (ctx.trackedRangesDirection[idx] === 0 /* LTR */) {
                return new Selection(range2.startLineNumber, range2.startColumn, range2.endLineNumber, range2.endColumn);
              }
              return new Selection(range2.endLineNumber, range2.endColumn, range2.startLineNumber, range2.startColumn);
            }
          });
        } else {
          cursorSelections[i2] = ctx.selectionsBefore[i2];
        }
      }
      return cursorSelections;
    }, void 0, editReason);
    if (!selectionsAfter) {
      selectionsAfter = ctx.selectionsBefore;
    }
    const losingCursors = [];
    for (const losingCursorIndex in loserCursorsMap) {
      if (loserCursorsMap.hasOwnProperty(losingCursorIndex)) {
        losingCursors.push(parseInt(losingCursorIndex, 10));
      }
    }
    losingCursors.sort((a, b) => {
      return b - a;
    });
    for (const losingCursor of losingCursors) {
      selectionsAfter.splice(losingCursor, 1);
    }
    return selectionsAfter;
  }
  static _arrayIsEmpty(commands) {
    for (let i2 = 0, len = commands.length; i2 < len; i2++) {
      if (commands[i2]) {
        return false;
      }
    }
    return true;
  }
  static _getEditOperations(ctx, commands) {
    let operations = [];
    let hadTrackedEditOperation = false;
    for (let i2 = 0, len = commands.length; i2 < len; i2++) {
      const command4 = commands[i2];
      if (command4) {
        const r2 = this._getEditOperationsFromCommand(ctx, i2, command4);
        operations = operations.concat(r2.operations);
        hadTrackedEditOperation = hadTrackedEditOperation || r2.hadTrackedEditOperation;
      }
    }
    return {
      operations,
      hadTrackedEditOperation
    };
  }
  static _getEditOperationsFromCommand(ctx, majorIdentifier, command4) {
    const operations = [];
    let operationMinor = 0;
    const addEditOperation = (range2, text2, forceMoveMarkers = false) => {
      if (Range2.isEmpty(range2) && text2 === "") {
        return;
      }
      operations.push({
        identifier: {
          major: majorIdentifier,
          minor: operationMinor++
        },
        range: range2,
        text: text2,
        forceMoveMarkers,
        isAutoWhitespaceEdit: command4.insertsAutoWhitespace
      });
    };
    let hadTrackedEditOperation = false;
    const addTrackedEditOperation = (selection, text2, forceMoveMarkers) => {
      hadTrackedEditOperation = true;
      addEditOperation(selection, text2, forceMoveMarkers);
    };
    const trackSelection = (_selection, trackPreviousOnEmpty) => {
      const selection = Selection.liftSelection(_selection);
      let stickiness2;
      if (selection.isEmpty()) {
        if (typeof trackPreviousOnEmpty === "boolean") {
          if (trackPreviousOnEmpty) {
            stickiness2 = 2 /* GrowsOnlyWhenTypingBefore */;
          } else {
            stickiness2 = 3 /* GrowsOnlyWhenTypingAfter */;
          }
        } else {
          const maxLineColumn = ctx.model.getLineMaxColumn(selection.startLineNumber);
          if (selection.startColumn === maxLineColumn) {
            stickiness2 = 2 /* GrowsOnlyWhenTypingBefore */;
          } else {
            stickiness2 = 3 /* GrowsOnlyWhenTypingAfter */;
          }
        }
      } else {
        stickiness2 = 1 /* NeverGrowsWhenTypingAtEdges */;
      }
      const l = ctx.trackedRanges.length;
      const id2 = ctx.model._setTrackedRange(null, selection, stickiness2);
      ctx.trackedRanges[l] = id2;
      ctx.trackedRangesDirection[l] = selection.getDirection();
      return l.toString();
    };
    const editOperationBuilder = {
      addEditOperation,
      addTrackedEditOperation,
      trackSelection
    };
    try {
      command4.getEditOperations(ctx.model, editOperationBuilder);
    } catch (e) {
      onUnexpectedError(e);
      return {
        operations: [],
        hadTrackedEditOperation: false
      };
    }
    return {
      operations,
      hadTrackedEditOperation
    };
  }
  static _getLoserCursorMap(operations) {
    operations = operations.slice(0);
    operations.sort((a, b) => {
      return -Range2.compareRangesUsingEnds(a.range, b.range);
    });
    const loserCursorsMap = {};
    for (let i2 = 1; i2 < operations.length; i2++) {
      const previousOp = operations[i2 - 1];
      const currentOp = operations[i2];
      if (Range2.getStartPosition(previousOp.range).isBefore(Range2.getEndPosition(currentOp.range))) {
        let loserMajor;
        if (previousOp.identifier.major > currentOp.identifier.major) {
          loserMajor = previousOp.identifier.major;
        } else {
          loserMajor = currentOp.identifier.major;
        }
        loserCursorsMap[loserMajor.toString()] = true;
        for (let j = 0; j < operations.length; j++) {
          if (operations[j].identifier.major === loserMajor) {
            operations.splice(j, 1);
            if (j < i2) {
              i2--;
            }
            j--;
          }
        }
        if (i2 > 0) {
          i2--;
        }
      }
    }
    return loserCursorsMap;
  }
};

var CompositionLineState = class {
  constructor(text2, lineNumber, startSelectionOffset, endSelectionOffset) {
    this.text = text2;
    this.lineNumber = lineNumber;
    this.startSelectionOffset = startSelectionOffset;
    this.endSelectionOffset = endSelectionOffset;
  }
};

var CompositionState = class _CompositionState {
  static _capture(textModel, selections) {
    const result = [];
    for (const selection of selections) {
      if (selection.startLineNumber !== selection.endLineNumber) {
        return null;
      }
      const lineNumber = selection.startLineNumber;
      result.push(new CompositionLineState(
        textModel.getLineContent(lineNumber),
        lineNumber,
        selection.startColumn - 1,
        selection.endColumn - 1
      ));
    }
    return result;
  }
  constructor(textModel, selections) {
    this._original = _CompositionState._capture(textModel, selections);
  }
  /**
   * Returns the inserted text during this composition.
   * If the composition resulted in existing text being changed (i.e. not a pure insertion) it returns null.
   */
  deduceOutcome(textModel, selections) {
    if (!this._original) {
      return null;
    }
    const current = _CompositionState._capture(textModel, selections);
    if (!current) {
      return null;
    }
    if (this._original.length !== current.length) {
      return null;
    }
    const result = [];
    for (let i2 = 0, len = this._original.length; i2 < len; i2++) {
      result.push(_CompositionState._deduceOutcome(this._original[i2], current[i2]));
    }
    return result;
  }
  static _deduceOutcome(original, current) {
    const commonPrefix = Math.min(
      original.startSelectionOffset,
      current.startSelectionOffset,
      commonPrefixLength2(original.text, current.text)
    );
    const commonSuffix = Math.min(
      original.text.length - original.endSelectionOffset,
      current.text.length - current.endSelectionOffset,
      commonSuffixLength(original.text, current.text)
    );
    const deletedText = original.text.substring(commonPrefix, original.text.length - commonSuffix);
    const insertedTextStartOffset = commonPrefix;
    const insertedTextEndOffset = current.text.length - commonSuffix;
    const insertedText = current.text.substring(insertedTextStartOffset, insertedTextEndOffset);
    const insertedTextRange = new Range2(current.lineNumber, insertedTextStartOffset + 1, current.lineNumber, insertedTextEndOffset + 1);
    return new CompositionOutcome(
      deletedText,
      original.startSelectionOffset - commonPrefix,
      original.endSelectionOffset - commonPrefix,
      insertedText,
      current.startSelectionOffset - commonPrefix,
      current.endSelectionOffset - commonPrefix,
      insertedTextRange
    );
  }
};
export { CursorsController, CursorModelState, AutoClosedAction, CommandExecutor, CompositionLineState, CompositionState };
