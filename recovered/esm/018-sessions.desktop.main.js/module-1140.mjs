// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/model/modifiedBaseRange.ts
import { DetailedLineRangeMapping5, MappingAlignment } from "./module-1135.mjs";
import { compareBy, concatArrays, equals, numberComparator, tieBreakComparators } from "./module-0007.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { Range2 } from "./module-0106.mjs";
import { LineRangeEdit, RangeEdit } from "./module-1133.mjs";
import { Position } from "./module-0079.mjs";
import { splitLines } from "./module-0030.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/model/modifiedBaseRange.ts
var ModifiedBaseRange = class _ModifiedBaseRange {
  constructor(baseRange, baseTextModel, input1Range, input1TextModel, input1Diffs, input2Range, input2TextModel, input2Diffs) {
    this.baseRange = baseRange;
    this.baseTextModel = baseTextModel;
    this.input1Range = input1Range;
    this.input1TextModel = input1TextModel;
    this.input1Diffs = input1Diffs;
    this.input2Range = input2Range;
    this.input2TextModel = input2TextModel;
    this.input2Diffs = input2Diffs;
    this.input1CombinedDiff = DetailedLineRangeMapping5.join(this.input1Diffs);
    this.input2CombinedDiff = DetailedLineRangeMapping5.join(this.input2Diffs);
    this.isEqualChange = equals(this.input1Diffs, this.input2Diffs, (a, b) => a.getLineEdit().equals(b.getLineEdit()));
    this.smartInput1LineRangeEdit = null;
    this.smartInput2LineRangeEdit = null;
    this.dumbInput1LineRangeEdit = null;
    this.dumbInput2LineRangeEdit = null;
    if (this.input1Diffs.length === 0 && this.input2Diffs.length === 0) {
      throw new BugIndicatingError("must have at least one diff");
    }
  }
  static fromDiffs(diffs1, diffs2, baseTextModel, input1TextModel, input2TextModel) {
    const alignments = MappingAlignment.compute(diffs1, diffs2);
    return alignments.map(
      (a) => new _ModifiedBaseRange(
        a.inputRange,
        baseTextModel,
        a.output1Range,
        input1TextModel,
        a.output1LineMappings,
        a.output2Range,
        input2TextModel,
        a.output2LineMappings
      )
    );
  }
  getInputRange(inputNumber) {
    return inputNumber === 1 ? this.input1Range : this.input2Range;
  }
  getInputCombinedDiff(inputNumber) {
    return inputNumber === 1 ? this.input1CombinedDiff : this.input2CombinedDiff;
  }
  getInputDiffs(inputNumber) {
    return inputNumber === 1 ? this.input1Diffs : this.input2Diffs;
  }
  get isConflicting() {
    return this.input1Diffs.length > 0 && this.input2Diffs.length > 0;
  }
  get canBeCombined() {
    return this.smartCombineInputs(1) !== void 0;
  }
  get isOrderRelevant() {
    const input1 = this.smartCombineInputs(1);
    const input2 = this.smartCombineInputs(2);
    if (!input1 || !input2) {
      return false;
    }
    return !input1.equals(input2);
  }
  getEditForBase(state) {
    const diffs = [];
    if (state.includesInput1 && this.input1CombinedDiff) {
      diffs.push({ diff: this.input1CombinedDiff, inputNumber: 1 });
    }
    if (state.includesInput2 && this.input2CombinedDiff) {
      diffs.push({ diff: this.input2CombinedDiff, inputNumber: 2 });
    }
    if (diffs.length === 0) {
      return { edit: void 0, effectiveState: ModifiedBaseRangeState.base };
    }
    if (diffs.length === 1) {
      return { edit: diffs[0].diff.getLineEdit(), effectiveState: ModifiedBaseRangeState.base.withInputValue(diffs[0].inputNumber, true, false) };
    }
    if (state.kind !== 3 /* both */) {
      throw new BugIndicatingError();
    }
    const smartCombinedEdit = state.smartCombination ? this.smartCombineInputs(state.firstInput) : this.dumbCombineInputs(state.firstInput);
    if (smartCombinedEdit) {
      return { edit: smartCombinedEdit, effectiveState: state };
    }
    return {
      edit: diffs[getOtherInputNumber(state.firstInput) - 1].diff.getLineEdit(),
      effectiveState: ModifiedBaseRangeState.base.withInputValue(
        getOtherInputNumber(state.firstInput),
        true,
        false
      )
    };
  }
  smartCombineInputs(firstInput) {
    if (firstInput === 1 && this.smartInput1LineRangeEdit !== null) {
      return this.smartInput1LineRangeEdit;
    } else if (firstInput === 2 && this.smartInput2LineRangeEdit !== null) {
      return this.smartInput2LineRangeEdit;
    }
    const combinedDiffs = concatArrays(
      this.input1Diffs.flatMap(
        (diffs) => diffs.rangeMappings.map((diff4) => ({ diff: diff4, input: 1 }))
      ),
      this.input2Diffs.flatMap(
        (diffs) => diffs.rangeMappings.map((diff4) => ({ diff: diff4, input: 2 }))
      )
    ).sort(
      tieBreakComparators(
        compareBy((d) => d.diff.inputRange, Range2.compareRangesUsingStarts),
        compareBy((d) => d.input === firstInput ? 1 : 2, numberComparator)
      )
    );
    const sortedEdits = combinedDiffs.map((d) => {
      const sourceTextModel = d.input === 1 ? this.input1TextModel : this.input2TextModel;
      return new RangeEdit(d.diff.inputRange, sourceTextModel.getValueInRange(d.diff.outputRange));
    });
    const result = editsToLineRangeEdit(this.baseRange, sortedEdits, this.baseTextModel);
    if (firstInput === 1) {
      this.smartInput1LineRangeEdit = result;
    } else {
      this.smartInput2LineRangeEdit = result;
    }
    return result;
  }
  dumbCombineInputs(firstInput) {
    if (firstInput === 1 && this.dumbInput1LineRangeEdit !== null) {
      return this.dumbInput1LineRangeEdit;
    } else if (firstInput === 2 && this.dumbInput2LineRangeEdit !== null) {
      return this.dumbInput2LineRangeEdit;
    }
    let input1Lines = this.input1Range.getLines(this.input1TextModel);
    let input2Lines = this.input2Range.getLines(this.input2TextModel);
    if (firstInput === 2) {
      [input1Lines, input2Lines] = [input2Lines, input1Lines];
    }
    const result = new LineRangeEdit(this.baseRange, input1Lines.concat(input2Lines));
    if (firstInput === 1) {
      this.dumbInput1LineRangeEdit = result;
    } else {
      this.dumbInput2LineRangeEdit = result;
    }
    return result;
  }
};

