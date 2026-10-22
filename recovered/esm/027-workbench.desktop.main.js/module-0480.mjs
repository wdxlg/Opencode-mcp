// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/components/accessibleDiffViewer.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { derived } from "./module-0054.mjs";
import { createTrustedTypesPolicy } from "./module-0280.mjs";
import { subtransaction, transaction } from "./module-0045.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { observableValue } from "./module-0048.mjs";
import { autorun, autorunWithStore } from "./module-0052.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { forEachAdjacent, groupAdjacentBy } from "./module-0007.mjs";
import { LineRange } from "./module-0174.mjs";
import { LineRangeMapping } from "./module-0179.mjs";
import { ActionBar } from "./module-0477.mjs";
import { toAction } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { addDisposableListener, addStandardDisposableListener, reset } from "./module-0075.mjs";
import { applyStyle } from "./module-0478.mjs";
import { applyFontInfo } from "./module-0213.mjs";
import { LineTokens } from "./module-0145.mjs";
import { ViewLineRenderingData } from "./module-0315.mjs";
import { RenderLineInput, renderViewLine2 } from "./module-0246.mjs";
import { EditorFontLigatures } from "./module-0105.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/editor/browser/widget/diffEditor/components/accessibleDiffViewer.ts
var accessibleDiffViewerInsertIcon = registerIcon("diff-review-insert", Codicon.add, localize(221, null));

var accessibleDiffViewerRemoveIcon = registerIcon("diff-review-remove", Codicon.remove, localize(222, null));

var accessibleDiffViewerCloseIcon = registerIcon("diff-review-close", Codicon.close, localize(220, null));

var AccessibleDiffViewer = class extends Disposable {
  constructor(_parentNode, _visible, _setVisible, _canClose, _width, _height, _diffs, _models3, _instantiationService) {
    super();
    this._parentNode = _parentNode;
    this._visible = _visible;
    this._setVisible = _setVisible;
    this._canClose = _canClose;
    this._width = _width;
    this._height = _height;
    this._diffs = _diffs;
    this._models = _models3;
    this._instantiationService = _instantiationService;
    this._state = derived(this, (reader) => {
      const visible = this._visible.read(reader);
      this._parentNode.style.visibility = visible ? "visible" : "hidden";
      if (!visible) {
        return null;
      }
      const model = reader.store.add(this._instantiationService.createInstance(ViewModel2, this._diffs, this._models, this._setVisible, this._canClose));
      const view = reader.store.add(this._instantiationService.createInstance(View2, this._parentNode, model, this._width, this._height, this._models));
      return { model, view };
    }).recomputeInitiallyAndOnChange(this._store);
  }
  static {
    this._ttPolicy = createTrustedTypesPolicy("diffReview", { createHTML: (value2) => value2 });
  }
  next() {
    transaction((tx) => {
      const isVisible = this._visible.get();
      this._setVisible(true, tx);
      if (isVisible) {
        this._state.get().model.nextGroup(tx);
      }
    });
  }
  prev() {
    transaction((tx) => {
      this._setVisible(true, tx);
      this._state.get().model.previousGroup(tx);
    });
  }
  close() {
    transaction((tx) => {
      this._setVisible(false, tx);
    });
  }
};

AccessibleDiffViewer = __decorateClass([
  __decorateParam(8, IInstantiationService)
], AccessibleDiffViewer);

