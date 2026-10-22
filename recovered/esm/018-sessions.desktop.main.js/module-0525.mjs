// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/features/hideUnchangedRegionsFeature.ts
import { Disposable } from "./module-0012.mjs";
import { derived, derivedDisposable } from "./module-0054.mjs";
import { transaction } from "./module-0045.mjs";
import { PlaceholderViewZone, ViewZoneOverlayWidget, applyObservableDecorations, applyStyle } from "./module-0478.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { LineRange } from "./module-0174.mjs";
import { autorun } from "./module-0052.mjs";
import { isDefined } from "./module-0010.mjs";
import { observableValue } from "./module-0048.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { $, addDisposableListener, getWindow, h, reset } from "./module-0075.mjs";
import { renderIcon, renderLabelWithIcons } from "./module-0467.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { SymbolKinds } from "./module-0164.mjs";


// src/vs/editor/browser/widget/diffEditor/features/hideUnchangedRegionsFeature.ts
var HideUnchangedRegionsFeature = class extends Disposable {
  constructor(_editors, _diffModel, _options, _runWithOriginalEditorScrollAnchor, _runWithModifiedEditorScrollAnchor, _instantiationService) {
    super();
    this._editors = _editors;
    this._diffModel = _diffModel;
    this._options = _options;
    this._runWithOriginalEditorScrollAnchor = _runWithOriginalEditorScrollAnchor;
    this._runWithModifiedEditorScrollAnchor = _runWithModifiedEditorScrollAnchor;
    this._instantiationService = _instantiationService;
    this._modifiedOutlineSource = derivedDisposable(this, (reader) => {
      const m = this._editors.modifiedModel.read(reader);
      const factory = HideUnchangedRegionsFeature._breadcrumbsSourceFactory.read(reader);
      return !m || !factory ? void 0 : factory(m, this._instantiationService);
    });
    this._isUpdatingHiddenAreas = false;
    this._register(this._editors.original.onDidChangeCursorPosition((e4) => {
      if (e4.reason === 1 /* ContentFlush */) {
        return;
      }
      const m = this._diffModel.get();
      transaction((tx) => {
        for (const s of this._editors.original.getSelections() || []) {
          m?.ensureOriginalLineIsVisible(s.getStartPosition().lineNumber, 0 /* FromCloserSide */, tx);
          m?.ensureOriginalLineIsVisible(s.getEndPosition().lineNumber, 0 /* FromCloserSide */, tx);
        }
      });
    }));
    this._register(this._editors.modified.onDidChangeCursorPosition((e4) => {
      if (e4.reason === 1 /* ContentFlush */) {
        return;
      }
      const m = this._diffModel.get();
      transaction((tx) => {
        for (const s of this._editors.modified.getSelections() || []) {
          m?.ensureModifiedLineIsVisible(s.getStartPosition().lineNumber, 0 /* FromCloserSide */, tx);
          m?.ensureModifiedLineIsVisible(s.getEndPosition().lineNumber, 0 /* FromCloserSide */, tx);
        }
      });
    }));
    const unchangedRegions = this._diffModel.map((m, reader) => {
      const regions = m?.unchangedRegions.read(reader) ?? [];
      if (regions.length === 1 && regions[0].modifiedLineNumber === 1 && regions[0].lineCount === this._editors.modifiedModel.read(reader)?.getLineCount()) {
        return [];
      }
      return regions;
    });
    this.viewZones = derived(this, (reader) => {
      const modifiedOutlineSource = this._modifiedOutlineSource.read(reader);
      if (!modifiedOutlineSource) {
        return { origViewZones: [], modViewZones: [] };
      }
      const origViewZones = [];
      const modViewZones = [];
      const sideBySide = this._options.renderSideBySide.read(reader);
      const compactMode = this._options.compactMode.read(reader);
      const curUnchangedRegions = unchangedRegions.read(reader);
      for (let i2 = 0; i2 < curUnchangedRegions.length; i2++) {
        const r2 = curUnchangedRegions[i2];
        if (r2.shouldHideControls(reader)) {
          continue;
        }
        if (compactMode && (i2 === 0 || i2 === curUnchangedRegions.length - 1)) {
          continue;
        }
        if (compactMode) {
          {
            const d = derived(this, (reader2) => (
              /** @description hiddenOriginalRangeStart */
              r2.getHiddenOriginalRange(reader2).startLineNumber - 1
            ));
            const origVz = new PlaceholderViewZone(d, 12);
            origViewZones.push(origVz);
            reader.store.add(new CompactCollapsedCodeOverlayWidget(
              this._editors.original,
              origVz,
              r2,
              !sideBySide
            ));
          }
          {
            const d = derived(this, (reader2) => (
              /** @description hiddenModifiedRangeStart */
              r2.getHiddenModifiedRange(reader2).startLineNumber - 1
            ));
            const modViewZone = new PlaceholderViewZone(d, 12);
            modViewZones.push(modViewZone);
            reader.store.add(new CompactCollapsedCodeOverlayWidget(
              this._editors.modified,
              modViewZone,
              r2
            ));
          }
        } else {
          {
            const d = derived(this, (reader2) => (
              /** @description hiddenOriginalRangeStart */
              r2.getHiddenOriginalRange(reader2).startLineNumber - 1
            ));
            const origVz = new PlaceholderViewZone(d, 24);
            origViewZones.push(origVz);
            reader.store.add(new CollapsedCodeOverlayWidget(
              this._editors.original,
              origVz,
              r2,
              r2.originalUnchangedRange,
              !sideBySide,
              modifiedOutlineSource,
              (l) => this._diffModel.get().ensureModifiedLineIsVisible(l, 2 /* FromBottom */, void 0),
              this._options,
              this._runWithOriginalEditorScrollAnchor
            ));
          }
          {
            const d = derived(this, (reader2) => (
              /** @description hiddenModifiedRangeStart */
              r2.getHiddenModifiedRange(reader2).startLineNumber - 1
            ));
            const modViewZone = new PlaceholderViewZone(d, 24);
            modViewZones.push(modViewZone);
            reader.store.add(new CollapsedCodeOverlayWidget(
              this._editors.modified,
              modViewZone,
              r2,
              r2.modifiedUnchangedRange,
              false,
              modifiedOutlineSource,
              (l) => this._diffModel.get().ensureModifiedLineIsVisible(l, 2 /* FromBottom */, void 0),
              this._options,
              this._runWithModifiedEditorScrollAnchor
            ));
          }
        }
      }
      return { origViewZones, modViewZones };
    });
    const unchangedLinesDecoration = {
      description: "unchanged lines",
      className: "diff-unchanged-lines",
      isWholeLine: true
    };
    const unchangedLinesDecorationShow = {
      description: "Fold Unchanged",
      glyphMarginHoverMessage: new MarkdownString(void 0, { isTrusted: true, supportThemeIcons: true }).appendMarkdown(localize(250, null)),
      glyphMarginClassName: "fold-unchanged " + ThemeIcon.asClassName(Codicon.fold),
      zIndex: 10001
    };
    this._register(applyObservableDecorations(this._editors.original, derived(this, (reader) => {
      const curUnchangedRegions = unchangedRegions.read(reader);
      const result = curUnchangedRegions.map((r2) => ({
        range: r2.originalUnchangedRange.toInclusiveRange(),
        options: unchangedLinesDecoration
      }));
      for (const r2 of curUnchangedRegions) {
        if (r2.shouldHideControls(reader)) {
          result.push({
            range: Range2.fromPositions(new Position(r2.originalLineNumber, 1)),
            options: unchangedLinesDecorationShow
          });
        }
      }
      return result;
    })));
    this._register(applyObservableDecorations(this._editors.modified, derived(this, (reader) => {
      const curUnchangedRegions = unchangedRegions.read(reader);
      const result = curUnchangedRegions.map((r2) => ({
        range: r2.modifiedUnchangedRange.toInclusiveRange(),
        options: unchangedLinesDecoration
      }));
      for (const r2 of curUnchangedRegions) {
        if (r2.shouldHideControls(reader)) {
          result.push({
            range: LineRange.ofLength(r2.modifiedLineNumber, 1).toInclusiveRange(),
            options: unchangedLinesDecorationShow
          });
        }
      }
      return result;
    })));
    this._register(autorun((reader) => {
      const curUnchangedRegions = unchangedRegions.read(reader);
      this._isUpdatingHiddenAreas = true;
      try {
        this._editors.original.setHiddenAreas(curUnchangedRegions.map((r2) => r2.getHiddenOriginalRange(reader).toInclusiveRange()).filter(isDefined));
        this._editors.modified.setHiddenAreas(curUnchangedRegions.map((r2) => r2.getHiddenModifiedRange(reader).toInclusiveRange()).filter(isDefined));
      } finally {
        this._isUpdatingHiddenAreas = false;
      }
    }));
    this._register(this._editors.modified.onMouseUp((event) => {
      if (!event.event.rightButton && event.target.position && event.target.element?.className.includes("fold-unchanged")) {
        const lineNumber = event.target.position.lineNumber;
        const model = this._diffModel.get();
        if (!model) {
          return;
        }
        const region = model.unchangedRegions.get().find((r2) => r2.modifiedUnchangedRange.contains(lineNumber));
        if (!region) {
          return;
        }
        region.collapseAll(void 0);
        event.event.stopPropagation();
        event.event.preventDefault();
      }
    }));
    this._register(this._editors.original.onMouseUp((event) => {
      if (!event.event.rightButton && event.target.position && event.target.element?.className.includes("fold-unchanged")) {
        const lineNumber = event.target.position.lineNumber;
        const model = this._diffModel.get();
        if (!model) {
          return;
        }
        const region = model.unchangedRegions.get().find((r2) => r2.originalUnchangedRange.contains(lineNumber));
        if (!region) {
          return;
        }
        region.collapseAll(void 0);
        event.event.stopPropagation();
        event.event.preventDefault();
      }
    }));
  }
  static {
    this._breadcrumbsSourceFactory = observableValue(
      this,
      () => ({
        dispose() {
        },
        getBreadcrumbItems(startRange, reader) {
          return [];
        },
        getAt: () => []
      })
    );
  }
  static setBreadcrumbsSourceFactory(factory) {
    this._breadcrumbsSourceFactory.set(factory, void 0);
  }
  get isUpdatingHiddenAreas() {
    return this._isUpdatingHiddenAreas;
  }
};

