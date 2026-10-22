// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/glyphMargin/glyphMargin.ts
import { DynamicViewOverlay } from "./module-0286.mjs";
import { ViewPart } from "./module-0239.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { ArrayQueue } from "./module-0007.mjs";


// src/vs/editor/browser/viewParts/glyphMargin/glyphMargin.ts
var DecorationToRender = class {
  constructor(startLineNumber, endLineNumber, className2, tooltip, zIndex) {
    this.startLineNumber = startLineNumber;
    this.endLineNumber = endLineNumber;
    this.className = className2;
    this.tooltip = tooltip;
    this._decorationToRenderBrand = void 0;
    this.zIndex = zIndex ?? 0;
  }
};

var LineDecorationToRender = class {
  constructor(className2, zIndex, tooltip) {
    this.className = className2;
    this.zIndex = zIndex;
    this.tooltip = tooltip;
  }
};

var VisibleLineDecorationsToRender = class {
  constructor() {
    this.decorations = [];
  }
  add(decoration3) {
    this.decorations.push(decoration3);
  }
  getDecorations() {
    return this.decorations;
  }
};

var DedupOverlay = class extends DynamicViewOverlay {
  /**
   * Returns an array with an element for each visible line number.
   */
  _render(visibleStartLineNumber, visibleEndLineNumber, decorations) {
    const output = [];
    for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
      const lineIndex = lineNumber - visibleStartLineNumber;
      output[lineIndex] = new VisibleLineDecorationsToRender();
    }
    if (decorations.length === 0) {
      return output;
    }
    decorations.sort((a, b) => {
      if (a.className === b.className) {
        if (a.startLineNumber === b.startLineNumber) {
          return a.endLineNumber - b.endLineNumber;
        }
        return a.startLineNumber - b.startLineNumber;
      }
      return a.className < b.className ? -1 : 1;
    });
    let prevClassName = null;
    let prevEndLineIndex = 0;
    for (const d of decorations) {
      const className2 = d.className;
      const zIndex = d.zIndex;
      let startLineIndex = Math.max(d.startLineNumber, visibleStartLineNumber) - visibleStartLineNumber;
      const endLineIndex = Math.min(d.endLineNumber, visibleEndLineNumber) - visibleStartLineNumber;
      if (prevClassName === className2) {
        startLineIndex = Math.max(prevEndLineIndex + 1, startLineIndex);
        prevEndLineIndex = Math.max(prevEndLineIndex, endLineIndex);
      } else {
        prevClassName = className2;
        prevEndLineIndex = endLineIndex;
      }
      for (let lineIndex = startLineIndex; lineIndex <= prevEndLineIndex; lineIndex++) {
        output[lineIndex].add(new LineDecorationToRender(className2, zIndex, d.tooltip));
      }
    }
    return output;
  }
};

