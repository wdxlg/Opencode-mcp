// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/model/mapping.ts
import { BugIndicatingError } from "./module-0004.mjs";
import { MergeEditorLineRange } from "./module-1130.mjs";
import { assertFn, checkAdjacentItems } from "./module-0009.mjs";
import { findLast } from "./module-0006.mjs";
import { compareBy, concatArrays, numberComparator } from "./module-0007.mjs";
import { LineRangeEdit } from "./module-1132.mjs";
import { Range2 } from "./module-0106.mjs";
import { addLength, lengthBetweenPositions2, rangeContainsPosition, rangeIsBeforeOrTouching } from "./module-1133.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/model/mapping.ts
var LineRangeMapping2 = class _LineRangeMapping {
  constructor(inputRange, outputRange) {
    this.inputRange = inputRange;
    this.outputRange = outputRange;
  }
  static join(mappings) {
    return mappings.reduce((acc, cur) => acc ? acc.join(cur) : cur, void 0);
  }
  extendInputRange(extendedInputRange) {
    if (!extendedInputRange.containsRange(this.inputRange)) {
      throw new BugIndicatingError();
    }
    const startDelta = extendedInputRange.startLineNumber - this.inputRange.startLineNumber;
    const endDelta = extendedInputRange.endLineNumberExclusive - this.inputRange.endLineNumberExclusive;
    return new _LineRangeMapping(
      extendedInputRange,
      MergeEditorLineRange.fromLength(
        this.outputRange.startLineNumber + startDelta,
        this.outputRange.length - startDelta + endDelta
      )
    );
  }
  join(other) {
    return new _LineRangeMapping(
      this.inputRange.join(other.inputRange),
      this.outputRange.join(other.outputRange)
    );
  }
  get resultingDeltaFromOriginalToModified() {
    return this.outputRange.endLineNumberExclusive - this.inputRange.endLineNumberExclusive;
  }
  toString() {
    return `${this.inputRange.toString()} -> ${this.outputRange.toString()}`;
  }
  addOutputLineDelta(delta2) {
    return new _LineRangeMapping(
      this.inputRange,
      this.outputRange.delta(delta2)
    );
  }
  addInputLineDelta(delta2) {
    return new _LineRangeMapping(
      this.inputRange.delta(delta2),
      this.outputRange
    );
  }
  reverse() {
    return new _LineRangeMapping(this.outputRange, this.inputRange);
  }
};

var DocumentLineRangeMap = class _DocumentLineRangeMap {
  constructor(lineRangeMappings, inputLineCount) {
    this.lineRangeMappings = lineRangeMappings;
    this.inputLineCount = inputLineCount;
    assertFn(() => {
      return checkAdjacentItems(
        lineRangeMappings,
        (m1, m2) => m1.inputRange.isBefore(m2.inputRange) && m1.outputRange.isBefore(m2.outputRange) && m2.inputRange.startLineNumber - m1.inputRange.endLineNumberExclusive === m2.outputRange.startLineNumber - m1.outputRange.endLineNumberExclusive
      );
    });
  }
  static betweenOutputs(inputToOutput1, inputToOutput2, inputLineCount) {
    const alignments = MappingAlignment.compute(inputToOutput1, inputToOutput2);
    const mappings = alignments.map((m) => new LineRangeMapping2(m.output1Range, m.output2Range));
    return new _DocumentLineRangeMap(mappings, inputLineCount);
  }
  project(lineNumber) {
    const lastBefore = findLast(this.lineRangeMappings, (r2) => r2.inputRange.startLineNumber <= lineNumber);
    if (!lastBefore) {
      return new LineRangeMapping2(
        MergeEditorLineRange.fromLength(lineNumber, 1),
        MergeEditorLineRange.fromLength(lineNumber, 1)
      );
    }
    if (lastBefore.inputRange.contains(lineNumber)) {
      return lastBefore;
    }
    const containingRange = MergeEditorLineRange.fromLength(lineNumber, 1);
    const mappedRange = MergeEditorLineRange.fromLength(
      lineNumber + lastBefore.outputRange.endLineNumberExclusive - lastBefore.inputRange.endLineNumberExclusive,
      1
    );
    return new LineRangeMapping2(containingRange, mappedRange);
  }
  get outputLineCount() {
    const last = this.lineRangeMappings.at(-1);
    const diff4 = last ? last.outputRange.endLineNumberExclusive - last.inputRange.endLineNumberExclusive : 0;
    return this.inputLineCount + diff4;
  }
  reverse() {
    return new _DocumentLineRangeMap(
      this.lineRangeMappings.map((r2) => r2.reverse()),
      this.outputLineCount
    );
  }
};

