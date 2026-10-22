// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/viewZones/viewZones.ts
import { ViewPart } from "./module-0239.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { Position } from "./module-0079.mjs";
import { onUnexpectedError } from "./module-0004.mjs";


// src/vs/editor/browser/viewParts/viewZones/viewZones.ts
var invalidFunc = () => {
  throw new Error(`Invalid change accessor`);
};

var ViewZones = class extends ViewPart {
  constructor(context2) {
    super(context2);
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._lineHeight = options3.get(75 /* lineHeight */);
    this._contentWidth = layoutInfo.contentWidth;
    this._contentLeft = layoutInfo.contentLeft;
    this.domNode = createFastDomNode(document.createElement("div"));
    this.domNode.setClassName("view-zones");
    this.domNode.setPosition("absolute");
    this.domNode.setAttribute("role", "presentation");
    this.domNode.setAttribute("aria-hidden", "true");
    this.marginDomNode = createFastDomNode(document.createElement("div"));
    this.marginDomNode.setClassName("margin-view-zones");
    this.marginDomNode.setPosition("absolute");
    this.marginDomNode.setAttribute("role", "presentation");
    this.marginDomNode.setAttribute("aria-hidden", "true");
    this._zones = {};
  }
  dispose() {
    super.dispose();
    this._zones = {};
  }
  // ---- begin view event handlers
  _recomputeWhitespacesProps() {
    const whitespaces = this._context.viewLayout.getWhitespaces();
    const oldWhitespaces = /* @__PURE__ */ new Map();
    for (const whitespace of whitespaces) {
      oldWhitespaces.set(whitespace.id, whitespace);
    }
    let hadAChange = false;
    this._context.viewModel.changeWhitespace((whitespaceAccessor) => {
      const keys = Object.keys(this._zones);
      for (let i2 = 0, len = keys.length; i2 < len; i2++) {
        const id2 = keys[i2];
        const zone = this._zones[id2];
        const props = this._computeWhitespaceProps(zone.delegate);
        zone.isInHiddenArea = props.isInHiddenArea;
        const oldWhitespace = oldWhitespaces.get(id2);
        if (oldWhitespace && (oldWhitespace.afterLineNumber !== props.afterViewLineNumber || oldWhitespace.height !== props.heightInPx)) {
          whitespaceAccessor.changeOneWhitespace(id2, props.afterViewLineNumber, props.heightInPx);
          this._safeCallOnComputedHeight(zone.delegate, props.heightInPx);
          hadAChange = true;
        }
      }
    });
    return hadAChange;
  }
  onConfigurationChanged(e) {
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._lineHeight = options3.get(75 /* lineHeight */);
    this._contentWidth = layoutInfo.contentWidth;
    this._contentLeft = layoutInfo.contentLeft;
    if (e.hasChanged(75 /* lineHeight */)) {
      this._recomputeWhitespacesProps();
    }
    return true;
  }
  onLineMappingChanged(e) {
    return this._recomputeWhitespacesProps();
  }
  onLinesDeleted(e) {
    return true;
  }
  onScrollChanged(e) {
    return e.scrollTopChanged || e.scrollWidthChanged;
  }
  onZonesChanged(e) {
    return true;
  }
  onLinesInserted(e) {
    return true;
  }
  // ---- end view event handlers
  _getZoneOrdinal(zone) {
    return zone.ordinal ?? zone.afterColumn ?? 1e4;
  }
  _computeWhitespaceProps(zone) {
    if (zone.afterLineNumber === 0) {
      return {
        isInHiddenArea: false,
        afterViewLineNumber: 0,
        heightInPx: this._heightInPixels(zone),
        minWidthInPx: this._minWidthInPixels(zone)
      };
    }
    let zoneAfterModelPosition;
    if (typeof zone.afterColumn !== "undefined") {
      zoneAfterModelPosition = this._context.viewModel.model.validatePosition({
        lineNumber: zone.afterLineNumber,
        column: zone.afterColumn
      });
    } else {
      const validAfterLineNumber = this._context.viewModel.model.validatePosition({
        lineNumber: zone.afterLineNumber,
        column: 1
      }).lineNumber;
      zoneAfterModelPosition = new Position(
        validAfterLineNumber,
        this._context.viewModel.model.getLineMaxColumn(validAfterLineNumber)
      );
    }
    let zoneBeforeModelPosition;
    if (zoneAfterModelPosition.column === this._context.viewModel.model.getLineMaxColumn(zoneAfterModelPosition.lineNumber)) {
      zoneBeforeModelPosition = this._context.viewModel.model.validatePosition({
        lineNumber: zoneAfterModelPosition.lineNumber + 1,
        column: 1
      });
    } else {
      zoneBeforeModelPosition = this._context.viewModel.model.validatePosition({
        lineNumber: zoneAfterModelPosition.lineNumber,
        column: zoneAfterModelPosition.column + 1
      });
    }
    const viewPosition = this._context.viewModel.coordinatesConverter.convertModelPositionToViewPosition(zoneAfterModelPosition, zone.afterColumnAffinity, true);
    const isVisible = zone.showInHiddenAreas || this._context.viewModel.coordinatesConverter.modelPositionIsVisible(zoneBeforeModelPosition);
    return {
      isInHiddenArea: !isVisible,
      afterViewLineNumber: viewPosition.lineNumber,
      heightInPx: isVisible ? this._heightInPixels(zone) : 0,
      minWidthInPx: this._minWidthInPixels(zone)
    };
  }
  changeViewZones(callback) {
    let zonesHaveChanged = false;
    this._context.viewModel.changeWhitespace((whitespaceAccessor) => {
      const changeAccessor = {
        addZone: (zone) => {
          zonesHaveChanged = true;
          return this._addZone(whitespaceAccessor, zone);
        },
        removeZone: (id2) => {
          if (!id2) {
            return;
          }
          zonesHaveChanged = this._removeZone(whitespaceAccessor, id2) || zonesHaveChanged;
        },
        layoutZone: (id2) => {
          if (!id2) {
            return;
          }
          zonesHaveChanged = this._layoutZone(whitespaceAccessor, id2) || zonesHaveChanged;
        }
      };
      safeInvoke1Arg(callback, changeAccessor);
      changeAccessor.addZone = invalidFunc;
      changeAccessor.removeZone = invalidFunc;
      changeAccessor.layoutZone = invalidFunc;
    });
    return zonesHaveChanged;
  }
  _addZone(whitespaceAccessor, zone) {
    const props = this._computeWhitespaceProps(zone);
    const whitespaceId = whitespaceAccessor.insertWhitespace(props.afterViewLineNumber, this._getZoneOrdinal(zone), props.heightInPx, props.minWidthInPx);
    const myZone = {
      whitespaceId,
      delegate: zone,
      isInHiddenArea: props.isInHiddenArea,
      isVisible: false,
      domNode: createFastDomNode(zone.domNode),
      marginDomNode: zone.marginDomNode ? createFastDomNode(zone.marginDomNode) : null
    };
    this._safeCallOnComputedHeight(myZone.delegate, props.heightInPx);
    myZone.domNode.setPosition("absolute");
    myZone.domNode.domNode.style.width = "100%";
    myZone.domNode.setDisplay("none");
    myZone.domNode.setAttribute("monaco-view-zone", myZone.whitespaceId);
    this.domNode.appendChild(myZone.domNode);
    if (myZone.marginDomNode) {
      myZone.marginDomNode.setPosition("absolute");
      myZone.marginDomNode.domNode.style.width = "100%";
      myZone.marginDomNode.setDisplay("none");
      myZone.marginDomNode.setAttribute("monaco-view-zone", myZone.whitespaceId);
      this.marginDomNode.appendChild(myZone.marginDomNode);
    }
    this._zones[myZone.whitespaceId] = myZone;
    this.setShouldRender();
    return myZone.whitespaceId;
  }
  _removeZone(whitespaceAccessor, id2) {
    if (this._zones.hasOwnProperty(id2)) {
      const zone = this._zones[id2];
      delete this._zones[id2];
      whitespaceAccessor.removeWhitespace(zone.whitespaceId);
      zone.domNode.removeAttribute("monaco-visible-view-zone");
      zone.domNode.removeAttribute("monaco-view-zone");
      zone.domNode.domNode.remove();
      if (zone.marginDomNode) {
        zone.marginDomNode.removeAttribute("monaco-visible-view-zone");
        zone.marginDomNode.removeAttribute("monaco-view-zone");
        zone.marginDomNode.domNode.remove();
      }
      this.setShouldRender();
      return true;
    }
    return false;
  }
  _layoutZone(whitespaceAccessor, id2) {
    if (this._zones.hasOwnProperty(id2)) {
      const zone = this._zones[id2];
      const props = this._computeWhitespaceProps(zone.delegate);
      zone.isInHiddenArea = props.isInHiddenArea;
      whitespaceAccessor.changeOneWhitespace(zone.whitespaceId, props.afterViewLineNumber, props.heightInPx);
      this._safeCallOnComputedHeight(zone.delegate, props.heightInPx);
      this.setShouldRender();
      return true;
    }
    return false;
  }
  shouldSuppressMouseDownOnViewZone(id2) {
    if (this._zones.hasOwnProperty(id2)) {
      const zone = this._zones[id2];
      return Boolean(zone.delegate.suppressMouseDown);
    }
    return false;
  }
  _heightInPixels(zone) {
    if (typeof zone.heightInPx === "number") {
      return zone.heightInPx;
    }
    if (typeof zone.heightInLines === "number") {
      return this._lineHeight * zone.heightInLines;
    }
    return this._lineHeight;
  }
  _minWidthInPixels(zone) {
    if (typeof zone.minWidthInPx === "number") {
      return zone.minWidthInPx;
    }
    return 0;
  }
  _safeCallOnComputedHeight(zone, height) {
    if (typeof zone.onComputedHeight === "function") {
      try {
        zone.onComputedHeight(height);
      } catch (e) {
        onUnexpectedError(e);
      }
    }
  }
  _safeCallOnDomNodeTop(zone, top2) {
    if (typeof zone.onDomNodeTop === "function") {
      try {
        zone.onDomNodeTop(top2);
      } catch (e) {
        onUnexpectedError(e);
      }
    }
  }
  prepareRender(ctx) {
  }
  render(ctx) {
    const visibleWhitespaces = ctx.viewportData.whitespaceViewportData;
    const visibleZones = {};
    let hasVisibleZone = false;
    for (const visibleWhitespace of visibleWhitespaces) {
      if (this._zones[visibleWhitespace.id].isInHiddenArea) {
        continue;
      }
      visibleZones[visibleWhitespace.id] = visibleWhitespace;
      hasVisibleZone = true;
    }
    const keys = Object.keys(this._zones);
    for (let i2 = 0, len = keys.length; i2 < len; i2++) {
      const id2 = keys[i2];
      const zone = this._zones[id2];
      let newTop = 0;
      let newHeight = 0;
      let newDisplay = "none";
      if (visibleZones.hasOwnProperty(id2)) {
        newTop = visibleZones[id2].verticalOffset - ctx.bigNumbersDelta;
        newHeight = visibleZones[id2].height;
        newDisplay = "block";
        if (!zone.isVisible) {
          zone.domNode.setAttribute("monaco-visible-view-zone", "true");
          zone.isVisible = true;
        }
        this._safeCallOnDomNodeTop(zone.delegate, ctx.getScrolledTopFromAbsoluteTop(visibleZones[id2].verticalOffset));
      } else {
        if (zone.isVisible) {
          zone.domNode.removeAttribute("monaco-visible-view-zone");
          zone.isVisible = false;
        }
        this._safeCallOnDomNodeTop(zone.delegate, ctx.getScrolledTopFromAbsoluteTop(-1e6));
      }
      zone.domNode.setTop(newTop);
      zone.domNode.setHeight(newHeight);
      zone.domNode.setDisplay(newDisplay);
      if (zone.marginDomNode) {
        zone.marginDomNode.setTop(newTop);
        zone.marginDomNode.setHeight(newHeight);
        zone.marginDomNode.setDisplay(newDisplay);
      }
    }
    if (hasVisibleZone) {
      this.domNode.setWidth(Math.max(ctx.scrollWidth, this._contentWidth));
      this.marginDomNode.setWidth(this._contentLeft);
    }
  }
};

function safeInvoke1Arg(func, arg1) {
  try {
    return func(arg1);
  } catch (e) {
    onUnexpectedError(e);
    return void 0;
  }
}
export { safeInvoke1Arg, invalidFunc, ViewZones };
