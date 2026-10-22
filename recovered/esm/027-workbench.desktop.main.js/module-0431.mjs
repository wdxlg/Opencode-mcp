// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/viewLayout/lineHeights.ts
import { intersection } from "./module-0003.mjs";
import { binarySearch2 } from "./module-0007.mjs";


// src/vs/editor/common/viewLayout/lineHeights.ts
var CustomLine = class {
  constructor(decorationId, index2, lineNumber, specialHeight, prefixSum) {
    this.decorationId = decorationId;
    this.index = index2;
    this.lineNumber = lineNumber;
    this.specialHeight = Math.round(specialHeight);
    this.prefixSum = prefixSum;
    this.maximumSpecialHeight = Math.round(specialHeight);
    this.deleted = false;
  }
};

var LineHeightsManager = class {
  constructor(defaultLineHeight, customLineHeightData) {
    this._decorationIDToCustomLine = new ArrayMap2();
    this._orderedCustomLines = [];
    this._pendingChanges = [];
    this._invalidIndex = Infinity;
    this._hasPending = false;
    this._defaultLineHeight = defaultLineHeight;
    for (const data of customLineHeightData) {
      this.insertOrChangeCustomLineHeight(data.decorationId, data.startLineNumber, data.endLineNumber, data.lineHeight);
    }
  }
  set defaultLineHeight(defaultLineHeight) {
    this._defaultLineHeight = defaultLineHeight;
  }
  get defaultLineHeight() {
    return this._defaultLineHeight;
  }
  removeCustomLineHeight(decorationID) {
    this._pendingChanges.push({ kind: 1 /* Remove */, decorationId: decorationID });
    this._hasPending = true;
  }
  insertOrChangeCustomLineHeight(decorationId, startLineNumber, endLineNumber, lineHeight) {
    this._pendingChanges.push({ kind: 0 /* InsertOrChange */, decorationId, startLineNumber, endLineNumber, lineHeight });
    this._hasPending = true;
  }
  heightForLineNumber(lineNumber) {
    this._commit();
    const searchIndex = this._binarySearchOverOrderedCustomLinesArray(lineNumber);
    if (searchIndex >= 0) {
      return this._orderedCustomLines[searchIndex].maximumSpecialHeight;
    }
    return this._defaultLineHeight;
  }
  getAccumulatedLineHeightsIncludingLineNumber(lineNumber) {
    this._commit();
    const searchIndex = this._binarySearchOverOrderedCustomLinesArray(lineNumber);
    if (searchIndex >= 0) {
      return this._orderedCustomLines[searchIndex].prefixSum + this._orderedCustomLines[searchIndex].maximumSpecialHeight;
    }
    if (searchIndex === -1) {
      return this._defaultLineHeight * lineNumber;
    }
    const modifiedIndex = -(searchIndex + 1);
    const previousSpecialLine = this._orderedCustomLines[modifiedIndex - 1];
    return previousSpecialLine.prefixSum + previousSpecialLine.maximumSpecialHeight + this._defaultLineHeight * (lineNumber - previousSpecialLine.lineNumber);
  }
  onLinesDeleted(fromLineNumber, toLineNumber) {
    this._pendingChanges.push({ kind: 2 /* LinesDeleted */, fromLineNumber, toLineNumber });
    this._hasPending = true;
  }
  onLinesInserted(fromLineNumber, toLineNumber) {
    this._pendingChanges.push({ kind: 3 /* LinesInserted */, fromLineNumber, toLineNumber });
    this._hasPending = true;
  }
  _commit() {
    if (!this._hasPending) {
      return;
    }
    const changes = this._pendingChanges;
    this._pendingChanges = [];
    this._hasPending = false;
    const stagedInserts = [];
    const stagedIdMap = new ArrayMap2();
    for (const change of changes) {
      switch (change.kind) {
        case 1 /* Remove */:
          this._doRemoveCustomLineHeight(change.decorationId, stagedIdMap);
          break;
        case 0 /* InsertOrChange */:
          this._doInsertOrChangeCustomLineHeight(change.decorationId, change.startLineNumber, change.endLineNumber, change.lineHeight, stagedInserts, stagedIdMap);
          break;
        case 2 /* LinesDeleted */:
          this._flushStagedDecorationChanges(stagedInserts, stagedIdMap);
          this._doLinesDeleted(change.fromLineNumber, change.toLineNumber);
          break;
        case 3 /* LinesInserted */:
          this._flushStagedDecorationChanges(stagedInserts, stagedIdMap);
          this._doLinesInserted(change.fromLineNumber, change.toLineNumber, stagedInserts, stagedIdMap);
          break;
      }
    }
    this._flushStagedDecorationChanges(stagedInserts, stagedIdMap);
  }
  _doRemoveCustomLineHeight(decorationID, stagedIdMap) {
    const customLines = this._decorationIDToCustomLine.get(decorationID);
    if (customLines) {
      this._decorationIDToCustomLine.delete(decorationID);
      for (const customLine of customLines) {
        customLine.deleted = true;
        this._invalidIndex = Math.min(this._invalidIndex, customLine.index);
      }
    }
    const stagedLines = stagedIdMap.get(decorationID);
    if (stagedLines) {
      stagedIdMap.delete(decorationID);
      for (const line of stagedLines) {
        line.deleted = true;
      }
    }
  }
  _doInsertOrChangeCustomLineHeight(decorationId, startLineNumber, endLineNumber, lineHeight, stagedInserts, stagedIdMap) {
    this._doRemoveCustomLineHeight(decorationId, stagedIdMap);
    for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
      const customLine = new CustomLine(decorationId, -1, lineNumber, lineHeight, 0);
      stagedInserts.push(customLine);
      stagedIdMap.add(decorationId, customLine);
    }
  }
  _flushStagedDecorationChanges(stagedInserts, stagedIdMap) {
    if (stagedInserts.length === 0 && this._invalidIndex === Infinity) {
      return;
    }
    for (const pendingChange of stagedInserts) {
      if (pendingChange.deleted) {
        continue;
      }
      const candidateInsertionIndex = this._binarySearchOverOrderedCustomLinesArray(pendingChange.lineNumber);
      const insertionIndex = candidateInsertionIndex >= 0 ? candidateInsertionIndex : -(candidateInsertionIndex + 1);
      this._orderedCustomLines.splice(insertionIndex, 0, pendingChange);
      this._invalidIndex = Math.min(this._invalidIndex, insertionIndex);
    }
    stagedInserts.length = 0;
    stagedIdMap.clear();
    if (this._invalidIndex === Infinity) {
      return;
    }
    const newDecorationIDToSpecialLine = new ArrayMap2();
    const newOrderedSpecialLines = [];
    for (let i2 = 0; i2 < this._invalidIndex; i2++) {
      const customLine = this._orderedCustomLines[i2];
      newOrderedSpecialLines.push(customLine);
      newDecorationIDToSpecialLine.add(customLine.decorationId, customLine);
    }
    let numberOfDeletions = 0;
    let previousSpecialLine = this._invalidIndex > 0 ? newOrderedSpecialLines[this._invalidIndex - 1] : void 0;
    for (let i2 = this._invalidIndex; i2 < this._orderedCustomLines.length; i2++) {
      const customLine = this._orderedCustomLines[i2];
      if (customLine.deleted) {
        numberOfDeletions++;
        continue;
      }
      customLine.index = i2 - numberOfDeletions;
      if (previousSpecialLine && previousSpecialLine.lineNumber === customLine.lineNumber) {
        customLine.maximumSpecialHeight = previousSpecialLine.maximumSpecialHeight;
        customLine.prefixSum = previousSpecialLine.prefixSum;
      } else {
        let maximumSpecialHeight = customLine.specialHeight;
        for (let j = i2; j < this._orderedCustomLines.length; j++) {
          const nextSpecialLine = this._orderedCustomLines[j];
          if (nextSpecialLine.deleted) {
            continue;
          }
          if (nextSpecialLine.lineNumber !== customLine.lineNumber) {
            break;
          }
          maximumSpecialHeight = Math.max(maximumSpecialHeight, nextSpecialLine.specialHeight);
        }
        customLine.maximumSpecialHeight = maximumSpecialHeight;
        let prefixSum;
        if (previousSpecialLine) {
          prefixSum = previousSpecialLine.prefixSum + previousSpecialLine.maximumSpecialHeight + this._defaultLineHeight * (customLine.lineNumber - previousSpecialLine.lineNumber - 1);
        } else {
          prefixSum = this._defaultLineHeight * (customLine.lineNumber - 1);
        }
        customLine.prefixSum = prefixSum;
      }
      previousSpecialLine = customLine;
      newOrderedSpecialLines.push(customLine);
      newDecorationIDToSpecialLine.add(customLine.decorationId, customLine);
    }
    this._orderedCustomLines = newOrderedSpecialLines;
    this._decorationIDToCustomLine = newDecorationIDToSpecialLine;
    this._invalidIndex = Infinity;
  }
  _doLinesDeleted(fromLineNumber, toLineNumber) {
    const deleteCount = toLineNumber - fromLineNumber + 1;
    const numberOfCustomLines = this._orderedCustomLines.length;
    const candidateStartIndexOfDeletion = this._binarySearchOverOrderedCustomLinesArray(fromLineNumber);
    let startIndexOfDeletion;
    if (candidateStartIndexOfDeletion >= 0) {
      startIndexOfDeletion = candidateStartIndexOfDeletion;
      for (let i2 = candidateStartIndexOfDeletion - 1; i2 >= 0; i2--) {
        if (this._orderedCustomLines[i2].lineNumber === fromLineNumber) {
          startIndexOfDeletion--;
        } else {
          break;
        }
      }
    } else {
      startIndexOfDeletion = candidateStartIndexOfDeletion === -(numberOfCustomLines + 1) && candidateStartIndexOfDeletion !== -1 ? numberOfCustomLines - 1 : -(candidateStartIndexOfDeletion + 1);
    }
    const candidateEndIndexOfDeletion = this._binarySearchOverOrderedCustomLinesArray(toLineNumber);
    let endIndexOfDeletion;
    if (candidateEndIndexOfDeletion >= 0) {
      endIndexOfDeletion = candidateEndIndexOfDeletion;
      for (let i2 = candidateEndIndexOfDeletion + 1; i2 < numberOfCustomLines; i2++) {
        if (this._orderedCustomLines[i2].lineNumber === toLineNumber) {
          endIndexOfDeletion++;
        } else {
          break;
        }
      }
    } else {
      endIndexOfDeletion = candidateEndIndexOfDeletion === -(numberOfCustomLines + 1) && candidateEndIndexOfDeletion !== -1 ? numberOfCustomLines - 1 : -(candidateEndIndexOfDeletion + 1);
    }
    const isEndIndexBiggerThanStartIndex = endIndexOfDeletion > startIndexOfDeletion;
    const isEndIndexEqualToStartIndexAndCoversCustomLine = endIndexOfDeletion === startIndexOfDeletion && this._orderedCustomLines[startIndexOfDeletion] && this._orderedCustomLines[startIndexOfDeletion].lineNumber >= fromLineNumber && this._orderedCustomLines[startIndexOfDeletion].lineNumber <= toLineNumber;
    if (isEndIndexBiggerThanStartIndex || isEndIndexEqualToStartIndexAndCoversCustomLine) {
      let maximumSpecialHeightOnDeletedInterval = 0;
      for (let i2 = startIndexOfDeletion; i2 <= endIndexOfDeletion; i2++) {
        maximumSpecialHeightOnDeletedInterval = Math.max(maximumSpecialHeightOnDeletedInterval, this._orderedCustomLines[i2].maximumSpecialHeight);
      }
      let prefixSumOnDeletedInterval = 0;
      if (startIndexOfDeletion > 0) {
        const previousSpecialLine = this._orderedCustomLines[startIndexOfDeletion - 1];
        prefixSumOnDeletedInterval = previousSpecialLine.prefixSum + previousSpecialLine.maximumSpecialHeight + this._defaultLineHeight * (fromLineNumber - previousSpecialLine.lineNumber - 1);
      } else {
        prefixSumOnDeletedInterval = fromLineNumber > 0 ? (fromLineNumber - 1) * this._defaultLineHeight : 0;
      }
      const firstSpecialLineDeleted = this._orderedCustomLines[startIndexOfDeletion];
      const lastSpecialLineDeleted = this._orderedCustomLines[endIndexOfDeletion];
      const firstSpecialLineAfterDeletion = this._orderedCustomLines[endIndexOfDeletion + 1];
      const heightOfFirstLineAfterDeletion = firstSpecialLineAfterDeletion && firstSpecialLineAfterDeletion.lineNumber === toLineNumber + 1 ? firstSpecialLineAfterDeletion.maximumSpecialHeight : this._defaultLineHeight;
      const totalHeightDeleted = lastSpecialLineDeleted.prefixSum + lastSpecialLineDeleted.maximumSpecialHeight - firstSpecialLineDeleted.prefixSum + this._defaultLineHeight * (toLineNumber - lastSpecialLineDeleted.lineNumber) + this._defaultLineHeight * (firstSpecialLineDeleted.lineNumber - fromLineNumber) + heightOfFirstLineAfterDeletion - maximumSpecialHeightOnDeletedInterval;
      const decorationIdsSeen = /* @__PURE__ */ new Set();
      const newOrderedCustomLines = [];
      const newDecorationIDToSpecialLine = new ArrayMap2();
      let numberOfDeletions = 0;
      for (let i2 = 0; i2 < this._orderedCustomLines.length; i2++) {
        const customLine = this._orderedCustomLines[i2];
        if (i2 < startIndexOfDeletion) {
          newOrderedCustomLines.push(customLine);
          newDecorationIDToSpecialLine.add(customLine.decorationId, customLine);
        } else if (i2 >= startIndexOfDeletion && i2 <= endIndexOfDeletion) {
          const decorationId = customLine.decorationId;
          if (!decorationIdsSeen.has(decorationId)) {
            customLine.index -= numberOfDeletions;
            customLine.lineNumber = fromLineNumber;
            customLine.prefixSum = prefixSumOnDeletedInterval;
            customLine.maximumSpecialHeight = maximumSpecialHeightOnDeletedInterval;
            newOrderedCustomLines.push(customLine);
            newDecorationIDToSpecialLine.add(customLine.decorationId, customLine);
          } else {
            numberOfDeletions++;
          }
        } else if (i2 > endIndexOfDeletion) {
          customLine.index -= numberOfDeletions;
          customLine.lineNumber -= deleteCount;
          customLine.prefixSum -= totalHeightDeleted;
          newOrderedCustomLines.push(customLine);
          newDecorationIDToSpecialLine.add(customLine.decorationId, customLine);
        }
        decorationIdsSeen.add(customLine.decorationId);
      }
      this._orderedCustomLines = newOrderedCustomLines;
      this._decorationIDToCustomLine = newDecorationIDToSpecialLine;
    } else {
      const totalHeightDeleted = deleteCount * this._defaultLineHeight;
      for (let i2 = endIndexOfDeletion; i2 < this._orderedCustomLines.length; i2++) {
        const customLine = this._orderedCustomLines[i2];
        if (customLine.lineNumber > toLineNumber) {
          customLine.lineNumber -= deleteCount;
          customLine.prefixSum -= totalHeightDeleted;
        }
      }
    }
  }
  _doLinesInserted(fromLineNumber, toLineNumber, stagedInserts, stagedIdMap) {
    const insertCount = toLineNumber - fromLineNumber + 1;
    const candidateStartIndexOfInsertion = this._binarySearchOverOrderedCustomLinesArray(fromLineNumber);
    let startIndexOfInsertion;
    if (candidateStartIndexOfInsertion >= 0) {
      startIndexOfInsertion = candidateStartIndexOfInsertion;
      for (let i2 = candidateStartIndexOfInsertion - 1; i2 >= 0; i2--) {
        if (this._orderedCustomLines[i2].lineNumber === fromLineNumber) {
          startIndexOfInsertion--;
        } else {
          break;
        }
      }
    } else {
      startIndexOfInsertion = -(candidateStartIndexOfInsertion + 1);
    }
    const toReAdd = [];
    const decorationsImmediatelyAfter = /* @__PURE__ */ new Set();
    for (let i2 = startIndexOfInsertion; i2 < this._orderedCustomLines.length; i2++) {
      if (this._orderedCustomLines[i2].lineNumber === fromLineNumber) {
        decorationsImmediatelyAfter.add(this._orderedCustomLines[i2].decorationId);
      }
    }
    const decorationsImmediatelyBefore = /* @__PURE__ */ new Set();
    for (let i2 = startIndexOfInsertion - 1; i2 >= 0; i2--) {
      if (this._orderedCustomLines[i2].lineNumber === fromLineNumber - 1) {
        decorationsImmediatelyBefore.add(this._orderedCustomLines[i2].decorationId);
      }
    }
    const decorationsWithGaps = intersection(decorationsImmediatelyBefore, decorationsImmediatelyAfter);
    const prefixSumToAdd = insertCount * this._defaultLineHeight;
    for (let i2 = startIndexOfInsertion; i2 < this._orderedCustomLines.length; i2++) {
      this._orderedCustomLines[i2].lineNumber += insertCount;
      this._orderedCustomLines[i2].prefixSum += prefixSumToAdd;
    }
    if (decorationsWithGaps.size > 0) {
      for (const decorationId of decorationsWithGaps) {
        const decoration3 = this._decorationIDToCustomLine.get(decorationId);
        if (decoration3) {
          const startLineNumber = decoration3.reduce((min, l) => Math.min(min, l.lineNumber), fromLineNumber);
          const endLineNumber = decoration3.reduce((max, l) => Math.max(max, l.lineNumber), fromLineNumber);
          const lineHeight = decoration3.reduce((max, l) => Math.max(max, l.specialHeight), 0);
          toReAdd.push({
            decorationId,
            startLineNumber,
            endLineNumber,
            lineHeight
          });
        }
      }
      for (const dec of toReAdd) {
        this._doInsertOrChangeCustomLineHeight(dec.decorationId, dec.startLineNumber, dec.endLineNumber, dec.lineHeight, stagedInserts, stagedIdMap);
      }
    }
  }
  _binarySearchOverOrderedCustomLinesArray(lineNumber) {
    return binarySearch2(this._orderedCustomLines.length, (index2) => {
      const line = this._orderedCustomLines[index2];
      if (line.lineNumber === lineNumber) {
        return 0;
      } else if (line.lineNumber < lineNumber) {
        return -1;
      } else {
        return 1;
      }
    });
  }
};

