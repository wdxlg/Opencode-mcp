// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/model/textModelDiffs.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { ReentrancyBarrier } from "./module-1136.mjs";
import { observableSignal } from "./module-0058.mjs";
import { autorun } from "./module-0052.mjs";
import { transaction } from "./module-0045.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { compareBy, numberComparator } from "./module-0007.mjs";
import { DetailedLineRangeMapping5 } from "./module-1134.mjs";
import { MergeEditorLineRange } from "./module-1130.mjs";
import { LineRangeEdit } from "./module-1132.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/model/textModelDiffs.ts
var TextModelDiffs = class extends Disposable {
  constructor(baseTextModel, textModel, diffComputer) {
    super();
    this.baseTextModel = baseTextModel;
    this.textModel = textModel;
    this.diffComputer = diffComputer;
    this._recomputeCount = 0;
    this._state = observableValue(this, 1 /* initializing */);
    this._diffs = observableValue(this, []);
    this._barrier = new ReentrancyBarrier();
    this._isDisposed = false;
    this._isInitializing = true;
    const recomputeSignal = observableSignal("recompute");
    this._register(autorun((reader) => {
      recomputeSignal.read(reader);
      this._recompute(reader);
    }));
    this._register(
      baseTextModel.onDidChangeContent(
        this._barrier.makeExclusiveOrSkip(() => {
          recomputeSignal.trigger(void 0);
        })
      )
    );
    this._register(
      textModel.onDidChangeContent(
        this._barrier.makeExclusiveOrSkip(() => {
          recomputeSignal.trigger(void 0);
        })
      )
    );
    this._register(toDisposable(() => {
      this._isDisposed = true;
    }));
  }
  get isApplyingChange() {
    return this._barrier.isOccupied;
  }
  get state() {
    return this._state;
  }
  /**
   * Diffs from base to input.
  */
  get diffs() {
    return this._diffs;
  }
  _recompute(reader) {
    this._recomputeCount++;
    const currentRecomputeIdx = this._recomputeCount;
    if (this._state.get() === 1 /* initializing */) {
      this._isInitializing = true;
    }
    transaction((tx) => {
      this._state.set(
        this._isInitializing ? 1 /* initializing */ : 3 /* updating */,
        tx,
        0 /* other */
      );
    });
    const result = this.diffComputer.computeDiff(this.baseTextModel, this.textModel, reader);
    result.then((result2) => {
      if (this._isDisposed) {
        return;
      }
      if (currentRecomputeIdx !== this._recomputeCount) {
        return;
      }
      transaction((tx) => {
        if (result2.diffs) {
          this._state.set(2 /* upToDate */, tx, 1 /* textChange */);
          this._diffs.set(result2.diffs, tx, 1 /* textChange */);
        } else {
          this._state.set(4 /* error */, tx, 1 /* textChange */);
        }
        this._isInitializing = false;
      });
    });
  }
  ensureUpToDate() {
    if (this.state.get() !== 2 /* upToDate */) {
      throw new BugIndicatingError("Cannot remove diffs when the model is not up to date");
    }
  }
  removeDiffs(diffToRemoves, transaction2, group2) {
    this.ensureUpToDate();
    diffToRemoves.sort(compareBy((d) => d.inputRange.startLineNumber, numberComparator));
    diffToRemoves.reverse();
    const diffs = this._diffs.get();
    const toRemoveSet = new Set(diffToRemoves);
    if (toRemoveSet.size !== diffToRemoves.length) {
      throw new BugIndicatingError();
    }
    const diffsSet = new Set(diffs);
    for (const d of diffToRemoves) {
      if (!diffsSet.has(d)) {
        throw new BugIndicatingError();
      }
    }
    for (const diffToRemove of diffToRemoves) {
      this._barrier.runExclusivelyOrThrow(() => {
        const edits = diffToRemove.getReverseLineEdit().toEdits(this.textModel.getLineCount());
        this.textModel.pushEditOperations(null, edits, () => null, group2);
      });
    }
    let cumulativeDelta = 0;
    const newDiffs = [];
    for (const d of diffs) {
      if (toRemoveSet.has(d)) {
        cumulativeDelta += d.inputRange.length - d.outputRange.length;
      } else {
        newDiffs.push(cumulativeDelta !== 0 ? d.addOutputLineDelta(cumulativeDelta) : d);
      }
    }
    this._diffs.set(newDiffs, transaction2, 0 /* other */);
  }
  /**
   * Edit must be conflict free.
   */
  applyEditRelativeToOriginal(edit3, transaction2, group2) {
    this.ensureUpToDate();
    const editMapping = new DetailedLineRangeMapping5(
      edit3.range,
      this.baseTextModel,
      MergeEditorLineRange.fromLength(edit3.range.startLineNumber, edit3.newLines.length),
      this.textModel
    );
    let firstAfter = false;
    let delta2 = 0;
    const newDiffs = new Array();
    for (const diff4 of this.diffs.get()) {
      if (diff4.inputRange.intersectsOrTouches(edit3.range)) {
        throw new BugIndicatingError("Edit must be conflict free.");
      } else if (diff4.inputRange.isAfter(edit3.range)) {
        if (!firstAfter) {
          firstAfter = true;
          newDiffs.push(editMapping.addOutputLineDelta(delta2));
        }
        newDiffs.push(diff4.addOutputLineDelta(edit3.newLines.length - edit3.range.length));
      } else {
        newDiffs.push(diff4);
      }
      if (!firstAfter) {
        delta2 += diff4.outputRange.length - diff4.inputRange.length;
      }
    }
    if (!firstAfter) {
      firstAfter = true;
      newDiffs.push(editMapping.addOutputLineDelta(delta2));
    }
    this._barrier.runExclusivelyOrThrow(() => {
      const edits = new LineRangeEdit(edit3.range.delta(delta2), edit3.newLines).toEdits(this.textModel.getLineCount());
      this.textModel.pushEditOperations(null, edits, () => null, group2);
    });
    this._diffs.set(newDiffs, transaction2, 0 /* other */);
  }
  findTouchingDiffs(baseRange) {
    return this.diffs.get().filter((d) => d.inputRange.intersectsOrTouches(baseRange));
  }
  getResultLine(lineNumber, reader) {
    let offset = 0;
    const diffs = reader ? this.diffs.read(reader) : this.diffs.get();
    for (const diff4 of diffs) {
      if (diff4.inputRange.contains(lineNumber) || diff4.inputRange.endLineNumberExclusive === lineNumber) {
        return diff4;
      } else if (diff4.inputRange.endLineNumberExclusive < lineNumber) {
        offset = diff4.resultingDeltaFromOriginalToModified;
      } else {
        break;
      }
    }
    return lineNumber + offset;
  }
  getResultLineRange(baseRange, reader) {
    let start = this.getResultLine(baseRange.startLineNumber, reader);
    if (typeof start !== "number") {
      start = start.outputRange.startLineNumber;
    }
    let endExclusive = this.getResultLine(baseRange.endLineNumberExclusive, reader);
    if (typeof endExclusive !== "number") {
      endExclusive = endExclusive.outputRange.endLineNumberExclusive;
    }
    return MergeEditorLineRange.fromLineNumbers(start, endExclusive);
  }
};
export { TextModelDiffs };
