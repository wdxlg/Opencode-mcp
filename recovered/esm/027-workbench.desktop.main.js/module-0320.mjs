// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/scrollDecoration/scrollDecoration.ts
import { ViewPart } from "./module-0239.mjs";
import { createFastDomNode } from "./module-0212.mjs";


// src/vs/editor/browser/viewParts/scrollDecoration/scrollDecoration.ts
var ScrollDecorationViewPart = class extends ViewPart {
  constructor(context2) {
    super(context2);
    this._scrollTop = 0;
    this._width = 0;
    this._updateWidth();
    this._shouldShow = false;
    const options3 = this._context.configuration.options;
    const scrollbar = options3.get(117 /* scrollbar */);
    this._useShadows = scrollbar.useShadows;
    this._domNode = createFastDomNode(document.createElement("div"));
    this._domNode.setAttribute("role", "presentation");
    this._domNode.setAttribute("aria-hidden", "true");
  }
  _updateShouldShow() {
    const newShouldShow = this._useShadows && this._scrollTop > 0;
    if (this._shouldShow !== newShouldShow) {
      this._shouldShow = newShouldShow;
      return true;
    }
    return false;
  }
  getDomNode() {
    return this._domNode;
  }
  _updateWidth() {
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    if (layoutInfo.minimap.renderMinimap === 0 /* None */ || layoutInfo.minimap.minimapWidth > 0 && layoutInfo.minimap.minimapLeft === 0) {
      this._width = layoutInfo.width;
    } else {
      this._width = layoutInfo.width - layoutInfo.verticalScrollbarWidth;
    }
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    const options3 = this._context.configuration.options;
    const scrollbar = options3.get(117 /* scrollbar */);
    this._useShadows = scrollbar.useShadows;
    this._updateWidth();
    this._updateShouldShow();
    return true;
  }
  onScrollChanged(e) {
    this._scrollTop = e.scrollTop;
    return this._updateShouldShow();
  }
  // --- end event handlers
  prepareRender(ctx) {
  }
  render(ctx) {
    this._domNode.setWidth(this._width);
    this._domNode.setClassName(this._shouldShow ? "scroll-decoration" : "");
  }
};
export { ScrollDecorationViewPart };
