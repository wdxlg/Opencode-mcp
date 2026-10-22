// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/cursor/cursorCollection.ts
import { Cursor } from "./module-0425.mjs";
import { findFirstMin, findLastMax } from "./module-0006.mjs";
import { compareBy } from "./module-0007.mjs";
import { Position } from "./module-0079.mjs";
import { CursorState } from "./module-0113.mjs";
import { Range2 } from "./module-0106.mjs";
import { Selection } from "./module-0107.mjs";


// src/vs/editor/common/cursor/cursorCollection.ts
var CursorCollection = class {
  constructor(context2) {
    this.context = context2;
    this.cursors = [new Cursor(context2)];
    this.lastAddedCursorIndex = 0;
  }
  dispose() {
    for (const cursor of this.cursors) {
      cursor.dispose(this.context);
    }
  }
  startTrackingSelections() {
    for (const cursor of this.cursors) {
      cursor.startTrackingSelection(this.context);
    }
  }
  stopTrackingSelections() {
    for (const cursor of this.cursors) {
      cursor.stopTrackingSelection(this.context);
    }
  }
  updateContext(context2) {
    this.context = context2;
  }
  ensureValidState() {
    for (const cursor of this.cursors) {
      cursor.ensureValidState(this.context);
    }
  }
  readSelectionFromMarkers() {
    return this.cursors.map((c) => c.readSelectionFromMarkers(this.context));
  }
  getAll() {
    return this.cursors.map((c) => c.asCursorState());
  }
  getViewPositions() {
    return this.cursors.map((c) => c.viewState.position);
  }
  getTopMostViewPosition() {
    return findFirstMin(
      this.cursors,
      compareBy((c) => c.viewState.position, Position.compare)
    ).viewState.position;
  }
  getBottomMostViewPosition() {
    return findLastMax(
      this.cursors,
      compareBy((c) => c.viewState.position, Position.compare)
    ).viewState.position;
  }
  getSelections() {
    return this.cursors.map((c) => c.modelState.selection);
  }
  getViewSelections() {
    return this.cursors.map((c) => c.viewState.selection);
  }
  setSelections(selections) {
    this.setStates(CursorState.fromModelSelections(selections));
  }
  getPrimaryCursor() {
    return this.cursors[0].asCursorState();
  }
  setStates(states) {
    if (states === null) {
      return;
    }
    this.cursors[0].setState(this.context, states[0].modelState, states[0].viewState);
    this._setSecondaryStates(states.slice(1));
  }
  /**
   * Creates or disposes secondary cursors as necessary to match the number of `secondarySelections`.
   */
  _setSecondaryStates(secondaryStates) {
    const secondaryCursorsLength = this.cursors.length - 1;
    const secondaryStatesLength = secondaryStates.length;
    if (secondaryCursorsLength < secondaryStatesLength) {
      const createCnt = secondaryStatesLength - secondaryCursorsLength;
      for (let i2 = 0; i2 < createCnt; i2++) {
        this._addSecondaryCursor();
      }
    } else if (secondaryCursorsLength > secondaryStatesLength) {
      const removeCnt = secondaryCursorsLength - secondaryStatesLength;
      for (let i2 = 0; i2 < removeCnt; i2++) {
        this._removeSecondaryCursor(this.cursors.length - 2);
      }
    }
    for (let i2 = 0; i2 < secondaryStatesLength; i2++) {
      this.cursors[i2 + 1].setState(this.context, secondaryStates[i2].modelState, secondaryStates[i2].viewState);
    }
  }
  killSecondaryCursors() {
    this._setSecondaryStates([]);
  }
  _addSecondaryCursor() {
    this.cursors.push(new Cursor(this.context));
    this.lastAddedCursorIndex = this.cursors.length - 1;
  }
  getLastAddedCursorIndex() {
    if (this.cursors.length === 1 || this.lastAddedCursorIndex === 0) {
      return 0;
    }
    return this.lastAddedCursorIndex;
  }
  _removeSecondaryCursor(removeIndex) {
    if (this.lastAddedCursorIndex >= removeIndex + 1) {
      this.lastAddedCursorIndex--;
    }
    this.cursors[removeIndex + 1].dispose(this.context);
    this.cursors.splice(removeIndex + 1, 1);
  }
  normalize() {
    if (this.cursors.length === 1) {
      return;
    }
    const cursors = this.cursors.slice(0);
    const sortedCursors = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      sortedCursors.push({
        index: i2,
        selection: cursors[i2].modelState.selection
      });
    }
    sortedCursors.sort(compareBy((s) => s.selection, Range2.compareRangesUsingStarts));
    for (let sortedCursorIndex = 0; sortedCursorIndex < sortedCursors.length - 1; sortedCursorIndex++) {
      const current = sortedCursors[sortedCursorIndex];
      const next = sortedCursors[sortedCursorIndex + 1];
      const currentSelection = current.selection;
      const nextSelection = next.selection;
      if (!this.context.cursorConfig.multiCursorMergeOverlapping) {
        continue;
      }
      let shouldMergeCursors;
      if (nextSelection.isEmpty() || currentSelection.isEmpty()) {
        shouldMergeCursors = nextSelection.getStartPosition().isBeforeOrEqual(currentSelection.getEndPosition());
      } else {
        shouldMergeCursors = nextSelection.getStartPosition().isBefore(currentSelection.getEndPosition());
      }
      if (shouldMergeCursors) {
        const winnerSortedCursorIndex = current.index < next.index ? sortedCursorIndex : sortedCursorIndex + 1;
        const looserSortedCursorIndex = current.index < next.index ? sortedCursorIndex + 1 : sortedCursorIndex;
        const looserIndex = sortedCursors[looserSortedCursorIndex].index;
        const winnerIndex = sortedCursors[winnerSortedCursorIndex].index;
        const looserSelection = sortedCursors[looserSortedCursorIndex].selection;
        const winnerSelection = sortedCursors[winnerSortedCursorIndex].selection;
        if (!looserSelection.equalsSelection(winnerSelection)) {
          const resultingRange = looserSelection.plusRange(winnerSelection);
          const looserSelectionIsLTR = looserSelection.selectionStartLineNumber === looserSelection.startLineNumber && looserSelection.selectionStartColumn === looserSelection.startColumn;
          const winnerSelectionIsLTR = winnerSelection.selectionStartLineNumber === winnerSelection.startLineNumber && winnerSelection.selectionStartColumn === winnerSelection.startColumn;
          let resultingSelectionIsLTR;
          if (looserIndex === this.lastAddedCursorIndex) {
            resultingSelectionIsLTR = looserSelectionIsLTR;
            this.lastAddedCursorIndex = winnerIndex;
          } else {
            resultingSelectionIsLTR = winnerSelectionIsLTR;
          }
          let resultingSelection;
          if (resultingSelectionIsLTR) {
            resultingSelection = new Selection(resultingRange.startLineNumber, resultingRange.startColumn, resultingRange.endLineNumber, resultingRange.endColumn);
          } else {
            resultingSelection = new Selection(resultingRange.endLineNumber, resultingRange.endColumn, resultingRange.startLineNumber, resultingRange.startColumn);
          }
          sortedCursors[winnerSortedCursorIndex].selection = resultingSelection;
          const resultingState = CursorState.fromModelSelection(resultingSelection);
          cursors[winnerIndex].setState(this.context, resultingState.modelState, resultingState.viewState);
        }
        for (const sortedCursor of sortedCursors) {
          if (sortedCursor.index > looserIndex) {
            sortedCursor.index--;
          }
        }
        cursors.splice(looserIndex, 1);
        sortedCursors.splice(looserSortedCursorIndex, 1);
        this._removeSecondaryCursor(looserIndex - 1);
        sortedCursorIndex--;
      }
    }
  }
};
export { CursorCollection };
