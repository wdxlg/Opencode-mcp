// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/features/movedBlocksLinesFeature.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { OffsetRange, OffsetRangeSet } from "./module-0144.mjs";
import { booleanComparator, compareBy, numberComparator, tieBreakComparators } from "./module-0007.mjs";
import { autorun, autorunHandleChanges, autorunWithStore } from "./module-0052.mjs";
import { recomputeInitiallyAndOnChange } from "./module-0059.mjs";
import { PlaceholderViewZone, ViewZoneOverlayWidget, applyStyle, applyViewZones } from "./module-0478.mjs";
import { constObservable } from "./module-0061.mjs";
import { findMaxIdx } from "./module-0006.mjs";
import { h } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { ActionBar } from "./module-0477.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/editor/browser/widget/diffEditor/features/movedBlocksLinesFeature.ts
var MovedBlocksLinesFeature = class _MovedBlocksLinesFeature extends Disposable {
  constructor(_rootElement, _diffModel, _originalEditorLayoutInfo, _modifiedEditorLayoutInfo, _editors) {
    super();
    this._rootElement = _rootElement;
    this._diffModel = _diffModel;
    this._originalEditorLayoutInfo = _originalEditorLayoutInfo;
    this._modifiedEditorLayoutInfo = _modifiedEditorLayoutInfo;
    this._editors = _editors;
    this._originalScrollTop = observableFromEvent(this, this._editors.original.onDidScrollChange, () => this._editors.original.getScrollTop());
    this._modifiedScrollTop = observableFromEvent(this, this._editors.modified.onDidScrollChange, () => this._editors.modified.getScrollTop());
    this._viewZonesChanged = observableSignalFromEvent("onDidChangeViewZones", this._editors.modified.onDidChangeViewZones);
    this.width = observableValue(this, 0);
    this._modifiedViewZonesChangedSignal = observableSignalFromEvent("modified.onDidChangeViewZones", this._editors.modified.onDidChangeViewZones);
    this._originalViewZonesChangedSignal = observableSignalFromEvent("original.onDidChangeViewZones", this._editors.original.onDidChangeViewZones);
    this._state = derived(this, (reader) => {
      this._element.replaceChildren();
      const model = this._diffModel.read(reader);
      const moves = model?.diff.read(reader)?.movedTexts;
      if (!moves || moves.length === 0) {
        this.width.set(0, void 0);
        return;
      }
      this._viewZonesChanged.read(reader);
      const infoOrig = this._originalEditorLayoutInfo.read(reader);
      const infoMod = this._modifiedEditorLayoutInfo.read(reader);
      if (!infoOrig || !infoMod) {
        this.width.set(0, void 0);
        return;
      }
      this._modifiedViewZonesChangedSignal.read(reader);
      this._originalViewZonesChangedSignal.read(reader);
      const lines = moves.map((move2) => {
        function computeLineStart(range2, editor) {
          const t1 = editor.getTopForLineNumber(range2.startLineNumber, true);
          const t2 = editor.getTopForLineNumber(range2.endLineNumberExclusive, true);
          return (t1 + t2) / 2;
        }
        const start = computeLineStart(move2.lineRangeMapping.original, this._editors.original);
        const startOffset = this._originalScrollTop.read(reader);
        const end = computeLineStart(move2.lineRangeMapping.modified, this._editors.modified);
        const endOffset = this._modifiedScrollTop.read(reader);
        const from = start - startOffset;
        const to = end - endOffset;
        const top2 = Math.min(start, end);
        const bottom = Math.max(start, end);
        return { range: new OffsetRange(top2, bottom), from, to, fromWithoutScroll: start, toWithoutScroll: end, move: move2 };
      });
      lines.sort(tieBreakComparators(
        compareBy((l) => l.fromWithoutScroll > l.toWithoutScroll, booleanComparator),
        compareBy((l) => l.fromWithoutScroll > l.toWithoutScroll ? l.fromWithoutScroll : -l.toWithoutScroll, numberComparator)
      ));
      const layout2 = LinesLayout2.compute(lines.map((l) => l.range));
      const padding = 10;
      const lineAreaLeft = infoOrig.verticalScrollbarWidth;
      const lineAreaWidth = (layout2.getTrackCount() - 1) * 10 + padding * 2;
      const width2 = lineAreaLeft + lineAreaWidth + (infoMod.contentLeft - _MovedBlocksLinesFeature.movedCodeBlockPadding);
      let idx = 0;
      for (const line of lines) {
        const track = layout2.getTrack(idx);
        const verticalY = lineAreaLeft + padding + track * 10;
        const arrowHeight = 15;
        const arrowWidth = 15;
        const right = width2;
        const rectWidth = infoMod.glyphMarginWidth + infoMod.lineNumbersWidth;
        const rectHeight = 18;
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.classList.add("arrow-rectangle");
        rect.setAttribute("x", `${right - rectWidth}`);
        rect.setAttribute("y", `${line.to - rectHeight / 2}`);
        rect.setAttribute("width", `${rectWidth}`);
        rect.setAttribute("height", `${rectHeight}`);
        this._element.appendChild(rect);
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${0} ${line.from} L ${verticalY} ${line.from} L ${verticalY} ${line.to} L ${right - arrowWidth} ${line.to}`);
        path.setAttribute("fill", "none");
        g.appendChild(path);
        const arrowRight = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        arrowRight.classList.add("arrow");
        reader.store.add(autorun((reader2) => {
          path.classList.toggle("currentMove", line.move === model.activeMovedText.read(reader2));
          arrowRight.classList.toggle("currentMove", line.move === model.activeMovedText.read(reader2));
        }));
        arrowRight.setAttribute("points", `${right - arrowWidth},${line.to - arrowHeight / 2} ${right},${line.to} ${right - arrowWidth},${line.to + arrowHeight / 2}`);
        g.appendChild(arrowRight);
        this._element.appendChild(g);
        idx++;
      }
      this.width.set(lineAreaWidth, void 0);
    });
    this._element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this._element.setAttribute("class", "moved-blocks-lines");
    this._rootElement.appendChild(this._element);
    this._register(toDisposable(() => this._element.remove()));
    this._register(autorun((reader) => {
      const info = this._originalEditorLayoutInfo.read(reader);
      const info2 = this._modifiedEditorLayoutInfo.read(reader);
      if (!info || !info2) {
        return;
      }
      this._element.style.left = `${info.width - info.verticalScrollbarWidth}px`;
      this._element.style.height = `${info.height}px`;
      this._element.style.width = `${info.verticalScrollbarWidth + info.contentLeft - _MovedBlocksLinesFeature.movedCodeBlockPadding + this.width.read(reader)}px`;
    }));
    this._register(recomputeInitiallyAndOnChange(this._state));
    const movedBlockViewZones = derived((reader) => {
      const model = this._diffModel.read(reader);
      const d = model?.diff.read(reader);
      if (!d) {
        return [];
      }
      return d.movedTexts.map((move2) => ({
        move: move2,
        original: new PlaceholderViewZone(constObservable(move2.lineRangeMapping.original.startLineNumber - 1), 18),
        modified: new PlaceholderViewZone(constObservable(move2.lineRangeMapping.modified.startLineNumber - 1), 18)
      }));
    });
    this._register(applyViewZones(this._editors.original, movedBlockViewZones.map((zones) => (
      /** @description movedBlockViewZones.original */
      zones.map((z) => z.original)
    ))));
    this._register(applyViewZones(this._editors.modified, movedBlockViewZones.map((zones) => (
      /** @description movedBlockViewZones.modified */
      zones.map((z) => z.modified)
    ))));
    this._register(autorunWithStore((reader, store) => {
      const blocks = movedBlockViewZones.read(reader);
      for (const b of blocks) {
        store.add(new MovedBlockOverlayWidget(this._editors.original, b.original, b.move, "original", this._diffModel.get()));
        store.add(new MovedBlockOverlayWidget(this._editors.modified, b.modified, b.move, "modified", this._diffModel.get()));
      }
    }));
    const originalHasFocus = observableSignalFromEvent(
      "original.onDidFocusEditorWidget",
      (e) => this._editors.original.onDidFocusEditorWidget(() => setTimeout(() => e(void 0), 0))
    );
    const modifiedHasFocus = observableSignalFromEvent(
      "modified.onDidFocusEditorWidget",
      (e) => this._editors.modified.onDidFocusEditorWidget(() => setTimeout(() => e(void 0), 0))
    );
    let lastChangedEditor = "modified";
    this._register(autorunHandleChanges({
      changeTracker: {
        createChangeSummary: () => void 0,
        handleChange: (ctx, summary) => {
          if (ctx.didChange(originalHasFocus)) {
            lastChangedEditor = "original";
          }
          if (ctx.didChange(modifiedHasFocus)) {
            lastChangedEditor = "modified";
          }
          return true;
        }
      }
    }, (reader) => {
      originalHasFocus.read(reader);
      modifiedHasFocus.read(reader);
      const m = this._diffModel.read(reader);
      if (!m) {
        return;
      }
      const diff4 = m.diff.read(reader);
      let movedText = void 0;
      if (diff4 && lastChangedEditor === "original") {
        const originalPos = this._editors.originalCursor.read(reader);
        if (originalPos) {
          movedText = diff4.movedTexts.find((m2) => m2.lineRangeMapping.original.contains(originalPos.lineNumber));
        }
      }
      if (diff4 && lastChangedEditor === "modified") {
        const modifiedPos = this._editors.modifiedCursor.read(reader);
        if (modifiedPos) {
          movedText = diff4.movedTexts.find((m2) => m2.lineRangeMapping.modified.contains(modifiedPos.lineNumber));
        }
      }
      if (movedText !== m.movedTextToCompare.read(void 0)) {
        m.movedTextToCompare.set(void 0, void 0);
      }
      m.setActiveMovedText(movedText);
    }));
  }
  static {
    this.movedCodeBlockPadding = 4;
  }
};

var LinesLayout2 = class _LinesLayout {
  constructor(_trackCount, trackPerLineIdx) {
    this._trackCount = _trackCount;
    this.trackPerLineIdx = trackPerLineIdx;
  }
  static compute(lines) {
    const setsPerTrack = [];
    const trackPerLineIdx = [];
    for (const line of lines) {
      let trackIdx = setsPerTrack.findIndex((set) => !set.intersectsStrict(line));
      if (trackIdx === -1) {
        const maxTrackCount = 6;
        if (setsPerTrack.length >= maxTrackCount) {
          trackIdx = findMaxIdx(setsPerTrack, compareBy((set) => set.intersectWithRangeLength(line), numberComparator));
        } else {
          trackIdx = setsPerTrack.length;
          setsPerTrack.push(new OffsetRangeSet());
        }
      }
      setsPerTrack[trackIdx].addRange(line);
      trackPerLineIdx.push(trackIdx);
    }
    return new _LinesLayout(setsPerTrack.length, trackPerLineIdx);
  }
  getTrack(lineIdx) {
    return this.trackPerLineIdx[lineIdx];
  }
  getTrackCount() {
    return this._trackCount;
  }
};

var MovedBlockOverlayWidget = class extends ViewZoneOverlayWidget {
  constructor(_editor, _viewZone, _move, _kind, _diffModel) {
    const root = h("div.diff-hidden-lines-widget");
    super(_editor, _viewZone, root.root);
    this._editor = _editor;
    this._move = _move;
    this._kind = _kind;
    this._diffModel = _diffModel;
    this._nodes = h("div.diff-moved-code-block", { style: { marginRight: "4px" } }, [
      h("div.text-content@textContent"),
      h("div.action-bar@actionBar")
    ]);
    root.root.appendChild(this._nodes.root);
    const editorLayout = observableFromEvent(this._editor.onDidLayoutChange, () => this._editor.getLayoutInfo());
    this._register(applyStyle(this._nodes.root, {
      paddingRight: editorLayout.map((l) => l.verticalScrollbarWidth)
    }));
    let text2;
    if (_move.changes.length > 0) {
      text2 = this._kind === "original" ? localize(
        256,
        null,
        this._move.lineRangeMapping.modified.startLineNumber,
        this._move.lineRangeMapping.modified.endLineNumberExclusive - 1
      ) : localize(
        254,
        null,
        this._move.lineRangeMapping.original.startLineNumber,
        this._move.lineRangeMapping.original.endLineNumberExclusive - 1
      );
    } else {
      text2 = this._kind === "original" ? localize(
        255,
        null,
        this._move.lineRangeMapping.modified.startLineNumber,
        this._move.lineRangeMapping.modified.endLineNumberExclusive - 1
      ) : localize(
        253,
        null,
        this._move.lineRangeMapping.original.startLineNumber,
        this._move.lineRangeMapping.original.endLineNumberExclusive - 1
      );
    }
    const actionBar3 = this._register(new ActionBar(this._nodes.actionBar, {
      highlightToggledItems: true
    }));
    const caption = this._register(new Action(
      "",
      text2,
      "",
      false
    ));
    actionBar3.push(caption, { icon: false, label: true });
    const actionCompare = this._register(new Action(
      "",
      "Compare",
      ThemeIcon.asClassName(Codicon.compareChanges),
      true,
      () => {
        this._editor.focus();
        this._diffModel.movedTextToCompare.set(this._diffModel.movedTextToCompare.get() === _move ? void 0 : this._move, void 0);
      }
    ));
    this._register(autorun((reader) => {
      const isActive2 = this._diffModel.movedTextToCompare.read(reader) === _move;
      actionCompare.checked = isActive2;
    }));
    actionBar3.push(actionCompare, { icon: false, label: true });
  }
};
export { MovedBlocksLinesFeature, LinesLayout2, MovedBlockOverlayWidget };
