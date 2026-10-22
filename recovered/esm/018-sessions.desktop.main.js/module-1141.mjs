// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/model/mergeEditorModel.ts
import { EditorModel } from "./module-1097.mjs";
import { TextModelDiffs } from "./module-1138.mjs";
import { derived } from "./module-0054.mjs";
import { ModifiedBaseRange, ModifiedBaseRangeState } from "./module-1140.mjs";
import { DocumentLineRangeMap, DocumentRangeMap, LineRangeMapping2 } from "./module-1135.mjs";
import { keepObserved } from "./module-0059.mjs";
import { waitForState } from "./module-0056.mjs";
import { autorunHandleChanges } from "./module-0052.mjs";
import { transaction } from "./module-0045.mjs";
import { Range2 } from "./module-0106.mjs";
import { MergeEditorLineRange } from "./module-1131.mjs";
import { leftJoin } from "./module-1139.mjs";
import { CompareResult, equals } from "./module-0007.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { IUndoRedoService, UndoRedoGroup } from "./module-0374.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { observableValue } from "./module-0048.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/model/mergeEditorModel.ts
var MergeEditorModel = class extends EditorModel {
  constructor(base, input1, input2, resultTextModel, diffComputer, options3, telemetry, languageService, undoRedoService) {
    super();
    this.base = base;
    this.input1 = input1;
    this.input2 = input2;
    this.resultTextModel = resultTextModel;
    this.diffComputer = diffComputer;
    this.options = options3;
    this.telemetry = telemetry;
    this.languageService = languageService;
    this.undoRedoService = undoRedoService;
    this.input1TextModelDiffs = this._register(new TextModelDiffs(this.base, this.input1.textModel, this.diffComputer));
    this.input2TextModelDiffs = this._register(new TextModelDiffs(this.base, this.input2.textModel, this.diffComputer));
    this.resultTextModelDiffs = this._register(new TextModelDiffs(this.base, this.resultTextModel, this.diffComputer));
    this.modifiedBaseRanges = derived(this, (reader) => {
      const input1Diffs = this.input1TextModelDiffs.diffs.read(reader);
      const input2Diffs = this.input2TextModelDiffs.diffs.read(reader);
      return ModifiedBaseRange.fromDiffs(input1Diffs, input2Diffs, this.base, this.input1.textModel, this.input2.textModel);
    });
    this.modifiedBaseRangeResultStates = derived(this, (reader) => {
      const map = new Map(
        this.modifiedBaseRanges.read(reader).map((s) => [
          s,
          new ModifiedBaseRangeData(s)
        ])
      );
      return map;
    });
    this.resultSnapshot = this.resultTextModel.createSnapshot();
    this.baseInput1Diffs = this.input1TextModelDiffs.diffs;
    this.baseInput2Diffs = this.input2TextModelDiffs.diffs;
    this.baseResultDiffs = this.resultTextModelDiffs.diffs;
    this.input1ResultMapping = derived(this, (reader) => {
      return this.getInputResultMapping(
        this.baseInput1Diffs.read(reader),
        this.baseResultDiffs.read(reader),
        this.input1.textModel.getLineCount()
      );
    });
    this.resultInput1Mapping = derived(this, (reader) => this.input1ResultMapping.read(reader).reverse());
    this.input2ResultMapping = derived(this, (reader) => {
      return this.getInputResultMapping(
        this.baseInput2Diffs.read(reader),
        this.baseResultDiffs.read(reader),
        this.input2.textModel.getLineCount()
      );
    });
    this.resultInput2Mapping = derived(this, (reader) => this.input2ResultMapping.read(reader).reverse());
    this.baseResultMapping = derived(this, (reader) => {
      const map = new DocumentLineRangeMap(this.baseResultDiffs.read(reader), -1);
      return new DocumentLineRangeMap(
        map.lineRangeMappings.map(
          (m) => m.inputRange.isEmpty || m.outputRange.isEmpty ? new LineRangeMapping2(
            // We can do this because two adjacent diffs have one line in between.
            m.inputRange.deltaStart(-1),
            m.outputRange.deltaStart(-1)
          ) : m
        ),
        map.inputLineCount
      );
    });
    this.resultBaseMapping = derived(this, (reader) => this.baseResultMapping.read(reader).reverse());
    this.diffComputingState = derived(this, (reader) => {
      const states = [
        this.input1TextModelDiffs,
        this.input2TextModelDiffs,
        this.resultTextModelDiffs
      ].map((s) => s.state.read(reader));
      if (states.some((s) => s === 1 /* initializing */)) {
        return 1 /* initializing */;
      }
      if (states.some((s) => s === 3 /* updating */)) {
        return 3 /* updating */;
      }
      return 2 /* upToDate */;
    });
    this.inputDiffComputingState = derived(this, (reader) => {
      const states = [
        this.input1TextModelDiffs,
        this.input2TextModelDiffs
      ].map((s) => s.state.read(reader));
      if (states.some((s) => s === 1 /* initializing */)) {
        return 1 /* initializing */;
      }
      if (states.some((s) => s === 3 /* updating */)) {
        return 3 /* updating */;
      }
      return 2 /* upToDate */;
    });
    this.isUpToDate = derived(this, (reader) => this.diffComputingState.read(reader) === 2 /* upToDate */);
    this.firstRun = true;
    this.unhandledConflictsCount = derived(this, (reader) => {
      const map = this.modifiedBaseRangeResultStates.read(reader);
      let unhandledCount = 0;
      for (const [_key, value2] of map) {
        if (!value2.handled.read(reader)) {
          unhandledCount++;
        }
      }
      return unhandledCount;
    });
    this.hasUnhandledConflicts = this.unhandledConflictsCount.map((value2) => (
      /** @description hasUnhandledConflicts */
      value2 > 0
    ));
    this._register(keepObserved(this.modifiedBaseRangeResultStates));
    this._register(keepObserved(this.input1ResultMapping));
    this._register(keepObserved(this.input2ResultMapping));
    const initializePromise = this.initialize();
    this.onInitialized = waitForState(this.diffComputingState, (state) => state === 2 /* upToDate */).then(async () => {
      await initializePromise;
    });
    initializePromise.then(() => {
      let shouldRecomputeHandledFromAccepted = true;
      this._register(
        autorunHandleChanges(
          {
            changeTracker: {
              createChangeSummary: () => void 0,
              handleChange: (ctx) => {
                if (ctx.didChange(this.modifiedBaseRangeResultStates)) {
                  shouldRecomputeHandledFromAccepted = true;
                }
                return ctx.didChange(this.resultTextModelDiffs.diffs) ? ctx.change === 1 /* textChange */ : true;
              }
            }
          },
          (reader) => {
            const states = this.modifiedBaseRangeResultStates.read(reader);
            if (!this.isUpToDate.read(reader)) {
              return;
            }
            const resultDiffs = this.resultTextModelDiffs.diffs.read(reader);
            transaction((tx) => {
              this.updateBaseRangeAcceptedState(resultDiffs, states, tx);
              if (shouldRecomputeHandledFromAccepted) {
                shouldRecomputeHandledFromAccepted = false;
                for (const [_range, observableState] of states) {
                  const state = observableState.accepted.read(void 0);
                  const handled = !(state.kind === 0 /* base */ || state.kind === 4 /* unrecognized */);
                  observableState.handledInput1.set(handled, tx);
                  observableState.handledInput2.set(handled, tx);
                }
              }
            });
          }
        )
      );
    });
  }
  async initialize() {
    if (this.options.resetResult) {
      await this.reset();
    }
  }
  async reset() {
    await waitForState(this.inputDiffComputingState, (state) => state === 2 /* upToDate */);
    const states = this.modifiedBaseRangeResultStates.get();
    transaction((tx) => {
      for (const [range2, state] of states) {
        let newState;
        let handled = false;
        if (range2.input1Diffs.length === 0) {
          newState = ModifiedBaseRangeState.base.withInputValue(2, true);
          handled = true;
        } else if (range2.input2Diffs.length === 0) {
          newState = ModifiedBaseRangeState.base.withInputValue(1, true);
          handled = true;
        } else if (range2.isEqualChange) {
          newState = ModifiedBaseRangeState.base.withInputValue(1, true);
          handled = true;
        } else {
          newState = ModifiedBaseRangeState.base;
          handled = false;
        }
        state.accepted.set(newState, tx);
        state.computedFromDiffing = false;
        state.previousNonDiffingState = void 0;
        state.handledInput1.set(handled, tx);
        state.handledInput2.set(handled, tx);
      }
      this.resultTextModel.pushEditOperations(null, [{
        range: new Range2(1, 1, Number.MAX_SAFE_INTEGER, 1),
        text: this.computeAutoMergedResult()
      }], () => null);
    });
  }
  computeAutoMergedResult() {
    const baseRanges = this.modifiedBaseRanges.get();
    const baseLines = this.base.getLinesContent();
    const input1Lines = this.input1.textModel.getLinesContent();
    const input2Lines = this.input2.textModel.getLinesContent();
    const resultLines = [];
    function appendLinesToResult(source, lineRange) {
      for (let i2 = lineRange.startLineNumber; i2 < lineRange.endLineNumberExclusive; i2++) {
        resultLines.push(source[i2 - 1]);
      }
    }
    let baseStartLineNumber = 1;
    for (const baseRange of baseRanges) {
      appendLinesToResult(baseLines, MergeEditorLineRange.fromLineNumbers(baseStartLineNumber, baseRange.baseRange.startLineNumber));
      baseStartLineNumber = baseRange.baseRange.endLineNumberExclusive;
      if (baseRange.input1Diffs.length === 0) {
        appendLinesToResult(input2Lines, baseRange.input2Range);
      } else if (baseRange.input2Diffs.length === 0) {
        appendLinesToResult(input1Lines, baseRange.input1Range);
      } else if (baseRange.isEqualChange) {
        appendLinesToResult(input1Lines, baseRange.input1Range);
      } else {
        appendLinesToResult(baseLines, baseRange.baseRange);
      }
    }
    appendLinesToResult(baseLines, MergeEditorLineRange.fromLineNumbers(baseStartLineNumber, baseLines.length + 1));
    return resultLines.join(this.resultTextModel.getEOL());
  }
  hasBaseRange(baseRange) {
    return this.modifiedBaseRangeResultStates.get().has(baseRange);
  }
  get isApplyingEditInResult() {
    return this.resultTextModelDiffs.isApplyingChange;
  }
  getInputResultMapping(inputLinesDiffs, resultDiffs, inputLineCount) {
    const map = DocumentLineRangeMap.betweenOutputs(inputLinesDiffs, resultDiffs, inputLineCount);
    return new DocumentLineRangeMap(
      map.lineRangeMappings.map(
        (m) => m.inputRange.isEmpty || m.outputRange.isEmpty ? new LineRangeMapping2(
          // We can do this because two adjacent diffs have one line in between.
          m.inputRange.deltaStart(-1),
          m.outputRange.deltaStart(-1)
        ) : m
      ),
      map.inputLineCount
    );
  }
  translateInputRangeToBase(input, range2) {
    const baseInputDiffs = input === 1 ? this.baseInput1Diffs.get() : this.baseInput2Diffs.get();
    const map = new DocumentRangeMap(baseInputDiffs.flatMap((d) => d.rangeMappings), 0).reverse();
    return map.projectRange(range2).outputRange;
  }
  translateBaseRangeToInput(input, range2) {
    const baseInputDiffs = input === 1 ? this.baseInput1Diffs.get() : this.baseInput2Diffs.get();
    const map = new DocumentRangeMap(baseInputDiffs.flatMap((d) => d.rangeMappings), 0);
    return map.projectRange(range2).outputRange;
  }
  getLineRangeInResult(baseRange, reader) {
    return this.resultTextModelDiffs.getResultLineRange(baseRange, reader);
  }
  translateResultRangeToBase(range2) {
    const map = new DocumentRangeMap(this.baseResultDiffs.get().flatMap((d) => d.rangeMappings), 0).reverse();
    return map.projectRange(range2).outputRange;
  }
  translateBaseRangeToResult(range2) {
    const map = new DocumentRangeMap(this.baseResultDiffs.get().flatMap((d) => d.rangeMappings), 0);
    return map.projectRange(range2).outputRange;
  }
  findModifiedBaseRangesInRange(rangeInBase) {
    return this.modifiedBaseRanges.get().filter((r2) => r2.baseRange.intersectsOrTouches(rangeInBase));
  }
  updateBaseRangeAcceptedState(resultDiffs, states, tx) {
    const baseRangeWithStoreAndTouchingDiffs = leftJoin(
      states,
      resultDiffs,
      (baseRange, diff4) => baseRange[0].baseRange.intersectsOrTouches(diff4.inputRange) ? CompareResult.neitherLessOrGreaterThan : MergeEditorLineRange.compareByStart(
        baseRange[0].baseRange,
        diff4.inputRange
      )
    );
    for (const row of baseRangeWithStoreAndTouchingDiffs) {
      const newState = this.computeState(row.left[0], row.rights);
      const data = row.left[1];
      const oldState = data.accepted.get();
      if (!oldState.equals(newState)) {
        if (!this.firstRun && !data.computedFromDiffing) {
          data.computedFromDiffing = true;
          data.previousNonDiffingState = oldState;
        }
        data.accepted.set(newState, tx);
      }
    }
    if (this.firstRun) {
      this.firstRun = false;
    }
  }
  computeState(baseRange, conflictingDiffs) {
    if (conflictingDiffs.length === 0) {
      return ModifiedBaseRangeState.base;
    }
    const conflictingEdits = conflictingDiffs.map((d) => d.getLineEdit());
    function editsAgreeWithDiffs(diffs) {
      return equals(
        conflictingEdits,
        diffs.map((d) => d.getLineEdit()),
        (a, b) => a.equals(b)
      );
    }
    if (editsAgreeWithDiffs(baseRange.input1Diffs)) {
      return ModifiedBaseRangeState.base.withInputValue(1, true);
    }
    if (editsAgreeWithDiffs(baseRange.input2Diffs)) {
      return ModifiedBaseRangeState.base.withInputValue(2, true);
    }
    const states = [
      ModifiedBaseRangeState.base.withInputValue(1, true).withInputValue(2, true, true),
      ModifiedBaseRangeState.base.withInputValue(2, true).withInputValue(1, true, true),
      ModifiedBaseRangeState.base.withInputValue(1, true).withInputValue(2, true, false),
      ModifiedBaseRangeState.base.withInputValue(2, true).withInputValue(1, true, false)
    ];
    for (const s of states) {
      const { edit: edit3 } = baseRange.getEditForBase(s);
      if (edit3) {
        const resultRange = this.resultTextModelDiffs.getResultLineRange(baseRange.baseRange);
        const existingLines = resultRange.getLines(this.resultTextModel);
        if (equals(edit3.newLines, existingLines, (a, b) => a === b)) {
          return s;
        }
      }
    }
    return ModifiedBaseRangeState.unrecognized;
  }
  getState(baseRange) {
    const existingState = this.modifiedBaseRangeResultStates.get().get(baseRange);
    if (!existingState) {
      throw new BugIndicatingError("object must be from this instance");
    }
    return existingState.accepted;
  }
  setState(baseRange, state, _markInputAsHandled, tx, _pushStackElement = false) {
    if (!this.isUpToDate.get()) {
      throw new BugIndicatingError("Cannot set state while updating");
    }
    const existingState = this.modifiedBaseRangeResultStates.get().get(baseRange);
    if (!existingState) {
      throw new BugIndicatingError("object must be from this instance");
    }
    const conflictingDiffs = this.resultTextModelDiffs.findTouchingDiffs(
      baseRange.baseRange
    );
    const group2 = new UndoRedoGroup();
    if (conflictingDiffs) {
      this.resultTextModelDiffs.removeDiffs(conflictingDiffs, tx, group2);
    }
    const { edit: edit3, effectiveState } = baseRange.getEditForBase(state);
    existingState.accepted.set(effectiveState, tx);
    existingState.previousNonDiffingState = void 0;
    existingState.computedFromDiffing = false;
    const input1Handled = existingState.handledInput1.get();
    const input2Handled = existingState.handledInput2.get();
    if (!input1Handled || !input2Handled) {
      this.undoRedoService.pushElement(
        new MarkAsHandledUndoRedoElement(this.resultTextModel.uri, new WeakRef(this), new WeakRef(existingState), input1Handled, input2Handled),
        group2
      );
    }
    if (edit3) {
      this.resultTextModel.pushStackElement();
      this.resultTextModelDiffs.applyEditRelativeToOriginal(edit3, tx, group2);
      this.resultTextModel.pushStackElement();
    }
    existingState.handledInput1.set(true, tx);
    existingState.handledInput2.set(true, tx);
  }
  resetDirtyConflictsToBase() {
    transaction((tx) => {
      this.resultTextModel.pushStackElement();
      for (const range2 of this.modifiedBaseRanges.get()) {
        if (this.getState(range2).get().kind === 4 /* unrecognized */) {
          this.setState(range2, ModifiedBaseRangeState.base, false, tx, false);
        }
      }
      this.resultTextModel.pushStackElement();
    });
  }
  isHandled(baseRange) {
    return this.modifiedBaseRangeResultStates.get().get(baseRange).handled;
  }
  isInputHandled(baseRange, inputNumber) {
    const state = this.modifiedBaseRangeResultStates.get().get(baseRange);
    return inputNumber === 1 ? state.handledInput1 : state.handledInput2;
  }
  setInputHandled(baseRange, inputNumber, handled, tx) {
    const state = this.modifiedBaseRangeResultStates.get().get(baseRange);
    if (state.handled.get() === handled) {
      return;
    }
    const dataRef = new WeakRef(ModifiedBaseRangeData);
    const modelRef = new WeakRef(this);
    this.undoRedoService.pushElement({
      type: 0 /* Resource */,
      resource: this.resultTextModel.uri,
      code: "setInputHandled",
      label: localize(17290, null),
      redo() {
        const model = modelRef.deref();
        const data = dataRef.deref();
        if (model && !model.isDisposed() && data) {
          transaction((tx2) => {
            if (inputNumber === 1) {
              state.handledInput1.set(handled, tx2);
            } else {
              state.handledInput2.set(handled, tx2);
            }
          });
        }
      },
      undo() {
        const model = modelRef.deref();
        const data = dataRef.deref();
        if (model && !model.isDisposed() && data) {
          transaction((tx2) => {
            if (inputNumber === 1) {
              state.handledInput1.set(!handled, tx2);
            } else {
              state.handledInput2.set(!handled, tx2);
            }
          });
        }
      }
    });
    if (inputNumber === 1) {
      state.handledInput1.set(handled, tx);
    } else {
      state.handledInput2.set(handled, tx);
    }
  }
  setHandled(baseRange, handled, tx) {
    const state = this.modifiedBaseRangeResultStates.get().get(baseRange);
    if (state.handled.get() === handled) {
      return;
    }
    state.handledInput1.set(handled, tx);
    state.handledInput2.set(handled, tx);
  }
  setLanguageId(languageId, source) {
    const language2 = this.languageService.createById(languageId);
    this.base.setLanguage(language2, source);
    this.input1.textModel.setLanguage(language2, source);
    this.input2.textModel.setLanguage(language2, source);
    this.resultTextModel.setLanguage(language2, source);
  }
  getInitialResultValue() {
    const chunks = [];
    while (true) {
      const chunk2 = this.resultSnapshot.read();
      if (chunk2 === null) {
        break;
      }
      chunks.push(chunk2);
    }
    return chunks.join();
  }
  async getResultValueWithConflictMarkers() {
    await waitForState(this.diffComputingState, (state) => state === 2 /* upToDate */);
    if (this.unhandledConflictsCount.get() === 0) {
      return this.resultTextModel.getValue();
    }
    const resultLines = this.resultTextModel.getLinesContent();
    const input1Lines = this.input1.textModel.getLinesContent();
    const input2Lines = this.input2.textModel.getLinesContent();
    const states = this.modifiedBaseRangeResultStates.get();
    const outputLines = [];
    function appendLinesToResult(source, lineRange) {
      for (let i2 = lineRange.startLineNumber; i2 < lineRange.endLineNumberExclusive; i2++) {
        outputLines.push(source[i2 - 1]);
      }
    }
    let resultStartLineNumber = 1;
    for (const [range2, state] of states) {
      if (state.handled.get()) {
        continue;
      }
      const resultRange = this.resultTextModelDiffs.getResultLineRange(range2.baseRange);
      appendLinesToResult(resultLines, MergeEditorLineRange.fromLineNumbers(resultStartLineNumber, Math.max(resultStartLineNumber, resultRange.startLineNumber)));
      resultStartLineNumber = resultRange.endLineNumberExclusive;
      outputLines.push("<<<<<<<");
      if (state.accepted.get().kind === 4 /* unrecognized */) {
        appendLinesToResult(resultLines, resultRange);
      } else {
        appendLinesToResult(input1Lines, range2.input1Range);
      }
      outputLines.push("=======");
      appendLinesToResult(input2Lines, range2.input2Range);
      outputLines.push(">>>>>>>");
    }
    appendLinesToResult(resultLines, MergeEditorLineRange.fromLineNumbers(resultStartLineNumber, resultLines.length + 1));
    return outputLines.join("\n");
  }
  get conflictCount() {
    return arrayCount(this.modifiedBaseRanges.get(), (r2) => r2.isConflicting);
  }
  get combinableConflictCount() {
    return arrayCount(this.modifiedBaseRanges.get(), (r2) => r2.isConflicting && r2.canBeCombined);
  }
  get conflictsResolvedWithBase() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r2, s]) => r2.isConflicting && s.accepted.get().kind === 0 /* base */
    );
  }
  get conflictsResolvedWithInput1() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r2, s]) => r2.isConflicting && s.accepted.get().kind === 1 /* input1 */
    );
  }
  get conflictsResolvedWithInput2() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r2, s]) => r2.isConflicting && s.accepted.get().kind === 2 /* input2 */
    );
  }
  get conflictsResolvedWithSmartCombination() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r2, s]) => {
        const state = s.accepted.get();
        return r2.isConflicting && state.kind === 3 /* both */ && state.smartCombination;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualNone() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r2, s]) => r2.isConflicting && s.accepted.get().kind === 4 /* unrecognized */
    );
  }
  get manuallySolvedConflictCountThatEqualSmartCombine() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r2, s]) => {
        const state = s.accepted.get();
        return r2.isConflicting && s.computedFromDiffing && state.kind === 3 /* both */ && state.smartCombination;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualInput1() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r2, s]) => {
        const state = s.accepted.get();
        return r2.isConflicting && s.computedFromDiffing && state.kind === 1 /* input1 */;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualInput2() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r2, s]) => {
        const state = s.accepted.get();
        return r2.isConflicting && s.computedFromDiffing && state.kind === 2 /* input2 */;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualNoneAndStartedWithBase() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r2, s]) => {
        const state = s.accepted.get();
        return r2.isConflicting && state.kind === 4 /* unrecognized */ && s.previousNonDiffingState?.kind === 0 /* base */;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r2, s]) => {
        const state = s.accepted.get();
        return r2.isConflicting && state.kind === 4 /* unrecognized */ && s.previousNonDiffingState?.kind === 1 /* input1 */;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r2, s]) => {
        const state = s.accepted.get();
        return r2.isConflicting && state.kind === 4 /* unrecognized */ && s.previousNonDiffingState?.kind === 2 /* input2 */;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r2, s]) => {
        const state = s.accepted.get();
        return r2.isConflicting && state.kind === 4 /* unrecognized */ && s.previousNonDiffingState?.kind === 3 /* both */ && !s.previousNonDiffingState?.smartCombination;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r2, s]) => {
        const state = s.accepted.get();
        return r2.isConflicting && state.kind === 4 /* unrecognized */ && s.previousNonDiffingState?.kind === 3 /* both */ && s.previousNonDiffingState?.smartCombination;
      }
    );
  }
};

