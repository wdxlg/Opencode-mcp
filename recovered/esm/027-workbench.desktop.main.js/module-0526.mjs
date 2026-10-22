// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/features/revertButtonsFeature.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { derived } from "./module-0054.mjs";
import { LineRange, LineRangeSet } from "./module-0174.mjs";
import { Range2 } from "./module-0106.mjs";
import { autorunWithStore } from "./module-0052.mjs";
import { EventType, addDisposableListener, h } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { LineRangeMapping } from "./module-0179.mjs";


// src/vs/editor/browser/widget/diffEditor/features/revertButtonsFeature.ts
var emptyArr3 = [];

var RevertButtonsFeature = class extends Disposable {
  constructor(_editors, _diffModel, _options, _widget) {
    super();
    this._editors = _editors;
    this._diffModel = _diffModel;
    this._options = _options;
    this._widget = _widget;
    this._selectedDiffs = derived(this, (reader) => {
      const model = this._diffModel.read(reader);
      const diff4 = model?.diff.read(reader);
      if (!diff4) {
        return emptyArr3;
      }
      const selections = this._editors.modifiedSelections.read(reader);
      if (selections.every((s) => s.isEmpty())) {
        return emptyArr3;
      }
      const selectedLineNumbers = new LineRangeSet(selections.map((s) => LineRange.fromRangeInclusive(s)));
      const selectedMappings = diff4.mappings.filter(
        (m) => m.lineRangeMapping.innerChanges && selectedLineNumbers.intersects(m.lineRangeMapping.modified)
      );
      const result = selectedMappings.map((mapping2) => ({
        mapping: mapping2,
        rangeMappings: mapping2.lineRangeMapping.innerChanges.filter(
          (c) => selections.some((s) => Range2.areIntersecting(c.modifiedRange, s))
        )
      }));
      if (result.length === 0 || result.every((r2) => r2.rangeMappings.length === 0)) {
        return emptyArr3;
      }
      return result;
    });
    this._register(autorunWithStore((reader, store) => {
      if (!this._options.shouldRenderOldRevertArrows.read(reader)) {
        return;
      }
      const model = this._diffModel.read(reader);
      const diff4 = model?.diff.read(reader);
      if (!model || !diff4) {
        return;
      }
      if (model.movedTextToCompare.read(reader)) {
        return;
      }
      const glyphWidgetsModified = [];
      const selectedDiffs = this._selectedDiffs.read(reader);
      const selectedDiffsSet = new Set(selectedDiffs.map((d) => d.mapping));
      if (selectedDiffs.length > 0) {
        const selections = this._editors.modifiedSelections.read(reader);
        const btn = store.add(new RevertButton(
          selections[selections.length - 1].positionLineNumber,
          this._widget,
          selectedDiffs.flatMap((d) => d.rangeMappings),
          true
        ));
        this._editors.modified.addGlyphMarginWidget(btn);
        glyphWidgetsModified.push(btn);
      }
      for (const m of diff4.mappings) {
        if (selectedDiffsSet.has(m)) {
          continue;
        }
        if (!m.lineRangeMapping.modified.isEmpty && m.lineRangeMapping.innerChanges) {
          const btn = store.add(new RevertButton(
            m.lineRangeMapping.modified.startLineNumber,
            this._widget,
            m.lineRangeMapping,
            false
          ));
          this._editors.modified.addGlyphMarginWidget(btn);
          glyphWidgetsModified.push(btn);
        }
      }
      store.add(toDisposable(() => {
        for (const w of glyphWidgetsModified) {
          this._editors.modified.removeGlyphMarginWidget(w);
        }
      }));
    }));
  }
};

var RevertButton = class _RevertButton extends Disposable {
  constructor(_lineNumber, _widget, _diffs, _revertSelection) {
    super();
    this._lineNumber = _lineNumber;
    this._widget = _widget;
    this._diffs = _diffs;
    this._revertSelection = _revertSelection;
    this._id = `revertButton${_RevertButton.counter++}`;
    this._domNode = h(
      "div.revertButton",
      {
        title: this._revertSelection ? localize(258, null) : localize(257, null)
      },
      [renderIcon(Codicon.arrowRight)]
    ).root;
    this._register(addDisposableListener(this._domNode, EventType.MOUSE_DOWN, (e) => {
      if (e.button !== 2) {
        e.stopPropagation();
        e.preventDefault();
      }
    }));
    this._register(addDisposableListener(this._domNode, EventType.MOUSE_UP, (e) => {
      e.stopPropagation();
      e.preventDefault();
    }));
    this._register(addDisposableListener(this._domNode, EventType.CLICK, (e) => {
      if (this._diffs instanceof LineRangeMapping) {
        this._widget.revert(this._diffs);
      } else {
        this._widget.revertRangeMappings(this._diffs);
      }
      e.stopPropagation();
      e.preventDefault();
    }));
  }
  static {
    this.counter = 0;
  }
  getId() {
    return this._id;
  }
  /**
   * Get the dom node of the glyph widget.
   */
  getDomNode() {
    return this._domNode;
  }
  /**
   * Get the placement of the glyph widget.
   */
  getPosition() {
    return {
      lane: 3 /* Right */,
      range: {
        startColumn: 1,
        startLineNumber: this._lineNumber,
        endColumn: 1,
        endLineNumber: this._lineNumber
      },
      zIndex: 10001
    };
  }
};
export { emptyArr3, RevertButtonsFeature, RevertButton };