var MappingAlignment = class _MappingAlignment {
  constructor(inputRange, output1Range, output1LineMappings, output2Range, output2LineMappings) {
    this.inputRange = inputRange;
    this.output1Range = output1Range;
    this.output1LineMappings = output1LineMappings;
    this.output2Range = output2Range;
    this.output2LineMappings = output2LineMappings;
  }
  static compute(fromInputToOutput1, fromInputToOutput2) {
    const compareByStartLineNumber = compareBy(
      (d) => d.inputRange.startLineNumber,
      numberComparator
    );
    const combinedDiffs = concatArrays(
      fromInputToOutput1.map((diff4) => ({ source: 0, diff: diff4 })),
      fromInputToOutput2.map((diff4) => ({ source: 1, diff: diff4 }))
    ).sort(compareBy((d) => d.diff, compareByStartLineNumber));
    const currentDiffs = [new Array(), new Array()];
    const deltaFromBaseToInput = [0, 0];
    const alignments = new Array();
    function pushAndReset(inputRange) {
      const mapping1 = LineRangeMapping2.join(currentDiffs[0]) || new LineRangeMapping2(inputRange, inputRange.delta(deltaFromBaseToInput[0]));
      const mapping2 = LineRangeMapping2.join(currentDiffs[1]) || new LineRangeMapping2(inputRange, inputRange.delta(deltaFromBaseToInput[1]));
      alignments.push(
        new _MappingAlignment(
          currentInputRange,
          mapping1.extendInputRange(currentInputRange).outputRange,
          currentDiffs[0],
          mapping2.extendInputRange(currentInputRange).outputRange,
          currentDiffs[1]
        )
      );
      currentDiffs[0] = [];
      currentDiffs[1] = [];
    }
    let currentInputRange;
    for (const diff4 of combinedDiffs) {
      const range2 = diff4.diff.inputRange;
      if (currentInputRange && !currentInputRange.intersectsOrTouches(range2)) {
        pushAndReset(currentInputRange);
        currentInputRange = void 0;
      }
      deltaFromBaseToInput[diff4.source] = diff4.diff.resultingDeltaFromOriginalToModified;
      currentInputRange = currentInputRange ? currentInputRange.join(range2) : range2;
      currentDiffs[diff4.source].push(diff4.diff);
    }
    if (currentInputRange) {
      pushAndReset(currentInputRange);
    }
    return alignments;
  }
  toString() {
    return `${this.output1Range} <- ${this.inputRange} -> ${this.output2Range}`;
  }
};

var DetailedLineRangeMapping5 = class _DetailedLineRangeMapping extends LineRangeMapping2 {
  constructor(inputRange, inputTextModel, outputRange, outputTextModel, rangeMappings) {
    super(inputRange, outputRange);
    this.inputTextModel = inputTextModel;
    this.outputTextModel = outputTextModel;
    this.rangeMappings = rangeMappings || [new RangeMapping3(this.inputRange.toExclusiveRange(), this.outputRange.toExclusiveRange())];
  }
  static join(mappings) {
    return mappings.reduce((acc, cur) => acc ? acc.join(cur) : cur, void 0);
  }
  addOutputLineDelta(delta2) {
    return new _DetailedLineRangeMapping(
      this.inputRange,
      this.inputTextModel,
      this.outputRange.delta(delta2),
      this.outputTextModel,
      this.rangeMappings.map((d) => d.addOutputLineDelta(delta2))
    );
  }
  addInputLineDelta(delta2) {
    return new _DetailedLineRangeMapping(
      this.inputRange.delta(delta2),
      this.inputTextModel,
      this.outputRange,
      this.outputTextModel,
      this.rangeMappings.map((d) => d.addInputLineDelta(delta2))
    );
  }
  join(other) {
    return new _DetailedLineRangeMapping(
      this.inputRange.join(other.inputRange),
      this.inputTextModel,
      this.outputRange.join(other.outputRange),
      this.outputTextModel
    );
  }
  getLineEdit() {
    return new LineRangeEdit(this.inputRange, this.getOutputLines());
  }
  getReverseLineEdit() {
    return new LineRangeEdit(this.outputRange, this.getInputLines());
  }
  getOutputLines() {
    return this.outputRange.getLines(this.outputTextModel);
  }
  getInputLines() {
    return this.inputRange.getLines(this.inputTextModel);
  }
};