MergeEditorModel = __decorateClass([
  __decorateParam(7, ILanguageService),
  __decorateParam(8, IUndoRedoService)
], MergeEditorModel);

function arrayCount(array3, predicate) {
  let count2 = 0;
  for (const value2 of array3) {
    if (predicate(value2)) {
      count2++;
    }
  }
  return count2;
}

var ModifiedBaseRangeData = class {
  constructor(baseRange) {
    this.baseRange = baseRange;
    this.accepted = observableValue(`BaseRangeState${this.baseRange.baseRange}`, ModifiedBaseRangeState.base);
    this.handledInput1 = observableValue(`BaseRangeHandledState${this.baseRange.baseRange}.Input1`, false);
    this.handledInput2 = observableValue(`BaseRangeHandledState${this.baseRange.baseRange}.Input2`, false);
    this.computedFromDiffing = false;
    this.previousNonDiffingState = void 0;
    this.handled = derived(this, (reader) => this.handledInput1.read(reader) && this.handledInput2.read(reader));
  }
};

var MarkAsHandledUndoRedoElement = class {
  constructor(resource, mergeEditorModelRef, stateRef, input1Handled, input2Handled) {
    this.resource = resource;
    this.mergeEditorModelRef = mergeEditorModelRef;
    this.stateRef = stateRef;
    this.input1Handled = input1Handled;
    this.input2Handled = input2Handled;
    this.code = "undoMarkAsHandled";
    this.label = localize(17291, null);
    this.type = 0 /* Resource */;
  }
  redo() {
    const mergeEditorModel = this.mergeEditorModelRef.deref();
    if (!mergeEditorModel || mergeEditorModel.isDisposed()) {
      return;
    }
    const state = this.stateRef.deref();
    if (!state) {
      return;
    }
    transaction((tx) => {
      state.handledInput1.set(true, tx);
      state.handledInput2.set(true, tx);
    });
  }
  undo() {
    const mergeEditorModel = this.mergeEditorModelRef.deref();
    if (!mergeEditorModel || mergeEditorModel.isDisposed()) {
      return;
    }
    const state = this.stateRef.deref();
    if (!state) {
      return;
    }
    transaction((tx) => {
      state.handledInput1.set(this.input1Handled, tx);
      state.handledInput2.set(this.input2Handled, tx);
    });
  }
};
export { arrayCount, MergeEditorModel, ModifiedBaseRangeData, MarkAsHandledUndoRedoElement };