var CustomLineHeightData = class _CustomLineHeightData {
  constructor(decorationId, startLineNumber, endLineNumber, lineHeight) {
    this.decorationId = decorationId;
    this.startLineNumber = startLineNumber;
    this.endLineNumber = endLineNumber;
    this.lineHeight = lineHeight;
  }
  static fromDecorations(decorations, coordinatesConverter, configuration2) {
    const defaultLineHeight = configuration2.options.get(75 /* lineHeight */);
    return decorations.map((d) => {
      const viewRange = coordinatesConverter.convertModelRangeToViewRange(d.range);
      return new _CustomLineHeightData(
        d.id,
        viewRange.startLineNumber,
        viewRange.endLineNumber,
        d.options.lineHeight ? d.options.lineHeight * defaultLineHeight : 0
      );
    });
  }
};

var ArrayMap2 = class {
  constructor() {
    this._map = /* @__PURE__ */ new Map();
  }
  add(key3, value2) {
    const array3 = this._map.get(key3);
    if (!array3) {
      this._map.set(key3, [value2]);
    } else {
      array3.push(value2);
    }
  }
  get(key3) {
    return this._map.get(key3);
  }
  delete(key3) {
    this._map.delete(key3);
  }
  clear() {
    this._map.clear();
  }
};
export { CustomLine, LineHeightsManager, CustomLineHeightData, ArrayMap2 };
