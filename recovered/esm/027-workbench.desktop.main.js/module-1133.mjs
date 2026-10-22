// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/model/rangeUtils.ts
import { TextLength } from "./module-0175.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/model/rangeUtils.ts
function rangeContainsPosition(range2, position2) {
  if (position2.lineNumber < range2.startLineNumber || position2.lineNumber > range2.endLineNumber) {
    return false;
  }
  if (position2.lineNumber === range2.startLineNumber && position2.column < range2.startColumn) {
    return false;
  }
  if (position2.lineNumber === range2.endLineNumber && position2.column >= range2.endColumn) {
    return false;
  }
  return true;
}

function lengthOfRange(range2) {
  if (range2.startLineNumber === range2.endLineNumber) {
    return new TextLength(0, range2.endColumn - range2.startColumn);
  } else {
    return new TextLength(range2.endLineNumber - range2.startLineNumber, range2.endColumn - 1);
  }
}

function lengthBetweenPositions2(position1, position2) {
  if (position1.lineNumber === position2.lineNumber) {
    return new TextLength(0, position2.column - position1.column);
  } else {
    return new TextLength(position2.lineNumber - position1.lineNumber, position2.column - 1);
  }
}

function addLength(position2, length) {
  if (length.lineCount === 0) {
    return new Position(position2.lineNumber, position2.column + length.columnCount);
  } else {
    return new Position(position2.lineNumber + length.lineCount, length.columnCount + 1);
  }
}

function rangeIsBeforeOrTouching(range2, other) {
  return range2.endLineNumber < other.startLineNumber || range2.endLineNumber === other.startLineNumber && range2.endColumn <= other.startColumn;
}
export { rangeContainsPosition, lengthOfRange, lengthBetweenPositions2, addLength, rangeIsBeforeOrTouching };