var ViewModel2 = class extends Disposable {
  constructor(_diffs, _models3, _setVisible, canClose, _accessibilitySignalService) {
    super();
    this._diffs = _diffs;
    this._models = _models3;
    this._setVisible = _setVisible;
    this.canClose = canClose;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._groups = observableValue(this, []);
    this._currentGroupIdx = observableValue(this, 0);
    this._currentElementIdx = observableValue(this, 0);
    this.groups = this._groups;
    this.currentGroup = this._currentGroupIdx.map((idx, r2) => this._groups.read(r2)[idx]);
    this.currentGroupIndex = this._currentGroupIdx;
    this.currentElement = this._currentElementIdx.map((idx, r2) => this.currentGroup.read(r2)?.lines[idx]);
    this._register(autorun((reader) => {
      const diffs = this._diffs.read(reader);
      if (!diffs) {
        this._groups.set([], void 0);
        return;
      }
      const groups = computeViewElementGroups(
        diffs,
        this._models.getOriginalModel().getLineCount(),
        this._models.getModifiedModel().getLineCount()
      );
      transaction((tx) => {
        const p = this._models.getModifiedPosition();
        if (p) {
          const nextGroup = groups.findIndex((g) => p?.lineNumber < g.range.modified.endLineNumberExclusive);
          if (nextGroup !== -1) {
            this._currentGroupIdx.set(nextGroup, tx);
          }
        }
        this._groups.set(groups, tx);
      });
    }));
    this._register(autorun((reader) => {
      const currentViewItem = this.currentElement.read(reader);
      if (currentViewItem?.type === 2 /* Deleted */) {
        this._accessibilitySignalService.playSignal(AccessibilitySignal.diffLineDeleted, { source: "accessibleDiffViewer.currentElementChanged" });
      } else if (currentViewItem?.type === 3 /* Added */) {
        this._accessibilitySignalService.playSignal(AccessibilitySignal.diffLineInserted, { source: "accessibleDiffViewer.currentElementChanged" });
      }
    }));
    this._register(autorun((reader) => {
      const currentViewItem = this.currentElement.read(reader);
      if (currentViewItem && currentViewItem.type !== 0 /* Header */) {
        const lineNumber = currentViewItem.modifiedLineNumber ?? currentViewItem.diff.modified.startLineNumber;
        this._models.modifiedSetSelection(Range2.fromPositions(new Position(lineNumber, 1)));
      }
    }));
  }
  _goToGroupDelta(delta2, tx) {
    const groups = this.groups.get();
    if (!groups || groups.length <= 1) {
      return;
    }
    subtransaction(tx, (tx2) => {
      this._currentGroupIdx.set(OffsetRange.ofLength(groups.length).clipCyclic(this._currentGroupIdx.get() + delta2), tx2);
      this._currentElementIdx.set(0, tx2);
    });
  }
  nextGroup(tx) {
    this._goToGroupDelta(1, tx);
  }
  previousGroup(tx) {
    this._goToGroupDelta(-1, tx);
  }
  _goToLineDelta(delta2) {
    const group2 = this.currentGroup.get();
    if (!group2 || group2.lines.length <= 1) {
      return;
    }
    transaction((tx) => {
      this._currentElementIdx.set(OffsetRange.ofLength(group2.lines.length).clip(this._currentElementIdx.get() + delta2), tx);
    });
  }
  goToNextLine() {
    this._goToLineDelta(1);
  }
  goToPreviousLine() {
    this._goToLineDelta(-1);
  }
  goToLine(line) {
    const group2 = this.currentGroup.get();
    if (!group2) {
      return;
    }
    const idx = group2.lines.indexOf(line);
    if (idx === -1) {
      return;
    }
    transaction((tx) => {
      this._currentElementIdx.set(idx, tx);
    });
  }
  revealCurrentElementInEditor() {
    if (!this.canClose.get()) {
      return;
    }
    this._setVisible(false, void 0);
    const curElem = this.currentElement.get();
    if (curElem) {
      if (curElem.type === 2 /* Deleted */) {
        this._models.originalReveal(Range2.fromPositions(new Position(curElem.originalLineNumber, 1)));
      } else {
        this._models.modifiedReveal(
          curElem.type !== 0 /* Header */ ? Range2.fromPositions(new Position(curElem.modifiedLineNumber, 1)) : void 0
        );
      }
    }
  }
  close() {
    if (!this.canClose.get()) {
      return;
    }
    this._setVisible(false, void 0);
    this._models.modifiedFocus();
  }
};

ViewModel2 = __decorateClass([
  __decorateParam(4, IAccessibilitySignalService)
], ViewModel2);

var viewElementGroupLineMargin = 3;