var RangeMapping3 = class _RangeMapping {
  constructor(inputRange, outputRange) {
    this.inputRange = inputRange;
    this.outputRange = outputRange;
  }
  toString() {
    function rangeToString(range2) {
      return `[${range2.startLineNumber}:${range2.startColumn}, ${range2.endLineNumber}:${range2.endColumn})`;
    }
    return `${rangeToString(this.inputRange)} -> ${rangeToString(this.outputRange)}`;
  }
  addOutputLineDelta(deltaLines) {
    return new _RangeMapping(
      this.inputRange,
      new Range2(
        this.outputRange.startLineNumber + deltaLines,
        this.outputRange.startColumn,
        this.outputRange.endLineNumber + deltaLines,
        this.outputRange.endColumn
      )
    );
  }
  addInputLineDelta(deltaLines) {
    return new _RangeMapping(
      new Range2(
        this.inputRange.startLineNumber + deltaLines,
        this.inputRange.startColumn,
        this.inputRange.endLineNumber + deltaLines,
        this.inputRange.endColumn
      ),
      this.outputRange
    );
  }
  reverse() {
    return new _RangeMapping(this.outputRange, this.inputRange);
  }
};

var DocumentRangeMap = class _DocumentRangeMap {
  constructor(rangeMappings, inputLineCount) {
    this.rangeMappings = rangeMappings;
    this.inputLineCount = inputLineCount;
    assertFn(() => checkAdjacentItems(
      rangeMappings,
      (m1, m2) => rangeIsBeforeOrTouching(m1.inputRange, m2.inputRange) && rangeIsBeforeOrTouching(m1.outputRange, m2.outputRange)
      /*&&
      lengthBetweenPositions(m1.inputRange.getEndPosition(), m2.inputRange.getStartPosition()).equals(
      	lengthBetweenPositions(m1.outputRange.getEndPosition(), m2.outputRange.getStartPosition())
      )*/
    ));
  }
  project(position2) {
    const lastBefore = findLast(this.rangeMappings, (r2) => r2.inputRange.getStartPosition().isBeforeOrEqual(position2));
    if (!lastBefore) {
      return new RangeMapping3(
        Range2.fromPositions(position2, position2),
        Range2.fromPositions(position2, position2)
      );
    }
    if (rangeContainsPosition(lastBefore.inputRange, position2)) {
      return lastBefore;
    }
    const dist = lengthBetweenPositions2(lastBefore.inputRange.getEndPosition(), position2);
    const outputPos = addLength(lastBefore.outputRange.getEndPosition(), dist);
    return new RangeMapping3(
      Range2.fromPositions(position2),
      Range2.fromPositions(outputPos)
    );
  }
  projectRange(range2) {
    const start = this.project(range2.getStartPosition());
    const end = this.project(range2.getEndPosition());
    return new RangeMapping3(
      start.inputRange.plusRange(end.inputRange),
      start.outputRange.plusRange(end.outputRange)
    );
  }
  get outputLineCount() {
    const last = this.rangeMappings.at(-1);
    const diff4 = last ? last.outputRange.endLineNumber - last.inputRange.endLineNumber : 0;
    return this.inputLineCount + diff4;
  }
  reverse() {
    return new _DocumentRangeMap(
      this.rangeMappings.map((m) => m.reverse()),
      this.outputLineCount
    );
  }
};
export { LineRangeMapping2, DocumentLineRangeMap, MappingAlignment, DetailedLineRangeMapping5, RangeMapping3, DocumentRangeMap };
