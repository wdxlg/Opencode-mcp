// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length.ts
import { TextLength } from "./module-0175.mjs";
import { Range2 } from "./module-0106.mjs";
import { splitLines } from "./module-0030.mjs";


// src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length.ts
function lengthDiff(startLineCount, startColumnCount, endLineCount, endColumnCount) {
  return startLineCount !== endLineCount ? toLength(endLineCount - startLineCount, endColumnCount) : toLength(0, endColumnCount - startColumnCount);
}

var lengthZero = 0;

function lengthIsZero(length) {
  return length === 0;
}

var factor = 2 ** 26;

function toLength(lineCount, columnCount) {
  return lineCount * factor + columnCount;
}

function lengthToObj(length) {
  const l = length;
  const lineCount = Math.floor(l / factor);
  const columnCount = l - lineCount * factor;
  return new TextLength(lineCount, columnCount);
}

function lengthGetLineCount(length) {
  return Math.floor(length / factor);
}

function lengthGetColumnCountIfZeroLineCount(length) {
  return length;
}

function lengthAdd(l1, l2) {
  let r2 = l1 + l2;
  if (l2 >= factor) {
    r2 = r2 - l1 % factor;
  }
  return r2;
}

function sumLengths(items, lengthFn) {
  return items.reduce((a, b) => lengthAdd(a, lengthFn(b)), lengthZero);
}

function lengthEquals(length1, length2) {
  return length1 === length2;
}

function lengthDiffNonNegative(length1, length2) {
  const l1 = length1;
  const l2 = length2;
  const diff4 = l2 - l1;
  if (diff4 <= 0) {
    return lengthZero;
  }
  const lineCount1 = Math.floor(l1 / factor);
  const lineCount2 = Math.floor(l2 / factor);
  const colCount2 = l2 - lineCount2 * factor;
  if (lineCount1 === lineCount2) {
    const colCount1 = l1 - lineCount1 * factor;
    return toLength(0, colCount2 - colCount1);
  } else {
    return toLength(lineCount2 - lineCount1, colCount2);
  }
}

function lengthLessThan(length1, length2) {
  return length1 < length2;
}

function lengthLessThanEqual(length1, length2) {
  return length1 <= length2;
}

function lengthGreaterThanEqual(length1, length2) {
  return length1 >= length2;
}

function positionToLength(position2) {
  return toLength(position2.lineNumber - 1, position2.column - 1);
}

function lengthsToRange(lengthStart, lengthEnd) {
  const l = lengthStart;
  const lineCount = Math.floor(l / factor);
  const colCount = l - lineCount * factor;
  const l2 = lengthEnd;
  const lineCount2 = Math.floor(l2 / factor);
  const colCount2 = l2 - lineCount2 * factor;
  return new Range2(lineCount + 1, colCount + 1, lineCount2 + 1, colCount2 + 1);
}

function lengthOfString(str) {
  const lines = splitLines(str);
  return toLength(lines.length - 1, lines[lines.length - 1].length);
}
export { lengthDiff, lengthIsZero, toLength, lengthToObj, lengthGetLineCount, lengthGetColumnCountIfZeroLineCount, lengthAdd, sumLengths, lengthEquals, lengthDiffNonNegative, lengthLessThan, lengthLessThanEqual, lengthGreaterThanEqual, positionToLength, lengthsToRange, lengthOfString, lengthZero, factor };
