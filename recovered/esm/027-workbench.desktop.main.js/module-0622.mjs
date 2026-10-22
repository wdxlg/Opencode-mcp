// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/zoneWidget/browser/zoneWidget.ts
import { Color, RGBA } from "./module-0197.mjs";
import { IdGenerator } from "./module-0463.mjs";
import { createCSSRule, removeCSSRulesContainingSelector } from "./module-0224.mjs";
import { Range2 } from "./module-0106.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { deepClone, mixin } from "./module-0098.mjs";
import { getActiveElement } from "./module-0075.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { Sash } from "./module-0496.mjs";


// src/vs/editor/contrib/zoneWidget/browser/zoneWidget.ts
var defaultColor = new Color(new RGBA(0, 122, 204));

var defaultOptions = {
  showArrow: true,
  showFrame: true,
  className: "",
  frameColor: defaultColor,
  arrowColor: defaultColor,
  keepEditorSelection: false
};

var WIDGET_ID = "vs.editor.contrib.zoneWidget";

var ViewZoneDelegate = class {
  constructor(domNode, afterLineNumber, afterColumn, heightInLines, onDomNodeTop, onComputedHeight, showInHiddenAreas, ordinal) {
    this.id = "";
    this.domNode = domNode;
    this.afterLineNumber = afterLineNumber;
    this.afterColumn = afterColumn;
    this.heightInLines = heightInLines;
    this.showInHiddenAreas = showInHiddenAreas;
    this.ordinal = ordinal;
    this._onDomNodeTop = onDomNodeTop;
    this._onComputedHeight = onComputedHeight;
  }
  onDomNodeTop(top2) {
    this._onDomNodeTop(top2);
  }
  onComputedHeight(height) {
    this._onComputedHeight(height);
  }
};

var OverlayWidgetDelegate = class {
  constructor(id2, domNode) {
    this._id = id2;
    this._domNode = domNode;
  }
  getId() {
    return this._id;
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return null;
  }
};

var Arrow = class _Arrow {
  constructor(_editor) {
    this._editor = _editor;
    this._ruleName = _Arrow._IdGenerator.nextId();
    this._color = null;
    this._height = -1;
    this._decorations = this._editor.createDecorationsCollection();
  }
  static {
    this._IdGenerator = new IdGenerator(".arrow-decoration-");
  }
  dispose() {
    this.hide();
    removeCSSRulesContainingSelector(this._ruleName);
  }
  set color(value2) {
    if (this._color !== value2) {
      this._color = value2;
      this._updateStyle();
    }
  }
  set height(value2) {
    if (this._height !== value2) {
      this._height = value2;
      this._updateStyle();
    }
  }
  _updateStyle() {
    removeCSSRulesContainingSelector(this._ruleName);
    createCSSRule(
      `.monaco-editor ${this._ruleName}`,
      `border-style: solid; border-color: transparent; border-bottom-color: ${this._color}; border-width: ${this._height}px; bottom: -${this._height}px !important; margin-left: -${this._height}px; `
    );
  }
  show(where) {
    if (where.column === 1) {
      where = { lineNumber: where.lineNumber, column: 2 };
    }
    this._decorations.set([{
      range: Range2.fromPositions(where),
      options: {
        description: "zone-widget-arrow",
        className: this._ruleName,
        stickiness: 1 /* NeverGrowsWhenTypingAtEdges */
      }
    }]);
  }
  hide() {
    this._decorations.clear();
  }
};

