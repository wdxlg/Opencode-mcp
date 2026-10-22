// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/diffEditorViewModel.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { transaction } from "./module-0045.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { observableSignal } from "./module-0058.mjs";
import { RunOnceScheduler, rejectIfNotCanceled } from "./module-0036.mjs";
import { autorun } from "./module-0052.mjs";
import { LineRange, LineRangeSet } from "./module-0174.mjs";
import { isDefined } from "./module-0010.mjs";
import { groupAdjacentBy } from "./module-0007.mjs";
import { filterWithPrevious } from "./module-0478.mjs";
import { DetailedLineRangeMapping, LineRangeMapping, RangeMapping } from "./module-0179.mjs";
import { TextEditInfo } from "./module-0382.mjs";
import { readHotReloadableExport } from "./module-0443.mjs";
import { DefaultLinesDiffComputer } from "./module-0189.mjs";
import { optimizeSequenceDiffs } from "./module-0187.mjs";
import { combineTextEditInfos } from "./module-0388.mjs";
import { waitForState } from "./module-0056.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDiffProviderFactoryService } from "./module-0482.mjs";
import { softAssert } from "./module-0009.mjs";


// src/vs/editor/browser/widget/diffEditor/diffEditorViewModel.ts
var DiffEditorViewModel = class extends Disposable {
  constructor(model, _options, _diffProviderFactoryService) {
    super();
    this.model = model;
    this._options = _options;
    this._diffProviderFactoryService = _diffProviderFactoryService;
    this._isDiffUpToDate = observableValue(this, false);
    this.isDiffUpToDate = this._isDiffUpToDate;
    this._diff = observableValue(this, void 0);
    this.diff = this._diff;
    this._unchangedRegions = observableValue(this, void 0);
    this.unchangedRegions = derived(
      this,
      (r2) => {
        if (this._options.hideUnchangedRegions.read(r2)) {
          return this._unchangedRegions.read(r2)?.regions ?? [];
        } else {
          transaction((tx) => {
            for (const r3 of this._unchangedRegions.read(void 0)?.regions || []) {
              r3.collapseAll(tx);
            }
          });
          return [];
        }
      }
    );
    this.movedTextToCompare = observableValue(this, void 0);
    this._activeMovedText = observableValue(this, void 0);
    this._hoveredMovedText = observableValue(this, void 0);
    this.activeMovedText = derived(this, (r2) => this.movedTextToCompare.read(r2) ?? this._hoveredMovedText.read(r2) ?? this._activeMovedText.read(r2));
    this._cancellationTokenSource = new CancellationTokenSource();
    this._diffProvider = derived(this, (reader) => {
      const diffProvider = this._diffProviderFactoryService.createDiffProvider({
        diffAlgorithm: this._options.diffAlgorithm.read(reader)
      });
      const onChangeSignal = observableSignalFromEvent("onDidChange", diffProvider.onDidChange);
      return {
        diffProvider,
        onChangeSignal
      };
    });
    this._register(toDisposable(() => this._cancellationTokenSource.cancel()));
    const contentChangedSignal = observableSignal("contentChangedSignal");
    const debouncer = this._register(new RunOnceScheduler(() => contentChangedSignal.trigger(void 0), 200));
    this._register(autorun((reader) => {
      const lastUnchangedRegions = this._unchangedRegions.read(reader);
      if (!lastUnchangedRegions || lastUnchangedRegions.regions.some((r2) => r2.isDragged.read(reader))) {
        return;
      }
      const lastUnchangedRegionsOrigRanges = lastUnchangedRegions.originalDecorationIds.map((id2) => model.original.getDecorationRange(id2)).map((r2) => r2 ? LineRange.fromRangeInclusive(r2) : void 0);
      const lastUnchangedRegionsModRanges = lastUnchangedRegions.modifiedDecorationIds.map((id2) => model.modified.getDecorationRange(id2)).map((r2) => r2 ? LineRange.fromRangeInclusive(r2) : void 0);
      const updatedLastUnchangedRegions = lastUnchangedRegions.regions.map((r2, idx) => !lastUnchangedRegionsOrigRanges[idx] || !lastUnchangedRegionsModRanges[idx] ? void 0 : new UnchangedRegion(
        lastUnchangedRegionsOrigRanges[idx].startLineNumber,
        lastUnchangedRegionsModRanges[idx].startLineNumber,
        lastUnchangedRegionsOrigRanges[idx].length,
        r2.visibleLineCountTop.read(reader),
        r2.visibleLineCountBottom.read(reader)
      )).filter(isDefined);
      const newRanges = [];
      let didChange = false;
      for (const touching of groupAdjacentBy(updatedLastUnchangedRegions, (a, b) => a.getHiddenModifiedRange(reader).endLineNumberExclusive === b.getHiddenModifiedRange(reader).startLineNumber)) {
        if (touching.length > 1) {
          didChange = true;
          const sumLineCount = touching.reduce((sum2, r3) => sum2 + r3.lineCount, 0);
          const r2 = new UnchangedRegion(touching[0].originalLineNumber, touching[0].modifiedLineNumber, sumLineCount, touching[0].visibleLineCountTop.read(void 0), touching[touching.length - 1].visibleLineCountBottom.read(void 0));
          newRanges.push(r2);
        } else {
          newRanges.push(touching[0]);
        }
      }
      if (didChange) {
        const originalDecorationIds = model.original.deltaDecorations(
          lastUnchangedRegions.originalDecorationIds,
          newRanges.map((r2) => ({ range: r2.originalUnchangedRange.toInclusiveRange(), options: { description: "unchanged" } }))
        );
        const modifiedDecorationIds = model.modified.deltaDecorations(
          lastUnchangedRegions.modifiedDecorationIds,
          newRanges.map((r2) => ({ range: r2.modifiedUnchangedRange.toInclusiveRange(), options: { description: "unchanged" } }))
        );
        transaction((tx) => {
          this._unchangedRegions.set(
            {
              regions: newRanges,
              originalDecorationIds,
              modifiedDecorationIds
            },
            tx
          );
        });
      }
    }));
    const updateUnchangedRegions = (result, tx, reader) => {
      const newUnchangedRegions = UnchangedRegion.fromDiffs(
        result.changes,
        model.original.getLineCount(),
        model.modified.getLineCount(),
        this._options.hideUnchangedRegionsMinimumLineCount.read(reader),
        this._options.hideUnchangedRegionsContextLineCount.read(reader)
      );
      let visibleRegions = void 0;
      const lastUnchangedRegions = this._unchangedRegions.get();
      if (lastUnchangedRegions) {
        const lastUnchangedRegionsOrigRanges = lastUnchangedRegions.originalDecorationIds.map((id2) => model.original.getDecorationRange(id2)).map((r2) => r2 ? LineRange.fromRangeInclusive(r2) : void 0);
        const lastUnchangedRegionsModRanges = lastUnchangedRegions.modifiedDecorationIds.map((id2) => model.modified.getDecorationRange(id2)).map((r2) => r2 ? LineRange.fromRangeInclusive(r2) : void 0);
        const updatedLastUnchangedRegions = filterWithPrevious(
          lastUnchangedRegions.regions.map(
            (r2, idx) => {
              if (!lastUnchangedRegionsOrigRanges[idx] || !lastUnchangedRegionsModRanges[idx]) {
                return void 0;
              }
              const length = lastUnchangedRegionsOrigRanges[idx].length;
              return new UnchangedRegion(
                lastUnchangedRegionsOrigRanges[idx].startLineNumber,
                lastUnchangedRegionsModRanges[idx].startLineNumber,
                length,
                // The visible area can shrink by edits -> we have to account for this
                Math.min(r2.visibleLineCountTop.get(), length),
                Math.min(r2.visibleLineCountBottom.get(), length - r2.visibleLineCountTop.get())
              );
            }
          ).filter(isDefined),
          (cur, prev) => !prev || cur.modifiedLineNumber >= prev.modifiedLineNumber + prev.lineCount && cur.originalLineNumber >= prev.originalLineNumber + prev.lineCount
        );
        let hiddenRegions = updatedLastUnchangedRegions.map((r2) => new LineRangeMapping(r2.getHiddenOriginalRange(reader), r2.getHiddenModifiedRange(reader)));
        hiddenRegions = LineRangeMapping.clip(hiddenRegions, LineRange.ofLength(1, model.original.getLineCount()), LineRange.ofLength(1, model.modified.getLineCount()));
        visibleRegions = LineRangeMapping.inverse(hiddenRegions, model.original.getLineCount(), model.modified.getLineCount());
      }
      const newUnchangedRegions2 = [];
      if (visibleRegions) {
        for (const r2 of newUnchangedRegions) {
          const intersecting = visibleRegions.filter((f) => f.original.intersectsStrict(r2.originalUnchangedRange) && f.modified.intersectsStrict(r2.modifiedUnchangedRange));
          newUnchangedRegions2.push(...r2.setVisibleRanges(intersecting, tx));
        }
      } else {
        newUnchangedRegions2.push(...newUnchangedRegions);
      }
      const originalDecorationIds = model.original.deltaDecorations(
        lastUnchangedRegions?.originalDecorationIds || [],
        newUnchangedRegions2.map((r2) => ({ range: r2.originalUnchangedRange.toInclusiveRange(), options: { description: "unchanged" } }))
      );
      const modifiedDecorationIds = model.modified.deltaDecorations(
        lastUnchangedRegions?.modifiedDecorationIds || [],
        newUnchangedRegions2.map((r2) => ({ range: r2.modifiedUnchangedRange.toInclusiveRange(), options: { description: "unchanged" } }))
      );
      this._unchangedRegions.set(
        {
          regions: newUnchangedRegions2,
          originalDecorationIds,
          modifiedDecorationIds
        },
        tx
      );
    };
    this._register(model.modified.onDidChangeContent((e) => {
      const diff4 = this._diff.get();
      if (diff4) {
        const textEdits = TextEditInfo.fromModelContentChanges(e.changes);
        const result = applyModifiedEdits(this._lastDiff, textEdits, model.original, model.modified);
        if (result) {
          this._lastDiff = result;
          transaction((tx) => {
            this._diff.set(DiffState.fromDiffResult(this._lastDiff), tx);
            updateUnchangedRegions(result, tx);
            const currentSyncedMovedText = this.movedTextToCompare.get();
            this.movedTextToCompare.set(currentSyncedMovedText ? this._lastDiff.moves.find((m) => m.lineRangeMapping.modified.intersect(currentSyncedMovedText.lineRangeMapping.modified)) : void 0, tx);
          });
        }
      }
      this._isDiffUpToDate.set(false, void 0);
      debouncer.schedule();
    }));
    this._register(model.original.onDidChangeContent((e) => {
      const diff4 = this._diff.get();
      if (diff4) {
        const textEdits = TextEditInfo.fromModelContentChanges(e.changes);
        const result = applyOriginalEdits(this._lastDiff, textEdits, model.original, model.modified);
        if (result) {
          this._lastDiff = result;
          transaction((tx) => {
            this._diff.set(DiffState.fromDiffResult(this._lastDiff), tx);
            updateUnchangedRegions(result, tx);
            const currentSyncedMovedText = this.movedTextToCompare.get();
            this.movedTextToCompare.set(currentSyncedMovedText ? this._lastDiff.moves.find((m) => m.lineRangeMapping.modified.intersect(currentSyncedMovedText.lineRangeMapping.modified)) : void 0, tx);
          });
        }
      }
      this._isDiffUpToDate.set(false, void 0);
      debouncer.schedule();
    }));
    this._register(autorun(async (reader) => {
      const store = reader.store;
      this._options.hideUnchangedRegionsMinimumLineCount.read(reader);
      this._options.hideUnchangedRegionsContextLineCount.read(reader);
      debouncer.cancel();
      contentChangedSignal.read(reader);
      const documentDiffProvider = this._diffProvider.read(reader);
      documentDiffProvider.onChangeSignal.read(reader);
      readHotReloadableExport(DefaultLinesDiffComputer, reader);
      readHotReloadableExport(optimizeSequenceDiffs, reader);
      this._isDiffUpToDate.set(false, void 0);
      let originalTextEditInfos = [];
      store.add(model.original.onDidChangeContent((e) => {
        const edits = TextEditInfo.fromModelContentChanges(e.changes);
        originalTextEditInfos = combineTextEditInfos(originalTextEditInfos, edits);
      }));
      let modifiedTextEditInfos = [];
      store.add(model.modified.onDidChangeContent((e) => {
        const edits = TextEditInfo.fromModelContentChanges(e.changes);
        modifiedTextEditInfos = combineTextEditInfos(modifiedTextEditInfos, edits);
      }));
      let result = await documentDiffProvider.diffProvider.computeDiff(model.original, model.modified, {
        ignoreTrimWhitespace: this._options.ignoreTrimWhitespace.read(reader),
        maxComputationTimeMs: this._options.maxComputationTimeMs.read(reader),
        computeMoves: this._options.showMoves.read(reader)
      }, this._cancellationTokenSource.token).catch(rejectIfNotCanceled);
      if (!result || this._cancellationTokenSource.token.isCancellationRequested) {
        return;
      }
      if (model.original.isDisposed() || model.modified.isDisposed()) {
        return;
      }
      result = normalizeDocumentDiff(result, model.original, model.modified);
      result = applyOriginalEdits(result, originalTextEditInfos, model.original, model.modified) ?? result;
      result = applyModifiedEdits(result, modifiedTextEditInfos, model.original, model.modified) ?? result;
      transaction((tx) => {
        updateUnchangedRegions(result, tx);
        this._lastDiff = result;
        const state = DiffState.fromDiffResult(result);
        this._diff.set(state, tx);
        this._isDiffUpToDate.set(true, tx);
        const currentSyncedMovedText = this.movedTextToCompare.read(void 0);
        this.movedTextToCompare.set(currentSyncedMovedText ? this._lastDiff.moves.find((m) => m.lineRangeMapping.modified.intersect(currentSyncedMovedText.lineRangeMapping.modified)) : void 0, tx);
      });
    }));
  }
  setActiveMovedText(movedText) {
    this._activeMovedText.set(movedText, void 0);
  }
  setHoveredMovedText(movedText) {
    this._hoveredMovedText.set(movedText, void 0);
  }
  ensureModifiedLineIsVisible(lineNumber, preference, tx) {
    if (this.diff.get()?.mappings.length === 0) {
      return;
    }
    const unchangedRegions = this._unchangedRegions.get()?.regions || [];
    for (const r2 of unchangedRegions) {
      if (r2.getHiddenModifiedRange(void 0).contains(lineNumber)) {
        r2.showModifiedLine(lineNumber, preference, tx);
        return;
      }
    }
  }
  ensureOriginalLineIsVisible(lineNumber, preference, tx) {
    if (this.diff.get()?.mappings.length === 0) {
      return;
    }
    const unchangedRegions = this._unchangedRegions.get()?.regions || [];
    for (const r2 of unchangedRegions) {
      if (r2.getHiddenOriginalRange(void 0).contains(lineNumber)) {
        r2.showOriginalLine(lineNumber, preference, tx);
        return;
      }
    }
  }
  async waitForDiff() {
    await waitForState(this.isDiffUpToDate, (s) => s, void 0, this._cancellationTokenSource.token).catch(rejectIfNotCanceled);
  }
  serializeState() {
    const regions = this._unchangedRegions.get();
    return {
      collapsedRegions: regions?.regions.map((r2) => ({ range: r2.getHiddenModifiedRange(void 0).serialize() }))
    };
  }
  restoreSerializedState(state) {
    const ranges = state.collapsedRegions?.map((r2) => LineRange.deserialize(r2.range));
    const regions = this._unchangedRegions.get();
    if (!regions || !ranges) {
      return;
    }
    transaction((tx) => {
      for (const r2 of regions.regions) {
        for (const range2 of ranges) {
          if (r2.modifiedUnchangedRange.intersect(range2)) {
            r2.setHiddenModifiedRange(range2, tx);
            break;
          }
        }
      }
    });
  }
};