function computeViewElementGroups(diffs, originalLineCount, modifiedLineCount) {
  const result = [];
  for (const g of groupAdjacentBy(diffs, (a, b) => b.modified.startLineNumber - a.modified.endLineNumberExclusive < 2 * viewElementGroupLineMargin)) {
    const viewElements = [];
    viewElements.push(new HeaderViewElement());
    const origFullRange = new LineRange(
      Math.max(1, g[0].original.startLineNumber - viewElementGroupLineMargin),
      Math.min(g[g.length - 1].original.endLineNumberExclusive + viewElementGroupLineMargin, originalLineCount + 1)
    );
    const modifiedFullRange = new LineRange(
      Math.max(1, g[0].modified.startLineNumber - viewElementGroupLineMargin),
      Math.min(g[g.length - 1].modified.endLineNumberExclusive + viewElementGroupLineMargin, modifiedLineCount + 1)
    );
    forEachAdjacent(g, (a, b) => {
      const origRange = new LineRange(a ? a.original.endLineNumberExclusive : origFullRange.startLineNumber, b ? b.original.startLineNumber : origFullRange.endLineNumberExclusive);
      const modifiedRange2 = new LineRange(a ? a.modified.endLineNumberExclusive : modifiedFullRange.startLineNumber, b ? b.modified.startLineNumber : modifiedFullRange.endLineNumberExclusive);
      origRange.forEach((origLineNumber) => {
        viewElements.push(new UnchangedLineViewElement(origLineNumber, modifiedRange2.startLineNumber + (origLineNumber - origRange.startLineNumber)));
      });
      if (b) {
        b.original.forEach((origLineNumber) => {
          viewElements.push(new DeletedLineViewElement(b, origLineNumber));
        });
        b.modified.forEach((modifiedLineNumber) => {
          viewElements.push(new AddedLineViewElement(b, modifiedLineNumber));
        });
      }
    });
    const modifiedRange = g[0].modified.join(g[g.length - 1].modified);
    const originalRange = g[0].original.join(g[g.length - 1].original);
    result.push(new ViewElementGroup(new LineRangeMapping(modifiedRange, originalRange), viewElements));
  }
  return result;
}

var ViewElementGroup = class {
  constructor(range2, lines) {
    this.range = range2;
    this.lines = lines;
  }
};

var HeaderViewElement = class {
  constructor() {
    this.type = 0 /* Header */;
  }
};

var DeletedLineViewElement = class {
  constructor(diff4, originalLineNumber) {
    this.diff = diff4;
    this.originalLineNumber = originalLineNumber;
    this.type = 2 /* Deleted */;
    this.modifiedLineNumber = void 0;
  }
};

var AddedLineViewElement = class {
  constructor(diff4, modifiedLineNumber) {
    this.diff = diff4;
    this.modifiedLineNumber = modifiedLineNumber;
    this.type = 3 /* Added */;
    this.originalLineNumber = void 0;
  }
};

var UnchangedLineViewElement = class {
  constructor(originalLineNumber, modifiedLineNumber) {
    this.originalLineNumber = originalLineNumber;
    this.modifiedLineNumber = modifiedLineNumber;
    this.type = 1 /* Unchanged */;
  }
};

