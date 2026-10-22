// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/view/viewOverlays.ts
import { ViewPart } from "./module-0239.mjs";
import { VisibleLinesCollection } from "./module-0281.mjs";
import { applyFontInfo } from "./module-0213.mjs";
import { createFastDomNode } from "./module-0212.mjs";


// src/vs/editor/browser/view/viewOverlays.ts
var ViewOverlays = class extends ViewPart {
  constructor(context2) {
    super(context2);
    this._dynamicOverlays = [];
    this._isFocused = false;
    this._visibleLines = new VisibleLinesCollection(this._context, {
      createLine: () => new ViewOverlayLine(this._dynamicOverlays)
    });
    this.domNode = this._visibleLines.domNode;
    const options3 = this._context.configuration.options;
    const fontInfo = options3.get(59 /* fontInfo */);
    applyFontInfo(this.domNode, fontInfo);
    this.domNode.setClassName("view-overlays");
  }
  shouldRender() {
    if (super.shouldRender()) {
      return true;
    }
    for (let i2 = 0, len = this._dynamicOverlays.length; i2 < len; i2++) {
      const dynamicOverlay = this._dynamicOverlays[i2];
      if (dynamicOverlay.shouldRender()) {
        return true;
      }
    }
    return false;
  }
  dispose() {
    super.dispose();
    for (let i2 = 0, len = this._dynamicOverlays.length; i2 < len; i2++) {
      const dynamicOverlay = this._dynamicOverlays[i2];
      dynamicOverlay.dispose();
    }
    this._dynamicOverlays = [];
  }
  getDomNode() {
    return this.domNode;
  }
  addDynamicOverlay(overlay) {
    this._dynamicOverlays.push(overlay);
  }
  // ----- event handlers
  onConfigurationChanged(e) {
    this._visibleLines.onConfigurationChanged(e);
    const options3 = this._context.configuration.options;
    const fontInfo = options3.get(59 /* fontInfo */);
    applyFontInfo(this.domNode, fontInfo);
    return true;
  }
  onFlushed(e) {
    return this._visibleLines.onFlushed(e);
  }
  onFocusChanged(e) {
    this._isFocused = e.isFocused;
    return true;
  }
  onLinesChanged(e) {
    return this._visibleLines.onLinesChanged(e);
  }
  onLinesDeleted(e) {
    return this._visibleLines.onLinesDeleted(e);
  }
  onLinesInserted(e) {
    return this._visibleLines.onLinesInserted(e);
  }
  onScrollChanged(e) {
    return this._visibleLines.onScrollChanged(e) || true;
  }
  onTokensChanged(e) {
    return this._visibleLines.onTokensChanged(e);
  }
  onZonesChanged(e) {
    return this._visibleLines.onZonesChanged(e);
  }
  // ----- end event handlers
  prepareRender(ctx) {
    const toRender = this._dynamicOverlays.filter((overlay) => overlay.shouldRender());
    for (let i2 = 0, len = toRender.length; i2 < len; i2++) {
      const dynamicOverlay = toRender[i2];
      dynamicOverlay.prepareRender(ctx);
      dynamicOverlay.onDidRender();
    }
  }
  render(ctx) {
    this._viewOverlaysRender(ctx);
    this.domNode.toggleClassName("focused", this._isFocused);
  }
  _viewOverlaysRender(ctx) {
    this._visibleLines.renderLines(ctx.viewportData);
  }
};

var ViewOverlayLine = class {
  constructor(dynamicOverlays) {
    this._dynamicOverlays = dynamicOverlays;
    this._domNode = null;
    this._renderedContent = null;
  }
  getDomNode() {
    if (!this._domNode) {
      return null;
    }
    return this._domNode.domNode;
  }
  setDomNode(domNode) {
    this._domNode = createFastDomNode(domNode);
  }
  onContentChanged() {
  }
  onTokensChanged() {
  }
  renderLine(lineNumber, deltaTop, lineHeight, viewportData, sb) {
    let result = "";
    for (let i2 = 0, len = this._dynamicOverlays.length; i2 < len; i2++) {
      const dynamicOverlay = this._dynamicOverlays[i2];
      result += dynamicOverlay.render(viewportData.startLineNumber, lineNumber);
    }
    if (this._renderedContent === result) {
      return false;
    }
    this._renderedContent = result;
    sb.appendString('<div style="top:');
    sb.appendString(String(deltaTop));
    sb.appendString("px;height:");
    sb.appendString(String(lineHeight));
    sb.appendString("px;line-height:");
    sb.appendString(String(lineHeight));
    sb.appendString('px;">');
    sb.appendString(result);
    sb.appendString("</div>");
    return true;
  }
  layoutLine(lineNumber, deltaTop, lineHeight) {
    if (this._domNode) {
      this._domNode.setTop(deltaTop);
      this._domNode.setHeight(lineHeight);
      this._domNode.setLineHeight(lineHeight);
    }
  }
};

var ContentViewOverlays = class extends ViewOverlays {
  constructor(context2) {
    super(context2);
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._contentWidth = layoutInfo.contentWidth;
    this.domNode.setHeight(0);
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._contentWidth = layoutInfo.contentWidth;
    return super.onConfigurationChanged(e) || true;
  }
  onScrollChanged(e) {
    return super.onScrollChanged(e) || e.scrollWidthChanged;
  }
  // --- end event handlers
  _viewOverlaysRender(ctx) {
    super._viewOverlaysRender(ctx);
    this.domNode.setWidth(Math.max(ctx.scrollWidth, this._contentWidth));
  }
};

var MarginViewOverlays = class extends ViewOverlays {
  constructor(context2) {
    super(context2);
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._contentLeft = layoutInfo.contentLeft;
    this.domNode.setClassName("margin-view-overlays");
    this.domNode.setWidth(1);
    applyFontInfo(this.domNode, options3.get(59 /* fontInfo */));
  }
  onConfigurationChanged(e) {
    const options3 = this._context.configuration.options;
    applyFontInfo(this.domNode, options3.get(59 /* fontInfo */));
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._contentLeft = layoutInfo.contentLeft;
    return super.onConfigurationChanged(e) || true;
  }
  onScrollChanged(e) {
    return super.onScrollChanged(e) || e.scrollHeightChanged;
  }
  _viewOverlaysRender(ctx) {
    super._viewOverlaysRender(ctx);
    const height = Math.min(ctx.scrollHeight, 1e6);
    this.domNode.setHeight(height);
    this.domNode.setWidth(this._contentLeft);
  }
};
export { ViewOverlays, ViewOverlayLine, ContentViewOverlays, MarginViewOverlays };