DiffEditorViewModel = __decorateClass([
  __decorateParam(2, IDiffProviderFactoryService)
], DiffEditorViewModel);

function normalizeDocumentDiff(diff4, original, modified) {
  return {
    changes: diff4.changes.map((c) => new DetailedLineRangeMapping(
      c.original,
      c.modified,
      c.innerChanges ? c.innerChanges.map((i2) => normalizeRangeMapping(i2, original, modified)) : void 0
    )),
    moves: diff4.moves,
    identical: diff4.identical,
    quitEarly: diff4.quitEarly
  };
}

function normalizeRangeMapping(rangeMapping, original, modified) {
  let originalRange = rangeMapping.originalRange;
  let modifiedRange = rangeMapping.modifiedRange;
  if (originalRange.startColumn === 1 && modifiedRange.startColumn === 1 && (originalRange.endColumn !== 1 || modifiedRange.endColumn !== 1) && originalRange.endColumn === original.getLineMaxColumn(originalRange.endLineNumber) && modifiedRange.endColumn === modified.getLineMaxColumn(modifiedRange.endLineNumber) && originalRange.endLineNumber < original.getLineCount() && modifiedRange.endLineNumber < modified.getLineCount()) {
    originalRange = originalRange.setEndPosition(originalRange.endLineNumber + 1, 1);
    modifiedRange = modifiedRange.setEndPosition(modifiedRange.endLineNumber + 1, 1);
  }
  return new RangeMapping(originalRange, modifiedRange);
}