var ZoneWidget = class {
  constructor(editor, options3 = {}) {
    this._arrow = null;
    this._overlayWidget = null;
    this._resizeSash = null;
    this._isSashResizeHeight = false;
    this._viewZone = null;
    this._disposables = new DisposableStore();
    this.container = null;
    this._isShowing = false;
    this.editor = editor;
    this._positionMarkerId = this.editor.createDecorationsCollection();
    this.options = deepClone(options3);
    mixin(this.options, defaultOptions, false);
    this.domNode = document.createElement("div");
    if (!this.options.isAccessible) {
      this.domNode.setAttribute("aria-hidden", "true");
      this.domNode.setAttribute("role", "presentation");
    }
    this._disposables.add(this.editor.onDidLayoutChange((info) => {
      const width2 = this._getWidth(info);
      this.domNode.style.width = width2 + "px";
      this.domNode.style.left = this._getLeft(info) + "px";
      this._onWidth(width2);
    }));
  }
  dispose() {
    if (this._overlayWidget) {
      this.editor.removeOverlayWidget(this._overlayWidget);
      this._overlayWidget = null;
    }
    if (this._viewZone) {
      this.editor.changeViewZones((accessor) => {
        if (this._viewZone) {
          accessor.removeZone(this._viewZone.id);
        }
        this._viewZone = null;
      });
    }
    this._positionMarkerId.clear();
    this._disposables.dispose();
  }
  create() {
    this.domNode.classList.add("zone-widget");
    if (this.options.className) {
      this.domNode.classList.add(this.options.className);
    }
    this.container = document.createElement("div");
    this.container.classList.add("zone-widget-container");
    this.domNode.appendChild(this.container);
    if (this.options.showArrow) {
      this._arrow = new Arrow(this.editor);
      this._disposables.add(this._arrow);
    }
    this._fillContainer(this.container);
    this._initSash();
    this._applyStyles();
  }
  style(styles) {
    if (styles.frameColor) {
      this.options.frameColor = styles.frameColor;
    }
    if (styles.arrowColor) {
      this.options.arrowColor = styles.arrowColor;
    }
    this._applyStyles();
  }
  _applyStyles() {
    if (this.container && this.options.frameColor) {
      const frameColor = this.options.frameColor.toString();
      this.container.style.borderTopColor = frameColor;
      this.container.style.borderBottomColor = frameColor;
    }
    if (this._arrow && this.options.arrowColor) {
      const arrowColor = this.options.arrowColor.toString();
      this._arrow.color = arrowColor;
    }
  }
  _getWidth(info) {
    return info.width - info.minimap.minimapWidth - info.verticalScrollbarWidth;
  }
  _getLeft(info) {
    if (info.minimap.minimapWidth > 0 && info.minimap.minimapLeft === 0) {
      return info.minimap.minimapWidth;
    }
    return 0;
  }
  _onViewZoneTop(top2) {
    this.domNode.style.top = top2 + "px";
  }
  _onViewZoneHeight(height) {
    this.domNode.style.height = `${height}px`;
    if (this.container) {
      const containerHeight = height - this._decoratingElementsHeight();
      this.container.style.height = `${containerHeight}px`;
      const layoutInfo = this.editor.getLayoutInfo();
      this._doLayout(containerHeight, this._getWidth(layoutInfo));
    }
    this._resizeSash?.layout();
  }
  get position() {
    const range2 = this._positionMarkerId.getRange(0);
    if (!range2) {
      return void 0;
    }
    return range2.getStartPosition();
  }
  hasFocus() {
    return this.domNode.contains(getActiveElement());
  }
  show(rangeOrPos, heightInLines) {
    const range2 = Range2.isIRange(rangeOrPos) ? Range2.lift(rangeOrPos) : Range2.fromPositions(rangeOrPos);
    this._isShowing = true;
    this._showImpl(range2, heightInLines);
    this._isShowing = false;
    this._positionMarkerId.set([{ range: range2, options: ModelDecorationOptions.EMPTY }]);
  }
  updatePositionAndHeight(rangeOrPos, heightInLines) {
    if (this._viewZone) {
      rangeOrPos = Range2.isIRange(rangeOrPos) ? Range2.getStartPosition(rangeOrPos) : rangeOrPos;
      this._viewZone.afterLineNumber = rangeOrPos.lineNumber;
      this._viewZone.afterColumn = rangeOrPos.column;
      this._viewZone.heightInLines = heightInLines ?? this._viewZone.heightInLines;
      this.editor.changeViewZones((accessor) => {
        accessor.layoutZone(this._viewZone.id);
      });
      this._positionMarkerId.set([{
        range: Range2.isIRange(rangeOrPos) ? rangeOrPos : Range2.fromPositions(rangeOrPos),
        options: ModelDecorationOptions.EMPTY
      }]);
      this._updateSashEnablement();
    }
  }
  hide() {
    if (this._viewZone) {
      this.editor.changeViewZones((accessor) => {
        if (this._viewZone) {
          accessor.removeZone(this._viewZone.id);
        }
      });
      this._viewZone = null;
    }
    if (this._overlayWidget) {
      this.editor.removeOverlayWidget(this._overlayWidget);
      this._overlayWidget = null;
    }
    this._arrow?.hide();
    this._positionMarkerId.clear();
    this._isSashResizeHeight = false;
  }
  _decoratingElementsHeight() {
    const lineHeight = this.editor.getOption(75 /* lineHeight */);
    let result = 0;
    if (this.options.showArrow) {
      const arrowHeight = Math.round(lineHeight / 3);
      result += 2 * arrowHeight;
    }
    if (this.options.showFrame) {
      const frameThickness = this.options.frameWidth ?? Math.round(lineHeight / 9);
      result += 2 * frameThickness;
    }
    return result;
  }
  /** Gets the maximum widget height in lines. */
  _getMaximumHeightInLines() {
    return Math.max(12, this.editor.getLayoutInfo().height / this.editor.getOption(75 /* lineHeight */) * 0.8);
  }
  _showImpl(where, heightInLines) {
    const position2 = where.getStartPosition();
    const layoutInfo = this.editor.getLayoutInfo();
    const width2 = this._getWidth(layoutInfo);
    this.domNode.style.width = `${width2}px`;
    this.domNode.style.left = this._getLeft(layoutInfo) + "px";
    const viewZoneDomNode = document.createElement("div");
    viewZoneDomNode.style.overflow = "hidden";
    const lineHeight = this.editor.getOption(75 /* lineHeight */);
    const maxHeightInLines = this._getMaximumHeightInLines();
    if (maxHeightInLines !== void 0) {
      heightInLines = Math.min(heightInLines, maxHeightInLines);
    }
    let arrowHeight = 0;
    let frameThickness = 0;
    if (this._arrow && this.options.showArrow) {
      arrowHeight = Math.round(lineHeight / 3);
      this._arrow.height = arrowHeight;
      this._arrow.show(position2);
    }
    if (this.options.showFrame) {
      frameThickness = Math.round(lineHeight / 9);
    }
    this.editor.changeViewZones((accessor) => {
      if (this._viewZone) {
        accessor.removeZone(this._viewZone.id);
      }
      if (this._overlayWidget) {
        this.editor.removeOverlayWidget(this._overlayWidget);
        this._overlayWidget = null;
      }
      this.domNode.style.top = "-1000px";
      this._viewZone = new ViewZoneDelegate(
        viewZoneDomNode,
        position2.lineNumber,
        position2.column,
        heightInLines,
        (top2) => this._onViewZoneTop(top2),
        (height) => this._onViewZoneHeight(height),
        this.options.showInHiddenAreas,
        this.options.ordinal
      );
      this._viewZone.id = accessor.addZone(this._viewZone);
      this._overlayWidget = new OverlayWidgetDelegate(WIDGET_ID + this._viewZone.id, this.domNode);
      this.editor.addOverlayWidget(this._overlayWidget);
    });
    this._updateSashEnablement();
    if (this.container && this.options.showFrame) {
      const width3 = this.options.frameWidth ? this.options.frameWidth : frameThickness;
      this.container.style.borderTopWidth = width3 + "px";
      this.container.style.borderBottomWidth = width3 + "px";
    }
    const containerHeight = heightInLines * lineHeight - this._decoratingElementsHeight();
    if (this.container) {
      this.container.style.top = arrowHeight + "px";
      this.container.style.height = containerHeight + "px";
      this.container.style.overflow = "hidden";
    }
    this._doLayout(containerHeight, width2);
    if (!this.options.keepEditorSelection) {
      this.editor.setSelection(where);
    }
    const model = this.editor.getModel();
    if (model) {
      const range2 = model.validateRange(new Range2(where.startLineNumber, 1, where.endLineNumber + 1, 1));
      this.revealRange(range2, range2.startLineNumber === model.getLineCount());
    }
  }
  revealRange(range2, isLastLine) {
    if (isLastLine) {
      this.editor.revealLineNearTop(range2.endLineNumber, 0 /* Smooth */);
    } else {
      this.editor.revealRange(range2, 0 /* Smooth */);
    }
  }
  setCssClass(className2, classToReplace) {
    if (!this.container) {
      return;
    }
    if (classToReplace) {
      this.container.classList.remove(classToReplace);
    }
    this.container.classList.add(className2);
  }
  _onWidth(widthInPixel) {
  }
  _doLayout(heightInPixel, widthInPixel) {
  }
  _relayout(_newHeightInLines, useMax) {
    const maxHeightInLines = this._getMaximumHeightInLines();
    const newHeightInLines = useMax && maxHeightInLines !== void 0 ? Math.min(maxHeightInLines, _newHeightInLines) : _newHeightInLines;
    if (this._viewZone && this._viewZone.heightInLines !== newHeightInLines) {
      this.editor.changeViewZones((accessor) => {
        if (this._viewZone) {
          this._viewZone.heightInLines = newHeightInLines;
          accessor.layoutZone(this._viewZone.id);
        }
      });
      this._updateSashEnablement();
    }
  }
  // --- sash
  _initSash() {
    if (this._resizeSash) {
      return;
    }
    this._resizeSash = this._disposables.add(new Sash(this.domNode, this, { orientation: 1 /* HORIZONTAL */ }));
    if (!this.options.isResizeable) {
      this._resizeSash.state = 0 /* Disabled */;
    }
    let data;
    this._disposables.add(this._resizeSash.onDidStart((e) => {
      if (this._viewZone) {
        data = {
          startY: e.startY,
          heightInLines: this._viewZone.heightInLines,
          ...this._getResizeBounds()
        };
      }
    }));
    this._disposables.add(this._resizeSash.onDidEnd(() => {
      data = void 0;
    }));
    this._disposables.add(this._resizeSash.onDidChange((evt) => {
      if (data) {
        const lineDelta = (evt.currentY - data.startY) / this.editor.getOption(75 /* lineHeight */);
        const roundedLineDelta = lineDelta < 0 ? Math.ceil(lineDelta) : Math.floor(lineDelta);
        const newHeightInLines = data.heightInLines + roundedLineDelta;
        if (newHeightInLines > data.minLines && newHeightInLines < data.maxLines) {
          this._isSashResizeHeight = true;
          this._relayout(newHeightInLines);
        }
      }
    }));
  }
  _updateSashEnablement() {
    if (this._resizeSash) {
      const { minLines, maxLines } = this._getResizeBounds();
      this._resizeSash.state = minLines === maxLines ? 0 /* Disabled */ : 3 /* Enabled */;
    }
  }
  get _usesResizeHeight() {
    return this._isSashResizeHeight;
  }
  _getResizeBounds() {
    return { minLines: 5, maxLines: 35 };
  }
  getHorizontalSashLeft() {
    return 0;
  }
  getHorizontalSashTop() {
    return (this.domNode.style.height === null ? 0 : parseInt(this.domNode.style.height)) - this._decoratingElementsHeight() / 2;
  }
  getHorizontalSashWidth() {
    const layoutInfo = this.editor.getLayoutInfo();
    return layoutInfo.width - layoutInfo.minimap.minimapWidth;
  }
};
export { defaultColor, defaultOptions, WIDGET_ID, ViewZoneDelegate, OverlayWidgetDelegate, Arrow, ZoneWidget };