function editsToLineRangeEdit(range2, sortedEdits, textModel) {
  let text2 = "";
  const startsLineBefore = range2.startLineNumber > 1;
  let currentPosition = startsLineBefore ? new Position(
    range2.startLineNumber - 1,
    textModel.getLineMaxColumn(range2.startLineNumber - 1)
  ) : new Position(range2.startLineNumber, 1);
  for (const edit3 of sortedEdits) {
    const diffStart = edit3.range.getStartPosition();
    if (!currentPosition.isBeforeOrEqual(diffStart)) {
      return void 0;
    }
    let originalText2 = textModel.getValueInRange(Range2.fromPositions(currentPosition, diffStart));
    if (diffStart.lineNumber > textModel.getLineCount()) {
      originalText2 += "\n";
    }
    text2 += originalText2;
    text2 += edit3.newText;
    currentPosition = edit3.range.getEndPosition();
  }
  const endsLineAfter = range2.endLineNumberExclusive <= textModel.getLineCount();
  const end = endsLineAfter ? new Position(
    range2.endLineNumberExclusive,
    1
  ) : new Position(range2.endLineNumberExclusive - 1, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
  const originalText = textModel.getValueInRange(
    Range2.fromPositions(currentPosition, end)
  );
  text2 += originalText;
  const lines = splitLines(text2);
  if (startsLineBefore) {
    if (lines[0] !== "") {
      return void 0;
    }
    lines.shift();
  }
  if (endsLineAfter) {
    if (lines[lines.length - 1] !== "") {
      return void 0;
    }
    lines.pop();
  }
  return new LineRangeEdit(range2, lines);
}

function getOtherInputNumber(inputNumber) {
  return inputNumber === 1 ? 2 : 1;
}

var AbstractModifiedBaseRangeState = class {
  constructor() {
  }
  get includesInput1() {
    return false;
  }
  get includesInput2() {
    return false;
  }
  includesInput(inputNumber) {
    return inputNumber === 1 ? this.includesInput1 : this.includesInput2;
  }
  isInputIncluded(inputNumber) {
    return inputNumber === 1 ? this.includesInput1 : this.includesInput2;
  }
  toggle(inputNumber) {
    return this.withInputValue(inputNumber, !this.includesInput(inputNumber), true);
  }
  getInput(inputNumber) {
    if (!this.isInputIncluded(inputNumber)) {
      return 0 /* excluded */;
    }
    return 1 /* first */;
  }
};

var ModifiedBaseRangeStateBase = class extends AbstractModifiedBaseRangeState {
  get kind() {
    return 0 /* base */;
  }
  toString() {
    return "base";
  }
  swap() {
    return this;
  }
  withInputValue(inputNumber, value2, smartCombination = false) {
    if (inputNumber === 1) {
      return value2 ? new ModifiedBaseRangeStateInput1() : this;
    } else {
      return value2 ? new ModifiedBaseRangeStateInput2() : this;
    }
  }
  equals(other) {
    return other.kind === 0 /* base */;
  }
};

var ModifiedBaseRangeStateInput1 = class extends AbstractModifiedBaseRangeState {
  get kind() {
    return 1 /* input1 */;
  }
  get includesInput1() {
    return true;
  }
  toString() {
    return "1\u2713";
  }
  swap() {
    return new ModifiedBaseRangeStateInput2();
  }
  withInputValue(inputNumber, value2, smartCombination = false) {
    if (inputNumber === 1) {
      return value2 ? this : new ModifiedBaseRangeStateBase();
    } else {
      return value2 ? new ModifiedBaseRangeStateBoth(1, smartCombination) : new ModifiedBaseRangeStateInput2();
    }
  }
  equals(other) {
    return other.kind === 1 /* input1 */;
  }
};

var ModifiedBaseRangeStateInput2 = class _ModifiedBaseRangeStateInput2 extends AbstractModifiedBaseRangeState {
  get kind() {
    return 2 /* input2 */;
  }
  get includesInput2() {
    return true;
  }
  toString() {
    return "2\u2713";
  }
  swap() {
    return new ModifiedBaseRangeStateInput1();
  }
  withInputValue(inputNumber, value2, smartCombination = false) {
    if (inputNumber === 2) {
      return value2 ? this : new ModifiedBaseRangeStateBase();
    } else {
      return value2 ? new ModifiedBaseRangeStateBoth(2, smartCombination) : new _ModifiedBaseRangeStateInput2();
    }
  }
  equals(other) {
    return other.kind === 2 /* input2 */;
  }
};

var ModifiedBaseRangeStateBoth = class _ModifiedBaseRangeStateBoth extends AbstractModifiedBaseRangeState {
  constructor(firstInput, smartCombination) {
    super();
    this.firstInput = firstInput;
    this.smartCombination = smartCombination;
  }
  get kind() {
    return 3 /* both */;
  }
  get includesInput1() {
    return true;
  }
  get includesInput2() {
    return true;
  }
  toString() {
    return "2\u2713";
  }
  swap() {
    return new _ModifiedBaseRangeStateBoth(getOtherInputNumber(this.firstInput), this.smartCombination);
  }
  withInputValue(inputNumber, value2, smartCombination = false) {
    if (value2) {
      return this;
    }
    return inputNumber === 1 ? new ModifiedBaseRangeStateInput2() : new ModifiedBaseRangeStateInput1();
  }
  equals(other) {
    return other.kind === 3 /* both */ && this.firstInput === other.firstInput && this.smartCombination === other.smartCombination;
  }
  getInput(inputNumber) {
    return inputNumber === this.firstInput ? 1 /* first */ : 2 /* second */;
  }
};

var ModifiedBaseRangeStateUnrecognized = class extends AbstractModifiedBaseRangeState {
  get kind() {
    return 4 /* unrecognized */;
  }
  toString() {
    return "unrecognized";
  }
  swap() {
    return this;
  }
  withInputValue(inputNumber, value2, smartCombination = false) {
    if (!value2) {
      return this;
    }
    return inputNumber === 1 ? new ModifiedBaseRangeStateInput1() : new ModifiedBaseRangeStateInput2();
  }
  equals(other) {
    return other.kind === 4 /* unrecognized */;
  }
};

var ModifiedBaseRangeState;

((ModifiedBaseRangeState3) => {
  ModifiedBaseRangeState3.base = new ModifiedBaseRangeStateBase();
  ModifiedBaseRangeState3.unrecognized = new ModifiedBaseRangeStateUnrecognized();
})(ModifiedBaseRangeState || (ModifiedBaseRangeState = {}));
export { editsToLineRangeEdit, getOtherInputNumber, ModifiedBaseRange, AbstractModifiedBaseRangeState, ModifiedBaseRangeStateBase, ModifiedBaseRangeStateInput1, ModifiedBaseRangeStateInput2, ModifiedBaseRangeStateBoth, ModifiedBaseRangeStateUnrecognized, ModifiedBaseRangeState };
