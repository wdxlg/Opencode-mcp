// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/contentWidgets/contentWidgets.ts
import { PartFingerprints, ViewPart } from "./module-0239.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { getClientArea, getDomNodePagePosition } from "./module-0075.mjs";


// src/vs/editor/browser/viewParts/contentWidgets/contentWidgets.ts
var ViewContentWidgets = class extends ViewPart {
  constructor(context2, viewDomNode) {
    super(context2);
    this._viewDomNode = viewDomNode;
    this._widgets = {};
    this.domNode = createFastDomNode(document.createElement("div"));
    PartFingerprints.write(this.domNode, 1 /* ContentWidgets */);
    this.domNode.setClassName("contentWidgets");
    this.domNode.setPosition("absolute");
    this.domNode.setTop(0);
    this.overflowingContentWidgetsDomNode = createFastDomNode(document.createElement("div"));
    PartFingerprints.write(this.overflowingContentWidgetsDomNode, 2 /* OverflowingContentWidgets */);
    this.overflowingContentWidgetsDomNode.setClassName("overflowingContentWidgets");
  }
  dispose() {
    super.dispose();
    this._widgets = {};
  }
  // --- begin event handlers
  onConfigurationChanged(e4) {
    const keys = Object.keys(this._widgets);
    for (const widgetId of keys) {
      this._widgets[widgetId].onConfigurationChanged(e4);
    }
    return true;
  }
  onDecorationsChanged(e4) {
    return true;
  }
  onFlushed(e4) {
    return true;
  }
  onLineMappingChanged(e4) {
    this._updateAnchorsViewPositions();
    return true;
  }
  onLinesChanged(e4) {
    this._updateAnchorsViewPositions();
    return true;
  }
  onLinesDeleted(e4) {
    this._updateAnchorsViewPositions();
    return true;
  }
  onLinesInserted(e4) {
    this._updateAnchorsViewPositions();
    return true;
  }
  onScrollChanged(e4) {
    return true;
  }
  onZonesChanged(e4) {
    return true;
  }
  // ---- end view event handlers
  _updateAnchorsViewPositions() {
    const keys = Object.keys(this._widgets);
    for (const widgetId of keys) {
      this._widgets[widgetId].updateAnchorViewPosition();
    }
  }
  addWidget(_widget) {
    const myWidget = new Widget2(this._context, this._viewDomNode, _widget);
    this._widgets[myWidget.id] = myWidget;
    if (myWidget.allowEditorOverflow) {
      this.overflowingContentWidgetsDomNode.appendChild(myWidget.domNode);
    } else {
      this.domNode.appendChild(myWidget.domNode);
    }
    this.setShouldRender();
  }
  setWidgetPosition(widget, primaryAnchor, secondaryAnchor, preference, affinity) {
    const myWidget = this._widgets[widget.getId()];
    myWidget.setPosition(primaryAnchor, secondaryAnchor, preference, affinity);
    if (!myWidget.useDisplayNone) {
      this.setShouldRender();
    }
  }
  removeWidget(widget) {
    const widgetId = widget.getId();
    if (this._widgets.hasOwnProperty(widgetId)) {
      const myWidget = this._widgets[widgetId];
      delete this._widgets[widgetId];
      const domNode = myWidget.domNode.domNode;
      domNode.remove();
      domNode.removeAttribute("monaco-visible-content-widget");
      this.setShouldRender();
    }
  }
  shouldSuppressMouseDownOnWidget(widgetId) {
    if (this._widgets.hasOwnProperty(widgetId)) {
      return this._widgets[widgetId].suppressMouseDown;
    }
    return false;
  }
  onBeforeRender(viewportData) {
    const keys = Object.keys(this._widgets);
    for (const widgetId of keys) {
      this._widgets[widgetId].onBeforeRender(viewportData);
    }
  }
  prepareRender(ctx) {
    const keys = Object.keys(this._widgets);
    for (const widgetId of keys) {
      this._widgets[widgetId].prepareRender(ctx);
    }
  }
  render(ctx) {
    const keys = Object.keys(this._widgets);
    for (const widgetId of keys) {
      this._widgets[widgetId].render(ctx);
    }
  }
};

