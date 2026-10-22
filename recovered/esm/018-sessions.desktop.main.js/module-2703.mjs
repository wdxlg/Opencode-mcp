// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/notebook/helpers.ts
import { sortCellChanges } from "./module-2699.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/notebook/helpers.ts
function adjustCellDiffForRevertingADeletedCell(originalCellIndex, cellDiffInfo, cellToInsert, applyEdits2, createModifiedCellDiffInfo) {
  cellDiffInfo = sortCellChanges(cellDiffInfo);
  const indexOfEntry = cellDiffInfo.findIndex((d) => d.originalCellIndex === originalCellIndex);
  if (indexOfEntry === -1) {
    return cellDiffInfo;
  }
  let modifiedCellIndex = -1;
  for (let i2 = 0; i2 < cellDiffInfo.length; i2++) {
    const diff4 = cellDiffInfo[i2];
    if (i2 < indexOfEntry) {
      modifiedCellIndex = Math.max(modifiedCellIndex, diff4.modifiedCellIndex ?? modifiedCellIndex);
      continue;
    }
    if (i2 === indexOfEntry) {
      const edit3 = { cells: [cellToInsert], count: 0, editType: 1 /* Replace */, index: modifiedCellIndex + 1 };
      applyEdits2([edit3], true, void 0, () => void 0, void 0, true);
      cellDiffInfo[i2] = createModifiedCellDiffInfo(modifiedCellIndex + 1, originalCellIndex);
      continue;
    } else {
      if (typeof diff4.modifiedCellIndex === "number") {
        diff4.modifiedCellIndex++;
        cellDiffInfo[i2] = { ...diff4 };
      }
    }
  }
  return cellDiffInfo;
}

function adjustCellDiffForRevertingAnInsertedCell(modifiedCellIndex, cellDiffInfo, applyEdits2) {
  if (modifiedCellIndex === -1) {
    return cellDiffInfo;
  }
  cellDiffInfo = sortCellChanges(cellDiffInfo).filter((d) => !(d.type === "insert" && d.modifiedCellIndex === modifiedCellIndex)).map((d) => {
    if (d.type === "insert" && d.modifiedCellIndex === modifiedCellIndex) {
      return d;
    }
    if (d.type !== "delete" && d.modifiedCellIndex > modifiedCellIndex) {
      return {
        ...d,
        modifiedCellIndex: d.modifiedCellIndex - 1
      };
    }
    return d;
  });
  const edit3 = { cells: [], count: 1, editType: 1 /* Replace */, index: modifiedCellIndex };
  applyEdits2([edit3], true, void 0, () => void 0, void 0, true);
  return cellDiffInfo;
}

function adjustCellDiffForKeepingAnInsertedCell(modifiedCellIndex, cellDiffInfo, cellToInsert, applyEdits2, createModifiedCellDiffInfo) {
  cellDiffInfo = sortCellChanges(cellDiffInfo);
  if (modifiedCellIndex === -1) {
    return cellDiffInfo;
  }
  const indexOfEntry = cellDiffInfo.findIndex((d) => d.modifiedCellIndex === modifiedCellIndex);
  if (indexOfEntry === -1) {
    return cellDiffInfo;
  }
  let originalCellIndex = -1;
  for (let i2 = 0; i2 < cellDiffInfo.length; i2++) {
    const diff4 = cellDiffInfo[i2];
    if (i2 < indexOfEntry) {
      originalCellIndex = Math.max(originalCellIndex, diff4.originalCellIndex ?? originalCellIndex);
      continue;
    }
    if (i2 === indexOfEntry) {
      const edit3 = { cells: [cellToInsert], count: 0, editType: 1 /* Replace */, index: originalCellIndex + 1 };
      applyEdits2([edit3], true, void 0, () => void 0, void 0, true);
      cellDiffInfo[i2] = createModifiedCellDiffInfo(modifiedCellIndex, originalCellIndex + 1);
      continue;
    } else {
      if (typeof diff4.originalCellIndex === "number") {
        diff4.originalCellIndex++;
        cellDiffInfo[i2] = { ...diff4 };
      }
    }
  }
  return cellDiffInfo;
}

