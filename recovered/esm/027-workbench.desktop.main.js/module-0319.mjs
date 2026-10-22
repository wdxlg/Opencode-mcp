// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/rulers/rulers.ts
import { ViewPart } from "./module-0239.mjs";
import { createFastDomNode } from "./module-0212.mjs";


// src/vs/editor/browser/viewParts/rulers/rulers.ts
var Rulers = class extends ViewPart {
  constructor(context2) {
    super(context2);
    this.domNode = createFastDomNode(document.createElement("div"));
    this.domNode.setAttribute("role", "presentation");
    this.domNode.setAttribute("aria-hidden", "true");
    this.domNode.setClassName("view-rulers");
    this._renderedRulers = [];
    const options3 = this._context.configuration.options;
    this._rulers = options3.get(116 /* rulers */);
    this._typicalHalfwidthCharacterWidth = options3.get(59 /* fontInfo */).typicalHalfwidthCharacterWidth;
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    const options3 = this._context.configuration.options;
    this._rulers = options3.get(116 /* rulers */);
    this._typicalHalfwidthCharacterWidth = options3.get(59 /* fontInfo */).typicalHalfwidthCharacterWidth;
    return true;
  }
  onScrollChanged(e) {
    return e.scrollHeightChanged;
  }
  // --- end event handlers
  prepareRender(ctx) {
  }
  _ensureRulersCount() {
    const currentCount = this._renderedRulers.length;
    const desiredCount = this._rulers.length;
    if (currentCount === desiredCount) {
      return;
    }
    if (currentCount < desiredCount) {
      let addCount = desiredCount - currentCount;
      while (addCount > 0) {
        const node = createFastDomNode(document.createElement("div"));
        node.setClassName("view-ruler");
        node.setWidth("1ch");
        this.domNode.appendChild(node);
        this._renderedRulers.push(node);
        addCount--;
      }
      return;
    }
    let removeCount = currentCount - desiredCount;
    while (removeCount > 0) {
      const node = this._renderedRulers.pop();
      this.domNode.removeChild(node);
      removeCount--;
    }
  }
  render(ctx) {
    this._ensureRulersCount();
    for (let i2 = 0, len = this._rulers.length; i2 < len; i2++) {
      const node = this._renderedRulers[i2];
      const ruler = this._rulers[i2];
      node.setBoxShadow(ruler.color ? `1px 0 0 0 ${ruler.color} inset` : ``);
      node.setHeight(Math.min(ctx.scrollHeight, 1e6));
      node.setLeft(ruler.column * this._typicalHalfwidthCharacterWidth);
    }
  }
};
export { Rulers };