var View2 = class extends Disposable {
  constructor(_element, _model, _width, _height, _models3, _languageService) {
    super();
    this._element = _element;
    this._model = _model;
    this._width = _width;
    this._height = _height;
    this._models = _models3;
    this._languageService = _languageService;
    this.domNode = this._element;
    this.domNode.className = "monaco-component diff-review monaco-editor-background";
    const actionBarContainer = document.createElement("div");
    actionBarContainer.className = "diff-review-actions";
    this._actionBar = this._register(new ActionBar(
      actionBarContainer
    ));
    this._register(autorun((reader) => {
      this._actionBar.clear();
      if (this._model.canClose.read(reader)) {
        this._actionBar.push(toAction({
          id: "diffreview.close",
          label: localize(229, null),
          class: "close-diff-review " + ThemeIcon.asClassName(accessibleDiffViewerCloseIcon),
          enabled: true,
          run: async () => _model.close()
        }), { label: false, icon: true });
      }
    }));
    this._content = document.createElement("div");
    this._content.className = "diff-review-content";
    this._content.setAttribute("role", "code");
    this._scrollbar = this._register(new DomScrollableElement(this._content, {}));
    reset(this.domNode, this._scrollbar.getDomNode(), actionBarContainer);
    this._register(autorun((r2) => {
      this._height.read(r2);
      this._width.read(r2);
      this._scrollbar.scanDomNode();
    }));
    this._register(toDisposable(() => {
      reset(this.domNode);
    }));
    this._register(applyStyle(this.domNode, { width: this._width, height: this._height }));
    this._register(applyStyle(this._content, { width: this._width, height: this._height }));
    this._register(autorunWithStore((reader, store) => {
      this._model.currentGroup.read(reader);
      this._render(store);
    }));
    this._register(addStandardDisposableListener(this.domNode, "keydown", (e) => {
      if (e.equals(18 /* DownArrow */) || e.equals(2048 /* CtrlCmd */ | 18 /* DownArrow */) || e.equals(512 /* Alt */ | 18 /* DownArrow */)) {
        e.preventDefault();
        this._model.goToNextLine();
      }
      if (e.equals(16 /* UpArrow */) || e.equals(2048 /* CtrlCmd */ | 16 /* UpArrow */) || e.equals(512 /* Alt */ | 16 /* UpArrow */)) {
        e.preventDefault();
        this._model.goToPreviousLine();
      }
      if (e.equals(9 /* Escape */) || e.equals(2048 /* CtrlCmd */ | 9 /* Escape */) || e.equals(512 /* Alt */ | 9 /* Escape */) || e.equals(1024 /* Shift */ | 9 /* Escape */)) {
        e.preventDefault();
        this._model.close();
      }
      if (e.equals(10 /* Space */) || e.equals(3 /* Enter */)) {
        e.preventDefault();
        this._model.revealCurrentElementInEditor();
      }
    }));
  }
  _render(store) {
    const originalOptions = this._models.getOriginalOptions();
    const modifiedOptions = this._models.getModifiedOptions();
    const container3 = document.createElement("div");
    container3.className = "diff-review-table";
    container3.setAttribute("role", "list");
    container3.setAttribute("aria-label", localize(223, null));
    applyFontInfo(container3, modifiedOptions.get(59 /* fontInfo */));
    reset(this._content, container3);
    const originalModel = this._models.getOriginalModel();
    const modifiedModel = this._models.getModifiedModel();
    if (!originalModel || !modifiedModel) {
      return;
    }
    const originalModelOpts = originalModel.getOptions();
    const modifiedModelOpts = modifiedModel.getOptions();
    const lineHeight = modifiedOptions.get(75 /* lineHeight */);
    const group2 = this._model.currentGroup.get();
    for (const viewItem of group2?.lines || []) {
      if (!group2) {
        break;
      }
      let row;
      if (viewItem.type === 0 /* Header */) {
        const header2 = document.createElement("div");
        header2.className = "diff-review-row";
        header2.setAttribute("role", "listitem");
        const r2 = group2.range;
        const diffIndex = this._model.currentGroupIndex.get();
        const diffsLength = this._model.groups.get().length;
        const getAriaLines = (lines) => lines === 0 ? localize(231, null) : lines === 1 ? localize(232, null) : localize(230, null, lines);
        const originalChangedLinesCntAria = getAriaLines(r2.original.length);
        const modifiedChangedLinesCntAria = getAriaLines(r2.modified.length);
        header2.setAttribute("aria-label", localize(
          227,
          null,
          diffIndex + 1,
          diffsLength,
          r2.original.startLineNumber,
          originalChangedLinesCntAria,
          r2.modified.startLineNumber,
          modifiedChangedLinesCntAria
        ));
        const cell = document.createElement("div");
        cell.className = "diff-review-cell diff-review-summary";
        cell.appendChild(document.createTextNode(`${diffIndex + 1}/${diffsLength}: @@ -${r2.original.startLineNumber},${r2.original.length} +${r2.modified.startLineNumber},${r2.modified.length} @@`));
        header2.appendChild(cell);
        row = header2;
      } else {
        row = this._createRow(
          viewItem,
          lineHeight,
          this._width.get(),
          originalOptions,
          originalModel,
          originalModelOpts,
          modifiedOptions,
          modifiedModel,
          modifiedModelOpts
        );
      }
      container3.appendChild(row);
      const isSelectedObs = derived((reader) => (
        /** @description isSelected */
        this._model.currentElement.read(reader) === viewItem
      ));
      store.add(autorun((reader) => {
        const isSelected = isSelectedObs.read(reader);
        row.tabIndex = isSelected ? 0 : -1;
        if (isSelected) {
          row.focus();
        }
      }));
      store.add(addDisposableListener(row, "focus", () => {
        this._model.goToLine(viewItem);
      }));
    }
    this._scrollbar.scanDomNode();
  }
  _createRow(item, lineHeight, width2, originalOptions, originalModel, originalModelOpts, modifiedOptions, modifiedModel, modifiedModelOpts) {
    const originalLayoutInfo = originalOptions.get(165 /* layoutInfo */);
    const originalLineNumbersWidth = originalLayoutInfo.glyphMarginWidth + originalLayoutInfo.lineNumbersWidth;
    const modifiedLayoutInfo = modifiedOptions.get(165 /* layoutInfo */);
    const modifiedLineNumbersWidth = 10 + modifiedLayoutInfo.glyphMarginWidth + modifiedLayoutInfo.lineNumbersWidth;
    let rowClassName = "diff-review-row";
    let lineNumbersExtraClassName = "";
    const spacerClassName = "diff-review-spacer";
    let spacerIcon = null;
    switch (item.type) {
      case 3 /* Added */:
        rowClassName = "diff-review-row line-insert";
        lineNumbersExtraClassName = " char-insert";
        spacerIcon = accessibleDiffViewerInsertIcon;
        break;
      case 2 /* Deleted */:
        rowClassName = "diff-review-row line-delete";
        lineNumbersExtraClassName = " char-delete";
        spacerIcon = accessibleDiffViewerRemoveIcon;
        break;
    }
    const row = document.createElement("div");
    row.style.minWidth = width2 + "px";
    row.className = rowClassName;
    row.setAttribute("role", "listitem");
    row.ariaLevel = "";
    const cell = document.createElement("div");
    cell.className = "diff-review-cell";
    cell.style.height = `${lineHeight}px`;
    row.appendChild(cell);
    const originalLineNumber = document.createElement("span");
    originalLineNumber.style.width = originalLineNumbersWidth + "px";
    originalLineNumber.style.minWidth = originalLineNumbersWidth + "px";
    originalLineNumber.className = "diff-review-line-number" + lineNumbersExtraClassName;
    if (item.originalLineNumber !== void 0) {
      originalLineNumber.appendChild(document.createTextNode(String(item.originalLineNumber)));
    } else {
      originalLineNumber.innerText = "\xA0";
    }
    cell.appendChild(originalLineNumber);
    const modifiedLineNumber = document.createElement("span");
    modifiedLineNumber.style.width = modifiedLineNumbersWidth + "px";
    modifiedLineNumber.style.minWidth = modifiedLineNumbersWidth + "px";
    modifiedLineNumber.style.paddingRight = "10px";
    modifiedLineNumber.className = "diff-review-line-number" + lineNumbersExtraClassName;
    if (item.modifiedLineNumber !== void 0) {
      modifiedLineNumber.appendChild(document.createTextNode(String(item.modifiedLineNumber)));
    } else {
      modifiedLineNumber.innerText = "\xA0";
    }
    cell.appendChild(modifiedLineNumber);
    const spacer = document.createElement("span");
    spacer.className = spacerClassName;
    if (spacerIcon) {
      const spacerCodicon = document.createElement("span");
      spacerCodicon.className = ThemeIcon.asClassName(spacerIcon);
      spacerCodicon.innerText = "\xA0\xA0";
      spacer.appendChild(spacerCodicon);
    } else {
      spacer.innerText = "\xA0\xA0";
    }
    cell.appendChild(spacer);
    let lineContent;
    if (item.modifiedLineNumber !== void 0) {
      let html3 = this._getLineHtml(modifiedModel, modifiedOptions, modifiedModelOpts.tabSize, item.modifiedLineNumber, this._languageService.languageIdCodec);
      if (AccessibleDiffViewer._ttPolicy) {
        html3 = AccessibleDiffViewer._ttPolicy.createHTML(html3);
      }
      cell.insertAdjacentHTML("beforeend", html3);
      lineContent = modifiedModel.getLineContent(item.modifiedLineNumber);
    } else {
      let html3 = this._getLineHtml(originalModel, originalOptions, originalModelOpts.tabSize, item.originalLineNumber, this._languageService.languageIdCodec);
      if (AccessibleDiffViewer._ttPolicy) {
        html3 = AccessibleDiffViewer._ttPolicy.createHTML(html3);
      }
      cell.insertAdjacentHTML("beforeend", html3);
      lineContent = originalModel.getLineContent(item.originalLineNumber);
    }
    if (lineContent.length === 0) {
      lineContent = localize(224, null);
    }
    let ariaLabel = "";
    switch (item.type) {
      case 1 /* Unchanged */:
        if (item.originalLineNumber === item.modifiedLineNumber) {
          ariaLabel = localize(233, null, lineContent, item.originalLineNumber);
        } else {
          ariaLabel = localize(226, null, lineContent, item.originalLineNumber, item.modifiedLineNumber);
        }
        break;
      case 3 /* Added */:
        ariaLabel = localize(228, null, lineContent, item.modifiedLineNumber);
        break;
      case 2 /* Deleted */:
        ariaLabel = localize(225, null, lineContent, item.originalLineNumber);
        break;
    }
    row.setAttribute("aria-label", ariaLabel);
    return row;
  }
  _getLineHtml(model, options3, tabSize, lineNumber, languageIdCodec) {
    const lineContent = model.getLineContent(lineNumber);
    const fontInfo = options3.get(59 /* fontInfo */);
    const verticalScrollbarSize = options3.get(117 /* scrollbar */).verticalScrollbarSize;
    const lineTokens = LineTokens.createEmpty(lineContent, languageIdCodec);
    const isBasicASCII2 = ViewLineRenderingData.isBasicASCII(lineContent, model.mightContainNonBasicASCII());
    const containsRTL2 = ViewLineRenderingData.containsRTL(lineContent, isBasicASCII2, model.mightContainRTL());
    const r2 = renderViewLine2(new RenderLineInput(
      fontInfo.isMonospace && !options3.get(40 /* disableMonospaceOptimizations */),
      fontInfo.canUseHalfwidthRightwardsArrow,
      lineContent,
      false,
      isBasicASCII2,
      containsRTL2,
      0,
      lineTokens,
      [],
      tabSize,
      0,
      fontInfo.spaceWidth,
      fontInfo.middotWidth,
      fontInfo.wsmiddotWidth,
      options3.get(133 /* stopRenderingLineAfter */),
      options3.get(113 /* renderWhitespace */),
      options3.get(108 /* renderControlCharacters */),
      options3.get(60 /* fontLigatures */) !== EditorFontLigatures.OFF,
      null,
      null,
      verticalScrollbarSize
    ));
    return r2.html;
  }
};