function adjustCellDiffAndOriginalModelBasedOnCellAddDelete(change, cellDiffInfo, modifiedModelCellCount, originalModelCellCount, applyEdits2, createModifiedCellDiffInfo) {
  cellDiffInfo = sortCellChanges(cellDiffInfo);
  const numberOfCellsInserted = change[2].length;
  const numberOfCellsDeleted = change[1];
  const cells = change[2].map((cell) => {
    return {
      cellKind: cell.cellKind,
      language: cell.language,
      metadata: cell.metadata,
      outputs: cell.outputs,
      source: cell.getValue(),
      mime: void 0,
      internalMetadata: cell.internalMetadata
    };
  });
  let diffEntryIndex = -1;
  let indexToInsertInOriginalModel = void 0;
  if (cells.length) {
    for (let i2 = 0; i2 < cellDiffInfo.length; i2++) {
      const diff4 = cellDiffInfo[i2];
      if (typeof diff4.modifiedCellIndex === "number" && diff4.modifiedCellIndex === change[0]) {
        diffEntryIndex = i2;
        if (typeof diff4.originalCellIndex === "number") {
          indexToInsertInOriginalModel = diff4.originalCellIndex;
        }
        break;
      }
      if (typeof diff4.originalCellIndex === "number") {
        indexToInsertInOriginalModel = diff4.originalCellIndex + 1;
      }
    }
    const edit3 = {
      editType: 1 /* Replace */,
      cells,
      index: indexToInsertInOriginalModel ?? 0,
      count: change[1]
    };
    applyEdits2([edit3], true, void 0, () => void 0, void 0, true);
  }
  if (numberOfCellsDeleted) {
    let numberOfOriginalCellsRemovedSoFar = 0;
    let numberOfModifiedCellsRemovedSoFar = 0;
    const modifiedIndexesToRemove = /* @__PURE__ */ new Set();
    for (let i2 = 0; i2 < numberOfCellsDeleted; i2++) {
      modifiedIndexesToRemove.add(change[0] + i2);
    }
    const itemsToRemove = /* @__PURE__ */ new Set();
    for (let i2 = 0; i2 < cellDiffInfo.length; i2++) {
      const diff4 = cellDiffInfo[i2];
      if (i2 < diffEntryIndex) {
        continue;
      }
      let changed = false;
      if (typeof diff4.modifiedCellIndex === "number" && modifiedIndexesToRemove.has(diff4.modifiedCellIndex)) {
        numberOfModifiedCellsRemovedSoFar++;
        if (typeof diff4.originalCellIndex === "number") {
          numberOfOriginalCellsRemovedSoFar++;
        }
        itemsToRemove.add(diff4);
        continue;
      }
      if (typeof diff4.modifiedCellIndex === "number" && numberOfModifiedCellsRemovedSoFar) {
        diff4.modifiedCellIndex -= numberOfModifiedCellsRemovedSoFar;
        changed = true;
      }
      if (typeof diff4.originalCellIndex === "number" && numberOfOriginalCellsRemovedSoFar) {
        diff4.originalCellIndex -= numberOfOriginalCellsRemovedSoFar;
        changed = true;
      }
      if (changed) {
        cellDiffInfo[i2] = { ...diff4 };
      }
    }
    if (itemsToRemove.size) {
      Array.from(itemsToRemove).filter((diff4) => typeof diff4.originalCellIndex === "number").forEach((diff4) => {
        const edit3 = {
          editType: 1 /* Replace */,
          cells: [],
          index: diff4.originalCellIndex,
          count: 1
        };
        applyEdits2([edit3], true, void 0, () => void 0, void 0, true);
      });
    }
    cellDiffInfo = cellDiffInfo.filter((d) => !itemsToRemove.has(d));
  }
  if (numberOfCellsInserted && diffEntryIndex >= 0) {
    for (let i2 = 0; i2 < cellDiffInfo.length; i2++) {
      const diff4 = cellDiffInfo[i2];
      if (i2 < diffEntryIndex) {
        continue;
      }
      let changed = false;
      if (typeof diff4.modifiedCellIndex === "number") {
        diff4.modifiedCellIndex += numberOfCellsInserted;
        changed = true;
      }
      if (typeof diff4.originalCellIndex === "number") {
        diff4.originalCellIndex += numberOfCellsInserted;
        changed = true;
      }
      if (changed) {
        cellDiffInfo[i2] = { ...diff4 };
      }
    }
  }
  cells.forEach((_, i2) => {
    const originalCellIndex = i2 + (indexToInsertInOriginalModel ?? 0);
    const modifiedCellIndex = change[0] + i2;
    const unchangedCell = createModifiedCellDiffInfo(modifiedCellIndex, originalCellIndex);
    cellDiffInfo.splice((diffEntryIndex === -1 ? cellDiffInfo.length : diffEntryIndex) + i2, 0, unchangedCell);
  });
  return cellDiffInfo;
}