HideUnchangedRegionsFeature = __decorateClass([
  __decorateParam(5, IInstantiationService)
], HideUnchangedRegionsFeature);

var CompactCollapsedCodeOverlayWidget = class extends ViewZoneOverlayWidget {
  constructor(editor, _viewZone, _unchangedRegion, _hide = false) {
    const root = h("div.diff-hidden-lines-widget");
    super(editor, _viewZone, root.root);
    this._unchangedRegion = _unchangedRegion;
    this._hide = _hide;
    this._nodes = h("div.diff-hidden-lines-compact", [
      h("div.line-left", []),
      h("div.text@text", []),
      h("div.line-right", [])
    ]);
    root.root.appendChild(this._nodes.root);
    if (this._hide) {
      this._nodes.root.replaceChildren();
    }
    this._register(autorun((reader) => {
      if (!this._hide) {
        const lineCount = this._unchangedRegion.getHiddenModifiedRange(reader).length;
        const linesHiddenText = localize(251, null, lineCount);
        this._nodes.text.innerText = linesHiddenText;
      }
    }));
  }
};

var CollapsedCodeOverlayWidget = class extends ViewZoneOverlayWidget {
  constructor(_editor, _viewZone, _unchangedRegion, _unchangedRegionRange, _hide, _modifiedOutlineSource, _revealModifiedHiddenLine, _options, _runWithScrollAnchor) {
    const root = h("div.diff-hidden-lines-widget");
    super(_editor, _viewZone, root.root);
    this._editor = _editor;
    this._unchangedRegion = _unchangedRegion;
    this._unchangedRegionRange = _unchangedRegionRange;
    this._hide = _hide;
    this._modifiedOutlineSource = _modifiedOutlineSource;
    this._revealModifiedHiddenLine = _revealModifiedHiddenLine;
    this._options = _options;
    this._runWithScrollAnchor = _runWithScrollAnchor;
    this._nodes = h("div.diff-hidden-lines", [
      h("div.top@top", { title: localize(249, null) }),
      h("div.center@content", { style: { display: "flex" } }, [
        h(
          "div@first",
          { style: { display: "flex", justifyContent: "center", alignItems: "center", flexShrink: "0" } },
          [$(
            "a",
            { title: localize(252, null), role: "button", onclick: () => {
              this._unchangedRegion.showAll(void 0);
            } },
            ...renderLabelWithIcons("$(unfold)")
          )]
        ),
        h("div@others", { style: { display: "flex", justifyContent: "center", alignItems: "center" } })
      ]),
      h("div.bottom@bottom", { title: localize(247, null), role: "button" })
    ]);
    root.root.appendChild(this._nodes.root);
    if (!this._hide) {
      this._register(applyStyle(this._nodes.first, { width: observableCodeEditor(this._editor).layoutInfoContentLeft }));
    } else {
      reset(this._nodes.first);
    }
    this._register(autorun((reader) => {
      const isFullyRevealed = this._unchangedRegion.visibleLineCountTop.read(reader) + this._unchangedRegion.visibleLineCountBottom.read(reader) === this._unchangedRegion.lineCount;
      this._nodes.bottom.classList.toggle("canMoveTop", !isFullyRevealed);
      this._nodes.bottom.classList.toggle("canMoveBottom", this._unchangedRegion.visibleLineCountBottom.read(reader) > 0);
      this._nodes.top.classList.toggle("canMoveTop", this._unchangedRegion.visibleLineCountTop.read(reader) > 0);
      this._nodes.top.classList.toggle("canMoveBottom", !isFullyRevealed);
      const isDragged = this._unchangedRegion.isDragged.read(reader);
      const domNode = this._editor.getDomNode();
      if (domNode) {
        domNode.classList.toggle("draggingUnchangedRegion", !!isDragged);
        if (isDragged === "top") {
          domNode.classList.toggle("canMoveTop", this._unchangedRegion.visibleLineCountTop.read(reader) > 0);
          domNode.classList.toggle("canMoveBottom", !isFullyRevealed);
        } else if (isDragged === "bottom") {
          domNode.classList.toggle("canMoveTop", !isFullyRevealed);
          domNode.classList.toggle("canMoveBottom", this._unchangedRegion.visibleLineCountBottom.read(reader) > 0);
        } else {
          domNode.classList.toggle("canMoveTop", false);
          domNode.classList.toggle("canMoveBottom", false);
        }
      }
    }));
    const editor = this._editor;
    this._register(addDisposableListener(this._nodes.top, "mousedown", (e4) => {
      if (e4.button !== 0) {
        return;
      }
      this._nodes.top.classList.toggle("dragging", true);
      this._nodes.root.classList.toggle("dragging", true);
      e4.preventDefault();
      const startTop = e4.clientY;
      let didMove = false;
      const cur = this._unchangedRegion.visibleLineCountTop.get();
      this._unchangedRegion.isDragged.set("top", void 0);
      const window2 = getWindow(this._nodes.top);
      const mouseMoveListener = addDisposableListener(window2, "mousemove", (e5) => {
        const currentTop = e5.clientY;
        const delta2 = currentTop - startTop;
        didMove = didMove || Math.abs(delta2) > 2;
        const lineDelta = Math.round(delta2 / editor.getOption(75 /* lineHeight */));
        const newVal = Math.max(0, Math.min(cur + lineDelta, this._unchangedRegion.getMaxVisibleLineCountTop()));
        this._unchangedRegion.visibleLineCountTop.set(newVal, void 0);
      });
      const mouseUpListener = addDisposableListener(window2, "mouseup", (e5) => {
        if (!didMove) {
          this._unchangedRegion.showMoreAbove(this._options.hideUnchangedRegionsRevealLineCount.get(), void 0);
        }
        this._nodes.top.classList.toggle("dragging", false);
        this._nodes.root.classList.toggle("dragging", false);
        this._unchangedRegion.isDragged.set(void 0, void 0);
        mouseMoveListener.dispose();
        mouseUpListener.dispose();
      });
    }));
    this._register(addDisposableListener(this._nodes.bottom, "mousedown", (e4) => {
      if (e4.button !== 0) {
        return;
      }
      this._nodes.bottom.classList.toggle("dragging", true);
      this._nodes.root.classList.toggle("dragging", true);
      e4.preventDefault();
      const startTop = e4.clientY;
      let didMove = false;
      const cur = this._unchangedRegion.visibleLineCountBottom.get();
      this._unchangedRegion.isDragged.set("bottom", void 0);
      const window2 = getWindow(this._nodes.bottom);
      const mouseMoveListener = addDisposableListener(window2, "mousemove", (e5) => {
        const currentTop = e5.clientY;
        const delta2 = currentTop - startTop;
        didMove = didMove || Math.abs(delta2) > 2;
        const lineDelta = Math.round(delta2 / editor.getOption(75 /* lineHeight */));
        const newVal = Math.max(0, Math.min(cur - lineDelta, this._unchangedRegion.getMaxVisibleLineCountBottom()));
        if (newVal === this._unchangedRegion.visibleLineCountBottom.get()) {
          return;
        }
        this._runWithLowerScrollAnchor(() => this._unchangedRegion.visibleLineCountBottom.set(newVal, void 0));
      });
      const mouseUpListener = addDisposableListener(window2, "mouseup", (e5) => {
        this._unchangedRegion.isDragged.set(void 0, void 0);
        if (!didMove) {
          this._runWithLowerScrollAnchor(() => this._unchangedRegion.showMoreBelow(this._options.hideUnchangedRegionsRevealLineCount.get(), void 0));
        }
        this._nodes.bottom.classList.toggle("dragging", false);
        this._nodes.root.classList.toggle("dragging", false);
        mouseMoveListener.dispose();
        mouseUpListener.dispose();
      });
    }));
    this._register(autorun((reader) => {
      const children = [];
      if (!this._hide) {
        const lineCount = _unchangedRegion.getHiddenModifiedRange(reader).length;
        const linesHiddenText = localize(251, null, lineCount);
        const span = $("span", { title: localize(248, null) }, linesHiddenText);
        span.addEventListener("dblclick", (e4) => {
          if (e4.button !== 0) {
            return;
          }
          e4.preventDefault();
          this._unchangedRegion.showAll(void 0);
        });
        children.push(span);
        const range2 = this._unchangedRegion.getHiddenModifiedRange(reader);
        const items = this._modifiedOutlineSource.getBreadcrumbItems(range2, reader);
        if (items.length > 0) {
          children.push($("span", void 0, "\xA0\xA0|\xA0\xA0"));
          for (let i2 = 0; i2 < items.length; i2++) {
            const item = items[i2];
            const icon2 = SymbolKinds.toIcon(item.kind);
            const divItem = h("div.breadcrumb-item", {
              style: { display: "flex", alignItems: "center" }
            }, [
              renderIcon(icon2),
              "\xA0",
              item.name,
              ...i2 === items.length - 1 ? [] : [renderIcon(Codicon.chevronRight)]
            ]).root;
            children.push(divItem);
            divItem.onclick = () => {
              this._revealModifiedHiddenLine(item.startLineNumber);
            };
          }
        }
      }
      reset(this._nodes.others, ...children);
    }));
  }
  _runWithLowerScrollAnchor(update) {
    const anchorLineNumber = this._unchangedRegionRange.endLineNumberExclusive;
    if (this._runWithScrollAnchor) {
      this._runWithScrollAnchor(anchorLineNumber, update);
      return;
    }
    const scrollTop = this._editor.getScrollTop();
    const top2 = this._getTopForLineNumber(anchorLineNumber);
    update();
    this._editor.setScrollTop(scrollTop + this._getTopForLineNumber(anchorLineNumber) - top2);
  }
  _getTopForLineNumber(lineNumber) {
    return lineNumber > this._editor.getModel().getLineCount() ? this._editor.getContentHeight() : this._editor.getTopForLineNumber(lineNumber);
  }
};
export { HideUnchangedRegionsFeature, CompactCollapsedCodeOverlayWidget, CollapsedCodeOverlayWidget };
