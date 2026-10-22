// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/cursor/oneCursor.ts
import { CursorState, SingleCursorState } from "./module-0113.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { Selection } from "./module-0107.mjs";


// src/vs/editor/common/cursor/oneCursor.ts
var Cursor = class _Cursor {
  constructor(context2) {
    this._selTrackedRange = null;
    this._trackSelection = true;
    this._setState(
      context2,
      new SingleCursorState(new Range2(1, 1, 1, 1), 0 /* Simple */, 0, new Position(1, 1), 0),
      new SingleCursorState(new Range2(1, 1, 1, 1), 0 /* Simple */, 0, new Position(1, 1), 0)
    );
  }
  dispose(context2) {
    this._removeTrackedRange(context2);
  }
  startTrackingSelection(context2) {
    this._trackSelection = true;
    this._updateTrackedRange(context2);
  }
  stopTrackingSelection(context2) {
    this._trackSelection = false;
    this._removeTrackedRange(context2);
  }
  _updateTrackedRange(context2) {
    if (!this._trackSelection) {
      return;
    }
    this._selTrackedRange = context2.model._setTrackedRange(this._selTrackedRange, this.modelState.selection, 0 /* AlwaysGrowsWhenTypingAtEdges */);
  }
  _removeTrackedRange(context2) {
    this._selTrackedRange = context2.model._setTrackedRange(this._selTrackedRange, null, 0 /* AlwaysGrowsWhenTypingAtEdges */);
  }
  asCursorState() {
    return new CursorState(this.modelState, this.viewState);
  }
  readSelectionFromMarkers(context2) {
    const range2 = context2.model._getTrackedRange(this._selTrackedRange);
    if (this.modelState.selection.isEmpty() && !range2.isEmpty()) {
      return Selection.fromRange(range2.collapseToEnd(), this.modelState.selection.getDirection());
    }
    return Selection.fromRange(range2, this.modelState.selection.getDirection());
  }
  ensureValidState(context2) {
    this._setState(context2, this.modelState, this.viewState);
  }
  setState(context2, modelState, viewState) {
    this._setState(context2, modelState, viewState);
  }
  static _validatePositionWithCache(viewModel, position2, cacheInput, cacheOutput) {
    if (position2.equals(cacheInput)) {
      return cacheOutput;
    }
    return viewModel.normalizePosition(position2, 2 /* None */);
  }
  static _validateViewState(viewModel, viewState) {
    const position2 = viewState.position;
    const sStartPosition = viewState.selectionStart.getStartPosition();
    const sEndPosition = viewState.selectionStart.getEndPosition();
    const validPosition = viewModel.normalizePosition(position2, 2 /* None */);
    const validSStartPosition = this._validatePositionWithCache(viewModel, sStartPosition, position2, validPosition);
    const validSEndPosition = this._validatePositionWithCache(viewModel, sEndPosition, sStartPosition, validSStartPosition);
    if (position2.equals(validPosition) && sStartPosition.equals(validSStartPosition) && sEndPosition.equals(validSEndPosition)) {
      return viewState;
    }
    return new SingleCursorState(
      Range2.fromPositions(validSStartPosition, validSEndPosition),
      viewState.selectionStartKind,
      viewState.selectionStartLeftoverVisibleColumns + sStartPosition.column - validSStartPosition.column,
      validPosition,
      viewState.leftoverVisibleColumns + position2.column - validPosition.column
    );
  }
  _setState(context2, modelState, viewState) {
    if (viewState) {
      viewState = _Cursor._validateViewState(context2.viewModel, viewState);
    }
    if (!modelState) {
      if (!viewState) {
        return;
      }
      const selectionStart = context2.model.validateRange(
        context2.coordinatesConverter.convertViewRangeToModelRange(viewState.selectionStart)
      );
      const position2 = context2.model.validatePosition(
        context2.coordinatesConverter.convertViewPositionToModelPosition(viewState.position)
      );
      modelState = new SingleCursorState(selectionStart, viewState.selectionStartKind, viewState.selectionStartLeftoverVisibleColumns, position2, viewState.leftoverVisibleColumns);
    } else {
      const selectionStart = context2.model.validateRange(modelState.selectionStart);
      const selectionStartLeftoverVisibleColumns = modelState.selectionStart.equalsRange(selectionStart) ? modelState.selectionStartLeftoverVisibleColumns : 0;
      const position2 = context2.model.validatePosition(
        modelState.position
      );
      const leftoverVisibleColumns = modelState.position.equals(position2) ? modelState.leftoverVisibleColumns : 0;
      modelState = new SingleCursorState(selectionStart, modelState.selectionStartKind, selectionStartLeftoverVisibleColumns, position2, leftoverVisibleColumns);
    }
    if (!viewState) {
      const viewSelectionStart1 = context2.coordinatesConverter.convertModelPositionToViewPosition(new Position(modelState.selectionStart.startLineNumber, modelState.selectionStart.startColumn));
      const viewSelectionStart2 = context2.coordinatesConverter.convertModelPositionToViewPosition(new Position(modelState.selectionStart.endLineNumber, modelState.selectionStart.endColumn));
      const viewSelectionStart = new Range2(viewSelectionStart1.lineNumber, viewSelectionStart1.column, viewSelectionStart2.lineNumber, viewSelectionStart2.column);
      const viewPosition = context2.coordinatesConverter.convertModelPositionToViewPosition(modelState.position);
      viewState = new SingleCursorState(viewSelectionStart, modelState.selectionStartKind, modelState.selectionStartLeftoverVisibleColumns, viewPosition, modelState.leftoverVisibleColumns);
    } else {
      const viewSelectionStart = context2.coordinatesConverter.validateViewRange(viewState.selectionStart, modelState.selectionStart);
      const viewPosition = context2.coordinatesConverter.validateViewPosition(viewState.position, modelState.position);
      viewState = new SingleCursorState(viewSelectionStart, modelState.selectionStartKind, modelState.selectionStartLeftoverVisibleColumns, viewPosition, modelState.leftoverVisibleColumns);
    }
    this.modelState = modelState;
    this.viewState = viewState;
    this._updateTrackedRange(context2);
  }
};
export { Cursor };
