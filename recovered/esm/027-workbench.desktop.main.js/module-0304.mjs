// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/margin/margin.ts
import { ViewPart } from "./module-0239.mjs";
import { createFastDomNode } from "./module-0212.mjs";


// src/vs/editor/browser/viewParts/margin/margin.ts
var Margin = class _Margin extends ViewPart {
  static {
    this.CLASS_NAME = "glyph-margin";
  }
  static {
    this.OUTER_CLASS_NAME = "margin";
  }
  constructor(context2) {
    super(context2);
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._canUseLayerHinting = !options3.get(39 /* disableLayerHinting */);
    this._contentLeft = layoutInfo.contentLeft;
    this._glyphMarginLeft = layoutInfo.glyphMarginLeft;
    this._glyphMarginWidth = layoutInfo.glyphMarginWidth;
    this._domNode = createFastDomNode(document.createElement("div"));
    this._domNode.setClassName(_Margin.OUTER_CLASS_NAME);
    this._domNode.setPosition("absolute");
    this._domNode.setAttribute("role", "presentation");
    this._domNode.setAttribute("aria-hidden", "true");
    this._glyphMarginBackgroundDomNode = createFastDomNode(document.createElement("div"));
    this._glyphMarginBackgroundDomNode.setClassName(_Margin.CLASS_NAME);
    this._domNode.appendChild(this._glyphMarginBackgroundDomNode);
  }
  getDomNode() {
    return this._domNode;
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._canUseLayerHinting = !options3.get(39 /* disableLayerHinting */);
    this._contentLeft = layoutInfo.contentLeft;
    this._glyphMarginLeft = layoutInfo.glyphMarginLeft;
    this._glyphMarginWidth = layoutInfo.glyphMarginWidth;
    return true;
  }
  onScrollChanged(e) {
    return super.onScrollChanged(e) || e.scrollTopChanged;
  }
  // --- end event handlers
  prepareRender(ctx) {
  }
  render(ctx) {
    this._domNode.setLayerHinting(this._canUseLayerHinting);
    this._domNode.setContain("strict");
    const adjustedScrollTop = ctx.scrollTop - ctx.bigNumbersDelta;
    this._domNode.setTop(-adjustedScrollTop);
    const height = Math.min(ctx.scrollHeight, 1e6);
    this._domNode.setHeight(height);
    this._domNode.setWidth(this._contentLeft);
    this._glyphMarginBackgroundDomNode.setLeft(this._glyphMarginLeft);
    this._glyphMarginBackgroundDomNode.setWidth(this._glyphMarginWidth);
    this._glyphMarginBackgroundDomNode.setHeight(height);
  }
};
export { Margin };