var DiffState = class _DiffState {
  constructor(mappings, movedTexts, identical, quitEarly) {
    this.mappings = mappings;
    this.movedTexts = movedTexts;
    this.identical = identical;
    this.quitEarly = quitEarly;
  }
  static fromDiffResult(result) {
    return new _DiffState(
      result.changes.map((c) => new DiffMapping(c)),
      result.moves || [],
      result.identical,
      result.quitEarly
    );
  }
};

var DiffMapping = class {
  constructor(lineRangeMapping) {
    this.lineRangeMapping = lineRangeMapping;
  }
};

var UnchangedRegion = class _UnchangedRegion {
  constructor(originalLineNumber, modifiedLineNumber, lineCount, visibleLineCountTop, visibleLineCountBottom) {
    this.originalLineNumber = originalLineNumber;
    this.modifiedLineNumber = modifiedLineNumber;
    this.lineCount = lineCount;
    this._visibleLineCountTop = observableValue(this, 0);
    this.visibleLineCountTop = this._visibleLineCountTop;
    this._visibleLineCountBottom = observableValue(this, 0);
    this.visibleLineCountBottom = this._visibleLineCountBottom;
    this._shouldHideControls = derived(this, (reader) => (
      /** @description isVisible */
      this.visibleLineCountTop.read(reader) + this.visibleLineCountBottom.read(reader) === this.lineCount && !this.isDragged.read(reader)
    ));
    this.isDragged = observableValue(this, void 0);
    const visibleLineCountTop2 = Math.max(Math.min(visibleLineCountTop, this.lineCount), 0);
    const visibleLineCountBottom2 = Math.max(Math.min(visibleLineCountBottom, this.lineCount - visibleLineCountTop), 0);
    softAssert(visibleLineCountTop === visibleLineCountTop2);
    softAssert(visibleLineCountBottom === visibleLineCountBottom2);
    this._visibleLineCountTop.set(visibleLineCountTop2, void 0);
    this._visibleLineCountBottom.set(visibleLineCountBottom2, void 0);
  }
  static fromDiffs(changes, originalLineCount, modifiedLineCount, minHiddenLineCount, minContext) {
    const inversedMappings = DetailedLineRangeMapping.inverse(changes, originalLineCount, modifiedLineCount);
    const result = [];
    for (const mapping2 of inversedMappings) {
      let origStart = mapping2.original.startLineNumber;
      let modStart = mapping2.modified.startLineNumber;
      let length = mapping2.original.length;
      const atStart = origStart === 1 && modStart === 1;
      const atEnd = origStart + length === originalLineCount + 1 && modStart + length === modifiedLineCount + 1;
      if ((atStart || atEnd) && length >= minContext + minHiddenLineCount) {
        if (atStart && !atEnd) {
          length -= minContext;
        }
        if (atEnd && !atStart) {
          origStart += minContext;
          modStart += minContext;
          length -= minContext;
        }
        result.push(new _UnchangedRegion(origStart, modStart, length, 0, 0));
      } else if (length >= minContext * 2 + minHiddenLineCount) {
        origStart += minContext;
        modStart += minContext;
        length -= minContext * 2;
        result.push(new _UnchangedRegion(origStart, modStart, length, 0, 0));
      }
    }
    return result;
  }
  get originalUnchangedRange() {
    return LineRange.ofLength(this.originalLineNumber, this.lineCount);
  }
  get modifiedUnchangedRange() {
    return LineRange.ofLength(this.modifiedLineNumber, this.lineCount);
  }
  setVisibleRanges(visibleRanges, tx) {
    const result = [];
    const hiddenModified = new LineRangeSet(visibleRanges.map((r2) => r2.modified)).subtractFrom(this.modifiedUnchangedRange);
    let originalStartLineNumber = this.originalLineNumber;
    let modifiedStartLineNumber = this.modifiedLineNumber;
    const modifiedEndLineNumberEx = this.modifiedLineNumber + this.lineCount;
    if (hiddenModified.ranges.length === 0) {
      this.showAll(tx);
      result.push(this);
    } else {
      let i2 = 0;
      for (const r2 of hiddenModified.ranges) {
        const isLast = i2 === hiddenModified.ranges.length - 1;
        i2++;
        const length = (isLast ? modifiedEndLineNumberEx : r2.endLineNumberExclusive) - modifiedStartLineNumber;
        const newR = new _UnchangedRegion(originalStartLineNumber, modifiedStartLineNumber, length, 0, 0);
        newR.setHiddenModifiedRange(r2, tx);
        result.push(newR);
        originalStartLineNumber = newR.originalUnchangedRange.endLineNumberExclusive;
        modifiedStartLineNumber = newR.modifiedUnchangedRange.endLineNumberExclusive;
      }
    }
    return result;
  }
  shouldHideControls(reader) {
    return this._shouldHideControls.read(reader);
  }
  getHiddenOriginalRange(reader) {
    return LineRange.ofLength(
      this.originalLineNumber + this._visibleLineCountTop.read(reader),
      this.lineCount - this._visibleLineCountTop.read(reader) - this._visibleLineCountBottom.read(reader)
    );
  }
  getHiddenModifiedRange(reader) {
    return LineRange.ofLength(
      this.modifiedLineNumber + this._visibleLineCountTop.read(reader),
      this.lineCount - this._visibleLineCountTop.read(reader) - this._visibleLineCountBottom.read(reader)
    );
  }
  setHiddenModifiedRange(range2, tx) {
    const visibleLineCountTop = range2.startLineNumber - this.modifiedLineNumber;
    const visibleLineCountBottom = this.modifiedLineNumber + this.lineCount - range2.endLineNumberExclusive;
    this.setState(visibleLineCountTop, visibleLineCountBottom, tx);
  }
  getMaxVisibleLineCountTop() {
    return this.lineCount - this._visibleLineCountBottom.get();
  }
  getMaxVisibleLineCountBottom() {
    return this.lineCount - this._visibleLineCountTop.get();
  }
  showMoreAbove(count2 = 10, tx) {
    const maxVisibleLineCountTop = this.getMaxVisibleLineCountTop();
    this._visibleLineCountTop.set(Math.min(this._visibleLineCountTop.get() + count2, maxVisibleLineCountTop), tx);
  }
  showMoreBelow(count2 = 10, tx) {
    const maxVisibleLineCountBottom = this.lineCount - this._visibleLineCountTop.get();
    this._visibleLineCountBottom.set(Math.min(this._visibleLineCountBottom.get() + count2, maxVisibleLineCountBottom), tx);
  }
  showAll(tx) {
    this._visibleLineCountBottom.set(this.lineCount - this._visibleLineCountTop.get(), tx);
  }
  showModifiedLine(lineNumber, preference, tx) {
    const top2 = lineNumber + 1 - (this.modifiedLineNumber + this._visibleLineCountTop.get());
    const bottom = this.modifiedLineNumber - this._visibleLineCountBottom.get() + this.lineCount - lineNumber;
    if (preference === 0 /* FromCloserSide */ && top2 < bottom || preference === 1 /* FromTop */) {
      this._visibleLineCountTop.set(this._visibleLineCountTop.get() + top2, tx);
    } else {
      this._visibleLineCountBottom.set(this._visibleLineCountBottom.get() + bottom, tx);
    }
  }
  showOriginalLine(lineNumber, preference, tx) {
    const top2 = lineNumber - this.originalLineNumber;
    const bottom = this.originalLineNumber + this.lineCount - lineNumber;
    if (preference === 0 /* FromCloserSide */ && top2 < bottom || preference === 1 /* FromTop */) {
      this._visibleLineCountTop.set(Math.min(this._visibleLineCountTop.get() + bottom - top2, this.getMaxVisibleLineCountTop()), tx);
    } else {
      this._visibleLineCountBottom.set(Math.min(this._visibleLineCountBottom.get() + top2 - bottom, this.getMaxVisibleLineCountBottom()), tx);
    }
  }
  collapseAll(tx) {
    this._visibleLineCountTop.set(0, tx);
    this._visibleLineCountBottom.set(0, tx);
  }
  setState(visibleLineCountTop, visibleLineCountBottom, tx) {
    visibleLineCountTop = Math.max(Math.min(visibleLineCountTop, this.lineCount), 0);
    visibleLineCountBottom = Math.max(Math.min(visibleLineCountBottom, this.lineCount - visibleLineCountTop), 0);
    this._visibleLineCountTop.set(visibleLineCountTop, tx);
    this._visibleLineCountBottom.set(visibleLineCountBottom, tx);
  }
};

function applyOriginalEdits(diff4, textEdits, originalTextModel, modifiedTextModel) {
  return void 0;
}

function applyModifiedEdits(diff4, textEdits, originalTextModel, modifiedTextModel) {
  return void 0;
}
export { normalizeDocumentDiff, normalizeRangeMapping, applyOriginalEdits, applyModifiedEdits, DiffEditorViewModel, DiffState, DiffMapping, UnchangedRegion };
