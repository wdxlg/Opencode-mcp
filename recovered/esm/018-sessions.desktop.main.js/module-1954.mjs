// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/notebookDiff.ts



// src/vs/workbench/contrib/notebook/common/notebookDiff.ts
function computeDiff2(originalModel, modifiedModel, diffResult) {
  const cellChanges = diffResult.cellsDiff.changes;
  const cellDiffInfo = [];
  let originalCellIndex = 0;
  let modifiedCellIndex = 0;
  let firstChangeIndex = -1;
  for (let i2 = 0; i2 < cellChanges.length; i2++) {
    const change = cellChanges[i2];
    for (let j = 0; j < change.originalStart - originalCellIndex; j++) {
      const originalCell = originalModel.cells[originalCellIndex + j];
      const modifiedCell = modifiedModel.cells[modifiedCellIndex + j];
      if (originalCell.getHashValue() === modifiedCell.getHashValue()) {
        cellDiffInfo.push({
          originalCellIndex: originalCellIndex + j,
          modifiedCellIndex: modifiedCellIndex + j,
          type: "unchanged"
        });
      } else {
        if (firstChangeIndex === -1) {
          firstChangeIndex = cellDiffInfo.length;
        }
        cellDiffInfo.push({
          originalCellIndex: originalCellIndex + j,
          modifiedCellIndex: modifiedCellIndex + j,
          type: "modified"
        });
      }
    }
    const modifiedLCS = computeModifiedLCS(change, originalModel, modifiedModel);
    if (modifiedLCS.length && firstChangeIndex === -1) {
      firstChangeIndex = cellDiffInfo.length;
    }
    cellDiffInfo.push(...modifiedLCS);
    originalCellIndex = change.originalStart + change.originalLength;
    modifiedCellIndex = change.modifiedStart + change.modifiedLength;
  }
  for (let i2 = originalCellIndex; i2 < originalModel.cells.length; i2++) {
    cellDiffInfo.push({
      originalCellIndex: i2,
      modifiedCellIndex: i2 - originalCellIndex + modifiedCellIndex,
      type: "unchanged"
    });
  }
  return {
    cellDiffInfo,
    firstChangeIndex
  };
}

function computeModifiedLCS(change, originalModel, modifiedModel) {
  const result = [];
  const modifiedLen = Math.min(change.originalLength, change.modifiedLength);
  for (let j = 0; j < modifiedLen; j++) {
    const originalCell = originalModel.cells[change.originalStart + j];
    const modifiedCell = modifiedModel.cells[change.modifiedStart + j];
    if (originalCell.cellKind !== modifiedCell.cellKind) {
      result.push({
        originalCellIndex: change.originalStart + j,
        type: "delete"
      });
      result.push({
        modifiedCellIndex: change.modifiedStart + j,
        type: "insert"
      });
    } else {
      const isTheSame = originalCell.equal(modifiedCell);
      result.push({
        originalCellIndex: change.originalStart + j,
        modifiedCellIndex: change.modifiedStart + j,
        type: isTheSame ? "unchanged" : "modified"
      });
    }
  }
  for (let j = modifiedLen; j < change.originalLength; j++) {
    result.push({
      originalCellIndex: change.originalStart + j,
      type: "delete"
    });
  }
  for (let j = modifiedLen; j < change.modifiedLength; j++) {
    result.push({
      modifiedCellIndex: change.modifiedStart + j,
      type: "insert"
    });
  }
  return result;
}
export { computeDiff2, computeModifiedLCS };