function adjustCellDiffAndOriginalModelBasedOnCellMovements(event, cellDiffInfo) {
  const minimumIndex = Math.min(event.index, event.newIdx);
  const maximumIndex = Math.max(event.index, event.newIdx);
  const cellDiffs = cellDiffInfo.slice();
  const indexOfEntry = cellDiffs.findIndex((d) => d.modifiedCellIndex === event.index);
  const indexOfEntryToPlaceBelow = cellDiffs.findIndex((d) => d.modifiedCellIndex === event.newIdx);
  if (indexOfEntry === -1 || indexOfEntryToPlaceBelow === -1) {
    return void 0;
  }
  const entryToBeMoved = { ...cellDiffs[indexOfEntry] };
  const moveDirection = event.newIdx > event.index ? "down" : "up";
  const startIndex = cellDiffs.findIndex((d) => d.modifiedCellIndex === minimumIndex);
  const endIndex = cellDiffs.findIndex((d) => d.modifiedCellIndex === maximumIndex);
  const movingExistingCell = typeof entryToBeMoved.originalCellIndex === "number";
  let originalCellsWereEffected = false;
  for (let i2 = 0; i2 < cellDiffs.length; i2++) {
    const diff4 = cellDiffs[i2];
    let changed = false;
    if (moveDirection === "down") {
      if (i2 > startIndex && i2 <= endIndex) {
        if (typeof diff4.modifiedCellIndex === "number") {
          changed = true;
          diff4.modifiedCellIndex = diff4.modifiedCellIndex - 1;
        }
        if (typeof diff4.originalCellIndex === "number" && movingExistingCell) {
          diff4.originalCellIndex = diff4.originalCellIndex - 1;
          originalCellsWereEffected = true;
          changed = true;
        }
      }
    } else {
      if (i2 >= startIndex && i2 < endIndex) {
        if (typeof diff4.modifiedCellIndex === "number") {
          changed = true;
          diff4.modifiedCellIndex = diff4.modifiedCellIndex + 1;
        }
        if (typeof diff4.originalCellIndex === "number" && movingExistingCell) {
          diff4.originalCellIndex = diff4.originalCellIndex + 1;
          originalCellsWereEffected = true;
          changed = true;
        }
      }
    }
    if (changed) {
      cellDiffs[i2] = { ...diff4 };
    }
  }
  entryToBeMoved.modifiedCellIndex = event.newIdx;
  const originalCellIndex = entryToBeMoved.originalCellIndex;
  if (moveDirection === "down") {
    cellDiffs.splice(endIndex + 1, 0, entryToBeMoved);
    cellDiffs.splice(startIndex, 1);
    if (typeof entryToBeMoved.originalCellIndex === "number") {
      entryToBeMoved.originalCellIndex = cellDiffs.slice(0, endIndex).reduce((lastOriginalIndex, diff4) => typeof diff4.originalCellIndex === "number" ? Math.max(lastOriginalIndex, diff4.originalCellIndex) : lastOriginalIndex, -1) + 1;
    }
  } else {
    cellDiffs.splice(endIndex, 1);
    cellDiffs.splice(startIndex, 0, entryToBeMoved);
    if (typeof entryToBeMoved.originalCellIndex === "number") {
      entryToBeMoved.originalCellIndex = cellDiffs.slice(0, startIndex).reduce((lastOriginalIndex, diff4) => typeof diff4.originalCellIndex === "number" ? Math.max(lastOriginalIndex, diff4.originalCellIndex) : lastOriginalIndex, -1) + 1;
    }
  }
  if (typeof entryToBeMoved.originalCellIndex === "number" && originalCellsWereEffected && typeof originalCellIndex === "number" && entryToBeMoved.originalCellIndex !== originalCellIndex) {
    const edit3 = {
      editType: 6 /* Move */,
      index: originalCellIndex,
      length: event.length,
      newIdx: entryToBeMoved.originalCellIndex
    };
    return [cellDiffs, [edit3]];
  }
  return [cellDiffs, []];
}

function getCorrespondingOriginalCellIndex(modifiedCellIndex, cellDiffInfo) {
  const entry = cellDiffInfo.find((d) => d.modifiedCellIndex === modifiedCellIndex);
  return entry?.originalCellIndex;
}

function isTransientIPyNbExtensionEvent(notebookKind, e4) {
  if (notebookKind !== "jupyter-notebook") {
    return false;
  }
  if (e4.rawEvents.every((event) => {
    if (event.kind !== 7 /* ChangeCellMetadata */) {
      return false;
    }
    if (JSON.stringify(event.metadata || {}) === JSON.stringify({ execution_count: null, metadata: {} })) {
      return true;
    }
    return true;
  })) {
    return true;
  }
  return false;
}

function calculateNotebookRewriteRatio(cellsDiff, originalModel, modifiedModel) {
  const totalNumberOfUpdatedLines = cellsDiff.reduce((totalUpdatedLines, value2) => {
    const getUpadtedLineCount = () => {
      if (value2.type === "unchanged") {
        return 0;
      }
      if (value2.type === "delete") {
        return originalModel.cells[value2.originalCellIndex].textModel?.getLineCount() ?? 0;
      }
      if (value2.type === "insert") {
        return modifiedModel.cells[value2.modifiedCellIndex].textModel?.getLineCount() ?? 0;
      }
      return value2.diff.get().changes.reduce((maxLineNumber, change) => {
        return Math.max(maxLineNumber, change.modified.endLineNumberExclusive);
      }, 0);
    };
    return totalUpdatedLines + getUpadtedLineCount();
  }, 0);
  const totalNumberOfLines = modifiedModel.cells.reduce((totalLines, cell) => totalLines + (cell.textModel?.getLineCount() ?? 0), 0);
  return totalNumberOfLines === 0 ? 0 : Math.min(1, totalNumberOfUpdatedLines / totalNumberOfLines);
}
export { adjustCellDiffForRevertingADeletedCell, adjustCellDiffForRevertingAnInsertedCell, adjustCellDiffForKeepingAnInsertedCell, adjustCellDiffAndOriginalModelBasedOnCellAddDelete, adjustCellDiffAndOriginalModelBasedOnCellMovements, getCorrespondingOriginalCellIndex, isTransientIPyNbExtensionEvent, calculateNotebookRewriteRatio };