var GlyphMarginWidgets = class extends ViewPart {
  constructor(context2) {
    super(context2);
    this._widgets = {};
    this._context = context2;
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this.domNode = createFastDomNode(document.createElement("div"));
    this.domNode.setClassName("glyph-margin-widgets");
    this.domNode.setPosition("absolute");
    this.domNode.setTop(0);
    this._lineHeight = options3.get(75 /* lineHeight */);
    this._glyphMargin = options3.get(66 /* glyphMargin */);
    this._glyphMarginLeft = layoutInfo.glyphMarginLeft;
    this._glyphMarginWidth = layoutInfo.glyphMarginWidth;
    this._glyphMarginDecorationLaneCount = layoutInfo.glyphMarginDecorationLaneCount;
    this._managedDomNodes = [];
    this._decorationGlyphsToRender = [];
  }
  dispose() {
    this._managedDomNodes = [];
    this._decorationGlyphsToRender = [];
    this._widgets = {};
    super.dispose();
  }
  getWidgets() {
    return Object.values(this._widgets);
  }
  // --- begin event handlers
  onConfigurationChanged(e4) {
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._lineHeight = options3.get(75 /* lineHeight */);
    this._glyphMargin = options3.get(66 /* glyphMargin */);
    this._glyphMarginLeft = layoutInfo.glyphMarginLeft;
    this._glyphMarginWidth = layoutInfo.glyphMarginWidth;
    this._glyphMarginDecorationLaneCount = layoutInfo.glyphMarginDecorationLaneCount;
    return true;
  }
  onDecorationsChanged(e4) {
    return true;
  }
  onFlushed(e4) {
    return true;
  }
  onLinesChanged(e4) {
    return true;
  }
  onLinesDeleted(e4) {
    return true;
  }
  onLinesInserted(e4) {
    return true;
  }
  onScrollChanged(e4) {
    return e4.scrollTopChanged;
  }
  onZonesChanged(e4) {
    return true;
  }
  // --- end event handlers
  // --- begin widget management
  addWidget(widget) {
    const domNode = createFastDomNode(widget.getDomNode());
    this._widgets[widget.getId()] = {
      widget,
      preference: widget.getPosition(),
      domNode,
      renderInfo: null
    };
    domNode.setPosition("absolute");
    domNode.setDisplay("none");
    domNode.setAttribute("widgetId", widget.getId());
    this.domNode.appendChild(domNode);
    this.setShouldRender();
  }
  setWidgetPosition(widget, preference) {
    const myWidget = this._widgets[widget.getId()];
    if (myWidget.preference.lane === preference.lane && myWidget.preference.zIndex === preference.zIndex && Range2.equalsRange(myWidget.preference.range, preference.range)) {
      return false;
    }
    myWidget.preference = preference;
    this.setShouldRender();
    return true;
  }
  removeWidget(widget) {
    const widgetId = widget.getId();
    if (this._widgets[widgetId]) {
      const widgetData = this._widgets[widgetId];
      const domNode = widgetData.domNode.domNode;
      delete this._widgets[widgetId];
      domNode.remove();
      this.setShouldRender();
    }
  }
  // --- end widget management
  _collectDecorationBasedGlyphRenderRequest(ctx, requests) {
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    const decorations = ctx.getDecorationsInViewport();
    for (const d of decorations) {
      const glyphMarginClassName = d.options.glyphMarginClassName;
      if (!glyphMarginClassName) {
        continue;
      }
      const startLineNumber = Math.max(d.range.startLineNumber, visibleStartLineNumber);
      const endLineNumber = Math.min(d.range.endLineNumber, visibleEndLineNumber);
      const lane = d.options.glyphMargin?.position ?? 2 /* Center */;
      const zIndex = d.options.zIndex ?? 0;
      for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
        const modelPosition = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new Position(lineNumber, 0));
        const laneIndex = this._context.viewModel.glyphLanes.getLanesAtLine(modelPosition.lineNumber).indexOf(lane);
        requests.push(new DecorationBasedGlyphRenderRequest(lineNumber, laneIndex, zIndex, glyphMarginClassName));
      }
    }
  }
  _collectWidgetBasedGlyphRenderRequest(ctx, requests) {
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    for (const widget of Object.values(this._widgets)) {
      const range2 = widget.preference.range;
      const { startLineNumber, endLineNumber } = this._context.viewModel.coordinatesConverter.convertModelRangeToViewRange(Range2.lift(range2));
      if (!startLineNumber || !endLineNumber || endLineNumber < visibleStartLineNumber || startLineNumber > visibleEndLineNumber) {
        continue;
      }
      const widgetLineNumber = Math.max(startLineNumber, visibleStartLineNumber);
      const modelPosition = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new Position(widgetLineNumber, 0));
      const laneIndex = this._context.viewModel.glyphLanes.getLanesAtLine(modelPosition.lineNumber).indexOf(widget.preference.lane);
      requests.push(new WidgetBasedGlyphRenderRequest(widgetLineNumber, laneIndex, widget.preference.zIndex, widget));
    }
  }
  _collectSortedGlyphRenderRequests(ctx) {
    const requests = [];
    this._collectDecorationBasedGlyphRenderRequest(ctx, requests);
    this._collectWidgetBasedGlyphRenderRequest(ctx, requests);
    requests.sort((a, b) => {
      if (a.lineNumber === b.lineNumber) {
        if (a.laneIndex === b.laneIndex) {
          if (a.zIndex === b.zIndex) {
            if (b.type === a.type) {
              if (a.type === 0 /* Decoration */ && b.type === 0 /* Decoration */) {
                return a.className < b.className ? -1 : 1;
              }
              return 0;
            }
            return b.type - a.type;
          }
          return b.zIndex - a.zIndex;
        }
        return a.laneIndex - b.laneIndex;
      }
      return a.lineNumber - b.lineNumber;
    });
    return requests;
  }
  /**
   * Will store render information in each widget's renderInfo and in `_decorationGlyphsToRender`.
   */
  prepareRender(ctx) {
    if (!this._glyphMargin) {
      this._decorationGlyphsToRender = [];
      return;
    }
    for (const widget of Object.values(this._widgets)) {
      widget.renderInfo = null;
    }
    const requests = new ArrayQueue(this._collectSortedGlyphRenderRequests(ctx));
    const decorationGlyphsToRender = [];
    while (requests.length > 0) {
      const first2 = requests.peek();
      if (!first2) {
        break;
      }
      const requestsAtLocation = requests.takeWhile((el) => el.lineNumber === first2.lineNumber && el.laneIndex === first2.laneIndex);
      if (!requestsAtLocation || requestsAtLocation.length === 0) {
        break;
      }
      const winner = requestsAtLocation[0];
      if (winner.type === 0 /* Decoration */) {
        const classNames2 = [];
        for (const request2 of requestsAtLocation) {
          if (request2.zIndex !== winner.zIndex || request2.type !== winner.type) {
            break;
          }
          if (classNames2.length === 0 || classNames2[classNames2.length - 1] !== request2.className) {
            classNames2.push(request2.className);
          }
        }
        decorationGlyphsToRender.push(winner.accept(classNames2.join(" ")));
      } else {
        winner.widget.renderInfo = {
          lineNumber: winner.lineNumber,
          laneIndex: winner.laneIndex
        };
      }
    }
    this._decorationGlyphsToRender = decorationGlyphsToRender;
  }
  render(ctx) {
    if (!this._glyphMargin) {
      for (const widget of Object.values(this._widgets)) {
        widget.domNode.setDisplay("none");
      }
      while (this._managedDomNodes.length > 0) {
        const domNode = this._managedDomNodes.pop();
        domNode?.domNode.remove();
      }
      return;
    }
    const width2 = Math.round(this._glyphMarginWidth / this._glyphMarginDecorationLaneCount);
    for (const widget of Object.values(this._widgets)) {
      if (!widget.renderInfo) {
        widget.domNode.setDisplay("none");
      } else {
        const top2 = ctx.viewportData.relativeVerticalOffset[widget.renderInfo.lineNumber - ctx.viewportData.startLineNumber];
        const left = this._glyphMarginLeft + widget.renderInfo.laneIndex * this._lineHeight;
        widget.domNode.setDisplay("block");
        widget.domNode.setTop(top2);
        widget.domNode.setLeft(left);
        widget.domNode.setWidth(width2);
        widget.domNode.setHeight(this._lineHeight);
      }
    }
    for (let i2 = 0; i2 < this._decorationGlyphsToRender.length; i2++) {
      const dec = this._decorationGlyphsToRender[i2];
      const decLineNumber = dec.lineNumber;
      const top2 = ctx.viewportData.relativeVerticalOffset[decLineNumber - ctx.viewportData.startLineNumber];
      const left = this._glyphMarginLeft + dec.laneIndex * this._lineHeight;
      let domNode;
      if (i2 < this._managedDomNodes.length) {
        domNode = this._managedDomNodes[i2];
      } else {
        domNode = createFastDomNode(document.createElement("div"));
        this._managedDomNodes.push(domNode);
        this.domNode.appendChild(domNode);
      }
      const lineHeight = this._context.viewLayout.getLineHeightForLineNumber(decLineNumber);
      domNode.setClassName(`cgmr codicon ` + dec.combinedClassName);
      domNode.setPosition(`absolute`);
      domNode.setTop(top2);
      domNode.setLeft(left);
      domNode.setWidth(width2);
      domNode.setHeight(lineHeight);
    }
    while (this._managedDomNodes.length > this._decorationGlyphsToRender.length) {
      const domNode = this._managedDomNodes.pop();
      domNode?.domNode.remove();
    }
  }
};

var DecorationBasedGlyphRenderRequest = class {
  constructor(lineNumber, laneIndex, zIndex, className2) {
    this.lineNumber = lineNumber;
    this.laneIndex = laneIndex;
    this.zIndex = zIndex;
    this.className = className2;
    this.type = 0 /* Decoration */;
  }
  accept(combinedClassName) {
    return new DecorationBasedGlyph(this.lineNumber, this.laneIndex, combinedClassName);
  }
};

var WidgetBasedGlyphRenderRequest = class {
  constructor(lineNumber, laneIndex, zIndex, widget) {
    this.lineNumber = lineNumber;
    this.laneIndex = laneIndex;
    this.zIndex = zIndex;
    this.widget = widget;
    this.type = 1 /* Widget */;
  }
};

var DecorationBasedGlyph = class {
  constructor(lineNumber, laneIndex, combinedClassName) {
    this.lineNumber = lineNumber;
    this.laneIndex = laneIndex;
    this.combinedClassName = combinedClassName;
  }
};
export { DecorationToRender, LineDecorationToRender, VisibleLineDecorationsToRender, DedupOverlay, GlyphMarginWidgets, DecorationBasedGlyphRenderRequest, WidgetBasedGlyphRenderRequest, DecorationBasedGlyph };