var Widget2 = class {
  constructor(context2, viewDomNode, actual) {
    this._primaryAnchor = new PositionPair(null, null);
    this._secondaryAnchor = new PositionPair(null, null);
    this._context = context2;
    this._viewDomNode = viewDomNode;
    this._actual = actual;
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    const allowOverflow = options3.get(4 /* allowOverflow */);
    this.domNode = createFastDomNode(this._actual.getDomNode());
    this.id = this._actual.getId();
    this.allowEditorOverflow = (this._actual.allowEditorOverflow || false) && allowOverflow;
    this.suppressMouseDown = this._actual.suppressMouseDown || false;
    this.useDisplayNone = this._actual.useDisplayNone || false;
    this._fixedOverflowWidgets = options3.get(51 /* fixedOverflowWidgets */);
    this._contentWidth = layoutInfo.contentWidth;
    this._contentLeft = layoutInfo.contentLeft;
    this._affinity = null;
    this._preference = [];
    this._cachedDomNodeOffsetWidth = -1;
    this._cachedDomNodeOffsetHeight = -1;
    this._maxWidth = this._getMaxWidth();
    this._isVisible = false;
    this._renderData = null;
    this.domNode.setPosition(this._fixedOverflowWidgets && this.allowEditorOverflow ? "fixed" : "absolute");
    this.domNode.setDisplay("none");
    this.domNode.setVisibility("hidden");
    this.domNode.setAttribute("widgetId", this.id);
    this.domNode.setMaxWidth(this._maxWidth);
  }
  onConfigurationChanged(e4) {
    const options3 = this._context.configuration.options;
    if (e4.hasChanged(165 /* layoutInfo */)) {
      const layoutInfo = options3.get(165 /* layoutInfo */);
      this._contentLeft = layoutInfo.contentLeft;
      this._contentWidth = layoutInfo.contentWidth;
      this._maxWidth = this._getMaxWidth();
    }
  }
  updateAnchorViewPosition() {
    this._setPosition(this._affinity, this._primaryAnchor.modelPosition, this._secondaryAnchor.modelPosition);
  }
  _setPosition(affinity, primaryAnchor, secondaryAnchor) {
    this._affinity = affinity;
    this._primaryAnchor = getValidPositionPair(primaryAnchor, this._context.viewModel, this._affinity);
    this._secondaryAnchor = getValidPositionPair(secondaryAnchor, this._context.viewModel, this._affinity);
    function getValidPositionPair(position2, viewModel, affinity2) {
      if (!position2) {
        return new PositionPair(null, null);
      }
      const validModelPosition = viewModel.model.validatePosition(position2);
      if (viewModel.coordinatesConverter.modelPositionIsVisible(validModelPosition)) {
        const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(validModelPosition, affinity2 ?? void 0);
        return new PositionPair(position2, viewPosition);
      }
      return new PositionPair(position2, null);
    }
  }
  _getMaxWidth() {
    const elDocument = this.domNode.domNode.ownerDocument;
    const elWindow = elDocument.defaultView;
    return this.allowEditorOverflow ? elWindow?.innerWidth || elDocument.documentElement.offsetWidth || elDocument.body.offsetWidth : this._contentWidth;
  }
  setPosition(primaryAnchor, secondaryAnchor, preference, affinity) {
    this._setPosition(affinity, primaryAnchor, secondaryAnchor);
    this._preference = preference;
    if (!this.useDisplayNone && this._primaryAnchor.viewPosition && this._preference && this._preference.length > 0) {
      this.domNode.setDisplay("block");
    } else {
      this.domNode.setDisplay("none");
    }
    this._cachedDomNodeOffsetWidth = -1;
    this._cachedDomNodeOffsetHeight = -1;
  }
  _layoutBoxInViewport(anchor, width2, height, ctx) {
    const aboveLineTop = anchor.top;
    const heightAvailableAboveLine = aboveLineTop;
    const underLineTop = anchor.top + anchor.height;
    const heightAvailableUnderLine = ctx.viewportHeight - underLineTop;
    const aboveTop = aboveLineTop - height;
    const fitsAbove = heightAvailableAboveLine >= height;
    const belowTop = underLineTop;
    const fitsBelow = heightAvailableUnderLine >= height;
    let left = anchor.left;
    if (left + width2 > ctx.scrollLeft + ctx.viewportWidth) {
      left = ctx.scrollLeft + ctx.viewportWidth - width2;
    }
    if (left < ctx.scrollLeft) {
      left = ctx.scrollLeft;
    }
    return { fitsAbove, aboveTop, fitsBelow, belowTop, left };
  }
  _layoutHorizontalSegmentInPage(windowSize, domNodePosition, left, width2) {
    const LEFT_PADDING = 15;
    const RIGHT_PADDING = 15;
    const MIN_LIMIT = Math.max(LEFT_PADDING, domNodePosition.left - width2);
    const MAX_LIMIT = Math.min(domNodePosition.left + domNodePosition.width + width2, windowSize.width - RIGHT_PADDING);
    const elDocument = this._viewDomNode.domNode.ownerDocument;
    const elWindow = elDocument.defaultView;
    let absoluteLeft = domNodePosition.left + left - (elWindow?.scrollX ?? 0);
    if (absoluteLeft + width2 > MAX_LIMIT) {
      const delta2 = absoluteLeft - (MAX_LIMIT - width2);
      absoluteLeft -= delta2;
      left -= delta2;
    }
    if (absoluteLeft < MIN_LIMIT) {
      const delta2 = absoluteLeft - MIN_LIMIT;
      absoluteLeft -= delta2;
      left -= delta2;
    }
    return [left, absoluteLeft];
  }
  _layoutBoxInPage(anchor, width2, height, ctx) {
    const aboveTop = anchor.top - height;
    const belowTop = anchor.top + anchor.height;
    const domNodePosition = getDomNodePagePosition(this._viewDomNode.domNode);
    const elDocument = this._viewDomNode.domNode.ownerDocument;
    const elWindow = elDocument.defaultView;
    const absoluteAboveTop = domNodePosition.top + aboveTop - (elWindow?.scrollY ?? 0);
    const absoluteBelowTop = domNodePosition.top + belowTop - (elWindow?.scrollY ?? 0);
    const windowSize = getClientArea(elDocument.body);
    const [left, absoluteAboveLeft] = this._layoutHorizontalSegmentInPage(windowSize, domNodePosition, anchor.left - ctx.scrollLeft + this._contentLeft, width2);
    const TOP_PADDING = 22;
    const BOTTOM_PADDING = 22;
    const fitsAbove = absoluteAboveTop >= TOP_PADDING;
    const fitsBelow = absoluteBelowTop + height <= windowSize.height - BOTTOM_PADDING;
    if (this._fixedOverflowWidgets) {
      return {
        fitsAbove,
        aboveTop: Math.max(absoluteAboveTop, TOP_PADDING),
        fitsBelow,
        belowTop: absoluteBelowTop,
        left: absoluteAboveLeft
      };
    }
    return { fitsAbove, aboveTop, fitsBelow, belowTop, left };
  }
  _prepareRenderWidgetAtExactPositionOverflowing(topLeft) {
    return new Coordinate(topLeft.top, topLeft.left + this._contentLeft);
  }
  /**
   * Compute the coordinates above and below the primary and secondary anchors.
   * The content widget *must* touch the primary anchor.
   * The content widget should touch if possible the secondary anchor.
   */
  _getAnchorsCoordinates(ctx) {
    const primary = getCoordinates(this._primaryAnchor.viewPosition, this._affinity);
    const secondaryViewPosition = this._secondaryAnchor.viewPosition?.lineNumber === this._primaryAnchor.viewPosition?.lineNumber ? this._secondaryAnchor.viewPosition : null;
    const secondary = getCoordinates(secondaryViewPosition, this._affinity);
    return { primary, secondary };
    function getCoordinates(position2, affinity) {
      if (!position2) {
        return null;
      }
      const horizontalPosition = ctx.visibleRangeForPosition(position2);
      if (!horizontalPosition) {
        return null;
      }
      const left = position2.column === 1 && affinity === 3 /* LeftOfInjectedText */ ? 0 : horizontalPosition.left;
      const top2 = ctx.getVerticalOffsetForLineNumber(position2.lineNumber) - ctx.scrollTop;
      const lineHeight = ctx.getLineHeightForLineNumber(position2.lineNumber);
      return new AnchorCoordinate(top2, left, lineHeight);
    }
  }
  _reduceAnchorCoordinates(primary, secondary, width2) {
    if (!secondary) {
      return primary;
    }
    const fontInfo = this._context.configuration.options.get(59 /* fontInfo */);
    let left = secondary.left;
    if (left < primary.left) {
      left = Math.max(left, primary.left - width2 + fontInfo.typicalFullwidthCharacterWidth);
    } else {
      left = Math.min(left, primary.left + width2 - fontInfo.typicalFullwidthCharacterWidth);
    }
    return new AnchorCoordinate(primary.top, left, primary.height);
  }
  _prepareRenderWidget(ctx) {
    if (!this._preference || this._preference.length === 0) {
      return null;
    }
    const { primary, secondary } = this._getAnchorsCoordinates(ctx);
    if (!primary) {
      return {
        kind: "offViewport",
        preserveFocus: this.domNode.domNode.contains(this.domNode.domNode.ownerDocument.activeElement)
      };
    }
    if (this._cachedDomNodeOffsetWidth === -1 || this._cachedDomNodeOffsetHeight === -1) {
      let preferredDimensions = null;
      if (typeof this._actual.beforeRender === "function") {
        preferredDimensions = safeInvoke(this._actual.beforeRender, this._actual);
      }
      if (preferredDimensions) {
        this._cachedDomNodeOffsetWidth = preferredDimensions.width;
        this._cachedDomNodeOffsetHeight = preferredDimensions.height;
      } else {
        const domNode = this.domNode.domNode;
        const clientRect = domNode.getBoundingClientRect();
        this._cachedDomNodeOffsetWidth = Math.round(clientRect.width);
        this._cachedDomNodeOffsetHeight = Math.round(clientRect.height);
      }
    }
    const anchor = this._reduceAnchorCoordinates(primary, secondary, this._cachedDomNodeOffsetWidth);
    let placement;
    if (this.allowEditorOverflow) {
      placement = this._layoutBoxInPage(anchor, this._cachedDomNodeOffsetWidth, this._cachedDomNodeOffsetHeight, ctx);
    } else {
      placement = this._layoutBoxInViewport(anchor, this._cachedDomNodeOffsetWidth, this._cachedDomNodeOffsetHeight, ctx);
    }
    for (let pass = 1; pass <= 2; pass++) {
      for (const pref of this._preference) {
        if (pref === 1 /* ABOVE */) {
          if (!placement) {
            return null;
          }
          if (pass === 2 || placement.fitsAbove) {
            return {
              kind: "inViewport",
              coordinate: new Coordinate(placement.aboveTop, placement.left),
              position: 1 /* ABOVE */
            };
          }
        } else if (pref === 2 /* BELOW */) {
          if (!placement) {
            return null;
          }
          if (pass === 2 || placement.fitsBelow) {
            return {
              kind: "inViewport",
              coordinate: new Coordinate(placement.belowTop, placement.left),
              position: 2 /* BELOW */
            };
          }
        } else {
          if (this.allowEditorOverflow) {
            return {
              kind: "inViewport",
              coordinate: this._prepareRenderWidgetAtExactPositionOverflowing(new Coordinate(anchor.top, anchor.left)),
              position: 0 /* EXACT */
            };
          } else {
            return {
              kind: "inViewport",
              coordinate: new Coordinate(anchor.top, anchor.left),
              position: 0 /* EXACT */
            };
          }
        }
      }
    }
    return null;
  }
  /**
   * On this first pass, we ensure that the content widget (if it is in the viewport) has the max width set correctly.
   */
  onBeforeRender(viewportData) {
    if (!this._primaryAnchor.viewPosition || !this._preference) {
      return;
    }
    if (this._primaryAnchor.viewPosition.lineNumber < viewportData.startLineNumber || this._primaryAnchor.viewPosition.lineNumber > viewportData.endLineNumber) {
      return;
    }
    this.domNode.setMaxWidth(this._maxWidth);
  }
  prepareRender(ctx) {
    this._renderData = this._prepareRenderWidget(ctx);
  }
  render(ctx) {
    if (!this._renderData || this._renderData.kind === "offViewport") {
      if (this._isVisible) {
        this.domNode.removeAttribute("monaco-visible-content-widget");
        this._isVisible = false;
        if (this._renderData?.kind === "offViewport" && this._renderData.preserveFocus) {
          this.domNode.setTop(-1e3);
        } else {
          this.domNode.setVisibility("hidden");
        }
      }
      if (typeof this._actual.afterRender === "function") {
        safeInvoke(this._actual.afterRender, this._actual, null, null);
      }
      return;
    }
    if (this.allowEditorOverflow) {
      this.domNode.setTop(this._renderData.coordinate.top);
      this.domNode.setLeft(this._renderData.coordinate.left);
    } else {
      this.domNode.setTop(this._renderData.coordinate.top + ctx.scrollTop - ctx.bigNumbersDelta);
      this.domNode.setLeft(this._renderData.coordinate.left);
    }
    if (!this._isVisible) {
      this.domNode.setVisibility("inherit");
      this.domNode.setAttribute("monaco-visible-content-widget", "true");
      this._isVisible = true;
    }
    if (typeof this._actual.afterRender === "function") {
      safeInvoke(this._actual.afterRender, this._actual, this._renderData.position, this._renderData.coordinate);
    }
  }
};

var PositionPair = class {
  constructor(modelPosition, viewPosition) {
    this.modelPosition = modelPosition;
    this.viewPosition = viewPosition;
  }
};

var Coordinate = class {
  constructor(top2, left) {
    this.top = top2;
    this.left = left;
    this._coordinateBrand = void 0;
  }
};

var AnchorCoordinate = class {
  constructor(top2, left, height) {
    this.top = top2;
    this.left = left;
    this.height = height;
    this._anchorCoordinateBrand = void 0;
  }
};

function safeInvoke(fn, thisArg, ...args2) {
  try {
    return fn.call(thisArg, ...args2);
  } catch {
    return null;
  }
}
export { safeInvoke, ViewContentWidgets, Widget2, PositionPair, Coordinate, AnchorCoordinate };
