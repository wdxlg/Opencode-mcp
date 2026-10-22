// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/blockDecorations/blockDecorations.ts
import { ViewPart } from "./module-0239.mjs";
import { createFastDomNode } from "./module-0212.mjs";


// src/vs/editor/browser/viewParts/blockDecorations/blockDecorations.ts
var BlockDecorations = class extends ViewPart {
  constructor(context2) {
    super(context2);
    this.blocks = [];
    this.contentWidth = -1;
    this.contentLeft = 0;
    this.domNode = createFastDomNode(document.createElement("div"));
    this.domNode.setAttribute("role", "presentation");
    this.domNode.setAttribute("aria-hidden", "true");
    this.domNode.setClassName("blockDecorations-container");
    this.update();
  }
  update() {
    let didChange = false;
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    const newContentWidth = layoutInfo.contentWidth - layoutInfo.verticalScrollbarWidth;
    if (this.contentWidth !== newContentWidth) {
      this.contentWidth = newContentWidth;
      didChange = true;
    }
    const newContentLeft = layoutInfo.contentLeft;
    if (this.contentLeft !== newContentLeft) {
      this.contentLeft = newContentLeft;
      didChange = true;
    }
    return didChange;
  }
  // --- begin event handlers
  onConfigurationChanged(e4) {
    return this.update();
  }
  onScrollChanged(e4) {
    return e4.scrollTopChanged || e4.scrollLeftChanged;
  }
  onDecorationsChanged(e4) {
    return true;
  }
  onZonesChanged(e4) {
    return true;
  }
  // --- end event handlers
  prepareRender(ctx) {
  }
  render(ctx) {
    let count2 = 0;
    const decorations = ctx.getDecorationsInViewport();
    for (const decoration3 of decorations) {
      if (!decoration3.options.blockClassName) {
        continue;
      }
      let block2 = this.blocks[count2];
      if (!block2) {
        block2 = this.blocks[count2] = createFastDomNode(document.createElement("div"));
        this.domNode.appendChild(block2);
      }
      let top2;
      let bottom;
      if (decoration3.options.blockIsAfterEnd) {
        top2 = ctx.getVerticalOffsetAfterLineNumber(decoration3.range.endLineNumber, false);
        bottom = ctx.getVerticalOffsetAfterLineNumber(decoration3.range.endLineNumber, true);
      } else {
        top2 = ctx.getVerticalOffsetForLineNumber(decoration3.range.startLineNumber, true);
        bottom = decoration3.range.isEmpty() && !decoration3.options.blockDoesNotCollapse ? ctx.getVerticalOffsetForLineNumber(decoration3.range.startLineNumber, false) : ctx.getVerticalOffsetAfterLineNumber(decoration3.range.endLineNumber, true);
      }
      const [paddingTop, paddingRight, paddingBottom, paddingLeft] = decoration3.options.blockPadding ?? [0, 0, 0, 0];
      block2.setClassName("blockDecorations-block " + decoration3.options.blockClassName);
      block2.setLeft(this.contentLeft - paddingLeft);
      block2.setWidth(this.contentWidth + paddingLeft + paddingRight);
      block2.setTop(top2 - ctx.scrollTop - paddingTop);
      block2.setHeight(bottom - top2 + paddingTop + paddingBottom);
      count2++;
    }
    for (let i2 = count2; i2 < this.blocks.length; i2++) {
      this.blocks[i2].domNode.remove();
    }
    this.blocks.length = count2;
  }
};
export { BlockDecorations };
