// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/resizable/resizable.ts
import { Emitter, Event2 } from "./module-0017.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Dimension } from "./module-0075.mjs";
import { Sash } from "./module-0496.mjs";


// src/vs/base/browser/ui/resizable/resizable.ts
var ResizableHTMLElement = class {
  constructor() {
    this._onDidWillResize = new Emitter();
    this._onDidResize = new Emitter();
    this._sashListener = new DisposableStore();
    this._size = new Dimension(0, 0);
    this._minSize = new Dimension(0, 0);
    this._maxSize = new Dimension(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    this.domNode = document.createElement("div");
    this._eastSash = new Sash(this.domNode, { getVerticalSashLeft: () => this._size.width }, { orientation: 0 /* VERTICAL */ });
    this._westSash = new Sash(this.domNode, { getVerticalSashLeft: () => 0 }, { orientation: 0 /* VERTICAL */ });
    this._northSash = new Sash(this.domNode, { getHorizontalSashTop: () => 0 }, { orientation: 1 /* HORIZONTAL */, orthogonalEdge: "north" /* North */ });
    this._southSash = new Sash(this.domNode, { getHorizontalSashTop: () => this._size.height }, { orientation: 1 /* HORIZONTAL */, orthogonalEdge: "south" /* South */ });
    this._northSash.orthogonalStartSash = this._westSash;
    this._northSash.orthogonalEndSash = this._eastSash;
    this._southSash.orthogonalStartSash = this._westSash;
    this._southSash.orthogonalEndSash = this._eastSash;
    let currentSize;
    let deltaY = 0;
    let deltaX = 0;
    this._sashListener.add(Event2.any(this._northSash.onDidStart, this._eastSash.onDidStart, this._southSash.onDidStart, this._westSash.onDidStart)(() => {
      if (currentSize === void 0) {
        this._onDidWillResize.fire();
        currentSize = this._size;
        deltaY = 0;
        deltaX = 0;
      }
    }));
    this._sashListener.add(Event2.any(this._northSash.onDidEnd, this._eastSash.onDidEnd, this._southSash.onDidEnd, this._westSash.onDidEnd)(() => {
      if (currentSize !== void 0) {
        currentSize = void 0;
        deltaY = 0;
        deltaX = 0;
        this._onDidResize.fire({ dimension: this._size, done: true });
      }
    }));
    this._sashListener.add(this._eastSash.onDidChange((e4) => {
      if (currentSize) {
        deltaX = e4.currentX - e4.startX;
        this.layout(currentSize.height + deltaY, currentSize.width + deltaX);
        this._onDidResize.fire({ dimension: this._size, done: false, east: true });
      }
    }));
    this._sashListener.add(this._westSash.onDidChange((e4) => {
      if (currentSize) {
        deltaX = -(e4.currentX - e4.startX);
        this.layout(currentSize.height + deltaY, currentSize.width + deltaX);
        this._onDidResize.fire({ dimension: this._size, done: false, west: true });
      }
    }));
    this._sashListener.add(this._northSash.onDidChange((e4) => {
      if (currentSize) {
        deltaY = -(e4.currentY - e4.startY);
        this.layout(currentSize.height + deltaY, currentSize.width + deltaX);
        this._onDidResize.fire({ dimension: this._size, done: false, north: true });
      }
    }));
    this._sashListener.add(this._southSash.onDidChange((e4) => {
      if (currentSize) {
        deltaY = e4.currentY - e4.startY;
        this.layout(currentSize.height + deltaY, currentSize.width + deltaX);
        this._onDidResize.fire({ dimension: this._size, done: false, south: true });
      }
    }));
    this._sashListener.add(Event2.any(this._eastSash.onDidReset, this._westSash.onDidReset)((e4) => {
      if (this._preferredSize) {
        this.layout(this._size.height, this._preferredSize.width);
        this._onDidResize.fire({ dimension: this._size, done: true });
      }
    }));
    this._sashListener.add(Event2.any(this._northSash.onDidReset, this._southSash.onDidReset)((e4) => {
      if (this._preferredSize) {
        this.layout(this._preferredSize.height, this._size.width);
        this._onDidResize.fire({ dimension: this._size, done: true });
      }
    }));
  }
  get onDidWillResize() {
    return this._onDidWillResize.event;
  }
  get onDidResize() {
    return this._onDidResize.event;
  }
  dispose() {
    this._northSash.dispose();
    this._southSash.dispose();
    this._eastSash.dispose();
    this._westSash.dispose();
    this._sashListener.dispose();
    this._onDidResize.dispose();
    this._onDidWillResize.dispose();
    this.domNode.remove();
  }
  enableSashes(north, east, south, west) {
    this._northSash.state = north ? 3 /* Enabled */ : 0 /* Disabled */;
    this._eastSash.state = east ? 3 /* Enabled */ : 0 /* Disabled */;
    this._southSash.state = south ? 3 /* Enabled */ : 0 /* Disabled */;
    this._westSash.state = west ? 3 /* Enabled */ : 0 /* Disabled */;
  }
  layout(height = this.size.height, width2 = this.size.width) {
    const { height: minHeight, width: minWidth } = this._minSize;
    const { height: maxHeight, width: maxWidth } = this._maxSize;
    height = Math.max(minHeight, Math.min(maxHeight, height));
    width2 = Math.max(minWidth, Math.min(maxWidth, width2));
    const newSize = new Dimension(width2, height);
    if (!Dimension.equals(newSize, this._size)) {
      this.domNode.style.height = height + "px";
      this.domNode.style.width = width2 + "px";
      this._size = newSize;
      this._northSash.layout();
      this._eastSash.layout();
      this._southSash.layout();
      this._westSash.layout();
    }
  }
  clearSashHoverState() {
    this._eastSash.clearSashHoverState();
    this._westSash.clearSashHoverState();
    this._northSash.clearSashHoverState();
    this._southSash.clearSashHoverState();
  }
  get size() {
    return this._size;
  }
  set maxSize(value2) {
    this._maxSize = value2;
  }
  get maxSize() {
    return this._maxSize;
  }
  set minSize(value2) {
    this._minSize = value2;
  }
  get minSize() {
    return this._minSize;
  }
  set preferredSize(value2) {
    this._preferredSize = value2;
  }
  get preferredSize() {
    return this._preferredSize;
  }
};
export { ResizableHTMLElement };