View2 = __decorateClass([
  __decorateParam(5, ILanguageService)
], View2);

var AccessibleDiffViewerModelFromEditors = class {
  constructor(editors) {
    this.editors = editors;
  }
  getOriginalModel() {
    return this.editors.original.getModel();
  }
  getOriginalOptions() {
    return this.editors.original.getOptions();
  }
  originalReveal(range2) {
    this.editors.original.revealRange(range2);
    this.editors.original.setSelection(range2);
    this.editors.original.focus();
  }
  getModifiedModel() {
    return this.editors.modified.getModel();
  }
  getModifiedOptions() {
    return this.editors.modified.getOptions();
  }
  modifiedReveal(range2) {
    if (range2) {
      this.editors.modified.revealRange(range2);
      this.editors.modified.setSelection(range2);
    }
    this.editors.modified.focus();
  }
  modifiedSetSelection(range2) {
    this.editors.modified.setSelection(range2);
  }
  modifiedFocus() {
    this.editors.modified.focus();
  }
  getModifiedPosition() {
    return this.editors.modified.getPosition() ?? void 0;
  }
};
export { computeViewElementGroups, accessibleDiffViewerInsertIcon, accessibleDiffViewerRemoveIcon, accessibleDiffViewerCloseIcon, AccessibleDiffViewer, ViewModel2, viewElementGroupLineMargin, ViewElementGroup, HeaderViewElement, DeletedLineViewElement, AddedLineViewElement, UnchangedLineViewElement, View2, AccessibleDiffViewerModelFromEditors };
